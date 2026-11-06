'use strict';
const $=s=>document.querySelector(s), esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0'), iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()), today=()=>iso(new Date());
const r1=n=>(Math.round(n*10)/10).toLocaleString('pt-PT');
/* ---------- Armazenamento local (IndexedDB) ---------- */
const DB=(()=>{let db;const open=()=>db?Promise.resolve(db):new Promise((ok,no)=>{const q=indexedDB.open('treino',1);q.onupgradeneeded=()=>q.result.createObjectStore('kv');q.onsuccess=()=>{db=q.result;ok(db)};q.onerror=()=>no(q.error)});
const tx=async(m,f)=>{const d=await open();return new Promise((ok,no)=>{const t=d.transaction('kv',m),q=f(t.objectStore('kv'));t.oncomplete=()=>ok(q&&q.result);t.onerror=()=>no(t.error)})};
return{keys:async()=>{const d=await open();return new Promise(ok=>{d.transaction('kv').objectStore('kv').getAllKeys().onsuccess=e=>ok(e.target.result)})},get:k=>tx('readonly',s=>s.get(k)),del:k=>tx('readwrite',s=>s.delete(k)),set:(k,v)=>tx('readwrite',s=>s.put(v,k)),clear:()=>tx('readwrite',s=>s.clear()),
all:async()=>{const d=await open();return new Promise(ok=>{const o={};d.transaction('kv').objectStore('kv').openCursor().onsuccess=e=>{const c=e.target.result;if(c){if(!/^(vid|foto):/.test(c.key))o[c.key]=c.value;c.continue()}else ok(o)}})}}})();
let S={profile:null,weights:[],water:{},train:{},pin:null,meta:{}},view='hoje',locked=false;
const save=k=>DB.set(k,S[k]);
/* ---------- Cálculos (estimativas, não medições) ---------- */
const lastW=()=>{const a=S.weights.filter(x=>x.w);return a.length?a[a.length-1].w:S.profile?.peso};
const imc=()=>lastW()/Math.pow(S.profile.altura/100,2);
function avg7(){const a=S.weights.filter(x=>x.w);if(!a.length)return null;const e=new Date(a[a.length-1].d).getTime(),s=a.filter(x=>e-new Date(x.d).getTime()<=6*864e5);return s.reduce((t,x)=>t+x.w,0)/s.length}
function calc(){const p=S.profile,w=lastW();const bmr=10*w+6.25*p.altura-5*p.idade+(p.sexo==='m'?5:-161),tdee=bmr*p.act;
let def=p.ritmo*7700/7;const max=tdee*.25,capped=def>max;def=Math.min(def,max);const kcal=Math.max(tdee-def,bmr);def=tdee-kcal;
const ref=Math.min(w,(p.meta||w)+10),prot=Math.round(ref*1.6),fat=Math.round(kcal*.25/9),carb=Math.max(0,Math.round((kcal-prot*4-fat*9)/4));
const treino=!!S.train[today()],agua=Math.round((w*30+(treino?(S.log&&S.log[today()]?S.log[today()].min*13:500):0)+(S.quente?500:0))/50)*50;
return{bmr:Math.round(bmr),tdee:Math.round(tdee),kcal:Math.round(kcal),def:Math.round(def),real:def*7/7700,capped,prot,fat,carb,agua,treino}}
/* ---------- PIN ---------- */
const hex=b=>[...new Uint8Array(b)].map(x=>pad(x.toString(16))).join('');
async function hashPin(pin,salt){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt,iterations:150000,hash:'SHA-256'},k,256))}
/* ---------- Gráfico ---------- */
function chart(){const a=S.weights.filter(x=>x.w).slice(-40);if(a.length<2)return'<p class="mut">Regista pelo menos 2 pesagens para ver o gráfico.</p>';
const ws=a.map(x=>x.w),mn=Math.min(...ws)-1,mx=Math.max(...ws)+1,X=i=>24+i*(280/(a.length-1)),Y=v=>12+(mx-v)/(mx-mn)*116;
const raw=a.map((x,i)=>X(i)+','+Y(x.w)).join(' '),av=a.map((x,i)=>{const s=a.slice(Math.max(0,i-6),i+1);return X(i)+','+Y(s.reduce((t,y)=>t+y.w,0)/s.length)}).join(' ');
return`<svg viewBox="0 0 320 150"><polyline points="${raw}" fill="none" stroke="#5a5e69" stroke-width="1.5"/><polyline points="${av}" fill="none" stroke="#B7F34A" stroke-width="3" stroke-linecap="round"/>
<text x="2" y="22" fill="#8C8F98" font-size="10">${r1(mx)}</text><text x="2" y="130" fill="#8C8F98" font-size="10">${r1(mn)}</text></svg><p class="mut">Cinzento: pesagens. Laranja: média móvel de 7 dias (a que importa).</p>`}
/* ---------- Ecrãs ---------- */
const field=(id,l,v,t='number',x='')=>`<div><label for="${id}">${l}</label><input id="${id}" type="${t}" value="${esc(v??'')}" ${t==='number'?'inputmode="decimal" step="any"':''} ${x}></div>`;
function formPerfil(){const p=S.profile||{};const sel=(v,o)=>o.map(([k,l])=>`<option value="${k}" ${String(v)===String(k)?'selected':''}>${l}</option>`).join('');
return`<div class="f2">${field('f-idade','Idade (anos)',p.idade)}<div><label>Sexo</label><select id="f-sexo"><option value="">Escolher…</option>${sel(p.sexo,[['m','Masculino'],['f','Feminino']])}</select></div></div>
<div class="f2">${field('f-peso',S.profile?'Peso inicial (kg)':'Peso actual (kg)',p.pesoInicial??p.peso??111)}${field('f-altura','Altura (cm)',p.altura??180)}</div>
<div class="f2">${field('f-meta','Peso desejado (kg)',p.meta,'number')}<div><label>Ritmo desejado</label><select id="f-ritmo">${sel(p.ritmo??.75,[[.5,'0,5 kg/semana'],[.75,'0,75 kg/semana'],[1,'1 kg/semana']])}</select></div></div>
<label>Actividade diária</label><select id="f-act">${sel(p.act??1.55,[[1.2,'Sedentário'],[1.375,'Leve (1–3 treinos/sem.)'],[1.55,'Moderada (5 treinos/sem.)'],[1.725,'Intensa']])}</select>
${field('f-saude','Limitações ou condições de saúde (opcional)',p.saude,'text')}`}
function vHoje(){const p=S.profile,w=lastW(),c=calc(),d=today(),ml=S.water[d]||0,perdido=p.pesoInicial-w,falta=p.meta?w-p.meta:null,a=avg7();
const bk=(Date.now()-(S.meta.lastBackup||S.meta.criado||Date.now()))>7*864e5;
return`<img class="logo sm" src="logo.png" alt="GORDURA ZERO"><h1>Hoje</h1><p class="mut">${new Date().toLocaleDateString('pt-PT',{weekday:'long',day:'numeric',month:'long'})}</p>
${bk?`<div class="card warn"><b>Faz uma cópia de segurança.</b><p class="mut">Os dados vivem só neste telemóvel. Exporta uma cópia uma vez por semana.</p><button class="sm p" data-a="export">Exportar agora</button></div>`:''}
<div class="card"><span class="mut">Peso actual</span><div class="big">${r1(w)} <small class="mut" style="font-size:18px">kg</small></div>${a?`<p class="mut">Média 7 dias: ${r1(a)} kg</p>`:''}</div>
<div class="grid"><div class="card st"><b>${r1(perdido)} kg</b><span>${perdido>=0?'Perdidos':'Acima do inicial'}</span></div><div class="card st"><b>${r1(imc())}</b><span>IMC</span></div>
<div class="card st"><b>${falta!=null?r1(Math.max(0,falta))+' kg':'—'}</b><span>Para o peso desejado</span></div><div class="card st"><b>${c.kcal} kcal</b><span>Meta diária</span></div></div>
<div class="card"><h2>Água · ${ml} / ${c.agua} ml</h2><div class="bar"><i style="width:${Math.min(100,ml/c.agua*100)}%"></i></div><div class="row"><button class="p" data-a="water" data-v="250">+250 ml</button><button data-a="water" data-v="500">+500 ml</button></div></div>
${cardTreino()}`}
function vNutri(){const c=calc(),d=today(),ml=S.water[d]||0;
return`<h1>Nutrição</h1><div class="card"><h2>Metas diárias (estimativas)</h2><div class="grid"><div class="st"><b>${c.kcal}</b><span>kcal</span></div><div class="st"><b>${c.prot} g</b><span>proteína</span></div><div class="st"><b>${c.carb} g</b><span>hidratos</span></div><div class="st"><b>${c.fat} g</b><span>gordura</span></div></div>
<p class="mut">Metabolismo basal ≈ ${c.bmr} kcal; gasto diário ≈ ${c.tdee} kcal; défice ≈ ${c.def} kcal (≈ ${r1(c.real)} kg/semana). São estimativas: ajusta pela tua evolução real nas semanas seguintes.</p>
${c.capped?`<p class="warn card">O ritmo pedido exigia um défice acima de 25% do teu gasto. Limitei-o para preservar músculo e energia.</p>`:''}</div>
<div class="card"><h2>Água · ${ml} / ${c.agua} ml</h2><div class="bar"><i style="width:${Math.min(100,ml/c.agua*100)}%"></i></div>
<div class="row"><button class="p" data-a="water" data-v="200">+200</button><button class="p" data-a="water" data-v="250">+250</button><button class="p" data-a="water" data-v="500">+500</button><button data-a="water" data-v="-250">Desfazer 250</button></div>
<button style="margin-top:10px" data-a="train">${c.treino?'Dia de treino (+500 ml) ✓':'Hoje é dia de treino?'}</button>
<p class="mut">Meta = 30 ml/kg${c.treino?' + 500 ml pelo treino':''}. Bebe ao longo do dia, não tudo de uma vez. Com doença renal ou cardíaca, segue a orientação do teu médico.</p></div>`}
function vEvol(){const h=[...S.weights].reverse().slice(0,10),n={ab:'Abdómen',ci:'Cintura',pe:'Peito',br:'Braço',co:'Coxa',gc:'Gordura %'};
return`<h1>Evolução</h1><div class="card">${chart()}</div>
<div class="card"><h2>Novo registo</h2>${field('e-d','Data',today(),'date')}<div class="f2">${field('e-w','Peso (kg)')}${field('e-ab','Abdómen (cm)')}${field('e-ci','Cintura (cm)')}${field('e-pe','Peito (cm)')}${field('e-br','Braço (cm)')}${field('e-co','Coxa (cm)')}${field('e-gc','Gordura corporal (%), só se medires')}</div>
<p class="mut">Pesa-te sempre à mesma hora, de manhã. Preenche só o que mediste.</p><button class="p" data-a="saveW">Guardar</button></div>
<div class="card"><h2>Histórico</h2>${h.length?h.map(x=>`<div class="li"><span>${x.d.split('-').reverse().join('/')} · ${[x.w&&r1(x.w)+' kg',...Object.keys(n).filter(k=>x[k]).map(k=>n[k]+' '+x[k])].filter(Boolean).join(' · ')}</span><button class="sm d" data-a="delW" data-v="${x.d}">×</button></div>`).join(''):'<p class="mut">Sem registos.</p>'}</div>`}
function vCfg(){return`<h1>Configurações</h1><div class="card"><h2>Dados pessoais</h2>${formPerfil()}<br><button class="p" data-a="saveP">Guardar dados</button></div>
<div class="card"><h2>Bloqueio por PIN</h2>${S.pin?`<p class="mut">PIN activo.</p><button data-a="rmPin">Remover PIN</button>`:`${field('pin','Novo PIN (4–8 dígitos)','','password','inputmode="numeric" maxlength="8"')}<br><button data-a="setPin">Activar PIN</button>`}<p class="mut">O PIN bloqueia o acesso à app; não encripta os dados guardados.</p></div>
<div class="card"><h2>Cópia de segurança</h2><div class="row"><button class="p" data-a="export">Exportar</button><button data-a="import">Importar</button></div><input id="imp" type="file" accept="application/json" hidden>
<p class="mut">${S.meta.lastBackup?'Última cópia: '+new Date(S.meta.lastBackup).toLocaleDateString('pt-PT'):'Ainda sem cópias.'}</p></div>
<div class="card"><h2>Apagar tudo</h2><button class="d" data-a="wipe">Apagar todos os dados</button></div>`}
function vOnb(){return`<img class="logo" src="logo.png" alt="GORDURA ZERO"><p class="tag">FORÇA. DISCIPLINA. EVOLUÇÃO.</p><p class="mut">Preciso destes dados para calcular as tuas metas. Ficam só neste telemóvel.</p><div class="card">${formPerfil()}<br><button class="p" data-a="saveP">Começar</button></div>`}
function render(){const a=$('#app');
if(locked){a.innerHTML=`<div class="lock"><img class="logo" src="logo.png" alt="GORDURA ZERO"><p class="mut">Introduz o PIN</p><input id="pinin" type="password" inputmode="numeric" maxlength="8" autofocus><p id="pe" class="mut"></p><button class="p" data-a="unlock">Entrar</button></div>`;return}
if(!S.profile){a.innerHTML=vOnb();return}
const V=Object.assign({hoje:vHoje,nutri:vNutri,evol:vEvol,cfg:vCfg},window.EXTRA),T=[['hoje','Hoje'],['treino','Treinos'],['bib','Biblioteca'],['nutri','Nutrição'],['evol','Evolução']];
a.innerHTML=`<button class="gear" data-a="go" data-v="cfg" aria-label="Configurações">⚙</button>`+(view==='ia'?'':`<button class="fab" data-a="go" data-v="ia">IA</button>`)+V[view]()+`<nav>${T.map(([k,l])=>`<button class="${k===view?'on':''}" data-a="go" data-v="${k}">${l}</button>`).join('')}</nav>`}
/* ---------- Acções ---------- */
const v=id=>$('#'+id)?.value.trim(), num=id=>{const x=parseFloat((v(id)||'').replace(',','.'));return isFinite(x)&&x>0?x:null};
async function exportData(){const data=await DB.all();Object.keys(data).forEach(k=>{if(/^(vid|foto):/.test(k)||k==='ia')delete data[k]});const blob=new Blob([JSON.stringify({app:'treino-em-casa',v:1,data},null,1)],{type:'application/json'}),name='treino-backup-'+today()+'.json';
const f=new File([blob],name,{type:'application/json'});
try{if(navigator.canShare?.({files:[f]}))await navigator.share({files:[f]});else{const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=name;l.click();setTimeout(()=>URL.revokeObjectURL(u),5000)}}catch(e){return}
S.meta.lastBackup=Date.now();await save('meta');render()}
const A={
go:e=>{view=e.dataset.v;render();scrollTo(0,0)},
water:async e=>{const d=today();S.water[d]=Math.max(0,(S.water[d]||0)+ +e.dataset.v);await save('water');render()},
train:async()=>{const d=today();S.train[d]?delete S.train[d]:S.train[d]=true;await save('train');render()},
saveP:async()=>{const p={idade:num('f-idade'),sexo:v('f-sexo'),altura:num('f-altura'),meta:num('f-meta'),ritmo:+v('f-ritmo'),act:+v('f-act'),saude:v('f-saude')},pw=num('f-peso');
if(!p.idade||!p.sexo||!p.altura||!pw)return alert('Preenche idade, sexo, peso e altura.');
if(p.meta&&p.meta>=pw)return alert('O peso desejado deve ser inferior ao peso actual.');
const first=!S.profile;p.pesoInicial=pw;p.peso=pw;S.profile=Object.assign({},S.profile,p);await save('profile');
if(first){S.meta.criado=Date.now();await save('meta');S.weights=[{d:today(),w:pw}];await save('weights')}render()},
saveW:async()=>{const d=v('e-d')||today(),e={d};['w','ab','ci','pe','br','co','gc'].forEach(k=>{const x=num('e-'+k);if(x)e[k]=x});if(Object.keys(e).length<2)return alert('Preenche pelo menos um valor.');
const i=S.weights.findIndex(x=>x.d===d);if(i>=0)Object.assign(S.weights[i],e);else S.weights.push(e);S.weights.sort((a,b)=>a.d<b.d?-1:1);await save('weights');render()},
delW:async e=>{if(!confirm('Apagar este registo?'))return;S.weights=S.weights.filter(x=>x.d!==e.dataset.v);await save('weights');render()},
setPin:async()=>{const p=v('pin');if(!/^\d{4,8}$/.test(p||''))return alert('Usa 4 a 8 dígitos.');const salt=crypto.getRandomValues(new Uint8Array(16));S.pin={salt:[...salt],hash:await hashPin(p,salt)};await save('pin');render()},
rmPin:async()=>{S.pin=null;await save('pin');render()},
unlock:async()=>{const h=await hashPin($('#pinin').value,new Uint8Array(S.pin.salt));if(h===S.pin.hash){locked=false;render()}else{$('#pe').textContent='PIN incorrecto.'}},
export:exportData,
import:()=>$('#imp').click(),
wipe:async()=>{if(!confirm('Apagar TODOS os dados deste telemóvel? Não dá para desfazer.'))return;await DB.clear();location.reload()}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a])A[b.dataset.a](b)});
document.addEventListener('change',async e=>{if(e.target.id!=='imp'||!e.target.files[0])return;
try{const j=JSON.parse(await e.target.files[0].text());if(j.app!=='treino-em-casa')throw 0;if(!confirm('Isto substitui os dados actuais. Continuar?'))return;
for(const k of await DB.keys())if(!/^(vid|foto):/.test(k))await DB.del(k);for(const k in j.data)await DB.set(k,j.data[k]);location.reload()}catch(x){alert('Ficheiro de cópia inválido.')}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&locked)A.unlock()});
(async()=>{Object.assign(S,await DB.all());S.weights=S.weights||[];S.water=S.water||{};S.train=S.train||{};S.meta=S.meta||{};locked=!!S.pin;
navigator.storage?.persist?.();render();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{})})();
