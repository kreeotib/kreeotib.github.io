document.addEventListener('DOMContentLoaded', e => {
    const blockSlider = new Swiper('.block-slider', {
        loop:true,
        effect: "fade",
        navigation:{
            nextEl:'.block-slider__button--next',
            prevEl:'.block-slider__button--prev',
        },
        pagination:{
            el:'.block-slider__pagination',
            bulletClass:'block-slider__bullet',
            bulletActiveClass:'block-slider__bullet--active'
        }
    })

    const singleSlider = new Swiper('.single-slider', {
        loop:true,
        slidesPerView:'auto',
        spaceBetween:30,
        navigation:{
            nextEl:'.single-slider__button--next',
            prevEl:'.single-slider__button--prev',
        },
    })

    const heroSliderNav = new Swiper(".hero-nav__slider", {
        spaceBetween: 16,
        slidesPerView: 'auto',
        freeMode: true,
        watchSlidesProgress: true,
        scrollbar: {
            el: ".hero-nav__scrollbar",
        },
        breakpoints:{
            768:{
                spaceBetween:50
            }
        }
    });
    const heroSlider = new Swiper(".hero-slider", {
        spaceBetween: 10,
        thumbs: {
            swiper: heroSliderNav,
        },
    });
})