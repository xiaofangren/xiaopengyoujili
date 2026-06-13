# 🌟 小孩激励积分系统

> 完成任务赚取积分，兑换奖励的儿童激励积分管理工具

## 📱 使用方法

### 1. 本地预览

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

然后在浏览器打开 `http://localhost:8080`

### 2. 配置云开发

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/tcb)
2. 创建项目（免费额度足够使用）
3. 打开 `js/cloud.js`，确认环境 ID 正确
4. 在控制台创建以下数据库集合：`users`、`tasks`、`rewards`、`logs`、`lottery_config`

### 3. 部署上线

```bash
# 推送到 GitHub，开启 GitHub Pages
# 或连接 Vercel / 腾讯云自动部署
```

### 4. iPhone 使用

1. 用 Safari 浏览器打开网址
2. 点击底部"分享"按钮
3. 选择"添加到主屏幕"

## ✨ 功能特性

- ✅ **任务管理**：家长创建任务，小孩完成赚取积分
- ✅ **奖励兑换**：设置奖励，消耗积分兑换
- ✅ **幸运抽奖**：拉霸机抽奖，多种奖品等级
- ✅ **积分记录**：日历视图查看每日积分变动
- ✅ **多角色支持**：家长/小孩独立账号，数据云端同步
- ✅ **PWA 支持**：添加到主屏幕，离线可用
- ✅ **按键音效**：全操作音频反馈

## 📁 项目结构

```
├── index.html              # 主入口
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── cloud.js            # 云开发封装
│   ├── auth.js             # 用户认证与积分
│   ├── app.js              # 主应用逻辑与路由
│   ├── sound.js            # Web Audio API 音效
│   ├── components/
│   │   └── tabBar.js       # 底部导航
│   └── pages/
│       ├── login.js        # 登录页
│       ├── home.js         # 首页
│       ├── tasks.js        # 任务管理
│       ├── rewards.js      # 奖励兑换
│       ├── lottery.js      # 拉霸抽奖
│       └── logs.js         # 积分记录/设置
├── 图片/                   # 抽奖图片资源
└── pwa/
    ├── manifest.json       # PWA 配置
    └── sw.js               # Service Worker
```

## 🔧 技术栈

- **前端**：原生 HTML / CSS / JavaScript
- **后端**：腾讯云云开发（Serverless）
- **PWA**：manifest.json + Service Worker 离线缓存
- **零构建**：无需 npm、Node.js、打包工具

## 📝 自定义

### 修改抽奖设置

打开 `js/pages/lottery.js`，调整以下常量：

```js
const LOTTERY_COST = 5;      // 每次抽奖消耗积分
const DAILY_LIMIT = 3;       // 每日抽奖次数
const PRIZE_PROBS = [        // 奖品概率与积分
    { name: '大奖', score: 10, match: 4, prob: 5.6  },   // ~5.6%
    { name: '幸运奖', score: 8, match: 3, prob: 16.7 },  // ~16.7%
    { name: '运气奖', score: 7, match: 2, prob: 11.1 }, // ~11.1%
    { name: '小奖', score: 6, match: 2, prob: 55.6 },   // ~55.6%
    { name: '谢谢参与', score: 4, match: 0, prob: 11.1 },// ~11.1%
];
```

### 修改配色

打开 `css/style.css`，修改 `:root` 中的 CSS 变量。
