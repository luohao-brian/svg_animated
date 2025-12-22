# SVG Animated Collection

本仓库汇集了一系列基于 Web 技术构建的高质量 SVG 动画与可视化项目。

## 🏗 统一架构与技术栈

为了保持项目的一致性和可维护性，所有子项目均遵循以下技术规范：

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式方案**: [Tailwind CSS](https://tailwindcss.com/)
- **动画实现**: 根据项目需求采用不同的库或原生实现 (e.g., Native SVG, Anime.js, Reveal.js, GSAP 等)。

## 🎥 自动化视频录制机制

本仓库实现了一套通用的高画质视频录制方案，所有子项目均支持通过统一命令生成演示视频。

### 工作原理
1. **帧同步**: 动画组件通过 `window` 对象暴露控制接口（如 `step()` 方法），允许外部脚本精确控制每一帧的渲染。
2. **自动化采集**: 使用 **Puppeteer** 在无头浏览器中逐帧截图。
3. **合成输出**: 调用 **FFmpeg** 将图像序列合成为高帧率（通常为 60fps）MP4 视频。
4. **画质增强**: 支持 4K 超采样渲染 + Bicubic 下采样至 1080p，以获得抗锯齿的高质量画面。

### 前置要求
- **Node.js**: 建议使用 LTS 版本。
- **FFmpeg**: 必须安装并配置在系统环境变量中，用于视频合成。

### 通用命令

在任意子项目目录下，通常支持以下标准命令：

```bash
# 安装依赖
npm install

# 启动开发预览 (通常在 http://localhost:5173)
npm run dev

# 执行视频录制 (需在另一终端先启动开发服务，通常指定端口 5174)
# 1. Terminal A: 启动专用录制服务
npm run dev -- --port 5174

# 2. Terminal B: 开始录制
npm run record
```

## 📂 项目列表

| 项目目录 | 描述 | 核心动画技术 |
| :--- | :--- | :--- |
| **[solar_system](./solar_system)** | 交互式太阳系演示，展示行星公转与数据详情。 | Native SVG, CSS Transforms |
| *(更多项目开发中...)* | | |

## 🤝 贡献指南

1. 新增项目时，请使用 Vue 3 + Vite + Tailwind 模板初始化。
2. 确保实现 `scripts/record.js` 并在 `package.json` 中配置 `npm run record`。
3. 动画组件需暴露帧控制接口以支持录制。