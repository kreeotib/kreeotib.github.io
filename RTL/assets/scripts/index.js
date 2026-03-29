class CounterAnimator {
    constructor(options = {}) {
        this.options = { threshold: 0.3, rootMargin: '0px', ...options };
        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), this.options);
    }

    animateCounter(element, start, rawEnd, duration = 1500, delay = 0) {
        const match = rawEnd.toString().match(/([^0-9]*)([0-9]+)([^0-9]*)/);
        if (!match) return;

        const prefix = match[1] || '';
        const endValue = parseInt(match[2], 10);
        const suffix = match[3] || '';

        setTimeout(() => {
            const startTime = performance.now();
            const difference = endValue - start;

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                element.setAttribute('data-count', `${prefix}${Math.floor(start + difference * easeProgress).toLocaleString('ru-RU')}${suffix}`);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.setAttribute('data-count', `${prefix}${endValue.toLocaleString('ru-RU')}${suffix}`);
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
                const parts = rawValue.match(/([^0-9]*)([0-9]+)([^0-9]*)/);
                counter.setAttribute('data-count', parts ? `${parts[1]}0${parts[3]}` : '0');
                this.observer.observe(block);
            });
        });
    }
}


class HeroAccelerator {
    constructor(selector = '.hero') {
        this.hero = document.querySelector(selector);
        if (!this.hero) return;

        this.track = this.hero.closest('.hero-track') ?? this.hero.parentElement;
        this.content = this.hero.querySelector('.hero__content');

        this.init();
    }

