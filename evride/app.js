// // Configuration - Updated to match your FastAPI endpoints
// const API_BASE = "http://localhost:8000";
// let selectedVehicle = "sedan";
// let currentRide = null;
// let map, userMarker, driverMarker, routeLine, dropoffMarker;
// let userWebSocket = null;
// let rideInterval = null;

// // Initialize the application
// function init() {
//   initMap();
//   loadStats();
//   loadDrivers();
//   connectUserWebSocket();
// }

// // Initialize map
// function initMap() {
//   map = L.map("map").setView([28.6139, 77.209], 13);

//   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//     maxZoom: 19,
//     attribution: "© OpenStreetMap contributors",
//   }).addTo(map);

//   userMarker = L.marker([28.6139, 77.209])
//     .addTo(map)
//     .bindPopup("🚩 Your Location")
//     .openPopup();
// }

// // Connect to WebSocket for real-time updates

// // check if logged in
// if(!localStorage.getItem("loggedIn")){
//     window.location.href = "./credentials/login.html";
// }


// function connectUserWebSocket() {
//   try {
//     const userId = `USER_${Date.now()}`;
//     userWebSocket = new WebSocket(`ws://localhost:8000/ws/user/${userId}`);

//     userWebSocket.onopen = () => {
//       console.log("✅ Connected to real-time updates");
//     };

//     userWebSocket.onmessage = (event) => {
//       const data = JSON.parse(event.data);
//       console.log("Real-time update:", data);

//       if (data.type === "ride_accepted") {
//         showAlert(
//           "✅ Driver has accepted your ride! Tracking started.",
//           "success"
//         );
//         startRideTracking();
//       }
//     };

//     userWebSocket.onclose = () => {
//       console.log("❌ WebSocket connection closed");
//     };
//   } catch (error) {
//     console.error("WebSocket connection failed:", error);
//   }
// }

// // Switch Tabs
// function switchTab(tab) {
//   document
//     .querySelectorAll(".section")
//     .forEach((s) => s.classList.remove("active"));
//   document
//     .querySelectorAll(".tab-btn")
//     .forEach((b) => b.classList.remove("active"));

//   document.getElementById(`${tab}Section`).classList.add("active");
//   event.target.classList.add("active");

//   if (tab === "driver") loadDriverDashboard();
//   if (tab === "admin") loadAdminDashboard();

//   // AUTH PAGE SWITCHING + REDIRECT FLOW

// // from index → login page


// }

// // Select Vehicle
// function selectVehicle(vehicle) {
//   selectedVehicle = vehicle;
//   document.querySelectorAll(".vehicle-card").forEach((card) => {
//     card.classList.remove("selected");
//   });
//   event.currentTarget.classList.add("selected");
//   updateFareEstimate();
// }

// // Update fare estimate
// function updateFareEstimate() {
//   const rates = {
//     sedan: 12,
//     suv: 15,
//     hatchback: 10,
//     premium: 20,
//   };

//   const distance = parseFloat(
//     document.getElementById("estimatedDistance").textContent
//   );
//   const fare = (distance * rates[selectedVehicle]).toFixed(2);

//   document.getElementById("fareAmount").textContent = fare;
//   document.getElementById("baseFare").textContent = (fare * 0.8).toFixed(2);
// }

// // Show Alert
// function showAlert(message, type = "success") {
//   const alert = document.getElementById("alertBox");
//   alert.className = `alert alert-${type} show`;
//   alert.textContent = message;
//   setTimeout(() => alert.classList.remove("show"), 5000);
// }

// // Book Ride - Updated for your FastAPI
// async function bookRide() {
//   const loader = document.getElementById("bookingLoader");
//   const bookBtn = document.getElementById("bookRideBtn");
//   const cancelBtn = document.getElementById("cancelRideBtn");

//   loader.style.display = "flex";
//   bookBtn.disabled = true;

//   try {
//     // Coordinates for Delhi locations
//     const pickupCoords = { latitude: 28.6139, longitude: 77.209 };
//     const dropoffCoords = { latitude: 28.65, longitude: 77.23 };

