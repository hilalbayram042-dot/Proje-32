document.addEventListener('DOMContentLoaded', () => {
    const confirmationMessage = document.getElementById('confirmation-message');
    const homeBtn = document.getElementById('home-btn');

    // Retrieve booking and payment status from sessionStorage
    const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));
    const paymentComplete = sessionStorage.getItem('paymentComplete');

    // If data is missing or payment wasn't marked as complete, redirect
    if (!bookingDetails || !paymentComplete) {
        window.location.href = 'index.html';
        return;
    }

    // Get the email of the first passenger
    const recipientEmail = bookingDetails.passengers && bookingDetails.passengers.length > 0 
        ? bookingDetails.passengers[0].email 
        : 'belirtilen e-posta adresine';

    const pnrLine = bookingDetails.pnr
        ? `<p>Biletiniz başarıyla oluşturulmuştur. PNR kodunuz: <strong>${bookingDetails.pnr}</strong></p>`
        : '';

    const passengerNames = bookingDetails.passengers.map(p => `${p.name} ${p.surname}`).join(', ');

    // Display the confirmation message
    confirmationMessage.innerHTML = `
        <p>Ödemeniz başarıyla tamamlanmıştır.</p>
        ${pnrLine}
        
        <div class="ticket-summary" style="border: 1px solid #ccc; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <h4 style="margin-top: 0;">Bilet Özeti</h4>
            <p><strong>Nereden:</strong> ${bookingDetails.from}</p>
            <p><strong>Nereye:</strong> ${bookingDetails.to}</p>
            <p><strong>Gidiş Tarihi:</strong> ${bookingDetails.departureDate}</p>
            ${bookingDetails.isRoundTrip ? `<p><strong>Dönüş Tarihi:</strong> ${bookingDetails.returnDate}</p>` : ''}
            <p><strong>Yolcular:</strong> ${passengerNames}</p>
        </div>

        <p style="margin-top: 20px;">Bilet bilgilerinizin tüm detayları <strong>${recipientEmail}</strong> adresine e-posta olarak gönderilmiştir.</p>
        <p>İyi uçuşlar dileriz!</p>
    `;

    console.log('Final booking confirmed:', bookingDetails);
    console.log(`(Simulated) Tickets sent to: ${recipientEmail}`);

    // --- Persist the purchased ticket to localStorage ---
    let purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
    purchasedTickets.push(bookingDetails);
    localStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
    // --- End persistence logic ---

    // Handle home button click
    homeBtn.addEventListener('click', () => {
        // Clear all session data related to the booking
        sessionStorage.removeItem('bookingDetails');
        sessionStorage.removeItem('paymentComplete');

        // Redirect to the welcome page
        window.location.href = 'welcome.html';
    });
});