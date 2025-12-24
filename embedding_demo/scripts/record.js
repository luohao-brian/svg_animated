import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const OUTPUT_DIR = path.join(__dirname, '../video_records');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'embedding_demo.mp4');
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

  console.log(`[2/4] Navigating to ${TARGET_URL}...`);
  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });
  } catch (e) {
    console.error('Error connecting to ' + TARGET_URL);
    console.error('Please ensure the dev server is running: npm run dev');
    process.exit(1);
  }

  // Wait for the app to expose the control interface
  const globalName = 'embedding_demo';
  console.log(`Waiting for window.${globalName}...`);
  
  try {
      await page.waitForFunction((name) => !!window[name], { timeout: 10000 }, globalName);
  } catch (e) {
      console.error(`Timeout waiting for window.${globalName}. Check if App.vue exposes it correctly.`);
      process.exit(1);
  }

  // Pause the internal animation loop to prevent fighting
  await page.evaluate((name) => window[name].setPaused(true), globalName);

  // Get animation duration
  const durationMs = await page.evaluate((name) => window[name].getDuration(), globalName) || 5000; // Default 5s if 0
  const totalFrames = Math.ceil((durationMs / 1000) * FPS);
  console.log(`[Info] Animation Cycle: ${durationMs}ms, Total Frames: ${totalFrames}`);

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
    // console.log(`FFmpeg: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`[4/4] FFmpeg process finished with code ${code}`);
    if (code === 0) {
        console.log(`Video saved to: ${OUTPUT_FILE}`);
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
      process.stdout.write(`\rRecording frame ${i + 1}/${totalFrames} (${Math.round((i/totalFrames)*100)}%)`);
    }
  }

  process.stdout.write('\n');
  console.log('Finalizing video...');
  
  ffmpeg.stdin.end();
  
  // Wait for FFmpeg to finish
  await new Promise((resolve) => {
    ffmpeg.on('close', resolve);
  });

  await browser.close();
}

record();
