const API_BASE = "http://localhost:8000";

let selectedVehicle = "Sedan";
let currentRide = null;

// Switch Tabs
function switchTab(tab) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));

  document.getElementById(`${tab}Section`).classList.add("active");
  event.target.classList.add("active");

  if (tab === "driver") loadDriverDashboard();
  if (tab === "admin") loadAdminDashboard();
}

// Select Vehicle
function selectVehicle(vehicle) {
  selectedVehicle = vehicle;
  document.querySelectorAll(".vehicle-card").forEach((card) => {
    card.classList.remove("selected");
  });
  event.currentTarget.classList.add("selected");
}

// Show Alert
function showAlert(message, type = "success") {
  const alert = document.getElementById("alertBox");
  alert.className = `alert alert-${type} show`;
  alert.textContent = message;
  setTimeout(() => alert.classList.remove("show"), 5000);
}

// Book Ride
async function bookRide() {
  const loader = document.getElementById("bookingLoader");
  loader.style.display = "block";

  try {
    const response = await fetch(`${API_BASE}/ride/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: `USER_${Date.now()}`,
        pickup: {
          latitude: 28.6139,
          longitude: 77.209,
        },
        dropoff: {
          latitude: 28.65,
          longitude: 77.23,
        },
        city: "Delhi",
        vehicle_type: selectedVehicle,
        user_type: "regular",
      }),
    });

    const data = await response.json();
    currentRide = data;

    document.getElementById("fareAmount").textContent =
      data.estimated_fare.toFixed(2);
    document.getElementById("estimatedDistance").textContent =
      data.estimated_distance.toFixed(1);
    document.getElementById("estimatedTime").textContent =
      data.estimated_time.toFixed(0);

    showAlert(
      `✅ Ride booked! Driver ${
        data.driver.name
      } is on the way. Fare: ₹${data.estimated_fare.toFixed(2)}`
    );

    // Show user and driver on map
    const pickup = [
      ride_request.pickup.latitude,
      ride_request.pickup.longitude,
    ];
    const dropoff = [
      ride_request.dropoff.latitude,
      ride_request.dropoff.longitude,
    ];
    const driver = [data.driver.latitude, data.driver.longitude];

    // Draw pickup and dropoff
    if (userMarker) userMarker.setLatLng(pickup);
    if (routeLine) map.removeLayer(routeLine);

    // Add driver marker
    if (!driverMarker) {
      driverMarker = L.marker(driver, {
        icon: L.icon({
          iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
          iconSize: [32, 32],
        }),
      })
        .addTo(map)
        .bindPopup(`${data.driver.name} 🚗`);
    } else {
      driverMarker.setLatLng(driver);
    }

    // Draw route line
    routeLine = L.polyline([pickup, dropoff], {
      color: "blue",
      weight: 4,
    }).addTo(map);
    map.fitBounds(routeLine.getBounds());

    loadStats();
    loadDrivers();
  } catch (error) {
    showAlert("❌ Error booking ride: " + error.message, "error");
  } finally {
    loader.style.display = "none";
  }
}

// Load Stats
async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/admin/stats`);
    const data = await response.json();

    const html = `
                    <div style="padding: 15px; background: #f8f9ff; border-radius: 8px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Total Rides:</span>
                            <strong>${data.total_rides}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Completed:</span>
                            <strong style="color: #32cd32;">${
                              data.completed_rides
                            }</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="color: #666;">Available Drivers:</span>
                            <strong style="color: #667eea;">${
                              data.available_drivers
                            }</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #666;">Avg Fare:</span>
                            <strong style="color: #32cd32;">₹${data.average_fare.toFixed(
                              2
                            )}</strong>
                        </div>
                    </div>
                `;
    document.getElementById("statsContainer").innerHTML = html;
  } catch (error) {
    console.error("Error loading stats:", error);
  }
}

// Load Drivers
async function loadDrivers() {
  try {
    const response = await fetch(`${API_BASE}/drivers/available`);
    const data = await response.json();

    const html = data.drivers
      .map(
        (driver) => `
                    <div class="driver-card">
                        <div class="driver-info">
                            <div class="driver-avatar">${driver.name.charAt(
                              0
                            )}</div>
                            <div class="driver-details">
                                <div class="driver-name">${driver.name}</div>
                                <div class="driver-vehicle">${
                                  driver.vehicle_type
                                } | Battery: ${driver.ev_battery}%</div>
                                <div class="driver-rating">⭐ ${
                                  driver.driver_rating
                                }</div>
                            </div>
                        </div>
                    </div>
                `
      )
      .join("");

    document.getElementById("driversList").innerHTML =
      html ||
      '<p style="color: #666; text-align: center;">No drivers available</p>';
  } catch (error) {
    console.error("Error loading drivers:", error);
  }
}

