const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session'); // 需要安装此依赖

const app = express();
const port = 3000;

// 启用会话管理
app.use(session({
  secret: 'color-test-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// 启用 CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// 解析 JSON 请求体
app.use(bodyParser.json());

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// 为每个用户创建独立的写入队列
const userWriteQueues = new Map();

// 获取或创建用户的写入队列
function getUserWriteQueue(userId) {
  if (!userWriteQueues.has(userId)) {
    userWriteQueues.set(userId, {
      queue: [],
      isWriting: false
    });
  }
  return userWriteQueues.get(userId);
}

// 处理用户的写入队列
function processUserWriteQueue(userId) {
  const userQueue = getUserWriteQueue(userId);
  
  if (userQueue.queue.length === 0 || userQueue.isWriting) {
    return;
  }
  
  userQueue.isWriting = true;
  const task = userQueue.queue.shift();
  
  fs.writeFile(task.filePath, task.data, (err) => {
    userQueue.isWriting = false;
    
    if (err) {
      console.error(`保存用户 ${userId} 的测试结果时出错:`, err);
      task.reject({ error: '保存测试结果失败' });
    } else {
      console.log(`用户 ${userId} 的测试结果已保存到 ${task.filePath}`);
      task.resolve({ success: true, filename: path.basename(task.filePath) });
    }
    
    // 处理该用户队列中的下一个任务
    processUserWriteQueue(userId);
  });
}

// 确保用户数据目录存在
function ensureUserDataDir(userId) {
  const dataDir = path.join(__dirname, 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
  
  // 为每个用户创建单独的目录
  const userDir = path.join(dataDir, userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir);
  }
  
  return userDir;
}

// 保存测试结果的 API 端点
app.post('/api/saveResults', (req, res) => {
  const testResults = req.body;
  
  // 使用会话ID或请求中的用户ID
  const userId = req.session.userId || testResults.userId || 'anonymous';
  
  // 确保用户数据目录存在
  const userDir = ensureUserDataDir(userId);
  
  // 使用时间戳创建文件名
  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `test_results_${timestamp}.json`;
  const filePath = path.join(userDir, filename);
  
  // 将写入任务添加到用户的队列
  new Promise((resolve, reject) => {
    const userQueue = getUserWriteQueue(userId);
    userQueue.queue.push({
      filePath,
      data: JSON.stringify(testResults, null, 2),
      resolve,
      reject
    });
    
    processUserWriteQueue(userId);
  })
  .then(result => res.json(result))
  .catch(error => res.status(500).json(error));
});

// 更新用户信息的 API 端点
app.post('/api/updateUserInfo', (req, res) => {
  const { userId, userInfo } = req.body;
  
  // 使用会话ID或请求中的用户ID
  const actualUserId = req.session.userId || userId;
  
  if (!actualUserId || !userInfo) {
    return res.status(400).json({ error: '缺少必要参数' });
  }
  
  // 确保用户数据目录存在
  const userDir = ensureUserDataDir(actualUserId);
  
  // 查找该用户最近的测试结果文件
  const files = fs.readdirSync(userDir);
  const userFiles = files.filter(file => file.endsWith('.json'));
  
  if (userFiles.length === 0) {
    return res.status(404).json({ error: '找不到用户的测试结果文件' });
  }
  
  // 按时间戳排序，获取最新的文件
  userFiles.sort((a, b) => {
    const timeA = new Date(a.split('_')[1].replace('.json', '').replace(/-/g, ':'));
    const timeB = new Date(b.split('_')[1].replace('.json', '').replace(/-/g, ':'));
    return timeB - timeA;
  });
  
  const latestFile = userFiles[0];
  const oldFilePath = path.join(userDir, latestFile);
  
  // 读取旧文件内容
  fs.readFile(oldFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`读取用户 ${actualUserId} 的旧文件时出错:`, err);
      return res.status(500).json({ error: '读取旧文件失败' });
    }
    
    try {
      // 解析旧文件内容
      const oldData = JSON.parse(data);
      
      // 添加用户信息
      oldData.userInfo = userInfo;
      
      // 创建新文件名
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const newFilename = `test_results_${timestamp}_with_info.json`;
      const newFilePath = path.join(userDir, newFilename);
      
      // 将更新后的数据写入新文件
      new Promise((resolve, reject) => {
        const userQueue = getUserWriteQueue(actualUserId);
        userQueue.queue.push({
          filePath: newFilePath,
          data: JSON.stringify(oldData, null, 2),
          resolve,
          reject
        });
        
        processUserWriteQueue(actualUserId);
      })
      .then(() => {
        // 删除旧文件
        fs.unlink(oldFilePath, (unlinkErr) => {
          if (unlinkErr) {
            console.error(`删除用户 ${actualUserId} 的旧文件时出错:`, unlinkErr);
            // 即使删除旧文件失败，我们仍然认为更新成功
          }
          
          console.log(`用户 ${actualUserId} 的测试结果已更新并保存到 ${newFilePath}`);
          res.json({ success: true, filename: newFilename });
        });
      })
      .catch(error => {
        console.error(`保存用户 ${actualUserId} 的更新数据时出错:`, error);
        res.status(500).json({ error: '保存更新后的测试结果失败' });
      });
    } catch (parseErr) {
      console.error(`解析用户 ${actualUserId} 的旧文件内容时出错:`, parseErr);
      return res.status(500).json({ error: '解析旧文件内容失败' });
    }
  });
});

// 创建会话ID的API
app.get('/api/session', (req, res) => {
  if (!req.session.userId) {
    req.session.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  res.json({ userId: req.session.userId });
});

// 获取用户测试结果的API
app.get('/api/results', (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ error: '未授权，请先创建会话' });
  }
  
  const userDir = path.join(__dirname, 'data', userId);
  
  if (!fs.existsSync(userDir)) {
    return res.json({ results: [] });
  }
  
  try {
    const files = fs.readdirSync(userDir);
    const resultFiles = files.filter(file => file.endsWith('.json'));
    
    // 按时间戳排序
    resultFiles.sort((a, b) => {
      const timeA = new Date(a.split('_')[1].replace('.json', '').replace(/-/g, ':'));
      const timeB = new Date(b.split('_')[1].replace('.json', '').replace(/-/g, ':'));
      return timeB - timeA;
    });
    
    // 只返回最新的5个结果
    const recentFiles = resultFiles.slice(0, 5);
    
    const results = recentFiles.map(file => {
      const filePath = path.join(userDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(content);
      } catch (e) {
        return { error: '无法解析文件', filename: file };
      }
    });
    
    res.json({ results });
  } catch (err) {
    console.error(`获取用户 ${userId} 的测试结果时出错:`, err);
    res.status(500).json({ error: '获取测试结果失败' });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
