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

function loadTeacher(dir) {
  var src = read(dir, "teacher.js");
  var sandbox = { module: { exports: {} }, exports: {}, console: console };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(src, sandbox, { filename: path.join(dir, "teacher.js") });
  return sandbox.module.exports.teacherOnlyHtml || (sandbox.BneiTeacher && sandbox.BneiTeacher.teacherOnlyHtml);
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
  assert.ok(Array.isArray(week2.teacherOnly) && week2.teacherOnly.length >= 4, copy + ": week 2 keeps teacherOnly blocks");

  var headings = week2.teacherOnly.map(function (b) { return b.h || ""; });
  assert.ok(headings.some(function (h) { return /Do not send this block to the group/i.test(h); }), copy + ": keep do-not-send heading");
  assert.ok(headings.some(function (h) { return /Two Lamechs/i.test(h); }), copy + ": keep two-Lamechs heading");
  assert.ok(headings.some(function (h) { return /WATCHER IN SCRIPTURE/i.test(h); }), copy + ": Watcher-in-Scripture heading");
  assert.ok(headings.some(function (h) { return /SHINING NOAH/i.test(h); }), copy + ": shining-Noah heading");

  var blob = JSON.stringify(week2.teacherOnly);
  assert.ok(blob.indexOf("עִיר") !== -1, copy + ": Aramaic Watcher word עִיר");
  assert.ok(blob.indexOf("עִירִין") !== -1, copy + ": Aramaic plural עִירִין");
  assert.ok(blob.indexOf("H5894") !== -1, copy + ": Strong’s H5894");
  assert.ok(blob.indexOf("Daniel 4:13") !== -1, copy + ": Daniel 4:13");
  assert.ok(blob.indexOf("Daniel 4:17") !== -1, copy + ": Daniel 4:17");
  assert.ok(blob.indexOf("Daniel 4:23") !== -1, copy + ": Daniel 4:23");
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

  var watcher = week2.teacherOnly.find(function (b) { return /WATCHER IN SCRIPTURE/i.test(b.h || ""); });
  var shining = week2.teacherOnly.find(function (b) { return /SHINING NOAH/i.test(b.h || ""); });
  assert.ok(watcher && shining, copy + ": both new blocks present");
  assert.ok(!/EXTRA/i.test(String(watcher.label || "")), copy + ": Watcher block is not extra-biblical");
  assert.ok(/canonical/i.test(String(watcher.label || watcher.h)), copy + ": Watcher block labeled canonical");
  assert.strictEqual(String(shining.label).toUpperCase(), "EXTRA_BIBLICAL", copy + ": shining Noah labeled EXTRA_BIBLICAL");

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

  var teacherHtml = loadTeacher(dir);
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
    "shining"
  ].forEach(function (needle) {
    assert.ok(home.toLowerCase().indexOf(needle.toLowerCase()) === -1, copy + ": student home must not contain " + needle);
  });

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
});

console.log("teacher-only week 2 tests passed");
