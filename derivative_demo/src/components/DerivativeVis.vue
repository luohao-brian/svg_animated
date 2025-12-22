<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import katex from 'katex';

// ------------------------------------------------------------------
// 配置与常量 (逻辑坐标 1920x1080)
// ------------------------------------------------------------------
const WIDTH = 1920;
const HEIGHT = 1080;
const PADDING_X = 120; 

const GRAPH_1_CY = HEIGHT * 0.30; 
const GRAPH_2_CY = HEIGHT * 0.72; 

const SCALE_X = 240; 
const SCALE_Y = 180; 

const COLOR_FUNC = '#38bdf8'; 
const COLOR_DERIV = '#fb7185'; 
const COLOR_TANGENT = '#facc15'; 
const COLOR_DIFF = '#4ade80'; 
const COLOR_AXIS = '#94a3b8';

const progress = ref(0); 
const isPaused = ref(false);
const TOTAL_CYCLE = 2 * Math.PI + 0.5; 
const DURATION_MS = 20000; // 20s per cycle 

const f = (x) => Math.sin(x);
const df = (x) => Math.cos(x);

const toSvgX = (x) => PADDING_X + x * SCALE_X;
const toSvgY1 = (y) => GRAPH_1_CY - y * SCALE_Y;
const toSvgY2 = (y) => GRAPH_2_CY - y * SCALE_Y;

const renderMath = (latex) => {
  return katex.renderToString(latex, { throwOnError: false, displayMode: false });
};

// ------------------------------------------------------------------
// 计算几何属性
// ------------------------------------------------------------------
const pathSin = computed(() => {
  let d = `M ${toSvgX(0)} ${toSvgY1(f(0))}`;
  for (let x = 0; x <= 2.2 * Math.PI; x += 0.02) d += ` L ${toSvgX(x)} ${toSvgY1(f(x))}`;
  return d;
});

const pathCos = computed(() => {
  let d = `M ${toSvgX(0)} ${toSvgY2(df(0))}`;
  for (let x = 0; x <= 2.2 * Math.PI; x += 0.02) d += ` L ${toSvgX(x)} ${toSvgY2(df(x))}`;
  return d;
});

const currX = computed(() => progress.value);
const currY = computed(() => f(currX.value));
const currSlope = computed(() => df(currX.value));

const pX = computed(() => toSvgX(currX.value));
const pY = computed(() => toSvgY1(currY.value));
const qX = computed(() => toSvgX(currX.value));
const qY = computed(() => toSvgY2(currSlope.value));

const tangentLine = computed(() => {
  const len = 1.2;
  const x1 = currX.value - len;
  const x2 = currX.value + len;
  const y1 = currY.value - currSlope.value * len;
  const y2 = currY.value + currSlope.value * len;
  return { x1: toSvgX(x1), y1: toSvgY1(y1), x2: toSvgX(x2), y2: toSvgY1(y2) };
});

const triangle = computed(() => {
  const dx = 0.4;
  const dy = currSlope.value * dx;
  const xStart = pX.value;
  const yStart = pY.value;
  const xCorner = toSvgX(currX.value + dx);
  const yEnd = toSvgY1(currY.value + dy);
  return {
    path: `M ${xStart} ${yStart} L ${xCorner} ${yStart} L ${xCorner} ${yEnd} Z`,
    dxLabelX: (xStart + xCorner) / 2 - 15,
    dxLabelY: yStart + 10,
    dyLabelX: xCorner + 10,
    dyLabelY: (yStart + yEnd) / 2 - 15,
  };
});

// 使用双反斜杠进行 LaTeX 转义
const xTicks = computed(() => {
  const ticks = [];
  for (let i = 0; i <= 2.2 * Math.PI; i += Math.PI/2) {
    let label = '';
    const m = Math.round(i / (Math.PI/2));
    if (m === 0) label = '0';
    else if (m === 1) label = '\frac{\pi}{2}';
    else if (m === 2) label = '\pi';
    else if (m === 3) label = '\frac{3\pi}{2}';
    else if (m === 4) label = '2\pi';
    else label = `\frac{${m}\pi}{2}`;
    ticks.push({ x: toSvgX(i), label: renderMath(label) });
  }
  return ticks;
});

const yTicks = [-1, 0, 1];

// ------------------------------------------------------------------
// 动画控制
// ------------------------------------------------------------------
let animationFrameId;
let lastTimestamp = 0;
let accumulatedTime = 0;

const step = (timestamp) => {
  if (isPaused.value) return;
  if (!lastTimestamp) lastTimestamp = timestamp;
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  accumulatedTime = (accumulatedTime + deltaTime) % DURATION_MS;
  const t = accumulatedTime / DURATION_MS;
  progress.value = t * 2 * Math.PI;
};

const togglePause = () => {
  isPaused.value = !isPaused.value;
  if (!isPaused.value) lastTimestamp = 0; 
};

const loop = (timestamp) => {
  step(timestamp);
  animationFrameId = requestAnimationFrame(loop);
};

