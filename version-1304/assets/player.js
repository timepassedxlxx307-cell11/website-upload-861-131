(function () {
  function setupPlayer(container) {
    var video = container.querySelector("video");
    var button = container.querySelector("[data-play-button]");
    var stream = container.getAttribute("data-stream");
    var started = false;
    var hls = null;

    function playVideo() {
      if (!video || !stream) {
        return;
      }

      container.classList.add("is-playing");

      if (!started) {
        started = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else {
          video.src = stream;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", playVideo);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        }
      });

      video.addEventListener("play", function () {
        container.classList.add("is-playing");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  });
})();
