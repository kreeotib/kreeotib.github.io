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


document.addEventListener('DOMContentLoaded', () => {
    const heroCardsSlider = new Swiper('.hero-cards', {
        spaceBetween: 16,
        pagination: {
            el: ".hero-card__pagination",
            type: "fraction",
        },
        navigation: {
            nextEl: ".hero-cards__button--next",
            prevEl: ".hero-cards__button--prev",
            disabledClass: 'hero-cards__button--disabled',
            lockClass: 'hero-cards__button--lock'
        },
    })

    const heroSlider = new Swiper('.hero-slider', {
        spaceBetween: 0,
        loop:true,
        effect: "fade",
        speed:500,
        fadeEffect: {
            crossFade: true,
        },
        autoplay:{
            delay:3000,
        }
    })

    const bannerSlider = new Swiper('.page-banner__slider', {
        spaceBetween: 0,
        loop:true,
        effect: "fade",
        speed:500,
        fadeEffect: {
            crossFade: true,
        },
        navigation:{
            nextEl:'.page-banner__next'
        }
    })

    const aboutHero = new Swiper('.hero-about__slider', {
        spaceBetween: 0,
        loop:true,
        direction:"vertical",

        speed:500,

        slidesPerView:2,

        breakpoints:{
          768:{
              slidesPerView:1,
              direction: "horizontal",
              effect:"fade",
              fadeEffect:{
                  crossFade:true
              }
          }
        },
        pagination:{
            el:'.hero-about__pagination',
             clickable: true
        }
    })

    var aboutSlider = new Swiper(".about-slider", {
        grabCursor: true,
        effect: "creative",
        loop:true,
        speed:500,
        slideActiveClass: 'about-card--active',
        slideNextClass: 'about-card--next',
        slidePrevClass: 'about-card--prev',
        pagination: {
            el: '.about-slider__pagination',
            clickable:true
        },
        creativeEffect: {
            prev: {
                translate: [0, -170, 0],
                rotate: [0, 0, 0],
            },
            next: {
                translate: [0, -170, 0],
                rotate: [0, 0, 0],
            },
        },
    });

    // Add click event to all slides
    document.querySelectorAll('.swiper-slide').forEach((slide, index) => {
        slide.addEventListener('click', function () {
            // Get the real index (accounting for loop mode)
            const realIndex = this.getAttribute('data-swiper-slide-index');
            if (realIndex !== null) {
                aboutSlider.slideToLoop(parseInt(realIndex));
            }
        });
    });

    const productImgSlider = new Swiper('.product-slider', {

        pagination: {
            el: ".product-slider__pagination",
        },

    })


    const popularCards = new Swiper('.popular-cards', {
        spaceBetween: 8,
        slidesPerView: 2,
        pagination: {
            el: ".popular-cards__pagination",
            type: "fraction",
        },
        breakpoints: {
            768: {
                spaceBetween: 32,
                slidesPerView: 'auto'
            }
        }
    })


    const stepsSlider = new Swiper('.logistic-steps', {
        spaceBetween: 8,
        slidesPerView: 1,
        navigation: {
            nextEl: '.logistic-info__button--next',
            prevEl: '.logistic-info__button--prev',
            disabledClass: 'logistic-info__button--disabled'
        },
        breakpoints: {
            768: {
                spaceBetween: 16,
                slidesPerView: 3
            }
        }
    })

    const advantagesSlider = new Swiper('.advantages-slider', {
        spaceBetween: 8,
        slidesPerView: 'auto',
        navigation: {
            nextEl: '.advantages-slider-button-next',
            prevEl: '.advantages-slider-button-prev',
            disabledClass: 'slider-button--disabled'
        },
        breakpoints: {
            768: {
                spaceBetween: 24,
                slidesPerView: 'auto'
            }
        }
    })


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


    const customSelectArray = document.querySelectorAll('.custom-select');

    if (customSelectArray.length) {
        customSelectArray.forEach(select => {
            const selectLabel = select.querySelector('.custom-select__label');

            selectLabel.addEventListener('click', e => {
                e.preventDefault();
                select.classList.toggle('custom-select--active');
            })

            select.addEventListener('change', e => {
                const textContent = e.target.closest('.custom-select__item').textContent;

                selectLabel.querySelector('.custom-select__current').textContent = textContent
                select.classList.remove('custom-select--active');
            });
        })
    }

    const radios = document.querySelectorAll('input[name="cart-delivery"]');

    function updateBlocks() {
        const selectedRadio = document.querySelector('input[name="cart-delivery"]:checked');
        const deliveryType = selectedRadio ? selectedRadio.dataset.delivery : null;

        document.querySelectorAll('[data-delivery-block]').forEach(block => {
            block.style.display = (deliveryType && block.dataset.deliveryBlock === deliveryType) ? 'block' : 'none';
        });
    }

    if (radios) {
        updateBlocks();
        radios.forEach(radio => {
            radio.addEventListener('change', updateBlocks);
        });
    }

    const productCardArray = document.querySelectorAll('.product-card');

    if (productCardArray.length) {
        productCardArray.forEach(card => {
            const add2cartButton = card.querySelectorAll('.add-to-cart');

            if (add2cartButton.length) {
                add2cartButton.forEach(button => {
                    button.addEventListener('click', e => {
                        e.preventDefault();

                        card.classList.add('in-cart');
                        const cartLink = document.querySelectorAll('.cart-link')

                        if (cartLink.length) {
                            cartLink.forEach(link => {
                                link.classList.add('active');
                            })
                        }
                    })
                })
            }
        })
    }

    const radiosView = document.querySelectorAll('.catalog-view__item input[type="radio"]');
    const catalogGrid = document.querySelector('.catalog-grid');

    if (catalogGrid && radiosView.length) {
        if (!document.querySelector('.catalog-view__item input[type="radio"]:checked')) {
            radios[0].checked = true;
        }

        radiosView.forEach((radio) => {
            radio.addEventListener('change', () => {
                if (radio.value === 'list') {
                    catalogGrid.classList.add('catalog-grid--list');
                } else {
                    catalogGrid.classList.remove('catalog-grid--list');
                }
            });
        });

        const checkedRadio = document.querySelector('.catalog-view__item input[type="radio"]:checked');
        if (checkedRadio && checkedRadio.value === 'list') {
            catalogGrid.classList.add('catalog-grid--list');
        }
    }

    const passInputs = document.querySelectorAll('.input-item-pass');
    if (passInputs.length) {
        passInputs.forEach(item => {
            const input = item.querySelector('input');
            const icon = item.querySelector('.pass-icon');

            if (input && icon) {
                icon.addEventListener('click', () => {
                    input.type = input.type === 'password' ? 'text' : 'password';
                    item.classList.toggle('visible', input.type === 'text');
                });
            }
        });
    }

    const singleProduct = document.querySelector('.single');

    if (singleProduct) {
        const singleButton = singleProduct.querySelector('.single__button');

        // Запоминаем начальную высоту при загрузке
        let initialHeight = null;

        singleButton.addEventListener('click', e => {
            e.preventDefault();

            // Сохраняем начальную высоту только один раз
            if (initialHeight === null) {
                initialHeight = singleProduct.getBoundingClientRect().height;
            }

            // Получаем текущую высоту
            const currentHeight = singleProduct.getBoundingClientRect().height;
            singleProduct.style.height = `${currentHeight}px`;

            // Переключаем класс
            singleProduct.classList.toggle('active');

            // Анимируем к новой высоте
            requestAnimationFrame(() => {
                if (singleProduct.classList.contains('active')) {
                    // Открываем - полная высота
                    const fullHeight = singleProduct.scrollHeight;
                    singleProduct.style.height = `${fullHeight}px`;
                } else {
                    // Закрываем - возвращаем начальную высоту
                    singleProduct.style.height = `${initialHeight}px`;
                }
            });
        });
    }

    const fileInputWrappers = document.querySelectorAll('.file-input-wrapper');

    if (fileInputWrappers.length) {
        fileInputWrappers.forEach(wrapper => {
            const fileInput = wrapper.querySelector('.file-input__item');
            const fileGrid = wrapper.querySelector('.file-input__grid');

            if (!fileInput || !fileGrid) return;

            fileInput.addEventListener('change', function (e) {
                const files = Array.from(e.target.files);

                files.forEach(file => {
                    if (!file.type.match('image/(png|jpeg|jpg)')) {
                        alert('Допустимы только PNG и JPG изображения');
                        return;
                    }

                    const reader = new FileReader();

                    reader.onload = function (event) {
                        const imgContainer = document.createElement('div');
                        imgContainer.className = 'file-input__img';

                        const deleteBtn = document.createElement('span');
                        deleteBtn.className = 'file-input__delete';

                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.alt = file.name;

                        // Обработчик удаления
                        deleteBtn.addEventListener('click', function () {
                            imgContainer.remove();
                        });

                        imgContainer.appendChild(deleteBtn);
                        imgContainer.appendChild(img);
                        fileGrid.appendChild(imgContainer);
                    };

                    reader.readAsDataURL(file);
                });

                fileInput.value = '';
            });

            const existingDeleteBtns = fileGrid.querySelectorAll('.file-input__delete');
            existingDeleteBtns.forEach(btn => {
                btn.addEventListener('click', function () {
                    this.closest('.file-input__img').remove();
                });
            });
        });
    }


    const phoneInput = document.querySelectorAll('.js-phone-mask');
    const innInput = document.querySelectorAll('.js-inn-mask');
    const codeInput = document.querySelectorAll('.js-code-mask');
    const phoneMask = {
        mask: '+{7} (000) 000 - 00 - 00'
    };
    const innMask = {
        mask: '0000000000'
    };
    const codeMask = {
        mask: '0-0-0-0'
    };
    if (phoneInput.length) {
        phoneInput.forEach(phone => {
            const mask = IMask(phone, phoneMask);
        })
    }
    if (innInput.length) {
        innInput.forEach(inn => {
            const mask = IMask(inn, innMask);
        })
    }
    if (codeInput.length) {
        codeInput.forEach(code => {
            const mask = IMask(code, codeMask);
        })
    }


    const header = document.querySelector('.header');
    const mobileMenu = document.querySelector('.mobile-menu');
    const burger = document.querySelector(".burger");

    if (mobileMenu && burger) {
        burger.addEventListener('click', e => {
            e.preventDefault();

            header.classList.toggle('active');
            mobileMenu.classList.toggle('active')
            document.body.classList.toggle('no-scroll')
        })
    }
})