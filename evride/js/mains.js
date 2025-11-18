// main.js - Main application initialization and event listeners

import { initMap, updateLocationDropdowns, updateMapRoute } from './map.js';
import { initializeVehicleCards, switchTab } from './ui.js';
import { checkBackendStatus } from './backend.js';
import { calculateFare, selectVehicle } from './fare.js';
import { bookRide } from './ride.js';
import { displayRideHistory, updateAnalytics } from './analytics.js';

// Make functions globally accessible for HTML onclick handlers
window.selectVehicle = selectVehicle;
window.calculateFare = calculateFare;
window.bookRide = bookRide;
window.switchTab = switchTab;

// Event Listeners
function setupEventListeners() {
  document.getElementById("pickupLocation").addEventListener("change", updateMapRoute);
  document.getElementById("dropLocation").addEventListener("change", updateMapRoute);
  document.getElementById("citySelect").addEventListener("change", updateLocationDropdowns);
}

// Initialize on page load
window.addEventListener("load", function () {
  initMap();
  updateLocationDropdowns();
  initializeVehicleCards();
  displayRideHistory();
  checkBackendStatus();
  setupEventListeners();
});