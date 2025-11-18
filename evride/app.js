let map, pickupMarker, dropMarker, routeLine, movingVehicle;
let selectedVehicle = "Sedan";
let rideHistory = [];
let rideInProgress = false;
let rideAnimation;

// Python Backend API URL
const API_BASE_URL = " http://127.0.0.1:8000";

// Vehicle pricing with base rates
const vehicleRates = {
  'Sedan': 12,
  'SUV': 15, 
  'Hatchback': 10,
  'Premium': 20
};

// Vehicle icons for simulation
const vehicleIcons = {
  'Sedan': '🚗',
  'SUV': '🚙',
  'Hatchback': '🚘',
  'Premium': '🏎️'
};

// City-wise famous locations with coordinates
const cityLocations = {
  Delhi: {
    "Connaught Place": [28.6315, 77.2167],
    "India Gate": [28.6129, 77.2295],
    "Red Fort": [28.6562, 77.241],
    "Qutub Minar": [28.5244, 77.1855],
    "Lotus Temple": [28.5535, 77.2588],
    "Hauz Khas": [28.5494, 77.1994],
    "Chandni Chowk": [28.6506, 77.2303],
    Saket: [28.5244, 77.2066],
    Rohini: [28.7491, 77.0674],
    Dwarka: [28.5921, 77.046],
  },
  Mumbai: {
    "Gateway of India": [18.922, 72.8347],
    "Marine Drive": [18.9432, 72.8236],
    Bandra: [19.0596, 72.8295],
    Andheri: [19.1136, 72.8697],
    Colaba: [18.9067, 72.8147],
    "Juhu Beach": [19.0989, 72.8269],
    Powai: [19.1197, 72.905],
    "CST Station": [18.9398, 72.8355],
    "Worli Sea Link": [19.0176, 72.8143],
    BKC: [19.0656, 72.8696],
  },
  Bangalore: {
    "MG Road": [12.9716, 77.5946],
    Koramangala: [12.9352, 77.6245],
    Indiranagar: [12.9784, 77.6408],
    Whitefield: [12.9698, 77.7499],
    "Electronic City": [12.8458, 77.6593],
    Marathahalli: [12.9591, 77.7011],
    "HSR Layout": [12.9116, 77.6473],
    "JP Nagar": [12.9082, 77.5853],
    Jayanagar: [12.925, 77.5838],
    Yelahanka: [13.1007, 77.5963],
  },
  Hyderabad: {
    Charminar: [17.3616, 78.4747],
    "Hitech City": [17.4435, 78.3772],
    Gachibowli: [17.4399, 78.3487],
    "Banjara Hills": [17.4239, 78.4738],
    Secunderabad: [17.4399, 78.4983],
    Madhapur: [17.4483, 78.3915],
    Kukatpally: [17.4849, 78.3914],
    "Jubilee Hills": [17.4326, 78.4071],
    KPHB: [17.4892, 78.3915],
    Uppal: [17.4065, 78.5593],
  },
  Chennai: {
    "Marina Beach": [13.0499, 80.2824],
    "T Nagar": [13.0418, 80.2341],
    "Anna Nagar": [13.085, 80.2101],
    Velachery: [12.975, 80.2212],
    OMR: [12.8956, 80.227],
    Adyar: [13.0067, 80.2572],
    Mylapore: [13.0339, 80.2619],
    Tambaram: [12.9249, 80.1],
    Porur: [13.0358, 80.1563],
    Guindy: [13.0067, 80.2206],
  },
  Kolkata: {
    "Howrah Bridge": [22.5851, 88.3469],
    "Victoria Memorial": [22.5448, 88.3426],
    "Park Street": [22.5535, 88.3619],
    "Salt Lake": [22.5697, 88.4177],
    Esplanade: [22.5697, 88.3501],
    Sealdah: [22.5697, 88.3697],
    "New Town": [22.5858, 88.4643],
    Ballygunge: [22.5329, 88.3643],
    Rajarhat: [22.6211, 88.4643],
    Jadavpur: [22.4986, 88.3643],
  },
  Pune: {
    "FC Road": [18.5314, 73.8446],
    "Koregaon Park": [18.5362, 73.8958],
    Hinjewadi: [18.5912, 73.7389],
    Kothrud: [18.5074, 73.8077],
    "Viman Nagar": [18.5679, 73.9143],
    "Shivaji Nagar": [18.5304, 73.8567],
    Wakad: [18.5978, 73.7643],
    Magarpatta: [18.5157, 73.9295],
    Aundh: [18.5593, 73.8078],
    Baner: [18.5592, 73.7867],
  },
};

