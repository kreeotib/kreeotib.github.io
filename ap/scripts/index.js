const ScrollLock = (() => {
    let lockCount = 0;
    let scrollbarWidth = 0;

    function getScrollbarWidth() {
        const div = document.createElement('div');
        div.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;';
        document.body.appendChild(div);
        const width = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return width;
    }

    function applyLock() {
        document.body.classList.add('no-scroll')
        if (window.lenis && typeof window.lenis.stop === 'function') {
            window.lenis.stop();
        }
    }

    function applyUnlock() {
        document.body.classList.remove('no-scroll')
        if (window.lenis && typeof window.lenis.start === 'function') {
            window.lenis.start();
        }
    }

    function lock() {
        lockCount++;
        if (lockCount === 1) applyLock();
    }

    function unlock() {
        if (lockCount === 0) return;
        lockCount--;
        if (lockCount === 0) applyUnlock();
    }

    function reset() {
        lockCount = 0;
        applyUnlock();
    }

    function isLocked() {
        return lockCount > 0;
    }

    return {lock, unlock, reset, isLocked};
})();

window.ScrollLock = ScrollLock;

const SmoothScroll = (() => {
    const DEFAULTS = {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false,
    };

    let lenis = null;
    let rafId = null;

    function raf(time) {
        if (lenis) lenis.raf(time);
        rafId = requestAnimationFrame(raf);
    }

    function init(options = {}) {
        if (typeof Lenis === 'undefined') {
            console.warn('[SmoothScroll] Lenis is not loaded.');
            return null;
        }
        if (lenis) return lenis;

        lenis = new Lenis({...DEFAULTS, ...options});
        window.lenis = lenis;

        rafId = requestAnimationFrame(raf);
        return lenis;
    }

    function destroy() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (lenis) {
            lenis.destroy();
            lenis = null;
            window.lenis = null;
        }
    }

    function get() {
        return lenis;
    }

    return {init, destroy, get};
})();

window.SmoothScroll = SmoothScroll;


const BurgerMenu = (() => {
    const DEFAULTS = {
        burgerSelector: '.burger',
        menuSelector: '.menu',
        burgerActiveClass: 'burger--active',
        menuActiveClass: 'menu--active',
        bodyLockClass: 'no-scroll',
        closeOnLinkClick: true,
        linkSelector: 'a',
    };

    let config = {...DEFAULTS};
    let burgers = [];
    let menu = null;
    let isOpen = false;
    let initialized = false;

    function setState(state) {
        if (state === isOpen) return;
        isOpen = state;

        burgers.forEach(burger => burger.classList.toggle(config.burgerActiveClass, isOpen));
        if (menu) menu.classList.toggle(config.menuActiveClass, isOpen);
        document.body.classList.toggle(config.bodyLockClass, isOpen);

        if (isOpen) {
            ScrollLock.lock();
        } else {
            ScrollLock.unlock();
        }
    }

    function toggle() {
        setState(!isOpen);
    }

    function open() {
        setState(true);
    }

    function close() {
        setState(false);
    }

    function handleBurgerClick(event) {
        event.preventDefault();
        toggle();
    }

    function handleMenuClick(event) {
        const link = event.target.closest(config.linkSelector);
        if (!link || !menu.contains(link)) return;
        close();
    }

    function bindEvents() {
        burgers.forEach(burger => burger.addEventListener('click', handleBurgerClick));
        if (config.closeOnLinkClick && menu) {
            menu.addEventListener('click', handleMenuClick);
        }
    }

    function unbindEvents() {
        burgers.forEach(burger => burger.removeEventListener('click', handleBurgerClick));
        if (menu) menu.removeEventListener('click', handleMenuClick);
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};
        burgers = Array.from(document.querySelectorAll(config.burgerSelector));
        menu = document.querySelector(config.menuSelector);

        if (!burgers.length) {
            console.warn('[BurgerMenu] No burger elements found.');
            return;
        }

        if (!menu) {
            console.warn('[BurgerMenu] Mobile menu element not found.');
            return;
        }

        bindEvents();
        initialized = true;
    }

    function destroy() {
        if (!initialized) return;
        unbindEvents();
        setState(false);
        burgers = [];
        menu = null;
        initialized = false;
    }

    return {init, toggle, open, close, destroy};
})();

window.BurgerMenu = BurgerMenu;

