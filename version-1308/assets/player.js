(function () {
    function setupMoviePlayer(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var url = options.url;
        var hls = null;
        var started = false;

        if (!video || !url) {
            return;
        }

        function loadAndPlay() {
            if (started) {
                video.play().catch(function () {});
                return;
            }

            started = true;

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(url);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = url;
            video.play().catch(function () {});
        }

        if (overlay) {
            overlay.addEventListener("click", loadAndPlay);
        }

        video.addEventListener("click", function () {
            if (!started) {
                loadAndPlay();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
