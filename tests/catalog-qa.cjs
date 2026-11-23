const {chromium}=require(process.env.SAJU_PLAYWRIGHT_PATH || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1280,768,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(process.env.SAJU_QA_URL || 'http://localhost:3002',{waitUntil:'networkidle'});
  assert.equal(await page.locator('.edition-card').count(),8);assert.equal(await page.locator('.discovery-grid').count(),0);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.locator('.edition-art img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));
  assert(await page.locator('.edition-art img').evaluateAll(async imgs=>{await Promise.all(imgs.map(i=>i.decode()));return imgs.every(i=>i.naturalWidth===1200)}));
  if(width===390||width===1280)await page.locator('.catalog-group').first().screenshot({path:`tmp/visual/unified-${width}.png`});
 }
 for(const [index,price] of ['10,000','30,000','200,000'].entries()){
  await page.locator('.edition-card').nth(index).click();const dialog=page.getByRole('dialog');await dialog.waitFor();assert((await dialog.innerText()).includes(price));await page.keyboard.press('Escape');
 }
 await page.locator('.catalog-filters button').nth(1).click();assert.equal(await page.locator('.edition-card').count(),3);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: 8 images, no duplicate cards, four viewports, three checkout prices and basic filter');
})().catch(e=>{console.error(e);process.exit(1)});
