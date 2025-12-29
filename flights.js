document.addEventListener('DOMContentLoaded', () => {

    const flightsManager = {
        // --- ELEMENTS ---
        backBtn: document.getElementById('back-btn'),
        bookButtons: document.querySelectorAll('.book-btn'),
        modal: document.getElementById('booking-modal'),
        closeModalBtn: null, // Init in init()
        confirmModalBtn: document.getElementById('confirm-booking-modal-btn'),
        passengerCountInput: document.getElementById('passenger-count'),
        seatClassRadios: document.querySelectorAll('input[name="seat-class"]'),
        totalPriceDisplay: document.getElementById('total-price-display'),

        // --- STATE ---
        translations: {},
        currentFlightData: null,
        BUSINESS_MULTIPLIER: 1.8,

        // --- INITIALIZATION ---
        init() {
            this.closeModalBtn = this.modal.querySelector('.close-button');
            this.addEventListeners();
        },

        addEventListeners() {
            // Listen for language changes to update UI elements
            document.addEventListener('languageChanged', (e) => {
                this.translations = e.detail;
                // If modal is open, update the price display with the new currency
                if (this.modal.style.display === 'block') {
                    this.updateTotalPrice();
                }
            });

            if (this.backBtn) {
                this.backBtn.addEventListener('click', () => {
                    window.location.href = 'index.html';
                });
            }

            this.bookButtons.forEach(button => {
                button.addEventListener('click', (event) => {
                    const flightElement = event.target.closest('.flight');
                    this.openModalWithFlightData(flightElement);
                });
            });

            this.closeModalBtn.addEventListener('click', () => this.modal.style.display = 'none');
            window.addEventListener('click', (event) => {
                if (event.target === this.modal) {
                    this.modal.style.display = 'none';
                }
            });

            this.confirmModalBtn.addEventListener('click', () => this.confirmBooking());
            this.passengerCountInput.addEventListener('input', () => this.updateTotalPrice());
            this.seatClassRadios.forEach(radio => radio.addEventListener('change', () => this.updateTotalPrice()));
        },

        // --- CORE LOGIC ---
        openModalWithFlightData(flightElement) {
            // Read data directly from dataset attributes
            const { from, to, date, time, price } = flightElement.dataset;

            this.currentFlightData = {
                from,
                to,
                departureDate: date,
                departureTime: time,
                basePrice: parseInt(price)
            };

            // Reset modal to defaults
            this.passengerCountInput.value = 1;
            document.getElementById('economy-class').checked = true;

            this.updateTotalPrice();
            this.modal.style.display = 'block';
        },

        updateTotalPrice() {
            if (!this.currentFlightData) return;

            const passengerCount = parseInt(this.passengerCountInput.value);
            const selectedClass = document.querySelector('input[name="seat-class"]:checked').value;

            let pricePerPassenger = this.currentFlightData.basePrice;
            if (selectedClass === 'Business') {
                pricePerPassenger *= this.BUSINESS_MULTIPLIER;
            }

            const total = pricePerPassenger * passengerCount;
            const currency = this.translations.currency || 'TL';
            this.totalPriceDisplay.textContent = `${total.toFixed(0)} ${currency}`;
        },

        confirmBooking() {
            if (!this.currentFlightData) {
                alert(this.translations.error_occurred || "An error occurred. Please try again.");
                return;
            }

            const passengerCount = parseInt(this.passengerCountInput.value);
            const selectedClass = document.querySelector('input[name="seat-class"]:checked').value;

            let pricePerPassenger = this.currentFlightData.basePrice;
            if (selectedClass === 'Business') {
                pricePerPassenger *= this.BUSINESS_MULTIPLIER;
            }
            const finalPrice = pricePerPassenger * passengerCount;

            const seatPlaceholder = this.translations.seat_placeholder || 'Seat {seatNumber}';
            const selectedSeats = Array.from({ length: passengerCount }, (_, i) => seatPlaceholder.replace('{seatNumber}', i + 1));

            const bookingDetails = {
                ...this.currentFlightData,
                finalPrice: finalPrice,
                airline: this.translations.unknown_airline || 'Unknown Airline',
                flightNumber: this.translations.unknown || 'Unknown',
                seatClass: selectedClass,
                selectedSeats: selectedSeats,
                isConnecting: false,
                arrivalTime: this.translations.unknown || 'Unknown',
                // Add passenger count for personal-info page
                adults: passengerCount,
                children: 0 // This page doesn't specify adults/children, so assume all are adults
            };

            sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
            window.location.href = 'personal-info.html';
        }
    };

    flightsManager.init();
});

