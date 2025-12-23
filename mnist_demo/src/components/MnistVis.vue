<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import anime from 'animejs';

// ------------------------------------------------------------------
// 1. Config & Constants
// ------------------------------------------------------------------
const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION_MS = 45000; 

const C = {
  bg: '#020617',
  gridOn: '#38bdf8',
  nodeIdle: '#1e293b',
  nodeActive: '#818cf8',
  link: '#1e293b',
  loss: '#ff4d00', 
  success: '#10b981', 
  pulseFWD: '#00f2ff', 
  text: '#94a3b8'
};

const GRID_X = 100; 
const GRID_Y = HEIGHT / 2 - 140;
const NET_START_X = 420; 

// ------------------------------------------------------------------
// 2. Patterns
// ------------------------------------------------------------------
const P = {
  P5: [30,31,32,33,34,35, 44, 58, 72,73,74,75,76, 90, 104, 118, 132, 146, 145,144,143,142],
  P3: [30,31,32,33,34,35, 49, 63, 77,76,75,74, 91, 105, 119, 133, 132,131,130,129],
  P8: [31,32,33,34, 44,48, 58,62, 73,74,75, 86,90, 100,104, 115,116,117,118],
  P7: [16,17,18,19,20,21, 35, 49, 63, 77, 91, 105, 119]
};

// ------------------------------------------------------------------
// 3. Reactive State
// ------------------------------------------------------------------
const progress = ref(0);
const metrics = ref({ epoch: 0, accuracy: 10.0, loss: 2.3 });
const prediction = ref({ label: '?', prob: 0 });
const showResult = ref(false);
const subtitle = ref('');
const grid = ref(Array(14 * 14).fill(0));
const gridScales = ref(Array(14 * 14).fill(1));

const layers = ref([
  { id: 'input', label: '输入层', count: 40, x: NET_START_X, nodes: [] },
  { id: 'h1', label: '隐藏层 1', count: 28, x: NET_START_X + 260, nodes: [] },
  { id: 'h2', label: '隐藏层 2', count: 20, x: NET_START_X + 520, nodes: [] },
  { id: 'h3', label: '隐藏层 3', count: 14, x: NET_START_X + 760, nodes: [] },
  { id: 'output', label: '输出层', count: 10, x: NET_START_X + 1000, nodes: [] }
]);

layers.value.forEach(layer => {
  const step = 600 / layer.count;
  const startY = (HEIGHT - (layer.count - 1) * step) / 2;
  layer.nodes = Array.from({ length: layer.count }, (_, i) => ({
    id: `${layer.id}-${i}`, x: layer.x, y: startY + i * step, active: 0, val: 0, scale: 1
  }));
});

const connections = computed(() => {
  const links = [];
  for (let i = 0; i < layers.value.length - 1; i++) {
    const curr = layers.value[i];
    const next = layers.value[i + 1];
    curr.nodes.forEach((n1, idx1) => {
      next.nodes.forEach((n2, idx2) => {
        if ((idx1 + idx2) % 3 === 0) {
          links.push({ id: `link-${i}-${idx1}-${idx2}`, x1: n1.x, y1: n1.y, x2: n2.x, y2: n2.y, layerIdx: i });
        }
      });
    });
  }
  return links;
});

// ------------------------------------------------------------------
// 4. Animation Logic
// ------------------------------------------------------------------
let tl = null;

const setGridSync = (pattern) => {
  grid.value.fill(0);
  pattern.forEach(idx => {
    grid.value[idx] = 1;
    gridScales.value[idx] = 1.5;
    anime({ targets: gridScales.value, [idx]: 1, duration: 400, easing: 'easeOutQuad' });
  });
};

