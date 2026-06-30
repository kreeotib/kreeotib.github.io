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


const ParallaxEffect = (() => {
    const DEFAULTS = {
        containerSelector: '.parallax-container',
        imageSelector: '.parallax-img',
        speed: 1.5,
        scale: 1,
        smooth: true,
    };

    let config = {...DEFAULTS};
    let items = [];


    function render() {
        const screenHeight = window.innerHeight;

        items.forEach(item => {
            const rect = item.container.getBoundingClientRect();

            if (rect.top < screenHeight && rect.bottom > 0) {
                const containerCenter = rect.top + rect.height / 2;
                const screenCenter = screenHeight / 2;
                const distanceFromCenter = (containerCenter - screenCenter) / (screenHeight / 2);

                const move = distanceFromCenter * (config.speed * 100);

                item.img.style.transform = `scale(${config.scale}) translateY(${move}px)`;
            }
        });
    }


    function init(options = {}) {
        config = {...DEFAULTS, ...options};

        const containers = document.querySelectorAll(config.containerSelector);

        if (!containers.length) {
            console.warn('[Parallax] No elements found for selector:', config.containerSelector);
            return;
        }

        items = Array.from(containers).map(container => {
            const img = container.querySelector(config.imageSelector);

            if (!img) {
                console.warn('[Parallax] Image not found in container:', container);
                return null;
            }

            if (!container.style.position || container.style.position === 'static') {
            }

            img.style.willChange = 'transform';

            if (config.smooth) {
                img.style.transition = 'transform 0.1s linear';
            }

            return {container, img};
        }).filter(item => item !== null);

        window.addEventListener('scroll', () => {
            requestAnimationFrame(render);
        }, {passive: true});

        render();
    }


    function refresh() {
        init(config);
    }

    return {init, refresh};
})();

window.ParallaxEffect = ParallaxEffect;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__LB_MANUAL_INIT__) ParallaxEffect.init();
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
    let scrollbarWidth = 0;

    function getScrollbarWidth() {
        const div = document.createElement('div');
        div.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;';
        document.body.appendChild(div);
        const width = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return width;
    }

    function lockScroll() {
        scrollbarWidth = getScrollbarWidth();
        document.documentElement.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
        }
    }

    function unlockScroll() {
        document.documentElement.style.overflow = '';
        document.documentElement.style.paddingRight = '';
    }

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

        unlockScroll(); // ← сначала восстанавливаем скролл
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
        lockScroll();
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
    if (!window.__SR_MANUAL_INIT__) Popup.init({initialDelay: 300});
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
        promoSelector: '.promo',
    };

    let config = {};
    let burgers = [];
    let menu = null;
    let isOpen = false;
    let initialized = false;

    function updatePromoHeight() {
        const promo = document.querySelector(config.promoSelector);
        if (!promo) return;
        if (promo) {
            document.documentElement.style.setProperty('--promo-height', `${promo.getBoundingClientRect().height}px`);
        }
    }

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

        menu.addEventListener('transitionend', updatePromoHeight, { once: true });
    }

    function toggle() { setState(!isOpen); }
    function open() { setState(true); }
    function close() { setState(false); }

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
        config = { ...DEFAULTS, ...options };
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

        updatePromoHeight();
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

    return { init, toggle, open, close, destroy };
})();

window.BurgerMenu = BurgerMenu;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__SR_MANUAL_INIT__) BurgerMenu.init();
});

const RunoverEffect = (() => {
    const DEFAULTS = {
        footerSelector: '.footer',
        contentSelector: '.content',
        scaleReduction: 0.1,
        borderRadius: 40,
        scrub: 1,
    };

    let config = { ...DEFAULTS };
    let items = [];

    function init(options = {}) {
        config = { ...DEFAULTS, ...options };

        const footer = document.querySelector(config.footerSelector);
        const content = document.querySelector(config.contentSelector);

        if (!footer) {
            console.warn('[RunoverEffect] Footer not found:', config.footerSelector);
            return;
        }
        if (!content) {
            console.warn('[RunoverEffect] Content not found:', config.contentSelector);
            return;
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: content,
                start: 'bottom bottom',
                end: 'bottom top',
                scrub: config.scrub,
                invalidateOnRefresh: true,
            },
        });

        tl.fromTo(
            content,
            { scale: 1, borderRadius: '0px' },
            {
                scale: 1 - config.scaleReduction,
                borderRadius: `0 0 ${config.borderRadius}px ${config.borderRadius}px`,
                transformOrigin: 'center top',
                ease: 'none',
            },
            0
        );

        items = [{ footer, content, tl }];
    }

    function refresh() {
        destroy();
        init(config);
    }

    function destroy() {
        items.forEach(({ tl, content }) => {
            tl.kill();
            gsap.set(content, { clearProps: 'scale,borderRadius,willChange' });
        });
        items = [];
    }

    return { init, refresh, destroy };
})();

window.RunoverEffect = RunoverEffect;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__SR_MANUAL_INIT__) RunoverEffect.init();
});

(function () {
    document.querySelectorAll('.js-phone-mask').forEach(function (el) {
        IMask(el, {
            mask: '+7 000 000 00 00',
        });
    });
})();


document.addEventListener('DOMContentLoaded', ()=>{
    try {
        window.lenis = new Lenis({autoRaf: true, lerp: 0.1});
    } catch (e) {
        console.error('Lenis error:', e);
    }

    const reviewsSliderElement = document.querySelectorAll('.reviews-slider');


    if(reviewsSliderElement.length){
        const reviewsSlider = new Swiper('.reviews-slider',{
            slidesPerView:'auto',
            spaceBetween:24,
            navigation:{
                prevEl:'.reviews-button-prev',
                nextEl:'.reviews-button-next',
            }
        })
    }
})


