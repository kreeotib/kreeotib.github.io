document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.burger'),
        header = document.querySelector('.header');

    if(burger && header){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('burger--active');
            header.classList.toggle('header--active');
            document.body.classList.toggle('no-scroll');
        })
    }
    const documentSliderElement = document.querySelector('.documents-slider');

    if (documentSliderElement) {
        const documentSlider = new Swiper(documentSliderElement, {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: {
                nextEl: '.documents-slider-button-next',
                prevEl: '.documents-slider-button-prev',
            },
            pagination: {
                el: '.documents-slider-pagination',
                bulletClass: 'slider-pagination__item',
                bulletActiveClass: 'slider-pagination__item--active',
            },
        })
    }

    const cardSliderElement = document.querySelector('.card-slider');

    if (cardSliderElement) {
        const cardSlider = new Swiper('.card-slider', {
            slidesPerView: 'auto',
            spaceBetween: 24,
        })
    }


    const cardSliderGalleryElement = document.querySelector('.card-gallery');

    if (cardSliderGalleryElement) {
        const cardGallery = new Swiper('.card-gallery', {
            slidesPerView: 1,
            navigation: {
                nextEl: '.card-gallery-button-next',
                prevEl: '.card-gallery-button-prev',
            },
            touchEventsTarget:'container',
            pagination: {
                el: '.card-gallery-pagination',
                bulletClass: 'slider-pagination__item',
                bulletActiveClass: 'slider-pagination__item--active',
            },
        });
    }


    const fileInputArray = document.querySelectorAll('.js-file-input');

    if (fileInputArray.length) {
        fileInputArray.forEach(fileInputBlock => {
            const fileInputElement = fileInputBlock.querySelector('input[type="file"]'),
                fileInputTextElement = fileInputBlock.querySelector('.js-file-input-text');
            if (!fileInputElement && fileInputTextElement) return false;
            fileInputElement.addEventListener('change', function () {
                const fileName = this.files[0] ? this.files[0].name : 'Файл';
                fileInputBlock.querySelector('.js-file-input-text').value = fileName;
            });
        })
    }

});