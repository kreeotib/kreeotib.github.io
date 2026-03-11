document.addEventListener('DOMContentLoaded',()=>{
    const stepsSliderElement = document.querySelector('.steps-slider');
    const stepsSlider = new Swiper(stepsSliderElement, {
        init: false,
        slidesPerView: 'auto',
        spaceBetween: 16,
        speed: 500,
        breakpoints:{
            1025:{
                spaceBetween:24,
            }
        },
        navigation: {
            prevEl:'.steps-slider-button-prev',
            nextEl:'.steps-slider-button-next'
        },
    });

    if (stepsSliderElement) {
        stepsSlider.init();
    }



    const marquees = document.querySelectorAll('.marquee');

    if(marquees.length){
        marquees.forEach(marquee => {
            const marqueeContent = marquee.querySelector('.marquee-content');

            const clone = marqueeContent.cloneNode(true);
            marquee.appendChild(clone);

            let position = 0;
            const baseSpeed = marquee.dataset.speed || 2;
            let scrollSpeed = 0;
            function animate() {
                let currentSpeed = baseSpeed + scrollSpeed;
                position -= currentSpeed;
                if (Math.abs(position) >= marqueeContent.offsetWidth) {
                    position = 0;
                }
                marquee.style.transform = `translate3d(${position}px, 0, 0)`;

                requestAnimationFrame(animate);
            }

            animate();
        });
    }
})