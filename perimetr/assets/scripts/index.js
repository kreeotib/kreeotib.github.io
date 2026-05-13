const PhotoSlider = (() => {
    const DEFAULTS = {
        sliderSelector: '.photo-slider',
        mainSelector: '.photo-slider__main',
        itemSelector: '.photo-slider__item',
        imgSelector: '.photo-slider__img',
        paginationSelector: '.photo-slider__pagination',
        bulletClass: 'photo-slider__bullet',
        bulletActiveClass: 'photo-slider__bullet photo-slider__bullet--active',
        buttonPrevSelector: '.photo-slider__button--prev',
        buttonNextSelector: '.photo-slider__button--next',
        scrollStep: 0.8,
        scrollDuration: 400,
        dragThreshold: 4,
        momentumMultiplier: 2.5,
        momentumDuration: 600,
    };

    let config = { ...DEFAULTS };
    let instances = [];
    let initialized = false;

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function smoothScroll(element, targetScrollTop, duration) {
        const start = element.scrollTop;
        const distance = targetScrollTop - start;
        const startTime = performance.now();

        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            element.scrollTop = start + distance * easeInOutQuad(progress);
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    function buildPagination(instance) {
        const { main, pagination, bullets } = instance;

        if (!pagination) return;

        const mainH = main.clientHeight;
        const itemH = main.scrollHeight;

        if (itemH <= mainH) {
            pagination.innerHTML = '';
            bullets.length = 0;
            return;
        }

        const count = Math.max(2, Math.ceil(itemH / mainH));

        if (bullets.length === count) return;

        pagination.innerHTML = '';
        bullets.length = 0;

        for (let i = 0; i < count; i++) {
            const span = document.createElement('span');
            span.className = i === 0
                ? config.bulletActiveClass
                : config.bulletClass;
            pagination.appendChild(span);
            bullets.push(span);
        }
    }

    function updateActiveBullet(instance) {
        const { main, bullets } = instance;

        if (!bullets.length) return;

        const mainH = main.clientHeight;
        const scrollTop = main.scrollTop;
        const maxScroll = main.scrollHeight - mainH;

        const index = maxScroll > 0
            ? Math.round((scrollTop / maxScroll) * (bullets.length - 1))
            : 0;

        bullets.forEach((b, i) => {
            b.className = i === index
                ? config.bulletActiveClass
                : config.bulletClass;
        });
    }

    function scrollToBullet(instance, index) {
        const { main, bullets } = instance;

        if (!bullets.length) return;

        const mainH = main.clientHeight;
        const maxScroll = main.scrollHeight - mainH;
        const target = maxScroll * (index / (bullets.length - 1));

        smoothScroll(main, target, config.scrollDuration);
    }

    function scrollByStep(instance, direction) {
        const { main } = instance;

        const step = main.clientHeight * config.scrollStep;
        const target = main.scrollTop + direction * step;

        smoothScroll(main, target, config.scrollDuration);
    }

    function bindButtons(instance) {
        const { slider } = instance;

        const prev = slider.querySelector(config.buttonPrevSelector);
        const next = slider.querySelector(config.buttonNextSelector);

        if (prev) prev.addEventListener('click', () => scrollByStep(instance, -1));
        if (next) next.addEventListener('click', () => scrollByStep(instance, 1));
    }

    function bindPaginationClicks(instance) {
        const { pagination } = instance;

        if (!pagination) return;

        pagination.addEventListener('click', e => {
            const span = e.target.closest('span');
            if (!span) return;

            const index = instance.bullets.indexOf(span);
            if (index === -1) return;

            scrollToBullet(instance, index);
        });
    }

    function bindDrag(instance) {
        const { main } = instance;

        const drag = {
            active: false,
            startY: 0,
            startScroll: 0,
            lastY: 0,
            lastTime: 0,
            velocity: 0,
            dragged: false,
        };

        function getY(e) {
            return e.touches ? e.touches[0].clientY : e.clientY;
        }

        function onStart(e) {
            if (e.touches && e.touches.length > 1) return;

            drag.active = true;
            drag.dragged = false;
            drag.startY = getY(e);
            drag.lastY = drag.startY;
            drag.startScroll = main.scrollTop;
            drag.lastTime = performance.now();
            drag.velocity = 0;

            main.style.cursor = 'grabbing';
        }

        function onMove(e) {
            if (!drag.active) return;

            const y = getY(e);
            const delta = drag.startY - y;

            if (!drag.dragged && Math.abs(delta) > config.dragThreshold) {
                drag.dragged = true;
            }

            if (!drag.dragged) return;

            if (e.cancelable !== false) e.preventDefault();

            const now = performance.now();
            const dt = now - drag.lastTime;

            if (dt > 0) {
                drag.velocity = (drag.lastY - y) / dt;
            }

            drag.lastY = y;
            drag.lastTime = now;

            main.scrollTop = drag.startScroll + delta;
        }

        function onEnd() {
            if (!drag.active) return;

            drag.active = false;
            main.style.cursor = '';

            if (!drag.dragged) return;

            const distance = drag.velocity * config.momentumMultiplier * config.momentumDuration;
            const target = main.scrollTop + distance;

            smoothScroll(main, target, config.momentumDuration);
        }

        main.addEventListener('mousedown', onStart);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onEnd);

        main.addEventListener('touchstart', onStart, { passive: true });
        main.addEventListener('touchmove', onMove, { passive: false });
        main.addEventListener('touchend', onEnd);

        instance.dragCleanup = () => {
            main.removeEventListener('mousedown', onStart);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onEnd);
            main.removeEventListener('touchstart', onStart);
            main.removeEventListener('touchmove', onMove);
            main.removeEventListener('touchend', onEnd);
        };
    }

    function onScroll(instance) {
        updateActiveBullet(instance);
    }

    function setup(slider) {
        const main = slider.querySelector(config.mainSelector);
        const pagination = slider.querySelector(config.paginationSelector);

        if (!main) return null;

        const instance = {
            slider,
            main,
            pagination,
            bullets: [],
            ro: null,
            dragCleanup: null,
        };

        buildPagination(instance);
        bindButtons(instance);
        bindPaginationClicks(instance);
        bindDrag(instance);

        main.addEventListener('scroll', () => onScroll(instance), { passive: true });

        instance.ro = new ResizeObserver(() => {
            buildPagination(instance);
            updateActiveBullet(instance);
        });

        instance.ro.observe(main);

        const img = main.querySelector(config.imgSelector);

        if (img) {
            if (!img.complete) {
                img.addEventListener('load', () => {
                    buildPagination(instance);
                    updateActiveBullet(instance);
                }, { once: true });
            } else {
                buildPagination(instance);
                updateActiveBullet(instance);
            }
        }

        return instance;
    }

    function init(options = {}) {
        if (initialized) return;

        config = { ...DEFAULTS, ...options };

        const sliders = document.querySelectorAll(config.sliderSelector);
        if (!sliders.length) return;

        sliders.forEach(slider => {
            const instance = setup(slider);
            if (instance) instances.push(instance);
        });

        initialized = true;
    }

    function refresh() {
        if (!initialized) return;

        instances.forEach(instance => {
            buildPagination(instance);
            updateActiveBullet(instance);
        });
    }

    function destroy() {
        if (!initialized) return;

        instances.forEach(({ ro, dragCleanup, bullets, pagination }) => {
            if (ro) ro.disconnect();
            if (dragCleanup) dragCleanup();
            if (pagination) pagination.innerHTML = '';
            bullets.length = 0;
        });

        instances = [];
        config = { ...DEFAULTS };
        initialized = false;
    }

    return { init, refresh, destroy };
})();

