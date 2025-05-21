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
        await ymaps3.ready;
        const {
            YMap,
            YMapDefaultSchemeLayer,
            YMapDefaultFeaturesLayer,
            YMapMarker
        } = ymaps3;
        const map = new YMap(
            document.getElementById('map'), {
                location: {
                    center: [37.589853, 55.733426],

                    zoom: 15
                }
            }
        );
        map.addChild(new YMapDefaultSchemeLayer());
        map.addChild(new YMapDefaultFeaturesLayer());
        const markerElement = document.createElement('div');
        markerElement.className = 'marker-class';
        markerElement.innerText = "I'm marker!";
        const marker = new YMapMarker({
                source: 'markerSource',
                coordinates: [37.589853, 55.733426],
                draggable: true,
                mapFollowsOnDrag: true
            },
            markerElement
        );
        map.addChild(marker);
    }
})