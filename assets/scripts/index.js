document.addEventListener('DOMContentLoaded',()=>{
    const reviewsSlider = new Swiper('.reviews-slider',{
        slidesPerView:1,
        spaceBetween:40,
        breakpoints:{
            767:{
                slidesPerView: 2,
            }
        }
    });

    const cardsSlider = new Swiper('.cards-slider',{
        slidesPerView:'auto',
        spaceBetween:20,
        breakpoints:{
            767:{
                spaceBetween: 140,
            }
        }
    });

    const eventsSlider = new Swiper('.events-slider',{
        slidesPerView:'auto',
        spaceBetween:40,
        centeredSlides:true,
        initialSlide:1,
    });

    const faqItemList = document.querySelectorAll('.faq-item');

    if(faqItemList.length){
        faqItemList.forEach(faqItem=>{
            const faqItemHeader = faqItem.querySelector('.faq-item__header');

            if(faqItemHeader){
                faqItemHeader.addEventListener('click',e=>{
                    e.preventDefault();

                    faqItem.classList.toggle('active')
                })
            }
        })
    }
})
