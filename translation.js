const translations = {};

async function loadTranslations(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Could not load ${lang}.json`);
        }
        const data = await response.json();
        translations[lang] = data;
        return data;
    } catch (error) {
        console.error('Error loading translations:', error);
        return {};
    }
}

function translatePage(lang) {
    const targetLang = lang || localStorage.getItem('language') || 'tr';
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
        const key = element.dataset.translate;
        if (translations[targetLang] && translations[targetLang][key]) {
            element.textContent = translations[targetLang][key];
        }
    });
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);
    loadTranslations(lang).then(() => {
        translatePage(lang);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'tr';
    setLanguage(savedLang);

    const langLinks = document.querySelectorAll('.language-dropdown a');
    langLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const lang = link.dataset.lang;
            setLanguage(lang);
        });
    });
});
