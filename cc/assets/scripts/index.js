class PerfectMarquee {
    constructor(container, speed = 50) {
        this.container = container;
        this.content = container.querySelector('.marquee-content');
        this.speed = speed;
        this.init();
    }

    init() {
        const items = this.content.innerHTML;
        this.content.innerHTML = items + items;

        requestAnimationFrame(() => {
            this.updateAnimation();
        });

        window.addEventListener('resize', () => this.updateAnimation());
    }

    updateAnimation() {
        const contentWidth = this.content.scrollWidth / 2;

        const duration = contentWidth / this.speed;

        this.content.style.animationDuration = `${duration}s`;
    }

    setSpeed(newSpeed) {
        this.speed = newSpeed;
        this.updateAnimation();
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

    const marque =  new PerfectMarquee(document.getElementById('marque'), 70);


    const slider = new Swiper(".slider", {
        effect: "fade",
        fadeEffect: {
            crossFade: true,
        },
        loop:true,
        navigation: {
            nextEl: ".slider-button-next",
            prevEl: ".slider-button-prev",
            disabledClass: 'slider-button--disabled',
            lockClass: 'slider-button--lock'
        },
    });

    const productSlider = new Swiper(".product-slider", {
        slidesPerView:'auto',
        spaceBetween:24,
        breakpoints:{
            767:{
                spaceBetween:40,
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

    if(heroBg){
        if(window.innerWidth < 767){
            heroBg.src = heroBg.dataset.mobile;
        }else{
            heroBg.src = heroBg.dataset.desktop;
        }
        heroBg.play()
    }


    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach((card, index) => {
        const video = card.querySelector('video');

        if (!video) {
            return;
        }

        let animationFrame = null;

        const playReverse = () => {
            if (video.currentTime <= 0) {
                cancelAnimationFrame(animationFrame);
                // Убрали video.load() - теперь видео просто остановится на первом кадре
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

        video.muted = true;

        video.loop = true;
    });


    const nav = document.querySelector('.header-nav');
    const burger = document.querySelector('.burger');

    if(nav && burger){
        burger.addEventListener('click',e=>{
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
});

const preloader = document.querySelector('.preloader')

if (preloader) {
    const preloaderImg = document.querySelector('.preloader-image:last-child');
    const preloaderImages = preloader.querySelector('.preloader-images');
    const videoBg = document.querySelector('video.hero__bg');
    document.body.classList.add('no-scroll');

    window.addEventListener('load',()=>{
        console.log(preloaderImg)
        preloaderImg.addEventListener('animationiteration', function () {
            preloaderImages.classList.add('finish');
            preloaderImages.addEventListener('animationend', function () {
                preloader.classList.add('loaded');
                document.body.classList.remove('no-scroll');
                videoBg.play();
            });
        });
    })
}