document.addEventListener('DOMContentLoaded', e => {
    const forms = document.querySelectorAll('form.validation-form');

    forms.forEach((form) => {
        const validator = new JustValidate(form, {
            errorLabelStyle: {
                // Remove default styling
                color: false,
            },
            errorFieldCssClass: '_error',
            // errorLabelCssClass: 'error-label',
            focusInvalidField: false,
            errorPlacement:function (error,element){
                error.appendTo(element.closest('.tfield').querySelector('.tfield-error'))
            }
        });


        const textFields = form.querySelectorAll('.tfield-wrapper:has(.input-text:required)');

        textFields.forEach((field) => {
            const fieldError = field.querySelector('.tfield-error');
            const fieldInput = field.querySelector("input");
            if(!fieldInput) return
            validator.addField(fieldInput, [
                {
                    rule: 'required',
                    errorMessage: 'Обязательное поле для заполнения',
                },
                /* {
                  rule: 'customRegexp',
                  errorMessage: 'Некорректный формат ввода',
                  // Latin & russian letters, numbers, space, hyphen
                  value: /^[A-Za-z0-9А-Яа-яЁё\s\-]+$/gi,
                }, */
                {
                    rule: 'minLength',
                    errorMessage: 'Минимум 2 символа',
                    value: 2,
                },
                {
                    rule: 'maxLength',
                    errorMessage: 'Максимум 30 символов',
                    value: 30,
                },
            ], {
                errorsContainer:fieldError,
            });
        });

        // const textareaFields = form.querySelectorAll('.tfield-wrapper:has(.input-textarea:required)');
        //
        // textareaFields.forEach((field) => {
        //     const fieldError = field.querySelector('.tfield-error');
        //     const fieldInput = field.querySelector("input");
        //     validator.addField(fieldInput, [
        //         {
        //             rule: 'required',
        //             errorMessage: 'Поле не заполнено',
        //         },
        //         /* {
        //           rule: 'customRegexp',
        //           errorMessage: 'Некорректный формат ввода',
        //           // Latin & russian letters, numbers, space,
        //           // general punctuation marks, quotes
        //           value: /^[A-Za-z0-9А-Яа-яЁё\s\-_.,!?;:'"«»“”‘’()]+$/gi,
        //         }, */
        //         {
        //             rule: 'minLength',
        //             errorMessage: 'Минимум 5 символов',
        //             value: 5,
        //         },
        //         {
        //             rule: 'maxLength',
        //             errorMessage: 'Максимум 2000 символов',
        //             value: 2000,
        //         },
        //     ], {
        //         errorsContainer:fieldError,
        //     });
        // });

        const emailFields = form.querySelectorAll('.tfield-wrapper:has(.input-email:required)');

        console.log(emailFields)
        emailFields.forEach((field) => {
            const fieldError = field.querySelector('.tfield-error');
            const fieldInput = field.querySelector("input");
            validator.addField(fieldInput, [
                {
                    rule: 'required',
                    errorMessage: 'Обязательное поле для заполнения',
                },
                {
                    rule: 'email',
                    errorMessage: 'Некорректный формат e-mail',
                },
            ], {
                errorsContainer:fieldError,
            });
        });

        const phoneFields = form.querySelectorAll('.tfield-wrapper:has(.input-tel:required)');

        phoneFields.forEach((field) => {
            console.log(field)
            const fieldError = field.querySelector('.tfield-error');
            const fieldInput = field.querySelector("input");
            validator.addField(fieldInput, [
                {
                    rule: 'required',
                    errorMessage: 'Обязательное поле для заполнения',
                },
                {
                    rule: 'customRegexp',
                    errorMessage: 'Некорректный формат номера',
                    value: /^(?:\+38\d{10}|(?:\D*\d){10}(?:\D|$))/,
                },
            ], {
                errorsContainer:fieldError,
            });
        });

        const passwordFields = form.querySelectorAll('.tfield-wrapper:has(.input-password:required)');

        passwordFields.forEach((field) => {
            const fieldError = field.querySelector('.tfield-error');
            const fieldInput = field.querySelector("input");
            validator.addField(fieldInput, [
                {
                    rule: 'required',
                    errorMessage: 'Это обязательноe поле',
                },
                {
                    rule: 'minLength',
                    errorMessage: 'Минимум 8 символов',
                    value: 8,
                },
            ], {
                errorsContainer:fieldError,
            });
        });

        const checkboxes = form.querySelectorAll('.input-checkbox[required]');

        checkboxes.forEach((checkbox) => {
            validator.addField(checkbox, [
                {
                    rule: 'required',
                    errorMessage: 'Это обязательноe поле',
                },
            ]);
        });

        const radioGroups = form.querySelectorAll('.radio-fieldset--required');

        radioGroups.forEach((radioGroup) => {
            validator.addRequiredGroup(radioGroup, 'Выберите одну из опций');
        });

        const selects = form.querySelectorAll('select[required]');

        selects.forEach((select) => {
            validator.addField(select, [
                {
                    rule: 'required',
                    errorMessage: 'Выберите одну из опций',
                },
            ]);
        });

        let isChecked = false;
        validator.onFail((fields) => {
        });
        validator.onSuccess((e) => {
        });
    });

    const phoneInput = document.querySelectorAll('.input-tel');

    if (phoneInput.length) {
        phoneInput.forEach(phone => {
            IMask(
                phone,
                {
                    mask: '+{38}(000)000-00-00'
                }
            )
        })
    }

})
