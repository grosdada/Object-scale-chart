const { test } = require('node:test');
const assert = require('node:assert/strict');
const { autoCutout } = require('../cutout.js');

function image(width,height,pixel){const data=new Uint8ClampedArray(width*height*4);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const rgba=pixel(x,y),i=(y*width+x)*4;data.set(rgba,i);}return{data,width,height};}
const alphaAt=(img,x,y)=>img.data[(y*img.width+x)*4+3];

test('automatic cutout removes a plain background and keeps the centred subject',()=>{
  const img=image(100,160,(x,y)=>x>=35&&x<65&&y>=18&&y<150?[220,55,25,255]:[245,245,242,255]);
  const result=autoCutout(img,55);
  assert.equal(result.skipped,false);assert.ok(result.removedRatio>.65);assert.equal(alphaAt(img,5,5),0);assert.equal(alphaAt(img,50,80),255);
});

test('automatic cutout follows a light background gradient',()=>{
  const img=image(120,100,(x,y)=>x>=37&&x<83&&y>=14&&y<90?[30,70,165,255]:[205+Math.round(x/8),210+Math.round(y/10),218,255]);
  const result=autoCutout(img,68);
  assert.equal(result.skipped,false);assert.equal(alphaAt(img,2,50),0);assert.equal(alphaAt(img,60,50),255);
});

test('a subject touching one edge is protected from edge colour learning',()=>{
  const img=image(100,120,(x,y)=>x>=35&&x<65&&y>=20?[210,45,35,255]:[250,250,250,255]);
  const result=autoCutout(img,55);
  assert.equal(result.skipped,false);assert.equal(alphaAt(img,50,119),255);assert.equal(alphaAt(img,5,119),0);
});

test('existing transparency is left untouched',()=>{
  const img=image(50,50,(x,y)=>x>9&&x<40&&y>5&&y<45?[70,80,90,255]:[0,0,0,0]);
  const before=img.data.slice(),result=autoCutout(img,55);
  assert.equal(result.skipped,true);assert.match(result.message,/Transparence/);assert.deepEqual(img.data,before);
});

test('an ambiguous full-frame image is never erased',()=>{
  const img=image(40,40,()=>[120,120,120,255]);const result=autoCutout(img,90);
  assert.equal(result.skipped,true);assert.ok(img.data.some((value,i)=>i%4===3&&value===255));
});
