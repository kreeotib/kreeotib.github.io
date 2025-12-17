document.addEventListener('DOMContentLoaded', ()=>{
    const anchorArr = document.querySelectorAll('a[href^="#"]');
    if(anchorArr.length){
        anchorArr.forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const href = this.hash;
                if(href.length > 0){
                    const target = document.querySelector(`${href}`);
                    if(target){
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }


            });
        });
    }
})