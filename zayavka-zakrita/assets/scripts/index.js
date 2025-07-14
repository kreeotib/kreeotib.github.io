document.addEventListener('DOMContentLoaded',e=>{
    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        menuClose = document.querySelector('.menu__close');

    if(burger && menu && menuClose){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            menu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
        menuClose.addEventListener('click',e=>{
            e.preventDefault();

            menu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
    }

    const stickyElm = document.querySelector('.header')

    const observer = new IntersectionObserver(
        ([e]) => {e.target.classList.toggle('sticky', e.intersectionRatio < 1), document.body.classList.toggle('header-active',e.intersectionRatio < 1)},
        {threshold: [1]}
    );

    observer.observe(stickyElm);
})