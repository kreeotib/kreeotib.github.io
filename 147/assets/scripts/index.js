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

document.addEventListener('DOMContentLoaded', e => {
    const blockSlider = new Swiper('.block-slider', {
        loop:true,
        effect: "fade",
        navigation:{
            nextEl:'.block-slider__button--next',
            prevEl:'.block-slider__button--prev',
        },
        pagination:{
            el:'.block-slider__pagination',
            bulletClass:'block-slider__bullet',
            bulletActiveClass:'block-slider__bullet--active'
        }
    })

    const singleSlider = new Swiper('.single-slider', {
        loop:true,
        slidesPerView:'auto',
        spaceBetween:30,
        navigation:{
            nextEl:'.single-slider__button--next',
            prevEl:'.single-slider__button--prev',
        },
    })

    const heroSliderNav = new Swiper(".hero-nav__slider", {
        spaceBetween: 16,
        slidesPerView: 'auto',
        freeMode: true,
        watchSlidesProgress: true,
        scrollbar: {
            el: ".hero-nav__scrollbar",
        },
        breakpoints:{
            768:{
                spaceBetween:50
            }
        }
    });
    const heroSlider = new Swiper(".hero-slider", {
        spaceBetween: 10,
        thumbs: {
            swiper: heroSliderNav,
        },
    });


    const shoppingFilter = document.querySelector('.shopping-filter');

    if(shoppingFilter){
        const filterHeader = document.querySelector('.shopping-filter__header');

        filterHeader.addEventListener('click',e=>{

            shoppingFilter.style.setProperty('--filter-header', `${filterHeader.getBoundingClientRect().height}px`);
            shoppingFilter.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
    }

    const login = document.querySelector('.login');

    if(login){
        const loginTitleArray = login.querySelectorAll('.login__title'),
            loginBlockArray = login.querySelectorAll('.login-block');

        if(loginTitleArray.length){
            loginTitleArray.forEach(title=>{
                title.addEventListener('click',e=>{
                    e.preventDefault();

                    const clickedBlock = login.querySelector(title.hash);
                    loginBlockArray.forEach(block=>block === clickedBlock ? block.classList.add('active') : block.classList.remove('active'))
                    loginTitleArray.forEach(titlelogin=>titlelogin === title ? titlelogin.classList.add('active') : titlelogin.classList.remove('active'))
                })
            })
        }
    }

    const burger = document.querySelector('.burger'),
        mobileMenu = document.querySelector('.mobile-menu'),
        header = document.querySelector('.header');

    if(burger && mobileMenu){
        burger.addEventListener('click',e=>{
            e.preventDefault();

            burger.classList.toggle('active');
            header.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll')
        })
    }

    const fieldsetClear = document.querySelectorAll('.fieldset-clear');

    if(fieldsetClear.length){
        fieldsetClear.forEach(button=>{
            button.addEventListener('click',e=>{
                e.preventDefault();

                const input = button.closest('fieldset').querySelector('input');
                input.value = '';
            })
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

    const languageSwitcher = document.querySelectorAll('.language-switcher');

    if(languageSwitcher.length){
        document.body.addEventListener('click',e=>{
            if(!e.target.closest('.language-switcher')){
                languageSwitcher.forEach(language=>language.classList.remove('language-switcher--active'))
            }
        })
        languageSwitcher.forEach(language=>{
            language.addEventListener('click',e=>{
                e.preventDefault();

                language.classList.toggle('language-switcher--active');
            })
        })
    }

    const profileChart = document.querySelector('.profile-chart')

    if(profileChart){
        const ctx = document.getElementById('priceChart').getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(245, 130, 32, 0.5)');
        gradient.addColorStop(1, 'rgba(245, 130, 32, 0)');

        const customTicksPlugin = {
            id: 'customTicks',
            afterDraw: function(chart) {
                const ctx = chart.ctx;
                const xAxis = chart.scales.x;
                const yAxis = chart.scales.y;
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

                ctx.save();

                const lineY = yAxis.bottom + 45;
                ctx.strokeStyle = '#403f42';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(xAxis.left, lineY);
                ctx.lineTo(xAxis.right, lineY);
                ctx.stroke();

                ctx.fillStyle = '#403f42';
                ctx.font = '14px Myriad Pro';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'top';

                months.forEach((month, index) => {
                    const x = xAxis.getPixelForValue(index);

                    ctx.strokeStyle = '#403f42';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, lineY);
                    ctx.lineTo(x, lineY + 8);
                    ctx.stroke();

                    ctx.fillStyle = '#919191';
                    ctx.fillText(month, x, lineY + 18);
                });

                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#919191';
                ctx.font = '14px Myriad Pro';

                yAxis.ticks.forEach((tick, index) => {
                    const y = yAxis.getPixelForTick(index);
                    const x = yAxis.left;

                    ctx.fillText('$' + tick.value, x - 15, y);
                });

                ctx.restore();
            }
        };

        Chart.register(customTicksPlugin);

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Price',
                    data: [1200, 1350, 1100, 1450, 1600, 1750, 1850, 1700, 1900, 2100, 1950, 2200],
                    borderColor: '#F58220',
                    backgroundColor: gradient,
                    borderWidth: 1,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 40,
                        bottom: 80,
                        left: 60,
                        right: 20
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawTicks: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        border: {
                            display: false
                        },
                        grid: {
                            display: true,
                            color: 'rgba(255, 255, 255, 0.15)',
                            borderDash: [5, 5],
                            drawTicks: false
                        },
                        ticks: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }



})