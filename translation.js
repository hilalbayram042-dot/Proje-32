async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json?v=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error(`Could not load ${lang}.json`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading translations:', error);
        return {};
    }
}

function translatePage(translations) {
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
        const key = element.dataset.translate;
        if (translations && translations[key]) {
            element.textContent = translations[key];
        }
    });
}

async function setLanguage(lang) {
    localStorage.setItem('language', lang);
    const translations = await loadTranslations(lang);
    translatePage(translations);
    document.documentElement.lang = lang; 
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'tr';
    setLanguage(savedLang);

    
    document.body.addEventListener('click', (event) => {
        const langLink = event.target.closest('[data-lang]');
        if (langLink) {
            event.preventDefault();
            const lang = langLink.dataset.lang;
            if (lang !== localStorage.getItem('language')) {
                setLanguage(lang);
            }
        }
    });
});
