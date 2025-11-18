// map.js - All map related functions

import { cityLocations, cityCenter } from './config.js';
import { updateAllVehiclePrices } from './ui.js';
import { stopRideSimulation } from './ride.js';

// Map variables
export let map, pickupMarker, dropMarker, routeLine, movingVehicle;
let rideInProgress = false;

// Initialize Map
export function initMap() {
  map = L.map("map").setView([28.6139, 77.209], 12);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);
}

// Update location dropdowns based on selected city
export function updateLocationDropdowns() {
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

  if (cityCenter[city]) {
    map.setView(cityCenter[city], 12);
  }

  updateMapRoute();
}

// Update map route visualization
export function updateMapRoute() {
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

// Calculate distance between two coordinates
export function calculateDistance(coord1, coord2) {
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

// Export ride progress state
export function setRideInProgress(value) {
  rideInProgress = value;
}

export function isRideInProgress() {
  return rideInProgress;
}