var MoviePlayer = (function () {
  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector("script[data-hls-loader]");
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(window.Hls);
        });
        existing.addEventListener("error", reject);
        return;
      }
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
      script.async = true;
      script.setAttribute("data-hls-loader", "true");
      script.addEventListener("load", function () {
        resolve(window.Hls);
      });
      script.addEventListener("error", reject);
      document.head.appendChild(script);
    });
  }

  function mount(options) {
    var video = document.getElementById(options.videoId);
    var button = document.querySelector(options.buttonSelector);
    var shell = document.querySelector("[data-player-shell]");
    var started = false;
    var hlsInstance = null;

    if (!video || !options.source) {
      return;
    }

    if (options.poster) {
      video.setAttribute("poster", options.poster);
    }

    function hideButton() {
      if (button) {
        button.classList.add("is-hidden");
      }
      if (shell) {
        shell.classList.add("is-playing");
      }
    }

    function playVideo() {
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    function attachWithHls(HlsConstructor) {
      if (!HlsConstructor || !HlsConstructor.isSupported()) {
        video.src = options.source;
        playVideo();
        return;
      }
      if (!hlsInstance) {
        hlsInstance = new HlsConstructor({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(options.source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(HlsConstructor.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
      } else {
        playVideo();
      }
    }

    function start() {
      hideButton();
      if (started) {
        playVideo();
        return;
      }
      started = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
        playVideo();
        return;
      }
      loadHls().then(attachWithHls).catch(function () {
        video.src = options.source;
        playVideo();
      });
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        start();
      });
    }

    video.addEventListener("click", function () {
      if (!started || video.paused) {
        start();
      }
    });
  }

  return {
    mount: mount
  };
})();
