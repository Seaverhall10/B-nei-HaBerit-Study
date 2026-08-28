function esc(s) { return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
async function boot(selectedWeek) {
  const weeks = await (await fetch("weeks.json")).json();
  const sel = document.getElementById("teacher-pick");
  if (!sel.dataset.filled) {
    sel.innerHTML = weeks.map(function(w){ return "<option value=\""+w.n+"\">Week "+w.n+": "+w.title+"</option>"; }).join("");
    sel.dataset.filled = "1";
    sel.onchange = draw;
  }
  if (selectedWeek) sel.value = String(selectedWeek);
  else if (!sel.value) sel.value = "2";
  function teacherOnlyHtml(w) {
    if (!w.teacherOnly || !w.teacherOnly.length) return "";
    var html = "<section class=\"teacher-only\"><p class=\"recap-kicker\">Teacher only. Do not paste this to the group.</p>";
    w.teacherOnly.forEach(function(b){
      if (b.h) html += "<h3>" + esc(b.h) + "</h3>";
      (b.p || []).forEach(function(t){ html += "<p>" + esc(t) + "</p>"; });
    });
    html += "</section>";
    return html;
  }
  function draw() {
    const w = weeks.find(function(x){ return x.n === Number(sel.value); });
    const moves = (w.teacherMoves||[]).map(function(x){ return "<li>"+esc(x)+"</li>"; }).join("");
    document.getElementById("teacher-week").innerHTML = "<div class=\"week-head\"><div class=\"number\">"+w.n+"</div><div><h2>"+esc(w.title)+"</h2><p class=\"theme\">"+esc(w.theme)+"</p></div></div><p><strong>Spine:</strong> "+esc(w.spine)+"</p><p><strong>Big idea:</strong> "+esc(w.big)+"</p><p><strong>Participant reading:</strong> "+esc(w.student)+"</p><p><strong>In-room:</strong> "+esc((w.focus||[]).join("; "))+"</p><h3>Teaching moves</h3><ol>"+moves+"</ol>" + teacherOnlyHtml(w) + "<p class=\"read\"><strong>App moment:</strong> "+esc(w.app||"")+"</p><p class=\"question\"><strong>Guardrail:</strong> "+esc(w.guard||"")+"</p><p><strong>Response:</strong> "+esc(w.response||"")+"</p>";
  }
  draw();
}
window.BneiTeacher = { boot: boot };
