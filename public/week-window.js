(function (root) {
  "use strict";

  var DEFAULT_WEEK = 2;

  function studentMin() {
    return Math.max(1, DEFAULT_WEEK - 1);
  }

  function studentMax() {
    return DEFAULT_WEEK + 2;
  }

  function isStudentWeek(n) {
    var v = Number(n);
    if (!isFinite(v) || v % 1 !== 0) return false;
    return v >= studentMin() && v <= studentMax();
  }

  function pickerWeeks(weeks) {
    return (weeks || []).filter(function (w) {
      return isStudentWeek(w.n);
    });
  }

  function optionLabel(w) {
    return "Week " + w.n + ": " + w.title;
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function notYetHtml() {
    return "<section class=\"recap\"><p class=\"recap-kicker\">Not yet</p><p>That week is not open yet.</p><p class=\"doors\"><a class=\"btn\" href=\"week.html?week=" + DEFAULT_WEEK + "\">This week</a></p></section>";
  }

  function openBibleHtml(w) {
    if (!w || !w.openBible || !w.openBible.length) return "";
    var html = "<section class=\"open-bible\"><p class=\"recap-kicker\">Open your Bible</p><ul>";
    w.openBible.forEach(function (ref) {
      html += "<li>" + esc(ref) + "</li>";
    });
    html += "</ul>";
    if (w.focus && w.focus.length) {
      html += "<p class=\"in-room\"><strong>In the room:</strong> " + esc(w.focus.join("; ")) + "</p>";
    }
    html += "</section>";
    return html;
  }

  function creamReaderHtml(w, pack, done) {
    if (!w.reader || !w.reader.length) return "";
    var webBy = {};
    ((pack && pack.passages) || []).forEach(function (p) {
      webBy[p.refKey] = p;
    });
    var marks = done || [];
    var html = "<section class=\"reader\">";
    html += "<h3>Read this week</h3>";
    w.reader.forEach(function (block, i) {
      var body = "";
      (block.keys || []).forEach(function (k) {
        var web = webBy[k];
        body += "<h4>" + esc((web && web.ref) || k) + "</h4>";
        if (web) {
          (web.verses || []).forEach(function (v) {
            body += "<p class=\"verse\"><sup>" + esc(String(v.v)) + "</sup>" + esc(v.t) + "</p>";
          });
        }
      });
      if (!body) return;
      html += "<details class=\"passage" + (marks[i] ? " read" : "") + "\"><summary><label class=\"mark-read\"><input type=\"checkbox\" data-i=\"" + i + "\"" + (marks[i] ? " checked" : "") + "><span>Read</span></label><span class=\"passage-title\">" + esc(block.title) + "</span></summary><div class=\"passage-body\">" + body + "</div></details>";
    });
    html += "</section>";
    return html;
  }

  var api = {
    DEFAULT_WEEK: DEFAULT_WEEK,
    studentMin: studentMin,
    studentMax: studentMax,
    isStudentWeek: isStudentWeek,
    pickerWeeks: pickerWeeks,
    optionLabel: optionLabel,
    notYetHtml: notYetHtml,
    openBibleHtml: openBibleHtml,
    creamReaderHtml: creamReaderHtml
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  root.WeekWindow = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
