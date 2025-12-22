# Solar System Project Guidelines

## 1. 项目定位
本目录是 **Native SVG** 动画实现的参考范例。

## 2. 技术细节
- **动画引擎**: 不依赖第三方动画库，直接使用 Vue 响应式数据驱动 SVG 属性 (`d`, `transform`)。
- **状态管理**: 使用 Vue `ref/reactive` 实时计算行星坐标。
- **样式**: 全面使用 Tailwind CSS 类名，避免手写 CSS。

## 3. 录制接口实现
该项目实现了标准的录制协议：
- **全局对象**: `window.solarSystem`
- **控制方法**:
    - `step(timestamp)`: 强制渲染特定时间戳的帧。
    - `getDuration()`: 获取动画周期（用于计算总帧数）。

## 4. 开发工作流
- 修改动画逻辑 -> `src/components/SolarSystem.vue`
- 调整录制参数 -> `scripts/record.js`
- **验证**: 每次修改后，务必运行 `npm run record` 确保生成的视频无掉帧或错位。