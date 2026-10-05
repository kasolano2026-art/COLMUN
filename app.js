const state={source:"constitucion",data:{},view:"search",deferredInstall:null};
const SOURCE_META={
  constitucion:{name:"Constitución Política de Colombia",icon:"🇨🇴",url:"https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125"},
  onu:{name:"Carta de las Naciones Unidas",icon:"🌎",url:"https://www.un.org/es/about-us/un-charter/full-text"},
  ddhh:{name:"Declaración Universal de Derechos Humanos",icon:"🌐",url:"https://www.un.org/es/about-us/universal-declaration-of-human-rights"}
};
const synonyms={
  vida:["vida","vivir","muerte","existencia"],
  igualdad:["igualdad","igual","discriminacion","discriminación","trato igual"],
  expresion:["expresion","expresión","opinion","opinión","prensa","informacion","información"],
  empresa:["empresa","empresarial","libre empresa","iniciativa privada","competencia","economica","económica","comercio"],
  educacion:["educacion","educación","enseñanza","escuela","estudio"],
  salud:["salud","sanitario","hospital","atencion medica","atención médica"],
  trabajo:["trabajo","laboral","empleo","empleador","trabajador"],
  libertad:["libertad","libre","autonomia","autonomía"],
  paz:["paz","guerra","seguridad","conflicto"],
  derechos:["derecho","derechos humanos","libertades","dignidad"],
  participacion:["participacion","participación","voto","elecciones","politico","político"],
  propiedad:["propiedad","bienes","dominio"],
  justicia:["justicia","juez","judicial","tribunal","debido proceso"]
};

