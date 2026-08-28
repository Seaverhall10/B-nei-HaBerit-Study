"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var publicDir = path.join(__dirname, "..", "public");
var WeekWindow = require(path.join(publicDir, "week-window.js"));
var weeks = JSON.parse(fs.readFileSync(path.join(publicDir, "weeks.json"), "utf8"));
var pack = JSON.parse(fs.readFileSync(path.join(publicDir, "readings-week2.json"), "utf8"));
var indexHtml = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
var styles = fs.readFileSync(path.join(publicDir, "styles.css"), "utf8");
var appSrc = fs.readFileSync(path.join(publicDir, "app.js"), "utf8");
var weekPage = fs.readFileSync(path.join(publicDir, "week.html"), "utf8");

var week2 = weeks.find(function (w) { return w.n === 2; });
var week9 = weeks.find(function (w) { return w.n === 9; });

var homeStart = indexHtml.indexOf('id="view-home"');
var weekStart = indexHtml.indexOf('id="view-week"');
assert.ok(homeStart !== -1 && weekStart !== -1, "one-page shell has home and week views");
var home = indexHtml.slice(homeStart, weekStart);

assert.ok(home.indexOf("בְּנֵי הַבְּרִית") !== -1, "Hebrew title stays");
assert.ok(home.indexOf("This week") !== -1);
assert.ok(home.indexOf("Week 2") !== -1);
assert.ok(home.indexOf("Rebellion spreads past Eden. Yahweh judges the world by flood. He keeps a seed through Noah.") !== -1, "one-line this-week point under the title");
assert.ok(home.indexOf("flood") !== -1 || home.indexOf("Flood") !== -1);
assert.ok(home.indexOf("Noah") !== -1);
assert.ok(home.indexOf("Open your Bible") !== -1, "name the refs at the top so guys can open paper Bibles");
assert.ok(home.indexOf("Genesis 4:1-16") !== -1);
assert.ok(home.indexOf("Genesis 6:1-22") !== -1);
assert.ok(home.indexOf("Job 1:6") !== -1 && home.indexOf("Job 38:4-7") !== -1);
assert.ok(home.indexOf("Genesis 8:20-9:17") !== -1);
assert.ok(home.indexOf("Genesis 6:1-8") !== -1, "in the room named at the top");
var heroCta = home.indexOf('class="cta"');
var openBibleAt = home.indexOf("Open your Bible");
var ledePoint = home.indexOf("Rebellion spreads past Eden");
assert.ok(ledePoint !== -1 && openBibleAt !== -1 && ledePoint < openBibleAt, "Open your Bible comes after the one-line point");
assert.ok(heroCta !== -1 && openBibleAt < heroCta, "Open your Bible is before the Week 2 CTA, not a scavenger hunt");
assert.ok(home.indexOf("Week 2 reading") !== -1, "CTA stays Week 2 reading");
assert.ok(home.indexOf("week.html?week=2") !== -1, "gold door to week 2");
assert.ok(home.indexOf("tap to read") === -1, "do not say tap to read on the next page");
assert.ok(home.indexOf("next page") === -1);
assert.ok(!/\beasy\b/i.test(home), "do not call the work easy");
assert.ok(home.indexOf("Last week") !== -1);
assert.ok(home.indexOf("Yahweh alone creates") !== -1);
assert.ok(home.indexOf("council") !== -1);
assert.ok(home.indexOf("vocation") !== -1);
assert.ok(home.indexOf("nachash") !== -1);
assert.ok(home.indexOf("Genesis 3:15") !== -1);
assert.ok(home.indexOf("week.html?week=1") !== -1);
assert.ok(home.indexOf("job.html") !== -1, "optional Job door");
assert.ok(home.indexOf("Deep Questions") === -1, "student home has no Deep Questions tracker");
assert.ok(home.indexOf("Timing of the fall") === -1, "student home has no fall-timing card");
assert.ok(home.indexOf("Acts 21") === -1, "student home has no Acts 21 dump");
assert.ok(home.indexOf("why Paul takes the vow") === -1, "student home has no Paul-vow card");
assert.ok(indexHtml.indexOf("id=\"view-teacher\"") !== -1, "teacher view stays on the one-page shell");
assert.ok(home.indexOf("Story so far") === -1);
assert.ok(home.indexOf("map.html") === -1, "no Map on student home");
assert.ok(home.indexOf("class=\"card\"") === -1, "home is not cream homework cards");
assert.ok(indexHtml.indexOf("ancient-texts-app") === -1);
assert.ok(/class="cta"/.test(home), "one gold primary CTA");
assert.ok(home.indexOf("class=\"beats\"") !== -1, "last week uses headed beats");
assert.ok(home.indexOf("home-foot") !== -1, "tight Hebrew footer");
assert.ok((home.match(/class="hero"/g) || []).length === 1);
assert.ok(indexHtml.indexOf("home-nav") !== -1);
assert.ok(!/map\.html/.test(home));
assert.ok(indexHtml.indexOf("week-window.js") !== -1, "shell loads week window");
assert.ok(indexHtml.indexOf("router.js") !== -1, "shell loads query router");
assert.ok(styles.indexOf("--gold:#c9a24a") !== -1);
assert.ok(styles.indexOf("--gold-soft:#e7c56a") !== -1);
assert.ok(styles.indexOf("--void:#0b1211") !== -1);
assert.ok(styles.indexOf("overflow-x:clip") !== -1);
assert.ok(styles.indexOf("#b85c38") === -1 && styles.indexOf("ember") === -1);

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

