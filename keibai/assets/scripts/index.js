let newData = [];

const createSliderCards = (cars, slider) => {
    const cardArray = '';
    slider.removeSlide(0)
    cars.forEach(car => {
        const card = `
             <div class="auto-card__wrapper">
                    <div class="auto-card__img">
                        <img src="assets/images/auto/${car.id}/1.jpg" alt="">
                    </div>
                    <div class="auto-card__content">
                        <div class="auto-card__block auto-card__block--end">
                            <p class="auto-card__title">
                                ${car.name}
                            </p>
                            <p class="auto-card__year auto-card__text">
                                ${car.year}
                            </p>
                        </div>
                        <div class="auto-card__block auto-card__block--info">
                            <div class="auto-card__info">
                                <svg class="auto-card__icon">
                                    <use xlink:href="assets/images/sprite.svg#speedometer"></use>
                                </svg>
                                <p class="auto-card__text">
                                    ${car.mileage} км
                                </p>
                            </div>
                            <div class="auto-card__info">
                                <svg class="auto-card__icon">
                                    <use xlink:href="assets/images/sprite.svg#gasoline"></use>
                                </svg>
                                <p class="auto-card__text">
                                      ${car.fuel}
                                </p>
                            </div>
                            <div class="auto-card__info">
                                <svg class="auto-card__icon">
                                    <use xlink:href="assets/images/sprite.svg#transmission"></use>
                                </svg>
                                <p class="auto-card__text">
                                    ${car.transmission}
                                </p>
                            </div>
                        </div>
                        <div class="auto-card__block">
                            <p class="auto-card__price">
                                ${car.price} ₽
                            </p>
                            <svg class="auto-card__link">
                                <use xlink:href="assets/images/sprite.svg#arrow"></use>
                            </svg>
                        </div>
                    </div>
                </div>
        `
        const tempDiv = document.createElement('div');
        tempDiv.classList.add("swiper-slide", "auto-slider__card", "auto-card")
        tempDiv.innerHTML = card;
        tempDiv.addEventListener('click', (e) => {
            e.preventDefault();
            showAutoPopup(car.id);
        });

        slider.addSlide(1, tempDiv);
    });
}

const showAutoPopup = (id) => {
    const newCard = createPopupCard(newData.find(car => car.id === id));

    const autoSingle = document.querySelector('.auto-single');
    autoSingle.innerHTML = newCard;

    const objectNavSlider = new Swiper('.single-slider-nav', {
        spaceBetween: 10,
        slidesPerView: 'auto',
        // freeMode: true,
        watchSlidesProgress: true,
        direction: 'horizontal',
        observer: true,
        breakpoints: {
            768: {
                direction: 'vertical',
                spaceBetween: 20,
            },
            1025: {
                direction: 'horizontal'
            }
        }
    });
    const objectSlider = new Swiper('.single-slider-main', {
        spaceBetween: 20,
        slidesPerView: 1,
        observer: true,
        navigation: {
            nextEl: '.single-slider-button-next',
            prevEl: '.single-slider-button-prev',
        },
        thumbs: {
            swiper: objectNavSlider,
        },
    });

    const autoSingleStar = autoSingle.querySelectorAll('.auto-star__item');

    const points = +newData.find(car => car.id === id).points;
    autoSingleStar.forEach((star, starIndex) => {
        star.classList.remove('auto-star__item--half');
        if (starIndex + 1 < points) {
            star.classList.add('active')
        } else {
            star.classList.remove('active');
        }
    });

    if (isFloat(points)) {
        autoSingleStar[Math.floor(points)].classList.add('auto-star__item--half');
    }

    showPopup('.popup-auto');
}

function isFloat(num) {
    return typeof num === 'string' ? !isNaN(parseFloat(num)) && num.includes('.') : typeof num === 'number' && num % 1 !== 0;
}

