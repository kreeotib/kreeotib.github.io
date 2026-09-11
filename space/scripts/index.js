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

const VideoToggle = (() => {
    function find(selector, context = document) {
        const el = context.querySelector(selector);
        if (!el) {
            console.warn(`[VideoToggle] Element "${selector}" not found on page.`);
            return null;
        }
        return el;
    }

    function toggle(wrapper) {
        const video = find('.video__item', wrapper);
        if (!video) return;

        if (video.paused) {
            video.play();
            wrapper.classList.add('active');
        } else {
            video.pause();
            wrapper.classList.remove('active');
        }
    }

    function bindTriggers() {
        document.addEventListener('click', (e) => {
            const wrapper = e.target.closest('.video');
            if (!wrapper) return;

            toggle(wrapper);
        });
    }

    function bindVideoEvents() {
        document.addEventListener('pause', (e) => {
            if (!e.target.matches('.video__item')) return;
            const wrapper = e.target.closest('.video');
            if (wrapper) wrapper.classList.remove('active');
        }, true);

        document.addEventListener('play', (e) => {
            if (!e.target.matches('.video__item')) return;
            const wrapper = e.target.closest('.video');
            if (wrapper) wrapper.classList.add('active');
        }, true);
    }

    function bindAutoplay() {
        const wrappers = document.querySelectorAll('.video--autoplay');
        if (!wrappers.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const wrapper = entry.target;
                const video = find('.video__item', wrapper);
                if (!video) return;

                if (entry.isIntersecting) {
                    video.play().catch(() => {});
                } else {
                    video.pause();
                }
            });
        }, {
            threshold: 0.5
        });

        wrappers.forEach((wrapper) => observer.observe(wrapper));
    }

    function init() {
        bindTriggers();
        bindVideoEvents();
        bindAutoplay();
    }

    return {init};
})();

window.VideoToggle = VideoToggle;

document.addEventListener('DOMContentLoaded', () => {
    VideoToggle.init();
});

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
    BurgerMenu.init();
});

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

const Tabs = (() => {
    const DEFAULTS = {
        tabSelector: '.tabs',
        navButtonSelector: '.tabs-button',
        nextButtonSelector: '.tabs-button-next',
        prevButtonSelector: '.tabs-button-prev',
        contentSelector: '.tabs-content',
        activeButtonClass: 'tabs-button--active',
        activeContentClass: 'tabs-content--active',
        activeIndex: 0,
    };

    let config = { ...DEFAULTS };
    let instances = [];
    let initialized = false;


    function getNavButtons(instance) {
        return Array.from(
            instance.tab.querySelectorAll(config.navButtonSelector)
        ).filter(
            btn =>
                !btn.matches(config.nextButtonSelector) &&
                !btn.matches(config.prevButtonSelector)
        );
    }


    function switchTo(instance, index) {
        const { navButtons, contentPanels, tab } = instance;

        const total = navButtons.length;
        if (!total) return;
        index = Math.max(0, Math.min(index, total - 1));

        if (index === instance.activeIndex) return;
        instance.activeIndex = index;

        navButtons.forEach((btn, i) => {
            btn.classList.toggle(config.activeButtonClass, i === index);
        });

        contentPanels.forEach((panel, i) => {
            panel.classList.toggle(config.activeContentClass, i === index);
        });

        const activePanel = contentPanels[index];
        const wrapper = activePanel
            ? activePanel.querySelector('.tabs-content__wrapper')
            : null;

        instance.activeHeight = wrapper ? wrapper.offsetHeight : 0;

        tab.style.setProperty('--tabs-content-height', `${instance.activeHeight}px`);
    }
    function bindNavButtons(instance) {
        instance.navButtons = getNavButtons(instance);

        instance.navButtons.forEach((btn, i) => {
            btn.addEventListener('click', e => {
                e.preventDefault();
                switchTo(instance, i);
            });
        });
    }

    function bindArrows(instance) {
        const { tab } = instance;

        const next = tab.querySelector(config.nextButtonSelector);
        const prev = tab.querySelector(config.prevButtonSelector);

        if (next) {
            next.addEventListener('click', e => {
                e.preventDefault();
                switchTo(instance, instance.activeIndex + 1);
            });
        }

        if (prev) {
            prev.addEventListener('click', e => {
                e.preventDefault();
                switchTo(instance, instance.activeIndex - 1);
            });
        }
    }


    function setup(tab) {
        const contentPanels = Array.from(
            tab.querySelectorAll(config.contentSelector)
        );

        if (!contentPanels.length) return null;

        const instance = {
            tab,
            navButtons: [],
            contentPanels,
            activeIndex: -1,
            activeHeight: 0,
        };


        bindNavButtons(instance);
        bindArrows(instance);

        switchTo(instance, config.activeIndex);

        return instance;
    }


    function init(options = {}) {
        if (initialized) return;

        config = { ...DEFAULTS, ...options };

        const tabs = document.querySelectorAll(config.tabSelector);
        if (!tabs.length) return;

        tabs.forEach(tab => {
            const instance = setup(tab);
            if (instance) instances.push(instance);
        });

        initialized = true;
    }

    function goTo(tabIndex, panelIndex) {
        const instance = instances[tabIndex];
        if (instance) switchTo(instance, panelIndex);
    }

    function refresh() {
        if (!initialized) return;

        instances.forEach(instance => {
            instance.navButtons = getNavButtons(instance);
            switchTo(instance, instance.activeIndex);
        });
    }

    function destroy() {
        if (!initialized) return;

        instances.forEach(({ tab }) => {
            tab.querySelectorAll(`.${config.activeButtonClass}`)
                .forEach(el => el.classList.remove(config.activeButtonClass));
            tab.querySelectorAll(`.${config.activeContentClass}`)
                .forEach(el => el.classList.remove(config.activeContentClass));
        });

        instances = [];
        config = { ...DEFAULTS };
        initialized = false;
    }

    return { init, goTo, refresh, destroy };
})();

