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

class FlipCountdown {
    constructor(container) {
        this.c = container;
        this.deadline = new Date(container.dataset.deadline);
        if (isNaN(this.deadline)) throw new Error('Неверный data-deadline');

        const labels = {
            days: container.dataset.labelDays || 'Days',
            hours: container.dataset.labelHours || 'Hours',
            minutes: container.dataset.labelMinutes || 'Minutes',
            seconds: container.dataset.labelSeconds || 'Seconds'
        };

        // корневой элемент
        this.root = document.createElement('div');
        this.root.className = 'flip-clock';
        this.c.innerHTML = '';
        this.c.appendChild(this.root);

        // создаём 4 «карточки»
        this.pieces = {
            days: this._createPiece(labels.days),
            hours: this._createPiece(labels.hours),
            minutes: this._createPiece(labels.minutes),
            seconds: this._createPiece(labels.seconds)
        };

        this._timer = setInterval(() => this._update(), 1000);
        this._update(); // первый рендер сразу
    }

    _createPiece(label) {
        const el = document.createElement('span');
        el.className = 'flip-clock__piece';
        el.innerHTML =
            '<b class="flip-clock__card card">' +
            '<b class="card__top"></b>' +
            '<b class="card__bottom"></b>' +
            '<b class="card__back"><b class="card__bottom"></b></b>' +
            '</b>' +
            `<span class="flip-clock__slot">${label}</span>`;
        this.root.appendChild(el);
        return {
            host: el,
            top: el.querySelector('.card__top'),
            bottom: el.querySelector('.card__bottom'),
            back: el.querySelector('.card__back'),
            backBottom: el.querySelector('.card__back .card__bottom'),
            cur: null
        };
    }

    _pad(v) {
        return String(v).padStart(2, '0');
    }

    _set(piece, val) {
        const v = this._pad(val);
        if (piece.cur === v) return;
        if (piece.cur !== null) {
            piece.back.setAttribute('data-value', piece.cur);
            piece.bottom.setAttribute('data-value', piece.cur);
        }
        piece.cur = v;
        piece.top.textContent = v;
        piece.backBottom.setAttribute('data-value', v);

        piece.host.classList.remove('flip');
        void piece.host.offsetWidth;
        piece.host.classList.add('flip');
    }

    _update() {
        const t = Math.max(0, this.deadline - Date.now());
        const d = Math.floor(t / 86400000);
        const h = Math.floor(t / 3600000) % 24;
        const m = Math.floor(t / 60000) % 60;
        const s = Math.floor(t / 1000) % 60;

        this._set(this.pieces.days, d);
        this._set(this.pieces.hours, h);
        this._set(this.pieces.minutes, m);
        this._set(this.pieces.seconds, s);

        if (t === 0) {
            clearInterval(this._timer);
        }
    }
}

// автокрепление по классу
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.js-flip-countdown').forEach(node => {
        try {
            new FlipCountdown(node);
        } catch (e) {
            console.error(e);
        }
    });
});


document.addEventListener('DOMContentLoaded', () => {
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

    const container = document.querySelector('.gallery');
    if(container){
        const btn = document.querySelector('.gallery__button');
        const items = container.querySelectorAll('.gallery-card');
        let visibleCount = 3; // Изначально показываем 3 элемента

        function updateDisplay() {
            items.forEach((item, index) => {
                if (index < visibleCount) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });

            if (visibleCount >= items.length) {
                container.classList.add('no-hidden-items');
            } else {
                container.classList.remove('no-hidden-items');
            }
        }

        updateDisplay();

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            visibleCount += 3;
            updateDisplay();
        });
    }


    const contactForm = document.querySelector('.contact-form');


    contactForm.addEventListener('submit',e=>{
        e.preventDefault();

        showPopup('.popup-thanks')
    })


})