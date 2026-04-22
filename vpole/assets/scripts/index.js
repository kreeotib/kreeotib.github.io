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

const StickyCenterGrid = (() => {
    const DEFAULTS = {
        selector: '[data-sticky-grid]',
        stickySelector: '.grid__sticky',
        columnSelector: '.grid__column:not(.grid__sticky)',
        headerAttr: 'data-sticky-grid-header',
        defaultHeaderSelector: '.header',
    };

    let config = {...DEFAULTS};
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
        const {fixed, headerSelector} = entry;

        const vh = window.innerHeight;
        const headerH = getHeaderHeight(headerSelector);
        const fixedH = fixed.offsetHeight;
        const isTall = fixedH > vh;

        const top = isTall
            ? headerH
            : Math.max(0, (vh + headerH - fixedH) / 2);

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

        requestAnimationFrame(() => {
            rafPending = false;
            measureAll();
        });
    }

    function setupInstance(grid) {
        const fixed = grid.querySelector(config.stickySelector);
        const column = grid.querySelector(config.columnSelector);

        if (!fixed || !column) return;

        const headerSelector = grid.getAttribute(config.headerAttr) || config.defaultHeaderSelector;
        const entry = {grid, fixed, column, headerSelector};

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
            onLenisScroll = () => scheduleUpdate();
            lenis.on('scroll', onLenisScroll);
        } else {
            onWindowScroll = () => scheduleUpdate();
            window.addEventListener('scroll', onWindowScroll, {passive: true});
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
        config = {...DEFAULTS, ...options};

        const grids = document.querySelectorAll(config.selector);
        if (!grids.length) return;

        ro = new ResizeObserver(scheduleUpdate);

        grids.forEach(setupInstance);
        bindScroll();

        window.addEventListener('resize', onResize, {passive: true});

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

        instances.forEach(entry => {
            entry.fixed.style.removeProperty('--scg-top');
            entry.fixed.style.removeProperty('--scg-header-h');
            entry.fixed.style.removeProperty('--scg-fixed-h');
            entry.fixed.style.removeProperty('--scg-vh');
            entry.fixed.style.removeProperty('--scg-mode');
        });

        instances = [];
        initialized = false;
    }

    return {init, refresh, destroy};
})();

window.StickyCenterGrid = StickyCenterGrid;

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

const HeroBackground = (() => {
    const defaults = {
        selector: '[data-hero-bg]',
        videoClass: 'hero-bg__item hero-bg__item--video',
        readyClass: 'is-ready',
        idleTimeout: 2000,
        readyFallbackMs: 3000,
    };

    let config;
    config = {...defaults};
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
        if ('requestIdleCallback' in window) {
            idleHandle = window.requestIdleCallback(cb, {timeout: config.idleTimeout});
        } else {
            idleHandle = window.setTimeout(cb, 200);
        }
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

        const poster = videoPoster || (image && image.currentSrc) || '';
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
        if (p && typeof p.catch === 'function') {
            p.catch((err) => console.warn('[HeroBackground] play() rejected:', err));
        }
    }

    function mountVideo() {
        if (video || !videoSrc) return;

        video = createVideo();

        // canplay fires once the browser can begin playback — more reliable
        // than loadeddata for the autoplay path.
        video.addEventListener('canplay', markReady, {once: true});
        video.addEventListener('loadeddata', markReady, {once: true});
        video.addEventListener('error', (e) => {
            const err = video.error;
            const codes = {
                1: 'MEDIA_ERR_ABORTED — fetch aborted by user',
                2: 'MEDIA_ERR_NETWORK — network error while fetching',
                3: 'MEDIA_ERR_DECODE — decoding failed (corrupt/unsupported codec)',
                4: 'MEDIA_ERR_SRC_NOT_SUPPORTED — 404, wrong MIME, or format not supported',
            };
            console.error('[HeroBackground] video error:', {
                code: err && err.code,
                message: err && (codes[err.code] || err.message),
                src: video.currentSrc,
                networkState: video.networkState,
                readyState: video.readyState,
            });
            unmountVideo();
        }, {once: true});

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
        } catch (_) { /* noop */
        }
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
        config = {...defaults, ...options};

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
        return {root, image, video, mql, videoSrc, videoPoster, isInitialized};
    }

    return {init, destroy, get};
})();

