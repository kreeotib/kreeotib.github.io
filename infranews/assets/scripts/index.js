const homeTabsInit = () => {
    const homeTabs = document.querySelector('.home-tabs');
    if(!homeTabs) return false;
    const homeTabsInputArray = homeTabs.querySelectorAll('input');
    if(!homeTabsInputArray.length) return false;
    homeTabsInputArray[0].checked = true;
    const homeTabsArray = [];
    homeTabsInputArray.forEach((input)=>{
        const blockArray = [...document.querySelectorAll(`.${input.value}`)];
        homeTabsArray.push(blockArray);
    });
    homeTabsInputArray.forEach((input,index)=>{
        input.addEventListener('change',(e)=>{
            homeTabsArray.forEach((blockIem,blockIndex)=>{
                blockIndex === index ? blockIem.forEach(block=>block.classList.remove('home-block--hidden')) : blockIem.forEach(block=>block.classList.add('home-block--hidden'));
            })
        });
    });

    homeTabsArray.forEach((blockIem,blockIndex)=>{
        blockIndex === 0 ? blockIem.forEach(block=>block.classList.remove('home-block--hidden')) : blockIem.forEach(block=>block.classList.add('home-block--hidden'));
    })
}



document.addEventListener('DOMContentLoaded', () => {
    const menuBurger = document.querySelectorAll('.js-menu-burger'),
        menu = document.querySelector('.menu');

    if (menuBurger.length && menu) {
        menuBurger.forEach(burger => {
            burger.addEventListener('click', e => {
                e.preventDefault();

                menuBurger.forEach(burger=>burger.classList.toggle('burger--active'));
                menu.classList.toggle('menu--active');
                document.body.classList.toggle('no-scroll')
            })
        });
    }

    const searchArray = document.querySelectorAll('.search');

    if(searchArray.length){
        searchArray.forEach(search=>{
            search.addEventListener('input',(e)=>{
                console.log(e.target.value);

                search.classList.toggle('active', e.target.value > 0)
            })
        })
    }


    homeTabsInit();


    // Удалить этот код, он отвечает за то, чтобы на телефоне было 20 новостей, а на десктопе 6

    function updateNewsItems() {
        const newsListHome = document.querySelector('.js-news-list');
        if (newsListHome) {
            const newsItems = newsListHome.querySelectorAll('.news-small');
            const currentCount = newsItems.length;

            if (window.innerWidth < 641) {
                if (currentCount < 20) {
                    const lastItem = newsItems[newsItems.length - 1];
                    for (let i = currentCount; i < 20; i++) {
                        const clonedItem = lastItem.cloneNode(true);
                        newsListHome.appendChild(clonedItem);
                    }
                }
            } else if (window.innerWidth > 641) {
                newsItems.forEach((element, index) =>{
                    index > 5 ? element.remove() : null;
                })
            }
        }
    }

    updateNewsItems();

    window.addEventListener('resize', updateNewsItems);
})