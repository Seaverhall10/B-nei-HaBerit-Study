const DEFAULT_WEEK = 2;
let weeks = [];
let uid = null;
let checks = {};
let firebaseReady = false;
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
  document.getElementById("progress").textContent = count + "/" + items.length + " this week";
  const focus = w.focus.join("; ");
  document.getElementById("week").innerHTML = "<div class=\"week-head\"><div class=\"number\">" + w.n + "</div><div><h2>" + w.title + "</h2><p class=\"theme\">" + w.theme + "</p></div></div>" + recapHtml(w) + "<p class=\"question\"><strong>Bring this question:</strong> " + w.question + "</p><h3>Read in your Bible</h3><ul class=\"checklist\" id=\"list\"></ul><p class=\"read\"><strong>Focused in-room text:</strong> " + focus + "<br><a href=\"" + gw(w.student) + "\" target=\"_blank\" rel=\"noopener\">Open whole assignment (NIV)</a> &nbsp;|&nbsp; <a href=\"" + gw(focus) + "\" target=\"_blank\" rel=\"noopener\">Open focused passages (NIV)</a></p><h3>Observe</h3><ul>" + w.observe.map(function(x){return "<li>"+x+"</li>";}).join("") + "</ul>" + studyAppHtml(w);
  const list = document.getElementById("list");
  items.forEach(function(item, i) {
    const li = document.createElement("li");
    const id = "w" + w.n + "-" + i;
    li.innerHTML = "<input id=\"" + id + "\" type=\"checkbox\"" + (done[i] ? " checked" : "") + "><label for=\"" + id + "\">" + item + "</label>";
    li.querySelector("input").addEventListener("change", async function(e) {
      const arr = weekChecks(w.n, items.length);
      arr[i] = e.target.checked;
      checks[String(w.n)] = arr;
      document.getElementById("progress").textContent = arr.filter(Boolean).length + "/" + items.length + " this week";
      await saveRemote();
    });
    list.appendChild(li);
  });
}
async function boot() {
  weeks = await (await fetch("weeks.json")).json();
  const sel = document.getElementById("pick");
  sel.innerHTML = weeks.map(function(w){ return "<option value=\"" + w.n + "\">Week " + w.n + ": " + w.title + "</option>"; }).join("");
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
      if (user) await loadRemote(); else { loadLocal(); render(); }
    });
  } else { loadLocal(); }
  document.getElementById("signin").onclick = function() {
    if (!firebaseReady) { alert("Firebase is not connected yet. Checks save on this device. Add your Firebase web config to public/firebase-config.js, then deploy."); return; }
    firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  };
  document.getElementById("signout").onclick = function() { firebase.auth().signOut(); };
  render();
}
boot();
