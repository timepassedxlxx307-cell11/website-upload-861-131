(function () {
  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
      var prev = carousel.querySelector("[data-hero-prev]");
      var next = carousel.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;
      var show = function (nextIndex) {
        if (!slides.length) {
          return;
        }
        slides[index].classList.remove("is-active");
        index = (nextIndex + slides.length) % slides.length;
        slides[index].classList.add("is-active");
      };
      var play = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      var restart = function () {
        window.clearInterval(timer);
        play();
      };
      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }
      play();
    }

    var heroSearch = document.querySelector("[data-hero-search]");
    if (heroSearch) {
      heroSearch.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = heroSearch.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        window.location.href = "./search.html" + (query ? "?q=" + encodeURIComponent(query) : "");
      });
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var searchInput = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var regionFilter = document.querySelector("[data-region-filter]");
    var genreFilter = document.querySelector("[data-genre-filter]");
    var empty = document.querySelector("[data-no-results]");

    if (cards.length && (searchInput || yearFilter || regionFilter || genreFilter)) {
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get("q") || "";
      if (searchInput && queryFromUrl) {
        searchInput.value = queryFromUrl;
      }

      var apply = function () {
        var keyword = normalize(searchInput ? searchInput.value : "");
        var year = normalize(yearFilter ? yearFilter.value : "");
        var region = normalize(regionFilter ? regionFilter.value : "");
        var genre = normalize(genreFilter ? genreFilter.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-category"),
            card.getAttribute("data-type"),
            card.textContent
          ].join(" "));
          var ok = true;

          if (keyword && text.indexOf(keyword) === -1) {
            ok = false;
          }
          if (year && normalize(card.getAttribute("data-year")) !== year) {
            ok = false;
          }
          if (region && normalize(card.getAttribute("data-region")).indexOf(region) === -1) {
            ok = false;
          }
          if (genre && normalize(card.getAttribute("data-genre")).indexOf(genre) === -1 && text.indexOf(genre) === -1) {
            ok = false;
          }

          card.classList.toggle("is-filtered", !ok);
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      };

      [searchInput, yearFilter, regionFilter, genreFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      apply();
    }
  });
})();