// Check Python Backend Status
async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    console.log("✅ Python Backend Connected:", data);
    showAlert("✅ ML Backend connected! Using advanced model", "success");
    return true;
  } catch (error) {
    console.warn("⚠️ Python Backend not available:", error);
    showAlert("⚠️ Backend offline - using fallback mode", "error");
    return false;
  }
}

// Initialize Map
function initMap() {
  map = L.map("map").setView([28.6139, 77.209], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  updateLocationDropdowns();
  initializeVehicleCards();
  
  // Check backend status
  checkBackendStatus();
}

// Initialize vehicle cards
function initializeVehicleCards() {
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  vehicleCards.forEach(card => {
    const vehicleType = card.querySelector('strong').textContent;
    const priceElement = card.querySelector('.vehicle-price');
    updateVehiclePriceDisplay(vehicleType, priceElement);
  });
}

// Update vehicle price display
function updateVehiclePriceDisplay(vehicleType, priceElement) {
  const rate = vehicleRates[vehicleType];
  const distance = parseFloat(document.getElementById('routeDistance').textContent);
  const totalPrice = distance * rate;
  
  if (distance > 0) {
    priceElement.innerHTML = `
      <div style="font-size: 0.8em; color: #059669;">₹${rate}/km</div>
      <div style="font-size: 0.9em; font-weight: 700; color: #1f2937;">₹${Math.round(totalPrice)}</div>
    `;
  } else {
    priceElement.innerHTML = `₹${rate}/km`;
  }
}

// Update all vehicle card prices
function updateAllVehiclePrices() {
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  vehicleCards.forEach(card => {
    const vehicleType = card.querySelector('strong').textContent;
    const priceElement = card.querySelector('.vehicle-price');
    updateVehiclePriceDisplay(vehicleType, priceElement);
  });
}

// Update location dropdowns
function updateLocationDropdowns() {
  const city = document.getElementById("citySelect").value;
  const locations = cityLocations[city] || {};
  const locationNames = Object.keys(locations);

  const pickupSelect = document.getElementById("pickupLocation");
  pickupSelect.innerHTML = '<option value="">Select Pickup Location</option>';
  locationNames.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    pickupSelect.appendChild(option);
  });

  const dropSelect = document.getElementById("dropLocation");
  dropSelect.innerHTML = '<option value="">Select Drop Location</option>';
  locationNames.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    dropSelect.appendChild(option);
  });

  if (locationNames.length > 0) {
    pickupSelect.value = locationNames[0];
    dropSelect.value = locationNames[1] || locationNames[0];
  }

  const cityCenter = {
    Delhi: [28.6139, 77.209],
    Mumbai: [19.076, 72.8777],
    Bangalore: [12.9716, 77.5946],
    Hyderabad: [17.385, 78.4867],
    Chennai: [13.0827, 80.2707],
    Kolkata: [22.5726, 88.3639],
    Pune: [18.5204, 73.8567],
  };

  if (cityCenter[city]) {
    map.setView(cityCenter[city], 12);
  }

  updateMapRoute();
}

