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

document.addEventListener('DOMContentLoaded', () => {
    SmoothScroll.init();
});

class CatalogFilter {
    constructor(root, options = {}) {
        this.root = root;
        this.step = options.step || 3;

        this.radios = root.querySelectorAll('input[name="catalog-filter"]');
        this.items = Array.from(root.querySelectorAll('.catalog__items-item'));
        this.moreBtn = root.querySelector('.button--center');

        this.activeFilter = 'all';
        this.visibleCount = this.step;

        this.onFilterChange = this.onFilterChange.bind(this);
        this.onMoreClick = this.onMoreClick.bind(this);

        this.init();
    }

    init() {
        this.radios.forEach((radio) =>
            radio.addEventListener('change', this.onFilterChange)
        );

        if (this.moreBtn) {
            this.moreBtn.addEventListener('click', this.onMoreClick);
        }

        const checked = this.root.querySelector('input[name="catalog-filter"]:checked');
        this.activeFilter = checked ? checked.value : 'all';

        this.render();
    }

    getMatched() {
        return this.items.filter(
            (item) =>
                this.activeFilter === 'all' ||
                item.dataset.filter === this.activeFilter
        );
    }

    onFilterChange(e) {
        this.activeFilter = e.target.value;
        this.visibleCount = this.step;
        this.render();
    }

    onMoreClick() {
        this.visibleCount += this.step;
        this.render();
    }

    render() {
        const matched = this.getMatched();

        this.items.forEach((item) => this.toggleItem(item, false));
        matched.slice(0, this.visibleCount).forEach((item) => this.toggleItem(item, true));

        if (this.moreBtn) {
            this.moreBtn.style.display = matched.length > this.visibleCount ? '' : 'none';
        }
    }

    toggleItem(item, isActive) {
        item.classList.toggle('catalog__items-item--active', isActive);
        item.style.display = isActive ? '' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const section = document.querySelector('.section__wrapper');
    if (section) new CatalogFilter(section, { step: 3 });
});

const AnchorSmoothScroll = (() => {
    const DEFAULTS = {
        selector: 'a[href^="#"]:not([href="#"])',
        offset: 0,
        duration: 1.2,
        updateHash: true,
        onlySamePage: true,
    };

    let options = { ...DEFAULTS };
    let handler = null;

    function getLenis() {
        return (typeof window !== 'undefined' && window.lenis) ? window.lenis : null;
    }

    function resolveTarget(href) {
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return null;

        const hash = href.slice(hashIndex);
        if (hash === '#') return null;

        try {
            return document.querySelector(hash);
        } catch (e) {

            return null;
        }
    }

    function onClick(e) {
        const link = e.target.closest(options.selector);
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href) return;

        if (options.onlySamePage) {
            const url = new URL(href, window.location.href);
            if (url.pathname !== window.location.pathname || url.origin !== window.location.origin) {
                return;
            }
        }

        const target = resolveTarget(href);
        if (!target) return;

        e.preventDefault();

        const lenis = getLenis();

        if (lenis && typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(target, {
                offset: options.offset,
                duration: options.duration,
            });
        } else if ('scrollBehavior' in document.documentElement.style) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            const top = target.getBoundingClientRect().top + window.scrollY + options.offset;
            window.scrollTo(0, top);
        }

        if (options.updateHash) {
            history.pushState(null, '', href.slice(href.indexOf('#')));
        }
    }

    function init(userOptions = {}) {
        options = { ...DEFAULTS, ...userOptions };
        if (handler) return; // уже проинициализирован

        handler = onClick;
        document.addEventListener('click', handler);
    }

    function destroy() {
        if (handler) {
            document.removeEventListener('click', handler);
            handler = null;
        }
    }

    return { init, destroy };
})();

window.AnchorSmoothScroll = AnchorSmoothScroll;

document.addEventListener('DOMContentLoaded', () => {
    AnchorSmoothScroll.init({});
});

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
    if (!window.__SR_MANUAL_INIT__) ScrollReveal.init({initialDelay: 300});
});

const Popup = (() => {
    const CLOSE_DURATION = 210;

    let activePopup = null;

    function find(selector) {
        const el = document.querySelector(selector);
        if (!el) {
            console.warn(`[Popup] Element "${selector}" not found on page.`);
            return null;
        }
        return el;
    }

    function close() {
        if (!activePopup) return;

        const popup = activePopup;
        activePopup = null;

        ScrollLock.unlock();
        const videoTag = popup.querySelectorAll("video");
        if(videoTag.length){
            videoTag.forEach(tag=>{
                tag.pause();
            })
        }
        const frameTag = popup.querySelectorAll("iframe");
        popup.querySelectorAll('iframe').forEach(frame => {
            frame.src = 'about:blank';
        });

        popup.classList.add('is-closing');

        setTimeout(() => {
            popup.classList.remove('is-active', 'is-closing');
            popup.dispatchEvent(new CustomEvent('popup:closed', {bubbles: true}));
        }, CLOSE_DURATION);
    }

    function open(selector) {
        const popup = find(selector);
        if (!popup) return;

        if (activePopup && activePopup !== popup) close();

        activePopup = popup;
        popup.classList.add('is-active');
        ScrollLock.lock();
        popup.scrollTop = 0;
        popup.dispatchEvent(new CustomEvent('popup:opened', {bubbles: true}));
    }

    function bindTriggers() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-popup]');
            if (trigger) {
                e.preventDefault();
                open(trigger.dataset.popup);
                return;
            }

            if (e.target.closest('.popup-close')) {
                close();
                return;
            }

            if (e.target.closest('.popup.is-active') && !e.target.closest('.popup__content')) {
                close();
            }
        });
    }

    function bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && activePopup) close();
        });
    }

    function init() {
        bindTriggers();
        bindKeyboard();
    }

    return {init, open, close};
})();

window.Popup = Popup;

document.addEventListener('DOMContentLoaded', () => {
    Popup.init();
});

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
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.documentElement.style.setProperty('--scrollbar-width', scrollbarWidth + 'px');
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


document.addEventListener('DOMContentLoaded',()=>{
    const heroSlider = new Swiper('.hero-slider',{
        slidesPerView:1,
        pagination:{
            el:".hero-slider__nav",
            autoplay:{
                delay:3500
            }
        }
    })
})