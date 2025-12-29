// This function will render the dynamic content of the page using the provided translations
function renderConfirmationPage(translations) {
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

    const recipientEmail = bookingDetails.passengers && bookingDetails.passengers.length > 0 
        ? bookingDetails.passengers[0].email 
        : translations.recipient_email_placeholder || 'the specified email address';

    const pnrLine = bookingDetails.pnr
        ? `<p>${translations.ticket_creation_success || 'Your ticket has been successfully created. Your PNR code is: '}<strong>${bookingDetails.pnr}</strong></p>`
        : '';

    const passengerNames = bookingDetails.passengers.map(p => `${p.name} ${p.surname}`).join(', ');

    // --- Persist the purchased ticket to localStorage ---
    // This logic doesn't need translation, but we run it here to make sure the ticket is saved.
    let purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
    const loggedInUserEmail = sessionStorage.getItem('loggedInUserEmail');

    // Check if this PNR has already been added to avoid duplicates on language switch
    const ticketAlreadyExists = purchasedTickets.some(ticket => ticket.pnr === bookingDetails.pnr && ticket.purchaserEmail === loggedInUserEmail);

    if (!ticketAlreadyExists) {
        if (loggedInUserEmail) {
            bookingDetails.purchaserEmail = loggedInUserEmail;
        }
        purchasedTickets.push(bookingDetails);

        bookingDetails.passengers.forEach(passenger => {
            if (passenger.isChild && passenger.parentInfo && passenger.parentInfo.email) {
                const parentTicket = JSON.parse(JSON.stringify(bookingDetails));
                parentTicket.associatedUserEmail = passenger.parentInfo.email;
                parentTicket.isChildTicket = true;
                purchasedTickets.push(parentTicket);
                console.log(`(Simulated) Child's ticket details sent to parent: ${passenger.parentInfo.email}`);
            }
        });
        localStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
    }
    // --- End persistence logic ---

    // Determine email recipients for the confirmation message
    const primaryRecipient = loggedInUserEmail || recipientEmail;
    const parentEmails = bookingDetails.passengers
        .filter(p => p.isChild && p.parentInfo && p.parentInfo.email)
        .map(p => p.parentInfo.email);
    
    const uniqueParentEmails = [...new Set(parentEmails)];

    let emailRecipientsText;
    if (uniqueParentEmails.length > 0) {
        const parentEmailsString = `<strong>${uniqueParentEmails.join(', ')}</strong>`;
        // "and parent/guardian e-mail address(es)"
        emailRecipientsText = `<strong>${primaryRecipient}</strong> ${translations.and_parent_email || 'and parent/guardian e-mail address(es)'} ${parentEmailsString}`;
    } else {
        emailRecipientsText = `<strong>${primaryRecipient}</strong>`;
    }

    // Display the translated confirmation message
    confirmationMessage.innerHTML = `
        <p>${translations.payment_successful || 'Your payment has been successfully completed.'}</p>
        ${pnrLine}
        <div class="ticket-summary" style="border: 1px solid #ccc; padding: 15px; margin-top: 20px; border-radius: 5px;">
            <h4 style="margin-top: 0;">${translations.ticket_summary || 'Ticket Summary'}</h4>
            <p><strong>${translations.from || 'From'}:</strong> ${bookingDetails.from}</p>
            <p><strong>${translations.to || 'To'}:</strong> ${bookingDetails.to}</p>
            <p><strong>${translations.departure_date || 'Departure Date'}:</strong> ${bookingDetails.departureDate}</p>
            ${bookingDetails.isRoundTrip ? `<p><strong>${translations.return_date || 'Return Date'}:</strong> ${bookingDetails.returnDate}</p>` : ''}
            <p><strong>${translations.passengers || 'Passengers'}:</strong> ${passengerNames}</p>
        </div>
        <p style="margin-top: 20px;">${(translations.ticket_details_sent || 'All details of your ticket information')} ${emailRecipientsText} ${(translations.sent_to_email || 'have been sent as an e-mail to the address.')}</p>
        <p>${translations.good_flight || 'We wish you a good flight!'}</p>
    `;

    // The home button event listener only needs to be added once.
    if (!homeBtn.dataset.listenerAttached) {
        homeBtn.addEventListener('click', () => {
            sessionStorage.removeItem('bookingDetails');
            sessionStorage.removeItem('paymentComplete');
            window.location.href = 'welcome.html';
        });
        homeBtn.dataset.listenerAttached = 'true';
    }
}

// Listen for the custom 'languageChanged' event
document.addEventListener('languageChanged', (event) => {
    // The translations are in event.detail
    renderConfirmationPage(event.detail);
});

// Initial check in case the language is set before this script runs
// This is a fallback - the primary mechanism is the event listener.
document.addEventListener('DOMContentLoaded', () => {
    // If translation.js has already run and set the language, we might have translations ready.
    // However, the 'languageChanged' event is more reliable.
    // The listener in translation.js will fire 'languageChanged' on DOMContentLoaded,
    // which this script will then catch. So no initial call is strictly needed here.
});