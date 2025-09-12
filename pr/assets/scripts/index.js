document.addEventListener('DOMContentLoaded',()=>{
    const formButton = document.querySelectorAll('.js-form-button');
    const form = document.querySelector('.form');

    formButton.forEach(button=>{
        button.addEventListener('click',e=>{
            e.preventDefault();

            form.classList.toggle('form--active');
            document.body.classList.toggle('no-scroll');
        })
    })

    const preloaderSvg = document.querySelector('.preloader__svg .svg-elem-20');
    const preloader = document.querySelector('.preloader')

    preloaderSvg.addEventListener('animationend', function() {
        preloader.classList.add('loaded');
    });
})