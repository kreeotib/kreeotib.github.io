document.addEventListener("DOMContentLoaded", () => {
    const burger = document.querySelector('.burger'),
        headerNav = document.querySelector('.header-nav');

    if (burger && headerNav) {
        burger.addEventListener('click', e => {
            e.preventDefault();

            burger.classList.toggle('burger--active');
            headerNav.classList.toggle('header-nav--active')
        })
    }


    const videoItemArray = document.querySelectorAll('.video-item');

    if (videoItemArray.length) {
        videoItemArray.forEach(video => {
            const videoElement = video.querySelector('.video-item__element video'),
                videoMute = video.querySelector('.video-item__mute');

            if (!videoElement && !videoMute) return false;

            videoMute.classList.toggle('unmuted', !videoElement.muted)
            videoMute.addEventListener('click', e => {
                e.preventDefault();

                videoElement.muted = !videoElement.muted;
                videoMute.classList.toggle('unmuted', !videoElement.muted)
            })
        })
    }
})