function updateMapRoute() {
  if (pickupMarker) map.removeLayer(pickupMarker);
  if (dropMarker) map.removeLayer(dropMarker);
  if (routeLine) map.removeLayer(routeLine);
  if (movingVehicle) map.removeLayer(movingVehicle);

  const city = document.getElementById("citySelect").value;
  const pickupLocation = document.getElementById("pickupLocation").value;
  const dropLocation = document.getElementById("dropLocation").value;

  if (!pickupLocation || !dropLocation) return;

  const locations = cityLocations[city] || {};
  const pickupCoords = locations[pickupLocation];
  const dropCoords = locations[dropLocation];

  if (!pickupCoords || !dropCoords) return;

  pickupMarker = L.marker(pickupCoords, {
    icon: L.divIcon({
      html: '<div style="background: #22c55e; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fa-solid fa-location-arrow"></i> Pickup</div>',
      className: "",
      iconSize: [80, 30],
    }),
  }).addTo(map);

  dropMarker = L.marker(dropCoords, {
    icon: L.divIcon({
      html: '<div style="background: #ef4444; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><i class="fa-solid fa-map-location"></i> Drop</div>',
      className: "",
      iconSize: [80, 30],
    }),
  }).addTo(map);

  routeLine = L.polyline([pickupCoords, dropCoords], {
    color: "#667eea",
    weight: 4,
    opacity: 0.7,
    dashArray: '5, 10'
  }).addTo(map);

  map.fitBounds([pickupCoords, dropCoords], { padding: [50, 50] });

  const distance = calculateDistance(pickupCoords, dropCoords);
  const duration = Math.round(distance * 3.5);

  document.getElementById("routeDistance").textContent = distance.toFixed(1);
  document.getElementById("routeDuration").textContent = duration;

  updateAllVehiclePrices();
  document.getElementById("fareSection").classList.add("hidden");
  
  if (rideInProgress) {
    stopRideSimulation();
  }
}

