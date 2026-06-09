(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (navToggle && mobileNav) {
      navToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    setupHeroCarousel();
    setupFilters();
    setupPlayers();
  });

  function setupHeroCarousel() {
    var carousel = document.querySelector("[data-carousel='hero']");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var current = 0;

    if (slides.length <= 1) {
      return;
    }

    function activate(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        activate(Number(dot.getAttribute("data-target")) || 0);
      });
    });

    setInterval(function () {
      activate(current + 1);
    }, 5000);
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".filter-scope"));
    var input = document.querySelector(".filter-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));

    if (!scopes.length || (!input && !selects.length)) {
      return;
    }

    var query = new URLSearchParams(window.location.search).get("q");

    if (query && input) {
      input.value = query;
    }

    function normalized(value) {
      return String(value || "").trim().toLowerCase();
    }

    function matches(card, keyword, filters) {
      var text = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }

      return Object.keys(filters).every(function (name) {
        var expected = filters[name];

        if (!expected) {
          return true;
        }

        return normalized(card.getAttribute("data-" + name)) === expected;
      });
    }

    function applyFilters() {
      var keyword = normalized(input ? input.value : "");
      var filters = {};

      selects.forEach(function (select) {
        filters[select.getAttribute("data-filter")] = normalized(select.value);
      });

      scopes.forEach(function (scope) {
        Array.prototype.slice.call(scope.querySelectorAll(".movie-card")).forEach(function (card) {
          card.classList.toggle("is-filter-hidden", !matches(card, keyword, filters));
        });
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    selects.forEach(function (select) {
      select.addEventListener("change", applyFilters);
    });

    applyFilters();
  }

  function setupPlayers() {
    Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var streamUrl = box.getAttribute("data-stream");
      var started = false;
      var hlsInstance = null;

      if (!video || !streamUrl || !overlay) {
        return;
      }

      function attachStream() {
        if (started) {
          return;
        }

        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function start() {
        attachStream();
        overlay.classList.add("is-hidden");
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (!started || video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }
})();
