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

document.addEventListener('DOMContentLoaded',()=>{
    initTabs();

    const documentsSlider = new Swiper('.documents-slider', {
        slidesPerView: 'auto',
        spaceBetween:4,
        navigation: {
            nextEl: '.documents-slider__button--next',
            prevEl: '.documents-slider__button--prev',
        },
        breakpoints:{
            768:{
                slidesPerView:4,
                spaceBetween: 30,
            },
            1240:{
                slidesPerView:4,
                spaceBetween:70,
            }
        }
    });

    const bannerSlider = new Swiper('.banner-slider', {
        pagination: {
            el: '.banner-slider__pagination',
        },
    });
})