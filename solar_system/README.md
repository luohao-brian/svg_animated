# Solar System SVG Animation

一个基于 Vue 3、Tailwind CSS 和 SVG 开发的交互式太阳系动态演示项目，支持自动化视频录制。

## 🚀 核心功能

- **SVG 动态渲染**: 利用 SVG 路径和变换实现流畅的行星公转动画。
- **行星详情交互**: 鼠标悬停在行星上时，会展示该行星的轨道半径、星球半径和公转周期等实时数据。
- **响应式设计**: 使用 Tailwind CSS 构建，适配不同屏幕尺寸。
- **自动化录制**: 集成了 Puppeteer 和 FFmpeg，可一键将网页动画导出为 MP4 视频（60 FPS）。

## 🛠️ 技术栈

- **前端**: [Vue 3](https://vuejs.org/) (Composition API)
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **构建工具**: [Vite](https://vitejs.dev/)
- **自动化录制**: [Puppeteer](https://pptr.dev/) & [FFmpeg](https://ffmpeg.org/)

## 📦 安装与启动

1. **安装依赖**:
   ```bash
   npm install
   ```

2. **启动开发服务器**:
   ```bash
   npm run dev
   ```
   默认运行在 `http://localhost:5173`。

## 🎥 视频录制指南

项目包含一个特殊的录制脚本，通过控制 Vue 组件暴露的 `window.solarSystem` 对象，逐帧捕获画面并合成为视频。

**✨ 高画质特性 (V1 升级)**:
- **超采样 (Super-sampling)**: 录制时使用 **4K (3840x2160)** 分辨率进行渲染，然后使用高质量 Bicubic 算法下采样至 **1080p**。这极大消除了锯齿，使细线条（如轨道）更加平滑锐利。
- **无损级编码**: 使用 FFmpeg 的 `veryslow` 预设和 `CRF 18` 参数，确保输出视频接近无损画质。

### 前置要求
- 系统已安装 `ffmpeg` 并在环境变量中。

### 执行录制
1. **启动专用录制服务**:
   录制脚本默认访问 `5174` 端口。请在一个终端中运行：
   ```bash
   npm run dev -- --port 5174
   ```

2. **运行录制脚本**:
   在另一个终端中运行：
   ```bash
   npm run record
   ```
   *注意：由于开启了高画质渲染，录制过程可能比普通模式稍慢。*

3. 录制完成后，视频将保存在 `video_records/solar_system.mp4`。

## 📁 目录结构

- `src/components/SolarSystem.vue`: 核心太阳系组件。
- `scripts/record.js`: 基于 Puppeteer 的视频录制脚本。
- `video_records/`: 视频录制输出目录（已忽略 Git）。

## 📝 约定
- 动画帧控制通过 `window.solarSystem.step()` 实现，确保录制时每一帧都精确同步。
- 采用 Tailwind CSS 进行原子化样式管理。