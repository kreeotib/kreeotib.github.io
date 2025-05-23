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

    const lenis = typeof Lenis !== 'undefined' ? new Lenis({smoothWheel: true, duration: 1.2, anchors: false}) : null;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

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

    const residentsElement = document.querySelector('.residents-slider')

    const residentsSlider = new Swiper('.residents-slider', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        centeredSlides: true,
        initialSlide: 1,
        init: false,
        navigation: {
            nextEl: ".residents-slider-button-next",
            prevEl: '.residents-slider-button-prev'
        }
    });

    if (residentsElement) {
        residentsSlider.on("init",e=>{
            residentsSlider.slideTo(residentsSlider.slides.length - 2, 0)
        })
        residentsSlider.init()
        const observerResidentsOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0
        };
        const observerResidentsCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {

                    residentsSlider.slideTo(1, 2500);
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

    const criteriaSliderElement = document.querySelector('.criteria-slider');

    if(criteriaSliderElement){
        const criteriaNav = new Swiper(".criteria-nav-slider", {
            spaceBetween: 16,
            slidesPerView: 'auto',
            direction: "vertical",
            watchSlidesProgress: true,
            breakpoints: {
                767: {
                    slidesPerView: 'auto',
                    direction: "horizontal",
                }
            }
        });
        const criteriaSlider = new Swiper(".criteria-slider", {
            spaceBetween: 10,
            slidesPerView: 1,
            effect: "fade",
            fadeEffect: {
                crossFade: true
            },
            init:false,
            thumbs: {
                swiper: criteriaNav,
            },
        });

        criteriaSlider.on("slideChange",()=>{
            lenis.scrollTo(criteriaSliderElement)
        })

        criteriaSlider.on('init',()=>{
            const criteriaListArray = criteriaSliderElement.querySelectorAll('.criteria-list');

            if(criteriaListArray.length){
                criteriaListArray.forEach(list=>{
                    const listItemArray = list.querySelectorAll(".criteria-list__item");

                    if(listItemArray.length){
                        listItemArray.forEach((item,index)=>{
                            item.style.transitionDelay = `${.5 + index * .2}s`;
                        });
                    }
                })
            }
        });

        criteriaSlider.init()
    }


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
    if(sections.length){
        sections.forEach(section => {
            observer.observe(section);
        });
    }

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

    if(projectInfo){
        projectsObserver.observe(projectInfo);
    }

    const requirementsToggleItem = document.querySelector('.js-requirements'),
        requirementsWrapper = document.querySelector('.requirements-wrapper');

    if (requirementsToggleItem) {
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
    }

    const phoneInputArray = document.querySelectorAll('.js-phone');
    const maskOptions = {
        mask: '+{7} (000) 000-00-00'
    };
    if (phoneInputArray.length) {
        phoneInputArray.forEach(input => {
            IMask(input, maskOptions);
        })
    }

    const projectsListRow = document.querySelectorAll('.projects-list__row');
    if (projectsListRow.length) {
        const numbers = [...projectsListRow].map(el => {
            const numberElement = el.querySelector('.projects-list__number');
            if (numberElement) {
                return parseFloat(numberElement.innerHTML.trim());
            }
            return 0;
        });
        const validNumbers = numbers.filter(num => !isNaN(num));
        if (validNumbers.length) {
            const minNumber = Math.min(...validNumbers);
            const maxNumber = Math.max(...validNumbers);
            projectsListRow.forEach((item, index) => {
                item.style.setProperty("--transition-delay", `${index * 0.2}s`);
                const numberElement = item.querySelector('.projects-list__number');
                if (numberElement) {
                    const currentNumber = parseFloat(numberElement.innerHTML.trim());
                    item.style.setProperty("--max-width", `${40 + 60 * (currentNumber - minNumber) / (maxNumber - minNumber)}%`);
                } else {
                    item.style.setProperty("--max-width", '40%');
                }
            });
        }
    }
})