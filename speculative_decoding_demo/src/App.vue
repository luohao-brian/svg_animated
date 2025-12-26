<script setup>
import { onMounted, ref } from 'vue'
import anime from 'animejs'

const tl = ref(null)
const currentSubtitle = ref('准备就绪...')

onMounted(() => {
  // Initialize Timeline
  tl.value = anime.timeline({
    autoplay: true,
    easing: 'linear'
  })

  // ============================================================
  // SCENE 01: Intro (Prefill vs Decode)
  // ============================================================
  tl.value
    .add({
      targets: '.scene-01',
      opacity: 1,
      duration: 500,
      begin: () => currentSubtitle.value = '大模型有两种模式：阅读模式（并行/极快） vs 写作模式（串行/极慢）。'
    })
    // Left: Prefill (Instant)
    .add({
      targets: '#prefill-text',
      opacity: [0, 1],
      duration: 100, // Instant
      easing: 'linear'
    })
    // Right: Decode (Typewriter)
    .add({
      targets: '.decode-char',
      opacity: [0, 1],
      duration: 50,
      delay: anime.stagger(150), // Slow typing
      begin: () => {
        // Optional: play typing sound logic here
      }
    })
    .add({
      targets: '.scene-01',
      opacity: 0,
      duration: 800,
      delay: 2000 // Read time
    })

  // ============================================================
  // SCENE 02: The Bottleneck (Truck Analogy)
  // ============================================================
    .add({
      targets: '.scene-02',
      opacity: 1,
      duration: 500,
      begin: () => currentSubtitle.value = '为了写一个字，主编（大模型）要把 26GB 的字典搬运一遍。'
    })
    // Trip 1: "The"
    .add({
      targets: '#truck-02',
      translateX: ['-100%', '0%'],
      duration: 2500,
      easing: 'easeOutQuad'
    })
    .add({
      targets: '#envelope-02-1',
      opacity: [0, 1],
      translateY: [0, 50],
      duration: 500,
      easing: 'easeOutBounce',
      begin: () => currentSubtitle.value = 'Word 1: "The" (26GB 搬运完成)'
    })
    .add({
      targets: '#truck-02',
      translateX: ['0%', '150%'], // Truck leaves
      duration: 1500,
      easing: 'easeInQuad',
      delay: 500
    })
    // Trip 2: "cat"
    .add({
      targets: '#truck-02',
      translateX: ['-100%', '0%'], // Truck returns
      duration: 2500,
      easing: 'easeOutQuad',
      begin: () => currentSubtitle.value = 'Word 2: "cat" (又是 26GB...)'
    })
    .add({
      targets: '#envelope-02-2',
      opacity: [0, 1],
      translateY: [0, 50],
      duration: 500,
      easing: 'easeOutBounce'
    })
    .add({
      targets: '#truck-02',
      translateX: ['0%', '150%'],
      duration: 1500,
      easing: 'easeInQuad',
      delay: 500
    })
    // Trip 3: "sat"
    .add({
      targets: '#truck-02',
      translateX: ['-100%', '0%'], // Truck returns again
      duration: 2500,
      easing: 'easeOutQuad',
      begin: () => currentSubtitle.value = 'Word 3: "sat" (传统的串行解码，极其低效！)'
    })
    .add({
      targets: '#envelope-02-3',
      opacity: [0, 1],
      translateY: [0, 50],
      duration: 500,
      easing: 'easeOutBounce'
    })
    .add({
      targets: '.scene-02',
      opacity: 0,
      duration: 800,
      delay: 3000 // Pause to let it sink in
    })

  // ============================================================
  // SCENE 03: The Solution (Drafting)
  // ============================================================
    .add({
      targets: '.scene-03',
      opacity: 1,
      duration: 500,
      begin: () => currentSubtitle.value = '解决方案：采用【协作模式】。'
    })
    // Intern AND Editor appear
    .add({
      targets: ['#intern-03', '#editor-03'],
      opacity: [0, 1],
      scale: [0, 1],
      duration: 1000,
      easing: 'easeOutBack',
      begin: () => currentSubtitle.value = '主编（大模型）暂停生成并待命，由实习生（小模型）接手快速草拟。'
    })
    // Throw 4 envelopes fast
    .add({
      targets: '.draft-envelope',
      opacity: [0, 1],
      translateX: ['-50%', '0%'], // From intern to stream
      translateY: [20, 0],
      delay: anime.stagger(300), // Slower stagger
      duration: 800,
      easing: 'easeOutBack',
      begin: () => currentSubtitle.value = '实习生快速扔出 4 个草稿：stared at the broken'
    })
    .add({
      targets: '.scene-03',
      duration: 3000 // Wait
    })
    // Keep scene 03 visible as we transition to 04 (Truck enters same space)

  // ============================================================
  // SCENE 04: Verification (Mode Switch)
    // ============================================================
    .add({
      targets: '#truck-04', // Truck re-enters in the background of scene 03 context
      opacity: [0, 1],
      left: ['0%', '50%'],
      translateX: ['-100%', '-50%'],
      duration: 2000, // Slower
      easing: 'easeOutQuad',
      begin: () => currentSubtitle.value = '主编回归：一次搬运，同时并行检查所有草稿！'
    })
    // Beam
    .add({
      targets: '#scan-beam-04',
      scaleX: [0, 1],
      opacity: [0, 0.8],
      duration: 1500, // Slower scan
      easing: 'easeOutExpo'
    })
    // Parallel check emphasis
    .add({
        targets: '.draft-envelope',
        borderColor: '#22c55e', // Green border
        backgroundColor: 'rgba(34, 197, 94, 0.2)', // Green bg
        scale: 1.2,
        duration: 500,
        delay: anime.stagger(100), // Very fast ripple
        begin: () => currentSubtitle.value = '通过！通过！通过！并行验证效率极高。'
    })
    // Replaced mode switch text with simple wait + subtitle
    .add({
      targets: '.scene-04', // Dummy target or container
      duration: 800,
      begin: () => currentSubtitle.value = '切换到【阅读模式】：效率提升数倍。'
    })
    .add({
      targets: ['.scene-03', '#truck-04', '#scan-beam-04'], // Clear all (removed #mode-switch-text)
      opacity: 0,
      duration: 800,
      delay: 3000
    })

  // ============================================================
  // SCENE 05: Probability Game (Accept)
  // ============================================================
    .add({
      targets: '.scene-05',
      opacity: 1,
      duration: 10,
      begin: () => currentSubtitle.value = '主编玩的是概率博弈。Token: "apple"'
    })
    // Bars grow
    .add({
      targets: '#bar-05-draft',
      height: ['0%', '60%'],
      duration: 800,
      easing: 'easeOutQuad',
      begin: () => currentSubtitle.value = '实习生把握 60%...'
    })
    .add({
      targets: '#bar-05-target',
      height: ['0%', '80%'],
      duration: 800,
      easing: 'easeOutQuad',
      begin: () => currentSubtitle.value = '主编把握 80%。主编更确信，通过！'
    })
    // Stamp
    .add({
      targets: '#stamp-accept',
      opacity: [0, 1],
      scale: [2, 1],
      rotate: [-30, -10],
      duration: 300,
      easing: 'easeOutBounce'
    })
    .add({
      targets: '.scene-05',
      opacity: 0,
      duration: 800,
      delay: 4000
    })

  // ============================================================
  // SCENE 06: Rejection & Resample
  // ============================================================
    .add({
      targets: '.scene-06',
      opacity: 1,
      duration: 10,
      begin: () => currentSubtitle.value = 'Token: "pear"。实习生瞎猜 99% (过度自信)。'
    })
    // Bars
    .add({
      targets: '#bar-06-draft',
      height: ['0%', '99%'],
      duration: 500,
      easing: 'easeOutQuad'
    })
    .add({
      targets: '#bar-06-target',
      height: ['0%', '10%'],
      duration: 500,
      easing: 'easeOutQuad',
      begin: () => currentSubtitle.value = '主编觉得只有 10%。为了保质量，必须拒绝并重写。'
    })
    // Stamp Reject
    .add({
      targets: '#stamp-reject',
      opacity: [0, 1],
      scale: [2, 1],
      duration: 300,
      easing: 'easeOutBounce'
    })
    // Show Formula
    .add({
      targets: '#resample-formula',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 1000,
      easing: 'easeOutExpo',
      begin: () => currentSubtitle.value = '主编使用修正公式：P\'(x) = norm(max(0, p - q))'
    })
    // Erase "pear" (Wipe effect)
    .add({
      targets: '#text-pear-container',
      width: ['100%', '0%'],
      duration: 2000,
      easing: 'easeInOutQuad',
      begin: () => currentSubtitle.value = '擦除错误 Token (Rollback)...'
    })
    // KV Cache Erase (Sync with Wipe)
    .add({
      targets: '#kv-pear',
      backgroundColor: '#ef4444', // Red
      borderColor: '#ef4444',
      duration: 200,
      easing: 'linear'
    }, '-=2000')
    .add({
      targets: '#kv-pear',
      width: 0,
      opacity: 0,
      marginRight: 0,
      duration: 400,
      easing: 'easeOutExpo'
    }, '-=1000')
    // Reassemble "peach"
    .add({
      targets: '#text-peach',
      opacity: [0, 1],
      scale: [0.5, 1],
      filter: ['blur(10px)', 'blur(0px)'],
      duration: 800,
      easing: 'easeOutExpo',
      begin: () => currentSubtitle.value = '重采样：修正为 "peach"。'
    })
    // KV Cache Append (Sync with Reassemble)
    .add({
      targets: '#kv-peach',
      width: '4rem', // w-16
      opacity: 1,
      duration: 600,
      easing: 'easeOutBack'
    }, '-=600')
    .add({
      targets: '.scene-06',
      opacity: 0,
      duration: 800,
      delay: 6000
    })

  // ============================================================
  // SCENE 07: Value Scenario A (Coding)
  // ============================================================
    .add({
      targets: '.scene-07',
      opacity: 1,
      duration: 10,
      begin: () => currentSubtitle.value = '写代码（简单场景）：实习生几乎全对...'
    })
    // Code scroll
    .add({
      targets: '#code-content',
      translateY: ['0%', '-50%'],
      duration: 2000,
      easing: 'linear'
    })
    // Speedometer
    .add({
      targets: '#needle-07',
      rotate: [-90, 90], // Max speed
      duration: 1500,
      easing: 'easeOutElastic',
      begin: () => currentSubtitle.value = '速度直接 5 倍起飞！'
    })
    .add({
      targets: '.scene-07',
      opacity: 0,
      duration: 800,
      delay: 1500
    })

  // ============================================================
  // SCENE 08: Value Scenario B (Creative)
  // ============================================================
    .add({
      targets: '.scene-08',
      opacity: 1,
      duration: 10,
      begin: () => currentSubtitle.value = '写小说（困难场景）：虽然常被拒...'
    })
    // Typing
    .add({
      targets: '#novel-text',
      width: ['0%', '100%'],
      duration: 3000,
      easing: 'steps(30)'
    })
    // Speedometer
    .add({
      targets: '#needle-08',
      rotate: [-90, 0], // Medium speed
      duration: 2000,
      easing: 'easeOutElastic',
      begin: () => currentSubtitle.value = '但稳赚不赔，依然有 1.5 倍加速。'
    })
    .add({
      targets: '.scene-08',
      opacity: 0,
      duration: 800,
      delay: 2000
    })

  // ============================================================
  // SCENE 09: Grand Summary
  // ============================================================
    .add({
      targets: '.scene-09',
      opacity: 1,
      duration: 10,
      begin: () => currentSubtitle.value = '投机解码：用计算换带宽，用概率保质量。'
    })
    .add({
      targets: '.summary-icon',
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(300),
      duration: 800
    })
    .add({
      targets: '#final-text',
      scale: [0, 1],
      opacity: [0, 1],
      duration: 1000,
      easing: 'spring(1, 80, 10, 0)',
      begin: () => currentSubtitle.value = '显存没变，速度起飞！'
    })

  // Expose control for recording
  window.speculative_decoding_demo = {
    step: (timestamp) => {
      if (tl.value) tl.value.seek(timestamp)
    },
    getDuration: () => {
      return tl.value ? tl.value.duration : 0
    },
    setPaused: (paused) => {
      if (paused && tl.value) tl.value.pause()
    }
  }
})
</script>