window.Tabs = Tabs;

document.addEventListener('DOMContentLoaded', () => {
    Tabs.init();
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

(function () {
    const STORAGE_KEY = 'cookieAccepted';
    const banner = document.querySelector('.cookie');

    if (!banner) return;

    if (localStorage.getItem(STORAGE_KEY) !== null) {
        banner.style.display = 'none';
        return;
    }

    const buttonYes = banner.querySelector('.cookie__button-yes');
    const buttonNo = banner.querySelector('.cookie__button-no');

    if (buttonYes) {
        buttonYes.addEventListener('click', function () {
            localStorage.setItem(STORAGE_KEY, 'true');
            banner.style.display = 'none';
        });
    }

    if (buttonNo) {
        buttonNo.addEventListener('click', function () {
            localStorage.setItem(STORAGE_KEY, 'false');
            banner.style.display = 'none';
        });
    }
})();

(function () {
    const button = document.querySelector('.button-up');

    if (!button) return;

    button.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


})();

(function () {
    document.querySelectorAll('.js-phone-mask').forEach(function (el) {
        IMask(el, {
            mask: '+7 000 000 00 00',
        });
    });
})();

(() => {
    const button = document.querySelector('.button-up');
    const footerMap = document.querySelector('.footer__map-item');

    if (!button || !footerMap) {
        return;
    }

    const indent = 0;

    const getDocOffsetBottom = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom + window.scrollY;
    };

    const updateButtonPosition = () => {
        const buttonHeight = button.offsetHeight;
        const footerDocBottom = getDocOffsetBottom(footerMap);
        const stopBottom = footerDocBottom - indent;
        const fixedBottomOffset = indent;
        const currentBottomDocPos = window.scrollY + window.innerHeight - fixedBottomOffset;

        if (currentBottomDocPos >= stopBottom) {
            button.style.position = 'absolute';
            button.style.bottom = 'auto';
            button.style.top = `${stopBottom - buttonHeight}px`;
        } else {
            button.style.position = 'fixed';
            button.style.top = 'auto';
            button.style.bottom = `${fixedBottomOffset}px`;
        }
    };

    window.addEventListener('scroll', updateButtonPosition);
    window.addEventListener('resize', updateButtonPosition);

    updateButtonPosition();
})();