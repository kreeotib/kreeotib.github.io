document.addEventListener('DOMContentLoaded', e => {
    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        menuClose = document.querySelector('.menu__close');

    if (burger && menu && menuClose) {
        burger.addEventListener('click', e => {
            e.preventDefault();

            menu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
        menuClose.addEventListener('click', e => {
            e.preventDefault();

            menu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
    }

    const header = document.querySelector('.header'),
        headerTop = document.querySelector('.header-top');

    let lastScrollTop = 0;
    const headerTopHeight = headerTop.getBoundingClientRect().height;
    window.addEventListener("scroll", function () {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if(scrollTop > headerTopHeight){
            header.classList.add('fixed');
            header.style.height  = `${headerTopHeight}px`
            if(scrollTop > lastScrollTop){
                header.classList.remove('visible')
            }else{
                header.classList.add('visible')
            }
        }else{
            header.classList.remove('fixed');
            header.classList.remove('visible')
        }
        lastScrollTop = scrollTop;
    });
})