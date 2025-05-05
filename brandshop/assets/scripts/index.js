document.addEventListener("DOMContentLoaded", () => {
    function isStickyActive(element) {
        const styles = window.getComputedStyle(element);
        if (styles.position !== 'sticky') return false;

        const rect = element.getBoundingClientRect();
        const stickyTop = parseInt(styles.top) || 0;

        // Проверяем, достиг ли элемент точки прилипания
        return rect.top <= stickyTop;
    }

    const header = document.querySelector('.header');
    document.body.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`)
    window.addEventListener('scroll', () => {
        const stickyElement = document.querySelector('.header');
        if(window.scrollY > 100){
            stickyElement.classList.add('sticky')
            document.body.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`)
        }else{
            stickyElement.classList.remove('sticky')
            document.body.style.setProperty("--header-height", `${header.getBoundingClientRect().height}px`)
        }

    });
})