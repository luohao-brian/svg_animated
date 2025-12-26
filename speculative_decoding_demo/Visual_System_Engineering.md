# Visual System Engineering Spec: Speculative Decoding

## 1. Global UI Frame & Containment Rules (全局框架与约束规则)

本规范旨在确保视觉系统在 Vue/SVG/CSS 中易于实现，且严格遵循布局约束。

### 1.1 Canvas Structure (画布结构)
基于 16:9 画布 (e.g., 1920x1080 viewBox)。

*   **Zone Top (Header)**:
    *   **Height**: 10% (Fixed 108px).
    *   **Content**: Project Title, Current Step Indicator.
    *   **Style**: Border-bottom (1px solid #334155).
*   **Zone Safe Canvas (Main Stage)**:
    *   **Height**: 80% (Flexible ~864px).
    *   **Constraint**: `overflow: hidden`. All animated elements (tokens, matrices, beams) MUST stay within this box.
    *   **Padding**: 40px internal padding to ensure elements don't touch edges.
*   **Zone Bottom (Caption)**:
    *   **Height**: 10% (Fixed 108px).
    *   **Content**: Subtitles, Legend, Status Messages.
    *   **Style**: Semi-transparent background backdrop for readability.

### 1.2 Containment Rule (核心约束)
*   **Strict Bounding Box**: 任何组件 (Model Card, Token Slot) 必须拥有明确的 `width` 和 `height`。
*   **Text Overflow**:
    *   标签文字 (Label) 必须使用 `text-anchor="middle"` 和 `dominant-baseline="middle"` 居中对齐。
    *   如果文字过长，必须在 SVG 中使用 `clip-path` 或在数据层截断，严禁溢出背景块。

---

## 2. Layout Strategy & Space Utilization (布局与空间利用)

### Layout A: The "Parallel Pipeline" (并行流水线布局)
适用于展示 Draft/Target 并行工作的核心流程。

*   **Zone Context (Top-Left)**:
    *   **Position**: Top 20% of Safe Canvas.
    *   **Width**: 100%.
    *   **Role**: 显示已确认的 Context 序列。
*   **Zone Processing (Middle)**:
    *   **Position**: Middle 50% of Safe Canvas.
    *   **Grid**: 2-Column Grid.
        *   **Col 1 (Draft Lane)**: Width 30%. Displays Draft Model & Draft Tokens.
        *   **Col 2 (Target Lane)**: Width 70%. Displays Target Model & Verification Beam.
*   **Zone Result (Bottom)**:
    *   **Position**: Bottom 30% of Safe Canvas.
    *   **Role**: Token Acceptance/Rejection Animation Area.

### Layout B: The "Rollback Timeline" (回滚时间轴布局)
适用于展示 KV Cache 的管理与回滚。

*   **Zone Timeline (Center Horizontal)**:
    *   **Height**: 40% of Safe Canvas, vertically centered.
    *   **Style**: Long horizontal track/slots representing KV Cache.
*   **Zone Operations (Overlay)**:
    *   **Role**: "Erase" animations and "Rewind" indicators overlaying the timeline.

---

## 3. Typography & Labeling System (字体与标签系统)

使用系统级等宽字体以强调“代码/数据”属性，配合无衬线字体用于 UI 标签。

*   **Font Family**: `'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace` (for Data), `system-ui, sans-serif` (for UI).
*   **Hierarchy**:
    *   **Display H1**: 48px Bold (UI Font). Color: `#f8fafc` (Slate-50).
    *   **Section Label**: 24px Medium (UI Font). Color: `#94a3b8` (Slate-400).
    *   **Token Text**: 32px Bold (Mono Font). Color: `#f1f5f9` (Slate-100). **Critical**: Ensure contrast on colored blocks.
    *   **Meta Data**: 16px Regular (Mono Font). Color: `#64748b` (Slate-500).

---

## 4. Semantic Color System (语义化色彩系统)

基于“职场隐喻” (Intern vs Editor) 的高对比度配色方案。

| Entity | Role/Meaning | Tailwind Class | Hex Code | SVG Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Draft Model (Intern)** | Fast, Tentative | `blue-500` | `#3b82f6` | Fill (Opacity 0.2), Stroke (Solid) |
| **Target Model (Editor)** | Authority, Final | `purple-600` | `#9333ea` | Fill (Opacity 0.2), Stroke (Solid) |
| **Valid Token** | Accepted, Correct | `green-500` | `#22c55e` | Fill (Solid), Stroke (None) |
| **Invalid Token** | Rejected, Wrong | `red-500` | `#ef4444` | Stroke (Thick), Fill (Pattern) |
| **Background** | Canvas Base | `slate-900` | `#0f172a` | Canvas Background |
| **Container** | Zone Boundary | `slate-800` | `#1e293b` | Fill (Solid), Stroke (Dashed) |
| **Connector** | Data Flow | `slate-400` | `#94a3b8` | Stroke Path |

---

## 5. Component & Connector Library (组件与连接器库)

### Components (SVG Primitives)

1.  **Model Block (模型块)**:
    *   **Shape**: Rounded Rectangle (`rx="8"`).
    *   **Style**:
        *   Draft: Stroke `#3b82f6` (2px), Fill `#3b82f6` (Opacity 0.1).
        *   Target: Stroke `#9333ea` (4px), Fill `#9333ea` (Opacity 0.1).
    *   **Content**: Centered Icon (⚡ for Draft, 🧠 for Target) + Label.

2.  **Token Slot (Token 槽位)**:
    *   **Shape**: Rectangle (`rx="4"`).
    *   **Size**: Fixed Height (e.g., 60px), Variable Width based on text length (min 80px).
    *   **States**:
        *   *Empty*: Dashed Stroke `#475569`.
        *   *Ghost (Draft)*: Dotted Stroke `#3b82f6`, Text Opacity 0.7.
        *   *Confirmed*: Solid Fill `#22c55e`, Text White.
        *   *Rejected*: Solid Stroke `#ef4444`, Strikethrough Text.

3.  **KV Cache Cell (记忆格)**:
    *   **Shape**: Square (`rect`).
    *   **Style**: Stroke `#334155` (1px), Fill `#1e293b`.
    *   **Animation**: "Wipe" effect (fill changes to transparent) for rollback.

### Connectors (SVG Paths)

1.  **Flow Arrow (数据流)**:
    *   **Style**: Solid Line, 2px width. Color `#94a3b8`.
    *   **Marker**: `<marker id="arrow">` (Triangle).
    *   **Type**: Cubic Bezier curves (`C x1 y1, x2 y2, x y`) for smooth routing between Zones.

2.  **Verification Beam (扫描光束)**:
    *   **Style**: Wide Path (20px), Linear Gradient Fill (Purple transparent -> Opaque -> Transparent).
    *   **Animation**: Translate X across Token Slots.

---

# Task 2: Engineering-Ready Validation Prompts

以下 Prompt 旨在验证上述规范在不同风格下的可行性。

### Scheme A: Modern Clean Engineering (现代扁平工程风)
> **Design Style**: Modern Flat UI, Engineering Dashboard, Dark Mode.
> **Scene**: A split-screen layout showing "Draft Model" vs "Target Model" parallel processing.
> **Visuals**:
> *   **Background**: Deep Slate (`#0f172a`) solid background.
> *   **Layout**: A structured grid. Top row has a "Context Bar" with code text. Middle row is split: Left is a "Draft Model" card (Blue outline `#3b82f6`, translucent blue fill), Right is a larger "Target Model" card (Purple outline `#9333ea`, translucent purple fill).
> *   **Elements**: "Token Slots" are rounded rectangles. Some are Green (`#22c55e`) indicating acceptance, one is Red (`#ef4444`) with a cross mark.
> *   **Typography**: Clean sans-serif labels ("Drafting...", "Verifying...") in Slate-400. Monospace font for data tokens inside slots.
> *   **Vibe**: Precision, Software Interface, Clean Lines, No Shadows, High Contrast.

### Scheme B: Technical Blueprint / Line Art (技术蓝图线稿风)
> **Design Style**: Technical Blueprint, Schematic Diagram, Wireframe.
> **Scene**: A data flow diagram of the Speculative Decoding process.
> **Visuals**:
> *   **Background**: Dark Blueprint Blue (`#1e293b`) with a faint grid pattern.
> *   **Stroke Focus**: All elements are defined by strokes (outlines) only, no solid fills.
> *   **Lines**: Connection lines are thin, precise bezier curves in Cyan (`#06b6d4`) and White.
> *   **Components**: Models are represented as wireframe boxes with dashed outlines. Tokens are hollow rectangles with monospace text inside.
> *   **Highlights**: "Verification" is shown as a glowing neon pulse along a connector line.
> *   **Vibe**: Architectural, Schematic, Precise, Outline-based, Neon accents.

### Scheme C: Retro Terminal / Pixel Art (复古终端像素风)
> **Design Style**: Retro DOS Terminal, Pixel Art, 8-bit.
> **Scene**: A command-line visualization of token generation.
> **Visuals**:
> *   **Background**: Pure Black (`#000000`).
> *   **Typography**: Pixelated Bitmap Font (Green and Amber).
> *   **Layout**: Blocky, grid-aligned layout. "Draft Model" is a blue ASCII art box. "Target Model" is a purple ASCII art box.
> *   **Tokens**: Tokens are represented as solid blocks of color (Green/Red) with pixel text.
> *   **Progress**: A blocky progress bar at the bottom showing "KV Cache" status.
> *   **Vibe**: Nostalgic, Hacker Console, CLI, Monospaced, Grid-based.