const createPopupCard = (car) => {
    let imageArray = '';
    for (let i = 0; i < car.imagesCount; i++) {
        imageArray += `<div class="swiper-slide single-slider__item">
                            <img src="assets/images/auto/${car.id}/${i + 1}.jpg" alt="" class="single-slider__img">
                        </div>`

    }
    const card = `
    <div class="auto-single__wrapper">
        <p class="auto-single__title auto-single__title--mobile">
            ${car.name}
        </p>
        <div class="auto-single__img">
            <div class="auto-single__slider">
                <div class="single-slider single-slider-main swiper">
                    <div class="swiper-wrapper">
                        ${imageArray}
                    </div>
                    <div class="slider-button slider-button--white slider-button--prev single-slider-button single-slider-button-prev">
                        <svg class="slider-button__icon">
                            <use xlink:href="assets/images/sprite.svg#arrow"></use>
                        </svg>
                    </div>
                    <div class="slider-button slider-button--white slider-button--next single-slider-button single-slider-button-next">
                        <svg class="slider-button__icon">
                            <use xlink:href="assets/images/sprite.svg#arrow"></use>
                        </svg>
                    </div>
                </div>
                <div class="single-slider single-slider-nav swiper">
                    <div class="swiper-wrapper">
                            ${imageArray}
                    </div>
                </div>
            </div>
        </div>
        <div class="auto-single__content">
            <p class="auto-single__title">
                ${car.name}
            </p>
            <div class="auto-single__info">
                <div class="auto-table">
                    <div class="auto-table__row">
                        <p class="auto-table__text">
                            Год выпуска
                        </p>
                        <p class="auto-table__title">
                           ${car.year}
                        </p>
                    </div>
                    <div class="auto-table__row">
                        <p class="auto-table__text">
                            Пробег
                        </p>
                        <p class="auto-table__title">
                             ${car.mileage} км
                        </p>
                    </div>
                    <div class="auto-table__row">
                        <p class="auto-table__text">
                            Вид топлива
                        </p>
                        <p class="auto-table__title">
                              ${car.fuel}
                        </p>
                    </div>
                    <div class="auto-table__row">
                        <p class="auto-table__text">
                            Объём двигателя
                        </p>
                        <p class="auto-table__title">
                               ${car.engine} л
                        </p>
                    </div>
                    <div class="auto-table__row">
                        <p class="auto-table__text">
                            Трнасмиссия
                        </p>
                        <p class="auto-table__title">
                            ${car.transmission}
                        </p>
                    </div>
                    <div class="auto-table__row">
                        <p class="auto-table__text">
                            Привод
                        </p>
                        <p class="auto-table__title">
                           ${car.drive}
                        </p>
                    </div>
                </div>
                <div class="auto-grade">
                    <div class="auto-star auto-grade__item">
                                  <div class="auto-star__item">
                                        <svg class="auto-star__icon ">
                                            <use xlink:href="assets/images/sprite.svg#star"></use>
                                        </svg>
                                        <div class="auto-star__wrapper">
                                            <svg class="auto-star__icon auto-star__icon--fill">
                                                <use xlink:href="assets/images/sprite.svg#star"></use>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="auto-star__item">
                                        <svg class="auto-star__icon ">
                                            <use xlink:href="assets/images/sprite.svg#star"></use>
                                        </svg>
                                        <div class="auto-star__wrapper">
                                            <svg class="auto-star__icon auto-star__icon--fill">
                                                <use xlink:href="assets/images/sprite.svg#star"></use>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="auto-star__item">
                                        <svg class="auto-star__icon ">
                                            <use xlink:href="assets/images/sprite.svg#star"></use>
                                        </svg>
                                        <div class="auto-star__wrapper">
                                            <svg class="auto-star__icon auto-star__icon--fill">
                                                <use xlink:href="assets/images/sprite.svg#star"></use>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="auto-star__item">
                                        <svg class="auto-star__icon ">
                                            <use xlink:href="assets/images/sprite.svg#star"></use>
                                        </svg>
                                        <div class="auto-star__wrapper">
                                            <svg class="auto-star__icon auto-star__icon--fill">
                                                <use xlink:href="assets/images/sprite.svg#star"></use>
                                            </svg>
                                        </div>
                                    </div>
                                    <div class="auto-star__item">
                                        <svg class="auto-star__icon ">
                                            <use xlink:href="assets/images/sprite.svg#star"></use>
                                        </svg>
                                        <div class="auto-star__wrapper">
                                            <svg class="auto-star__icon auto-star__icon--fill">
                                                <use xlink:href="assets/images/sprite.svg#star"></use>
                                            </svg>
                                        </div>
                                    </div>
                    </div>
                   <div class="auto-grade__item auto-grade__item--question auto-grade__item--square">
                                    ?
                                </div>
                                <div class="auto-grade__item auto-grade__item--info ">
                                    Аукционная оценка
                                </div>
                </div>
                <div class="auto-table">
                    <div class="auto-table__row">
                        <p class="auto-table__text">
                            Средняя цена во Владивостоке
                        </p>
                        <p class="auto-table__title">
                           ${car.averagePrice} ₽
                        </p>
                    </div>
                    <div class="auto-table__row">
                        <p class="auto-table__text auto-table__text--semibold">
                            Цена с&nbsp;привозом&nbsp;под&nbsp;ключ
                        </p>
                        <p class="auto-table__title auto-table__title--price">
                            ${car.price} ₽
                        </p>
                    </div>
                </div>
            </div>
            <a href="#" onclick="showPopup('.popup-question')" class="button button--base button--accent">Консультация</a>
        </div>
    </div>
    `

    return card;
}

const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup__close')
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


