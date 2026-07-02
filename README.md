# 🌟 小孩激励积分系统

> 完成任务赚取积分，兑换奖励的儿童激励积分管理工具，支持多家庭隔离使用

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

- ✅ **任务管理**：创建任务，完成赚取积分
- ✅ **奖励兑换**：设置奖励，消耗积分兑换
- ✅ **幸运抽奖**：拉霸机抽奖，多种奖品等级
- ✅ **多家庭隔离**：不同家庭任务和奖励完全隔离，互不干扰
- ✅ **家庭码加入**：输入家庭码加入已有家庭，共享任务和奖励
- ✅ **一键切换**：家庭成员间一键切换，积分和进度自动切换
- ✅ **认领旧数据**：无主旧数据可一键迁移到当前家庭
- ✅ **积分记录**：日历视图查看每日积分变动
- ✅ **PWA 支持**：添加到主屏幕，离线可用
- ✅ **按键音效**：全操作音频反馈

## 📁 项目结构

```
├── index.html              # 主入口
├── 家庭隔离说明.md          # 多家庭功能使用说明
├── css/
│   └── style.css           # 全局样式
├── js/
│   ├── cloud.js            # 云开发封装 + 家庭查询助手
│   ├── auth.js             # 用户认证、积分、家庭管理
│   ├── app.js              # 主应用逻辑、路由、家庭成员切换
│   ├── sound.js            # Web Audio API 音效
│   ├── components/
│   │   └── tabBar.js       # 底部导航
│   └── pages/
│       ├── login.js        # 登录页
│       ├── home.js         # 首页（积分总览）
│       ├── tasks.js        # 任务管理
│       ├── rewards.js      # 奖励兑换
│       ├── lottery.js      # 拉霸抽奖
│       └── logs.js         # 积分记录/设置/家庭信息
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

## 🏠 多家庭使用

详见 [家庭隔离说明.md](家庭隔离说明.md)

### 快速开始

1. **首次使用**：输入昵称登录，系统自动创建家庭并生成家庭码
2. **家人加入**：新设备输入昵称 + 家庭码，加入同一家庭共享任务奖励
3. **切换成员**：「我的」页点击头像，一键切换到其他家庭成员
4. **添加成员**：在切换弹窗中点击「添加成员」，无需家庭码

### 旧数据迁移

升级前创建的任务和奖励对所有用户可见。可在「我的」→「设置」→「认领旧数据」一键迁移到当前家庭名下。

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
