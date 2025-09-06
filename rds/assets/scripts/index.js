document.addEventListener('DOMContentLoaded', function() {
    const photoInputs = document.querySelectorAll('.photo-input');

    if(photoInputs.length){
        photoInputs.forEach(photoInput => {
            const fileInput = photoInput.querySelector('.photo-input__item');
            const imgLabel = photoInput.querySelector('.photo-input__label');
            const clearBtn = photoInput.querySelector('.photo-input__clear');

            fileInput.addEventListener('change', function(e) {
                const file = e.target.files[0];

                if (!file) return;

                // Проверка типа файла
                if (!file.type.startsWith('image/')) {
                    alert('Можно загружать только изображения');
                    fileInput.value = '';
                    return;
                }

                // Проверка размера файла (5 МБ = 5 * 1024 * 1024 байт)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Размер файла не должен превышать 5 МБ');
                    fileInput.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    imgLabel.src = e.target.result;
                    photoInput.classList.add('loaded');
                };
                reader.readAsDataURL(file);
            });

            clearBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                fileInput.value = '';
                imgLabel.src = '';
                photoInput.classList.remove('loaded');
            });
        });
    }

    const burger = document.querySelector('.burger');
    const header = document.querySelector('.header');
    const mobileMenu = document.querySelector('.mobile-menu');

    if(burger && header && mobileMenu){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            header.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        })
    }

    document.addEventListener('click', function(event) {
        const link = event.target.closest('a[href*="#"]');

        if (link) {
            const href = link.getAttribute('href');

            const hashIndex = href.indexOf('#');

            if (hashIndex !== -1) {
                const hash = href.substring(hashIndex + 1);

                if (hash.length > 0) {
                    burger.classList.remove('active');
                    mobileMenu.classList.remove('active');
                    header.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }
            }
        }
    });
});