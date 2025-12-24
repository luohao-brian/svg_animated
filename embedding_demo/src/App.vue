<script setup>
import { onMounted, ref, nextTick } from 'vue'
import anime from 'animejs'
import { LucidePersonStanding, LucideRadar, LucideArrowRight, LucideHandshake, LucideXCircle, LucideCat, LucideDog, LucideTable } from 'lucide-vue-next'

const tl = ref(null)

// Scene Data: MBTI Traits
const traits = ref([
  { name: 'E (外向)', value: 0, target: 90, max: 100, color: '#f87171' }, // Red
  { name: 'N (直觉)', value: 0, target: 80, max: 100, color: '#fbbf24' }, // Amber
  { name: 'T (思考)', value: 0, target: 60, max: 100, color: '#34d399' }, // Emerald
  { name: 'J (判断)', value: 0, target: 90, max: 100, color: '#60a5fa' }  // Blue
])

const mbtiQuestions = ref([
    { q: "能量来源?", options: ["I (独处)", "E (社交)"], selected: 1 },
    { q: "信息获取?", options: ["S (实感)", "N (直觉)"], selected: 1 },
    { q: "决策方式?", options: ["T (思考)", "F (情感)"], selected: 0 },
    { q: "生活态度?", options: ["J (判断)", "P (感知)"], selected: 0 }
])

// State Flags
const showSubtitle = ref(false)
const subtitleText = ref('')
const vectorValues = ref([])

// Scene 1.5 States (Cosine Demo)
const vectorBCoords = ref({ x: 0.5, y: 0.86 }) // Initial 60 degrees
const cosineVal = ref('0.50')
const angleB = ref(60) // Degrees

// Scene 2 States
const similarityA = ref(0)
const similarityB = ref(0)
const jayVector = { x: 0.8, y: 0.6 } // Simplified 2D for visualization
const friendAVector = ref({ x: 0.9, y: 0.4 }) // Distinct angle (~24 deg)
const friendBVector = ref({ x: -0.6, y: 0.7 }) // Distinct angle (~130 deg)
const cosineA = ref(0.96)
const cosineB = ref(-0.10) // Negative correlation

// Scene 3 States
const wordCards = ref([
  { 
      id: 'king', label: 'King', emoji: '🤴', 
      traits: [
          { label: '人类?', val: 1 }, 
          { label: '男性?', val: 1 }, 
          { label: '皇室?', val: 1 },
          { label: '有生命?', val: 1 },
          { label: '能吃?', val: 0 },
          { label: '有感情?', val: 1 }
      ]
  },
  { 
      id: 'man', label: 'Man', emoji: '👨', 
      traits: [
          { label: '人类?', val: 1 }, 
          { label: '男性?', val: 1 }, 
          { label: '皇室?', val: 0 },
          { label: '有生命?', val: 1 },
          { label: '能吃?', val: 0 },
          { label: '有感情?', val: 1 }
      ]
  },
  { 
      id: 'apple', label: 'Apple', emoji: '🍎', 
      traits: [
          { label: '人类?', val: 0 }, 
          { label: '男性?', val: 0 }, 
          { label: '皇室?', val: 0 },
          { label: '有生命?', val: 1 },
          { label: '能吃?', val: 1 },
          { label: '有感情?', val: 0 }
      ]
  }
])

// Scene 4 States
const backgroundWords = ref([])
// Generate massive random background words
for (let i = 0; i < 400; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 45 + 5; // 5% to 50% distance from center
  backgroundWords.value.push({
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
    opacity: Math.random() * 0.3 + 0.1,
    size: Math.random() * 2 + 1,
    color: ['#334155', '#475569', '#64748b'][Math.floor(Math.random() * 3)]
  })
}

const clusterWords = ref([
    { text: 'Cat', x: 60, y: 40, color: '#34d399' },
    { text: 'Dog', x: 65, y: 35, color: '#34d399' },
    { text: 'Tiger', x: 55, y: 38, color: '#34d399' },
    { text: 'Lion', x: 58, y: 32, color: '#34d399' },
    
    { text: 'Apple', x: 80, y: 80, color: '#fbbf24' },
    { text: 'Banana', x: 85, y: 75, color: '#fbbf24' },
    
    { text: 'Run', x: 20, y: 60, color: '#f472b6' },
    { text: 'Jump', x: 25, y: 65, color: '#f472b6' },
    { text: 'Walk', x: 22, y: 58, color: '#f472b6' }
])

// Scene 5 States
const kqWords = ref([
    { text: 'Man', x: 30, y: 70, color: '#94a3b8', vecX: -20, vecY: 20 },   // Relative from center (50,50) -> x:30, y:70 means -20, +20
    { text: 'King', x: 30, y: 30, color: '#facc15', vecX: -20, vecY: -20 },
    { text: 'Woman', x: 70, y: 70, color: '#94a3b8', vecX: 20, vecY: 20 },
    { text: 'Queen', x: 70, y: 30, color: '#facc15', vecX: 20, vecY: -20 },
    { text: 'Apple', x: 90, y: 90, color: '#ef4444', vecX: 40, vecY: 40, opacity: 0 }
])

// Calculated Coordinates for Scene 5
const center = { x: 400, y: 300 }
const scale = 5
const getVecCoords = (vecX, vecY) => ({
    x: center.x + vecX * scale,
    y: center.y - vecY * scale
})

