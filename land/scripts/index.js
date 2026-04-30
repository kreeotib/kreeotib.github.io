const Popup = (() => {
    const CLOSE_DURATION = 210;

    let activePopup = null;

    function find(selector) {
        const el = document.querySelector(selector);
        if (!el) {
            console.warn(`[Popup] Element "${selector}" not found on page.`);
            return null;
        }
        return el;
    }

    function close() {
        if (!activePopup) return;

        const popup = activePopup;
        activePopup = null;

        ScrollLock.unlock();
        popup.classList.add('is-closing');

        setTimeout(() => {
            popup.classList.remove('is-active', 'is-closing');
            popup.dispatchEvent(new CustomEvent('popup:closed', {bubbles: true}));
        }, CLOSE_DURATION);
    }

    function open(selector) {
        const popup = find(selector);
        if (!popup) return;

        if (activePopup && activePopup !== popup) close();

        activePopup = popup;
        popup.classList.add('is-active');
        ScrollLock.lock();
        popup.scrollTop = 0;
        popup.dispatchEvent(new CustomEvent('popup:opened', {bubbles: true}));
    }

    function bindTriggers() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-popup]');
            if (trigger) {
                e.preventDefault();
                open(trigger.dataset.popup);
                return;
            }

            if (e.target.closest('.popup-close')) {
                close();
                return;
            }

            if (e.target.closest('.popup.is-active') && !e.target.closest('.popup__content')) {
                close();
            }
        });
    }

    function bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && activePopup) close();
        });
    }

    function init() {
        bindTriggers();
        bindKeyboard();
    }

    return {init, open, close};
})();

window.Popup = Popup;

const ScrollLock = (() => {
    let lockCount = 0;
    let scrollbarWidth = 0;

    function getScrollbarWidth() {
        const div = document.createElement('div');
        div.style.cssText = 'width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px;';
        document.body.appendChild(div);
        const width = div.offsetWidth - div.clientWidth;
        document.body.removeChild(div);
        return width;
    }

    function applyLock() {
        document.body.classList.add('no-scroll')
        if (window.lenis && typeof window.lenis.stop === 'function') {
            window.lenis.stop();
        }
    }

    function applyUnlock() {
        document.body.classList.remove('no-scroll')
        if (window.lenis && typeof window.lenis.start === 'function') {
            window.lenis.start();
        }
    }

    function lock() {
        lockCount++;
        if (lockCount === 1) applyLock();
    }

    function unlock() {
        if (lockCount === 0) return;
        lockCount--;
        if (lockCount === 0) applyUnlock();
    }

    function reset() {
        lockCount = 0;
        applyUnlock();
    }

    function isLocked() {
        return lockCount > 0;
    }

    return {lock, unlock, reset, isLocked};
})();

window.ScrollLock = ScrollLock;

const FormSender = (() => {
    const DEFAULTS = {
        formSelector: '.form form',
        submitBtnSelector: 'button[type="submit"]',
        endpoint: '/mail.php',
        submitText: 'Отправить заявку',
        sendingText: 'Отправка...',
        successPopup: '.popup-thanks',
        resetOnSuccess: true,
    };

    let config = {};
    let forms = [];
    let initialized = false;

    function getFormData(form) {
        const data = new FormData();
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            const name = input.name || input.placeholder || input.type;
            const value = input.value.trim();
            if (name && value) {
                data.append(name, value);
            }
        });

        return data;
    }

    function setLoading(form, loading) {
        const btn = form.querySelector(config.submitBtnSelector);
        if (!btn) return;

        btn.disabled = loading;
        btn.textContent = loading ? config.sendingText : config.submitText;
    }

    async function send(form) {
        const data = getFormData(form);

        const response = await fetch(config.endpoint, {
            method: 'POST',
            body: data,
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    }

    function onSuccess(form) {
        if (config.resetOnSuccess) {
            form.reset();
        }

        if (window.Popup && typeof window.Popup.close === 'function') {
            window.Popup.close();
        }

        if (window.Popup && typeof window.Popup.open === 'function') {
            window.Popup.open(config.successPopup);
        }
    }

    function onError(error) {
        console.error('[FormSender] Ошибка отправки:', error);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const form = event.target;

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setLoading(form, true);

        try {
            await send(form);
            onSuccess(form);
        } catch (error) {
            onError(error);
        } finally {
            setLoading(form, false);
        }
    }

    function bindEvents() {
        forms.forEach(form => form.addEventListener('submit', handleSubmit));
    }

    function unbindEvents() {
        forms.forEach(form => form.removeEventListener('submit', handleSubmit));
    }

    function init(options = {}) {
        config = { ...DEFAULTS, ...options };
        forms = Array.from(document.querySelectorAll(config.formSelector));

        if (!forms.length) {
            console.warn('[FormSender] No forms found.');
            return;
        }

        bindEvents();
        initialized = true;
    }

    function destroy() {
        if (!initialized) return;
        unbindEvents();
        forms = [];
        initialized = false;
    }

    return { init, destroy };
})();

window.FormSender = FormSender;


(function () {
    document.querySelectorAll('.js-phone-mask').forEach(function (el) {
        el.addEventListener('input',e=>{

            console.log(e.target.value.length)
        })
        IMask(el, {
            mask: '+7 000 000 00 00',
        });
    });
})();

(function () {
    document.addEventListener('DOMContentLoaded',()=>{
        Popup.init()
        FormSender.init()
    })
})();


(function () {
   document.addEventListener('DOMContentLoaded',()=>{
       const gallerySlider = new Swiper('.gallery-slider',{
           direction:"vertical",
           slidesPerView:'auto',
           speed:1000,
           autoplay:{
               delay:3000,
           }
       })
   })
})();