let map, pickupMarker, dropMarker, routeLine;
let selectedVehicle = "Sedan";
let rideHistory = [];
let dataset = [];
let modelData = {
  avgFarePerKm: 12,
  cityFactors: {},
  vehicleFactors: {},
  trafficFactors: {},
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

// Initialize Map
function initMap() {
  map = L.map("map").setView([28.6139, 77.209], 12); // Delhi center

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Initialize location dropdowns
  updateLocationDropdowns();
}

// Update location dropdowns based on selected city
function updateLocationDropdowns() {
  const city = document.getElementById("citySelect").value;
  const locations = cityLocations[city] || {};
  const locationNames = Object.keys(locations);

  // Update pickup dropdown
  const pickupSelect = document.getElementById("pickupLocation");
  pickupSelect.innerHTML = '<option value="">Select Pickup Location</option>';
  locationNames.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    pickupSelect.appendChild(option);
  });

  // Update drop dropdown
  const dropSelect = document.getElementById("dropLocation");
  dropSelect.innerHTML = '<option value="">Select Drop Location</option>';
  locationNames.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location;
    dropSelect.appendChild(option);
  });

  // Set default values
  if (locationNames.length > 0) {
    pickupSelect.value = locationNames[0];
    dropSelect.value = locationNames[1] || locationNames[0];
  }

  // Update map center based on city
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

  // Update route after changing city
  updateMapRoute();
}

// Load Dataset Automatically
async function loadDataset() {
  try {
    const response = await fetch("your_ride_data.csv");
    const csvText = await response.text();

    Papa.parse(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function (results) {
        dataset = results.data.filter((row) => {
          return (
            row.fare_amount_inr > 0 &&
            row.distance_km > 0 &&
            row.fare_amount_inr <= 10000
          );
        });

        trainModel();
        showAlert("✅ ML Model loaded successfully!", "success");
      },
      error: function (error) {
        console.error("Error loading dataset:", error);
        showAlert("⚠️ Using default pricing model", "error");
      },
    });
  } catch (error) {
    console.error("Dataset file not found:", error);
    showAlert("⚠️ Using default pricing model", "error");
  }
}

function trainModel() {
  if (dataset.length === 0) return;

  const totalFare = dataset.reduce(
    (sum, row) => sum + (row.fare_amount_inr || 0),
    0
  );
  const totalDistance = dataset.reduce(
    (sum, row) => sum + (row.distance_km || 0),
    0
  );

  // Calculate more accurate base fare per km from dataset
  modelData.avgFarePerKm = totalFare / totalDistance;

  // Calculate city factors (more conservative)
  const cities = {};
  dataset.forEach((row) => {
    const city = row.city;
    if (!cities[city]) cities[city] = { total: 0, count: 0, distance: 0 };
    cities[city].total += row.fare_amount_inr;
    cities[city].distance += row.distance_km;
    cities[city].count++;
  });

  Object.keys(cities).forEach((city) => {
    // Calculate per km rate and normalize to avoid extreme factors
    const cityPerKm = cities[city].total / cities[city].distance;
    modelData.cityFactors[city] = Math.min(
      Math.max(cityPerKm / modelData.avgFarePerKm, 0.7),
      1.3
    );
  });

  // Calculate vehicle factors (more conservative)
  const vehicles = {};
  dataset.forEach((row) => {
    const vehicle = row.vehicle_type;
    if (!vehicles[vehicle])
      vehicles[vehicle] = { total: 0, count: 0, distance: 0 };
    vehicles[vehicle].total += row.fare_amount_inr;
    vehicles[vehicle].distance += row.distance_km;
    vehicles[vehicle].count++;
  });

  Object.keys(vehicles).forEach((vehicle) => {
    const vehiclePerKm = vehicles[vehicle].total / vehicles[vehicle].distance;
    modelData.vehicleFactors[vehicle] = Math.min(
      Math.max(vehiclePerKm / modelData.avgFarePerKm, 0.8),
      1.4
    );
  });

  console.log("ML Model trained with", dataset.length, "records");
  console.log("Avg Fare Per Km:", modelData.avgFarePerKm.toFixed(2));
}

