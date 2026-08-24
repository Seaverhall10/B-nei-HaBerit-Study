const escapeMap = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const gateway = (ref) => `https://www.biblegateway.com/passage/?search=${encodeURIComponent(ref)}&version=NIV`;
const linked = (label, ref) => ref ? `<a class="ref" href="${gateway(ref)}" target="_blank" rel="noopener">${escapeMap(label)}</a>` : escapeMap(label);
let recap = null;
let selected = 1;

function weekData(number) { return recap.weeks[String(number)]; }
function statusLabel(station) { return station.status === "done" ? "Completed together" : station.status === "next" ? "Current week" : "Ahead"; }

function show(number, scroll = false) {
  selected = Math.max(1, Math.min(12, Number(number)));
  const week = weekData(selected);
  document.querySelectorAll(".stop").forEach((button) => {
    const chosen = Number(button.dataset.n) === selected;
    button.classList.toggle("picked", chosen);
    button.setAttribute("aria-pressed", String(chosen));
    if (chosen && scroll) button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
  document.querySelector("#map-previous").disabled = selected === 1;
  document.querySelector("#map-next").disabled = selected === 12;
  document.querySelector("#week-read").href = `index.html?week=${selected}`;
  const station = recap.spine.find((item) => item.n === selected);
  document.querySelector("#week-state").textContent = statusLabel(station);
  document.querySelector("#week-title").textContent = week ? `Week ${selected}: ${week.title}` : `Week ${selected}: ${station.title}`;
  document.querySelector("#week-blurb").textContent = week ? (week.preview ? "Preview. Read Scripture first and come ready." : `How the study moved${week.met ? ` (${week.met})` : ""}.`) : "This station is ahead. Its full map will open after the group reaches it.";
  document.querySelector("#flow").innerHTML = week ? (week.path || []).map((step) => `<div class="step"><div class="dot"></div><div class="body"><b class="evidence evidence-b">Connection</b><strong>${escapeMap(step.from)} → ${escapeMap(step.to)}</strong><div class="muted">${linked(step.text, step.ref)}</div></div></div>`).join("") : "";
  document.querySelector("#words").innerHTML = week ? (week.words || []).map((word) => `<article class="word"><div class="he" dir="rtl" lang="he">${escapeMap(word.he)}</div><div class="tr">${escapeMap(word.tr)}</div><p class="en">${escapeMap(word.en)}</p></article>`).join("") : `<p>This week’s words will appear after the group reaches this station.</p>`;
  document.querySelector("#learned").innerHTML = week ? (week.learned || []).map((claim) => `<li>${escapeMap(typeof claim === "string" ? claim : claim.text)}</li>`).join("") : `<li>This station has not been mapped together yet.</li>`;
  history.replaceState(null, "", `${location.pathname}?week=${selected}`);
}

async function boot() {
  recap = await fetch("recap.json").then((response) => response.json());
  const query = Number(new URLSearchParams(location.search).get("week"));
  selected = query >= 1 && query <= 12 ? query : (recap.currentWeek || 1);
  const rail = document.querySelector("#rail");
  recap.spine.forEach((station) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `stop ${station.status}`;
    button.dataset.n = String(station.n);
    button.setAttribute("aria-label", `Week ${station.n}, ${station.label}, ${statusLabel(station)}`);
    button.innerHTML = `<span class="he" dir="rtl" lang="he">${escapeMap(station.he)}</span><span class="en">${escapeMap(station.label)}</span><span class="st">Week ${station.n}</span>`;
    button.addEventListener("click", () => show(station.n));
    rail.appendChild(button);
  });
  document.querySelector("#map-previous").addEventListener("click", () => show(selected - 1, true));
  document.querySelector("#map-next").addEventListener("click", () => show(selected + 1, true));
  document.querySelector("#arc").innerHTML = `<div class="box"><b>Eden</b>Yahweh with his image-bearers. Tree of life open. A rebel strikes.</div><div class="arrow" aria-hidden="true">→</div><div class="box"><b>New earth</b>Yahweh with his restored family. Tree of life open. The serpent judged.</div>`;
  show(selected, true);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
}

boot().catch((error) => { document.querySelector("#week-blurb").textContent = "The story map could not load. Please refresh."; console.error(error); });