onMounted(() => {
  window.derivativeDemo = { 
    step: (manualT) => { 
      // 这里的 manualT 应该直接映射到进度，不受 DURATION_MS 重复影响
      progress.value = (manualT / DURATION_MS) * 2 * Math.PI; 
    }, 
    getDuration: () => DURATION_MS 
  };
  animationFrameId = requestAnimationFrame(loop);
});

onUnmounted(() => cancelAnimationFrame(animationFrameId));
</script>

<template>
  <div class="w-screen h-screen flex flex-col bg-slate-900 text-white overflow-hidden font-sans cursor-pointer relative" @click="togglePause">
    
    <!-- 顶部综合栏 -->
    <div class="flex-none h-24 flex items-center justify-between px-6 border-b border-slate-700 bg-slate-800/95 z-30 shadow-xl relative select-none" @click.stop>
      <div class="flex flex-col mr-6 whitespace-nowrap">
        <h1 class="text-2xl font-black tracking-wider text-white">导数与微分几何意义</h1>
        <p class="text-xs text-slate-400 mt-1 tracking-widest font-medium text-center">切线斜率、导数值与微分的实时关联</p>
      </div>

      <div class="flex gap-5 text-base font-bold bg-slate-900/50 px-5 py-2 rounded-xl border border-slate-700 items-center">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-sky-400 shadow-[0_0_8px_#38bdf8]"></div>
          <span v-html="renderMath('f(x)')"></span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-rose-400 shadow-[0_0_8px_#fb7185]"></div>
          <span v-html="renderMath('f\' (x)')"></span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-0.5 border-t-2 border-dashed border-yellow-400"></div>
          <span class="text-yellow-300">切线</span>
        </div>
      </div>

      <div class="flex-1 flex justify-end min-w-0 ml-4">
        <div class="flex items-center gap-4 bg-slate-900/90 px-5 py-2 rounded-xl border border-indigo-500/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
          <div class="flex flex-col items-center">
            <span class="text-[10px] text-slate-500 font-bold uppercase">当前 x</span>
            <span class="text-lg text-slate-300" v-html="renderMath('x = ' + currX.toFixed(2) + '')"></span>
          </div>
          <div class="h-8 w-px bg-slate-700 mx-1"></div>
          <div class="flex items-center gap-3">
             <div class="flex flex-col items-center">
               <span class="text-[10px] text-rose-500 font-bold uppercase">导数值</span>
               <span class="text-xl text-rose-400 font-bold" v-html="renderMath('f\' (x)')"></span>
             </div>
             <div class="text-slate-600 px-1">＝</div>
             <div class="flex flex-col items-center">
               <span class="text-[10px] text-slate-500 font-bold uppercase">计算公式</span>
               <span class="text-xl text-white" v-html="renderMath('\cos(x)')"></span>
             </div>
             <div class="text-slate-600 px-1">＝</div>
             <div class="flex flex-col items-center">
               <span class="text-[10px] text-yellow-500 font-bold uppercase">切线斜率</span>
               <span class="text-2xl text-yellow-400 font-black" v-html="renderMath('k = ' + currSlope.toFixed(3) + '')"></span>
             </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主容器 -->
    <div class="flex-1 relative w-full h-full overflow-hidden">
      <svg 
        :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" 
        class="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker id="arrow" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto">
            <path d="M2,2 L10,6 L2,10 L2,2 Z" :fill="COLOR_AXIS" />
          </marker>
        </defs>

        <g opacity="0.08">
          <line v-for="tick in xTicks" :key="'g-'+tick.x" :x1="tick.x" y1="0" :x2="tick.x" :y2="HEIGHT" :stroke="COLOR_AXIS" />
        </g>

        <!-- 图表 1 -->
        <g>
          <line :x1="PADDING_X" :y1="GRAPH_1_CY" :x2="WIDTH-100" :y2="GRAPH_1_CY" :stroke="COLOR_AXIS" stroke-width="3" marker-end="url(#arrow)" />
          <line :x1="toSvgX(0)" :y1="GRAPH_1_CY + SCALE_Y + 20" :x2="toSvgX(0)" :y2="50" :stroke="COLOR_AXIS" stroke-width="3" marker-end="url(#arrow)" />
          
          <foreignObject :x="WIDTH-100" :y="GRAPH_1_CY+5" width="50" height="50">
            <div class="text-slate-400 text-2xl font-bold" v-html="renderMath('x')"></div>
          </foreignObject>
          <foreignObject :x="toSvgX(0)-40" :y="30" width="50" height="50">
            <div class="text-slate-400 text-2xl font-bold" v-html="renderMath('y')"></div>
          </foreignObject>

          <!-- 刻度 -->
          <g v-for="tick in xTicks" :key="'tk1-'+tick.x">
            <line :x1="tick.x" :y1="GRAPH_1_CY" :x2="tick.x" :y2="GRAPH_1_CY+10" :stroke="COLOR_AXIS" stroke-width="2"/>
            <foreignObject :x="tick.x-40" :y="GRAPH_1_CY+15" width="80" height="50">
              <div class="text-center text-slate-400 text-lg" v-html="tick.label"></div>
            </foreignObject>
          </g>

          <foreignObject :x="toSvgX(0.2)" :y="toSvgY1(1.2)" width="300" height="60">
            <div class="text-sky-400 text-2xl font-black" v-html="renderMath('f(x) = \sin(x)')"></div>
          </foreignObject>

          <path :d="pathSin" fill="none" :stroke="COLOR_FUNC" stroke-width="8" stroke-linecap="round" />
          <line :x1="tangentLine.x1" :y1="tangentLine.y1" :x2="tangentLine.x2" :y2="tangentLine.y2" :stroke="COLOR_TANGENT" stroke-width="5" stroke-dasharray="12 6" opacity="0.9" />

          <!-- 三角形 -->
          <g>
            <path :d="triangle.path" :fill="COLOR_DIFF" fill-opacity="0.2" />
            <line :x1="pX" :y1="pY" :x2="toSvgX(currX+0.4)" :y2="pY" :stroke="COLOR_DIFF" stroke-width="3" />
            <line :x1="toSvgX(currX+0.4)" :y1="pY" :x2="toSvgX(currX+0.4)" :y2="toSvgY1(currY + currSlope*0.4)" :stroke="COLOR_DIFF" stroke-width="3" />
            <foreignObject :x="triangle.dxLabelX" :y="triangle.dxLabelY" width="60" height="40">
              <div class="text-green-400 text-xl font-bold" v-html="renderMath('dx')"></div>
            </foreignObject>
            <foreignObject :x="triangle.dyLabelX" :y="triangle.dyLabelY" width="60" height="40">
              <div class="text-green-400 text-xl font-bold" v-html="renderMath('dy')"></div>
            </foreignObject>
          </g>
          <circle :cx="pX" :cy="pY" r="12" fill="white" :stroke="COLOR_FUNC" stroke-width="6" />
          <foreignObject :x="pX-50" :y="pY-50" width="40" height="40">
            <div class="text-white text-2xl font-bold" v-html="renderMath('P')"></div>
          </foreignObject>
        </g>

        <!-- 视觉关联 -->
        <line :x1="pX" :y1="pY" :x2="qX" :y2="qY" stroke="white" stroke-width="2" stroke-dasharray="6 6" opacity="0.2" />
        <foreignObject :x="pX + 30" :y="(pY + qY)/2 - 35" width="220" height="70">
          <div class="bg-slate-800/90 border border-slate-600 rounded-xl flex items-center justify-center h-full">
            <div class="text-white text-2xl font-black" v-html="renderMath('k = ' + currSlope.toFixed(3) + '')"></div>
          </div>
        </foreignObject>

        <!-- 图表 2 -->
        <g>
          <line :x1="PADDING_X" :y1="GRAPH_2_CY" :x2="WIDTH-100" :y2="GRAPH_2_CY" :stroke="COLOR_AXIS" stroke-width="3" marker-end="url(#arrow)" />
          <line :x1="toSvgX(0)" :y1="HEIGHT-30" :x2="toSvgX(0)" :y2="GRAPH_2_CY - SCALE_Y - 30" :stroke="COLOR_AXIS" stroke-width="3" marker-end="url(#arrow)" />
          
          <foreignObject :x="WIDTH-100" :y="GRAPH_2_CY+5" width="50" height="50">
            <div class="text-slate-400 text-2xl font-bold" v-html="renderMath('x')"></div>
          </foreignObject>
          <foreignObject :x="toSvgX(0)-50" :y="GRAPH_2_CY - SCALE_Y - 60" width="50" height="50">
            <div class="text-slate-400 text-2xl font-bold" v-html="renderMath('y\'')"></div>
          </foreignObject>

          <g v-for="tick in xTicks" :key="'tk2-'+tick.x">
            <line :x1="tick.x" :y1="GRAPH_2_CY" :x2="tick.x" :y2="GRAPH_2_CY+10" :stroke="COLOR_AXIS" stroke-width="2"/>
            <foreignObject :x="tick.x-40" :y="GRAPH_2_CY+15" width="80" height="50">
              <div class="text-center text-slate-400 text-lg" v-html="tick.label"></div>
            </foreignObject>
          </g>

          <foreignObject :x="toSvgX(0.2)" :y="GRAPH_2_CY + SCALE_Y - 20" width="300" height="60">
            <div class="text-rose-400 text-2xl font-black" v-html="renderMath('f\' (x) = \cos(x)')"></div>
          </foreignObject>

          <path :d="pathCos" fill="none" :stroke="COLOR_DERIV" stroke-width="8" stroke-linecap="round" />
          <circle :cx="qX" :cy="qY" r="12" fill="white" :stroke="COLOR_DERIV" stroke-width="6" />
          <foreignObject :x="qX+20" :y="qY-40" width="40" height="40">
            <div class="text-white text-2xl font-bold" v-html="renderMath('Q')"></div>
          </foreignObject>
          <line :x1="qX" :y1="qY" :x2="toSvgX(0)" :y2="qY" :stroke="COLOR_DERIV" stroke-width="1.5" stroke-dasharray="5 5" opacity="0.5" />
        </g>
      </svg>
    </div>
  </div>
</template>