class CounterAnimator {
    constructor(options = {}) {
        this.options = { threshold: 0.3, rootMargin: '0px', ...options };
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

    animateCounter(element, start, rawEnd, duration = 1500, delay = 0) {
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

                    const heroOpacity = 1 - this.norm(progress, 0.7, 1.0);
                    this.hero.style.opacity = heroOpacity;

                    this.hero.style.setProperty('--p',  p.toFixed(4));
                    this.hero.style.setProperty('--grad-opacity', gradOpacity.toFixed(4));
                    this.hero.style.setProperty('--sy', localScroll.toFixed(0) + 'px');

                    if (this.content) {
                        const maxRise = vh * 4;
                        gsap.set(this.content, {
                            y: -((textRise / 2.2) * maxRise),
                            opacity: textOpacity
                        });
                    }
                }
            }
        });
    }

    initProject() {
        if (!this.bg) return;

        const speed = 0.35;
        const extra = 1 + speed;

        gsap.set(this.bg, {
            height: `${extra * 100}%`,
            top: `-${speed * 100}%`,
            willChange: 'transform',
        });

        const media = this.bg.querySelector('video, img');
        if (media) {
            gsap.set(media, {
                width: '100%',
                height: '100%',
                objectFit: 'cover',
            });
        }

        gsap.to(this.bg, {
            yPercent: speed * 100,
            ease: 'none',
            scrollTrigger: {
                trigger: this.track,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                invalidateOnRefresh: true,
            },
        });
    }

    static norm(value, inMin, inMax) {
        return Math.max(0, Math.min((value - inMin) / (inMax - inMin), 1));
    }

    norm(value, inMin, inMax) {
        return HeroAccelerator.norm(value, inMin, inMax);
    }
}


const TitleReveal = (() => {
    const CFG = { sweepIn: 1040, sweepOut: 640, stagger: 220, rootMargin: '0px 0px -30% 0px' };

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
                    if (elapsed < 0) { bar._raf = requestAnimationFrame(tick); return; }

                    const p = Math.min(elapsed / CFG.sweepIn, 1);
                    bar.style.transformOrigin = 'left center';
                    bar.style.transform = `scaleX(${eio(p)})`;

                    if (p < 1) { bar._raf = requestAnimationFrame(tick); return; }
                    phase = 'out';
                    t1 = ts;
                }

                if (phase === 'out') {
                    const p2 = Math.min((ts - t1) / CFG.sweepOut, 1);
                    bar.style.transformOrigin = 'right center';
                    bar.style.transform = `scaleX(${1 - eio(p2)})`;

                    if (p2 < 1) { bar._raf = requestAnimationFrame(tick); return; }
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

            const testWidth = probe.scrollWidth;

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
            if (b._raf) { cancelAnimationFrame(b._raf); b._raf = null; }
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
        }, { rootMargin: CFG.rootMargin });

        els.forEach(el => io.observe(el));
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { init, play, reset, build };
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
                fadeEffect: { crossFade: true, disableOnInteraction: false },
                pagination: {
                    el: '.geo-slider__pagination',
                    type: 'bullets',
                    horizontalClass: 'slider__pagination',
                    bulletClass: 'geo-slider__bullet',
                    bulletActiveClass: 'geo-slider__bullet--active',
                },
                autoplay: { delay: 8000, disableOnInteraction: false },
                on: {
                    init() {
                        const total = geoSlider.params.autoplay.delay + geoSlider.params.speed;
                        geoSliderElement.style.setProperty('--swiper-autoplay-delay', total + 'ms');
                        geoSlider.autoplay.stop();
                    },
                    slideChangeTransitionStart() {
                        const revealEl = geoSlider.slides[geoSlider.activeIndex].querySelector('[data-reveal]');
                        if (revealEl) { TitleReveal.reset(revealEl); TitleReveal.play(revealEl); }
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
            }, { threshold: 0.3, rootMargin: '0px 0px -35% 0px' }).observe(geoSliderElement);
        }
    } catch (e) { console.error('geoSlider error:', e); }

    try {
        const principlesSliderElement = document.querySelector('.principles');
        if (principlesSliderElement) {
            new Swiper(principlesSliderElement, {
                slidesPerView: 'auto',
                spaceBetween: 24,
                speed: 500,
                breakpoints: { 768: { spaceBetween: 0 } },
                pagination: {
                    el: '.principles-pagination',
                    type: 'bullets',
                    horizontalClass: 'slider__pagination',
                    bulletClass: 'slider-pagination__bullet',
                    bulletActiveClass: 'slider-pagination__bullet--active',
                },
            });
        }
    } catch (e) { console.error('principlesSlider error:', e); }

    try {
        const levelsSliderElement = document.querySelector('.levels');
        if (levelsSliderElement && window.innerWidth < 768) {
            new Swiper(levelsSliderElement, {
                slidesPerView: 'auto',
                spaceBetween: 24,
                speed: 500,
                breakpoints: { 768: { spaceBetween: 0 } },
                pagination: {
                    el: '.levels-pagination',
                    type: 'bullets',
                    horizontalClass: 'slider__pagination',
                    bulletClass: 'slider-pagination__bullet',
                    bulletActiveClass: 'slider-pagination__bullet--active',
                },
            });
        }
    } catch (e) { console.error('levelsSlider error:', e); }

    try {
        const projectSliderElement = document.querySelector('.project-slider');
        if (projectSliderElement) {
            new Swiper(projectSliderElement, {
                slidesPerView: 'auto',
                spaceBetween: 24,
                speed: 500,
                navigation: {
                    prevEl: '.project-slider-button-prev',
                    nextEl: '.project-slider-button-next'
                }
            });
        }
    } catch (e) { console.error('projectSlider error:', e); }
}


