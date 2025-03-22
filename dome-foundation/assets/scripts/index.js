const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup__close')
    ) {
        event.preventDefault();
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
const preloader = document.querySelector('.preloader');

if (preloader) {
    document.body.classList.add('no-scroll');
    let iterationCount = 0;
    const minIterations = 6;
    window.onload = (event) => {
        const preloaderLogo = document.querySelector('.preloader-logo');

        preloaderLogo.addEventListener('animationiteration', () => {
            iterationCount++; // Increment the counter on each iteration

            if (iterationCount >= minIterations) {
                preloaderLogo.classList.add('loaded');
                preloader.classList.add('hidden');
                document.body.classList.remove('no-scroll');
            }
        });
    };
}


document.addEventListener('DOMContentLoaded', () => {
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


    const residentsSlider = new Swiper('.residents-slider', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: true,
        initialSlide: 1,
        navigation: {
            nextEl: ".residents-slider-button-next",
            prevEl: '.residents-slider-button-prev'
        }
    });

    if (residentsSlider) {
        const observerResidentsOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0
        };
        const observerResidentsCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {

                    residentsSlider.slideTo(residentsSlider.slides.length - 2, 2500);
                }
            });
        };
        const observer = new IntersectionObserver(observerResidentsCallback, observerResidentsOptions);
        observer.observe(residentsSlider.el);
    }

    const eventsSlider = new Swiper('.events-slider', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        navigation: {
            nextEl: ".events-slider-button-next",
            prevEl: '.events-slider-button-prev'
        }
    });


    const projectsNav = new Swiper(".projects-nav", {
        spaceBetween: 30,
        slidesPerView: 'auto',
        watchSlidesProgress: true,
        breakpoints: {
            767: {
                slidesPerView: 1,
            }
        }
    });
    const projectsSlider = new Swiper(".projects-slider__item", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".projects-slider-button-next",
            prevEl: ".projects-slider-button-prev",
        },
        thumbs: {
            swiper: projectsNav,
        },
    });

    const marquee = new Swiper(".projects-marquee__slider", {
        spaceBetween: 0,
        centeredSlides: true,
        speed: 6000,
        autoplay: {
            delay: 1,
        },
        loop: true,
        slidesPerView: 'auto',
        allowTouchMove: false,
        disableOnInteraction: true
    });

    const companyTags = new Swiper(".company-tags", {
        centeredSlides: true,
        speed: 500,
        autoplay: {
            delay: 1500,
        },
        loop: true,
        slidesPerView: 'auto',
        direction: "vertical",
        allowTouchMove: false,
        disableOnInteraction: true
    });

    const lenis = typeof Lenis !== 'undefined' ? new Lenis({smoothWheel: true, duration: 1.2, anchors: false}) : null;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);


    const anchorsLinks = document.querySelectorAll('a[href^="#"]');

    if (anchorsLinks.length && lenis) {
        anchorsLinks.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                lenis.scrollTo(this.getAttribute('href'))
            });
        })
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


    const links = document.querySelectorAll('.info-nav__link');
    const sections = document.querySelectorAll('.info-item');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0
    };
    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(link => link.classList.remove('info-nav__link--current'));
                const id = entry.target.id;
                const currentLink = document.querySelector(`a[href="#${id}"]`);
                if (currentLink) {
                    currentLink.classList.add('info-nav__link--current');
                }
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => {
        observer.observe(section);
    });

    const projectInfo = document.querySelector('.projects-info'),
        projectInfoRow = projectInfo.querySelectorAll('.projects-list__row');

    const projectObserverCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                projectInfoRow.forEach(element => {
                    element.classList.add('animated');
                })
            }
        });
    };

    const projectsObserver = new IntersectionObserver(projectObserverCallback, observerOptions);
    projectsObserver.observe(projectInfo);

    const requirementsToggleItem = document.querySelector('.js-requirements'),
        requirementsWrapper = document.querySelector('.requirements-wrapper');
    window.addEventListener('scroll', () => {
        const rectItem = requirementsToggleItem.getBoundingClientRect(),
            rectWrapper = requirementsWrapper.getBoundingClientRect();
        requirementsWrapper.classList.toggle('observer', rectItem.top <= 0);
        if (rectWrapper.top <= 0 && rectWrapper.bottom >= 0 && window.innerWidth > 767) {
            lenis.options.duration = 2.4;
        } else {
            lenis.options.duration = 1.2;
        }
    });
})