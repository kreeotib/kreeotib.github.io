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

const StickyCenterGrid = (() => {
    const DEFAULTS = {
        selector: '[data-sticky-grid]',
        stickySelector: '.grid__sticky',
        columnSelector: '.grid__column:not(.grid__sticky)',
        headerAttr: 'data-sticky-grid-header',
        defaultHeaderSelector: '.header',
    };

    let config = {...DEFAULTS};
    let instances = [];
    let ro = null;
    let rafPending = false;
    let resizeTimer = null;
    let onLenisScroll = null;
    let onWindowScroll = null;
    let initialized = false;

    function getHeaderHeight(selector) {
        const el = document.querySelector(selector);
        return el ? el.offsetHeight : 0;
    }

    function measure(entry) {
        const {fixed, headerSelector} = entry;

        const vh = window.innerHeight;
        const headerH = getHeaderHeight(headerSelector);
        const fixedH = fixed.offsetHeight;
        const isTall = fixedH > vh;

        const top = isTall
            ? headerH
            : Math.max(0, (vh + headerH - fixedH) / 2);

        fixed.style.setProperty('--scg-top', `${top}px`);
        fixed.style.setProperty('--scg-header-h', `${headerH}px`);
        fixed.style.setProperty('--scg-fixed-h', `${fixedH}px`);
        fixed.style.setProperty('--scg-vh', `${vh}px`);
        fixed.style.setProperty('--scg-mode', isTall ? 'tall' : 'center');
    }

    function measureAll() {
        instances.forEach(measure);
    }

    function scheduleUpdate() {
        if (rafPending) return;
        rafPending = true;

        requestAnimationFrame(() => {
            rafPending = false;
            measureAll();
        });
    }

    function setupInstance(grid) {
        const fixed = grid.querySelector(config.stickySelector);
        const column = grid.querySelector(config.columnSelector);

        if (!fixed || !column) return;

        const headerSelector = grid.getAttribute(config.headerAttr) || config.defaultHeaderSelector;
        const entry = {grid, fixed, column, headerSelector};

        instances.push(entry);
        measure(entry);

        if (ro) {
            ro.observe(fixed);
            ro.observe(column);
        }
    }

    function bindScroll() {
        const lenis = window.lenis;

        if (lenis && typeof lenis.on === 'function') {
            onLenisScroll = () => scheduleUpdate();
            lenis.on('scroll', onLenisScroll);
        } else {
            onWindowScroll = () => scheduleUpdate();
            window.addEventListener('scroll', onWindowScroll, {passive: true});
        }
    }

    function unbindScroll() {
        const lenis = window.lenis;
        if (lenis && onLenisScroll && typeof lenis.off === 'function') {
            lenis.off('scroll', onLenisScroll);
            onLenisScroll = null;
        }
        if (onWindowScroll) {
            window.removeEventListener('scroll', onWindowScroll);
            onWindowScroll = null;
        }
    }

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(scheduleUpdate, 150);
    }

    function init(options = {}) {
        if (initialized) return;
        config = {...DEFAULTS, ...options};

        const grids = document.querySelectorAll(config.selector);
        if (!grids.length) return;

        ro = new ResizeObserver(scheduleUpdate);

        grids.forEach(setupInstance);
        bindScroll();

        window.addEventListener('resize', onResize, {passive: true});

        initialized = true;
    }

    function refresh() {
        if (!initialized) return;
        measureAll();
    }

    function destroy() {
        if (!initialized) return;
        unbindScroll();
        if (ro) {
            ro.disconnect();
            ro = null;
        }
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);

        instances.forEach(entry => {
            entry.fixed.style.removeProperty('--scg-top');
            entry.fixed.style.removeProperty('--scg-header-h');
            entry.fixed.style.removeProperty('--scg-fixed-h');
            entry.fixed.style.removeProperty('--scg-vh');
            entry.fixed.style.removeProperty('--scg-mode');
        });

        instances = [];
        initialized = false;
    }

    return {init, refresh, destroy};
})();

window.StickyCenterGrid = StickyCenterGrid;

