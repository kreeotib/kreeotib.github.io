const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup__close')
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


document.addEventListener('DOMContentLoaded',()=>{
    const lenis = typeof Lenis !== 'undefined' ? new Lenis({smoothWheel: true, duration: 2, anchors: false}) : null;

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    const selectArray = document.querySelectorAll('.js-select');

    if (selectArray.length) {
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.js-select')) {
                selectArray.forEach(select => {
                    select.classList.remove('active')
                })
            }
        })
        selectArray.forEach(select => {
            const selectCurrent = select.querySelector('.js-select-current');

            selectCurrent.addEventListener('click', () => {
                select.classList.toggle('active');
            })

            select.addEventListener('change', (e) => {
                select.classList.remove('active');
                select.classList.add('filled');
                selectCurrent.querySelector('.js-select-current-text').textContent = e.target.value;
            })
        })
    }

    const rewardsSlider = new Swiper('.js-rewards-slider',{
        slidesPerView:'auto',
        spaceBetween:10,
        navigation:{
            nextEl:'.js-rewards-slider-button-next',
            prevEl:'.js-rewards-slider-button-prev'
        },
        breakpoints:{
            768:{
                spaceBetween:0,
            },
        }
    })
    const ratingsSlider = new Swiper('.js-ratings-slider',{
        slidesPerView:'auto',
        spaceBetween:10,
        navigation:{
            nextEl:'.js-ratings-slider-button-next',
            prevEl:'.js-ratings-slider-button-prev'
        }
    })

    const managementSlider = new Swiper('.js-management-slider',{
        slidesPerView:'auto',
        spaceBetween:30,
        navigation:{
            nextEl:'.js-management-slider-button-next',
            prevEl:'.js-management-slider-button-prev'
        }
    })

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


    const burger = document.querySelector('.menu-button'),
        menu = document.querySelector('.menu');

    if(burger){
        burger.addEventListener('click',e=>{
            e.preventDefault();
            burger.classList.toggle('burger--active');
            menu.classList.toggle('menu--active')
        })
    }
})