(function () {
  function initMoviePlayer(streamUrl, posterUrl) {
    var video = document.getElementById("movie-player");
    var button = document.querySelector("[data-player-button]");
    var frame = document.querySelector("[data-player-frame]");
    var loaded = false;
    var hls = null;

    if (!video || !button || !streamUrl) {
      return;
    }

    if (posterUrl) {
      video.setAttribute("poster", posterUrl);
    }

    function bindStream() {
      if (loaded) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          }
        });
        return;
      }

      video.src = streamUrl;
    }

    function start() {
      bindStream();
      button.classList.add("is-hidden");
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("play", function () {
      button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });

    if (frame) {
      frame.addEventListener("click", function (event) {
        if (event.target === frame) {
          start();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
