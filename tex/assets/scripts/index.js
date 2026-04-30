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


document.addEventListener('DOMContentLoaded', () => {
    StickyCenterGrid.init();
    ToggleWrapper.init();

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
        navigation:{
            prevEl:'.team-slider-button-prev',
            nextEl:'.team-slider-button-next'
        },
        breakpoints: {
            641: {
                spaceBetween: 20,
            }
        }
    });
});