(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var currentSlide = 0;

  function showSlide(index) {
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === index);
    });
  }

  if (slides.length > 1) {
    showSlide(0);
    window.setInterval(function () {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5200);
  }

  var quickSearch = document.querySelector('[data-quick-search]');

  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = quickSearch.querySelector('input');
      var keyword = input ? input.value.trim() : '';
      var target = quickSearch.getAttribute('action') || 'search.html';
      window.location.href = keyword ? target + '?q=' + encodeURIComponent(keyword) : target;
    });
  }

  var searchInput = document.querySelector('[data-search-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card[data-search]'));
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var activeFilter = '';

  function getUrlKeyword() {
    try {
      return new URLSearchParams(window.location.search).get('q') || '';
    } catch (error) {
      return '';
    }
  }

  function applyFilter() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
      var matchedFilter = !activeFilter || text.indexOf(activeFilter.toLowerCase()) !== -1;
      var matched = matchedKeyword && matchedFilter;
      card.classList.toggle('hidden-card', !matched);
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (searchInput) {
    var urlKeyword = getUrlKeyword();
    if (urlKeyword) {
      searchInput.value = urlKeyword;
    }
    searchInput.addEventListener('input', applyFilter);
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (item) {
        item.classList.remove('active');
      });
      chip.classList.add('active');
      activeFilter = chip.getAttribute('data-filter-value') || '';
      applyFilter();
    });
  });

  if (cards.length) {
    applyFilter();
  }
})();
