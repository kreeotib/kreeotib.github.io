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
})