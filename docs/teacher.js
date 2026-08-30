function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function withHe(s) {
  return esc(s).replace(/([\u0590-\u05FF\uFB1D-\uFB4F]+)/g, "<span class=\"he\" lang=\"he\">$1</span>");
}
function labelClass(label) {
  var u = String(label || "").toUpperCase();
  if (u.indexOf("EXTRA") !== -1) return "source-label extra-biblical";
  if (u.indexOf("CANONICAL") !== -1) return "source-label canonical";
  return "source-label";
}
function teacherOnlyHtml(w) {
  if (!w.teacherOnly || !w.teacherOnly.length) return "";
  var html = "<section class=\"teacher-only\"><p class=\"recap-kicker\">Teacher only. Do not paste this to the group.</p>";
  w.teacherOnly.forEach(function(b){
    if (b.label) html += "<p class=\"" + labelClass(b.label) + "\">" + esc(b.label) + "</p>";
    if (b.h) html += "<h3>" + esc(b.h) + "</h3>";
    (b.p || []).forEach(function(t){ html += "<p dir=\"auto\">" + withHe(t) + "</p>"; });
  });
  html += "</section>";
  return html;
}
async function boot(selectedWeek) {
  const weeks = await (await fetch("weeks.json?v=openbible2")).json();
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
    document.getElementById("teacher-week").innerHTML = "<div class=\"week-head\"><div class=\"number\">"+w.n+"</div><div><h2>"+esc(w.title)+"</h2><p class=\"theme\">"+esc(w.theme)+"</p></div></div><p style=\"margin:14px 0;\"><a class=\"btn\" href=\"deck.html?week="+w.n+"\" style=\"background:var(--gold); color:#0c1a19; font-weight:700;\">📽️ Launch Week "+w.n+" Presentation Slides</a></p><p><strong>Spine:</strong> "+esc(w.spine)+"</p><p><strong>Big idea:</strong> "+esc(w.big)+"</p><p><strong>Participant reading:</strong> "+esc(w.student)+"</p><p><strong>In-room:</strong> "+esc((w.focus||[]).join("; "))+"</p><h3>Teaching moves</h3><ol>"+moves+"</ol>" + teacherOnlyHtml(w) + "<p class=\"read\"><strong>App moment:</strong> "+esc(w.app||"")+"</p><p class=\"question\"><strong>Guardrail:</strong> "+esc(w.guard||"")+"</p><p><strong>Response:</strong> "+esc(w.response||"")+"</p>";
  }
  draw();
}
var api = { boot: boot, teacherOnlyHtml: teacherOnlyHtml, esc: esc, withHe: withHe };
if (typeof module !== "undefined" && module.exports) module.exports = api;
(typeof globalThis !== "undefined" ? globalThis : this).BneiTeacher = api;
