document.addEventListener('DOMContentLoaded', function() {
    const languageBtn = document.querySelector('.language-btn');
    const languageDropdown = document.querySelector('.language-dropdown');

    languageBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        languageDropdown.classList.toggle('show');
    });

    // Close the dropdown if the user clicks outside of it
    window.addEventListener('click', function(event) {
        if (!languageDropdown.contains(event.target) && !languageBtn.contains(event.target)) {
            if (languageDropdown.classList.contains('show')) {
                languageDropdown.classList.remove('show');
            }
        }
    });

    const setLanguage = async (lang) => {
        const response = await fetch(`locales/${lang}.json`);
        const translations = await response.json();

        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            element.textContent = translations[key];
        });
        document.documentElement.lang = lang;
    };

    languageDropdown.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            const lang = e.target.getAttribute('data-lang');
            if (lang) {
                localStorage.setItem('language', lang);
                setLanguage(lang);
                languageDropdown.classList.remove('show');
            }
        }
    });

    const savedLang = localStorage.getItem('language') || 'tr';
    setLanguage(savedLang);
});