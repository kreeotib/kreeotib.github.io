document.addEventListener("DOMContentLoaded",()=>{
    const burger = document.querySelector('.burger'),
        headerNav = document.querySelector('.header-nav');

    if(burger && headerNav){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('burger--active');
            headerNav.classList.toggle('header-nav--active')
        })
    }


    const heroVideo = document.querySelector('.hero-video');

    if(heroVideo){
        const heroVideoItem = heroVideo.querySelector('.hero-video__item video'),
            heroVideoMute = heroVideo.querySelector('.hero-video__mute'),
            heroVideoText = heroVideoMute.querySelector("span");

        heroVideoMute.classList.toggle('unmuted', !heroVideoItem.muted)

        heroVideoMute.addEventListener('click',e=>{
            e.preventDefault();

            heroVideoItem.muted = !heroVideoItem.muted;
        heroVideoMute.classList.toggle('unmuted', !heroVideoItem.muted)
        })
    }
})