window.HeroBackground = HeroBackground;


const Preloader = (() => {
    /* ------------------------------------------------------------------ */
    /*  Defaults                                                          */
    /* ------------------------------------------------------------------ */
    const defaults = {
        selector:        '.preloader',
        hiddenClass:     'preloader--hidden',
        lineSelector:    '.preloader-logo__line',
        wordSelector:    '.preloader-word',
        heroSelector:    '[data-hero-bg]',
        videoReadyClass: 'is-ready',

        /** Must match the CSS `animation-duration` on line + words (seconds). */
        animDuration: 100,

        /**
         * Critically-damped spring parameters (SmoothDamp).
         * smoothTime  — approximate seconds to reach the target.
         * maxSpeed    — clamp per-second velocity (prevents harsh jumps when
         *               several milestones resolve at once).
         */
        smoothTime: 0.9,
        maxSpeed:   0.28,

        /**
         * Display smoothing — a second-order filter that decouples the visual
         * scrub from the reactive spring.  Lower = silkier but laggier.
         * Value is the per-frame lerp factor normalised to 60 fps.
         */
        displaySmoothing: 0.045,

        /** Never close the preloader before this many ms have elapsed. */
        minShowMs: 1400,

        /** Extra pause after progress hits 1 before hiding (lets the eye settle). */
        hideDelayMs: 250,

        /** Cap progress until every milestone resolves (prevents premature 100 %). */
        softCap: 0.92,
    };

    /* ------------------------------------------------------------------ */
    /*  State                                                             */
    /* ------------------------------------------------------------------ */
    let config     = { ...defaults };
    let el         = null;   // .preloader
    let lineEl     = null;   // .preloader-logo__line  (owns --animation-delay)
    let words      = [];     // NodeList → Array of .preloader-word elements
    let progress   = 0;      // current rendered progress  (0 → 1)
    let displayProgress = 0; // second-order smoothed value — drives the visual scrub
    let target     = 0;      // where we're easing toward  (0 → 1)
    let velocity   = 0;      // current speed (units / s) — driven by the spring
    let lastFrameTs = 0;     // previous rAF timestamp for delta-time
    let rafId      = null;
    let startTs    = 0;
    let observer   = null;   // MutationObserver for hero video
    let videoEl    = null;   // cached reference once the <video> appears
    let isFinished = false;
    let isInitialized = false;

    /**
     * Milestones — each carries a weight and a partial value (0 → 1).
     * `done` locks the milestone at 1.
     */
    const milestones = {
        dom:   { weight: 0.08, done: false, partial: 0 },
        fonts: { weight: 0.07, done: false, partial: 0 },
        hero:  { weight: 0.55, done: false, partial: 0 },
        load:  { weight: 0.30, done: false, partial: 0 },
    };

    /* ------------------------------------------------------------------ */
    /*  Progress helpers                                                  */
    /* ------------------------------------------------------------------ */
    function allDone() {
        for (const k in milestones) if (!milestones[k].done) return false;
        return true;
    }

    function computeTarget() {
        let t = 0;
        for (const k in milestones) {
            const m = milestones[k];
            t += m.weight * (m.done ? 1 : m.partial);
        }
        // Soft-cap until every milestone has fully resolved.
        return allDone() ? Math.min(t, 1) : Math.min(t, config.softCap);
    }

    function resolve(key) {
        if (!milestones[key]) return;
        milestones[key].done    = true;
        milestones[key].partial = 1;
        target = computeTarget();
    }

    function partial(key, value) {
        if (!milestones[key] || milestones[key].done) return;
        milestones[key].partial = Math.max(milestones[key].partial, Math.min(value, 1));
        target = computeTarget();
    }

    /* ------------------------------------------------------------------ */
    /*  Scrubbing                                                         */
    /* ------------------------------------------------------------------ */

    /**
     * Word stagger map — each word fades in across a [start, end] slice of the
     * overall progress.  Wide, overlapping windows keep reveals gentle.
     */
    const wordWindows = [
        [0.01, 0.36],   // word 1
        [0.10, 0.50],   // word 2
        [0.22, 0.66],   // word 3
        [0.36, 0.80],   // word 4
        [0.50, 0.96],   // word 5
    ];

    /* ---- Easing helper ---- */

    /**
     * Quartic ease-out — gentler than cubic, with a much longer deceleration
     * tail.  Words drift into full opacity / zero blur instead of snapping.
     */
    function easeOutQuart(t) {
        const inv = 1 - t;
        return 1 - inv * inv * inv * inv;
    }

    function scrub(p) {
        // --- Line (::before receives the custom property) ---
        // No additional easing here — the two-stage smoothing (spring →
        // displayProgress lerp) already produces a silky curve.
        if (lineEl) {
            const delay = -(p * config.animDuration);
            lineEl.style.setProperty('--animation-delay', delay + 's');
        }

        // --- Words ---
        for (let i = 0; i < words.length; i++) {
            const win = wordWindows[i] || wordWindows[wordWindows.length - 1];
            const span = win[1] - win[0];
            const linear = Math.max(0, Math.min(1, (p - win[0]) / span));
            const eased  = easeOutQuart(linear);
            words[i].style.animationDelay     = -(eased * config.animDuration) + 's';
            words[i].style.animationPlayState  = 'paused';
        }
    }

    /* ------------------------------------------------------------------ */
    /*  Frame loop — critically-damped spring (SmoothDamp)                */
    /* ------------------------------------------------------------------ */

    /**
     * Attempt the same critically-damped spring that game engines use
     * (cf. Unity's Mathf.SmoothDamp).  It gives natural acceleration,
     * deceleration, and never overshoots — much softer than a raw lerp
     * when the target jumps suddenly.
     */
    function smoothDamp(current, tgt, dt) {
        const smoothTime = Math.max(0.0001, config.smoothTime);
        const omega  = 2 / smoothTime;
        const x      = omega * dt;
        const exp    = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

        let   change = current - tgt;
        const maxChange = config.maxSpeed * smoothTime;
        change = Math.max(-maxChange, Math.min(maxChange, change));

        const adjusted = current - change;
        const temp     = (velocity + omega * change) * dt;
        velocity       = (velocity - omega * temp) * exp;

        let result = adjusted + (change + temp) * exp;

        // Clamp & prevent overshooting past the target.
        if ((tgt - current > 0) === (result > tgt)) {
            result   = tgt;
            velocity = 0;
        }

        return result;
    }

    function tick(now) {
        if (isFinished) return;

        // Delta time in seconds, clamped to avoid spiral-of-death on tab switch.
        if (!lastFrameTs) lastFrameTs = now;
        const dt = Math.min((now - lastFrameTs) / 1000, 0.1);
        lastFrameTs = now;

        // --- First stage: spring drives `progress` toward `target` ---
        progress = smoothDamp(progress, target, dt);

        if (Math.abs(target - progress) < 0.0004 && Math.abs(velocity) < 0.001) {
            progress = target;
            velocity = 0;
        }

        // --- Second stage: display lerp absorbs remaining jitter ---
        // Normalise the per-frame factor to 60 fps so the feel is framerate-
        // independent.  `1 - (1 - k)^(dt*60)` is the standard trick.
        const k = 1 - Math.pow(1 - config.displaySmoothing, dt * 60);
        displayProgress += (progress - displayProgress) * k;

        // Snap display when it's essentially caught up.
        if (Math.abs(progress - displayProgress) < 0.0003) {
            displayProgress = progress;
        }

        scrub(displayProgress);

        if (progress >= 1 && allDone()) {
            finish();
            return;
        }

        rafId = requestAnimationFrame(tick);
    }

    /* ------------------------------------------------------------------ */
    /*  Finish & hide                                                     */
    /* ------------------------------------------------------------------ */
    function finish() {
        if (isFinished) return;
        isFinished = true;

        cancelAnimationFrame(rafId);
        rafId = null;

        // Make sure we're fully scrubbed to the end state.
        displayProgress = 1;
        scrub(1);

        // Respect minimum display time so fast loads still show the brand.
        const elapsed   = performance.now() - startTs;
        const remaining = Math.max(0, config.minShowMs - elapsed);

        setTimeout(() => {
            if (el) el.classList.add(config.hiddenClass);
            if (window.ScrollLock) ScrollLock.unlock();
            cleanUp();
        }, remaining + config.hideDelayMs);
    }

    /* ------------------------------------------------------------------ */
    /*  Hero-video monitoring                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Attach progress / ready listeners to the video element created by
     * HeroBackground.  Called once the <video> appears in the DOM.
     */
    function bindVideo(v) {
        if (videoEl) return;          // already bound
        videoEl = v;

        // Intermediate buffering progress.
        const onProgress = () => {
            try {
                if (!videoEl.duration || !videoEl.buffered.length) return;
                const buffered = videoEl.buffered.end(videoEl.buffered.length - 1);
                partial('hero', buffered / videoEl.duration);
            } catch (_) { /* buffered may throw if nothing loaded yet */ }
        };

        const onReady = () => {
            resolve('hero');
            videoEl.removeEventListener('progress', onProgress);
        };

        videoEl.addEventListener('progress',   onProgress);
        videoEl.addEventListener('canplay',     onReady, { once: true });
        videoEl.addEventListener('loadeddata',  onReady, { once: true });
        videoEl.addEventListener('error', () => {
            // Video failed — don't let it block the preloader forever.
            resolve('hero');
        }, { once: true });

        // If the video is *already* ready (cached / instant load).
        if (videoEl.readyState >= 3) {
            resolve('hero');
            return;
        }

        // Trickle: give a small initial bump once metadata arrives.
        videoEl.addEventListener('loadedmetadata', () => partial('hero', 0.15), { once: true });
    }

    /**
     * Watch the hero container for a <video> child to appear.
     * HeroBackground inserts the element lazily (requestIdleCallback),
     * so we can't query it synchronously.
     */
    function watchHero() {
        const heroRoot = document.querySelector(config.heroSelector);

        if (!heroRoot) {
            // No hero section at all — skip the milestone entirely.
            resolve('hero');
            return;
        }

        const videoSrc = heroRoot.dataset.videoSrc || '';
        const breakpoint = parseInt(heroRoot.dataset.breakpoint, 10) || 768;

        // On viewports below the breakpoint HeroBackground won't create a video.
        if (!videoSrc || window.innerWidth < breakpoint) {
            resolve('hero');
            return;
        }

        // Maybe HeroBackground already created it (race condition if our init is late).
        const existing = heroRoot.querySelector('video');
        if (existing) {
            bindVideo(existing);
            return;
        }

        // Otherwise observe child additions until the <video> appears.
        observer = new MutationObserver((mutations) => {
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (node.nodeName === 'VIDEO') {
                        bindVideo(node);
                        observer.disconnect();
                        observer = null;
                        return;
                    }
                }
            }
        });

        observer.observe(heroRoot, { childList: true });

        // Safety: if no video appears within 8 s, resolve anyway.
        setTimeout(() => {
            if (!milestones.hero.done) resolve('hero');
        }, 8000);
    }

    /* ------------------------------------------------------------------ */
    /*  Resource monitoring helpers                                       */
    /* ------------------------------------------------------------------ */
    function watchFonts() {
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(() => resolve('fonts')).catch(() => resolve('fonts'));
        } else {
            resolve('fonts');
        }
    }

    function watchWindowLoad() {
        if (document.readyState === 'complete') {
            resolve('load');
            return;
        }

        // Trickle sub-resource progress via PerformanceObserver when available.
        if (typeof PerformanceObserver !== 'undefined') {
            try {
                let counted = 0;
                const po = new PerformanceObserver((list) => {
                    counted += list.getEntries().length;
                    // Estimate: assume ~30 sub-resources is a "full" page.
                    partial('load', Math.min(counted / 30, 0.9));
                });
                po.observe({ type: 'resource', buffered: true });
                // Clean up after load.
                window.addEventListener('load', () => {
                    try { po.disconnect(); } catch (_) {}
                }, { once: true });
            } catch (_) { /* PerformanceObserver not supported — degrade gracefully */ }
        }

        window.addEventListener('load', () => resolve('load'), { once: true });
    }

    /* ------------------------------------------------------------------ */
    /*  Clean-up                                                          */
    /* ------------------------------------------------------------------ */
    function cleanUp() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        videoEl = null;
    }

    /* ------------------------------------------------------------------ */
    /*  Public API                                                        */
    /* ------------------------------------------------------------------ */
    function init(options) {
        if (isInitialized) return;
        config = { ...defaults, ...options };

        // Force the page to the top on every fresh load / transition.
        // Setting scrollRestoration beats the browser's own restore behaviour.
        if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);

        // Prevent the user from scrolling while the preloader is active.
        if (window.ScrollLock) ScrollLock.lock();

        el = document.querySelector(config.selector);
        if (!el) {
            if (window.ScrollLock) ScrollLock.unlock();
            return;
        }

        lineEl = el.querySelector(config.lineSelector);
        words  = Array.from(el.querySelectorAll(config.wordSelector));

        // Pause every word animation immediately so we can scrub them.
        words.forEach((w) => {
            w.style.animationPlayState = 'paused';
            w.style.animationDelay     = '0s';
        });

        // Start the clock.
        startTs = performance.now();

        // Resolve DOM milestone — if we're running, the DOM is clearly parsed.
        if (document.readyState !== 'loading') {
            resolve('dom');
        } else {
            document.addEventListener('DOMContentLoaded', () => resolve('dom'), { once: true });
        }

        watchFonts();
        watchHero();
        watchWindowLoad();

        // Kick off the render loop.
        rafId = requestAnimationFrame(tick);

        isInitialized = true;
    }

    function destroy() {
        if (!isInitialized) return;
        cancelAnimationFrame(rafId);
        rafId = null;
        cleanUp();
        if (window.ScrollLock) ScrollLock.unlock();
        velocity    = 0;
        displayProgress = 0;
        lastFrameTs = 0;
        el      = null;
        lineEl  = null;
        words   = [];
        isInitialized = false;
    }

    function get() {
        return {
            el, lineEl, words, progress, displayProgress, target, velocity,
            milestones: { ...milestones },
            isFinished, isInitialized,
        };
    }

    return { init, destroy, get };
})();

