const ScrollLock = (()=>{
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
        document.body.classList.add('no-scroll');
        if (window.lenis && typeof window.lenis.stop === 'function') window.lenis.stop();
    }
    function applyUnlock() {
        document.body.classList.remove('no-scroll');
        if (window.lenis && typeof window.lenis.start === 'function') window.lenis.start();
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
    return {
        lock,
        unlock,
        reset,
        isLocked
    };
})();
window.ScrollLock = ScrollLock;
const StickyCenterGrid = (()=>{
    const DEFAULTS = {
        selector: '[data-sticky-grid]',
        stickySelector: '.grid__sticky',
        columnSelector: '.grid__column:not(.grid__sticky)',
        headerAttr: 'data-sticky-grid-header',
        defaultHeaderSelector: '.header'
    };
    let config = {
        ...DEFAULTS
    };
    let instances = [];
    let ro = null;
    let rafPending = false;
    let resizeTimer = null;
    let onLenisScroll = null;
    let onWindowScroll = null;
    let initialized = false;
    function getHeaderHeight(selector) {
        const el = document.querySelector(selector);
        return el ? el.offsetHeight : 0;
    }
    function measure(entry) {
        const { fixed, headerSelector } = entry;
        const vh = window.innerHeight;
        const headerH = getHeaderHeight(headerSelector);
        const fixedH = fixed.offsetHeight;
        const isTall = fixedH > vh;
        const top = isTall ? headerH : Math.max(0, (vh + headerH - fixedH) / 2);
        fixed.style.setProperty('--scg-top', `${top}px`);
        fixed.style.setProperty('--scg-header-h', `${headerH}px`);
        fixed.style.setProperty('--scg-fixed-h', `${fixedH}px`);
        fixed.style.setProperty('--scg-vh', `${vh}px`);
        fixed.style.setProperty('--scg-mode', isTall ? 'tall' : 'center');
    }
    function measureAll() {
        instances.forEach(measure);
    }
    function scheduleUpdate() {
        if (rafPending) return;
        rafPending = true;
        requestAnimationFrame(()=>{
            rafPending = false;
            measureAll();
        });
    }
    function setupInstance(grid) {
        const fixed = grid.querySelector(config.stickySelector);
        const column = grid.querySelector(config.columnSelector);
        if (!fixed || !column) return;
        const headerSelector = grid.getAttribute(config.headerAttr) || config.defaultHeaderSelector;
        const entry = {
            grid,
            fixed,
            column,
            headerSelector
        };
        instances.push(entry);
        measure(entry);
        if (ro) {
            ro.observe(fixed);
            ro.observe(column);
        }
    }
    function bindScroll() {
        const lenis = window.lenis;
        if (lenis && typeof lenis.on === 'function') {
            onLenisScroll = ()=>scheduleUpdate();
            lenis.on('scroll', onLenisScroll);
        } else {
            onWindowScroll = ()=>scheduleUpdate();
            window.addEventListener('scroll', onWindowScroll, {
                passive: true
            });
        }
    }
    function unbindScroll() {
        const lenis = window.lenis;
        if (lenis && onLenisScroll && typeof lenis.off === 'function') {
            lenis.off('scroll', onLenisScroll);
            onLenisScroll = null;
        }
        if (onWindowScroll) {
            window.removeEventListener('scroll', onWindowScroll);
            onWindowScroll = null;
        }
    }
    function onResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(scheduleUpdate, 150);
    }
    function init(options = {}) {
        if (initialized) return;
        config = {
            ...DEFAULTS,
            ...options
        };
        const grids = document.querySelectorAll(config.selector);
        if (!grids.length) return;
        ro = new ResizeObserver(scheduleUpdate);
        grids.forEach(setupInstance);
        bindScroll();
        window.addEventListener('resize', onResize, {
            passive: true
        });
        initialized = true;
    }
    function refresh() {
        if (!initialized) return;
        measureAll();
    }
    function destroy() {
        if (!initialized) return;
        unbindScroll();
        if (ro) {
            ro.disconnect();
            ro = null;
        }
        window.removeEventListener('resize', onResize);
        clearTimeout(resizeTimer);
        instances.forEach((entry)=>{
            entry.fixed.style.removeProperty('--scg-top');
            entry.fixed.style.removeProperty('--scg-header-h');
            entry.fixed.style.removeProperty('--scg-fixed-h');
            entry.fixed.style.removeProperty('--scg-vh');
            entry.fixed.style.removeProperty('--scg-mode');
        });
        instances = [];
        initialized = false;
    }
    return {
        init,
        refresh,
        destroy
    };
})();
window.StickyCenterGrid = StickyCenterGrid;
const SmoothScroll = (()=>{
    const DEFAULTS = {
        duration: 1.2,
        easing: (t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        smoothTouch: false
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
        lenis = new Lenis({
            ...DEFAULTS,
            ...options
        });
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
    return {
        init,
        destroy,
        get
    };
})();
window.SmoothScroll = SmoothScroll;
const HeroBackground = (()=>{
    const defaults = {
        selector: '[data-hero-bg]',
        videoClass: 'hero-bg__item hero-bg__item--video',
        readyClass: 'is-ready',
        idleTimeout: 2000,
        readyFallbackMs: 3000
    };
    let config;
    config = {
        ...defaults
    };
    let root = null;
    let image = null;
    let video = null;
    let mql = null;
    let videoSrc = '';
    let videoPoster = '';
    let idleHandle = null;
    let readyTimer = null;
    let isInitialized = false;
    function runWhenIdle(cb) {
        if ('requestIdleCallback' in window) idleHandle = window.requestIdleCallback(cb, {
            timeout: config.idleTimeout
        });
        else idleHandle = window.setTimeout(cb, 200);
    }
    function cancelIdle() {
        if (idleHandle == null) return;
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
        idleHandle = null;
    }
    function createVideo() {
        const v = document.createElement('video');
        v.className = config.videoClass;
        // Muted MUST be set before src for autoplay to work on most browsers.
        v.muted = true;
        v.defaultMuted = true;
        v.setAttribute('muted', '');
        v.autoplay = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('autoplay', '');
        v.setAttribute('loop', '');
        v.setAttribute('playsinline', '');
        // preload="metadata" is the sweet spot: starts the fetch (unlike "none"
        // which sometimes stalls after load()), but doesn't pull the whole file
        // before we're ready to play.
        v.preload = 'metadata';
        const poster = videoPoster || image && image.currentSrc || '';
        if (poster) v.poster = poster;
        return v;
    }
    function markReady() {
        if (!video || video.classList.contains(config.readyClass)) return;
        video.classList.add(config.readyClass);
        if (readyTimer) {
            clearTimeout(readyTimer);
            readyTimer = null;
        }
        const p = video.play();
        if (p && typeof p.catch === 'function') p.catch((err)=>console.warn('[HeroBackground] play() rejected:', err));
    }
    function mountVideo() {
        if (video || !videoSrc) return;
        video = createVideo();
        // canplay fires once the browser can begin playback — more reliable
        // than loadeddata for the autoplay path.
        video.addEventListener('canplay', markReady, {
            once: true
        });
        video.addEventListener('loadeddata', markReady, {
            once: true
        });
        video.addEventListener('error', (e)=>{
            const err = video.error;
            const codes = {
                1: "MEDIA_ERR_ABORTED \u2014 fetch aborted by user",
                2: "MEDIA_ERR_NETWORK \u2014 network error while fetching",
                3: "MEDIA_ERR_DECODE \u2014 decoding failed (corrupt/unsupported codec)",
                4: "MEDIA_ERR_SRC_NOT_SUPPORTED \u2014 404, wrong MIME, or format not supported"
            };
            console.error('[HeroBackground] video error:', {
                code: err && err.code,
                message: err && (codes[err.code] || err.message),
                src: video.currentSrc,
                networkState: video.networkState,
                readyState: video.readyState
            });
            unmountVideo();
        }, {
            once: true
        });
        // Safety net: if neither event fires (rare, but happens behind some
        // proxies / slow connections), reveal the video anyway after Ns.
        readyTimer = setTimeout(markReady, config.readyFallbackMs);
        // Append FIRST, then set src — avoids a detached-element fetch edge case.
        root.appendChild(video);
        video.src = videoSrc;
        video.load();
    }
    function unmountVideo() {
        if (readyTimer) {
            clearTimeout(readyTimer);
            readyTimer = null;
        }
        if (!video) return;
        try {
            video.pause();
            video.removeAttribute('src');
            video.load();
        } catch (_) {}
        video.remove();
        video = null;
    }
    function handleViewportChange(e) {
        if (e.matches) runWhenIdle(mountVideo);
        else {
            cancelIdle();
            unmountVideo();
        }
    }
    function init(options = {}) {
        if (isInitialized) return;
        config = {
            ...defaults,
            ...options
        };
        root = document.querySelector(config.selector);
        if (!root) return;
        image = root.querySelector('img');
        videoSrc = root.dataset.videoSrc || '';
        videoPoster = root.dataset.videoPoster || '';
        const breakpoint = parseInt(root.dataset.breakpoint, 10) || 768;
        mql = window.matchMedia(`(min-width: ${breakpoint}px)`);
        if (mql.matches) runWhenIdle(mountVideo);
        mql.addEventListener('change', handleViewportChange);
        isInitialized = true;
    }
    function destroy() {
        if (!isInitialized) return;
        cancelIdle();
        unmountVideo();
        if (mql) mql.removeEventListener('change', handleViewportChange);
        mql = null;
        root = null;
        image = null;
        videoSrc = '';
        videoPoster = '';
        isInitialized = false;
    }
    function get() {
        return {
            root,
            image,
            video,
            mql,
            videoSrc,
            videoPoster,
            isInitialized
        };
    }
    return {
        init,
        destroy,
        get
    };
})();
window.HeroBackground = HeroBackground;
const Preloader = (()=>{
    const defaults = {
        selector: '.preloader',
        hiddenClass: 'preloader--hidden',
        lineSelector: '.preloader-logo__line',
        wordSelector: '.preloader-word',
        heroSelector: '[data-hero-bg]',
        animDuration: 100,
        smoothTime: 0.9,
        maxSpeed: 0.28,
        displaySmoothing: 0.045,
        minShowMs: 1400,
        hideTransitionMs: 1000,
        softCap: 0.92
    };
    let config = {
        ...defaults
    };
    let el = null;
    let lineEl = null;
    let words = [];
    let progress = 0;
    let displayProgress = 0;
    let target = 0;
    let velocity = 0;
    let lastFrameTs = 0;
    let rafId = null;
    let startTs = 0;
    let observer = null;
    let videoEl = null;
    let heroReady = false;
    let isFinished = false;
    let isInitialized = false;
    function resolve() {
        heroReady = true;
        target = 1;
    }
    function partial(value) {
        if (heroReady) return;
        target = Math.min(Math.max(target, value), config.softCap);
    }
    const wordWindows = [
        [
            0.01,
            0.36
        ],
        [
            0.10,
            0.50
        ],
        [
            0.22,
            0.66
        ],
        [
            0.36,
            0.80
        ],
        [
            0.50,
            0.96
        ]
    ];
    function easeOutQuart(t) {
        const inv = 1 - t;
        return 1 - inv * inv * inv * inv;
    }
    function scrub(p) {
        if (lineEl) lineEl.style.setProperty('--animation-delay', -(p * config.animDuration) + 's');
        for(let i = 0; i < words.length; i++){
            const win = wordWindows[i] || wordWindows[wordWindows.length - 1];
            const span = win[1] - win[0];
            const linear = Math.max(0, Math.min(1, (p - win[0]) / span));
            const eased = easeOutQuart(linear);
            words[i].style.animationDelay = -(eased * config.animDuration) + 's';
            words[i].style.animationPlayState = 'paused';
        }
    }
    function smoothDamp(current, tgt, dt) {
        const smoothTime = Math.max(0.0001, config.smoothTime);
        const omega = 2 / smoothTime;
        const x = omega * dt;
        const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
        let change = current - tgt;
        const maxChange = config.maxSpeed * smoothTime;
        change = Math.max(-maxChange, Math.min(maxChange, change));
        const adjusted = current - change;
        const temp = (velocity + omega * change) * dt;
        velocity = (velocity - omega * temp) * exp;
        let result = adjusted + (change + temp) * exp;
        if (tgt - current > 0 === result > tgt) {
            result = tgt;
            velocity = 0;
        }
        return result;
    }
    function tick(now) {
        if (isFinished) return;
        if (!lastFrameTs) lastFrameTs = now;
        const dt = Math.min((now - lastFrameTs) / 1000, 0.1);
        lastFrameTs = now;
        progress = smoothDamp(progress, target, dt);
        if (Math.abs(target - progress) < 0.0004 && Math.abs(velocity) < 0.001) {
            progress = target;
            velocity = 0;
        }
        const k = 1 - Math.pow(1 - config.displaySmoothing, dt * 60);
        displayProgress += (progress - displayProgress) * k;
        if (Math.abs(progress - displayProgress) < 0.0003) displayProgress = progress;
        scrub(displayProgress);
        if (progress >= 1 && heroReady) {
            finish();
            return;
        }
        rafId = requestAnimationFrame(tick);
    }
    function startVideo() {
        if (!videoEl) return;
        videoEl.currentTime = 0;
        const p = videoEl.play();
        if (p && typeof p.catch === 'function') p.catch(()=>{});
    }
    function finish() {
        if (isFinished) return;
        isFinished = true;
        cancelAnimationFrame(rafId);
        rafId = null;
        displayProgress = 1;
        scrub(1);
        const elapsed = performance.now() - startTs;
        const remaining = Math.max(0, config.minShowMs - elapsed);
        setTimeout(()=>{
            if (el) el.classList.add(config.hiddenClass);
            if (window.ScrollLock) ScrollLock.unlock();
            setTimeout(()=>{
                startVideo();
                cleanUp();
            }, config.hideTransitionMs);
        }, remaining);
    }
    function pauseVideo() {
        if (!videoEl) return;
        try {
            videoEl.pause();
        } catch (_) {}
    }
    function bindVideo(v) {
        if (videoEl) return;
        videoEl = v;
        videoEl.autoplay = false;
        videoEl.removeAttribute('autoplay');
        pauseVideo();
        const onProgress = ()=>{
            try {
                if (!videoEl.duration || !videoEl.buffered.length) return;
                const buffered = videoEl.buffered.end(videoEl.buffered.length - 1);
                partial(buffered / videoEl.duration);
            } catch (_) {}
        };
        const onReady = ()=>{
            pauseVideo();
            resolve();
            videoEl.removeEventListener('progress', onProgress);
        };
        videoEl.addEventListener('progress', onProgress);
        videoEl.addEventListener('canplay', onReady, {
            once: true
        });
        videoEl.addEventListener('loadeddata', onReady, {
            once: true
        });
        videoEl.addEventListener('playing', ()=>{
            if (!isFinished) pauseVideo();
        });
        videoEl.addEventListener('error', ()=>resolve(), {
            once: true
        });
        if (videoEl.readyState >= 3) {
            pauseVideo();
            resolve();
            return;
        }
        videoEl.addEventListener('loadedmetadata', ()=>partial(0.15), {
            once: true
        });
    }
    function watchHero() {
        const heroRoot = document.querySelector(config.heroSelector);
        if (!heroRoot) {
            resolve();
            return;
        }
        const videoSrc = heroRoot.dataset.videoSrc || '';
        const breakpoint = parseInt(heroRoot.dataset.breakpoint, 10) || 768;
        if (!videoSrc || window.innerWidth < breakpoint) {
            resolve();
            return;
        }
        const existing = heroRoot.querySelector('video');
        if (existing) {
            bindVideo(existing);
            return;
        }
        observer = new MutationObserver((mutations)=>{
            for (const m of mutations){
                for (const node of m.addedNodes)if (node.nodeName === 'VIDEO') {
                    bindVideo(node);
                    observer.disconnect();
                    observer = null;
                    return;
                }
            }
        });
        observer.observe(heroRoot, {
            childList: true
        });
        setTimeout(()=>{
            if (!heroReady) resolve();
        }, 4500);
    }
    function cleanUp() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
    }
    function init(options) {
        if (isInitialized) return;
        config = {
            ...defaults,
            ...options
        };
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        if (window.ScrollLock) ScrollLock.lock();
        el = document.querySelector(config.selector);
        if (!el) {
            if (window.ScrollLock) ScrollLock.unlock();
            return;
        }
        lineEl = el.querySelector(config.lineSelector);
        words = Array.from(el.querySelectorAll(config.wordSelector));
        words.forEach((w)=>{
            w.style.animationPlayState = 'paused';
            w.style.animationDelay = '0s';
        });
        startTs = performance.now();
        watchHero();
        rafId = requestAnimationFrame(tick);
        isInitialized = true;
    }
    function destroy() {
        if (!isInitialized) return;
        cancelAnimationFrame(rafId);
        rafId = null;
        cleanUp();
        if (window.ScrollLock) ScrollLock.unlock();
        velocity = 0;
        displayProgress = 0;
        lastFrameTs = 0;
        el = null;
        lineEl = null;
        words = [];
        videoEl = null;
        isInitialized = false;
    }
    function get() {
        return {
            el,
            lineEl,
            words,
            progress,
            displayProgress,
            target,
            velocity,
            heroReady,
            isFinished,
            isInitialized
        };
    }
    return {
        init,
        destroy,
        get
    };
})();
window.Preloader = Preloader;
const Parallax = (()=>{
    const DEFAULTS = {
        selector: '.parallax',
        speed: 0.5,
        lerp: 1,
        maxScale: 1.2,
        disableOnMobile: false,
        mobileBreakpoint: 768
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
        const bp = options && options.mobileBreakpoint || DEFAULTS.mobileBreakpoint;
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
        if (!ch || !vh) return {
            speed: requestedSpeed,
            scale: 1
        };
        const maxDelta = Math.max(0, (maxScale - 1) * ch / (vh + ch));
        const delta = 1 - requestedSpeed;
        const clamped = Math.max(-maxDelta, Math.min(maxDelta, delta));
        const effectiveSpeed = 1 - clamped;
        const scale = 1 + Math.abs(clamped) * (vh + ch) / ch;
        return {
            speed: effectiveSpeed,
            scale
        };
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
            const resolved = resolveSpeedAndScale(entry.height, entry.requestedSpeed, entry.vh, options.maxScale);
            entry.speed = resolved.speed;
            entry.scale = resolved.scale;
        }
    }
    function measureAll() {
        for (const entry of elements)measure(entry);
    }
    function register(el) {
        const raw = el.dataset.parallaxSpeed;
        const parsed = raw != null ? parseFloat(raw) : NaN;
        const requestedSpeed = isNaN(parsed) ? options.speed : parsed;
        const axis = el.dataset.parallaxAxis === 'x' ? 'x' : 'y';
        const userScale = el.dataset.parallaxScale != null ? parseFloat(el.dataset.parallaxScale) : null;
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
            visible: false
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
        entry.target.style.transform = entry.axis === 'x' ? `translate3d(${v}px, 0, 0) scale(${s})` : `translate3d(0, ${v}px, 0) scale(${s})`;
    }
    function tick() {
        const lerp = options.lerp;
        for (const entry of elements)if (entry.visible) updateTarget(entry);
        for (const entry of elements){
            if (!entry.visible) continue;
            if (lerp >= 1) entry.currentY = entry.targetY;
            else entry.currentY += (entry.targetY - entry.currentY) * lerp;
            applyTransform(entry);
        }
        rafId = requestAnimationFrame(tick);
    }
    function handleIntersect(ioEntries) {
        for (const ioEntry of ioEntries){
            const entry = elements.find((e)=>e.el === ioEntry.target);
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
        for (const entry of elements){
            if (!entry.visible) continue;
            updateTarget(entry);
            entry.currentY = entry.targetY;
            applyTransform(entry);
        }
    }
    function init(userOptions = {}) {
        if (initialized) return api;
        options = {
            ...DEFAULTS,
            ...userOptions
        };
        if (options.disableOnMobile && isMobile()) {
            initialized = true;
            window.parallax = api;
            return api;
        }
        reducedMotion = typeof window.matchMedia !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const nodes = document.querySelectorAll(options.selector);
        if (!nodes.length) console.warn('[Parallax] No elements matched selector:', options.selector);
        elements = [];
        for (const node of nodes){
            const entry = register(node);
            if (entry) elements.push(entry);
        }
        measureAll();
        for (const entry of elements){
            updateTarget(entry);
            entry.currentY = entry.targetY;
            applyTransform(entry);
        }
        if (typeof IntersectionObserver !== 'undefined') {
            io = new IntersectionObserver(handleIntersect, {
                rootMargin: '20% 0%',
                threshold: 0
            });
            for (const entry of elements)io.observe(entry.el);
        } else for (const entry of elements)entry.visible = true;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(handleResize);
            ro.observe(document.documentElement);
            for (const entry of elements)ro.observe(entry.el);
        }
        resizeHandler = handleResize;
        window.addEventListener('resize', resizeHandler, {
            passive: true
        });
        const onScroll = ()=>{};
        if (window.lenis && typeof window.lenis.on === 'function') {
            window.lenis.on('scroll', onScroll);
            scrollUnsub = ()=>{
                if (window.lenis && typeof window.lenis.off === 'function') window.lenis.off('scroll', onScroll);
            };
        } else {
            window.addEventListener('scroll', onScroll, {
                passive: true
            });
            scrollUnsub = ()=>window.removeEventListener('scroll', onScroll);
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
        for (const entry of elements){
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
        return {
            elements,
            options,
            initialized
        };
    }
    const api = {
        init,
        destroy,
        get
    };
    return api;
})();
window.Parallax = Parallax;
const AnchorScroll = (()=>{
    const DEFAULTS = {
        linkSelector: 'a[href^="#"], [data-scroll-to]',
        targetAttr: 'data-scroll-to',
        offsetAttr: 'data-scroll-offset',
        durationAttr: 'data-scroll-duration',
        defaultOffset: 0,
        defaultDuration: 1.2,
        headerSelector: '.header',
        updateHash: true
    };
    let config = {
        ...DEFAULTS
    };
    let onClick = null;
    let initialized = false;
    function getHeaderOffset() {
        if (!config.headerSelector) return 0;
        const header = document.querySelector(config.headerSelector);
        return header ? header.offsetHeight : 0;
    }
    function resolveTarget(link) {
        const customSel = link.getAttribute(config.targetAttr);
        if (customSel) return customSel === 'top' ? 'top' : document.querySelector(customSel);
        const href = link.getAttribute('href');
        if (!href || href === '#') return null;
        if (href === '#top') return 'top';
        try {
            return document.querySelector(href);
        } catch (e) {
            return null;
        }
    }
    function scrollTo(target, options = {}) {
        const offset = (options.offset ?? config.defaultOffset) - getHeaderOffset();
        const duration = options.duration ?? config.defaultDuration;
        const lenis = window.lenis;
        if (lenis && typeof lenis.scrollTo === 'function') {
            lenis.scrollTo(target === 'top' ? 0 : target, {
                offset,
                duration,
                easing: (t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
            return;
        }
        let y;
        if (target === 'top') y = 0;
        else if (typeof target === 'number') y = target;
        else if (target instanceof Element) y = target.getBoundingClientRect().top + window.scrollY + offset;
        else return;
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
    }
    function handleClick(event) {
        const link = event.target.closest(config.linkSelector);
        if (!link) return;
        if (event.defaultPrevented) return;
        if (event.button !== 0) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.target && link.target !== '_self') return;
        const target = resolveTarget(link);
        if (!target) return;
        event.preventDefault();
        const rawOffset = parseFloat(link.getAttribute(config.offsetAttr));
        const rawDuration = parseFloat(link.getAttribute(config.durationAttr));
        scrollTo(target, {
            offset: Number.isNaN(rawOffset) ? undefined : rawOffset,
            duration: Number.isNaN(rawDuration) ? undefined : rawDuration
        });
        if (config.updateHash) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) history.replaceState(null, '', href);
        }
    }
    function init(options = {}) {
        if (initialized) return;
        config = {
            ...DEFAULTS,
            ...options
        };
        onClick = handleClick;
        document.addEventListener('click', onClick);
        if (window.location.hash && window.location.hash.length > 1) try {
            const target = document.querySelector(window.location.hash);
            if (target) requestAnimationFrame(()=>{
                requestAnimationFrame(()=>scrollTo(target));
            });
        } catch (e) {}
        initialized = true;
    }
    function destroy() {
        if (!initialized) return;
        document.removeEventListener('click', onClick);
        onClick = null;
        initialized = false;
    }
    return {
        init,
        destroy,
        scrollTo
    };
})();
window.AnchorScroll = AnchorScroll;
const ContactShowcase = (()=>{
    const DEFAULTS = {
        root: '.contact-showcase',
        itemSelector: '.contact-showcase__item',
        buttonSelector: '.contact-item__button',
        activeClass: 'contact-showcase__item--active',
        targetAttr: 'data-target',
        initialIndex: 0
    };
    let config = {
        ...DEFAULTS
    };
    let root = null;
    let items = [];
    let currentIndex = 0;
    let initialized = false;
    function setActive(index) {
        if (index < 0 || index >= items.length) return;
        items.forEach((item, i)=>item.classList.toggle(config.activeClass, i === index));
        currentIndex = index;
    }
    function handleClick(event) {
        const button = event.target.closest(config.buttonSelector);
        if (!button || !root.contains(button)) return;
        const target = button.getAttribute(config.targetAttr);
        if (target === null) return;
        const index = parseInt(target, 10);
        if (Number.isNaN(index)) return;
        setActive(index);
    }
    function bindEvents() {
        root.addEventListener('click', handleClick);
    }
    function unbindEvents() {
        root.removeEventListener('click', handleClick);
    }
    function init(options = {}) {
        config = {
            ...DEFAULTS,
            ...options
        };
        root = document.querySelector(config.root);
        if (!root) {
            console.warn('[Showcase] Root element not found.');
            return;
        }
        items = Array.from(root.querySelectorAll(config.itemSelector));
        if (!items.length) {
            console.warn('[Showcase] No items found.');
            return;
        }
        setActive(config.initialIndex);
        bindEvents();
        initialized = true;
    }
    function goTo(index) {
        if (!initialized) return;
        setActive(index);
    }
    function reset() {
        if (!initialized) return;
        setActive(config.initialIndex);
    }
    function destroy() {
        if (!initialized) return;
        unbindEvents();
        items = [];
        root = null;
        currentIndex = 0;
        initialized = false;
    }
    return {
        init,
        goTo,
        reset,
        destroy
    };
})();
window.ContactShowcase = ContactShowcase;
const BurgerMenu = (()=>{
    const DEFAULTS = {
        burgerSelector: '.burger',
        menuSelector: '.mobile-menu',
        burgerActiveClass: 'burger--active',
        menuActiveClass: 'mobile-menu--active',
        bodyLockClass: 'no-scroll',
        closeOnLinkClick: true,
        linkSelector: 'a'
    };
    let config = {
        ...DEFAULTS
    };
    let burgers = [];
    let menu = null;
    let isOpen = false;
    let initialized = false;
    function setState(state) {
        if (state === isOpen) return;
        isOpen = state;
        burgers.forEach((burger)=>burger.classList.toggle(config.burgerActiveClass, isOpen));
        if (menu) menu.classList.toggle(config.menuActiveClass, isOpen);
        document.body.classList.toggle(config.bodyLockClass, isOpen);
        if (isOpen) ScrollLock.lock();
        else ScrollLock.unlock();
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
        burgers.forEach((burger)=>burger.addEventListener('click', handleBurgerClick));
        if (config.closeOnLinkClick && menu) menu.addEventListener('click', handleMenuClick);
    }
    function unbindEvents() {
        burgers.forEach((burger)=>burger.removeEventListener('click', handleBurgerClick));
        if (menu) menu.removeEventListener('click', handleMenuClick);
    }
    function init(options = {}) {
        config = {
            ...DEFAULTS,
            ...options
        };
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
    return {
        init,
        toggle,
        open,
        close,
        destroy
    };
})();
window.BurgerMenu = BurgerMenu;
const ToggleWrapper = (()=>{
    const DEFAULTS = {
        wrapperSelector: '.toggle-wrapper',
        blockSelector: '.toggle-block',
        openClass: 'open',
        heightVar: '--toggle-height',
        transitionProperty: 'max-height'
    };
    let config = {
        ...DEFAULTS
    };
    const resizeObservers = new WeakMap();
    const mutationObservers = new WeakMap();
    const transitionHandlers = new WeakMap();
    const registered = new WeakSet();
    function updateHeight(wrapper, block) {
        wrapper.style.setProperty(config.heightVar, block.scrollHeight + 'px');
    }
    function createTransitionHandler(wrapper) {
        return function(event) {
            if (event.target !== wrapper) return;
            if (event.propertyName !== config.transitionProperty) return;
            if (wrapper.classList.contains(config.openClass)) wrapper.style.maxHeight = 'none';
        };
    }
    function openWrapper(wrapper) {
        wrapper.style.maxHeight = '';
        wrapper.offsetHeight;
    }
    function closeWrapper(wrapper, block) {
        wrapper.style.maxHeight = block.scrollHeight + 'px';
        wrapper.offsetHeight;
        requestAnimationFrame(()=>{
            wrapper.style.maxHeight = '';
        });
    }
    function observeClass(wrapper, block) {
        let wasOpen = wrapper.classList.contains(config.openClass);
        if (wasOpen) wrapper.style.maxHeight = 'none';
        const observer = new MutationObserver((mutations)=>{
            for (const mutation of mutations){
                if (mutation.type !== 'attributes' || mutation.attributeName !== 'class') continue;
                const isOpen = wrapper.classList.contains(config.openClass);
                if (isOpen === wasOpen) continue;
                if (isOpen) openWrapper(wrapper);
                else closeWrapper(wrapper, block);
                wasOpen = isOpen;
            }
        });
        observer.observe(wrapper, {
            attributes: true,
            attributeFilter: [
                'class'
            ]
        });
        mutationObservers.set(wrapper, observer);
    }
    function observeResize(wrapper, block) {
        const observer = new ResizeObserver(()=>updateHeight(wrapper, block));
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
        config = {
            ...DEFAULTS,
            ...options
        };
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
        wrappers.forEach((wrapper)=>{
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
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>init());
    else init();
    return {
        init,
        refresh,
        destroy
    };
})();
window.ToggleWrapper = ToggleWrapper;
const Popup = (()=>{
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
        setTimeout(()=>{
            popup.classList.remove('is-active', 'is-closing');
            popup.dispatchEvent(new CustomEvent('popup:closed', {
                bubbles: true
            }));
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
        popup.dispatchEvent(new CustomEvent('popup:opened', {
            bubbles: true
        }));
    }
    function bindTriggers() {
        document.addEventListener('click', (e)=>{
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
            if (e.target.closest('.popup.is-active') && !e.target.closest('.popup__content')) close();
        });
    }
    function bindKeyboard() {
        document.addEventListener('keydown', (e)=>{
            if (e.key === 'Escape' && activePopup) close();
        });
    }
    function init() {
        bindTriggers();
        bindKeyboard();
    }
    return {
        init,
        open,
        close
    };
})();
window.Popup = Popup;
const TeamPopup = (()=>{
    const DEFAULTS = {
        cardSelector: '.team-card',
        popupSelector: '.popup-team',
        roleSelector: '.team-popup__info .text--accent--light',
        nameSelector: '.team-popup__info .title',
        imgSelector: '.team-popup__img img',
        textSelector: '.team-popup__text',
        imgPathTpl: 'assets/media/images/team/{id}.webp',
        bioParagraphClass: 'text text--tiny',
        boldClass: 'text text--medium',
        scrollbarOptions: {
            scrollbars: {}
        }
    };
    const teamData = {
        1: {
            role: "\u0421\u043F\u0438\u043A\u0435\u0440",
            name: "\u0410\u043B\u0435\u043A\u0441\u0435\u0439 \u0421\u0435\u043C\u0438\u0445\u0430\u0442\u043E\u0432",
            bio: [
                "\u0410\u043B\u0435\u043A\u0441\u0435\u0439 \u0421\u0435\u043C\u0438\u0445\u0430\u0442\u043E\u0432 \u2014 \u0434\u043E\u043A\u0442\u043E\u0440 \u0444\u0438\u0437\u0438\u043A\u043E-\u043C\u0430\u0442\u0435\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u043D\u0430\u0443\u043A, \u0432\u0435\u0434\u0443\u0449\u0438\u0439 \u043D\u0430\u0443\u0447\u043D\u044B\u0439 \u0441\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A \u0424\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0438\u043D\u0441\u0442\u0438\u0442\u0443\u0442\u0430 \u0438\u043C. \u041F. \u041D. \u041B\u0435\u0431\u0435\u0434\u0435\u0432\u0430 \u0420\u0410\u041D (\u0424\u0418\u0410\u041D), \u0432\u0435\u0434\u0443\u0449\u0438\u0439 \u043F\u0440\u043E\u0433\u0440\u0430\u043C\u043C\u044B \xab\u0412\u043E\u043F\u0440\u043E\u0441 \u043D\u0430\u0443\u043A\u0438\xbb \u043D\u0430 \u0442\u0435\u043B\u0435\u043A\u0430\u043D\u0430\u043B\u0435 \xab\u0420\u043E\u0441\u0441\u0438\u044F-24\xbb \u0438 \u043E\u0434\u0438\u043D \u0438\u0437 \u0441\u0430\u043C\u044B\u0445 \u044F\u0440\u043A\u0438\u0445 \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u0438\u0437\u0430\u0442\u043E\u0440\u043E\u0432 \u043D\u0430\u0443\u043A\u0438 \u0432 \u0420\u043E\u0441\u0441\u0438\u0438.",
                "\u0410\u043B\u0435\u043A\u0441\u0435\u0439 \u043F\u0440\u0438\u043D\u0430\u0434\u043B\u0435\u0436\u0438\u0442 \u043A \u0440\u0435\u0434\u043A\u043E\u043C\u0443 \u0442\u0438\u043F\u0443 \u0443\u0447\u0451\u043D\u044B\u0445, \u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043D\u0435 \u043F\u0440\u043E\u0441\u0442\u043E \u0434\u0435\u043B\u0430\u044E\u0442 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u044F, \u043D\u043E \u0438 \u0443\u043C\u0435\u044E\u0442 \u0443\u0432\u043B\u0435\u0447\u044C \u0444\u0438\u0437\u0438\u043A\u043E\u0439 \u0430\u0443\u0434\u0438\u0442\u043E\u0440\u0438\u044E \u043B\u044E\u0431\u043E\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F. \u041D\u0430 \u0441\u0432\u043E\u0438\u0445 \u0432\u044B\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u044F\u0445 \u043E\u043D \u0441\u0442\u0438\u0440\u0430\u0435\u0442 \u0433\u0440\u0430\u043D\u044C \u043C\u0435\u0436\u0434\u0443 \u0441\u043B\u043E\u0436\u043D\u043E\u0439 \u0430\u043A\u0430\u0434\u0435\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0442\u0435\u043E\u0440\u0438\u0435\u0439 \u0438 \u043F\u043E\u0432\u0441\u0435\u0434\u043D\u0435\u0432\u043D\u043E\u0439 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u044C\u044E. \u0413\u043E\u0432\u043E\u0440\u0438\u0442 \u043B\u0438 \u043E\u043D \u043E \u043A\u0432\u0430\u043D\u0442\u043E\u0432\u043E\u0439 \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0435, \u043A\u043E\u0441\u043C\u043E\u043B\u043E\u0433\u0438\u0438 \u0438\u043B\u0438 \u043F\u0440\u043E\u0438\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u0438 \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u2014 \u0435\u0433\u043E \u0440\u0435\u0447\u044C \u0432\u0441\u0435\u0433\u0434\u0430 \u0431\u0435\u0437\u0443\u043F\u0440\u0435\u0447\u043D\u043E \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0430, \u043E\u0441\u0442\u0440\u043E\u0443\u043C\u043D\u0430 \u0438 \u043B\u0438\u0448\u0435\u043D\u0430 \u043D\u0430\u0443\u043A\u043E\u043E\u0431\u0440\u0430\u0437\u0438\u044F."
            ]
        },
        2: {
            role: "\u0421\u043F\u0438\u043A\u0435\u0440",
            name: "\u041F\u0430\u0430\u0442\u0430 \u0410\u043C\u043E\u043D\u0430\u0448\u0432\u0438\u043B\u0438",
            bio: [
                "\u0412\u0435\u0434\u0443\u0449\u0438\u0439 \u043F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043B\u044C \u0444\u0438\u043B\u043E\u0441\u043E\u0444\u0441\u043A\u043E-\u043F\u0435\u0434\u0430\u0433\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \xab\u0428\u043A\u043E\u043B\u0430 \u0416\u0438\u0437\u043D\u0438\xbb, \u043F\u043E\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0438\u0434\u0435\u0439 \u0441\u0432\u043E\u0435\u0433\u043E \u043E\u0442\u0446\u0430 \u2014 \u0430\u043A\u0430\u0434\u0435\u043C\u0438\u043A\u0430 \u0428\u0430\u043B\u0432\u044B \u0410\u043C\u043E\u043D\u0430\u0448\u0432\u0438\u043B\u0438. \u041E\u0431\u043B\u0430\u0434\u0430\u044F \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442\u0430\u043B\u044C\u043D\u044B\u043C \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435\u043C \u0432 \u043E\u0431\u043B\u0430\u0441\u0442\u0438 \u0441\u043E\u0446\u0438\u043E\u043B\u043E\u0433\u0438\u0438 \u0438 \u043F\u0441\u0438\u0445\u043E\u043B\u043E\u0433\u0438\u0438, \u041F\u0430\u0430\u0442\u0430 \u0428\u0430\u043B\u0432\u043E\u0432\u0438\u0447 \u043F\u043E\u0441\u0432\u044F\u0442\u0438\u043B \u0441\u0432\u043E\u044E \u0436\u0438\u0437\u043D\u044C \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u044E \u0433\u0443\u043C\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u043E\u0434\u0445\u043E\u0434\u0430 \u0432 \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0438, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0441\u0435\u0433\u043E\u0434\u043D\u044F \u043D\u0430\u0445\u043E\u0434\u0438\u0442 \u043E\u0442\u043A\u043B\u0438\u043A \u0443 \u043F\u0435\u0434\u0430\u0433\u043E\u0433\u043E\u0432 \u043F\u043E \u0432\u0441\u0435\u043C\u0443 \u043C\u0438\u0440\u0443.",
                "\u0412 \u0441\u0432\u043E\u0435\u0439 \u0434\u043E\u043A\u0442\u043E\u0440\u0441\u043A\u043E\u0439 \u0434\u0438\u0441\u0441\u0435\u0440\u0442\u0430\u0446\u0438\u0438 \u043E\u043D \u0438\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043B \u0432\u043B\u0438\u044F\u043D\u0438\u0435 \u044D\u043C\u043E\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0432\u044F\u0437\u0438 \u043C\u0435\u0436\u0434\u0443 \u0443\u0447\u0438\u0442\u0435\u043B\u0435\u043C \u0438 \u0443\u0447\u0435\u043D\u0438\u043A\u043E\u043C \u043D\u0430 \u0430\u043A\u0430\u0434\u0435\u043C\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0443\u0441\u043F\u0435\u0432\u0430\u0435\u043C\u043E\u0441\u0442\u044C \u0438 \u0434\u043E\u043A\u0430\u0437\u0430\u043B \u0442\u043E, \u043E \u0447\u0451\u043C \u043C\u043D\u043E\u0433\u0438\u0435 \u0434\u043E\u0433\u0430\u0434\u044B\u0432\u0430\u043B\u0438\u0441\u044C \u0438\u043D\u0442\u0443\u0438\u0442\u0438\u0432\u043D\u043E: \u043B\u044E\u0431\u043E\u0432\u044C \u043A \u0443\u0447\u0438\u0442\u0435\u043B\u044E \u043D\u0430\u043F\u0440\u044F\u043C\u0443\u044E \u0432\u043B\u0438\u044F\u0435\u0442 \u043D\u0430 \u0431\u0430\u043B\u043B\u044B \u043D\u0430 \u044D\u043A\u0437\u0430\u043C\u0435\u043D\u0430\u0445."
            ]
        },
        3: {
            role: "\u0421\u043E\u0430\u0432\u0442\u043E\u0440",
            name: "\u041C\u043E\u0440\u0438\u0441 \u0428\u0430\u043A\u0430\u044F",
            bio: [
                "\u0421\u0435\u0440\u0438\u0439\u043D\u044B\u0439 \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044C \u0441 14-\u043B\u0435\u0442\u043D\u0438\u043C \u043E\u043F\u044B\u0442\u043E\u043C.",
                "\u0412 2012 \u0433\u043E\u0434\u0443 \u043D\u0430 \u0441\u044D\u043A\u043E\u043D\u043E\u043C\u043B\u0435\u043D\u043D\u044B\u0435 \u0434\u0435\u043D\u044C\u0433\u0438 \u043E\u0442\u043A\u0440\u044B\u043B \u0443\u044E\u0442\u043D\u043E\u0435 \u0431\u0435\u0439\u0433\u043B-\u043A\u0430\u0444\u0435 \u0441 \u0432\u0438\u0434\u043E\u043C \u043D\u0430 \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u0443\u044E \u0424\u043E\u043D\u0442\u0430\u043D\u043A\u0438. \u041A 2025 \u0433\u043E\u0434\u0443 \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u043B \u0431\u043E\u043B\u0435\u0435 25 \u043F\u0440\u043E\u0435\u043A\u0442\u043E\u0432 \u0438 \u0441\u043E\u0431\u0440\u0430\u043B \u043A\u043E\u043C\u0430\u043D\u0434\u0443 \u0438\u0437 800 \u0447\u0435\u043B\u043E\u0432\u0435\u043A. \u0421\u0430\u043C\u044B\u0439 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0438\u0437 \u043D\u0438\u0445 \u2014 \xab\u0425\u0430\u0447\u0430\u043F\u0443\u0440\u0438 \u0438 \u0432\u0438\u043D\u043E\xbb \u0432 \u041C\u043E\u0441\u043A\u0432\u0435, \u0421\u0430\u043D\u043A\u0442-\u041F\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433\u0435 \u0438 \u0421\u043E\u0447\u0438.",
                "\u041E\u043F\u044B\u0442 \u043F\u043E\u043A\u0430\u0437\u0430\u043B: \u043A\u043E\u043C\u0430\u043D\u0434\u0430, \u0434\u0435\u0439\u0441\u0442\u0432\u0443\u044E\u0449\u0430\u044F \u043A\u0430\u043A \u0435\u0434\u0438\u043D\u044B\u0439 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u043C, \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u0430 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u044C \u0440\u0435\u0448\u0435\u043D\u0438\u044F \u0434\u0430\u0436\u0435 \u0432 \u0441\u0430\u043C\u044B\u0435 \u0442\u0443\u0440\u0431\u0443\u043B\u0435\u043D\u0442\u043D\u044B\u0435 \u0432\u0440\u0435\u043C\u0435\u043D\u0430. \u0422\u0430\u043A \u043D\u0430\u0448\u0438 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u043F\u0440\u043E\u0448\u043B\u0438 \u0447\u0435\u0440\u0435\u0437 \u0440\u044F\u0434 \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0445 \u0438 \u0432\u043D\u0435\u0448\u043D\u0438\u0445 \u043A\u0440\u0438\u0437\u0438\u0441\u043E\u0432.",
                "\u041C\u043E\u044F \u0437\u0430\u0434\u0430\u0447\u0430 \u043A\u0430\u043A \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044F \u2014 \u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0441\u0440\u0435\u0434\u0443, \u0432 \u043A\u043E\u0442\u043E\u0440\u043E\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u044B \u043C\u043E\u0433\u0443\u0442 \u0440\u0430\u0441\u0442\u0438, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044F \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430, \u0431\u043B\u0430\u0433\u043E\u043F\u0440\u0438\u044F\u0442\u043D\u043E \u0432\u043B\u0438\u044F\u044E\u0449\u0435\u0433\u043E \u043D\u0430 \u043C\u0438\u0440. \u0427\u0435\u0440\u0435\u0437 \u0441\u043C\u0435\u043D\u0443 \u0440\u043E\u043B\u0435\u0439, \u0440\u0430\u0441\u043A\u0440\u044B\u0442\u0438\u0435 \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u043E\u0442\u0435\u043D\u0446\u0438\u0430\u043B\u0430, \u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0441\u0442\u044C \u0438 \u0436\u0438\u0432\u044B\u0435 \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044F \u0431\u0438\u0437\u043D\u0435\u0441 \u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0441\u044F \u0431\u043E\u043B\u0435\u0435 \u0433\u0443\u043C\u0430\u043D\u043D\u044B\u043C, \u0433\u0438\u0431\u043A\u0438\u043C \u0438 \u0443\u0441\u0442\u043E\u0439\u0447\u0438\u0432\u044B\u043C \u043A \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F\u043C. \u041C\u0435\u043D\u044F \u0443\u0432\u043B\u0435\u043A\u0430\u0435\u0442 \u0432\u0441\u0451, \u0447\u0442\u043E \u0441\u0432\u044F\u0437\u0430\u043D\u043E \u0441 \u0441\u043E\u0437\u043D\u0430\u043D\u0438\u0435\u043C. \u042F \u0438\u0449\u0443 \u043E\u0442\u0432\u0435\u0442\u044B \u0432 \u0441\u043E\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u043E \u0440\u0430\u0437\u043D\u044B\u0445 \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0430\u0445, \u0438 \u043C\u0435\u043D\u044F \u0432\u043E\u0441\u0445\u0438\u0449\u0430\u0435\u0442, \u043A\u0430\u043A\u0438\u0435 \u0440\u0430\u0437\u043D\u043E\u043E\u0431\u0440\u0430\u0437\u043D\u044B\u0435 \u0434\u043E\u0440\u043E\u0433\u0438 \u043A \u043D\u0438\u043C \u043F\u0440\u0438\u0432\u043E\u0434\u044F\u0442.",
                "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u043C\u043E\u044F \u0433\u043B\u0430\u0432\u043D\u0430\u044F \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0430 \u2014 \u044D\u0442\u043E \u0432\u043E\u0441\u043F\u0438\u0442\u0430\u043D\u0438\u0435 \u0434\u043E\u0447\u0435\u0440\u0438 \u0438 \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044F \u0441 \u0421\u0430\u043B\u043E\u043C\u0435, \u043C\u043E\u0435\u0439 \u0436\u0435\u043D\u043E\u0439. \u0423\u0447\u0443\u0441\u044C \u043D\u0435 \u0437\u0430\u0432\u0438\u0441\u0430\u0442\u044C \u0432 \u043C\u044B\u0441\u043B\u044F\u0445, \u043A\u043E\u0433\u0434\u0430 \u0434\u043E\u0447\u043A\u0430 \u0442\u044B\u0447\u0435\u0442 \u043F\u0430\u043B\u044C\u0446\u0435\u043C \u0432 \u0440\u043E\u0437\u0435\u0442\u043A\u0443."
            ]
        },
        4: {
            role: "\u0421\u043E\u0430\u0432\u0442\u043E\u0440",
            name: "\u041D\u0430\u0442\u0430\u0448\u0430 \u0429\u0435\u0434\u0440\u0438\u043D\u0430",
            bio: [
                "\u0418\u043D\u0442\u0435\u0440\u0435\u0441 \u0438 \u043B\u044E\u0431\u043E\u043F\u044B\u0442\u0441\u0442\u0432\u043E \u2014 \u043C\u043E\u0438 \u0433\u043B\u0430\u0432\u043D\u044B\u0435 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u0438 \u0432 \u0436\u0438\u0437\u043D\u0438. \u042F \u0432\u0441\u0435\u0433\u0434\u0430 \u0432\u044B\u0431\u0438\u0440\u0430\u044E \u043F\u0440\u043E\u0435\u043A\u0442\u044B \u0440\u0443\u043A\u043E\u0432\u043E\u0434\u0441\u0442\u0432\u0443\u044F\u0441\u044C \u043A\u0440\u0438\u0442\u0435\u0440\u0438\u0435\u043C: \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u043E \u0438\u043B\u0438 \u043D\u0435\u0442. \u0412\u043E\u0442 \u044D\u0442\u0430 \u0441\u0442\u0440\u0430\u0442\u0435\u0433\u0438\u044F \u2014 \xab\u0438\u0434\u0442\u0438 \u043D\u0430 \u0437\u043E\u0432\xbb \u2014 \u043F\u0440\u0438\u0432\u0435\u043B\u0430 \u043A \u0442\u043E\u043C\u0443, \u0447\u0442\u043E \u043C\u043D\u0435 \u043F\u043E\u0441\u0447\u0430\u0441\u0442\u043B\u0438\u0432\u0438\u043B\u043E\u0441\u044C \u043F\u043E\u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u0435\u0439\u0448\u0438\u0445 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0445 \u043F\u0440\u043E\u0435\u043A\u0442\u0430\u0445, \u0432\u0441\u0442\u0440\u0435\u0442\u0438\u0442\u044C \u043B\u044E\u0434\u0435\u0439, \u043E\u0431\u0449\u0435\u043D\u0438\u0435 \u0441 \u043A\u043E\u0442\u043E\u0440\u044B\u043C\u0438 \u043C\u0435\u043D\u044F\u0435\u0442. \u0418\u043C\u0435\u043D\u043D\u043E \u044D\u0442\u043E\u0442 \u043E\u043F\u044B\u0442 \u043E\u0431\u0449\u0435\u043D\u0438\u044F \u0441 \u043B\u044E\u0434\u044C\u043C\u0438 \u0443\u0432\u043B\u0435\u0447\u0451\u043D\u043D\u044B\u043C\u0438, \u0433\u043E\u0440\u044F\u0449\u0438\u043C\u0438 \u0441\u0432\u043E\u0438\u043C \u0434\u0435\u043B\u043E\u043C \u0441\u0447\u0438\u0442\u0430\u044E \u043E\u0434\u043D\u0438\u043C \u0438\u0437 \u0441\u0430\u043C\u044B\u0445 \u0446\u0435\u043D\u043D\u044B\u0445 \u043F\u043E\u0434\u0430\u0440\u043A\u043E\u0432 \u0432 \u0436\u0438\u0437\u043D\u0438.",
                "\u041C\u043E\u0438 \u043D\u0430\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u044F \u0438 \u043E\u043F\u044B\u0442 \u043F\u043E\u043A\u0430\u0437\u0430\u043B\u0438, \u0447\u0442\u043E \u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430\u044F \u0441\u0440\u0435\u0434\u0430 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u0430\u043C \u0438 \u043A\u043E\u043C\u0430\u043D\u0434\u0430\u043C \u0440\u0430\u0441\u0442\u0438 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u0435\u0435 \u0447\u0435\u0440\u0435\u0437 \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435. \u0421\u0435\u0439\u0447\u0430\u0441 \u043C\u043D\u0435 \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u043E \u0441\u043F\u0440\u043E\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u0430\u043A\u0443\u044E \u0441\u0440\u0435\u0434\u0443, \u0441\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u043E, \u0433\u0434\u0435 \u0447\u0435\u0440\u0435\u0437 \u043A\u043E\u043B\u043B\u0435\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u043E\u043F\u044B\u0442 \u0438 \u043C\u0435\u0442\u043E\u0434\u043E\u043B\u043E\u0433\u0438\u044E \u043C\u044B \u043C\u043E\u0433\u043B\u0438 \u0431\u044B \u043F\u043E\u043C\u043E\u0447\u044C \u0432\u044B\u0440\u0430\u0441\u0442\u0438\u0442\u044C \u0441\u0438\u043B\u044C\u043D\u044B\u0435 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043A\u043E\u043C\u0430\u043D\u0434\u044B.",
                "\u0417\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0430 \u0444\u0430\u043A\u0443\u043B\u044C\u0442\u0435\u0442 \u043F\u043E\u043B\u0438\u0442\u043E\u043B\u043E\u0433\u0438\u0438 \u0421\u041F\u0431\u0413\u0423. \u041A\u043E\u0433\u0434\u0430 \u043F\u043E\u0441\u0442\u0443\u043F\u0430\u043B\u0430 \u2014 \u043C\u044B \u0431\u044B\u043B\u0438 \u0447\u0430\u0441\u0442\u044C\u044E \u0444\u0438\u043B\u043E\u0441\u043E\u0444\u0441\u043A\u043E\u0433\u043E \u0444\u0430\u043A\u0443\u043B\u044C\u0442\u0435\u0442\u0430. \u0423\u0447\u0438\u043B\u0438\u0441\u044C \u0432 \u0441\u0442\u0430\u0440\u0435\u0439\u0448\u0435\u043C \u043A\u043E\u0440\u043F\u0443\u0441\u0435 \u043D\u0430 \u041C\u0435\u043D\u0434\u0435\u043B\u0435\u0435\u0432\u0441\u043A\u043E\u0439 \u043B\u0438\u043D\u0438\u0438, \u0434\u0435\u043B\u0438\u043B\u0438 \u0437\u0434\u0430\u043D\u0438\u0435 \u0441 \u0438\u0441\u0442\u043E\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u0444\u0430\u043A\u0443\u043B\u044C\u0442\u0435\u0442\u043E\u043C. \u0418 \u044D\u0442\u043E \u043D\u0435 \u043C\u043E\u0433\u043B\u043E \u043D\u0435 \u0441\u043A\u0430\u0437\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0435 \u2014 \u0444\u0438\u043B\u043E\u0441\u043E\u0444\u044B, \u0438\u0441\u0442\u043E\u0440\u0438\u043A\u0438 \u043F\u043E\u0434 \u043E\u0434\u043D\u043E\u0439 \u043A\u0440\u044B\u0448\u0435\u0439, \u043E\u0431\u043C\u0435\u043D \u043C\u043D\u0435\u043D\u0438\u044F\u043C\u0438 \u0438 \u0436\u0430\u0440\u043A\u0438\u0435 \u0441\u043F\u043E\u0440\u044B. \u0422\u0430 \u0441\u0440\u0435\u0434\u0430, \u043B\u044E\u0434\u0438, \u043C\u0435\u0436\u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0430\u0440\u043D\u043E\u0441\u0442\u044C \u043E\u043A\u0430\u0437\u0430\u043B\u0438 \u043E\u0433\u0440\u043E\u043C\u043D\u043E\u0435 \u0432\u043B\u0438\u044F\u043D\u0438\u0435 \u043D\u0430 \u043C\u043E\u0438 \u0432\u0437\u0433\u043B\u044F\u0434\u044B.",
                "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u044F \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u044E \u0434\u0435\u043B\u043E\u0432\u044B\u043C \u0441\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u043E\u043C Club First \u0432 \u041F\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433\u0435. \u041A\u043B\u0443\u0431 \u043E\u0431\u044A\u0435\u0434\u0438\u043D\u044F\u0435\u0442 900+ \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0438\u043A\u043E\u0432 \u0441\u0440\u0435\u0434\u043D\u0435\u0433\u043E \u0438 \u043A\u0440\u0443\u043F\u043D\u043E\u0433\u043E \u0431\u0438\u0437\u043D\u0435\u0441\u0430 \u043F\u043E \u0432\u0441\u0435\u0439 \u0441\u0442\u0440\u0430\u043D\u0435 \u0438 \u0437\u0430 \u0435\u0451 \u043F\u0440\u0435\u0434\u0435\u043B\u0430\u043C\u0438. \u0412\u043C\u0435\u0441\u0442\u0435 \u0441 \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044F\u043C\u0438 \u043C\u044B \u0444\u043E\u0440\u043C\u0438\u0440\u0443\u0435\u043C \u043A\u0443\u043B\u044C\u0442\u0443\u0440\u043D\u044B\u0439 \u043A\u043E\u0434 \u0440\u043E\u0441\u0441\u0438\u0439\u0441\u043A\u043E\u0433\u043E \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044C\u0441\u043A\u043E\u0433\u043E \u0441\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u0430, \u0432\u0441\u0442\u0440\u0435\u0447\u0430\u0435\u043C \u0432\u044B\u0437\u043E\u0432\u044B \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u043A\u0438, \u0444\u043E\u0440\u043C\u0438\u0440\u0443\u0435\u043C \u0438 \u0442\u0435\u0441\u0442\u0438\u0440\u0443\u0435\u043C \u0433\u0438\u043F\u043E\u0442\u0435\u0437\u044B, \u043A\u0430\u043A \u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0431\u0438\u0437\u043D\u0435\u0441 \u0434\u0430\u043B\u044C\u0448\u0435, \u043D\u0430\u0431\u043B\u044E\u0434\u0430\u0435\u043C \u0437\u0430 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u0435\u043C \u0442\u0440\u0435\u043D\u0434\u043E\u0432 \u0438 \u0441\u043E\u0437\u0434\u0430\u0451\u043C \u0441\u0432\u043E\u0438. \u0417\u0430 \u0432\u0440\u0435\u043C\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u043A\u043B\u0443\u0431\u0435 \u043C\u043D\u0435 \u043F\u043E\u0441\u0447\u0430\u0441\u0442\u043B\u0438\u0432\u0438\u043B\u043E\u0441\u044C \u043F\u0440\u043E\u0432\u0435\u0441\u0442\u0438 \u0431\u043E\u043B\u0435\u0435 \u0441\u043E\u0442\u043D\u0438 \u0433\u043B\u0443\u0431\u0438\u043D\u043D\u044B\u0445 \u0438\u043D\u0442\u0435\u0440\u0432\u044C\u044E \u0441 \u043E\u0434\u0438\u043E\u0437\u043D\u044B\u043C\u0438, \u0442\u0430\u043B\u0430\u043D\u0442\u043B\u0438\u0432\u044B\u043C\u0438, \u0441\u043C\u0435\u043B\u044B\u043C\u0438 \u043F\u0440\u0435\u0434\u043F\u0440\u0438\u043D\u0438\u043C\u0430\u0442\u0435\u043B\u044F\u043C\u0438, \u043F\u043E\u0443\u0447\u0430\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0432 \u0431\u0435\u0441\u0447\u0438\u0441\u043B\u0435\u043D\u043D\u043E\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0435 \u0440\u0430\u0431\u043E\u0447\u0438\u0445 \u0433\u0440\u0443\u043F\u043F, \u043D\u0435\u0442\u0432\u043E\u0440\u043A\u0438\u043D\u0433-\u0441\u0435\u0441\u0441\u0438\u0439.",
                "\u041C\u0435\u0436\u0434\u0443 \u044D\u0442\u0438\u043C\u0438 \u0434\u0432\u0443\u043C\u044F \u043E\u0442\u043C\u0435\u0442\u043A\u0430\u043C\u0438 \u043D\u0430 \xab\u043B\u0438\u043D\u0438\u0438 \u0436\u0438\u0437\u043D\u0438\xbb \u0431\u044B\u043B\u0438 \u0435\u0449\u0451 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u044B \u0432 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u0430\u0445 \u043C\u0435\u0436\u0434\u0443\u043D\u0430\u0440\u043E\u0434\u043D\u044B\u0445 \u0442\u0440\u0430\u043D\u0441\u043D\u0430\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0439 Bacardi \u0438 Philip Morris Intl., \u043E\u043F\u044B\u0442 \u0440\u0430\u0431\u043E\u0442\u044B \u043F\u0440\u0435\u0441\u0441-\u0441\u0435\u043A\u0440\u0435\u0442\u0430\u0440\u0451\u043C \u0432 \u0413\u0435\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u043E\u043C \u043A\u043E\u043D\u0441\u0443\u043B\u044C\u0441\u0442\u0432\u0435 \u0418\u0437\u0440\u0430\u0438\u043B\u044F, \u0440\u0430\u0431\u043E\u0442\u0430 \u0432 \u0437\u043E\u043D\u0435 \u043F\u0435\u0440\u0432\u044B\u0445 \u043B\u0438\u0446 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0430 \u043D\u0430 \u041A\u0443\u0431\u043A\u0435 \u041A\u043E\u043D\u0444\u0435\u0434\u0435\u0440\u0430\u0446\u0438\u0439 \u0432 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u0430\u0445 FIFA, \u0437\u0430\u043F\u0443\u0441\u043A \u0441 \u043A\u043B\u0430\u0441\u0441\u043D\u043E\u0439 \u043A\u043E\u043C\u0430\u043D\u0434\u043E\u0439 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0438 \u0441\u0430\u043C\u043E\u0433\u043E \u0437\u043D\u0430\u043A\u043E\u0432\u043E\u0433\u043E \u0434\u043B\u044F \u041F\u0435\u0442\u0435\u0440\u0431\u0443\u0440\u0433\u0430 \u0444\u0443\u0434\u043A\u043E\u0440\u0442\u0430 \u2014 \xab\u0412\u0430\u0441\u0438\u043B\u0435\u043E\u0441\u0442\u0440\u043E\u0432\u0441\u043A\u043E\u0433\u043E \u0420\u044B\u043D\u043A\u0430\xbb, \u0438 \u043C\u043D\u043E\u0433\u043E-\u043C\u043D\u043E\u0433\u043E \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u043E\u0433\u043E! \u041A\u0430\u0436\u0435\u0442\u0441\u044F, \u0435\u0441\u0442\u044C \u0447\u0435\u043C \u043F\u043E\u0434\u0435\u043B\u0438\u0442\u044C\u0441\u044F!"
            ]
        },
        5: {
            role: "\u0420\u0435\u0436\u0438\u0441\u0441\u0451\u0440 \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0442\u0440\u0435\u043A\u0430",
            name: "\u0412\u0438\u043A\u0442\u043E\u0440\u0438\u044F \u0413\u0440\u0435\u043A",
            bio: [
                "\u0410\u0432\u0442\u043E\u0440 \u0438 \u043F\u0440\u043E\u0432\u043E\u0434\u043D\u0438\u043A \u043F\u0435\u0440\u0444\u043E\u0440\u043C\u0430\u0442\u0438\u0432\u043D\u043E\u0439 \u0445\u043E\u0440\u043E\u0432\u043E\u0439 \u043F\u0440\u0430\u043A\u0442\u0438\u043A\u0438 \xab\u0445\u043E\u0440\u0445\u043E\u0440\xbb \u2014 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0430, \u043E\u0431\u044A\u0435\u0434\u0438\u043D\u044F\u044E\u0449\u0435\u0433\u043E \u0433\u043E\u043B\u043E\u0441, \u0442\u0435\u043B\u043E \u0438 \u043A\u043E\u043B\u043B\u0435\u043A\u0442\u0438\u0432\u043D\u043E\u0435 \u043F\u0435\u0440\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u0435.",
                "\u0421\u043E\u0437\u0434\u0430\u0451\u0442 \u043D\u0430 \u0441\u0442\u044B\u043A\u0435 \u0442\u0435\u0430\u0442\u0440\u0430, \u0440\u0438\u0442\u0443\u0430\u043B\u0430 \u0438 \u0442\u0435\u043B\u0435\u0441\u043D\u044B\u0445 \u043F\u0440\u0430\u043A\u0442\u0438\u043A, \u0438\u0441\u0441\u043B\u0435\u0434\u0443\u0435\u0442 \u0433\u043E\u043B\u043E\u0441 \u043A\u0430\u043A \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u043F\u0435\u0440\u0435\u0445\u043E\u0434\u0430 \u2014 \u043B\u0438\u0447\u043D\u043E\u0433\u043E, \u0432\u043E\u0437\u0440\u0430\u0441\u0442\u043D\u043E\u0433\u043E \u0438 \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u043E\u0433\u043E. \u041F\u043E\u0434\u0445\u043E\u0434 \u0412\u0438\u043A\u0442\u043E\u0440\u0438\u0438 \u043E\u0441\u043D\u043E\u0432\u0430\u043D \u043D\u0430 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u0438\u0438 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0442\u0435\u0430\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u043F\u044B\u0442\u0430, \u0445\u043E\u0440\u043E\u0432\u043E\u0439 \u0440\u0430\u0431\u043E\u0442\u044B \u0438 \u0430\u0432\u0442\u043E\u0440\u0441\u043A\u0438\u0445 \u043E\u0431\u0440\u044F\u0434\u043E\u0432\u044B\u0445 \u0444\u043E\u0440\u043C\u0430\u0442\u043E\u0432, \u0432 \u043A\u043E\u0442\u043E\u0440\u044B\u0445 \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0438 \u0441\u0442\u0430\u043D\u043E\u0432\u044F\u0442\u0441\u044F \u043D\u0435 \u0437\u0440\u0438\u0442\u0435\u043B\u044F\u043C\u0438, \u0430 \u0441\u043E\u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u0430\u043C\u0438 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u0430.",
                "\u041E\u0441\u043E\u0431\u043E\u0435 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0443\u0434\u0435\u043B\u044F\u0435\u0442\u0441\u044F \u043B\u0438\u0447\u043D\u044B\u043C \u043E\u0449\u0443\u0449\u0435\u043D\u0438\u044F\u043C \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A\u043E\u0432 - \u0438\u0445 \u0442\u0435\u043B\u0435\u0441\u043D\u043E\u0439 \u0432\u043A\u043B\u044E\u0447\u0451\u043D\u043D\u043E\u0441\u0442\u0438 \u0438 \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u0438 \u0441\u043B\u044B\u0448\u0430\u0442\u044C \u0441\u0435\u0431\u044F \u0438 \u0434\u0440\u0443\u0433\u0438\u0445.",
                "\u041C\u043E\u0451 \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u0442\u0432\u043E \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u043D\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0433\u043E\u043B\u043E\u0441\u0430 \u043A\u0430\u043A \u0436\u0438\u0432\u043E\u0433\u043E, \u043F\u0440\u0438\u0440\u043E\u0434\u043D\u043E\u0433\u043E \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u0430 \u2014 \u043D\u0435 \u0442\u043E\u043B\u044C\u043A\u043E \u044D\u0441\u0442\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E, \u043D\u043E \u0438 \u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E, \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0433\u043E \u043C\u0435\u043D\u044F\u0442\u044C \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0435 \u0441\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435 \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0436\u0438\u0437\u043D\u0438.",
                "\u0418\u0437 \u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043D\u043E\u0433\u043E - \u043B\u0435\u0442\u043E\u043C \u0436\u0438\u0432\u0443 \u043D\u0430 \u0431\u043E\u043B\u043E\u0442\u0435.",
                ''
            ]
        },
        6: {
            role: "\u0412\u0438\u0434\u0435\u043E\u0433\u0440\u0430\u0444",
            name: "\u041A\u0438\u0440\u0438\u043B\u043B \u041F\u0440\u043E\u043D\u0438\u043D",
            bio: [
                "\u041A\u0442\u043E \u044F?",
                "\u0420\u0435\u0436\u0438\u0441\u0441\u0451\u0440, \u0432\u0438\u0434\u0435\u043E\u0433\u0440\u0430\u0444, \u043E\u043F\u0435\u0440\u0430\u0442\u043E\u0440, \u0445\u0443\u0434\u043E\u0436\u043D\u0438\u043A, \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444? \u0411\u043B\u043E\u0433\u0435\u0440, \u043F\u0443\u0431\u043B\u0438\u043A\u0443\u044E\u0449\u0438\u0439 \u0436\u0438\u0432\u043E\u043F\u0438\u0441\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442? \u041F\u0440\u043E\u0449\u0435 \u2014 \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u0438\u0439 \u0447\u0435\u043B\u043E\u0432\u0435\u043A.",
                "\u0414\u043B\u044F \u043C\u0435\u043D\u044F \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u0442\u0432\u043E \u0432\u0441\u0435\u0433\u0434\u0430 \u0431\u044B\u043B\u043E \u0447\u0435\u043C-\u0442\u043E \u043E\u0431\u044B\u0434\u0435\u043D\u043D\u044B\u043C, \u044F \u043F\u0440\u043E\u0441\u0442\u043E \u0437\u0430\u043F\u0435\u0447\u0430\u0442\u043B\u0435\u0432\u0430\u043B \u043C\u0438\u0440. \u0421\u043B\u043E\u0432\u043D\u043E \u0441 \u0441\u0430\u043C\u043E\u0433\u043E \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0448\u0430\u0433\u0430 \u044F \u043E\u0449\u0443\u0449\u0430\u043B \u043F\u043E\u0442\u0440\u0435\u0431\u043D\u043E\u0441\u0442\u044C \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432\u0441\u0435 \u0441\u0430\u043C\u044B\u0435 \u0437\u0430\u043C\u0435\u0447\u0430\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043C\u043E\u043C\u0435\u043D\u0442\u044B \u043C\u043E\u0435\u0439 \u0436\u0438\u0437\u043D\u0438, \u043D\u0435 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u044F \u0438\u043C \u0440\u0430\u0437\u043C\u044B\u0432\u0430\u0442\u044C\u0441\u044F \u0432\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438, \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044F \u0438\u0445 \u0447\u0435\u0440\u0435\u0437 \u043A\u0430\u043C\u0435\u0440\u0443 \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430 (\u0438\u043B\u0438 \u043F\u043E\u0447\u0442\u0438 \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430).",
                "\u0412\u0441\u043A\u043E\u0440\u0435 \u044F \u0441\u0442\u0430\u043B \u0437\u0430\u043C\u0435\u0447\u0430\u0442\u044C, \u0447\u0442\u043E \u043C\u043E\u0438, \u043A\u0430\u0437\u0430\u043B\u043E\u0441\u044C \u0431\u044B \u043D\u0430\u0441\u0442\u043E\u043B\u044C\u043A\u043E \u0436\u0435 \u0431\u044B\u0442\u043E\u0432\u044B\u0435, \u043A\u0430\u043A \u043D\u0430\u0440\u0435\u0437\u043A\u0430 \u0431\u0430\u0442\u043E\u043D\u0430, \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u043B\u043E\u0434\u044B \u043D\u0440\u0430\u0432\u044F\u0442\u0441\u044F \u0438 \u0434\u0440\u0443\u0433\u0438\u043C \u043B\u044E\u0434\u044F\u043C \u0438 \u0432\u044B\u0441\u043E\u043A\u043E \u043E\u0446\u0435\u043D\u0438\u0432\u0430\u044E\u0442\u0441\u044F \u0438\u043C\u0438. \u041A\u0430\u043A \u044D\u0442\u043E..? \u041E\u043A\u0430\u0437\u0430\u043B\u043E\u0441\u044C, \u043C\u043E\u0439 \u0432\u0437\u0433\u043B\u044F\u0434 \u043D\u0430 \u0432\u0435\u0449\u0438 \u0438\u043C\u0435\u0435\u0442 \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044C? \u0418 \u044F \u043F\u043E\u043D\u044F\u043B \u2014 \u044F\u0432\u043B\u0435\u043D\u0438\u0435, \u0441\u043D\u044F\u0442\u043E\u0435 \u043A\u0430\u043C\u0435\u0440\u043E\u0439, \u043E\u0431\u043D\u0430\u0440\u0443\u0436\u0438\u0432\u0430\u0435\u0442 \u0432 \u0441\u0435\u0431\u0435 \u0442\u043E, \u0447\u0442\u043E \u0431\u0435\u0437 \u043A\u0430\u043C\u0435\u0440\u044B \u0432 \u043D\u0451\u043C \u043F\u043E\u043F\u0440\u043E\u0441\u0442\u0443 \u043D\u0435 \u0431\u044B\u043B\u043E \u0431\u044B \u0432\u0438\u0434\u043D\u043E.",
                "\u041F\u043E\u0442\u043E\u043C\u0443 \u044F \u043D\u0430\u0447\u0430\u043B \u043E\u0442\u0442\u0430\u0447\u0438\u0432\u0430\u0442\u044C \u0441\u0432\u043E\u0451 \u0432\u0438\u0434\u0435\u043D\u0438\u0435: \u0443\u0447\u0438\u043B\u0441\u044F \u0432\u0433\u043B\u044F\u0434\u044B\u0432\u0430\u0442\u044C\u0441\u044F \u0432 \u043F\u0440\u0435\u0434\u043C\u0435\u0442\u044B, \u043B\u044E\u0434\u0435\u0439, \u0441\u043E\u0431\u044B\u0442\u0438\u044F, \u0441\u0442\u0440\u0435\u043C\u0438\u043B\u0441\u044F \u043F\u043E\u043D\u044F\u0442\u044C \u0438\u0445 \u0441\u0443\u0442\u044C \xab\u0434\u043E \u043A\u043E\u043D\u0446\u0430\xbb, \u043F\u0435\u0440\u0435\u043D\u0438\u043C\u0430\u043B \u043E\u043F\u044B\u0442 \u0437\u0430\u0441\u043B\u0443\u0436\u0435\u043D\u043D\u044B\u0445 \u043C\u0430\u0441\u0442\u0435\u0440\u043E\u0432, \u0434\u0438\u0441\u0446\u0438\u043F\u043B\u0438\u043D\u0438\u0440\u0443\u044F \u0441\u0432\u043E\u0451 \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u0435 \u043A \u0438\u0441\u043A\u0443\u0441\u0441\u0442\u0432\u0443 \u0438 \u043A\u0443\u043B\u044C\u0442\u0443\u0440\u0435 \u0432 \u0446\u0435\u043B\u043E\u043C.",
                "\u041A 27-\u043C\u0438 \u0433\u043E\u0434\u0430\u043C \u043C\u043D\u0435 \u0434\u043E\u0432\u0435\u043B\u043E\u0441\u044C \u0441\u043E\u043F\u0440\u0438\u043A\u043E\u0441\u043D\u0443\u0442\u044C\u0441\u044F \u0441 \u0434\u0432\u0443\u043C\u044F \u0430\u0432\u0442\u043E\u0440\u0438\u0442\u0435\u0442\u043D\u044B\u043C\u0438 \u043A\u0438\u043D\u043E\u0448\u043A\u043E\u043B\u0430\u043C\u0438 \u041C\u043E\u0441\u043A\u0432\u044B: \u0412\u0413\u0418\u041A\u043E\u043C \u0438 \u041C\u0428\u041D\u041A, \u2014 \u043D\u043E \u043D\u0438 \u0432 \u043E\u0434\u043D\u043E\u0439 \u0438\u0437 \u043D\u0438\u0445 \u044F \u043D\u0435 \u0443\u0433\u043D\u0435\u0437\u0434\u0438\u043B\u0441\u044F. \u0422\u0435\u043C \u043D\u0435 \u043C\u0435\u043D\u0435\u0435, \u0438\u043C\u0435\u043D\u043D\u043E \u044D\u0442\u0438 \u0438\u043D\u0441\u0442\u0438\u0442\u0443\u0446\u0438\u0438 \u043F\u043E\u0437\u0432\u043E\u043B\u0438\u043B\u0438 \u043C\u043D\u0435 \u0434\u043E\u0432\u043E\u043B\u044C\u043D\u043E \u043E\u0431\u0448\u0438\u0440\u043D\u043E \u043E\u0432\u043B\u0430\u0434\u0435\u0442\u044C \u0442\u0435\u043E\u0440\u0438\u0435\u0439 \u043A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u043C\u0443\u0437\u044B\u043A\u0438, \u0436\u0438\u0432\u043E\u043F\u0438\u0441\u0438, \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438, \u0443\u0433\u043B\u0443\u0431\u043B\u0451\u043D\u043D\u043E \u0438\u0437\u0443\u0447\u0438\u0442\u044C \u043A\u0438\u043D\u0435\u043C\u0430\u0442\u043E\u0433\u0440\u0430\u0444.",
                "\u041D\u0435 \u0440\u0430\u0437 \u043C\u043D\u0435 \u0432\u044B\u043F\u0430\u0434\u0430\u043B\u0430 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u0441\u043D\u0438\u043C\u0430\u0442\u044C \u0438\u043C\u0438\u0434\u0436\u0435\u0432\u044B\u0435 \u0432\u0438\u0434\u0435\u043E\u0440\u0430\u0431\u043E\u0442\u044B \u0434\u043B\u044F \u0440\u0430\u0437\u043D\u044B\u0445 \u043A\u0440\u0443\u043F\u043D\u044B\u0445 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0439: \u043E\u0442 \u0437\u0430\u0432\u043E\u0434\u043E\u0432 \u0438 \u0444\u0430\u0431\u0440\u0438\u043A \u0434\u043E \u0441\u0430\u043B\u043E\u043D\u043E\u0432 \u043A\u0440\u0430\u0441\u043E\u0442\u044B. \u041F\u043E\u043C\u0438\u043C\u043E \u043F\u0440\u043E\u0447\u0435\u0433\u043E, \u0432 \u043C\u043E\u0451\u043C \u043F\u043E\u0441\u043B\u0443\u0436\u043D\u043E\u043C \u0441\u043F\u0438\u0441\u043A\u0435 \u0435\u0441\u0442\u044C \u0438 \u043F\u043E\u043B\u043D\u043E\u043C\u0435\u0442\u0440\u0430\u0436\u043D\u044B\u0439 \u0444\u0438\u043B\u044C\u043C, \u0441\u043D\u044F\u0442\u044B\u0439 \u043F\u0440\u0438 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0435 \u041C\u0438\u043D\u0438\u0441\u0442\u0435\u0440\u0441\u0442\u0432\u0430 \u041A\u0443\u043B\u044C\u0442\u0443\u0440\u044B, \u0432 \u043A\u043E\u0442\u043E\u0440\u043E\u043C \u044F \u0432\u044B\u0441\u0442\u0443\u043F\u0438\u043B \u0432 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0435 \u0441\u0446\u0435\u043D\u0430\u0440\u0438\u0441\u0442\u0430, \u0430 \u0433\u043B\u0430\u0432\u043D\u044B\u0435 \u0440\u043E\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u043D\u0438\u043B\u0438 \u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0435 \u0430\u043A\u0442\u0451\u0440\u044B \u0442\u0435\u0430\u0442\u0440\u0430 \u0438 \u043A\u0438\u043D\u043E. (\u0424\u0438\u043B\u044C\u043C \u0432\u044B\u0445\u043E\u0434\u0438\u0442 \u0432 \u043F\u0440\u043E\u043A\u0430\u0442 \u0432 2027 \u0433\u043E\u0434\u0443.)",
                "\u041D\u043E, \u0432 \u043A\u043E\u043D\u0446\u0435 \u043A\u043E\u043D\u0446\u043E\u0432, \u044D\u0442\u0438 \u0441\u0443\u0434\u044C\u0431\u043E\u043D\u043E\u0441\u043D\u044B\u0435 \u0432\u0438\u0440\u0430\u0436\u0438 \u043E\u043A\u0430\u0437\u0430\u043B\u0438\u0441\u044C \u0432\u0441\u0435\u0433\u043E \u043B\u0438\u0448\u044C \u0441\u0442\u0443\u043F\u0435\u043D\u044C\u043A\u0430\u043C\u0438 \u043A \u043C\u043E\u0435\u043C\u0443 \u043D\u044B\u043D\u0435\u0448\u043D\u0435\u043C\u0443 \u0438 \u0433\u043B\u0430\u0432\u043D\u043E\u043C\u0443 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\u043D\u043E\u043C\u0443 \u0440\u0435\u043C\u0435\u0441\u043B\u0443: \u0431\u043B\u043E\u0433\u0438\u043D\u0433\u0443. \u041C\u043D\u0435 \u043E\u0447\u0435\u043D\u044C \u043D\u0440\u0430\u0432\u0438\u0442\u0441\u044F \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0441 \u043F\u043E-\u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0435\u043C\u0443 \u0436\u0438\u0432\u044B\u043C\u0438, \u043C\u044B\u0441\u043B\u044F\u0449\u0438\u043C\u0438 \u043B\u044E\u0434\u044C\u043C\u0438, \u043E\u0431\u043C\u0435\u043D\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u0441 \u043D\u0438\u043C\u0438 \u0437\u043D\u0430\u043D\u0438\u044F\u043C\u0438, \u043F\u0440\u043E\u0441\u0442\u043E \u0431\u043E\u043B\u0442\u0430\u0442\u044C, \u043E\u0431\u0441\u0443\u0436\u0434\u0430\u044F \u043D\u0430\u0448\u0443 \u0440\u0430\u0437\u043D\u043E\u0446\u0432\u0435\u0442\u043D\u0443\u044E \u0436\u0438\u0437\u043D\u044C: \u043E\u0442 \u043D\u043E\u0432\u044B\u0445 \u043C\u0435\u043C\u0447\u0438\u043A\u043E\u0432 \u0432 Inst\u2019\u0435 \u0434\u043E \u0437\u0430\u043F\u044B\u043B\u0438\u0432\u0448\u0438\u0445\u0441\u044F \u043A\u043D\u0438\u0433 \u043D\u0430 \u043F\u043E\u043B\u043A\u0430\u0445. \u041A\u0430\u043A \u0438 \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u0442\u0432\u043E, \u043C\u043D\u0435 \u044D\u0442\u043E \u043D\u0430\u0441\u0442\u043E\u043B\u044C\u043A\u043E \u0436\u0435 \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E, \u043D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C \u0441\u0430\u043C \u0447\u0435\u043B\u043E\u0432\u0435\u043A.",
                "\u0414\u0443\u043C\u0430\u044E, \u0432\u044B\u0440\u0430\u0436\u0435\u043D\u0438\u0435, \u0443\u043F\u043E\u0442\u0440\u0435\u0431\u043B\u044F\u0435\u043C\u043E\u0435 \u043C\u043D\u043E\u0433\u0438\u043C\u0438 \u0438\u0437 \u043D\u0430\u0441 \u043F\u043E \u043F\u0440\u0438\u0435\u0437\u0434\u0435 \u0438\u0437 \u043F\u0443\u0442\u0435\u0448\u0435\u0441\u0442\u0432\u0438\u0439 \u2014 \xab\u043A\u0430\u043C\u0435\u0440\u0430 \u044D\u0442\u043E\u0433\u043E \u043D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u0451\u0442\xbb \u2014 \u0432\u0435\u0440\u043D\u0435\u0435 \u0431\u044B\u043B\u043E \u0431\u044B \u043F\u0435\u0440\u0435\u0444\u043E\u0440\u043C\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u0430\u043A: \xab\u043A\u0430\u043C\u0435\u0440\u0430 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0435\u0442 \u043B\u0438\u0448\u044C \u0441\u0430\u043C\u0443\u044E \u043C\u0430\u043B\u043E\u0441\u0442\u044C \u0442\u043E\u0433\u043E, \u0447\u0442\u043E \u044F \u0432\u0438\u0434\u0435\u043B \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0434\u0435\u043B\u0435\xbb. \u041D\u043E \u043A\u0430\u043C\u0435\u0440\u0430 \u2014 \u044D\u0442\u043E, \u043F\u0440\u0435\u0436\u0434\u0435 \u0432\u0441\u0435\u0433\u043E, \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442, \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u044F\u044E\u0449\u0438\u0439 \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u044C \u043E\u043F\u0438\u0441\u044B\u0432\u0430\u0442\u044C \u0441\u0430\u043C\u0443 \u0441\u0435\u0431\u044F. \u0418 \u0442\u043E, \u043A\u0430\u043A \u043C\u043D\u043E\u0433\u043E \u043C\u044B \u0441\u043C\u043E\u0433\u043B\u0438 \u0432\u043C\u0435\u0441\u0442\u0438\u0442\u044C \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u0432 \u043A\u0430\u0434\u0440, \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043D\u0435 \u043E\u0442 \u043A\u0430\u043C\u0435\u0440\u044B, \u0430 \u043E\u0442 \u043D\u0430\u0448\u0435\u0439 \u043E\u0441\u043E\u0437\u043D\u0430\u043D\u043D\u043E\u0441\u0442\u0438 \u0438 \u043F\u043E\u043D\u0438\u043C\u0430\u043D\u0438\u044F \u0442\u043E\u0433\u043E, \u0447\u0442\u043E \u043C\u044B \u0445\u043E\u0442\u0435\u043B\u0438 \u0441\u043D\u044F\u0442\u044C \u0438 \u0447\u0442\u043E \u0438\u043C\u0435\u043D\u043D\u043E \u0441\u043D\u0438\u043C\u0430\u0435\u043C \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0434\u0435\u043B\u0435: \u0436\u0438\u0432\u043E\u043F\u0438\u0441\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0442 \u043D\u0430\u0434 \u043C\u043E\u0440\u0435\u043C \u043C\u043E\u0436\u0435\u0442 \u0441\u0442\u0430\u0442\u044C \u0445\u043E\u043B\u043E\u0434\u043D\u044B\u043C \u043F\u044F\u0442\u043D\u043E\u043C \u043D\u0430 \u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0438, \u0430 \u043F\u0435\u0440\u0435\u043C\u043E\u0442\u0430\u043D\u043D\u0430\u044F \u0438\u0437\u043E\u043B\u0435\u043D\u0442\u043E\u0439 \u043D\u0430\u0441\u0442\u043E\u043B\u044C\u043D\u0430\u044F \u043B\u0430\u043C\u043F\u0430, \u043F\u043E\u043C\u0435\u0441\u0442\u0438\u0432\u0448\u0430\u044F\u0441\u044F \u0432 \u043A\u0430\u0434\u0440, \u043C\u043E\u0436\u0435\u0442 \u043D\u0430\u043F\u043E\u043C\u043D\u0438\u0442\u044C \u043D\u0430\u043C, \u043A\u0430\u043A \u0431\u044B\u043B\u043E \u0442\u0435\u043F\u043B\u043E \u0438 \u0443\u044E\u0442\u043D\u043E \u0432 \u0434\u0435\u0442\u0441\u0442\u0432\u0435 \u0432 \u0433\u043E\u0441\u0442\u044F\u0445 \u0443 \u0431\u0430\u0431\u0443\u0448\u043A\u0438.",
                "\u041E\u043F\u0442\u0438\u043C\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0442\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u0443\u0442\u0438 \u043D\u0435 \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442, \u0438 \u0432 \u044D\u0442\u043E\u043C \u0435\u0433\u043E \u0433\u043B\u0430\u0432\u043D\u0430\u044F \u0446\u0435\u043D\u043D\u043E\u0441\u0442\u044C. \u0414\u043E \u043A\u043E\u043D\u0446\u0430 \u043F\u043E\u043D\u044F\u0442\u044B\u0445 \u043B\u044E\u0434\u0435\u0439 \u0442\u043E\u0436\u0435, \u0438 \u044D\u0442\u043E \u043F\u0440\u0435\u043A\u0440\u0430\u0441\u043D\u043E, \u2014 \u043A\u0430\u0436\u0434\u043E\u043C\u0443 \u0441\u0432\u043E\u0451 \u043A\u0438\u043D\u043E!"
            ]
        },
        7: {
            role: 'Project-manager',
            name: "\u041C\u0430\u0440\u0438\u044F \u0421\u0430\u043B\u0438\u0447\u0435\u0432\u0430",
            bio: [
                "\u041C\u043E\u0439 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0442\u0440\u0435\u043A \u043D\u0430\u0447\u0430\u043B\u0441\u044F \u0441 \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u043E-\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0438\u0442\u0435\u0442\u0430. \u041A\u0430\u043A \u043D\u0438 \u0441\u0442\u0440\u0430\u043D\u043D\u043E, \u043D\u0435\u0441\u043C\u043E\u0442\u0440\u044F \u043D\u0430 \u0442\u043E, \u0447\u0442\u043E \u044F \u0443\u0436\u0435 \u043D\u0435 \u0437\u0430\u043D\u0438\u043C\u0430\u044E\u0441\u044C \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E\u043C, \u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u0435\u043A\u0440\u0430\u0441\u043D\u043E \u0432\u0441\u0442\u0440\u043E\u0438\u043B\u043E\u0441\u044C \u0432 \u043C\u043E\u044E \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u0434\u0435\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C \u2014 \u044F \u043B\u0435\u0433\u043A\u043E \u043E\u0440\u0438\u0435\u043D\u0442\u0438\u0440\u0443\u044E\u0441\u044C \u0432 \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0435 \u043F\u0440\u043E\u0435\u043A\u0442\u0430 \u0438 \u043C\u043E\u0433\u0443 \u0432\u044B\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0441 \u043D\u0443\u043B\u044F \u043C\u043D\u043E\u0433\u0438\u0435 \u043F\u0440\u043E\u0446\u0435\u0441\u0441\u044B.",
                "\u0417\u043D\u0430\u044E, \u0447\u0442\u043E \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E \u0430\u0431\u0441\u043E\u043B\u044E\u0442\u043D\u043E \u0432\u0441\u0451. \u0412 \u044D\u0442\u043E\u043C \u0441\u043C\u044B\u0441\u043B\u0435 \u0441\u0442\u0430\u0440\u0430\u044E\u0441\u044C \u043D\u0435 \u043E\u043F\u0438\u0440\u0430\u0442\u044C\u0441\u044F \u043D\u0430 \u043E\u043F\u044B\u0442, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0435\u0441\u0442\u044C \u0443 \u043C\u0435\u043D\u044F \u0438\u043B\u0438 \u0443 \u0434\u0440\u0443\u0433\u0438\u0445, \u0441\u043A\u043E\u0440\u0435\u0435 \u2014 \u0438\u0434\u0443 \u0437\u0430 \u043C\u0435\u0447\u0442\u043E\u0439. \u0427\u0430\u0441\u0442\u043E \u0432\u0441\u0451 \u043F\u043E\u043B\u0443\u0447\u0430\u0435\u0442\u0441\u044F, \u043F\u043E\u0440\u043E\u0439 \u2014 \u0434\u0430\u0436\u0435 \u043B\u0443\u0447\u0448\u0435, \u0447\u0435\u043C \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043B\u0430.",
                "\u0426\u0435\u043D\u044E \u0434\u043E\u0431\u0440\u044B\u0435 \u0438 \u0442\u0451\u043F\u043B\u044B\u0435 \u043E\u0442\u043D\u043E\u0448\u0435\u043D\u0438\u044F \u0432 \u043A\u043E\u043C\u0430\u043D\u0434\u0435, \u0441\u043F\u043E\u0441\u043E\u0431\u043D\u043E\u0441\u0442\u044C \u043F\u0440\u0438\u0439\u0442\u0438 \u043D\u0430 \u043F\u043E\u043C\u043E\u0449\u044C \u0438 \u043F\u043E\u0433\u043E\u0432\u043E\u0440\u0438\u0442\u044C \u043E\u0442\u043A\u0440\u044B\u0442\u043E, \u0435\u0441\u043B\u0438 \u0447\u0442\u043E-\u0442\u043E \u0438\u0434\u0451\u0442 \u043D\u0435 \u0442\u0430\u043A.",
                "\u041C\u043E\u044F \u043B\u044E\u0431\u043E\u0432\u044C \u043A \u043A\u043E\u043C\u043C\u0443\u043D\u0438\u043A\u0430\u0446\u0438\u0438 \u043D\u0430\u0448\u043B\u0430 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u0439 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0439 \u0434\u0435\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u0438 \u2014 \u0443\u0436\u0435 \u0432\u0442\u043E\u0440\u043E\u0439 \u0433\u043E\u0434 \u044F \u043F\u043E\u043C\u043E\u0433\u0430\u044E \u0440\u0430\u0437\u0432\u0438\u0432\u0430\u0442\u044C \u0434\u0435\u043B\u043E\u0432\u043E\u0435 \u0441\u043E\u043E\u0431\u0449\u0435\u0441\u0442\u0432\u043E ClubFirst. \u0422\u0432\u043E\u0440\u0447\u0435\u0441\u043A\u0430\u044F \u0438\u0434\u0435\u043D\u0442\u0438\u0447\u043D\u043E\u0441\u0442\u044C \u0432\u043E \u043C\u043D\u0435 \u043F\u0440\u043E\u044F\u0432\u0438\u043B\u0430\u0441\u044C \u0432 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u0438 \u0441\u0432\u043E\u0435\u0433\u043E \u0431\u0440\u0435\u043D\u0434\u0430 \u043F\u043B\u044F\u0436\u043D\u043E\u0439 \u043E\u0434\u0435\u0436\u0434\u044B, \u0430 \u0441\u0442\u0440\u0435\u043C\u043B\u0435\u043D\u0438\u0435 \u043A \u0441\u0442\u0440\u0443\u043A\u0442\u0443\u0440\u0435 \u0440\u0435\u0430\u043B\u0438\u0437\u0443\u0435\u0442\u0441\u044F \u0432 \u0440\u0430\u0431\u043E\u0442\u0435 \u043D\u0430\u0434 \u041A\u044D\u043C\u043F\u043E\u043C.",
                "\u041E\u0431\u043E\u0436\u0430\u044E \u0431\u0435\u0433, \u0433\u043E\u0440\u043D\u044B\u0439 \u0442\u0440\u0435\u043A\u0438\u043D\u0433, \u043E\u0431\u043E\u0448\u043B\u0430 \u0432\u0435\u0441\u044C \u041A\u0430\u0432\u043A\u0430\u0437, \u043E\u0434\u0438\u043D \u0438\u0437 \u043B\u044E\u0431\u0438\u043C\u044B\u0445 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u043E\u0432 \u2014 Via Ferrata \u0432 \u0421\u043E\u0447\u0438."
            ]
        }
    };
    let config = {
        ...DEFAULTS
    };
    let popup = null;
    let refs = {};
    let osInstance = null;
    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function renderBio(bio) {
        const paragraphs = bio.map((p)=>{
            const text = typeof p === 'string' ? escapeHtml(p) : `<span class="${config.boldClass}">${escapeHtml(p.bold)}</span>`;
            return `<p class="${config.bioParagraphClass}">${text}</p>`;
        });
        return paragraphs.join('');
    }
    function initScrollbar() {
        if (osInstance) {
            osInstance.destroy();
            osInstance = null;
        }
        if (typeof OverlayScrollbarsGlobal === 'undefined') return;
        const { OverlayScrollbars } = OverlayScrollbarsGlobal;
        setTimeout(()=>{
            osInstance = OverlayScrollbars(refs.text, config.scrollbarOptions);
        }, 10);
    }
    function fillPopup(id) {
        const data = teamData[id];
        if (!data) return false;
        if (refs.role) refs.role.textContent = data.role;
        if (refs.name) refs.name.textContent = data.name;
        if (refs.img) {
            refs.img.src = config.imgPathTpl.replace('{id}', id);
            refs.img.alt = data.name;
        }
        if (refs.text) refs.text.innerHTML = renderBio(data.bio);
        return true;
    }
    function handleCardClick(event) {
        const card = event.target.closest(config.cardSelector);
        if (!card || card.closest(config.popupSelector)) return;
        const id = card.id;
        if (!id || !teamData[id]) return;
        if (fillPopup(id)) setTimeout(()=>{
            if (window.Popup && typeof window.Popup.open === 'function') window.Popup.open(config.popupSelector);
            initScrollbar();
        }, 300);
    }
    function init(options = {}) {
        config = {
            ...DEFAULTS,
            ...options
        };
        popup = document.querySelector(config.popupSelector);
        if (!popup) return;
        refs = {
            role: popup.querySelector(config.roleSelector),
            name: popup.querySelector(config.nameSelector),
            img: popup.querySelector(config.imgSelector),
            text: popup.querySelector(config.textSelector)
        };
        document.addEventListener('click', handleCardClick);
    }
    return {
        init
    };
})();
window.TeamPopup = TeamPopup;
const FormSender = (()=>{
    const DEFAULTS = {
        formSelector: '.form form',
        submitBtnSelector: 'button[type="submit"]',
        endpoint: '/mail.php',
        submitText: "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443",
        sendingText: "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430...",
        successPopup: '.popup-thanks',
        resetOnSuccess: true
    };
    let config = {};
    let forms = [];
    let initialized = false;
    function getFormData(form) {
        const data = new FormData();
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach((input)=>{
            const name = input.name || input.placeholder || input.type;
            const value = input.value.trim();
            if (name && value) data.append(name, value);
        });
        return data;
    }
    function setLoading(form, loading) {
        const btn = form.querySelector(config.submitBtnSelector);
        if (!btn) return;
        btn.disabled = loading;
        btn.textContent = loading ? config.sendingText : config.submitText;
    }
    async function send(form) {
        const data = getFormData(form);
        const response = await fetch(config.endpoint, {
            method: 'POST',
            body: data
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    }
    function onSuccess(form) {
        if (config.resetOnSuccess) form.reset();
        if (window.Popup && typeof window.Popup.close === 'function') window.Popup.close();
        if (window.Popup && typeof window.Popup.open === 'function') window.Popup.open(config.successPopup);
    }
    function onError(error) {
        console.error("[FormSender] \u041E\u0448\u0438\u0431\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438:", error);
    }
    async function handleSubmit(event) {
        event.preventDefault();
        const form = event.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        setLoading(form, true);
        try {
            await send(form);
            onSuccess(form);
        } catch (error) {
            onError(error);
        } finally{
            setLoading(form, false);
        }
    }
    function bindEvents() {
        forms.forEach((form)=>form.addEventListener('submit', handleSubmit));
    }
    function unbindEvents() {
        forms.forEach((form)=>form.removeEventListener('submit', handleSubmit));
    }
    function init(options = {}) {
        config = {
            ...DEFAULTS,
            ...options
        };
        forms = Array.from(document.querySelectorAll(config.formSelector));
        if (!forms.length) {
            console.warn('[FormSender] No forms found.');
            return;
        }
        bindEvents();
        initialized = true;
    }
    function destroy() {
        if (!initialized) return;
        unbindEvents();
        forms = [];
        initialized = false;
    }
    return {
        init,
        destroy
    };
})();
window.FormSender = FormSender;
document.addEventListener('DOMContentLoaded', ()=>{
    SmoothScroll.init();
    Preloader.init();
    Parallax.init();
    AnchorScroll.init();
    ContactShowcase.init();
    BurgerMenu.init();
    Popup.init();
    ToggleWrapper.init();
    StickyCenterGrid.init();
    HeroBackground.init();
    TeamPopup.init();
    FormSender.init();
    const teamSlider = new Swiper('.team-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        mousewheel: {
            invert: false,
            forceToAxis: true
        },
        breakpoints: {
            641: {
                spaceBetween: 20
            }
        }
    });
    const teaserSlider = new Swiper('.teaser-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        mousewheel: {
            invert: false,
            forceToAxis: true
        },
        breakpoints: {
            1241: {
                spaceBetween: 0
            }
        }
    });
    const pricingSlider = new Swiper('.pricing-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        mousewheel: {
            invert: false,
            forceToAxis: true
        },
        breakpoints: {
            641: {
                spaceBetween: 0
            }
        }
    });
});
(function() {
    document.querySelectorAll('.js-phone-mask').forEach(function(el) {
        IMask(el, {
            mask: '+7 000 000 00 00'
        });
    });
})();
(function() {
    document.querySelectorAll('.faq-list input[type="checkbox"]').forEach((checkbox)=>{
        checkbox.addEventListener('change', function() {
            if (this.checked) document.querySelectorAll('.faq-list input[type="checkbox"]').forEach((cb)=>{
                if (cb !== this) cb.checked = false;
            });
        });
    });
})();

//# sourceMappingURL=vpole.ad8a82d9.js.map
