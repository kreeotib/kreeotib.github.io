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

    function init() {
        bindTriggers();
        bindVideoEvents();
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
        const { navButtons, contentPanels } = instance;

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