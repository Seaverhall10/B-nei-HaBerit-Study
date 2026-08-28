const DEFAULT_WEEK = WeekWindow.DEFAULT_WEEK;
let weeks = [];
let uid = null;
let checks = {};
let firebaseReady = false;
let readingsByWeek = {};
let urlLocked = false;
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
    (b.p || []).forEach(function(t){ html += "<p>" + esc(t) + "</p>"; });
    if (b.items && b.items.length) {
      html += "<ul class=\"recap-items\">";
      b.items.forEach(function(it){
        html += "<li>";
        if (it.b) html += "<h4 class=\"lead\">" + esc(it.b) + "</h4>";
        (it.p || []).forEach(function(t){ html += "<p>" + esc(t) + "</p>"; });
        html += "</li>";
      });
      html += "</ul>";
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
async function loadReadings(n) {
  if (readingsByWeek[n]) return readingsByWeek[n];
  try {
    var pack = await (await fetch("readings-week" + n + ".json")).json();
    readingsByWeek[n] = pack;
    return pack;
  } catch (e) { return null; }
}
function bindReader(root, w){
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
function renderLocked() {
  document.getElementById("progress").textContent = "";
  var article = document.getElementById("week");
  article.classList.remove("has-reader");
  article.innerHTML = WeekWindow.notYetHtml();
}
function render() {
  const sel = document.getElementById("pick");
  if (urlLocked) {
    renderLocked();
    return;
  }
  const w = weeks.find(function(x){ return x.n === Number(sel.value); });
  if (!w || !WeekWindow.isStudentWeek(w.n)) {
    renderLocked();
    return;
  }
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
  loadReadings(w.n).then(function(pack){
    var slot = document.getElementById("reader-slot");
    if (!slot) return;
    slot.innerHTML = WeekWindow.creamReaderHtml(w, pack, weekChecks(w.n, (w.reader || []).length));
    bindReader(slot, w);
  });
}
async function boot() {
  weeks = await (await fetch("weeks.json")).json();
  const sel = document.getElementById("pick");
  sel.innerHTML = WeekWindow.pickerWeeks(weeks).map(function(w){
    return "<option value=\"" + w.n + "\">" + esc(WeekWindow.optionLabel(w)) + "</option>";
  }).join("");
  var raw = new URLSearchParams(location.search).get("week");
  var q = Number(raw);
  urlLocked = raw != null && raw !== "" && !WeekWindow.isStudentWeek(q);
  if (!urlLocked && WeekWindow.isStudentWeek(q)) sel.value = String(q);
  else sel.value = String(DEFAULT_WEEK);
  sel.addEventListener("change", function() {
    urlLocked = false;
    if (history.replaceState) history.replaceState(null, "", "week.html?week=" + sel.value);
    render();
  });
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
  render();
}
boot();
