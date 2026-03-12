const ScrollReveal = (() => {
    const DEFAULTS = {
        staggerDelay: 200,
        duration: 1000,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        offsetY: '40px',
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
        once: true,
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
            item.style.opacity = '';
            item.style.transform = '';
            item.style.willChange = '';

            item.addEventListener('transitionend', () => {
                if (item.hasAttribute('data-animation')) {
                    item.removeAttribute('data-animation');
                    item.setAttribute('data-animation-final', '');
                    item.style.transition = '';
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
        buildObserver();
        observeTargets();
        initialized = true;
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
            item.style.opacity = '';
            item.style.transform = '';
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
    if (!window.__SR_MANUAL_INIT__) ScrollReveal.init();
});

const CatalogFilter = (() => {
    const DEFAULTS = {
        filterSelector: '.catalog-filter__list',
        inputSelector: '.catalog-label__input',
        itemSelector: '[data-category]',
        defaultValue: 'all',
        staggerDelay: 80,
        duration: 1000,
        easing: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
        offsetY: '40px',
    };

    let config = {...DEFAULTS};
    let animationTimers = [];

    function getItems() {
        return Array.from(document.querySelectorAll(config.itemSelector));
    }

    function getInputs() {
        return Array.from(document.querySelectorAll(config.inputSelector));
    }

    function clearTimers() {
        animationTimers.forEach(t => clearTimeout(t));
        animationTimers = [];
    }

    function hideItem(item) {
        item.style.transition = 'none';
        item.style.opacity = '0';
        item.style.transform = `translateY(${config.offsetY})`;
        item.style.willChange = 'opacity, transform';
    }

    function revealItem(item) {
        item.style.transition = `opacity ${config.duration}ms ${config.easing}, transform ${config.duration}ms ${config.easing}`;
        item.style.opacity = '';
        item.style.transform = '';
        item.style.willChange = '';

        item.addEventListener('transitionend', () => {
            item.style.transition = '';
            if (item.hasAttribute('data-animation')) {
                item.removeAttribute('data-animation');
                item.setAttribute('data-animation-final', '');
            }
        }, {once: true});
    }

    function filterItems(category) {
        clearTimers();

        const items = getItems();
        const visibleItems = [];

        items.forEach(item => {
            const isVisible = category === config.defaultValue || item.dataset.category === category;

            if (isVisible) {
                item.style.display = '';
                visibleItems.push(item);
            } else {
                item.style.display = 'none';
                item.style.transition = '';
                item.style.opacity = '';
                item.style.transform = '';
            }
        });

        visibleItems.forEach(item => hideItem(item));

        visibleItems.forEach((item, index) => {
            const timer = setTimeout(() => {
                revealItem(item);
            }, index * config.staggerDelay);

            animationTimers.push(timer);
        });
    }

    function setDefaultInput() {
        const inputs = getInputs();
        const anyChecked = inputs.some(input => input.checked);

        if (!anyChecked) {
            const defaultInput = inputs.find(input => input.value === config.defaultValue);
            if (defaultInput) defaultInput.checked = true;
        }
    }

    function bindEvents() {
        const filter = document.querySelector(config.filterSelector);
        if (!filter) {
            console.warn('[CatalogFilter] Filter list not found.');
            return;
        }

        filter.addEventListener('change', (e) => {
            const input = e.target.closest(config.inputSelector);
            if (!input) return;
            filterItems(input.value);
        });
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};

        if (!document.querySelector(config.filterSelector)) {
            console.warn('[CatalogFilter] No filter found on page.');
            return;
        }

        if (!getItems().length) {
            console.warn('[CatalogFilter] No [data-category] items found.');
            return;
        }

        setDefaultInput();
        bindEvents();
    }

    function setCategory(value) {
        const target = getInputs().find(input => input.value === value);
        if (!target) return;
        target.checked = true;
        filterItems(value);
    }

    return {init, setCategory};
})();

window.CatalogFilter = CatalogFilter;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__CF_MANUAL_INIT__) CatalogFilter.init();
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

const CopyText = (() => {
    const DEFAULTS = {
        wrapperSelector: '.copy',
        textSelector: '.copy__text',
        buttonSelector: '.copy__button',
        activeClass: 'is-copied',
        resetDelay: 2000,
    };

    let config = {...DEFAULTS};

    function copyToClipboard(text) {
        if (navigator.clipboard?.writeText) {
            return navigator.clipboard.writeText(text);
        }

        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    }

    function handleCopy(wrapper) {
        const textEl = wrapper.querySelector(config.textSelector);
        if (!textEl) {
            console.warn('[CopyText] No text element found in wrapper:', wrapper);
            return;
        }

        const text = textEl.textContent.trim();

        copyToClipboard(text)
            .then(() => {
                wrapper.classList.add(config.activeClass);
                setTimeout(() => wrapper.classList.remove(config.activeClass), config.resetDelay);
                wrapper.dispatchEvent(new CustomEvent('copy:success', {bubbles: true, detail: {text}}));
            })
            .catch(err => {
                console.warn('[CopyText] Copy failed:', err);
                wrapper.dispatchEvent(new CustomEvent('copy:error', {bubbles: true, detail: {err}}));
            });
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};

        const wrappers = document.querySelectorAll(config.wrapperSelector);

        if (!wrappers.length) {
            console.warn('[CopyText] No .copy elements found on page.');
            return;
        }

        document.addEventListener('click', (e) => {
            const button = e.target.closest(config.buttonSelector);
            if (!button) return;

            const wrapper = button.closest(config.wrapperSelector);
            if (!wrapper) return;

            handleCopy(wrapper);
        });
    }

    function copy(selector) {
        const wrapper = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;

        if (!wrapper) {
            console.warn('[CopyText] copy() — element not found:', selector);
            return;
        }

        handleCopy(wrapper);
    }

    return {init, copy};
})();

window.CopyText = CopyText;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__CT_MANUAL_INIT__) CopyText.init();
});

