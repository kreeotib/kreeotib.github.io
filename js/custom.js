document.addEventListener("DOMContentLoaded", function () {
    // $.ajax({
    //     url:     '/ajax/getcnt.php',
    //     dataType: "json",
    //     type:     "GET",
    //     success: function(response) {
    //         $('#favorite').html(response.FAVORITES);
    //         $('#compare').html(response.COMPARE);
    //         $('#basket').html(response.BASKET);
    //     },
    //     error: function(jqXHR, textStatus, errorThrown){ // Ошибка
    //         console.log('Error: '+ errorThrown);
    //     }
    // });


    const contactSlider = new Swiper('.contact-slider', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        navigation: {
            nextEl: '.contact-slider__button--next',
            prevEl: '.contact-slider__button--prev',
        },

    });

    const bannerSlider = new Swiper('.banner-slider-element', {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: {
            el: '.banner-slider__pagination',
        },

        effect: "fade",
    });

    const productImgSlider = new Swiper('.product-card__slider', {
        slidesPerView: 1,
        spaceBetween: 10,
        pagination: {
            el: '.product-card__pagination',
        },
    });

    const mobileFilter = document.querySelector('.mobile-filter'),
        filterButtonArray = document.querySelectorAll('.js-filter-button');

    if(filterButtonArray.length && mobileFilter){
        filterButtonArray.forEach(button=>{
            button.addEventListener('click',(e)=>{
                e.preventDefault();

                mobileFilter.classList.toggle('active')
            })
        })
    }


    const sortArray = document.querySelectorAll('.sort');

    if(sortArray.length){
        sortArray.forEach(sort=>{
            const sortCurrent = sort.querySelector('.sort-select__current');
            sortCurrent.addEventListener('click',(e)=>{
                e.preventDefault();

                sort.classList.toggle('active');
            });

            sort.addEventListener('change',(e)=>{
                const sortText = e.target.closest('.sort-input').querySelector('.sort-input__text').textContent;

                sortCurrent.querySelector('span').textContent = sortText;

                sort.classList.remove('active')
            })
        });
    }

    const rangeArray = document.querySelectorAll('.js-range');

    if (rangeArray.length > 0) {
        rangeArray.forEach(range => {
            const rangeElement = range.querySelector('.range-slider'),
                rangeMax = rangeElement.dataset.max,
                rangeMin = rangeElement.dataset.min,
                rangeStep = rangeElement.dataset.step || 1,
                rangeInputMin = range.querySelector('.js-range-from-input'),
                rangeInputMax = range.querySelector('.js-range-to-input');
            const newEvent = new Event('change', {bubbles: true});
            if (rangeInputMin && rangeInputMax) {
                const rangeSliderElement = rangeSlider(rangeElement, {
                    min: rangeMin,
                    max: rangeMax,
                    step: rangeStep,
                    value: [rangeMin, rangeMax],
                    disabled: false,
                    rangeSlideDisabled: false,
                    thumbsDisabled: [false, false],
                    orientation: 'horizontal',
                    onInput: function (valueSet) {
                        rangeInputMin.value = valueSet[0];
                        rangeInputMax.value = valueSet[1];

                        // rangeInputMin.dispatchEvent(newEvent);
                        // rangeInputMax.dispatchEvent(newEvent);
                    },
                });

                rangeInputMin.value = rangeMin;
                rangeInputMax.value = rangeMax;

                rangeInputMin.addEventListener('input', () => {
                    rangeSliderElement.value([rangeInputMin.value, rangeInputMax.value])
                });
                rangeInputMax.addEventListener('input', () => {
                    rangeSliderElement.value([rangeInputMin.value, rangeInputMax.value])
                });
                //
                // rangeInputMax.dispatchEvent(newEvent);
                // rangeInputMin.dispatchEvent(newEvent);
            }
        });
    }

    const toggleBlockArray = document.querySelectorAll('.js-toggle-block');

    if(toggleBlockArray.length){
        toggleBlockArray.forEach(block=>{
            const blockLink = block.querySelector('.js-toggle-block-link');

            if(blockLink){
                blockLink.addEventListener('click',(e)=>{
                    e.preventDefault();

                    block.classList.toggle('active')
                })
            }
        })
    }



    Fancybox.bind("[data-fancybox]", {
        // Your custom options
    });
});