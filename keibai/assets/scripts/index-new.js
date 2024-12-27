class Animations {
    constructor() {
        this.animationWrapperArray = document.querySelectorAll('.animation-wrapper');
    }

    toggleAnimation(animationWrapperElement) {
        const animationItemArray = animationWrapperElement.querySelectorAll('.animation-item');

        // if preloader present need to set value (preloader animation end + 0.5) if(preloader transition .5s) 1
        const counter = animationWrapperElement.closest('.hero') && document.querySelector('.preloader') ? 1.5 : 0;

        animationItemArray.forEach((animationItemElement, animationItemIndex) => {
            animationItemElement.style.setProperty('--animation-delay', `${animationItemIndex * 0.2 + counter}s`);
            animationItemElement.classList.add('animated');
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.toggleAnimation(entry.target);
            }
        });
    }

    init() {
        if (!this.animationWrapperArray.length) return;

        const observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            // rootMargin:''
        });
        this.animationWrapperArray.forEach(animationWrapper => {
            observer.observe(animationWrapper);
        });
    }
}

window.addEventListener('load', () => {
    const videoBgItemArray = document.querySelectorAll('.video-bg__item');

    if (videoBgItemArray.length) {
        videoBgItemArray.forEach(video => {
            const videoElement = video.querySelector('video');

            if (videoElement) {
                videoElement.play();
                videoElement.controls = false;
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {


    const preloader = document.querySelector('.preloader');

    if (!preloader) {
        //animation init
        const animation = new Animations();
        animation.init();
    }

    const lenis = typeof Lenis !== 'undefined' ? new Lenis({smoothWheel: true, duration: 1.2}) : null;
    const gsapCheck = typeof gsap !== 'undefined';

    if (lenis) {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    }

    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        header = document.querySelector('.header');

    if (burger && menu) {
        burger.addEventListener('click', (e) => {
            e.preventDefault();

            burger.classList.toggle('burger--active');
            menu.classList.toggle('menu--active');
            header.classList.toggle('header--fixed');
            document.body.classList.toggle('no-scroll');

            lenis && !burger.classList.contains('active') ? lenis.stop() : lenis.start();
        });

        const anchorLinks = document.querySelectorAll('a[href^="#"]');

        if (anchorLinks.length) {
            anchorLinks.forEach(link => {
                if (link.hash.length > 0) {
                    link.addEventListener('click', (e) => {
                        burger.classList.remove('burger--active');
                        menu.classList.remove('menu--active');
                        document.body.classList.remove('no-scroll');

                        if (lenis) {
                            e.preventDefault();
                            lenis.scrollTo(`${link.hash}`);
                        }
                    })
                }
            });
        }
    }

    const principlesBlock = document.querySelector('.principles');

    if (principlesBlock) {
        const principlesCardArray = document.querySelectorAll('.principles-card'),
            principlesScroll = document.querySelector(".principles-scroll")

        if (!gsapCheck) return;
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

        if (lenis) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        }

        const startPos = window.innerWidth > 767 ? "top top" : "top 25%";

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".principles",
                pin: true,
                start: startPos,
                scrub: 1,
                end: "bottom top",
                snap: 1 / (principlesCardArray.length - 1),
                ease: 'none',
                // markers: true,
            }
        });

        tl.to(".principles .principles-card", {
            x: () => -(principlesScroll.scrollWidth - document.documentElement.clientWidth) + "px",
            ease: "none",
        });
    }

    const teamSliderElement = document.querySelector('.team-slider-element');

    if (teamSliderElement) {
        const teamSlider = new Swiper('.team-slider-element', {
            slidesPerView: 'auto',
            spaceBetween: 10,
        });
    }

    const phoneInputArray = document.querySelectorAll('.js-phone');
    const maskOptions = {
        mask: '+{7}(000)000-00-00'
    };
    if (phoneInputArray.length) {
        phoneInputArray.forEach(input => {
            IMask(input, maskOptions);
        })
    }
});

const languageInputs = document.querySelectorAll('input[name="header-language"]');

// Добавляем обработчик события change на каждую радиокнопку
languageInputs.forEach(input => {
    input.addEventListener('change', () => {
        const selectedLanguage = document.querySelector('input[name="header-language"]:checked').value;
        if (selectedLanguage === 'ru') {
            window.location.href = '/';  // Редирект на главную для русского
        } else if (selectedLanguage === 'en') {
            window.location.href = '/en';  // Редирект на главную для английского
        }
    });
});