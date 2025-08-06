class ThemeSwitcher {
    constructor() {
        this.THEMES = {
            SYSTEM: 'system',
            LIGHT: 'light',
            DARK: 'dark'
        };

        this.themeToggle = document.querySelectorAll('.theme-switch');
        this.html = document.documentElement;
        this.currentTheme = localStorage.getItem('theme') || this.THEMES.SYSTEM;

        this.init();
    }

    init = () => {
        this.applyTheme();

        if(this.themeToggle.length) {
            this.themeToggle.forEach(button => {
                button.addEventListener('click', this.toggleTheme);
            });
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (this.currentTheme === this.THEMES.SYSTEM) {
                this.applyTheme();
            }
        });
    }

    applyTheme = () => {
        let themeToApply = this.currentTheme;

        if (this.currentTheme === this.THEMES.SYSTEM) {
            themeToApply = window.matchMedia('(prefers-color-scheme: dark)').matches ?
                this.THEMES.DARK : this.THEMES.LIGHT;
        }

        this.html.setAttribute('data-theme', themeToApply);
    }

    toggleTheme = () => {
        if (this.currentTheme === this.THEMES.SYSTEM) {
            this.currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ?
                this.THEMES.LIGHT : this.THEMES.DARK;
        } else if (this.currentTheme === this.THEMES.LIGHT) {
            this.currentTheme = this.THEMES.DARK;
        } else {
            this.currentTheme = this.THEMES.LIGHT;
        }

        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
    }
}




document.addEventListener('DOMContentLoaded',e=>{

    const copyInputArray = document.querySelectorAll('.js-copy');

    if(copyInputArray.length){
        copyInputArray.forEach(copy=>{
            const copyInput = copy.querySelector('.js-copy-input'),
                copyButton = copy.querySelector('.js-copy-button');
            if(copyButton && copyInput){
                copyButton.addEventListener('click', async function(e) {
                    e.preventDefault();
                    try {
                        await navigator.clipboard.writeText(copyInput.value);
                    } catch (err) {
                    }
                });
            }
        })
    }

    const themeSwitcher = new ThemeSwitcher();

    themeSwitcher.init()
});

