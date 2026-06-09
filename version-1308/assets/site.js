(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector(".mobile-menu-button");
        var menu = document.querySelector(".mobile-menu");
        if (menuButton && menu) {
            menuButton.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-arrow.prev");
        var next = document.querySelector(".hero-arrow.next");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        }

        function startHero() {
            if (slides.length < 2) {
                return;
            }
            stopHero();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startHero();
            });
        }

        showSlide(0);
        startHero();

        document.addEventListener("visibilitychange", function () {
            if (document.hidden) {
                stopHero();
            } else {
                startHero();
            }
        });

        Array.prototype.slice.call(document.querySelectorAll("[data-search-input]")).forEach(function (input) {
            var scopeSelector = input.getAttribute("data-search-scope") || "body";
            var scope = document.querySelector(scopeSelector) || document.body;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
            var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
            var empty = scope.querySelector("[data-search-empty]");
            var currentFilter = "";

            function applyFilter() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var searchText = (card.getAttribute("data-search") || "").toLowerCase();
                    var filterText = (card.getAttribute("data-filter") || "").toLowerCase();
                    var keywordMatch = !query || searchText.indexOf(query) !== -1;
                    var filterMatch = !currentFilter || filterText.indexOf(currentFilter.toLowerCase()) !== -1;
                    var matched = keywordMatch && filterMatch;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            input.addEventListener("input", applyFilter);
            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    chips.forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    chip.classList.add("is-active");
                    currentFilter = chip.getAttribute("data-filter-value") || "";
                    applyFilter();
                });
            });
            applyFilter();
        });
    });
})();
