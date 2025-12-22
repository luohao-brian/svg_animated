import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  console.log('Navigating...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
  
  // Wait for Vue to mount
  await new Promise(r => setTimeout(r, 1000));

  // Take snapshots at different progress points
  const points = [0, Math.PI, 3*Math.PI/2, 2*Math.PI];
  
  for (let i = 0; i < points.length; i++) {
    const val = points[i];
    console.log(`Snapshotting at x=${val.toFixed(2)}...`);
    
    // Manually set progress via exposed API
    await page.evaluate((v) => {
      // Assuming 2*PI is the full cycle in logic
      const progressRatio = v / (2 * Math.PI + 0.5); 
      // Actually our step function takes time ratio.
      // progress.value = t * 2 * Math.PI;
      // So t = val / (2*PI)
      // window.derivativeDemo.step(t * DURATION)
      
      // Better: let's just hack the progress ref if possible, 
      // or use the step function which maps time -> progress.
      // step(t) => progress = (t/D) * 2PI
      // We want progress = val.
      // val = (t/D) * 2PI => t = (val / 2PI) * D
      
      const D = window.derivativeDemo.getDuration();
      const t = (v / (2 * Math.PI)) * D;
      window.derivativeDemo.step(t);
    }, val);
    
    await page.screenshot({ path: `derivative_demo/snapshot_${i}.png` });
  }

  await browser.close();
  console.log('Done.');
})();
