function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function withHe(s) {
  return esc(s).replace(/([\u0590-\u05FF\uFB1D-\uFB4F]+)/g, "<span class=\"he\" lang=\"he\">$1</span>");
}
function inlineMd(s) {
  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/\*(.+?)\*/g, "<em>$1</em>");
  s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
  return s.replace(/([\u0590-\u05FF\uFB1D-\uFB4F]+)/g, "<span class=\"he\" lang=\"he\">$1</span>");
}
function mdToHtml(src) {
  var lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
  var html = "";
  var i = 0;
  var inList = false;
  function closeList() {
    if (inList) { html += "</ul>"; inList = false; }
  }
  while (i < lines.length) {
    var line = lines[i];
    if (/^\s*$/.test(line)) { closeList(); i++; continue; }
    var h = /^(#{1,3})\s+(.+)$/.exec(line);
    if (h) {
      closeList();
      var tag = h[1].length === 1 ? "h2" : (h[1].length === 2 ? "h3" : "h4");
      html += "<" + tag + ">" + inlineMd(h[2]) + "</" + tag + ">";
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { html += "<ul>"; inList = true; }
      html += "<li>" + inlineMd(line.replace(/^[-*]\s+/, "")) + "</li>";
      i++;
      continue;
    }
    closeList();
    var para = line;
    i++;
    while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^#{1,3}\s+/.test(lines[i]) && !/^[-*]\s+/.test(lines[i])) {
      para += " " + lines[i];
      i++;
    }
    html += "<p dir=\"auto\">" + inlineMd(para) + "</p>";
  }
  closeList();
  return html;
}
function labelClass(label) {
  var u = String(label || "").toUpperCase();
  if (u.indexOf("EXTRA") !== -1) return "source-label extra-biblical";
  if (u.indexOf("CANONICAL") !== -1) return "source-label canonical";
  return "source-label";
}
function week2CanonShell() {
  return "<section class=\"canon-brief-shell\" id=\"week2-canon\">" +
    "<h3>Why these books / where English comes from</h3>" +
    "<p>Teacher only. Full brief — not a GroupMe dump. " +
    "<a class=\"canon-file\" href=\"teacher-week2-canon.md\">Open teacher-week2-canon.md</a>.</p>" +
    "<details class=\"canon-brief\"><summary>Read the full canon and versions brief</summary>" +
    "<div class=\"canon-body\"><p>Loading the brief…</p></div></details></section>";
}
function loadWeek2Canon(root) {
  if (!root) return Promise.resolve();
  var body = root.querySelector(".canon-body");
  if (!body) return Promise.resolve();
  var det = root.querySelector("details.canon-brief");
  if (det && det.getAttribute("data-bound") !== "1") {
    det.setAttribute("data-bound", "1");
    det.addEventListener("toggle", function(){
      if (det.open) loadWeek2Canon(root);
    });
  }
  if (body.getAttribute("data-loaded") === "1" || body.getAttribute("data-loaded") === "pending") {
    return Promise.resolve();
  }
  body.setAttribute("data-loaded", "pending");
  return fetch("teacher-week2-canon.md?v=canon1").then(function(r){
    if (!r.ok) throw new Error("missing brief");
    return r.text();
  }).then(function(md){
    body.innerHTML = mdToHtml(md);
    body.setAttribute("data-loaded", "1");
  }).catch(function(){
    body.innerHTML = "<p>Could not load the brief. Use the file link.</p>";
  });
}
function teacherOnlyHtml(w) {
  if (!w.teacherOnly || !w.teacherOnly.length) return "";
  var html = "<section class=\"teacher-only\"><p class=\"recap-kicker\">Teacher only. Do not paste this to the group.</p>";
  w.teacherOnly.forEach(function(b){
    if (b.label) html += "<p class=\"" + labelClass(b.label) + "\">" + esc(b.label) + "</p>";
    if (b.h) html += "<h3>" + esc(b.h) + "</h3>";
    (b.p || []).forEach(function(t){ html += "<p dir=\"auto\">" + withHe(t) + "</p>"; });
  });
  if (Number(w.n) === 2) html += week2CanonShell();
  html += "</section>";
  return html;
}
async function boot(selectedWeek) {
  const weeks = await (await fetch("weeks.json?v=canon1")).json();
  const sel = document.getElementById("teacher-pick");
  if (!sel.dataset.filled) {
    sel.innerHTML = weeks.map(function(w){ return "<option value=\""+w.n+"\">Week "+w.n+": "+w.title+"</option>"; }).join("");
    sel.dataset.filled = "1";
    sel.onchange = draw;
  }
  if (selectedWeek) sel.value = String(selectedWeek);
  else if (!sel.value) sel.value = "2";
  function draw() {
    const w = weeks.find(function(x){ return x.n === Number(sel.value); });
    const moves = (w.teacherMoves||[]).map(function(x){ return "<li>"+esc(x)+"</li>"; }).join("");
    var root = document.getElementById("teacher-week");
    root.innerHTML = "<div class=\"week-head\"><div class=\"number\">"+w.n+"</div><div><h2>"+esc(w.title)+"</h2><p class=\"theme\">"+esc(w.theme)+"</p></div></div><p><strong>Spine:</strong> "+esc(w.spine)+"</p><p><strong>Big idea:</strong> "+esc(w.big)+"</p><p><strong>Participant reading:</strong> "+esc(w.student)+"</p><p><strong>In-room:</strong> "+esc((w.focus||[]).join("; "))+"</p><h3>Teaching moves</h3><ol>"+moves+"</ol>" + teacherOnlyHtml(w) + "<p class=\"read\"><strong>App moment:</strong> "+esc(w.app||"")+"</p><p class=\"question\"><strong>Guardrail:</strong> "+esc(w.guard||"")+"</p><p><strong>Response:</strong> "+esc(w.response||"")+"</p>";
    if (Number(w.n) === 2) loadWeek2Canon(root);
  }
  draw();
}
var api = { boot: boot, teacherOnlyHtml: teacherOnlyHtml, esc: esc, withHe: withHe, mdToHtml: mdToHtml, week2CanonShell: week2CanonShell, loadWeek2Canon: loadWeek2Canon };
if (typeof module !== "undefined" && module.exports) module.exports = api;
(typeof globalThis !== "undefined" ? globalThis : this).BneiTeacher = api;
