function gw(ref){return "https://www.biblegateway.com/passage/?search="+encodeURIComponent(ref)+"&version=NIV";}
function vlink(label, ref){if(!ref) return label; return "<a class=ref href=\""+gw(ref)+"\" target=_blank rel=noopener>"+label+"</a>";}
let recap=null, selected=1, mapBuilt=false;
function weekData(n){return recap.weeks[String(n)];}
function show(n){
  selected=Number(n);
  const w=weekData(selected);
  document.querySelectorAll(".stop").forEach(function(el){el.classList.toggle("picked", Number(el.dataset.n)===selected);});
  const title=document.getElementById("week-title");
  const blurb=document.getElementById("week-blurb");
  const read=document.getElementById("week-read");
  read.href = window.BneiRoute ? BneiRoute.hrefFor({ view: "week", week: selected }) : ("week.html?week="+selected);
  if(!w){title.textContent="Week "+selected; blurb.textContent="Not mapped yet. The rail is waiting."; document.getElementById("flow").innerHTML=""; document.getElementById("words").innerHTML=""; document.getElementById("learned").innerHTML=""; return;}
  title.textContent="Week "+selected+": "+w.title;
  blurb.textContent=w.preview ? "Preview. Read it first. Come ready." : ("How that night moved" + (w.met ? " ("+w.met+")" : "."));
  const flow=document.getElementById("flow"); flow.innerHTML="";
  (w.path||[]).forEach(function(p){const el=document.createElement("div"); el.className="step"; el.innerHTML="<div class=dot></div><div class=body><strong>"+p.from+" → "+p.to+"</strong><div class=muted>"+vlink(p.text,p.ref)+"</div></div>"; flow.appendChild(el);});
  const words=document.getElementById("words"); words.innerHTML="";
  (w.words||[]).forEach(function(x){const el=document.createElement("div"); el.className="word"; el.innerHTML="<div class=he dir=rtl lang=he>"+x.he+"</div><div class=tr>"+x.tr+"</div><p class=en>"+x.en+"</p>"; words.appendChild(el);});
  const learned=document.getElementById("learned"); learned.innerHTML="";
  (w.learned||[]).forEach(function(x){const li=document.createElement("li"); li.textContent=x; learned.appendChild(li);});
}
async function boot(selectedWeek){
  if (!recap) recap=await (await fetch("recap.json")).json();
  selected = selectedWeek || recap.completed[recap.completed.length-1] || 1;
  if (!mapBuilt) {
    const rail=document.getElementById("rail");
    recap.spine.forEach(function(s){
      const d=document.createElement("button");
      d.type="button"; d.className="stop "+s.status; d.dataset.n=String(s.n);
      d.innerHTML="<span class=he dir=rtl lang=he>"+s.he+"</span><span class=en>"+s.label+"</span><span class=st>Week "+s.n+"</span>";
      d.title=s.title;
      d.addEventListener("click", function(){
        show(s.n);
        var route = { view: "map", week: s.n };
        if (window.BneiApp && BneiApp.go) BneiApp.go(route, true);
        else history.replaceState(null,"", window.BneiRoute ? BneiRoute.hrefFor(route) : ("?view=map&week="+s.n));
      });
      rail.appendChild(d);
    });
    document.getElementById("arc").innerHTML="<div class=box><b>Eden</b>Yahweh with his image-bearers. Tree of life open. A rebel strikes.</div><div class=arrow>→</div><div class=box><b>New earth</b>Yahweh with his restored family. Tree of life open. The serpent judged.</div>";
    mapBuilt = true;
  }
  show(selected);
}
window.BneiMap = { boot: boot, show: show };
