class CounterAnimator {
    constructor(options = {}) {
        this.options = {
            threshold: 0.3,
            rootMargin: '0px',
            ...options
        };

        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), this.options);
    }

    animateCounter(element, start, rawEnd, duration = 1500, delay = 0) {
        const match = rawEnd.toString().match(/([^0-9]*)([0-9]+)([^0-9]*)/);

        if (!match) return;

        const prefix = match[1] || '';
        const endValue = parseInt(match[2], 10);
        const suffix = match[3] || '';

        setTimeout(() => {
            const startTime = performance.now();
            const difference = endValue - start;

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const currentValue = Math.floor(start + difference * easeProgress);
                const formattedNumber = currentValue.toLocaleString('ru-RU');

                element.setAttribute('data-count', `${prefix}${formattedNumber}${suffix}`);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.setAttribute('data-count', `${prefix}${endValue.toLocaleString('ru-RU')}${suffix}`);
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
                    const rawValue = counter.getAttribute('data-end') || '0';
                    const delay = index * 200;
                    this.animateCounter(counter, 0, rawValue, 1500, delay);
                });

                observer.unobserve(block);
            }
        });
    }

    observeCounters(selector = '.counters-block') {
        const counterBlocks = document.querySelectorAll(selector);

        counterBlocks.forEach(block => {
            const counters = block.querySelectorAll('.counter[data-end]');
            counters.forEach(counter => {
                const rawValue = counter.getAttribute('data-end') || '0';
                const parts = rawValue.match(/([^0-9]*)([0-9]+)([^0-9]*)/);
                const initial = parts ? `${parts[1]}0${parts[3]}` : '0';

                counter.setAttribute('data-count', initial);
                this.observer.observe(block);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const geoSliderElement = document.querySelector('.geo-slider');
    const geoSlider = new Swiper(geoSliderElement, {
        init: false,
        slidesPerView: 1,
        spaceBetween: 0,
        speed: 500,
        effect: 'fade',
        horizontalClass: 'slider',
        fadeEffect: {
            crossFade: true,
            disableOnInteraction: false
        },
        pagination: {
            el: '.geo-slider__pagination',
            type: 'bullets',
            horizontalClass: 'slider__pagination',
            bulletClass: 'geo-slider__bullet',
            bulletActiveClass: 'geo-slider__bullet--active',
        },
        autoplay: {
            delay: 6000,
            disableOnInteraction: false,
        },
        on: {
            init: function () {
                const delay = geoSlider.params.autoplay.delay,
                    speed = geoSlider.params.speed;
                geoSliderElement.style.setProperty('--swiper-autoplay-delay', delay + speed + 'ms');

                geoSlider.autoplay.stop();
            }
        }
    });

    if (geoSliderElement) {
        geoSlider.init();

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    geoSliderElement.classList.add('involved')
                    geoSlider.autoplay.start();
                    const delay = geoSlider.params.autoplay.delay,
                        speed = geoSlider.params.speed;
                    geoSliderElement.style.setProperty('--swiper-autoplay-delay', delay + speed + 'ms');
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(geoSliderElement);
    }


    const principlesSliderElement = document.querySelector('.principles');
    const principlesSlider = new Swiper(principlesSliderElement, {
        init: false,
        slidesPerView: 'auto',
        spaceBetween: 0,
        speed: 500,
        pagination: {
            el: '.principles-pagination',
            type: 'bullets',
            horizontalClass: 'slider__pagination',
            bulletClass: 'slider-pagination__bullet',
            bulletActiveClass: 'slider-pagination__bullet--active',
        },
    });

    if (principlesSliderElement) {
            principlesSlider.init();
    }

    const levelsSliderElement = document.querySelector('.levels');
    const levelsSlider = new Swiper(levelsSliderElement, {
        init: false,
        slidesPerView: 'auto',
        spaceBetween: 0,
        speed: 500,
        pagination: {
            el: '.levels-pagination',
            type: 'bullets',
            horizontalClass: 'slider__pagination',
            bulletClass: 'slider-pagination__bullet',
            bulletActiveClass: 'slider-pagination__bullet--active',
        },
    });

    if (levelsSliderElement) {
        levelsSlider.init();
    }

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

    const marquees = document.querySelectorAll('.marquee');

    marquees.forEach(marquee => {
        const marqueeContent = marquee.querySelector('.marquee-content');
        const isHero = marquee.classList.contains('marquee--hero');

        const clone = marqueeContent.cloneNode(true);
        marquee.appendChild(clone);

        let position = 0;
        const baseSpeed = 1;
        let scrollSpeed = 0;
        let lastScrollTop = 0;

        if (isHero) {
            window.addEventListener('scroll', () => {
                const st = window.pageYOffset || document.documentElement.scrollTop;
                scrollSpeed = Math.abs(st - lastScrollTop) * 0.2;
                lastScrollTop = st <= 0 ? 0 : st;
            }, { passive: true });
        }

        function animate() {
            let currentSpeed = baseSpeed + scrollSpeed;

            position -= currentSpeed;

            if (Math.abs(position) >= marqueeContent.offsetWidth) {
                position = 0;
            }

            marquee.style.transform = `translate3d(${position}px, 0, 0)`;

            if (isHero && scrollSpeed > 0) {
                scrollSpeed *= 0.95;
                if (scrollSpeed < 0.01) scrollSpeed = 0;
            }

            requestAnimationFrame(animate);
        }

        animate();
    });


    const header = document.querySelector('.header');
    if(pageYOffset> header.getBoundingClientRect().height){
        header.classList.add('sticky')
    }else{
        header.classList.remove('sticky');
    }
    window.addEventListener('scroll',e=>{
        if(pageYOffset> header.getBoundingClientRect().height){
            header.classList.add('sticky')
        }else{
            header.classList.remove('sticky');
        }
    })


})