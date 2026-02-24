class CounterAnimator {
    constructor(options = {}) {
        this.options = {
            threshold: 0.3,
            rootMargin: '0px',
            ...options
        };

        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), this.options);
    }

    animateCounter(element, start, end, duration = 1000, delay = 0) {
        setTimeout(() => {
            const startTime = performance.now();
            const difference = end - start;

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const currentValue = Math.floor(start + difference * easeProgress);
                element.setAttribute('data-count', currentValue.toLocaleString('ru-RU'));

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.setAttribute('data-count', end.toLocaleString('ru-RU'));
                }
            };

            requestAnimationFrame(update);
        }, delay);
    }

    handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const block = entry.target;
                const counters = block.querySelectorAll('.counter[data-end]');

                counters.forEach((counter, index) => {
                    const endValue = parseInt(counter.getAttribute('data-end')) || 0;
                    const delay = (index + 1) * 1000;
                    this.animateCounter(counter, 0, endValue, delay, 0);
                });

                observer.unobserve(block);
            }
        });
    }

    observeCounters(selector = '.counters-block') {
        const counterBlocks = document.querySelectorAll(selector);

        if (counterBlocks.length) {
            counterBlocks.forEach(block => {
                const counters = block.querySelectorAll('.counter[data-end]');
                if (counters.length) {
                    counters.forEach(counter => counter.setAttribute('data-count', '0'));
                    this.observer.observe(block);
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const geoSliderElement = document.querySelector('.geo-slider');
    const geoSlider = new Swiper(geoSliderElement, {
        init: false,
        slidesPerView: 1,
        spaceBetween: 0,
        speed:500,
        effect:'fade',
        horizontalClass: 'slider',
        fadeEffect: {
            crossFade: true
        },
        pagination: {
            el: '.geo-slider__pagination',
            type: 'bullets',
            horizontalClass:'slider__pagination',
            bulletClass: 'geo-slider__bullet',
            bulletActiveClass: 'geo-slider__bullet--active',
        },

        autoplay: {
            delay: 6000,
        },
        on: {
            init: function () {
                const delay = geoSlider.params.autoplay.delay,
                    speed = geoSlider.params.speed;
                geoSliderElement.style.setProperty('--swiper-autoplay-delay', delay + speed + 'ms');
            }
        }
    });


    if (geoSliderElement) {
        geoSlider.init();
    }
    // const personSliderNavElement = document.querySelector('.person-navigation');
    // const personSliderNav = new Swiper(personSliderNavElement, {
    //     init: false,
    //     slidesPerView:'auto',
    //     spaceBetween: 0,
    // });
    //
    //
    // if (personSliderNavElement) {
    //     personSliderNav.init();
    // }
    //
    // const personSliderElement = document.querySelector('.person-slider');
    // const personSlider = new Swiper(personSliderElement, {
    //     init: false,
    //     slidesPerView: 1,
    //     spaceBetween: 0,
    //     speed:500,
    //     effect:'fade',
    //     thumbs:{
    //         swiper:personSliderNav,
    //     },
    //     fadeEffect: {
    //         crossFade: true
    //     }
    // });
    //
    //
    // if (personSliderElement) {
    //     personSlider.init();
    // }

    const projectSliderElement = document.querySelector('.project-slider');
    const projectSlider = new Swiper(projectSliderElement, {
        init: false,
        slidesPerView: 'auto',
        spaceBetween: 24,
        speed:500,
        navigation:{
            prevEl:'.project-slider-button-prev',
            nextEl:'.project-slider-button-next'
        }
    });


    if (projectSliderElement) {
        projectSlider.init();
    }

    const productCards = document.querySelectorAll('.project-item, .card');
    if (productCards.length) {
        productCards.forEach((card, index) => {
            const video = card.querySelector('video');
            const imgWrapper = card.querySelector('.card__video') || card.querySelector('.project-item__img');

            if (!video || !imgWrapper) return;

            let animationFrame = null;
            let isPlaying = false;

            const playReverse = () => {
                if (video.currentTime <= 0) {
                    cancelAnimationFrame(animationFrame);
                    imgWrapper.classList.remove('hover');
                    isPlaying = false;
                    return;
                }

                video.currentTime = Math.max(0, video.currentTime - 0.033);
                animationFrame = requestAnimationFrame(playReverse);
            };

            const startVideo = async () => {
                if (isPlaying) return;

                try {
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                        animationFrame = null;
                    }

                    video.playbackRate = 1;
                    imgWrapper.classList.add('hover');
                    await video.play();
                    isPlaying = true;
                } catch (error) {
                    console.error(`Ошибка воспроизведения видео в карточке #${index + 1}:`, error);
                }
            };

            const stopVideo = () => {
                try {
                    video.pause();
                    playReverse();
                } catch (error) {
                    console.error(`Ошибка реверса видео в карточке #${index + 1}:`, error);
                }
            };

            // Для десктопа
            card.addEventListener('mouseenter', startVideo);
            card.addEventListener('mouseleave', stopVideo);

            // Для мобильных устройств
            card.addEventListener('touchstart', (e) => {
                if (!isPlaying) {
                    startVideo();
                } else {
                    stopVideo();
                }
            }, { passive: true });

            video.muted = true;
            video.loop = true;
        });
    }
    const animator = new CounterAnimator({
        threshold: 0.3,
        rootMargin: '0px 0px -25% 0px',
    });

    const initPageAnimations = () => {
        animator.observeCounters('.counters-block');
    };

    initPageAnimations();


    const marquee = document.querySelector('.marquee');
    const marqueeContent = marquee.querySelector('.marquee-content');

    const clone = marqueeContent.cloneNode(true);
    marquee.appendChild(clone);

    let position = 0;
    const speed = 1;

    function animate() {
        position -= speed;

        if (Math.abs(position) >= marqueeContent.offsetWidth) {
            position = 0;
        }

        marquee.style.transform = `translate3d(${position}px, 0, 0)`;
        requestAnimationFrame(animate);
    }

    animate();
})