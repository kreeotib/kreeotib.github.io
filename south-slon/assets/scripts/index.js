const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup__close')
    ) {
        hideAllPopups();
    }
};
const showPopup = popupId => {
    const popup = document.querySelector(popupId);
    if (!popup) return


    hideAllPopups();

    popup.classList.add('popup--active');
    document.body.classList.add('no-scroll');

    document.addEventListener('click', checkTargetOrKey);
    document.addEventListener('keyup', checkTargetOrKey);
};
const hideAllPopups = () => {
    const popups = document.querySelectorAll('.popup');

    popups.forEach(popup => {
        popup.classList.remove('popup--active');
    });
    document.body.classList.remove('no-scroll');

    document.removeEventListener('click', checkTargetOrKey);
    document.removeEventListener('keyup', checkTargetOrKey);
};


document.addEventListener('DOMContentLoaded', () => {
    const lenis = typeof Lenis !== 'undefined' ? new Lenis({smoothWheel: true, duration: 2, anchors: false}) : null;
    const gsapCheck = typeof gsap !== 'undefined';

    if (gsapCheck) gsap.registerPlugin(ScrollTrigger);

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

    const numbers = document.querySelector('.numbers');

    if (numbers) {
        const numbersItemArray = numbers.querySelectorAll('.numbers-card');
        if (numbersItemArray.length) {
            numbersItemArray.forEach((item, index) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: numbers,
                        start: "top bottom",
                        end: "top top",
                        scrub: true,
                    },
                    y: 100 * (index + 1),
                    ease: "none",
                });
            })
        }
    }

    const parallaxBlockArray = document.querySelectorAll('.parallax-block');

    if (parallaxBlockArray.length) {
        parallaxBlockArray.forEach(block => {
            const parallaxBlockWrapper = block.querySelector('.parallax-block-wrapper')
            gsap.from(parallaxBlockWrapper, {
                scrollTrigger: {
                    trigger: block,
                    start: "top bottom",
                    end: "top 50%",
                    scrub: true,
                },
                x: 300, opacity: 0,
                ease: "none",
            });
        })
    }

    const projectsCardImgArray = document.querySelectorAll('.projects-card__img');

    if (projectsCardImgArray.length) {
        projectsCardImgArray.forEach(projectImg => {
            const sectionProjects = projectImg.closest('.section-projects');
            console.log(sectionProjects)
            const projectImgElement = projectImg.querySelector('img');
            if (!sectionProjects && !projectImgElement) return false;
            gsap.to(projectImgElement, {
                scrollTrigger: {
                    trigger: sectionProjects,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
                y: -100,
                ease: "none",
            })
        });
    }

    const selectArray = document.querySelectorAll('.js-select');

    if (selectArray.length) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.js-select')) {
                selectArray.forEach(select => {
                    select.classList.remove('active')
                })
            }
        })
        selectArray.forEach(select => {
            const selectCurrent = select.querySelector('.js-select-current');

            selectCurrent.addEventListener('click', () => {
                select.classList.toggle('active');
            })

            select.addEventListener('change', (e) => {
                select.classList.remove('active');
                select.classList.add('filled');
                selectCurrent.querySelector('.js-select-current-text').textContent = e.target.value;
            })
        })
    }

    const rewardsSlider = new Swiper('.js-rewards-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        speed: 1000,
        navigation: {
            nextEl: '.js-rewards-slider-button-next',
            prevEl: '.js-rewards-slider-button-prev'
        },
        breakpoints: {
            768: {
                spaceBetween: 0,
            },
        }
    })
    const ratingsSlider = new Swiper('.js-ratings-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        speed: 1000,
        breakpoints: {
            768: {
                slidesPerView: 5,
            },
        },
        navigation: {
            nextEl: '.js-ratings-slider-button-next',
            prevEl: '.js-ratings-slider-button-prev'
        }
    })

    const managementSlider = new Swiper('.js-management-slider', {
        slidesPerView: 'auto',
        speed: 1000,
        spaceBetween: 30,
        breakpoints: {
            768: {
                slidesPerView: 5,
            },
        },
        navigation: {
            nextEl: '.js-management-slider-button-next',
            prevEl: '.js-management-slider-button-prev'
        }
    })


    const plansNav = new Swiper(".plan-nav", {
        spaceBetween: 30,
        slidesPerView: 'auto',
        watchSlidesProgress: true,
    });
    const plansSlider = new Swiper(".plan-slider", {
        spaceBetween: 0,
        slidesPerView: 1,
        effect: "fade",
        fadeEffect: {
            crossFade: true
        },
        thumbs: {
            swiper: plansNav,
        },
    });

    const projectsSlider = new Swiper(".projects-list", {
        spaceBetween: 0,
        slidesPerView: 1,
        direction:"vertical",
        init:false,
        edgeSwipeDetection: "prevent",
        resistanceRatio: 0,
    });

    if(window.matchMedia('(max-width:767px)').matches){
        projectsSlider.init()

        const swiper = new Swiper('.swiper-container', {

        });
    }


    const popupButtons = document.querySelectorAll('[data-popup]');
    const popups = document.querySelectorAll('.popup');

    if (popups.length) {
        popupButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const popupId = button.dataset.popup
                showPopup(popupId);
            });
        });
    }


    const burger = document.querySelector('.menu-button'),
        menu = document.querySelector('.menu');

    if (burger && burger) {
        burger.addEventListener('click', e => {
            e.preventDefault();
            const menuWidth = menu.getBoundingClientRect().width,
                pageWrapper = document.querySelector(".page-wrapper");
            pageWrapper.style.setProperty("--menu-width", `-${menuWidth}px`);
            pageWrapper.classList.toggle('page-wrapper--active');
            burger.classList.toggle('burger--active');
            menu.classList.toggle('menu--active')
        })
    }

    const infoItemArray = document.querySelectorAll('.info-item');

    if (infoItemArray.length) {
        infoItemArray.forEach(item => {
            const itemList = item.querySelector('.info-item__list');
            if (itemList) {
                const itemListContent = itemList.closest('.info-item__content');
                if (!itemListContent) return false;
                console.log(itemList.getBoundingClientRect().height)
                itemListContent.style.setProperty('--list-height', `${itemList.getBoundingClientRect().height}px`)
            }
        })
    }
})