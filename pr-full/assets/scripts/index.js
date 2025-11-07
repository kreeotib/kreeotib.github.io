class CounterAnimator {
    constructor(options = {}) {
        this.options = {
            threshold: 0.3,
            rootMargin: '0px',
            ...options
        };

        this.observer = new IntersectionObserver(this.handleIntersect.bind(this), this.options);
    }

    animateCounter(element, start, end, duration = 1000, delay = 0) {
        setTimeout(() => {
            const startTime = performance.now();
            const difference = end - start;

            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);

                const easeProgress = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const currentValue = Math.floor(start + difference * easeProgress);
                element.setAttribute('data-count', currentValue.toLocaleString('ru-RU'));

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.setAttribute('data-count', end.toLocaleString('ru-RU'));
                }
            };

            requestAnimationFrame(update);
        }, delay);
    }

    handleIntersect(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const block = entry.target;
                const counters = block.querySelectorAll('.counter[data-end]');

                counters.forEach((counter, index) => {
                    const endValue = parseInt(counter.getAttribute('data-end')) || 0;
                    const delay = (index + 1) * 1000;
                    this.animateCounter(counter, 0, endValue, delay, 0);
                });

                observer.unobserve(block);
            }
        });
    }

    observeCounters(selector = '.counters-block') {
        const counterBlocks = document.querySelectorAll(selector);

        if (counterBlocks.length) {
            counterBlocks.forEach(block => {
                const counters = block.querySelectorAll('.counter[data-end]');
                if (counters.length) {
                    counters.forEach(counter => counter.setAttribute('data-count', '0'));
                    this.observer.observe(block);
                }
            });
        }
    }
}
class Animations {
    constructor() {
        this.animationWrapperArray = document.querySelectorAll('.animation-wrapper');
    }

    splitNode(node, delayStep, wordIndex = { value: 0 }) {
        // Если это текстовый узел — разбиваем на слова
        if (node.nodeType === Node.TEXT_NODE) {
            const fragment = document.createDocumentFragment();
            const parts = node.textContent.split(/(\s+)/); // сохраняем пробелы

            parts.forEach(part => {
                if (part === '') return;
                if (/\s+/.test(part)) {
                    fragment.appendChild(document.createTextNode(part)); // пробел
                } else {
                    const span = document.createElement('span');
                    span.classList.add('word');
                    span.style.setProperty('--animation-delay', `${wordIndex.value * delayStep}s`);
                    span.textContent = part;
                    fragment.appendChild(span);
                    wordIndex.value++;
                }
            });
            return fragment;
        }

        // Если это <br> — просто клонируем
        if (node.nodeName === 'BR') {
            return node.cloneNode();
        }

        // Если это элемент — сохраняем его и обрабатываем потомков
        if (node.nodeType === Node.ELEMENT_NODE) {
            const clone = node.cloneNode(false); // копируем сам тег и классы
            node.childNodes.forEach(child => {
                clone.appendChild(this.splitNode(child, delayStep, wordIndex));
            });
            return clone;
        }

        return document.createTextNode('');
    }

    splitTextIntoWords(element) {
        // Сначала считаем количество слов, чтобы рассчитать delayStep
        const text = element.textContent.trim();
        const totalWords = text ? text.split(/\s+/).length : 0;
        const maxDuration = 1; // общая длительность
        const delayStep = totalWords ? maxDuration / totalWords : 0;

        const newContent = document.createDocumentFragment();
        const wordIndex = { value: 0 };

        element.childNodes.forEach(node => {
            newContent.appendChild(this.splitNode(node, delayStep, wordIndex));
        });

        element.innerHTML = '';
        element.appendChild(newContent);
    }

    toggleAnimation(animationWrapperElement) {
        const animationItemArray = animationWrapperElement.querySelectorAll('.animation-item');
        const textItemArray = animationWrapperElement.querySelectorAll('.animation-item-text');

        // Обычные элементы
        animationItemArray.forEach((el, index) => {
            el.style.setProperty('--animation-delay', `${(index + 1) * 0.2}s`);
            el.classList.add('animated');
        });

        // Текстовые элементы
        textItemArray.forEach(textElement => {
            this.splitTextIntoWords(textElement);
            textElement.classList.add('animated-text');
        });
    }

    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this.toggleAnimation(entry.target);
            }
        });
    }

    init() {
        if (!this.animationWrapperArray.length) return;

        const observer = new IntersectionObserver(this.handleIntersection.bind(this));
        this.animationWrapperArray.forEach(wrapper => observer.observe(wrapper));
    }
}



document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.services-card');

    if (serviceCards.length === 0) {
        console.warn('Не найдено элементов с классом .services-card');
    }

    serviceCards.forEach((card, index) => {
        const video = card.querySelector('video');

        if (!video) {
            return;
        }

        let animationFrame = null;

        const playReverse = () => {
            if (video.currentTime <= 0) {
                cancelAnimationFrame(animationFrame);

                video.load();

                return;
            }

            video.currentTime = Math.max(0, video.currentTime - 0.033);
            animationFrame = requestAnimationFrame(playReverse);
        };

        card.addEventListener('mouseenter', async () => {
            try {
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }

                video.playbackRate = 1;

                await video.play();
            } catch (error) {
                console.error(`Ошибка воспроизведения видео в карточке #${index + 1}:`, error);
            }
        });

        card.addEventListener('mouseleave', () => {
            try {
                video.pause();

                playReverse();
            } catch (error) {
                console.error(`Ошибка реверса видео в карточке #${index + 1}:`, error);
            }
        });

        video.preload = 'auto';

        video.muted = true;

        video.loop = true;
    });

    const servicesSlider = new Swiper('.services-slider', {
        slidesPerView: 'auto',
        spaceBetween: 32,
        navigation: {
            prevEl: '.slider-button--prev',
            nextEl: '.slider-button--next'
        }
    })

    const documentSlider = new Swiper('.document-slider', {
        slidesPerView: 'auto',
        spaceBetween: 50,
        navigation: {
            prevEl: '.slider-button--prev',
            nextEl: '.slider-button--next'
        }
    })
    const partnersSlider = new Swiper('.partners-slider', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        navigation: {
            prevEl: '.slider-button--prev',
            nextEl: '.slider-button--next'
        }
    })


    const burger = document.querySelector('.burger'),

        mobileMenu = document.querySelector('.mobile-menu');

    if (burger && mobileMenu) {
        burger.addEventListener('click', e => {
            e.preventDefault();

            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
    }

    const animator = new CounterAnimator({
        threshold: 0.3,
        rootMargin: '0px'
    });

    const preloader = document.querySelector('.preloader')

    if (preloader) {
        const preloaderSvg = document.querySelector('.preloader__svg .svg-elem-20');
        const videoBg = document.querySelector('video.hero__bg');
        document.body.classList.add('no-scroll');

        preloaderSvg.addEventListener('animationend', function () {
            preloader.classList.add('loaded');
            document.body.classList.remove('no-scroll');
            if (videoBg) {
                videoBg.play();
            }
            animator.observeCounters('.counters-block');
            const animation = new Animations();
            animation.init();
        });
    }else{
        animator.observeCounters('.counters-block');
        const animation = new Animations();
        animation.init();
    }



    const header = document.querySelector('.header'),
        fixedNav = document.querySelector('.fixed-nav');

    if(header && fixedNav){
        window.addEventListener('scroll',()=>{
            if(pageYOffset > header.getBoundingClientRect().height){
                fixedNav.classList.add('visible')
            }else{
                fixedNav.classList.remove('visible')
            }
        })
    }
})
