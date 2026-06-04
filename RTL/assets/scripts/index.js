const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
if (navigator.hardwareConcurrency <= 4) {
    document.documentElement.classList.add('no-blur');
}


class CounterAnimator {
    constructor(options = {}) {
        this.options = {threshold: 0.3, rootMargin: '0px', ...options};
        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), this.options);
    }

    formatNumber(value) {
        return value.toLocaleString('ru-RU').replace(/\u00A0/g, ' ');
    }

    getOrCreateItem(element) {
        let item = element.querySelector('.counter__item');
        if (!item) {
            item = document.createElement('span');
            item.className = 'counter__item';
            element.appendChild(item);
        }
        return item;
    }

    animateCounter(element, start, rawEnd, duration = 2500, delay = 0) {
        const match = rawEnd.toString().match(/([^0-9]*)([0-9]+)(.*)/);
        if (!match) return;

        const prefix = match[1] || '';
        const endValue = parseInt(match[2], 10);
        const suffix = match[3] || '';
        const item = this.getOrCreateItem(element);

        setTimeout(() => {
            const startTime = performance.now();
            const difference = endValue - start;

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const currentValue = Math.floor(start + difference * easeProgress);
                item.textContent = `${prefix}${this.formatNumber(currentValue)}${suffix}`;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    item.textContent = `${prefix}${this.formatNumber(endValue)}${suffix}`;
                }
            };
            requestAnimationFrame(update);
        }, delay);
    }

    handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.querySelectorAll('.counter[data-end]').forEach((counter, index) => {
                this.animateCounter(counter, 0, counter.getAttribute('data-end') || '0', 1500, index * 200);
            });
            observer.unobserve(entry.target);
        });
    }

    observeCounters(selector = '.counters-block') {
        document.querySelectorAll(selector).forEach(block => {
            block.querySelectorAll('.counter[data-end]').forEach(counter => {
                const rawValue = counter.getAttribute('data-end') || '0';
                const parts = rawValue.match(/([^0-9]*)([0-9]+)(.*)/);
                const item = this.getOrCreateItem(counter);
                item.textContent = parts ? `${parts[1]}0${parts[3]}` : '0';
            });
            this.observer.observe(block);
        });
    }
}


class HeroAccelerator {
    constructor(selector = '.hero') {
        this.hero = document.querySelector(selector);
        if (!this.hero) return;

        this.track = this.hero.closest('.hero-track') ?? this.hero.parentElement;
        this.content = this.hero.querySelector('.hero__content');
        this.bg = this.hero.querySelector('.hero__bg');

        if (this.hero.classList.contains('hero-project')) {
            this.initProject();
        } else {
            this.init();
        }
    }

