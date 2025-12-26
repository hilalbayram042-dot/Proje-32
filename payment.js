
document.addEventListener('DOMContentLoaded', () => {
    const paymentSummary = document.getElementById('payment-summary');
    const payBtn = document.getElementById('pay-btn');
    const cardNumberInput = document.getElementById('card-number');
    const cardNameInput = document.getElementById('card-name');
    const expiryDateInput = document.getElementById('expiry-date');
    const cvcInput = document.getElementById('cvc');

    // Retrieve booking data from sessionStorage
    const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));

    // If no data, redirect back to the main page
    if (!bookingDetails) {
        window.location.href = 'index.html';
        return;
    }

    // Display payment summary
    paymentSummary.innerHTML = `
        <h3>Ödeme Özeti</h3>
        <p><strong>Uçuş:</strong> ${bookingDetails.airline} - ${bookingDetails.flightNumber}</p>
        <p><strong>Sınıf:</strong> ${bookingDetails.seatClass}</p>
        <p><strong>Koltuklar:</strong> ${bookingDetails.selectedSeats.join(', ')}</p>
        <p class="total-amount"><strong>Toplam Tutar:</strong> ${bookingDetails.finalPrice.toFixed(2)} TL</p>
    `;

    // Handle payment button click
    payBtn.addEventListener('click', () => {
        // Basic validation
        if (!cardNumberInput.value || !cardNameInput.value || !expiryDateInput.value || !cvcInput.value) {
            alert('Lütfen tüm kredi kartı bilgilerini eksiksiz girin.');
            return;
        }

        // Disable button to prevent multiple clicks
        payBtn.disabled = true;
        payBtn.textContent = 'Ödeme İşleniyor...';

        // Simulate payment processing delay
        setTimeout(() => {
            // Generate a 6-digit PNR
            const pnr = Math.floor(100000 + Math.random() * 900000);
            bookingDetails.pnr = pnr;

            // Save updated details to session storage
            sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

            console.log('Payment successful! PNR:', pnr);
            
            // Mark payment as complete in session storage
            sessionStorage.setItem('paymentComplete', 'true');

            // Redirect to the confirmation page
            window.location.href = 'confirmation.html';
        }, 2000); // 2-second delay
    });
});