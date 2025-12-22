import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Config
const TOTAL_FRAMES = 600; // 10 seconds at 60fps
const VIEWPORT = { width: 3840, height: 2160 }; // 4K for super-sampling
const OUTPUT_DIR = 'video_records';
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'solar_system.mp4');
const URL = 'http://localhost:5174/'; // Ensure your dev server is running

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  console.log(`[${timestamp}] [${level}] ${message}`);
}

async function record() {
  log('INFO', 'Launching browser...');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)){
      fs.mkdirSync(OUTPUT_DIR);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Listen for console logs
  page.on('console', msg => log('PAGE_LOG', msg.text()));
  page.on('pageerror', err => log('PAGE_ERROR', err));
  page.on('requestfailed', request => log('PAGE_REQ_FAIL', `${request.failure().errorText} ${request.url()}`));

  log('INFO', `Navigating to ${URL}...`);
  await page.goto(URL, { waitUntil: 'networkidle0' });

  // Wait for the solarSystem object to be available
  log('INFO', 'Waiting for window.solarSystem...');
  await page.waitForFunction(() => window.solarSystem, { timeout: 60000 });

  // Pause the animation initially
  log('INFO', 'Pausing animation...');
  await page.evaluate(() => window.solarSystem.pause());

  // Setup FFmpeg
  const ffmpeg = spawn('ffmpeg', [
    '-y', // Overwrite output file
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', '60', // Input framerate
    '-i', '-', // Input from stdin
    '-vf', 'scale=1920:1080:flags=bicubic', // Downscale from 4K to 1080p
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'veryslow', // High quality preset
    '-crf', '18', // High quality CRF
    OUTPUT_FILE
  ]);

  ffmpeg.stderr.on('data', (data) => {
     // log('FFMPEG', data.toString().trim()); // Optional: verbose FFmpeg logs
  });

  log('INFO', `Recording ${TOTAL_FRAMES} frames...`);

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    // Capture screenshot
    const buffer = await page.screenshot({ type: 'png', omitBackground: true });
    
    // Write to FFmpeg
    if (!ffmpeg.stdin.write(buffer)) {
      await new Promise(resolve => ffmpeg.stdin.once('drain', resolve));
    }

    // Step animation
    await page.evaluate(() => window.solarSystem.step());
    
    // Progress
    if (i % 60 === 0) {
      log('PROGRESS', `${Math.round((i / TOTAL_FRAMES) * 100)}% (${i}/${TOTAL_FRAMES})`);
    }
  }

  log('INFO', 'Finalizing video...');
  
  // Close FFmpeg stream
  ffmpeg.stdin.end();

  // Wait for FFmpeg to finish
  await new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        log('SUCCESS', `Saved video to ${path.resolve(OUTPUT_FILE)}`);
        resolve();
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });
  });

  await browser.close();
}

record().catch(err => log('ERROR', err));
