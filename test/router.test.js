#!/usr/bin/env node
"use strict";
var assert = require("assert");
var R = require("../docs/router.js");

function loc(pathname, search, hash) {
  return { pathname: pathname, search: search || "", hash: hash || "" };
}

assert.deepStrictEqual(R.parseRoute(loc("/B-nei-HaBerit-Study/", "")), { view: "home" });
assert.deepStrictEqual(R.parseRoute(loc("/B-nei-HaBerit-Study/index.html", "")), { view: "home" });
assert.deepStrictEqual(R.parseRoute(loc("/B-nei-HaBerit-Study/index.html", "?week=1")), { view: "week", week: 1 });
assert.deepStrictEqual(R.parseRoute(loc("/B-nei-HaBerit-Study/week.html", "?week=1")), { view: "week", week: 1 });
assert.deepStrictEqual(R.parseRoute(loc("/B-nei-HaBerit-Study/week.html", "?week=9")), { view: "week", week: 9 });
assert.deepStrictEqual(R.parseRoute(loc("/B-nei-HaBerit-Study/index.html", "?week=9")), { view: "week", week: 9 });
assert.deepStrictEqual(R.parseRoute(loc("/B-nei-HaBerit-Study/week.html", "")), { view: "week", week: 2 });
assert.deepStrictEqual(R.parseRoute(loc("/docs/job.html", "")), { view: "job" });
assert.deepStrictEqual(R.parseRoute(loc("/docs/index.html", "?view=job")), { view: "job" });
assert.deepStrictEqual(R.parseRoute(loc("/docs/map.html", "")), { view: "map" });
assert.deepStrictEqual(R.parseRoute(loc("/docs/map.html", "?week=3")), { view: "map", week: 3 });
assert.deepStrictEqual(R.parseRoute(loc("/docs/teacher.html", "")), { view: "home" });
assert.deepStrictEqual(R.parseRoute(loc("/docs/index.html", "?view=teacher")), { view: "home" });
assert.deepStrictEqual(R.parseRoute(loc("/docs/deck.html", "")), { view: "deck", week: 2 });
assert.deepStrictEqual(R.parseRoute(loc("/docs/deck.html", "?week=1")), { view: "deck", week: 1 });
assert.deepStrictEqual(R.parseRoute(loc("/docs/index.html", "?view=deck&week=2")), { view: "deck", week: 2 });

assert.strictEqual(R.hrefFor({ view: "home" }), "./");
assert.strictEqual(R.hrefFor({ view: "week", week: 1 }), "?week=1");
assert.strictEqual(R.hrefFor({ view: "job" }), "?view=job");
assert.strictEqual(R.hrefFor({ view: "map", week: 3 }), "?view=map&week=3");
assert.strictEqual(R.hrefFor({ view: "deck", week: 2 }), "?view=deck&week=2");
assert.strictEqual(R.hrefFor({ view: "teacher", week: 2 }), "./");

assert.strictEqual(R.shimTarget(loc("/B-nei-HaBerit-Study/week.html", "?week=1")), "index.html?week=1");
assert.strictEqual(
  R.shimTarget(loc("/B-nei-HaBerit-Study/week.html", "?week=1", "#read-this-week")),
  "index.html?week=1#read-this-week"
);
assert.strictEqual(R.shimTarget(loc("/B-nei-HaBerit-Study/job.html", "")), "index.html?view=job");
assert.strictEqual(R.shimTarget(loc("/B-nei-HaBerit-Study/map.html", "?week=3")), "index.html?view=map&week=3");
assert.strictEqual(R.shimTarget(loc("/B-nei-HaBerit-Study/teacher.html", "")), null);
assert.strictEqual(R.shimTarget(loc("/B-nei-HaBerit-Study/deck.html", "?week=2")), "index.html?view=deck&week=2");
assert.strictEqual(R.shimTarget(loc("/B-nei-HaBerit-Study/index.html", "?week=1")), null);

assert.ok(R.isAppPath("/B-nei-HaBerit-Study/week.html"));
assert.ok(R.isAppPath("/B-nei-HaBerit-Study/deck.html"));
assert.ok(!R.isAppPath("/B-nei-HaBerit-Study/teacher.html"));
assert.ok(!R.isAppPath("/B-nei-HaBerit-Study/seal.png"));

console.log("router tests ok");