    init() {
        const vh = window.innerHeight / 2.1;
        const trackHeight = this.track.offsetHeight;
        const scrollable = trackHeight - vh;

        // Main ScrollTrigger for hero effects
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

                    // Calculate all progress values using the same logic
                    const textRise = this.norm(progress, 0, 1.0);
                    const textOpacity = 1 - this.norm(progress / 1.5, 0.80, 1.0);
                    const gradOpacity = this.norm(progress, 0.0, 0.30);
                    const gradFill = this.norm(progress, 0.15, 1);
                    const p = gradFill / 2.2;

                    // Hero opacity fade-out (быстрее начинается)
                    const heroOpacity = 1 - this.norm(progress, 0.7, 1.0);
                    this.hero.style.opacity = heroOpacity;

                    // Apply CSS variables
                    this.hero.style.setProperty('--p', p.toFixed(4));
                    this.hero.style.setProperty('--grad-opacity', gradOpacity.toFixed(4));
                    this.hero.style.setProperty('--sy', localScroll.toFixed(0) + 'px');

                    // Content animation
                    if (this.content) {
                        const maxRise = vh * 4.4;
                        gsap.set(this.content, {
                            y: -((textRise / 2.2) * maxRise),
                            opacity: textOpacity
                        });
                    }
                }
            }
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
    const CFG = { sweepIn: 1040, sweepOut: 640, stagger: 220, rootMargin: '0px 0px -10% 0px' };

    function eio(t) {
        return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function animateBar(bar, delay) {
        return new Promise(resolve => {
            let t0 = null;
            let rafIn, rafOut;

            function sweepIn(ts) {
                if (!t0) t0 = ts;
                const elapsed = ts - t0 - delay;
                if (elapsed < 0) { rafIn = requestAnimationFrame(sweepIn); return; }

                const p = Math.min(elapsed / CFG.sweepIn, 1);
                bar.style.transform = `scaleX(${eio(p)})`;
                bar.style.transformOrigin = 'left center';

                if (p < 1) { rafIn = requestAnimationFrame(sweepIn); return; }

                let t1 = null;
                function sweepOut(ts2) {
                    if (!t1) t1 = ts2;
                    const p2 = Math.min((ts2 - t1) / CFG.sweepOut, 1);
                    bar.style.transformOrigin = 'right center';
                    bar.style.transform = `scaleX(${1 - eio(p2)})`;
                    if (p2 < 1) { rafOut = requestAnimationFrame(sweepOut); return; }
                    resolve();
                }
                rafOut = requestAnimationFrame(sweepOut);
            }
            rafIn = requestAnimationFrame(sweepIn);
            bar._rafs = [rafIn, rafOut];
        });
    }

    function build(el) {
        if (el.dataset.rvBuilt) return;
        el.dataset.rvBuilt = 'true';

        const text = el.textContent.trim();
        el.setAttribute('aria-label', text);

        // Получаем вычисленные стили элемента
        const computed = window.getComputedStyle(el);

        // Вычисляем доступную ширину с учетом padding
        const paddingLeft = parseFloat(computed.paddingLeft);
        const paddingRight = parseFloat(computed.paddingRight);
        const availableWidth = el.clientWidth - paddingLeft - paddingRight;

        el.innerHTML = '';

        // Создаем probe с полным копированием стилей
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

        // Добавляем probe в body, чтобы избежать проблем с контекстом
        document.body.appendChild(probe);

        const words = text.split(/\s+/);
        const lines = [];
        let cur = '';

        for (const word of words) {
            const test = cur ? cur + ' ' + word : word;
            probe.textContent = test;

            // Используем scrollWidth для более точного измерения
            const testWidth = probe.scrollWidth;

            if (cur && testWidth > availableWidth) {
                lines.push(cur);
                cur = word;
            } else {
                cur = test;
            }
        }
        if (cur) lines.push(cur);

        // Удаляем probe из DOM
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
            if (b._rafs) b._rafs.forEach(cancelAnimationFrame);
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
            wrapper.addEventListener('click', () => {
                if (video.paused) { video.play(); wrapper.classList.add('video--play'); }
                else { video.pause(); wrapper.classList.remove('video--play'); }
            });
            video.addEventListener('ended', () => wrapper.classList.remove('video--play'));
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

            // Create sentinel element
            const sentinel = document.createElement('div');
            sentinel.style.cssText = 'height:1px; margin-bottom:-1px; pointer-events:none;';
            footer.parentNode.insertBefore(sentinel, footer);

            // Set initial transform
            gsap.set(footer, {
                y: -maxOffset,
                willChange: 'transform'
            });

            // Create ScrollTrigger
            gsap.timeline({
                scrollTrigger: {
                    trigger: sentinel,
                    start: 'top bottom',
                    end: 'top top',
                    scrub: true,
                    invalidateOnRefresh: true,
                    onUpdate: (self) => {
                        const progress = self.progress;

                        // Footer offset animation
                        const footerH = footer.offsetHeight;
                        const offset = (1 - progress) * -Math.min(footerH * 0.3, maxOffset);

                        gsap.set(footer, {
                            y: offset
                        });

                        // Content scale and border-radius animation
                        if (shouldScale) {
                            const scale = 1 - (progress * SCALE_REDUCTION);
                            const radius = progress * BORDER_RADIUS;

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
            if (!involved) return;
            activateVideo(personSlider.realIndex, soundOn, true);
            personSliderElement.classList.remove('unmuted');
            soundOn = false;
            if (soundBtn) soundBtn.querySelector('span:last-of-type').textContent = soundBtn.getAttribute('data-muted');
        }

        new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                involved = true;
                loadVideo(videos[personSlider.realIndex]);
                videos[personSlider.realIndex].muted = true;
                videos[personSlider.realIndex].play().catch(() => {});
            });
        }, { threshold: 0.3 }).observe(personSliderElement);

        personSliderElement.addEventListener('click', () => {
            if (!involved) return;
            if (soundBtn) soundBtn.click();
        });

        if (soundBtn) {
            soundBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setSound(!soundOn);
                soundBtn.querySelector('span:last-of-type').textContent = soundOn ? soundBtn.getAttribute('data-unmuted') : soundBtn.getAttribute('data-muted');
            });
        }

    } catch (e) { console.error('initPersonSlider error:', e); }
}

const initPreloader = () => {
    try {
        const preloader  = document.querySelector('.preloader');
        const page404bg  = document.querySelectorAll('.page404__video-wrapper');
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
            document.body.classList.remove('no-scroll');
            new CounterAnimator({ threshold: 0.3, rootMargin: '0px 0px 0px 0px' }).observeCounters('.counters-block');
        }


    } catch (e) { console.error('initPreloader error:'); }
};

