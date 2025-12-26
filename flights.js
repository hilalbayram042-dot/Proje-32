document.addEventListener('DOMContentLoaded', () => {
    // Page Elements
    const backBtn = document.getElementById('back-btn');
    const bookButtons = document.querySelectorAll('.book-btn');

    // Modal Elements
    const modal = document.getElementById('booking-modal');
    const closeModalBtn = modal.querySelector('.close-button');
    const confirmModalBtn = document.getElementById('confirm-booking-modal-btn');
    const passengerCountInput = document.getElementById('passenger-count');
    const seatClassRadios = document.querySelectorAll('input[name="seat-class"]');
    const totalPriceDisplay = document.getElementById('total-price-display');


    // App State
    let currentFlightData = null;
    const BUSINESS_MULTIPLIER = 1.8;

    // --- Functions ---

    function openModalWithFlightData(flightElement) {
        const flightInfo = flightElement.querySelector('.flight-info');
        const flightPriceElement = flightElement.querySelector('.flight-price');

        const fromToText = flightInfo.querySelector('h2').textContent;
        const [from, to] = fromToText.split(' - ').map(s => s.trim());
        
        const dateText = Array.from(flightInfo.querySelectorAll('p')).find(p => p.textContent.startsWith('Tarih:')).textContent.replace('Tarih: ', '');
        const timeText = Array.from(flightInfo.querySelectorAll('p')).find(p => p.textContent.startsWith('Saat:')).textContent.replace('Saat: ', '');
        const priceText = flightPriceElement.querySelector('p').textContent;
        const basePrice = parseInt(priceText.replace('Fiyat: ', '').replace(' TL', ''));

        // Store the essential data of the clicked flight
        currentFlightData = {
            from,
            to,
            departureDate: dateText,
            departureTime: timeText,
            basePrice
        };
        
        // Reset modal to defaults
        passengerCountInput.value = 1;
        document.getElementById('economy-class').checked = true;

        // Update and show the modal
        updateTotalPrice();
        modal.style.display = 'block';
    }
    
    function updateTotalPrice() {
        if (!currentFlightData) return;

        const passengerCount = parseInt(passengerCountInput.value);
        const selectedClass = document.querySelector('input[name="seat-class"]:checked').value;

        let pricePerPassenger = currentFlightData.basePrice;
        if (selectedClass === 'Business') {
            pricePerPassenger *= BUSINESS_MULTIPLIER;
        }

        const total = pricePerPassenger * passengerCount;
        totalPriceDisplay.textContent = `${total.toFixed(0)} TL`;
    }

    function confirmBooking() {
        if (!currentFlightData) {
            alert("Bir hata oluştu. Lütfen tekrar deneyin.");
            return;
        }

        const passengerCount = parseInt(passengerCountInput.value);
        const selectedClass = document.querySelector('input[name="seat-class"]:checked').value;
        
        let pricePerPassenger = currentFlightData.basePrice;
        if (selectedClass === 'Business') {
            pricePerPassenger *= BUSINESS_MULTIPLIER;
        }
        const finalPrice = pricePerPassenger * passengerCount;

        // Create an array of seat placeholders
        const selectedSeats = Array.from({ length: passengerCount }, (_, i) => `Koltuk ${i + 1}`);

        const bookingDetails = {
            ...currentFlightData,
            finalPrice: finalPrice,
            airline: 'Bilinmeyen Havayolu',
            flightNumber: 'Bilinmiyor',
            seatClass: selectedClass,
            selectedSeats: selectedSeats,
            isConnecting: false,
            arrivalTime: 'Bilinmiyor'
        };

        // Save to sessionStorage
        sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));

        // Redirect to the personal information page
        window.location.href = 'personal-info.html';
    }


    // --- Event Listeners ---

    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Open modal when any "Rezervasyon Yap" button is clicked
    bookButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const flightElement = event.target.closest('.flight');
            openModalWithFlightData(flightElement);
        });
    });

    // Close Modal Logic
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Modal Confirm Logic
    confirmModalBtn.addEventListener('click', confirmBooking);
    
    // Update price display when options change
    passengerCountInput.addEventListener('change', updateTotalPrice);
    seatClassRadios.forEach(radio => radio.addEventListener('change', updateTotalPrice));

});
