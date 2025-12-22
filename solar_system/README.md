# Solar System SVG Animation

一个基于 Vue 3、Tailwind CSS 和原生 SVG 开发的交互式太阳系动态演示项目。

## 🚀 核心功能

- **SVG 动态渲染**: 利用 SVG 路径和变换实现流畅的行星公转动画。
- **行星详情交互**: 鼠标悬停在行星上时，展示轨道半径、星球半径和公转周期等实时数据。
- **响应式设计**: 适配不同屏幕尺寸。
- **高画质录制**: 支持 4K 超采样渲染导出 1080p/60fps 视频。

## 🛠️ 特定技术实现

- **核心动画**: 使用原生 SVG `<g>` 变换与 JavaScript `requestAnimationFrame` 驱动。
- **录制接口**: 通过 `window.solarSystem` 对象暴露 `step()` 方法供录制脚本调用。

## 📦 快速开始

### 开发预览

```bash
npm install
npm run dev
```

### 视频录制

本项目遵循根目录定义的[通用录制机制](../README.md#自动化视频录制机制)。

1. **启动录制服务**:
   ```bash
   npm run dev -- --port 5174
   ```

2. **开始录制**:
   ```bash
   npm run record
   ```
   
   输出文件: `video_records/solar_system.mp4`

## 📝 目录结构

- `src/components/SolarSystem.vue`: 核心动画组件。
- `scripts/record.js`: 针对本项目的 Puppeteer 录制脚本配置。
