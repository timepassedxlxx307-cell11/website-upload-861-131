(function () {
    var mobileButton = document.querySelector('[data-mobile-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (mobileButton && mobilePanel) {
        mobileButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var heroTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    function startHero() {
        if (heroTimer) {
            window.clearInterval(heroTimer);
        }
        if (slides.length > 1) {
            heroTimer = window.setInterval(function () {
                showSlide(currentSlide + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    showSlide(0);
    startHero();

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
        var root = panel.parentElement || document;
        var input = panel.querySelector('[data-search-input]');
        var year = panel.querySelector('[data-year-filter]');
        var type = panel.querySelector('[data-type-filter]');
        var cards = Array.prototype.slice.call(root.querySelectorAll('.searchable-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : '');
            var yearValue = normalize(year ? year.value : '');
            var typeValue = normalize(type ? type.value : '');

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category')
                ].join(' '));
                var yearMatch = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
                var typeMatch = !typeValue || normalize(card.getAttribute('data-type')) === typeValue;
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                card.classList.toggle('hidden-by-filter', !(yearMatch && typeMatch && keywordMatch));
            });
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    });

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));

    players.forEach(function (frame) {
        var video = frame.querySelector('video');
        var button = frame.querySelector('[data-play-button]');
        var stream = frame.getAttribute('data-stream');
        var hlsInstance = null;
        var ready = false;

        function attachStream() {
            if (!video || ready || !stream) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            ready = true;
        }

        function playVideo() {
            if (!video) {
                return;
            }

            attachStream();
            frame.classList.add('is-playing');
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                frame.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    frame.classList.remove('is-playing');
                }
            });
            video.addEventListener('ended', function () {
                frame.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
