var VER="skyplan-v3",RT="skyplan-rt-v3",SHELL=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(VER).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==VER&&k!==RT}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
function trim(c,n){c.keys().then(function(ks){if(ks.length>n)c.delete(ks[0]).then(function(){trim(c,n)})})}
function put(name,req,res){if(res&&(res.ok||res.type==="opaque")){var cp=res.clone();caches.open(name).then(function(c){c.put(req,cp).then(function(){if(name===RT)trim(c,500)}).catch(function(){})})}return res}
function fallback(req){return caches.match(req,{ignoreSearch:true}).then(function(m){return m||(req.mode==="navigate"?caches.match("index.html"):null)||caches.match("./")})}
function networkFirst(req,name){return fetch(req).then(function(r){return put(name,req,r)}).catch(function(){return fallback(req).then(function(m){return m||Response.error()})})}
function swr(req){return caches.match(req).then(function(m){var f=fetch(req).then(function(r){return put(RT,req,r)}).catch(function(){return m});return m||f})}
function corsImage(req){return fetch(req).then(function(r){return put(RT,req,r)}).catch(function(){return caches.match(req).then(function(m){return m&&m.type!=="opaque"?m:Response.error()})})}
self.addEventListener("fetch",function(e){var r=e.request;if(r.method!=="GET")return;var u=new URL(r.url);
if(r.mode==="navigate"||u.origin===location.origin){e.respondWith(networkFirst(r,VER));return}
if(r.mode==="cors"&&r.destination==="image"){e.respondWith(corsImage(r));return}
if(u.pathname.indexOf("everything.json")>=0){e.respondWith(networkFirst(r,RT));return}
e.respondWith(swr(r))});
