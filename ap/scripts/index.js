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



function resolveRangeValues(input) {
    const scope = input.closest('.js-calculator-block') || input.closest('.js-calculator') || document;
    const selected = scope.querySelector('input[data-js-range]:checked');

    if (selected) {
        return {
            raw: selected.getAttribute('data-js-range') || '',
            textValue: selected.getAttribute('data-js-text-value') || input.getAttribute('data-js-text-value') || ''
        };
    }

    return {
        raw: input.getAttribute('data-js-value') || '',
        textValue: input.getAttribute('data-js-text-value') || ''
    };
}

class RangeSlider {
    static SELECTORS = {
        input: '.range__input',
        railFill: '.range__rail-fill',
        thumb: '.range__thumb',
        value: '.range__value',
        labels: '.range__labels'
    };

    constructor(root, {onInput} = {}) {
        this.root = root;
        this.input = root.querySelector(RangeSlider.SELECTORS.input);
        this.railFill = root.querySelector(RangeSlider.SELECTORS.railFill);
        this.thumb = root.querySelector(RangeSlider.SELECTORS.thumb);
        this.valueEl = root.querySelector(RangeSlider.SELECTORS.value);
        this.labelsEl = root.querySelector(RangeSlider.SELECTORS.labels);

        this.onInput = typeof onInput === 'function' ? onInput : null;
        this._rafPending = false;

        this._handleInput = this._handleInput.bind(this);
    }

    get labelsList() {
        const raw = this.input?.dataset.jsLabel || '';
        return raw.split(',').map((l) => l.trim()).filter(Boolean);
    }

    get valuesList() {
        if (!this.input) return [];
        const raw = resolveRangeValues(this.input).raw;
        return raw.split(',').map((v) => v.trim()).filter(Boolean);
    }


    get lastIndex() {
        const labels = this.labelsList;
        const values = this.valuesList;
        const len = values.length ? Math.min(labels.length, values.length) : labels.length;
        return Math.max(len - 1, 0);
    }

    get currentIndex() {
        const raw = Number(this.input.value);
        return Math.min(Math.max(Number.isNaN(raw) ? 0 : raw, 0), this.lastIndex);
    }

    get currentLabel() {
        return this.labelsList[this.currentIndex] || '';
    }

    init() {
        if (!this.input) return;

        this._syncMax();
        this._renderEdgeLabels();
        this.update();

        this.input.addEventListener('input', this._handleInput);

        const scope = this.input.closest('.js-calculator-block') || document;
        scope.addEventListener('change', (e) => {
            if (e.target.matches && e.target.matches('[data-js-range]')) {
                this._syncMax();
                this._renderEdgeLabels();
                this.update();
            }
        });
    }

    _syncMax() {
        this.input.max = String(this.lastIndex);
        if (Number(this.input.value) > this.lastIndex) {
            this.input.value = String(this.lastIndex);
        }
    }

    _renderEdgeLabels() {
        if (!this.labelsEl) return;
        const labels = this.labelsList;
        if (labels.length < 2) return;

        this.labelsEl.innerHTML = '';
        [
            {text: labels[0], modifier: 'range__label--first'},
            {text: labels[labels.length - 1], modifier: 'range__label--last'}
        ].forEach(({text, modifier}) => {
            const label = document.createElement('p');
            label.classList.add('range__label', modifier);
            label.textContent = text;
            this.labelsEl.append(label);
        });
    }

    update() {
        const min = Number(this.input.min) || 0;
        const max = Number(this.input.max) || 100;
        const value = Number(this.input.value) || 0;
        const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

        if (this.railFill) this.railFill.style.width = percent + '%';
        if (this.thumb) this.thumb.style.left = percent + '%';
        if (this.valueEl) {
            this.valueEl.style.left = percent + '%';
            this.valueEl.textContent = this.currentLabel;
        }
    }


    _handleInput() {
        if (this._rafPending) return;
        this._rafPending = true;
        requestAnimationFrame(() => {
            this._rafPending = false;
            this.update();
            if (this.onInput) this.onInput(this);
        });
    }
}

class PricingCalculator {
    static SELECTORS = {
        block: '.js-calculator-block',
        resultInfo: '.calculator-result__info',
        resultTotal: '.js-calculator-result',
        blockTitle: '.calculator-block__header .checkbox__text',
        mainInput: '.js-calculator-input',
        rangeRoot: '.range',
        checkboxWrap: '.checkbox',
        countWrapper: '.checkbox__count',
        countMinus: '.checkbox__count-minus',
        countPlus: '.checkbox__count-plus',
        countLabel: '.checkbox__count-label'
    };