// Simulate driver's live location updates
function simulateDriverMovement(start, end) {
    let lat = start[0], lon = start[1];
    const steps = 20;
    const latStep = (end[0] - start[0]) / steps;
    const lonStep = (end[1] - start[1]) / steps;

    let i = 0;
    const interval = setInterval(() => {
        lat += latStep;
        lon += lonStep;
        if (driverMarker) driverMarker.setLatLng([lat, lon]);

        // Stop when reached destination
        if (i++ >= steps) clearInterval(interval);
    }, 1000);
}


// Load Driver Dashboard
async function loadDriverDashboard() {
  try {
    const response = await fetch(`${API_BASE}/admin/stats`);
    const data = await response.json();

    document.getElementById("driverRides").textContent = data.total_rides;
    document.getElementById("driverEarnings").textContent = (
      data.average_fare * data.completed_rides
    ).toFixed(2);

    // Load pending rides
    loadPendingRides();
  } catch (error) {
    console.error("Error loading driver dashboard:", error);
  }
}

// Load Pending Rides for Driver
async function loadPendingRides() {
  const html = `
                <div class="ride-item">
                    <div class="ride-header">
                        <div class="ride-id">🚗 New Ride Request</div>
                        <span class="status-badge status-pending">Pending</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <div style="font-size: 14px; color: #666;">Pickup: Connaught Place</div>
                        <div style="font-size: 14px; color: #666;">Drop: Karol Bagh</div>
                        <div style="font-size: 16px; font-weight: 600; margin-top: 5px; color: #32cd32;">Fare: ₹78.50</div>
                    </div>
                    <button class="btn btn-success" onclick="acceptRide()">✅ Accept Ride</button>
                </div>
            `;
  document.getElementById("pendingRidesList").innerHTML = html;
}

// Accept Ride
async function acceptRide() {
  if (!currentRide) {
    showAlert("No ride to accept", "error");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE}/ride/accept?ride_id=${currentRide.ride_id}&driver_id=${currentRide.driver.driver_id}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();
    showAlert("✅ Ride accepted! Start your journey.");

    setTimeout(() => completeRide(), 3000);
  } catch (error) {
    showAlert("❌ Error accepting ride: " + error.message, "error");
  }
}

// Complete Ride
async function completeRide() {
  if (!currentRide) return;

  try {
    const response = await fetch(
      `${API_BASE}/ride/complete/${currentRide.ride_id}`,
      {
        method: "POST",
      }
    );

    const data = await response.json();
    showAlert(`✅ Ride completed! Earned: ₹${data.fare.toFixed(2)}`);

    loadStats();
    loadDrivers();
    currentRide = null;
  } catch (error) {
    console.error("Error completing ride:", error);
  }
}

// Load Admin Dashboard
async function loadAdminDashboard() {
  try {
    const statsResponse = await fetch(`${API_BASE}/admin/stats`);
    const statsData = await statsResponse.json();

    document.getElementById("totalRides").textContent = statsData.total_rides;
    document.getElementById("totalRevenue").textContent = (
      statsData.average_fare * statsData.completed_rides
    ).toFixed(2);
    document.getElementById("activeDrivers").textContent =
      statsData.available_drivers;

    // For demo - would fetch actual rides from API
    const ridesHtml = `
                    <div class="ride-item">
                        <div class="ride-header">
                            <div class="ride-id">RIDE_001</div>
                            <span class="status-badge status-completed">Completed</span>
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            User: USER_123 | Driver: Rajesh Kumar<br>
                            Distance: 4.5 km | Fare: ₹78.50
                        </div>
                    </div>
                `;
    document.getElementById("allRidesList").innerHTML = ridesHtml;
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
  }
}

// Initialize on load
window.onload = function () {
  loadStats();
  loadDrivers();
};

// ==================== MAP INITIALIZATION ====================
let map, userMarker, driverMarker, routeLine;

function initMap() {
  map = L.map("map").setView([28.6139, 77.209], 13);

  // Add tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  // Default markers
  userMarker = L.marker([28.6139, 77.209])
    .addTo(map)
    .bindPopup("Pickup Location")
    .openPopup();

  driverMarker = null;
}

window.onload = function () {
  initMap();
  loadStats();
  loadDrivers();
};

