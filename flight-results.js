document.addEventListener('DOMContentLoaded', () => {

    const flightResultsManager = {
        // --- ELEMENTS ---
        resultsContainer: document.getElementById('flight-results'),
        sortContainer: document.getElementById('sort-container'),
        sortBy: document.getElementById('sort-by'),
        seatModal: document.getElementById('seat-modal'),
        closeButton: null, // Initialized in init
        businessClassBtn: document.getElementById('business-class-btn'),
        economyClassBtn: document.getElementById('economy-class-btn'),
        seatMapContainer: document.getElementById('seat-map-container'),
        confirmSeatSelectionBtn: document.getElementById('confirm-seat-selection-btn'),
        notificationArea: null, // Created in init

        // --- STATE ---
        translations: {},
        currentFlights: [],
        notificationTimer: null,
        selectedFlight: null,
        selectedSeats: [],
        searchCriteria: null,
        
        // --- INITIALIZATION ---
        init() {
            // Create and prepend notification area
            this.notificationArea = document.createElement('div');
            this.notificationArea.id = 'notification-area';
            this.notificationArea.className = 'notification-area';
            document.querySelector('.container').prepend(this.notificationArea);
            
            this.closeButton = this.seatModal.querySelector('.close-button');
            this.searchCriteria = JSON.parse(sessionStorage.getItem('flightSearchCriteria'));

            if (!this.searchCriteria) {
                window.location.href = 'reservation.html';
                return;
            }

            this.addEventListeners();
            this.fetchFlights(); // Fetch flights once on init
        },

        addEventListeners() {
            // Listen for language changes to re-render the UI
            document.addEventListener('languageChanged', (e) => {
                this.translations = e.detail;
                this.reRenderUI();
            });

            this.sortBy.addEventListener('change', () => this.renderFlights());
            this.confirmSeatSelectionBtn.addEventListener('click', () => this.handleConfirmSeatSelection());
            
            this.closeButton.addEventListener('click', () => this.closeSeatModal());
            window.addEventListener('click', (event) => {
                if (event.target === this.seatModal) {
                    this.closeSeatModal();
                }
            });
        },

        // --- UI & RENDER ---

        // Re-renders all dynamic parts of the UI with current translations
        reRenderUI() {
            // Update static but translated text in the modal
            const wcCabin = this.seatMapContainer.querySelector('.wc-cabin');
            if (wcCabin) wcCabin.textContent = this.translations.wc || 'WC';
            const galleyCabin = this.seatMapContainer.querySelector('.galley-cabin');
            if(galleyCabin) galleyCabin.textContent = this.translations.galley || 'GALLEY';
            
            this.renderFlights();
        },

        showNotification(key, type = 'error', replacements = {}) {
            clearTimeout(this.notificationTimer);
            let message = this.translations[key] || `Error: Key '${key}' not found.`;
            
            // Handle replacements for dynamic values in messages
            for (const placeholder in replacements) {
                message = message.replace(`{${placeholder}}`, replacements[placeholder]);
            }

            this.notificationArea.textContent = message;
            this.notificationArea.className = `notification-area ${type} show`;
            this.notificationTimer = setTimeout(() => {
                this.notificationArea.classList.remove('show');
            }, 3000);
        },

        renderFlights() {
            // Clear previous flight results
            const flightsToRemove = this.resultsContainer.querySelectorAll('.flight, .results-title, .no-flights-message');
            flightsToRemove.forEach(flight => flight.remove());
            
            const sortValue = this.sortBy.value;
            const sortedFlights = [...this.currentFlights].sort((a, b) => {
                if (sortValue === 'price') return a.basePrice - b.basePrice;
                if (sortValue === 'time') return a.departureTime.localeCompare(b.departureTime);
                return 0;
            });
            
            // Render title
            const resultsTitle = document.createElement('h3');
            resultsTitle.className = 'results-title';
            resultsTitle.textContent = `${this.searchCriteria.from} - ${this.searchCriteria.to} ${(this.translations.flights_for || 'Flights for')}`;
            this.resultsContainer.prepend(resultsTitle);

            if (sortedFlights.length > 0) {
                this.sortContainer.style.display = 'flex';
                sortedFlights.forEach(flight => {
                    const flightElement = document.createElement('div');
                    flightElement.classList.add('flight');
                    flightElement.innerHTML = `
                        <div class="flight-info">
                            <span><strong>${this.translations.airline || 'Airline'}:</strong> ${this.translations[flight.airline.toLowerCase().replace(' ', '_')] || flight.airline}</span>
                            <span><strong>${this.translations.flight_no || 'Flight No'}:</strong> ${flight.flightNumber} ${flight.isConnecting ? `(${this.translations.connecting_flight || 'Connecting'})` : ''}</span>
                            <span><strong>${this.translations.class || 'Class'}:</strong> ${this.translations[flight.seatClass.toLowerCase()+'_class_label'] || flight.seatClass}</span>
                            <span><strong>${this.translations.departure || 'Departure'}:</strong> ${flight.departureTime} - <strong>${this.translations.arrival || 'Arrival'}:</strong> ${flight.arrivalTime}</span>
                        </div>
                        <div class="flight-price">${flight.price}</div>
                    `;
                    flightElement.addEventListener('click', () => this.openSeatModal(flight));
                    this.resultsContainer.appendChild(flightElement);
                });
            } else {
                const noFlightsMessage = document.createElement('p');
                noFlightsMessage.className = 'no-flights-message';
                noFlightsMessage.textContent = this.translations.no_flights_found || 'No flights found for these criteria.';
                this.resultsContainer.appendChild(noFlightsMessage);
                this.sortContainer.style.display = 'none';
            }
        },

        renderSeatMap(seatClass) {
            this.seatMapContainer.innerHTML = '';
            this.selectedSeats = [];
            const unavailableSeats = {
                business: ['1A', '2C', '3D'],
                economy: ['5B', '6E', '7A', '10C', '12F', '14A', '15F']
            };
            const currentUnavailableSeats = unavailableSeats[seatClass];
            
            this.seatMapContainer.innerHTML = `
                <div class="cabin-section front-cabin">
                    <div class="cabin-item wc-cabin">${this.translations.wc || 'WC'}</div>
                    <div class="cabin-item galley-cabin">${this.translations.galley || 'GALLEY'}</div>
                </div>`;

            const sectionConfig = {
                business: { rows: [1, 5], letters: ['A', 'B', 'C', 'D'], template: '1fr repeat(2, 30px) 50px repeat(2, 30px) 1fr' },
                economy: { rows: [6, 20], letters: ['A', 'B', 'C', 'D', 'E', 'F'], template: '1fr repeat(3, 30px) 50px repeat(3, 30px) 1fr' }
            };
            const config = sectionConfig[seatClass];
            const section = document.createElement('div');
            section.className = `seat-section ${seatClass}-section`;
            section.style.gridTemplateColumns = config.template;

            for (let row = config.rows[0]; row <= config.rows[1]; row++) {
                section.appendChild(this.createSeatRow(row, config.letters, currentUnavailableSeats));
            }
            this.seatMapContainer.appendChild(section);

            if (seatClass === 'economy') {
                 this.seatMapContainer.innerHTML += `
                    <div class="cabin-section rear-cabin">
                        <div class="cabin-item wc-cabin">${this.translations.wc || 'WC'}</div>
                        <div class="cabin-item galley-cabin">${this.translations.galley || 'GALLEY'}</div>
                    </div>`;
            }
        },

        createSeatRow(rowNum, letters, unavailableSeats) {
            const rowFragment = document.createDocumentFragment();
            const rowLabelLeft = document.createElement('div');
            rowLabelLeft.className = 'row-label';
            rowLabelLeft.textContent = rowNum;
            rowFragment.appendChild(rowLabelLeft);

            const aisleLetter = letters.length === 4 ? 'C' : 'D';

            for (const letter of letters) {
                if (letter === aisleLetter) {
                    const aisle = document.createElement('div');
                    aisle.className = 'aisle';
                    rowFragment.appendChild(aisle);
                }
                const seatId = `${rowNum}${letter}`;
                const seatElement = document.createElement('div');
                seatElement.className = 'seat';
                seatElement.textContent = seatId;
                seatElement.dataset.seatId = seatId;

                if (unavailableSeats.includes(seatId)) {
                    seatElement.classList.add('unavailable');
                } else {
                    seatElement.classList.add('available');
                    seatElement.addEventListener('click', (e) => this.handleSeatClick(e, seatId));
                }
                rowFragment.appendChild(seatElement);
            }
             const rowLabelRight = document.createElement('div');
            rowLabelRight.className = 'row-label';
            rowFragment.appendChild(rowLabelRight);
            return rowFragment;
        },
        
        // --- ACTIONS & HANDLERS ---
        
        handleSeatClick(event, seatId) {
            const totalPassengers = parseInt(this.searchCriteria.adults) + parseInt(this.searchCriteria.children);
            const seatElement = event.currentTarget;

            if (seatElement.classList.contains('selected')) {
                seatElement.classList.remove('selected');
                this.selectedSeats = this.selectedSeats.filter(s => s !== seatId);
            } else {
                if (this.selectedSeats.length >= totalPassengers) {
                    this.showNotification('max_seats_selection', 'error', { totalPassengers: totalPassengers });
                    return;
                }
                seatElement.classList.add('selected');
                this.selectedSeats.push(seatId);
            }
        },

        handleConfirmSeatSelection() {
            const totalPassengers = parseInt(this.searchCriteria.adults) + parseInt(this.searchCriteria.children);

            if (this.selectedFlight && this.selectedSeats.length === totalPassengers) {
                const totalCost = this.selectedFlight.basePrice * this.selectedSeats.length;
                const bookingDetails = {
                    ...this.searchCriteria,
                    ...this.selectedFlight,
                    selectedSeats: this.selectedSeats,
                    finalPrice: totalCost,
                    fromReservation: true
                };
                sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
                window.location.href = 'personal-info.html';
            } else if (this.selectedFlight) {
                this.showNotification('please_select_seats', 'error', { totalPassengers: totalPassengers });
            } else {
                this.showNotification('no_flight_selected', 'error');
            }
        },

        openSeatModal(flight) {
            this.selectedFlight = flight;
            this.selectedSeats = [];
            this.seatModal.classList.add('show');
            const seatClass = flight.seatClass.toLowerCase();
            
            this.businessClassBtn.classList.toggle('active', seatClass === 'business');
            this.economyClassBtn.classList.toggle('active', seatClass === 'economy');
            this.businessClassBtn.disabled = (seatClass !== 'business');
            this.economyClassBtn.disabled = (seatClass !== 'economy');
            
            this.renderSeatMap(seatClass);
        },
        
        closeSeatModal() {
            this.seatModal.classList.remove('show');
            this.businessClassBtn.disabled = false;
            this.economyClassBtn.disabled = false;
            this.businessClassBtn.classList.add('active');
            this.economyClassBtn.classList.remove('active');
        },

        fetchFlights() {
            this.showNotification('searching_flights', 'success');

            setTimeout(() => {
                const baseFlights = [
                    { airline: 'Turkish Airlines', flightNumber: 'TK1234', departureTime: '08:30', arrivalTime: '10:00', price: '1450', isConnecting: false },
                    { airline: 'Pegasus', flightNumber: 'PC5678', departureTime: '09:15', arrivalTime: '10:45', price: '1380', isConnecting: false },
                    { airline: 'AnadoluJet', flightNumber: 'AJ9101', departureTime: '11:00', arrivalTime: '12:30', price: '1410', isConnecting: false },
                    { airline: 'SunExpress', flightNumber: 'XQ222', departureTime: '07:00', arrivalTime: '08:30', price: '1520', isConnecting: false },
                ];
                 if (this.searchCriteria.isConnectingFlight) {
                    baseFlights.push(
                        { airline: 'Turkish Airlines', flightNumber: 'TK7890', departureTime: '06:00', arrivalTime: '12:00', price: '1350', isConnecting: true },
                        { airline: 'Pegasus', flightNumber: 'PC1122', departureTime: '10:00', arrivalTime: '15:00', price: '1300', isConnecting: true }
                    );
                }

                const detailedFlights = [];
                const businessMultiplier = 1.8;
                const currency = this.translations.currency || 'TL';

                baseFlights.forEach(flight => {
                    const economyPrice = parseInt(flight.price);
                    const businessPrice = economyPrice * businessMultiplier;
                    detailedFlights.push({ ...flight, seatClass: 'Economy', basePrice: economyPrice, price: `${economyPrice} ${currency}` });
                    detailedFlights.push({ ...flight, seatClass: 'Business', basePrice: businessPrice, price: `${businessPrice.toFixed(0)} ${currency}` });
                });

                this.currentFlights = detailedFlights;
                this.reRenderUI(); // Render the UI with the new data and current translations
            }, 1000);
        }
    };

    flightResultsManager.init();
});
