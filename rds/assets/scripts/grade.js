function $(sel, root = document) { return root.querySelector(sel); }
function $all(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

const brandInput = $('#brand');
const modelInput = $('#model');

const openGradeForm = document.querySelector('.grade-form-open');
const gradePopup   = $('.popup.popup-grade');
const gradeForm    = gradePopup ? $('form', gradePopup) : null;

function setGradeTable(brand, model) {
    if (!gradePopup) return;
    const items = $all('.grade-table__item', gradePopup);
    if (items[0]) {
        const val = items[0].querySelectorAll('.grade-table__text')[1];
        if (val) val.textContent = brand || '';
    }
    if (items[1]) {
        const val = items[1].querySelectorAll('.grade-table__text')[1];
        if (val) val.textContent = model || '';
    }
}

function preparePopupHiddenFields() {
    if (!gradeForm) return;
    $all('input[type="hidden"][data-sync="true"]', gradeForm).forEach(el => el.remove());

    const mkHidden = (name, value) => {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = name;
        inp.value = value || '';
        inp.setAttribute('data-sync', 'true');
        return inp;
    };

    gradeForm.appendChild(mkHidden('brand', brandInput ? brandInput.value.trim() : ''));
    gradeForm.appendChild(mkHidden('model', modelInput ? modelInput.value.trim() : ''));

    // Перенесем honeypot, если есть в основной форме
    const honeypot = document.querySelector('input[name="honeypot"]');
    if (honeypot) {
        const hp = mkHidden('honeypot', honeypot.value || '');
        gradeForm.appendChild(hp);
    }
}

function appendPhotosToFormData(fd) {
    // Все file-инпуты с name="photos[]"
    const fileInputs = $all('input[type="file"][name="images[]"]');
    fileInputs.forEach(input => {
        if (input.files && input.files.length) {
            Array.from(input.files).forEach(file => fd.append('images[]', file, file.name));
        }
    });
    return fd;
}

async function submitGradeForm(e) {
    e.preventDefault();
    if (!gradeForm) return;

    const submitBtn = $('button[type="submit"]', gradeForm);
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.origText = submitBtn.textContent;
        submitBtn.textContent = 'Отправляем...';
    }

    try {
        const fd = new FormData(gradeForm);

        appendPhotosToFormData(fd);

        const resp = await fetch('/sendmail.php', {
            method: 'POST',
            body: fd,
        });
        const data = await resp.json().catch(() => ({}));

        if (!resp.ok || !data.ok) {
            const msg = (data && data.error) ? data.error : 'Ошибка отправки. Попробуйте позже.';
            throw new Error(msg);
        }
        gradeForm.reset();
    } catch (err) {
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = submitBtn.dataset.origText || 'Отправить';

            showPopup('.popup-thanks')
        }
    }
}

if (openGradeForm && gradePopup && gradeForm) {
    console.log(openGradeForm)
    openGradeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const brand = brandInput ? brandInput.value.trim() : '';
        const model = modelInput ? modelInput.value.trim() : '';
        setGradeTable(brand, model);
        preparePopupHiddenFields();
        showPopup('.popup-grade')
    });

    gradeForm.addEventListener('submit', submitGradeForm);
}