//     const response = await fetch(`${API_BASE}/ride/request`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         user_id: `USER_${Date.now()}`,
//         pickup: pickupCoords,
//         dropoff: dropoffCoords,
//         city: "Delhi",
//         vehicle_type: selectedVehicle,
//         user_type: "regular",
//       }),
//     });

//     const data = await response.json();

//     if (data.detail) {
//       throw new Error(data.detail);
//     }

//     currentRide = data;

//     // Update UI with ML-powered fare breakdown
//     document.getElementById("fareAmount").textContent =
//       data.estimated_fare.toFixed(2);
//     document.getElementById("baseFare").textContent = data.base_fare.toFixed(2);
//     document.getElementById("surgeMultiplier").textContent =
//       data.surge_multiplier;
//     document.getElementById("demandFactor").textContent = data.demand_factor;
//     document.getElementById("estimatedDistance").textContent =
//       data.estimated_distance.toFixed(1);
//     document.getElementById("estimatedTime").textContent = Math.round(
//       data.estimated_time
//     );

//     showAlert(
//       `✅ Ride booked! ${data.driver.name} is arriving. ` +
//         `ML-estimated fare: ₹${data.estimated_fare.toFixed(2)}`,
//       "success"
//     );

//     // Update map with optimized route
//     updateMapWithRide(
//       pickupCoords,
//       dropoffCoords,
//       data.driver,
//       data.optimized_route
//     );

//     // Show tracking UI
//     bookBtn.style.display = "none";
//     cancelBtn.style.display = "block";
//     document.getElementById("rideTracking").style.display = "block";
//     document.getElementById("trackingDriver").textContent = data.driver.name;
//     document.getElementById("trackingETA").textContent = `${Math.round(
//       data.estimated_time
//     )} mins`;
//     document.getElementById("trackingDistance").textContent =
//       data.estimated_distance.toFixed(1);

//     // Start tracking
//     startRideTracking();

//     // Refresh data
//     loadStats();
//     loadDrivers();
//   } catch (error) {
//     console.error("Error booking ride:", error);
//     showAlert(`❌ ${error.message}`, "error");
//   } finally {
//     loader.style.display = "none";
//     bookBtn.disabled = false;
//   }
// }

// // Cancel Ride
// function cancelRide() {
//   if (currentRide) {
//     showAlert("Ride cancelled", "warning");
//     resetRideUI();

//     if (rideInterval) {
//       clearInterval(rideInterval);
//       rideInterval = null;
//     }
//   }
// }

// // Reset ride UI
// function resetRideUI() {
//   document.getElementById("bookRideBtn").style.display = "block";
//   document.getElementById("cancelRideBtn").style.display = "none";
//   document.getElementById("rideTracking").style.display = "none";
//   currentRide = null;

//   // Clear map
//   if (driverMarker) map.removeLayer(driverMarker);
//   if (dropoffMarker) map.removeLayer(dropoffMarker);
//   if (routeLine) map.removeLayer(routeLine);
//   driverMarker = null;
//   dropoffMarker = null;
//   routeLine = null;
// }

// // Update map with ride details and optimized route
// function updateMapWithRide(pickup, dropoff, driver, optimizedRoute) {
//   // Clear existing layers
//   if (routeLine) map.removeLayer(routeLine);
//   if (dropoffMarker) map.removeLayer(dropoffMarker);

//   // Update pickup marker
//   userMarker.setLatLng([pickup.latitude, pickup.longitude]);

//   // Add dropoff marker
//   dropoffMarker = L.marker([dropoff.latitude, dropoff.longitude])
//     .addTo(map)
//     .bindPopup("🏁 Destination");

//   // Draw optimized route if available
//   const routePoints = optimizedRoute
//     ? optimizedRoute.map((loc) => [loc.latitude, loc.longitude])
//     : [
//         [pickup.latitude, pickup.longitude],
//         [dropoff.latitude, dropoff.longitude],
//       ];