// For traveling vector
const royalTravel = ref({
    x1: getVecCoords(kqWords.value[0].vecX, kqWords.value[0].vecY).x,
    y1: getVecCoords(kqWords.value[0].vecX, kqWords.value[0].vecY).y,
    x2: getVecCoords(kqWords.value[1].vecX, kqWords.value[1].vecY).x,
    y2: getVecCoords(kqWords.value[1].vecX, kqWords.value[1].vecY).y,
    opacity: 0
})


onMounted(async () => {
  // Initialize Timeline
  tl.value = anime.timeline({
    autoplay: false, // Controlled by record script
    easing: 'linear',
    complete: () => { window.embedding_demo.status = 'finished' }
  })

  // === Scene 1: Digitizing Personality (MBTI) (0s - 15s) ===
  
  // 1. Enter Jay
  tl.value.add({
    targets: {},
    begin: () => { 
      subtitleText.value = "我们可以用一组数字，精准描述一个人的性格 (MBTI)。"
      showSubtitle.value = true
    },
    duration: 1000
  })
  
  tl.value.add({
    targets: '.jay-char',
    opacity: [0, 1],
    scale: [0.5, 1],
    duration: 1500,
    easing: 'easeOutElastic(1, .6)'
  })

  // 2. Questions MBTI Animation
  tl.value.add({
      targets: '.mbti-question-box',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 500,
      delay: anime.stagger(800) // Show each question faster
  })

  // Highlight selected options sequentially
  mbtiQuestions.value.forEach((q, i) => {
      tl.value.add({
          targets: `.q-opt-${i}-${q.selected}`,
          backgroundColor: ['rgba(51, 65, 85, 0)', '#3b82f6'], // Highlight blue
          duration: 300,
          easing: 'easeOutQuad'
      }, `-=${600}`) // Overlap more
  })

  // Wait before showing Radar (previously faded out questions)
  tl.value.add({
      targets: {},
      duration: 100,
      delay: 3000 // Keep reading time
  })

  tl.value.add({
    targets: '.show-radar',
    opacity: [0, 1],
    duration: 500
  })

  // Animate trait bars
  tl.value.add({
    targets: traits.value,
    value: (t) => t.target,
    round: 1,
    duration: 2000,
    easing: 'easeOutExpo',
    update: (anim) => {
      // Force reactivity
    }
  })

  // 3. Transform to Vector
  tl.value.add({
    targets: {},
    begin: () => { /* Logic if needed */ },
    duration: 1000
  }, '+=100')

  // Calculate normalized vector values
  vectorValues.value = traits.value.map(t => (t.target / 100).toFixed(1))

  tl.value.add({
    targets: '.vector-container',
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 1000
  })
  
  // Highlight Vector
  tl.value.add({
    targets: '.vector-val',
    color: '#22d3ee',
    duration: 500,
    delay: anime.stagger(100)
  })

  // HOLD Vector Display
  tl.value.add({
      targets: {},
      duration: 3000 // Extended hold time for Jay's vector
  })

  // === Scene 1.5: Cosine Similarity Demo (15s - 25s) ===
  
  // Transition: Hide Scene 1
  tl.value.add({
      targets: ['.scene1-group', '.vector-container', '.show-radar', '.jay-char'],
      opacity: 0,
      duration: 1000,
      begin: () => {
          subtitleText.value = "如何比较两个向量？我们需要“余弦相似度”。"
      }
  })

  // Show Cosine Demo
  tl.value.add({
      targets: '.cosine-demo-group',
      opacity: [0, 1],
      duration: 1000
  })

  // Animate Vector B Rotation
  // Start at 60 deg (0.5), rotate to 10 deg (0.98), then to 170 deg (-0.98)
  tl.value.add({
      targets: { angle: 60 },
      angle: [60, 10],
      duration: 2000,
      easing: 'easeInOutQuad',
      update: (anim) => {
          const deg = anim.animations[0].currentValue
          angleB.value = deg
          const rad = deg * (Math.PI / 180)
          vectorBCoords.value.x = Math.cos(rad).toFixed(2)
          vectorBCoords.value.y = Math.sin(rad).toFixed(2)
          cosineVal.value = Math.cos(rad).toFixed(2)
      }
  })

  tl.value.add({
      targets: {},
      duration: 500
  })

  tl.value.add({
      targets: { angle: 10 },
      angle: [10, 150],
      duration: 2000,
      easing: 'easeInOutQuad',
      update: (anim) => {
          const deg = anim.animations[0].currentValue
          angleB.value = deg
          const rad = deg * (Math.PI / 180)
          vectorBCoords.value.x = Math.cos(rad).toFixed(2)
          vectorBCoords.value.y = Math.sin(rad).toFixed(2)
          cosineVal.value = Math.cos(rad).toFixed(2)
      }
  })
  
  // === Scene 2: Finding Soulmates (25s - 40s) ===

  // Transition: Move Jay left, Show Friends
  tl.value.add({
    targets: '.cosine-demo-group',
    opacity: 0,
    duration: 1000,
    easing: 'easeInOutQuad',
    begin: () => {
        subtitleText.value = "回到性格向量，计算夹角，就能找到 Soulmate。"
    }
  }, '+=500')

  // Show Friends Panel
  tl.value.add({
    targets: '.show-friends',
    opacity: [0, 1],
    duration: 1000
  })

  // Friend A Enter (Soulmate)
  tl.value.add({
    targets: '.friend-a',
    opacity: [0, 1],
    translateX: [50, 0],
    duration: 1000,
    easing: 'easeOutExpo'
  })

  // Compare A (High Similarity)
  tl.value.add({
    targets: { val: 0 },
    val: cosineA.value,
    round: 100,
    duration: 1500,
    update: (anim) => {
        similarityA.value = anim.animations[0].currentValue.toFixed(2)
    },
    easing: 'easeOutCubic'
  })
  
  // Show Handshake
  tl.value.add({
    targets: '.show-handshake',
    opacity: [0, 1],
    scale: [0.5, 1],
    duration: 500,
    easing: 'easeOutBack'
  })

  // Friend B Enter (Opposite)
  tl.value.add({
    targets: '.friend-b',
    opacity: [0, 1],
    translateX: [50, 0],
    duration: 1000,
    easing: 'easeOutExpo',
    delay: 1000
  })

   // Compare B (Low Similarity)
   tl.value.add({
    targets: { val: 0 },
    val: cosineB.value,
    round: 100,
    duration: 1500,
    update: (anim) => {
        similarityB.value = anim.animations[0].currentValue.toFixed(2)
    },
    easing: 'easeOutCubic'
  })

  // Show Reject
  tl.value.add({
    targets: '.show-reject',
    opacity: [0, 1],
    scale: [0.5, 1],
    duration: 500,
    easing: 'easeOutBack'
  })

  // === Scene 3: Words Have Personalities (40s - 55s) ===
  
  // Clear Scene 2
  tl.value.add({
    targets: ['.show-friends', '.vector-container'],
    opacity: 0,
    duration: 1000,
    begin: () => {
        subtitleText.value = "Embedding 就是给单词做 1000 多道题的‘性格测试’。"
    }
  })

  // Show Word Cards
  tl.value.add({
    targets: '.word-card',
    opacity: [0, 1],
    scale: [0.8, 1],
    duration: 800,
    delay: anime.stagger(200)
  })
  
  // Show Traits Checklist Animation
  wordCards.value.forEach((word, i) => {
    // Stagger traits appearing for each card
    tl.value.add({
      targets: `.word-${word.id} .trait-item`,
      opacity: [0, 1],
      translateX: [-10, 0],
      duration: 300,
      delay: anime.stagger(100)
    }, `-=${500}`)
  })
  
  // Transform to Vectors (long bar)
  tl.value.add({
    targets: '.word-card',
    width: '100px', // Shrink width
    opacity: 0.5,
    duration: 1000,
    delay: 3000 // Increased delay (was 1000)
  })

  // === Scene 4: Semantic Clustering (55s - 70s) ===
  
  // Clear Scene 3
  tl.value.add({
    targets: '.word-card-container',
    opacity: 0,
    duration: 1000,
    begin: () => {
        subtitleText.value = "在这个坐标系里，意思相近的词，向量方向几乎一致。"
    }
  })

  // Show Semantic Space (Background)
  tl.value.add({
    targets: '.semantic-space',
    opacity: [0, 1],
    duration: 1000
  })
  
  // Animate Background Dots (Twinkle/Drift)
  tl.value.add({
    targets: '.bg-word-dot',
    opacity: [0, 1],
    scale: [0, 1],
    duration: 2000,
    delay: anime.stagger(5, {grid: [20, 20], from: 'center'})
  }, '-=500')
  
  // Draw Vectors for Cluster Words
  tl.value.add({
    targets: '.cluster-word-line',
    strokeDashoffset: [anime.setDashoffset, 0],
    easing: 'easeInOutSine',
    duration: 1500,
    delay: anime.stagger(100)
  })

  tl.value.add({
    targets: '.cluster-word-text',
    opacity: [0, 1],
    duration: 500,
    delay: anime.stagger(100)
  }, '-=1000')

  // Highlight Groups (Cat/Dog vs Apple/Banana)
  tl.value.add({
    targets: '.cluster-group-animals',
    scale: [1, 1.2, 1],
    duration: 1000
  })
  
  tl.value.add({
    targets: '.cluster-group-fruits',
    scale: [1, 1.2, 1],
    duration: 1000
  }, '-=500')

  // === Scene 5: King & Queen (70s - 85s) ===
  
  // Transition focus
  tl.value.add({
    targets: ['.cluster-word-line', '.cluster-word-text', '.bg-word-dot'],
    opacity: 0.2, // Dim background but keep visible
    duration: 1000,
    begin: () => {
        subtitleText.value = "词向量的神奇之处：它们可以进行计算。"
    }
  })
  
  // Show King/Queen/Man/Woman Vectors Group
  tl.value.add({
    targets: '.kq-vector-group',
    opacity: [0, 1],
    duration: 1000
  })


  
  // 1. Show Man Vector
  tl.value.add({
      targets: '.vec-man-group',
      opacity: [0, 1],
      duration: 1000
  })
  
  // 2. Show King Vector
  tl.value.add({
      targets: '.vec-king-group',
      opacity: [0, 1],
      duration: 1000
  })
  
  // 3. Show Royal Vector (Man -> King)
  tl.value.add({
      targets: '.vec-royal-diff',
      opacity: [0, 1],
      strokeDashoffset: [anime.setDashoffset, 0],
      duration: 1000,
      begin: () => {
          subtitleText.value = "第一步：King - Man = '皇室' 向量"
      }
  })
  
  // Wait a bit
  tl.value.add({
      targets: {},
      duration: 1000
  })

  // 4. Show Woman Vector
  tl.value.add({
      targets: '.vec-woman-group',
      opacity: [0, 1],
      duration: 1000,
      begin: () => {
           subtitleText.value = "第二步：找到 Woman 向量"
      }
  })
  
  // 5. Move Royal Vector to Woman (Travel)
  // Set initial position (Man -> King)
  const manPos = getVecCoords(kqWords.value[0].vecX, kqWords.value[0].vecY)
  const kingPos = getVecCoords(kqWords.value[1].vecX, kqWords.value[1].vecY)
  const womanPos = getVecCoords(kqWords.value[2].vecX, kqWords.value[2].vecY)
  const queenPos = getVecCoords(kqWords.value[3].vecX, kqWords.value[3].vecY)

  // Initialize the ref with starting positions
  royalTravel.value.x1 = manPos.x
  royalTravel.value.y1 = manPos.y
  royalTravel.value.x2 = kingPos.x
  royalTravel.value.y2 = kingPos.y

  tl.value.add({
      targets: '.vec-royal-travel',
      opacity: 1,
      duration: 100,
      begin: () => {
          subtitleText.value = "第三步：Woman + '皇室' ..."
          // Ensure correct starting position before animation
          const el = document.querySelector('.vec-royal-travel')
          if (el) {
             el.setAttribute('x1', manPos.x)
             el.setAttribute('y1', manPos.y)
             el.setAttribute('x2', kingPos.x)
             el.setAttribute('y2', kingPos.y)
          }
      }
  })

  // Direct DOM animation to prevent Vue reactivity jitter
  tl.value.add({
      targets: '.vec-royal-travel',
      x1: [manPos.x, womanPos.x],
      y1: [manPos.y, womanPos.y],
      x2: [kingPos.x, queenPos.x],
      y2: [kingPos.y, queenPos.y],
      duration: 2000,
      easing: 'easeInOutCubic',
      complete: () => {
          // Sync ref to prevent snap-back on next Vue update
          royalTravel.value.x1 = womanPos.x
          royalTravel.value.y1 = womanPos.y
          royalTravel.value.x2 = queenPos.x
          royalTravel.value.y2 = queenPos.y
      }
  })
  
  // 6. Result: Queen
  tl.value.add({
      targets: '.vec-queen-group',
      opacity: [0, 1],
      duration: 1000,
      begin: () => {
          subtitleText.value = "结果：Woman + '皇室' = Queen"
      }
  })
  
  // Show Cosine Panel for Scene 5
  tl.value.add({
      targets: '.cosine-panel',
      opacity: [0, 1],
      duration: 1000,
      begin: () => {
          subtitleText.value = "最终公式：King - Man + Woman = Queen"
      }
  })

  // Expose control interface for recording
  window.embedding_demo = {
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
  
  // Auto-play for dev preview
  tl.value.play()
})
</script>

<template>
  <div class="w-full h-full bg-slate-900 text-white overflow-hidden relative font-sans">
    
    <!-- Subtitle -->
    <div v-if="showSubtitle" class="absolute bottom-5 w-full text-center text-xl text-slate-300 z-50 px-20 font-bold tracking-wide bg-slate-900/80 py-3 backdrop-blur-sm rounded-full">
      {{ subtitleText }}
    </div>

    <div class="flex items-center justify-center h-full w-full relative">
        
        <svg viewBox="0 0 800 600" class="w-full h-full max-w-5xl" preserveAspectRatio="xMidYMid meet">
        
        <!-- Scene 1: Digitizing Personality (MBTI) -->
        <g class="scene1-group" v-if="true"> <!-- Always rendered, controlled by opacity -->
        <!-- Jay Character (Left Center) -->
        <g transform="translate(120, 300)">
            <g class="jay-char opacity-0">
                <!-- Increased size -->
                <circle cx="0" cy="0" r="70" fill="#3b82f6" />
                <text x="0" y="100" text-anchor="middle" fill="white" font-size="32" font-weight="bold">Jay</text>
                <!-- Face -->
                <circle cx="-25" cy="-12" r="8" fill="white"/>
                <circle cx="25" cy="-12" r="8" fill="white"/>
                <path d="M -30 30 Q 0 55 30 30" stroke="white" stroke-width="5" fill="none"/>
            </g>
        </g>

        <!-- Right Side Stack: MBTI -> Radar -> Vector -->
        
        <!-- 1. MBTI Questions Panel (Top Right) -->
        <foreignObject x="380" y="30" width="380" height="190" class="mbti-question-box opacity-0">
            <div class="bg-slate-800/90 p-4 rounded-xl border border-slate-700 backdrop-blur w-full h-full flex flex-col justify-center gap-2">
                <h2 class="text-xl text-white font-bold mb-1 text-center">MBTI Test</h2>
                <div v-for="(q, i) in mbtiQuestions" :key="i" class="flex items-center justify-between border-b border-slate-700 pb-1 last:border-0">
                    <span class="text-slate-300 font-bold text-xs">{{ q.q }}</span>
                    <div class="flex gap-2">
                        <div :class="`q-opt-${i}-0 px-2 py-0.5 rounded text-slate-400 border border-slate-600 text-[10px]`">{{ q.options[0] }}</div>
                        <div :class="`q-opt-${i}-1 px-2 py-0.5 rounded text-slate-400 border border-slate-600 text-[10px]`">{{ q.options[1] }}</div>
                    </div>
                </div>
            </div>
        </foreignObject>

        <!-- 2. Radar Chart / Bars (Middle Right) -->
        <g transform="translate(570, 350)">
            <g class="show-radar opacity-0">
                <!-- Adjusted Size r=60 -->
                <circle r="60" fill="none" stroke="#334155" stroke-dasharray="4 4" />
                <circle r="40" fill="none" stroke="#334155" stroke-dasharray="4 4" />
                <circle r="20" fill="none" stroke="#334155" stroke-dasharray="4 4" />
                
                <!-- Axes -->
                <line x1="0" y1="-70" x2="0" y2="70" stroke="#334155" />
                <line x1="-70" y1="0" x2="70" y2="0" stroke="#334155" />

                <!-- Trait Bars -->
                <g v-for="(t, i) in traits" :key="i" :transform="`rotate(${i * 90 - 90})`">
                    <!-- Bar length multiplier 0.6 -->
                    <line x1="0" y1="0" :x2="t.value * 0.6" y2="0" :stroke="t.color" stroke-width="8" stroke-linecap="round"/>
                    <!-- Labels moved out to 95, Values at end of bar + 15 -->
                    <text :x="95" y="4" text-anchor="middle" fill="#94a3b8" font-size="12" :transform="`rotate(${-(i * 90 - 90)} ${95} 0)`">{{ t.name }}</text>
                    <text :x="t.value * 0.6 + 15" y="4" text-anchor="middle" fill="white" font-size="10" :transform="`rotate(${-(i * 90 - 90)} ${t.value * 0.6 + 15} 0)`">{{ Math.round(t.value) }}</text>
                </g>
            </g>
        </g>

        <!-- 3. Vector Representation (Bottom Right) -->
        <g transform="translate(380, 470)">
            <g class="vector-container opacity-0">
                <!-- Wide Card -->
                <rect x="0" y="0" width="380" height="100" rx="12" fill="#1e293b" stroke="#334155" />
                <text x="190" y="25" text-anchor="middle" fill="#94a3b8" font-family="monospace" font-size="14">Vector Representation</text>
                
                <!-- Horizontal Layout -->
                <text x="20" y="55" fill="#94a3b8" font-family="monospace" font-size="14">Vec = [</text>
                <g v-for="(val, i) in vectorValues" :key="i">
                    <text :x="85 + i * 55" y="55" class="vector-val" fill="white" font-family="monospace" font-size="14">{{ val }}</text>
                    <text v-if="i < vectorValues.length - 1" :x="125 + i * 55" y="55" fill="#64748b" font-family="monospace" font-size="14">,</text>
                </g>
                <text :x="85 + vectorValues.length * 55" y="55" fill="#94a3b8" font-family="monospace" font-size="14">]</text>
                
                <!-- Explanation text -->
                <text x="190" y="85" text-anchor="middle" fill="#64748b" font-size="12">Map personality to 4D space</text>
            </g>
        </g>
        </g>

        <!-- Scene 1.5: Cosine Similarity Demo -->
        <g class="cosine-demo-group opacity-0">
             <!-- Interactive Formula Panel -->
             <foreignObject x="100" y="100" width="600" height="200">
                <div class="flex flex-col gap-4 bg-slate-800/80 p-6 rounded-xl border border-slate-700 backdrop-blur w-full h-full">
                    <!-- Coordinates -->
                    <div class="flex justify-between font-mono text-sm text-slate-400 border-b border-slate-700 pb-2">
                        <span>Vector A = [ 1.00, 0.00 ]</span>
                        <span>Vector B = [ {{ vectorBCoords.x }}, {{ vectorBCoords.y }} ]</span>
                    </div>
                    <!-- Cosine Formula -->
                    <div class="flex items-center justify-center gap-4 text-2xl font-mono h-full">
                        <div class="flex flex-col items-center">
                            <div class="border-b border-slate-500 px-2 mb-1">A · B</div>
                            <div class="text-sm text-slate-400">|A| × |B|</div>
                        </div>
                        <span>=</span>
                        <div class="text-green-400 font-bold">{{ cosineVal }}</div>
                    </div>
                </div>
             </foreignObject>

             <!-- Vector Visualization -->
             <g transform="translate(400, 450) scale(1, -1)">
                <!-- Axes -->
                <line x1="-150" y1="0" x2="150" y2="0" stroke="#475569" stroke-width="2" marker-end="url(#arrowhead)"/>
                <line x1="0" y1="-50" x2="0" y2="150" stroke="#475569" stroke-width="2" marker-end="url(#arrowhead)"/>
                
                <!-- Unit Circle -->
                <circle cx="0" cy="0" r="100" fill="none" stroke="#334155" stroke-dasharray="4 4" />

                <!-- Vector A (Fixed) -->
                <line x1="0" y1="0" x2="100" y2="0" stroke="#3b82f6" stroke-width="4" marker-end="url(#arrowhead-blue)"/>
                <text x="110" y="-10" transform="scale(1, -1)" fill="#3b82f6" font-weight="bold">A</text>

                <!-- Vector B (Rotating) -->
                <line x1="0" y1="0" :x2="vectorBCoords.x * 100" :y2="vectorBCoords.y * 100" stroke="#facc15" stroke-width="4" marker-end="url(#arrowhead-yellow)"/>
                <text :x="vectorBCoords.x * 100 + 10" :y="-vectorBCoords.y * 100" transform="scale(1, -1)" fill="#facc15" font-weight="bold">B</text>

                <!-- Angle Arc -->
                <path :d="`M 30 0 A 30 30 0 ${angleB > 180 ? 1 : 0} 1 ${Math.cos(angleB * Math.PI / 180) * 30} ${Math.sin(angleB * Math.PI / 180) * 30}`" fill="none" stroke="#94a3b8" stroke-width="2" />
             </g>
        </g>

        <!-- Scene 2: Finding Soulmates -->
        <g class="show-friends opacity-0">
            <!-- Coordinate System for Soulmates -->
            <!-- Moved Origin to x=300 to ensure negative X (Person B) is fully visible -->
            <g transform="translate(300, 400) scale(1, -1)">
                <!-- Axes (Cross) -->
                <line x1="-250" y1="0" x2="250" y2="0" stroke="#475569" stroke-width="2" marker-end="url(#arrowhead)"/>
                <line x1="0" y1="-150" x2="0" y2="200" stroke="#475569" stroke-width="2" marker-end="url(#arrowhead)"/>
                
                <!-- Jay Vector -->
                <line x1="0" y1="0" :x2="jayVector.x * 200" :y2="jayVector.y * 200" stroke="#3b82f6" stroke-width="4" marker-end="url(#arrowhead-blue)"/>
                <text :x="jayVector.x * 200 + 10" :y="-(jayVector.y * 200 + 10)" transform="scale(1, -1)" fill="#3b82f6" font-weight="bold">Jay</text>
                
                <!-- Friend A Vector -->
                <g class="friend-a opacity-0">
                    <line x1="0" y1="0" :x2="friendAVector.x * 200" :y2="friendAVector.y * 200" stroke="#34d399" stroke-width="4" marker-end="url(#arrowhead-green)"/>
                    <!-- Positioned below the vector (World Y < Vector Y) to avoid overlap -->
                    <text :x="friendAVector.x * 200 - 10" :y="-(friendAVector.y * 200 - 60)" text-anchor="end" transform="scale(1, -1)" fill="#34d399" font-weight="bold">Person A</text>
                </g>

                <!-- Friend B Vector -->
                <g class="friend-b opacity-0">
                    <line x1="0" y1="0" :x2="friendBVector.x * 200" :y2="friendBVector.y * 200" stroke="#f87171" stroke-width="4" marker-end="url(#arrowhead-red)"/>
                    <!-- Changed anchor to start and offset to right to ensure visibility -->
                    <text :x="friendBVector.x * 200 + 10" :y="-(friendBVector.y * 200 + 10)" text-anchor="start" transform="scale(1, -1)" fill="#f87171" font-weight="bold">Person B</text>
                    <!-- Angle Arc -->
                     <path d="M 30 20 A 40 40 0 0 1 -20 -15" stroke="#94a3b8" stroke-width="2" fill="none" stroke-dasharray="4 4" />
                </g>
            </g>
            
            <!-- Right Side Panel: Comparisons -->
            <g transform="translate(500, 100)">
                <!-- Friend B (Top - Matches Vector Position) -->
                <g transform="translate(0, 0)">
                    <g class="friend-b opacity-0">
                        <rect x="0" y="0" width="250" height="120" rx="10" fill="#1e293b" stroke="#f87171"/>
                        <circle cx="40" cy="40" r="20" fill="#f87171"/>
                        <text x="80" y="35" fill="white" font-weight="bold">Person B</text>
                        <text x="80" y="55" fill="#94a3b8" font-size="12">Opposite?</text>
                        
                        <text x="20" y="90" fill="#94a3b8" font-family="monospace">Cos Sim:</text>
                        <text x="100" y="90" fill="#f87171" font-family="monospace" font-weight="bold" font-size="20">{{ similarityB }}</text>

                        <g class="show-reject opacity-0" transform="translate(180, 80) scale(2)">
                            <text>❌</text>
                        </g>
                    </g>
                </g>

                <!-- Friend A (Bottom - Matches Vector Position) -->
                <g transform="translate(0, 150)">
                    <g class="friend-a opacity-0">
                        <rect x="0" y="0" width="250" height="120" rx="10" fill="#1e293b" stroke="#34d399"/>
                        <circle cx="40" cy="40" r="20" fill="#34d399"/>
                        <text x="80" y="35" fill="white" font-weight="bold">Person A</text>
                        <text x="80" y="55" fill="#94a3b8" font-size="12">Soulmate?</text>
                        
                        <text x="20" y="90" fill="#94a3b8" font-family="monospace">Cos Sim:</text>
                        <text x="100" y="90" fill="#34d399" font-family="monospace" font-weight="bold" font-size="20">{{ similarityA }}</text>
                        
                        <g class="show-handshake opacity-0" transform="translate(180, 80) scale(2)">
                            <text>🤝</text>
                        </g>
                    </g>
                </g>
            </g>
        </g>

        <!-- Scene 3: Words Have Personalities -->
        <g class="scene3-group">
        <!-- Word Cards Container -->
        <g class="word-card-container">
            <!-- Increased horizontal spacing (220 -> 240) and moved up (100 -> 50) -->
            <g v-for="(word, i) in wordCards" :key="word.id" :transform="`translate(${80 + i * 240}, 50)`">
                <g :class="`word-card word-${word.id} opacity-0`">
                    <!-- Card Background (Increased Height 460 -> 400) -->
                    <rect x="0" y="0" width="200" height="400" rx="15" fill="#1e293b" stroke="#475569" stroke-width="2"/>
                    
                    <!-- Emoji & Label -->
                    <text x="100" y="40" text-anchor="middle" font-size="40">{{ word.emoji }}</text>
                    <text x="100" y="80" text-anchor="middle" fill="white" font-weight="bold" font-size="24">{{ word.label }}</text>
                    
                    <!-- Traits Checklist -->
                    <g transform="translate(25, 120)">
                        <!-- Compact Vertical Spacing (70 -> 40) -->
                        <!-- IMPORTANT: Use a wrapper group for positioning to prevent Anime.js from overwriting transform -->
                        <g v-for="(trait, ti) in word.traits" :key="ti" :transform="`translate(0, ${ti * 40})`">
                            <g class="trait-item opacity-0">
                                <!-- Checkbox Circle -->
                                <circle cx="10" cy="-5" r="10" :fill="trait.val ? '#34d399' : '#ef4444'" />
                                <!-- Checkmark/X path -->
                                <path v-if="trait.val" d="M 5 -5 L 9 -1 L 15 -10" stroke="white" stroke-width="2" fill="none"/>
                                <path v-else d="M 5 -10 L 15 0 M 5 0 L 15 -10" stroke="white" stroke-width="2" fill="none"/>
                                <!-- Label Text -->
                                <text x="35" y="0" fill="#cbd5e1" font-size="16">{{ trait.label }}</text>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </g>
        </g>

        <!-- Scene 4: Semantic Clustering -->
        <g class="semantic-space opacity-0">
            <!-- Coordinate System Background -->
            <g transform="translate(400, 300)"> <!-- Center of screen -->
                <!-- Faint Grid Lines -->
                <line x1="-400" y1="0" x2="400" y2="0" stroke="#334155" stroke-width="1" />
                <line x1="0" y1="-300" x2="0" y2="300" stroke="#334155" stroke-width="1" />
                <circle r="100" fill="none" stroke="#334155" stroke-dasharray="4 4" opacity="0.5"/>
                <circle r="200" fill="none" stroke="#334155" stroke-dasharray="4 4" opacity="0.3"/>
            </g>

            <!-- Massive Background Dots -->
            <g v-for="(dot, i) in backgroundWords" :key="i" class="bg-word-dot opacity-0">
                <circle :cx="dot.x * 8" :cy="dot.y * 6" :r="dot.size" :fill="dot.color" opacity="0.5"/>
                <!-- Use SVG line for vector representation from center (400,300) -->
                <line 
                    :x1="400" :y1="300" 
                    :x2="dot.x * 8" :y2="dot.y * 6" 
                    stroke="#334155" 
                    stroke-width="0.5" 
                    opacity="0.1"
                />
            </g>

            <!-- Focused Cluster Words -->
            <g v-for="(word, i) in clusterWords" :key="`cw-${i}`" class="cluster-word-group">
                <!-- Vector Line from Origin -->
                <line 
                    class="cluster-word-line"
                    :x1="400" :y1="300" 
                    :x2="word.x * 8" :y2="word.y * 6" 
                    :stroke="word.color" 
                    stroke-width="1" 
                    opacity="0.5"
                    stroke-dasharray="1000"
                    :stroke-dashoffset="1000"
                />
                <!-- Word Text -->
                <text 
                    class="cluster-word-text opacity-0"
                    :x="word.x * 8" :y="word.y * 6" 
                    :fill="word.color" 
                    font-size="14" 
                    font-weight="bold"
                    text-anchor="middle"
                >
                    {{ word.text }}
                </text>
            </g>
        </g>

        <!-- Scene 5: King & Queen Vectors -->
        <g class="kq-vector-group opacity-0">
            <!-- Coordinate Origin is 400, 300 (Center) -->
            
            <!-- Man Vector (Point + Dashed Line) -->
            <g class="vec-man-group opacity-0">
                <line class="vec-man-line" x1="400" y1="300" :x2="400 + kqWords[0].vecX * 5" :y2="300 - kqWords[0].vecY * 5" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
                <circle class="vec-man-point" :cx="400 + kqWords[0].vecX * 5" :cy="300 - kqWords[0].vecY * 5" r="5" fill="#94a3b8"/>
                <text class="vec-man-text" :x="400 + kqWords[0].vecX * 5 - 20" :y="300 - kqWords[0].vecY * 5 - 10" fill="#94a3b8">Man</text>
            </g>

            <!-- King Vector (Point + Dashed Line) -->
            <g class="vec-king-group opacity-0">
                <line class="vec-king-line" x1="400" y1="300" :x2="400 + kqWords[1].vecX * 5" :y2="300 - kqWords[1].vecY * 5" stroke="#facc15" stroke-width="2" stroke-dasharray="4 4"/>
                <circle class="vec-king-point" :cx="400 + kqWords[1].vecX * 5" :cy="300 - kqWords[1].vecY * 5" r="5" fill="#facc15"/>
                <!-- Adjusted label position to avoid overlap with vector -->
                <text class="vec-king-text" :x="400 + kqWords[1].vecX * 5 - 15" :y="300 - kqWords[1].vecY * 5 - 15" text-anchor="end" fill="#facc15" font-weight="bold">King</text>
            </g>

            <!-- Royal Vector (Diff: Man -> King) -->
            <line class="vec-royal-diff opacity-0" 
                :x1="400 + kqWords[0].vecX * 5" :y1="300 - kqWords[0].vecY * 5" 
                :x2="400 + kqWords[1].vecX * 5" :y2="300 - kqWords[1].vecY * 5" 
                stroke="#c084fc" stroke-width="4" stroke-linecap="round"/>
            <text class="vec-royal-diff opacity-0" :x="320" :y="300" fill="#c084fc" font-size="12">+ Royal</text>

            <!-- Traveling Royal Vector -->
            <line class="vec-royal-travel opacity-0" 
                :x1="royalTravel.x1" :y1="royalTravel.y1" 
                :x2="royalTravel.x2" :y2="royalTravel.y2" 
                stroke="#c084fc" stroke-width="4" stroke-linecap="round"/>

            <!-- Woman Vector (Point + Dashed Line) -->
            <g class="vec-woman-group opacity-0">
                <line class="vec-woman-line" x1="400" y1="300" :x2="400 + kqWords[2].vecX * 5" :y2="300 - kqWords[2].vecY * 5" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 4"/>
                <circle class="vec-woman-point" :cx="400 + kqWords[2].vecX * 5" :cy="300 - kqWords[2].vecY * 5" r="5" fill="#94a3b8"/>
                <text class="vec-woman-text" :x="400 + kqWords[2].vecX * 5 + 10" :y="300 - kqWords[2].vecY * 5 + 20" fill="#94a3b8">Woman</text>
            </g>

            <!-- Queen Result (Point + Dashed Line) -->
            <g class="vec-queen-group opacity-0">
                 <line class="vec-queen-line" x1="400" y1="300" :x2="400 + kqWords[3].vecX * 5" :y2="300 - kqWords[3].vecY * 5" stroke="#facc15" stroke-width="2" stroke-dasharray="4 4"/>
                 <circle class="vec-queen-point" :cx="400 + kqWords[3].vecX * 5" :cy="300 - kqWords[3].vecY * 5" r="6" fill="#facc15"/>
                 <text class="text-queen" :x="400 + kqWords[3].vecX * 5 + 10" :y="300 - kqWords[3].vecY * 5" fill="#facc15" font-weight="bold" font-size="20">Queen</text>
            </g>


        </g>
        
        <!-- Definitions for Arrowheads -->
        <defs>
            <!-- Reduced size (6x4.5) but kept refX at tip (6) to ensure line ends at coordinate -->
            <!-- viewBox 0 0 6 4.5 matches the new size -->
            <!-- Original logic: tip at end. -->
            <!-- If we want the tip to be at (refX, refY), and the marker to point left (standard is right) -->
            <!-- Standard marker points +x. We want the tip at the end of the line. -->
            <!-- So refX should be the max x of the path. -->
            <!-- Path: 0,0 -> 6,2.25 -> 0,4.5 -->
            <marker id="arrowhead" markerWidth="6" markerHeight="4.5" refX="6" refY="2.25" orient="auto" viewBox="0 0 6 4.5">
                <polygon points="0 0, 6 2.25, 0 4.5" fill="#475569" />
            </marker>
            <marker id="arrowhead-blue" markerWidth="6" markerHeight="4.5" refX="6" refY="2.25" orient="auto" viewBox="0 0 6 4.5">
                <polygon points="0 0, 6 2.25, 0 4.5" fill="#3b82f6" />
            </marker>
            <marker id="arrowhead-green" markerWidth="6" markerHeight="4.5" refX="6" refY="2.25" orient="auto" viewBox="0 0 6 4.5">
                <polygon points="0 0, 6 2.25, 0 4.5" fill="#34d399" />
            </marker>
            <marker id="arrowhead-red" markerWidth="6" markerHeight="4.5" refX="6" refY="2.25" orient="auto" viewBox="0 0 6 4.5">
                <polygon points="0 0, 6 2.25, 0 4.5" fill="#f87171" />
            </marker>
            <marker id="arrowhead-gray" markerWidth="6" markerHeight="4.5" refX="6" refY="2.25" orient="auto" viewBox="0 0 6 4.5">
                <polygon points="0 0, 6 2.25, 0 4.5" fill="#94a3b8" />
            </marker>
            <marker id="arrowhead-yellow" markerWidth="6" markerHeight="4.5" refX="6" refY="2.25" orient="auto" viewBox="0 0 6 4.5">
                <polygon points="0 0, 6 2.25, 0 4.5" fill="#facc15" />
            </marker>
            <marker id="arrowhead-purple" markerWidth="6" markerHeight="4.5" refX="6" refY="2.25" orient="auto" viewBox="0 0 6 4.5">
                <polygon points="0 0, 6 2.25, 0 4.5" fill="#c084fc" />
            </marker>
        </defs>
        
        </svg>

        <!-- Cosine Similarity Panel (HTML Overlay) -->
        <div class="cosine-panel absolute top-[20px] right-[20px] opacity-0 flex flex-col gap-4 pointer-events-none">
             <!-- King vs Queen -->
             <div class="bg-slate-800/90 p-4 rounded-lg border border-green-500/50 flex items-center gap-4 shadow-lg">
                <span class="text-yellow-400 font-bold">King</span>
                <span class="text-slate-400 text-sm">vs</span>
                <span class="text-yellow-400 font-bold">Queen</span>
                <div class="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-green-500 w-[93%]"></div>
                </div>
                <span class="text-green-400 font-bold font-mono">0.93</span>
             </div>

        </div>

    </div>
  </div>
</template>

<style scoped>
/* Utility Classes */
.opacity-0 {
    opacity: 0;
}
</style>
