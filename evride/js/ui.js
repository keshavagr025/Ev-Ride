// ui.js - All UI helper functions

import { vehicleRates } from './config.js';

// Show alert message
export function showAlert(message, type) {
  const alertBox = document.getElementById("alertBox");
  alertBox.innerHTML = message;
  alertBox.className = "alert " + type + " show";

  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

// Update vehicle price display
export function updateVehiclePriceDisplay(vehicleType, priceElement) {
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
export function updateAllVehiclePrices() {
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  vehicleCards.forEach(card => {
    const vehicleType = card.querySelector('strong').textContent;
    const priceElement = card.querySelector('.vehicle-price');
    updateVehiclePriceDisplay(vehicleType, priceElement);
  });
}

// Initialize vehicle cards
export function initializeVehicleCards() {
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  vehicleCards.forEach(card => {
    const vehicleType = card.querySelector('strong').textContent;
    const priceElement = card.querySelector('.vehicle-price');
    updateVehiclePriceDisplay(vehicleType, priceElement);
  });
}

// Switch between tabs
export function switchTab(tab) {
  document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
  event.target.classList.add("active");

  document.querySelectorAll(".section").forEach((section) => section.classList.remove("active"));

  if (tab === "booking") {
    document.getElementById("bookingSection").classList.add("active");
  } else if (tab === "history") {
    document.getElementById("historySection").classList.add("active");
  } else if (tab === "analytics") {
    document.getElementById("analyticsSection").classList.add("active");
  }
}