function calculateDistance(coord1, coord2) {
  const R = 6371;
  const dLat = ((coord2[0] - coord1[0]) * Math.PI) / 180;
  const dLon = ((coord2[1] - coord1[1]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1[0] * Math.PI) / 180) *
      Math.cos((coord2[0] * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function selectVehicle(vehicle, element) {
  selectedVehicle = vehicle;
  document.querySelectorAll(".vehicle-card").forEach((card) => {
    card.classList.remove("selected");
  });
  element.classList.add("selected");
  
  const priceElement = element.querySelector('.vehicle-price');
  updateVehiclePriceDisplay(vehicle, priceElement);
}

// Calculate Fare using Python ML Backend
async function calculateFare() {
  const pickupLocation = document.getElementById("pickupLocation").value;
  const dropLocation = document.getElementById("dropLocation").value;
  const city = document.getElementById("citySelect").value;

  if (!pickupLocation || !dropLocation) {
    showAlert("⚠️ Please select both pickup and drop locations", "error");
    return;
  }

  if (pickupLocation === dropLocation) {
    showAlert("⚠️ Pickup and drop locations cannot be the same", "error");
    return;
  }

  const locations = cityLocations[city] || {};
  const pickupCoords = locations[pickupLocation];
  const dropCoords = locations[dropLocation];

  if (!pickupCoords || !dropCoords) {
    showAlert("⚠️ Invalid locations selected", "error");
    return;
  }

  // Show loading
  showAlert("🔄 Calculating fare using ML model...", "success");

  try {
    // Call Python FastAPI Backend
    const response = await fetch(`${API_BASE_URL}/ride/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: "user_" + Date.now(),
        pickup: {
          latitude: pickupCoords[0],
          longitude: pickupCoords[1]
        },
        dropoff: {
          latitude: dropCoords[0],
          longitude: dropCoords[1]
        },
        city: city,
        vehicle_type: selectedVehicle.toLowerCase(),
        user_type: "regular"
      })
    });

    if (!response.ok) {
      throw new Error('Backend error');
    }

    const data = await response.json();

    // Update UI with Python ML predictions
    document.getElementById("baseFare").textContent = data.base_fare.toFixed(2);
    document.getElementById("surgeFactor").textContent = data.surge_multiplier.toFixed(2);
    document.getElementById("demandFactor").textContent = data.demand_factor.toFixed(2);
    document.getElementById("predictedFare").textContent = data.estimated_fare.toFixed(2);
    document.getElementById("fareDistance").textContent = data.estimated_distance.toFixed(1);
    document.getElementById("fareDuration").textContent = Math.round(data.estimated_time);
    document.getElementById("perKmRate").textContent = (data.estimated_fare / data.estimated_distance).toFixed(2);

    document.getElementById("fareSection").classList.remove("hidden");
    document.getElementById("fareSection").scrollIntoView({ behavior: "smooth", block: "nearest" });

    showAlert("✅ Fare calculated using ML model! Driver: " + data.driver.name, "success");

    // Store ride data for booking
    window.currentRideData = data;

  } catch (error) {
    console.error("Backend error:", error);
    showAlert("⚠️ Backend unavailable, using fallback calculation", "error");
    
    // Fallback calculation
    const distance = parseFloat(document.getElementById("routeDistance").textContent);
    const duration = parseFloat(document.getElementById("routeDuration").textContent);
    
    const baseFare = distance * vehicleRates[selectedVehicle];
    const surge = 1 + Math.random() * 0.5;
    const demand = 1 + Math.random() * 0.3;
    const finalFare = baseFare * surge * demand;

    document.getElementById("baseFare").textContent = baseFare.toFixed(2);
    document.getElementById("surgeFactor").textContent = surge.toFixed(2);
    document.getElementById("demandFactor").textContent = demand.toFixed(2);
    document.getElementById("predictedFare").textContent = finalFare.toFixed(2);
    document.getElementById("fareDistance").textContent = distance.toFixed(1);
    document.getElementById("fareDuration").textContent = duration;
    document.getElementById("perKmRate").textContent = (finalFare / distance).toFixed(2);

    document.getElementById("fareSection").classList.remove("hidden");
  }
}

function bookRide() {
  const pickup = document.getElementById("pickupLocation").value;
  const drop = document.getElementById("dropLocation").value;
  const city = document.getElementById("citySelect").value;
  const fare = parseFloat(document.getElementById("predictedFare").textContent);
  const distance = parseFloat(document.getElementById("fareDistance").textContent);
  const duration = parseFloat(document.getElementById("fareDuration").textContent);

  const ride = {
    id: window.currentRideData ? window.currentRideData.ride_id : "RIDE_" + Date.now(),
    pickup: pickup,
    drop: drop,
    city: city,
    vehicle: selectedVehicle,
    fare: fare,
    distance: distance,
    duration: duration,
    status: "In Progress",
    date: new Date().toLocaleString(),
    timestamp: Date.now(),
  };

  rideHistory.push(ride);
  showAlert("🎉 Ride booked successfully! Starting ride simulation...", "success");
  startRideSimulation(ride);
  updateAnalytics();
}

function startRideSimulation(ride) {
  rideInProgress = true;
  
  const city = document.getElementById("citySelect").value;
  const pickupCoords = cityLocations[city][ride.pickup];
  const dropCoords = cityLocations[city][ride.drop];
  
  if (!pickupCoords || !dropCoords) return;

  const vehicleIcon = vehicleIcons[ride.vehicle] || '🚗';
  movingVehicle = L.marker(pickupCoords, {
    icon: L.divIcon({
      html: `<div style="background: #3b82f6; color: white; padding: 10px 15px; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5); font-size: 1.2em; border: 3px solid white;">${vehicleIcon} Moving...</div>`,
      className: "moving-vehicle",
      iconSize: [100, 40],
    }),
    zIndexOffset: 1000
  }).addTo(map);

  const confirmButton = document.querySelector('.btn-primary');
  confirmButton.innerHTML = '<i class="fa-solid fa-gears"></i> Ride in Progress...';
  confirmButton.disabled = true;

  const progressContainer = document.createElement('div');
  progressContainer.innerHTML = `
    <div style="background: white; padding: 20px; border-radius: 15px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-left: 4px solid #3b82f6;">
      <h4 style="margin-bottom: 15px; color: #1f2937;"><i class="fa-solid fa-motorcycle"></i> Ride in Progress</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <div style="font-size: 0.85em; color: #666;">From</div>
          <div style="font-weight: 600;">${ride.pickup}</div>
        </div>
        <div>
          <div style="font-size: 0.85em; color: #666;">To</div>
          <div style="font-weight: 600;">${ride.drop}</div>
        </div>
        <div>
          <div style="font-size: 0.85em; color: #666;">Vehicle</div>
          <div style="font-weight: 600;">${ride.vehicle}</div>
        </div>
      </div>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 10px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span>Progress</span>
          <span id="rideProgress">0%</span>
        </div>
        <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
          <div id="progressBar" style="background: #10b981; height: 100%; width: 0%; transition: width 0.3s;"></div>
        </div>
      </div>
    </div>
  `;
  
  const fareSection = document.getElementById('fareSection');
  fareSection.appendChild(progressContainer);

  let progress = 0;
  const totalSteps = 100;
  const stepDuration = (ride.duration * 60 * 1000) / totalSteps;
  
  rideAnimation = setInterval(() => {
    progress++;
    const progressPercent = progress;
    
    document.getElementById('progressBar').style.width = progressPercent + '%';
    document.getElementById('rideProgress').textContent = progressPercent + '%';
    
    const lat = pickupCoords[0] + (dropCoords[0] - pickupCoords[0]) * (progressPercent / 100);
    const lng = pickupCoords[1] + (dropCoords[1] - pickupCoords[1]) * (progressPercent / 100);
    
    movingVehicle.setLatLng([lat, lng]);
    
    if (progress >= 100) {
      completeRide(ride, progressContainer);
    }
  }, stepDuration);
}

async function completeRide(ride, progressContainer) {
  clearInterval(rideAnimation);
  rideInProgress = false;
  
  ride.status = "Completed";
  
  if (movingVehicle) {
    map.removeLayer(movingVehicle);
  }

  // Notify Python Backend
  try {
    if (window.currentRideData && window.currentRideData.ride_id) {
      await fetch(`${API_BASE_URL}/ride/complete/${window.currentRideData.ride_id}`, {
        method: 'POST'
      });
    }
  } catch (error) {
    console.log("Backend notification failed:", error);
  }
  
  const confirmButton = document.querySelector('.btn-primary');
  confirmButton.innerHTML = 'Ride Completed!';
  
  progressContainer.innerHTML = `
    <div style="background: #d1fae5; padding: 20px; border-radius: 15px; margin-top: 20px; border-left: 4px solid #10b981;">
      <h4 style="margin-bottom: 15px; color: #065f46;"> Ride Completed Successfully!</h4>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
        <div>
          <div style="font-size: 0.85em; color: #047857;">From</div>
          <div style="font-weight: 600;">${ride.pickup}</div>
        </div>
        <div>
          <div style="font-size: 0.85em; color: #047857;">To</div>
          <div style="font-weight: 600;">${ride.drop}</div>
        </div>
        <div>
          <div style="font-size: 0.85em; color: #047857;">Fare</div>
          <div style="font-weight: 700; color: #065f46;">₹${ride.fare.toFixed(2)}</div>
        </div>
      </div>
      <div style="margin-top: 15px; padding: 12px; background: #a7f3d0; border-radius: 8px; text-align: center;">
        <strong>Thank you for choosing EV Ride! </strong>
      </div>
    </div>
  `;
  
  showAlert("<i class=\"fa-solid fa-check\"></i> Ride completed successfully! Fare: ₹" + ride.fare.toFixed(2), "success");
  
  setTimeout(() => {
    confirmButton.innerHTML = 'Confirm & Book Ride';
    confirmButton.disabled = false;
    resetBooking();
  }, 3000);
}

function stopRideSimulation() {
  if (rideAnimation) {
    clearInterval(rideAnimation);
  }
  if (movingVehicle) {
    map.removeLayer(movingVehicle);
  }
  rideInProgress = false;
}

function resetBooking() {
  document.getElementById("fareSection").classList.add("hidden");
  stopRideSimulation();
  document.getElementById("citySelect").value = "Delhi";
  updateLocationDropdowns();
  updateMapRoute();
}

function updateAnalytics() {
  const totalRides = rideHistory.length;
  const totalRevenue = rideHistory.reduce((sum, ride) => sum + ride.fare, 0);
  const avgFare = totalRides > 0 ? totalRevenue / totalRides : 0;
  const avgDistance = totalRides > 0 ? rideHistory.reduce((sum, ride) => sum + ride.distance, 0) / totalRides : 0;

  document.getElementById("totalRidesCount").textContent = totalRides;
  document.getElementById("totalRevenue").textContent = totalRevenue.toFixed(2);
  document.getElementById("avgFareAmount").textContent = avgFare.toFixed(2);
  document.getElementById("avgDistanceKm").textContent = avgDistance.toFixed(2);

  displayRideHistory();
}

function displayRideHistory() {
  const historyList = document.getElementById("rideHistoryList");
  const analyticsList = document.getElementById("analyticsRideList");

  if (rideHistory.length === 0) {
    historyList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;"><div style="font-size: 3em; margin-bottom: 10px;"><i class="fa-solid fa-motorcycle"></i></div><div>No rides yet. Book your first EV ride!</div></div>';
    analyticsList.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">No ride data available</div>';
    return;
  }

  const ridesHTML = rideHistory.slice().reverse().map(ride => `
    <div class="ride-item">
      <div class="ride-header">
        <div class="ride-id">${ride.id}</div>
        <span class="status-badge ${ride.status === 'Completed' ? 'status-completed' : 'status-pending'}">${ride.status}</span>
      </div>
      <div style="margin-bottom: 15px;">
        <div style="font-size: 0.95em; color: #666; margin-bottom: 8px;">
          <i class="fa-solid fa-map-pin"></i> <strong>Pickup:</strong> ${ride.pickup}
        </div>
        <div style="font-size: 0.95em; color: #666; margin-bottom: 8px;">
          <i class="fa-solid fa-map-pin"></i> <strong>Drop:</strong> ${ride.drop}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e9ecef;">
          <div>
            <div style="font-size: 0.85em; color: #666;">Vehicle</div>
            <div style="font-weight: 600; color: #495057;">${ride.vehicle}</div>
          </div>
          <div>
            <div style="font-size: 0.85em; color: #666;">Distance</div>
            <div style="font-weight: 600; color: #495057;">${ride.distance.toFixed(1)} km</div>
          </div>
          <div>
            <div style="font-size: 0.85em; color: #666;">Fare</div>
            <div style="font-weight: 700; color: #22c55e;">₹${ride.fare.toFixed(2)}</div>
          </div>
        </div>
      </div>
      <div style="font-size: 0.85em; color: #999;"><i class="fa-regular fa-clock"></i> ${ride.date}</div>
    </div>
  `).join("");

  historyList.innerHTML = ridesHTML;
  analyticsList.innerHTML = ridesHTML;
}

function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  document.querySelectorAll(".section").forEach((section) => section.classList.remove("active"));

  if (tab === "booking") {
    document.getElementById("bookingSection").classList.add("active");
  } else if (tab === "history") {
    document.getElementById("historySection").classList.add("active");
    displayRideHistory();
  } else if (tab === "analytics") {
    document.getElementById("analyticsSection").classList.add("active");
    updateAnalytics();
  }
}

function showAlert(message, type) {
  const alertBox = document.getElementById("alertBox");
  alertBox.textContent = message;
  alertBox.className = "alert " + type + " show";

  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

// Event Listeners
document.getElementById("pickupLocation").addEventListener("change", updateMapRoute);
document.getElementById("dropLocation").addEventListener("change", updateMapRoute);
document.getElementById("citySelect").addEventListener("change", updateLocationDropdowns);

// Initialize on page load
window.addEventListener("load", function () {
  initMap();
  displayRideHistory();
  checkBackendStatus();
});