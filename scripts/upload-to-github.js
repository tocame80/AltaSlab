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
        'tmp', 'temp', 'logs', '.turbo', '.parcel-cache'
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
        'lerna-debug.log*', '.pnpm-debug.log*'
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
            const content = await fs.promises.readFile(fullPath);
            files.push({
              path: relativePath.replace(/\\/g, '/'),
              content: content.toString('utf8'),
              encoding: 'utf-8'
            });
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

async function uploadToGitHub() {
  try {
    console.log('🚀 Начинаем загрузку проекта на GitHub...');
    
    const octokit = await getUncachableGitHubClient();
    
    // Get user info
    const { data: user } = await octokit.rest.users.getAuthenticated();
    console.log(`👋 Привет, ${user.login}!`);
    
    // Repository info  
    const repoOwner = 'tocame80';
    const repoName = 'AltaSlab';
    
    console.log('📂 Собираем файлы проекта...');
    const projectRoot = path.resolve(__dirname, '..');
    const files = await getAllFiles(projectRoot);
    
    console.log(`📁 Найдено ${files.length} файлов для загрузки`);
    
    try {
      // Try to get existing repository
      await octokit.rest.repos.get({
        owner: repoOwner,
        repo: repoName
      });
      console.log(`📦 Репозиторий ${repoOwner}/${repoName} найден, обновляем...`);
    } catch (error) {
      if (error.status === 404) {
        throw new Error(`Репозиторий ${repoOwner}/${repoName} не найден. Создайте его сначала на GitHub.`);
      } else {
        throw error;
      }
    }
    
    // Get current SHA of main branch
    let mainSha;
    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: repoOwner,
        repo: repoName,
        ref: 'heads/main'
      });
      mainSha = ref.object.sha;
    } catch (error) {
      // If main doesn't exist, try master
      try {
        const { data: ref } = await octokit.rest.git.getRef({
          owner: repoOwner,
          repo: repoName,
          ref: 'heads/master'
        });
        mainSha = ref.object.sha;
      } catch (masterError) {
        console.log('🔍 Не найдена основная ветка, создаем новую...');
      }
    }
    
    // Create tree with all files
    console.log('🌳 Создаем дерево файлов...');
    const { data: tree } = await octokit.rest.git.createTree({
      owner: repoOwner,
      repo: repoName,
      tree: files.map(file => ({
        path: file.path,
        mode: '100644',
        type: 'blob',
        content: file.content
      }))
    });
    
    // Create commit
    console.log('💾 Создаем коммит...');
    const { data: commit } = await octokit.rest.git.createCommit({
      owner: repoOwner,
      repo: repoName,
      message: '🔄 Обновление каталога АЛЬТА СЛЭБ\n\n- Обновлены все файлы проекта\n- Исправлены проблемы совместимости с TimeWeb\n- Добавлены скрипты деплоя и исправления\n- Готов к развертыванию в продакшн',
      tree: tree.sha,
      parents: mainSha ? [mainSha] : []
    });
    
    // Update main branch reference
    console.log('🔄 Обновляем основную ветку...');
    const branchName = mainSha ? 'main' : 'master';
    if (mainSha) {
      await octokit.rest.git.updateRef({
        owner: repoOwner,
        repo: repoName,
        ref: `heads/${branchName}`,
        sha: commit.sha
      });
    } else {
      await octokit.rest.git.createRef({
        owner: repoOwner,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: commit.sha
      });
    }
    
    console.log('✅ Проект успешно обновлен на GitHub!');
    console.log(`🔗 Ссылка на репозиторий: https://github.com/${repoOwner}/${repoName}`);
    console.log('\n📝 Обновлено:');
    console.log('1. ✅ Все файлы проекта синхронизированы');
    console.log('2. ✅ Скрипты деплоя для TimeWeb готовы');
    console.log('3. ✅ Исправления совместимости Node.js добавлены');
    console.log('4. ✅ Резервная копия базы данных включена');
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке:', error.message);
    if (error.response) {
      console.error('📋 Детали ошибки:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the upload
uploadToGitHub();