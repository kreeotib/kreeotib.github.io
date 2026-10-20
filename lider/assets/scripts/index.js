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