// membership.js
document.addEventListener('DOMContentLoaded', () => {
    const loginFormSection = document.getElementById('loginFormSection');
    const registerFormSection = document.getElementById('registerFormSection');
    const loggedInSection = document.getElementById('loggedInSection');
    const myTicketsSection = document.getElementById('myTicketsSection');
    const ticketListDiv = document.getElementById('ticketList');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const logoutButton = document.getElementById('logoutButton');
    const showRegisterFormLink = document.getElementById('showRegisterFormLink');
    const showLoginFormLink = document.getElementById('showLoginForm');

    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');

    const regFirstNameInput = document.getElementById('regFirstName');
    const regLastNameInput = document.getElementById('regLastName');
    const regTcInput = document.getElementById('regTc');
    const regPhoneInput = document.getElementById('regPhone');
    const regEmailInput = document.getElementById('regEmail');
    const regPasswordInput = document.getElementById('regPassword');

    const welcomeMessage = document.getElementById('welcomeMessage');

    // --- Simulated User Data Storage ---
    // In a real application, this would be handled by a backend
    function getStoredUsers() {
        let users = JSON.parse(localStorage.getItem('simulatedUsers')) || [];
        // Add a default user if the storage is empty
        if (users.length === 0) {
            users.push({
                firstName: 'Meltem',
                lastName: 'Koran',
                email: 'meltemkoran49@gmail.com',
                password: '123456',
                tc: '10893456672',
                phone: '5326872134'
            });
            saveUsers(users); // Save the pre-populated user
        }
        return users;
    }

    function saveUsers(users) {
        localStorage.setItem('simulatedUsers', JSON.stringify(users));
    }

    // --- Functions ---

    function renderPurchasedTickets() {
        const purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];

        if (purchasedTickets.length > 0) {
            ticketListDiv.innerHTML = ''; // Clear "No tickets found" message

            purchasedTickets.forEach((bookingDetails, index) => {
                const ticketItem = document.createElement('div');
                ticketItem.classList.add('ticket-item');
                ticketItem.innerHTML = `
                    <h3>Uçuş Numarası: ${bookingDetails.flightNumber} (PNR: ${bookingDetails.pnr})</h3>
                    <p>Havayolu: ${bookingDetails.airline}</p>
                    <p>Kalkış: ${bookingDetails.departureTime} - Varış: ${bookingDetails.arrivalTime}</p>
                    <p>Sınıf: ${bookingDetails.seatClass}</p>
                    <p>Koltuklar: ${bookingDetails.selectedSeats.join(', ')}</p>
                    <p>Toplam Tutar: ${bookingDetails.finalPrice.toFixed(2)} TL</p>
                    <h4>Yolcu Bilgileri:</h4>
                    ${bookingDetails.passengers.map(p => `<p>${p.name} ${p.surname} (TC: ${p.tc || 'N/A'})</p>`).join('')}
                    <button class="cancel-ticket-btn" data-pnr="${bookingDetails.pnr}">Bileti İptal Et</button>
                `;
                ticketListDiv.appendChild(ticketItem);
            });
        } else {
            ticketListDiv.innerHTML = '<p data-translate="no_purchased_tickets">Henüz satın alınmış biletiniz bulunmamaktadır.</p>';
        }
    }

    function handleCancelTicket(pnr) {
        if (confirm('Bu bileti iptal etmek istediğinizden emin misiniz?')) {
            let purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
            // When comparing PNRs, ensure both are treated as strings
            purchasedTickets = purchasedTickets.filter(ticket => String(ticket.pnr) !== String(pnr));
            localStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
            renderPurchasedTickets();
            alert('Bilet başarıyla iptal edildi.');
        }
    }

    function renderPage() {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

        if (isLoggedIn) {
            loginFormSection.style.display = 'none';
            registerFormSection.style.display = 'none';
            loggedInSection.style.display = 'block';
            myTicketsSection.style.display = 'block';
            logoutButton.style.display = 'block';
            welcomeMessage.textContent = `Hoş Geldiniz, ${loggedInUserEmail || 'Üye'}!`;
            renderPurchasedTickets(); // Render tickets only when logged in
        } else {
            loginFormSection.style.display = 'block';
            registerFormSection.style.display = 'none'; // Default to login form
            loggedInSection.style.display = 'none';
            myTicketsSection.style.display = 'none';
            logoutButton.style.display = 'none';
        }
    }

    function handleLogin(event) {
        event.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;
        const users = getStoredUsers();

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('loggedInUserEmail', user.email);
            alert('Giriş başarılı!');
            renderPage();
        } else {
            alert('Geçersiz e-posta veya şifre.');
        }
    }

    function handleRegister(event) {
        event.preventDefault();
        const firstName = regFirstNameInput.value;
        const lastName = regLastNameInput.value;
        const email = regEmailInput.value;
        const password = regPasswordInput.value;
        const tc = regTcInput.value;
        const phone = regPhoneInput.value;

        const users = getStoredUsers();

        if (users.some(u => u.email === email)) {
            alert('Bu e-posta adresi zaten kullanımda.');
            return;
        }

        users.push({ firstName, lastName, email, password, tc, phone });
        saveUsers(users);
        alert('Üyelik başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.');
        // After registration, switch to login form
        loginFormSection.style.display = 'block';
        registerFormSection.style.display = 'none';
        loginForm.reset(); // Clear login form fields
        registerForm.reset(); // Clear register form fields
    }

    function handleLogout() {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('loggedInUserEmail');
        alert('Çıkış yapıldı.');
        renderPage();
        loginForm.reset(); // Clear login form fields on logout
    }

    // --- Event Listeners ---
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registerForm) registerForm.addEventListener('submit', handleRegister);
    if (logoutButton) logoutButton.addEventListener('click', handleLogout);

    if (showRegisterFormLink) {
        showRegisterFormLink.addEventListener('click', (event) => {
            event.preventDefault();
            loginFormSection.style.display = 'none';
            registerFormSection.style.display = 'block';
            registerForm.reset(); // Clear register form fields
        });
    }

    if (showLoginFormLink) {
        showLoginFormLink.addEventListener('click', (event) => {
            event.preventDefault();
            loginFormSection.style.display = 'block';
            registerFormSection.style.display = 'none';
            loginForm.reset(); // Clear login form fields
        });
    }

    if (ticketListDiv) {
        ticketListDiv.addEventListener('click', (event) => {
            if (event.target.classList.contains('cancel-ticket-btn')) {
                const pnr = event.target.dataset.pnr;
                handleCancelTicket(pnr);
            }
        });
    }

    // Initial render when page loads
    renderPage();
});