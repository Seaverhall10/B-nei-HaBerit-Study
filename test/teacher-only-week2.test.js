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
  assert.ok(Array.isArray(week2.teacherOnly) && week2.teacherOnly.length >= 8, copy + ": week 2 keeps teacherOnly blocks plus Qumran, LXX witness, translation origin, and canon pointer");

  var headings = week2.teacherOnly.map(function (b) { return b.h || ""; });
  assert.ok(headings.some(function (h) { return /Do not send this block to the group/i.test(h); }), copy + ": keep do-not-send heading");
  assert.ok(headings.some(function (h) { return /Two Lamechs/i.test(h); }), copy + ": keep two-Lamechs heading");
  assert.ok(headings.some(function (h) { return /WATCHER IN SCRIPTURE/i.test(h); }), copy + ": Watcher-in-Scripture heading");
  assert.ok(headings.some(function (h) { return /SHINING NOAH/i.test(h); }), copy + ": shining-Noah heading");
  assert.ok(headings.some(function (h) { return /QUMRAN AND ANCIENT TRANSLATIONS/i.test(h); }), copy + ": Qumran/translations heading");
  assert.ok(headings.some(function (h) { return /LXX WITNESS/i.test(h); }), copy + ": LXX witness heading");
  assert.ok(headings.some(function (h) { return /WHERE OUR CURRENT TRANSLATION COMES FROM/i.test(h); }), copy + ": translation-origin heading");
  assert.ok(headings.some(function (h) { return /FULL CANON AND VERSIONS BRIEF/i.test(h); }), copy + ": canon/versions pointer heading");
  assert.ok(headings.indexOf("WATCHER IN SCRIPTURE") < headings.findIndex(function (h) { return /QUMRAN/i.test(h); }), copy + ": Qumran block after existing Watcher notes");
  assert.ok(headings.findIndex(function (h) { return /QUMRAN/i.test(h); }) < headings.findIndex(function (h) { return /LXX WITNESS/i.test(h); }), copy + ": LXX witness follows Qumran");
  assert.ok(headings.findIndex(function (h) { return /LXX WITNESS/i.test(h); }) < headings.findIndex(function (h) { return /CURRENT TRANSLATION/i.test(h); }), copy + ": translation-origin follows LXX witness");
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
  assert.ok(blob.indexOf("ὁ διάβολος") !== -1, copy + ": Job 1:6 LXX has ὁ διάβολος");
  assert.ok(blob.indexOf("הַשָּׂטָן") !== -1, copy + ": Greek is not a rewrite of הַשָּׂטָן");
  assert.ok(/Job 38:7 LXX is NOT the MT pair/i.test(blob), copy + ": Job 38:7 LXX is not the MT pair");
  assert.ok(/when the stars were made/i.test(blob) && /all my angels praised me/i.test(blob), copy + ": Job 38:7 LXX wording");
  assert.ok(/Do not teach that verse off the Greek as if it matches/i.test(blob), copy + ": do not teach Job 38:7 off the Greek as if it matches");
  assert.ok(/Göttingen/.test(blob) && /Rahlfs/.test(blob), copy + ": Göttingen/Rahlfs named at Gen 6:2");
  assert.ok(blob.indexOf("υἱοὶ τοῦ θεοῦ") !== -1, copy + ": Göttingen/Rahlfs prints υἱοὶ τοῦ θεοῦ");
  assert.ok(/not the whole LXX/i.test(blob), copy + ": angels-of-God is not the whole LXX");
  assert.ok(/Philo/.test(blob) && /Josephus/.test(blob), copy + ": A/Philo/Josephus variant named");
  assert.ok(/Do not flatten to Sethites/i.test(blob), copy + ": do not flatten Gen 6 to Sethites");
  assert.ok(/Do not put Watcher on Genesis 6/i.test(blob), copy + ": do not put Watcher on Genesis 6");
  assert.ok(/Greek Genesis has no/.test(blob), copy + ": Greek Genesis has no ἐγρήγοροι");
  assert.ok(blob.indexOf("γίγαντες") !== -1, copy + ": Gen 6:4 γίγαντες");
  assert.ok(blob.indexOf("נפלים") !== -1 && blob.indexOf("גברים") !== -1, copy + ": γίγαντες covers נפלים and גברים");
  assert.ok(/\[C\] 1 Enoch stays labeled extra-biblical/.test(blob), copy + ": 1 Enoch stays extra-biblical / [C]");
  assert.ok(/do not mash into student Flow/i.test(blob), copy + ": do not mash LXX into student Flow");
  assert.ok(/Job-page wording/.test(blob), copy + ": student English is the Job-page wording");
  assert.ok(!/study site reader has used Crossway ESV/i.test(blob), copy + ": do not claim the study site reader used ESV");
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
  var lxx = week2.teacherOnly.find(function (b) { return /LXX WITNESS/i.test(b.h || ""); });
  var versions = week2.teacherOnly.find(function (b) { return /CURRENT TRANSLATION COMES FROM/i.test(b.h || ""); });
  assert.ok(watcher && shining, copy + ": both new blocks present");
  assert.ok(qumran && versions, copy + ": Qumran and translation-origin blocks present");
  assert.ok(lxx, copy + ": LXX witness block present");
  assert.ok(!/EXTRA/i.test(String(watcher.label || "")), copy + ": Watcher block is not extra-biblical");
  assert.ok(/canonical/i.test(String(watcher.label || watcher.h)), copy + ": Watcher block labeled canonical");
  assert.strictEqual(String(shining.label).toUpperCase(), "EXTRA_BIBLICAL", copy + ": shining Noah labeled EXTRA_BIBLICAL");
  assert.ok(!/EXTRA/i.test(String(qumran.label || "")), copy + ": Qumran trust-rule is method, not extra-biblical lore");
  assert.ok(!/EXTRA/i.test(String(versions.label || "")), copy + ": translation-origin is method, not extra-biblical lore");
  assert.ok(!/EXTRA/i.test(String(lxx.label || "")), copy + ": Job LXX is a witness, not extra-biblical lore");
  assert.ok(/LXX witness/i.test(String(lxx.label || "")), copy + ": LXX block labeled LXX witness");
  assert.ok(/\[C\]/.test(String(lxx.label || "")), copy + ": LXX label marks [C] on Genesis 6 readings");
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
  assert.ok(/LXX WITNESS/.test(rendered), copy + ": rendered LXX witness heading");
  assert.ok(rendered.indexOf("ὁ διάβολος") !== -1, copy + ": rendered Job 1:6 διάβολος");
  assert.ok(rendered.indexOf("υἱοὶ τοῦ θεοῦ") !== -1, copy + ": rendered Göttingen/Rahlfs sons of God");
  assert.ok(rendered.indexOf("γίγαντες") !== -1, copy + ": rendered γίγαντες");
  assert.ok(/Göttingen/.test(rendered) && /Rahlfs/.test(rendered), copy + ": rendered Göttingen/Rahlfs");
  assert.ok(/Job-page wording/.test(rendered), copy + ": rendered Job-page wording, not ESV");
  assert.ok(rendered.indexOf("study site reader has used Crossway ESV") === -1, copy + ": rendered teacher copy does not claim ESV on the reader");
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
  assert.ok(week1Html.indexOf("LXX WITNESS") === -1, copy + ": LXX witness is Week 2 only");

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
    "Göttingen",
    "Rahlfs",
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
  assert.ok(!/study site reader has used Crossway ESV/i.test(md), copy + ": brief does not claim the reader used ESV");
  assert.ok(/Job-page wording/i.test(md), copy + ": brief names Job-page wording");
  assert.ok(md.indexOf("ὁ διάβολος") !== -1, copy + ": brief keeps Job 1:6 διάβολος");
  assert.ok(/Job 38:7 LXX is NOT the MT pair/i.test(md), copy + ": brief keeps Job 38:7 mismatch");
  assert.ok(md.indexOf("υἱοὶ τοῦ θεοῦ") !== -1 && md.indexOf("γίγαντες") !== -1, copy + ": brief keeps Gen 6 Greek");
  assert.ok(/\[C\] 1 Enoch stays labeled extra-biblical/.test(md), copy + ": brief keeps Enoch as extra-biblical / [C]");
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
    "Peshitta",
    "Göttingen",
    "Rahlfs",
    "γίγαντες",
    "διάβολος",
    "LXX WITNESS",
    "Job-page wording"
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
    "οἱ ἄγγελοι",
    "Göttingen",
    "Rahlfs",
    "γίγαντες",
    "διάβολος",
    "υἱοὶ τοῦ θεοῦ"
  ].forEach(function (needle) {
    assert.ok(studentBlob.indexOf(needle) === -1, copy + ": student week fields have no versions lecture (" + needle + ")");
  });
  assert.ok(studentBlob.indexOf("ipsa") === -1, copy + ": student week fields have no Vulgate ipsa");
  assert.ok(studentBlob.indexOf("teacher-week2-canon") === -1, copy + ": student week fields have no canon brief file");
  assert.ok(weekPage.indexOf("teacher-week2-canon") === -1, copy + ": week.html shim has no canon brief");
  assert.ok(appSrc.indexOf("teacher-week2-canon") === -1, copy + ": app.js never loads the teacher brief");
  assert.ok(appSrc.indexOf("teacher-questions") === -1, copy + ": app.js never loads Deep Questions");
  assert.ok(weekPage.indexOf("Deep Questions") === -1, copy + ": week.html shim has no Deep Questions");
  assert.ok(weekPage.indexOf("teacher-questions") === -1, copy + ": week.html shim has no questions tracker");
  assert.ok(home.indexOf("Deep Questions") === -1, copy + ": student home has no Deep Questions");
  assert.ok(home.indexOf("Timing of the fall event") === -1, copy + ": student home has no fall-timing card");
  assert.ok(home.indexOf("Ezekiel 28") === -1, copy + ": student home has no Ezekiel 28 dump");
  assert.ok(home.indexOf("Hollywood timeline") === -1, copy + ": student home has no Hollywood-timeline note");
  assert.ok(home.indexOf("Acts 21") === -1, copy + ": student home has no Acts 21 dump");
  assert.ok(home.indexOf("why Paul takes the vow") === -1, copy + ": student home has no Paul-vow card");
  assert.ok(home.indexOf("Big Board") === -1, copy + ": student home has no Big Board");
  assert.ok(home.indexOf("salvationIssue") === -1, copy + ": student home has no salvationIssue dump");

  var qPath = path.join(dir, "teacher-questions.json");
  assert.ok(fs.existsSync(qPath), copy + ": teacher-questions.json exists");
  var qPack = JSON.parse(fs.readFileSync(qPath, "utf8"));
  assert.ok(Array.isArray(qPack.questions) && qPack.questions.length >= 2, copy + ": Deep Questions tracker has items");
  var fall = qPack.questions[0];
  assert.strictEqual(fall.id, "fall-timing", copy + ": first card is fall-timing");
  assert.strictEqual(fall.title, "Timing of the fall event", copy + ": fall-timing title");
  assert.strictEqual(String(fall.status).toLowerCase(), "open", copy + ": fall timing stays open");
  assert.ok(/Week 1/.test(fall.firstRaised) && /2026-08-23/.test(fall.firstRaised), copy + ": raised Week 1 session 2026-08-23");
  var hold = (fall.scriptureHold || []).join(" ");
  assert.ok(/Ezekiel 28:12-19/.test(hold), copy + ": hold Ezekiel 28:12-19");
  assert.ok(/Isaiah 14/.test(hold), copy + ": hold Isaiah 14 as the fall song");
  assert.ok(/Tyre/.test(hold), copy + ": Tyre stacking labeled");
  assert.ok(/Genesis 3/.test(hold) && /3:24/.test(hold) && /SETTLED/.test(hold), copy + ": 3:24 new cherubim is settled");
  assert.ok(/Job 1:6/.test(hold) && /2:1/.test(hold), copy + ": Job court access after Eden");
  assert.ok(/God cannot be near sin/.test(hold), copy + ": do not flatten holiness into Job-is-impossible");
  assert.ok(/Do not lock a date/.test(fall.notLocking), copy + ": do not lock a date");
  assert.ok(/Hollywood timeline/.test(fall.notLocking) || /Hollywood timeline/.test(fall.tension), copy + ": no Hollywood timeline");
  assert.ok((fall.options || []).length >= 2, copy + ": both options on the table");
  assert.ok(/Already fallen/.test(fall.options[0]), copy + ": option A already fallen");
  assert.ok(/iniquity was found/.test(fall.options[1]) || /guardian post/.test(fall.options[1]), copy + ": option B garden is the moment");
  var qNotes = (fall.notes || []).join(" ");
  assert.ok(/EXTRA_BIBLICAL/.test(qNotes), copy + ": Enoch stays labeled");
  assert.ok(/200 Watchers/.test(qNotes) || /third of the stars/.test(qNotes), copy + ": Enoch stars/Watchers named as extra");
  assert.ok(/Do not mash Lucifer/.test(qNotes), copy + ": do not mash Lucifer’s fall with Genesis 6");
  ["salvationIssue", "inScripture", "historicalDebate", "earlierDecisions", "newEvidence"].forEach(function (field) {
    assert.ok(Object.prototype.hasOwnProperty.call(fall, field), copy + ": fall-timing has " + field);
  });
  assert.strictEqual(String(fall.salvationIssue).toLowerCase(), "no", copy + ": fall timing is not a salvation issue");
  assert.ok(/gospel does not hang/.test(fall.salvationWhy || ""), copy + ": fall timing has a one-line why");
  assert.strictEqual(String(fall.inScripture).toLowerCase(), "yes", copy + ": fall timing is in Scripture");
  assert.ok(/Ezekiel 28/.test(fall.inScriptureNote) && /Isaiah 14/.test(fall.inScriptureNote) && /Genesis 3/.test(fall.inScriptureNote) && /Job 1/.test(fall.inScriptureNote), copy + ": fall timing names the texts");
  assert.ok(/3:24/.test(fall.inScriptureNote), copy + ": in-Scripture note keeps 3:24 settled");
  assert.ok(/fall-before-Eden/.test(fall.historicalDebate) && /garden-as-the-moment/.test(fall.historicalDebate), copy + ": fall historical debate named");
  assert.ok(/pre-Eden fall/.test(fall.earlierDecisions) && /not locking/.test(fall.earlierDecisions), copy + ": earlier church sequence labeled, not locked");
  assert.ok(/None that timestamps/.test(fall.newEvidence) && /Qumran does not date it/.test(fall.newEvidence), copy + ": no invented fall-date find");
  var acts = qPack.questions[1];
  assert.ok(acts, copy + ": second card exists");
  assert.strictEqual(acts.id, "acts-21-vow", copy + ": second card is acts-21-vow");
  assert.strictEqual(acts.title, "Acts 21 — why Paul takes the vow and offering", copy + ": Acts 21 title");
  assert.strictEqual(String(acts.status).toLowerCase(), "open", copy + ": Acts 21 motive stays open");
  assert.ok(/Seaver/.test(acts.firstRaised) && /Granola/.test(acts.firstRaised), copy + ": raised as Seaver’s prep question, not a class dump");
  assert.ok(/Do not lock a motive/.test(acts.notLocking), copy + ": do not lock a motive");
  assert.ok(/please men/.test(acts.notLocking) && /God beat him/.test(acts.notLocking), copy + ": hunches named, not verdicts");
  var actsHold = (acts.scriptureHold || []).join(" ");
  assert.ok(/Acts 21:17-26/.test(actsHold), copy + ": hold Acts 21:17-26");
  assert.ok(/21:21/.test(actsHold), copy + ": hold the rumor that Paul teaches Jews to abandon Moses");
  assert.ok(/Galatians 2/.test(actsHold) && /Antioch/.test(actsHold), copy + ": hold Galatians 2 / Antioch as earlier tension");
  assert.ok(/21:27/.test(actsHold), copy + ": hold the riot that follows");
  assert.ok(/Do not use this to throw Paul out/.test(acts.tension) || /Do not use this to throw Paul out/.test((acts.notes || []).join(" ")), copy + ": do not throw Paul out");
  assert.ok(/Do not sand the tension away/.test(acts.tension), copy + ": do not sand the tension away");
  var actsNotes = (acts.notes || []).join(" ") + (acts.tension || "");
  assert.ok(/The text says he did it/.test(actsHold + actsNotes + acts.tension), copy + ": the text says he did it");
  ["salvationIssue", "inScripture", "historicalDebate", "earlierDecisions", "newEvidence"].forEach(function (field) {
    assert.ok(Object.prototype.hasOwnProperty.call(acts, field), copy + ": acts-21-vow has " + field);
  });
  assert.strictEqual(String(acts.salvationIssue).toLowerCase(), "no", copy + ": Acts 21 is not a salvation issue");
  assert.ok(/gospel does not hang/.test(acts.salvationWhy || ""), copy + ": Acts 21 has a one-line why");
  assert.strictEqual(String(acts.inScripture).toLowerCase(), "yes", copy + ": Acts 21 is in Scripture");
  assert.ok(/Acts 21:17-26/.test(acts.inScriptureNote) && /21:21/.test(acts.inScriptureNote) && /21:27/.test(acts.inScriptureNote) && /Galatians 2/.test(acts.inScriptureNote), copy + ": Acts 21 in-Scripture names the texts");
  assert.ok(/Paul and Torah|Judaizing/.test(acts.historicalDebate), copy + ": Acts 21 historical debate named");
  assert.ok(/accommodation/.test(acts.earlierDecisions) && /Nazarite/.test(acts.earlierDecisions) && /not locking a motive/.test(acts.earlierDecisions), copy + ": earlier Paul-and-law readings labeled, not locked");
  assert.ok(/None required/.test(acts.newEvidence), copy + ": Acts 21 needs no invented find");
  assert.ok(teacherJs.indexOf("deepQuestionsHtml") !== -1, copy + ": Deep Questions renderer exists");
  assert.ok(teacherJs.indexOf("teacher-questions.json") !== -1, copy + ": teacher.js fetches the tracker");
  assert.ok(styles.indexOf("deep-questions") !== -1, copy + ": Deep Questions is styled teacher-only");
  assert.equal(typeof teacherApi.deepQuestionsHtml, "function", copy + ": deepQuestionsHtml is exportable");
  var dq = teacherApi.deepQuestionsHtml(qPack);
  assert.ok(/Deep Questions/.test(dq), copy + ": section heading Deep Questions");
  assert.ok(/Timing of the fall event/.test(dq), copy + ": first card title renders");
  assert.ok(/deep-questions/.test(dq) && /teacher-only/.test(dq), copy + ": Deep Questions uses teacher-only class");
  assert.ok(dq.indexOf("Ezekiel 28:12-19") !== -1, copy + ": rendered Ezekiel 28");
  assert.ok(/SETTLED/.test(dq), copy + ": rendered 3:24 settled");
  assert.ok(/Acts 21 — why Paul takes the vow and offering/.test(dq), copy + ": second card title renders");
  assert.ok(dq.indexOf("Acts 21:17-26") !== -1, copy + ": rendered Acts 21:17-26");
  assert.ok(/Do not lock a motive/.test(dq), copy + ": rendered motive stays unlocked");
  assert.ok(/Big Board/.test(dq), copy + ": Deep Questions is a board");
  assert.ok(dq.indexOf("board-table") !== -1 && dq.indexOf("board-chip") !== -1, copy + ": cards show chips and a category table");
  assert.ok(/Salvation issue/.test(dq) && /In Scripture/.test(dq) && /Historical debate/.test(dq) && /Earlier decisions/.test(dq) && /New evidence/.test(dq), copy + ": five board questions visible on cards");
  assert.ok(/gospel does not hang on dating/.test(dq), copy + ": fall-timing salvation why renders");
  assert.ok(/gospel does not hang on why Paul/.test(dq), copy + ": Acts 21 salvation why renders");
  var week1View = weeks.find(function (w) { return w.n === 1; }) || { n: 1, title: "Week 1", teacherMoves: [] };
  var view1 = teacherApi.teacherViewHtml(week1View, qPack);
  var view2 = teacherApi.teacherViewHtml(week2, qPack);
  assert.ok(/Deep Questions/.test(view1), copy + ": Deep Questions shows on week 1");
  assert.ok(/Deep Questions/.test(view2), copy + ": Deep Questions shows on week 2");
  assert.ok(view2.indexOf("deck.html") !== -1, copy + ": presentation slides door stays on teacher view");
  assert.ok(/WATCHER IN SCRIPTURE/.test(view2), copy + ": week 2 teacherOnly still on the teacher view");
  assert.ok(/QUMRAN AND ANCIENT TRANSLATIONS/.test(view2), copy + ": Qumran block still on week 2");
  assert.ok(/LXX WITNESS/.test(view2), copy + ": LXX mismatch block on week 2 teacher view");
  assert.ok(view2.indexOf("ὁ διάβολος") !== -1, copy + ": teacher view shows Job 1:6 διάβολος");
  assert.ok(/Job 38:7 LXX is NOT the MT pair/.test(view2), copy + ": teacher view shows Job 38:7 mismatch");
  var week1 = weeks.find(function (w) { return w.n === 1; });
  assert.ok(week1 && week1.teacherOnly && week1.teacherOnly.length, copy + ": week 1 has a teacher-only nachash note");
  var w1Teacher = JSON.stringify(week1.teacherOnly);
  assert.ok(/\[A\]/.test(w1Teacher) && /\[B\]/.test(w1Teacher), copy + ": week 1 teacher note names [A] and [B]");
  assert.ok(/speaking/.test(w1Teacher) && w1Teacher.indexOf("נחש") !== -1, copy + ": [A] is the speaking nachash in Genesis 3");
  assert.ok(/later identification/.test(w1Teacher), copy + ": [B] is later identification");
  assert.ok(/Rev 12/.test(w1Teacher), copy + ": teacher note may name Rev 12");
  assert.ok(!/Rev(?:elation)? 12/.test(JSON.stringify(week1.recap || [])), copy + ": student recap still has no Rev 12");
  assert.ok(JSON.stringify(week1.recap || []).indexOf("The nachash is a spiritual rebel") !== -1, copy + ": do not rewrite the guys' recap line");
  var week1Rendered = teacherHtml(week1);
  assert.ok(/\[A\]/.test(week1Rendered) && /\[B\]/.test(week1Rendered), copy + ": week 1 teacher view prints [A]/[B]");
  assert.ok(home.indexOf("Rev 12") === -1 && home.indexOf("Revelation 12") === -1, copy + ": student home has no Rev 12");
  assert.ok(studentBlob.indexOf("fall-timing") === -1, copy + ": student week fields have no fall-timing id");
  assert.ok(studentBlob.indexOf("Ezekiel 28") === -1, copy + ": student week fields have no Ezekiel 28 dump");
  assert.ok(studentBlob.indexOf("Acts 21") === -1, copy + ": student week fields have no Acts 21 dump");
  assert.ok(studentBlob.indexOf("acts-21-vow") === -1, copy + ": student week fields have no acts-21-vow id");
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