assert.strictEqual(week2.thisWeek, "Rebellion spreads past Eden. Yahweh judges the world by flood. He keeps a seed through Noah.");
assert.deepStrictEqual(week2.openBible, [
  "Genesis 4:1-16",
  "Genesis 6:1-22",
  "Job 1:6 and Job 38:4-7",
  "Genesis 8:20-9:17"
]);
assert.deepStrictEqual(week2.focus, ["Genesis 6:1-8"]);
assert.strictEqual(week2.student, "Genesis 4:1-16; Genesis 6:1-22; Job 1:6 and Job 38:4-7; Genesis 8:20-9:17");
assert.ok(week2.student.indexOf("Genesis 4:1-16") !== -1);
assert.ok(week2.student.indexOf("Genesis 6:1-22") !== -1);
assert.ok(week2.student.indexOf("Job 1:6") !== -1);
assert.ok(week2.student.indexOf("Job 38:4-7") !== -1);
assert.ok(week2.student.indexOf("Genesis 8:20-9:17") !== -1);

var laterHouses = [
  "Genesis 19",
  "Numbers 13",
  "Deuteronomy 3",
  "1 Samuel 17",
  "Matthew 4",
  "Jude 6",
  "1 Peter 3"
];
laterHouses.forEach(function (ref) {
  assert.ok(week2.student.indexOf(ref) === -1, "student homework must not include later house " + ref);
  assert.ok((week2.focus || []).join(" ").indexOf(ref) === -1, "focus must not include later house " + ref);
  var readerBlob = JSON.stringify(week2.reader);
  assert.ok(readerBlob.indexOf(ref) === -1, "reader must not include later house " + ref);
  var observeBlob = (week2.observe || []).join(" ");
  assert.ok(observeBlob.indexOf(ref) === -1, "observe must not send later house " + ref);
});
assert.ok((week2.observe || []).some(function (line) {
  return line.indexOf("and also afterward") !== -1 && line.indexOf("when Scripture brings it") !== -1;
}), "one sentence defers afterward; do not tour later houses");
assert.ok((week2.observe || []).some(function (line) {
  return /Nimrod|Babel/.test(line) && /next week/i.test(line);
}), "Nimrod/Babel is next week");
var teacherMoves = (week2.teacherMoves || []).join(" ");
assert.ok(teacherMoves.indexOf("Numbers 13") === -1, "teacherMoves must not send the class through Numbers 13");
assert.ok(teacherMoves.indexOf("Og") === -1 && teacherMoves.indexOf("Goliath") === -1, "teacherMoves must not tour Og or Goliath");
assert.ok(teacherMoves.indexOf("Lot") === -1 && teacherMoves.indexOf("Matthew 4") === -1, "teacherMoves must not restore Lot / Matt 4 homework");
assert.ok(/Hold up their English Bible/i.test(teacherMoves), "name where their English came from");
assert.ok(/1 Peter 3:20-21/.test(teacherMoves), "1 Peter 3 names earth-through-water later");
assert.ok(teacherMoves.indexOf("Messiah is the greater ark") !== -1 && /opening frame/.test(teacherMoves), "do not open with Messiah-as-ark");
assert.ok(/two piles/i.test(teacherMoves), "Qumran two piles stays a teacher move");
assert.ok(week2.teacherOnly && week2.teacherOnly.length, "keep teacher-only notes");
assert.ok((week2.observe || []).some(function (line) {
  return /desert/.test(line) && /labeled/.test(line) && /Torah/.test(line);
}), "one thin desert-copies observe; no 1Q20 dump");

assert.ok(week2.reader && week2.reader.length === 4, "four Scripture blocks, not a world tour");

var bible = WeekWindow.openBibleHtml(week2);
assert.ok(bible.indexOf("Open your Bible") !== -1);
assert.ok(bible.indexOf("Genesis 4:1-16") !== -1);
assert.ok(bible.indexOf("Genesis 6:1-22") !== -1);
assert.ok(bible.indexOf("Job 1:6") !== -1);
assert.ok(bible.indexOf("Job 38:4-7") !== -1);
assert.ok(bible.indexOf("Genesis 8:20-9:17") !== -1);
assert.ok(bible.indexOf("Genesis 6:1-8") !== -1, "in the room sits with the open-Bible list");
assert.ok(bible.indexOf("Genesis 19") === -1);
assert.strictEqual(WeekWindow.openBibleHtml(weeks[0]), "", "Open your Bible pin is this week only");