//   routeLine = L.polyline(routePoints, {
//     color: "#10b981",
//     weight: 6,
//     opacity: 0.7,
//     dashArray: "10, 10",
//   })
//     .addTo(map)
//     .bindPopup("🤖 AI-Optimized Route");

//   // Add driver marker
//   updateDriverLocation(
//     driver.current_location.latitude,
//     driver.current_location.longitude,
//     driver.name
//   );

//   // Fit map to show all points
//   const bounds = L.latLngBounds(routePoints);
//   map.fitBounds(bounds, { padding: [20, 20] });
// }

// // Update driver location
// function updateDriverLocation(lat, lng, name = "Driver") {
//   if (driverMarker) {
//     driverMarker.setLatLng([lat, lng]);
//   } else {
//     driverMarker = L.marker([lat, lng], {
//       icon: L.icon({
//         iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
//         iconSize: [40, 40],
//       }),
//     })
//       .addTo(map)
//       .bindPopup(`🚗 ${name}`);
//   }
// }

// // Start ride tracking simulation
// function startRideTracking() {
//   let progress = 0;
//   const trackingProgress = document.getElementById("trackingProgress");

//   if (rideInterval) clearInterval(rideInterval);

//   rideInterval = setInterval(() => {
//     progress += 2;
//     if (progress > 100) {
//       progress = 100;
//       clearInterval(rideInterval);

//       showAlert(
//         "🎉 Ride completed! Thank you for choosing EV Ride.",
//         "success"
//       );
//       resetRideUI();

//       loadStats();
//       loadDrivers();
//     }

//     trackingProgress.style.width = `${progress}%`;

//     // Simulate driver movement along route
//     if (driverMarker && currentRide) {
//       const pickup = currentRide.pickup || {
//         latitude: 28.6139,
//         longitude: 77.209,
//       };
//       const dropoff = currentRide.dropoff || {
//         latitude: 28.65,
//         longitude: 77.23,
//       };

//       const progressRatio = progress / 100;
//       const currentLat =
//         pickup.latitude + (dropoff.latitude - pickup.latitude) * progressRatio;
//       const currentLng =
//         pickup.longitude +
//         (dropoff.longitude - pickup.longitude) * progressRatio;

//       updateDriverLocation(
//         currentLat,
//         currentLng,
//         currentRide.driver?.name || "Driver"
//       );
//     }
//   }, 500);
// }

// // Load Stats - Updated for your API
// async function loadStats() {
//   try {
//     const response = await fetch(`${API_BASE}/admin/stats`);
//     const data = await response.json();

//     const html = `
//                     <div style="padding: 20px; background: linear-gradient(135deg, #f8fafc, #f1f5f9); border-radius: 16px; margin-bottom: 15px;">
//                         <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
//                             <span style="color: #666; font-weight: 600;">Total Rides:</span>
//                             <strong style="color: var(--primary);">${
//                               data.total_rides
//                             }</strong>
//                         </div>
//                         <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
//                             <span style="color: #666; font-weight: 600;">Completed:</span>
//                             <strong style="color: #22c55e;">${
//                               data.completed_rides
//                             }</strong>
//                         </div>
//                         <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
//                             <span style="color: #666; font-weight: 600;">Available Drivers:</span>
//                             <strong style="color: #3b82f6;">${
//                               data.available_drivers
//                             }</strong>
//                         </div>
//                         <div style="display: flex; justify-content: space-between;">
//                             <span style="color: #666; font-weight: 600;">Avg Fare:</span>
//                             <strong style="color: #22c55e;">₹${data.average_fare.toFixed(
//                               2
//                             )}</strong>
//                         </div>
//                         ${
//                           data.models_loaded
//                             ? '<div style="margin-top: 15px; padding: 10px; background: #22c55e; color: white; border-radius: 8px; text-align: center; font-weight: 600;">🤖 ML Models Active</div>'
//                             : '<div style="margin-top: 15px; padding: 10px; background: #f59e0b; color: white; border-radius: 8px; text-align: center; font-weight: 600;">⚡ Basic Mode</div>'
//                         }
//                     </div>
//                 `;
//     document.getElementById("statsContainer").innerHTML = html;
//   } catch (error) {
//     console.error("Error loading stats:", error);
//   }
// }