document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        header = document.querySelector('.header');

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

    if (burger) {
        burger.addEventListener('click', (e) => {
            e.preventDefault();

            menu.classList.toggle('menu--active');
            burger.classList.toggle('burger--active');
            document.body.classList.toggle('no-scroll');
            if (!header.classList.contains('header--fixed')) header.classList.toggle('header--fixed');
        });
    }
    window.addEventListener('scroll', () => header.classList.toggle('header--fixed', window.scrollY > 0));

    const heroSlider = new Swiper('.hero-slider-element', {
        slidesPerView: 1,
        spaceBetween: 0,
        loop: true,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        pagination: {
            el: ".hero-slider-pagination",
        },
        navigation: {
            nextEl: '.hero-slider-button-next',
            prevEl: '.hero-slider-button-prev',
        },
        init: false,
        autoplay: {
            delay: 10000,
            disableOnInteraction: false,
        },
        breakpoints: {
            767: {
                spaceBetween: 30,
            }
        }
    });

    heroSlider.init();

    const autoSlider = new Swiper('.auto-slider-element', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        pagination: {
            el: ".auto-slider-pagination",
            type: "fraction",
        },
        navigation: {
            nextEl: '.auto-slider-button-next',
            prevEl: '.auto-slider-button-prev',
        },
        observer: true,
        breakpoints: {
            767: {
                spaceBetween: 30,
            }
        }
    });

    fetch('assets/data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            createSliderCards(data.cars, autoSlider);
            newData = data.cars;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });





    const popupGallery = new Swiper('.popup-gallery', {
        slidesPerView: 1,
        spaceBetween: 0,
        effect: 'fade',
        fadeEffect: {
            crossFade: true
        },
        navigation: {
            nextEl: '.popup-gallery-button-next',
            prevEl: '.popup-gallery-button-prev',
        },
    });


    const textExpandArray = document.querySelectorAll('.questions-item');

    if (textExpandArray.length) {
        textExpandArray.forEach(textExpand => {
            const textExpandElement = textExpand.querySelector('.questions-item__text');
            textExpand.style.setProperty('--text-height', `${textExpandElement.clientHeight}px`)
            textExpand.addEventListener('change', () => {
                const textExpandElement = textExpand.querySelector('.questions-item__text');
                textExpand.style.setProperty('--text-height', `${textExpandElement.clientHeight}px`);
                textExpandArray.forEach(element=>{
                    const input = element.querySelector('input');
                    element !== textExpand ? input.checked = false : null;
                })
            });
        });
    }


    const form = document.querySelectorAll('form');

    if (form.length) {
        form.forEach(element => {
            element.addEventListener('submit', (e) => {
                e.preventDefault();

                showPopup('.popup-thanks')
            });
        })
    }
    const galleryImgArray = [...document.querySelectorAll('.gallery-img')]
    galleryImgArray.forEach(img => {
        const src = img.src;
        const match = src.match(/\/(\d+)\.jpg$/);

        if (match) {
            const numberBeforeJpg = match[1];
            img.dataset.index = numberBeforeJpg;
        } else {
            console.log("No match found");
        }
        img.addEventListener('click', (e) => {
            e.preventDefault();

            showPopup('.popup-reviews');
            popupGallery.slideTo(+img.dataset.index - 1
            );
        });
    })



    const uniqueArray = galleryImgArray.filter((img, index, self) =>
            index === self.findIndex((t) => (
                t.src === img.src
            ))
    ).sort((a, b) => {
        const indexA = Number(a.dataset.index);
        const indexB = Number(b.dataset.index);

        if (indexA < indexB) {
            return -1;
        }
        if (indexA > indexB) {
            return 1;
        }
        return 0;
    });

    popupGallery.removeAllSlides();
    uniqueArray.forEach((element,index) => {
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide', 'popup-gallery__item');

        const clonedElement = element.cloneNode(true); // true for deep clone
        slide.append(clonedElement);

        popupGallery.addSlide(index, slide);
    });


    const videoWidget = document.querySelector('.video-widget');

    if(videoWidget){
        const video = videoWidget.querySelector('video'),
            videoClose = videoWidget.querySelector('.video-widget-close'),
            videoMute = videoWidget.querySelector('.video-widget-mute');

        video.play();
        video.controls = false;
        video.muted = true;
        video.loop = true;

        videoWidget.addEventListener('click',(e)=>{
           e.preventDefault();

            if(!e.target.closest('.video-widget__controls')){
                videoWidget.classList.add('active');
                video.muted = false;
                video.currentTime = 0;
                videoMute.classList.remove('muted');
            }
        });

        videoClose.addEventListener('click',(e)=>{
            e.preventDefault();
            videoWidget.classList.remove('active');
            video.muted = true;

        });

        videoMute.addEventListener('click',(e)=>{
            e.preventDefault();
            video.muted = !video.muted; // Toggle the muted property
            if (video.muted) {
                videoMute.classList.add('muted'); // Add class if muted
            } else {
                videoMute.classList.remove('muted'); // Remove class if unmuted
            }
        });
    }

});