function initCards() {
    try {
        document.querySelectorAll('.project-item, .card').forEach((card, index) => {
            const video = card.querySelector('video');
            const imgWrapper = card.querySelector('.card__video') || card.querySelector('.project-item__img');
            if (!video || !imgWrapper) return;

            video.muted = true;
            video.loop = false;
            let playPromise = null;

            if (card.classList.contains('card--level')) {
                let fadeTimeout = null;

                const startVideo = async () => {
                    if (fadeTimeout) clearTimeout(fadeTimeout);
                    imgWrapper.classList.remove('fade-to-poster');
                    imgWrapper.classList.add('hover');
                    video.currentTime = 0;
                    try {
                        playPromise = video.play();
                        await playPromise;
                    } catch (e) {}
                };

                const stopVideo = async () => {
                    if (playPromise) {
                        try { await playPromise; } catch (e) {}
                    }
                    video.pause();
                    imgWrapper.classList.add('fade-to-poster');
                    fadeTimeout = setTimeout(() => {
                        imgWrapper.classList.remove('hover', 'fade-to-poster');
                    }, 400);
                };

                card.addEventListener('mouseenter', startVideo);
                card.addEventListener('mouseleave', stopVideo);
                card.addEventListener('touchstart', () => {
                    imgWrapper.classList.contains('hover') ? stopVideo() : startVideo();
                }, { passive: true });

            } else {
                let animationFrame = null;
                video.loop = true;

                const playReverse = () => {
                    if (video.currentTime <= 0) {
                        cancelAnimationFrame(animationFrame);
                        imgWrapper.classList.remove('hover');
                        return;
                    }
                    video.currentTime = Math.max(0, video.currentTime - 0.05);
                    animationFrame = requestAnimationFrame(playReverse);
                };

                card.addEventListener('mouseenter', async () => {
                    if (animationFrame) cancelAnimationFrame(animationFrame);
                    imgWrapper.classList.add('hover');
                    try {
                        playPromise = video.play();
                        await playPromise;
                    } catch (e) {}
                });

                card.addEventListener('mouseleave', async () => {
                    if (playPromise) {
                        try { await playPromise; } catch (e) {}
                    }
                    video.pause();
                    playReverse();
                });

                card.addEventListener('touchstart', () => {
                    video.paused ? card.dispatchEvent(new Event('mouseenter')) : card.dispatchEvent(new Event('mouseleave'));
                }, { passive: true });
            }
        });
    } catch (e) {}
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

            marquee.appendChild(marqueeContent.cloneNode(true));

            let position = 0;
            let scrollSpeed = 0;
            let lastScrollTop = 0;

            let isDragging = false;
            let dragVelocity = 0;
            let lastMouseX = 0;
            const targetAutoSpeed = 1;

            if (isDynamic) {
                marquee.style.cursor = 'grab';
                marquee.style.userSelect = 'none';
                marquee.style.touchAction = 'none';

                marquee.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    marquee.style.cursor = 'grabbing';
                    lastMouseX = e.clientX;
                    dragVelocity = 0;
                });

                window.addEventListener('mousemove', (e) => {
                    if (!isDragging) return;
                    const mouseX = e.clientX;
                    const deltaX = mouseX - lastMouseX;
                    position += deltaX;
                    dragVelocity = deltaX; // Запоминаем скорость последнего движения
                    lastMouseX = mouseX;
                });

                const endDrag = () => {
                    if (!isDragging) return;
                    isDragging = false;
                    marquee.style.cursor = 'grab';
                    // ОБНУЛЯЕМ инерцию сразу, чтобы не было пауз
                    dragVelocity = 0;
                };

                window.addEventListener('mouseup', endDrag);
                window.addEventListener('mouseleave', endDrag);
            }

            if (isHero) {
                window.addEventListener('scroll', () => {
                    const st = window.pageYOffset || document.documentElement.scrollTop;
                    scrollSpeed = Math.abs(st - lastScrollTop) * 0.5;
                    lastScrollTop = st <= 0 ? 0 : st;
                }, { passive: true });
            }

            (function animate() {
                const contentWidth = marqueeContent.offsetWidth;

                if (!isDragging) {
                    if (isDynamic) {
                        // Если мы не тянем, просто едем с заданной скоростью
                        // Игнорируем затухающую dragVelocity для исключения пауз
                        position -= targetAutoSpeed;
                    } else {
                        position -= (1 + scrollSpeed);
                    }
                }

                // Зацикливание
                if (position <= -contentWidth) {
                    position += contentWidth;
                } else if (position > 0) {
                    position -= contentWidth;
                }

                marquee.style.transform = `translate3d(${position}px, 0, 0)`;

                // Плавное затухание ускорения от скролла (для Hero)
                if (isHero && scrollSpeed > 0) {
                    scrollSpeed *= 0.95;
                    if (scrollSpeed < 0.01) scrollSpeed = 0;
                }

                requestAnimationFrame(animate);
            })();
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
    } catch (e) { console.error('initHeader error:', e); }
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
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });

            content.addEventListener('transitionend', () => {
                if (container.classList.contains('is-opened')) content.style.height = 'auto';
            });
        });
    } catch (e) { console.error('initExpandable error:', e); }
}