function updateMapRoute() {
  // Remove existing markers and route
  if (pickupMarker) map.removeLayer(pickupMarker);
  if (dropMarker) map.removeLayer(dropMarker);
  if (routeLine) map.removeLayer(routeLine);

  // Get selected city and locations
  const city = document.getElementById("citySelect").value;
  const pickupLocation = document.getElementById("pickupLocation").value;
  const dropLocation = document.getElementById("dropLocation").value;

  if (!pickupLocation || !dropLocation) {
    return;
  }

  // Get coordinates from cityLocations object
  const locations = cityLocations[city] || {};
  const pickupCoords = locations[pickupLocation];
  const dropCoords = locations[dropLocation];

  if (!pickupCoords || !dropCoords) {
    return;
  }

  // Add markers
  pickupMarker = L.marker(pickupCoords, {
    icon: L.divIcon({
      html: '<div style="background: #22c55e; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">🚩 Pickup</div>',
      className: "",
      iconSize: [80, 30],
    }),
  }).addTo(map);

  dropMarker = L.marker(dropCoords, {
    icon: L.divIcon({
      html: '<div style="background: #ef4444; color: white; padding: 8px 12px; border-radius: 20px; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">🏁 Drop</div>',
      className: "",
      iconSize: [80, 30],
    }),
  }).addTo(map);

  // Draw route line
  routeLine = L.polyline([pickupCoords, dropCoords], {
    color: "#667eea",
    weight: 4,
    opacity: 0.7,
  }).addTo(map);

  // Fit map to show both markers
  map.fitBounds([pickupCoords, dropCoords], { padding: [50, 50] });

  // Calculate distance
  const distance = calculateDistance(pickupCoords, dropCoords);
  const duration = Math.round(distance * 3.5); // 3.5 min per km average

  document.getElementById("routeDistance").textContent = distance.toFixed(1);
  document.getElementById("routeDuration").textContent = duration;

  // Hide fare section when location changes
  document.getElementById("fareSection").classList.add("hidden");
}

function calculateDistance(coord1, coord2) {
  const R = 6371; // Earth radius in km
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
}

function calculateFare() {
  const pickupLocation = document.getElementById("pickupLocation").value;
  const dropLocation = document.getElementById("dropLocation").value;

  if (!pickupLocation || !dropLocation) {
    showAlert("⚠️ Please select both pickup and drop locations", "error");
    return;
  }

  if (pickupLocation === dropLocation) {
    showAlert("⚠️ Pickup and drop locations cannot be the same", "error");
    return;
  }

  const distance = parseFloat(
    document.getElementById("routeDistance").textContent
  );
  const duration = parseFloat(
    document.getElementById("routeDuration").textContent
  );
  const city = document.getElementById("citySelect").value;

  if (distance === 0) {
    showAlert("⚠️ Please select valid locations", "error");
    return;
  }

  // ML-based fare calculation
  let baseFare = distance * modelData.avgFarePerKm;

  // Apply city factor
  const cityFactor = modelData.cityFactors[city] || 1.0;
  baseFare *= cityFactor;

  // Apply vehicle factor
  const vehicleFactor = modelData.vehicleFactors[selectedVehicle] || 1.0;
  baseFare *= vehicleFactor;

  // Random surge and demand (simulate real-time)
  const surge = 1 + Math.random() * 0.5; // 1.0 to 1.5
  const demand = 1 + Math.random() * 0.3; // 1.0 to 1.3

  const finalFare = baseFare * surge * demand;

  // Update UI
  document.getElementById("baseFare").textContent = baseFare.toFixed(2);
  document.getElementById("surgeFactor").textContent = surge.toFixed(2);
  document.getElementById("demandFactor").textContent = demand.toFixed(2);
  document.getElementById("predictedFare").textContent = finalFare.toFixed(2);
  document.getElementById("fareDistance").textContent = distance.toFixed(1);
  document.getElementById("fareDuration").textContent = duration;
  document.getElementById("perKmRate").textContent = (
    finalFare / distance
  ).toFixed(2);

  document.getElementById("fareSection").classList.remove("hidden");

  // Smooth scroll to fare section
  document
    .getElementById("fareSection")
    .scrollIntoView({ behavior: "smooth", block: "nearest" });

  showAlert("✅ Fare calculated successfully!", "success");
}

