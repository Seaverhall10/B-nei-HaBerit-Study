async function boot() {
  const weeks = await (await fetch("weeks.json")).json();
  const sel = document.getElementById("pick");
  sel.innerHTML = weeks.map(function(w){ return "<option value=\""+w.n+"\">Week "+w.n+": "+w.title+"</option>"; }).join("");
  sel.value = "2";
  function draw() {
    const w = weeks.find(function(x){ return x.n === Number(sel.value); });
    const moves = (w.teacherMoves||[]).map(function(x){ return "<li>"+x+"</li>"; }).join("");
    document.getElementById("week").innerHTML = "<div class=\"week-head\"><div class=\"number\">"+w.n+"</div><div><h2>"+w.title+"</h2><p class=\"theme\">"+w.theme+"</p></div></div><p><strong>Spine:</strong> "+w.spine+"</p><p><strong>Big idea:</strong> "+w.big+"</p><p><strong>Participant reading:</strong> "+w.student+"</p><p><strong>In-room:</strong> "+w.focus.join("; ")+"</p><h3>Teaching moves</h3><ol>"+moves+"</ol><p class=\"read\"><strong>App moment:</strong> "+(w.app||"")+"</p><p class=\"question\"><strong>Guardrail:</strong> "+(w.guard||"")+"</p><p><strong>Response:</strong> "+(w.response||"")+"</p>";
  }
  sel.onchange = draw;
  draw();
}
boot();