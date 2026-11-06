const CACHE='gz-v10',SHELL=['index.html','app.css','app.js','manifest.json','treinos.js','nutricao.js','ia.js','lembretes.js','extra.js','mais.js','ferr.js','fonts/sora-latin-700-normal.woff2','fonts/inter-latin-400-normal.woff2','fonts/inter-latin-600-normal.woff2','logo.png','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Rede primeiro (apanha sempre a versão nova); cache quando offline.
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||(new URL(r.url).origin!==location.origin&&!/fonts\.(googleapis|gstatic)\.com/.test(r.url)))return;
e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match('index.html'))))});