    init() {
        const vh = window.innerHeight / 2.1;
        const trackHeight = this.track.offsetHeight;
        const scrollable = trackHeight - vh;

        gsap.timeline({
            scrollTrigger: {
                trigger: this.track,
                start: 'top top',
                end: `+=${scrollable * 1.3}`,
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    const progress = self.progress;
                    const localScroll = self.scroll() - self.start;

                    const textRise = this.norm(progress, 0, 1.0);
                    const textOpacity = 1 - this.norm(progress / 1.5, 0.80, 1.0);
                    const gradOpacity = this.norm(progress, 0.0, 0.30);
                    const gradFill = this.norm(progress, 0, 1);
                    const p = gradFill / 2.2;

                    // const heroOpacity = 1 - this.norm(progress, 0.7, 1.0);
                    // this.hero.style.opacity = heroOpacity;

                    this.hero.style.setProperty('--p', p.toFixed(4));
                    this.hero.style.setProperty('--grad-opacity', gradOpacity.toFixed(4));
                    this.hero.style.setProperty('--sy', localScroll.toFixed(0) + 'px');

                    if (this.content) {
                        const maxRise = vh * 3.5;
                        gsap.set(this.content, {
                            y: -((textRise / 2.2) * maxRise),
                            opacity: textOpacity
                        });
                    }
                }
            }
        });
        gsap.timeline({
            scrollTrigger: {
                trigger: this.hero,
                start: 'top top',
                end: `+=${scrollable * 1.3}`,
                scrub: true,
                pin: true,
                pinType: "transform",
                pinSpacing: false,
                invalidateOnRefresh: true,
            }
        });


    }

    initProject() {
        if (!this.bg) return;

        const Parallax = (() => {
            const DEFAULTS = {
                selector: '.hero__bg',
                speed: 0.5,
                lerp: 1,
                maxScale: 1.1,
                disableOnMobile: false,
                mobileBreakpoint: 768,
            };

            let elements = [];
            let options = null;
            let rafId = null;
            let io = null;
            let ro = null;
            let scrollUnsub = null;
            let resizeHandler = null;
            let reducedMotion = false;
            let initialized = false;

            function isMobile() {
                const bp = (options && options.mobileBreakpoint) || DEFAULTS.mobileBreakpoint;
                return window.innerWidth <= bp;
            }

            function getTarget(el) {
                const marked = el.querySelector('[data-parallax-target]');
                if (marked) return marked;
                const img = el.querySelector('img');
                if (img) return img;
                return el;
            }

            function resolveSpeedAndScale(ch, requestedSpeed, vh, maxScale) {
                if (!ch || !vh) return {speed: requestedSpeed, scale: 1};
                const maxDelta = Math.max(0, (maxScale - 1) * ch / (vh + ch));
                const delta = 1 - requestedSpeed;
                const clamped = Math.max(-maxDelta, Math.min(maxDelta, delta));
                const effectiveSpeed = 1 - clamped;
                const scale = 1 + Math.abs(clamped) * (vh + ch) / ch;
                return {speed: effectiveSpeed, scale};
            }

            function measure(entry) {
                const rect = entry.el.getBoundingClientRect();
                entry.top = rect.top + window.scrollY;
                entry.height = rect.height;
                entry.vh = window.innerHeight;
                if (entry.userScale != null) {
                    entry.scale = entry.userScale;
                    entry.speed = entry.requestedSpeed;
                } else {
                    const resolved = resolveSpeedAndScale(
                        entry.height,
                        entry.requestedSpeed,
                        entry.vh,
                        options.maxScale
                    );
                    entry.speed = resolved.speed;
                    entry.scale = resolved.scale;
                }
            }

            function measureAll() {
                for (const entry of elements) measure(entry);
            }

            function register(el) {
                const raw = el.dataset.parallaxSpeed;
                const parsed = raw != null ? parseFloat(raw) : NaN;
                const requestedSpeed = isNaN(parsed) ? options.speed : parsed;
                const axis = el.dataset.parallaxAxis === 'x' ? 'x' : 'y';
                const userScale = el.dataset.parallaxScale != null
                    ? parseFloat(el.dataset.parallaxScale)
                    : null;
                return {
                    el,
                    target: getTarget(el),
                    requestedSpeed,
                    speed: requestedSpeed,
                    axis,
                    userScale,
                    top: 0,
                    height: 0,
                    vh: 0,
                    scale: 1,
                    currentY: 0,
                    targetY: 0,
                    visible: false,
                };
            }

            function updateTarget(entry) {
                if (reducedMotion) {
                    entry.targetY = 0;
                    return;
                }
                const delta = window.scrollY - (entry.top + entry.height / 2 - entry.vh / 2);
                entry.targetY = delta * (1 - entry.speed);
            }

            function applyTransform(entry) {
                const v = entry.currentY.toFixed(2);
                const s = entry.scale;
                entry.target.style.transform = entry.axis === 'x'
                    ? `translate3d(${v}px, 0, 0) scale(${s})`
                    : `translate3d(0, ${v}px, 0) scale(${s})`;
            }

            function tick() {
                const lerp = options.lerp;
                for (const entry of elements) {
                    if (entry.visible) updateTarget(entry);
                }
                for (const entry of elements) {
                    if (!entry.visible) continue;
                    if (lerp >= 1) {
                        entry.currentY = entry.targetY;
                    } else {
                        entry.currentY += (entry.targetY - entry.currentY) * lerp;
                    }
                    applyTransform(entry);
                }
                rafId = requestAnimationFrame(tick);
            }

            function handleIntersect(ioEntries) {
                for (const ioEntry of ioEntries) {
                    const entry = elements.find((e) => e.el === ioEntry.target);
                    if (!entry) continue;
                    const wasVisible = entry.visible;
                    entry.visible = ioEntry.isIntersecting;
                    if (!wasVisible && entry.visible) {
                        measure(entry);
                        updateTarget(entry);
                        entry.currentY = entry.targetY;
                        applyTransform(entry);
                    }
                    entry.target.style.willChange = entry.visible ? 'transform' : '';
                }
            }

            function handleResize() {
                measureAll();
                for (const entry of elements) {
                    if (!entry.visible) continue;
                    updateTarget(entry);
                    entry.currentY = entry.targetY;
                    applyTransform(entry);
                }
            }

            function init(userOptions = {}) {
                if (initialized) return api;

                options = {...DEFAULTS, ...userOptions};

                if (options.disableOnMobile && isMobile()) {
                    initialized = true;
                    window.parallax = api;
                    return api;
                }

                reducedMotion = typeof window.matchMedia !== 'undefined'
                    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

                const nodes = document.querySelectorAll(options.selector);
                if (!nodes.length) {
                    console.warn('[Parallax] No elements matched selector:', options.selector);
                }

                elements = [];
                for (const node of nodes) {
                    const entry = register(node);
                    if (entry) elements.push(entry);
                }

                measureAll();

                for (const entry of elements) {
                    updateTarget(entry);
                    entry.currentY = entry.targetY;
                    applyTransform(entry);
                }

                if (typeof IntersectionObserver !== 'undefined') {
                    io = new IntersectionObserver(handleIntersect, {
                        rootMargin: '20% 0%',
                        threshold: 0,
                    });
                    for (const entry of elements) io.observe(entry.el);
                } else {
                    for (const entry of elements) entry.visible = true;
                }

                if (typeof ResizeObserver !== 'undefined') {
                    ro = new ResizeObserver(handleResize);
                    ro.observe(document.documentElement);
                    for (const entry of elements) ro.observe(entry.el);
                }

                resizeHandler = handleResize;
                window.addEventListener('resize', resizeHandler, {passive: true});

                const onScroll = () => {
                };
                if (window.lenis && typeof window.lenis.on === 'function') {
                    window.lenis.on('scroll', onScroll);
                    scrollUnsub = () => {
                        if (window.lenis && typeof window.lenis.off === 'function') {
                            window.lenis.off('scroll', onScroll);
                        }
                    };
                } else {
                    window.addEventListener('scroll', onScroll, {passive: true});
                    scrollUnsub = () => window.removeEventListener('scroll', onScroll);
                }

                rafId = requestAnimationFrame(tick);
                initialized = true;
                window.parallax = api;
                return api;
            }

            function destroy() {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;

                if (io) io.disconnect();
                io = null;

                if (ro) ro.disconnect();
                ro = null;

                if (scrollUnsub) scrollUnsub();
                scrollUnsub = null;

                if (resizeHandler) window.removeEventListener('resize', resizeHandler);
                resizeHandler = null;

                for (const entry of elements) {
                    entry.target.style.transform = '';
                    entry.target.style.willChange = '';
                }

                elements = [];
                options = null;
                reducedMotion = false;
                initialized = false;

                if (window.parallax === api) delete window.parallax;
            }

            function get() {
                return {elements, options, initialized};
            }

            const api = {init, destroy, get};
            return api;
        })();

        window.Parallax = Parallax;

        Parallax.init();
    }

    static norm(value, inMin, inMax) {
        return Math.max(0, Math.min((value - inMin) / (inMax - inMin), 1));
    }

    norm(value, inMin, inMax) {
        return HeroAccelerator.norm(value, inMin, inMax);
    }
}


