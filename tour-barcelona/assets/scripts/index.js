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
                videoElementWrapper = video.querySelector(".video-item__element"),
                videoMute = video.querySelector('.video-item__mute');

            if (videoElement && videoMute) {
                videoMute.classList.toggle('unmuted', !videoElement.muted)
                videoMute.addEventListener('click', e => {
                    e.preventDefault();

                    videoElement.muted = !videoElement.muted;
                    videoMute.classList.toggle('unmuted', !videoElement.muted)
                });
            }

            video.addEventListener('click', e => {
                if (!e.target.closest('.video-item__mute') && video.classList.contains("video-item--toggle")) {
                    videoElement.paused ? videoElement.play() : videoElement.pause();
                }
            })
        })
    }

    const yachtSliderNavElement = document.querySelector('.yacht-slider-nav'),
        yachtSliderMainElement = document.querySelector('.yacht-slider-main');

    if (yachtSliderMainElement && yachtSliderNavElement) {
        const yachtSliderNav = new Swiper(".yacht-slider-nav", {
            spaceBetween: 10,
            slidesPerView: 5,
            freeMode: true,
            watchSlidesProgress: true,
        });
        const yachtSliderMain = new Swiper(".yacht-slider-main", {
            spaceBetween: 10,
            thumbs: {
                swiper: yachtSliderNav,
            },
        });
        const allVideo = yachtSliderMainElement.querySelectorAll('video');

        if (allVideo.length) {
            yachtSliderMain.on("slideChange", (e) => {
                const currentSlide = yachtSliderMain.slides[yachtSliderMain.activeIndex],
                    video = currentSlide.querySelector('video');
                allVideo.forEach(el => {
                    el.pause();
                })
                if (video) {
                    video.play();
                }
            });
        }
    }

    const faqItemArray = document.querySelectorAll('.faq-item');

    if (faqItemArray.length) {
        faqItemArray.forEach(faqItem => {
            const faqItemHeader = faqItem.querySelector('.faq-item__header');

            console.log(faqItemHeader);
            faqItemHeader.addEventListener("click", e => {
                faqItem.classList.toggle('active');
            })
        })
    }

    const toursSliderElement = document.querySelector('.tours-slider');

    if(toursSliderElement){
        const toursSlider = new Swiper(".tours-slider", {
            spaceBetween: 10,
            effect:"fade",
            fadeEffect: {
                crossFade: true,
            },
            navigation: {
                nextEl: ".tours-slider-button-next",
                prevEl: ".tours-slider-button-prev",
            },
        });
    }
})