const initTimeline = () => {
  if (tl) tl.pause();
  tl = anime.timeline({
    autoplay: true,
    duration: DURATION_MS,
    easing: 'linear',
    update: (anim) => { progress.value = (anim.currentTime / DURATION_MS) * 100; }
  });

  // --- Phase 1: Data Building (0-8s) ---
  tl.add({ targets: {}, update: () => { subtitle.value = '【数据准备】加载并预处理 MNIST 原始手写图像数据集'; }, duration: 1000 }, 0);
  P.P5.forEach((idx, i) => {
    tl.add({ targets: {}, update: () => { grid.value[idx] = 1; anime({ targets: gridScales.value, [idx]: [0, 1.5, 1], duration: 600 }); }, duration: 50 }, 1500 + i * 150);
  });
  tl.add({ targets: {}, update: () => { subtitle.value = '【特征转换】构建 14x14 归一化输入张量'; }, duration: 1000 }, 6000);

  // --- Phase 2: Train Iteration 1 (8s - 22s) ---
  tl.add({ targets: {}, update: () => { subtitle.value = '【前向传播】输入特征在网络中逐层传递，计算初步概率分布'; }, duration: 1000 }, 8000);
  [0, 1, 2, 3].forEach((lIdx, i) => {
    const start = 9000 + i * 2200; 
    tl.add({ targets: `.link-layer-${lIdx}`, stroke: [C.link, C.pulseFWD, C.link], strokeWidth: [1, 20, 1], strokeDasharray: ['150 1000'], strokeDashoffset: [600, -600], opacity: [0.1, 1, 0.1], duration: 2500, easing: 'easeInOutQuad' }, start);
    tl.add({ targets: layers.value[lIdx+1].nodes, active: 1, scale: [1, 1.8, 1], duration: 1000 }, start + 1500);
  });
  tl.add({ targets: layers.value[4].nodes, val: (el, i) => i === 3 ? 0.75 : (i === 5 ? 0.15 : 0.02), duration: 1200 }, 18500);
  tl.add({ targets: {}, update: () => { subtitle.value = '【反向传播】通过损失函数计算梯度，逆向修正各层权重系数'; }, duration: 1000 }, 20000);
  [3, 2, 1].forEach((lIdx, i) => {
    const start = 21000 + i * 1800;
    tl.add({ targets: `.link-layer-${lIdx}`, stroke: [C.link, C.loss, C.link], strokeWidth: [1, 25, 1], strokeDasharray: ['180 1000'], strokeDashoffset: [-600, 600], opacity: [0.1, 1, 0.1], duration: 2500, easing: 'easeInOutQuad' }, start);
  });
  tl.add({ targets: metrics.value, epoch: [0, 800], loss: [2.3, 1.15], accuracy: [10.0, 55.0], duration: 18000, easing: 'linear' }, 8000);

  // --- Phase 3: Iteration 2 (28s - 38s) ---
  tl.add({ targets: {}, update: () => { setGridSync(P.P8); subtitle.value = '【持续训练】输入数字 "8"。权重参数已根据之前的误差进行了优化修正'; }, duration: 1000 }, 28000);
  [0, 1, 2, 3].forEach((lIdx, i) => {
    const start = 29500 + i * 1000;
    tl.add({ targets: `.link-layer-${lIdx}`, stroke: [C.link, C.success, C.link], strokeWidth: [1, 12, 1], strokeDasharray: ['100 1000'], strokeDashoffset: [500, -500], opacity: [0.1, 1, 0.1], duration: 1200 }, start);
  });
  tl.add({ targets: layers.value[4].nodes, val: (el, i) => i === 8 ? 0.95 : 0.02, duration: 1000 }, 33500);
  tl.add({ targets: {}, update: () => { subtitle.value = '【收敛过程】参数矩阵趋于稳定，系统识别精度已达 99% 以上'; }, duration: 1000 }, 34500);
  [3, 2, 1].forEach((lIdx, i) => {
    const start = 35000 + i * 1000;
    tl.add({ targets: `.link-layer-${lIdx}`, stroke: [C.link, '#fff', C.link], strokeWidth: [1, 15, 1], strokeDasharray: ['120 1000'], strokeDashoffset: [-500, 500], opacity: [0.1, 1, 0.1], duration: 1200 }, start);
  });
  tl.add({ targets: metrics.value, epoch: [800, 5000], loss: [1.15, 0.0018], accuracy: [55.0, 99.5], duration: 10000, easing: 'linear' }, 28000);

  // --- Phase 4: Final Inference (40s - 45s) ---
  tl.add({ targets: {}, update: () => { setGridSync(P.P7); subtitle.value = '【推理验证】输入新样本 "7"。系统基于已学到的特征做出快速决策'; }, duration: 1000 }, 39500);
  [0, 1, 2, 3].forEach((lIdx, i) => {
    const start = 40500 + i * 700;
    tl.add({ targets: `.link-layer-${lIdx}`, stroke: [C.link, '#fff', C.link], strokeWidth: [1, 15, 1], strokeDasharray: ['200 1000'], strokeDashoffset: [800, -800], opacity: [0.1, 1, 0.1], duration: 1200 }, start);
    tl.add({ targets: layers.value[lIdx+1].nodes, active: 1, duration: 400 }, start + 600);
  });

  tl.add({ 
    targets: layers.value[4].nodes, 
    val: (el, i) => i === 7 ? 0.924 : (i === 1 ? 0.042 : (i === 9 ? 0.021 : 0.005)), // More realistic softmax
    duration: 1000 
  }, 43000)
    .add({ targets: prediction.value, update: () => { showResult.value = true; prediction.value.label = '7'; } }, 43500);
};

