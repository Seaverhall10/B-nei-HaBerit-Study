const STORAGE = {
  checks: "bnei-reading-checks",
  notes: "bnei-study-notes",
  lastWeek: "bnei-last-week"
};

let weeks = [];
let recap = null;
let scripture = null;
let selectedWeek = 1;

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function readStore(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}

function writeStore(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { setStatus("This browser could not save your change."); }
}

function bibleGateway(reference, version) {
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=${version}`;
}

function focusText(week) {
  return Array.isArray(week.focus) ? week.focus.join("; ") : week.focus;
}

function setStatus(message) {
  $("#action-status").textContent = message;
}

function completedCount() {
  const checks = readStore(STORAGE.checks, {});
  return weeks.filter((week) => checks[String(week.n)]).length;
}

function updateProgress() {
  const count = completedCount();
  $("#progress-bar").value = count;
  $("#progress-text").textContent = `${count} of ${weeks.length} readings complete`;
}

function passagesFor(week) {
  return scripture?.weeks?.[String(week.n)] || [];
}

function renderPassage(passage) {
  const verses = passage.verses.map((verse) => `
    <p class="verse"><sup>${escapeHtml(verse.n)}</sup>${escapeHtml(verse.text)}</p>`).join("");
  return `
    <details class="scripture-passage" open>
      <summary>${escapeHtml(passage.reference)} <span>World English Bible</span></summary>
      <div class="verse-text">${verses}</div>
    </details>`;
}

function evidenceKey() {
  return `
    <aside class="evidence-key" aria-label="How statements are labeled">
      <strong>How to read this study</strong>
      <span><b class="evidence evidence-a">Text</b> directly stated in the passage</span>
      <span><b class="evidence evidence-b">Connection</b> links passages together</span>
      <span><b class="evidence evidence-study">Study conclusion</b> our source-checked interpretation</span>
    </aside>`;
}

function renderWeek(number, { focus = true } = {}) {
  const week = weeks.find((item) => item.n === Number(number));
  if (!week) return;
  selectedWeek = week.n;
  writeStore(STORAGE.lastWeek, selectedWeek);
  const checks = readStore(STORAGE.checks, {});
  const notes = readStore(STORAGE.notes, {});
  const note = notes[String(week.n)] || { observation: "", question: "" };
  const passages = passagesFor(week);
  const completed = Boolean(checks[String(week.n)]);
  const alreadyMet = week.alreadyMet
    ? `<p class="already-met"><strong>Already encountered:</strong> ${escapeHtml(typeof week.alreadyMet === "string" ? week.alreadyMet : "These themes were introduced in the group study.")}</p>`
    : "";

  $("#week").innerHTML = `
    <header class="week-head">
      <span class="number" aria-hidden="true">${week.n}</span>
      <div><p class="eyebrow">Week ${week.n} of ${weeks.length}</p><h2>${escapeHtml(week.title)}</h2><p class="theme">${escapeHtml(week.theme)}</p></div>
    </header>
    <section aria-labelledby="read-heading">
      <h3 id="read-heading"><b class="evidence evidence-a">Text</b> 1. Read the Scripture</h3>
      <p class="read"><strong>This week:</strong> ${escapeHtml(focusText(week))}</p>
      ${passages.map(renderPassage).join("") || "<p>Open the linked passage below to read this week’s Scripture.</p>"}
      <p class="translation-links">Compare: <a href="${bibleGateway(focusText(week), "NIV")}" target="_blank" rel="noopener">NIV</a> · <a href="${bibleGateway(focusText(week), "NASB")}" target="_blank" rel="noopener">NASB</a></p>
    </section>
    <section aria-labelledby="notice-heading">
      <h3 id="notice-heading">2. Notice the movement</h3>
      <p><b class="evidence evidence-b">Connection</b> ${escapeHtml(week.spine)}</p>
      <p class="question"><b class="evidence evidence-study">Study conclusion</b> <strong>Big idea:</strong> ${escapeHtml(week.big)}</p>
      ${alreadyMet}
      <ul class="notice-list">${week.observe.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <section aria-labelledby="discuss-heading">
      <h3 id="discuss-heading">3. Bring this to the table</h3>
      <p><strong>Wider reading:</strong> ${escapeHtml(week.student)}</p>
      <p><strong>Discuss:</strong> ${escapeHtml(week.question)}</p>
      <p><strong>Live it:</strong> ${escapeHtml(week.app)}</p>
      ${week.guard ? `<p class="guard"><strong>Guardrail:</strong> ${escapeHtml(week.guard)}</p>` : ""}
      ${week.response ? `<p><strong>Response:</strong> ${escapeHtml(week.response)}</p>` : ""}
    </section>
    ${evidenceKey()}
    <section class="study-notes" aria-labelledby="notes-heading">
      <h3 id="notes-heading">Your preparation</h3>
      <label for="observation">One thing you noticed
        <textarea id="observation" rows="3" placeholder="Write an observation…">${escapeHtml(note.observation)}</textarea>
      </label>
      <label for="question">One honest question
        <textarea id="question" rows="3" placeholder="Write the question you want to bring…">${escapeHtml(note.question)}</textarea>
      </label>
      <p class="local-note">Private to this browser; it is not sent to a server.</p>
    </section>
    <label class="completion"><input type="checkbox" id="week-complete" ${completed ? "checked" : ""}> <span>I finished this week’s reading</span></label>`;

  $("#week").setAttribute("aria-busy", "false");
  $("#pick").value = String(week.n);
  $("#previous-week").disabled = week.n === 1;
  $("#next-week").disabled = week.n === weeks.length;
  history.replaceState(null, "", `${location.pathname}?week=${week.n}`);
  bindWeekInputs();
  updateProgress();
  if (focus) $("#week").focus({ preventScroll: true });
}

function bindWeekInputs() {
  $("#week-complete").addEventListener("change", (event) => {
    const checks = readStore(STORAGE.checks, {});
    checks[String(selectedWeek)] = event.target.checked;
    writeStore(STORAGE.checks, checks);
    updateProgress();
    setStatus(event.target.checked ? `Week ${selectedWeek} marked complete.` : `Week ${selectedWeek} marked incomplete.`);
  });
  ["observation", "question"].forEach((field) => {
    $("#" + field).addEventListener("input", (event) => {
      const notes = readStore(STORAGE.notes, {});
      notes[String(selectedWeek)] = notes[String(selectedWeek)] || {};
      notes[String(selectedWeek)][field] = event.target.value;
      writeStore(STORAGE.notes, notes);
      setStatus("Note saved on this device.");
    });
  });
}

function chooseInitialWeek() {
  const query = Number(new URLSearchParams(location.search).get("week"));
  const remembered = Number(readStore(STORAGE.lastWeek, 0));
  const current = Number(recap?.currentWeek || 1);
  return [query, remembered, current, 1].find((n) => weeks.some((week) => week.n === n));
}

async function copyWeekLink() {
  const url = new URL(location.href);
  url.searchParams.set("week", selectedWeek);
  try {
    await navigator.clipboard.writeText(url.toString());
    setStatus(`Week ${selectedWeek} link copied.`);
  } catch {
    window.prompt("Copy this week link:", url.toString());
  }
}

async function boot() {
  try {
    [weeks, recap, scripture] = await Promise.all([
      fetch("weeks.json").then((response) => response.json()),
      fetch("recap.json").then((response) => response.json()),
      fetch("scripture_focus.json").then((response) => response.json())
    ]);
    weeks.forEach((week) => {
      const option = document.createElement("option");
      option.value = week.n;
      option.textContent = `Week ${week.n} — ${week.title}`;
      $("#pick").appendChild(option);
    });
    $("#pick").addEventListener("change", (event) => renderWeek(event.target.value));
    $("#previous-week").addEventListener("click", () => renderWeek(selectedWeek - 1));
    $("#next-week").addEventListener("click", () => renderWeek(selectedWeek + 1));
    $("#copy-link").addEventListener("click", copyWeekLink);
    renderWeek(chooseInitialWeek(), { focus: false });
  } catch (error) {
    $("#week").innerHTML = `<h2>We could not load the study</h2><p>Please refresh the page. If the problem continues, report that the study files did not load.</p>`;
    $("#week").setAttribute("aria-busy", "false");
    console.error(error);
  }
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

boot();
