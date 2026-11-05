'use strict';
/* Treinos + Biblioteca (etapa 3) */
const GN={pernas:'Pernas e glúteos',core:'Abdómen e core',peito:'Peito',costas:'Costas',ombros:'Ombros',corpo:'Corpo inteiro',cardio:'Cardio'},EQN={corpo:'Peso corporal',pneu:'Pneu',mochila:'Mochila'};
const EX=[
['agach','Agachamento','pernas','corpo',0,'Pés à largura dos ombros, desce com as costas direitas até as coxas ficarem paralelas ao chão e sobe a empurrar o chão.','Joelhos alinhados com os pés.'],
['avanco','Avanço alternado','pernas','corpo',0,'Passo à frente, desce o joelho de trás perto do chão e empurra para voltar.','Tronco erguido; pára se o joelho doer.'],
['ponte','Ponte de glúteos','pernas','corpo',0,'Deitado, pés no chão, sobe a anca e aperta os glúteos 1 s.','Não arquear a lombar.'],
['agsalto','Agachamento com salto','cardio','corpo',1,'Agacha e salta na vertical; aterra suave com os joelhos flectidos.','Evita com dor nos joelhos.'],
['flexao','Flexão','peito','corpo',0,'Mãos sob os ombros, corpo em linha; desce o peito e empurra. Podes apoiar os joelhos.','A anca não pode cair.'],
['prancha','Prancha','core','corpo',0,'Antebraços no chão, corpo em linha recta, abdómen e glúteos contraídos; respira.','Pára se a lombar doer.'],
['escalador','Escalador','cardio','corpo',0,'Em posição de flexão, leva os joelhos ao peito alternadamente, ritmo controlado.','Mãos sob os ombros.'],
['burpee','Burpee adaptado (sem salto)','corpo','corpo',0,'Agacha, leva os pés atrás até à prancha, volta e levanta-te.','Core firme; sem arquear a lombar.'],
['burpeej','Burpee com salto','cardio','corpo',1,'Como o burpee, mas termina com um salto.','Só com boa condição e joelhos saudáveis.'],
['polich','Polichinelo','cardio','corpo',1,'Abre e fecha braços e pernas com salto. Sem saltos: passo lateral com braços acima da cabeça.','Aterra suavemente.'],
['bicicleta','Abdominal bicicleta','core','corpo',0,'Deitado, cotovelo ao joelho oposto, devagar e controlado.','Não puxes o pescoço.'],
['birddog','Bird dog','core','corpo',0,'Em quatro apoios, estende braço e perna opostos e volta.','Anca estável, sem rodar.'],
['pike','Flexão pike','ombros','corpo',0,'Anca no ar em V invertido, dobra os cotovelos e leva a cabeça ao chão.','Controla a descida.'],
['pneupush','Empurrar o pneu','corpo','pneu',0,'Pneu encostado a uma parede: mãos no pneu, corpo inclinado, empurra com as pernas.','Superfície plana; pneu estável.'],
['pneuflip','Virar o pneu','corpo','pneu',0,'Agacha, mãos por baixo da banda, sobe com as pernas e empurra para virar.','Usa um pneu leve; não curves a lombar.'],
['pneuflex','Flexão com mãos no pneu','peito','pneu',0,'Mãos no pneu apoiado no chão; desce e empurra.','O pneu não pode rolar.'],
['pneustep','Subir ao pneu (step-up)','pernas','pneu',0,'Sobe para cima de um pneu estável, estende a perna e baixa com controlo.','Só numa pilha estável.'],
['mremada','Remada com mochila','costas','mochila',0,'Inclina a anca, costas direitas, puxa a mochila ao abdómen.','Costas neutras.'],
['magach','Agachamento com mochila','pernas','mochila',0,'Segura a mochila ao peito e agacha com o tronco erguido.','Começa leve.'],
['mterra','Levantamento terra com mochila','costas','mochila',0,'Anca para trás, costas direitas, desce a mochila pelas pernas e sobe.','Nunca curves a lombar.'],
['mpress','Press de ombros com mochila','ombros','mochila',0,'Mochila ao nível dos ombros, empurra para cima e desce devagar.','Abdómen contraído.']
].map(a=>({id:a[0],nome:a[1],grupo:a[2],equip:a[3],saltos:a[4],desc:a[5],seg:a[6]}));
const allEx=()=>EX.concat(S.custom||[]),exById=id=>allEx().find(e=>e.id===id)||{nome:'?',desc:''};
let P=null,openEx=null,VID={},gc={dias:5,min:40,pneu:true,mochila:true,sem:true},fil='';
const FOCO=[['pernas','core','cardio'],['peito','costas','core'],['corpo','cardio','pernas'],['costas','ombros','braços'],['corpo','pernas','cardio'],['peito','pernas','core']];
function gerar(c){const pool=allEx().filter(e=>(e.equip==='corpo'||c[e.equip])&&!(c.sem&&e.saltos)&&!((S.pref||{}).exc||[]).includes(e.id)),R=c.min>=35?4:3,n=Math.max(4,Math.min(8,Math.floor((c.min-6)/R))),used={},dias=[];
for(let d=0;d<c.dias;d++){const f0=FOCO[d%FOCO.length],pr=(S.pref||{}).prio,f=pr&&!f0.includes(pr)?[f0[0],f0[1],pr]:f0,ids=[];for(let t=0;ids.length<n&&t<60;t++){const g=f[ids.length%f.length],low=(a,b)=>(used[a.id]||0)-(used[b.id]||0)||Math.random()-.5;
const e=pool.filter(x=>x.grupo===g&&!ids.includes(x.id)).sort(low)[0]||pool.filter(x=>!ids.includes(x.id)).sort(low)[0];if(!e)break;ids.push(e.id);used[e.id]=(used[e.id]||0)+1}
dias.push({nome:'Treino '+(d+1),ids,rounds:R,trab:40,desc:20,min:ids.length*R+6})}
return{criado:today(),cfg:c,dias,prox:0}}
const nextDay=()=>S.plan&&S.plan.dias[S.plan.prox];
function cardTreino(){const d=nextDay();return`<div class="card"><h2>Treino de hoje</h2>${S.log&&S.log[today()]?'<p class="mut">Feito hoje ✓ Bom trabalho.</p>':''}${d?`<p><b>${d.nome}</b> · ≈ ${d.min} min</p><button class="p" data-a="go" data-v="treino">Abrir treino</button>`:`<p class="mut">Ainda não tens um plano.</p><button class="p" data-a="go" data-v="treino">Criar plano</button>`}</div>`}
function startDia(i){const d=S.plan.dias[i],seq=[];for(let r=1;r<=d.rounds;r++)d.ids.forEach((id,k)=>{seq.push({t:'w',id,dur:d.trab,r});if(!(r===d.rounds&&k===d.ids.length-1))seq.push({t:'r',id:d.ids[(k+1)%d.ids.length],dur:d.desc,r})});
P={i,seq,k:0,paused:false,t0:Date.now(),end:Date.now()+seq[0].dur*1000,left:seq[0].dur};P.iv=setInterval(tick,500);render()}
function adv(){P.k++;if(P.k>=P.seq.length)return fim();P.end=Date.now()+P.seq[P.k].dur*1000;P.left=P.seq[P.k].dur;navigator.vibrate&&navigator.vibrate(200)}
function tick(){if(!P||P.paused)return;const l=Math.ceil((P.end-Date.now())/1000);if(l<=0)adv();else if(l!==P.left)P.left=l;else return;render()}
async function fim(){clearInterval(P.iv);const m=Math.max(1,Math.round((Date.now()-P.t0)/6e4));S.log=S.log||{};S.log[today()]={dia:P.i,min:m};S.train[today()]=true;S.plan.prox=(P.i+1)%S.plan.dias.length;await save('log');await save('train');await save('plan');P=null;window.FBX=1;render();alert('Treino concluído. Boa!')}
function vPlayer(){const s=P.seq[P.k],e=exById(s.id),w=s.t==='w';return`<div class="card"><p class="mut">${w?'Trabalho':'Descanso · a seguir'} · volta ${s.r}/${S.plan.dias[P.i].rounds}</p><h1>${esc(e.nome)}</h1><div class="tm ${w?'':'rest'}">${P.left}</div><p class="mut">${esc(e.desc)}</p><div class="bar"><i style="width:${(P.k+1)/P.seq.length*100}%"></i></div><div class="row"><button class="p" data-a="pause">${P.paused?'Retomar':'Pausar'}</button><button data-a="skip">Saltar</button><button class="d" data-a="stop">Terminar</button></div></div>`}
function vTreino(){if(P)return vPlayer();if(window.FBX)return vFB();const p=S.plan,ck=(id,l,v)=>`<label class="ck"><input type="checkbox" id="${id}" ${v?'checked':''}>${l}</label>`;
const form=`<div class="f2"><div><label>Dias por semana</label><select id="g-dias">${[3,4,5,6].map(n=>`<option ${n==gc.dias?'selected':''}>${n}</option>`)}</select></div><div><label>Minutos por treino</label><select id="g-min">${[20,30,40,50].map(n=>`<option ${n==gc.min?'selected':''}>${n}</option>`)}</select></div></div>
<label>Equipamento</label>${ck('g-pneu','Pneus',gc.pneu)}${ck('g-mochila','Mochila com peso',gc.mochila)}${ck('g-sem','Sem saltos (poupa os joelhos)',gc.sem)}<br><button class="p" data-a="gen">Gerar plano</button>`;
if(!p)return`<h1>Treinos</h1><div class="card"><h2>Criar plano semanal</h2><p class="mut">Circuitos de 40 s de trabalho e 20 s de descanso, só com o que tens em casa.</p>${form}</div>`;
return`<h1>Treinos</h1><div class="card warn"><p class="mut">Antes: 3–5 min de aquecimento (rodar ombros e anca, agachamentos lentos). Depois: alongamentos e respiração calma.</p></div>
${p.dias.map((d,i)=>`<div class="card"><h2>${d.nome}${i===p.prox?' · próximo':''}</h2><p class="mut">${d.rounds} voltas · ≈ ${d.min} min</p><p>${d.ids.map(id=>`<span class="chip">${esc(exById(id).nome)}</span>`).join('')}</p>${i===p.prox?`<button class="p" data-a="play" data-v="${i}">Iniciar treino</button>`:`<button class="sm" data-a="play" data-v="${i}">Fazer este</button>`}</div>`).join('')}
<div class="card"><h2>Novo plano</h2>${form}</div>`}
function vBib(){const L=allEx().filter(e=>!fil||e.grupo===fil);
return`<h1>Biblioteca</h1><div class="row" style="margin:8px 0"><button class="sm ${fil?'':'p'}" data-a="fil" data-v="">Todos</button>${Object.keys(GN).map(g=>`<button class="sm ${fil===g?'p':''}" data-a="fil" data-v="${g}">${GN[g]}</button>`).join('')}</div>
<div class="card">${L.map(e=>`<div class="li" style="display:block"><div data-a="open" data-v="${e.id}" style="cursor:pointer"><b>${esc(e.nome)}</b><br><span class="chip">${GN[e.grupo]||e.grupo}</span><span class="chip">${EQN[e.equip]||'Peso corporal'}</span>${e.custom?'<span class="chip">Meu</span>':''}</div>
${openEx===e.id?`<p>${esc(e.desc||'—')}</p>${extraInfo(e)}${e.seg?`<p class="mut">Segurança: ${esc(e.seg)}</p>`:''}<p><a href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.nome+' exercício técnica')}" target="_blank" rel="noopener" style="color:var(--ac)">Ver demonstração no YouTube</a></p>${VID[e.id]?`<video src="${VID[e.id]}" controls playsinline></video>`:''}${e.custom?`<br>${e.vid?`<button class="sm p" data-a="analisa" data-v="${e.id}">Analisar com IA</button> `:''}${ANA[e.id]?anaHtml(e.id):''}<button class="sm d" data-a="delEx" data-v="${e.id}">Eliminar</button>`:''}`:''}</div>`).join('')}</div>
<div class="card"><h2>Adicionar o meu exercício</h2>${field('b-nome','Nome','','text')}<label>Grupo</label><select id="b-grupo">${Object.keys(GN).map(g=>`<option value="${g}">${GN[g]}</option>`).join('')}</select>${field('b-desc','Descrição / notas','','text')}<label>Vídeo (opcional)</label><input id="b-vid" type="file" accept="video/*"><br><button class="p" data-a="addEx">Guardar exercício</button>
<p class="mut">O vídeo fica só neste telemóvel. Para o guardar, usa a exportação de fotos e vídeos nas Configurações.</p></div>`}
window.EXTRA={treino:vTreino,bib:vBib};
Object.assign(A,{
gen:()=>{gc={dias:+v('g-dias'),min:+v('g-min'),pneu:$('#g-pneu').checked,mochila:$('#g-mochila').checked,sem:$('#g-sem').checked};if(S.plan&&!confirm('Substituir o plano actual?'))return;S.plan=gerar(gc);save('plan');render()},
play:e=>{startDia(+e.dataset.v)},
pause:()=>{if(P.paused){P.end=Date.now()+P.left*1000;P.paused=false}else P.paused=true;render()},
skip:()=>{adv();if(P)render()},
stop:()=>{if(!confirm('Terminar o treino sem o registar?'))return;clearInterval(P.iv);P=null;render()},
fil:e=>{fil=e.dataset.v;render()},
open:async e=>{const id=e.dataset.v;openEx=openEx===id?null:id;const x=exById(id);if(openEx&&x.vid&&!VID[id]){const b=await DB.get('vid:'+id);if(b)VID[id]=URL.createObjectURL(b)}render()},
addEx:async()=>{const nome=v('b-nome');if(!nome)return alert('Escreve o nome do exercício.');const f=$('#b-vid').files[0],id='c'+Date.now();
if(f)await DB.set('vid:'+id,f);S.custom=S.custom||[];S.custom.push({id,nome,grupo:v('b-grupo'),equip:'corpo',saltos:0,desc:v('b-desc'),custom:1,vid:!!f});await save('custom');render()},
delEx:async e=>{if(!confirm('Eliminar este exercício?'))return;const id=e.dataset.v;S.custom=S.custom.filter(x=>x.id!==id);await save('custom');await DB.del('vid:'+id);delete VID[id];render()}});
