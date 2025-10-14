const easeInOutCubic = (t) => {
    return t
}

const smoothScroll = (targetId) => {
    targetId = targetId.replace('#', '');

    const target = document.getElementById(targetId);
    if (!target) return;

    const headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height'));
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let start = null;

    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = easeInOutCubic(progress);

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        } else {
            window.scrollTo(0, targetPosition);
        }
    }

    requestAnimationFrame(animation);
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


document.addEventListener('DOMContentLoaded', function () {
    const photoInputs = document.querySelectorAll('.photo-input');

    if (photoInputs.length) {
        photoInputs.forEach(photoInput => {
            const fileInput = photoInput.querySelector('.photo-input__item');
            const imgLabel = photoInput.querySelector('.photo-input__label');
            const clearBtn = photoInput.querySelector('.photo-input__clear');

            fileInput.addEventListener('change', function (e) {
                const file = e.target.files[0];

                if (!file) return;

                // Проверка типа файла
                if (!file.type.startsWith('image/')) {
                    alert('Можно загружать только изображения');
                    fileInput.value = '';
                    return;
                }

                // Проверка размера файла (5 МБ = 5 * 1024 * 1024 байт)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Размер файла не должен превышать 5 МБ');
                    fileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    imgLabel.src = e.target.result;
                    photoInput.classList.add('loaded');
                };
                reader.readAsDataURL(file);
            });

            clearBtn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                fileInput.value = '';
                imgLabel.src = '';
                photoInput.classList.remove('loaded');
            });
        });
    }

    const burger = document.querySelector('.burger');
    const header = document.querySelector('.header');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (burger && header && mobileMenu) {
         window.innerWidth < 640 ? document.documentElement.style.setProperty('--header-height', `${header.getBoundingClientRect().height}px`) : document.documentElement.style.setProperty('--header-height', `${0}px`);
            burger.addEventListener('click', e => {
            e.preventDefault();

            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            header.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        })
    }

    document.addEventListener('click', function (event) {
        const link = event.target.closest('a[href*="#"]');

        if (link) {
            const href = link.getAttribute('href');

            const hashIndex = href.indexOf('#');

            if (hashIndex !== -1) {
                const hash = href.substring(hashIndex + 1);

                if (hash.length > 0) {
                    burger.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    header.classList.remove('active');
                    document.body.classList.remove('no-scroll');

                    smoothScroll(href);
                }
            }
        }
    });

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


    const formArray = document.querySelectorAll('.form-simple');

    if (formArray.length) {
        formArray.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const fd = new FormData(form);

                try {
                    const res = await fetch('/sendmail.php', {
                        method: 'POST',
                        body: fd,
                    });

                    const data = await res.json();
                    if (data.ok) {
                        showPopup('.popup-thanks')
                        form.reset();
                    } else {
                    }
                } catch (err) {
                }

            })
        })
    }

    const phoneArray = document.querySelectorAll('.js-phone');

    if (phoneArray.length) {
        phoneArray.forEach(phone => {
            IMask(
                phone,
                {
                    mask: '+{7}(000)000-00-00'
                }
            )
        })
    }

    const worksSliderElement = document.querySelector('.works-slider');


    if (worksSliderElement) {
        const worksSlider = new Swiper(worksSliderElement, {
            slidesPerView: 1,
            spaceBetween: 20,
            navigation: {
                prevEl: '.slider-button--prev',
                nextEl: '.slider-button--next',
                disabledClass: 'slider-button--disabled'
            },
            pagination: {
                el: '.slider-pagination',
                bulletClass: 'slider-pagination__bullet',
                bulletActiveClass: 'slider-pagination__bullet--active',
                lockClass: 'slider-pagination--lock'
            },
            breakpoints: {
                641: {
                    slidesPerView: 2
                }
            }
        })
    }

    const teamSliderElement = document.querySelector('.team-slider');

    if (teamSliderElement) {
        const teamSlider = new Swiper(teamSliderElement, {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: {
                prevEl: '.slider-button--prev',
                nextEl: '.slider-button--next',
                disabledClass: 'slider-button--disabled'
            },
            pagination: {
                el: '.slider-pagination',
                bulletClass: 'slider-pagination__bullet',
                bulletActiveClass: 'slider-pagination__bullet--active',
                lockClass: 'slider-pagination--lock'
            },
        })
    }
});