function initVideoToggles() {
    try {
        document.querySelectorAll('.video').forEach(wrapper => {
            const video = wrapper.querySelector('video');

            // Play/Pause
            wrapper.addEventListener('click', (e) => {
                if (e.target.closest('.video__mute')) return;
                if (video.paused) { video.play(); wrapper.classList.add('video--play'); }
                else { video.pause(); wrapper.classList.remove('video--play'); }
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
    } catch (e) { console.error('initVideoToggles error:', e); }
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


            gsap.set(footer, {
                y: -maxOffset,
                willChange: 'transform'
            });


            gsap.timeline({
                scrollTrigger: {
                    trigger: sentinel,
                    start: 'top bottom',
                    end: 'top top',
                    scrub: true,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress;


                        const footerH = footer.offsetHeight;
                        const offset = (1 - progress) * -Math.min(footerH * 0.3, maxOffset);

                        gsap.set(footer, {
                            y: offset
                        });

                        if (shouldScale) {
                            const scale = 1 - (progress * SCALE_REDUCTION);
                            const radius = progress * BORDER_RADIUS;
                            content.style.setProperty('--border-radius', `0 0 ${radius}px ${radius}px`);
                            gsap.set(content, {
                                scale: scale,
                                borderRadius: `0 0 ${radius}px ${radius}px`
                            });
                        }
                    }
                }
            });

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
    } catch (e) { console.error('initPrinciplesCards error:', e); }
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
            fadeEffect: { crossFade: true },
            allowTouchMove: false,
            thumbs: { swiper: personSliderNav },
            on: { slideChangeTransitionStart: onSlideChange },
        });

        const slides = Array.from(personSliderElement.querySelectorAll('.person-item'));
        const videos = slides.map(s => s.querySelector('video'));
        const soundBtn = personSliderElement.querySelector('.person-slider__sound');
        let soundOn = false;
        let involved = false;

        function setSound(val) {
            soundOn = val;
            videos[personSlider.realIndex].muted = !soundOn;
            personSliderElement.classList.toggle('unmuted', soundOn);
            const cursor = personSliderElement.querySelector('.person-slider__cursor');
            if (cursor) cursor.classList.toggle('unmuted', soundOn);
        }

        function loadVideo(video) {
            if (!video.src && video.dataset.src) { video.src = video.dataset.src; video.load(); }
        }

        function activateVideo(index, withSound, resetTime = false) {
            videos.forEach((v, i) => {
                if (i === index) {
                    loadVideo(v);
                    v.muted = !withSound;
                    if (resetTime) v.currentTime = 0;
                    v.play().catch(() => {});
                } else {
                    v.pause();
                    v.muted = true;
                }
            });
        }

        function onSlideChange() {
            activateVideo(personSlider.realIndex, soundOn, false);
            loadVideo(videos[(personSlider.realIndex + 1) % videos.length]);
        }

        activateVideo(0, false);

        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                videos[personSlider.realIndex].play().catch(() => {});
            });
        }, { threshold: 0.3 }).observe(personSliderElement);

        personSliderElement.addEventListener('click', (e) => {
            if (soundBtn && soundBtn.contains(e.target)) return;
            if (!involved) { involved = true; personSliderElement.classList.add('involved'); }
            if (!soundOn) {
                setSound(true);
                videos[personSlider.realIndex].currentTime = 0;
                videos[personSlider.realIndex].play().catch(() => {});
            } else {
                setSound(false);
            }
        });

        if (soundBtn) {
            soundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (!involved) { involved = true; personSliderElement.classList.add('involved'); }
                setSound(!soundOn);
            });
        }

        videos.forEach((video, i) => {
            video.removeAttribute('loop');
            video.addEventListener('ended', () => {
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
            cursorDot.style.left = currentX + 'px';
            cursorDot.style.top = currentY + 'px';
            requestAnimationFrame(animateCursor);
        })();

        personSliderElement.addEventListener('mousemove', (e) => {
            const rect = personSliderElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x >= rect.width / 2) { targetX = x; targetY = e.clientY - rect.top; }
        });

        personSliderElement.addEventListener('mouseleave', () => {
            targetX = personSliderElement.offsetWidth * 0.75;
            targetY = personSliderElement.offsetHeight / 2;
        });
    } catch (e) { console.error('initPersonSlider error:', e); }
}
const initPreloader = () => {
    try {
        const preloader  = document.querySelector('.preloader');
        const page404bg  = document.querySelectorAll('.page-404__bg');
        const last       = document.querySelector('.svg-elem-5');

        let loaded = false;

        if(preloader){
            window.addEventListener('load', () => {
                last.addEventListener('animationiteration', () => {
                    if (loaded) return;
                    if (page404bg.length) {
                        page404bg.forEach(bg => {
                            const video = bg.querySelector('video');
                            video.addEventListener('loadedmetadata', () => { video.currentTime = 0; });
                            video.play();
                        });
                    }
                    loaded = true;
                    preloader.classList.add('hidden');
                    document.body.classList.remove('no-scroll');
                    new CounterAnimator({ threshold: 0.3, rootMargin: '0px 0px 0px 0px' }).observeCounters('.counters-block');
                });
            });
        }else{
            loaded = true;

            if (page404bg.length) {
                page404bg.forEach(bg => {
                    const video = bg.querySelector('video');
                    video.addEventListener('loadedmetadata', () => { video.currentTime = 0; });
                    video.play();
                });
            }
            document.body.classList.remove('no-scroll');
            new CounterAnimator({ threshold: 0.3, rootMargin: '0px 0px 0px 0px' }).observeCounters('.counters-block');
        }


    } catch (e) { console.error('initPreloader error:'); }
};

