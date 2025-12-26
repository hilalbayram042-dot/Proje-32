document.addEventListener('DOMContentLoaded', () => {
    // Results Elements
    const resultsContainer = document.getElementById('flight-results');
    const sortContainer = document.getElementById('sort-container');
    const sortBy = document.getElementById('sort-by');

    // Seat Modal Elements
    const seatModal = document.getElementById('seat-modal');
    const closeButton = seatModal.querySelector('.close-button');
    const businessClassBtn = document.getElementById('business-class-btn');
    const economyClassBtn = document.getElementById('economy-class-btn');
    const seatMapContainer = document.getElementById('seat-map-container');
    const confirmSeatSelectionBtn = document.getElementById('confirm-seat-selection-btn');
    
    // Notification Element
    const notificationArea = document.createElement('div');
    notificationArea.id = 'notification-area';
    notificationArea.className = 'notification-area';
    document.querySelector('.container').prepend(notificationArea);


    // App State
    let currentFlights = [];
    let notificationTimer;
    let selectedFlight = null;
    let selectedSeats = [];

    // --- Functions ---
    function showNotification(message, type = 'error') {
        clearTimeout(notificationTimer);
        notificationArea.textContent = message;
        notificationArea.className = `notification-area ${type} show`;
        notificationTimer = setTimeout(() => {
            notificationArea.classList.remove('show');
        }, 3000);
    }

    function renderSeatMap(seatClass) {
        seatMapContainer.innerHTML = '';
        selectedSeats = [];

        let businessUnavailableSeats = ['1A', '2C', '3D'];
        let economyUnavailableSeats = ['5B', '6E', '7A', '10C', '12F', '14A', '15F'];
        let currentUnavailableSeats = [];

        const frontCabin = document.createElement('div');
        frontCabin.classList.add('cabin-section', 'front-cabin');
        frontCabin.innerHTML = `
            <div class="cabin-item wc-cabin">WC</div>
            <div class="cabin-item galley-cabin">GALLEY</div>
        `;
        seatMapContainer.appendChild(frontCabin);

        if (seatClass === 'business') {
            currentUnavailableSeats = businessUnavailableSeats;
            const businessSection = document.createElement('div');
            businessSection.classList.add('seat-section', 'business-section');
            businessSection.style.gridTemplateColumns = '1fr repeat(2, 30px) 50px repeat(2, 30px) 1fr';

            const numRows = 5;
            const seatLetters = ['A', 'B', 'C', 'D'];

            for (let row = 1; row <= numRows; row++) {
                const rowLabel = document.createElement('div');
                rowLabel.classList.add('row-label');
                rowLabel.textContent = row;
                businessSection.appendChild(rowLabel);

                for (let i = 0; i < seatLetters.length; i++) {
                    if (seatLetters[i] === 'C') {
                        const aisle = document.createElement('div');
                        aisle.classList.add('aisle');
                        businessSection.appendChild(aisle);
                    }

                    const seatId = `${row}${seatLetters[i]}`;
                    const seatElement = document.createElement('div');
                    seatElement.classList.add('seat');
                    seatElement.textContent = seatId;
                    seatElement.dataset.seatId = seatId;

                    if (currentUnavailableSeats.includes(seatId)) {
                        seatElement.classList.add('unavailable');
                    } else {
                        seatElement.classList.add('available');
                        seatElement.addEventListener('click', (event) => handleSeatClick(event, seatId));
                    }
                    businessSection.appendChild(seatElement);
                }
                const rightLabel = document.createElement('div');
                rightLabel.classList.add('row-label');
                businessSection.appendChild(rightLabel);
            }
            seatMapContainer.appendChild(businessSection);

        } else { // Economy Class
            currentUnavailableSeats = economyUnavailableSeats;
            const economySection = document.createElement('div');
            economySection.classList.add('seat-section', 'economy-section');
            economySection.style.gridTemplateColumns = '1fr repeat(3, 30px) 50px repeat(3, 30px) 1fr';

            const numRows = 15;
            const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

            for (let row = 6; row <= numRows + 5; row++) {
                const rowLabel = document.createElement('div');
                rowLabel.classList.add('row-label');
                rowLabel.textContent = row;
                economySection.appendChild(rowLabel);

                for (let i = 0; i < seatLetters.length; i++) {
                    if (seatLetters[i] === 'D') {
                        const aisle = document.createElement('div');
                        aisle.classList.add('aisle');
                        economySection.appendChild(aisle);
                    }

                    const seatId = `${row}${seatLetters[i]}`;
                    const seatElement = document.createElement('div');
                    seatElement.classList.add('seat');
                    seatElement.textContent = seatId;
                    seatElement.dataset.seatId = seatId;

                    if (currentUnavailableSeats.includes(seatId)) {
                        seatElement.classList.add('unavailable');
                    } else {
                        seatElement.classList.add('available');
                        seatElement.addEventListener('click', (event) => handleSeatClick(event, seatId));
                    }
                    economySection.appendChild(seatElement);
                }
                const rightLabel = document.createElement('div');
                rightLabel.classList.add('row-label');
                economySection.appendChild(rightLabel);
            }
            seatMapContainer.appendChild(economySection);

            const rearCabin = document.createElement('div');
            rearCabin.classList.add('cabin-section', 'rear-cabin');
            rearCabin.innerHTML = `
                <div class="cabin-item wc-cabin">WC</div>
                <div class="cabin-item galley-cabin">GALLEY</div>
            `;
            seatMapContainer.appendChild(rearCabin);
        }
    }

    function handleSeatClick(event, seatId) {
        const searchCriteria = JSON.parse(sessionStorage.getItem('flightSearchCriteria'));
        const totalPassengers = parseInt(searchCriteria.adults) + parseInt(searchCriteria.children);
        const seatElement = event.currentTarget;
        if (seatElement.classList.contains('selected')) {
            seatElement.classList.remove('selected');
            selectedSeats = selectedSeats.filter(s => s !== seatId);
        } else {
            if (selectedSeats.length >= totalPassengers) {
                showNotification(`Maksimum ${totalPassengers} koltuk seçebilirsiniz.`, 'error');
                return;
            }
            seatElement.classList.add('selected');
            selectedSeats.push(seatId);
        }
        console.log('Selected seats:', selectedSeats);
    }

    function renderFlights() {
        const flightsToRemove = resultsContainer.querySelectorAll('.flight');
        flightsToRemove.forEach(flight => flight.remove());

        const sortValue = sortBy.value;
        const sortedFlights = [...currentFlights].sort((a, b) => {
            if (sortValue === 'price') {
                return a.basePrice - b.basePrice;
            } else if (sortValue === 'time') {
                const timeA = a.departureTime.replace(':', '');
                const timeB = b.departureTime.replace(':', '');
                return timeA.localeCompare(timeB);
            }
            return 0;
        });

        if (sortedFlights.length > 0) {
            sortedFlights.forEach(flight => {
                const flightElement = document.createElement('div');
                flightElement.classList.add('flight');
                flightElement.innerHTML = `
                    <div class="flight-info">
                        <span><strong>Havayolu:</strong> ${flight.airline}</span>
                        <span><strong>Uçuş No:</strong> ${flight.flightNumber} ${flight.isConnecting ? '(Aktarmalı)' : ''}</span>
                        <span><strong>Sınıf:</strong> ${flight.seatClass}</span>
                        <span><strong>Kalkış:</strong> ${flight.departureTime} - <strong>Varış:</strong> ${flight.arrivalTime}</span>
                    </div>
                    <div class="flight-price">${flight.price}</div>
                `;
                flightElement.addEventListener('click', () => {
                    selectedFlight = flight;
                    selectedSeats = [];
                    seatModal.classList.add('show');
                    
                    const seatClass = flight.seatClass.toLowerCase();
                    if (seatClass === 'business') {
                        businessClassBtn.classList.add('active');
                        economyClassBtn.classList.remove('active');
                        businessClassBtn.disabled = false;
                        economyClassBtn.disabled = true;
                    } else {
                        economyClassBtn.classList.add('active');
                        businessClassBtn.classList.remove('active');
                        businessClassBtn.disabled = true;
                        economyClassBtn.disabled = false;
                    }
                    renderSeatMap(seatClass); 
                });
                resultsContainer.appendChild(flightElement);
            });
        } else {
             resultsContainer.innerHTML = '<p>Bu kriterlere uygun uçuş bulunamadı.</p>';
             sortContainer.style.display = 'none';
        }
    }

    function fetchFlights() {
        const searchCriteria = JSON.parse(sessionStorage.getItem('flightSearchCriteria'));
        if (!searchCriteria) {
            window.location.href = 'reservation.html';
            return;
        }

        showNotification('Uçuşlar aranıyor...', 'success');

        setTimeout(() => {
            let baseFlights = [
                { airline: 'Türk Hava Yolları', flightNumber: 'TK1234', departureTime: '08:30', arrivalTime: '10:00', price: '1450 TL', isConnecting: false },
                { airline: 'Pegasus', flightNumber: 'PC5678', departureTime: '09:15', arrivalTime: '10:45', price: '1380 TL', isConnecting: false },
                { airline: 'AnadoluJet', flightNumber: 'AJ9101', departureTime: '11:00', arrivalTime: '12:30', price: '1410 TL', isConnecting: false },
                { airline: 'SunExpress', flightNumber: 'XQ222', departureTime: '07:00', arrivalTime: '08:30', price: '1520 TL', isConnecting: false },
                { airline: 'AtlasGlobal', flightNumber: 'KK001', departureTime: '13:00', arrivalTime: '14:30', price: '1600 TL', isConnecting: false },
                { airline: 'Onur Air', flightNumber: 'OH123', departureTime: '10:30', arrivalTime: '12:00', price: '1300 TL', isConnecting: false },
                { airline: 'Corendon Airlines', flightNumber: 'XC456', departureTime: '14:00', arrivalTime: '15:30', price: '1550 TL', isConnecting: false }
            ];

            if (searchCriteria.isConnectingFlight) {
                baseFlights.push(
                    { airline: 'Türk Hava Yolları', flightNumber: 'TK7890', departureTime: '06:00', arrivalTime: '12:00', price: '1350 TL', isConnecting: true },
                    { airline: 'Pegasus', flightNumber: 'PC1122', departureTime: '10:00', arrivalTime: '15:00', price: '1300 TL', isConnecting: true },
                    { airline: 'AtlasGlobal', flightNumber: 'KK002', departureTime: '07:00', arrivalTime: '13:00', price: '1400 TL', isConnecting: true }
                );
            }

            const detailedFlights = [];
            const businessMultiplier = 1.8;

            baseFlights.forEach(flight => {
                const economyPrice = parseInt(flight.price.replace(' TL', ''));
                const businessPrice = economyPrice * businessMultiplier;

                detailedFlights.push({
                    ...flight,
                    seatClass: 'Economy',
                    basePrice: economyPrice,
                    price: `${economyPrice} TL`
                });

                detailedFlights.push({
                    ...flight,
                    flightNumber: `${flight.flightNumber}`,
                    seatClass: 'Business',
                    basePrice: businessPrice,
                    price: `${businessPrice.toFixed(0)} TL`
                });
            });

            currentFlights = detailedFlights;
            
            const resultsTitle = document.createElement('h3');
            resultsTitle.textContent = `${searchCriteria.from} - ${searchCriteria.to} için Uçuşlar`;
            resultsContainer.innerHTML = '';
            resultsContainer.appendChild(resultsTitle);
            resultsContainer.appendChild(sortContainer);
            sortContainer.style.display = 'flex';
            
            renderFlights();
        }, 1000);
    }

    // --- Event Listeners ---

        

    confirmSeatSelectionBtn.addEventListener('click', () => {
        const searchCriteria = JSON.parse(sessionStorage.getItem('flightSearchCriteria'));
        const totalPassengers = parseInt(searchCriteria.adults) + parseInt(searchCriteria.children);

        if (selectedFlight && selectedSeats.length === totalPassengers) {
            const totalCost = selectedFlight.basePrice * selectedSeats.length;
            const bookingDetails = {
                ...searchCriteria,
                ...selectedFlight,
                selectedSeats: selectedSeats,
                finalPrice: totalCost,
                fromReservation: true // This is from the reservation flow
            };
            sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
            window.location.href = 'personal-info.html';
        } else if (selectedFlight && selectedSeats.length !== totalPassengers) {
            showNotification(`Lütfen ${totalPassengers} koltuk seçin.`, 'error');
        } else {
            showNotification('Koltuk seçimi için bir uçuş seçilmedi.', 'error');
        }
    });

    sortBy.addEventListener('change', renderFlights);

    function resetSeatModalButtons() {
        businessClassBtn.disabled = false;
        economyClassBtn.disabled = false;
        businessClassBtn.classList.add('active');
        economyClassBtn.classList.remove('active');
    }

    closeButton.addEventListener('click', () => {
        seatModal.classList.remove('show');
        resetSeatModalButtons();
    });

    window.addEventListener('click', (event) => {
        if (event.target === seatModal) {
            seatModal.classList.remove('show');
            resetSeatModalButtons();
        }
    });

    // Initial call
    fetchFlights();
});