const ScrollReveal = (() => {
    const DEFAULTS = {
        staggerDelay: 200,
        duration: 1000,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        offsetY: '40px',
        threshold: 0,
        rootMargin: '0px 0px -40px 0px',
        once: true,
        initialDelay: 100,
    };

    let observer = null;
    let initialized = false;
    let config = {...DEFAULTS};

    function hideItem(item) {
        item.style.opacity = '0';
        item.style.transform = `translateY(${config.offsetY})`;
        item.style.transition = `opacity ${config.duration}ms ${config.easing}, transform ${config.duration}ms ${config.easing}`;
        item.style.willChange = 'opacity, transform';
    }

    function revealItem(item, delay = 0) {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            item.style.willChange = '';

            item.addEventListener('transitionend', () => {
                if (item.hasAttribute('data-animation')) {
                    item.removeAttribute('data-animation');
                    item.setAttribute('data-animation-final', '');
                    item.style.transition = '';
                    item.style.opacity = '';
                    item.style.transform = '';
                }
            }, {once: true});
        }, delay);
    }

    function revealWrapper(wrapper) {
        const items = wrapper.querySelectorAll('[data-animation]');
        items.forEach((item, index) => revealItem(item, index * config.staggerDelay));
        if (config.once) observer.unobserve(wrapper);
    }

    function revealSingle(item) {
        revealItem(item);
        if (config.once) observer.unobserve(item);
    }

    function getTargets() {
        const wrappers = Array.from(document.querySelectorAll('.animation-wrapper'));

        const standaloneItems = Array.from(document.querySelectorAll('[data-animation]')).filter(
            item => !item.closest('.animation-wrapper')
        );

        return {wrappers, standaloneItems};
    }

    function prepareItems() {
        const {wrappers, standaloneItems} = getTargets();
        wrappers.forEach(wrapper => wrapper.querySelectorAll('[data-animation]').forEach(hideItem));
        standaloneItems.forEach(hideItem);
    }

    function buildObserver() {
        if (observer) observer.disconnect();

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    if (!config.once) {
                        if (entry.target.classList.contains('animation-wrapper')) {
                            entry.target.querySelectorAll('[data-animation]').forEach(hideItem);
                        } else {
                            hideItem(entry.target);
                        }
                    }
                    return;
                }

                if (entry.target.classList.contains('animation-wrapper')) {
                    revealWrapper(entry.target);
                } else {
                    revealSingle(entry.target);
                }
            });
        }, {
            threshold: config.threshold,
            rootMargin: config.rootMargin,
        });
    }

    function observeTargets() {
        const {wrappers, standaloneItems} = getTargets();
        wrappers.forEach(wrapper => observer.observe(wrapper));
        standaloneItems.forEach(item => observer.observe(item));
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};
        const {wrappers, standaloneItems} = getTargets();

        if (!wrappers.length && !standaloneItems.length) {
            console.warn('[ScrollReveal] No targets found.');
            return;
        }

        prepareItems();

        setTimeout(() => {
            buildObserver();
            observeTargets();
            initialized = true;
        }, config.initialDelay);
    }

    function reveal(target) {
        const el = typeof target === 'string' ? document.querySelector(target) : target;
        if (!el) return;

        if (el.classList.contains('animation-wrapper')) {
            revealWrapper(el);
        } else {
            revealSingle(el);
        }
    }

    function refresh() {
        if (!initialized) return;
        prepareItems();
        observeTargets();
    }

    function skipAll() {
        document.querySelectorAll('[data-animation]').forEach(item => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
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

    return {init, reveal, refresh, skipAll, reset, destroy};
})();

window.ScrollReveal = ScrollReveal;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__SR_MANUAL_INIT__) ScrollReveal.init({initialDelay: 500});
});

class DirectionScroller {
    constructor({
                    rootSelector = '.direction',
                    wrapperSelector = '.direction__wrapper',
                    sliderSelector = '.direction-slider',
                    sliderItemsSelector = '.direction-slider__item',
                    breakpoint = 640,
                } = {}) {
        this.root = document.querySelector(rootSelector);
        this.wrapper = document.querySelector(wrapperSelector);
        this.sliderSelector = sliderSelector;
        this.sliderItemsSelector = sliderItemsSelector;

        if (!this.root || !this.wrapper) {
            console.warn('DirectionScroller: root or wrapper not found');
            return;
        }

        this.mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
        this.swiper = null;
        this.scrollTween = null;

        this.handleChange = this.handleChange.bind(this);
    }

    init() {
        if (!this.root) return;
        this.handleChange(this.mediaQuery);
        this.mediaQuery.addEventListener('change', this.handleChange);
    }

