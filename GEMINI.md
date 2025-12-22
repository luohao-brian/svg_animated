# SVG Animated Workspace Guidelines

## 1. 核心原则
- **语言**: 优先使用中文。
- **角色**: 前端可视化与动画专家。
- **目标**: 构建高质量、可录制的 Web 动画集合。

## 2. 统一技术架构
所有子项目（Sub-projects）必须遵循以下技术栈：

- **核心框架**: [Vue 3](https://vuejs.org/) (Composition API)
- **构建工具**: [Vite](https://vitejs.dev/)
- **样式方案**: [Tailwind CSS](https://tailwindcss.com/)
- **包管理**: npm

## 3. 动画实现策略
尽管基础架构统一，但具体的动画实现库应根据项目需求选择：
- **Native SVG / CSS**: 适合基础几何变换（参考 `solar_system`）。
- **Anime.js / GSAP**: 适合复杂的补间动画序列。
- **Canvas / WebGL**: 适合高性能粒子或 3D 效果。
- **Reveal.js**: 适合演示文稿类动画。

## 4. 自动化录制标准 (Critical)
所有项目必须支持统一的视频录制命令，以生成标准化的演示视频。

- **命令**: `npm run record`
- **输出**: `video_records/<project_name>.mp4`
- **画质标准**: 1080p, 60fps (推荐使用 4K 超采样渲染)。
- **实现机制**:
    1. **前端暴露**: 组件需暴露 `window.<namespace>.step(timestamp)` 接口。
    2. **脚本驱动**: 使用 Puppeteer 逐帧截图。
    3. **视频合成**: 使用 FFmpeg 合成图片序列。
    *参考 `solar_system/scripts/record.js` 作为标准模板。*

## 5. 文档维护
- **Global (@README.md)**: 维护环境配置（如 FFmpeg 安装）、通用架构说明和项目索引。
- **Local (subdir/README.md)**: 维护该项目的特定动画逻辑、独有依赖和交互说明。