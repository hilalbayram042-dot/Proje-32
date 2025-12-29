document.addEventListener('DOMContentLoaded', () => {

    const personalInfoManager = {
        // --- ELEMENTS ---
        passengerFormsContainer: document.getElementById('passenger-forms-container'),
        confirmBookingBtn: document.getElementById('confirm-booking-btn'),
        flightSummaryContainer: document.getElementById('flight-summary'),

        // --- STATE ---
        translations: {},
        bookingDetails: null,

        // --- INITIALIZATION ---
        init() {
            this.bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));
            if (!this.bookingDetails || !this.bookingDetails.selectedSeats || this.bookingDetails.selectedSeats.length === 0) {
                window.location.href = 'index.html';
                return;
            }
            this.addEventListeners();
        },

        addEventListeners() {
            document.addEventListener('languageChanged', (e) => {
                this.translations = e.detail;
                this.reRenderUI();
            });
            this.confirmBookingBtn.addEventListener('click', () => this.handleConfirmBooking());
        },

        // --- RENDER LOGIC ---
        reRenderUI() {
            this.renderFlightSummary();
            this.generatePassengerForms();
        },

        renderFlightSummary() {
            if (!this.flightSummaryContainer || this.bookingDetails.fromReservation) return;
            
            const t = this.translations;
            const summaryHtml = `
                <div class="flight-summary-box">
                    <h2>${t.flight_information || 'Flight Information'}</h2>
                    <div class="summary-item"><strong>${t.from || 'From'}:</strong><span>${this.bookingDetails.from}</span></div>
                    <div class="summary-item"><strong>${t.to || 'To'}:</strong><span>${this.bookingDetails.to}</span></div>
                    <div class="summary-item"><strong>${t.departure_date || 'Departure Date'}:</strong><span>${this.bookingDetails.departureDate}</span></div>
                    <div class="summary-item"><strong>${t.departure || 'Departure'}:</strong><span>${this.bookingDetails.departureTime}</span></div>
                    <div class="summary-item"><strong>${t.seat || 'Seat'}:</strong><span>${this.bookingDetails.selectedSeats.join(', ')}</span></div>
                    <div class="summary-item"><strong>${t.price_label || 'Price'}:</strong><span>${this.bookingDetails.finalPrice} ${t.currency || 'TL'}</span></div>
                </div>
            `;
            this.flightSummaryContainer.innerHTML = summaryHtml;
        },

        generatePassengerForms() {
            this.passengerFormsContainer.innerHTML = ''; 
            const t = this.translations;
            const adults = parseInt(this.bookingDetails.adults, 10) || 0;
            const children = parseInt(this.bookingDetails.children, 10) || 0;
            const totalPassengers = adults + children;

            if (this.bookingDetails.selectedSeats.length !== totalPassengers) {
                alert(t.passenger_seat_mismatch || 'The number of passengers does not match the number of selected seats. Please go back to flight selection.');
                window.location.href = 'flights.html';
                return;
            }
            
            const formTitle = document.createElement('h2');
            formTitle.textContent = (t.enter_passenger_info || 'Enter Information for {totalPassengers} Passengers').replace('{totalPassengers}', totalPassengers);
            this.passengerFormsContainer.appendChild(formTitle);

            let seatIndex = 0;
            
            for (let i = 1; i <= adults; i++) {
                const seat = this.bookingDetails.selectedSeats[seatIndex++];
                this.passengerFormsContainer.innerHTML += this.getAdultFormHtml(i, seat, t);
            }

            for (let i = 1; i <= children; i++) {
                const seat = this.bookingDetails.selectedSeats[seatIndex++];
                this.passengerFormsContainer.innerHTML += this.getChildFormHtml(i, seat, t);
            }
        },

        getAdultFormHtml(i, seat, t) {
            return `
                <div class="passenger-form" id="passenger-form-adult-${i}">
                    <h3>${(t.adult_passenger_info || '{i}. Adult Passenger Information (Seat: {seat})').replace('{i}', i).replace('{seat}', seat)}</h3>
                    <div class="form-group"><label for="tc-adult-${i}">${t.turkish_id_number || 'Turkish Identification Number'}</label><input type="text" id="tc-adult-${i}" name="tc" pattern="[0-9]{11}" title="${t.enter_turkish_id || 'Enter your 11-digit Turkish Identification Number.'}"></div>
                    <div class="form-group"><label for="name-adult-${i}">${t.first_name || 'First Name'}</label><input type="text" id="name-adult-${i}" name="name" required></div>
                    <div class="form-group"><label for="surname-adult-${i}">${t.last_name || 'Last Name'}</label><input type="text" id="surname-adult-${i}" name="surname" required></div>
                    <div class="form-group"><label for="gender-adult-${i}">${t.gender || 'Gender'}</label><select id="gender-adult-${i}" name="gender"><option value="female">${t.female || 'Female'}</option><option value="male">${t.male || 'Male'}</option><option value="not-specified">${t.prefer_not_to_say || 'Prefer not to say'}</option></select></div>
                    <div class="form-group"><label for="nationality-adult-${i}">${t.nationality || 'Nationality'}</label><input type="text" id="nationality-adult-${i}" name="nationality" value="${t.turkey || 'Turkey (TC)'}" required></div>
                    <div class="form-group"><label for="phone-adult-${i}">${t.phone_number || 'Phone Number'}</label><input type="tel" id="phone-adult-${i}" name="phone" placeholder="555-555-5555" required></div>
                    <div class="form-group"><label for="email-adult-${i}">${t.email || 'E-mail'}</label><input type="email" id="email-adult-${i}" name="email" required></div>
                </div>`;
        },
        
        getChildFormHtml(i, seat, t) {
            return `
                <div class="passenger-form" id="passenger-form-child-${i}" style="border-left: 4px solid #00bfff;">
                    <h3>${(t.child_passenger_info || '{i}. Child Passenger Information (Seat: {seat})').replace('{i}', i).replace('{seat}', seat)}</h3>
                    <div class="form-group"><label for="tc-child-${i}">${t.turkish_id_number || 'Turkish Identification Number'}</label><input type="text" id="tc-child-${i}" name="tc" pattern="[0-9]{11}" title="${t.enter_turkish_id || 'Enter your 11-digit Turkish Identification Number.'}"></div>
                    <div class="form-group"><label for="name-child-${i}">${t.first_name || 'First Name'}</label><input type="text" id="name-child-${i}" name="name" required></div>
                    <div class="form-group"><label for="surname-child-${i}">${t.last_name || 'Last Name'}</label><input type="text" id="surname-child-${i}" name="surname" required></div>
                    <div class="form-group"><label for="gender-child-${i}">${t.gender || 'Gender'}</label><select id="gender-child-${i}" name="gender"><option value="girl">${t.girl || 'Girl'}</option><option value="boy">${t.boy || 'Boy'}</option></select></div>
                    <div class="form-group"><label for="nationality-child-${i}">${t.nationality || 'Nationality'}</label><input type="text" id="nationality-child-${i}" name="nationality" value="${t.turkey || 'Turkey (TC)'}" required></div>
                    <h4 style="margin-top: 20px; border-top: 1px solid #ddd; padding-top: 15px;">${t.guardian_information || 'Guardian Information'}</h4>
                    <div class="form-group"><label for="parent-name-${i}">${t.guardian_first_name || 'Guardian First Name'}</label><input type="text" id="parent-name-${i}" name="parent-name" required></div>
                    <div class="form-group"><label for="parent-surname-${i}">${t.guardian_last_name || 'Guardian Last Name'}</label><input type="text" id="parent-surname-${i}" name="parent-surname" required></div>
                    <div class="form-group"><label for="parent-email-${i}">${t.guardian_email || 'Guardian E-mail'}</label><input type="email" id="parent-email-${i}" name="parent-email" required></div>
                    <div class="form-group"><label for="parent-phone-${i}">${t.guardian_mobile_phone || 'Guardian Mobile Phone'}</label><input type="tel" id="parent-phone-${i}" name="parent-phone" placeholder="555-555-5555" required></div>
                </div>`;
        },

        // --- ACTIONS ---
        handleConfirmBooking() {
            const passengersData = [];
            const adults = parseInt(this.bookingDetails.adults, 10) || 0;
            const children = parseInt(this.bookingDetails.children, 10) || 0;
            let allFormsValid = true;
            
            const validateAndCollect = (form, isChild) => {
                let isValid = true;
                const data = {};
                const fields = isChild ? 
                    ['tc', 'name', 'surname', 'parent-name', 'parent-surname', 'parent-email', 'parent-phone'] : 
                    ['tc', 'name', 'surname', 'email', 'phone'];
                
                fields.forEach(field => {
                    const input = form.querySelector(`[name="${field}"]`);
                    if (input) {
                        input.style.borderColor = '';
                        if (!input.checkValidity() || !input.value.trim()) {
                            isValid = false;
                            input.style.borderColor = 'red';
                        }
                    }
                });

                return isValid;
            };

            for (let i = 1; i <= adults; i++) {
                if (!validateAndCollect(document.getElementById(`passenger-form-adult-${i}`), false)) allFormsValid = false;
            }
            for (let i = 1; i <= children; i++) {
                if (!validateAndCollect(document.getElementById(`passenger-form-child-${i}`), true)) allFormsValid = false;
            }
            
            if (!allFormsValid) {
                alert(this.translations.fill_required_fields || 'Please fill in the required fields for all passengers correctly.');
                return;
            }

            // If valid, collect data
            for (let i = 1; i <= adults; i++) {
                passengersData.push({
                    tc: document.getElementById(`tc-adult-${i}`).value,
                    name: document.getElementById(`name-adult-${i}`).value,
                    surname: document.getElementById(`surname-adult-${i}`).value,
                    email: document.getElementById(`email-adult-${i}`).value,
                    phone: document.getElementById(`phone-adult-${i}`).value,
                    gender: document.getElementById(`gender-adult-${i}`).value,
                    nationality: document.getElementById(`nationality-adult-${i}`).value,
                    isChild: false
                });
            }
             for (let i = 1; i <= children; i++) {
                passengersData.push({
                    tc: document.getElementById(`tc-child-${i}`).value,
                    name: document.getElementById(`name-child-${i}`).value,
                    surname: document.getElementById(`surname-child-${i}`).value,
                    gender: document.getElementById(`gender-child-${i}`).value,
                    nationality: document.getElementById(`nationality-child-${i}`).value,
                    isChild: true,
                    parentInfo: {
                        name: document.getElementById(`parent-name-${i}`).value,
                        surname: document.getElementById(`parent-surname-${i}`).value,
                        email: document.getElementById(`parent-email-${i}`).value,
                        phone: document.getElementById(`parent-phone-${i}`).value
                    }
                });
            }

            this.bookingDetails.passengers = passengersData;
            sessionStorage.setItem('bookingDetails', JSON.stringify(this.bookingDetails));
            window.location.href = 'payment.html';
        }
    };

    personalInfoManager.init();
});