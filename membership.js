document.addEventListener('DOMContentLoaded', () => {
    const membershipManager = {
        // --- ELEMENTS ---
        loginFormSection: document.getElementById('loginFormSection'),
        registerFormSection: document.getElementById('registerFormSection'),
        loggedInSection: document.getElementById('loggedInSection'),
        myTicketsSection: document.getElementById('myTicketsSection'),
        ticketListDiv: document.getElementById('ticketList'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        logoutButton: document.getElementById('logoutButton'),
        showRegisterFormLink: document.getElementById('showRegisterFormLink'),
        showLoginFormLink: document.getElementById('showLoginForm'),
        welcomeMessage: document.getElementById('welcomeMessage'),

        // --- STATE ---
        translations: {},

        // --- INITIALIZATION ---
        init() {
            this.addEventListeners();
            this.getStoredUsers(); // Ensure default user exists
            this.reRender(); // Initial render
        },

        addEventListeners() {
            document.addEventListener('languageChanged', (e) => {
                this.translations = e.detail;
                this.reRender();
            });

            if (this.loginForm) this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
            if (this.registerForm) this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
            if (this.logoutButton) this.logoutButton.addEventListener('click', () => this.handleLogout());

            if (this.showRegisterFormLink) {
                this.showRegisterFormLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.loginFormSection.style.display = 'none';
                    this.registerFormSection.style.display = 'block';
                    this.registerForm.reset();
                });
            }

            if (this.showLoginFormLink) {
                this.showLoginFormLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.loginFormSection.style.display = 'block';
                    this.registerFormSection.style.display = 'none';
                    this.loginForm.reset();
                });
            }

            if (this.ticketListDiv) {
                this.ticketListDiv.addEventListener('click', (event) => {
                    if (event.target.classList.contains('cancel-ticket-btn')) {
                        const pnr = event.target.dataset.pnr;
                        this.handleCancelTicket(pnr);
                    }
                });
            }
        },

        // --- DATA ---
        getStoredUsers() {
            let users = JSON.parse(localStorage.getItem('simulatedUsers')) || [];
            if (users.length === 0) {
                users.push({
                    firstName: 'Meltem',
                    lastName: 'Koran',
                    email: 'meltemkoran49@gmail.com',
                    password: '123456',
                    tc: '10893456672',
                    phone: '5326872134'
                });
                this.saveUsers(users);
            }
            return users;
        },

        saveUsers(users) {
            localStorage.setItem('simulatedUsers', JSON.stringify(users));
        },

        // --- RENDER LOGIC ---
        reRender() {
            const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
            const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

            if (isLoggedIn) {
                this.loginFormSection.style.display = 'none';
                this.registerFormSection.style.display = 'none';
                this.loggedInSection.style.display = 'block';
                this.myTicketsSection.style.display = 'block';
                this.logoutButton.style.display = 'block';
                const welcomeText = this.translations.welcome || 'Welcome,';
                const memberText = this.translations.member || 'Member';
                this.welcomeMessage.textContent = `${welcomeText} ${loggedInUserEmail || memberText}!`;
                this.renderPurchasedTickets();
            } else {
                this.loginFormSection.style.display = 'block';
                this.registerFormSection.style.display = 'none';
                this.loggedInSection.style.display = 'none';
                this.myTicketsSection.style.display = 'none';
                this.logoutButton.style.display = 'none';
            }
        },
        
        renderPurchasedTickets() {
            const allTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
            const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const userTickets = allTickets.filter(ticket => ticket.purchaserEmail === loggedInUserEmail || ticket.associatedUserEmail === loggedInUserEmail);

            if (userTickets.length > 0) {
                this.ticketListDiv.innerHTML = ''; 

                userTickets.forEach((bookingDetails) => {
                    const ticketDate = new Date(bookingDetails.departureDate);
                    const isExpired = ticketDate < today;

                    const ticketItem = document.createElement('div');
                    ticketItem.classList.add('ticket-item');
                    if (isExpired) ticketItem.classList.add('expired-ticket');

                    let actionHtml = !isExpired
                        ? `<button class="cancel-ticket-btn" data-pnr="${bookingDetails.pnr}">${this.translations.cancel_ticket || 'Cancel Ticket'}</button>`
                        : `<p class="expired-ticket-message">${this.translations.ticket_expired || 'This ticket has expired.'}</p>`;
                    
                    let specialNote = '';
                    if (bookingDetails.isChildTicket) {
                        const childPassenger = bookingDetails.passengers.find(p => p.isChild);
                        if (childPassenger) {
                            const noteTemplate = this.translations.child_ticket_note || 'Note: This ticket is for the child "{childName}" for whom you are the guardian.';
                            specialNote = `<p style="color: #00bfff; font-weight: bold;">${noteTemplate.replace('{childName}', `${childPassenger.name} ${childPassenger.surname}`)}</p>`;
                        }
                    }

                    const passengerDetails = bookingDetails.passengers.map(p => {
                        let passengerLabel = p.isChild ? this.translations.child || '(Child)' : this.translations.adult || '(Adult)';
                        return `<p>${p.name} ${p.surname} ${passengerLabel} (${this.translations.tc_id || 'ID'}: ${p.tc || 'N/A'})</p>`;
                    }).join('');

                    ticketItem.innerHTML = `
                        ${specialNote}
                        <h3>${this.translations.flight_number || 'Flight Number'}: ${bookingDetails.flightNumber} (${this.translations.pnr || 'PNR'}: ${bookingDetails.pnr})</h3>
                        <p>${this.translations.airline || 'Airline'}: ${bookingDetails.airline}</p>
                        <p>${this.translations.departure || 'Departure'}: ${bookingDetails.departureTime} - ${this.translations.arrival || 'Arrival'}: ${bookingDetails.arrivalTime}</p>
                        <p>${this.translations.departure_date || 'Departure Date'}: ${bookingDetails.departureDate}</p>
                        <p>${this.translations.class || 'Class'}: ${bookingDetails.seatClass}</p>
                        <p>${this.translations.seats || 'Seats'}: ${bookingDetails.selectedSeats.join(', ')}</p>
                        <p>${this.translations.total_amount || 'Total Amount'}: ${bookingDetails.finalPrice.toFixed(2)} ${this.translations.currency || 'TL'}</p>
                        <h4>${this.translations.passenger_info || 'Passenger Information'}:</h4>
                        ${passengerDetails}
                        ${actionHtml}
                    `;
                    this.ticketListDiv.appendChild(ticketItem);
                });
            } else {
                this.ticketListDiv.innerHTML = `<p>${this.translations.no_purchased_tickets_message || 'You have no purchased tickets yet.'}</p>`;
            }
        },

        // --- HANDLERS ---
        handleCancelTicket(pnr) {
            if (confirm(this.translations.confirm_cancel_ticket || 'Are you sure you want to cancel this ticket?')) {
                let purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
                purchasedTickets = purchasedTickets.filter(ticket => String(ticket.pnr) !== String(pnr));
                localStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
                this.renderPurchasedTickets();
                alert(this.translations.ticket_cancelled_successfully || 'Ticket successfully cancelled.');
            }
        },

        handleLogin(event) {
            event.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const users = this.getStoredUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('loggedInUserEmail', user.email);
                alert(this.translations.login_successful || 'Login successful!');
                this.reRender();
            } else {
                alert(this.translations.invalid_email_or_password || 'Invalid email or password.');
            }
        },

        handleRegister(event) {
            event.preventDefault();
            const email = document.getElementById('regEmail').value;
            const users = this.getStoredUsers();

            if (users.some(u => u.email === email)) {
                alert(this.translations.email_in_use || 'This email address is already in use.');
                return;
            }

            const newUser = {
                firstName: document.getElementById('regFirstName').value,
                lastName: document.getElementById('regLastName').value,
                email: email,
                password: document.getElementById('regPassword').value,
                tc: document.getElementById('regTc').value,
                phone: document.getElementById('regPhone').value,
            };
            
            users.push(newUser);
            this.saveUsers(users);
            alert(this.translations.registration_successful || 'Membership created successfully! You can now log in.');
            
            this.loginFormSection.style.display = 'block';
            this.registerFormSection.style.display = 'none';
            this.loginForm.reset();
            this.registerForm.reset();
        },

        handleLogout() {
            sessionStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('loggedInUserEmail');
            alert(this.translations.logged_out || 'Logged out.');
            this.reRender();
            this.loginForm.reset();
        }
    };

    membershipManager.init();
});