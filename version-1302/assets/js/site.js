(function () {
  'use strict';

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function openMobileMenu() {
    var toggle = qs('[data-menu-toggle]');
    var panel = qs('[data-menu-panel]');

    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupSearchForms() {
    qsa('.js-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var keyword = input ? input.value.trim() : '';

        if (!keyword) {
          return;
        }

        var target = form.getAttribute('action') || 'search.html';
        window.location.href = target + '?q=' + encodeURIComponent(keyword);
      });
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var previous = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10));
        start();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupCardFilters() {
    qsa('[data-filter-input]').forEach(function (input) {
      var targetSelector = input.getAttribute('data-filter-target') || '[data-card-grid]';
      var grid = qs(targetSelector);
      var cards = grid ? qsa('[data-card]', grid) : [];

      function applyFilter() {
        var keyword = normalize(input.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-search'));
          var match = !keyword || haystack.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !match);

          if (match) {
            visible += 1;
          }
        });

        input.setAttribute('data-visible-count', visible.toString());
      }

      input.addEventListener('input', applyFilter);

      qsa('[data-filter-chip]').forEach(function (chip) {
        chip.addEventListener('click', function () {
          input.value = chip.getAttribute('data-filter-chip') || '';
          applyFilter();
          input.focus();
        });
      });

      applyFilter();
    });
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="poster-wrap" href="' + escapeAttribute(movie.url) + '" aria-label="观看 ' + escapeAttribute(movie.title) + '">',
      '    <img src="' + escapeAttribute(movie.cover) + '" alt="' + escapeAttribute(movie.title) + '" loading="lazy">',
      '    <span class="play-badge">▶</span>',
      '    <span class="duration-badge">' + escapeHtml(movie.duration) + '</span>',
      '  </a>',
      '  <div class="card-body">',
      '    <div class="card-meta">',
      '      <a href="' + escapeAttribute(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
      '      <span>' + escapeHtml(movie.year) + '</span>',
      '    </div>',
      '    <h3><a href="' + escapeAttribute(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <div class="card-stats">',
      '      <span>' + formatNumber(movie.views) + ' 观看</span>',
      '      <span>' + formatNumber(movie.likes) + ' 喜欢</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function setupSearchPage() {
    var input = qs('[data-search-page-input]');
    var button = qs('[data-search-page-button]');
    var results = qs('[data-search-results]');
    var summary = qs('[data-search-summary]');

    if (!input || !results || !summary || !window.MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get('q') || '';
    input.value = initialKeyword;

    function render() {
      var keyword = normalize(input.value);
      var data = window.MOVIE_INDEX || [];
      var matched = keyword
        ? data.filter(function (movie) {
            return normalize(movie.searchText).indexOf(keyword) !== -1;
          })
        : [];

      if (!keyword) {
        summary.textContent = '请输入关键词开始搜索。';
        results.innerHTML = '';
        return;
      }

      summary.textContent = '找到 ' + matched.length + ' 部与“' + input.value.trim() + '”相关的影片。';
      results.innerHTML = matched.slice(0, 240).map(createSearchCard).join('');

      if (matched.length > 240) {
        summary.textContent += ' 当前展示前 240 部，可继续输入更精确关键词。';
      }
    }

    input.addEventListener('input', render);

    if (button) {
      button.addEventListener('click', render);
    }

    render();
  }

  function setupPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var playButton = qs('[data-player-play]', player);
      var overlay = qs('[data-player-overlay]', player);
      var status = qs('[data-player-status]', player);
      var src = player.getAttribute('data-src');
      var hlsInstance = null;
      var initialized = false;

      if (!video || !src) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function initialize() {
        if (initialized) {
          return Promise.resolve();
        }

        initialized = true;
        setStatus('正在加载高清片源...');

        if (window.Hls && window.Hls.isSupported()) {
          return new Promise(function (resolve) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              setStatus('');
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus('视频加载失败，请稍后重试或更换浏览器。');
              }
            });
          });
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
          return Promise.resolve();
        }

        setStatus('当前浏览器不支持 HLS 播放，请使用支持 MSE 的现代浏览器。');
        return Promise.reject(new Error('HLS is not supported'));
      }

      function play() {
        initialize().then(function () {
          return video.play();
        }).then(function () {
          player.classList.add('is-playing');
        }).catch(function () {
          setStatus('点击播放器上的播放按钮继续。');
        });
      }

      if (playButton) {
        playButton.addEventListener('click', play);
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          if (event.target === overlay) {
            play();
          }
        });
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });

    qsa('[data-player-scroll]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = qs('[data-player]');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var button = qs('[data-player-play]', player);
          if (button) {
            button.click();
          }
        }
      });
    });
  }

  function formatNumber(value) {
    var number = Number(value) || 0;

    if (number >= 10000) {
      return (number / 10000).toFixed(1) + '万';
    }

    return String(number);
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  document.addEventListener('DOMContentLoaded', function () {
    openMobileMenu();
    setupSearchForms();
    setupHero();
    setupCardFilters();
    setupSearchPage();
    setupPlayers();
  });
}());
