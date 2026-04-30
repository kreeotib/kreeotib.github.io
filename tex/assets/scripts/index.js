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


document.addEventListener('DOMContentLoaded', () => {
    StickyCenterGrid.init();

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