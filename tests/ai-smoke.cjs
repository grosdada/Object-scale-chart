// Optional network-backed smoke test. The model downloads once; image inference stays local.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const fixture=process.env.AI_TEST_IMAGE;if(!fixture)throw Error('Set AI_TEST_IMAGE to a local PNG, JPEG or WebP fixture.');
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1100,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});page.on('requestfailed',request=>errors.push(`${request.url()}: ${request.failure()?.errorText}`));
  await page.goto('http://127.0.0.1:4173');
  await page.locator('#import-tab').click();
  assert.equal(await page.locator('#cutout-method').inputValue(),'ai');
  await page.locator('#subject-file').setInputFiles(fixture);
  try{await page.waitForFunction(()=>/terminé|complete/i.test(document.getElementById('cutout-status').textContent),null,{timeout:180000});}catch(error){console.error('STATUS',await page.locator('#cutout-status').textContent());console.error('ERROR',await page.locator('#import-error').textContent());console.error('BROWSER',errors);throw error;}
  await page.waitForFunction(()=>!document.getElementById('add-import').disabled,null,{timeout:30000});
  assert.match(await page.locator('#import-preview').getAttribute('src'),/^data:image\/png;base64,/);
  const result=await page.locator('#import-preview').getAttribute('src');fs.writeFileSync('test-results/ai-cutout.png',Buffer.from(result.split(',')[1],'base64'));await page.screenshot({path:'test-results/ai-import.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('Local AI cutout smoke test passed.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
