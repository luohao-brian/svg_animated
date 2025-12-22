import puppeteer from 'puppeteer';

(async () => {
  console.log('Test: Launching browser...');
  try {
    const browser = await puppeteer.launch({
      headless: true, // Explicitly true
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('Test: Browser launched.');
    
    const page = await browser.newPage();
    console.log('Test: Page created. Navigating to http://localhost:5174/');
    
    await page.goto('http://localhost:5174/', { timeout: 10000 });
    console.log('Test: Navigation successful.');
    
    const title = await page.title();
    console.log('Test: Page title is', title);
    
    await browser.close();
    console.log('Test: Done.');
  } catch (err) {
    console.error('Test Failed:', err);
  }
})();
