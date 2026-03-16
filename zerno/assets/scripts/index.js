document.addEventListener('DOMContentLoaded', () => {
    const gallerySliderElement = document.querySelector('.gallery-slider-element');
    const gallerySlider = new Swiper(gallerySliderElement, {
        init:false,
        slidesPerView: 1,
        speed: 500,
        navigation: {
            prevEl: '.gallery-slider-button-prev',
            nextEl: '.gallery-slider-button-next'
        }
    });

    if(gallerySliderElement){
        gallerySlider.init()
    }


    const nominationsSliderElement = document.querySelector('.nominations-slider');
    const nominationsSlider = new Swiper(nominationsSliderElement, {
        init:false,
        slidesPerView: "auto",
        speed: 500,
        spaceBetween:30,
        navigation: {
            prevEl: '.nominations-slider-button-prev',
            nextEl: '.nominations-slider-button-next'
        }
    });

    if(nominationsSliderElement){
        nominationsSlider.init()
    }


    const selectArray = document.querySelectorAll('select');

    if(selectArray.length){
        selectArray.forEach(select=>{
            select.addEventListener('change', () => {
                select.blur();
            });
        })
    }
});