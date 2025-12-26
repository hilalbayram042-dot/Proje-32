// register.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const regFirstNameInput = document.getElementById('regFirstName');
    const regLastNameInput = document.getElementById('regLastName');
    const regTcInput = document.getElementById('regTc');
    const regPhoneInput = document.getElementById('regPhone');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');

    function getStoredUsers() {
        return JSON.parse(localStorage.getItem('simulatedUsers')) || [];
    }

    function saveUsers(users) {
        localStorage.setItem('simulatedUsers', JSON.stringify(users));
    }

    function handleRegister(event) {
        event.preventDefault();
        const firstName = regFirstNameInput.value;
        const lastName = regLastNameInput.value;
        const tc = regTcInput.value;
        const phone = regPhoneInput.value;
        const email = regEmailInput.value;
        const password = regPasswordInput.value;

        const users = getStoredUsers();

        if (users.some(u => u.email === email)) {
            alert('Bu e-posta adresi zaten kullanımda.');
            return;
        }

        users.push({ firstName, lastName, email, password, tc, phone });
        saveUsers(users);
        alert('Üyelik başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
        window.location.href = 'membership.html'; // Redirect to login page
    }

    if (registerForm) registerForm.addEventListener('submit', handleRegister);
});
