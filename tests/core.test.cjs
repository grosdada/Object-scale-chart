const {test} = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
const catalogue = require('../catalogue.js');
const Shapes = require('../shapes.js');
const project = items => ({version:1,title:'Test',items,settings:{...C.defaults},promptOverride:null});
test('catalogue: exact counts and unique original SVG presets',()=>{
  assert.equal(catalogue.length,136);
  assert.deepEqual(catalogue.reduce((a,s)=>(a[s.category]=(a[s.category]||0)+1,a),{}),{human:6,animal:30,vehicle:50,building:50});
  assert.equal(new Set(catalogue.map(s=>s.id)).size,136);
  for(const p of catalogue){assert.ok(p.width>0&&p.height>0);assert.ok(Shapes.markup(p).length>50);assert.ok(!Shapes.markup(p).includes('NaN'));}
});
test('one scale preserves human vs tanker dimensions across layout and resizing',()=>{
  const man=C.fromPreset(catalogue[1]),tanker=C.fromPreset(catalogue.find(p=>p.name==='Pétrolier'));
  const items=C.arrange([man,tanker]),l=C.layout(items,1200,700);
  assert.ok(Math.abs(l.positions[1].w/l.positions[0].h-330/1.8)<1e-9);
  assert.ok(Math.abs(l.positions[1].h/l.positions[0].h-45/1.8)<1e-9);
  const resized={...tanker,size:660};assert.equal(C.dimensions(resized).height,90);
  for(const p of l.positions){assert.ok(p.x>=0);assert.ok(p.x+p.w<=1200);assert.ok(p.y>=0);}
});
test('units change presentation, never world geometry',()=>{
  const a=C.fromPreset(catalogue[1]);const b={...a,unit:'cm'};
  assert.deepEqual(C.dimensions(a),C.dimensions(b));assert.match(C.dimensionText(b),/180 cm/);
});
test('prompt compares heights even when vehicles are measured by length',()=>{
  const man=C.fromPreset(catalogue[1]),tanker=C.fromPreset(catalogue.find(p=>p.name==='Pétrolier'));
  const p=project(C.arrange([man,tanker]));const text=C.prompt(p);
  assert.match(text,/length \/ width 330 m/);assert.match(text,/25 times as tall/);assert.doesNotMatch(text,/183.33 times as tall/);
  p.settings.referenceId=tanker.id;p.settings.language='fr';assert.match(C.prompt(p),/0.04 fois celle/);
});
test('project round trip keeps visual settings, images and edited prompt',()=>{
  const p=project([C.fromPreset(catalogue[0])]);p.settings.background='#112233';p.settings.gridColor='#aabbcc';p.promptOverride='Mon instruction';
  assert.deepEqual(C.validateProject(JSON.parse(JSON.stringify(p)),catalogue),p);
  const image={...p.items[0],id:'image-1',image:'data:image/png;base64,aGVsbG8=',aspect:2};delete image.presetId;p.items.push(image);
  assert.equal(C.validateProject(p,catalogue).items[1].image,image.image);
});
test('reject unsafe project data and human overflow without losing existing state',()=>{
  const item=C.fromPreset(catalogue[1]);
  assert.throws(()=>C.validateProject(project([{...item,size:-1}]),catalogue));
  assert.throws(()=>C.validateProject(project([{...item,x:Infinity}]),catalogue));
  assert.throws(()=>C.validateProject(project([{...item,presetId:'bad',image:'https://untrusted.test/x.svg'}]),catalogue));
  assert.throws(()=>C.validateProject(project([{...item,color:'red" onclick="alert(1)'}]),catalogue));
  assert.throws(()=>C.validateProject(project([item,item]),catalogue));
  assert.throws(()=>C.validateProject(project(Array.from({length:16},(_,i)=>({...item,id:'person-'+i}))),catalogue),/15/);
});
test('layout handles tiny creatures, skyscrapers and 15 labels with finite geometry',()=>{
  for(const n of [0,1,15,60]){
    const items=C.arrange(Array.from({length:n},(_,i)=>({...C.fromPreset(catalogue[i%catalogue.length]),size:i%2?1e-4:1000})));
    const l=C.layout(items,600,800);
    assert.ok(l.scale>0&&Number.isFinite(l.scale));
    for(const p of l.positions)for(const key of ['x','y','w','h','labelX','labelY'])assert.ok(Number.isFinite(p[key]),key);
  }
});
