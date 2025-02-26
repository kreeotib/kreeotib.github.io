document.addEventListener('DOMContentLoaded',()=>{
    const documentsSlider = new Swiper('.documents-slider', {
        slidesPerView: 'auto',
        spaceBetween:4,
        navigation: {
            nextEl: '.documents-slider__button--next',
            prevEl: '.documents-slider__button--prev',
        },
        breakpoints:{
            768:{
                slidesPerView:4,
                spaceBetween: 30,
            },
            1240:{
                slidesPerView:4,
                spaceBetween:70,
            }
        }
    });

    const bannerSlider = new Swiper('.banner-slider', {
        pagination: {
            el: '.banner-slider__pagination',
        },
    });
})