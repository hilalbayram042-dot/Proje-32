document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');

    backBtn.addEventListener('click', () => {
        window.location.href = 'welcome.html';
    });
});