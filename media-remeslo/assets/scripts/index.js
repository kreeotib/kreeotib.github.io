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
        scrollbarWidth = getScrollbarWidth();
        document.documentElement.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
        }
        if (window.lenis && typeof window.lenis.stop === 'function') {
            window.lenis.stop();
        }
    }

    function applyUnlock() {
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
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

const BurgerMenu = (() => {
    const DEFAULTS = {
        burgerSelector: '.burger',
        menuSelector: '.sidebar-nav',
        burgerActiveClass: 'burger--active',
        menuActiveClass: 'sidebar-nav--active',
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