function norm(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");}
function tokens(q){return norm(q).split(/[^a-z0-9áéíóúñ]+/).filter(x=>x.length>2)}
function expanded(q){
  const n=norm(q), out=new Set(tokens(n));
  Object.values(synonyms).forEach(arr=>{if(arr.some(x=>n.includes(norm(x))))arr.forEach(x=>out.add(norm(x)))});
  return [...out];
}
async function load(){
  const names=["constitucion","onu","ddhh"];
  for(const n of names){
    try{const r=await fetch(`datos/${n}.json`);state.data[n]=await r.json()}catch(e){state.data[n]=[]}
  }
  updateFavCount();
}
function score(item,q){
  const hay=norm([item.titulo,item.texto,item.explicacion,...(item.temas||[])].join(" "));
  const ts=expanded(q);let s=0;
  const nq=norm(q);
  if(hay.includes(nq))s+=12;
  ts.forEach(t=>{if(hay.includes(t))s+= t.length>6?2:1});
  (item.temas||[]).forEach(t=>{if(nq.includes(norm(t)))s+=5});
  return s;
}
function search(q){
  q=q.trim();
  if(!q){status("Escribe una consulta.");return}
  const data=state.data[state.source]||[];
  const found=data.map(x=>({...x,_score:score(x,q)})).filter(x=>x._score>0).sort((a,b)=>b._score-a._score);
  addHistory(q,state.source);renderResults(found,q);
}
function status(t){document.getElementById("status").textContent=t}
function renderResults(list,q){
  const box=document.getElementById("results"),empty=document.getElementById("empty");
  empty.style.display=list.length?"none":"block";
  if(!list.length){box.innerHTML="";status(`No encontramos resultados para “${q}”. Prueba con otra descripción o con un término más general.`);return}
  status(`${list.length} resultado(s) relacionado(s) con “${q}”.`);
  box.innerHTML=list.map(item=>card(item)).join("");
}
function card(item){
  const key=JSON.stringify(item).replace(/</g,"\\u003c");
  const source=SOURCE_META[state.source];
  return `<article class="result">
    <div class="result-top"><div><div class="source-label">${source.icon} ${esc(item.documento)}</div><h2><span class="article-num">Artículo ${esc(item.articulo)}</span> — ${esc(item.titulo)}</h2></div></div>
    <div class="official"><b>📜 Texto del documento</b><span>${esc(item.texto)}</span></div>
    <div class="explanation"><b>💡 Explicación educativa</b><p>${esc(item.explicacion)}</p></div>
    <div class="tags">${(item.temas||[]).map(t=>`<span class="tag">#${esc(t)}</span>`).join("")}</div>
    <div class="actions">
      <button onclick='copyArticle(${key})'>📋 Copiar</button>
      <button onclick='toggleFavorite(${key})'>⭐ Favorito</button>
      <button onclick='shareArticle(${key})'>📤 Compartir</button>
      <a href="${source.url}" target="_blank" rel="noopener">🔗 Fuente oficial</a>
    </div>
  </article>`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function copyArticle(x){
  const t=`COLMUN\n${x.documento}\nArtículo ${x.articulo} — ${x.titulo}\n\n${x.texto}\n\nExplicación educativa: ${x.explicacion}`;
  navigator.clipboard?.writeText(t).then(()=>alert("Artículo copiado."));
}
async function shareArticle(x){
  const t=`${x.documento} — Artículo ${x.articulo}: ${x.titulo}\n\n${x.texto}`;
  if(navigator.share) await navigator.share({title:"COLMUN",text:t}); else {await navigator.clipboard.writeText(t);alert("Texto copiado para compartir.");}
}
function getFav(){return JSON.parse(localStorage.getItem("lex_fav")||"[]")}
function toggleFavorite(x){
  let a=getFav();const id=`${x.documento}|${x.articulo}`;
  if(a.some(y=>`${y.documento}|${y.articulo}`===id))a=a.filter(y=>`${y.documento}|${y.articulo}`!==id);else a.unshift(x);
  localStorage.setItem("lex_fav",JSON.stringify(a));updateFavCount();alert(a.some(y=>`${y.documento}|${y.articulo}`===id)?"⭐ Guardado en favoritos.":"Quitado de favoritos.");
}
function updateFavCount(){document.getElementById("favCount").textContent=getFav().length}
function getHist(){return JSON.parse(localStorage.getItem("lex_hist")||"[]")}
function addHistory(q,source){
  let a=getHist().filter(x=>!(x.q===q&&x.source===source));a.unshift({q,source,when:new Date().toLocaleString()});localStorage.setItem("lex_hist",JSON.stringify(a.slice(0,30)));
}
function renderView(view){
  state.view=view;
  document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.view===view));
  const box=document.getElementById("results"),empty=document.getElementById("empty");
  empty.style.display="none";
  if(view==="favorites"){
    const a=getFav();status(`${a.length} favorito(s) guardado(s).`);
    box.innerHTML=a.length?a.map(x=>cardWithSource(x)).join(""):`<div class="empty"><div>⭐</div><h2>No tienes favoritos</h2><p>Guarda artículos con el botón ⭐.</p></div>`;
  }else if(view==="history"){
    const a=getHist();status(`${a.length} búsqueda(s) en el historial.`);
    box.innerHTML=a.length?a.map(x=>`<article class="result"><b>${esc(x.q)}</b><p>${esc(SOURCE_META[x.source]?.name||x.source)}</p><small>${esc(x.when)}</small><div class="actions"><button onclick="selectSource('${x.source}');document.getElementById('searchInput').value='${escAttr(x.q)}';search(document.getElementById('searchInput').value)">🔎 Buscar de nuevo</button></div></article>`).join(""):`<div class="empty"><div>🕘</div><h2>Sin historial</h2></div>`;
  }else{box.innerHTML="";empty.style.display="block";status("Selecciona una fuente y realiza una búsqueda.")}
}
function escAttr(s){return String(s).replace(/\\/g,"\\\\").replace(/'/g,"\\'")}
function cardWithSource(x){
  const old=state.source;state.source=Object.keys(SOURCE_META).find(k=>SOURCE_META[k].name===x.documento)||old;
  const c=card(x);state.source=old;return c;
}
function selectSource(s){
  state.source=s;
  document.querySelectorAll(".source-card").forEach(x=>x.classList.toggle("active",x.dataset.source===s));
  status(`${SOURCE_META[s].icon} ${SOURCE_META[s].name} seleccionada.`);
}
document.addEventListener("DOMContentLoaded",()=>{
  document.querySelectorAll(".source-card").forEach(b=>b.addEventListener("click",()=>{selectSource(b.dataset.source);renderView("search")}));
  document.getElementById("searchBtn").onclick=()=>search(document.getElementById("searchInput").value);
  document.getElementById("searchInput").addEventListener("keydown",e=>{if(e.key==="Enter")search(e.target.value)});
  document.querySelectorAll(".quick-searches button").forEach(b=>b.onclick=()=>{document.getElementById("searchInput").value=b.dataset.query;renderView("search");search(b.dataset.query)});
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>renderView(b.dataset.view)));
  document.getElementById("themeBtn").onclick=()=>{document.body.classList.toggle("dark");localStorage.setItem("lex_dark",document.body.classList.contains("dark"))};
  if(localStorage.getItem("lex_dark")==="true")document.body.classList.add("dark");
  load();
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();state.deferredInstall=e;document.getElementById("installBtn").classList.remove("hidden")});
document.getElementById("installBtn").onclick=async()=>{if(!state.deferredInstall)return;state.deferredInstall.prompt();state.deferredInstall=null};
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(console.error));
