#!/usr/bin/env node
"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var root = path.join(__dirname, "..");
var publicDir = path.join(root, "public");
var docsDir = path.join(root, "docs");

function read(dir, file) {
  return fs.readFileSync(path.join(dir, file), "utf8");
}

function loadTeacherApi(dir) {
  var src = read(dir, "teacher.js");
  var sandbox = { module: { exports: {} }, exports: {}, console: console };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(src, sandbox, { filename: path.join(dir, "teacher.js") });
  return sandbox.module.exports.teacherOnlyHtml
    ? sandbox.module.exports
    : sandbox.BneiTeacher;
}

function loadTeacher(dir) {
  return loadTeacherApi(dir).teacherOnlyHtml;
}

["public", "docs"].forEach(function (copy) {
  var dir = copy === "public" ? publicDir : docsDir;
  var weeks = JSON.parse(read(dir, "weeks.json"));
  var week2 = weeks.find(function (w) { return w.n === 2; });
  var teacherJs = read(dir, "teacher.js");
  var styles = read(dir, "styles.css");
  var indexHtml = read(dir, "index.html");
  var weekPage = read(dir, "week.html");
  var appSrc = read(dir, "app.js");

  assert.ok(week2, copy + ": week 2 exists");
  assert.ok(Array.isArray(week2.teacherOnly) && week2.teacherOnly.length >= 7, copy + ": week 2 keeps teacherOnly blocks plus Qumran, translation origin, and canon pointer");

  var headings = week2.teacherOnly.map(function (b) { return b.h || ""; });
  assert.ok(headings.some(function (h) { return /Do not send this block to the group/i.test(h); }), copy + ": keep do-not-send heading");
  assert.ok(headings.some(function (h) { return /Two Lamechs/i.test(h); }), copy + ": keep two-Lamechs heading");
  assert.ok(headings.some(function (h) { return /WATCHER IN SCRIPTURE/i.test(h); }), copy + ": Watcher-in-Scripture heading");
  assert.ok(headings.some(function (h) { return /SHINING NOAH/i.test(h); }), copy + ": shining-Noah heading");
  assert.ok(headings.some(function (h) { return /QUMRAN AND ANCIENT TRANSLATIONS/i.test(h); }), copy + ": Qumran/translations heading");
  assert.ok(headings.some(function (h) { return /WHERE OUR CURRENT TRANSLATION COMES FROM/i.test(h); }), copy + ": translation-origin heading");
  assert.ok(headings.some(function (h) { return /FULL CANON AND VERSIONS BRIEF/i.test(h); }), copy + ": canon/versions pointer heading");
  assert.ok(headings.indexOf("WATCHER IN SCRIPTURE") < headings.findIndex(function (h) { return /QUMRAN/i.test(h); }), copy + ": Qumran block after existing Watcher notes");
  assert.ok(headings.findIndex(function (h) { return /QUMRAN/i.test(h); }) < headings.findIndex(function (h) { return /CURRENT TRANSLATION/i.test(h); }), copy + ": translation-origin follows Qumran");
  assert.ok(headings.findIndex(function (h) { return /CURRENT TRANSLATION/i.test(h); }) < headings.findIndex(function (h) { return /FULL CANON/i.test(h); }), copy + ": canon pointer follows translation-origin");

  var blob = JSON.stringify(week2.teacherOnly);
  assert.ok(blob.indexOf("עִיר") !== -1, copy + ": Aramaic Watcher word עִיר");
  assert.ok(blob.indexOf("עִירִין") !== -1, copy + ": Aramaic plural עִירִין");
  assert.ok(blob.indexOf("H5894") !== -1, copy + ": Strong’s H5894");
  assert.ok(blob.indexOf("Daniel 4:13") !== -1, copy + ": Daniel 4:13");
  assert.ok(blob.indexOf("Daniel 4:17") !== -1, copy + ": Daniel 4:17");
  assert.ok(blob.indexOf("Daniel 4:23") !== -1, copy + ": Daniel 4:23");
  assert.ok(blob.indexOf("4:10") !== -1 && blob.indexOf("4:14") !== -1 && blob.indexOf("4:20") !== -1, copy + ": MT/app numbering trap 4:10, 4:14, 4:20");
  assert.ok(/If you open the app to English 4:13 you will miss it/i.test(blob), copy + ": English 4:13 miss trap");
  assert.ok(/wrongly treats 1 Enoch as a second Hebrew-Bible Watcher/i.test(blob), copy + ": do not copy the app’s Enoch-as-Bible error");
  assert.ok(/Daniel 4 is the only biblical use of the word/i.test(blob), copy + ": Daniel 4 only biblical Watcher");
  assert.ok(blob.indexOf("עִיר וְקַדִּישׁ") !== -1, copy + ": Watcher and a holy one");
  assert.ok(blob.indexOf("בִּגְזֵרַת עִירִין") !== -1, copy + ": decree of the Watchers");
  assert.ok(blob.indexOf("בְּנֵי הָאֱלֹהִים") !== -1, copy + ": Genesis 6 phrase is not Watcher");
  assert.ok(blob.indexOf("Job 1:6") !== -1 && blob.indexOf("38:7") !== -1, copy + ": stack Job for bene ha-elohim");
  assert.ok(blob.indexOf("Jude 6") !== -1 && blob.indexOf("2 Peter 2:4") !== -1, copy + ": NT angels, not the Watcher-word");
  assert.ok(blob.indexOf("ἐγρήγοροι") !== -1, copy + ": Enoch’s Greek Watchers");
  assert.ok(/do not let Enoch baptize Daniel/i.test(blob), copy + ": do not baptize Daniel’s holy Watcher");
  assert.ok(/Those Watchers in Daniel 4 are holy/i.test(blob), copy + ": Daniel 4 Watchers are holy");

  assert.ok(blob.indexOf("1 Enoch 106") !== -1, copy + ": 1 Enoch 106 witness");
  assert.ok(blob.indexOf("1Q20") !== -1, copy + ": Genesis Apocryphon 1Q20");
  assert.ok(/Batenosh/i.test(blob), copy + ": Batenosh oath");
  assert.ok(/Dead Sea scroll/i.test(blob), copy + ": Qumran, not Ethiopic-only rumor");
  assert.ok(/Genesis does NOT say Noah/i.test(blob), copy + ": Genesis does not say the face shone");
  assert.ok(/cannot overrule Scripture/i.test(blob) || /cannot overrule Genesis/i.test(blob), copy + ": extra-biblical cannot overrule Scripture");
  assert.ok(/GroupMe/i.test(blob), copy + ": do not send in GroupMe");
  assert.ok(/land on 6:9/i.test(blob), copy + ": land on Genesis 6:9");
  assert.ok(/Sethite/i.test(blob), copy + ": fear only exists if sons of God are heavenly");
  assert.ok(/tamim/i.test(blob), copy + ": Noah tamim in his generations");

  assert.ok(/two piles/i.test(blob), copy + ": Qumran two piles");
  assert.ok(/Do not baptize pile two as Torah/i.test(blob), copy + ": do not baptize extra cave books");
  assert.ok(/Leningrad Codex/i.test(blob) && blob.indexOf("1008") !== -1, copy + ": Leningrad 1008");
  assert.ok(/We do not need Qumran to prove Genesis 6/i.test(blob), copy + ": Genesis 6 is not a DSS-vs-MT fight");
  assert.ok(/Do not retell it here/i.test(blob), copy + ": shining Noah stays in its own block");
  assert.ok(blob.indexOf("οἱ ἄγγελοι τοῦ θεοῦ") !== -1, copy + ": LXX angels of God at Gen 6:2");
  assert.ok(/Targums/i.test(blob) && /nobles/i.test(blob), copy + ": Targum flattening named, not followed");
  assert.ok(/Peshitta/i.test(blob) && /Vulgate/i.test(blob), copy + ": later versions are not the spine");
  assert.ok(/Deuteronomy 32:8/.test(blob) && /Do not teach Babel tonight/i.test(blob), copy + ": Deut 32:8 is next week");
  assert.ok(/how they read Moses, not Moses/i.test(blob), copy + ": extra books cannot overrule Moses");
  assert.ok(/Crossway ESV/i.test(blob), copy + ": name the English in their hands");
  assert.ok(/Ancient Texts Flow is KJV-keyed/i.test(blob), copy + ": Flow is KJV-keyed");
  assert.ok(/English is a CHECK, not the source/i.test(blob), copy + ": English is a check");
  assert.ok(/Tyndale/i.test(blob) && /Geneva/i.test(blob) && /KJV 1611/.test(blob), copy + ": Reformation English chain");
  assert.ok(/Bomberg/i.test(blob) && /Ben Hayyim/i.test(blob), copy + ": KJV OT from Rabbinic/Bomberg Hebrew");
  assert.ok(/Textus Receptus/i.test(blob), copy + ": KJV NT TR");
  assert.ok(/Biblia Hebraica Stuttgartensia/i.test(blob), copy + ": ESV OT is BHS/Leningrad");
  assert.ok(/Nestle-Aland/i.test(blob), copy + ": ESV NT NA");
  assert.ok(/grandchild of the Masoretic Hebrew/i.test(blob), copy + ": English is a grandchild of MT");
  assert.ok(/Never treat NIV, ESV, or KJV as equivalent to the Hebrew/i.test(blob), copy + ": English ≠ Hebrew");
  assert.ok(/Babel’s split already made every later tongue thinner/i.test(blob) || /Babel's split already made every later tongue thinner/i.test(blob), copy + ": later tongues are thinner");
  assert.ok(/Do not send this chain in GroupMe/i.test(blob), copy + ": translation chain stays off GroupMe");
  assert.ok(/FULL CANON AND VERSIONS BRIEF/.test(blob), copy + ": pointer block present");
  assert.ok(/teacher-week2-canon\.md/.test(blob), copy + ": pointer names the brief file");
  assert.ok(/Why these books \/ where English comes from/.test(blob), copy + ": pointer names the teacher heading");
  assert.ok(/Genesis 3:15/.test(blob) && /ipsa/.test(blob) && /ipse/.test(blob), copy + ": 3:15 Vulgate trap restored compact");
  assert.ok(/Nova Vulgata/.test(blob) && /Douay-Rheims/.test(blob), copy + ": Nova Vulgata and Douay named");
  assert.ok(/If time is short, say this/.test(blob), copy + ": oral script in teacherOnly");
  assert.ok(/Romans 11 still stands/.test(blob), copy + ": oral script keeps Romans 11");
  assert.ok(/Israel is not un-Jewed/.test(blob), copy + ": oral script blocks un-Jewing");

  var watcher = week2.teacherOnly.find(function (b) { return /WATCHER IN SCRIPTURE/i.test(b.h || ""); });
  var shining = week2.teacherOnly.find(function (b) { return /SHINING NOAH/i.test(b.h || ""); });
  var qumran = week2.teacherOnly.find(function (b) { return /QUMRAN AND ANCIENT TRANSLATIONS/i.test(b.h || ""); });
  var versions = week2.teacherOnly.find(function (b) { return /CURRENT TRANSLATION COMES FROM/i.test(b.h || ""); });
  assert.ok(watcher && shining, copy + ": both new blocks present");
  assert.ok(qumran && versions, copy + ": Qumran and translation-origin blocks present");
  assert.ok(!/EXTRA/i.test(String(watcher.label || "")), copy + ": Watcher block is not extra-biblical");
  assert.ok(/canonical/i.test(String(watcher.label || watcher.h)), copy + ": Watcher block labeled canonical");
  assert.strictEqual(String(shining.label).toUpperCase(), "EXTRA_BIBLICAL", copy + ": shining Noah labeled EXTRA_BIBLICAL");
  assert.ok(!/EXTRA/i.test(String(qumran.label || "")), copy + ": Qumran trust-rule is method, not extra-biblical lore");
  assert.ok(!/EXTRA/i.test(String(versions.label || "")), copy + ": translation-origin is method, not extra-biblical lore");
  assert.ok(/teacher method/i.test(String(qumran.label || "")), copy + ": Qumran block labeled teacher method");
  assert.ok(/English is a check/i.test(String(versions.label || "")), copy + ": translation block labeled English-as-check");

  var send = week2.teacherOnly.find(function (b) { return /Do not send this block/i.test(b.h || ""); });
  var lamechs = week2.teacherOnly.find(function (b) { return /Two Lamechs/i.test(b.h || ""); });
  assert.ok(send && /teacher-only color/i.test((send.p || []).join(" ")), copy + ": keep do-not-send body");
  assert.ok(lamechs && /Genesis 4:23-24/.test((lamechs.p || []).join(" ")), copy + ": keep Cain’s Lamech");
  assert.ok(/Genesis 5:28-31/.test((lamechs.p || []).join(" ")), copy + ": keep Seth’s Lamech");

  assert.ok(teacherJs.indexOf("source-label") !== -1, copy + ": teacher renderer prints source labels");
  assert.ok(teacherJs.indexOf("teacherOnlyHtml") !== -1, copy + ": teacherOnly renderer exists");
  assert.ok(teacherJs.indexOf("b.label") !== -1, copy + ": renderer reads block labels");
  assert.ok(/weeks\.json\?v=/.test(teacherJs), copy + ": cache-bust weeks.json on teacher fetch");

  assert.ok(styles.indexOf("--gold:#c9a24a") !== -1, copy + ": keep yellow-gold");
  assert.ok(styles.indexOf("--gold-soft:#e7c56a") !== -1, copy + ": keep gold-soft");
  assert.ok(styles.indexOf("#b85c38") === -1 && styles.indexOf("ember") === -1, copy + ": no ember palette");
  assert.ok(styles.indexOf(".teacher-only .source-label") !== -1, copy + ": source-label is styled");
  assert.ok(/\.teacher-only \.source-label[\s\S]{0,400}var\(--gold/.test(styles), copy + ": source-label uses gold");
  assert.ok(styles.indexOf(".teacher-only{") !== -1 && /border-left:4px solid var\(--gold\)/.test(styles), copy + ": teacher-only gold rail");

  var teacherApi = loadTeacherApi(dir);
  var teacherHtml = teacherApi.teacherOnlyHtml;
  assert.equal(typeof teacherHtml, "function", copy + ": teacherOnlyHtml is exportable");
  var rendered = teacherHtml(week2);
  assert.ok(rendered.indexOf("teacher-only") !== -1, copy + ": wraps teacher-only section");
  assert.ok(rendered.indexOf("עִיר") !== -1, copy + ": rendered Aramaic Watcher");
  assert.ok(rendered.indexOf("Daniel 4:13") !== -1, copy + ": rendered Daniel 4:13");
  assert.ok(rendered.indexOf("1Q20") !== -1, copy + ": rendered Apocryphon witness");
  assert.ok(rendered.indexOf("1 Enoch 106") !== -1, copy + ": rendered Enoch 106");
  assert.ok(/EXTRA_BIBLICAL/.test(rendered), copy + ": rendered EXTRA_BIBLICAL label");
  assert.ok(/canonical/i.test(rendered), copy + ": rendered canonical label");
  assert.ok(rendered.indexOf("source-label extra-biblical") !== -1, copy + ": extra-biblical class on shining block");
  assert.ok(rendered.indexOf("class=\"he\"") !== -1, copy + ": Aramaic wrapped for Hebrew font");
  assert.ok(rendered.indexOf("<script") === -1, copy + ": escaped teacher HTML");
  assert.ok(/QUMRAN AND ANCIENT TRANSLATIONS/i.test(rendered), copy + ": rendered Qumran heading");
  assert.ok(/WHERE OUR CURRENT TRANSLATION COMES FROM/i.test(rendered), copy + ": rendered translation-origin heading");
  assert.ok(rendered.indexOf("Leningrad Codex") !== -1, copy + ": rendered Leningrad");
  assert.ok(rendered.indexOf("οἱ ἄγγελοι τοῦ θεοῦ") !== -1, copy + ": rendered LXX Greek");
  assert.ok(/Deuteronomy 32:8/.test(rendered), copy + ": rendered Deut 32:8 as next week's case");
  assert.ok(/Biblia Hebraica Stuttgartensia/.test(rendered), copy + ": rendered BHS");
  assert.ok(/teacher method/.test(rendered), copy + ": rendered method labels");
  assert.ok(/FULL CANON AND VERSIONS BRIEF/.test(rendered), copy + ": rendered canon pointer heading");
  assert.ok(/Why these books \/ where English comes from/.test(rendered), copy + ": Week 2 surfaces canon/versions door");
  assert.ok(rendered.indexOf("teacher-week2-canon.md") !== -1, copy + ": teacher view links the markdown brief");
  assert.ok(rendered.indexOf("canon-brief") !== -1, copy + ": expandable canon brief on Week 2");
  assert.ok(teacherJs.indexOf("teacher-week2-canon.md") !== -1, copy + ": teacher.js loads the markdown brief");
  assert.ok(teacherJs.indexOf("mdToHtml") !== -1, copy + ": markdown renderer exists");
  assert.equal(typeof teacherApi.mdToHtml, "function", copy + ": mdToHtml is exportable");

  var week1 = weeks.find(function (w) { return w.n === 1; });
  var week1Html = teacherHtml(week1 || {});
  assert.ok(week1Html.indexOf("teacher-week2-canon.md") === -1, copy + ": canon brief is Week 2 only");

  var mdPath = path.join(dir, "teacher-week2-canon.md");
  assert.ok(fs.existsSync(mdPath), copy + ": teacher-week2-canon.md exists");
  var md = fs.readFileSync(mdPath, "utf8");
  assert.ok(md.split(/\s+/).filter(Boolean).length > 2500, copy + ": brief is headed meat, not a card");
  [
    "Teacher only",
    "Genesis 3:15",
    "zera",
    "ipsa",
    "ipse",
    "Nova Vulgata",
    "Douay-Rheims",
    "autos",
    "Tanakh",
    "Tobit",
    "Judith",
    "Sirach",
    "Baruch",
    "Maccabees",
    "Trent",
    "Athanasius",
    "Festal",
    "Hippo",
    "Carthage",
    "two piles",
    "1Q20",
    "Jubilees",
    "Ethiopian",
    "Daniel 4",
    "Alexandrinus",
    "Onkelos",
    "H430",
    "Aleppo",
    "Leningrad",
    "Tyndale",
    "Geneva",
    "Bomberg",
    "Ben Hayyim",
    "Textus Receptus",
    "Crossway",
    "Nestle-Aland",
    "4QDeut",
    "Romans 11"
  ].forEach(function (needle) {
    assert.ok(md.indexOf(needle) !== -1, copy + ": brief keeps " + needle);
  });
  assert.ok(/Do not say Catholics added books in the Middle Ages/i.test(md), copy + ": do not smear the deuterocanon timeline");
  assert.ok(/KJV 1611 printed the Apocrypha/i.test(md) || /1611 King James printed the Apocrypha/i.test(md), copy + ": 1611 Apocrypha between testaments");
  assert.ok(/Revelation 2:9 or 3:9/.test(md), copy + ": do not un-Jew from Rev 2:9/3:9");
  assert.ok(!/Wyatt/i.test(md), copy + ": no Ron Wyatt");
  assert.ok(!/fossil/i.test(md), copy + ": no fossils");
  assert.ok(!/Esther-is-dubious/i.test(md) && !/Esther is dubious/i.test(md), copy + ": no Esther-is-dubious");
  assert.ok(!/breath-sound/i.test(md) && !/breath sound of the Name/i.test(md), copy + ": no breath-sound-of-the-Name");
  var beats = md.match(/^## /gm) || [];
  assert.ok(beats.length === 9, copy + ": nine headed beats, got " + beats.length);
  var renderedMd = teacherApi.mdToHtml(md);
  assert.ok(renderedMd.indexOf("<h3>") !== -1, copy + ": markdown beats render");
  assert.ok(renderedMd.indexOf("ipsa") !== -1, copy + ": rendered brief keeps ipsa");
  assert.ok(renderedMd.indexOf("<script") === -1, copy + ": escaped canon markdown");
  assert.ok(renderedMd.indexOf("class=\"he\"") !== -1, copy + ": Hebrew wrapped in canon brief");

  var homeStart = indexHtml.indexOf('id="view-home"');
  var weekStart = indexHtml.indexOf('id="view-week"');
  assert.ok(homeStart !== -1 && weekStart !== -1, copy + ": home and week views exist");
  var home = indexHtml.slice(homeStart, weekStart);
  [
    "1Q20",
    "Genesis Apocryphon",
    "Batenosh",
    "EXTRA_BIBLICAL",
    "עִיר",
    "ἐγρήγοροι",
    "Daniel 4:13",
    "1 Enoch 106",
    "teacherOnly",
    "shining",
    "Leningrad",
    "Tyndale",
    "Crossway",
    "Nestle-Aland",
    "Bomberg",
    "Stuttgartensia",
    "Peshitta"
  ].forEach(function (needle) {
    assert.ok(home.toLowerCase().indexOf(needle.toLowerCase()) === -1, copy + ": student home must not contain " + needle);
  });
  assert.ok(home.indexOf("teacher-week2-canon") === -1, copy + ": student home has no canon brief");
  assert.ok(home.indexOf("ipsa") === -1, copy + ": student home has no Vulgate ipsa");

  assert.ok(weekPage.indexOf("1Q20") === -1, copy + ": week.html shim has no Apocryphon");
  assert.ok(weekPage.indexOf("teacherOnly") === -1, copy + ": week.html shim has no teacherOnly");
  assert.ok(weekPage.indexOf("עִיר") === -1, copy + ": week.html shim has no Aramaic Watcher");
  assert.ok(appSrc.indexOf("teacherOnly") === -1, copy + ": student renderer never reads teacherOnly");
  assert.ok(appSrc.indexOf("1Q20") === -1, copy + ": app.js has no Apocryphon");
  assert.ok(appSrc.indexOf("EXTRA_BIBLICAL") === -1, copy + ": app.js has no EXTRA_BIBLICAL");

  var studentBlob = JSON.stringify({
    student: week2.student,
    observe: week2.observe,
    reader: week2.reader,
    question: week2.question,
    focus: week2.focus
  });
  assert.ok(studentBlob.indexOf("1Q20") === -1, copy + ": student week fields have no 1Q20");
  assert.ok(studentBlob.indexOf("Batenosh") === -1, copy + ": student week fields have no Batenosh");
  assert.ok(studentBlob.indexOf("עִיר") === -1, copy + ": student week fields have no Daniel Watcher lemma");
  assert.ok(studentBlob.indexOf("EXTRA_BIBLICAL") === -1, copy + ": student week fields have no EXTRA_BIBLICAL");
  assert.ok(!/Enoch 106/.test(studentBlob), copy + ": student week fields have no Enoch 106");
  [
    "Leningrad",
    "Tyndale",
    "Crossway",
    "Nestle-Aland",
    "Bomberg",
    "Stuttgartensia",
    "Textus Receptus",
    "Peshitta",
    "Vulgate",
    "οἱ ἄγγελοι"
  ].forEach(function (needle) {
    assert.ok(studentBlob.indexOf(needle) === -1, copy + ": student week fields have no versions lecture (" + needle + ")");
  });
  assert.ok(studentBlob.indexOf("ipsa") === -1, copy + ": student week fields have no Vulgate ipsa");
  assert.ok(studentBlob.indexOf("teacher-week2-canon") === -1, copy + ": student week fields have no canon brief file");
  assert.ok(weekPage.indexOf("teacher-week2-canon") === -1, copy + ": week.html shim has no canon brief");
  assert.ok(appSrc.indexOf("teacher-week2-canon") === -1, copy + ": app.js never loads the teacher brief");
  assert.ok(!/1Q20/.test(studentBlob), copy + ": student observe stays off 1Q20");
  assert.ok((week2.observe || []).filter(function (line) {
    return /desert/.test(line) || /cave books/.test(line);
  }).length <= 1, copy + ": at most one thin desert-copies observe");

  var week3 = weeks.find(function (w) { return w.n === 3; });
  assert.ok(week3, copy + ": week 3 exists");
  assert.ok((week3.observe || []).some(function (line) {
    return /Deuteronomy 32:8-9/.test(line) && /DSS\/LXX/.test(line);
  }), copy + ": leave Week 3 student DSS/LXX observe as-is");
});

console.log("teacher-only week 2 tests passed");
