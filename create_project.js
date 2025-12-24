const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectName = process.argv[2];

if (!projectName) {
  console.error('Please provide a project name.');
  process.exit(1);
}

const projectRoot = path.join(process.cwd(), projectName);

if (fs.existsSync(projectRoot)) {
  console.error(`Directory ${projectName} already exists.`);
  process.exit(1);
}

console.log(`Scaffolding project: ${projectName}...`);

// 1. Create Directories
fs.mkdirSync(projectRoot);
fs.mkdirSync(path.join(projectRoot, 'src'));
fs.mkdirSync(path.join(projectRoot, 'public'));
fs.mkdirSync(path.join(projectRoot, 'scripts'));

// 2. Write Files

// 2.1 package.json (Dependencies matched with mnist_demo)
const packageJson = {
  "name": projectName,
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "record": "node scripts/record.js"
  },
  "dependencies": {
    "animejs": "^3.2.2",
    "vue": "^3.5.13"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "puppeteer": "^23.11.1",
    "tailwindcss": "^3.4.17",
    "vite": "^6.0.5"
  }
};

fs.writeFileSync(path.join(projectRoot, 'package.json'), JSON.stringify(packageJson, null, 2));

// 2.2 vite.config.js
const viteConfig = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    // Use 0 to allow random free port if 5173 is taken, but for consistency we try 5173 first
    // or let Vite handle it. 
    // mnist_demo uses default.
  }
})
`;
fs.writeFileSync(path.join(projectRoot, 'vite.config.js'), viteConfig);

// 2.3 index.html
const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
fs.writeFileSync(path.join(projectRoot, 'index.html'), indexHtml);

// 2.4 src/main.js
const mainJs = `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
`;
fs.writeFileSync(path.join(projectRoot, 'src/main.js'), mainJs);

// 2.5 src/style.css (Matched mnist_demo + SimHei font)
const styleCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background-color: #0f172a; /* Slate 900 - consistent with mnist_demo */
  color: white;
  overflow: hidden;
  font-family: "SimHei", "黑体", "Microsoft YaHei", sans-serif;
}

#app {
  width: 100%;
  height: 100%;
}
`;
fs.writeFileSync(path.join(projectRoot, 'src/style.css'), styleCss);

// 2.6 tailwind.config.js
const tailwindConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`;
fs.writeFileSync(path.join(projectRoot, 'tailwind.config.js'), tailwindConfig);

// 2.7 postcss.config.js
const postcssConfig = `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
fs.writeFileSync(path.join(projectRoot, 'postcss.config.js'), postcssConfig);

// 2.8 src/App.vue
// Generate a safe JS variable name for the project (e.g., my-project -> my_project)
const safeProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '_');

const appVue = `<script setup>
import { onMounted, ref } from 'vue'
import anime from 'animejs'

const tl = ref(null)

onMounted(() => {
  // Initialize Timeline
  tl.value = anime.timeline({
    autoplay: false, // Controlled by record script
    easing: 'linear'
  })

  // Example Animation: Fade In
  tl.value.add({
    targets: '.title',
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 2000,
    easing: 'easeOutExpo'
  })

  // Expose control interface for recording
  // Consistent with mnist_demo pattern
  window.${safeProjectName} = {
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
  <div class="w-full h-full flex items-center justify-center">
    <h1 class="title text-6xl font-bold">
      ${projectName}
    </h1>
  </div>
</template>
`;
fs.writeFileSync(path.join(projectRoot, 'src/App.vue'), appVue);

// 2.9 scripts/record.js
// Based on mnist_demo/scripts/record.js but adapted
const recordJs = `import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../video_records');
const OUTPUT_FILE = path.join(OUTPUT_DIR, '${projectName}.mp4');
// We assume default Vite port or we can try to find it. 
// For simplicity, we'll try a few ports or require user to specify.
// mnist_demo hardcodes http://localhost:5176/ but that's risky.
// Let's default to 5173 but allow override or check logs? 
// For now, let's use a robust default and maybe an arg.
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:5173/'; 
const VIEWPORT = { width: 1920, height: 1080 };
const FPS = 60;

async function record() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('[1/4] Launching browser...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  console.log(\`[2/4] Navigating to \${TARGET_URL}...\`);
  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });
  } catch (e) {
    console.error('Error connecting to ' + TARGET_URL);
    console.error('Please ensure the dev server is running: npm run dev');
    process.exit(1);
  }

  // Wait for the app to expose the control interface
  const globalName = '${safeProjectName}';
  console.log(\`Waiting for window.\${globalName}...\`);
  
  try {
      await page.waitForFunction((name) => !!window[name], { timeout: 10000 }, globalName);
  } catch (e) {
      console.error(\`Timeout waiting for window.\${globalName}. Check if App.vue exposes it correctly.\`);
      process.exit(1);
  }

  // Pause the internal animation loop to prevent fighting
  await page.evaluate((name) => window[name].setPaused(true), globalName);

  // Get animation duration
  const durationMs = await page.evaluate((name) => window[name].getDuration(), globalName) || 5000; // Default 5s if 0
  const totalFrames = Math.ceil((durationMs / 1000) * FPS);
  console.log(\`[Info] Animation Cycle: \${durationMs}ms, Total Frames: \${totalFrames}\`);

  console.log('[3/4] Starting recording process...');
  
  // Setup FFmpeg process
  const ffmpegArgs = [
    '-y', // Overwrite output
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', FPS,
    '-i', '-', // Input from stdin
    '-c:v', 'libx264',
    '-preset', 'veryslow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    OUTPUT_FILE
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);
  
  ffmpeg.stderr.on('data', (data) => {
    // console.log(\`FFmpeg: \${data}\`);
  });

  ffmpeg.on('close', (code) => {
    console.log(\`[4/4] FFmpeg process finished with code \${code}\`);
    if (code === 0) {
        console.log(\`Video saved to: \${OUTPUT_FILE}\`);
    }
  });

  // Frame Capture Loop
  for (let i = 0; i < totalFrames; i++) {
    const timestamp = (i / FPS) * 1000;
    
    // 1. Advance animation state
    await page.evaluate((name, t) => {
      window[name].step(t);
    }, globalName, timestamp);

    // 2. Capture screenshot (buffer)
    const screenshotBuffer = await page.screenshot({ format: 'png' });

    // 3. Pipe to FFmpeg
    const canWrite = ffmpeg.stdin.write(screenshotBuffer);
    if (!canWrite) {
      await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
    }

    // Progress logging
    if (i % 60 === 0) {
      process.stdout.write(\`\\rRecording frame \${i + 1}/\${totalFrames} (\${Math.round((i/totalFrames)*100)}%)\`);
    }
  }

  process.stdout.write('\\n');
  console.log('Finalizing video...');
  
  ffmpeg.stdin.end();
  
  // Wait for FFmpeg to finish
  await new Promise((resolve) => {
    ffmpeg.on('close', resolve);
  });

  await browser.close();
}

record();
`;
fs.writeFileSync(path.join(projectRoot, 'scripts/record.js'), recordJs);

// 4. Install Dependencies
console.log('Installing dependencies...');
try {
  // Use npm install with stdio inherit to show progress but it should be automated
  execSync('npm install', { cwd: projectRoot, stdio: 'inherit' });
} catch (e) {
  console.error('Error installing dependencies:', e);
  process.exit(1);
}

console.log(`\nProject ${projectName} created successfully!`);
console.log(`\nTo get started:\n  cd ${projectName}\n  npm run dev`);
