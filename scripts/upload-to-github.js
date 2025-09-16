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
    
    // Repository name
    const repoName = 'alta-slab-catalog';
    
    console.log('📂 Собираем файлы проекта...');
    const projectRoot = path.resolve(__dirname, '..');
    const files = await getAllFiles(projectRoot);
    
    console.log(`📁 Найдено ${files.length} файлов для загрузки`);
    
    try {
      // Try to get existing repository
      await octokit.rest.repos.get({
        owner: user.login,
        repo: repoName
      });
      console.log(`📦 Репозиторий ${repoName} уже существует, обновляем...`);
    } catch (error) {
      if (error.status === 404) {
        // Create new repository
        console.log(`📦 Создаем новый репозиторий ${repoName}...`);
        await octokit.rest.repos.createForAuthenticatedUser({
          name: repoName,
          description: 'Каталог продукции АЛЬТА СЛЭБ - веб-приложение для отображения строительных материалов',
          private: false,
          auto_init: true
        });
        console.log('✅ Репозиторий создан!');
        
        // Wait a bit for repo to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        throw error;
      }
    }
    
    // Get current SHA of main branch
    let mainSha;
    try {
      const { data: ref } = await octokit.rest.git.getRef({
        owner: user.login,
        repo: repoName,
        ref: 'heads/main'
      });
      mainSha = ref.object.sha;
    } catch (error) {
      // If main doesn't exist, try master
      try {
        const { data: ref } = await octokit.rest.git.getRef({
          owner: user.login,
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
      owner: user.login,
      repo: repoName,
      tree: files.map(file => ({
        path: file.path,
        mode: '100644',
        type: 'blob',
        content: Buffer.from(file.content, 'base64').toString('utf8')
      }))
    });
    
    // Create commit
    console.log('💾 Создаем коммит...');
    const { data: commit } = await octokit.rest.git.createCommit({
      owner: user.login,
      repo: repoName,
      message: '🚀 Загрузка каталога продукции АЛЬТА СЛЭБ\n\n- Веб-приложение с каталогом продукции\n- Система управления изображениями\n- Админ-панель для управления продуктами\n- Готово к добавлению изображений продуктов',
      tree: tree.sha,
      parents: mainSha ? [mainSha] : []
    });
    
    // Update main branch reference
    console.log('🔄 Обновляем основную ветку...');
    const branchName = mainSha ? 'main' : 'master';
    if (mainSha) {
      await octokit.rest.git.updateRef({
        owner: user.login,
        repo: repoName,
        ref: `heads/${branchName}`,
        sha: commit.sha
      });
    } else {
      await octokit.rest.git.createRef({
        owner: user.login,
        repo: repoName,
        ref: `refs/heads/${branchName}`,
        sha: commit.sha
      });
    }
    
    console.log('✅ Проект успешно загружен на GitHub!');
    console.log(`🔗 Ссылка на репозиторий: https://github.com/${user.login}/${repoName}`);
    console.log('\n📝 Что дальше:');
    console.log('1. Загрузите изображения продуктов в соответствующие папки');
    console.log('2. Система автоматически обнаружит новые изображения');
    console.log('3. Используйте админ-панель для установки главных изображений');
    
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