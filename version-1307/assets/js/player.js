(function () {
  function initPlayer() {
    var player = document.querySelector('[data-player]');

    if (!player) {
      return;
    }

    var video = player.querySelector('video');
    var trigger = player.querySelector('[data-play-trigger]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-video-url') || '';
    var hls = null;
    var ready = false;

    function attachSource() {
      if (ready || !source) {
        return;
      }

      ready = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function startPlayback() {
      attachSource();
      video.controls = true;

      if (trigger) {
        trigger.classList.add('is-hidden');
      }

      var playback = video.play();

      if (playback && typeof playback.catch === 'function') {
        playback.catch(function () {
          video.controls = true;
        });
      }
    }

    if (trigger) {
      trigger.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlayer);
  } else {
    initPlayer();
  }
})();
