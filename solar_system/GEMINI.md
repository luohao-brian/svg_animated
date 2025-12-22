# GEMINI 项目指南

## 语言
- 优先使用中文进行交流。

## 任务规划与执行
- **调研**: 在执行复杂任务前，会通过 `search` 和 `context7` 等工具调研相关方案和 API，并列出可选方案。
- **验证**: 对于不确定的主题和方案，会先讨论和验证，确认无误后再执行。
- **明确输出**: 任务的每个步骤都会明确输出，避免等到所有工作结束后才提供结果。
- **迭代开发**: 采用迭代开发过程，包括编写单元测试（如果适用）和日志输出进行验证。

## 项目技术栈与约定 (当前项目: Vue 3 / Tailwind CSS / Node.js)

### 前端框架
- **Vue**: 使用 Vue 3 (通过 Vite 构建)。

### 样式
- **Tailwind CSS**: 采用 Tailwind CSS 进行样式开发，已配置 `tailwind.config.js` 和 `postcss.config.js`。

### 包管理与构建
- **Node.js/npm**: 使用 npm 管理项目依赖。
- **Vite**: 项目构建工具为 Vite。
- **依赖安装**: `npm install`
- **开发服务器**: `npm run dev` (通常运行在 `http://localhost:5173` 或 `http://localhost:5174`)
- **生产构建**: `npm run build`

### SVG 动画
- `src/components/SolarSystem.vue` 包含了太阳系 SVG 动画的核心逻辑。
- 动画通过 `requestAnimationFrame` 实现，并暴露 `window.solarSystem` 全局对象用于外部控制（例如录制）。

### 视频录制
- **工具**: 使用 `puppeteer` 自动化浏览器截图，并通过 `ffmpeg` 将图片序列合成为 MP4 视频。
- **高画质策略 (V1)**:
    - **视口**: 3840x2160 (4K)，用于超采样抗锯齿。
    - **处理**: FFmpeg 使用 `bicubic` 算法下采样至 1920x1080。
    - **编码**: `libx264`, `preset: veryslow`, `CRF: 18`。
- **录制脚本**: `scripts/record.js`
- **录制命令**: `npm run record`
- **录制配置**: 可通过修改 `scripts/record.js` 中的 `TOTAL_FRAMES` 来调整录制时长。
- **输出文件**: 默认输出 `video_records/solar_system.mp4`。

### 日志
- 脚本日志输出采用格式化方式: `[HH:mm:ss] [LEVEL] Message`，方便追踪和调试。