window.Preloader = Preloader;

const Parallax = (() => {
    const DEFAULTS = {
        selector: '.parallax',
        speed: 0.5,
        lerp: 1,
        maxScale: 1.2,
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

const AnchorScroll = (() => {
    const DEFAULTS = {
        linkSelector: 'a[href^="#"], [data-scroll-to]',
        targetAttr: 'data-scroll-to',
        offsetAttr: 'data-scroll-offset',
        durationAttr: 'data-scroll-duration',
        defaultOffset: 0,
        defaultDuration: 1.2,
        headerSelector: '.header',
        updateHash: true,
    };

    let config = {...DEFAULTS};
    let onClick = null;
    let initialized = false;

    function getHeaderOffset() {
        if (!config.headerSelector) return 0;
        const header = document.querySelector(config.headerSelector);
        return header ? header.offsetHeight : 0;
    }

    function resolveTarget(link) {
        const customSel = link.getAttribute(config.targetAttr);
        if (customSel) {
            return customSel === 'top' ? 'top' : document.querySelector(customSel);
        }
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
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            });
            return;
        }

        let y;
        if (target === 'top') {
            y = 0;
        } else if (typeof target === 'number') {
            y = target;
        } else if (target instanceof Element) {
            y = target.getBoundingClientRect().top + window.scrollY + offset;
        } else {
            return;
        }

        window.scrollTo({top: y, behavior: 'smooth'});
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
            duration: Number.isNaN(rawDuration) ? undefined : rawDuration,
        });

        if (config.updateHash) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#') && href.length > 1) {
                history.replaceState(null, '', href);
            }
        }
    }

    function init(options = {}) {
        if (initialized) return;
        config = {...DEFAULTS, ...options};

        onClick = handleClick;
        document.addEventListener('click', onClick);

        if (window.location.hash && window.location.hash.length > 1) {
            try {
                const target = document.querySelector(window.location.hash);
                if (target) {

                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => scrollTo(target));
                    });
                }
            } catch (e) {
            }
        }

        initialized = true;
    }

    function destroy() {
        if (!initialized) return;
        document.removeEventListener('click', onClick);
        onClick = null;
        initialized = false;
    }

    return {init, destroy, scrollTo};
})();

