class Animations {
    constructor() {
        this.animationWrapperArray = document.querySelectorAll('.animation-wrapper');
    }

    toggleAnimation(animationWrapperElement) {
        const animationItemArray = animationWrapperElement.querySelectorAll('.animation-item');

        animationItemArray.forEach((animationItemElement, animationItemIndex) => {
            animationItemElement.style.setProperty('--animation-delay', `${animationItemIndex * 0.2}s`);
            animationItemElement.classList.add('animated');
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

        const observer = new IntersectionObserver(this.handleIntersection.bind(this), {
            // rootMargin:''
        });
        this.animationWrapperArray.forEach(animationWrapper => {
            observer.observe(animationWrapper);
        });
    }
}

const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup-close')
    ) {
        hideAllPopups();
    }
};
const showPopup = popupId => {
    const popup = document.querySelector(popupId);
    if (!popup) return


    hideAllPopups();

    popup.classList.add('popup--active');
    document.body.classList.add('no-scroll');

    document.addEventListener('click', checkTargetOrKey);
    document.addEventListener('keyup', checkTargetOrKey);
};
const hideAllPopups = () => {
    const popups = document.querySelectorAll('.popup');

    popups.forEach(popup => {
        popup.classList.remove('popup--active');
    });
    document.body.classList.remove('no-scroll');

    document.removeEventListener('click', checkTargetOrKey);
    document.removeEventListener('keyup', checkTargetOrKey);
};


document.addEventListener("DOMContentLoaded", () => {
    const popupButtons = document.querySelectorAll('[data-popup]');
    const popups = document.querySelectorAll('.popup');

    if (popups.length) {
        popupButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const popupId = button.dataset.popup
                showPopup(popupId);
            });
        });
    }

    const animation = new Animations();
    animation.init();

    const lenis = new Lenis({
        anchors: {
            offset: -document.querySelector('.header').getBoundingClientRect().height,
            onClick: ()=>{
                console.log('scrolled to anchor')
            }
        },
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        header = document.querySelector('.header');

    if(burger && menu){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            header.classList.toggle('header--active');
            burger.classList.toggle('burger--active');
            menu.classList.toggle('menu--active');
            header.classList.add('sticky');

            menu.classList.contains('menu--active') ? lenis.stop() : lenis.start();
        })
    }

    if(menu){
        const anchorLinks = document.querySelectorAll('a');

        if (anchorLinks.length) {
            anchorLinks.forEach(link => {
                if (link.hash.length > 0) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        burger.classList.remove('burger--active');
                        menu.classList.remove('menu--active');
                        header.classList.remove('header--active');
                        lenis.start();
                    })
                }
            });
        }
    }

    const stickyElm = document.querySelector('.header')

    const observer = new IntersectionObserver(
        ([e]) => {e.target.classList.toggle('sticky', e.intersectionRatio < 1), document.body.classList.toggle('header-active')},
        {threshold: [1]}
    );

    observer.observe(stickyElm);



    initMap();

    async function initMap() {
        // Промис `ymaps3.ready` будет зарезолвлен, когда загрузятся все компоненты основного модуля API
        await ymaps3.ready;

        const {YMap, YMapDefaultSchemeLayer, YMapMarker, YMapDefaultFeaturesLayer} = ymaps3;

        // Иницилиазируем карту
        const map = new YMap(
            // Передаём ссылку на HTMLElement контейнера
            document.querySelector('.contact-map'),

            // Передаём параметры инициализации карты
            {
                location: {
                    // Координаты центра карты
                    center: [55.770041, 37.579412],

                    // Уровень масштабирования
                    zoom: 10
                }
            }
        );

        // const markerElement = document.createElement('div');
        // markerElement.className = 'map-pin';
        //
        // const marker = new YMapMarker(
        //     {
        //         coordinates: [55.770041, 37.579412],
        //     },
        //     markerElement
        // );
        // map.addChild(new YMapDefaultFeaturesLayer());
        // map.addChild(marker);

        // Добавляем слой для отображения схематической карты
        map.addChild(new YMapDefaultSchemeLayer({
        }));
    }
})