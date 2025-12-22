# Derivative Demo Guidelines

## 1. Project Specifics
- **Animation Logic**: 
    - Driven by `progress` state.
    - **Speed**: Extremely slow motion (80s per full cycle) for educational clarity.
    - **Math**: Uses `f(x)=sin(x)` and `f'(x)=cos(x)`.
- **Key Files**:
    - `src/components/DerivativeVis.vue`: Core logic. Now uses **KaTeX** inside SVG `<foreignObject>` for perfect coordinate alignment.
    - `scripts/record.js`: Captures 25s of the animation to focus on the first peak transition.

## 2. Math Implementation
- **Scale**: `SCALE_X = 240`, `SCALE_Y = 180`.
- **Labels**: All math expressions are rendered via `katex.renderToString`.
- **Alignment**: HTML labels are embedded within SVG using `<foreignObject>` to ensure they scale and position correctly within the 1920x1080 viewBox.

## 3. Recording
- Output: `video_records/derivative_demo.mp4`.
- The script records a 25s segment at 60fps.
- Viewport is 4K (3840x2160) downsampled to 1080p.