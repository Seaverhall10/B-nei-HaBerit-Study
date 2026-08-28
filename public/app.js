const DEFAULT_WEEK = 2;
let weeks = [];
let uid = null;
let checks = {};
let firebaseReady = false;
let readingsByWeek = {};
function configLooksReal() { const c = window.FIREBASE_CONFIG; return c && c.apiKey && String(c.apiKey).indexOf("REPLACE") === -1; }
function localKey() { return "bnei-checks-" + (uid || "local"); }
function loadLocal() { try { checks = JSON.parse(localStorage.getItem(localKey()) || "{}"); } catch (e) { checks = {}; } }
function saveLocal() { localStorage.setItem(localKey(), JSON.stringify(checks)); }
async function loadRemote() { if (!firebaseReady || !uid) return; const snap = await firebase.firestore().doc("users/" + uid + "/progress/weeks").get(); if (snap.exists) { const data = snap.data() || {}; checks = {}; Object.keys(data).forEach(function(k){ if (k === "updatedAt") return; const v = data[k]; checks[k] = (v && v.items) ? v.items : v; }); } else loadLocal(); render(); }
async function saveRemote() { saveLocal(); if (!firebaseReady || !uid) return; const payload = { updatedAt: firebase.firestore.FieldValue.serverTimestamp() }; Object.keys(checks).forEach(function(k){ const items = Array.isArray(checks[k]) ? checks[k] : ((checks[k] && checks[k].items) || []); payload[k] = { items: items }; }); await firebase.firestore().doc("users/" + uid + "/progress/weeks").set(payload, { merge: true }); }
function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function recapHtml(w) {
  if (!w.recap || !w.recap.length) return "";
  var html = "<section class=\"recap\"><p class=\"recap-kicker\">Session recap</p>";
  w.recap.forEach(function(b){
    if (b.h) html += "<h3>" + esc(b.h) + "</h3>";
    if (b.items && b.items.length) {
      html += "<ul class=\"recap-items\">";
      b.items.forEach(function(it){
        html += "<li>";
        if (it.b) html += "<h4 class=\"lead\">" + esc(it.b) + "</h4>";
        (it.p || []).forEach(function(t){ html += "<p>" + esc(t) + "</p>"; });
        html += "</li>";
      });
      html += "</ul>";
    } else {
      (b.p || []).forEach(function(t){ html += "<p>" + esc(t) + "</p>"; });
    }
  });
  if (w.recapLink) html += "<p class=\"recap-link\"><a href=\"" + esc(w.recapLink.href) + "\">" + esc(w.recapLink.label) + "</a></p>";
  html += "</section>";
  return html;
}
function studyAppHtml(w) {
  if (!w.studyApp) return "";
  var a = w.studyApp;
  var html = "<div class=\"study-app\"><h3>Study app</h3><p><a href=\"" + esc(a.href) + "\" target=\"_blank\" rel=\"noopener\">" + esc(a.label) + "</a></p>";
  if (a.note) html += "<p class=\"muted\">" + esc(a.note) + "</p>";
  html += "</div>";
  return html;
}
function getRS(){
  var d = {font:"serif", size:"110", lines:"on", mode:"scripture"};
  try { Object.assign(d, JSON.parse(localStorage.getItem("bnei-reader") || "{}")); } catch (e) {}
  if (!d.modeSet) d.mode = "scripture";
  return d;
}
function putRS(s){ localStorage.setItem("bnei-reader", JSON.stringify(s)); applyRS(s); }
function applyRS(s){
  document.documentElement.dataset.font = s.font;
  document.documentElement.dataset.size = s.size;
  var el = document.querySelector(".reader-root");
  if (!el) return;
  el.dataset.font = s.font;
  el.dataset.size = s.size;
  el.dataset.lines = s.lines;
  el.dataset.mode = s.mode;
  el.querySelectorAll(".reader-bar button").forEach(function(b){
    var k = b.getAttribute("data-k"); var v = b.getAttribute("data-v");
    b.classList.toggle("on", s[k] === v);
  });
}
function ilLookup(k){
  if (k === "Jude 6-7") return "Jude 1:6-7";
  return k;
}
function wordHtml(w, lang){
  var title = [w.m, w.s].filter(Boolean).join(" · ");
  return "<span class=\"il-word\" title=\"" + esc(title) + "\"><span class=\"il-h\">" + esc(w.h || "") + "</span>" + (w.g ? "<span class=\"il-g\">" + esc(w.g) + "</span>" : "") + (w.s ? "<span class=\"il-s\">" + esc(w.s) + "</span>" : "") + "</span>";
}
function englishByVerse(web){
  var map = {};
  (web && web.verses || []).forEach(function(v){ map[v.v] = v.t; });
  return map;
}
function bindReaderBar(root){
  root.querySelectorAll(".reader-bar button").forEach(function(b){
    b.addEventListener("click", function(){
      var s = getRS();
      var k = b.getAttribute("data-k");
      s[k] = b.getAttribute("data-v");
      if (k === "mode") s.modeSet = true;
      putRS(s);
    });
  });
}
function readerHtml(w, pack, il) {
  if (!w.reader || !w.reader.length) return "";
  var webBy = {};
  ((pack && pack.passages) || []).forEach(function(p){ webBy[p.refKey] = p; });
  var ilBy = {};
  ((il && il.passages) || []).forEach(function(p){ ilBy[p.ref] = p; });
  var s = getRS();
  var html = "<section class=\"reader-root\" data-font=\"" + s.font + "\" data-size=\"" + s.size + "\" data-lines=\"" + s.lines + "\" data-mode=\"" + s.mode + "\">";
  html += "<div class=\"reader-bar\">";
  html += "<button type=\"button\" data-k=\"mode\" data-v=\"scripture\">Scripture</button>";
  html += "<button type=\"button\" data-k=\"mode\" data-v=\"interlinear\">Interlinear</button>";
  html += "<span class=\"grow\"></span>";
  html += "<button type=\"button\" data-k=\"font\" data-v=\"serif\">Serif</button>";
  html += "<button type=\"button\" data-k=\"font\" data-v=\"sans\">Sans</button>";
  html += "<button type=\"button\" data-k=\"size\" data-v=\"90\">A-</button>";
  html += "<button type=\"button\" data-k=\"size\" data-v=\"110\">A</button>";
  html += "<button type=\"button\" data-k=\"size\" data-v=\"125\">A+</button>";
  html += "<button type=\"button\" data-k=\"lines\" data-v=\"on\">Lines</button>";
  html += "<button type=\"button\" data-k=\"lines\" data-v=\"off\">Open</button>";
  html += "</div>";
  
  var done = weekChecks(w.n, (w.reader || []).length);
  w.reader.forEach(function(block, i){
    var body = "";
    (block.keys || []).forEach(function(k){
      var web = webBy[k];
      var inter = ilBy[ilLookup(k)] || ilBy[k];
      var enMap = englishByVerse(web);
      body += "<h4>" + esc((inter && inter.ref) || (web && web.ref) || k) + "</h4>";
      if (inter && inter.verses && inter.verses.length){
        inter.verses.forEach(function(v){
          var en = enMap[v.n] || "";
          body += "<div class=\"il-verse\" data-lang=\"" + esc(inter.lang || "he") + "\"><div class=\"il-en\"><span class=\"il-num\">" + esc(String(v.n)) + "</span><span class=\"il-en-text\">" + esc(en) + "</span></div><div class=\"il-verse-words\">" + (v.words || []).map(function(wrd){ return wordHtml(wrd, inter.lang); }).join("") + "</div></div>";
        });
      } else if (web){
        (web.verses || []).forEach(function(v){
          body += "<div class=\"il-verse\" data-lang=\"en\"><div class=\"il-en\"><span class=\"il-num\">" + esc(String(v.v)) + "</span><span class=\"il-en-text\">" + esc(v.t) + "</span></div></div>";
        });
      }
    });
    if (!body) return;
    html += "<details class=\"passage" + (done[i] ? " read" : "") + "\"><summary><label class=\"mark-read\"><input type=\"checkbox\" data-i=\"" + i + "\"" + (done[i] ? " checked" : "") + "><span>Read</span></label><span class=\"passage-title\">" + esc(block.title) + "</span></summary><div class=\"passage-body\">" + body + "</div></details>";
  });
  html += "</section>";
  return html;
}
let interlinearPack = null;
async function loadReadings(n) {
  if (readingsByWeek[n]) return readingsByWeek[n];
  try {
    var pack = await (await fetch("readings-week" + n + ".json")).json();
    readingsByWeek[n] = pack;
    return pack;
  } catch (e) { return null; }
}
async function loadInterlinear(n) {
  if (interlinearPack) return interlinearPack;
  if (n !== 2) return null;
  try {
    interlinearPack = await (await fetch("interlinear-week2.json")).json();
    return interlinearPack;
  } catch (e) { return null; }
}
function bindReader(root, w){
  root.querySelectorAll(".il-verse").forEach(function(v){
    v.addEventListener("click", function(e){
      if (e.target.closest(".il-word")) return;
      if (root.dataset.mode !== "scripture") return;
      v.classList.toggle("open");
    });
  });
  var items = itemsFor(w);
  root.querySelectorAll(".mark-read").forEach(function(lab){
    var box = lab.querySelector("input");
    async function mark(on){
      var i = Number(box.getAttribute("data-i"));
      var arr = weekChecks(w.n, items.length);
      arr[i] = on;
      checks[String(w.n)] = arr;
      box.checked = on;
      var det = lab.closest(".passage");
      if (det) det.classList.toggle("read", on);
      var top = document.getElementById("w" + w.n + "-" + i);
      if (top) top.checked = on;
      document.getElementById("progress").textContent = arr.filter(Boolean).length + "/" + items.length;
      await saveRemote();
    }
    lab.addEventListener("click", function(e){
      e.preventDefault();
      e.stopPropagation();
      mark(!box.checked);
    });
  });
}
function itemsFor(w) { return w.student.split(";").map(function(s){return s.trim();}).filter(Boolean); }
function weekChecks(n, len) { const rec = checks[n] || checks[String(n)]; const base = rec && rec.items ? rec.items : rec; const arr = Array.isArray(base) ? base.slice() : []; while (arr.length < len) arr.push(false); return arr; }
function gw(refs) { return "https://www.biblegateway.com/passage/?search=" + encodeURIComponent(refs) + "&version=NIV"; }
function render() {
  const sel = document.getElementById("pick");
  const w = weeks.find(function(x){ return x.n === Number(sel.value); });
  if (!w) return;
  const items = itemsFor(w);
  const done = weekChecks(w.n, items.length);
  const count = done.filter(Boolean).length;
  document.getElementById("progress").textContent = count + "/" + items.length;
  const focus = w.focus.join("; ");
  var hasReader = w.reader && w.reader.length;
  var jumpTarget = hasReader ? "reader-slot" : "read-this-week";
  document.getElementById("week").innerHTML = "<div class=\"week-head\"><div class=\"number\">" + w.n + "</div><div><h2>" + w.title + "</h2><p class=\"theme\">" + w.theme + "</p></div></div><p class=\"jump-row\"><a href=\"#" + jumpTarget + "\">Read this week</a></p>" + recapHtml(w) + "<div id=\"reader-slot\"></div><p class=\"question\"><strong>Bring:</strong> " + w.question + "</p><div class=\"read-list\" id=\"read-this-week\"><h3>Read this week</h3><ul class=\"checklist\" id=\"list\"></ul></div><p class=\"read\"><strong>In the room:</strong> " + focus + "</p><h3>Observe</h3><ul>" + w.observe.map(function(x){return "<li>"+x+"</li>";}).join("") + "</ul>" + studyAppHtml(w);
  if (hasReader) document.getElementById("week").classList.add("has-reader");
  else document.getElementById("week").classList.remove("has-reader");
  const list = document.getElementById("list");
  items.forEach(function(item, i) {
    const li = document.createElement("li");
    const id = "w" + w.n + "-" + i;
    li.innerHTML = "<input id=\"" + id + "\" type=\"checkbox\"" + (done[i] ? " checked" : "") + "><label for=\"" + id + "\">" + item + "</label>";
    li.querySelector("input").addEventListener("change", async function(e) {
      const arr = weekChecks(w.n, items.length);
      arr[i] = e.target.checked;
      checks[String(w.n)] = arr;
      document.getElementById("progress").textContent = arr.filter(Boolean).length + "/" + items.length;
      await saveRemote();
    });
    list.appendChild(li);
  });
  Promise.all([loadReadings(w.n), loadInterlinear(w.n)]).then(function(pair){
    var slot = document.getElementById("reader-slot");
    if (!slot) return;
    slot.innerHTML = readerHtml(w, pair[0], pair[1]);
    var root = slot.querySelector(".reader-root");
    if (root) {
      applyRS(getRS());
      bindReaderBar(root);
      bindReader(root, w);
    }
    var list = document.getElementById("list");
    if (list && w.reader && w.reader.length) list.parentNode.querySelector("h3").textContent = "Read this week";
  });
}
async function boot() {
  weeks = await (await fetch("weeks.json?v=week1items")).json();
  const sel = document.getElementById("pick");
  sel.innerHTML = weeks.map(function(w){ return "<option value=\"" + w.n + "\">" + w.n + "</option>"; }).join("");
  var q=Number(new URLSearchParams(location.search).get("week"));
  sel.value = String(q || DEFAULT_WEEK);
  sel.addEventListener("change", render);
  if (configLooksReal() && window.firebase) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    firebaseReady = true;
    firebase.auth().onAuthStateChanged(async function(user) {
      uid = user ? user.uid : null;
      document.getElementById("who").textContent = user ? (user.displayName || user.email) : "";
      document.getElementById("signout").hidden = !user;
      document.getElementById("signin").hidden = !!user;
      if (user) await loadRemote(); else { loadLocal(); render(); }
    });
  } else {
    loadLocal();
    var saveBtn = document.getElementById("signin");
    if (saveBtn) saveBtn.hidden = true;
  }
  document.getElementById("signin").onclick = function() {
    if (!firebaseReady) { alert("Firebase is not connected yet. Checks save on this device. Add your Firebase web config to public/firebase-config.js, then deploy."); return; }
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };
  document.getElementById("signout").onclick = function() { firebase.auth().signOut(); };
  applyRS(getRS());
  render();
}
boot();
