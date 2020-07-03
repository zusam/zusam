parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"vRk2":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.get=o,exports.set=n,exports.del=s,exports.clear=i,exports.keys=u,exports.Store=void 0;class e{constructor(e="keyval-store",t="keyval"){this.storeName=t,this._dbp=new Promise((r,o)=>{const n=indexedDB.open(e,1);n.onerror=(()=>o(n.error)),n.onsuccess=(()=>r(n.result)),n.onupgradeneeded=(()=>{n.result.createObjectStore(t)})})}_withIDBStore(e,t){return this._dbp.then(r=>new Promise((o,n)=>{const s=r.transaction(this.storeName,e);s.oncomplete=(()=>o()),s.onabort=s.onerror=(()=>n(s.error)),t(s.objectStore(this.storeName))}))}}let t;function r(){return t||(t=new e),t}function o(e,t=r()){let o;return t._withIDBStore("readonly",t=>{o=t.get(e)}).then(()=>o.result)}function n(e,t,o=r()){return o._withIDBStore("readwrite",r=>{r.put(t,e)})}function s(e,t=r()){return t._withIDBStore("readwrite",t=>{t.delete(e)})}function i(e=r()){return e._withIDBStore("readwrite",e=>{e.clear()})}function u(e=r()){const t=[];return e._withIDBStore("readonly",e=>{(e.openKeyCursor||e.openCursor).call(e).onsuccess=function(){this.result&&(t.push(this.result.key),this.result.continue())}}).then(()=>t)}exports.Store=e;
},{}],"CwoO":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;const e="4.1",s="0.3",t={ZUSAM_VERSION:"4.1",CACHE_VERSION:"0.3",CACHE:"zusam-4.1-simplecache-0.3",CACHE_STORE:"zusam-4.1"};var a=t;exports.default=a;
},{}],"vnR2":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;const e={remove:e=>document.getElementById(e).outerHTML="",add:(t,r="alert-success",d=5e3)=>{if(!t)return;let l=document.createElement("DIV");l.id=e.hash(t),l.innerHTML=t,l.classList.add("global-alert","alert",r),document.body.appendChild(l),setTimeout(()=>e.remove(l.id),d)},hash:e=>{let t=0;if(0==e.length)return t;for(let r=0;r<e.length;r++){t=(t<<5)-t+e.charCodeAt(r),t&=t}return t}};var t=e;exports.default=t;
},{}],"NUMl":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=require("idb-keyval"),t=a(require("./param.js"));function a(e){return e&&e.__esModule?e:{default:e}}const l={name:t.default.CACHE,cache_store:new e.Store(t.default.CACHE_STORE,t.default.CACHE),purgeOldCache:()=>{(0,e.keys)().then(t=>t.map(t=>(0,e.get)(t).then(a=>{a.lastUsed+2592e6<Date.now()&&(console.log(`Remove from cache: ${t.url}`),(0,e.del)(t),caches.open(l.name).then(e=>e.delete(t)))})))},removeMatching:e=>caches.open(l.name).then(t=>t.matchAll().then(a=>Promise.all(a.filter(t=>t.url.match(e)).map(e=>t.delete(e)))))};var r=l;exports.default=r;
},{"idb-keyval":"vRk2","./param.js":"CwoO"}],"EDnG":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;const e={usage:()=>{let e,t=0;for(e in localStorage)Object.prototype.hasOwnProperty.call(localStorage,e)&&(t+=2*(localStorage[e].length+e.length));return t},createStorageBox:(e,t=null)=>({data:e,createdAt:Date.now(),metadata:t}),remove:e=>localStorage.removeItem(e),set:(t,a,o=null)=>(localStorage.setItem(t,JSON.stringify(e.createStorageBox(a,o))),Promise.resolve(t)),get:e=>{let t=localStorage.getItem(e);return null!=t&&(t=JSON.parse(t),Object.prototype.hasOwnProperty.call(t,"data"))?new Promise(e=>e(t.data)):new Promise(e=>e(null))},reset:()=>localStorage.clear()&&window.dispatchEvent(new CustomEvent("resetStorage"))};var t=e;exports.default=t;
},{}],"dg0a":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=a(require("./me.js")),t=a(require("./http.js"));function a(e){return e&&e.__esModule?e:{default:e}}const n={dict:[],possibleLang:{en:"English",es:"Español",fr:"Français",sk:"Slovenský"},getDefaultLang:()=>(document.querySelector("meta[name='zusam:default-lang']")||{}).content||"en",getCurrentLang:()=>e.default.me&&e.default.me.data&&e.default.me.data.lang||n.getDefaultLang(),fetchDict:(e=n.getCurrentLang())=>!n.dict[e]&&t.default.get(`/lang/${e}.json`).then(t=>{n.dict[e]=t,window.dispatchEvent(new CustomEvent("fetchedNewDict"))}),t:(e,t={})=>{if(t.dict=t.dict||n.getCurrentLang(),t.count=t.count||0,!e||!n.dict[t.dict])return"";let a=n.dict[t.dict][e]||"";if("object"==typeof a){let e=Object.getOwnPropertyNames(a).map(e=>+e).filter(e=>!isNaN(e)&&e<=t.count).sort((e,t)=>e-t);a=e.length?a[e.slice(-1)[0]]:""}return Object.assign([],a.match(/{{\w+}}/g)).forEach(e=>{let n=e.replace(/[\{\}]/g,"");t[n]&&(a=a.replace(e,t[n]))}),a}};var r=n;exports.default=r;
},{"./me.js":"DIJp","./http.js":"MqMR"}],"DIJp":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=i(require("./http.js")),e=i(require("./lang.js"));function i(t){return t&&t.__esModule?t:{default:t}}const o={me:{},get:()=>o.me.id?Promise.resolve(o.me):o.update(),update:()=>t.default.get("/api/me",!0).then(t=>{if(t)return o.me=Object.assign({notifications:[]},t),o.loadNotifications(),e.default.fetchDict(),window.dispatchEvent(new CustomEvent("meStateChange")),t}),loadNotifications:()=>t.default.get(`/api/users/${o.me.id}/notifications`).then(t=>{o.me.notifications=t,window.dispatchEvent(new CustomEvent("meStateChange"))}),matchNotification:(t,e)=>t.id===e||t.target===e,isNew:t=>!!Array.isArray(o.me.notifications)&&o.me.notifications.some(e=>o.matchNotification(e,t)||"new_comment"==e.type&&e.fromMessage.id===t),removeMatchingNotifications:e=>o.loadNotifications().then(()=>Array.isArray(o.me.notifications)?Promise.all(o.me.notifications.filter(t=>o.matchNotification(t,e)).map(i=>t.default.delete(`/api/notifications/${i.id}`).then(()=>{o.me.notifications=o.me.notifications.filter(t=>!o.matchNotification(t,e)),window.dispatchEvent(new CustomEvent("meStateChange"))}))):Promise.reject("Failed to get notifications from server"))};var a=o;exports.default=a;
},{"./http.js":"MqMR","./lang.js":"dg0a"}],"O1i9":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=r(require("./lang.js")),t=r(require("./router.js")),a=r(require("./me.js"));function r(e){return e&&e.__esModule?e:{default:e}}const n={urlRegExp:/(\([^()]*)?https?:\/\/[^\[\]\n\r\ ]*[-A-Za-z0-9+&@#/%=~_()|]/i,getUrl:e=>{if(!e)return"";let t=e.match(n.urlRegExp);if(t&&t[0].startsWith("(")){let e=t[0].match(/https?:\/\//i);t.index+=e.index,t[0]=t[0].slice(e.index),t[0].endsWith(")")&&(t[0]=t[0].slice(0,-1))}return t},limitStrSize:(e,t)=>e.length>t?e.slice(0,t-3)+"...":e,humanFullDate:e=>{let t=new Date(1e3*e);return(t=new Date(t.getTime()+6e4*t.getTimezoneOffset()*-1)).toISOString().replace("T"," ").replace(/\..*$/,"")},humanTime:t=>{if(!t)return null;const a=Math.abs(Math.round((Date.now()/1e3-t)/60));return a<1?e.default.t("just_now"):a<60?e.default.t("ago",{duration:`${a}mn`}):a<1440?e.default.t("ago",{duration:`${Math.floor(a/60)}h`}):n.humanFullDate(t).split(" ")[0]},getGroupId:()=>{if(a.default.me.groups)switch(t.default.entity.entityType){case"group":return n.getId(t.default.entity);case"message":return n.getId(t.default.entity.group)}return""},getGroupName:()=>{let e=a.default.me.groups.find(e=>e.id==n.getGroupId());return e?e.name:""},getId:e=>{switch(typeof e){case"object":return e?e.id:null;case"string":return e.split("/").pop().replace(/\?.*$/,"").replace(/\.\w+$/,"");default:throw console.warn(e),"Could not extract id !"}},thumbnail:(e,a,r)=>e?t.default.toApp(`/api/images/thumbnail/${a}/${r}/${e}`):null,crop:(e,a,r)=>e?t.default.toApp(`/api/images/crop/${a}/${r}/${e}`):null,defaultAvatar:"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIAAQMAAADOtka5AAAABlBMVEUAAAD///+l2Z/dAAAAAnRSTlMA/iyWEiMAAAMJSURBVHja7ZtBjpwwEEWxmIhFFmiURZZEyi6HCLkZHCXr2eQKHIUjoEiRSGRRiWB6klaDU/hDF4z+W6LuNz3+ZRvbkCSEEEIIIYQQQgghhBBCCCGEEEIIITvwGfy+kxoTpNJigkw6TJBLjwkK8ZiglMFYUInAAqwQRKRBBR0q8FhXEKwVR0GLCvxCjeo6oyzkoIxnEvj5661acPO3yvFqpxdcV+Pj88VeNZ7cGB4ul1QFkv399KT4KBIpmGEwF4i9oL6DIN/3FzToL2ju8AvsBeE2aNFfQMFJBCkF0/R+bkHyCgSVuaDcVaC5zyvMBTkqyHYVaBZDKSpw5oJgLcMC5doXFBSoIMNutjcQBHJULmlhQYUKlmNQbs9kqGC5P2o3FqBBOVjMWkEOdcZQKam3dyqkkgP/g35zxmEpLhbjir0ZFz2tXHgbPR5deI+EMPKmig/hhU/fIkOYL4iYDbIyqpCXajp2Zy4yhNuxqUfbMCaEIraQZ9swJgQBQ0jBQr6eYXrzQrYIYdtC9uaFbDKayJajyTkL+VijyWA+mnBajGpDeFrMzAu5BNvwKoQBDaFHQ+jQEBo0hBoMYUBD8GgIHRpCi44mcAiJRQhoITvzQs63LGQxL2SOJnEhiHUI296bwNOixb1JYr5kz8yX7Odf6XDfBC9kd6yVzq+np69QIY/8AEJ45kt0T4hIM0VONm5CiLlVhLflS+CwdTGEVa2AnfOFTogaVAAfcg1QivpqzLFHD4LnrR0q8FAhqlux3PPUu0EFLSrooL6kLeaQwKMCTY4OfUjVoY+IOvTxSFiw81NtnbmgRwXeXDAg08IxBPIKBPX5BQ0FBxC0+wtSCg4gcBT853nruwiqfQXNHQT/LDiGD9Old6sEL2umn3MtqxDks9NotVbwfaG+FDfL6fznsjV32365cTXrtqoPdJKYrbmreIDvT42DCMYoIUEu4FvIKSpwgr6JvYEAfJm8QgUl+j58gb6Rn4Nvcv/p0jUmcODr8IQQQgghhBBCCCGEEEIIIYQQQgghs/wGp6uYgtiKODIAAAAASUVORK5CYII=",hash:e=>e.split("").reduce((e,t)=>(e<<5)-e+t.charCodeAt()|0),colorHash:e=>["#000000","#333366","#333399","#3333CC","#339933","#339999","#33CC33","#33CC99","#663333","#663366","#666633","#666699","#66CC33","#66CCCC","#993333","#993366","#993399","#996633","#999966","#CC3333","#CC3366","#CC3399","#CC33CC","#CC6633","#CC9933","#CC99CC","#CCCC33"][Math.abs(n.hash(e))%27],backgroundHash:e=>{if(!e)return"background-color: #aaa;";let t=n.colorHash(e),a=n.colorHash(e.split("").reverse().join("."));return`background-color:${t};background-image:linear-gradient(${Math.abs(n.hash(e))%4*45}deg, ${a} 15%, transparent 15% 30%, ${a} 30% 45%, transparent 45% 60%, ${a} 60% 75%, transparent 75% 90%, ${a} 90%);`}};var u=n;exports.default=u;
},{"./lang.js":"dg0a","./router.js":"QBcK","./me.js":"DIJp"}],"QBcK":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=n(require("./http.js")),t=n(require("./me.js")),a=n(require("./util.js")),r=n(require("./lang.js")),i=n(require("./storage.js"));function n(e){return e&&e.__esModule?e:{default:e}}const s={route:"",id:"",action:"",backUrl:"",backUrlPrompt:"",entityUrl:"",entityType:"",search:"",entity:{},isValidUrl:e=>{try{return new URL(e),!0}catch(t){return!1}},getSubpath:()=>new URL(document.baseURI).pathname.replace(/\/$/,""),toApp:e=>e&&"string"==typeof e?s.isValidUrl(e)?e:location.origin+s.getSubpath()+e:"",removeSubpath:e=>e?e.replace(new RegExp(`^${s.getSubpath()}`),""):"",getParam:(e,t=window.location.search.substring(1))=>{let a=t.split("&").find(t=>t.split("=")[0]===e);return a?a.split("=")[1]:""},getSegments:()=>window.location.pathname.slice(1).split("?")[0].split("/"),isOutside:()=>["login","password-reset","signup","invitation","stop-notification-emails","public"].includes(s.route||s.getSegments()[0]),isEntity:e=>["messages","groups","users","links","files"].includes(e),getUrlComponents:e=>{let t={};return e&&(t.url=new URL(e),t.path=t.url.pathname,t.search=t.url.search.slice(1),[t.route,t.id,t.action]=s.removeSubpath(t.path).slice(1).split("/")),t.entityUrl="",t.entityType="",t.backUrl="",t.backUrlPrompt="",t},navigate:async(n="/",o={})=>{n.match(/^http/)||o.raw_url||(n=s.toApp(n));let l=s.getUrlComponents(n);if(s.url&&s.url.href==l.url.href)console.warn("navigate lock !");else switch(Object.assign(s,l),s.route&&s.id&&s.isEntity(s.route)&&(s.entityUrl=`/api/${s.route}/${s.id}`,s.entityType=s.route,await e.default.get(s.entityUrl).then(e=>{if(!e)return console.warn("Unknown entity"),void s.navigate();switch(s.entity=e,s.route){case"groups":"write"==s.action&&(s.backUrl=`/${s.route}/${s.id}`,s.backUrlPrompt=r.default.t("cancel_write")),s.search&&(s.backUrl=`/${s.route}/${s.id}`);break;case"messages":e.parent&&!e.isInFront?s.backUrl=`/messages/${e.parent.id}`:s.backUrl=`/groups/${a.default.getId(e.group)}`;break;case"users":s.backUrl="/";break;default:s.action&&(s.backUrl="/")}}).catch(e=>console.warn(e))),s.route){case"login":i.default.reset();case"create-group":case"groups":case"messages":case"password-reset":case"public":case"share":case"signup":case"stop-notification-emails":case"users":o.replace?history.replaceState(null,"",n):history.pushState(null,"",n),window.dispatchEvent(new CustomEvent("routerStateChange"));break;case"logout":i.default.reset(),window.location.href=window.location.origin;break;case"invitation":i.default.get("apiKey").then(t=>{t?e.default.post(`/api/groups/invitation/${s.id}`,{}).then(()=>{window.location.href=window.location.origin}):s.navigate(`/signup?inviteKey=${s.id}`)});break;default:t.default.get().then(e=>{e?e.data.default_group?s.navigate(`/groups/${e.data.default_group}`):e.groups[0]?s.navigate(`/groups/${e.groups[0].id}`):window.location="/create-group":s.navigate("/login")})}},sync:()=>{s.navigate(location.pathname+location.search+location.hash,{replace:!0})},onClick:(e,t=!1,a=null)=>{if(e.preventDefault(),e.stopPropagation(),!a){const r=e.target.closest("a");r&&("_blank"==r.target&&(t=!0),a=r.getAttribute("href"))}if(a){if(a.startsWith("http")){if(new URL(a).host!=location.host)return void(e.ctrlKey||t?open(a,"_blank"):location.href=a)}for(let e of document.getElementsByClassName("active"))e.classList.remove("active");e.ctrlKey||t?open(a,"_blank"):s.navigate(a)}}};var o=s;exports.default=o;
},{"./http.js":"MqMR","./me.js":"DIJp","./util.js":"O1i9","./lang.js":"dg0a","./storage.js":"EDnG"}],"MqMR":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=a(require("./alert.js")),t=a(require("./storage.js")),r=a(require("./router.js"));function a(e){return e&&e.__esModule?e:{default:e}}const s={sendFile:(r,a,s=null,n=null)=>t.default.get("apiKey").then(e=>{let t=new XMLHttpRequest;t.open("POST",`${document.baseURI}api/files`,!0),t.setRequestHeader("X-AUTH-TOKEN",e),t.addEventListener("load",e=>{e.target.status>199&&e.target.status<300?a(JSON.parse(e.target.response)):n?n(e.target.statusText):console.error(e.target.statusText)}),s&&(t.upload.onprogress=(e=>s({loaded:e.loaded,total:e.total}))),n&&t.addEventListener("error",e=>n(e)),t.send(r)}).catch(t=>e.default.add(t,"alert-danger")),get:(a,s=!1)=>t.default.get("apiKey").then(e=>{if(!(a=r.default.toApp(a)))return;let t={};return e&&(t["X-AUTH-TOKEN"]=e),s&&(t["X-NOCACHE"]="nocache"),fetch(a,{method:"GET",headers:new Headers(t)}).then(e=>e.ok&&e.json()).catch(e=>console.warn(`ERROR for ${a}`,e))}).catch(t=>e.default.add(t,"alert-danger")),post:(e,t,r="application/json")=>s.request(e,t,"POST",r),put:(e,t,r="application/json")=>s.request(e,t,"PUT",r),delete:(e,t,r="application/json")=>s.request(e,null,"DELETE",r),request:(a,s,n,o="application/json")=>t.default.get("apiKey").then(e=>{if(!(a=r.default.toApp(a)))return;let t={};e&&(t["X-AUTH-TOKEN"]=e),o&&(t["Content-type"]=o);let d={method:n,headers:new Headers(t)};return s&&(d.body="object"==typeof s&&"Object"==s.constructor.name?JSON.stringify(s):s),fetch(a,d).then(e=>{if("DELETE"==n)return e;try{return e.json()}catch(t){return console.warn(t.message),Promise.reject(t.message)}}).catch(e=>console.warn(`ERROR for ${a}`,e))}).catch(t=>e.default.add(t,"alert-danger"))};var n=s;exports.default=n;
},{"./alert.js":"vnR2","./storage.js":"EDnG","./router.js":"QBcK"}],"rqMW":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.lang=exports.util=exports.router=exports.me=exports.http=exports.storage=exports.cache=exports.alert=exports.param=void 0;var e=x(require("./param.js")),t=x(require("./alert.js")),r=x(require("./cache.js")),s=x(require("./storage.js")),o=x(require("./http.js")),u=x(require("./me.js")),a=x(require("./router.js")),p=x(require("./util.js")),l=x(require("./lang.js"));function x(e){return e&&e.__esModule?e:{default:e}}const c=e.default;exports.param=c;const i=t.default;exports.alert=i;const n=r.default;exports.cache=n;const d=s.default;exports.storage=d;const f=o.default;exports.http=f;const j=u.default;exports.me=j;const q=a.default;exports.router=q;const g=p.default;exports.util=g;const h=l.default;exports.lang=h;
},{"./param.js":"CwoO","./alert.js":"vnR2","./cache.js":"NUMl","./storage.js":"EDnG","./http.js":"MqMR","./me.js":"DIJp","./router.js":"QBcK","./util.js":"O1i9","./lang.js":"dg0a"}],"qGzB":[function(require,module,exports) {
"use strict";var e=require("idb-keyval"),t=n(require("/core"));function n(e){return e&&e.__esModule?e:{default:e}}const r=new e.Store(t.default.CACHE_STORE,t.default.CACHE),u=[{route:new RegExp("/api/users/[^/]+/?$"),duration:864e5},{route:new RegExp("/api/images/crop/"),duration:31536e6},{route:new RegExp("/api/images/thumbnail/"),duration:31536e6},{route:new RegExp("/api/links/by_url?"),duration:31536e6}];function a(t,n,u){return(0,e.set)(n.url,{lastUsed:Date.now()},r).then(()=>t.put(n,u))}function s(e,n){return fetch(e).then(r=>{if(n){let n=r.clone();caches.open(t.default.CACHE).then(t=>a(t,e,n))}return r})}function o(n){return caches.open(t.default.CACHE).then(t=>t.match(n).then(t=>t?(0,e.set)(n.url,{lastUsed:Date.now()},r).then(()=>t):s(n,!0)))}function i(e){return caches.open(t.default.CACHE).then(t=>fetch(e).then(n=>a(t,e,n)))}self.addEventListener("fetch",t=>{"GET"==t.request.method&&u.some(e=>t.request.url.match(e.route))&&(t.respondWith(o(t.request)),t.waitUntil(()=>{(0,e.get)(t.request.url,r).then(e=>{if(e&&Object.protoype.hasOwnProperty.call(e,"lastUsed")&&null!=e.lastUsed){e.lastUsed+u.find(e=>t.request.url.match(e.route)).duration<Date.now()&&i(t.request)}}).catch(()=>i(t.request))}))});
},{"idb-keyval":"vRk2","/core":"rqMW"}]},{},["qGzB"], null)
//# sourceMappingURL=service-workers.js.map