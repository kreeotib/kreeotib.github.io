document.addEventListener('DOMContentLoaded',()=>{
    const residentsSlider = new Swiper('.residents-slider',{
        slidesPerView:'auto',
        spaceBetween:20,
        centeredSlides:true,
        initialSlide: 1,
        navigation:{
            nextEl:".residents-slider-button-next",
            prevEl:'.residents-slider-button-prev'
        }
    })

    const eventsSlider = new Swiper('.events-slider',{
        slidesPerView:'auto',
        spaceBetween:20,
        navigation:{
            nextEl:".events-slider-button-next",
            prevEl:'.events-slider-button-prev'
        }
    });


    const projectsNav = new Swiper(".projects-nav", {
        spaceBetween: 30,
        slidesPerView: 'auto',
        freeMode: true,
        watchSlidesProgress: true,
    });
    const projectsSlider = new Swiper(".projects-slider__item", {
        spaceBetween: 10,
        navigation: {
            nextEl: ".projects-slider-button-next",
            prevEl: ".projects-slider-button-prev",
        },
        thumbs: {
            swiper: projectsNav,
        },
    });
})