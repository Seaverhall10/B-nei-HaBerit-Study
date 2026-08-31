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

  var JOB_STUDENT_VERSES = {
    "Job 1:6": {
      "6": "A day came when the sons of God came to present themselves before Yahweh, and the adversary came also among them."
    },
    "Job 38:4-7": {
      "7": "when the morning stars sang together, and all the sons of God shouted for joy?"
    },
    "Genesis 6:1-22": {
      "2": "The sons of God saw that men’s daughters were beautiful, and they took any that they wanted for themselves as wives.",
      "4": "The Nephilim were in the earth in those days, and also after that, when the sons of God came in to men’s daughters and had children with them. Those were the mighty men who were of old, men of renown."
    }
  };

  function studentVerseText(refKey, v) {
    var over = JOB_STUDENT_VERSES[refKey];
    if (over && over[String(v.v)]) return over[String(v.v)];
    return v.t || "";
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
            body += "<p class=\"verse\"><sup>" + esc(String(v.v)) + "</sup>" + esc(studentVerseText(k, v)) + "</p>";
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