var html = WeekWindow.creamReaderHtml(week2, pack, [false, false, false, false]);
assert.ok(html.indexOf("Interlinear") === -1, "no Interlinear toggle");
assert.ok(html.indexOf("reader-bar") === -1, "no Ancient Texts reader bar");
assert.ok(html.indexOf("il-word") === -1, "no Strong's dump");
assert.ok(html.indexOf("il-verse") === -1, "cream verses, not interlinear chrome");
assert.strictEqual((html.match(/<details class="passage/g) || []).length, 4);
week2.reader.forEach(function (block) {
  assert.ok(html.indexOf(block.title) !== -1, "missing block " + block.title);
});
assert.ok(html.indexOf("Job 1:6") !== -1, "Job 1:6 is in the cream reader");
assert.ok(html.indexOf("Job 38:4-7") !== -1, "Job 38:4-7 is in the cream reader");
assert.ok(html.indexOf("Genesis 19") === -1, "Lot is not this week's homework");
assert.ok(html.indexOf("Numbers 13") === -1);
assert.ok(html.indexOf("Deuteronomy 3") === -1);
assert.ok(html.indexOf("1 Samuel 17") === -1);
assert.ok(html.indexOf("Matthew 4") === -1);
assert.ok(html.indexOf("Jude 6") === -1);
assert.ok(html.indexOf("1 Peter 3") === -1);
assert.ok(html.indexOf("class=\"verse\"") !== -1, "cream verse markup stays");
assert.ok(fs.existsSync(path.join(publicDir, "readings-week2.json")));
assert.ok(fs.existsSync(path.join(publicDir, "interlinear-week2.json")), "do not delete interlinear JSON");
var packKeys = (pack.passages || []).map(function (p) { return p.refKey; });
assert.ok(packKeys.indexOf("Job 1:6") !== -1, "WEB pack has Job 1:6");
assert.ok(packKeys.indexOf("Job 38:4-7") !== -1, "WEB pack has Job 38:4-7");

assert.ok(appSrc.indexOf("pickerWeeks") !== -1, "student picker uses the week window");
assert.ok(appSrc.indexOf("creamReaderHtml") !== -1, "student tab uses cream reader");
assert.ok(appSrc.indexOf("data-v=\"interlinear\"") === -1, "app.js must not render Interlinear");
assert.ok(appSrc.indexOf("recap-items") !== -1, "keep Week 1 recap items renderer");
assert.ok(appSrc.indexOf("it.b") !== -1, "recap items still render lead beats");
assert.ok(appSrc.indexOf("studyAppHtml") === -1, "do not send ancient-texts-app on the student week page");
assert.ok(appSrc.indexOf("ancient-texts-app") === -1);
assert.ok(appSrc.indexOf("openBibleHtml") !== -1, "week view pins Open your Bible");
var weekHtmlAt = appSrc.indexOf('getElementById("week").innerHTML');
assert.ok(weekHtmlAt !== -1, "week article is rendered");
var weekHtml = appSrc.slice(weekHtmlAt);
assert.ok(weekHtml.indexOf("bible") !== -1 && weekHtml.indexOf("bible") < weekHtml.indexOf("recapHtml(w)"), "Open your Bible is before recap");
assert.ok(weekHtml.indexOf("bible") < weekHtml.indexOf("reader-slot"), "Open your Bible is before the cream reader");
assert.ok(appSrc.indexOf("thisWeek") !== -1, "week view names the one-line point under the title");

assert.ok(weekPage.indexOf("reader.css") === -1, "do not load dark reader chrome on the student week page");
assert.ok(weekPage.indexOf("map.html") === -1, "no Map on student week nav");
assert.ok(weekPage.indexOf("shim.js") !== -1, "old week.html URLs shim into the one-page shell");
assert.ok(weekPage.indexOf("router.js") !== -1);

var navStart = indexHtml.indexOf('id="shell-nav"');
var navEnd = indexHtml.indexOf("</nav>", navStart);
assert.ok(navStart !== -1 && navEnd !== -1, "student chrome nav exists");
var studentNav = indexHtml.slice(navStart, navEnd);
assert.ok(studentNav.indexOf("This week") !== -1);
assert.ok(studentNav.indexOf(">Job<") !== -1);
assert.ok(studentNav.indexOf("Map") === -1, "Map stays off student chrome");
assert.ok(studentNav.indexOf("map.html") === -1);
assert.ok(appSrc.indexOf("history.replaceState") === -1 || appSrc.indexOf('go({ view: "week"') !== -1, "picker stays on the one-page query route");
assert.ok(appSrc.indexOf("week.html?week=\" + sel.value") === -1, "picker must not bounce to week.html");

var firebaseCfg = fs.readFileSync(path.join(publicDir, "firebase-config.js"), "utf8");
assert.ok(firebaseCfg.indexOf("REPLACE_ME") !== -1, "SPA PR does not land real Firebase config");
assert.ok(firebaseCfg.indexOf("bnei-haberit-study") === -1, "leave Firebase project wiring on PR 7");

["job.html", "map.html", "teacher.html"].forEach(function (file) {
  var page = fs.readFileSync(path.join(publicDir, file), "utf8");
  assert.ok(page.indexOf("shim.js") !== -1, file + " is a shim");
  assert.ok(page.indexOf("router.js") !== -1, file + " loads the query router");
});

console.log("week-window tests passed");
