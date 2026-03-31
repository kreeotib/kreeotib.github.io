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
    if (!window.__SR_MANUAL_INIT__) ScrollReveal.init({ initialDelay: 300});
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
        processingClass: 'is-processing',
        resetDelay: 2000,
        animationDuration: 300,
        tipText: 'Скопировано !'
    };

    let config = {...DEFAULTS};
    const originalButtonStates = new WeakMap();

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

    function transformButton(button) {
        if (!originalButtonStates.has(button)) {
            originalButtonStates.set(button, {
                innerHTML: button.innerHTML,
                className: button.className
            });
        }

        const svg = button.querySelector('.copy__icon');
        if (!svg) return;

        const svgClone = svg.cloneNode(true);
        svgClone.classList.remove('copy__icon');
        svgClone.classList.add('tip__icon');

        const tipText = document.createElement('span');
        tipText.className = 'tip__text active';
        tipText.textContent = config.tipText;

        const wrapper = document.createElement('span');
        wrapper.className = 'tip__wrapper';
        wrapper.appendChild(svgClone);
        wrapper.appendChild(tipText);

        button.innerHTML = '';
        button.appendChild(wrapper);
        button.classList.add('tip');
    }

    function restoreButton(button) {
        const original = originalButtonStates.get(button);
        if (!original) return;

        button.className = original.className;
        button.innerHTML = original.innerHTML;
    }

    function handleCopy(wrapper) {
        if (wrapper.classList.contains(config.processingClass)) {
            return;
        }

        const textEl = wrapper.querySelector(config.textSelector);
        if (!textEl) {
            console.warn('[CopyText] No text element found in wrapper:', wrapper);
            return;
        }

        const button = wrapper.querySelector(config.buttonSelector);
        if (!button) {
            console.warn('[CopyText] No button element found in wrapper:', wrapper);
            return;
        }

        const text = textEl.textContent.trim();

        wrapper.classList.add(config.processingClass);

        copyToClipboard(text)
            .then(() => {
                transformButton(button);

                requestAnimationFrame(() => {
                    wrapper.classList.add(config.activeClass);
                });

                setTimeout(() => {
                    wrapper.classList.remove(config.activeClass);

                    setTimeout(() => {
                        restoreButton(button);
                        wrapper.classList.remove(config.processingClass);
                    }, config.animationDuration);

                }, config.resetDelay);

                wrapper.dispatchEvent(new CustomEvent('copy:success', {bubbles: true, detail: {text}}));
            })
            .catch(err => {
                console.warn('[CopyText] Copy failed:', err);
                wrapper.classList.remove(config.processingClass);
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
    if (!window.__LB_MANUAL_INIT__) Lightbox.init();
});

const ParallaxEffect = (() => {
    const DEFAULTS = {
        containerSelector: '.parallax-container',
        imageSelector: '.parallax-img',
        speed: 0.3,
        scale: 1.3,
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

            container.style.overflow = 'hidden';
            if (!container.style.position || container.style.position === 'static') {
                container.style.position = 'relative';
            }

            img.style.position = 'absolute';
            img.style.top = '0';
            img.style.left = '0';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.willChange = 'transform';

            if (config.smooth) {
                img.style.transition = 'transform 0.1s ease-out';
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

const Marquee = (() => {
    const DEFAULTS = {
        selector: '.marquee',
        contentSelector: '.marquee-content',
        speed: 2,
        hoverSlowdown: 0.1,
        direction: 'left',
    };

    let config = {...DEFAULTS};
    let instances = [];

    function animate() {
        instances.forEach(item => {
            const currentSpeed = item.isHovered
                ? item.speed * config.hoverSlowdown
                : item.speed;

            item.position -= currentSpeed;

            if (Math.abs(item.position) >= item.contentWidth) {
                item.position = 0;
            }

            item.wrapper.style.transform = `translate3d(${item.position}px, 0, 0)`;
        });

        requestAnimationFrame(animate);
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};
        const elements = document.querySelectorAll(config.selector);

        if (!elements.length) {
            return;
        }

        elements.forEach(el => {
            const content = el.querySelector(config.contentSelector);
            if (!content) return;

            const clone = content.cloneNode(true);
            el.appendChild(clone);

            const instance = {
                wrapper: el,
                content: content,
                contentWidth: content.offsetWidth,
                speed: parseFloat(el.dataset.speed) || config.speed,
                position: 0,
                isHovered: false
            };

            el.addEventListener('mouseenter', () => instance.isHovered = true);
            el.addEventListener('mouseleave', () => instance.isHovered = false);

            instances.push(instance);
        });

        requestAnimationFrame(animate);
    }

    function refresh() {
        instances.forEach(item => {
            item.contentWidth = item.content.offsetWidth;
        });
    }

    window.addEventListener('resize', refresh);

    return {init, refresh};
})();

window.Marquee = Marquee;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__LB_MANUAL_INIT__) Marquee.init();
});

const BurgerMenu = (() => {
    const DEFAULTS = {
        burgerSelector: '.burger',
        navSelector: '.header-nav',
        bodyClass: 'no-scroll',
        activeClass: 'active'
    };

    let config = {...DEFAULTS};
    let burger = null;
    let nav = null;
    let isOpen = false;

    function toggle() {
        isOpen = !isOpen;

        document.body.classList.toggle(config.bodyClass);
        burger.classList.toggle(config.activeClass);
        nav.classList.toggle(config.activeClass);
    }

    function close() {
        if (!isOpen) return;

        isOpen = false;
        document.body.classList.remove(config.bodyClass);
        burger.classList.remove(config.activeClass);
        nav.classList.remove(config.activeClass);
    }

    function handleLinkClick(e) {
        if (e.target.tagName === 'A') {
            close();
        }
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};

        burger = document.querySelector(config.burgerSelector);
        nav = document.querySelector(config.navSelector);

        if (!burger || !nav) {
            return;
        }

        burger.addEventListener('click', toggle);
        nav.addEventListener('click', handleLinkClick);
    }

    return {init, close};
})();

