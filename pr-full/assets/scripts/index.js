document.addEventListener('DOMContentLoaded', () => {
// Находим все карточки с классом .services-card
    const serviceCards = document.querySelectorAll('.services-card');

// Проверяем, есть ли карточки на странице
    if (serviceCards.length === 0) {
        console.warn('Не найдено элементов с классом .services-card');
    }

// Обрабатываем каждую карточку
    serviceCards.forEach((card, index) => {
        // Ищем видео внутри карточки
        const video = card.querySelector('video');

        // Проверяем наличие видео
        if (!video) {
            console.warn(`Видео не найдено в карточке #${index + 1}`);
            return;
        }

        // Проверяем, загружено ли видео
        video.addEventListener('error', (e) => {
            console.error(`Ошибка загрузки видео в карточке #${index + 1}:`, e);
        });

        let animationFrame = null;

        // Функция для реверсивного воспроизведения
        const playReverse = () => {
            if (video.currentTime <= 0) {
                cancelAnimationFrame(animationFrame);

                // Загружаем видео заново, чтобы показать poster
                video.load();

                return;
            }

            // Уменьшаем время на небольшой шаг
            video.currentTime = Math.max(0, video.currentTime - 0.033); // ~30fps назад

            animationFrame = requestAnimationFrame(playReverse);
        };

        // Обработчик наведения курсора
        card.addEventListener('mouseenter', async () => {
            try {
                // Останавливаем реверс, если он был запущен
                if (animationFrame) {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = null;
                }

                // Устанавливаем нормальную скорость
                video.playbackRate = 1;

                // Проигрываем видео вперед
                await video.play();
            } catch (error) {
                console.error(`Ошибка воспроизведения видео в карточке #${index + 1}:`, error);
            }
        });

        // Обработчик ухода курсора
        card.addEventListener('mouseleave', () => {
            try {
                // Останавливаем прямое воспроизведение
                video.pause();

                // Запускаем реверсивное воспроизведение
                playReverse();
            } catch (error) {
                console.error(`Ошибка реверса видео в карточке #${index + 1}:`, error);
            }
        });

        // Опционально: предзагрузка видео
        video.preload = 'auto';

        // Отключаем звук
        video.muted = true;

        // Убираем loop, если он есть
        video.loop = false;
    });

    const servicesSlider = new Swiper('.services-slider', {
        slidesPerView: 'auto',
        spaceBetween: 32,
        navigation: {
            prevEl: '.slider-button--prev',
            nextEl: '.slider-button--next'
        }
    })

    const documentSlider = new Swiper('.document-slider', {
        slidesPerView: 'auto',
        spaceBetween: 50,
        navigation: {
            prevEl: '.slider-button--prev',
            nextEl: '.slider-button--next'
        }
    })
    const partnersSlider = new Swiper('.partners-slider', {
        slidesPerView: 'auto',
        spaceBetween: 20,
        navigation: {
            prevEl: '.slider-button--prev',
            nextEl: '.slider-button--next'
        }
    })


    const burger = document.querySelector('.burger'),

        mobileMenu = document.querySelector('.mobile-menu');

    if(burger && mobileMenu){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
    }
})

function animateCounter(element, start, end, duration = 1000) {
    const startTime = performance.now();
    const difference = end - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeProgress = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentValue = Math.floor(start + difference * easeProgress);
        element.setAttribute('data-count', currentValue.toLocaleString('ru-RU'));

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.setAttribute('data-count', end.toLocaleString('ru-RU'));
        }
    }

    requestAnimationFrame(update);
}

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            const endValue = parseInt(counter.getAttribute('data-end')) || 0;

            animateCounter(counter, 0, endValue, 1000);

            observer.unobserve(counter);
        }
    });
}, observerOptions);


document.addEventListener('DOMContentLoaded', () => {
    const counters = document.querySelectorAll('.counter[data-end]');

    if (counters.length) {
        counters.forEach(counter => {
            counter.setAttribute('data-count', '0');

            counterObserver.observe(counter);
        });
    }
});