function bookRide() {
  const pickup = document.getElementById("pickupLocation").value;
  const drop = document.getElementById("dropLocation").value;
  const city = document.getElementById("citySelect").value;
  const fare = parseFloat(document.getElementById("predictedFare").textContent);
  const distance = parseFloat(
    document.getElementById("fareDistance").textContent
  );
  const duration = parseFloat(
    document.getElementById("fareDuration").textContent
  );

  const ride = {
    id: "RIDE_" + Date.now(),
    pickup: pickup,
    drop: drop,
    city: city,
    vehicle: selectedVehicle,
    fare: fare,
    distance: distance,
    duration: duration,
    status: "Completed",
    date: new Date().toLocaleString(),
    timestamp: Date.now(),
  };

  rideHistory.push(ride);

  showAlert("🎉 Ride booked successfully! Ride ID: " + ride.id, "success");

  // Update analytics
  updateAnalytics();

  // Reset after 2 seconds
  setTimeout(() => {
    resetBooking();
  }, 2000);
}

function resetBooking() {
  document.getElementById("fareSection").classList.add("hidden");

  // Reset to first city and its locations
  document.getElementById("citySelect").value = "Delhi";
  updateLocationDropdowns();

  updateMapRoute();
}

function updateAnalytics() {
  const totalRides = rideHistory.length;
  const totalRevenue = rideHistory.reduce((sum, ride) => sum + ride.fare, 0);
  const avgFare = totalRides > 0 ? totalRevenue / totalRides : 0;
  const avgDistance =
    totalRides > 0
      ? rideHistory.reduce((sum, ride) => sum + ride.distance, 0) / totalRides
      : 0;

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
    historyList.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #666;"><div style="font-size: 3em; margin-bottom: 10px;">🚗</div><div>No rides yet. Book your first EV ride!</div></div>';
    analyticsList.innerHTML =
      '<div style="text-align: center; padding: 40px; color: #666;">No ride data available</div>';
    return;
  }

  const ridesHTML = rideHistory
    .slice()
    .reverse()
    .map(
      (ride) => `
                <div class="ride-item">
                    <div class="ride-header">
                        <div class="ride-id">${ride.id}</div>
                        <span class="status-badge status-completed">${
                          ride.status
                        }</span>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 0.95em; color: #666; margin-bottom: 8px;">
                            📍 <strong>Pickup:</strong> ${ride.pickup}
                        </div>
                        <div style="font-size: 0.95em; color: #666; margin-bottom: 8px;">
                            🏁 <strong>Drop:</strong> ${ride.drop}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e9ecef;">
                            <div>
                                <div style="font-size: 0.85em; color: #666;">Vehicle</div>
                                <div style="font-weight: 600; color: #495057;">${
                                  ride.vehicle
                                }</div>
                            </div>
                            <div>
                                <div style="font-size: 0.85em; color: #666;">Distance</div>
                                <div style="font-weight: 600; color: #495057;">${ride.distance.toFixed(
                                  1
                                )} km</div>
                            </div>
                            <div>
                                <div style="font-size: 0.85em; color: #666;">Fare</div>
                                <div style="font-weight: 700; color: #22c55e;">₹${ride.fare.toFixed(
                                  2
                                )}</div>
                            </div>
                        </div>
                    </div>
                    <div style="font-size: 0.85em; color: #999;">🕐 ${
                      ride.date
                    }</div>
                </div>
            `
    )
    .join("");

  historyList.innerHTML = ridesHTML;
  analyticsList.innerHTML = ridesHTML;
}

function switchTab(tab) {
  // Update tab buttons
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  // Update sections
  document
    .querySelectorAll(".section")
    .forEach((section) => section.classList.remove("active"));

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

// Listen for location changes
document
  .getElementById("pickupLocation")
  .addEventListener("change", updateMapRoute);
document
  .getElementById("dropLocation")
  .addEventListener("change", updateMapRoute);
document
  .getElementById("citySelect")
  .addEventListener("change", updateLocationDropdowns);

// Initialize on page load
window.addEventListener("load", function () {
  initMap();
  loadDataset();
  displayRideHistory();
});
