# SVG Animated Workspace

该目录是一个专注于 SVG 动画与可视化项目的开发工作区。

## 📂 目录概览

当前包含以下子项目：

### [solar_system](./solar_system)
一个基于 Vue 3 和 SVG 的太阳系动态演示项目，具备自动化高画质视频录制功能。

- **核心技术**: Vue 3, Tailwind CSS, SVG, Puppeteer, FFmpeg
- **主要功能**:
    - SVG 路径动画模拟行星公转
    - 交互式行星数据展示
    - **自动化录制**: 支持 4K 超采样渲染，自动输出 1080p 高画质 MP4 视频
- **文档**: 详见 [solar_system/README.md](./solar_system/README.md) 和 [solar_system/GEMINI.md](./solar_system/GEMINI.md)

## 🚀 快速开始

由于每个子项目通常是独立的，请进入具体项目目录进行开发：

```bash
cd solar_system
npm install
npm run dev
```

## 📝 通用约定

- **文档**: 每个子项目目录下应包含独立的 `README.md` 和 `GEMINI.md` 以说明具体的技术细节和操作指南。
- **环境**: 确保本地安装了 Node.js 和 npm。对于涉及视频录制的项目，通常需要 `ffmpeg` 支持。
