#!/usr/bin/env node
"use strict";

var assert = require("assert");
var fs = require("fs");
var path = require("path");

var root = path.join(__dirname, "..");
var copies = ["public", "docs"];
var forbiddenAssets = [
  "teacher.html",
  "teacher.js",
  "teacher-questions.json",
  "teacher-week2-canon.md"
];
var allowedWeekFields = new Set([
  "n",
  "title",
  "theme",
  "spine",
  "thisWeek",
  "big",
  "student",
  "openBible",
  "focus",
  "question",
  "observe",
  "app",
  "guard",
  "response",
  "alreadyMet",
  "studyApp",
  "reader",
  "recap",
  "recapLink"
]);

function read(copy, file) {
  return fs.readFileSync(path.join(root, copy, file), "utf8");
}

copies.forEach(function (copy) {
  var dir = path.join(root, copy);
  var weeks = JSON.parse(read(copy, "weeks.json"));

  assert.strictEqual(weeks.length, 12, copy + ": complete student week set remains available");
  weeks.forEach(function (week, index) {
    assert.ok(week && typeof week === "object" && !Array.isArray(week), copy + ": week " + (index + 1) + " is an object");
    Object.keys(week).forEach(function (field) {
      assert.ok(allowedWeekFields.has(field), copy + ": public week field is not on the student allowlist: " + field);
    });
    assert.ok(!Object.prototype.hasOwnProperty.call(week, "teacherMoves"), copy + ": teacherMoves is absent from week " + week.n);
    assert.ok(!Object.prototype.hasOwnProperty.call(week, "teacherOnly"), copy + ": teacherOnly is absent from week " + week.n);
  });

  forbiddenAssets.forEach(function (file) {
    assert.ok(!fs.existsSync(path.join(dir, file)), copy + ": facilitator asset must not be published: " + file);
  });

  var indexHtml = read(copy, "index.html");
  var appSrc = read(copy, "app.js");
  var routerSrc = read(copy, "router.js");
  var routeSurface = indexHtml + "\n" + appSrc + "\n" + routerSrc;
  assert.ok(!/view-teacher|teacher\.js|BneiTeacher|\?view=teacher|route\.view\s*===\s*["']teacher["']/i.test(routeSurface), copy + ": facilitator route or loader remains in the public shell");
  assert.ok(/weeks\.json\?v=student-only-20260902/.test(appSrc), copy + ": sanitized weeks data has a new cache key");
  assert.ok(/router\.js\?v=student-only-20260902/.test(indexHtml), copy + ": contained router has a new cache key");
  assert.ok(/app\.js\?v=student-only-20260902/.test(indexHtml), copy + ": contained app shell has a new cache key");

  var routerPath = path.join(dir, "router.js");
  delete require.cache[require.resolve(routerPath)];
  var router = require(routerPath);
  assert.deepStrictEqual(router.parseRoute({ pathname: "/teacher.html", search: "" }), { view: "home" }, copy + ": retired teacher path falls back to the student home route");
  assert.deepStrictEqual(router.parseRoute({ pathname: "/index.html", search: "?view=teacher" }), { view: "home" }, copy + ": retired teacher query falls back to the student home route");
  assert.strictEqual(router.hrefFor({ view: "teacher", week: 2 }), "./", copy + ": router cannot generate a teacher URL");
  assert.strictEqual(router.shimTarget({ pathname: "/teacher.html", search: "" }), null, copy + ": no teacher compatibility shim remains");
  assert.strictEqual(router.isAppPath("/teacher.html"), false, copy + ": teacher.html is not an app route");
});

assert.deepStrictEqual(
  JSON.parse(read("public", "weeks.json")),
  JSON.parse(read("docs", "weeks.json")),
  "Firebase and Pages copies publish the same sanitized week data"
);

console.log("public facilitator containment tests passed");
