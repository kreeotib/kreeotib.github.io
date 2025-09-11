document.addEventListener('DOMContentLoaded',()=>{
    const formButton = document.querySelectorAll('.js-form-button');
    const form = document.querySelector('.form');

    formButton.forEach(button=>{
        button.addEventListener('click',e=>{
            e.preventDefault();

            form.classList.toggle('form--active')
        })
    })

    const preloaderSvg = document.querySelector('.preloader__svg .svg-elem-21');
    const preloader = document.querySelector('.preloader')

    preloaderSvg.addEventListener('animationend', function() {
        preloader.classList.add('loaded');
    });
})