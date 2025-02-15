const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup__close')
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

document.addEventListener('DOMContentLoaded',()=>{
    const formLogin = document.querySelector('.form-login'),
        formCode = document.querySelector('.form-code');


    if(formLogin && formCode){
        formLogin.addEventListener('submit',(e)=>{
            e.preventDefault();

            formCode.classList.remove('form--hidden');
            formLogin.classList.add('form--hidden');
        })

        formCode.addEventListener('submit',(e)=>{
            e.preventDefault();
        })
    }


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


    const formLottery = document.querySelector('.form-lottery'),
        formTour = document.querySelector('.form-tour');

    if(formTour){
        formTour.addEventListener('submit',(e)=>{
            e.preventDefault();

            showPopup('.popup-register')
        })
    }
    if(formLottery){
        formLottery.addEventListener('submit',(e)=>{
            e.preventDefault();

            showPopup('.popup-register')
        })
    }
})