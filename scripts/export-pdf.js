const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const filePath = path.resolve(__dirname, '../public/presentation/index.html');
  await page.goto('file://' + filePath, { waitUntil: 'networkidle' });

  // Wait for fonts/animations to settle
  await page.waitForTimeout(1000);

  // Strip JS transforms and show all slides
  await page.evaluate(() => {
    const slides = Array.from(document.querySelectorAll('.slide'));
    slides.forEach(s => {
      s.style.transition = 'none';
      s.style.transform = 'none';
      s.style.position = 'relative';
      s.style.display = 'flex';
      s.style.width = '100%';
      s.style.minWidth = '0';
    });
    document.querySelector('.nav').style.display = 'none';
    document.getElementById('dots').style.display = 'none';
    document.querySelector('.deck').style.display = 'block';
    document.querySelector('.deck').style.overflow = 'visible';
  });

  await page.pdf({
    path: path.resolve(__dirname, '../presentation.pdf'),
    width: '1280px',
    height: '800px',
    printBackground: true,
    pageRanges: '',
  });

  await browser.close();
  console.log('PDF saved to presentation.pdf');
})();
