const countToTarget = (counterElement, target, index = 0) => {
    let currentCount = 0;
    const duration = 2000 + (index * 1000);
    const increment = Math.ceil(target / (duration / 50));
    const interval = setInterval(() => {
        currentCount += increment;
        if (currentCount >= target) {
            currentCount = target;
            clearInterval(interval);
        }
        counterElement.textContent = currentCount;
    }, 50);
}

const preloader = document.querySelector('.preloader');

if(preloader){
    document.body.classList.add('no-scroll');
    window.onload = (event) => {
        const preloaderLogo = document.querySelector('.preloader-logo');
        const jsVideoArray = document.querySelectorAll('.js-video');


        preloaderLogo.addEventListener('animationiteration', () => {
            document.body.classList.remove('no-scroll');
            preloader.classList.add('hidden');

            let currentHashValue = window.location.hash.substring(1);

            if (jsVideoArray.length) {
                setTimeout(() => {
                    jsVideoArray.forEach(video => {
                        video.play();
                        video.controls = false;
                    })
                }, 100)
            }

            if(currentHashValue){
                setTimeout(()=>{
                    document.querySelector(`#${currentHashValue}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
                },100)
            }
        });
    };
}
class Parallax {
    constructor(options = {}) {
        // Настройки по умолчанию
        this.defaults = {
            element: '.parallax-element',
            speedAttribute: 'data-speed',
            directionAttribute: 'data-direction', // 'up' или 'down'
            defaultSpeed: 0.2,
            defaultDirection: 'down', // 'down' - вниз, 'up' - вверх
            throttleTime: 16,
            initOnLoad: true
        };

        this.settings = { ...this.defaults, ...options };
        this.elements = [];
        this.rafId = null;
        this.lastScrollTime = 0;

        if (this.settings.initOnLoad) {
            document.addEventListener('DOMContentLoaded', () => this.init());
        }
    }

    init() {
        const elements = document.querySelectorAll(this.settings.element);
        if (elements.length === 0) return;

        elements.forEach(element => {
            this.addElement(element);
        });

        this.startAnimation();
        window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    }

    addElement(element) {
        const speed = parseFloat(element.getAttribute(this.settings.speedAttribute)) ||
            this.settings.defaultSpeed;

        // Получаем направление из атрибута или используем по умолчанию
        const direction = element.getAttribute(this.settings.directionAttribute) ||
            this.settings.defaultDirection;

        this.elements.push({
            element,
            speed,
            direction,
            container: this.findContainer(element)
        });

        this.applyOptimizations(element);
    }

    findContainer(element) {
        let parent = element.parentElement;
        while (parent !== document.body) {
            const style = window.getComputedStyle(parent);
            if (style.position === 'relative' || style.position === 'absolute' || style.position === 'fixed') {
                return parent;
            }
            parent = parent.parentElement;
        }
        return document.documentElement;
    }

    applyOptimizations(element) {
        element.style.willChange = 'transform';
        element.style.backfaceVisibility = 'hidden';
    }

    handleScroll() {
        const now = Date.now();
        if (now - this.lastScrollTime > this.settings.throttleTime) {
            this.lastScrollTime = now;
            this.updateElements();
        }
    }

    updateElements() {
        this.elements.forEach(item => {
            const { element, speed, direction, container } = item;
            const containerRect = container.getBoundingClientRect();
            const offsetY = (window.innerHeight - containerRect.height) / 2;
            const scrollY = containerRect.top + offsetY;

            // Определяем направление движения
            let positionY;
            if (direction === 'up') {
                // Движение вверх - против скролла
                positionY = scrollY * speed * -1;
            } else {
                // Движение вниз - по направлению скролла
                positionY = scrollY * speed;
            }

            element.style.transform = `translate3d(0, ${positionY}px, 0)`;
        });
    }

    startAnimation() {
        if (this.rafId) return;

        const animate = () => {
            this.updateElements();
            this.rafId = requestAnimationFrame(animate);
        };

        this.rafId = requestAnimationFrame(animate);
    }

    stopAnimation() {
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    destroy() {
        this.stopAnimation();
        window.removeEventListener('scroll', this.handleScroll.bind(this));
        this.elements.forEach(item => {
            item.element.style.transform = '';
            item.element.style.willChange = '';
            item.element.style.backfaceVisibility = '';
        });
        this.elements = [];
    }
}

// Пример использования:
// const parallax = new Parallax();
// parallax.init(); // Если initOnLoad: false

document.addEventListener('DOMContentLoaded', () => {
    const parallax = new Parallax();
    parallax.init();
    const burger = document.querySelector('.burger'),
        header = document.querySelector('.header');

    if(burger && header){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('burger--active');
            header.classList.toggle('header--active');
            document.body.classList.toggle('no-scroll');
        })
    }
    const documentSliderElement = document.querySelector('.documents-slider');

    if (documentSliderElement) {
        const documentSlider = new Swiper(documentSliderElement, {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: {
                nextEl: '.documents-slider-button-next',
                prevEl: '.documents-slider-button-prev',
            },
            pagination: {
                el: '.documents-slider-pagination',
                bulletClass: 'slider-pagination__item',
                bulletActiveClass: 'slider-pagination__item--active',
            },
        })
    }

    const cardSliderElement = document.querySelector('.card-slider');

    if (cardSliderElement) {
        const cardSlider = new Swiper('.card-slider', {
            slidesPerView: 'auto',
            spaceBetween: 24,
        })
    }


    const cardSliderGalleryElement = document.querySelector('.card-gallery');

    if (cardSliderGalleryElement) {
        const cardGallery = new Swiper('.card-gallery', {
            slidesPerView: 1,
            navigation: {
                nextEl: '.card-gallery-button-next',
                prevEl: '.card-gallery-button-prev',
            },
            touchEventsTarget:'container',
            pagination: {
                el: '.card-gallery-pagination',
                bulletClass: 'slider-pagination__item',
                bulletActiveClass: 'slider-pagination__item--active',
            },
        });
    }


    const fileInputArray = document.querySelectorAll('.js-file-input');

    if (fileInputArray.length) {
        fileInputArray.forEach(fileInputBlock => {
            const fileInputElement = fileInputBlock.querySelector('input[type="file"]'),
                fileInputTextElement = fileInputBlock.querySelector('.js-file-input-text');
            if (!fileInputElement && fileInputTextElement) return false;
            fileInputElement.addEventListener('change', function () {
                const fileName = this.files[0] ? this.files[0].name : 'Файл';
                fileInputBlock.querySelector('.js-file-input-text').value = fileName;
            });
        })
    }

    const counters = document.querySelectorAll('.js-counter');

    const observerCountersCallback = (entries) => {
        entries.forEach((entry,index) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                const targetNumber = parseInt(entry.target.getAttribute('data-target'), 10);
                countToTarget(entry.target, targetNumber, index);
                countersObserver.unobserve(entry.target);
            }
        });
    };
    const observerCountersOptions = {
        root: null,
        threshold: 0.1
    };

    const countersObserver = new IntersectionObserver(observerCountersCallback, observerCountersOptions);

    if(counters.length){
        counters.forEach((counter, index) => countersObserver.observe(counter));
    }

    const animateSvg = document.querySelectorAll('.animate-svg');

    if(animateSvg.length){
        const observerAnimateCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated')
                }
            });
        };
        const observerAnimateOptions = {
            root: null,
            threshold: 0.1
        };

        const animateObserver = new IntersectionObserver(observerAnimateCallback, observerAnimateOptions);
        const normalizeTransformOrigin = (element) =>{
            const bbox = element.getBBox();

            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            element.style.transformOrigin = `${centerX}px ${centerY}px`
        }
        animateSvg.forEach(svg=>{
            const path = svg.querySelectorAll('path');
            const g = svg.querySelectorAll('g');
            const animateSvgGroupArray = svg.querySelectorAll('.animate-svg-group');

            animateObserver.observe(svg)

            g.forEach(element=>{
                normalizeTransformOrigin(element);
            })
            path.forEach(element=>{
                normalizeTransformOrigin(element);
            });

            if(animateSvgGroupArray.length){
                animateSvgGroupArray.forEach(group=>{
                    const groupItemArray = group.querySelectorAll('.animate-svg-group-item'),
                        groupDelayMultiplier = group.dataset.delay || 100;

                    if(groupItemArray.length){
                        groupItemArray.forEach((groupItem, groupItemIndex)=>{
                            groupItem.style.animationDelay = `${groupItemIndex * groupDelayMultiplier}ms`
                        });
                    }
                })
            }
        })
    }

    const preloader = document.querySelector('.preloader')

    if(preloader){

    }

    Fancybox.bind("[data-fancybox]", {
        // Your custom options
    });

});