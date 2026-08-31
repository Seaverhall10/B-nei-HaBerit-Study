import os

js_content = """/* Slide Deck Presentation Mode Controller */
(function (root) {
  var deckData = null;
  var currentWeek = 2;
  var currentSlide = 0;
  var slides = [];

  function esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search || "");
    return params.get(name);
  }

  function renderSlideContent(slide) {
    if (!slide) return "<p>No slide data.</p>";

    var html = "";
    if (slide.kicker) html += "<div class=\"kicker\">" + esc(slide.kicker) + "</div>";
    if (slide.heading) html += "<h2>" + esc(slide.heading) + "</h2>";
    if (slide.sub) html += "<div class=\"sub\">" + esc(slide.sub) + "</div>";

    switch (slide.type) {
      case "title":
        if (slide.callout) {
          html += "<div class=\"deck-callout\">" + esc(slide.callout) + "</div>";
        }
        break;

      case "split":
        html += "<div class=\"deck-split-grid\">";
        if (slide.left) {
          html += "<div class=\"deck-pane\"><h3>" + esc(slide.left.title) + "</h3><ul>";
          (slide.left.items || []).forEach(function (it) {
            html += "<li>" + it + "</li>";
          });
          html += "</ul></div>";
        }
        if (slide.right) {
          html += "<div class=\"deck-pane\"><h3>" + esc(slide.right.title) + "</h3><p style=\"font-size:1.15rem; line-height:1.55;\">" + slide.right.text + "</p></div>";
        }
        html += "</div>";
        break;

      case "words":
        html += "<div class=\"deck-words-grid\">";
        (slide.words || []).forEach(function (w) {
          html += "<div class=\"deck-word-card\">";
          html += "<div class=\"he\">" + esc(w.he) + "</div>";
          html += "<div class=\"tr\">" + esc(w.tr) + "</div>";
          html += "<div class=\"def\">" + esc(w.def) + "</div>";
          html += "</div>";
        });
        html += "</div>";
        break;

      case "contrast":
        html += "<div class=\"deck-contrast-grid\">";
        if (slide.col1) {
          html += "<div class=\"deck-pane\" style=\"border-left:4px solid #b85c38;\"><h3>" + esc(slide.col1.title) + "</h3><ul>";
          (slide.col1.items || []).forEach(function (it) {
            html += "<li>" + it + "</li>";
          });
          html += "</ul></div>";
        }
        if (slide.col2) {
          html += "<div class=\"deck-pane\" style=\"border-left:4px solid var(--deck-gold);\"><h3>" + esc(slide.col2.title) + "</h3><ul>";
          (slide.col2.items || []).forEach(function (it) {
            html += "<li>" + it + "</li>";
          });
          html += "</ul></div>";
        }
        html += "</div>";
        break;

      case "map":
        html += "<div class=\"deck-map-list\">";
        (slide.locations || []).forEach(function (loc) {
          html += "<div class=\"deck-map-item\">";
          html += "<div class=\"name\">" + esc(loc.name) + "</div>";
          html += "<div class=\"tag\">" + esc(loc.tag) + "</div>";
          html += "<div class=\"text\">" + esc(loc.text) + "</div>";
          html += "</div>";
        });
        html += "</div>";
        break;

      case "card":
        if (slide.body) html += slide.body;
        if (slide.bullets && slide.bullets.length) {
          html += "<ul class=\"deck-bullets\">";
          slide.bullets.forEach(function (b) {
            html += "<li>" + b + "</li>";
          });
          html += "</ul>";
        }
        break;

      case "learned":
        if (slide.items && slide.items.length) {
          html += "<ol class=\"deck-bullets\" style=\"padding-left:28px;\">";
          slide.items.forEach(function (it) {
            html += "<li>" + it + "</li>";
          });
          html += "</ol>";
        }
        break;

      default:
        if (slide.body) html += "<p>" + esc(slide.body) + "</p>";
        break;
    }

    return html;
  }

  function draw() {
    var stage = document.getElementById("deck-slide-content");
    var dotsContainer = document.getElementById("deck-dots");
    var counter = document.getElementById("deck-counter");
    var prevBtn = document.getElementById("deck-prev");
    var nextBtn = document.getElementById("deck-next");

    if (!slides.length) {
      if (stage) stage.innerHTML = "<p>No slides found for this week.</p>";
      return;
    }

    if (currentSlide < 0) currentSlide = 0;
    if (currentSlide >= slides.length) currentSlide = slides.length - 1;

    if (stage) {
      stage.innerHTML = renderSlideContent(slides[currentSlide]);
    }

    if (counter) {
      counter.textContent = "Slide " + (currentSlide + 1) + " of " + slides.length;
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = "";
      slides.forEach(function (_, idx) {
        var dot = document.createElement("div");
        dot.className = "deck-dot" + (idx === currentSlide ? " active" : "");
        dot.addEventListener("click", function () {
          currentSlide = idx;
          draw();
        });
        dotsContainer.appendChild(dot);
      });
    }

    if (prevBtn) prevBtn.disabled = (currentSlide === 0);
    if (nextBtn) nextBtn.disabled = (currentSlide === slides.length - 1);
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      draw();
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      currentSlide--;
      draw();
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  async function boot() {
    try {
      var res = await fetch("deck.json?v=" + Date.now());
      deckData = await res.json();
    } catch (e) {
      console.error("Failed to load deck.json", e);
      return;
    }

    var weekParam = getQueryParam("week");
    currentWeek = weekParam ? Number(weekParam) : 2;
    if (!deckData.weeks[String(currentWeek)]) {
      currentWeek = 2;
    }

    var sel = document.getElementById("deck-week-select");
    if (sel) {
      sel.innerHTML = Object.keys(deckData.weeks).map(function (k) {
        var w = deckData.weeks[k];
        return "<option value=\"" + w.week + "\"" + (w.week === currentWeek ? " selected" : "") + ">Week " + w.week + ": " + esc(w.title) + "</option>";
      }).join("");

      sel.addEventListener("change", function () {
        currentWeek = Number(sel.value);
        slides = (deckData.weeks[String(currentWeek)] && deckData.weeks[String(currentWeek)].slides) || [];
        currentSlide = 0;
        draw();
      });
    }

    slides = (deckData.weeks[String(currentWeek)] && deckData.weeks[String(currentWeek)].slides) || [];
    currentSlide = 0;

    var prevBtn = document.getElementById("deck-prev");
    var nextBtn = document.getElementById("deck-next");
    var fsBtn = document.getElementById("deck-fullscreen");

    if (prevBtn) prevBtn.addEventListener("click", prevSlide);
    if (nextBtn) nextBtn.addEventListener("click", nextSlide);
    if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);

    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp" || e.key === "Backspace") {
        e.preventDefault();
        prevSlide();
      }
    });

    // Touch swipe support for phones and tablets
    var touchStartX = 0;
    var touchEndX = 0;
    window.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, false);
    window.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 45) {
        if (diff > 0) nextSlide();
        else prevSlide();
      }
    }, false);

    draw();
  }

  root.BneiDeck = {
    boot: boot,
    nextSlide: nextSlide,
    prevSlide: prevSlide,
    renderSlideContent: renderSlideContent
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
"""

for d in ['public', 'docs']:
    with open(os.path.join(d, 'deck.js'), 'w', encoding='utf-8') as f:
        f.write(js_content)
print('Generated deck.js successfully')
