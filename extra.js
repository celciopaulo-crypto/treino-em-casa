'use strict';
/* Progressão com aprovação, resumo semanal e cópia de fotos/vídeos (etapa 7) */
const opt=(a,s)=>a.map(x=>`<option ${x==s?'selected':''}>${x}</option>`).join('');
const tmin=d=>Math.round(d.ids.length*d.rounds*(d.trab+d.desc)/60)+6;
function vFB(){return`<div class="card"><h2>Como correu o treino?</h2><label>Esforço (1 leve · 10 máximo)</label><select id="fb-e">${opt([1,2,3,4,5,6,7,8,9,10],7)}</select><label>Recuperação</label><select id="fb-r">${opt(['boa','média','má'],'boa')}</select><label>Dores ou desconforto</label><select id="fb-d">${opt(['nenhuma','leve','forte'],'nenhuma')}</select><br><button class="p" data-a="saveFB">Guardar</button></div>`}
function propor(){const L=Object.values(S.log||{}).filter(x=>x.esf),n=L.length;if(n-(S.fbMark||0)<2||S.prop)return;const u=L.slice(-3),m=u.reduce((t,x)=>t+x.esf,0)/u.length,dor=u.some(x=>x.dor==='forte'),ma=u.filter(x=>x.rec==='má').length;
if(dor||m>=9||ma>=2)S.prop={t:'baixar',txt:dor?'Registaste dor forte. Proponho treinos mais leves (menos uma volta ou mais descanso). Evita os exercícios que doem; se persistir, procura um profissional de saúde.':'O esforço está muito alto ou a recuperação fraca. Proponho aliviar: menos uma volta (ou mais descanso).'};
else if(m<=6.5&&ma===0)S.prop={t:'subir',txt:'Os treinos estão a sair com esforço baixo e boa recuperação. Proponho subir: mais uma volta (ou mais 5 s de trabalho).'}}
function cardProp(){return S.prop?`<div class="card warn"><h2>Proposta de ajuste</h2><p>${esc(S.prop.txt)}</p><div class="row"><button class="p" data-a="okProp">Aceitar</button><button data-a="noProp">Agora não</button></div></div>`:''}
function cardSemana(){const n=Object.keys(S.log||{}).filter(d=>Date.now()-new Date(d)<7*864e5).length,alvo=S.plan?S.plan.cfg.dias:5,ws=S.weights.filter(x=>x.w),now=Date.now(),a=ws.filter(x=>now-new Date(x.d)<7*864e5),b=ws.filter(x=>{const t=now-new Date(x.d);return t>=7*864e5&&t<14*864e5}),m=x=>x.reduce((t,y)=>t+y.w,0)/x.length,dw=a.length&&b.length?m(a)-m(b):null;
return`<div class="card"><h2>Esta semana</h2><p>Treinos: ${n} de ${alvo} · pendentes: ${Math.max(0,alvo-n)}</p><div class="bar"><i style="width:${Math.min(100,n/alvo*100)}%"></i></div>${dw!=null?`<p>Peso (média de 7 dias): ${dw>0?'+':''}${r1(dw)} kg face à semana anterior. Meta: −${r1(calc().real)} kg.</p>${dw>-.1?'<p class="mut">Possível estagnação. Dá mais uma semana, confere porções, sono e água, ou pede ao assistente para analisar.</p>':''}`:'<p class="mut">Precisas de pesagens em duas semanas para ver a variação.</p>'}</div>`}
const hoje2=window.EXTRA.hoje,tr2=window.EXTRA.treino,cfg2=window.EXTRA.cfg;
window.EXTRA.hoje=()=>hoje2().replace('<div class="grid">',cardSemana()+'<div class="grid">');
window.EXTRA.treino=()=>tr2().replace('<h1>Treinos</h1>','<h1>Treinos</h1>'+cardProp());
window.EXTRA.cfg=()=>cfg2()+`<div class="card"><h2>Fotos e vídeos</h2><div class="row"><button class="p" data-a="expM">Exportar</button><button data-a="impM">Importar</button></div><input id="impm" type="file" accept="application/json" hidden><p class="mut">Ficheiro à parte (pode ser grande). Guarda-o no iCloud ou no computador. Dados, fotos e vídeos têm cópias separadas.</p></div>`;
const rd=b=>new Promise(ok=>{const r=new FileReader();r.onload=()=>ok(r.result);r.readAsDataURL(b)});
Object.assign(A,{
saveFB:async()=>{const d=today();Object.assign(S.log[d],{esf:+v('fb-e'),rec:v('fb-r'),dor:v('fb-d')});window.FBX=0;await save('log');propor();await save('prop');if(S.log[d].dor==='forte')alert('Dor forte: pára os exercícios que a provocam e procura um profissional de saúde se persistir.');render()},
okProp:async()=>{const s=S.prop.t==='subir';S.plan.dias.forEach(d=>{if(s){if(d.rounds<5)d.rounds++;else d.trab=Math.min(50,d.trab+5)}else{if(d.rounds>2)d.rounds--;else d.desc=Math.min(40,d.desc+10)}d.min=tmin(d)});S.fbMark=Object.values(S.log).filter(x=>x.esf).length;S.prop=null;await save('plan');await save('fbMark');await save('prop');render()},
noProp:async()=>{S.fbMark=Object.values(S.log).filter(x=>x.esf).length;S.prop=null;await save('fbMark');await save('prop');render()},
expM:async()=>{const ks=(await DB.keys()).filter(k=>/^(vid|foto):/.test(k));if(!ks.length)return alert('Não há fotos nem vídeos guardados.');const parts=['{"app":"gz-media","items":['];let i=0;
for(const k of ks){parts.push((i++?',':'')+JSON.stringify({k,u:await rd(await DB.get(k))}))}parts.push(']}');
const blob=new Blob(parts,{type:'application/json'}),name='gz-midia-'+today()+'.json',f=new File([blob],name,{type:'application/json'});
try{if(navigator.canShare?.({files:[f]}))await navigator.share({files:[f]});else{const u=URL.createObjectURL(blob),l=document.createElement('a');l.href=u;l.download=name;l.click();setTimeout(()=>URL.revokeObjectURL(u),9000)}}catch(e){}},
impM:()=>$('#impm').click()});
document.addEventListener('change',async e=>{if(e.target.id!=='impm'||!e.target.files[0])return;try{const j=JSON.parse(await e.target.files[0].text());if(j.app!=='gz-media')throw 0;
for(const it of j.items)await DB.set(it.k,await (await fetch(it.u)).blob());alert(j.items.length+' ficheiros restaurados.');location.reload()}catch(x){alert('Ficheiro de fotos/vídeos inválido.')}});