function refreshPageScripts() {

    initSliders();
    initCards();
    initMarquees();
    initHeader();
    initCardAnimations();
    initVideoToggles();
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
    let cardClone       = null;


    function lockScroll() {
        if (window.lenis) {
            window.lenis.stop();
        } else {
            document.documentElement.style.overflow = 'hidden';
        }
    }

    function unlockScroll() {
        if (window.lenis) {
            window.lenis.start();
        } else {
            document.documentElement.style.overflow = '';
        }
    }


    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    barba.hooks.before(() => {
        isTransitioning = true;
        lockScroll();
    });

    barba.hooks.after(() => {
        isTransitioning = false;
        unlockScroll();
    });


    try {
        barba.init({
            prevent: () => isTransitioning,

            transitions: [{
                name: 'project-reveal',


                beforeLeave({ current }) {
                    try {
                        const section = current.container.querySelector('.projects-section');
                        if (section) {
                            section.style.height   = `${section.getBoundingClientRect().height}px`;
                            section.style.overflow = 'hidden';
                        }
                    } catch (e) { console.error('barba beforeLeave error:', e); }
                },


                async leave({ current, trigger }) {
                    try {
                        const overlay     = document.querySelector('.transition-overlay');
                        const clickedItem = trigger?.closest?.('.project-item') ?? trigger;

                        if (clickedItem && overlay) {
                            const rect        = clickedItem.getBoundingClientRect();
                            const overlayRect = overlay.getBoundingClientRect();


                            const videoTimes = [...clickedItem.querySelectorAll('video')]
                                .map(v => v.currentTime);

                            cardClone = clickedItem.cloneNode(true);


                            [...cardClone.querySelectorAll('video')].forEach((v, i) => {
                                v.currentTime = videoTimes[i] ?? 0;
                                v.pause();
                                v.removeAttribute('autoplay');
                                v.removeAttribute('loop');
                            });

                            Object.assign(cardClone.style, {
                                position:      'absolute',
                                top:           `${rect.top  - overlayRect.top}px`,
                                left:          `${rect.left - overlayRect.left}px`,
                                width:         `${rect.width}px`,
                                height:        `${rect.height}px`,
                                margin:        '0',
                                pointerEvents: 'none',
                            });

                            overlay.appendChild(cardClone);
                        }

                        if (overlay) overlay.classList.add('is-visible');

                        await delay(2000);

                    } catch (e) { console.error('barba leave error:', e); }
                },


                beforeEnter({ next }) {
                    try {
                        window.scrollTo(0, 0);

                        gsap.set(next.container, {
                            opacity:  1,
                            position: 'fixed',
                            top:      '100%',
                            left:     0,
                            width:    '100%',
                            zIndex:   150,
                        });
                    } catch (e) { console.error('barba beforeEnter error:', e); }
                },

                async enter({ current, next }) {
                    try {
                        const overlay = document.querySelector('.transition-overlay');
                        const section = current.container.querySelector('.projects-section');

                        await Promise.all([
                            section
                                ? gsap.to(section,        { height: 0, duration: 2, ease: 'power2.inOut' })
                                : Promise.resolve(),
                            gsap.to(next.container,       { top: '0%', duration: 2, ease: 'power2.inOut' }),
                        ]);
                        gsap.set(current.container, { visibility: 'hidden' });
                        if (overlay) overlay.classList.remove('is-visible');
                        gsap.set(next.container, { clearProps: 'all' });

                    } catch (e) { console.error('barba enter error:', e); }
                },


                after() {
                    try {
                        refreshPageScripts();
                    } catch (e) { console.error('barba refreshPageScripts error:', e); }

                    if (cardClone) {
                        cardClone.remove();
                        cardClone = null;
                    }

                    const overlay = document.querySelector('.transition-overlay');
                    if (overlay) overlay.classList.remove('is-visible');

                    window.scrollTo(0, 0);
                },
            }],
        });

    } catch (e) {
        console.error('barba.init error:', e);
    }

})();