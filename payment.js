document.addEventListener('DOMContentLoaded', () => {
    const paymentManager = {
        // --- ELEMENTS ---
        paymentSummary: document.getElementById('payment-summary'),
        payBtn: document.getElementById('pay-btn'),
        cardNumberInput: document.getElementById('card-number'),
        cardNameInput: document.getElementById('card-name'),
        expiryDateInput: document.getElementById('expiry-date'),
        cvcInput: document.getElementById('cvc'),

        // --- STATE ---
        translations: {},
        bookingDetails: null,

        // --- INITIALIZATION ---
        init() {
            this.bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));
            if (!this.bookingDetails) {
                window.location.href = 'index.html';
                return;
            }
            this.addEventListeners();
        },

        addEventListeners() {
            document.addEventListener('languageChanged', (e) => {
                this.translations = e.detail;
                this.renderSummary();
            });
            this.payBtn.addEventListener('click', () => this.handlePayment());
        },

        // --- RENDER ---
        renderSummary() {
            if (!this.bookingDetails) return;
            const currency = this.translations.currency || 'TL';
            this.paymentSummary.innerHTML = `
                <h3>${this.translations.payment_summary || 'Payment Summary'}</h3>
                <p><strong>${this.translations.flight || 'Flight'}:</strong> ${this.bookingDetails.airline} - ${this.bookingDetails.flightNumber}</p>
                <p><strong>${this.translations.class || 'Class'}:</strong> ${this.bookingDetails.seatClass}</p>
                <p><strong>${this.translations.seats || 'Seats'}:</strong> ${this.bookingDetails.selectedSeats.join(', ')}</p>
                <p class="total-amount"><strong>${this.translations.total_amount || 'Total Amount'}:</strong> ${this.bookingDetails.finalPrice.toFixed(2)} ${currency}</p>
            `;
        },

        // --- ACTIONS ---
        handlePayment() {
            if (!this.validateInputs()) {
                return;
            }

            this.payBtn.disabled = true;
            this.payBtn.textContent = this.translations.processing_payment || 'Processing Payment...';

            setTimeout(() => {
                const pnr = Math.floor(100000 + Math.random() * 900000);
                this.bookingDetails.pnr = pnr;
                sessionStorage.setItem('bookingDetails', JSON.stringify(this.bookingDetails));
                sessionStorage.setItem('paymentComplete', 'true');
                window.location.href = 'confirmation.html';
            }, 2000);
        },

        validateInputs() {
            const cardName = this.cardNameInput.value.trim();
            const cardNumber = this.cardNumberInput.value.replace(/\s/g, '');
            const expiryDate = this.expiryDateInput.value.replace('/', '');
            const cvc = this.cvcInput.value;

            if (!cardName) {
                alert(this.translations.enter_card_name || 'Please enter the name on the card.');
                return false;
            }
            if (!/^\d{16}$/.test(cardNumber)) {
                alert(this.translations.invalid_card_number || 'The card number must be exactly 16 digits.');
                return false;
            }
            if (!/^\d{3}$/.test(cvc)) {
                alert(this.translations.invalid_cvc || 'The CVC code must be exactly 3 digits.');
                return false;
            }
            if (!/^\d{4}$/.test(expiryDate)) {
                alert(this.translations.invalid_expiry_date || 'The expiry date must be 4 digits in MM/YY format (e.g: 0528).');
                return false;
            }

            const month = parseInt(expiryDate.substring(0, 2), 10);
            const year = parseInt(expiryDate.substring(2, 4), 10);
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;

            if (month < 1 || month > 12) {
                alert(this.translations.invalid_month || 'Invalid month. The month must be between 01 and 12.');
                return false;
            }
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                alert(this.translations.card_expired || 'Your card has expired.');
                return false;
            }
            return true;
        }
    };

    paymentManager.init();
});