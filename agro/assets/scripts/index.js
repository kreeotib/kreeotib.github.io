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




document.addEventListener('DOMContentLoaded',()=>{
    const heroCardsSlider = new Swiper('.hero-cards',{
        spaceBetween:16,
        pagination: {
            el: ".hero-card__pagination",
            type: "fraction",
        },
        navigation: {
            nextEl: ".hero-cards__button--next",
            prevEl: ".hero-cards__button--prev",
            disabledClass:'hero-cards__button--disabled',
            lockClass:'hero-cards__button--lock'
        },
    })

    const productImgSlider = new Swiper('.product-slider',{

        pagination: {
            el: ".product-slider__pagination",
        },

    })


    const popularCards = new Swiper('.popular-cards',{
        spaceBetween: 32,
        slidesPerView:'auto',
        pagination: {
            el: ".popular-cards__pagination",
            type: "fraction",
        },
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
})