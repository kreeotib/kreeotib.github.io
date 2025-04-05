const countToTarget = (counterElement, target, index = 0) => {
    let currentCount = 0;
    const duration = 2000 + (index * 1000);
    const increment = Math.ceil(target / (duration / 50));
    const interval = setInterval(() => {
        currentCount += increment;
        if (currentCount >= target) {
            currentCount = target;
            clearInterval(interval);
        }
        counterElement.textContent = currentCount;
    }, 50);
}



document.addEventListener('DOMContentLoaded', () => {
    const burger = document.querySelector('.burger'),
        header = document.querySelector('.header');

    if(burger && header){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('burger--active');
            header.classList.toggle('header--active');
            document.body.classList.toggle('no-scroll');
        })
    }
    const documentSliderElement = document.querySelector('.documents-slider');

    if (documentSliderElement) {
        const documentSlider = new Swiper(documentSliderElement, {
            slidesPerView: 'auto',
            spaceBetween: 20,
            navigation: {
                nextEl: '.documents-slider-button-next',
                prevEl: '.documents-slider-button-prev',
            },
            pagination: {
                el: '.documents-slider-pagination',
                bulletClass: 'slider-pagination__item',
                bulletActiveClass: 'slider-pagination__item--active',
            },
        })
    }

    const cardSliderElement = document.querySelector('.card-slider');

    if (cardSliderElement) {
        const cardSlider = new Swiper('.card-slider', {
            slidesPerView: 'auto',
            spaceBetween: 24,
        })
    }


    const cardSliderGalleryElement = document.querySelector('.card-gallery');

    if (cardSliderGalleryElement) {
        const cardGallery = new Swiper('.card-gallery', {
            slidesPerView: 1,
            navigation: {
                nextEl: '.card-gallery-button-next',
                prevEl: '.card-gallery-button-prev',
            },
            touchEventsTarget:'container',
            pagination: {
                el: '.card-gallery-pagination',
                bulletClass: 'slider-pagination__item',
                bulletActiveClass: 'slider-pagination__item--active',
            },
        });
    }


    const fileInputArray = document.querySelectorAll('.js-file-input');

    if (fileInputArray.length) {
        fileInputArray.forEach(fileInputBlock => {
            const fileInputElement = fileInputBlock.querySelector('input[type="file"]'),
                fileInputTextElement = fileInputBlock.querySelector('.js-file-input-text');
            if (!fileInputElement && fileInputTextElement) return false;
            fileInputElement.addEventListener('change', function () {
                const fileName = this.files[0] ? this.files[0].name : 'Файл';
                fileInputBlock.querySelector('.js-file-input-text').value = fileName;
            });
        })
    }

    const counters = document.querySelectorAll('.js-counter');

    const observerCountersCallback = (entries) => {
        entries.forEach((entry,index) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                const targetNumber = parseInt(entry.target.getAttribute('data-target'), 10);
                countToTarget(entry.target, targetNumber, index);
                countersObserver.unobserve(entry.target);
            }
        });
    };
    const observerCountersOptions = {
        root: null,
        threshold: 0.1
    };

    const countersObserver = new IntersectionObserver(observerCountersCallback, observerCountersOptions);

    if(counters.length){
        counters.forEach((counter, index) => countersObserver.observe(counter));
    }

    const animateSvg = document.querySelectorAll('.animate-svg');

    if(animateSvg.length){
        const observerAnimateCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated')
                }
            });
        };
        const observerAnimateOptions = {
            root: null,
            threshold: 0.1
        };

        const animateObserver = new IntersectionObserver(observerAnimateCallback, observerAnimateOptions);
        const normalizeTransformOrigin = (element) =>{
            const bbox = element.getBBox();

            const centerX = bbox.x + bbox.width / 2;
            const centerY = bbox.y + bbox.height / 2;

            element.style.transformOrigin = `${centerX}px ${centerY}px`
        }
        animateSvg.forEach(svg=>{
            const path = svg.querySelectorAll('path');
            const g = svg.querySelectorAll('g');
            const animateSvgGroupArray = svg.querySelectorAll('.animate-svg-group');

            animateObserver.observe(svg)

            g.forEach(element=>{
                normalizeTransformOrigin(element);
            })
            path.forEach(element=>{
                normalizeTransformOrigin(element);
            });

            if(animateSvgGroupArray.length){
                animateSvgGroupArray.forEach(group=>{
                    const groupItemArray = group.querySelectorAll('.animate-svg-group-item'),
                        groupDelayMultiplier = group.dataset.delay || 100;

                    if(groupItemArray.length){
                        groupItemArray.forEach((groupItem, groupItemIndex)=>{
                            console.log(groupItem)
                            groupItem.style.animationDelay = `${groupItemIndex * groupDelayMultiplier}ms`
                        });
                    }
                })
            }
        })
    }

    const preloader = document.querySelector('.preloader')

    if(preloader){

    }

    Fancybox.bind("[data-fancybox]", {
        // Your custom options
    });

});