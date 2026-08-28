"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var publicDir = path.join(__dirname, "..", "public");
var WeekWindow = require(path.join(publicDir, "week-window.js"));
var weeks = JSON.parse(fs.readFileSync(path.join(publicDir, "weeks.json"), "utf8"));
var pack = JSON.parse(fs.readFileSync(path.join(publicDir, "readings-week2.json"), "utf8"));

var week2 = weeks.find(function (w) { return w.n === 2; });
var week9 = weeks.find(function (w) { return w.n === 9; });

assert.strictEqual(WeekWindow.DEFAULT_WEEK, 2, "this week is 2");
assert.strictEqual(WeekWindow.studentMin(), 1);
assert.strictEqual(WeekWindow.studentMax(), 4);

assert.strictEqual(WeekWindow.isStudentWeek(1), true);
assert.strictEqual(WeekWindow.isStudentWeek(2), true);
assert.strictEqual(WeekWindow.isStudentWeek(3), true);
assert.strictEqual(WeekWindow.isStudentWeek(4), true);
assert.strictEqual(WeekWindow.isStudentWeek(5), false);
assert.strictEqual(WeekWindow.isStudentWeek(9), false);
assert.strictEqual(WeekWindow.isStudentWeek(12), false);
assert.strictEqual(WeekWindow.isStudentWeek(0), false);
assert.strictEqual(WeekWindow.isStudentWeek("12"), false);
assert.strictEqual(WeekWindow.isStudentWeek(NaN), false);

var visible = WeekWindow.pickerWeeks(weeks);
assert.deepStrictEqual(visible.map(function (w) { return w.n; }), [1, 2, 3, 4]);
assert.strictEqual(visible.length, 4);

var labels = visible.map(WeekWindow.optionLabel);
assert.ok(labels[1].indexOf("Week 2:") === 0, "picker uses Week N: title, got " + labels[1]);
assert.ok(labels[1].indexOf("Seed Line") !== -1, "week 2 label carries the title");
labels.forEach(function (label) {
  assert.ok(!/^\d+$/.test(label), "no bare number labels: " + label);
});

assert.strictEqual(weeks.length, 12, "keep weeks 5-12 in weeks.json for teacher");
assert.ok(week9, "week 9 data stays in JSON");
assert.ok(weeks.some(function (w) { return w.n === 12; }));

var locked = WeekWindow.notYetHtml(9);
assert.ok(locked.indexOf("not yet") !== -1 || locked.indexOf("Not yet") !== -1);
assert.ok(locked.indexOf("week.html?week=2") !== -1, "door back to this week");
assert.ok(locked.indexOf(week9.title) === -1, "do not leak week 9 title");
assert.ok(locked.indexOf(week9.student) === -1, "do not leak week 9 reading list");
assert.ok(locked.indexOf("500") === -1);

assert.ok(week2.reader && week2.reader.length === 10, "keep 10 load-bearing blocks");

var html = WeekWindow.creamReaderHtml(week2, pack, [false, false, false, false, false, false, false, false, false, false]);
assert.ok(html.indexOf("Interlinear") === -1, "no Interlinear toggle");
assert.ok(html.indexOf("reader-bar") === -1, "no Ancient Texts reader bar");
assert.ok(html.indexOf("il-word") === -1, "no Strong's dump");
assert.ok(html.indexOf("il-verse") === -1, "cream verses, not interlinear chrome");
assert.strictEqual((html.match(/<details class="passage/g) || []).length, 10);
week2.reader.forEach(function (block) {
  assert.ok(html.indexOf(block.title) !== -1, "missing block " + block.title);
});
assert.ok(html.indexOf("class=\"verse\"") !== -1, "tap-to-read uses cream verse markup");
assert.ok(fs.existsSync(path.join(publicDir, "readings-week2.json")));
assert.ok(fs.existsSync(path.join(publicDir, "interlinear-week2.json")), "do not delete interlinear JSON");

var appSrc = fs.readFileSync(path.join(publicDir, "app.js"), "utf8");
assert.ok(appSrc.indexOf("pickerWeeks") !== -1, "student picker uses the week window");
assert.ok(appSrc.indexOf("creamReaderHtml") !== -1, "student tab uses cream reader");
assert.ok(appSrc.indexOf("data-v=\"interlinear\"") === -1, "app.js must not render Interlinear");

var weekPage = fs.readFileSync(path.join(publicDir, "week.html"), "utf8");
assert.ok(weekPage.indexOf("reader.css") === -1, "do not load dark reader chrome on the student week page");

console.log("week-window tests passed");
