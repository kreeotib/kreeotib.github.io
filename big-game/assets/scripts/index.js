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
    const sliderAuto = new Swiper('.slider-auto',{
        slidesPerView:'auto',
        spaceBetween:40,

        navigation:{
            prevEl:'.slider-arrow-prev',
            nextEl:'.slider-arrow-next'
        },
        pagination:{
            el:'.slider-pagination'
        }
    });


    const eventsSlider = new Swiper('.events-slider',{
        slidesPerView:'auto',
        spaceBetween:40,

    });

    const faqItemList = document.querySelectorAll('.faq-item');

    if(faqItemList.length){
        faqItemList.forEach(faqItem=>{
            const faqItemHeader = faqItem.querySelector('.faq-item__header');

            if(faqItemHeader){
                faqItemHeader.addEventListener('click',e=>{
                    e.preventDefault();

                    faqItem.classList.toggle('active')
                })
            }
        })
    }

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


    const burger = document.querySelector('.burger'),
        mobileMenu = document.querySelector('.mobile-menu'),
        header = document.querySelector('.header');


    if(burger && mobileMenu && header){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            header.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        })
    }
})
