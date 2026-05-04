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

const StickyElement = (() => {
    const DEFAULTS = {
        selector: '[data-sticky]',
        headerSelector: '.header',
        headerTopSelector: '.header-top',
    };

    let config = { ...DEFAULTS };
    let instances = [];
    let ro = null;
    let rafPending = false;
    let resizeTimer = null;
    let initialized = false;

    function getHeaderHeight() {
        const el = document.querySelector(config.headerSelector);
        return el ? el.offsetHeight : 0;
    }

    function getHeaderTopHeight() {
        const el = document.querySelector(config.headerTopSelector);
        return el ? el.offsetHeight : 0;
    }

    function measure(entry) {
        const { sticky } = entry;

        const vh = window.innerHeight;
        const headerH = getHeaderHeight();
        const headerTopH = getHeaderTopHeight();
        const stickyH = sticky.offsetHeight;

        const top = Math.max(0, (vh + headerH - stickyH) / 2);

        sticky.style.setProperty('--sticky-top', `${top}px`);
        sticky.style.setProperty('--sticky-header-top-height', `-${headerTopH}px`);
        sticky.style.setProperty('--sticky-header-height', `${headerH}px`);
        sticky.style.setProperty('--sticky-element-height', `${stickyH}px`);
        sticky.style.setProperty('--sticky-viewport-height', `${vh}px`);
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

    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(scheduleUpdate, 150);
    }

    function init(options = {}) {
        if (initialized) return;
        config = { ...DEFAULTS, ...options };

        const elements = document.querySelectorAll(config.selector);
        if (!elements.length) return;

        ro = new ResizeObserver(scheduleUpdate);

        elements.forEach(sticky => {
            const entry = { sticky };
            instances.push(entry);
            measure(entry);
            ro.observe(sticky);
        });

        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        initialized = true;
    }

    function refresh() {
        if (!initialized) return;
        measureAll();
    }

    function destroy() {
        if (!initialized) return;

        if (ro) {
            ro.disconnect();
            ro = null;
        }

        window.removeEventListener('scroll', scheduleUpdate);
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);

        instances.forEach(({ sticky }) => {
            sticky.style.removeProperty('--sticky-top');
            sticky.style.removeProperty('--sticky-header-height');
            sticky.style.removeProperty('--sticky-element-height');
            sticky.style.removeProperty('--sticky-viewport-height');
        });

        instances = [];
        config = { ...DEFAULTS };
        initialized = false;
    }

    return { init, refresh, destroy };
})();

window.StickyElement = StickyElement;

const Lightbox = (() => {
    const DEFAULTS = {
        itemSelector: '.js-gallery-item',
        gallerySelector: '.js-gallery',
        imageSelector: 'img',
        popupId: '#popup-lightbox',
        imgSelector: '.lightbox-popup__img',
        prevSelector: '.lightbox-popup-prev',
        nextSelector: '.lightbox-popup-next',
    };

    let config = {...DEFAULTS};
    let currentItem = null;
    let currentGalleryItems = [];
    let touchStartX = 0;
    let touchEndX = 0;

    function getImageSrc(item) {
        const bigAttr = item.getAttribute('data-big');
        if (bigAttr) return bigAttr;
        const img = item.querySelector(config.imageSelector);
        return img ? img.getAttribute('src') : null;
    }

    function getImg() {
        return document.querySelector(config.imgSelector);
    }

    function updateNav() {
        const index = currentGalleryItems.indexOf(currentItem);
        const prev = document.querySelector(config.prevSelector);
        const next = document.querySelector(config.nextSelector);
        if (!prev || !next) return;

        const single = currentGalleryItems.length <= 1;
        prev.style.display = single ? 'none' : '';
        next.style.display = single ? 'none' : '';
        prev.classList.toggle('is-disabled', index <= 0);
        next.classList.toggle('is-disabled', index >= currentGalleryItems.length - 1);
    }

    function setImage(item) {
        currentItem = item;
        const img = getImg();
        if (!img) return;

        img.style.opacity = '0';
        setTimeout(() => {
            img.src = getImageSrc(item);
            img.onload = () => {
                img.style.opacity = '1';
            };
        }, 150);

        updateNav();
    }

    function navigate(dir) {
        const index = currentGalleryItems.indexOf(currentItem);
        const next = currentGalleryItems[index + dir];
        if (next) setImage(next);
    }

    function handleSwipe() {
        const diff = touchStartX - touchEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                navigate(1);
            } else {
                navigate(-1);
            }
        }
    }

    function open(item) {
        if (!item) {
            console.warn('[Lightbox] open() — item not found.');
            return;
        }

        const gallery = item.closest(config.gallerySelector);
        currentGalleryItems = gallery
            ? Array.from(gallery.querySelectorAll(config.itemSelector))
            : [item];

        setImage(item);
        window.Popup?.open(config.popupId);
    }

    function bindEvents() {
        document.addEventListener('click', (e) => {
            const item = e.target.closest(config.itemSelector);
            if (item) {
                e.preventDefault();
                open(item);
                return;
            }

            if (e.target.closest(config.prevSelector)) {
                navigate(-1);
                return;
            }
            if (e.target.closest(config.nextSelector)) {
                navigate(1);
                return;
            }
        });

        document.addEventListener('keydown', (e) => {
            const popup = document.querySelector(config.popupId);
            if (!popup?.classList.contains('is-active')) return;
            if (e.key === 'ArrowLeft') navigate(-1);
            if (e.key === 'ArrowRight') navigate(1);
        });

        document.querySelector(config.popupId)?.addEventListener('popup:closed', () => {
            const img = getImg();
            if (img) img.src = '';
            currentItem = null;
            currentGalleryItems = [];
        });

        const popup = document.querySelector(config.popupId);
        if (popup) {
            popup.addEventListener('touchstart', (e) => {
                const img = getImg();
                if (e.target === img) {
                    touchStartX = e.changedTouches[0].screenX;
                }
            }, {passive: true});

            popup.addEventListener('touchend', (e) => {
                const img = getImg();
                if (e.target === img) {
                    touchEndX = e.changedTouches[0].screenX;
                    handleSwipe();
                }
            }, {passive: true});
        }
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};

        const items = document.querySelectorAll(config.itemSelector);
        if (!items.length) {
            console.warn('[Lightbox] No gallery items found on page.');
            return;
        }

        if (!document.querySelector(config.popupId)) {
            console.warn(`[Lightbox] Popup "${config.popupId}" not found on page.`);
            return;
        }

        bindEvents();
    }

    return {init, open};
})();

window.Lightbox = Lightbox;

document.addEventListener('DOMContentLoaded', () => {
     Lightbox.init();
});


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
    StickyElement.init();
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


(function () {
    const header = document.querySelector('.header');
    if(header){
        const headerTop = header.querySelector('.header-top');
        const headerTopH =  headerTop.getBoundingClientRect().height;
        window.addEventListener('scroll',()=>{
            if(window.scrollY > headerTopH){
                header.classList.add('is-fixed')
            }else{
                header.classList.remove('is-fixed')
            }
        })
    }
})();