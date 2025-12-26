document.addEventListener('DOMContentLoaded', () => {
    // Form Elements
    const flightSearchForm = document.getElementById('flight-search-form');
    const oneWayRadio = document.getElementById('one-way');
    const roundTripRadio = document.getElementById('round-trip');
    const returnDateInput = document.getElementById('return-date');
    const connectingFlightCheckbox = document.getElementById('connecting-flight');
    
    // Notification Element
    const notificationArea = document.getElementById('notification-area');
    let notificationTimer;

    // --- Functions ---
    function showNotification(message, type = 'error') {
        clearTimeout(notificationTimer);
        notificationArea.textContent = message;
        notificationArea.className = `notification-area ${type} show`;
        notificationTimer = setTimeout(() => {
            notificationArea.classList.remove('show');
        }, 3000);
    }

    function toggleReturnDate() {
        if (oneWayRadio.checked) {
            returnDateInput.disabled = true;
            returnDateInput.value = '';
            returnDateInput.required = false;
        } else {
            returnDateInput.disabled = false;
            returnDateInput.required = true;
        }
    }

    // --- Event Listeners ---
    oneWayRadio.addEventListener('change', toggleReturnDate);
    roundTripRadio.addEventListener('change', toggleReturnDate);

    flightSearchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // --- Validation ---
        const from = document.getElementById('from').value.trim();
        const to = document.getElementById('to').value.trim();
        const departureDate = document.getElementById('departure-date').value;
        const isRoundTrip = roundTripRadio.checked;
        const returnDateValue = returnDateInput.value;
        const isConnectingFlight = connectingFlightCheckbox.checked;

        if (!from) {
            showNotification('"Nereden" alanı boş bırakılamaz.');
            return;
        }
        if (!to) {
            showNotification('"Nereye" alanı boş bırakılamaz.');
            return;
        }
        if (!departureDate) {
            showNotification('Gidiş tarihi seçmelisiniz.');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        if (departureDate < today) {
            showNotification('Gidiş tarihi geçmiş bir tarih olamaz.');
            return;
        }
        
        if (isRoundTrip && !returnDateValue) {
            showNotification('Gidiş-Dönüş seçeneği için dönüş tarihi zorunludur.');
            return;
        }
        if (isRoundTrip && returnDateValue < departureDate) {
            showNotification('Dönüş tarihi, gidiş tarihinden önce olamaz.');
            return;
        }
        
        const searchCriteria = {
            from,
            to,
            departureDate,
            isRoundTrip,
            returnDate: returnDateValue,
            isConnectingFlight,
            adults: document.getElementById('adults').value,
            children: document.getElementById('children').value
        };

        sessionStorage.setItem('flightSearchCriteria', JSON.stringify(searchCriteria));
        window.location.href = 'flight-results.html';
    });

    // Initial setup
    toggleReturnDate();

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('departure-date').min = today;
    document.getElementById('return-date').min = today;
});