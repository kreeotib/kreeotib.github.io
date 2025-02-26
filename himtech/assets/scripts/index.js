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

    const fileInputArray = document.querySelectorAll('.js-file-input');

    if(fileInputArray.length){
        fileInputArray.forEach(input=>{
            input.addEventListener('change', function(event) {
                const fileInput = event.target;
                const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : null;

                input.classList.add('loaded');
                const fileNameElement = input.querySelector('.js-file-input-name');

                if(fileNameElement){
                    fileNameElement.textContent = fileName;
                }
            });
        })
    }


    const headerMenu = document.querySelector('.header__menu');

    if(headerMenu){
        let lastScrollTop = 0;
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            headerMenu.classList.toggle('header__menu--hidden', scrollTop > lastScrollTop && window.scrollY > 0)
            lastScrollTop = scrollTop;
        });
    }

    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu');

    if(burger && menu){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('burger--active');
            menu.classList.toggle('menu--active');
            document.body.classList.toggle('no-scroll')
        })
    }

    const handlerDropDownMenu = () => {
        const dropDownItems = document.querySelectorAll('.header__nav__catalog-drop-down__left__list__item');
        dropDownItems.forEach((item, index) => {
            item.addEventListener('mouseover', () => {
                const rightItems = document.querySelectorAll('.header__nav__catalog-drop-down__right');
                rightItems.forEach((rightItem, i) => {
                    if (i === index) {
                        rightItem.classList.remove('--hidden');
                    } else {
                        rightItem.classList.add('--hidden');
                    }
                });
            });
        });
    };
    const handleOpenDropDown = () => {
        const openItem = document.querySelector('.header__nav__list__item');
        const link = openItem.querySelector('.menu__link');
        const dropDown = openItem.querySelector('.header__nav__catalog-drop-down');
        let onMenu = false
        link.addEventListener('mouseover', () => {
            dropDown.classList.remove('header__nav__catalog-drop-down--hidden');
        });

        link.addEventListener('mouseout', () => {
            setTimeout(()=>{
                if (onMenu) {
                    return
                }
                dropDown.classList.add('header__nav__catalog-drop-down--hidden');
                onMenu = false
            }, 300)
        });

        dropDown.addEventListener('mouseover', () => {
            dropDown.classList.remove('header__nav__catalog-drop-down--hidden');
            onMenu = true
        });

        dropDown.addEventListener('mouseout', () => {
            dropDown.classList.add('header__nav__catalog-drop-down--hidden');
            onMenu = false
        });
    }

    handlerDropDownMenu();
    handleOpenDropDown();


    Fancybox.bind("[data-fancybox]", {
        // Your custom options
    });
})