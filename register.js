// register.js
document.addEventListener('DOMContentLoaded', () => {

    const registerManager = {
        // --- ELEMENTS ---
        registerForm: document.getElementById('registerForm'),
        regFirstNameInput: document.getElementById('regFirstName'),
        regLastNameInput: document.getElementById('regLastName'),
        regTcInput: document.getElementById('regTc'),
        regPhoneInput: document.getElementById('regPhone'),
        regEmailInput: document.getElementById('regEmail'),
        regPasswordInput: document.getElementById('regPassword'),

        // --- STATE ---
        translations: {},

        // --- INITIALIZATION ---
        init() {
            this.addEventListeners();
        },

        addEventListeners() {
            document.addEventListener('languageChanged', (e) => {
                this.translations = e.detail;
                // Update title attributes for validation messages
                if (this.regTcInput) this.regTcInput.title = this.translations.tc_placeholder || this.regTcInput.title;
                if (this.regPhoneInput) this.regPhoneInput.title = this.translations.phone_placeholder || this.regPhoneInput.title;
            });
            if (this.registerForm) this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        },

        // --- DATA ---
        getStoredUsers() {
            return JSON.parse(localStorage.getItem('simulatedUsers')) || [];
        },

        saveUsers(users) {
            localStorage.setItem('simulatedUsers', JSON.stringify(users));
        },

        // --- HANDLERS ---
        handleRegister(event) {
            event.preventDefault();
            const firstName = this.regFirstNameInput.value;
            const lastName = this.regLastNameInput.value;
            const tc = this.regTcInput.value;
            const phone = this.regPhoneInput.value;
            const email = this.regEmailInput.value;
            const password = this.regPasswordInput.value;

            const users = this.getStoredUsers();

            if (users.some(u => u.email === email)) {
                alert(this.translations.email_in_use || 'Bu e-posta adresi zaten kullanımda.');
                return;
            }

            users.push({ firstName, lastName, email, password, tc, phone });
            this.saveUsers(users);
            alert(this.translations.registration_successful || 'Üyelik başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
            window.location.href = 'membership.html'; // Redirect to login page
        }
    };

    registerManager.init();
});
