document.addEventListener('DOMContentLoaded', () => {
    const videoArray = document.querySelectorAll('.video');



    if(videoArray.length){
        videoArray.forEach(video=>{
            video.addEventListener('click',(e)=>{
                e.preventDefault();
                const videoEL = video.querySelector('video');

                videoEL.paused ? videoEL.play() : videoEL.pause();
                video.classList.toggle('play');

            });
        })
    }

    const items = document.querySelectorAll('.services__item');
    let lastScrollY = window.scrollY;

    items.forEach((item, index) => {
        item.style.setProperty('--item-font-size', '16px');
        item.style.setProperty('--item-padding-y', '8px');
        item.style.setProperty('--item-padding-x', '16px');

        // Применяем стили через CSS переменные
        item.style.fontSize = 'var(--item-font-size)';
        item.style.padding = 'var(--item-padding-y) var(--item-padding-x)';
        item.style.transition = 'all 0.3s ease';
    });

    function lerp(start, end, progress) {
        return start + (end - start) * progress;
    }

    const MIN_FONT_SIZE = 16;
    const MAX_FONT_SIZE = 24;
    const MIN_PADDING_Y = 8;
    const MAX_PADDING_Y = 12;
    const MIN_PADDING_X = 16;
    const MAX_PADDING_X = 24;
    const SCROLL_THRESHOLD = 100;

    let scrollProgress = 0;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        if (Math.abs(scrollDelta) > 5) {
            if (scrollDelta > 0) {
                scrollProgress = Math.min(scrollProgress + Math.abs(scrollDelta), SCROLL_THRESHOLD * items.length);
            } else {
                scrollProgress = Math.max(scrollProgress - Math.abs(scrollDelta), 0);
            }

            items.forEach((item, index) => {
                const elementStart = index * SCROLL_THRESHOLD;
                const elementEnd = (index + 1) * SCROLL_THRESHOLD;

                if (scrollProgress <= elementStart) {
                    item.style.setProperty('--item-font-size', `${MIN_FONT_SIZE}px`);
                    item.style.setProperty('--item-padding-y', `${MIN_PADDING_Y}px`);
                    item.style.setProperty('--item-padding-x', `${MIN_PADDING_X}px`);
                } else if (scrollProgress >= elementEnd) {
                    item.style.setProperty('--item-font-size', `${MAX_FONT_SIZE}px`);
                    item.style.setProperty('--item-padding-y', `${MAX_PADDING_Y}px`);
                    item.style.setProperty('--item-padding-x', `${MAX_PADDING_X}px`);
                } else {
                    const elementProgress = (scrollProgress - elementStart) / SCROLL_THRESHOLD;
                    const fontSize = lerp(MIN_FONT_SIZE, MAX_FONT_SIZE, elementProgress);
                    const paddingY = lerp(MIN_PADDING_Y, MAX_PADDING_Y, elementProgress);
                    const paddingX = lerp(MIN_PADDING_X, MAX_PADDING_X, elementProgress);

                    item.style.setProperty('--item-font-size', `${fontSize}px`);
                    item.style.setProperty('--item-padding-y', `${paddingY}px`);
                    item.style.setProperty('--item-padding-x', `${paddingX}px`);
                }
            });

            lastScrollY = currentScrollY;
        }
    });
})

document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.preparation-item');

    function checkScroll() {
        items.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const windowHeight = window.innerHeight;

            // Элемент в видимой области (с учетом центра экрана)
            const isInView = rect.top < windowHeight * 0.7 && rect.bottom > windowHeight * 0.3;

            if (isInView) {
                item.style.transform = 'scale(1.15)';
                item.style.transition = 'transform 0.4s ease-out';
            } else {
                item.style.transform = 'scale(1)';
                item.style.transition = 'transform 0.4s ease-out';
            }
        });
    }

    // Проверка при загрузке
    checkScroll();

    // Проверка при скролле с оптимизацией
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                checkScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
});