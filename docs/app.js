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
  var point = w.thisWeek || w.theme;
  var bible = WeekWindow.openBibleHtml(w);
  var jump = bible ? "" : "<p class=\"jump-row\"><a href=\"#" + jumpTarget + "\">Read this week</a></p>";
  var room = bible ? "" : "<p class=\"read\"><strong>In the room:</strong> " + focus + "</p>";
  document.getElementById("week").innerHTML = "<div class=\"week-head\"><div class=\"number\">" + w.n + "</div><div><h2>" + w.title + "</h2><p class=\"this-week\">" + esc(point) + "</p></div></div>" + bible + jump + recapHtml(w) + "<div id=\"reader-slot\"></div><p class=\"question\"><strong>Bring:</strong> " + w.question + "</p><div class=\"read-list\" id=\"read-this-week\"><h3>Read this week</h3><ul class=\"checklist\" id=\"list\"></ul></div>" + room + "<h3>Observe</h3><ul>" + w.observe.map(function(x){return "<li>"+x+"</li>";}).join("") + "</ul>";
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
function go(route, replace, hash) {
  var href = BneiRoute.hrefFor(route) + (hash || "");
  if (replace) history.replaceState(route, "", href);
  else history.pushState(route, "", href);
  applyRoute(route);
}
function applyChrome(route) {
  var home = route.view === "home";
  var week = route.view === "week";
  document.body.classList.toggle("home-page", home);
  document.body.classList.toggle("week-page", week);
  var nav = document.getElementById("shell-nav");
  if (nav) nav.className = home ? "home-nav" : "pills nav";
  var toolbar = document.getElementById("week-toolbar");
  if (toolbar) toolbar.hidden = !week;
  var he = document.getElementById("he-title");
  var kicker = document.getElementById("kicker");
  if (route.view === "job") {
    if (he) he.textContent = "אִיּוֹב";
    if (kicker) kicker.textContent = "The book of Job";
    document.title = "Job | Bnei Haberit";
  } else if (route.view === "map") {
    if (he) he.textContent = "בְּנֵי הַבְּרִית";
    if (kicker) kicker.textContent = "Story map";
    document.title = "Story map | Bnei Haberit";
  } else if (route.view === "teacher") {
    if (he) he.textContent = "בְּנֵי הַבְּרִית";
    if (kicker) kicker.textContent = "Teacher";
    document.title = "Teacher | Bnei Haberit Study";
  } else if (week) {
    if (he) he.textContent = "בְּנֵי הַבְּרִית";
    if (kicker) kicker.textContent = "Weekly reading";
    document.title = "This week | Bnei Haberit";
  } else {
    if (he) he.textContent = "בְּנֵי הַבְּרִית";
    if (kicker) kicker.textContent = "Sons of the Covenant";
    document.title = "Bnei Haberit Study";
  }
  document.querySelectorAll("#shell-nav a").forEach(function(a){
    var v = a.getAttribute("data-view");
    a.classList.toggle("here", v === route.view);
  });
  ["home", "week", "job", "map", "teacher"].forEach(function(v){
    var el = document.getElementById("view-" + v);
    if (el) el.hidden = v !== route.view;
  });
}
function applyRoute(route) {
  applyChrome(route);
  if (route.view === "week") {
    var raw = route.week;
    urlLocked = raw != null && raw !== "" && !WeekWindow.isStudentWeek(raw);
    var sel = document.getElementById("pick");
    if (sel && !urlLocked && WeekWindow.isStudentWeek(raw)) sel.value = String(raw);
    else if (sel) sel.value = String(DEFAULT_WEEK);
    render();
  }
  if (route.view === "map" && window.BneiMap) BneiMap.boot(route.week);
  if (route.view === "teacher" && window.BneiTeacher) BneiTeacher.boot(route.week);
  if (location.hash && route.view === "week") {
    var jump = document.getElementById(location.hash.slice(1));
    if (jump) jump.scrollIntoView();
  } else if (!location.hash) {
    window.scrollTo(0, 0);
  }
}
function onAppClick(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  var a = e.target.closest("a");
  if (!a || (a.target && a.target !== "_self")) return;
  var href = a.getAttribute("href") || "";
  if (!href || href.charAt(0) === "#") return;
  var u;
  try { u = new URL(href, location.href); } catch (err) { return; }
  if (u.origin !== location.origin) return;
  if (!BneiRoute.isAppPath(u.pathname)) return;
  e.preventDefault();
  go(BneiRoute.parseRoute(u), false, u.hash);
}
async function boot() {
  weeks = await (await fetch("weeks.json?v=openbible")).json();
  const sel = document.getElementById("pick");
  sel.innerHTML = WeekWindow.pickerWeeks(weeks).map(function(w){
    return "<option value=\"" + w.n + "\">" + esc(WeekWindow.optionLabel(w)) + "</option>";
  }).join("");
  sel.addEventListener("change", function() {
    urlLocked = false;
    go({ view: "week", week: Number(sel.value) }, true);
  });
  if (configLooksReal() && window.firebase) {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    firebaseReady = true;
    firebase.auth().onAuthStateChanged(async function(user) {
      uid = user ? user.uid : null;
      document.getElementById("who").textContent = user ? (user.displayName || user.email) : "";
      document.getElementById("signout").hidden = !user;
      document.getElementById("signin").hidden = !!user;
      if (user) await loadRemote(); else { loadLocal(); if (BneiRoute.parseRoute(location).view === "week") render(); }
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
  document.addEventListener("click", onAppClick);
  window.addEventListener("popstate", function() {
    applyRoute(BneiRoute.parseRoute(location));
  });
  applyRoute(BneiRoute.parseRoute(location));
}
window.BneiApp = { go: go, applyRoute: applyRoute };
boot();