// // Load Drivers - Updated for your API
// async function loadDrivers() {
//   try {
//     const response = await fetch(`${API_BASE}/drivers/available`);
//     const data = await response.json();

//     const html = data.drivers
//       ? data.drivers
//           .map(
//             (driver) => `
//                     <div class="driver-card">
//                         <div class="driver-avatar">${driver.name.charAt(
//                           0
//                         )}</div>
//                         <div class="driver-details">
//                             <div class="driver-name">${driver.name}</div>
//                             <div class="driver-vehicle">${
//                               driver.vehicle_type
//                             } • ${driver.ev_battery}% Battery</div>
//                             <div class="driver-meta">
//                                 <span class="driver-rating">⭐ ${
//                                   driver.driver_rating
//                                 }</span>
//                                 <span class="driver-battery">🔋 ${
//                                   driver.ev_battery
//                                 }%</span>
//                             </div>
//                         </div>
//                     </div>
//                 `
//           )
//           .join("")
//       : '<p style="color: #666; text-align: center; padding: 30px;">No drivers available</p>';

//     document.getElementById("driversList").innerHTML = html;
//   } catch (error) {
//     console.error("Error loading drivers:", error);
//   }
// }

// // Load Driver Dashboard
// async function loadDriverDashboard() {
//   try {
//     // For demo, use first driver
//     const driverId = "D001";
//     const response = await fetch(`${API_BASE}/driver/stats/${driverId}`);
//     const data = await response.json();

//     document.getElementById("driverRides").textContent = data.total_rides;
//     document.getElementById("driverEarnings").textContent =
//       data.earnings.toFixed(2);
//     document.getElementById("driverRating").textContent = data.rating;

//     loadPendingRides();

//     if (currentRide) {
//       document.getElementById("activeRideDriver").style.display = "block";
//       document.getElementById("activeRideId").textContent = currentRide.ride_id;
//       document.getElementById("activeFare").textContent =
//         currentRide.estimated_fare.toFixed(2);
//     }
//   } catch (error) {
//     console.error("Error loading driver dashboard:", error);
//   }
// }

// // Load Pending Rides for Driver
// async function loadPendingRides() {
//   let html = "";

//   if (currentRide) {
//     html = `
//                     <div class="ride-item">
//                         <div class="ride-header">
//                             <div class="ride-id">${currentRide.ride_id}</div>
//                             <span class="status-badge status-pending">Pending</span>
//                         </div>
//                         <div style="margin-bottom: 20px;">
//                             <div style="font-size: 15px; color: #666; margin-bottom: 8px;">
//                                 📍 Pickup: Connaught Place
//                             </div>
//                             <div style="font-size: 15px; color: #666; margin-bottom: 15px;">
//                                 🏁 Drop: Karol Bagh
//                             </div>
//                             <div style="font-size: 18px; font-weight: 700; color: #22c55e;">
//                                 💰 ML Fare: ₹${currentRide.estimated_fare.toFixed(
//                                   2
//                                 )}
//                             </div>
//                         </div>
//                         <button class="btn btn-success" onclick="acceptRide()">
//                             ✅ Accept Ride
//                         </button>
//                     </div>
//                 `;
//   } else {
//     html =
//       '<p style="color: #666; text-align: center; padding: 30px;">No pending ride requests</p>';
//   }

//   document.getElementById("pendingRidesList").innerHTML = html;
// }

// // Accept Ride (Driver)
// async function acceptRide() {
//   if (!currentRide) {
//     showAlert("No ride to accept", "error");
//     return;
//   }

//   try {
//     const response = await fetch(
//       `${API_BASE}/ride/accept?ride_id=${currentRide.ride_id}&driver_id=${currentRide.driver.driver_id}`,
//       { method: "POST" }
//     );

