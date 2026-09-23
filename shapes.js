/* Silhouettes SVG originales. Leurs limites sont mesurées avant affichage. */
(function (root) {
  const path = d => `<path d="${d}"/>`;
  const rect = (x,y,w,h,r=0,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${extra}/>`;
  const ellipse = (x,y,rx,ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
  const circle = (x,y,r) => `<circle cx="${x}" cy="${y}" r="${r}"/>`;
  const stroke = (d,w=4) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const cut = (x,y,w,h) => rect(x,y,w,h,1,'fill="white" fill-opacity=".65"');
  const wheel = (x,y,r=10) => circle(x,y,r)+circle(x,y,r*.44).replace('/>',' fill="white" fill-opacity=".65"/>');
  const windows = (x,y,cols,rows,dx=13,dy=13,w=6,h=7) => Array.from({length:cols*rows},(_,i)=>cut(x+i%cols*dx,y+Math.floor(i/cols)*dy,w,h)).join('');
  function human(female,v) {
    const shoulder = [13,17,23][v], waist=[10,14,22][v], hip=[13,17,24][v];
    return (female ? path('M39 26Q33 7 43 3Q54 -4 61 8L64 32L38 32Z') : '') + ellipse(50,14,9,12) +
      path(`M45 25L55 25L57 33Q${50+shoulder} 34 ${52+shoulder} 41L${64+shoulder} 89Q${64+shoulder} 96 ${58+shoulder} 92L${49+shoulder} 58L${50+waist} 78L${50+hip} 102L${59+hip/3} 176L${62+hip/3} 191Q${62+hip/3} 196 ${53+hip/3} 195L54 180L50 117L46 180L${47-hip/3} 195Q${36-hip/3} 197 ${38-hip/3} 189L${41-hip/3} 176L${50-hip} 102L${50-waist} 78L${51-shoulder} 58L${42-shoulder} 92Q${36-shoulder} 96 ${36-shoulder} 89L${48-shoulder} 41Q${50-shoulder} 34 43 33Z`);
  }
  function quadruped(type) {
    const stout=['bear','hippo','pig','rhino','cow','panda','sheep'].includes(type);
    const catlike=['cat','lion','tiger'].includes(type);
    const long=['horse','donkey','zebra','deer','giraffe'].includes(type);
    let s=ellipse(100,65,stout?58:48,stout?32:23);
    s+=path(`M57 72L69 73L66 119L51 119ZM83 78L93 78L98 119L85 119ZM126 76L139 75L146 119L131 119ZM144 69L157 67L164 117L150 117Z`);
    if(long) s+=path('M128 56L147 16L153 3L161 14L172 13L190 36L184 46L163 39L157 71Z')+path('M152 17L148 5L141 0L145 23Z');
    else s+=path(`M139 47L155 31L174 35L181 48L199 53L194 67L166 72L150 81Z`);
    if (['dog','wolf','fox'].includes(type)) s+=path('M155 39L155 16L169 38L176 24L181 46Z');
    else if(!long) s+=ellipse(161,34,8,9)+ellipse(177,36,7,9);
    if(catlike) s+=path('M160 34L160 21L170 34L179 23L180 41Z')+stroke('M55 64Q17 72 14 48Q10 23 3 38',5);
    else if(type==='fox') s+=path('M58 55Q25 30 0 60Q27 81 59 72Z');
    else if(type==='pig') s+=stroke('M49 52C16 33 18 64 36 53C44 45 24 39 20 48',4);
    else if(long) s+=path('M57 48Q39 43 40 86L48 97L52 63Z');
    else s+=stroke('M55 54Q26 58 18 35',5);
    if(type==='lion') s+=ellipse(161,52,26,29)+ellipse(176,51,16,18);
    if(type==='sheep') s+=Array.from({length:7},(_,i)=>circle(56+i*14,51+(i%2)*5,19)).join('');
    if(type==='goat') s+=stroke('M164 33L152 9M176 33L175 6',5)+path('M182 63L174 86L166 64Z');
    if(type==='cow') s+=path('M157 37L148 20L165 31M178 38L188 24L184 45Z');
    if(type==='rhino') s+=path('M181 52L184 19L195 53L203 41L206 57Z');
    if(type==='deer') s+=stroke('M167 21L173 -4L184 -17M173 0L163 -12M176 -8L176 -20M157 20L148 -2L147 -17M150 3L138 -7',4);
    if(type==='donkey') s+=path('M154 16L146 -14L155 -13L163 16ZM166 18L169 -11L177 -8L173 22Z');
    if(type==='zebra'||type==='tiger') s+=Array.from({length:7},(_,i)=>path(`M${62+i*13} 45l-5 32l8 -17Z`).replace('/>',' fill="white" fill-opacity=".5"/>')).join('');
    if(type==='panda') s+=ellipse(97,55,27,25).replace('/>',' fill="white" fill-opacity=".6"/>');
    if(type==='giraffe') s=path('M23 157L36 156L36 225L25 225ZM62 158L74 158L80 225L69 225ZM86 156L98 143L110 222L99 225ZM103 147L115 121L117 31L121 18L136 19L143 24L161 24L168 34L149 41L139 37L139 93L128 151Z')+ellipse(72,146,46,23)+stroke('M30 136L10 160L11 187',5)+stroke('M127 21L124 6M136 20L139 6',4)+path('M122 22L110 12L114 30Z')+Array.from({length:5},(_,i)=>rect(120,47+i*17,8,10,2,'fill="white" fill-opacity=".5"')).join('');
    return s;
  }
  function animal(type) {
    if(type==='gorilla')return ellipse(78,30,25,29)+path('M53 45Q29 39 20 68L3 134L18 141L42 98L43 135L37 183L64 183L75 139L84 139L94 183L122 183L112 129L116 92L143 141L158 133L137 67Q126 43 103 44Z')+ellipse(80,83,42,50)+ellipse(80,25,18,21);
    if(type==='elephant')return ellipse(95,67,66,44)+path('M35 80L31 142L52 142L63 89M65 89L66 138L84 138L88 90M126 87L135 141L154 141L155 83')+ellipse(159,63,35,36)+path('M177 51Q210 71 197 117Q193 136 210 118L213 127Q190 157 181 133L181 74Z')+ellipse(143,62,24,33)+stroke('M36 47Q15 54 14 99',4)+path('M179 79L205 91L188 92Z');
    if(type==='rabbit')return ellipse(56,76,36,31)+ellipse(80,46,23,24)+ellipse(70,16,8,29)+ellipse(90,14,7,28)+ellipse(79,103,27,9)+circle(18,77,13);
    if(type==='kangaroo')return path('M74 62L77 34L69 5L78 0L91 27L111 32L130 47L126 55L103 51L102 84L119 96L117 105L91 95L85 132L103 174L137 182L137 191L98 191L69 154L61 176Q28 195 0 186Q35 172 48 148L41 103Q46 72 74 62Z');
    if(type==='crocodile')return path('M0 65L60 45L83 33L119 26L159 32L192 48L247 50L246 60L193 67L157 70L153 84L133 84L133 70L86 68L76 83L55 83L62 65Z')+path('M58 46L68 32L79 39L91 24L101 30L116 19L126 28L141 23L152 31L166 28L177 40Z');
    if(type==='turtle')return path('M26 73Q28 2 88 2Q145 0 151 72Z')+ellipse(165,61,25,18)+path('M38 68L18 95L42 95L62 72M113 68L129 94L152 94L138 69M24 65L0 76L32 78Z');
    if(type==='penguin')return ellipse(50,66,33,60)+circle(50,18,24)+path('M69 13L89 24L69 28M27 37L4 80L12 88L35 65M72 38L94 81L88 88L65 62M32 118L16 128L44 128L49 119M56 119L61 128L83 128L70 118Z')+ellipse(50,80,19,34).replace('/>',' fill="white" fill-opacity=".65"/>');
    if(type==='ostrich')return ellipse(57,74,49,28)+path('M81 66L110 37L111 3L122 0L132 8L128 17L121 18L124 47L97 82Z')+stroke('M40 94L36 154L21 160M69 94L77 150L91 157',6)+path('M16 61L0 37L4 77L26 85Z');
    if(type==='eagle')return path('M69 26L91 15L114 26L98 30L92 64L112 118L94 106L83 120L70 103L52 114L63 71L45 51L0 39L39 30L0 16L44 24L21 0L64 20Z')+stroke('M75 93L71 119M85 95L91 119',4);
    if(type==='dolphin')return path('M0 53L21 37Q57 4 112 29L136 1L141 30Q177 45 198 61L227 48L219 66L236 83L207 78L196 75Q149 67 117 67L92 91L91 65Q42 60 26 51L0 59Z');
    if(type==='whale')return path('M1 39Q12 4 73 4Q124 -1 183 30Q212 41 235 42L269 21L256 47L277 67L237 53Q200 79 149 68L119 96L116 67Q23 76 7 62Z')+stroke('M17 48L59 52',2);
    return quadruped(type);
  }
  function vehicle(type,v) {
    if(type==='car') {const roofs=[54,48,50,47,63,72,36,29,35,50],y=roofs[v]||50;return path(`M4 79L19 67L43 ${y}L${v===8?92:133} ${y}L${v===8?106:165} 67L192 74L199 93L2 93Z`)+(v===8?rect(109,54,80,20):'')+path(`M48 ${y+6}L82 ${y+6}L82 68L32 68ZM89 ${y+6}L${v===8?91:127} ${y+6}L${v===8?105:151} 68L89 68Z`).replace('/>',' fill="white" fill-opacity=".7"/>')+wheel(40,93,16)+wheel(159,93,16)+cut(6,78,13,5)+cut(186,78,10,5);}
    if(type==='van')return path(`M0 18L${v?165:131} 18L${v?172:169} 51L193 61L195 104L0 104Z`)+wheel(37,102,16)+wheel(158,102,16)+cut(125,28,31,25)+windows(13,30,v?3:2,1,34,14,23,24)+(v?rect(114,6,64,18):'');
    if(type==='bicycle') {const cargo=v===3;return `<g fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round">${circle(33,92,30)}${circle(cargo?200:146,92,30)}<path d="M33 92L67 41L92 92L33 92L116 43L146 92M67 41L63 27M52 26L74 26M113 33L115 19L135 19"/></g>`+(cargo?rect(112,46,75,30,2):'');}
    if(type==='motorbike'||type==='quad')return wheel(31,83,25)+wheel(158,83,25)+stroke(`M31 83L72 49L110 83L148 43L158 83M144 48L135 18L153 15`,6)+path(v===4?'M42 47L83 47L92 72L122 72L123 32L139 30L148 82L84 83L65 58L42 56Z':`M48 46L73 ${v===1?32:38}L103 35L122 47L103 64L70 61L56 74Z`)+rect(40,35,38,10,4)+(type==='quad'?rect(112,30,64,12,3):'');
    if(type==='boat')return path('M0 55L200 55L170 93L35 93Z')+(v===2?path('M58 55L72 22L119 22L149 55Z')+cut(80,30,33,16):v===1?rect(12,40,180,18,9)+rect(100,14,7,36):rect(90,45,30,10));
    if(type==='sailboat')return path('M0 161L190 161L163 183L22 183Z')+rect(95,0,5,167)+path(v===1?'M89 8L17 148L87 148ZM106 16L179 143L106 143Z':'M89 8L19 150L89 150ZM106 43L169 150L106 150Z')+rect(61,151,72,12);
    if(type==='ship')return path('M0 84L220 84L205 112L22 112Z')+(v===4?rect(25,55,21,29)+rect(17,49,40,13)+rect(27,37,8,15)+stroke('M57 77L187 77M73 77L73 61M107 77L107 65M147 77L147 61M176 77L176 66',5):v===3?windows(50,43,6,2,25,20,22,17).replaceAll('fill="white" fill-opacity=".65"','')+rect(12,35,31,50)+cut(16,43,21,7):path(`M31 84L43 ${v===2?26:48}L160 ${v===2?26:48}L194 84Z`)+rect(56,v===2?13:35,91,15)+rect(70,v===2?0:22,13,17)+windows(48,v===2?33:54,9,v===2?3:1,14,14,8,5));
    if(type==='plane')return path(`M0 62Q12 43 51 44L148 44L166 0L180 0L177 46L197 52L179 61L174 79L163 79L155 61L108 63L133 94L117 94L78 62Z`)+stroke('M35 59L35 78M133 60L133 78',3)+wheel(35,78,4)+wheel(133,78,4)+(v===7?'':windows(40,49,v===0?2:v===5?13:8,1,8,10,4,3))+(v===5?windows(51,39,10,1,8,10,4,3):'');
    if(type==='helicopter')return path('M0 75Q0 32 52 32L89 40L112 62L173 47L186 12L195 14L190 65L112 78L85 94L20 94Z')+cut(14,48,31,25)+cut(52,47,24,25)+rect(48,17,6,21)+stroke('M0 15L128 15M21 95L20 110L99 110M82 94L87 110',4)+(v?rect(124,31,5,33):'');
    if(type==='bus')return rect(0,0,205,90,10)+windows(10,12,10,v===2?2:1,19,v===2?27:12,13,v===2?19:28)+rect(171,51,21,36,2,'fill="white" fill-opacity=".5"')+wheel(38,91,16)+wheel(169,91,16);
    if(type==='train')return path(v===2?'M0 81Q13 30 59 23L243 23L250 81Z':'M0 21L234 21L250 44L250 81L0 81Z')+windows(v===2?61:13,34,v===2?11:14,1,16,10,11,19)+Array.from({length:6},(_,i)=>wheel(29+i*38,82,8)).join('')+stroke(v===0?'M103 20L93 1L129 1L118 20':'M94 20L94 8L116 8L116 20',3);
    if(type==='truck')return rect(0,0,170,94,2)+path('M175 24L213 24L238 55L240 93L175 93Z')+cut(184,34,27,24)+wheel(24,97,15)+wheel(56,97,15)+wheel(159,97,15)+wheel(213,97,15);
    if(type==='excavator')return rect(0,100,115,25,12)+path('M12 99L12 65L51 65L54 28L89 28L103 72L114 93Z')+cut(63,37,20,30)+stroke('M96 71L138 2L204 49L217 92',13)+path('M194 88L225 88L228 113L195 113L183 102Z');
    return '';
  }
  function building(type,v) {
    if(type==='house')return path(v===3?'M0 87L70 0L140 87L129 87L129 141L11 141L11 87Z':`M0 43L70 0L140 43L132 43L132 ${v===5?175:119}L8 ${v===5?175:119}L8 43Z`)+rect(108,7,13,29)+rect(59,v===5?139:84,22,36,0,'fill="white" fill-opacity=".6"')+windows(24,54,3,v===5?3:v===1||v===6?2:1,38,30,15,18)+(v===2?rect(131,65,70,54)+windows(142,76,3,1,19,15,12,16):'');
    if(type==='building')return rect(0,0,95,20+v*13)+windows(10,9,6,v,13,13,6,7)+cut(40,12+v*13,16,9);
    if(type==='skyscraper') {let s=v===2?rect(0,40,48,220)+rect(68,0,48,260):v===3||v===6?path('M0 260L0 135L14 135L14 65L27 65L27 21L43 21L47 0L51 21L67 21L67 65L80 65L80 135L95 135L95 260Z'):v===5?path('M0 260L0 20Q45 -20 90 20L90 260Z'):path('M0 260L0 15L75 0L95 25L95 260Z');return s+windows(9,55,v===2?8:6,15,v===2?13:13,13,5,6);}
    if(type==='factory')return path('M0 93L0 45L35 25L35 45L70 25L70 45L105 25L105 93Z')+rect(116,0,14,93)+rect(141,13,18,80)+windows(10,64,7,1,13,13,7,13)+(v===1?path('M173 93Q203 48 180 0L232 0Q214 52 244 93Z'):v===2?rect(170,30,33,63,12)+rect(213,12,10,81):'');
    if(type==='warehouse')return path(v===1?'M0 105L0 33Q70 -25 140 33L140 105Z':'M0 105L0 28L70 0L140 28L140 105Z')+cut(40,43,62,62)+stroke('M44 55L98 55M44 67L98 67M44 79L98 79',2);
    if(type==='silo')return v?path('M29 140L33 64L12 44L12 6L95 6L95 44L74 64L79 140L66 140L62 73L46 73L42 140Z')+rect(6,0,95,10):rect(0,17,36,125,15)+rect(42,0,36,142,15)+rect(84,25,36,117,15);
    if(type==='chimney')return path('M0 180L12 0L33 0L45 180Z')+rect(8,-3,29,8)+cut(11,22,24,10)+cut(9,45,27,10);
    if(type==='castle')return rect(20,53,146,74)+rect(0,18,36,109)+rect(150,18,36,109)+rect(68,0,48,127)+Array.from({length:5},(_,i)=>rect(i*8,10,5,15)+rect(150+i*8,10,5,15)).join('')+path('M61 2L92 -33L123 2Z')+path('M78 127L78 98Q92 78 106 98L106 127Z').replace('/>',' fill="white" fill-opacity=".7"/>')+windows(8,40,2,3,14,24,6,11)+windows(158,40,2,3,14,24,6,11);
    if(type==='palace')return rect(0,30,220,70)+rect(80,0,60,100)+path('M65 3L110 -24L155 3Z')+windows(12,45,15,2,13,22,6,12)+windows(92,9,3,1,13,13,7,13);
    if(type==='church'||type==='cathedral')return path('M22 151L22 62L64 25L104 62L104 151Z')+rect(2,30,32,121)+path('M0 32L18 0L37 32Z')+windows(12,46,1,4,13,21,11,13)+cut(52,113,24,38)+(type==='cathedral'?rect(96,30,32,121)+path('M93 32L112 0L131 32Z')+windows(106,46,1,4,13,21,11,13):'');
    if(type==='mosque')return rect(29,73,95,60)+path('M29 75Q27 47 77 20Q128 48 124 75Z')+rect(73,6,6,22)+rect(0,17,16,116)+path('M-2 18L8 -10L18 18Z')+rect(137,17,16,116)+path('M135 18L145 -10L155 18Z')+windows(42,89,4,1,19,12,10,24);
    if(type==='temple')return path('M0 35L80 0L160 35Z')+rect(0,111,160,10)+rect(8,103,144,10)+Array.from({length:7},(_,i)=>rect(13+i*21,40,11,65)).join('');
    if(type==='pagoda')return Array.from({length:5},(_,i)=>{const w=40+i*17,x=80-w/2,y=i*34;return rect(x,y,w,28)+path(`M${x-18} ${y+32}Q${x} ${y+24} ${x+7} ${y+14}L${x+w-7} ${y+14}Q${x+w} ${y+24} ${x+w+18} ${y+32}Z`)+cut(x+w/2-5,y+3,10,13)}).join('')+stroke('M80 0L80 -18',4);
    if(type==='lighthouse')return path('M0 170L17 38L49 38L66 170Z')+rect(7,31,51,9)+rect(15,7,34,25)+path('M8 8L32 -13L56 8Z')+cut(20,12,24,13)+cut(21,62,21,10)+cut(15,112,33,15);
    if(type==='eiffel')return path('M0 240Q62 152 70 0L80 0Q88 152 150 240L123 240Q110 186 75 186Q40 186 27 240ZM55 158L95 158L83 83L67 83Z')+rect(45,153,60,10)+rect(61,70,28,8)+stroke('M17 218L45 187L30 185M133 218L106 187L120 185M53 149L86 88M96 149L63 88M75 0L75 -15',3);
    if(type==='arch')return path('M0 120L0 0L120 0L120 120L84 120L84 64Q60 24 36 64L36 120Z')+rect(-5,0,130,14)+cut(8,27,104,7)+cut(10,70,17,31)+cut(94,70,17,31);
    if(type==='pyramid')return path('M0 130L110 0L220 130Z')+path('M110 0L153 130L220 130Z').replace('/>',' fill="white" fill-opacity=".2"/>');
    if(type==='obelisk')return path('M8 155L13 14L25 0L37 14L42 155Z')+rect(0,155,50,12);
    if(type==='stadium')return ellipse(100,28,100,28)+rect(0,27,200,57)+ellipse(100,84,100,16)+ellipse(100,25,75,14).replace('/>',' fill="white" fill-opacity=".75"/>')+windows(9,48,15,2,13,18,5,10);
    if(['station','airport','hospital','school','mall'].includes(type))return rect(0,30,220,70)+path('M55 31L110 0L165 31Z')+windows(10,46,14,type==='hospital'?3:2,15,16,9,9)+(type==='airport'?rect(187,-15,17,45)+rect(174,-31,44,19):type==='hospital'?rect(106,5,8,23,'0','fill="white"')+rect(99,13,22,8,0,'fill="white"'):type==='station'?circle(110,22,9).replace('/>',' fill="white" fill-opacity=".7"/>'):'');
    if(type==='bridge')return rect(0,90,250,8)+rect(49,0,8,124)+rect(193,0,8,124)+stroke('M0 87L53 1Q125 138 197 1L250 87',3)+Array.from({length:13},(_,i)=>{const x=61+i*10;return stroke(`M${x} ${10+68*Math.sin((x-53)/144*Math.PI)}L${x} 90`,1.5)}).join('');
    if(type==='viaduct')return path('M0 20L250 20L250 110L232 110L232 64Q213 36 194 64L194 110L181 110L181 64Q162 36 143 64L143 110L130 110L130 64Q111 36 92 64L92 110L79 110L79 64Q60 36 41 64L41 110L28 110L28 64Q14 43 0 64Z')+rect(0,10,250,10);
    if(type==='windmill')return path('M72 212L76 69L82 69L88 212Z')+circle(79,62,8)+path('M76 57L81 0L87 2L85 56ZM72 61L5 93L0 88L70 53ZM84 66L126 114L119 119L78 73Z');
    if(type==='antenna')return path('M0 205L44 0L50 0L94 205L81 205L47 40L13 205Z')+stroke('M17 150L67 104L35 54M77 150L27 104L59 54M14 170L80 170M25 116L70 116M35 67L59 67',3)+ellipse(69,48,11,17)+rect(11,80,5,27);
    return rect(0,0,100,100);
  }
  function shapeMarkup(subject) {
    const {shape,variant=0}=subject;
    if(shape==='man'||shape==='woman')return human(shape==='woman',variant);
    if(subject.category==='animal')return animal(shape);
    if(subject.category==='vehicle')return vehicle(shape,variant);
    return building(shape,variant);
  }
  root.Shapes={markup:shapeMarkup};
  if(typeof module!=='undefined')module.exports=root.Shapes;
})(typeof globalThis!=='undefined'?globalThis:this);