const ToggleWrapper = (() => {
    const DEFAULTS = {
        wrapperSelector: '.toggle-wrapper',
        blockSelector: '.toggle-block',
        openClass: 'open',
        heightVar: '--toggle-height',
        transitionProperty: 'max-height',
    };

    let config = {...DEFAULTS};
    const resizeObservers = new WeakMap();
    const mutationObservers = new WeakMap();
    const transitionHandlers = new WeakMap();
    const registered = new WeakSet();

    function updateHeight(wrapper, block) {
        wrapper.style.setProperty(config.heightVar, block.scrollHeight + 'px');
    }

    function createTransitionHandler(wrapper) {
        return function (event) {
            if (event.target !== wrapper) return;
            if (event.propertyName !== config.transitionProperty) return;
            if (wrapper.classList.contains(config.openClass)) {
                wrapper.style.maxHeight = 'none';
            }
        };
    }

    function openWrapper(wrapper) {
        wrapper.style.maxHeight = '';
        void wrapper.offsetHeight;
    }

    function closeWrapper(wrapper, block) {
        wrapper.style.maxHeight = block.scrollHeight + 'px';
        void wrapper.offsetHeight;
        requestAnimationFrame(() => {
            wrapper.style.maxHeight = '';
        });
    }

    function observeClass(wrapper, block) {
        let wasOpen = wrapper.classList.contains(config.openClass);
        if (wasOpen) wrapper.style.maxHeight = 'none';

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') continue;
                const isOpen = wrapper.classList.contains(config.openClass);
                if (isOpen === wasOpen) continue;
                if (isOpen) openWrapper(wrapper);
                else closeWrapper(wrapper, block);
                wasOpen = isOpen;
            }
        });

        observer.observe(wrapper, {attributes: true, attributeFilter: ['class']});
        mutationObservers.set(wrapper, observer);
    }

    function observeResize(wrapper, block) {
        const observer = new ResizeObserver(() => updateHeight(wrapper, block));
        observer.observe(block);
        resizeObservers.set(block, observer);
    }

    function initWrapper(wrapper) {
        if (registered.has(wrapper)) return;
        const block = wrapper.querySelector(':scope > ' + config.blockSelector);
        if (!block) return;

        registered.add(wrapper);
        updateHeight(wrapper, block);
        observeResize(wrapper, block);

        const handler = createTransitionHandler(wrapper);
        wrapper.addEventListener('transitionend', handler);
        transitionHandlers.set(wrapper, handler);

        observeClass(wrapper, block);
    }

    function init(container, options = {}) {
        config = {...DEFAULTS, ...options};
        const root = container || document;
        const wrappers = root.querySelectorAll(config.wrapperSelector);

        if (!wrappers.length) {
            console.warn('[ToggleWrapper] No wrappers found.');
            return;
        }

        wrappers.forEach(initWrapper);
    }

    function refresh(container) {
        const root = container || document;
        const wrappers = root.querySelectorAll(config.wrapperSelector);
        wrappers.forEach((wrapper) => {
            const block = wrapper.querySelector(':scope > ' + config.blockSelector);
            if (block) updateHeight(wrapper, block);
        });
    }

    function destroy(wrapper) {
        if (!registered.has(wrapper)) return;
        const block = wrapper.querySelector(':scope > ' + config.blockSelector);

        const resizeObserver = block && resizeObservers.get(block);
        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObservers.delete(block);
        }

        const mutationObserver = mutationObservers.get(wrapper);
        if (mutationObserver) {
            mutationObserver.disconnect();
            mutationObservers.delete(wrapper);
        }

        const handler = transitionHandlers.get(wrapper);
        if (handler) {
            wrapper.removeEventListener('transitionend', handler);
            transitionHandlers.delete(wrapper);
        }

        registered.delete(wrapper);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => init());
    } else {
        init();
    }

    return {init, refresh, destroy};
})();

window.ToggleWrapper = ToggleWrapper;

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


document.addEventListener('DOMContentLoaded', () => {
    StickyCenterGrid.init();
    ToggleWrapper.init();
    Popup.init();
    BurgerMenu.init();

    const articleSlider = new Swiper('.article-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        mousewheel: {
            invert: false,
            forceToAxis: true,
        },
        breakpoints: {
            641: {
                spaceBetween: 20,
            }
        }
    });

    const teamSlider = new Swiper('.team-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        mousewheel: {
            invert: false,
            forceToAxis: true,
        },
        navigation: {
            prevEl: '.team-slider-button-prev',
            nextEl: '.team-slider-button-next'
        },
        breakpoints: {
            641: {
                spaceBetween: 20,
            }
        }
    });
});


(function () {
    document.querySelectorAll('.js-phone-mask').forEach(function (el) {
        IMask(el, {
            mask: '+7 000 000 00 00',
        });
    });
})();


(function () {
    const dataVideo = document.querySelectorAll('[data-video]'),
        popupVideo = document.querySelector('.popup-video');

    if (dataVideo.length && popupVideo) {
        const popupVideoElement = popupVideo.querySelector('video');
        dataVideo.forEach(video => {
            const videoSrc = video.dataset.video;
            video.addEventListener('click', e => {
                e.preventDefault();

                popupVideoElement.src = videoSrc;
                setTimeout(() => {
                    Popup.open('.popup-video')
                }, 300)

            })
        });
    }
})();

(function () {
    const form = document.querySelectorAll('form');

    if (form.length) {
        form.forEach(form => {
            form.addEventListener('submit', e => {
                e.preventDefault();
                Popup.open('.popup-thanks')
            })
        });
    }
})();