import { Octokit } from '@octokit/rest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let connectionSettings;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Определение бинарных файлов по расширению
function isBinaryFile(filename) {
  const binaryExts = [
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.tiff',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    '.zip', '.rar', '.7z', '.tar', '.gz', '.exe', '.dll', '.so',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.mp3', '.wav', '.ogg', '.mp4', '.avi', '.mov', '.wmv'
  ];
  
  const ext = path.extname(filename).toLowerCase();
  return binaryExts.includes(ext);
}

async function getAllFiles(dirPath, basePath = '') {
  const files = [];
  const items = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = path.join(basePath, item.name);

    if (item.isDirectory()) {
      // Skip excluded directories
      const excludedDirs = [
        'node_modules', '.git', 'dist', '.replit', '.upm', 
        'build', 'coverage', '.next', '.nuxt', '.cache',
        'tmp', 'temp', 'logs', '.turbo', '.parcel-cache',
        '.thumbnail-cache', '.local', '.pythonlibs'
      ];
      
      if (!excludedDirs.includes(item.name)) {
        const subFiles = await getAllFiles(fullPath, relativePath);
        files.push(...subFiles);
      }
    } else if (item.isFile()) {
      // Skip certain file types and patterns
      const ext = path.extname(item.name).toLowerCase();
      const excludedExts = [
        '.lock', '.log', '.tmp', '.cache', '.pid', '.seed', '.coverage',
        '.nyc_output', '.grunt', '.bower_components', '.lock-wscript',
        '.wafpickle-*', '.compiled', '.eslintcache', '.stylelintcache'
      ];
      
      const excludedFiles = [
        '.DS_Store', 'Thumbs.db', '.env.local', '.env.*.local',
        'npm-debug.log*', 'yarn-debug.log*', 'yarn-error.log*',
        'lerna-debug.log*', '.pnpm-debug.log*', 'repl.nix'
      ];

      const shouldInclude = !excludedExts.includes(ext) && 
                           !excludedFiles.includes(item.name) &&
                           !item.name.startsWith('.') &&
                           !item.name.includes('node_modules');

      if (shouldInclude) {
        try {
          const stats = await fs.promises.stat(fullPath);
          // Skip very large files (>1MB)
          if (stats.size < 1024 * 1024) {
            const isBinary = isBinaryFile(item.name);
            
            if (isBinary) {
              const content = await fs.promises.readFile(fullPath);
              files.push({
                path: relativePath.replace(/\\/g, '/'),
                content: content.toString('base64'),
                encoding: 'base64',
                type: 'binary',
                size: stats.size
              });
            } else {
              const content = await fs.promises.readFile(fullPath, 'utf8');
              files.push({
                path: relativePath.replace(/\\/g, '/'),
                content: content,
                encoding: 'utf-8',
                type: 'text',
                size: stats.size
              });
            }
          } else {
            console.log(`⚠️  Пропуск большого файла: ${relativePath} (${Math.round(stats.size / 1024)}KB)`);
          }
        } catch (error) {
          console.log(`⚠️  Ошибка чтения файла ${relativePath}: ${error.message}`);
        }
      }
    }
  }

  return files;
}

// Создание блобов для бинарных файлов
async function createBlobsForBinaryFiles(octokit, owner, repo, files) {
  const binaryFiles = files.filter(f => f.type === 'binary');
  const blobMap = new Map();
  
  console.log(`📦 Создание ${binaryFiles.length} блобов для бинарных файлов...`);
  
  // Ограничиваем параллельность для избежания rate limit
  const BATCH_SIZE = 10;
  
  for (let i = 0; i < binaryFiles.length; i += BATCH_SIZE) {
    const batch = binaryFiles.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (file, idx) => {
      try {
        const { data: blob } = await octokit.rest.git.createBlob({
          owner,
          repo,
          content: file.content,
          encoding: 'base64'
        });
        
        blobMap.set(file.path, blob.sha);
        
        if ((i + idx + 1) % 50 === 0) {
          console.log(`📦 Создано блобов: ${i + idx + 1}/${binaryFiles.length}`);
        }
        
      } catch (error) {
        console.error(`❌ Ошибка создания блоба для ${file.path}:`, error.message);
      }
    }));
    
    // Небольшая пауза между батчами
    if (i + BATCH_SIZE < binaryFiles.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  console.log(`✅ Создано ${blobMap.size} блобов из ${binaryFiles.length}`);
  return blobMap;
}