    destroy() {
        this.mediaQuery.removeEventListener('change', this.handleChange);
        this.destroyMobile();
        this.destroyDesktop();
    }

    handleChange(e) {
        if (e.matches) {
            this.destroyDesktop();
            this.initMobile();
        } else {
            this.destroyMobile();
            this.initDesktop();
        }
    }

    initMobile() {
        if (this.swiper) return; // уже инициализирован

        this.swiper = new Swiper(this.sliderSelector, {
            spaceBetween: 8,
            slidesPerView: 'auto',
            slidesOffsetBefore: 0,
            mousewheel: {invert: false, forceToAxis: true},
            keyboard: {enabled: true},
            breakpoints: {
                1241: {
                    slidesOffsetBefore: 0.6 * window.innerWidth,
                },
                641: {
                    slidesOffsetBefore: 0.5 * window.innerWidth,
                    spaceBetween: 0,
                },
            },
        });
    }

    destroyMobile() {
        if (!this.swiper) return;
        this.swiper.destroy(true, true);
        this.swiper = null;
    }

    initDesktop() {
        if (this.scrollTween) return;

        const getTotalDistance = () =>
            this.wrapper.scrollWidth - window.innerWidth;
        const EXTRA_PIN = window.innerHeight * 0.15;

        console.log(this.wrapper.scrollWidth)
        gsap.set(this.wrapper, {x: 0});

        this.scrollTween = gsap.timeline({
            scrollTrigger: {
                trigger: this.root,
                start: 'top top',
                end: () => '+=' + (getTotalDistance() + EXTRA_PIN),
                scrub: 1,
                pin: true,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                // markers: true,
            },
        }).to(this.wrapper, {
            x: () => -(getTotalDistance() + EXTRA_PIN),
            ease: 'none',
        });
    }

    destroyDesktop() {
        if (!this.scrollTween) return;

        const st = this.scrollTween.scrollTrigger;

        if (st) st.kill();

        this.scrollTween.kill();
        this.scrollTween = null;

        gsap.set([this.root, this.wrapper], {clearProps: 'all'});

        ScrollTrigger.refresh();
    }
}


(function () {

    const range = document.getElementById('range');
    if (!range) return;
    const railFill = document.getElementById('railFill');
    const thumb = document.getElementById('thumb');

    const min = Number(range.min);
    const max = Number(range.max);

    function update() {
        const index = Number(range.value);
        const pct = ((index - min) / (max - min)) * 100;
        railFill.style.width = pct + '%';
        thumb.style.left = pct + '%';
    }

    range.addEventListener('input', update);
    update();


})();