const TitleReveal = (() => {
    const CFG = {sweepIn: 1440, sweepOut: 1040, stagger: 220, rootMargin: '0px 0px -30% 0px'};

    function eio(t) {
        return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateBar(bar, delay) {

        if (bar._raf) cancelAnimationFrame(bar._raf);

        return new Promise(resolve => {
            let t0 = null;
            let phase = 'in';
            let t1 = null;

            function tick(ts) {
                if (!t0) t0 = ts;

                if (phase === 'in') {
                    const elapsed = ts - t0 - delay;
                    if (elapsed < 0) {
                        bar._raf = requestAnimationFrame(tick);
                        return;
                    }

                    const p = Math.min(elapsed / CFG.sweepIn, 1);
                    bar.style.transformOrigin = 'left center';
                    bar.style.transform = `scaleX(${eio(p)})`;

                    if (p < 1) {
                        bar._raf = requestAnimationFrame(tick);
                        return;
                    }
                    phase = 'out';
                    t1 = ts;
                }

                if (phase === 'out') {
                    const p2 = Math.min((ts - t1) / CFG.sweepOut, 1);
                    bar.style.transformOrigin = 'right center';
                    bar.style.transform = `scaleX(${1 - eio(p2)})`;

                    if (p2 < 1) {
                        bar._raf = requestAnimationFrame(tick);
                        return;
                    }
                    bar._raf = null;
                    resolve();
                }
            }

            bar._raf = requestAnimationFrame(tick);
        });
    }


    function build(el) {
        if (el.dataset.rvBuilt) return;
        el.dataset.rvBuilt = 'true';

        const text = el.textContent.trim();
        el.setAttribute('aria-label', text);

        const computed = window.getComputedStyle(el);

        const paddingLeft = parseFloat(computed.paddingLeft);
        const paddingRight = parseFloat(computed.paddingRight);
        const availableWidth = el.clientWidth - paddingLeft - paddingRight;

        el.innerHTML = '';

        const probe = document.createElement('span');
        probe.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            left: -9999px;
            font-family: ${computed.fontFamily};
            font-size: ${computed.fontSize};
            font-weight: ${computed.fontWeight};
            font-style: ${computed.fontStyle};
            letter-spacing: ${computed.letterSpacing};
            word-spacing: ${computed.wordSpacing};
            text-transform: ${computed.textTransform};
        `;

        document.body.appendChild(probe);

        const words = text.split(/\s+/);
        const lines = [];
        let cur = '';

        for (const word of words) {
            const test = cur ? cur + ' ' + word : word;
            probe.textContent = test;

            const testWidth = probe.getBoundingClientRect().width;

            if (cur && testWidth > availableWidth) {
                lines.push(cur);
                cur = word;
            } else {
                cur = test;
            }
        }
        if (cur) lines.push(cur);

        document.body.removeChild(probe);

        lines.forEach(lineText => {
            const wrap = document.createElement('span');
            wrap.className = 'rv-line-wrap';
            wrap.setAttribute('aria-hidden', 'true');

            const line = document.createElement('span');
            line.className = 'rv-line';
            line.textContent = lineText;

            const bar = document.createElement('span');
            bar.className = 'rv-bar';
            bar.style.transform = 'scaleX(0)';

            wrap.appendChild(line);
            wrap.appendChild(bar);
            el.appendChild(wrap);
        });
    }

    function play(el) {
        build(el);
        const bars = el.querySelectorAll('.rv-bar');
        bars.forEach(b => {
            if (b._rafs) b._rafs.forEach(cancelAnimationFrame);
            b.style.transform = 'scaleX(0)';
            b.style.transformOrigin = 'left center';
        });
        bars.forEach((bar, i) => animateBar(bar, i * CFG.stagger));
    }

    function reset(el) {
        el.querySelectorAll('.rv-bar').forEach(b => {
            if (b._raf) {
                cancelAnimationFrame(b._raf);
                b._raf = null;
            }
            b.style.transform = 'scaleX(0)';
            b.style.transformOrigin = 'left center';
        });
    }

    function init() {
        const els = document.querySelectorAll('[data-reveal]');
        els.forEach(build);

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    play(entry.target);
                } else {
                    reset(entry.target);
                }
            });
        }, {rootMargin: CFG.rootMargin});

        els.forEach(el => io.observe(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {init, play, reset, build};
})();


function initSliders() {
    try {
        const geoSliderElement = document.querySelector('.geo-slider');
        if (geoSliderElement) {
            const geoSlider = new Swiper(geoSliderElement, {
                init: false,
                slidesPerView: 1,
                spaceBetween: 0,
                speed: 500,
                effect: 'fade',
                horizontalClass: 'slider',
                fadeEffect: {crossFade: true, disableOnInteraction: false},
                pagination: {
                    el: '.geo-slider__pagination',
                    type: 'bullets',
                    horizontalClass: 'slider__pagination',
                    bulletClass: 'geo-slider__bullet',
                    bulletActiveClass: 'geo-slider__bullet--active',
                },
                autoplay: {delay: 8000, disableOnInteraction: false},
                on: {
                    init() {
                        const total = geoSlider.params.autoplay.delay + geoSlider.params.speed;
                        geoSliderElement.style.setProperty('--swiper-autoplay-delay', total + 'ms');
                        geoSlider.autoplay.stop();
                    },
                    slideChangeTransitionStart() {
                        const revealEl = geoSlider.slides[geoSlider.activeIndex].querySelector('[data-reveal]');
                        if (revealEl) {
                            TitleReveal.reset(revealEl);
                            TitleReveal.play(revealEl);
                        }
                    }
                }
            });

            geoSlider.init();

            new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    geoSliderElement.classList.add('involved');
                    geoSlider.autoplay.start();
                    geoSliderElement.style.setProperty('--swiper-autoplay-delay', (geoSlider.params.autoplay.delay + geoSlider.params.speed) + 'ms');
                });
            }, {threshold: 0.3, rootMargin: '0px 0px -35% 0px'}).observe(geoSliderElement);
        }
    } catch (e) {
        console.error('geoSlider error:', e);
    }

    try {
        const principlesSliderElement = document.querySelector('.principles');
        if (principlesSliderElement) {
            new Swiper(principlesSliderElement, {
                slidesPerView: 'auto',
                spaceBetween: 24,
                speed: 500,
                loop: true,

                breakpoints: {768: {spaceBetween: 0}},
                pagination: {
                    el: '.principles-pagination',
                    type: 'bullets',
                    horizontalClass: 'slider__pagination',
                    bulletClass: 'slider-pagination__bullet',
                    bulletActiveClass: 'slider-pagination__bullet--active',
                },
            });
        }
    } catch (e) {
        console.error('principlesSlider error:', e);
    }

    try {
        const levelsSliderElement = document.querySelector('.levels');
        if (levelsSliderElement && window.innerWidth < 768) {
            new Swiper(levelsSliderElement, {
                slidesPerView: 'auto',
                spaceBetween: 24,
                speed: 500,
                breakpoints: {768: {spaceBetween: 0}},
                pagination: {
                    el: '.levels-pagination',
                    type: 'bullets',
                    horizontalClass: 'slider__pagination',
                    bulletClass: 'slider-pagination__bullet',
                    bulletActiveClass: 'slider-pagination__bullet--active',
                },
            });
        }
    } catch (e) {
        console.error('levelsSlider error:', e);
    }

    try {
        const projectSliderElement = document.querySelector('.project-slider');
        if(projectSliderElement){
            const projectSliderArray = projectSliderElement.querySelectorAll('.project-slider__item');
            const scale = window.innerWidth / (window.innerWidth > 768 ? 1920 : 420);
            const cardWidth = (window.innerWidth > 768 ? 400 : 325) * scale;
            const isLoop = projectSliderArray.length >= 16;
            const swiper = new Swiper(projectSliderElement, {
                slidesPerView: "auto",

                loop: isLoop,
                virtual: {
                    enabled: true,
                    slidesPerViewAutoSlideSize: cardWidth,
                },
                spaceBetween: 24,


                speed: 500,
                navigation: {
                    prevEl: '.project-slider-button-prev',
                    nextEl: '.project-slider-button-next'
                },
            });
            initCards(projectSliderElement);
        }
    } catch (e) {
        console.error('projectSlider error:', e);
    }
}


function initCards(container = document) {
    const FADE_DURATION = 400;
    const REVERSE_STEP = 0.05;

    const getCard = (el) => el.closest('.project-item, .card');

    const getCardParts = (card) => ({
        video: card.querySelector('video'),
        wrapper: card.querySelector('.card__video, .project-item__img'),
    });

    const isLevelCard = (card) => card.classList.contains('card--level');


    const levelCardState = new WeakMap();

    const startLevelVideo = async (card, video, wrapper) => {
        const state = levelCardState.get(card) ?? {};

        if (state.fadeTimeout) clearTimeout(state.fadeTimeout);
        wrapper.classList.remove('fade-to-poster');
        wrapper.classList.add('hover');
        video.currentTime = 0;

        try {
            state.playPromise = video.play();
            await state.playPromise;
        } catch (_) {
        }

        levelCardState.set(card, state);
    };

    const stopLevelVideo = async (card, video, wrapper) => {
        const state = levelCardState.get(card) ?? {};

        if (state.playPromise) {
            try {
                await state.playPromise;
            } catch (_) {
            }
        }

        video.pause();
        wrapper.classList.add('fade-to-poster');

        state.fadeTimeout = setTimeout(() => {
            wrapper.classList.remove('hover', 'fade-to-poster');
        }, FADE_DURATION);

        levelCardState.set(card, state);
    };



    const loopCardState = new WeakMap();

    const playReverse = (card, video, wrapper) => {
        const state = loopCardState.get(card) ?? {};

        if (video.currentTime <= 0) {
            cancelAnimationFrame(state.animationFrame);
            wrapper.classList.remove('hover');
            loopCardState.set(card, {...state, animationFrame: null});
            return;
        }

        video.currentTime = Math.max(0, video.currentTime - REVERSE_STEP);
        state.animationFrame = requestAnimationFrame(() => playReverse(card, video, wrapper));
        loopCardState.set(card, state);
    };

    const startLoopVideo = async (card, video, wrapper) => {
        const state = loopCardState.get(card) ?? {};

        if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
        wrapper.classList.add('hover');

        try {
            state.playPromise = video.play();
            await state.playPromise;
        } catch (_) {
        }

        loopCardState.set(card, state);
    };

    const stopLoopVideo = async (card, video, wrapper) => {
        const state = loopCardState.get(card) ?? {};

        if (state.playPromise) {
            try {
                await state.playPromise;
            } catch (_) {
            }
        }

        video.pause();
        playReverse(card, video, wrapper);
    };

    const onEnter = (e) => {
        const card = getCard(e.target);
        if (!card) return;
        if (card.contains(e.relatedTarget)) return;

        const {video, wrapper} = getCardParts(card);
        if (!video || !wrapper) return;

        isLevelCard(card)
            ? startLevelVideo(card, video, wrapper)
            : startLoopVideo(card, video, wrapper);
    };

    const onLeave = (e) => {
        const card = getCard(e.target);
        if (!card) return;
        if (card.contains(e.relatedTarget)) return;

        const {video, wrapper} = getCardParts(card);
        if (!video || !wrapper) return;

        isLevelCard(card)
            ? stopLevelVideo(card, video, wrapper)
            : stopLoopVideo(card, video, wrapper);
    };

    const onTouch = (e) => {
        const card = getCard(e.target);
        if (!card) return;
        const {video, wrapper} = getCardParts(card);
        if (!video || !wrapper) return;

        if (isLevelCard(card)) {
            wrapper.classList.contains('hover')
                ? stopLevelVideo(card, video, wrapper)
                : startLevelVideo(card, video, wrapper);
        } else {
            video.paused
                ? startLoopVideo(card, video, wrapper)
                : stopLoopVideo(card, video, wrapper);
        }
    };

    container.querySelectorAll('.project-item:not(.card--level), .card:not(.card--level)').forEach((card) => {
        const video = card.querySelector('video');
        if (video) {
            video.muted = true;
            video.loop = true;
        }
    });

    container.querySelectorAll('.project-item.card--level, .card.card--level').forEach((card) => {
        const video = card.querySelector('video');
        if (video) {
            video.muted = true;
            video.loop = false;
        }
    });

    container.addEventListener('mouseover', onEnter);
    container.addEventListener('mouseout', onLeave);
    container.addEventListener('touchstart', onTouch, {passive: true});
}


const initCardAnimations = () => {
    const cards = document.querySelectorAll('.card-animate');

    if (!cards.length) return;

    const options = {
        root: null,
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const wrapper = card.querySelector('.card__wrapper');

                if (wrapper) {
                    const children = wrapper.children;
                    const delayStep = 0.15;


                    Array.from(children).forEach((child, index) => {
                        child.style.transitionDelay = `${index * delayStep}s`;
                    });


                    card.classList.add('is-visible');
                }

                observer.unobserve(card);
            }
        });
    }, options);

    cards.forEach(card => observer.observe(card));
};


function initMarquees() {
    try {
        document.querySelectorAll('.marquee').forEach(marquee => {
            const marqueeContent = marquee.querySelector('.marquee-content');
            if (!marqueeContent) return;

            const isHero = marquee.classList.contains('marquee--hero');
            const isDynamic = marquee.classList.contains('marquee--dynamic');

            // Clone for infinite loop
            const clone = marqueeContent.cloneNode(true);
            marquee.appendChild(clone);

            // Cache width ONCE outside the loop — never read offsetWidth inside RAF
            let contentWidth = marqueeContent.offsetWidth;

            // Recalculate on resize (debounced)
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    contentWidth = marqueeContent.offsetWidth;
                }, 200);
            }, { passive: true });

            let position = 0;
            let scrollBoost = 0;
            let lastScrollTop = 0;
            let ticking = false;

            let isDragging = false;
            let lastMouseX = 0;
            const targetAutoSpeed = 1;

            // RAF control
            let animationId = null;
            let isVisible = false;

            // Pause when off-screen
            const observer = new IntersectionObserver(entries => {
                isVisible = entries[0].isIntersecting;
                if (isVisible && !animationId) {
                    animationId = requestAnimationFrame(animate);
                } else if (!isVisible && animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }, { threshold: 0 });
            observer.observe(marquee);

            if (isDynamic) {
                marquee.style.cursor = 'grab';
                marquee.style.userSelect = 'none';
                marquee.style.touchAction = 'none';

                const startDrag = (clientX) => {
                    isDragging = true;
                    marquee.style.cursor = 'grabbing';
                    lastMouseX = clientX;
                };

                const moveDrag = (clientX) => {
                    if (!isDragging) return;
                    const deltaX = clientX - lastMouseX;
                    position += deltaX;
                    lastMouseX = clientX;
                };

                const endDrag = () => {
                    if (!isDragging) return;
                    isDragging = false;
                    marquee.style.cursor = 'grab';
                };

                marquee.addEventListener('mousedown', (e) => startDrag(e.clientX));
                window.addEventListener('mousemove', (e) => moveDrag(e.clientX));
                window.addEventListener('mouseup', endDrag);
                window.addEventListener('mouseleave', endDrag);

                marquee.addEventListener('touchstart', (e) => {
                    if (e.touches.length !== 1) return;
                    startDrag(e.touches[0].clientX);
                }, { passive: true });

                window.addEventListener('touchmove', (e) => {
                    if (!isDragging || e.touches.length !== 1) return;
                    moveDrag(e.touches[0].clientX);
                }, { passive: true });

                window.addEventListener('touchend', endDrag);
                window.addEventListener('touchcancel', endDrag);
            }

            if (isHero) {
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(() => {
                            const st = window.pageYOffset || document.documentElement.scrollTop;
                            const delta = st - lastScrollTop;
                            scrollBoost += delta > 0 ? delta * 0.15 : -Math.abs(delta) * 1.5;
                            lastScrollTop = st;
                            ticking = false;
                        });
                        ticking = true;
                    }
                }, { passive: true });
            }

            function animate() {
                if (!isDragging) {
                    position -= isDynamic ? targetAutoSpeed : (1 + scrollBoost);
                }

                // Wrap position using cached contentWidth
                if (position <= -contentWidth) {
                    position += contentWidth;
                } else if (position > 0) {
                    position -= contentWidth;
                }

                // Apply transform to marquee (matches your existing CSS)
                marquee.style.transform = `translate3d(${position}px, 0, 0)`;

                if (isHero) {
                    scrollBoost *= 0.9;
                    if (scrollBoost < 0.001) scrollBoost = 0;
                }

                animationId = requestAnimationFrame(animate);
            }
        });
    } catch (e) {
        console.error('initMarquees error:', e);
    }
}


function initHeader() {
    try {
        const header = document.querySelector('.header');
        if (!header) return;
        const update = () => header.classList.toggle('sticky', pageYOffset > header.getBoundingClientRect().height);
        update();
        window.addEventListener('scroll', update);
    } catch (e) {
        console.error('initHeader error:', e);
    }
}


function initExpandable() {
    try {
        if (window.innerWidth >= 767) return;
        document.querySelectorAll('.toggle').forEach(btn => {
            const container = btn.closest('.section--logistic, [data-expandable-block]');
            if (!container) return;
            const content = container.querySelector('.section__text');
            const img = container.querySelector('.section__img');
            btn.textContent = btn.getAttribute('data-label-open');

            btn.addEventListener('click', () => {
                const isOpen = container.classList.contains('is-opened');
                if (!isOpen) {
                    const startHeight = content.offsetHeight;
                    container.classList.add('is-opened');
                    if (img) img.style.display = 'block';
                    const fullHeight = content.scrollHeight;
                    content.style.height = startHeight + 'px';
                    content.offsetHeight;
                    content.style.height = fullHeight + 'px';
                    btn.textContent = btn.getAttribute('data-label-close');
                } else {
                    content.style.height = content.scrollHeight + 'px';
                    content.offsetHeight;
                    container.classList.remove('is-opened');
                    content.style.height = '';
                    if (img) img.style.display = 'none';
                    btn.textContent = btn.getAttribute('data-label-open');
                    container.scrollIntoView({behavior: 'smooth', block: 'start'});
                }
            });

            content.addEventListener('transitionend', () => {
                if (container.classList.contains('is-opened')) content.style.height = 'auto';
            });
        });
    } catch (e) {
        console.error('initExpandable error:', e);
    }
}


function initVideoToggles() {
    try {
        document.querySelectorAll('.video').forEach(wrapper => {
            const video = wrapper.querySelector('video');

            // Play/Pause
            wrapper.addEventListener('click', (e) => {
                if (e.target.closest('.video__mute')) return;
                if (video.paused) {
                    video.play();
                    wrapper.classList.add('video--play');
                } else {
                    video.pause();
                    wrapper.classList.remove('video--play');
                }
            });
            video.addEventListener('ended', () => wrapper.classList.remove('video--play'));

            // Mute/Unmute
            const muteBtn = document.createElement('div');
            muteBtn.className = 'video__mute';
            muteBtn.innerHTML = `
                <img class="mute" src="/local/templates/rtl/assets/images/icons/mute.svg" alt="">
                <img class="unmute" src="/local/templates/rtl/assets/images/icons/unmute.svg" alt="">
            `;
            wrapper.appendChild(muteBtn);

            video.muted = true;
            wrapper.classList.add('video--muted');

            muteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                video.muted = !video.muted;
                wrapper.classList.toggle('video--muted', video.muted);
            });
        });
    } catch (e) {
        console.error('initVideoToggles error:', e);
    }
}

function initRunoverEffects() {
    const runners = document.querySelectorAll('[data-runover]');
    if (!runners.length) return;

    const SCALE_REDUCTION = 0.1;
    const BORDER_RADIUS = 40;

    runners.forEach((footer) => {
        try {
            const targetSelector = footer.getAttribute('data-runover');
            const content = document.querySelector(targetSelector);
            if (!content) return;

            const shouldScale = footer.getAttribute('data-runoverscale') !== 'false';
            const maxOffset = parseInt(footer.getAttribute('data-runoveroffset')) || 150;

            const sentinel = document.createElement('div');
            sentinel.style.cssText = 'height:1px; margin-bottom:-1px; pointer-events:none;';
            footer.parentNode.insertBefore(sentinel, footer);

            const footerH = footer.offsetHeight;
            const maxY = -Math.min(footerH * 0.2, maxOffset);

            gsap.set(footer, {
                willChange: 'transform'
            });

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sentinel,
                    start: 'top bottom',
                    end: 'top top',
                    scrub: 1,
                    invalidateOnRefresh: true
                }
            });

            tl.fromTo(
                footer,
                {y: maxY},
                {y: 0, ease: 'none'},
                0
            );

            if (shouldScale) {
                tl.fromTo(
                    content,
                    {
                        scale: 1,
                        borderRadius: '0px'
                    },
                    {
                        scale: 1 - SCALE_REDUCTION,
                        '--border-radius': `${BORDER_RADIUS * 2}px`,
                        borderRadius: `0 0 ${BORDER_RADIUS}px ${BORDER_RADIUS}px`,
                        transformOrigin: 'center top',
                        ease: 'none'
                    },
                    0
                );
            }

        } catch (e) {
            console.error('initRunoverEffects error:', e);
        }
    });
}

function initPrinciplesCards() {
    try {
        document.querySelectorAll('.card--principles').forEach(card => {
            const img = card.querySelector('.card__image');
            card.addEventListener('mouseenter', () => card.style.setProperty('--glow-opacity', '.75'));
            card.addEventListener('mouseleave', () => {
                card.style.setProperty('--glow-opacity', '0');
                if (img) img.style.setProperty('--local-x', '-999px');
            });
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--x', `${e.clientX - rect.left}px`);
                card.style.setProperty('--y', `${e.clientY - rect.top}px`);
                if (img) {
                    const imgRect = img.getBoundingClientRect();
                    img.style.setProperty('--local-x', `${e.clientX - imgRect.left}px`);
                    img.style.setProperty('--local-y', `${e.clientY - imgRect.top}px`);
                }
            });
        });
    } catch (e) {
        console.error('initPrinciplesCards error:', e);
    }
}


function initPersonSlider() {
    try {
        const personSliderNavElement = document.querySelector('.person-navigation');
        const personSliderElement = document.querySelector('.person-slider');
        if (!personSliderNavElement || !personSliderElement) return;

        const personSliderNav = new Swiper(personSliderNavElement, {
            slidesPerView: 'auto',
            freeMode: true,
            watchSlidesProgress: true,
        });

        const personSlider = new Swiper(personSliderElement, {
            slidesPerView: 1,
            effect: 'fade',
            fadeEffect: {crossFade: true},
            allowTouchMove: false,
            thumbs: {swiper: personSliderNav},
            on: {
                slideChangeTransitionStart: onSlideChange
            },
        });

        const slides = Array.from(personSliderElement.querySelectorAll('.person-item'));
        const videos = slides.map(s => s.querySelector('video'));
        const soundBtn = personSliderElement.querySelector('.person-slider__sound');

        let soundOn = true; // изначально звук включён
        let involved = false;
        let isInitialized = false;

        function setSound(val) {
            soundOn = val;
            const currentVideo = videos[personSlider.realIndex];
            if (currentVideo) currentVideo.muted = !soundOn;

            personSliderElement.classList.toggle('unmuted', soundOn);
            const cursor = personSliderElement.querySelector('.person-slider__cursor');
            if (cursor) cursor.classList.toggle('unmuted', soundOn);
        }

        function resetState() {
            involved = false;
            isInitialized = false;
            soundOn = true; // сброс звука в дефолт
            personSliderElement.classList.remove('involved', 'unmuted');

            const cursor = personSliderElement.querySelector('.person-slider__cursor');
            if (cursor) cursor.classList.remove('unmuted');

            videos.forEach(v => {
                v.pause();
                v.currentTime = 0;
                v.muted = true;


            });
        }

        function loadVideo(video) {
            if (!video.src && video.dataset.src) {
                video.src = video.dataset.src;
                video.load();
            }
        }

        function activateCurrentVideo() {
            const index = personSlider.realIndex;
            videos.forEach((v, i) => {
                if (i === index) {
                    loadVideo(v);
                    v.muted = !soundOn;
                    v.currentTime = 0;
                    v.play().catch(() => {});
                } else {
                    v.pause();
                    v.currentTime = 0;
                    v.muted = true;
                }
            });

            loadVideo(videos[(index + 1) % videos.length]);
        }

        function onSlideChange() {
            resetState();
        }

        new IntersectionObserver((entries) => {
            if (!isInitialized) return;
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentVideo = videos[personSlider.realIndex];
                    if (currentVideo) currentVideo.play().catch(() => {});
                }
            });
        }, {threshold: 0.3}).observe(personSliderElement);

        personSliderElement.addEventListener('click', (e) => {
            if (soundBtn && soundBtn.contains(e.target)) return;

            if (!involved) {
                involved = true;
                isInitialized = true;
                personSliderElement.classList.add('involved');
                setSound(true); // включаем звук и вешаем классы
                activateCurrentVideo();
                return;
            }

            // toggle звука по клику на слайд
            setSound(!soundOn);
        });

        if (soundBtn) {
            soundBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                if (!involved) {
                    involved = true;
                    isInitialized = true;
                    personSliderElement.classList.add('involved');
                    setSound(true);
                    activateCurrentVideo();
                    return;
                }

                setSound(!soundOn);
            });
        }

        videos.forEach((video, i) => {
            video.removeAttribute('loop');
            video.addEventListener('ended', () => {
                if (!isInitialized) return;

                const nextIndex = (i + 1) % videos.length;
                loadVideo(videos[nextIndex]);
                personSlider.slideTo(nextIndex);
            });
        });

        const cursorDot = personSliderElement.querySelector('.person-slider__cursor');
        let targetX = personSliderElement.offsetWidth * 0.75;
        let targetY = personSliderElement.offsetHeight / 2;
        let currentX = targetX;
        let currentY = targetY;

        (function animateCursor() {
            currentX += (targetX - currentX) * 0.08;
            currentY += (targetY - currentY) * 0.08;
            if (cursorDot) {
                cursorDot.style.left = currentX + 'px';
                cursorDot.style.top = currentY + 'px';
            }
            requestAnimationFrame(animateCursor);
        })();

        personSliderElement.addEventListener('mousemove', (e) => {
            const rect = personSliderElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x >= rect.width / 2) {
                targetX = x;
                targetY = e.clientY - rect.top;
            }
        });

        personSliderElement.addEventListener('mouseleave', () => {
            targetX = personSliderElement.offsetWidth * 0.75;
            targetY = personSliderElement.offsetHeight / 2;
        });

    } catch (e) {
        console.error('initPersonSlider error:', e);
    }
}

function initHeroBgVideo() {
    try {
        const video = document.querySelector('.hero__bg video');
        if (!video) return;

        tryPlay(video);

        function tryPlay(video) {
            if (!video.muted) video.muted = true;

            const promise = video.play();

            if (promise !== undefined) {
                promise.catch(err => {
                    if (err.name === 'NotAllowedError') {
                        const resume = () => {
                            video.play().catch(() => {});
                            document.removeEventListener('touchstart', resume);
                            document.removeEventListener('click', resume);
                        };
                        document.addEventListener('touchstart', resume, { once: true, passive: true });
                        document.addEventListener('click', resume, { once: true });
                    }
                });
            }
        }

    } catch (e) {
        console.error('initHeroBgVideo error:', e);
    }
}

const initPreloader = () => {
    try {
        const preloader = document.querySelector('.preloader');
        const page404bg = document.querySelectorAll('.page-404__bg');
        const last = document.querySelector('.svg-elem-5');

        let loaded = false;
        let forceTimeout;

        const finishLoading = () => {
            if (loaded) return;
            loaded = true;

            if (page404bg.length) {
                page404bg.forEach(bg => {
                    const video = bg.querySelector('video');
                    if (video) {
                        video.addEventListener('loadedmetadata', () => {
                            video.currentTime = 0;
                        });
                        video.play().catch(() => {
                        });
                    }
                });
            }

            if (preloader) preloader.classList.add('hidden');
            document.body.classList.remove('no-scroll');

            new CounterAnimator({
                threshold: 0.3,
                rootMargin: '0px 0px 0px 0px'
            }).observeCounters('.counters-block');

            initMarquees();
            clearTimeout(forceTimeout);
        };
        if (preloader) {

            forceTimeout = setTimeout(finishLoading, 1500);
            document.body.classList.add('no-scroll');
            window.addEventListener('load', () => {
                if (!last) return finishLoading();

                last.addEventListener('animationiteration', finishLoading);
            });

        } else {
            finishLoading();
        }

    } catch (e) {
        console.error('initPreloader error:', e);
    }
};

class FrameSequence {
    constructor(selector, opts = {}) {
        this.container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;
        if (!this.container) return;

        const d = this.container.dataset;

        this.path = opts.path || d.framesPath || '/img/sequence';
        this.frameCount = opts.frameCount || parseInt(d.framesCount, 10) || 25;
        this.prefix = opts.prefix || d.framesPrefix || '1_';
        this.ext = opts.ext || d.framesExt || '.webp';
        this.padLength = opts.padLength || parseInt(d.framesPad, 10) || 5;
        this.pinSpacing = opts.pinSpacing || d.framesPinSpacing || '300vh';
        this.cover = opts.cover ?? true;

        this.canvas = this.container.querySelector('canvas') || this._createCanvas();
        this.ctx = this.canvas.getContext('2d');

        this.images = new Array(this.frameCount);
        this.loaded = new Uint8Array(this.frameCount);
        this.currentIndex = -1;

        this._resize();
        this._preload().then(() => this._initScrollTrigger());
        this._bindResize();
    }

    _frameSrc(i) {
        return `${this.path}/${this.prefix}${String(i).padStart(this.padLength, '0')}${this.ext}`;
    }

    _loadImage(i) {
        return new Promise(resolve => {
            if (this.loaded[i]) {
                resolve(this.images[i]);
                return;
            }
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => {
                this.images[i] = img;
                this.loaded[i] = 1;
                resolve(img);
            };
            img.onerror = () => resolve(null);
            img.src = this._frameSrc(i);
        });
    }

    async _preload() {
        await this._loadImage(0);
        this._draw(0);
        await Promise.all(
            Array.from({length: this.frameCount - 1}, (_, i) => this._loadImage(i + 1))
        );
    }

    _draw(index) {
        if (index === this.currentIndex) return;
        const img = this.images[index];
        if (!img) return;
        this.currentIndex = index;

        const cw = this.canvas.width;
        const ch = this.canvas.height;
        const iw = img.naturalWidth;
        const ih = img.naturalHeight;

        const scale = this.cover
            ? Math.max(cw / iw, ch / ih)
            : Math.min(cw / iw, ch / ih);

        const dw = iw * scale;
        const dh = ih * scale;

        this.ctx.clearRect(0, 0, cw, ch);
        this.ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    _initScrollTrigger() {
        const self = this;

        this.st = ScrollTrigger.create({
            trigger: self.container,
            start: 'top center',
            end: '+=' + self.pinSpacing,
            pin: false,
            pinType: 'transform',
            anticipatePin: 1,
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate(st) {
                const frame = Math.min(
                    self.frameCount - 1,
                    Math.round(st.progress * (self.frameCount - 1))
                );
                self._draw(frame);
            }
        });
    }

    _resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        const prev = Math.max(0, this.currentIndex);
        this.currentIndex = -1;
        if (this.loaded[prev]) this._draw(prev);
    }

    _bindResize() {
        let t;
        window.addEventListener('resize', () => {
            clearTimeout(t);
            t = setTimeout(() => {
                this._resize();
                ScrollTrigger.refresh();
            }, 150);
        });
    }

    _createCanvas() {
        const c = document.createElement('canvas');
        c.className = 'frame-sequence__canvas';
        this.container.appendChild(c);
        return c;
    }

    destroy() {
        if (this.st) {
            this.st.kill();
            this.st = null;
        }
        this.images = [];
        this.loaded = new Uint8Array(0);
    }
}

function initFrameSequences() {
    document.querySelectorAll('.frame-sequence').forEach(el => {
        if (el._frameSeq) return;
        el._frameSeq = new FrameSequence(el);
    });
}

function refreshPageScripts() {

    initSliders();
    initCards();

    initHeader();
    initCardAnimations();
    initVideoToggles();
    initFrameSequences();
    initRunoverEffects();
    initPrinciplesCards();
    initPersonSlider();
    initExpandable();
    initHeroBgVideo();

    new HeroAccelerator('.hero');

    TitleReveal.init();

    new CounterAnimator({threshold: 0.3, rootMargin: '0px'}).observeCounters('.counters-block');
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.lenis = new Lenis({autoRaf: true, lerp: 0.1});
    } catch (e) {
        console.error('Lenis error:', e);
    }

    refreshPageScripts();
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initExpandable, 250);
});
document.addEventListener('DOMContentLoaded', initExpandable);

initPreloader();

(function initBarbaTransition() {

    if (typeof barba === 'undefined') return;

    let isTransitioning = false;
    let cardClone = null;
    let safetyTimer = null;

    function setTransitioning(value) {
        isTransitioning = value;
        clearTimeout(safetyTimer);
        if (value) {
            safetyTimer = setTimeout(function () {
                isTransitioning = false;
                unlockScroll();
                cleanupOverlay();
            }, 6000);
        }
    }

    function lockScroll() {
        try {
            if (window.lenis && typeof window.lenis.stop === 'function') {
                window.lenis.stop();
            }
        } catch (e) {
        }
        document.documentElement.style.overflow = 'hidden';
        document.body.classList.add('no-scroll');
    }

    function unlockScroll() {
        document.documentElement.style.overflow = '';
        document.body.classList.remove('no-scroll');
        try {
            if (window.lenis && typeof window.lenis.start === 'function') {
                window.lenis.start();
            }
        } catch (e) {
        }
    }

    function cleanupOverlay() {
        var overlay = document.querySelector('.transition-overlay');
        if (overlay) overlay.classList.remove('is-visible');
        if (cardClone) {
            try {
                cardClone.remove();
            } catch (e) {
            }
            cardClone = null;
        }
    }

    function waitForOverlay(overlay, fallback) {
        return new Promise(function (resolve) {
            if (!overlay) {
                setTimeout(resolve, fallback);
                return;
            }
            var done = false;
            var finish = function () {
                if (done) return;
                done = true;
                overlay.removeEventListener('transitionend', finish);
                overlay.removeEventListener('animationend', finish);
                resolve();
            };
            overlay.addEventListener('transitionend', finish, {once: true});
            overlay.addEventListener('animationend', finish, {once: true});
            setTimeout(finish, fallback);
        });
    }

    function forceReset() {
        isTransitioning = false;
        clearTimeout(safetyTimer);
        unlockScroll();
        cleanupOverlay();
    }

    window.addEventListener('pageshow', function (e) {
        if (e.persisted) forceReset();
    });

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible' && isTransitioning) {
            setTimeout(function () {
                if (isTransitioning) forceReset();
            }, 1500);
        }
    });

    window.addEventListener('error', function () {
        if (isTransitioning) forceReset();
    });

    window.addEventListener('unhandledrejection', function () {
        if (isTransitioning) forceReset();
    });

    barba.hooks.before(function () {
        setTransitioning(true);
        lockScroll();
    });

    barba.hooks.after(function () {
        setTransitioning(false);
        unlockScroll();
    });

    try {
        barba.init({
            prevent: function (data) {
                if (isTransitioning) {
                    if (data.event) data.event.preventDefault();
                    return true;
                }

                var el = data.el;
                if (!el || !el.href) return true;

                var url;
                try {
                    url = new URL(el.href, window.location.origin);
                } catch (e) {
                    return true;
                }

                if (url.origin !== window.location.origin) return true;
                if (url.pathname === window.location.pathname && url.hash) return true;
                if (el.hasAttribute('download')) return true;
                if (el.getAttribute('target') === '_blank') return true;

                return false;
            },

            transitions: [{
                name: 'project-reveal',

                beforeLeave: function (ref) {
                    try {
                        var section = ref.current.container.querySelector('.projects-section');
                        if (section) {
                            section.style.height = section.getBoundingClientRect().height + 'px';
                            section.style.overflow = 'hidden';
                        }
                    } catch (e) {
                    }
                },

                leave: function (ref) {
                    var overlay = document.querySelector('.transition-overlay');

                    try {
                        var clickedItem = null;
                        try {
                            clickedItem = ref.trigger && ref.trigger.closest
                                ? ref.trigger.closest('.project-item')
                                : ref.trigger;
                        } catch (e) {
                            clickedItem = ref.trigger;
                        }

                        if (clickedItem && overlay) {
                            var rect = clickedItem.getBoundingClientRect();
                            var overlayRect = overlay.getBoundingClientRect();

                            var videoTimes = [];
                            try {
                                var videos = clickedItem.querySelectorAll('video');
                                for (var i = 0; i < videos.length; i++) {
                                    videoTimes.push(videos[i].currentTime || 0);
                                }
                            } catch (e) {
                            }

                            cardClone = clickedItem.cloneNode(true);

                            try {
                                var clonedVideos = cardClone.querySelectorAll('video');
                                for (var j = 0; j < clonedVideos.length; j++) {
                                    try {
                                        clonedVideos[j].removeAttribute('autoplay');
                                        clonedVideos[j].removeAttribute('loop');
                                        clonedVideos[j].pause();
                                        if (typeof videoTimes[j] === 'number') {
                                            clonedVideos[j].currentTime = videoTimes[j];
                                        }
                                    } catch (e) {
                                    }
                                }
                            } catch (e) {
                            }

                            cardClone.style.position = 'absolute';
                            cardClone.style.top = (rect.top - overlayRect.top) + 'px';
                            cardClone.style.left = (rect.left - overlayRect.left) + 'px';
                            cardClone.style.width = rect.width + 'px';
                            cardClone.style.height = rect.height + 'px';
                            cardClone.style.margin = '0';
                            cardClone.style.pointerEvents = 'none';

                            overlay.appendChild(cardClone);
                        }
                    } catch (e) {
                        cardClone = null;
                    }

                    try {
                        if (overlay) overlay.classList.add('is-visible');
                    } catch (e) {
                    }

                    return waitForOverlay(overlay, 2200);
                },

                beforeEnter: function (ref) {
                    try {
                        window.scrollTo(0, 0);

                        var nextPreloader = ref.next.container.querySelector('.preloader');
                        if (nextPreloader) {
                            nextPreloader.classList.add('hidden');
                            nextPreloader.style.display = 'none';
                        }
                        document.body.classList.remove('no-scroll');

                        gsap.set(ref.next.container, {
                            opacity: 1,
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100vh',
                            overflowY: 'auto',
                            zIndex: 150,
                            yPercent: 100,
                            force3D: true,
                            willChange: 'transform'
                        });
                    } catch (e) {
                    }
                },

                enter: function (ref) {
                    try {
                        var overlay = document.querySelector('.transition-overlay');
                        var section = ref.current.container.querySelector('.projects-section');
                        var nextContainer = ref.next.container;
                        var currentContainer = ref.current.container;

                        var fixedEls = [];
                        try {
                            var allEls = nextContainer.querySelectorAll('*');
                            for (var i = 0; i < allEls.length; i++) {
                                try {
                                    if (getComputedStyle(allEls[i]).position === 'fixed') {
                                        fixedEls.push({
                                            el: allEls[i],
                                            prev: {
                                                position: allEls[i].style.position,
                                                top: allEls[i].style.top,
                                                left: allEls[i].style.left,
                                                width: allEls[i].style.width,
                                                height: allEls[i].style.height
                                            }
                                        });
                                        allEls[i].style.position = 'absolute';
                                    }
                                } catch (e) {
                                }
                            }
                        } catch (e) {
                        }

                        return Promise.all([
                            section
                                ? gsap.to(section, {height: 0, duration: 1.2, ease: 'power2.inOut'})
                                : Promise.resolve(),
                            gsap.to(nextContainer, {yPercent: 0, duration: 1.2, ease: 'power3.inOut'})
                        ]).then(function () {
                            gsap.set(currentContainer, {display: 'none'});

                            for (var k = 0; k < fixedEls.length; k++) {
                                fixedEls[k].el.style.position = fixedEls[k].prev.position;
                                fixedEls[k].el.style.top = fixedEls[k].prev.top;
                                fixedEls[k].el.style.left = fixedEls[k].prev.left;
                                fixedEls[k].el.style.width = fixedEls[k].prev.width;
                                fixedEls[k].el.style.height = fixedEls[k].prev.height;
                            }

                            gsap.set(nextContainer, {
                                clearProps: 'position,top,left,width,height,overflowY,zIndex,willChange,transform,yPercent,y,opacity,force3D'
                            });

                            if (overlay) overlay.classList.remove('is-visible');

                            try {
                                if (window.ScrollTrigger) ScrollTrigger.refresh();
                            } catch (e) {
                            }
                        });

                    } catch (e) {
                        return Promise.resolve();
                    }
                },

                after: function () {
                    try {
                        if (typeof refreshPageScripts === 'function') refreshPageScripts();
                    } catch (e) {
                    }

                    cleanupOverlay();
                    window.scrollTo(0, 0);

                    try {
                        if (window.lenis) {
                            if (typeof window.lenis.resize === 'function') window.lenis.resize();
                            if (typeof window.lenis.start === 'function') window.lenis.start();
                        }
                    } catch (e) {
                    }

                    try {
                        if (window.ScrollTrigger) ScrollTrigger.refresh();
                    } catch (e) {
                    }
                }
            }]
        });

    } catch (e) {
        isTransitioning = false;
        unlockScroll();
    }

})();


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


(function () {
    document.querySelectorAll('.footer-block input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {

                document.querySelectorAll('.footer-block input[type="checkbox"]').forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
        });
    });
})();

(function () {
    const videos = document.querySelectorAll('video[data-mobile][data-desktop]');
    const isMobile = window.innerWidth < 768;
    videos.forEach(video => {
        const src = isMobile ? video.dataset.mobile : video.dataset.desktop;
        if (video.getAttribute('src') !== src) {
            video.src = src;
            video.load();
        }

        const mobilePoster = video.dataset.mobilePoster;
        const desktopPoster = video.dataset.desktopPoster;
        if (mobilePoster && desktopPoster) {
            const poster = isMobile ? mobilePoster : desktopPoster;
            if (video.getAttribute('poster') !== poster) {
                video.poster = poster;
            }
        }
    });
})();