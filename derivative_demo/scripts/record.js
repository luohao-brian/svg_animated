import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const OUTPUT_DIR = 'video_records';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'derivative_demo.mp4');
const TARGET_URL = 'http://localhost:5173/'; // Assuming dev server port
const VIEWPORT = { width: 3840, height: 2160 }; // 4K for super-sampling
const FPS = 60;
// We will retrieve duration from the page, but set a safety fallback
const MAX_FRAMES = 60 * 60; // Max 1 minute just in case

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
  await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });

  // Wait for the app to expose the control interface
  await page.waitForFunction(() => !!window.derivativeDemo);

  // Get animation duration
  const durationMs = await page.evaluate(() => window.derivativeDemo.getDuration());
  // Use 15 seconds as a fixed recording length for "shorter video" with "slow movement"
  const recordMs = 25000; 
  const totalFrames = Math.ceil((recordMs / 1000) * FPS);
  console.log(`[Info] Animation Cycle: ${durationMs}ms, Recording Duration: ${recordMs}ms, Total Frames: ${totalFrames}`);

  console.log('[3/4] Starting recording process...');
  
  // Setup FFmpeg process
  const ffmpegArgs = [
    '-y', // Overwrite output
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', FPS,
    '-i', '-', // Input from stdin
    '-vf', 'scale=1920:1080:flags=bicubic', // Downsample to 1080p
    '-c:v', 'libx264',
    '-preset', 'veryslow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    OUTPUT_FILE
  ];

  const ffmpeg = spawn('ffmpeg', ffmpegArgs);
  
  ffmpeg.stderr.on('data', (data) => {
    // Uncomment for verbose ffmpeg logs
    // console.log(`FFmpeg: ${data}`);
  });

  ffmpeg.on('close', (code) => {
    console.log(`[4/4] FFmpeg process finished with code ${code}`);
  });

  // Frame Capture Loop
  for (let i = 0; i < totalFrames; i++) {
    const timestamp = (i / FPS) * 1000;
    
    // 1. Advance animation state
    await page.evaluate((t) => {
      window.derivativeDemo.step(t);
    }, timestamp);

    // 2. Capture screenshot (buffer)
    const screenshotBuffer = await page.screenshot({ format: 'png' });

    // 3. Pipe to FFmpeg
    const canWrite = ffmpeg.stdin.write(screenshotBuffer);
    if (!canWrite) {
      await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
    }

    // Progress logging
    if (i % 30 === 0) {
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
  console.log(`Successfully saved video to: ${OUTPUT_FILE}`);
}

record().catch(console.error);