window.AnchorScroll = AnchorScroll;

const ContactShowcase = (() => {
    const DEFAULTS = {
        root: '.contact-showcase',
        itemSelector: '.contact-showcase__item',
        buttonSelector: '.contact-item__button',
        activeClass: 'contact-showcase__item--active',
        targetAttr: 'data-target',
        initialIndex: 0,
    };

    let config = {...DEFAULTS};
    let root = null;
    let items = [];
    let currentIndex = 0;
    let initialized = false;

    function setActive(index) {
        if (index < 0 || index >= items.length) return;
        items.forEach((item, i) => item.classList.toggle(config.activeClass, i === index));
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
        config = {...DEFAULTS, ...options};
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

    return {init, goTo, reset, destroy};
})();

window.ContactShowcase = ContactShowcase;

const BurgerMenu = (() => {
    const DEFAULTS = {
        burgerSelector: '.burger',
        menuSelector: '.mobile-menu',
        burgerActiveClass: 'burger--active',
        menuActiveClass: 'mobile-menu--active',
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


const TeamPopup = (() => {
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
            scrollbars: {},
        },
    };

    const teamData = {
        1: {
            role: 'Спикер',
            name: 'Алексей Семихатов',
            bio: [
                'Алексей Семихатов — доктор физико-математических наук, ведущий научный сотрудник Физического института им. П. Н. Лебедева РАН (ФИАН), ведущий программы «Вопрос науки» на телеканале «Россия-24» и один из самых ярких популяризаторов науки в России.',
                'Алексей принадлежит к редкому типу учёных, которые не просто делают открытия, но и умеют увлечь физикой аудиторию любого уровня. На своих выступлениях он стирает грань между сложной академической теорией и повседневной реальностью. Говорит ли он о квантовой механике, космологии или происхождении времени — его речь всегда безупречно структурирована, остроумна и лишена наукообразия.',
            ],
        },
        2: {
            role: 'Спикер',
            name: 'Паата Амонашвили',
            bio: [
                'Ведущий представитель философско-педагогического направления «Школа Жизни», последователь идей своего отца — академика Шалвы Амонашвили. Обладая фундаментальным образованием в области социологии и психологии, Паата Шалвович посвятил свою жизнь развитию гуманного подхода в образовании, который сегодня находит отклик у педагогов по всему миру.',
                'В своей докторской диссертации он исследовал влияние эмоциональной связи между учителем и учеником на академическую успеваемость и доказал то, о чём многие догадывались интуитивно: любовь к учителю напрямую влияет на баллы на экзаменах.',
            ],
        },
        3: {
            role: 'Founder',
            name: 'Морис Шакая',
            bio: [
                'Серийный предприниматель с 14-летним опытом.',
                'В 2012 году на сэкономленные деньги открыл уютное бейгл-кафе с видом на набережную Фонтанки. К 2025 году запустил более 25 проектов и собрал команду из 800 человек. Самый известный из них — «Хачапури и вино» в Москве, Санкт-Петербурге и Сочи.',
                'Опыт показал: команда, действующая как единый организм, способна находить решения даже в самые турбулентные времена. Так наши компании успешно прошли через ряд внутренних и внешних кризисов.',
                'Моя задача как предпринимателя — создавать среду, в которой команды могут расти, сохраняя качество продукта, благоприятно влияющего на мир. Через смену ролей, раскрытие творческого потенциала, ответственность и живые отношения бизнес становится более гуманным, гибким и устойчивым к изменениям. Меня увлекает всё, что связано с сознанием. Я ищу ответы в совершенно разных дисциплинах, и меня восхищает, какие разнообразные дороги к ним приводят.',
                'Сегодня моя главная практика — это воспитание дочери и отношения с Саломе, моей женой. Учусь не зависать в мыслях, когда дочка тычет пальцем в розетку.',
            ],
        },
        4: {
            role: 'Co-founder',
            name: 'Наташа Щедрина',
            bio: [
                'Интерес и любопытство — мои главные двигатели в жизни. Я всегда выбираю проекты руководствуясь критерием: интересно или нет. Вот эта стратегия — «идти на зов» — привела к тому, что мне посчастливилось поучаствовать в интереснейших международных проектах, встретить людей, общение с которыми меняет. Именно этот опыт общения с людьми увлечёнными, горящими своим делом считаю одним из самых ценных подарков в жизни.',
                'Мои наблюдения и опыт показали, что правильная среда позволяет профессионалам и командам расти быстрее и качественнее через взаимодействие. Сейчас мне особенно интересно спроектировать такую среду, сообщество, где через коллективный опыт и методологию мы могли бы помочь вырастить сильные самостоятельные команды.',
                'Закончила факультет политологии СПбГУ. Когда поступала — мы были частью философского факультета. Учились в старейшем корпусе на Менделеевской линии, делили здание с историческим факультетом. И это не могло не сказаться на атмосфере — философы, историки под одной крышей, обмен мнениями и жаркие споры. Та среда, люди, междисциплинарность оказали огромное влияние на мои взгляды.',
                'Сегодня я управляю деловым сообществом Club First в Петербурге. Клуб объединяет 900+ собственников среднего и крупного бизнеса по всей стране и за её пределами. Вместе с предпринимателями мы формируем культурный код российского предпринимательского сообщества, встречаем вызовы экономики, формируем и тестируем гипотезы, как строить бизнес дальше, наблюдаем за развитием трендов и создаём свои. За время работы в клубе мне посчастливилось провести более сотни глубинных интервью с одиозными, талантливыми, смелыми предпринимателями, поучаствовать в бесчисленном количестве рабочих групп, нетворкинг-сессий.',
                'Между этими двумя отметками на «линии жизни» были ещё креативные проекты в интересах международных транснациональных компаний Bacardi и Philip Morris Intl., опыт работы пресс-секретарём в Генеральном консульстве Израиля, работа в зоне первых лиц государства на Кубке Конфедераций в интересах FIFA, запуск с классной командой первого и самого знакового для Петербурга фудкорта — «Василеостровского Рынка», и много-много интересного! Кажется, есть чем поделиться!',
            ],
        },
        5: {
            role: 'Режиссёр творческого трека',
            name: 'Виктория Грек',
            bio: ['Добавится чуть позже.'],
        },
        6: {
            role: 'Видеограф',
            name: 'Кирилл Пронин',
            bio: [
                'Кто я?',
                'Режиссёр, видеограф, оператор, художник, фотограф? Блогер, публикующий живописный контент? Проще — творческий человек.',
                'Для меня творчество всегда было чем-то обыденным, я просто запечатлевал мир. Словно с самого первого шага я ощущал потребность фиксировать все самые замечательные моменты моей жизни, не позволяя им размываться во времени, сохраняя их через камеру навсегда (или почти навсегда).',
                'Вскоре я стал замечать, что мои, казалось бы настолько же бытовые, как нарезка батона, творческие плоды нравятся и другим людям и высоко оцениваются ими. Как это..? Оказалось, мой взгляд на вещи имеет ценность? И я понял — явление, снятое камерой, обнаруживает в себе то, что без камеры в нём попросту не было бы видно.',
                'Потому я начал оттачивать своё видение: учился вглядываться в предметы, людей, события, стремился понять их суть «до конца», перенимал опыт заслуженных мастеров, дисциплинируя своё отношение к искусству и культуре в целом.',
                'К 27-ми годам мне довелось соприкоснуться с двумя авторитетными киношколами Москвы: ВГИКом и МШНК, — но ни в одной из них я не угнездился. Тем не менее, именно эти институции позволили мне довольно обширно овладеть теорией классической музыки, живописи, фотографии, углублённо изучить кинематограф.',
                'Не раз мне выпадала возможность снимать имиджевые видеоработы для разных крупных компаний: от заводов и фабрик до салонов красоты. Помимо прочего, в моём послужном списке есть и полнометражный фильм, снятый при поддержке Министерства Культуры, в котором я выступил в качестве сценариста, а главные роли исполнили известные актёры театра и кино. (Фильм выходит в прокат в 2027 году.)',
                'Но, в конце концов, эти судьбоносные виражи оказались всего лишь ступеньками к моему нынешнему и главному креативному ремеслу: блогингу. Мне очень нравится взаимодействовать с по-настоящему живыми, мыслящими людьми, обмениваться с ними знаниями, просто болтать, обсуждая нашу разноцветную жизнь: от новых мемчиков в Inst’е до запылившихся книг на полках. Как и творчество, мне это настолько же необходимо, необходим сам человек.',
                'Думаю, выражение, употребляемое многими из нас по приезде из путешествий — «камера этого не передаёт» — вернее было бы переформулировать так: «камера показывает лишь самую малость того, что я видел на самом деле». Но камера — это, прежде всего, инструмент, предоставляющий реальности возможность описывать саму себя. И то, как много мы смогли вместить реальности в кадр, зависит не от камеры, а от нашей осознанности и понимания того, что мы хотели снять и что именно снимаем на самом деле: живописный закат над морем может стать холодным пятном на фотографии, а перемотанная изолентой настольная лампа, поместившаяся в кадр, может напомнить нам, как было тепло и уютно в детстве в гостях у бабушки.',
                'Оптимального творческого пути не существует, и в этом его главная ценность. До конца понятых людей тоже, и это прекрасно, — каждому своё кино!',
            ],
        },
        7: {
            role: 'Project-manager',
            name: 'Мария Саличева',
            bio: [
                'Мой профессиональный трек начался с архитектурно-строительного университета. Как ни странно, несмотря на то, что я уже не занимаюсь строительством, образование прекрасно встроилось в мою текущую деятельность — я легко ориентируюсь в архитектуре проекта и могу выстроить с нуля многие процессы.',
                'Знаю, что возможно абсолютно всё. В этом смысле стараюсь не опираться на опыт, который есть у меня или у других, скорее — иду за мечтой. Часто всё получается, порой — даже лучше, чем планировала.',
                'Ценю добрые и тёплые отношения в команде, способность прийти на помощь и поговорить открыто, если что-то идёт не так.',
                'Моя любовь к коммуникации нашла отражение в текущей профессиональной деятельности — уже второй год я помогаю развивать деловое сообщество ClubFirst. Творческая идентичность во мне проявилась в создании своего бренда пляжной одежды, а стремление к структуре реализуется в работе над Кэмпом.',
                'Обожаю бег, горный трекинг, обошла весь Кавказ, один из любимых маршрутов — Via Ferrata в Сочи.',
            ],
        },
    };
    let config = {...DEFAULTS};
    let popup = null;
    let refs = {};
    let osInstance = null;

    function escapeHtml(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderBio(bio) {
        const paragraphs = bio.map(p => {
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

        const {OverlayScrollbars} = OverlayScrollbarsGlobal;

        setTimeout(() => {
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

        if (refs.text) {
            refs.text.innerHTML = renderBio(data.bio);
        }

        return true;
    }

    function handleCardClick(event) {
        const card = event.target.closest(config.cardSelector);
        if (!card || card.closest(config.popupSelector)) return;

        const id = card.id;
        if (!id || !teamData[id]) return;

        if (fillPopup(id)) {
            if (window.Popup && typeof window.Popup.open === 'function') {
                window.Popup.open(config.popupSelector);
            }

            initScrollbar();
        }
    }

    function init(options = {}) {
        config = {...DEFAULTS, ...options};
        popup = document.querySelector(config.popupSelector);

        if (!popup) return;

        refs = {
            role: popup.querySelector(config.roleSelector),
            name: popup.querySelector(config.nameSelector),
            img: popup.querySelector(config.imgSelector),
            text: popup.querySelector(config.textSelector),
        };

        document.addEventListener('click', handleCardClick);
    }

    return {init};
})();

window.TeamPopup = TeamPopup;

document.addEventListener('DOMContentLoaded', () => {
    Preloader.init();
    SmoothScroll.init();
    Parallax.init();
    AnchorScroll.init();
    ContactShowcase.init();
    BurgerMenu.init();
    Popup.init();
    ToggleWrapper.init();
    StickyCenterGrid.init();
    HeroBackground.init();
    TeamPopup.init()


    const teamSlider = new Swiper('.team-slider', {
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

    const teaserSlider = new Swiper('.teaser-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        mousewheel: {
            invert: false,
            forceToAxis: true,
        },
        breakpoints: {
            1241: {
                spaceBetween: 0,
            }
        }
    });

    const pricingSlider = new Swiper('.pricing-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        mousewheel: {
            invert: false,
            forceToAxis: true,
        },
        breakpoints: {
            641: {
                spaceBetween: 0,
            }
        }
    });
});

(function () {
    document.addEventListener('submit', (e) => {
        e.preventDefault();
        window.Popup.open('.popup-thanks');
    });
})();

(function () {
    document.querySelectorAll('.js-phone-mask').forEach(function (el) {
        IMask(el, {
            mask: '+7 000 000 00 00',
        });
    });
})();

(function () {
    document.querySelectorAll('.faq-list input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {

                document.querySelectorAll('.faq-list input[type="checkbox"]').forEach(cb => {
                    if (cb !== this) cb.checked = false;
                });
            }
        });
    });
})();
