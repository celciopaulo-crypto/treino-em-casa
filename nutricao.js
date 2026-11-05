'use strict';
/* Alimentação (etapa 4) — valores aproximados por 100 g, já cozinhados; são estimativas */
const FD=[['ovo','Ovo cozido',155,13,1.1,11,'1 ovo ≈ 50 g'],['frango','Peito de frango cozido',165,31,0,3.6,'1 palma ≈ 100 g'],['peixe','Peixe grelhado (carapau, corvina)',140,24,0,5,'1 palma ≈ 100 g'],['carne','Carne de vaca magra cozida',200,30,0,9,'1 palma ≈ 100 g'],
['feijao','Feijão cozido',127,8.7,22.8,.5,'1 concha ≈ 150 g'],['arroz','Arroz cozido',130,2.7,28,.3,'1 punho ≈ 150 g'],['batata','Batata-doce cozida',90,2,21,.1,'1 média ≈ 150 g'],['mandioca','Mandioca cozida',160,1.4,38,.3,'1 punho ≈ 150 g'],
['bananap','Banana-pão cozida',116,.8,31,.2,'1 fatia grande ≈ 100 g'],['funge','Funge',140,1,33,.3,'1 punho ≈ 150 g (varia)'],['aveia','Aveia (seca)',380,13,66,7,'3 colheres de sopa ≈ 30 g'],['iogurte','Iogurte natural',61,3.5,4.7,3.3,'1 pote ≈ 125 g'],
['banana','Banana',89,1.1,23,.3,'1 média ≈ 100 g'],['laranja','Laranja',47,.9,12,.1,'1 média ≈ 150 g'],['papaia','Papaia',43,.5,11,.3,'1 fatia ≈ 150 g'],['abacate','Abacate',160,2,9,15,'¼ ≈ 50 g'],
['folhas','Couve/folhas cozidas',30,2,5,.5,'1 mão cheia'],['tomate','Tomate e cebola (salada)',20,1,4,.2,'1 tigela'],['oleo','Óleo / azeite',884,0,0,100,'1 colher de sopa ≈ 10 g'],['pao','Pão',265,9,49,3.2,'1 fatia ≈ 30 g'],['amendoim','Ginguba (amendoim)',567,26,16,49,'1 mão em concha ≈ 30 g']
].map(a=>({id:a[0],nome:a[1],k:a[2],p:a[3],c:a[4],f:a[5],med:a[6]}));
const fd=id=>FD.find(x=>x.id===id),REF=['Pequeno-almoço','Almoço','Lanche','Jantar'],SH=[.25,.35,.1,.3];
const TPL=[[[['aveia',.4],['iogurte',.3],['banana',.3]],[['ovo',.5],['pao',.3],['papaia',.2]]],
[[['peixe',.32],['arroz',.28],['feijao',.3],['folhas',.04],['oleo',.06]],[['frango',.32],['batata',.3],['feijao',.28],['folhas',.04],['oleo',.06]],[['carne',.3],['mandioca',.32],['feijao',.28],['tomate',.04],['oleo',.06]]],
[[['banana',.5],['amendoim',.5]],[['iogurte',.6],['papaia',.4]]],
[[['peixe',.35],['batata',.32],['feijao',.24],['folhas',.04],['oleo',.05]],[['ovo',.35],['arroz',.3],['feijao',.26],['tomate',.04],['oleo',.05]],[['frango',.35],['funge',.3],['feijao',.26],['folhas',.04],['oleo',.05]]]];
const DICAS=['Prato: metade vegetais, um quarto proteína (peixe, frango, ovos, feijão), um quarto hidratos (arroz, batata-doce, mandioca, funge).','Mão como medida: palma = proteína, punho = hidratos cozidos, polegar = óleo, mão em concha = ginguba.','Hidratos à noite não estão proibidos. Conta a quantidade total do dia e o equilíbrio do prato.','Frequentes: peixe, ovos, feijão, vegetais, fruta. Com moderação: arroz, funge, mandioca, pão. Limitar: fritos, refrigerantes, sumos, álcool e muito óleo.','Fome: proteína e feijão em cada refeição, água ao longo do dia e 7–9 h de sono ajudam a controlá-la.','Fora de casa: pede grelhado ou cozido, molhos à parte e metade da porção de arroz ou funge.','Estagnação: espera 2–3 semanas de média de peso antes de mexer nas calorias. Não cortes abaixo do mínimo sem aprovação.'];
const kc=(id,g)=>fd(id).k*g/100,tot=a=>a.reduce((t,x)=>{const f=fd(x.id),m=x.g/100;t.k+=f.k*m;t.p+=f.p*m;t.c+=f.c*m;t.f+=f.f*m;return t},{k:0,p:0,c:0,f:0});
let dicasOn=false;
function gerarDia(){const c=calc(),n=Math.floor(Math.random()*3);return{d:today(),refs:TPL.map((alts,i)=>({nome:REF[i],itens:alts[n%alts.length].map(([id,s])=>({id,g:Math.max(5,Math.round(c.kcal*SH[i]*s*100/fd(id).k/5)*5)}))}))}}
const bar=(l,x,m,u)=>`<div class="li"><span>${l}</span><span>${Math.round(x)} / ${m}${u}</span></div><div class="bar"><i style="width:${Math.min(100,x/m*100)}%;${x>m*1.1?'background:var(--or)':''}"></i></div>`;
function vDieta(){const c=calc(),d=today(),di=(S.diario||{})[d]||[],t=tot(di),pl=S.dieta&&S.dieta.d===d?S.dieta:null;
return`<div class="card"><h2>Hoje comi</h2>${bar('Calorias',t.k,c.kcal,' kcal')}${bar('Proteína',t.p,c.prot,' g')}${bar('Hidratos',t.c,c.carb,' g')}${bar('Gordura',t.f,c.fat,' g')}
${di.map((x,i)=>`<div class="li"><span>${esc(REF[x.m])} · ${esc(fd(x.id).nome)} ${x.g} g · ${Math.round(kc(x.id,x.g))} kcal</span><button class="sm d" data-a="delF" data-v="${i}">×</button></div>`).join('')||'<p class="mut">Ainda sem registos hoje.</p>'}
<label>Registar alimento</label><div class="f2"><select id="n-m">${REF.map((r,i)=>`<option value="${i}">${r}</option>`)}</select><input id="n-g" type="number" inputmode="decimal" placeholder="gramas"></div><br>
<select id="n-f">${FD.map(f=>`<option value="${f.id}">${f.nome} (${f.med})</option>`)}</select><br><br><button class="p" data-a="addF">Adicionar</button></div>
<div class="card"><h2>Plano de hoje</h2>${pl?pl.refs.map((r,i)=>`<div class="li" style="display:block"><b>${r.nome}</b> <span class="mut">≈ ${Math.round(tot(r.itens).k)} kcal · ${Math.round(tot(r.itens).p)} g proteína</span><br>${r.itens.map(x=>`<span class="chip">${esc(fd(x.id).nome)} ${x.g} g</span>`).join('')}<br><button class="sm" style="margin-top:6px" data-a="ate" data-v="${i}">Comi isto</button></div>`).join(''):'<p class="mut">Gera um plano com os teus alvos e alimentos acessíveis em Angola.</p>'}
<br><button class="${pl?'':'p'}" data-a="genD">${pl?'Outra sugestão':'Gerar plano de hoje'}</button><p class="mut">Quantidades aproximadas, cozinhadas. Pesa quando puderes. Troca alimentos do mesmo tipo (peixe ↔ frango, arroz ↔ batata-doce).</p></div>
<div class="card"><h2>Orientação</h2>${dicasOn?DICAS.map(x=>`<p>${esc(x)}</p>`).join(''):''}<button class="sm" data-a="dicas">${dicasOn?'Fechar':'Ver dicas de alimentação'}</button></div>`}
window.EXTRA.nutri=()=>vNutri()+vDieta();
Object.assign(A,{
genD:async()=>{S.dieta=gerarDia();await save('dieta');render()},
ate:async e=>{const r=S.dieta.refs[+e.dataset.v];S.diario=S.diario||{};const d=today();S.diario[d]=(S.diario[d]||[]).concat(r.itens.map(x=>({m:+e.dataset.v,id:x.id,g:x.g})));await save('diario');render()},
addF:async()=>{const g=num('n-g');if(!g)return alert('Indica as gramas.');S.diario=S.diario||{};const d=today();(S.diario[d]=S.diario[d]||[]).push({m:+v('n-m'),id:v('n-f'),g});await save('diario');render()},
delF:async e=>{S.diario[today()].splice(+e.dataset.v,1);await save('diario');render()},
dicas:()=>{dicasOn=!dicasOn;render()}});
