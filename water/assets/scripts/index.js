document.addEventListener('DOMContentLoaded', () => {
    const reviewsSlider = new Swiper('.reviews-slider', {
        slidesPerView: 1,
        spaceBetween: 30,
        breakpoints: {
            641: {
                slidesPerView: 2,
            },
            1241: {
                slidesPerView: 3,
            }
        },

        pagination: {
            el: '.reviews-slider-pagination'
        }
    })

    const heroSlider = new Swiper('.hero-slider', {
        slidesPerView: 1,
        pagination: {
            el: '.hero-slider-pagination'
        },
        navigation:{
            nextEl:'.hero-slider__button--next',
            prevEl:'.hero-slider__button--prev',
        }
    })

    const partnersSlider = new Swiper('.partners-list', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        breakpoints: {
            641: {
                spaceBetween: 20,
            }
        },

    })

    const productSlider = new Swiper('.product-slider', {
        slidesPerView: 1,
        spaceBetween: 24,
        breakpoints: {
            641: {
                slidesPerView: 2,
                spaceBetween:20,
            },
            1241: {
                slidesPerView: 3,
                spaceBetween:30,
            }
        },
        navigation:{
            nextEl:'.product-slider__button--next',
            prevEl:'.product-slider__button--prev',
        },
        pagination: {
            el: '.product-slider-pagination'
        }
    });


    const catalogFilter = document.querySelector('.catalog-filter');

    if(catalogFilter){
        const catalogFilterHeader = catalogFilter.querySelector('.catalog-filter__header'),
            catalogFilterContent = catalogFilter.querySelector('.catalog-filter__content');

        catalogFilterHeader.addEventListener('click',()=>{
            catalogFilter.classList.toggle('active')
        })
    }

    const selectArray = document.querySelectorAll('.select');

    if (selectArray.length) {
        document.addEventListener('click',e=>{
            if(!e.target.closest('.select')){
                selectArray.forEach(select => {
                    select.classList.remove('active');
                });
            }
        })
        selectArray.forEach(select => {
            const selectCurrent = select.querySelector('.select-current');
            selectCurrent.addEventListener('click', (e) => {
                e.preventDefault();
                selectArray.forEach(select => {
                    select.classList.remove('active');
                });

                select.classList.toggle('active');
                selectCurrent.classList.toggle('active');
            });

            select.addEventListener('change', (e) => {
                const selectText = e.target.closest('.select-item').querySelector('.select-item__text').textContent;
                select.querySelector('.js-select-current').textContent = selectText;
                select.classList.remove('active');
                selectCurrent.classList.remove('active');
            });
        });
    }
})