(() => {
    'use strict';

    const calculator = document.querySelector('.js-calculator');
    if (!calculator) return;

    const blocks = Array.from(calculator.querySelectorAll('.js-calculator-block'));
    const resultInfo = calculator.querySelector('.calculator-result__info');
    const resultTotal = calculator.querySelector('.js-calculator-result');

    const cleanValue = (raw) => {
        if (!raw) return '';
        return raw.replace(/[^\d%]/g, '');
    };

    const parseItem = (input) => {
        const rawValue = input.getAttribute('data-js-value') || '';
        const text = input.getAttribute('data-js-text') || '';
        const cleaned = cleanValue(rawValue);

        if (!cleaned || !text) return null;

        const isPercent = cleaned.indexOf('%') !== -1;
        const digits = cleaned.replace('%', '');
        const number = parseInt(digits, 10);
        if (isNaN(number)) return null;

        return {text, isPercent, value: number};
    };

    const formatNumber = (num) => Math.round(num).toLocaleString('ru-RU');

    const formatItemValue = (item) => (
        item.isPercent
            ? '+' + formatNumber(item.value) + '%'
            : formatNumber(item.value) + '\u00A0₽'
    );

    const parseRangeItem = (input) => {
        const values = (input.getAttribute('data-js-value') || '')
            .split(',')
            .map((v) => parseInt(cleanValue(v.trim()), 10));

        const labels = (input.getAttribute('data-js-label') || '')
            .split(',')
            .map((l) => l.trim());

        const baseText = input.getAttribute('data-js-text') || '';

        if (!values.length || !labels.length || !baseText) return null;

        const lastIndex = Math.min(values.length, labels.length) - 1;
        const index = Math.min(Math.max(Number(input.value) || 0, 0), lastIndex);

        const value = values[index];
        const label = labels[index];
        if (isNaN(value) || !label) return null;

        const prefixMatch = baseText.match(/^(.*?)\(/);
        const prefix = prefixMatch ? prefixMatch[1] : baseText + ' ';
        const text = (prefix + '(' + label + ' операций)').trim();

        return {text, isPercent: false, value};
    };

    const collectBlockItems = (block) => {
        const items = [];
        const inputs = block.querySelectorAll('input[data-js-value]');

        inputs.forEach((input) => {
            if (input.type === 'range') {
                const item = parseRangeItem(input);
                if (item) items.push(item);
                return;
            }

            if (!input.checked) return;
            const item = parseItem(input);
            if (item) items.push(item);
        });

        return items;
    };

    const getBlockTitle = (block) => {
        const titleEl = block.querySelector('.calculator-block__header .checkbox__text');
        return titleEl ? titleEl.textContent.trim() : '';
    };

    const isMainInputChecked = (block) => {
        const mainInput = block.querySelector('.js-calculator-input');
        return !!(mainInput && mainInput.checked);
    };
    const buildBlockMarkup = (title, items, subtotal, isMainSelected) => {
        const rows = items.map((item) => (
            '<div class="calculator-result__block-row">' +
            '<p class="calculator-result__block-text">' + item.text + '</p>' +
            '<p class="calculator-result__block-text">' + formatItemValue(item) + '</p>' +
            '</div>'
        )).join('');

        const blockClass = 'calculator-result__block' +
            (isMainSelected ? ' calculator-result__block--main-selected' : '');

        return (
            '<div class="' + blockClass + '">' +
            '<div class="calculator-result__block-row">' +
            '<p class="calculator-result__block-title">' + title + '</p>' +
            '<p class="calculator-result__block-title">' + formatNumber(subtotal) + '\u00A0₽</p>' +
            '</div>' +
            '<div class="calculator-result__block-content">' +
            rows +
            '</div>' +
            '</div>'
        );
    };


    const recalculate = () => {
        if (!resultInfo || !resultTotal) return;

        let selectedItems = [];
        let grandTotal = 0;
        let blocksMarkup = '';

        blocks.forEach((block) => {
            // Главная логика: если главный инпут не выбран — полностью пропускаем блок
            if (!isMainInputChecked(block)) return;

            const items = collectBlockItems(block);
            if (!items.length) return;

            const subtotal = items.reduce((sum, item) => sum + item.value, 0);
            grandTotal += subtotal;
            selectedItems = selectedItems.concat(items);

            const title = getBlockTitle(block);
            const isMainSelected = true; // теперь всегда true, т.к. блок прошёл проверку

            blocksMarkup += buildBlockMarkup(title, items, subtotal, isMainSelected);
        });

        resultInfo.innerHTML = blocksMarkup;
        resultTotal.textContent = formatNumber(grandTotal) + '\u00A0₽';

        return selectedItems;
    };


    const rangeInput = calculator.querySelector('#range');
    const railFill = calculator.querySelector('#railFill');
    const thumb = calculator.querySelector('#thumb');

    const updateSlider = () => {
        if (!rangeInput || !railFill || !thumb) return;
        const min = Number(rangeInput.min) || 0;
        const max = Number(rangeInput.max) || 100;
        const value = Number(rangeInput.value) || 0;
        const percent = ((value - min) / (max - min)) * 100;
        railFill.style.width = percent + '%';
        thumb.style.left = percent + '%';
    };

    if (rangeInput) {
        rangeInput.addEventListener('input', () => {
            updateSlider();
            recalculate();
        });
        updateSlider();
    }


    calculator.addEventListener('change', (e) => {
        const target = e.target;
        if (target.matches && target.matches('input[type="checkbox"], input[type="radio"]')) {
            recalculate();
        }
    });


    recalculate();
})();

(() => {

    document.addEventListener('DOMContentLoaded', () => {
        const servciesSlider = new Swiper('.services-slider', {
            spaceBetween: 8,
            slidesPerView: 'auto',
            mousewheel: {invert: false, forceToAxis: true},
            keyboard: {enabled: true},
            breakpoints: {
                641: {
                    spaceBetween: 0
                }
            }
        })


        gsap.registerPlugin(ScrollTrigger);

        const directionScroller = new DirectionScroller({
            rootSelector: '.direction',
            wrapperSelector: '.direction__wrapper',
            sliderSelector: '.direction-slider',
            breakpoint: 640,
        });

        directionScroller.init();

        SmoothScroll.init();
        BurgerMenu.init();
    })
})();