window.PhotoSlider = PhotoSlider;


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

const AnchorSpy = (() => {
    const DEFAULTS = {
        navSelector: '.nav',
        linkSelector: 'a[href^="#"]',
        activeClass: 'active',
        nextButtonSelector: '.anchor-next',
        prevButtonSelector: '.anchor-prev',
        offset: 0,
    };

    let config = { ...DEFAULTS };
    let instances = [];
    let initialized = false;

    function getLinks(nav) {
        return Array.from(nav.querySelectorAll(config.linkSelector));
    }

    function getSections(links) {
        return links
            .map(link => {
                const id = link.getAttribute('href').slice(1);
                const section = document.getElementById(id);
                if (!section) return null;

                return { link, section };
            })
            .filter(Boolean);
    }

    function clearActive(instance) {
        instance.items.forEach(item =>
            item.link.classList.remove(config.activeClass)
        );
        instance.activeIndex = -1;
    }

    function setActive(instance, index) {
        if (index === instance.activeIndex) return;

        clearActive(instance);

        if (index < 0 || index >= instance.items.length) return;

        instance.activeIndex = index;
        instance.items[index].link.classList.add(config.activeClass);
    }

    function updateActiveOnScroll(instance) {
        const scrollTop = window.scrollY + config.offset;
        const viewportHeight = window.innerHeight;

        let activeIndex = -1;

        instance.items.forEach((item, i) => {
            const rect = item.section.getBoundingClientRect();
            const sectionTop = rect.top + window.scrollY;
            const sectionBottom = sectionTop + rect.height;

            const inView =
                sectionTop <= scrollTop + viewportHeight / 2 &&
                sectionBottom > scrollTop;

            if (inView) {
                activeIndex = i;
            }
        });

        if (activeIndex === -1) {
            clearActive(instance);
        } else {
            setActive(instance, activeIndex);
        }
    }

    function bindScroll(instance) {
        const handler = () => updateActiveOnScroll(instance);
        window.addEventListener('scroll', handler);
        window.addEventListener('resize', handler);
        instance.scrollHandler = handler;
    }

    function bindArrows(instance) {
        const next = document.querySelector(config.nextButtonSelector);
        const prev = document.querySelector(config.prevButtonSelector);

        if (next) {
            next.addEventListener('click', e => {
                e.preventDefault();
                const nextIndex = Math.min(
                    instance.activeIndex + 1,
                    instance.items.length - 1
                );

                if (nextIndex >= 0) {
                    instance.items[nextIndex].section.scrollIntoView({
                        behavior: 'smooth',
                    });
                }
            });
        }

        if (prev) {
            prev.addEventListener('click', e => {
                e.preventDefault();
                const prevIndex = Math.max(
                    instance.activeIndex - 1,
                    0
                );

                if (prevIndex >= 0) {
                    instance.items[prevIndex].section.scrollIntoView({
                        behavior: 'smooth',
                    });
                }
            });
        }
    }

    function setup(nav) {
        const links = getLinks(nav);
        if (!links.length) return null;

        const items = getSections(links);
        if (!items.length) return null;

        const instance = {
            nav,
            items,
            activeIndex: -1,
            scrollHandler: null,
        };

        bindScroll(instance);
        bindArrows(instance);
        updateActiveOnScroll(instance);

        return instance;
    }

    function init(options = {}) {
        if (initialized) return;

        config = { ...DEFAULTS, ...options };

        const navs = document.querySelectorAll(config.navSelector);
        if (!navs.length) return;

        navs.forEach(nav => {
            const instance = setup(nav);
            if (instance) instances.push(instance);
        });

        initialized = true;
    }

    function refresh() {
        if (!initialized) return;
        destroy();
        init(config);
    }

    function destroy() {
        if (!initialized) return;

        instances.forEach(instance => {
            window.removeEventListener(
                'scroll',
                instance.scrollHandler
            );
            window.removeEventListener(
                'resize',
                instance.scrollHandler
            );

            clearActive(instance);
        });

        instances = [];
        config = { ...DEFAULTS };
        initialized = false;
    }

    return { init, refresh, destroy };
})();

