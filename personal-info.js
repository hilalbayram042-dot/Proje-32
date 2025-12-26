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
        // The title should reflect that forms are for the selected number of passengers (seats)
        const passengerCount = bookingDetails.selectedSeats.length;
        const formTitle = document.createElement('h2');
        formTitle.textContent = `${passengerCount} Yolcu İçin Bilgileri Giriniz`;
        passengerFormsContainer.appendChild(formTitle);


        for (let i = 1; i <= passengerCount; i++) {
            const formHtml = `
                <div class="passenger-form" id="passenger-form-${i}">
                    <h3>${i}. Yolcu Bilgileri (Koltuk: ${bookingDetails.selectedSeats[i - 1]})</h3>
                    <div class="form-group">
                        <label for="tc-${i}">TC Kimlik Numarası</label>
                        <input type="text" id="tc-${i}" name="tc" pattern="[0-9]{11}" title="11 haneli TC Kimlik Numaranızı giriniz.">
                    </div>
                    <div class="form-group">
                        <label for="name-${i}">Ad</label>
                        <input type="text" id="name-${i}" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="surname-${i}">Soyad</label>
                        <input type="text" id="surname-${i}" name="surname" required>
                    </div>
                    <div class="form-group">
                        <label for="gender-${i}">Cinsiyet</label>
                        <select id="gender-${i}" name="gender">
                            <option value="kadin">Kadın</option>
                            <option value="erkek">Erkek</option>
                            <option value="belirtmek-istemiyorum">Belirtmek İstemiyorum</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label for="nationality-${i}">Uyruk</label>
                        <input type="text" id="nationality-${i}" name="nationality" value="Türkiye (TC)" required>
                    </div>
                    <div class="form-group">
                        <label for="phone-${i}">Telefon Numarası</label>
                        <input type="tel" id="phone-${i}" name="phone" placeholder="555-555-5555" required>
                    </div>
                    <div class="form-group">
                        <label for="email-${i}">E-posta</label>
                        <input type="email" id="email-${i}" name="email" required>
                    </div>
                </div>
            `;
            passengerFormsContainer.innerHTML += formHtml;
        }
    }

    function handleConfirmBooking() {
        const passengersData = [];
        const passengerCount = bookingDetails.selectedSeats.length;
        let allFormsValid = true;

        for (let i = 1; i <= passengerCount; i++) {
            const nameInput = document.getElementById(`name-${i}`);
            const surnameInput = document.getElementById(`surname-${i}`);
            const emailInput = document.getElementById(`email-${i}`);

            const name = nameInput.value.trim();
            const surname = surnameInput.value.trim();
            const email = emailInput.value.trim();
            
            if (!name || !surname || !email) { // Also check for email
                allFormsValid = false;
                // Highlight empty fields
                if (!name) nameInput.style.borderColor = 'red'; else nameInput.style.borderColor = '';
                if (!surname) surnameInput.style.borderColor = 'red'; else surnameInput.style.borderColor = '';
                if (!email) emailInput.style.borderColor = 'red'; else emailInput.style.borderColor = '';

            } else {
                 nameInput.style.borderColor = '';
                 surnameInput.style.borderColor = '';
                 emailInput.style.borderColor = '';
            }

            const passengerInfo = {
                tc: document.getElementById(`tc-${i}`).value,
                name: name,
                surname: surname,
                gender: document.getElementById(`gender-${i}`).value,
                nationality: document.getElementById(`nationality-${i}`).value,
                phone: document.getElementById(`phone-${i}`).value,
                email: email,
            };
            passengersData.push(passengerInfo);
        }

        if (!allFormsValid) {
            alert('Lütfen tüm yolcular için zorunlu alanları (Ad, Soyad, E-posta) doldurun.');
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