class Animations {
    constructor() {
        this.animationWrapperArray = document.querySelectorAll('.animation-wrapper');
    }

    toggleAnimation(animationWrapperElement) {
        const animationItemArray = animationWrapperElement.querySelectorAll('.animation-item');

        // if preloader present need to set value (preloader animation end + 0.5) if(preloader transition .5s) 1
        const counter = animationWrapperElement.closest('.hero') && document.querySelector('.preloader') ? 1 : 0;

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

const animateScroll = (scrollableContainer, end, duration) => {
    const start = scrollableContainer.scrollLeft;
    const startTime = performance.now();

    // Ease-out function
    function easeOut(t) {
        return t * (2 - t);
    }

    function scrollAnimation(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOut(progress);
        scrollableContainer.scrollLeft = start + (end - start) * easedProgress;
        if (progress < 1) {
            requestAnimationFrame(scrollAnimation);
        }
    }

    requestAnimationFrame(scrollAnimation);
};

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

    setTimeout(locomotiveHeightBug, 3500);
    function locomotiveHeightBug(){
        window.dispatchEvent(new Event('resize'));
    }

    const lenis = typeof Lenis !== 'undefined' ? new Lenis({smoothWheel: true, duration: 1.2}) : null;
    const gsapCheck = typeof gsap !== 'undefined';

    if (gsapCheck) gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    if (lenis) {
        if (gsapCheck) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }

            requestAnimationFrame(raf);
        }
    }

    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        header = document.querySelector('.header');

    if (burger && menu) {
        burger.addEventListener('click', (e) => {
            e.preventDefault();

            const isActive = burger.classList.toggle('burger--active');
            menu.classList.toggle('menu--active', isActive);
            header.classList.toggle('header--fixed', isActive);
            document.body.classList.toggle('no-scroll', isActive);

            // Управление lenis
            if (lenis) {
                if (isActive) {
                    lenis.stop(); // Остановка прокрутки
                } else {
                    lenis.start(); // Возобновление прокрутки
                }
            }
        });

        const anchorLinks = document.querySelectorAll('a');

        if (anchorLinks.length) {
            anchorLinks.forEach(link => {
                if (link.hash.length > 0) {
                    link.addEventListener('click', (e) => {
                        burger.classList.remove('burger--active');
                        menu.classList.remove('menu--active');
                        document.body.classList.remove('no-scroll');

                        if (lenis) {

                            lenis.scrollTo(`${link.hash}`);

                            lenis.start();
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

        if(window.innerWidth < 767) {
            principlesScroll.scrollLeft = principlesScroll.scrollWidth;

            const callback = (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // principlesScroll.scrollLeft = 0;
                        animateScroll(principlesScroll,0,1500)
                        observer.unobserve(entry.target);
                    }
                });
            };

            const observer = new IntersectionObserver(callback, {
                threshold: 0.1
            });

            observer.observe(principlesScroll);
        }else{
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
                    // markers:true,
                }
            });

            tl.to(".principles .principles-card", {
                x: () => -(principlesScroll.scrollWidth - document.documentElement.clientWidth) + "px",
                ease: "none",
                // end: () => "+=" + principlesScroll.offsetWidth,
            });
        }
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

const languageArray = document.querySelectorAll('.language');

if(languageArray.length){
    languageArray.forEach(languageBlock=>{
        languageBlock.addEventListener('change',(e)=>{
            const selectedLanguage = e.target.value;
            if (selectedLanguage === 'ru') {
                window.location.href = '/';  // Редирект на главную для русского
            } else if (selectedLanguage === 'en') {
                window.location.href = '/en';  // Редирект на главную для английского
            }
        });
    });
}