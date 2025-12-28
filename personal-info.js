document.addEventListener('DOMContentLoaded', () => {
    const passengerFormsContainer = document.getElementById('passenger-forms-container');
    const confirmBookingBtn = document.getElementById('confirm-booking-btn');
    const flightSummaryContainer = document.getElementById('flight-summary');

    // Retrieve booking data from sessionStorage
    const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));

    // If no data, redirect back to the main page
    if (!bookingDetails || !bookingDetails.selectedSeats || bookingDetails.selectedSeats.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    // --- Functions ---

    function renderFlightSummary() {
        if (!flightSummaryContainer) return;

        // Simple styling for the summary box
        const style = document.createElement('style');
        style.textContent = `
            .flight-summary-container {
                border: 1px solid #ddd;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 25px;
                background-color: #f9f9f9;
                color: #000000; /* Black text for all content */
            }
            .flight-summary-container h2 {
                margin-top: 0;
                border-bottom: 2px solid #eee;
                padding-bottom: 10px;
                margin-bottom: 15px;
                color: #000000; /* Black text for the heading */
            }
            .summary-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }
            .summary-item:last-child {
                border-bottom: none;
            }
            .summary-item strong {
                color: #000000; /* Black text for strong elements */
            }
        `;
        document.head.appendChild(style);

        const summaryHtml = `
            <h2>Uçuş Bilgileri</h2>
            <div class="summary-item">
                <strong>Nereden:</strong>
                <span>${bookingDetails.from}</span>
            </div>
            <div class="summary-item">
                <strong>Nereye:</strong>
                <span>${bookingDetails.to}</span>
            </div>
            <div class="summary-item">
                <strong>Tarih:</strong>
                <span>${bookingDetails.departureDate}</span>
            </div>
            <div class="summary-item">
                <strong>Saat:</strong>
                <span>${bookingDetails.departureTime}</span>
            </div>
             <div class="summary-item">
                <strong>Koltuk:</strong>
                <span>${bookingDetails.selectedSeats.join(', ')}</span>
            </div>
            <div class="summary-item">
                <strong>Fiyat:</strong>
                <span>${bookingDetails.finalPrice} TL</span>
            </div>
        `;
        flightSummaryContainer.innerHTML = summaryHtml;
    }

    function generatePassengerForms() {
        passengerFormsContainer.innerHTML = ''; // Clear container

        const adults = parseInt(bookingDetails.adults, 10) || 0;
        const children = parseInt(bookingDetails.children, 10) || 0;
        const totalPassengers = adults + children;

        // Ensure the number of selected seats matches the number of passengers
        if (bookingDetails.selectedSeats.length !== totalPassengers) {
            alert('Yolcu sayısı ile seçilen koltuk sayısı eşleşmiyor. Lütfen uçuş seçimine geri dönün.');
            window.location.href = 'flights.html';
            return;
        }
        
        const formTitle = document.createElement('h2');
        formTitle.textContent = `${totalPassengers} Yolcu İçin Bilgileri Giriniz`;
        passengerFormsContainer.appendChild(formTitle);

        let seatIndex = 0;

        // Generate forms for adults
        for (let i = 1; i <= adults; i++) {
            const seat = bookingDetails.selectedSeats[seatIndex++];
            const formHtml = `
                <div class="passenger-form" id="passenger-form-adult-${i}">
                    <h3>${i}. Yetişkin Yolcu Bilgileri (Koltuk: ${seat})</h3>
                    <div class="form-group">
                        <label for="tc-adult-${i}">TC Kimlik Numarası</label>
                        <input type="text" id="tc-adult-${i}" name="tc" pattern="[0-9]{11}" title="11 haneli TC Kimlik Numaranızı giriniz.">
                    </div>
                    <div class="form-group">
                        <label for="name-adult-${i}">Ad</label>
                        <input type="text" id="name-adult-${i}" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="surname-adult-${i}">Soyad</label>
                        <input type="text" id="surname-adult-${i}" name="surname" required>
                    </div>
                    <div class="form-group">
                        <label for="gender-adult-${i}">Cinsiyet</label>
                        <select id="gender-adult-${i}" name="gender">
                            <option value="kadin">Kadın</option>
                            <option value="erkek">Erkek</option>
                            <option value="belirtmek-istemiyorum">Belirtmek İstemiyorum</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="nationality-adult-${i}">Uyruk</label>
                        <input type="text" id="nationality-adult-${i}" name="nationality" value="Türkiye (TC)" required>
                    </div>
                    <div class="form-group">
                        <label for="phone-adult-${i}">Telefon Numarası</label>
                        <input type="tel" id="phone-adult-${i}" name="phone" placeholder="555-555-5555" required>
                    </div>
                    <div class="form-group">
                        <label for="email-adult-${i}">E-posta</label>
                        <input type="email" id="email-adult-${i}" name="email" required>
                    </div>
                </div>
            `;
            passengerFormsContainer.innerHTML += formHtml;
        }

        // Generate forms for children
        for (let i = 1; i <= children; i++) {
            const seat = bookingDetails.selectedSeats[seatIndex++];
            const formHtml = `
                <div class="passenger-form" id="passenger-form-child-${i}" style="border-left: 4px solid #00bfff;">
                    <h3>${i}. Çocuk Yolcu Bilgileri (Koltuk: ${seat})</h3>
                    <div class="form-group">
                        <label for="tc-child-${i}">TC Kimlik Numarası</label>
                        <input type="text" id="tc-child-${i}" name="tc" pattern="[0-9]{11}" title="11 haneli TC Kimlik Numaranızı giriniz.">
                    </div>
                    <div class="form-group">
                        <label for="name-child-${i}">Ad</label>
                        <input type="text" id="name-child-${i}" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="surname-child-${i}">Soyad</label>
                        <input type="text" id="surname-child-${i}" name="surname" required>
                    </div>
                    <div class="form-group">
                        <label for="gender-child-${i}">Cinsiyet</label>
                        <select id="gender-child-${i}" name="gender">
                            <option value="kadin">Kız</option>
                            <option value="erkek">Erkek</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="nationality-child-${i}">Uyruk</label>
                        <input type="text" id="nationality-child-${i}" name="nationality" value="Türkiye (TC)" required>
                    </div>
                    
                    <h4 style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">Veli Bilgileri</h4>
                    <div class="form-group">
                        <label for="parent-name-${i}">Veli Adı</label>
                        <input type="text" id="parent-name-${i}" name="parent-name" required>
                    </div>
                    <div class="form-group">
                        <label for="parent-surname-${i}">Veli Soyadı</label>
                        <input type="text" id="parent-surname-${i}" name="parent-surname" required>
                    </div>
                    <div class="form-group">
                        <label for="parent-email-${i}">Veli E-postası</label>
                        <input type="email" id="parent-email-${i}" name="parent-email" required>
                    </div>
                    <div class="form-group">
                        <label for="parent-phone-${i}">Veli Cep Telefonu</label>
                        <input type="tel" id="parent-phone-${i}" name="parent-phone" placeholder="555-555-5555" required>
                    </div>
                </div>
            `;
            passengerFormsContainer.innerHTML += formHtml;
        }
    }

    function handleConfirmBooking() {
        const passengersData = [];
        const adults = parseInt(bookingDetails.adults, 10) || 0;
        const children = parseInt(bookingDetails.children, 10) || 0;
        let allFormsValid = true;

        // Process adults
        for (let i = 1; i <= adults; i++) {
            const tcInput = document.getElementById(`tc-adult-${i}`);
            const nameInput = document.getElementById(`name-adult-${i}`);
            const surnameInput = document.getElementById(`surname-adult-${i}`);
            const emailInput = document.getElementById(`email-adult-${i}`);
            const phoneInput = document.getElementById(`phone-adult-${i}`);

            const tc = tcInput ? tcInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const surname = surnameInput ? surnameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';

            if ((tc.length !== 11 || !/^\d{11}$/.test(tc)) || phone.length !== 10 || !name || !surname || !email) {
                allFormsValid = false;
                if (tcInput) tcInput.style.borderColor = (tc.length !== 11 || !/^\d{11}$/.test(tc)) ? 'red' : '';
                if (phoneInput) phoneInput.style.borderColor = phone.length !== 10 ? 'red' : '';
                if (nameInput) nameInput.style.borderColor = !name ? 'red' : '';
                if (surnameInput) surnameInput.style.borderColor = !surname ? 'red' : '';
                if (emailInput) emailInput.style.borderColor = !email ? 'red' : '';
            } else {
                if (tcInput) tcInput.style.borderColor = '';
                if (phoneInput) phoneInput.style.borderColor = '';
                if (nameInput) nameInput.style.borderColor = '';
                if (surnameInput) surnameInput.style.borderColor = '';
                if (emailInput) emailInput.style.borderColor = '';
            }

            passengersData.push({
                tc, name, surname, email, phone,
                gender: document.getElementById(`gender-adult-${i}`).value,
                nationality: document.getElementById(`nationality-adult-${i}`).value,
                isChild: false
            });
        }

        // Process children
        for (let i = 1; i <= children; i++) {
            const tcInput = document.getElementById(`tc-child-${i}`);
            const nameInput = document.getElementById(`name-child-${i}`);
            const surnameInput = document.getElementById(`surname-child-${i}`);
            const parentNameInput = document.getElementById(`parent-name-${i}`);
            const parentSurnameInput = document.getElementById(`parent-surname-${i}`);
            const parentEmailInput = document.getElementById(`parent-email-${i}`);
            const parentPhoneInput = document.getElementById(`parent-phone-${i}`);

            const tc = tcInput ? tcInput.value.trim() : '';
            const name = nameInput ? nameInput.value.trim() : '';
            const surname = surnameInput ? surnameInput.value.trim() : '';
            const parentName = parentNameInput ? parentNameInput.value.trim() : '';
            const parentSurname = parentSurnameInput ? parentSurnameInput.value.trim() : '';
            const parentEmail = parentEmailInput ? parentEmailInput.value.trim() : '';
            const parentPhone = parentPhoneInput ? parentPhoneInput.value.replace(/\D/g, '') : '';

            if (!name || !surname || !parentName || !parentSurname || !parentEmail || parentPhone.length !== 10 || (tc && (tc.length !== 11 || !/^\d{11}$/.test(tc)))) {
                allFormsValid = false;
                if (nameInput) nameInput.style.borderColor = !name ? 'red' : '';
                if (surnameInput) surnameInput.style.borderColor = !surname ? 'red' : '';
                if (tcInput) tcInput.style.borderColor = (tc && (tc.length !== 11 || !/^\d{11}$/.test(tc))) ? 'red' : '';
                if (parentNameInput) parentNameInput.style.borderColor = !parentName ? 'red' : '';
                if (parentSurnameInput) parentSurnameInput.style.borderColor = !parentSurname ? 'red' : '';
                if (parentEmailInput) parentEmailInput.style.borderColor = !parentEmail ? 'red' : '';
                if (parentPhoneInput) parentPhoneInput.style.borderColor = parentPhone.length !== 10 ? 'red' : '';
            } else {
                if (nameInput) nameInput.style.borderColor = '';
                if (surnameInput) surnameInput.style.borderColor = '';
                if (tcInput) tcInput.style.borderColor = '';
                if (parentNameInput) parentNameInput.style.borderColor = '';
                if (parentSurnameInput) parentSurnameInput.style.borderColor = '';
                if (parentEmailInput) parentEmailInput.style.borderColor = '';
                if (parentPhoneInput) parentPhoneInput.style.borderColor = '';
            }

            passengersData.push({
                tc, name, surname,
                gender: document.getElementById(`gender-child-${i}`).value,
                nationality: document.getElementById(`nationality-child-${i}`).value,
                isChild: true,
                parentInfo: {
                    name: parentName,
                    surname: parentSurname,
                    email: parentEmail,
                    phone: parentPhone
                }
            });
        }

        if (!allFormsValid) {
            alert('Lütfen tüm yolcular için zorunlu alanları doğru bir şekilde doldurun.');
            return;
        }

        // Add passenger data to the main booking object and save it back to sessionStorage
        bookingDetails.passengers = passengersData;
        sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

        // Redirect to the payment page
        window.location.href = 'payment.html';
    }


    // --- Event Listeners & Initial Calls ---

    confirmBookingBtn.addEventListener('click', handleConfirmBooking);

    // Initial calls to render the page content
    if (!bookingDetails.fromReservation) {
        renderFlightSummary();
    }
    generatePassengerForms();
});