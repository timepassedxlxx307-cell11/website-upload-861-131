document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function startSlider() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                startSlider();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(active - 1);
                startSlider();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(active + 1);
                startSlider();
            });
        }

        showSlide(0);
        startSlider();
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    var cardList = document.querySelector('[data-card-list]');

    if (filterRoot && cardList) {
        var input = filterRoot.querySelector('[data-search-input]');
        var clearButton = filterRoot.querySelector('[data-clear-search]');
        var sortSelect = filterRoot.querySelector('[data-sort-select]');
        var cards = Array.prototype.slice.call(cardList.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function getText(card) {
            return [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.genre,
                card.dataset.tags,
                card.dataset.year
            ].join(' ').toLowerCase();
        }

        function applyFilter() {
            var words = input ? input.value.trim().toLowerCase().split(/\s+/).filter(Boolean) : [];

            cards.forEach(function (card) {
                var text = getText(card);
                var matched = words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
                card.classList.toggle('hidden-card', !matched);
            });
        }

        function applySort() {
            if (!sortSelect) {
                return;
            }

            var value = sortSelect.value;
            var sorted = cards.slice();

            sorted.sort(function (a, b) {
                if (value === 'year-desc') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (value === 'score-desc') {
                    return Number(b.dataset.score || 0) - Number(a.dataset.score || 0);
                }
                if (value === 'heat-desc') {
                    return Number(b.dataset.heat || 0) - Number(a.dataset.heat || 0);
                }
                if (value === 'title-asc') {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                }
                return cards.indexOf(a) - cards.indexOf(b);
            });

            sorted.forEach(function (card) {
                cardList.appendChild(card);
            });
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        if (clearButton && input) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                applyFilter();
                input.focus();
            });
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', function () {
                applySort();
                applyFilter();
            });
        }

        applySort();
        applyFilter();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var url = player.getAttribute('data-hls-url');
        var loaded = false;
        var hls = null;

        function loadVideo() {
            if (!video || !url) {
                return;
            }

            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                } else {
                    video.src = url;
                }
                loaded = true;
            }

            video.controls = true;

            if (button) {
                button.classList.add('hidden');
            }

            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.controls = true;
                    if (button) {
                        button.classList.remove('hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', loadVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!loaded || video.paused) {
                    loadVideo();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
});