class FrameSequence {
    constructor(selector, opts = {}) {
        this.container = typeof selector === 'string'
            ? document.querySelector(selector)
            : selector;
        if (!this.container) return;

        const d = this.container.dataset;

        this.path       = opts.path       || d.framesPath       || '/img/sequence';
        this.frameCount = opts.frameCount || parseInt(d.framesCount, 10) || 25;
        this.prefix     = opts.prefix     || d.framesPrefix     || '1_';
        this.ext        = opts.ext        || d.framesExt        || '.webp';
        this.padLength  = opts.padLength  || parseInt(d.framesPad, 10) || 5;
        this.pinSpacing = opts.pinSpacing || d.framesPinSpacing || '300vh';
        this.cover      = opts.cover      ?? true;

        this.canvas = this.container.querySelector('canvas') || this._createCanvas();
        this.ctx    = this.canvas.getContext('2d');

        this.images       = new Array(this.frameCount);
        this.loaded       = new Uint8Array(this.frameCount);
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
            if (this.loaded[i]) { resolve(this.images[i]); return; }
            const img = new Image();
            img.decoding = 'async';
            img.onload  = () => { this.images[i] = img; this.loaded[i] = 1; resolve(img); };
            img.onerror = () => resolve(null);
            img.src = this._frameSrc(i);
        });
    }

    async _preload() {
        await this._loadImage(0);
        this._draw(0);
        await Promise.all(
            Array.from({ length: this.frameCount - 1 }, (_, i) => this._loadImage(i + 1))
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
            trigger:             self.container,
            start:               'top center',
            end:                 '+=' + self.pinSpacing,
            pin:                 false,
            pinType:             'transform',
            anticipatePin:       1,
            scrub:               true,
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
        const dpr  = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width  = rect.width  * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width  = rect.width  + 'px';
        this.canvas.style.height = rect.height + 'px';

        const prev = Math.max(0, this.currentIndex);
        this.currentIndex = -1;
        if (this.loaded[prev]) this._draw(prev);
    }

    _bindResize() {
        let t;
        window.addEventListener('resize', () => {
            clearTimeout(t);
            t = setTimeout(() => { this._resize(); ScrollTrigger.refresh(); }, 150);
        });
    }

    _createCanvas() {
        const c = document.createElement('canvas');
        c.className = 'frame-sequence__canvas';
        this.container.appendChild(c);
        return c;
    }

    destroy() {
        if (this.st) { this.st.kill(); this.st = null; }
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
    initMarquees();
    initHeader();
    initCardAnimations();
    initVideoToggles();
    initFrameSequences();
    initRunoverEffects();
    initPrinciplesCards();
    initPersonSlider();
    initExpandable();

    new HeroAccelerator('.hero');

    TitleReveal.init();

    new CounterAnimator({ threshold: 0.3, rootMargin: '0px' }).observeCounters('.counters-block');
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
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
        } catch (e) {}
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
        } catch (e) {}
    }

    function cleanupOverlay() {
        var overlay = document.querySelector('.transition-overlay');
        if (overlay) overlay.classList.remove('is-visible');
        if (cardClone) {
            try { cardClone.remove(); } catch (e) {}
            cardClone = null;
        }
    }

    function waitForOverlay(overlay, fallback) {
        return new Promise(function (resolve) {
            if (!overlay) { setTimeout(resolve, fallback); return; }
            var done = false;
            var finish = function () {
                if (done) return;
                done = true;
                overlay.removeEventListener('transitionend', finish);
                overlay.removeEventListener('animationend', finish);
                resolve();
            };
            overlay.addEventListener('transitionend', finish, { once: true });
            overlay.addEventListener('animationend', finish, { once: true });
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
                    } catch (e) {}
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
                            } catch (e) {}

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
                                    } catch (e) {}
                                }
                            } catch (e) {}

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
                    } catch (e) {}

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
                    } catch (e) {}
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
                                } catch (e) {}
                            }
                        } catch (e) {}

                        return Promise.all([
                            section
                                ? gsap.to(section, { height: 0, duration: 1.2, ease: 'power2.inOut' })
                                : Promise.resolve(),
                            gsap.to(nextContainer, { yPercent: 0, duration: 1.2, ease: 'power3.inOut' })
                        ]).then(function () {
                            gsap.set(currentContainer, { display: 'none' });

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
                            } catch (e) {}
                        });

                    } catch (e) {
                        return Promise.resolve();
                    }
                },

                after: function () {
                    try {
                        if (typeof refreshPageScripts === 'function') refreshPageScripts();
                    } catch (e) {}

                    cleanupOverlay();
                    window.scrollTo(0, 0);

                    try {
                        if (window.lenis) {
                            if (typeof window.lenis.resize === 'function') window.lenis.resize();
                            if (typeof window.lenis.start === 'function') window.lenis.start();
                        }
                    } catch (e) {}

                    try {
                        if (window.ScrollTrigger) ScrollTrigger.refresh();
                    } catch (e) {}
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