    constructor(root) {
        this.root = root;
        this.blocks = Array.from(root.querySelectorAll(PricingCalculator.SELECTORS.block));
        this.resultInfo = root.querySelector(PricingCalculator.SELECTORS.resultInfo);
        this.resultTotal = root.querySelector(PricingCalculator.SELECTORS.resultTotal);
        this.sliders = [];

        this._handleClick = this._handleClick.bind(this);
        this._handleChange = this._handleChange.bind(this);
    }

    init() {
        this._initSliders();
        this.root.addEventListener('click', this._handleClick);
        this.root.addEventListener('change', this._handleChange);
        this.recalculate();
    }

    _initSliders() {
        const rangeRoots = this.root.querySelectorAll(PricingCalculator.SELECTORS.rangeRoot);
        rangeRoots.forEach((rangeRoot) => {
            const slider = new RangeSlider(rangeRoot, {
                onInput: () => this.recalculate()
            });
            slider.init();
            this.sliders.push(slider);
        });
    }



    cleanValue(raw) {
        return raw.replace(/[^\d%]/g, '');
    }

    classifyValue(raw) {
        const trimmed = raw.trim();
        const hasLetters = /\p{L}/u.test(trimmed);

        if (hasLetters) {
            return {type: 'text', value: 0, displayText: trimmed};
        }

        const cleaned = this.cleanValue(trimmed);
        const digits = cleaned.replace('%', '');

        if (digits === '') {
            return {type: 'text', value: 0, displayText: trimmed};
        }

        const number = parseInt(digits, 10);
        const isPercent = cleaned.indexOf('%') !== -1;

        return {
            type: isPercent ? 'percent' : 'money',
            value: Number.isNaN(number) ? 0 : number,
            displayText: trimmed
        };
    }

    formatNumber(num) {
        return Math.round(num).toLocaleString('ru-RU');
    }

    formatItemValue(item) {
        if (item.textValue) return item.textValue;

        switch (item.type) {
            case 'text':
                return item.displayText;
            case 'percent':
                return '+' + this.formatNumber(item.value) + '%';
            default:
                return this.formatNumber(item.value) + '\u00A0₽';
        }
    }

    getItemQuantity(input) {
        const wrap = input.closest(PricingCalculator.SELECTORS.checkboxWrap);
        const countLabel = wrap ? wrap.querySelector(PricingCalculator.SELECTORS.countLabel) : null;

        if (!countLabel) return {quantity: 1, hasCounter: false};

        const quantity = parseInt(countLabel.textContent, 10);
        return {quantity: Number.isNaN(quantity) ? 0 : quantity, hasCounter: true};
    }

    parseItem(input) {
        const rawValue = input.getAttribute('data-js-value');
        const text = input.getAttribute('data-js-text') || '';

        if (rawValue === null || rawValue.trim() === '' || !text) return null;

        const classified = this.classifyValue(rawValue);
        const {quantity, hasCounter} = this.getItemQuantity(input);


        if (hasCounter && quantity <= 0) return null;

        const multiplier = hasCounter ? quantity : 1;
        const value = classified.type === 'text' ? 0 : classified.value * multiplier;

        const displayLabel = hasCounter && quantity > 1 ? text + ' × ' + quantity : text;
        const textValue = input.getAttribute('data-js-text-value') || '';

        return {
            text: displayLabel,
            type: classified.type,
            value,
            displayText: classified.displayText,
            textValue
        };
    }

    parseRangeItem(input) {
        const {raw: rawValues, textValue} = resolveRangeValues(input);
        const rawLabels = input.dataset.jsLabel || '';
        const baseText = input.dataset.jsText || '';

        if (!rawValues.trim() || !rawLabels.trim() || !baseText) return null;

        const values = rawValues
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v !== '')
            .map((v) => this.classifyValue(v));

        const labels = rawLabels
            .split(',')
            .map((l) => l.trim())
            .filter((l) => l !== '');

        if (!values.length || !labels.length) return null;

        const lastIndex = Math.min(values.length, labels.length) - 1;
        const rawIndex = Number(input.value);
        const index = Math.min(Math.max(Number.isNaN(rawIndex) ? 0 : rawIndex, 0), lastIndex);

        const classified = values[index];
        const label = labels[index];
        if (!classified || !label) return null;

        const prefixMatch = baseText.match(/^(.*?)\(/);
        const prefix = prefixMatch ? prefixMatch[1] : baseText + ' ';
        const text = (prefix + '(' + label + ' операций)').trim();


        return {
            text,
            type: classified.type,
            value: classified.value,
            displayText: classified.displayText,
            textValue,
            isRangeBase: true
        };
    }