<template>
  <div class="w-full h-full bg-slate-900 text-white overflow-hidden relative font-mono select-none">
    
    <!-- Navbar -->
    <div class="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
      <div class="text-xl font-bold tracking-wider text-blue-400">SPECULATIVE DECODING (投机解码)</div>
      <div class="text-sm text-slate-400">Demo v2.0</div>
    </div>

    <!-- Subtitle Area -->
    <div class="absolute bottom-8 left-0 w-full flex justify-center z-50 px-8">
      <div class="bg-slate-900/90 border border-slate-600 px-8 py-4 rounded-xl shadow-2xl backdrop-blur text-center max-w-4xl">
         <p class="text-xl md:text-2xl text-yellow-400 font-bold tracking-wide leading-relaxed">{{ currentSubtitle }}</p>
      </div>
    </div>

    <!-- SCENE 01: Intro (Prefill vs Decode) -->
    <div class="scene-01 absolute inset-0 flex opacity-0">
      <!-- Left: Prefill -->
      <div class="w-1/2 h-full border-r border-slate-700 flex flex-col items-center justify-center bg-slate-800/30">
        <h2 class="text-2xl text-blue-400 mb-8 font-bold">阅读模式 (Prefill)</h2>
        <div id="prefill-text" class="text-xl text-slate-300 p-8 border border-blue-500/30 rounded bg-blue-900/10 w-3/4 opacity-0">
          The quick brown fox jumps over the lazy dog.
          <div class="mt-4 text-sm text-blue-500">并行计算 (Parallel)</div>
        </div>
      </div>
      <!-- Right: Decode -->
      <div class="w-1/2 h-full flex flex-col items-center justify-center">
        <h2 class="text-2xl text-purple-400 mb-8 font-bold">写作模式 (Decoding)</h2>
        <div class="text-xl text-slate-300 p-8 border border-purple-500/30 rounded bg-purple-900/10 w-3/4 flex flex-wrap">
          <span class="decode-char opacity-0">T</span>
          <span class="decode-char opacity-0">h</span>
          <span class="decode-char opacity-0">e</span>
          <span class="decode-char opacity-0">&nbsp;</span>
          <span class="decode-char opacity-0">q</span>
          <span class="decode-char opacity-0">u</span>
          <span class="decode-char opacity-0">i</span>
          <span class="decode-char opacity-0">c</span>
          <span class="decode-char opacity-0">k</span>
          <div class="w-full mt-4 text-sm text-purple-500">串行计算 (Serial)</div>
        </div>
      </div>
    </div>

    <!-- SCENE 02: Bottleneck (Truck) -->
    <div class="scene-02 absolute inset-0 flex flex-col items-center justify-center opacity-0">
      <div class="text-3xl mb-24 text-slate-300">The Bandwidth Bottleneck</div>
      
      <div class="relative w-full max-w-4xl h-40 border-b-2 border-slate-600 flex items-end pb-2">
        <!-- Truck -->
        <div id="truck-02" class="absolute left-0 bottom-2 w-48 h-24 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg z-20">
           <span class="text-white font-bold text-lg">26GB W</span>
           <!-- Wheels -->
           <div class="absolute -bottom-4 left-4 w-8 h-8 bg-black rounded-full border-2 border-gray-500"></div>
           <div class="absolute -bottom-4 right-4 w-8 h-8 bg-black rounded-full border-2 border-gray-500"></div>
        </div>

        <!-- Envelopes -->
        <div id="envelope-02-1" class="absolute left-1/4 transform -translate-x-1/2 bottom-10 w-12 h-8 bg-white text-slate-900 text-xs flex items-center justify-center font-bold rounded shadow opacity-0 z-10">
           The
        </div>
        <div id="envelope-02-2" class="absolute left-1/2 transform -translate-x-1/2 bottom-10 w-12 h-8 bg-white text-slate-900 text-xs flex items-center justify-center font-bold rounded shadow opacity-0 z-10">
           cat
        </div>
        <div id="envelope-02-3" class="absolute left-3/4 transform -translate-x-1/2 bottom-10 w-12 h-8 bg-white text-slate-900 text-xs flex items-center justify-center font-bold rounded shadow opacity-0 z-10">
           sat
        </div>
      </div>
    </div>

    <!-- SCENE 03: Drafting (Intern) -->
    <div class="scene-03 absolute inset-0 flex flex-col items-center justify-center opacity-0 z-10">
      <div class="absolute top-1/4 left-1/4">
         <!-- Intern -->
         <div id="intern-03" class="flex flex-col items-center opacity-0">
            <div class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl">👷</div>
            <div class="mt-2 text-blue-300 font-bold">实习生</div>
         </div>
      </div>

      <!-- Editor Waiting -->
      <div class="absolute top-1/4 right-1/4">
         <div id="editor-03" class="flex flex-col items-center opacity-0">
            <div class="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center text-2xl">☕</div>
            <div class="mt-2 text-purple-300 font-bold">主编(待命)</div>
         </div>
      </div>

      <!-- Draft Envelopes Stream -->
      <div class="flex space-x-4 mt-12 ml-32">
        <div class="draft-envelope w-20 h-12 bg-blue-500/20 border border-blue-400 text-blue-200 flex items-center justify-center rounded opacity-0">stared</div>
        <div class="draft-envelope w-20 h-12 bg-blue-500/20 border border-blue-400 text-blue-200 flex items-center justify-center rounded opacity-0">at</div>
        <div class="draft-envelope w-20 h-12 bg-blue-500/20 border border-blue-400 text-blue-200 flex items-center justify-center rounded opacity-0">the</div>
        <div class="draft-envelope w-20 h-12 bg-blue-500/20 border border-blue-400 text-blue-200 flex items-center justify-center rounded opacity-0">broken</div>
      </div>
    </div>

    <!-- SCENE 04: Verification (Truck + Beam) -->
    <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
       <!-- Truck with Road (Bottom positioned to avoid overlap with Scene 03 center/top elements) -->
       <div class="absolute bottom-24 w-full flex justify-center">
          <div class="relative w-full max-w-4xl h-40 border-b-2 border-slate-600 flex items-end pb-2">
              <!-- Truck 04 -->
              <div id="truck-04" class="absolute left-1/2 transform -translate-x-1/2 bottom-2 w-48 h-24 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg opacity-0 z-20">
                 <span class="text-white font-bold text-lg">Target</span>
                 <!-- Wheels -->
                 <div class="absolute -bottom-4 left-4 w-8 h-8 bg-black rounded-full border-2 border-gray-500"></div>
                 <div class="absolute -bottom-4 right-4 w-8 h-8 bg-black rounded-full border-2 border-gray-500"></div>
              </div>
              <!-- Beam -->
              <div id="scan-beam-04" class="absolute left-1/2 top-0 h-full bg-purple-500/30 origin-left opacity-0 z-10"></div>
          </div>
       </div>
    </div>

    <!-- SCENE 05: Accept -->
    <div class="scene-05 absolute inset-0 flex flex-col items-center justify-center opacity-0">
       <div class="text-3xl mb-12 text-slate-300">Probability Check: "apple"</div>
       <div class="flex items-end space-x-16 h-80 border-b-2 border-slate-600 px-12">
          <!-- Draft Bar -->
          <div class="flex flex-col items-center w-24 h-full justify-end">
             <div class="mb-2 text-blue-400">60%</div>
             <div id="bar-05-draft" class="w-full bg-blue-500 rounded-t h-0"></div>
             <div class="mt-4 text-blue-300">Intern</div>
          </div>
          <!-- Target Bar -->
          <div class="flex flex-col items-center w-24 h-full justify-end">
             <div class="mb-2 text-purple-400">80%</div>
             <div id="bar-05-target" class="w-full bg-purple-500 rounded-t h-0"></div>
             <div class="mt-4 text-purple-300">Editor</div>
          </div>
       </div>
       <div id="stamp-accept" class="absolute border-4 border-green-500 text-green-500 font-black text-5xl p-4 rounded rotate-[-12deg] opacity-0 bg-slate-900/50 backdrop-blur">
          ACCEPTED
       </div>
    </div>

    <!-- SCENE 06: Reject -->
    <div class="scene-06 absolute inset-0 flex flex-col items-center justify-start pt-24 opacity-0">
       <div class="text-3xl mb-12 text-slate-300">Probability Check: "pear"</div>
       <div class="flex items-end space-x-16 h-80 border-b-2 border-slate-600 px-12 relative">
          <!-- Draft Bar -->
          <div class="flex flex-col items-center w-24 h-full justify-end">
             <div class="mb-2 text-blue-400">99%</div>
             <div id="bar-06-draft" class="w-full bg-blue-500 rounded-t h-0"></div>
             <div class="mt-4 text-blue-300">Intern</div>
          </div>
          <!-- Target Bar -->
          <div class="flex flex-col items-center w-24 h-full justify-end">
             <div class="mb-2 text-purple-400">10%</div>
             <div id="bar-06-target" class="w-full bg-purple-500 rounded-t h-0"></div>
             <div class="mt-4 text-purple-300">Editor</div>
          </div>

          <!-- Reject Stamp (Centered on bars) -->
          <div id="stamp-reject" class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-4 border-red-500 text-red-500 font-black text-5xl p-4 rounded rotate-[12deg] opacity-0 bg-slate-900/50 backdrop-blur z-20">
             REJECTED
          </div>
       </div>

       <!-- Formula -->
       <div id="resample-formula" class="absolute top-48 right-32 text-2xl font-serif text-yellow-400 opacity-0 border border-yellow-500 p-4 rounded bg-slate-800/80 backdrop-blur z-30">
          P'(x) = norm(max(0, p - q))
       </div>

       <!-- Transformation -->
       <div class="absolute bottom-40 flex items-center space-x-8">
          <div class="relative">
             <div id="text-pear-container" class="overflow-hidden">
                <div id="text-pear" class="text-4xl text-red-400 line-through whitespace-nowrap">pear</div>
             </div>
          </div>
          <div class="text-2xl text-slate-500">➔</div>
          <div id="text-peach" class="text-4xl text-purple-400 font-bold opacity-0">peach</div>
       </div>

       <!-- KV Cache Strip -->
       <div class="absolute bottom-12 flex space-x-1 items-end">
          <div class="w-16 h-8 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">The</div>
          <div class="w-16 h-8 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">detective</div>
          <div class="w-16 h-8 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">stared</div>
          <div class="w-16 h-8 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[10px] text-slate-500">at</div>
          <!-- Bad Token -->
          <div id="kv-pear" class="w-16 h-8 bg-blue-900/50 border border-blue-500 rounded flex items-center justify-center text-xs text-blue-300 overflow-hidden">pear</div>
          <!-- Good Token -->
          <div id="kv-peach" class="w-0 h-8 bg-purple-900/50 border border-purple-500 rounded flex items-center justify-center text-xs text-purple-300 overflow-hidden opacity-0">peach</div>
       </div>
       <div class="absolute bottom-4 text-xs text-slate-500">KV CACHE MEMORY (显存)</div>
    </div>

    <!-- SCENE 07: Coding Scenario -->
    <div class="scene-07 absolute inset-0 flex items-center justify-center opacity-0 bg-slate-900">
       <!-- Code Screen -->
       <div class="w-1/2 h-3/4 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative p-4 font-mono text-sm text-green-400 opacity-80">
          <div id="code-content" class="absolute top-0 left-0 w-full p-4">
             <pre>
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