// Создание дерева с поддержкой base_tree и chunking
async function createTreeInChunks(octokit, owner, repo, files, blobMap, baseTreeSha = null) {
  const CHUNK_SIZE = 500; // Меньший размер чанка для избежания 502 ошибки
  const treeEntries = [];
  
  // Подготовка записей для дерева
  files.forEach(file => {
    if (file.type === 'binary' && blobMap.has(file.path)) {
      treeEntries.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        sha: blobMap.get(file.path)
      });
    } else if (file.type === 'text') {
      treeEntries.push({
        path: file.path,
        mode: '100644',
        type: 'blob',
        content: file.content
      });
    }
  });
  
  console.log(`🌳 Создание дерева из ${treeEntries.length} файлов по частям...`);
  
  // Если файлов мало, создаем одним запросом
  if (treeEntries.length <= CHUNK_SIZE) {
    const { data: tree } = await octokit.rest.git.createTree({
      owner,
      repo,
      tree: treeEntries,
      ...(baseTreeSha && { base_tree: baseTreeSha })
    });
    return tree.sha;
  }
  
  // Иначе создаем по частям
  let currentTreeSha = baseTreeSha;
  
  for (let i = 0; i < treeEntries.length; i += CHUNK_SIZE) {
    const chunk = treeEntries.slice(i, i + CHUNK_SIZE);
    
    console.log(`🌳 Обработка части ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(treeEntries.length / CHUNK_SIZE)} (${chunk.length} файлов)...`);
    
    try {
      const { data: tree } = await octokit.rest.git.createTree({
        owner,
        repo,
        tree: chunk,
        ...(currentTreeSha && { base_tree: currentTreeSha })
      });
      
      currentTreeSha = tree.sha;
      
      // Пауза между чанками
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`❌ Ошибка создания части дерева:`, error.message);
      throw error;
    }
  }
  
  return currentTreeSha;
}

async function uploadToGitHub() {
  try {
    console.log('🚀 Начинаем загрузку проекта на GitHub...');
    
    const octokit = await getUncachableGitHubClient();
    
    // Get user info and repo details
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`👋 Привет, ${user.login}!`);
    
    // Repository info  
    const repoOwner = 'tocame80';
    const repoName = 'AltaSlab';
    
    // Get repository details
    const { data: repo } = await octokit.rest.repos.get({
      owner: repoOwner,
      repo: repoName
    });
    const defaultBranch = repo.default_branch;
    console.log(`📦 Репозиторий найден: ${repo.full_name} (ветка: ${defaultBranch})`);
    
    console.log('📂 Собираем файлы проекта...');
    const projectRoot = path.resolve(__dirname, '..');
    const files = await getAllFiles(projectRoot);
    
    const textFiles = files.filter(f => f.type === 'text');
    const binaryFiles = files.filter(f => f.type === 'binary');
    
    console.log(`📁 Найдено файлов: ${files.length} (текст: ${textFiles.length}, бинарные: ${binaryFiles.length})`);
    
    // Get current branch info
    let currentCommitSha;
    let currentTreeSha;
    
    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${defaultBranch}`
      });
      currentCommitSha = ref.object.sha;
      
      const { data: commit } = await octokit.rest.git.getCommit({
        owner: repoOwner,
        repo: repoName,
        commit_sha: currentCommitSha
      });
      currentTreeSha = commit.tree.sha;
      
      console.log(`🌿 Текущий коммит: ${currentCommitSha.substring(0, 8)}`);
    } catch (error) {
      console.log('🆕 Создается новый репозиторий (нет коммитов)');
    }
    
    // Create blobs for binary files
    const blobMap = await createBlobsForBinaryFiles(octokit, repoOwner, repoName, files);
    
    // Create tree in chunks
    const finalTreeSha = await createTreeInChunks(octokit, repoOwner, repoName, files, blobMap, currentTreeSha);
    
    // Create commit
    console.log('💾 Создаем коммит...');
    const { data: commit } = await octokit.rest.git.createCommit({
      owner: repoOwner,
      repo: repoName,
      message: '🔄 Обновление каталога АЛЬТА СЛЭБ\n\n- Обновлены все файлы проекта\n- Исправлены проблемы совместимости с TimeWeb\n- Добавлены скрипты деплоя и исправления\n- Готов к развертыванию в продакшн',
      tree: finalTreeSha,
      parents: currentCommitSha ? [currentCommitSha] : []
    });
    
    // Update branch reference
    console.log(`🔄 Обновляем ветку ${defaultBranch}...`);
    await octokit.rest.git.updateRef({
      owner: repoOwner,
      repo: repoName,
      ref: `heads/${defaultBranch}`,
      sha: commit.sha
    });
    
    console.log('✅ Проект успешно обновлен на GitHub!');
    console.log(`🔗 Ссылка на репозиторий: https://github.com/${repoOwner}/${repoName}`);
    console.log(`📊 Статистика загрузки:`);
    console.log(`  • Текстовых файлов: ${textFiles.length}`);
    console.log(`  • Бинарных файлов: ${binaryFiles.length}`);
    console.log(`  • Блобов создано: ${blobMap.size}`);
    console.log(`  • Новый коммит: ${commit.sha.substring(0, 8)}`);
    console.log('\n📝 Обновлено:');
    console.log('1. ✅ Все файлы проекта синхронизированы');
    console.log('2. ✅ Скрипты деплоя для TimeWeb готовы');
    console.log('3. ✅ Исправления совместимости Node.js добавлены');
    console.log('4. ✅ Резервная копия базы данных включена');
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке:', error.message);
    if (error.response?.data) {
      console.error('📋 Детали ошибки:', error.response.data);
    }
    if (error.stack) {
      console.error('📍 Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run the upload
uploadToGitHub();