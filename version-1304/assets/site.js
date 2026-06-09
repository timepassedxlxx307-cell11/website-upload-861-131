(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });

      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(current + 1);
      });
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        showSlide(itemIndex);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var filterRegion = document.querySelector("[data-filter-region]");
  var cardList = document.querySelector("[data-card-list]");
  var emptyState = document.querySelector("[data-empty-state]");

  function filterCards() {
    if (!cardList) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var region = filterRegion ? filterRegion.value : "";
    var cards = Array.prototype.slice.call(cardList.querySelectorAll(".movie-card"));
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-genre") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-type") || ""
      ].join(" ").toLowerCase();

      var regionValue = card.getAttribute("data-region") || "";
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchRegion = !region || regionValue === region || (region === "其他" && ["日本", "韩国", "中国大陆", "美国", "英国"].indexOf(regionValue) === -1);
      var isVisible = matchQuery && matchRegion;
      card.style.display = isVisible ? "" : "none";

      if (isVisible) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle("is-visible", visible === 0);
    }
  }

  if (filterInput) {
    filterInput.addEventListener("input", filterCards);
  }

  if (filterRegion) {
    filterRegion.addEventListener("change", filterCards);
  }

  var searchInput = document.querySelector("[data-search-page-input]");
  var results = document.getElementById("search-results");
  var searchEmpty = document.getElementById("search-empty");

  function getQuery() {
    return new URLSearchParams(window.location.search).get("q") || "";
  }

  function renderSearch(query) {
    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var value = query.trim().toLowerCase();
    results.innerHTML = "";

    if (!value) {
      if (searchEmpty) {
        searchEmpty.textContent = "输入关键词开始搜索。";
        searchEmpty.classList.add("is-visible");
      }
      return;
    }

    var matched = window.MOVIE_SEARCH_DATA.filter(function (item) {
      return item.text.indexOf(value) !== -1;
    }).slice(0, 80);

    matched.forEach(function (item) {
      var article = document.createElement("article");
      article.className = "movie-card";
      article.innerHTML = [
        "<a class=\"movie-card-link\" href=\"" + item.url + "\">",
        "<div class=\"poster-frame\"><img src=\"" + item.cover + "\" alt=\"" + item.title + "海报\" loading=\"lazy\"><span class=\"duration-pill\">" + item.year + "</span><span class=\"play-mark\">▶</span></div>",
        "<div class=\"movie-info\"><h3>" + item.title + "</h3><p>" + item.desc + "</p><div class=\"movie-meta\"><span>" + item.category + "</span><span>" + item.region + "</span><span>" + item.type + "</span></div></div>",
        "</a>"
      ].join("");
      results.appendChild(article);
    });

    if (searchEmpty) {
      if (matched.length) {
        searchEmpty.classList.remove("is-visible");
      } else {
        searchEmpty.textContent = "没有找到相关影片。";
        searchEmpty.classList.add("is-visible");
      }
    }
  }

  if (searchInput && results) {
    var query = getQuery();
    searchInput.value = query;
    renderSearch(query);
    searchInput.addEventListener("input", function () {
      renderSearch(searchInput.value);
    });
  }
})();
