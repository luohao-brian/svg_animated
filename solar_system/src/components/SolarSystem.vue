<template>
  <div class="w-full h-screen bg-slate-900 flex items-center justify-center overflow-hidden relative">
    <!-- Starry background -->
    <div class="absolute inset-0 opacity-50" style="background-image: radial-gradient(white 1px, transparent 1px); background-size: 50px 50px;"></div>
    
    <div class="relative w-full h-full flex items-center justify-center">
      <!-- Info Panel -->
      <div v-if="hoveredPlanet" class="absolute top-4 left-4 z-10 bg-black/80 text-white p-4 rounded border border-slate-700 backdrop-blur-sm pointer-events-none transition-opacity duration-200 min-w-[200px]">
        <h3 class="text-xl font-bold mb-2" :style="{ color: hoveredPlanet.color }">{{ hoveredPlanet.name }}</h3>
        <div class="space-y-1 text-sm text-slate-300">
          <p class="flex justify-between"><span>轨道半径:</span> <span>{{ hoveredPlanet.realOrbit }} AU</span></p>
          <p class="flex justify-between"><span>星球半径:</span> <span>{{ hoveredPlanet.realRadius }} km</span></p>
          <p class="flex justify-between"><span>公转周期:</span> <span>{{ hoveredPlanet.period }} 年</span></p>
        </div>
      </div>

      <!-- ViewBox increased to accommodate larger orbits -->
      <svg class="w-full h-full" viewBox="-600 -600 1200 1200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="sunGradient">
            <stop offset="0%" stop-color="#FFF" />
            <stop offset="50%" stop-color="#FDB813" />
            <stop offset="100%" stop-color="#F59E0B" />
          </radialGradient>
          
          <radialGradient 
            v-for="planet in planets" 
            :key="`grad-${planet.name}`" 
            :id="`grad-${planet.name}`"
            cx="30%" cy="50%" r="70%" fx="30%" fy="50%"
          >
            <stop offset="0%" :stop-color="planet.color" stop-opacity="1" />
            <stop offset="100%" stop-color="#000" stop-opacity="0.8" />
          </radialGradient>
        </defs>

        <!-- Sun -->
        <g>
          <circle cx="0" cy="0" r="45" fill="url(#sunGradient)" class="drop-shadow-[0_0_50px_rgba(253,184,19,0.5)]" />
          <text x="0" y="65" fill="white" font-size="14" font-weight="bold" text-anchor="middle" class="font-sans opacity-90 drop-shadow-md">太阳</text>
        </g>

        <!-- Orbits -->
        <g v-for="planet in planets" :key="`orbit-${planet.name}`">
           <circle 
            cx="0" 
            cy="0" 
            :r="planet.orbit" 
            fill="none" 
            stroke="rgba(255,255,255,0.08)" 
            stroke-width="1"
            stroke-dasharray="4 4"
          />
        </g>

        <!-- Planets -->
        <g v-for="(planet, index) in planets" :key="planet.name">
          <!-- Main Planet Container Group: Handles Events & Position -->
          <g 
            :transform="`translate(${getPlanetX(planet)}, ${getPlanetY(planet)})`"
            class="cursor-pointer"
            @mouseenter="hoveredPlanet = planet"
            @mouseleave="hoveredPlanet = null"
          >
            <!-- Invisible Hit Area (Larger than smallest planets) -->
            <circle cx="0" cy="0" r="25" fill="transparent" />

            <!-- Planet Rotation Wrapper -->
            <g :transform="`rotate(${(time * planet.speed * 180 / Math.PI)})`">
              
              <!-- Rings -->
              <ellipse 
                v-if="planet.rings"
                cx="0" cy="0" 
                :rx="planet.rings.rx" 
                :ry="planet.rings.ry"
                fill="none" 
                :stroke="planet.rings.color" 
                :stroke-width="planet.rings.width"
                opacity="0.7"
                transform="rotate(-15)" 
              />

              <!-- Planet Body -->
              <circle
                cx="0" cy="0"
                :r="planet.radius"
                :fill="`url(#grad-${planet.name})`"
                class="transition-transform duration-200 ease-out"
                :class="{ 'scale-125': hoveredPlanet === planet }"
                stroke="rgba(255,255,255,0.1)"
                stroke-width="0.5"
              />
            </g>

            <!-- Planet Label -->
            <text 
              :y="planet.radius + (planet.rings ? planet.rings.ry + 8 : 10)" 
              fill="#e2e8f0" 
              font-size="10" 
              text-anchor="middle" 
              class="font-sans select-none drop-shadow-md font-medium tracking-wide"
              :class="{ 'text-white font-bold': hoveredPlanet === planet }"
            >
              {{ planet.name }}
            </text>
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// Scaled data for visualization (viewBox units)
// Real data included for display
const planets = ref([
  // Inner Planets (Spaced out slightly more than reality for visibility, but keeping relative order)
  { 
    name: '水星', radius: 3, orbit: 65, color: '#A5A5A5', speed: 0.04, 
    realOrbit: 0.39, realRadius: 2440, period: 0.24 
  },
  { 
    name: '金星', radius: 6, orbit: 90, color: '#E3BB76', speed: 0.015,
    realOrbit: 0.72, realRadius: 6052, period: 0.62 
  },
  { 
    name: '地球', radius: 6.5, orbit: 120, color: '#4F4CB0', speed: 0.01,
    realOrbit: 1.00, realRadius: 6371, period: 1.00 
  },
  { 
    name: '火星', radius: 4, orbit: 150, color: '#E27B58', speed: 0.008,
    realOrbit: 1.52, realRadius: 3390, period: 1.88 
  },
  
  // Outer Planets (Logarithmic-ish spacing)
  { 
    name: '木星', radius: 24, orbit: 240, color: '#D39C7E', speed: 0.004,
    realOrbit: 5.20, realRadius: 69911, period: 11.86 
  },
  { 
    name: '土星', radius: 20, orbit: 320, color: '#C5AB6E', speed: 0.003,
    realOrbit: 9.54, realRadius: 58232, period: 29.45,
    rings: { color: '#C5AB6E', width: 3, rx: 36, ry: 10 } // Rings ~1.8x - 2.x radius
  },
  { 
    name: '天王星', radius: 12, orbit: 400, color: '#BBE1E4', speed: 0.002,
    realOrbit: 19.19, realRadius: 25362, period: 84.02,
    rings: { color: '#BBE1E4', width: 1.5, rx: 18, ry: 4 }
  },
  { 
    name: '海王星', radius: 11, orbit: 470, color: '#6081FF', speed: 0.001,
    realOrbit: 30.07, realRadius: 24622, period: 164.79 
  },
  { 
    name: '冥王星', radius: 2, orbit: 540, color: '#968570', speed: 0.0008,
    realOrbit: 39.48, realRadius: 1188, period: 248.00 
  }
]);

const hoveredPlanet = ref(null);
const time = ref(0);
let animationFrameId;

const animate = () => {
  if (!isPaused.value) {
    if (!hoveredPlanet.value) {
      time.value += 1;
    }
    animationFrameId = requestAnimationFrame(animate);
  }
};

const isPaused = ref(false);

const getPlanetX = (planet) => Math.cos(time.value * planet.speed) * planet.orbit;
const getPlanetY = (planet) => Math.sin(time.value * planet.speed) * planet.orbit;

onMounted(() => {
  animate();
  
  // Expose control for recording
  window.solarSystem = {
    pause: () => {
      isPaused.value = true;
      cancelAnimationFrame(animationFrameId);
    },
    resume: () => {
      isPaused.value = false;
      animate();
    },
    step: () => {
      time.value += 1;
    }
  };
});

onUnmounted(() => {
  cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
/* Optional: Add a glow effect to the sun using standard CSS if tailwind doesn't cover it fully (Tailwind has drop-shadow) */
</style>