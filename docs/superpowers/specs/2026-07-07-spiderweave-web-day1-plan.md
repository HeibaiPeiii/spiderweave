# SpiderWeave Web 版 Day 1 计划：项目骨架 + 暗色主题 + 首页雏形

> 日期：2026-07-07  
> 状态：执行中  
> 预计时间：3-4 小时  
> 基于：2026-07-04-spiderweave-web-design.md

---

## 当前状态

- 设计文档已完成（小程序版 + Web 版）
- Node.js v20.18.0 / npm 10.8.2 已就绪
- 项目目录 `D:\cc\spider` 下有 legacy 小程序文件
- Web 项目放在 `D:\cc\spider\web\` 子目录，与 legacy 代码隔离

---

## Day 1 目标

> 浏览器里看到暗色背景 + 蜘蛛占位图 + 打招呼气泡

---

## 执行步骤

### 第一步：脚手架 Vite + React 项目（~15 min）

```bash
cd D:\cc\spider
npm create vite@latest web -- --template react
cd web
npm install
npm run dev
```

- 用 Vite 官方 React 模板创建项目
- 确认 `npm run dev` 能启动，浏览器打开 localhost 页面
- 清理模板自带的无用文件（`App.css`、`index.css`、assets 等）

### 第二步：搭建目录结构（~15 min）

按照设计文档建立 `src/` 下的目录：

```
src/
├── contexts/
│   └── SpiderContext.jsx
├── hooks/
│   ├── useSpiderState.js
│   └── useLocalStorage.js
├── pages/
│   ├── HomePage.jsx
│   └── WebDetailPage.jsx
├── components/
│   ├── Spider.jsx
│   ├── GreetingBubble.jsx
│   ├── WebSvg.jsx
│   ├── ThreadNode.jsx
│   ├── CreateWebModal.jsx
│   ├── StepList.jsx
│   └── StatusBadge.jsx
├── styles/
│   └── global.css
├── App.jsx
└── main.jsx
```

### 第三步：全局暗色主题样式（~30 min）

- 写 `global.css`：暗色底色 `#1a1a2e`、文字颜色、按钮样式
- 引入到 `main.jsx`
- 页面 body 变暗色即可验证

### 第四步：写 SpiderContext 骨架（~30 min）

- 定义 spider 初始状态、webs 数组
- 实现 hunger 计算逻辑（打开时计算时间差）
- 实现 spiderState 派生（active/hungry/shrunk）
- 实现完成步骤 → hunger+20、lastFedAt 更新
- localStorage 读写封装

### 第五步：写 HomePage 静态骨架（~45 min）

- 蜘蛛占位区域（先放一个圆形 SVG 占位，后续替换为 Spider 组件）
- 打招呼气泡（硬编码一条文案，样式到位）
- "继续织网" / "建一张新网" 两个按钮（先 disabled，无功能）
- 首次使用引导状态（无网时的展示）

### 第六步：App.jsx 页面切换骨架（~15 min）

- `currentPage` state 切换 home / webDetail
- 渲染对应页面组件

---

## 完成标志

- [ ] `npm run dev` 正常启动
- [ ] 浏览器打开看到暗色背景（#1a1a2e）
- [ ] 首页显示：蜘蛛占位图 + 打招呼气泡 + 两个按钮
- [ ] 首次使用状态：无网时显示"来织第一张网吧"
- [ ] 项目目录结构符合设计文档
- [ ] SpiderContext 骨架已创建，能提供初始数据

---

## 不做（Day 2+）

- 蛛网 SVG 绘制（Day 2）
- 创建新网弹窗（Day 2）
- 网详情页（Day 2）
- 蜘蛛三态 SVG（先用占位图）
- 动画效果
- 步骤列表
- 拖拽缩放
