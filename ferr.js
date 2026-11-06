'use strict';
/* Etapa 9: descanso, contador de repetições, prato e calculadora de porções */
let RT=null,CN={n:0,s:[]},PC=null;
function tickR(){if(!RT||RT.done)return;RT.left=Math.ceil((RT.end-Date.now())/1000);if(RT.left<=0){clearInterval(RT.iv);RT={done:1};navigator.vibrate&&navigator.vibrate([300,100,300])}render()}
const fer=()=>`<div class="card"><h2>Ferramentas</h2><p class="mut">Descanso entre séries</p><div class="row">${[30,45,60,90].map(s=>`<button class="sm" data-a="rest" data-v="${s}">${s} s</button>`).join('')}</div>
${RT?`<div class="tm ${RT.done?'':'rest'}" style="font-size:56px">${RT.done?'Pronto':RT.left}</div>${RT.done?'':'<button class="sm" data-a="restStop">Parar</button>'}`:''}
<p class="mut" style="margin-top:12px">Contador de repetições</p><div class="tm" style="font-size:64px">${CN.n}</div><div class="row"><button class="p" data-a="cn" data-v="1" style="flex:1;padding:18px">+1</button><button data-a="cn" data-v="-1">−1</button><button data-a="cnS">Fechar série</button></div>
${CN.s.length?`<p class="mut">Séries: ${CN.s.join(' · ')}</p>`:''}<button class="sm" data-a="cnR" style="margin-top:8px">Limpar</button></div>`;
const tr4=window.EXTRA.treino;window.EXTRA.treino=()=>{const h=tr4();return(P||window.FBX)?h:h+fer()};
const prato=()=>`<div class="card"><h2>Prato e porções</h2><svg viewBox="0 0 280 140" style="max-width:340px"><path d="M70 10A60 60 0 0 0 70 130Z" fill="#4c8a52"/><path d="M70 70L70 10A60 60 0 0 1 130 70Z" fill="#B7F34A"/><path d="M70 70L130 70A60 60 0 0 1 70 130Z" fill="#F0A34A"/>
<g fill="#F2F4EF" font-size="12"><text x="145" y="40">½ vegetais e salada</text><text x="145" y="75">¼ proteína (palma)</text><text x="145" y="110">¼ hidratos (punho)</text></g></svg>
<p class="mut">Polegar = óleo ou gordura · mão em concha = ginguba ou fruta seca.</p>
<label>Calculadora de porções</label><select id="pc-f">${FD.map(f=>`<option value="${f.id}">${esc(f.nome)}</option>`)}</select><div class="f2" style="margin-top:8px"><input id="pc-g" type="number" inputmode="decimal" placeholder="gramas"><button data-a="pcalc">Calcular</button></div>
${PC?`<p>${PC}</p>`:''}</div>`;
const nu4=window.EXTRA.nutri;window.EXTRA.nutri=()=>nu4()+prato();
Object.assign(A,{
rest:e=>{if(RT&&RT.iv)clearInterval(RT.iv);const s=+e.dataset.v;RT={end:Date.now()+s*1000,left:s};RT.iv=setInterval(tickR,500);render()},
restStop:()=>{if(RT&&RT.iv)clearInterval(RT.iv);RT=null;render()},
cn:e=>{CN.n=Math.max(0,CN.n+ +e.dataset.v);render()},
cnS:()=>{if(CN.n)CN.s.push(CN.n);CN.n=0;render()},
cnR:()=>{CN={n:0,s:[]};render()},
pcalc:()=>{const g=num('pc-g');if(!g)return alert('Indica as gramas.');const f=fd(v('pc-f')),m=g/100;PC=`${g} g de ${esc(f.nome)}: ${Math.round(f.k*m)} kcal · proteína ${r1(f.p*m)} g · hidratos ${r1(f.c*m)} g · gordura ${r1(f.f*m)} g`;render()}});
