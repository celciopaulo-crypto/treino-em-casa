'use strict';
/* Assistente Gemini + análise de vídeo (etapa 5). Só envia dados com a tua confirmação. */
const SYS='És o treinador pessoal e nutricionista educativo da app GORDURA ZERO. Responde em português de Portugal, de forma curta e prática, com treino em casa (peso corporal, pneus, mochila) e alimentos acessíveis em Angola. Não substituis profissionais de saúde. Nunca recomendes medicamentos, laxantes, desidratação ou dietas extremas. Se não tiveres certeza ou faltarem dados, di-lo e pergunta. Não inventes dados do utilizador. Propões; nunca assumes que algo foi alterado.';
let H=[],ANA={},busy=false,incl=false;
async function gem(contents,json){const c=S.ia||{};if(!c.key)throw new Error('Sem chave Gemini. Define-a em Configurações (ou usa só o modo local).');
const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${c.model||'gemini-3.8-flash'}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':c.key},body:JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents,generationConfig:json?{responseMimeType:'application/json'}:{}})});
if(!r.ok){const t=await r.text();throw new Error(r.status===429?'Limite gratuito atingido. Tenta mais tarde.':r.status===404?'Modelo não encontrado. Confirma o nome do modelo em Configurações.':'Erro '+r.status+': '+t.slice(0,140))}
const j=await r.json();return(j.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join('')}
function ctx(){const p=S.profile,c=calc(),w=S.weights.filter(x=>x.w).slice(-7).map(x=>x.d.slice(5)+': '+x.w+' kg').join('; '),n=Object.keys(S.log||{}).filter(d=>Date.now()-new Date(d)<14*864e5).length;
return`[Dados do utilizador] ${p.idade} anos, ${p.sexo==='m'?'masculino':'feminino'}, ${p.altura} cm, peso actual ${lastW()} kg (inicial ${p.pesoInicial}), meta ${p.meta||'sem meta'} kg. Metas diárias estimadas: ${c.kcal} kcal, ${c.prot} g proteína. Últimos pesos: ${w||'—'}. Treinos nos últimos 14 dias: ${n}. Limitações: ${p.saude||'nenhuma indicada'}.`}
const md=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\n/g,'<br>');
function vIA(){const k=!!(S.ia&&S.ia.key);
return`<h1>Assistente</h1><p class="mut">A IA só sugere. Nada muda sem a tua aprovação.</p>${k?'':`<div class="card warn"><p>Modo local: sem chave Gemini, a IA está desligada. Define-a em Configurações.</p></div>`}
${H.map(m=>`<div class="msg ${m.role==='user'?'u':''}">${md(m.parts[0].text.replace(/^\[Dados do utilizador\].*?\n\n/s,''))}</div>`).join('')}${busy?'<p class="mut">A pensar…</p>':''}
<div class="card"><textarea id="q" placeholder="Ex.: Cria um treino de 40 min só com pneus e mochila."></textarea>
<div class="row" style="margin:8px 0">${['Cria um plano alimentar para 7 dias','Perdi só 300 g esta semana. Analisa.','Hoje não treinei. Reorganiza a semana.'].map(t=>`<button class="sm" data-a="qp" data-v="${esc(t)}">${esc(t)}</button>`).join('')}</div>
<label class="ck"><input type="checkbox" id="inc" ${incl?'checked':''}>Incluir os meus dados físicos (peso, metas, treinos)</label>
<p class="mut">${incl?'Será enviado um resumo dos teus dados à Google (vais ver o texto antes).':'Só a tua pergunta é enviada.'}</p><button class="p" data-a="send" ${k?'':'disabled'}>Enviar</button> <button class="sm" data-a="clr">Limpar conversa</button></div>`}
function vIAcfg(){const c=S.ia||{};return`<div class="card"><h2>Assistente Gemini</h2>${field('ia-k','Chave API (fica só neste telemóvel)',c.key||'','password')}${field('ia-m','Modelo',c.model||'gemini-3.8-flash','text')}<br><div class="row"><button class="p" data-a="saveIA">Guardar</button>${c.key?'<button class="d" data-a="rmIA">Remover chave</button>':''}</div>
<p class="mut">Serviço externo gratuito (Google). No nível gratuito, a Google pode usar o que envias para melhorar os seus produtos. Cada envio pede a tua confirmação. A chave não entra nas cópias de segurança. Sem chave, a app funciona 100% local.</p></div>`}
window.EXTRA.ia=vIA;window.EXTRA.cfg=()=>vCfg()+vIAcfg();
async function frames(b,n=6){const u=URL.createObjectURL(b),v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='auto';v.src=u;
await new Promise((ok,no)=>{v.onloadedmetadata=ok;v.onerror=()=>no(new Error('Não consegui abrir o vídeo.'));setTimeout(()=>no(new Error('O vídeo demorou demasiado a abrir.')),15000)});
const d=v.duration||1,cv=document.createElement('canvas'),sc=Math.min(1,512/(v.videoWidth||512));cv.width=(v.videoWidth||512)*sc;cv.height=(v.videoHeight||512)*sc;const cx=cv.getContext('2d'),o=[];
for(let i=0;i<n;i++){v.currentTime=d*(i+.5)/n;await new Promise(ok=>{v.onseeked=ok;setTimeout(ok,3000)});cx.drawImage(v,0,0,cv.width,cv.height);o.push(cv.toDataURL('image/jpeg',.7).split(',')[1])}
URL.revokeObjectURL(u);return o}
function anaHtml(id){const a=ANA[id];if(a.wait)return'<p class="mut">A analisar…</p>';if(a.err)return`<p class="mut">${esc(a.err)}</p>`;
if(!a.identificado)return`<div class="card"><p>Não consegui identificar o exercício com segurança.</p><p class="mut">${esc(a.pergunta||'Descreve o exercício nas notas e tenta de novo.')}</p></div>`;
return`<div class="card"><p class="mut">Sugestão da IA (confirma antes de usar). Confiança: ${esc(a.confianca||'?')}</p><p><b>${esc(a.nome)}</b><br>Músculos: ${esc(a.musculos)}<br>Equipamento: ${esc(a.equipamento)}<br>Dificuldade: ${esc(a.dificuldade)}<br>Sugestão: ${esc(a.series)} séries × ${esc(a.repeticoes)}, descanso ${esc(a.descanso_s)} s</p>${a.riscos?`<p class="mut">Atenção: ${esc(a.riscos)}</p>`:''}<button class="sm p" data-a="applyAna" data-v="${id}">Aplicar às notas</button></div>`}
Object.assign(A,{
qp:e=>{$('#q').value=e.dataset.v},
send:async()=>{const q=v('q');if(!q||busy)return;incl=$('#inc').checked;let t=q;
if(incl){const c=ctx();if(!confirm('Vais enviar isto à Google (Gemini):\n\n'+c+'\n\nContinuar?'))return;t=c+'\n\n'+q}
H.push({role:'user',parts:[{text:t}]});busy=true;render();
try{H.push({role:'model',parts:[{text:await gem(H.slice(-9))}]})}catch(er){H.pop();alert(er.message)}busy=false;render()},
clr:()=>{H=[];render()},
saveIA:async()=>{S.ia={key:v('ia-k'),model:v('ia-m')||'gemini-3.8-flash'};await save('ia');render()},
rmIA:async()=>{S.ia=null;await save('ia');render()},
analisa:async e=>{const id=e.dataset.v,x=exById(id);if(!(S.ia&&S.ia.key))return alert('Define a chave Gemini em Configurações.');
if(!confirm('Vais enviar 6 imagens extraídas deste vídeo à Google (Gemini, nível gratuito). O vídeo completo não sai do telemóvel. Continuar?'))return;
ANA[id]={wait:1};render();try{const b=await DB.get('vid:'+id),fr=await frames(b);
const pr=`Estas ${fr.length} imagens são fotogramas, por ordem, de um vídeo de um exercício feito em casa. Responde SÓ em JSON com as chaves: identificado (boolean; false se não tiveres segurança), nome, grupo (um de: pernas, core, peito, costas, ombros, corpo, cardio), musculos, equipamento, dificuldade (fácil, média ou difícil), series (número), repeticoes (texto), descanso_s (número), riscos (só o que se vê; vazio se nada), confianca (baixa, média ou alta), pergunta (o que precisas que o utilizador confirme, se identificado for false). Nunca finjas identificar um movimento que não vês com clareza. Notas do utilizador: ${x.desc||'nenhuma'}.`;
const t=await gem([{role:'user',parts:[{text:pr},...fr.map(d=>({inlineData:{mimeType:'image/jpeg',data:d}}))]}],true);
ANA[id]=JSON.parse(t.replace(/```json|```/g,'').trim())}catch(er){ANA[id]={err:'Falhou: '+er.message}}render()},
applyAna:async e=>{const id=e.dataset.v,a=ANA[id],x=S.custom.find(c=>c.id===id);if(GN[a.grupo])x.grupo=a.grupo;
x.desc=(x.desc?x.desc+' · ':'')+`${a.musculos}. ${a.series}×${a.repeticoes}, descanso ${a.descanso_s} s. Dificuldade ${a.dificuldade}.`;x.seg=a.riscos||x.seg;await save('custom');delete ANA[id];render()}});
document.addEventListener('change',e=>{if(e.target.id==='inc'){incl=e.target.checked;const q=v('q');render();$('#q').value=q}});
