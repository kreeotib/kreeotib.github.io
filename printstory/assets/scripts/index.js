const initTabs = () => {
    const tabs = [...document.querySelectorAll(".tabs")];

    if (tabs.length > 0) {
        tabs.forEach((tab) => {
            const tabContent = [...tab.querySelectorAll(".tabs__content")];
            const tabLinks = [...tab.querySelectorAll(".tabs__link")];

            const openTab = (tabIndex = 0) => {
                tabContent.forEach((element, i) => {
                    const isActive = i === tabIndex;
                    element.classList.toggle("active", isActive);
                });

                tabLinks.forEach((element, i) => {
                    element.classList.toggle("active", i === tabIndex);
                });
            }

            openTab(0)

            tabLinks.forEach((link, i) => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    openTab(i);
                });
            });
        });
    }
}


const formatNumberWithSpaces = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}


document.addEventListener('DOMContentLoaded', () => {
    initTabs();

    const shapePaperArray = document.querySelectorAll('.shape-paper');

    if (shapePaperArray.length) {
        shapePaperArray.forEach(shapePaper => {
            const shapePaperPrice = shapePaper.querySelector('.js-shape-price');
            if (!shapePaperPrice) return false;
            const shapePaperChecked = shapePaper.querySelector(':checked');
            if (shapePaperChecked) {
                shapePaperPrice.innerHTML = formatNumberWithSpaces(shapePaperChecked.dataset.price);
            }

            shapePaper.addEventListener('change', e => {
                shapePaperPrice.innerHTML = formatNumberWithSpaces(e.target.dataset.price)
            });
        });
    }


    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu');

    if (burger && menu) {
        burger.addEventListener('click', e => {
            e.preventDefault();

            menu.classList.toggle('menu--active');
            burger.classList.toggle('burger--active');
            document.body.classList.toggle('no-scroll');
        })
    }

    const singleSlider = document.querySelector('.single-slider');

    if (singleSlider) {
        const singleSliderSwiper = new Swiper(singleSlider, {
            slidesPerView: 1,
            pagination: {
                el: '.single-slider-pagination',
            },
        });
    }

    const infoSliderNav = document.querySelector('.info-slider__nav'),
        infoSliderMain = document.querySelector('.info-slider-main');

    if (infoSliderMain && infoSliderNav) {
        const infoSliderNavSwiper = new Swiper(infoSliderNav, {
            spaceBetween: 2,
            slidesPerView: 'auto',
            freeMode: true,
            watchSlidesProgress: true,
        });
        const infoSliderMainSwiper = new Swiper(infoSliderMain, {
            spaceBetween: 10,
            thumbs: {
                swiper: infoSliderNavSwiper,
            },
        });
    }

    const selectArray = document.querySelectorAll('.select');

    if (selectArray.length) {
        selectArray.forEach(select => {
            const selectCurrent = select.querySelector('.select-current');
            selectCurrent.addEventListener('click', (e) => {
                e.preventDefault();

                select.classList.toggle('active');
                selectCurrent.classList.toggle('active');
            });

            select.addEventListener('change', (e) => {
                const selectText = e.target.closest('.select-label').querySelector('.select-label__text').textContent;
                select.querySelector('.js-select-current').textContent = selectText;
                select.classList.remove('active');
                selectCurrent.classList.remove('active');
            })
        });
    }
    const scrollBlock = document.querySelector('.product-card');
    const targetBlock = document.querySelector('.product-card--fixed');
    let lastScrollTop = 0;

    if (scrollBlock && targetBlock) {
        window.addEventListener('scroll', function() {
            let currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

            if (currentScrollTop > scrollBlock.offsetTop + scrollBlock.offsetHeight) {
                if (currentScrollTop > lastScrollTop) {
                    targetBlock.classList.add('active');
                } else {
                    targetBlock.classList.remove('active');
                }
            } else {
                targetBlock.classList.remove('active');
            }

            lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
        });
    }
})