    collectBlockItems(block) {
        const items = [];
        const inputs = block.querySelectorAll('input[data-js-value]');

        inputs.forEach((input) => {
            if (input.type === 'range') {
                const item = this.parseRangeItem(input);
                if (item) items.push(item);
                return;
            }

            if (!input.checked) return;
            const item = this.parseItem(input);
            if (item) items.push(item);
        });

        return items;
    }

    getBlockTitle(block) {
        const titleEl = block.querySelector(PricingCalculator.SELECTORS.blockTitle);
        return titleEl ? titleEl.textContent.trim() : '';
    }

    isMainInputChecked(block) {
        const mainInput = block.querySelector(PricingCalculator.SELECTORS.mainInput);
        return !!(mainInput && mainInput.checked);
    }

    calcTotal(items) {
        let percentSum = 0;
        items.forEach((item) => {
            if (item.type === 'percent') percentSum += item.value;
        });

        const rangeItem = items.find((item) => item.isRangeBase && item.type === 'money');

        if (rangeItem) {
            const base = rangeItem.value;
            const flatMoneySum = items.reduce((sum, item) => {
                if (item === rangeItem || item.type !== 'money') return sum;
                return sum + item.value;
            }, 0);

            return base + flatMoneySum + (base * percentSum) / 100;
        }

        const moneySum = items.reduce((sum, item) => (
            item.type === 'money' ? sum + item.value : sum
        ), 0);

        return moneySum + (moneySum * percentSum) / 100;
    }

    buildBlockMarkup(title, items, subtotal, isMainSelected) {
        const rows = items.map((item) => (
            '<div class="calculator-result__block-row">' +
            '<p class="calculator-result__block-text">' + item.text + '</p>' +
            '<p class="calculator-result__block-text">' + this.formatItemValue(item) + '</p>' +
            '</div>'
        )).join('');

        const blockClass = 'calculator-result__block' +
            (isMainSelected ? ' calculator-result__block--main-selected' : '');

        return (
            '<div class="' + blockClass + '">' +
            '<div class="calculator-result__block-row">' +
            '<p class="calculator-result__block-title">' + title + '</p>' +
            '<p class="calculator-result__block-title">' + this.formatNumber(subtotal) + '\u00A0₽</p>' +
            '</div>' +
            '<div class="calculator-result__block-content">' +
            rows +
            '</div>' +
            '</div>'
        );
    }

    recalculate() {
        if (!this.resultInfo || !this.resultTotal) return;

        let grandTotal = 0;
        let blocksMarkup = '';

        this.blocks.forEach((block) => {
            if (!this.isMainInputChecked(block)) return;

            const items = this.collectBlockItems(block);
            if (!items.length) return;

            const subtotal = this.calcTotal(items);
            grandTotal += subtotal;

            const title = this.getBlockTitle(block);
            blocksMarkup += this.buildBlockMarkup(title, items, subtotal, true);
        });

        this.resultInfo.innerHTML = blocksMarkup;
        this.resultTotal.textContent = this.formatNumber(grandTotal) + '\u00A0₽';
    }

    _handleClick(e) {
        const countWrapper = e.target.closest(PricingCalculator.SELECTORS.countWrapper);
        if (!countWrapper) return;

        e.preventDefault();
        e.stopPropagation();

        const isPlus = !!e.target.closest(PricingCalculator.SELECTORS.countPlus);
        const isMinus = !!e.target.closest(PricingCalculator.SELECTORS.countMinus);
        if (!isPlus && !isMinus) return;

        const label = countWrapper.querySelector(PricingCalculator.SELECTORS.countLabel);
        if (!label) return;

        const min = Number(countWrapper.getAttribute('data-js-count-min')) || 0;
        const maxAttr = countWrapper.getAttribute('data-js-count-max');
        const max = maxAttr !== null && maxAttr !== '' ? Number(maxAttr) : Infinity;

        const current = parseInt(label.textContent, 10) || 0;
        const next = isPlus ? current + 1 : current - 1;
        const clamped = Math.min(Math.max(next, min), max);

        if (clamped === current) return;

        label.textContent = String(clamped);
        this.recalculate();
    }

    _handleChange(e) {
        const target = e.target;
        if (target.matches && target.matches('input[type="checkbox"], input[type="radio"]')) {
            this.recalculate();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-calculator').forEach((root) => {
        new PricingCalculator(root).init();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-calculator').forEach((root) => {
        new PricingCalculator(root).init();
    });


});

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