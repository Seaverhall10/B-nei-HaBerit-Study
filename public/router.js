/* Query router for the one-page study shell.
   Query strings (not hashes) so in-page jumps like #reader-slot keep working. */
(function (root) {
  var DEFAULT_WEEK = 2;

  function basename(pathname) {
    var parts = String(pathname || "").split("/");
    return (parts[parts.length - 1] || "index.html").toLowerCase();
  }

  function parseRoute(loc) {
    loc = loc || {};
    var q = new URLSearchParams(loc.search || "");
    var file = basename(loc.pathname || "");
    var weekParam = q.get("week");
    var viewParam = String(q.get("view") || "").toLowerCase();
    var week = weekParam ? Number(weekParam) : 0;
    if (week && !isFinite(week)) week = 0;

    if (file === "week.html") return { view: "week", week: week || DEFAULT_WEEK };
    if (file === "job.html") return { view: "job" };
    if (file === "map.html") return week ? { view: "map", week: week } : { view: "map" };
    if (file === "teacher.html") return week ? { view: "teacher", week: week } : { view: "teacher" };
    if (file === "deck.html") return { view: "deck", week: week || DEFAULT_WEEK };

    if (viewParam === "job") return { view: "job" };
    if (viewParam === "map") return week ? { view: "map", week: week } : { view: "map" };
    if (viewParam === "teacher") return week ? { view: "teacher", week: week } : { view: "teacher" };
    if (viewParam === "deck") return { view: "deck", week: week || DEFAULT_WEEK };
    if (viewParam === "week" || week) return { view: "week", week: week || DEFAULT_WEEK };
    return { view: "home" };
  }

  function hrefFor(route) {
    if (!route || route.view === "home") return "./";
    if (route.view === "week") return "?week=" + (route.week || DEFAULT_WEEK);
    if (route.view === "job") return "?view=job";
    if (route.view === "map") {
      return route.week ? "?view=map&week=" + route.week : "?view=map";
    }
    if (route.view === "teacher") {
      return route.week ? "?view=teacher&week=" + route.week : "?view=teacher";
    }
    if (route.view === "deck") {
      return "?view=deck&week=" + (route.week || DEFAULT_WEEK);
    }
    return "./";
  }

  function shimTarget(loc) {
    loc = loc || {};
    var file = basename(loc.pathname || "");
    if (file !== "week.html" && file !== "job.html" && file !== "map.html" && file !== "teacher.html" && file !== "deck.html") {
      return null;
    }
    var href = hrefFor(parseRoute(loc));
    var qs = href.charAt(0) === "?" ? href : "";
    return "index.html" + qs + (loc.hash || "");
  }

  function isAppPath(pathname) {
    var file = basename(pathname);
    return file === "" || file === "index.html" || file === "week.html" || file === "job.html" || file === "map.html" || file === "teacher.html" || file === "deck.html";
  }

  var api = {
    DEFAULT_WEEK: DEFAULT_WEEK,
    basename: basename,
    parseRoute: parseRoute,
    hrefFor: hrefFor,
    shimTarget: shimTarget,
    isAppPath: isAppPath
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.BneiRoute = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