window.BurgerMenu = BurgerMenu;

document.addEventListener('DOMContentLoaded', () => {
    if (!window.__LB_MANUAL_INIT__) BurgerMenu.init();
});

document.addEventListener('DOMContentLoaded', () => {
    const autoSliderElement = document.querySelectorAll('.auto-slider');
    if (autoSliderElement.length) {
        autoSliderElement.forEach(slider => {
            const swiperWidth = slider.offsetWidth;
            const slideWidth = slider.querySelector('.swiper-slide').offsetWidth;
            const autoSlider = new Swiper(slider, {
                slidesPerView: 'auto',
                spaceBetween: 8,
                speed: 500,
                slidesOffsetAfter: swiperWidth - slideWidth,
                breakpoints: {
                    1025: {
                        spaceBetween: 24,
                    }
                },
                navigation: {
                    prevEl: '.auto-slider-button-prev',
                    nextEl: '.auto-slider-button-next'
                },
            });
        })
    }


    const productSliderImagesElement = document.querySelector('.product-images-slider');
    const productSliderImagesNavElement = document.querySelector('.product-images-slider-nav');
    if (!productSliderImagesElement || !productSliderImagesNavElement) return;

    const productSliderImagesNav = new Swiper(productSliderImagesNavElement, {
        slidesPerView: 'auto',
        freeMode: true,
        spaceBetween: 4,
        watchSlidesProgress: true,
    });

    const productSliderImages = new Swiper(productSliderImagesElement, {
        slidesPerView: 1,
        effect: 'fade',
        fadeEffect: {crossFade: true},
        thumbs: {swiper: productSliderImagesNav},
    });
});


(function () {
    document.querySelectorAll('.js-phone-mask').forEach(function (el) {
        IMask(el, {
            mask: '(000) 000-00-00',
        });
    });
})();