window.AnchorSpy = AnchorSpy;

const ScrollReveal = (() => {
    const DEFAULTS = {
        staggerDelay: 200,
        duration: 1000,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',

        // translate
        enableTranslate: true,
        offsetY: '40px',

        // scale (глобальный)
        enableScale: false,
        scaleFrom: 0.8,

        threshold: 0,
        rootMargin: '0px 0px -40px 0px',
        once: true,
        initialDelay: 100,
    };

    let observer = null;
    let initialized = false;
    let config = { ...DEFAULTS };

    function hideItem(item) {
        const hasCustomScale = item.dataset.scale !== undefined;

        let transformValue = '';

        // ✅ Если есть data-scale → используем только scale
        if (hasCustomScale) {
            const scaleValue = parseFloat(item.dataset.scale);
            transformValue = `scale(${scaleValue})`;
        }
        // ✅ Если нет data-scale → применяем либо глобальный scale либо translate
        else if (config.enableScale) {
            transformValue = `scale(${config.scaleFrom})`;
        }
        else if (config.enableTranslate) {
            transformValue = `translateY(${config.offsetY})`;
        }

        item.style.opacity = '0';
        item.style.transform = transformValue;

        item.style.transition = `
            opacity ${config.duration}ms ${config.easing},
            transform ${config.duration}ms ${config.easing}
        `;

        item.style.willChange = 'opacity, transform';
    }

    function revealItem(item, delay = 0) {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'none';
            item.style.willChange = '';

            item.addEventListener('transitionend', () => {
                if (item.hasAttribute('data-animation')) {
                    item.removeAttribute('data-animation');
                    item.setAttribute('data-animation-final', '');
                    item.style.transition = '';
                    item.style.opacity = '';
                    item.style.transform = '';
                }
            }, { once: true });
        }, delay);
    }

    function revealWrapper(wrapper) {
        const items = wrapper.querySelectorAll('[data-animation]');
        items.forEach((item, index) =>
            revealItem(item, index * config.staggerDelay)
        );

        if (config.once) observer.unobserve(wrapper);
    }

    function revealSingle(item) {
        revealItem(item);
        if (config.once) observer.unobserve(item);
    }

    function getTargets() {
        const wrappers = Array.from(
            document.querySelectorAll('.animation-wrapper')
        );

        const standaloneItems = Array.from(
            document.querySelectorAll('[data-animation]')
        ).filter(item => !item.closest('.animation-wrapper'));

        return { wrappers, standaloneItems };
    }

    function prepareItems() {
        const { wrappers, standaloneItems } = getTargets();

        wrappers.forEach(wrapper =>
            wrapper.querySelectorAll('[data-animation]').forEach(hideItem)
        );

        standaloneItems.forEach(hideItem);
    }

    function buildObserver() {
        if (observer) observer.disconnect();

        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    if (!config.once) {
                        if (entry.target.classList.contains('animation-wrapper')) {
                            entry.target
                                .querySelectorAll('[data-animation]')
                                .forEach(hideItem);
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
        const { wrappers, standaloneItems } = getTargets();

        wrappers.forEach(wrapper => observer.observe(wrapper));
        standaloneItems.forEach(item => observer.observe(item));
    }

    function init(options = {}) {
        config = { ...DEFAULTS, ...options };

        const { wrappers, standaloneItems } = getTargets();

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
        const el = typeof target === 'string'
            ? document.querySelector(target)
            : target;

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
            item.style.transform = 'none';
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

    return { init, reveal, refresh, skipAll, reset, destroy };
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



document.addEventListener('DOMContentLoaded', () => {
    PhotoSlider.init()
    Tabs.init();
    Popup.init();
    AnchorSpy.init();
});



(function () {
    const STORAGE_KEY = 'cookieAccepted';
    const banner = document.querySelector('.cookie');

    if (!banner) return;

    if (localStorage.getItem(STORAGE_KEY) === 'true') {
        banner.style.display = 'none';
        return;
    }

    const button = banner.querySelector('.cookie__button');
    if (!button) return;

    button.addEventListener('click', function () {
        localStorage.setItem(STORAGE_KEY, 'true');
        banner.style.display = 'none';
    });
})();