document.addEventListener('DOMContentLoaded', () => {
    Popup.init();
});
const Lightbox = (() => {
    const DEFAULTS = {
        itemSelector: '.gallery-item',
        gallerySelector: '.gallery',
        imageSelector: 'img',
        popupId: '#popup-lightbox',
        imgSelector: '.lightbox-popup__img',
        prevSelector: '.lightbox-popup-prev',
        nextSelector: '.lightbox-popup-next',
    };

    let config = {...DEFAULTS};
    let currentItem = null;
    let currentGalleryItems = [];

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
            if (item && item.hasAttribute('data-big')) {
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
    if (!window.__LB_MANUAL_INIT__) Lightbox.init();
});
document.addEventListener('DOMContentLoaded', () => {
    const stepsSliderElement = document.querySelector('.steps-slider');
    const stepsSlider = new Swiper(stepsSliderElement, {
        init: false,
        slidesPerView: 'auto',
        spaceBetween: 16,
        speed: 500,
        breakpoints: {
            1025: {
                spaceBetween: 24,
            }
        },
        navigation: {
            prevEl: '.steps-slider-button-prev',
            nextEl: '.steps-slider-button-next'
        },
    });

    if (stepsSliderElement) {
        stepsSlider.init();
    }


    const marquees = document.querySelectorAll('.marquee');

    if (marquees.length) {
        marquees.forEach(marquee => {
            const marqueeContent = marquee.querySelector('.marquee-content');

            const clone = marqueeContent.cloneNode(true);
            marquee.appendChild(clone);

            let position = 0;
            const baseSpeed = marquee.dataset.speed || 2;
            let scrollSpeed = 0;

            function animate() {
                let currentSpeed = baseSpeed + scrollSpeed;
                position -= currentSpeed;
                if (Math.abs(position) >= marqueeContent.offsetWidth) {
                    position = 0;
                }
                marquee.style.transform = `translate3d(${position}px, 0, 0)`;

                requestAnimationFrame(animate);
            }

            animate();
        });
    }


    const productSliderImagesElement = document.querySelector('.product-images-slider');
    const productSliderImagesNavElement = document.querySelector('.product-images-slider-nav');
    if (!productSliderImagesElement || !productSliderImagesNavElement) return;

    const productSliderImagesNav = new Swiper(productSliderImagesNavElement, {
        slidesPerView: 'auto',
        freeMode: true,
        spaceBetween:4,
        watchSlidesProgress: true,
    });

    const productSliderImages = new Swiper(productSliderImagesElement, {
        slidesPerView: 1,
        effect: 'fade',
        fadeEffect: { crossFade: true },
        thumbs: { swiper: productSliderImagesNav },
    });
});


(function () {
    document.querySelectorAll('.js-phone-mask').forEach(function (el) {
        IMask(el, {
            mask: '(000) 000-00-00',
        });
    });
})();