onMounted(() => {
  window.mnistDemo = { step: (t) => tl.seek(t), getDuration: () => DURATION_MS, setPaused: (p) => { if(p) tl.pause(); else tl.play(); } };
  initTimeline();
});
</script>

<template>
  <div class="relative w-full h-full bg-[#020617] select-none overflow-hidden text-slate-200" style="font-family: SimHei, 'Microsoft YaHei', sans-serif;">
    <!-- Top Bar -->
    <div class="absolute top-0 left-0 w-full h-24 flex items-center justify-between px-12 border-b border-white/5 z-20 bg-slate-950/90 backdrop-blur-3xl">
      <div class="flex items-center gap-10">
        <div class="w-2 h-12 bg-indigo-500 rounded-full shadow-[0_0_30px_rgba(99,102,241,0.8)]"></div>
        <div>
          <h1 class="text-2xl font-black tracking-[0.2em] text-white uppercase">MNIST CORE</h1>
          <p class="text-[9px] text-slate-500 font-mono tracking-[0.4em] uppercase">Deep Learning Lab / Node v4.9.2</p>
        </div>
      </div>
      <div class="flex gap-16 font-mono">
        <div v-for="(v, k) in { '训练轮数': Math.floor(metrics.epoch), '损失函数': metrics.loss.toFixed(4), '准确率': metrics.accuracy.toFixed(1) + '%' }" :key="k" class="flex flex-col items-end min-w-[120px]">
          <span class="text-[10px] text-slate-500 uppercase tracking-widest mb-1">{{ k }}</span>
          <span :class="['text-3xl font-black tabular-nums', k === '损失函数' ? 'text-rose-500' : (k === '准确率' ? 'text-emerald-400' : 'text-white')]">{{ v }}</span>
        </div>
      </div>
    </div>

    <!-- Graphics Area -->
    <svg :viewBox="`0 0 ${WIDTH} ${HEIGHT}`" class="w-full h-full absolute inset-0">
      <g opacity="0.02"><line v-for="l in connections" :key="l.id" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" stroke="#475569" stroke-width="0.5" /></g>
      <g opacity="0.4"><text v-for="layer in layers" :key="layer.id" :x="layer.x" y="160" text-anchor="middle" fill="#94a3b8" font-size="14" font-weight="900">{{ layer.label }}</text></g>
      <g><line v-for="l in connections" :key="'energy-'+l.id" :x1="l.x1" :y1="l.y1" :x2="l.x2" :y2="l.y2" stroke="transparent" stroke-width="1" :class="`link-layer-${l.layerIdx}`" stroke-linecap="round" /></g>
      <g v-for="layer in layers" :key="layer.id">
        <circle v-for="node in layer.nodes" :key="node.id" :cx="node.x" :cy="node.y" :r="layer.id === 'input' ? 3 : (layer.id === 'output' ? 22 : 8)" :fill="node.active > 0.1 ? C.nodeActive : C.nodeIdle" :opacity="layer.id === 'input' ? 0.1 : 1" :style="{ transform: `scale(${node.scale})` }" class="transition-all duration-500 origin-center" />
        <text v-if="layer.id === 'output'" v-for="(node, i) in layer.nodes" :key="'out-lbl-'+i" :x="node.x" :y="node.y" text-anchor="middle" dominant-baseline="central" fill="white" font-size="16" font-weight="black" class="pointer-events-none">{{ i }}</text>
      </g>
      <g :transform="`translate(${layers[4].x + 100}, 0)`">
        <g v-for="(node, i) in layers[4].nodes" :key="'out-bar-'+i" :transform="`translate(0, ${node.y})`">
          <rect x="0" y="-12" width="200" height="24" rx="6" fill="#111827" />
          <rect x="0" y="-12" :width="Math.max(0, node.val * 200)" height="24" rx="6" :fill="node.val > 0.85 ? C.success : (node.val > 0.4 ? '#eab308' : '#6366f1')" class="transition-all duration-300" />
          <text :x="220" y="6" fill="#fff" font-size="16" font-family="monospace" font-weight="black">{{ (node.val * 100).toFixed(1) }}%</text>
        </g>
      </g>
    </svg>

    <!-- Matrix with Balanced Contrast Grid -->
    <div class="absolute" :style="`left: ${GRID_X}px; top: ${GRID_Y}px; width: 340px; height: 340px` ">
      <div class="w-full h-full grid grid-cols-14 gap-1 p-4 bg-slate-950/20 rounded-[2rem] border border-white/[0.03] backdrop-blur-sm shadow-xl overflow-hidden">
        <!-- FIXED: Accurate Single-Loop Grid -->
        <div class="absolute inset-0 grid grid-cols-14 gap-1 p-4 pointer-events-none">
            <div v-for="i in 196" :key="'grid-line-'+i" class="border border-slate-700/40 rounded-[1px]"></div>
        </div>
        <!-- Active Pixels -->
        <div v-for="(cell, i) in grid" :key="'active-'+i" class="rounded-sm transition-all duration-500 z-10" :style="{ transform: `scale(${gridScales[i]})` }" :class="cell ? 'bg-sky-400 shadow-[0_0_20px_#38bdf8]' : 'bg-transparent'"></div>
      </div>
      <div class="text-center mt-8 text-sky-500/10 font-mono text-[9px] tracking-[0.6em] uppercase">Matrix Entry Pool</div>
    </div>
    
    <div class="absolute bottom-8 left-[420px] right-48 z-40 flex justify-center pointer-events-none">
        <transition name="fade" mode="out-in"><div :key="subtitle" class="px-10 py-4"><p class="text-xl text-slate-400 font-bold tracking-widest text-center drop-shadow-sm">{{ subtitle }}</p></div></transition>
    </div>

    <div v-if="showResult" class="absolute top-[25%] right-24 z-30">
      <div class="flex flex-col items-center bg-slate-950/80 px-8 py-6 rounded-[2.5rem] border border-emerald-500/30 shadow-2xl animate-bounce-in backdrop-blur-xl">
        <div class="text-emerald-400 text-[9px] font-black tracking-[0.4em] mb-3 uppercase">Classified</div>
        <div class="text-[6rem] font-black text-white leading-none">{{ prediction.label }}</div>
      </div>
    </div>
    <div class="absolute bottom-0 left-0 h-1.5 bg-indigo-600/50" :style="{ width: `${progress}%` }"></div>
  </div>
</template>

<style scoped>
.animate-bounce-in { animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes bounceIn { 0% { transform: scale(0.5); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.fade-enter-active, .fade-leave-active { transition: all 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>