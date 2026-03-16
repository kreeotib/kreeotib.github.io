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
        staggerDelay: 50,
        duration: 1000,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        offsetY: '40px',
        threshold: 0.3,
        rootMargin: '0px 0px 0 0px',
        once: true,
    };

    let observer = null;
    let initialized = false;
    let config = { ...DEFAULTS };

    function hideItem(item) {
        item.style.opacity = '0';
        item.style.transform = `translateY(${config.offsetY})`;
        item.style.transition = `opacity ${config.duration}ms ${config.easing}, transform ${config.duration}ms ${config.easing}`;
        item.style.willChange = 'opacity, transform';
    }

    function revealItem(item, delay = 0) {
        setTimeout(() => {
            item.style.opacity = '';
            item.style.transform = '';
            item.style.willChange = '';

            item.addEventListener('transitionend', () => {
                if (item.hasAttribute('data-animation')) {
                    item.removeAttribute('data-animation');
                    item.setAttribute('data-animation-final', '');
                    item.style.transition = '';
                }
            }, { once: true });
        }, delay);
    }

    function getTargets() {
        return Array.from(document.querySelectorAll('[data-animation]'));
    }

    function prepareItems() {
        getTargets().forEach(hideItem);
    }

    function buildObserver() {
        if (observer) observer.disconnect();

        observer = new IntersectionObserver((entries) => {
            // Собираем элементы, вошедшие во вьюпорт в этой «волне»
            const intersecting = entries
                .filter(e => e.isIntersecting)
                .map(e => e.target);

            // Сортируем по порядку в DOM — это и есть очередность
            intersecting.sort((a, b) =>
                a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
            );

            intersecting.forEach((item, i) => {
                revealItem(item, i * config.staggerDelay);
                if (config.once) observer.unobserve(item);
            });

            if (!config.once) {
                entries
                    .filter(e => !e.isIntersecting)
                    .forEach(e => hideItem(e.target));
            }
        }, {
            threshold: config.threshold,
            rootMargin: config.rootMargin,
        });
    }

    function observeTargets() {
        getTargets().forEach(item => observer.observe(item));
    }

    function init(options = {}) {
        config = { ...DEFAULTS, ...options };
        const targets = getTargets();

        if (!targets.length) {
            console.warn('[ScrollReveal] No targets found.');
            return;
        }

        prepareItems();
        buildObserver();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                observeTargets();
                initialized = true;
            });
        });
    }

    function reveal(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;
        revealItem(el);
    }

    function refresh() {
        if (!initialized) return;
        prepareItems();
        observeTargets();
    }

    function skipAll() {
        document.querySelectorAll('[data-animation]').forEach(item => {
            item.style.opacity = '';
            item.style.transform = '';
            item.style.transition = '';
            item.style.willChange = '';
            item.removeAttribute('data-animation');
            item.setAttribute('data-animation-final', '');
        });
    }

    function reset() {
        document.querySelectorAll('[data-animation-final]').forEach(item => {
            item.removeAttribute('data-animation-final');
            item.setAttribute('data-animation', '');
        });
        prepareItems();
        if (observer) observeTargets();
    }

    function destroy() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        initialized = false;
    }

    return { init, reveal, refresh, skipAll, reset, destroy };
})();

window.ScrollReveal = ScrollReveal;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__SR_MANUAL_INIT__) ScrollReveal.init();
});