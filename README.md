# 🌟 小孩激励积分系统

> 完成任务赚取积分，兑换奖励的儿童激励积分管理工具

## 📱 使用方法

### 1. 本地预览（开发阶段）
```bash
# 使用 VS Code 的 Live Server 插件
# 或使用 Python 内置服务器
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后在浏览器打开 `http://localhost:8080`

### 2. 配置微信云开发
1. 登录 [微信云开发控制台](https://console.cloud.tencent.com/tcb)
2. 创建新项目（免费额度足够使用）
3. 复制环境 ID（类似 `prod-abc123`）
4. 打开 `js/cloud.js`，将 `CONFIG.env` 替换为实际的环境 ID

### 3. 部署上线
```bash
# 方法1：GitHub Pages（免费）
# 将项目推送到 GitHub，开启 GitHub Pages

# 方法2：Vercel（免费）
# 连接 GitHub 仓库，自动部署

# 方法3：腾讯云云托管
# 适合配合微信云开发使用
```

### 4. iPhone 使用
1. 用 Safari 浏览器打开网址
2. 点击底部"分享"按钮
3. 选择"添加到主屏幕"
4. 现在就像 App 一样使用了！

## ✨ 功能特性

- ✅ **任务管理**：家长创建任务，小孩完成任务赚取积分
- ✅ **奖励兑换**：设置奖励，消耗积分兑换
- ✅ **幸运抽奖**：消耗积分参与转盘抽奖
- ✅ **积分记录**：查看每次积分变动详情
- ✅ **多角色支持**：家长/小孩独立账号
- ✅ **数据同步**：云开发实时同步，家长手机数据互通
- ✅ **PWA 支持**：可添加到主屏幕，像原生 App 一样

## 📁 项目结构

```
小孩激励/
├── index.html              # 主入口
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── cloud.js            # 云开发配置
│   ├── auth.js             # 用户认证
│   ├── app.js              # 主应用逻辑
│   ├── components/
│   │   └── tabBar.js       # 底部导航
│   └── pages/
│       ├── login.js        # 登录页
│       ├── home.js         # 首页
│       ├── tasks.js        # 任务管理
│       ├── rewards.js      # 奖励兑换
│       ├── lottery.js      # 抽奖
│       └── logs.js         # 积分记录/设置
└── pwa/
    ├── manifest.json       # PWA 配置
    └── sw.js               # Service Worker
```

## 🔧 技术栈

- **前端**：原生 HTML/CSS/JavaScript
- **后端**：微信云开发（Serverless）
- **PWA**：manifest.json + Service Worker
- **无需**：npm、Node.js、构建工具

## 📝 自定义

### 修改抽奖设置
打开 `js/pages/lottery.js`，修改 `DEFAULT_PRIZES` 和 `LOTTERY_COST`

### 修改配色
打开 `css/style.css`，修改 CSS 变量（`:root` 部分）

## ⚠️ 注意事项

1. **首次使用**：需要在 `js/cloud.js` 中配置云开发环境 ID
2. **数据权限**：默认设置为所有用户可读，建议在生产环境设置数据库权限
3. **浏览器兼容性**：推荐使用 Safari、Chrome 浏览器
