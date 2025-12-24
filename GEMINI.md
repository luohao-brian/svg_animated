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

## 3. 科学/教育通用动画设计指南 (Scientific Animation Guidelines)
本章节总结了适用于科学解释、技术演示及教育类视频的动画设计原则。不同于娱乐动画，此类动画的核心目标是**准确性 (Accuracy)**、**清晰度 (Clarity)** 和 **逻辑连贯性 (Coherence)**。

### 3.1 核心原则 (Core Principles)

#### 拒绝“果冻效应” (No Jelly Effect)
*   **原则**：科学对象（如数学公式、物理实体、数据图表）应当表现出稳定和严谨的特性。
*   **避免**：`elastic` (弹性)、`bounce` (弹跳) 等过于活泼或不稳定的缓动效果。
*   **推荐**：
    *   **入场/出场**：`easeOutCubic`, `easeOutExpo`, `easeOutQuart` (快速进入，平滑减速停止)。
    *   **状态变化**：`easeInOutQuad` (平滑过渡)。
    *   **线性运动**：仅在表现匀速物理运动时使用 `linear`。

#### 上下文持久性 (Context Persistence)
*   **原则**：不要随意移除屏幕上的信息，除非空间不足或信息已彻底过时。观众需要参考旧信息来理解新结论。
*   **实践**：
    *   **输入->输出**：展示从 A 推导到 B 时，保留 A 在屏幕上（如：保留 MBTI 表格的同时展示生成的向量）。
    *   **对比**：在对比两个对象时，确保它们同时存在且位置对齐。
    *   **避免**：频繁的全屏切换或元素的瞬间消失。

#### 视觉锚点 (Visual Anchors)
*   **原则**：在复杂的变换中，保持至少一个元素相对静止或位置可预测，作为观众视线的“锚点”。
*   **实践**：
    *   在场景切换时，保留标题或核心角色（如 Jay）的位置不变。
    *   使用坐标轴、网格背景作为稳定的参考系。

### 3.2 场景布局规范 (Layout Standards)

#### 左右流式布局 (Left-to-Right Flow)
*   **适用**：推导过程、数据转换、因果关系。
*   **结构**：
    *   **左侧 (Source)**：原始数据、输入条件、主角。
    *   **中间 (Process)**：处理逻辑、变换过程。
    *   **右侧 (Result)**：最终结果、输出图表。
*   **优势**：符合大多数语言从左到右的阅读习惯，逻辑顺畅。

#### 坐标系与数学空间 (Coordinate Systems)
*   **原点位置**：
    *   不要默认居中，应根据数据分布调整。
    *   若有负值数据（第二/三象限），原点应向右/上偏移。
*   **防遮挡**：
    *   **标签 (Labels)**：根据向量方向动态调整 `text-anchor` (start/end) 和垂直偏移 (dy)。
    *   **示例**：第一象限向量标签在上方/右侧，第四象限向量标签在下方。

#### 字幕与安全区 (Subtitles & Safe Zones)
*   **字幕位置**：底部居中，预留足够高度（如底部 10%-15%）。
*   **安全区**：
    *   任何关键视觉元素（图表底部、卡片边缘）不得进入字幕区域。
    *   背景元素（网格、装饰性粒子）可以延伸至字幕后方，但需保证字幕背景有足够的遮罩（如高斯模糊）。

### 3.3 动画节奏 (Timing & Pacing)

#### 留白与呼吸 (Pauses & Breathing Room)
*   **阅读时间**：出现大段文字或复杂公式后，**必须**静止 2-3 秒。
*   **微动作**：在静止期间，可以使用极缓慢的呼吸效果（如 scale 1.0 -> 1.02）保持画面活性，但幅度要极小。

#### 错峰展示 (Staggering)
*   **原则**：避免海量信息瞬间同时轰炸观众。
*   **实践**：
    *   **列表/卡片**：使用 `anime.stagger(100)` 让列表项依次滑入。
    *   **图表**：先画轴，再画刻度，最后画数据线。

#### 连贯转场 (Coherent Transitions)
*   **变换 (Transform)** 优于 **替换 (Replace)**。
*   **示例**：
    *   好：原本是“圆点”的人，变形伸展成为“条形图”。
    *   差：人消失，原位突然出现条形图。

### 3.4 技术实现检查清单 (Technical Checklist)

#### SVG 坐标变换
- [ ] 确认 `scale(1, -1)` (Y轴翻转) 用于数学坐标系。
- [ ] 确认文本标签使用了逆变换 `scale(1, -1)` 防止倒立。
- [ ] 确认文本 Y 坐标已取反 (`-y`) 以适配翻转坐标系。

#### 响应式与窗口适配
- [ ] 关键元素是否在标准 16:9 (如 1920x1080, 800x600 viewBox) 内完整可见？
- [ ] 字幕是否会遮挡底部关键数据？

#### 性能优化
- [ ] 避免同时对上百个 DOM 元素进行复杂动画（使用 Canvas 或优化 SVG 结构）。
- [ ] 录制模式下，确保帧率稳定（非实时渲染可忽略，但开发预览需流畅）。

## 4. 动画实现策略
尽管基础架构统一，但具体的动画实现库应根据项目需求选择：
- **Native SVG / CSS**: 适合基础几何变换（参考 `solar_system`）。
- **Anime.js / GSAP**: 适合复杂的补间动画序列。
- **Canvas / WebGL**: 适合高性能粒子或 3D 效果。
- **Reveal.js**: 适合演示文稿类动画。

## 5. 自动化录制标准 (Critical)
所有项目必须支持统一的视频录制命令，以生成标准化的演示视频。

- **命令**: `npm run record`
- **输出**: `video_records/<project_name>.mp4`
- **画质标准**: 1080p, 60fps (推荐使用 4K 超采样渲染)。
- **实现机制**:
    1. **前端暴露**: 组件需暴露 `window.<namespace>.step(timestamp)` 接口。
    2. **脚本驱动**: 使用 Puppeteer 逐帧截图。
    3. **视频合成**: 使用 FFmpeg 合成图片序列。
    *参考 `solar_system/scripts/record.js` 作为标准模板。*

## 6. 脚手架自动化搭建说明 (Scaffolding Automation)
为确保新项目快速符合本仓库标准，且避免 `create-vite` 等工具的交互式询问，请使用根目录下的 `create_project.js` 脚本：

### 6.1 全自动创建
```bash
# 在根目录下执行
node create_project.js <project_name>
```

该脚本会自动执行以下操作：
1. 创建项目目录结构（src, public, scripts）。
2. 生成 `package.json` 并包含核心依赖 (Vue 3, Anime.js, Tailwind CSS, Puppeteer)。
3. 配置 Vite (端口 5173) 和 Tailwind CSS。
4. 创建基础 Vue 组件 (`App.vue` 包含动画钩子) 和样式 (`style.css`)。
5. 复制标准录制脚本 (`scripts/record.js`) 并适配。
6. 自动安装依赖 (`npm install`)。

### 6.2 验证与启动
创建完成后，进入项目目录并启动：
```bash
cd <project_name>
npm run dev
```

## 7. 文档维护
- **Global (@README.md)**: 维护环境配置（如 FFmpeg 安装）、通用架构说明和项目索引。
- **Local (subdir/README.md)**: 维护该项目的特定动画逻辑、独有依赖和交互说明。
- **Local (subdir/GEMINI.md)**: 维护该项目的特定视觉与剧本规范。
