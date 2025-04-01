const checkTargetOrKey = event => {
    if (
        event.target.classList.contains('popup__wrapper') ||
        event.key === 'Escape' ||
        event.target.closest('.popup__close')

    ) {
        event.preventDefault();
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


class Quiz  {
    constructor(container) {
        this.container = container;
        this.quizItems = this.container.querySelectorAll('.quiz-item');
        this.quizItemsPercent = this.container.querySelector('.quiz-percent');
        this.prevButton = this.container.querySelector('.quiz-prev-button');
        this.nextButton = this.container.querySelector('.quiz-next-button');
        this.progressContainer = this.container.querySelector('.quiz-progress');
        this.currentSlide = 0;
        if (this.quizItems.length === 0 || !this.prevButton || !this.nextButton) {
            console.error('Quiz items, buttons, or progress container are missing.');
            return;
        }
        this.initQuiz();
        if(this.progressContainer){
            this.createProgressItems();
        }
        this.addEventListeners();
    }
    initQuiz() {
        this.currentSlide = 0;
        this.updateActiveSlide();
        this.updateButtons();
    }
    createProgressItems() {
        this.quizItems.forEach((item, index) => {
            const progressItem = document.createElement('div');
            progressItem.classList.add('quiz-progress__item');

            const progressNumber = document.createElement('div');
            progressNumber.classList.add('quiz-progress__number');

            const numberText = document.createElement('span');
            numberText.textContent = String(index + 1).padStart(2, '0');

            progressNumber.appendChild(numberText);
            progressNumber.innerHTML += "<svg class=\"icon\"> <use xlink:href=\"assets/images/sprite.svg#check\"></use> </svg>"

            progressItem.appendChild(progressNumber);
            this.progressContainer.appendChild(progressItem);
        });
    }
    addEventListeners() {
        this.container.addEventListener('click', (event) => {
            if (event.target === this.prevButton) {
                this.prevSlide();
            } else if (event.target === this.nextButton) {
                this.nextSlide();
            }
        });
    }
    updateActiveSlide() {
        this.quizItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentSlide);
        });
        if (this.quizItemsPercent) {
            this.quizItemsPercent.textContent = `${(this.currentSlide) / this.quizItems.length  * 100}%`;
        }
        if(this.progressContainer){
            this.updateProgress();
        }
    }
    updateProgress() {
        const progressItems = this.progressContainer.querySelectorAll('.quiz-progress__item');
        progressItems.forEach((item, index) => {
            item.classList.toggle('active', index === this.currentSlide);
        });
        this.progressContainer.classList.toggle('end', this.currentSlide === this.quizItems.length - 1);
    }
    updateButtons() {
        this.prevButton.style.display = this.currentSlide === 0 ? 'none' : 'inline-block';
        this.nextButton.style.display = this.currentSlide === this.quizItems.length - 1 ? 'none' : 'inline-block';
    }
    validateInputs() {
        const currentItem = this.quizItems[this.currentSlide];
        const requiredInputs = currentItem.querySelectorAll('[required]');
        return Array.from(requiredInputs).every(input => {
            // Для чекбоксов и радиокнопок проверяем checked
            if (input.type === 'checkbox' || input.type === 'radio') {
                const name = input.name;
                // Проверяем, есть ли хотя бы один checked в группе
                if (name) {
                    return currentItem.querySelector(`input[name="${name}"]:checked`) !== null;
                }
                return input.checked;
            }
            // Для остальных полей используем checkValidity
            return input.checkValidity();
        });
    }
    nextSlide() {
        if (this.validateInputs()) {
            this.currentSlide++;
            this.updateActiveSlide();
            this.updateButtons();
        }
    }
    prevSlide() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this.updateActiveSlide();
            this.updateButtons();
        }
    }
}


document.addEventListener('DOMContentLoaded',()=>{
    const quizArray = document.querySelectorAll('.quiz');

    if(quizArray.length){
        quizArray.forEach(quizBlock=>{
            const quiz = new Quiz(quizBlock);
            quiz.initQuiz();

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
})