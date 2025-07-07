document.addEventListener('DOMContentLoaded',e=>{
    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        menuClose = document.querySelector('.menu__close');

    if(burger && menu && menuClose){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            menu.classList.toggle('active');
        })
        menuClose.addEventListener('click',e=>{
            e.preventDefault();

            menu.classList.toggle('active');
        })
    }
})