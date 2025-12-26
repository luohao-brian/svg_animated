# Speculative Decoding (投机解码) 可视化演示

本项目是一个基于 **Vue 3 + Anime.js** 的深度技术可视化演示，旨在通过直观的视觉隐喻，解析大语言模型（LLM）投机解码（Speculative Decoding）的加速原理、硬件瓶颈与数学逻辑。

## 🎯 核心设计理念

本项目不仅仅是一个简单的流程图，而是基于**“物理-数学-经济”**三维视角构建的深度教学演示：

*   **物理层 (Physics)**: 揭示 **Memory Wall (内存墙)** 瓶颈。通过“货运卡车”隐喻，直观展示带宽限制如何导致传统 Decode 阶段 GPU 算力空转，以及投机解码如何通过提升**算术强度 (Arithmetic Intensity)** 来压榨空闲算力。
*   **数学层 (Math)**: 严谨展示 **Rejection Sampling (拒绝采样)**。拒绝不仅仅是简单的“删掉”，而是基于概率分布 $P'(x) = \text{norm}(\max(0, p-q))$ 的残差重采样过程。
*   **经济层 (Economics)**: 强调 **Failure Cost (失败代价)**。可视化演示当预测失败时，KV Cache 的物理擦除（Rollback）与算力浪费，证明投机解码本质上是“用廉价的空闲算力换取昂贵的显存带宽”。

## 📽️ 视觉隐喻系统

| 技术实体 | 视觉隐喻 | 含义 |
| :--- | :--- | :--- |
| **Target Model (大模型)** | ☕ **主编 (Editor)** | 权威、准确，但受限于阅读速度（带宽），一旦有稿子审阅极快。 |
| **Draft Model (小模型)** | 🧢 **实习生 (Intern)** | 敏捷、廉价，可以快速生成草稿，但准确率不稳定。 |
| **Memory Bandwidth (带宽)** | 🚚 **卡车 (Truck)** | 限制系统速度的核心瓶颈。一次拉一个词（Decode）很亏，一次拉一车词（Prefill/Verify）才赚。 |
| **KV Cache (显存状态)** | 📝 **文稿 (Manuscript)** | 实习生写在纸上的字。如果被拒，需要物理擦除（橡皮擦特效）。 |

## 🛠️ 技术栈

*   **Core**: [Vue 3](https://vuejs.org/) (Composition API)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Retro Terminal / Pixel Art 风格)
*   **Animation**: [Anime.js](https://animejs.com/) (时间轴控制)
*   **Recording**: Puppeteer (60fps 帧级录制)

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 即可看到实时动画。

### 3. 生成演示视频

本项目内置了帧级录制脚本，可生成高画质 MP4 视频：

```bash
# 需确保 npm run dev 正在运行
npm run record
```

视频将输出至 `../video_records/speculative_decoding_demo.mp4`。

## 📚 文档资源

*   **[GEMINI.md](./GEMINI.md)**: 项目总览与视觉指南。
*   **[Tech_Spec.md](./Tech_Spec.md)**: 详细的技术规格说明书。
*   **[Narrative_Script.md](./Narrative_Script.md)**: 视频分镜脚本与旁白。
*   **[Visual_System_Engineering.md](./Visual_System_Engineering.md)**: 视觉工程规范。
