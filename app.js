(() => {
  'use strict';
  const C = ScaleCore, $ = id => document.getElementById(id);
  const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  const icons = {
    chevron:'m5 8 5 5 5-5',download:'M10 2v11m-4-4 4 4 4-4M3 13v4h14v-4',upload:'M10 14V3m-4 4 4-4 4 4M3 13v4h14v-4',grid:'M3 3h5v5H3zM12 3h5v5h-5zM3 12h5v5H3zM12 12h5v5h-5z',search:'M14 14l4 4M15 8A6 6 0 1 1 3 8a6 6 0 0 1 12 0',plus:'M10 4v12M4 10h12',minus:'M4 10h12',info:'M10 9v5M10 6h.01M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0',image:'M2 3h16v14H2zM2 14l5-5 4 4 3-3 4 4M14 6h.01',shield:'M10 2l7 3v5c0 4-7 8-7 8s-7-4-7-8V5zM6 10l3 3 5-6',edit:'m3 13 10-10 4 4L7 17H3zM11 5l4 4',undo:'M6 4 2 8l4 4M2 8h10a5 5 0 0 1 0 10',redo:'m14 4 4 4-4 4M18 8h-10a5 5 0 0 0 0 10',align:'M2 17h16M4 14V6h4v8zM12 14V3h4v11z',fit:'M7 2H2v5M13 2h5v5M18 13v5h-5M7 18H2v-5',ruler:'m2 13 11-11 5 5L7 18zM6 9l2 2M9 6l3 3M12 3l2 2',spark:'m10 1 2 6 6 3-6 2-2 6-2-6-6-2 6-3zM17 1v4M15 3h4',copy:'M7 7h10v11H7zM3 13H2V2h10v1',settings:'M2 5h16M2 15h16M6 2v6M14 12v6',reset:'M3 8a7 7 0 1 1 1 7M3 3v5h5',pointer:'M3 2l14 7-7 2-3 7z',close:'m4 4 12 12M16 4 4 16',folder:'M2 5h6l2 2h8v10H2z',text:'M3 3h14M10 3v14M7 17h6',person:'M13 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0M7 9h6l2 6M7 9l-2 6M8 10v8M12 10v8',paw:'M6 11q4-5 8 0l2 4q-2 4-6 1-4 3-6-1zM4 8V5M8 5V2M12 5V2M16 8V5',car:'M2 10l3-6h10l3 6v6H2zM2 10h16M5 16v2M15 16v2M5 13h1M14 13h1',building:'M3 18V2h9v16M12 8h5v10M1 18h18M6 5h3M6 9h3M6 13h3',trash:'M3 5h14M7 5V2h6v3M5 5l1 13h8l1-13M8 8v6M12 8v6',palette:'M10 2a8 8 0 1 0 0 16h1a2 2 0 0 0 1-4c-1-1 0-3 2-3h2c4 0 1-9-6-9ZM6 7h.01M10 5h.01M14 7h.01M5 11h.01'
  };
  const icon = name => `<svg viewBox="0 0 20 20" aria-hidden="true"><path d="${icons[name]||icons.grid}"/></svg>`;
  function hydrateIcons(parent=document){parent.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));}
  hydrateIcons();
  const byId = new Map(CATALOGUE.map(p=>[p.id,p]));
  const shapes = new Map();
  function prepareShapes(){
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.style.cssText='position:absolute;visibility:hidden;width:300px;height:300px;pointer-events:none';document.body.append(svg);
    CATALOGUE.forEach(p=>{svg.innerHTML=`<g>${Shapes.markup(p)}</g>`;const b=svg.firstElementChild.getBBox();shapes.set(p.id,{markup:Shapes.markup(p),box:`${b.x} ${b.y} ${b.width} ${b.height}`});});svg.remove();
  }
  prepareShapes();
  function miniature(s){if(s.image)return `<img src="${s.image}" alt="">`;const a=shapes.get(s.presetId||s.id);return `<svg viewBox="${a.box}" style="color:${s.color||'currentColor'}" fill="currentColor" aria-hidden="true">${a.markup}</svg>`;}
  const demo=()=>({version:1,title:'Étude de proportions',items:C.arrange([C.fromPreset(CATALOGUE[1],0),C.fromPreset(CATALOGUE[4],1),C.fromPreset(CATALOGUE.find(p=>p.shape==='gorilla'),2)]),settings:{...C.defaults},promptOverride:null});
  let state=demo(),selected=state.items[0].id,category='human',zoom=1,pan=0,history=[],future=[],db=null,saveTimer,toastTimer,drag=null,currentLayout=null,pendingConfirm=null,originalImage=null,importedImage=null,processing=0;
  // All item and setting fields are primitives; share image strings across undo snapshots.
  const clone=v=>({...v,items:v.items.map(s=>({...s})),settings:{...v.settings}});
  const selectedItem=()=>state.items.find(s=>s.id===selected);
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3400);}
  function checkpoint(){history.push(clone(state));if(history.length>35)history.shift();future=[];}
  function change(fn,{fit=false,keepPrompt=false}={}){checkpoint();fn();if(!keepPrompt)state.promptOverride=null;if(fit){zoom=1;pan=0;}render();save();}
  function undo(){if(!history.length)return;future.push(clone(state));state=history.pop();selected=state.items.some(s=>s.id===selected)?selected:state.items[0]?.id;zoom=1;pan=0;render();save();}
  function redo(){if(!future.length)return;history.push(clone(state));state=future.pop();selected=state.items.some(s=>s.id===selected)?selected:state.items[0]?.id;zoom=1;pan=0;render();save();}
  function save(){clearTimeout(saveTimer);$('save-status').innerHTML='<i></i> Enregistrement…';saveTimer=setTimeout(()=>{if(!db){$('save-status').textContent='Pensez à enregistrer le projet';return;}try{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(clone(state),'current');tx.oncomplete=()=>$('save-status').innerHTML='<i></i> Enregistré sur cet appareil';tx.onerror=()=>{$('save-status').textContent='Stockage plein : exportez le projet';toast('Enregistrement local impossible. Enregistrez le projet en JSON.');};}catch{$('save-status').textContent='Exportez le projet pour le conserver';}},450);}
  async function restore(){try{db=await new Promise((resolve,reject)=>{const r=indexedDB.open('echelle-studio',1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});const saved=await new Promise((resolve,reject)=>{const r=db.transaction('projects').objectStore('projects').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});if(saved){state=C.validateProject(saved,CATALOGUE);selected=state.items[0]?.id;render();}else save();}catch{$('save-status').textContent='Enregistrement manuel du projet';}}
  function renderLibrary(){
    $('categories').innerHTML=CATEGORIES.map(c=>`<button class="category ${category===c.id?'active':''}" data-category="${c.id}" aria-pressed="${category===c.id}">${icon(c.icon)}${c.name}</button>`).join('');
    const query=$('search').value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const presets=CATALOGUE.filter(p=>(query||p.category===category)&&(!query||`${p.name} ${p.section}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(query)));
    $('category-title').textContent=query?'Résultats':CATEGORIES.find(c=>c.id===category).name;$('category-count').textContent=`${presets.length} silhouettes`;
    let section='';$('preset-list').innerHTML=presets.map(p=>{const heading=(p.category==='vehicle'||p.category==='building')&&p.section!==section?`<div class="section-subheading">${esc(p.section)}</div>`:'';section=p.section;return heading+`<button class="preset-card" draggable="true" data-preset="${p.id}" title="Ajouter : ${esc(p.name)}" aria-label="Ajouter ${esc(p.name)}"><span class="preset-add">+</span><span class="miniature">${miniature(p)}</span><span class="preset-name">${esc(p.name)}</span><span class="preset-size">${p.axis==='width'?'Long.':'H.'} ${C.autoUnit(p.size)}</span></button>`;}).join('')||'<p class="no-results">Aucun sujet trouvé. Essayez un autre mot ou importez votre image.</p>';
  }
  function canAdd(item){if(state.items.length>=60){toast('Ce tableau accepte au maximum 60 sujets.');return false;}if(item.category==='human'&&state.items.filter(i=>i.category==='human').length>=15){toast('Maximum atteint : 15 sujets humains par tableau.');return false;}if(state.items.reduce((sum,s)=>sum+(s.image?.length||0),0)+(item.image?.length||0)>90e6){toast('Ce projet atteint 90 Mo d’images. Utilisez des images plus légères ou un autre tableau.');return false;}return true;}
  function add(item){if(!canAdd(item))return false;change(()=>{const e=C.extent(state.items);item.x=state.items.length?e.width+Math.max(e.height,C.dimensions(item).height)*.2:0;state.items.push(item);selected=item.id;},{fit:true});toast(`${item.name} ajouté au tableau`);return true;}
  function remove(){const s=selectedItem();if(!s)return;change(()=>{state.items=state.items.filter(i=>i.id!==selected);selected=state.items.at(-1)?.id;if(state.settings.referenceId===s.id)state.settings.referenceId='';},{fit:true});}
  function duplicate(){const s=selectedItem();if(!s)return;add({...s,id:C.uid(),name:(s.name+' · copie').slice(0,60)});}
  function renderSceneList(){
    const n=state.items.length;$('subject-count').textContent=`${n} sujet${n>1?'s':''}`;$('human-count').textContent=`${state.items.filter(s=>s.category==='human').length} / 15 humains`;
    $('scene-list').innerHTML=state.items.map(s=>`<button class="scene-row ${s.id===selected?'active':''}" data-select="${s.id}" aria-pressed="${s.id===selected}"><span class="scene-thumbnail">${miniature(s)}</span><span class="scene-row-info"><strong>${esc(s.name)}</strong><small>${C.dimensionText(s,true)}</small></span><span class="scene-row-dot" style="background:${s.color}"></span></button>`).join('')||'<p class="field-hint">Aucun sujet pour le moment.</p>';
  }
  function renderInspector(){
    const s=selectedItem();$('selection-empty').hidden=!!s;$('inspector-content').hidden=!s;if(!s){$('inspector-content').innerHTML='';return;}
    const d=C.dimensions(s);const ref=state.items.find(i=>i.id===state.settings.referenceId)||state.items[0];
    $('inspector-content').innerHTML=`<div class="selection-caption"><h2>Propriétés du sujet</h2><span>${s.image?'Image importée':'Silhouette'}</span></div>
      <label class="field">Nom<input id="edit-name" value="${esc(s.name)}" maxlength="60"></label>
      <label class="field">Nature<select id="edit-nature">${Object.entries(C.categories).map(([k,v])=>`<option value="${k}" ${s.category===k?'selected':''}>${v[0].toUpperCase()+v.slice(1)}</option>`).join('')}</select></label>
      <label class="field">Dimension mesurée<select id="edit-axis"><option value="height" ${s.axis==='height'?'selected':''}>Hauteur</option><option value="width" ${s.axis==='width'?'selected':''}>Longueur / largeur</option></select></label>
      <div class="dimension-row"><label class="field">Taille<input id="edit-size" type="number" min="0.000001" step="any" value="${Number((s.size/C.units[s.unit]).toPrecision(8))}"></label><label class="field unit-field">Unité<select id="edit-unit">${Object.keys(C.units).map(u=>`<option ${u===s.unit?'selected':''}>${u}</option>`).join('')}</select></label></div>
      <p class="size-input-hint">Modifiez la valeur ou tirez une poignée sur le tableau. Les proportions sont conservées.</p>
      <div class="dimensions-summary"><span>Hauteur <strong>${C.autoUnit(d.height)}</strong></span><span>Largeur <strong>${C.autoUnit(d.width)}</strong></span></div>
      ${s.image?'':`<div class="field">Couleur de la silhouette<div class="color-swatches">${C.colors.map(c=>`<button class="color-swatch ${c===s.color?'active':''}" data-color="${c}" style="background:${c}" title="Couleur ${c}" aria-label="Couleur ${c}" aria-pressed="${c===s.color}"></button>`).join('')}<input id="subject-color" class="custom-color" type="color" value="${s.color}" aria-label="Couleur personnalisée du sujet"></div></div>`}
      <div class="inspector-actions"><button id="duplicate-subject" class="button subtle">${icon('copy')} Dupliquer</button><button id="delete-subject" class="button subtle danger">${icon('trash')} Supprimer</button></div>
      ${ref&&ref.id!==s.id?`<div class="scale-ratio"><strong>× ${C.number(d.height/C.dimensions(ref).height)}</strong>la hauteur de ${esc(ref.name)}</div>`:''}`;
  }
  function contrast(bg){const rgb=bg.match(/[a-f\d]{2}/ig).map(v=>parseInt(v,16));return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114>145?'#42516a':'#edf1f8';}
  function boardSVG(width,height,forExport=false){
    const settings=state.settings,bg=settings.background,grid=settings.gridColor,ink=contrast(bg);
    const l=C.layout(state.items,width,height,forExport?1:zoom,forExport?0:pan);
    if(!forExport&&drag&&drag.type!=='pan'){
      l.scale=drag.layout.scale;l.left=drag.layout.left;l.ground=drag.layout.ground;
      l.positions.forEach(p=>{const s=state.items.find(s=>s.id===p.id),d=C.dimensions(s);p.x=l.left+s.x*l.scale;p.y=l.ground-d.height*l.scale;p.w=d.width*l.scale;p.h=d.height*l.scale;p.labelX=Math.min(width-55,Math.max(70,p.x+p.w/2));});
    }
    if(!forExport)currentLayout=l;
    const step=C.tickStep(70/l.scale),fine=step/5;let out=`<rect width="${width}" height="${height}" fill="${bg}"/><g font-family="Segoe UI,Arial,sans-serif">`;
    if(settings.showGrid){
      for(let y=fine,n=0;y*l.scale<l.ground-22&&n<250;y+=fine,n++){const py=l.ground-y*l.scale;out+=`<path d="M42 ${py}H${width-22}" stroke="${grid}" stroke-opacity=".2" stroke-width=".6"/>`;}
      const start=Math.max(0,Math.floor((42-l.left)/l.scale/fine)*fine);
      for(let x=start,n=0;l.left+x*l.scale<width-22&&n<400;x+=fine,n++){const px=l.left+x*l.scale;if(px<42)continue;out+=`<path d="M${px} 22V${l.ground}" stroke="${grid}" stroke-opacity=".22" stroke-width=".6"/>`;}
    }
    for(let y=0,n=0;y*l.scale<l.ground-19&&n<100;y+=step,n++){const py=l.ground-y*l.scale;out+=`<path d="M37 ${py}H${width-22}" stroke="${grid}" stroke-opacity="${y===0?.95:.45}" stroke-width="${y===0?1.2:.8}"/><text x="31" y="${py+3}" text-anchor="end" fill="${grid}" font-size="9">${esc(C.autoUnit(y))}</text>`;}
    const tickStart=Math.max(0,Math.ceil((44-l.left)/l.scale/step)*step);
    for(let x=tickStart,n=0;l.left+x*l.scale<width-22&&n<100;x+=step,n++){const px=l.left+x*l.scale;out+=`<path d="M${px} 20V${l.ground+5}" stroke="${grid}" stroke-opacity=".45" stroke-width=".8"/><text x="${px}" y="15" text-anchor="middle" fill="${grid}" font-size="9">${esc(C.autoUnit(x))}</text>`;}
    out+=`<text x="16" y="15" fill="${grid}" font-size="8">m</text>`;
    l.positions.forEach(p=>{
      const s=state.items.find(i=>i.id===p.id),active=!forExport&&s.id===selected;
      out+=`<g class="subject" data-subject="${s.id}" ${forExport?'':`tabindex="0" role="button" aria-label="${esc(s.name)}, ${esc(C.dimensionText(s,true))}. Flèches pour déplacer, plus ou moins pour redimensionner."`}><title>${esc(s.name)} — ${esc(C.dimensionText(s,true))}</title>`;
      if(s.image)out+=`<image href="${s.image}" x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" preserveAspectRatio="none"/>`;
      else{const a=shapes.get(s.presetId);out+=`<svg x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" viewBox="${a.box}" preserveAspectRatio="none" overflow="visible" fill="${s.color}" color="${s.color}">${a.markup}</svg>`;}
      if(!forExport)out+=`<rect class="hitbox" x="${p.x-3}" y="${p.y-3}" width="${Math.max(p.w+6,10)}" height="${Math.max(p.h+6,10)}" fill="transparent"/>`;
      if(active){out+=`<rect x="${p.x-6}" y="${p.y-6}" width="${p.w+12}" height="${p.h+12}" fill="none" stroke="#8578d7" stroke-width="1" stroke-dasharray="4 3"/><path d="M${p.x-15} ${p.y}h-5V${l.ground}h5M${p.x-20} ${p.y}h5" fill="none" stroke="#aa9bdc" stroke-width=".8"/>`;['left','right'].forEach(side=>{const x=side==='left'?p.x:p.x+p.w;out+=`<rect class="resize-handle" data-resize="${side}" data-subject="${s.id}" x="${x-5}" y="${p.y-5}" width="10" height="10" rx="2" fill="#fff" stroke="#8578d7" stroke-width="1.5"/>`;});}
      out+='</g>';
    });
    l.positions.forEach(p=>{const s=state.items.find(i=>i.id===p.id),active=!forExport&&s.id===selected;const lines=C.labelLines(s.name);
      const displacement=Math.abs(p.labelX-(p.x+p.w/2));if(displacement>14||p.labelY-l.ground>35)out+=`<path d="M${p.x+p.w/2} ${l.ground+5}L${p.labelX} ${p.labelY-13}" stroke="${grid}" stroke-opacity=".65" fill="none" stroke-width=".7"/>`;
      out+=`<g ${forExport?'':`data-select="${s.id}" style="cursor:pointer"`}><title>${esc(s.name)} — ${esc(C.dimensionText(s,true))}</title><text x="${p.labelX}" y="${p.labelY}" text-anchor="middle" fill="${active?'#8874c7':ink}" font-size="10.5" font-weight="600">${lines.map((line,i)=>`<tspan x="${p.labelX}" dy="${i?12:0}">${esc(line)}</tspan>`).join('')}</text><text x="${p.labelX}" y="${p.labelY+(lines.length-1)*12+15}" text-anchor="middle" fill="${ink}" fill-opacity=".68" font-size="10">${esc(C.dimensionText(s,true))}</text></g>`;
    });
    if(forExport)out+=`<text x="${width-22}" y="${height-13}" text-anchor="end" fill="${grid}" font-size="12" font-weight="600">échelle.</text><text x="43" y="${height-13}" fill="${grid}" font-size="9">${esc(state.title)} — Échelle linéaire commune · Dimensions indicatives</text>`;
    out+='</g>';return{markup:out,layout:l};
  }
  function renderBoard(){const el=$('board-wrap'),w=el.clientWidth;const minH=230+C.labelMetrics(state.items,w).space;el.style.minHeight=Math.max(360,minH)+'px';const h=el.clientHeight;const result=boardSVG(w,h);$('board').setAttribute('viewBox',`0 0 ${w} ${h}`);$('board').innerHTML=result.markup;el.style.background=state.settings.background;$('empty-board').hidden=!!state.items.length;$('zoom-label').textContent=Math.round(zoom*100)+' %';$('scale-caption').textContent=`· ${C.autoUnit(100/result.layout.scale)} / 100 px`;const tiny=result.layout.positions.filter(p=>Math.max(p.w,p.h)<8);$('scale-warning').hidden=!tiny.length;$('scale-warning').textContent=`${tiny.length} sujet${tiny.length>1?'s sont très petits':' est très petit'} à cette échelle. Les proportions restent exactes. Zoomez pour les inspecter ; l’export recadre tous les sujets.`;$('board-help').textContent=zoom>1?'Glisser le fond pour naviguer · Ajuster pour tout voir':'Déplacer un sujet · Tirer une poignée pour redimensionner';}
  function renderPrompt(){const s=state.settings;$('prompt-model').value=s.model;$('prompt-language').value=s.language;$('prompt-reference').innerHTML=state.items.map(i=>`<option value="${i.id}">${esc(i.name)}</option>`).join('')||'<option value="">Aucun sujet</option>';$('prompt-reference').value=state.items.some(i=>i.id===s.referenceId)?s.referenceId:(state.items[0]?.id||'');$('scene-action').value=s.action;$('lock-proportions').checked=s.lock;$('prompt-output').value=state.promptOverride??C.prompt(state);$('prompt-note').innerHTML=state.promptOverride===null?'<i></i> Mis à jour avec vos sujets':'Texte modifié · Le prochain changement de sujet le recalculera';}
  function render(){
    $('project-title').value=state.title;$('show-grid').checked=state.settings.showGrid;$('background-color').value=state.settings.background;$('grid-color').value=state.settings.gridColor;
    $('undo-button').disabled=!history.length;$('redo-button').disabled=!future.length;$('export-button').disabled=!state.items.length;
    renderSceneList();renderInspector();renderBoard();renderPrompt();
  }
  function switchTab(importing){$('preset-panel').hidden=importing;$('import-panel').hidden=!importing;['preset','import'].forEach((name,i)=>{const active=!!i===importing;$(name+'-tab').classList.toggle('active',active);$(name+'-tab').setAttribute('aria-selected',String(active));});}
  $('preset-tab').onclick=()=>switchTab(false);$('import-tab').onclick=()=>switchTab(true);
  $('categories').onclick=e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;$('search').value='';renderLibrary();}};
  $('search').oninput=renderLibrary;
  $('preset-list').onclick=e=>{const b=e.target.closest('[data-preset]');if(b)add(C.fromPreset(byId.get(b.dataset.preset),state.items.length));};
  $('preset-list').ondragstart=e=>{const b=e.target.closest('[data-preset]');if(b){e.dataTransfer.setData('application/x-echelle-preset',b.dataset.preset);e.dataTransfer.effectAllowed='copy';}};
  $('board-wrap').ondragover=e=>{e.preventDefault();$('board-wrap').classList.add('drag-over');};
  $('board-wrap').ondragleave=()=>$('board-wrap').classList.remove('drag-over');
  $('board-wrap').ondrop=e=>{e.preventDefault();$('board-wrap').classList.remove('drag-over');const id=e.dataTransfer.getData('application/x-echelle-preset');if(byId.has(id))add(C.fromPreset(byId.get(id),state.items.length));else if(e.dataTransfer.files.length){switchTab(true);loadImage(e.dataTransfer.files[0]);}};
  function select(id){if(!state.items.some(s=>s.id===id))return;selected=id;renderSceneList();renderInspector();renderBoard();}
  $('scene-list').onclick=e=>{const b=e.target.closest('[data-select]');if(b)select(b.dataset.select);};
  $('inspector-content').onchange=e=>{const s=selectedItem();if(!s)return;const t=e.target;
    if(t.id==='edit-name'){const name=t.value.trim();if(!name){toast('Donnez un nom au sujet.');renderInspector();return;}change(()=>s.name=name);}
    if(t.id==='edit-size'){const value=Number(t.value)*C.units[s.unit];if(!Number.isFinite(value)||value<1e-6||value>1e6){toast('La taille doit être comprise entre 0,001 mm et 1 000 km.');renderInspector();return;}change(()=>s.size=value,{fit:true});}
    if(t.id==='edit-unit')change(()=>s.unit=t.value);
    if(t.id==='edit-axis')change(()=>{const d=C.dimensions(s);s.axis=t.value;s.size=s.axis==='width'?d.width:d.height;});
    if(t.id==='edit-nature'){if(t.value==='human'&&s.category!=='human'&&state.items.filter(i=>i.category==='human').length>=15){toast('Maximum : 15 sujets humains.');renderInspector();return;}change(()=>s.category=t.value);}
    if(t.id==='subject-color')change(()=>s.color=t.value,{keepPrompt:true});
  };
  $('inspector-content').onclick=e=>{const c=e.target.closest('[data-color]');if(c)change(()=>selectedItem().color=c.dataset.color,{keepPrompt:true});if(e.target.closest('#duplicate-subject'))duplicate();if(e.target.closest('#delete-subject'))remove();};
  $('board').onpointerdown=e=>{
    if(e.button!==0)return;const handle=e.target.closest('[data-resize]'),subject=e.target.closest('[data-subject]'),label=e.target.closest('[data-select]');
    if(label){select(label.dataset.select);return;}
    if(subject){const id=subject.dataset.subject;selected=id;renderSceneList();renderInspector();const s=selectedItem();drag={type:handle?'resize':'move',side:handle?.dataset.resize,id,startX:e.clientX,startY:e.clientY,original:{...s},layout:currentLayout,changed:false};}
    else{drag={type:'pan',startX:e.clientX,startY:e.clientY,originalPan:pan,changed:false};}
    $('board').setPointerCapture(e.pointerId);e.preventDefault();renderBoard();
  };
  $('board').onpointermove=e=>{
    if(!drag)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(Math.abs(dx)+Math.abs(dy)<3&&!drag.changed)return;
    if(drag.type==='pan'){pan=drag.originalPan+dx;drag.changed=true;renderBoard();return;}
    if(!drag.changed){checkpoint();drag.changed=true;}
    const s=selectedItem(),d=C.dimensions(drag.original),sc=drag.layout.scale;
    if(drag.type==='move')s.x=Math.max(0,drag.original.x+dx/sc);
    else{const w=d.width*sc,h=d.height*sc,projection=((drag.side==='left'?-dx:dx)*w-dy*h)/(w*w+h*h);s.size=Math.max(1e-6,Math.min(1e6,drag.original.size*(1+projection)));if(drag.side==='left')s.x=Math.max(0,drag.original.x+d.width-C.dimensions(s).width);}
    state.promptOverride=null;renderBoard();
  };
  function finishDrag(){if(!drag)return;const changed=drag.changed,type=drag.type;drag=null;if(changed&&type!=='pan'){zoom=1;pan=0;render();save();}else renderBoard();}
  $('board').onpointerup=finishDrag;$('board').onpointercancel=finishDrag;$('board').onlostpointercapture=finishDrag;
  $('board').onkeydown=e=>{const s=selectedItem();if(!s)return;if(['ArrowLeft','ArrowRight','+','=','-','Delete','Backspace'].includes(e.key)){e.preventDefault();if(e.key==='Delete'||e.key==='Backspace')return remove();change(()=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight')s.x=Math.max(0,s.x+(e.key==='ArrowRight'?1:-1)*C.extent(state.items).width*(e.shiftKey?.03:.005));else s.size=Math.min(1e6,Math.max(1e-6,s.size*(e.key==='-'?.95:1.05)));},{fit:true});$('board').querySelector(`[data-subject="${selected}"]`)?.focus();}if(e.key==='Enter'||e.key===' '){const subject=e.target.closest('[data-subject]');if(subject){e.preventDefault();select(subject.dataset.subject);}}};
  $('undo-button').onclick=undo;$('redo-button').onclick=redo;
  $('arrange-button').onclick=()=>change(()=>state.items=C.arrange(state.items),{fit:true});
  $('fit-button').onclick=()=>{zoom=1;pan=0;renderBoard();};
  $('zoom-in').onclick=()=>{zoom=Math.min(40,zoom*1.25);renderBoard();};$('zoom-out').onclick=()=>{zoom=Math.max(.25,zoom/1.25);renderBoard();};
  $('show-grid').onchange=e=>change(()=>state.settings.showGrid=e.target.checked,{keepPrompt:true});
  $('appearance-toggle').onclick=()=>{const hidden=!$('appearance-panel').hidden;$('appearance-panel').hidden=hidden;$('appearance-toggle').setAttribute('aria-expanded',String(!hidden));};
  $('background-color').onchange=e=>change(()=>state.settings.background=e.target.value,{keepPrompt:true});$('grid-color').onchange=e=>change(()=>state.settings.gridColor=e.target.value,{keepPrompt:true});
  for(const [id,background,gridColor] of [['theme-light','#ffffff','#b9c6d8'],['theme-dark','#242a38','#737f96'],['theme-blueprint','#234d7f','#a2bddc']])$(id).onclick=()=>change(()=>Object.assign(state.settings,{background,gridColor}),{keepPrompt:true});
  $('project-title').onchange=e=>change(()=>state.title=e.target.value.trim()||'Sans titre',{keepPrompt:true});
  $('empty-add').onclick=()=>{switchTab(false);$('search').focus();$('preset-panel').scrollIntoView({block:'nearest',behavior:'smooth'});};
  const promptSettings={'prompt-model':'model','prompt-language':'language','prompt-reference':'referenceId','scene-action':'action','lock-proportions':'lock'};
  Object.entries(promptSettings).forEach(([id,key])=>$(id).onchange=e=>change(()=>state.settings[key]=e.target.type==='checkbox'?e.target.checked:e.target.value));
  $('prompt-settings-toggle').onclick=()=>{const hidden=!$('prompt-settings').hidden;$('prompt-settings').hidden=hidden;$('prompt-settings-toggle').setAttribute('aria-expanded',String(!hidden));};
  $('prompt-output').onchange=e=>{checkpoint();state.promptOverride=e.target.value;save();$('prompt-note').textContent='Texte personnalisé · Conservé dans le projet';};
  $('regenerate-prompt').onclick=()=>change(()=>state.promptOverride=null);
  $('copy-prompt').onclick=async()=>{try{await navigator.clipboard.writeText($('prompt-output').value);toast('Prompt copié dans le presse-papiers');}catch{$('prompt-output').focus();$('prompt-output').select();toast('Sélectionnez le texte puis copiez-le avec Ctrl+C.');}};
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  const filename=()=>state.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'echelle';
  function exportSvg(){const w=1600,h=Math.max(900,300+Math.ceil(state.items.length/13)*37);return`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>${esc(state.title)}</title><desc>Tableau de proportions à échelle linéaire commune. ${esc(state.items.map(s=>s.name+' : '+C.dimensionText(s,true)).join('; '))}</desc>${boardSVG(w,h,true).markup}</svg>`;}
  $('export-button').onclick=()=>{$('export-status').textContent='';$('export-dialog').showModal();};
  $('download-svg').onclick=()=>download(new Blob([exportSvg()],{type:'image/svg+xml'}),filename()+'.svg');
  $('download-prompt').onclick=()=>download(new Blob([$ ('prompt-output').value],{type:'text/plain;charset=utf-8'}),filename()+'-prompt.txt');
  $('download-png').onclick=async()=>{const button=$('download-png');button.disabled=true;$('export-status').textContent='Préparation de l’image…';let url;try{const svg=exportSvg();url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Impossible de préparer l’image.'));image.src=url;});const canvas=document.createElement('canvas');canvas.width=Number($('export-resolution').value);canvas.height=Math.round(canvas.width*image.height/image.width);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Export impossible. Essayez le format SVG.');download(blob,filename()+'.png');$('export-status').textContent='Image téléchargée. Pensez à récupérer le prompt.';}catch(error){$('export-status').textContent=error.message;}finally{if(url)URL.revokeObjectURL(url);button.disabled=false;}};
  $('project-menu-button').onclick=()=>{const hidden=!$('project-menu').hidden;$('project-menu').hidden=hidden;$('project-menu-button').setAttribute('aria-expanded',String(!hidden));};
  document.addEventListener('click',e=>{if(!e.target.closest('#project-menu')&&!e.target.closest('#project-menu-button')){$('project-menu').hidden=true;$('project-menu-button').setAttribute('aria-expanded','false');}});
  $('save-project').onclick=()=>{state.promptOverride=$('prompt-output').value===C.prompt(state)?null:$('prompt-output').value;download(new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),filename()+'.json');$('project-menu').hidden=true;};
  $('load-project').onclick=()=>$('project-file').click();
  $('project-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>100e6)throw Error('Ce projet est trop volumineux (100 Mo maximum).');const next=C.validateProject(JSON.parse(await file.text()),CATALOGUE);confirm('Ouvrir ce projet ?',()=>{change(()=>{state=next;selected=next.items[0]?.id;},{fit:true,keepPrompt:true});toast('Projet ouvert');});}catch(error){toast('Projet non ouvert : '+error.message);}e.target.value='';};
  function confirm(title,fn){pendingConfirm=fn;$('confirm-title').textContent=title;$('confirm-dialog').showModal();$('project-menu').hidden=true;}
  $('confirm-cancel').onclick=()=>{$('confirm-dialog').close();pendingConfirm=null;};$('confirm-ok').onclick=()=>{$('confirm-dialog').close();pendingConfirm?.();pendingConfirm=null;};
  $('new-project').onclick=()=>confirm('Créer un nouveau tableau ?',()=>change(()=>{state={...demo(),items:[],title:'Nouveau tableau'};selected=null;},{fit:true}));
  $('demo-project').onclick=()=>confirm('Charger la démonstration ?',()=>change(()=>{state=demo();selected=state.items[0].id;},{fit:true}));
  function trimCanvas(canvas){const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height,pixels=ctx.getImageData(0,0,w,h);let x0=w,y0=h,x1=-1,y1=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(pixels.data[(y*w+x)*4+3]>12){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}}if(x1<0)throw Error('Le détourage a supprimé tout le sujet. Réduisez la tolérance.');const result=document.createElement('canvas');result.width=x1-x0+1;result.height=y1-y0+1;result.getContext('2d').drawImage(canvas,x0,y0,result.width,result.height,0,0,result.width,result.height);return result;}
  function removeBackground(canvas,tolerance){const ctx=canvas.getContext('2d',{willReadFrequently:true}),w=canvas.width,h=canvas.height,img=ctx.getImageData(0,0,w,h),a=img.data,total=w*h,seen=new Uint8Array(total),queue=new Int32Array(total);let head=0,tail=0;
    const cornerIndexes=[0,w-1,(h-1)*w,w*h-1];const samples=cornerIndexes.map(i=>[a[i*4],a[i*4+1],a[i*4+2],a[i*4+3]]).filter(v=>v[3]>10);
    const match=i=>a[i*4+3]<12||samples.some(c=>Math.hypot(a[i*4]-c[0],a[i*4+1]-c[1],a[i*4+2]-c[2])<tolerance*2.2);
    const push=i=>{if(!seen[i]){seen[i]=1;if(match(i))queue[tail++]=i;}};
    for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}while(head<tail){const i=queue[head++];a[i*4+3]=0;if(i%w>0)push(i-1);if(i%w<w-1)push(i+1);if(i>=w)push(i-w);if(i<total-w)push(i+w);}ctx.putImageData(img,0,0);
  }
  async function processImage(){if(!originalImage)return;const ticket=++processing;$('add-import').disabled=true;importedImage=null;$('import-error').textContent='';try{await new Promise(r=>requestAnimationFrame(r));if(ticket!==processing)return;const factor=Math.min(1,1400/Math.max(originalImage.width,originalImage.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(originalImage.width*factor));canvas.height=Math.max(1,Math.round(originalImage.height*factor));canvas.getContext('2d').drawImage(originalImage,0,0,canvas.width,canvas.height);if($('remove-background').checked)removeBackground(canvas,Number($('background-tolerance').value));const cropped=trimCanvas(canvas),aspect=cropped.width/cropped.height;if(aspect<.001||aspect>1000)throw Error('Les proportions de cette image ne sont pas prises en charge.');importedImage={image:cropped.toDataURL('image/png'),aspect};$('import-preview').src=importedImage.image;$('upload-zone').hidden=true;$('import-preview-wrap').hidden=false;$('add-import').disabled=false;}catch(error){$('import-error').textContent=error.message;}}
  async function loadImage(file){$('import-error').textContent='';if(!['image/png','image/jpeg','image/webp'].includes(file.type)){$('import-error').textContent='Choisissez une image PNG, JPG ou WebP.';return;}if(file.size>15*1024*1024){$('import-error').textContent='L’image dépasse 15 Mo. Réduisez sa résolution.';return;}const url=URL.createObjectURL(file);try{const image=new Image();await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=()=>reject(Error('Cette image ne peut pas être lue.'));image.src=url;});if(image.width*image.height>50e6)throw Error('Cette image dépasse 50 mégapixels. Réduisez sa résolution.');originalImage=image;$('import-name').value=file.name.replace(/\.[^.]+$/,'').slice(0,60);await processImage();}catch(error){$('import-error').textContent=error.message;}finally{URL.revokeObjectURL(url);}}
  $('subject-file').onchange=e=>{if(e.target.files[0])loadImage(e.target.files[0]);e.target.value='';};$('change-image').onclick=()=>$('subject-file').click();
  $('upload-zone').ondragover=e=>{e.preventDefault();$('upload-zone').classList.add('drag-over');};$('upload-zone').ondragleave=()=>$('upload-zone').classList.remove('drag-over');$('upload-zone').ondrop=e=>{e.preventDefault();$('upload-zone').classList.remove('drag-over');if(e.dataTransfer.files[0])loadImage(e.dataTransfer.files[0]);};
  $('remove-background').onchange=()=>{$('tolerance-field').hidden=!$('remove-background').checked;processImage();};$('background-tolerance').onchange=processImage;
  $('import-nature').onchange=e=>{if(e.target.value==='vehicle')$('import-axis').value='width';else $('import-axis').value='height';};
  $('import-form').onsubmit=e=>{e.preventDefault();if(!importedImage)return;const size=Number($('import-size').value)*C.units[$('import-unit').value],name=$('import-name').value.trim();if(!name||!Number.isFinite(size)||size<1e-6||size>1e6){$('import-error').textContent='Renseignez un nom et une taille entre 0,001 mm et 1 000 km.';return;}const subject={id:C.uid(),name,category:$('import-nature').value,axis:$('import-axis').value,size,unit:$('import-unit').value,color:C.colors[state.items.length%C.colors.length],x:0,...importedImage};if(add(subject)){$('import-error').textContent='';}};
  document.addEventListener('keydown',e=>{const editing=e.target.matches('input,textarea,select')||document.querySelector('dialog[open]');if(editing)return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo();}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='d'){e.preventDefault();duplicate();}else if((e.key==='Delete'||e.key==='Backspace')&&!e.target.closest('#board')){e.preventDefault();remove();}else if(e.key==='/'){e.preventDefault();switchTab(false);$('search').focus();}else if(e.key==='Escape'){$('project-menu').hidden=true;}});
  new ResizeObserver(()=>{if(!drag)renderBoard();}).observe($('board-wrap'));
  renderLibrary();render();restore();
})();