//     const data = await response.json();

//     if (data.detail) {
//       throw new Error(data.detail);
//     }

//     showAlert("✅ Ride accepted! Navigation started.", "success");

//     document.getElementById("activeRideDriver").style.display = "block";
//     document.getElementById("activeRideId").textContent = currentRide.ride_id;
//     document.getElementById("activeFare").textContent =
//       currentRide.estimated_fare.toFixed(2);

//     document.getElementById("pendingRidesList").innerHTML =
//       '<p style="color: #666; text-align: center; padding: 30px;">No pending ride requests</p>';
//   } catch (error) {
//     showAlert(`❌ ${error.message}`, "error");
//   }
// }

// // Complete Ride (Driver)
// async function completeRide() {
//   if (!currentRide) return;

//   try {
//     const response = await fetch(
//       `${API_BASE}/ride/complete/${currentRide.ride_id}`,
//       { method: "POST" }
//     );

//     const data = await response.json();

//     if (data.detail) {
//       throw new Error(data.detail);
//     }

//     showAlert(
//       `✅ Ride completed! Earnings: ₹${data.fare.toFixed(2)}`,
//       "success"
//     );

//     document.getElementById("activeRideDriver").style.display = "none";
//     currentRide = null;

//     loadStats();
//     loadDrivers();
//     loadDriverDashboard();
//   } catch (error) {
//     console.error("Error completing ride:", error);
//   }
// }

// // Load Admin Dashboard
// async function loadAdminDashboard() {
//   try {
//     const statsResponse = await fetch(`${API_BASE}/admin/stats`);
//     const statsData = await statsResponse.json();

//     document.getElementById("totalRides").textContent = statsData.total_rides;
//     document.getElementById("totalRevenue").textContent = (
//       statsData.average_fare * statsData.completed_rides
//     ).toFixed(2);
//     document.getElementById("activeDrivers").textContent =
//       statsData.available_drivers;

//     // Mock rides list
//     const ridesHtml = `
//                     <div class="ride-item">
//                         <div class="ride-header">
//                             <div class="ride-id">RIDE_${Date.now()
//                               .toString()
//                               .slice(-6)}</div>
//                             <span class="status-badge status-completed">Completed</span>
//                         </div>
//                         <div style="font-size: 15px; color: #666;">
//                             👤 User: USER_${Math.random()
//                               .toString(36)
//                               .substr(2, 6)
//                               .toUpperCase()} | 
//                             🚗 Driver: Rajesh Kumar<br>
//                             📏 Distance: 4.5 km | 💰 Fare: ₹78.50
//                         </div>
//                     </div>
//                     <div class="ride-item">
//                         <div class="ride-header">
//                             <div class="ride-id">RIDE_${Date.now()
//                               .toString()
//                               .slice(-6)}</div>
//                             <span class="status-badge status-ongoing">In Progress</span>
//                         </div>
//                         <div style="font-size: 15px; color: #666;">
//                             👤 User: USER_${Math.random()
//                               .toString(36)
//                               .substr(2, 6)
//                               .toUpperCase()} | 
//                             🚗 Driver: Amit Singh<br>
//                             📏 Distance: 7.2 km | 💰 Fare: ₹108.00
//                         </div>
//                     </div>
//                 `;
//     document.getElementById("allRidesList").innerHTML = ridesHtml;
//   } catch (error) {
//     console.error("Error loading admin dashboard:", error);
//   }
// }

// // after all code above....

// // from index -> login page
// function openLogin(){
//     window.location.href = "./credentials/login.html";
// }

// // from index -> signup page
// function openSignup(){
//     window.location.href = "./credentials/signup.html";
// }

// // after login success -> back to index
// function doLogin(){
//     window.location.href = "../index.html";
// }

// // after signup success -> back to index
// function doSignup(){
//     window.location.href = "../index.html";
// }


// // // Initialize on load
// // window.onload = init;


// // Initialize on load
// window.onload = init;