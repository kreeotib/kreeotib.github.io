const initTabs = () => {
    const tabs = [...document.querySelectorAll(".tabs")];

    if (tabs.length > 0) {
        tabs.forEach((tab) => {
            const tabContent = [...tab.querySelectorAll(".tabs__content")];
            const tabLinks = [...tab.querySelectorAll(".tabs__link")];

            const openTab = (tabIndex = 0) => {
                tabContent.forEach((element, i) => {
                    const isActive = i === tabIndex;
                    element.classList.toggle("active", isActive);
                });

                tabLinks.forEach((element, i) => {
                    element.classList.toggle("active", i === tabIndex);
                });
            }

            openTab(0)

            tabLinks.forEach((link, i) => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    openTab(i);
                });
            });
        });
    }
}

const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup-close')
    ) {
        hideAllPopups();
    }
};
const showPopup = popupId => {
    const popup = document.querySelector(popupId);
    if (!popup) return

    hideAllPopups();

    popup.classList.add('popup--active');
    document.body.classList.add('no-scroll');

    document.addEventListener('click', checkTargetOrKey);
    document.addEventListener('keyup', checkTargetOrKey);
};
const hideAllPopups = () => {
    const popups = document.querySelectorAll('.popup');

    popups.forEach(popup => {
        popup.classList.remove('popup--active');
    });
    document.body.classList.remove('no-scroll');

    document.removeEventListener('click', checkTargetOrKey);
    document.removeEventListener('keyup', checkTargetOrKey);
};

document.addEventListener('DOMContentLoaded',e=>{
    const popupButtons = document.querySelectorAll('[data-popup]');
    const popups = document.querySelectorAll('.popup');

    if (popups.length) {
        popupButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                const popupId = button.dataset.popup
                showPopup(popupId);
            });
        });
    }

    initTabs();

    const rangeInputArray = document.querySelectorAll('.range-input input[type="range"]');

    if(rangeInputArray.length){
        rangeInputArray.forEach(range=>{
            const activeColor = "#4d92f9";
            const inactiveColor = "#ebf5ff";

            const ratio = (range.value - range.min) / (range.max - range.min) * 100;
            range.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;

            range.addEventListener("input", function() {
                const ratio = (this.value - this.min) / (this.max - this.min) * 100;
                this.style.background = `linear-gradient(90deg, ${activeColor} ${ratio}%, ${inactiveColor} ${ratio}%)`;
            });
        })
    }


    const selectArray = document.querySelectorAll('.select');

    if (selectArray.length) {
        document.addEventListener('click',e=>{
            if(!e.target.closest('.select')){
                selectArray.forEach(select => {
                    select.classList.remove('active');
                });
            }
        })
        selectArray.forEach(select => {
            const selectCurrent = select.querySelector('.select-current');
            selectCurrent.addEventListener('click', (e) => {
                e.preventDefault();
                selectArray.forEach(select => {
                    if(!select.classList.contains('active')){
                        select.classList.remove('active');
                    }
                });
                select.classList.toggle('active');
                selectCurrent.classList.toggle('active');
            });

            select.addEventListener('change', (e) => {
                const selectText = e.target.closest('.select-item').querySelector('.select-item__text').innerHTML;
                select.querySelector('.js-select-current').innerHTML = selectText;
                select.classList.remove('active');
                selectCurrent.classList.remove('active');
            });
        });
    }

    const burger = document.querySelector('.burger'),
        header = document.querySelector('.header');

    if(burger && header){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
            header.classList.toggle('active')
        })
    }
})