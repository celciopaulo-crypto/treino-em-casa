'use strict';
/* Etapa 8: braços e mobilidade, alternativas, preferências, plano semanal, alimentos, água, meses */
Object.assign(GN,{'braços':'Braços',mobilidade:'Mobilidade e alongamento'});
[['triceps','Tríceps na cadeira','braços','corpo','Mãos na beira de uma cadeira firme, pés à frente; dobra os cotovelos e sobe.','Cadeira encostada à parede.','Dobra menos os cotovelos.'],
['bicepsm','Rosca com mochila','braços','mochila','Segura a mochila pelas alças, cotovelos junto ao corpo; sobe e desce devagar.','Sem balançar o tronco.','Usa garrafas de água.'],
['diamante','Flexão diamante','braços','corpo','Mãos juntas sob o peito, cotovelos junto ao corpo; desce e empurra.','Apoia os joelhos se precisares.','Flexão normal com joelhos no chão.'],
['pneutri','Tríceps no pneu','braços','pneu','Mãos no pneu atrás de ti, pernas à frente; dobra os cotovelos e sobe.','Pneu bem apoiado.','Faz na cadeira.'],
['gatocamelo','Gato-camelo','mobilidade','corpo','Em quatro apoios, arredonda e arqueia a coluna devagar, a respirar.','Sem forçar a amplitude.','Menor amplitude.'],
['isquios','Alongamento dos isquiotibiais','mobilidade','corpo','Sentado, perna esticada, inclina o tronco com a coluna longa. 30 s cada lado.','Sem solavancos.','Dobra ligeiramente o joelho.'],
['quadriceps','Alongamento do quadríceps','mobilidade','corpo','Em pé, leva o calcanhar ao glúteo e segura. 30 s cada lado.','Apoia-te à parede.','Deitado de lado.'],
['anca','Mobilidade da anca (90/90)','mobilidade','corpo','Sentado, pernas a 90°, roda os joelhos de um lado para o outro.','Devagar, sem dor.','Senta-te numa almofada.']
].forEach(a=>EX.push({id:a[0],nome:a[1],grupo:a[2],equip:a[3],saltos:0,desc:a[4],seg:a[5],alt:a[6]}));
const ALT={agach:'Agacha até uma cadeira e senta-te de leve.',avanco:'Avanço estático, sem descer tanto.',ponte:'Pés mais perto da anca, ou uma perna de cada vez.',agsalto:'Agachamento normal, sem salto.',flexao:'Joelhos no chão ou mãos na parede.',prancha:'Prancha com os joelhos no chão.',escalador:'Joelho a joelho, devagar.',burpee:'Agacha e estende as pernas, sem flexão.',burpeej:'Burpee sem salto.',polich:'Passo lateral com braços acima da cabeça.',bicicleta:'Ritmo lento, pernas mais altas.',birddog:'Só o braço ou só a perna.',pike:'Pés mais afastados, menos descida.',pneupush:'Pneu mais leve, ou empurra uma parede.',pneuflip:'Pneu mais leve, ou agachamento a segurar o pneu.',pneuflex:'Mãos no pneu apoiado numa parede.',pneustep:'Degrau mais baixo.',mremada:'Mochila mais leve, mão no joelho.',magach:'Agachamento sem peso.',mterra:'Mochila mais leve, joelhos ligeiramente dobrados.',mpress:'Garrafas de água em vez da mochila.'};
EX.forEach(e=>{if(ALT[e.id])e.alt=ALT[e.id]});
const MET={cardio:8,corpo:6,pernas:5,core:3.5,peito:4.5,costas:4.5,ombros:4,'braços':3.5,mobilidade:2.5};
const pf=()=>(S.pref=S.pref||{fav:[],exc:[],prio:''});
function extraInfo(e){const p=pf(),km=Math.round((MET[e.grupo]||4)*3.5*lastW()/200*10)/10;
return`${e.alt?`<p class="mut">Alternativa mais fácil: ${esc(e.alt)}</p>`:''}<p class="mut">≈ ${km} kcal por minuto (estimativa)</p><div class="row"><button class="sm ${p.fav.includes(e.id)?'p':''}" data-a="fav" data-v="${e.id}">★ Favorito</button><button class="sm ${p.exc.includes(e.id)?'d':''}" data-a="exc" data-v="${e.id}">${p.exc.includes(e.id)?'Excluído':'Excluir dos planos'}</button></div>`}
/* Treinos: preferências */
const tr3=window.EXTRA.treino;
window.EXTRA.treino=()=>{const h=tr3();if(P||window.FBX)return h;const p=pf();return h+`<div class="card"><h2>Preferências do gerador</h2><label>Grupo prioritário</label><select id="pr-g"><option value="">Nenhum</option>${Object.keys(GN).map(g=>`<option value="${g}" ${p.prio===g?'selected':''}>${GN[g]}</option>`)}</select>
<p class="mut">Excluídos: ${p.exc.length?p.exc.map(id=>`<button class="sm" data-a="exc" data-v="${id}">${esc(exById(id).nome)} ×</button>`).join(' '):'nenhum'}. Marca ★ ou exclui na Biblioteca.</p></div>`};
/* Alimentação */
const GR=[['ovo','frango','peixe','carne'],['arroz','batata','mandioca','funge','bananap'],['banana','laranja','papaia']],DIAS=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];let sd=0;
const subs=id=>{const nao=S.nao||[];if(!nao.includes(id))return id;const g=GR.find(x=>x.includes(id));return(g&&g.find(x=>!nao.includes(x)))||id};
const diaN=n=>{const c=calc();return{refs:TPL.map((al,i)=>({nome:REF[i],itens:al[n%al.length].map(([id,s])=>{id=subs(id);return{id,g:Math.max(5,Math.round(c.kcal*SH[i]*s*100/fd(id).k/5)*5)}})}))}};
function vSemana(){const W=S.semana,cur=W&&W[sd];let lista='';if(W){const t={};W.forEach(d=>d.refs.forEach(r=>r.itens.forEach(x=>t[x.id]=(t[x.id]||0)+x.g)));lista=Object.keys(t).map(id=>`<span class="chip">${esc(fd(id).nome)} ${(t[id]/1000).toFixed(1)} kg</span>`).join('')}
const tem=GR.flat();
return`<div class="card"><h2>Plano da semana</h2><div class="row">${DIAS.map((d,i)=>`<button class="sm ${i===sd?'p':''}" data-a="sd" data-v="${i}">${d}</button>`).join('')}</div>
${cur?cur.refs.map(r=>`<div class="li" style="display:block"><b>${r.nome}</b> <span class="mut">≈ ${Math.round(tot(r.itens).k)} kcal</span><br>${r.itens.map(x=>`<span class="chip">${esc(fd(x.id).nome)} ${x.g} g</span>`).join('')}</div>`).join('')+`<p class="mut">Compras da semana (aprox.):</p><p>${lista}</p>`:'<p class="mut">Gera 7 dias variados com os teus alvos.</p>'}
<br><button class="p" data-a="genS">${W?'Gerar nova semana':'Gerar semana'}</button>
<p class="mut" style="margin-top:12px">Alimentos que não tens (serão trocados por equivalentes):</p><div class="row">${tem.map(id=>`<button class="sm ${(S.nao||[]).includes(id)?'d':''}" data-a="nao" data-v="${id}">${esc(fd(id).nome.split(' (')[0])}</button>`).join('')}</div></div>
<div class="card"><h2>Adicionar alimento</h2>${field('c-n','Nome','','text')}<div class="f2">${field('c-k','kcal /100 g')}${field('c-p','Proteína /100 g')}${field('c-c','Hidratos /100 g')}${field('c-f','Gordura /100 g')}</div><br><button class="p" data-a="addFood">Guardar alimento</button>${(S.alimentos||[]).map(f=>`<div class="li"><span>${esc(f.nome)} · ${f.k} kcal</span><button class="sm d" data-a="delFood" data-v="${f.id}">×</button></div>`).join('')}</div>`}
function vAgua(){const c=calc();return`<div class="card"><h2>Hidratação</h2><button class="sm ${S.quente?'p':''}" data-a="quente">Dia muito quente (+500 ml)</button>
<p>Ao acordar: 300 a 500 ml. Espaça o resto ao longo do dia, 200–300 ml de cada vez. Meta de hoje: ${c.agua} ml.</p>
<p><b>Treino:</b> 300–500 ml na hora antes; 150–250 ml a cada 15–20 min durante; 500 ml nas 2 h seguintes.</p>
<p><b>Sinais de desidratação:</b> urina escura, sede forte, boca seca, tonturas, dor de cabeça, cansaço invulgar.</p>
<p class="mut">Evita beber litros de uma vez. Com doença renal, cardíaca ou medicação para a tensão, pede orientação ao teu médico.</p></div>`}
const nu3=window.EXTRA.nutri;window.EXTRA.nutri=()=>{(S.alimentos||[]).forEach(f=>{if(!fd(f.id))FD.push(f)});return nu3()+vSemana()+vAgua()};
/* Meses */
function vMeses(){const m={};S.weights.forEach(x=>{const k=x.d.slice(0,7),o=m[k]=m[k]||{w:[],ab:[],t:0};x.w&&o.w.push(x.w);x.ab&&o.ab.push(x.ab)});Object.keys(S.log||{}).forEach(d=>{const k=d.slice(0,7),o=m[k]=m[k]||{w:[],ab:[],t:0};o.t++});
const ks=Object.keys(m).sort().slice(-6),av=a=>a.length?a.reduce((t,y)=>t+y,0)/a.length:null,f=x=>x==null?'—':r1(x),pm=ks.map(k=>av(m[k].w)),vs=pm.filter(x=>x!=null);if(!ks.length)return'';
const mn=Math.min(...vs)-1,mx=Math.max(...vs)+1,bars=pm.map((x,i)=>x==null?'':`<rect x="${20+i*50}" y="${110-(x-mn)/(mx-mn)*90}" width="34" height="${(x-mn)/(mx-mn)*90}" rx="4" fill="#B7F34A"/><text x="${37+i*50}" y="${104-(x-mn)/(mx-mn)*90}" fill="#F2F4EF" font-size="9" text-anchor="middle">${r1(x)}</text><text x="${37+i*50}" y="124" fill="#9aa69e" font-size="9" text-anchor="middle">${ks[i].slice(5)}</text>`).join('');
let cmp='';if(ks.length>=2){const a=m[ks[ks.length-2]],b=m[ks[ks.length-1]],d=av(b.w)!=null&&av(a.w)!=null?av(b.w)-av(a.w):null;cmp=`<p>Este mês vs anterior: peso médio ${d==null?'—':(d>0?'+':'')+r1(d)+' kg'}, treinos ${b.t} vs ${a.t}.</p>`}
return`<div class="card"><h2>Meses</h2><svg viewBox="0 0 320 130">${bars}</svg>${cmp}${ks.map(k=>`<div class="li"><span>${k.split('-').reverse().join('/')}</span><span>${f(av(m[k].w))} kg · abd. ${f(av(m[k].ab))} · ${m[k].t} treinos</span></div>`).join('')}</div>`}
const ev3=window.EXTRA.evol;window.EXTRA.evol=()=>ev3()+vMeses();
Object.assign(A,{
fav:async e=>{const p=pf(),i=p.fav.indexOf(e.dataset.v);i<0?p.fav.push(e.dataset.v):p.fav.splice(i,1);await save('pref');render()},
exc:async e=>{const p=pf(),i=p.exc.indexOf(e.dataset.v);i<0?p.exc.push(e.dataset.v):p.exc.splice(i,1);await save('pref');render()},
sd:e=>{sd=+e.dataset.v;render()},
genS:async()=>{S.semana=[0,1,2,3,4,5,6].map(diaN);await save('semana');render()},
genD:async()=>{S.dieta=Object.assign({d:today()},diaN(Math.floor(Math.random()*3)));await save('dieta');render()},
nao:async e=>{S.nao=S.nao||[];const i=S.nao.indexOf(e.dataset.v);i<0?S.nao.push(e.dataset.v):S.nao.splice(i,1);await save('nao');render()},
quente:async()=>{S.quente=!S.quente;await save('quente');render()},
addFood:async()=>{const n=v('c-n'),k=num('c-k');if(!n||!k)return alert('Indica o nome e as kcal por 100 g.');const f={id:'u'+Date.now(),nome:n,k,p:num('c-p')||0,c:num('c-c')||0,f:num('c-f')||0,med:'por 100 g'};S.alimentos=(S.alimentos||[]).concat([f]);FD.push(f);await save('alimentos');render()},
delFood:async e=>{S.alimentos=S.alimentos.filter(f=>f.id!==e.dataset.v);const i=FD.findIndex(f=>f.id===e.dataset.v);if(i>=0)FD.splice(i,1);await save('alimentos');render()}});
document.addEventListener('change',async e=>{if(e.target.id==='pr-g'){pf().prio=e.target.value;await save('pref')}});
