document.addEventListener('DOMContentLoaded', () => {
    const gallerySliderElement = document.querySelector('.gallery-slider-element');
    const gallerySlider = new Swiper(gallerySliderElement, {
        init:false,
        slidesPerView: 1,
        speed: 500,
        navigation: {
            prevEl: '.gallery-slider-button-prev',
            nextEl: '.gallery-slider-button-next'
        }
    });

    if(gallerySliderElement){
        gallerySlider.init()
    }


    const nominationsSliderElement = document.querySelector('.nominations-slider');
    const nominationsSlider = new Swiper(nominationsSliderElement, {
        init:false,
        slidesPerView: "auto",
        speed: 500,
        spaceBetween:30,
        navigation: {
            prevEl: '.nominations-slider-button-prev',
            nextEl: '.nominations-slider-button-next'
        }
    });

    if(nominationsSliderElement){
        nominationsSlider.init()
    }


    const selectArray = document.querySelectorAll('select');

    if(selectArray.length){
        selectArray.forEach(select=>{
            select.addEventListener('change', () => {
                select.blur();
            });
        })
    }
});


(function () {
    'use strict';

    function initBurgerMenu() {
        const burger = document.querySelector('.burger');
        const nav = document.querySelector('.header-nav');

        if (!burger || !nav) return;

        let scrollY = 0;

        function lockScroll() {
            document.body.classList.add('no-scroll')
        }

        function unlockScroll() {
            document.body.classList.remove('no-scroll')
        }

        function handleBurgerClick() {
            const isActive = burger.classList.toggle('active');
            nav.classList.toggle('active', isActive);

            isActive ? lockScroll() : unlockScroll();
        }

        burger.addEventListener('click', handleBurgerClick);
    }

    document.addEventListener('DOMContentLoaded', initBurgerMenu);
})();


const ScrollReveal = (() => {
    const DEFAULTS = {
        staggerDelay: 150,
        duration: 1000,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        offsetY: '40px',
        offsetX: '40px',
        threshold: 0.2,
        rootMargin: '0px',
        once: true,
    };

    let observer = null;
    let initialized = false;
    let config = { ...DEFAULTS };

    function getTransform(item) {
        const dir = item.getAttribute('data-animation');
        if (dir === 'left') return `translateX(-${config.offsetX})`;
        if (dir === 'right') return `translateX(${config.offsetX})`;
        return `translateY(${config.offsetY})`;
    }

    function hideItem(item) {
        item.style.visibility = 'visible';
        item.style.opacity = '0';
        item.style.transform = getTransform(item);
        item.style.transition = `opacity ${config.duration}ms ${config.easing}, transform ${config.duration}ms ${config.easing}`;
    }

    function revealItem(item, delay = 0) {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translate(0, 0)';

            const finalize = () => {
                item.removeAttribute('data-animation');
                item.setAttribute('data-animation-final', '');
                item.style.transition = '';
                item.style.transform = '';
                item.style.opacity = '';
            };

            item.addEventListener('transitionend', finalize, { once: true });
        }, delay);
    }

    function getTargets() {
        return Array.from(document.querySelectorAll('[data-animation]'));
    }

    function buildObserver() {
        if (observer) observer.disconnect();

        observer = new IntersectionObserver((entries) => {
            const intersecting = entries
                .filter(e => e.isIntersecting)
                .map(e => e.target);

            intersecting.sort((a, b) =>
                a.getBoundingClientRect().top - b.getBoundingClientRect().top
            );

            intersecting.forEach((item, i) => {
                revealItem(item, i * config.staggerDelay);
                if (config.once) observer.unobserve(item);
            });

            if (!config.once) {
                entries.filter(e => !e.isIntersecting).forEach(e => hideItem(e.target));
            }
        }, {
            threshold: config.threshold,
            rootMargin: config.rootMargin,
        });
    }

    function init(options = {}) {
        config = { ...DEFAULTS, ...options };
        const targets = getTargets();

        if (!targets.length) return;

        targets.forEach(hideItem);

        requestAnimationFrame(() => {
            buildObserver();
            targets.forEach(item => observer.observe(item));
            initialized = true;
        });
    }

    function refresh() {
        if (!initialized) return;
        getTargets().forEach(item => {
            hideItem(item);
            observer.observe(item);
        });
    }

    function destroy() {
        if (observer) observer.disconnect();
        initialized = false;
    }

    return { init, refresh, destroy };
})();

// Запуск
document.addEventListener('DOMContentLoaded', () => {
    ScrollReveal.init();
});