# Optimize memory usage
def optimize_memory(data):
    # Draft model is very good at this
    return data.strip().lower()

class NeuralNetwork:
    def __init__(self):
        self.layers = []
        # Fast generation
        # High confidence
        pass
             </pre>
             <pre>
# More code generating...
# ...
# ...
             </pre>
          </div>
       </div>

       <!-- Speedometer -->
       <div class="w-1/2 flex flex-col items-center justify-center">
          <div class="w-64 h-32 bg-slate-800 rounded-t-full border-4 border-slate-600 relative overflow-hidden">
             <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-24 bg-red-500 origin-bottom" id="needle-07" style="transform: rotate(-90deg)"></div>
          </div>
          <div class="text-6xl font-black text-white mt-8">5X SPEED</div>
          <div class="text-xl text-blue-400 mt-2">Coding Scenario</div>
       </div>
    </div>

    <!-- SCENE 08: Creative Scenario -->
    <div class="scene-08 absolute inset-0 flex items-center justify-center opacity-0 bg-slate-900">
       <!-- Novel Screen -->
       <div class="w-1/2 h-3/4 bg-amber-900/20 rounded-lg border border-amber-900/50 p-8 font-serif text-amber-100 text-lg relative">
          <div id="novel-text" class="overflow-hidden whitespace-nowrap border-r-2 border-amber-500">
             The detective stared at the broken clock...
          </div>
       </div>

       <!-- Speedometer -->
       <div class="w-1/2 flex flex-col items-center justify-center">
          <div class="w-64 h-32 bg-slate-800 rounded-t-full border-4 border-slate-600 relative overflow-hidden">
             <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-24 bg-yellow-500 origin-bottom" id="needle-08" style="transform: rotate(-90deg)"></div>
          </div>
          <div class="text-6xl font-black text-white mt-8">1.5X SPEED</div>
          <div class="text-xl text-yellow-400 mt-2">Creative Scenario</div>
       </div>
    </div>

    <!-- SCENE 09: Summary -->
    <div class="scene-09 absolute inset-0 flex flex-col items-center justify-center opacity-0">
       <div class="flex space-x-16 mb-16">
          <div class="summary-icon flex flex-col items-center opacity-0">
             <div class="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-4xl border-2 border-blue-500 mb-4">📖</div>
             <div class="text-blue-300 font-bold">Reading Mode</div>
          </div>
          <div class="summary-icon flex flex-col items-center opacity-0">
             <div class="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center text-4xl border-2 border-purple-500 mb-4">💾</div>
             <div class="text-purple-300 font-bold">Bandwidth Saved</div>
          </div>
          <div class="summary-icon flex flex-col items-center opacity-0">
             <div class="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-4xl border-2 border-green-500 mb-4">🛡️</div>
             <div class="text-green-300 font-bold">Quality Guard</div>
          </div>
       </div>
       
       <div id="final-text" class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 pb-4 pr-4">
         🚀 3 倍加速
      </div>
       <div class="mt-8 text-slate-400 text-xl">Speculative Decoding</div>
    </div>

  </div>
</template>

<style scoped>
/* Utility for glow effects */
.glow-blue {
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
}
.glow-purple {
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.5);
}
</style>
