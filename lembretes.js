'use strict';
/* Lembretes dentro da app + fotos de evolução (etapa 6) */
const LD={treino:{on:1,h:'18:00'},peso:{on:1,h:'08:00'},agua:{on:1},medidas:{on:1},refeicoes:{on:1,h:'20:00'},descanso:{on:0,h:'22:30'},avaliacao:{on:1},feito:{}};
const LN={treino:'Treino',peso:'Pesagem',agua:'Água',medidas:'Medidas (semanal)',refeicoes:'Registo de refeições',descanso:'Hora de dormir',avaliacao:'Avaliação semanal (domingo)'};
const getL=()=>{S.lemb=S.lemb||{};for(const k in LD)if(!S.lemb[k])S.lemb[k]=JSON.parse(JSON.stringify(LD[k]));return S.lemb};
function pend(){const L=getL(),d=today(),n=new Date(),hm=pad(n.getHours())+':'+pad(n.getMinutes()),o=[],c=calc(),ml=S.water[d]||0;
const at=k=>L[k].on&&hm>=L[k].h;
if(at('treino')&&!(S.log&&S.log[d]))o.push(['Hora de treinar.']);
if(at('peso')&&!S.weights.some(x=>x.d===d&&x.w))o.push(['Ainda não registaste o peso de hoje.']);
if(L.agua.on){const f=Math.max(0,Math.min(1,(n.getHours()-7)/14));if(ml<f*c.agua*.8)o.push([`Água atrasada: ${ml} de ${c.agua} ml.`])}
if(L.medidas.on&&!S.weights.some(x=>x.ab&&Date.now()-new Date(x.d)<7*864e5))o.push(['Mede o abdómen e a cintura esta semana.']);
if(at('refeicoes')&&!((S.diario||{})[d]||[]).length)o.push(['Regista o que comeste hoje.']);
if(L.descanso.on&&(hm>=L.descanso.h||hm<'04:00'))o.push(['Hora de descansar: o sono ajuda a perder gordura e a recuperar.']);
if(L.avaliacao.on&&n.getDay()===0&&L.feito.avaliacao!==d)o.push(['Avaliação semanal: compara peso, medidas e treinos da semana.','avaliacao']);
return o}
const cardL=()=>{const p=pend();return p.length?`<div class="card warn"><h2>Lembretes</h2>${p.map(x=>`<div class="li"><span>${esc(x[0])}</span>${x[1]?`<button class="sm" data-a="feitoL" data-v="${x[1]}">Feito</button>`:''}</div>`).join('')}</div>`:''};
const hojeOld=vHoje;window.EXTRA.hoje=()=>hojeOld().replace('<div class="card"><span class="mut">Peso actual',cardL()+'<div class="card"><span class="mut">Peso actual');
const cfgOld=window.EXTRA.cfg;
function vLembCfg(){const L=getL();return`<div class="card"><h2>Lembretes</h2>${Object.keys(LN).map(k=>`<div class="li"><label class="ck" style="margin:0"><input type="checkbox" data-lk="${k}" ${L[k].on?'checked':''}>${LN[k]}</label>${L[k].h?`<input type="time" data-lh="${k}" value="${L[k].h}" style="width:120px">`:''}</div>`).join('')}
<p class="mut">Aparecem no ecrã Hoje quando abres a app. O iPhone não deixa a app avisar-te com ela fechada; se precisares, cria um alarme no relógio.</p></div>`}
window.EXTRA.cfg=()=>cfgOld()+vLembCfg();
/* Fotos */
let FU={},lf=false;
async function loadF(){if(lf)return;lf=true;let ch=0;for(const f of S.fotos||[])if(!FU[f.id]){const b=await DB.get('foto:'+f.id);if(b){FU[f.id]=URL.createObjectURL(b);ch=1}}lf=false;if(ch&&view==='evol')render()}
async function shrink(file){let im;try{im=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){im=await createImageBitmap(file)}
const s=Math.min(1,1024/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=im.width*s;cv.height=im.height*s;cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);return new Promise(ok=>cv.toBlob(ok,'image/jpeg',.82))}
function vFotos(){const F=S.fotos||[];loadF();const im=f=>FU[f.id]?`<img src="${FU[f.id]}" style="width:100%;border-radius:10px">`:'<p class="mut">A carregar…</p>',dt=f=>f.d.split('-').reverse().join('/');
return`<div class="card"><h2>Fotos de evolução</h2>${F.length>=2?`<div class="f2"><div>${im(F[0])}<p class="mut">${dt(F[0])}${F[0].w?' · '+r1(F[0].w)+' kg':''}</p></div><div>${im(F[F.length-1])}<p class="mut">${dt(F[F.length-1])}${F[F.length-1].w?' · '+r1(F[F.length-1].w)+' kg':''}</p></div></div>`:'<p class="mut">Tira a primeira foto (mesma luz, mesma pose, de frente e de lado) e repete a cada 2 semanas.</p>'}
<label>Adicionar foto</label><input id="foto-in" type="file" accept="image/*">
${F.length?`<div class="row" style="margin-top:10px">${F.map(f=>`<button class="sm" data-a="delFoto" data-v="${f.id}">${dt(f)} ×</button>`).join('')}</div>`:''}
<p class="mut">As fotos ficam só neste telemóvel e não entram na cópia de segurança.</p></div>`}
const evolOld=vEvol;window.EXTRA.evol=()=>evolOld()+vFotos();
Object.assign(A,{
feitoL:async e=>{getL().feito[e.dataset.v]=today();await save('lemb');render()},
delFoto:async e=>{if(!confirm('Apagar esta foto?'))return;const id=e.dataset.v;S.fotos=S.fotos.filter(f=>f.id!==id);await save('fotos');await DB.del('foto:'+id);delete FU[id];render()}});
document.addEventListener('change',async e=>{const t=e.target,L=S.profile&&getL();
if(t.dataset.lk){L[t.dataset.lk].on=t.checked?1:0;await save('lemb')}
else if(t.dataset.lh){L[t.dataset.lh].h=t.value||LD[t.dataset.lh].h;await save('lemb')}
else if(t.id==='foto-in'&&t.files[0]){try{const b=await shrink(t.files[0]),id='f'+Date.now();await DB.set('foto:'+id,b);S.fotos=(S.fotos||[]).concat([{id,d:today(),w:lastW()}]);await save('fotos');render()}catch(er){alert('Não consegui guardar a foto.')}}});
