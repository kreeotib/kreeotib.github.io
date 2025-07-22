document.addEventListener('DOMContentLoaded', e => {
    const burger = document.querySelector('.burger'),
        menu = document.querySelector('.menu'),
        menuClose = document.querySelector('.menu__close');

    if (burger && menu && menuClose) {
        burger.addEventListener('click', e => {
            e.preventDefault();
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            menu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
        })
        menuClose.addEventListener('click', e => {
            e.preventDefault();

            menu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
            document.body.style.paddingRight = '';
            document.body.style.setProperty('--scrollbar-width', `0px`)
        })
    }

    const header = document.querySelector('.header'),
        headerTop = document.querySelector('.header-top');

    let lastScrollTop = 0;
    const headerTopHeight = headerTop.getBoundingClientRect().height;
    document.body.style.setProperty(`--header-height`, `${headerTopHeight}px`)
    window.addEventListener("scroll", function () {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if(scrollTop > headerTopHeight){
            header.classList.add('fixed');
            header.style.height  = `${headerTopHeight}px`
            if(scrollTop > lastScrollTop){
                header.classList.remove('visible')
                document.body.classList.remove('header-active')
            }else{
                header.classList.add('visible')
                document.body.classList.add('header-active')
            }
        }else{
            header.classList.remove('fixed');
            header.classList.remove('visible')
        }
        lastScrollTop = scrollTop;
    });

    const menuFormSearch = document.querySelector('.menu-form-search');
    if(menuFormSearch){
        menuFormSearch.addEventListener('submit',e=>{
            e.preventDefault();
            
            window.location.href = "search.html";
        })
    }

    const search = document.querySelector('.search');

    if(search){
        const searchForm = search.querySelector('.search-form');
        const searchInput = search.querySelector('.search-input__item');
        const searchFast = search.querySelector('.search-fast');

        searchInput.addEventListener('focus',e=>{
            search.classList.add('focus')
        })
        searchInput.addEventListener('blur',e=>{
            search.classList.remove('focus')
        })
        searchInput.addEventListener('input',e=>{
            searchFast.classList.add('active')
        })
        searchForm.addEventListener('submit',e=>{
            e.preventDefault();
            searchInput.blur();
            if(searchInput.value === '123'){
                search.classList.add('results')
                search.classList.remove('empty')
            }else{
                search.classList.add('empty')
                search.classList.remove('results')
            }
        })
    }
})