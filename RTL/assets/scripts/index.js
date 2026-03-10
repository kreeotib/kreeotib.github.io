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
class HeroAccelerator {
    constructor(selector = '.hero') {
        this.hero = document.querySelector(selector);
        if (!this.hero) return;

        this.track   = this.hero.closest('.hero-track') ?? this.hero.parentElement;
        this.content = this.hero.querySelector('.hero__content');

        this.init();
    }

    init() {
        window.addEventListener('scroll', () => this.update(), { passive: true });
        this.update();
    }

    static norm(value, inMin, inMax) {
        return Math.max(0, Math.min((value - inMin) / (inMax - inMin), 1));
    }

    update() {
        const scrollY     = window.scrollY;
        const vh          = window.innerHeight / 2;


        const trackTop    = this.track.getBoundingClientRect().top + scrollY;
        const trackHeight = this.track.offsetHeight;

        const localScroll = scrollY - trackTop;
        const scrollable  = trackHeight - vh;

        const progress    = Math.max(0, Math.min(localScroll / scrollable, 1));

        const textRise    = HeroAccelerator.norm(progress / 1.75, 0, 1.0);
        const textOpacity = 1 - HeroAccelerator.norm(progress / 1.5, 0.80, 1.0);
        const gradOpacity = HeroAccelerator.norm(progress , 0.0, 0.30);
        const gradFill    = HeroAccelerator.norm(progress / 1.25, 0.15, 0.8);
        const p           = gradFill / 2.25;

        this.hero.style.setProperty('--p',            p.toFixed(4));
        this.hero.style.setProperty('--grad-opacity', gradOpacity.toFixed(4));
        this.hero.style.setProperty('--sy',           localScroll.toFixed(0) + 'px');

        if (this.content) {
            const maxRise = vh * 3.1;
            this.content.style.transform = `translate3d(0, ${-(textRise * maxRise).toFixed(1)}px, 0)`;
            this.content.style.opacity   = textOpacity.toFixed(4);
        }
    }
}


document.addEventListener('DOMContentLoaded', () => {

});
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lenis
    const lenis = new Lenis({
        autoRaf: true,
        lerp: 0.1,

    });

    new HeroAccelerator('.hero');

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
            delay: 8000,
            disableOnInteraction: false,
        },
        on: {
            init: function () {
                const delay = geoSlider.params.autoplay.delay,
                    speed = geoSlider.params.speed;

                geoSliderElement.style.setProperty('--swiper-autoplay-delay', delay + speed + 'ms');
                geoSlider.autoplay.stop();
            },
            slideChangeTransitionStart() {
                const activeSlide = geoSlider.slides[geoSlider.activeIndex];
                const revealEl = activeSlide.querySelector('[data-reveal]');
                if (revealEl) {
                    TitleReveal.reset(revealEl);
                    TitleReveal.play(revealEl);
                }
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
            threshold: 0.3,
            rootMargin: '0px 0px -35% 0px'
        });

        observer.observe(geoSliderElement);
    }


    const principlesSliderElement = document.querySelector('.principles');
    const principlesSlider = new Swiper(principlesSliderElement, {
        init: false,
        slidesPerView: 'auto',
        spaceBetween: 24,
        speed: 500,
        breakpoints:{
            768:{
                spaceBetween:0,
            }
        },
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
        spaceBetween: 24,
        speed: 500,

        breakpoints:{
          768:{
              spaceBetween:0,
          }
        },
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

            video.muted = true;
            video.loop = false;

            const isLevelCard = card.classList.contains('card--level');

            if (isLevelCard) {
                let fadeTimeout = null;
                let isVideoEnded = false;

                const showPoster = (instant = false) => {
                    if (fadeTimeout) {
                        clearTimeout(fadeTimeout);
                        fadeTimeout = null;
                    }

                    if (instant) {
                        imgWrapper.classList.remove('hover', 'fade-to-poster');
                        return;
                    }

                    fadeTimeout = setTimeout(() => {
                        imgWrapper.classList.add('fade-to-poster');

                        const onTransitionEnd = () => {
                            imgWrapper.classList.remove('hover', 'fade-to-poster');
                            imgWrapper.removeEventListener('transitionend', onTransitionEnd);
                        };
                        imgWrapper.addEventListener('transitionend', onTransitionEnd);
                    }, 200);
                };

                const startVideo = async () => {
                    if (fadeTimeout) {
                        clearTimeout(fadeTimeout);
                        fadeTimeout = null;
                    }

                    video.currentTime = 0;
                    isVideoEnded = false;

                    imgWrapper.classList.remove('fade-to-poster');
                    imgWrapper.classList.add('hover');

                    try {
                        await video.play();
                    } catch (error) {
                        console.error(`Ошибка воспроизведения видео в карточке #${index + 1}:`, error);
                    }
                };

                const stopVideo = () => {
                    if (isVideoEnded) {
                        showPoster();
                        return;
                    }

                    video.pause();
                    showPoster();
                };

                video.addEventListener('ended', () => {
                    isVideoEnded = true;
                });

                card.addEventListener('mouseenter', startVideo);
                card.addEventListener('mouseleave', stopVideo);

                card.addEventListener('touchstart', () => {
                    if (!video.paused || isVideoEnded) {
                        stopVideo();
                    } else {
                        startVideo();
                    }
                }, { passive: true });
            } else {
                let animationFrame = null;
                let isPlaying = false;

                video.loop = true;

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

                card.addEventListener('mouseenter', startVideo);
                card.addEventListener('mouseleave', stopVideo);

                card.addEventListener('touchstart', () => {
                    if (!isPlaying) {
                        startVideo();
                    } else {
                        stopVideo();
                    }
                }, { passive: true });
            }
        });
    }


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
                scrollSpeed = Math.abs(st - lastScrollTop) * 0.5;
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