async function boot(){
  const recap = await (await fetch("recap.json")).json();
  const rail = document.getElementById("rail");
  recap.spine.forEach(function(s){
    const d = document.createElement("div");
    d.className = "stop " + s.status;
    d.innerHTML = "<span class=he>"+s.he+"</span><span class=en>"+s.label+"</span><span class=st>Week "+s.n+"</span>";
    d.title = s.title;
    rail.appendChild(d);
  });
  const flow = document.getElementById("flow");
  recap.week1.path.forEach(function(p){
    const el = document.createElement("div");
    el.className = "step";
    el.innerHTML = "<div class=dot></div><div class=body><strong>"+p.from+" → "+p.to+"</strong><div class=muted>"+p.text+"</div></div>";
    flow.appendChild(el);
  });
  const words = document.getElementById("words");
  recap.week1.words.forEach(function(w){
    const el = document.createElement("div");
    el.className = "word";
    el.innerHTML = "<div class=he>"+w.he+"</div><div class=tr>"+w.tr+"</div><p class=en>"+w.en+"</p>";
    words.appendChild(el);
  });
  const learned = document.getElementById("learned");
  recap.week1.learned.forEach(function(x){
    const li = document.createElement("li");
    li.textContent = x;
    learned.appendChild(li);
  });
  document.getElementById("arc").innerHTML = "<div class=box><b>Eden</b>Yahweh with his image-bearers. Tree of life open. A rebel strikes.</div><div class=arrow>→</div><div class=box><b>New earth</b>Yahweh with his restored family. Tree of life open. The serpent judged.</div>";
}
boot();