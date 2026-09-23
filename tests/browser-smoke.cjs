// Optional end-to-end verification: PLAYWRIGHT_MODULE and BROWSER_PATH can point to local installations.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{channel:'msedge'})});
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://api.github.com/repos/grosdada/Object-scale-chart/releases/latest',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({tag_name:'v1.2.0',html_url:'https://github.com/grosdada/Object-scale-chart/releases/tag/v1.2.0',assets:[{name:'Echelle-1.2.0-portable.exe',browser_download_url:'https://github.com/grosdada/Object-scale-chart/releases/download/v1.2.0/Echelle-1.2.0-portable.exe'}]})}));
  await page.goto('http://127.0.0.1:4173');await page.waitForSelector('.subject');
  await page.waitForTimeout(700);
  fs.mkdirSync('test-results',{recursive:true});
  await page.screenshot({path:'test-results/desktop.png',fullPage:true});
  assert.equal(await page.locator('.scene-row').count(),3);
  assert.equal(await page.locator('.preset-card').count(),6);
  const groundGap=await page.evaluate(()=>{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS(svg.namespaceURI,'path');svg.style.cssText='position:absolute;visibility:hidden';svg.append(path);document.body.append(svg);let worst={id:'',gap:0};for(const[id,vector]of Object.entries(SUBJECT_VECTORS)){svg.setAttribute('viewBox',vector.viewBox);path.setAttribute('d',vector.d);const box=path.getBBox(),height=Number(vector.viewBox.split(' ')[3]),gap=Math.abs(height-box.y-box.height);if(gap>worst.gap)worst={id,gap};}svg.remove();return worst;});assert.ok(groundGap.gap<1.1,`vector ground gap ${groundGap.id}: ${groundGap.gap}`);
  assert.equal(await page.locator('[data-ui-language="en"]').getAttribute('aria-pressed'),'true');
  assert.match(await page.locator('#preset-tab').textContent(),/Library/);
  await page.locator('[data-ui-language="fr"]').click();assert.match(await page.locator('#preset-tab').textContent(),/Bibliothèque/);
  await page.locator('[data-ui-language="en"]').click();assert.match(await page.locator('#preset-tab').textContent(),/Library/);
  await page.locator('#ui-theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');await page.screenshot({path:'test-results/night.png',fullPage:true});
  await page.locator('#ui-theme-toggle').click();assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
  await page.locator('#update-button').click();await page.waitForFunction(()=>document.getElementById('update-button').textContent.includes('1.2.0'));assert.match(await page.locator('#update-button').textContent(),/Download v1.2.0/);
  const initialPrompt=await page.locator('#prompt-output').inputValue();assert.match(initialPrompt,/Average man/);
  await page.locator('#edit-size').fill('3.6');await page.locator('#edit-size').press('Tab');
  assert.match(await page.locator('#prompt-output').inputValue(),/height 3.6 m/);
  await page.locator('#undo-button').click();assert.equal(await page.locator('#edit-size').inputValue(),'1.8');
  await page.locator('#search').fill('Pétrolier');await page.getByRole('button',{name:'Add Oil tanker',exact:true}).click();
  assert.equal(await page.locator('.scene-row').count(),4);assert.match(await page.locator('#prompt-output').inputValue(),/length \/ width 330 m/);
  assert.ok((await page.locator('.subject').last().locator('svg > path').first().getAttribute('d')).startsWith('M '));
  const chart=await page.locator('#board').evaluate(el=>({width:el.viewBox.baseVal.width,subjects:[...el.querySelectorAll('g.subject')].map(g=>({name:g.querySelector('title').textContent,w:+g.querySelector('svg').getAttribute('width'),h:+g.querySelector('svg').getAttribute('height')}))}));
  assert.ok(Math.abs(chart.subjects[3].w/chart.subjects[0].h-330/1.8)<1e-8);
  await page.screenshot({path:'test-results/tanker.png',fullPage:true});
  await page.locator('#appearance-toggle').click();await page.locator('#theme-blueprint').click();
  assert.equal(await page.locator('#board > rect').getAttribute('fill'),'#234d7f');
  await page.locator('#export-button').click();
  const svgDownload=page.waitForEvent('download');await page.locator('#download-svg').click();const svg=await svgDownload;await svg.saveAs('test-results/export.svg');
  const svgText=fs.readFileSync('test-results/export.svg','utf8');assert.match(svgText,/#234d7f/);assert.match(svgText,/#a2bddc/);assert.doesNotMatch(svgText,/resize-handle/);
  const pngDownload=page.waitForEvent('download');await page.locator('#download-png').click();const png=await pngDownload;await png.saveAs('test-results/export.png');assert.ok(fs.statSync('test-results/export.png').size>10000);
  const promptDownload=page.waitForEvent('download');await page.locator('#download-prompt').click();await(await promptDownload).saveAs('test-results/prompt.txt');
  await page.locator('#export-dialog .dialog-close').click();
  await page.locator('#undo-button').click();await page.locator('#undo-button').click();
  // Resize a selected generated preset using the SVG handle.
  await page.locator('.scene-row').first().click();const before=Number(await page.locator('#edit-size').inputValue());const handle=page.locator('[data-resize="right"]');const box=await handle.boundingBox();
  await page.mouse.move(box.x+5,box.y+5);await page.mouse.down();await page.mouse.move(box.x+20,box.y-35,{steps:8});await page.mouse.up();assert.ok(Number(await page.locator('#edit-size').inputValue())>before);
  await page.locator('#undo-button').click();
  // Raster fixture with an opaque background and a tall subject, then local background removal.
  const pngBuffer=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=100;c.height=200;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,100,200);x.fillStyle='#ff4500';x.fillRect(35,20,30,160);return c.toDataURL().split(',')[1];});
  fs.writeFileSync('test-results/subject.png',Buffer.from(pngBuffer,'base64'));
  await page.locator('#import-tab').click();await page.locator('#subject-file').setInputFiles('test-results/subject.png');await page.locator('#add-import').waitFor({state:'visible'});await page.waitForFunction(()=>document.getElementById('cutout-status').textContent.includes('Fond retiré'));
  await page.waitForFunction(()=>!document.getElementById('add-import').disabled);assert.match(await page.locator('#cutout-status').textContent(),/Fond retiré/);
  await page.locator('#import-name').fill('Sujet importé');await page.locator('#import-size').fill('2');await page.locator('#add-import').click();
  assert.equal(await page.locator('.scene-row').count(),4);assert.match(await page.locator('#prompt-output').inputValue(),/Sujet importé/);
  const imported=await page.locator('#board image').evaluate(el=>({width:+el.getAttribute('width'),height:+el.getAttribute('height')}));assert.ok(Math.abs(imported.width/imported.height-30/160)<1e-6);
  await page.waitForTimeout(800);await page.reload();await page.waitForFunction(()=>document.querySelectorAll('.scene-row').length===4);assert.equal(await page.locator('#board image').count(),1);
  // Export an image containing the imported raster too.
  await page.locator('#export-button').click();const rasterDownload=page.waitForEvent('download');await page.locator('#download-png').click();await(await rasterDownload).saveAs('test-results/import-export.png');await page.locator('#export-dialog .dialog-close').click();
  // Enforce the 15-human limit independently of other subjects.
  await page.getByRole('button',{name:'Sujet importé',exact:false}).filter({has:page.locator('.scene-row-info')}).click();
  for(let i=0;i<12;i++)await page.locator('#duplicate-subject').click();
  assert.equal(await page.locator('#human-count').textContent(),'15 / 15 humans');
  await page.locator('#duplicate-subject').click();assert.match(await page.locator('#toast').textContent(),/15 sujets humains/);
  // A fresh context for responsive screenshots.
  const mobile=await browser.newContext({viewport:{width:390,height:844}});const m=await mobile.newPage();await m.goto('http://127.0.0.1:4173');await m.waitForSelector('.subject');await m.screenshot({path:'test-results/mobile.png',fullPage:true});
  const overflow=await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false);
  assert.deepEqual(errors,[]);console.log('Browser checks passed: render, scale, undo, resize, import, cutout, persistence, export, human limit, mobile.');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
