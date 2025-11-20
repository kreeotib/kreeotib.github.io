class PerfectMarquee {
    constructor(container, baseSpeed = 50, scrollFactor = 0.5) {
        this.container = container;
        this.content = container.querySelector('.marquee-content');

        // базовая скорость в пикселях/сек
        this.baseSpeed = baseSpeed;
        this.scrollFactor = scrollFactor;

        // текущая скорость (px/s), по умолчанию едем влево
        this.velocity = -this.baseSpeed;

        // позиция ленты
        this.offset = 0;

        this.lastScrollY = window.scrollY;
        this.lastTime = null;
        this.halfWidth = 0; // половина ширины контента (одна копия)

        this.init();
    }

    init() {
        // Дублируем контент для бесшовного цикла
        const items = this.content.innerHTML;
        this.content.innerHTML = items + items;

        // После рендера считаем ширину
        requestAnimationFrame(() => {
            this.updateSizes();
            this.startLoop();
        });

        window.addEventListener('resize', () => {
            this.updateSizes();
        });

        window.addEventListener('scroll', () => this.handleScroll());
    }

    updateSizes() {
        // половина всей ширины = ширина одной "ленты"
        this.halfWidth = this.content.scrollWidth / 2;
    }

    startLoop() {
        const loop = (time) => {
            if (this.lastTime == null) {
                this.lastTime = time;
            }

            const dt = (time - this.lastTime) / 1000; // в секундах
            this.lastTime = time;

            // Немного тянем скорость обратно к базовой (влево) — инерция
            const defaultVelocity = -this.baseSpeed;
            const lerpFactor = 0.02; // чем больше, тем быстрее возвращается к базовой
            this.velocity += (defaultVelocity - this.velocity) * lerpFactor;

            // Обновляем позицию
            this.offset += this.velocity * dt;

            // Бесконечный цикл: когда ушли дальше, чем половина длины — возвращаем
            if (this.offset <= -this.halfWidth) {
                this.offset += this.halfWidth;
            } else if (this.offset >= 0) {
                this.offset -= this.halfWidth;
            }

            // Применяем transform
            this.content.style.transform = `translateX(${this.offset}px)`;

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }

    handleScroll() {
        const currentY = window.scrollY;
        const delta = currentY - this.lastScrollY;

        if (delta === 0) return;

        const power = Math.abs(delta) * this.scrollFactor;

        if (delta > 0) {
            // скролл вниз → ускоряем влево (более отрицательная скорость)
            this.velocity -= power;
        } else {
            // скролл вверх → ускоряем вправо (скорость становится больше / может стать положительной)
            this.velocity += power;
        }

        this.lastScrollY = currentY;
    }

    setSpeed(newSpeed) {
        this.baseSpeed = newSpeed;
        // сдвигаем базовое направление (влево)
        this.velocity = -this.baseSpeed;
    }
}


class ClientsSlider {
    constructor(options = {}) {
        this.itemsSelector = options.itemsSelector || '.clients-list__item';
        this.imgSelector = options.imgSelector || '.clients-img__item';
        this.colors = options.colors || ['#FF0048', '#002EC8', '#6ED678', '#FFAA00'];
        this.interval = options.interval || 2000;

        this.clientItems = document.querySelectorAll(this.itemsSelector);
        this.clientImg = document.querySelector(this.imgSelector);

        this.currentIndex = 0;
        this.currentHoverColorIndex = 0; // Отдельный индекс для цветов при наведении
        this.intervalId = null;
        this.isHovering = false;

        this.init();
    }

    updateClient(index, useHoverColor = false) {
        const item = this.clientItems[index];
        const imageSrc = item.getAttribute('data-image');

        // Используем отдельный индекс цвета для наведения
        const colorIndex = useHoverColor ? this.currentHoverColorIndex : index;
        const color = this.colors[colorIndex % this.colors.length];

        this.clientImg.src = imageSrc;
        item.style.color = color;

        this.clientItems.forEach((el, idx) => {
            if (idx !== index) {
                el.style.color = '';
            }
        });
    }

    autoChange() {
        if (!this.isHovering) {
            this.updateClient(this.currentIndex);
            this.currentIndex = (this.currentIndex + 1) % this.clientItems.length;
        }
    }

    start() {
        this.intervalId = setInterval(() => this.autoChange(), this.interval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    handleMouseEnter(index) {
        this.isHovering = true;
        this.updateClient(index, true); // Используем цвет из очереди наведения
        // Переключаем на следующий цвет в очереди для следующего наведения
        this.currentHoverColorIndex = (this.currentHoverColorIndex + 1) % this.colors.length;
    }

    handleMouseLeave(index) {
        this.isHovering = false;
        this.currentIndex = (index + 1) % this.clientItems.length;
    }

    setupEventListeners() {
        this.clientItems.forEach((item, index) => {
            item.addEventListener('mouseenter', () => this.handleMouseEnter(index));
            item.addEventListener('mouseleave', () => this.handleMouseLeave(index));
        });
    }

    init() {
        if (this.clientItems.length === 0 || !this.clientImg) {
            return;
        }

        this.updateClient(0);
        this.setupEventListeners();
        this.start();
    }

    destroy() {
        this.stop();
        this.clientItems.forEach((item) => {
            item.style.color = '';
        });
    }
}

document.addEventListener('DOMContentLoaded', e => {
    const colors = ['#FF0048', '#002EC8', '#6ED678', '#FFAA00'];
    const logoColors = ['#FF0048', '#002EC8', '#6ED678', '#FFAA00', '#F2F2F2'];

    let currentIndex = 0;
    let logoCurrentIndex = 0;

    const hoverElements = document.querySelectorAll('.custom-hover');

    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', function () {
            if (this.classList.contains('custom-hover-logo')) {
                document.documentElement.style.setProperty('--hover-color', logoColors[logoCurrentIndex]);
                logoCurrentIndex = (logoCurrentIndex + 1) % logoColors.length;
            } else {
                document.documentElement.style.setProperty('--hover-color', colors[currentIndex]);
                currentIndex = (currentIndex + 1) % colors.length;
            }
        });
    });

    const marque = new PerfectMarquee(document.getElementById('marque'), 70);
    const clientsSlider = new ClientsSlider();

    const slider = new Swiper(".slider", {
        effect: "fade",
        fadeEffect: {
            crossFade: true,
        },
        loop: true,
        navigation: {
            nextEl: ".slider-button-next",
            prevEl: ".slider-button-prev",
            disabledClass: 'slider-button--disabled',
            lockClass: 'slider-button--lock'
        },
    });

    const productSlider = new Swiper(".product-slider", {
        slidesPerView: 'auto',
        spaceBetween: 24,
        breakpoints: {
            768: {
                spaceBetween: 40,
            }
        },
        navigation: {
            nextEl: ".product-slider__button--next",
            prevEl: ".product-slider__button--prev",
            disabledClass: 'product-slider__button--disabled',
            lockClass: 'product-slider__button--lock'
        },
    });

    const heroBg = document.querySelector('.hero__bg');

    if (heroBg) {
        if (window.innerWidth < 767) {
            heroBg.src = heroBg.dataset.mobile;
        } else {
            heroBg.src = heroBg.dataset.desktop;
        }
    }


    const productCards = document.querySelectorAll('.product-card');

    if (productCards.length) {
        productCards.forEach((card, index) => {
            const video = card.querySelector('video');
            const imgWrapper = card.querySelector('.product-card__img');

            if (!video || !imgWrapper) return;

            let animationFrame = null;
            let isPlaying = false;

            const playReverse = () => {
                if (video.currentTime <= 0) {
                    cancelAnimationFrame(animationFrame);
                    imgWrapper.classList.remove('hover');
                    isPlaying = false;
                    return;
                }

                video.currentTime = Math.max(0, video.currentTime - 0.033);
                animationFrame = requestAnimationFrame(playReverse);
            };

            const startVideo = async () => {
                if (isPlaying) return;

                try {
                    if (animationFrame) {
                        cancelAnimationFrame(animationFrame);
                        animationFrame = null;
                    }

                    video.playbackRate = 1;
                    imgWrapper.classList.add('hover');
                    await video.play();
                    isPlaying = true;
                } catch (error) {
                    console.error(`Ошибка воспроизведения видео в карточке #${index + 1}:`, error);
                }
            };

            const stopVideo = () => {
                try {
                    video.pause();
                    playReverse();
                } catch (error) {
                    console.error(`Ошибка реверса видео в карточке #${index + 1}:`, error);
                }
            };

            // Для десктопа
            card.addEventListener('mouseenter', startVideo);
            card.addEventListener('mouseleave', stopVideo);

            // Для мобильных устройств
            card.addEventListener('touchstart', (e) => {
                if (!isPlaying) {
                    startVideo();
                } else {
                    stopVideo();
                }
            }, { passive: true });

            video.muted = true;
            video.loop = true;
        });
    }


    const nav = document.querySelector('.header-nav');
    const burger = document.querySelector('.burger');

    if (nav && burger) {
        burger.addEventListener('click', e => {
            e.preventDefault();

            nav.classList.toggle('active');
            burger.classList.toggle('active');
        })
    }

    const header = document.querySelector('.header'),
        fixedNav = document.querySelector('.fixed-nav');

    if (header && fixedNav) {
        window.addEventListener('scroll', () => {
            if (pageYOffset > header.getBoundingClientRect().height) {
                fixedNav.classList.add('visible')
            } else {
                fixedNav.classList.remove('visible')
            }
        })
    }

    const hero = document.querySelector('.hero'),
        mobileNav = document.querySelector('.mobile-nav');

    if (hero && mobileNav) {
        window.addEventListener('scroll', () => {
            if (pageYOffset > hero.getBoundingClientRect().height) {
                mobileNav.classList.add('visible')
            } else {
                mobileNav.classList.remove('visible')
            }
        })
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });

    const titleChangers = document.querySelectorAll('.title-changer');
    if (titleChangers.length) {
        titleChangers.forEach(element => {
            observer.observe(element);
        });
    }
});

const preloader = document.querySelector('.preloader')

if (preloader) {
    const preloaderImg = document.querySelector('.preloader-image:last-child');
    const preloaderImages = preloader.querySelector('.preloader-images');
    const videoBg = document.querySelector('video.hero__bg');
    document.body.classList.add('no-scroll');

    window.addEventListener('load', () => {
        preloaderImg.addEventListener('animationiteration', function () {
            preloaderImages.classList.add('finish');
            preloaderImages.addEventListener('animationend', function () {
                preloader.classList.add('loaded');
                preloader.addEventListener('transitionend', () => {
                    document.body.classList.remove('no-scroll');
                    videoBg.play();
                })
            });
        });
    })
}