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
    if(passInputs.length){
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

    if(singleProduct){
        const singleButton = singleProduct.querySelector('.single__button');

        singleProduct.addEventListener('click',e=>{
            e.preventDefault();

            singleProduct.classList.toggle('active');
        })
    }

    const fileInputWrappers = document.querySelectorAll('.file-input-wrapper');

    if(fileInputWrappers.length){
        fileInputWrappers.forEach(wrapper => {
            const fileInput = wrapper.querySelector('.file-input__item');
            const fileGrid = wrapper.querySelector('.file-input__grid');

            if (!fileInput || !fileGrid) return;

            fileInput.addEventListener('change', function(e) {
                const files = Array.from(e.target.files);

                files.forEach(file => {
                    if (!file.type.match('image/(png|jpeg|jpg)')) {
                        alert('Допустимы только PNG и JPG изображения');
                        return;
                    }

                    const reader = new FileReader();

                    reader.onload = function(event) {
                        const imgContainer = document.createElement('div');
                        imgContainer.className = 'file-input__img';

                        const deleteBtn = document.createElement('span');
                        deleteBtn.className = 'file-input__delete';

                        const img = document.createElement('img');
                        img.src = event.target.result;
                        img.alt = file.name;

                        // Обработчик удаления
                        deleteBtn.addEventListener('click', function() {
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
                btn.addEventListener('click', function() {
                    this.closest('.file-input__img').remove();
                });
            });
        });
    }

})