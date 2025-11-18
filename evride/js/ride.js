// ride.js - Ride booking and simulation

import { cityLocations, vehicleIcons } from './config.js';
import { map, movingVehicle, setRideInProgress } from './map.js';
import { notifyRideCompletion } from './backend.js';
import { showAlert } from './ui.js';
import { selectedVehicle } from './fare.js';
import { updateAnalytics } from './analytics.js';
import { updateLocationDropdowns, updateMapRoute } from './map.js';

let rideAnimation;
export let rideHistory = [];

// Book ride
export function bookRide() {
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
  showAlert("Ride booked successfully! Starting ride simulation...", "success");
  startRideSimulation(ride);
  updateAnalytics();
}

// Start ride simulation
function startRideSimulation(ride) {
  setRideInProgress(true);
  
  const city = document.getElementById("citySelect").value;
  const pickupCoords = cityLocations[city][ride.pickup];
  const dropCoords = cityLocations[city][ride.drop];
  
  if (!pickupCoords || !dropCoords) return;

  const vehicleIcon = vehicleIcons[ride.vehicle] || '🚗';
  const vehicleMarker = L.marker(pickupCoords, {
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
    
    vehicleMarker.setLatLng([lat, lng]);
    
    if (progress >= 100) {
      completeRide(ride, progressContainer, vehicleMarker);
    }
  }, stepDuration);
}

// Complete ride
async function completeRide(ride, progressContainer, vehicleMarker) {
  clearInterval(rideAnimation);
  setRideInProgress(false);
  
  ride.status = "Completed";
  
  if (vehicleMarker) {
    map.removeLayer(vehicleMarker);
  }

  await notifyRideCompletion(window.currentRideData?.ride_id);
  
  const confirmButton = document.querySelector('.btn-primary');
  confirmButton.innerHTML = 'Ride Completed!';
  
  progressContainer.innerHTML = `
    <div style="background: #d1fae5; padding: 20px; border-radius: 15px; margin-top: 20px; border-left: 4px solid #10b981;">
      <h4 style="margin-bottom: 15px; color: #065f46;">✓ Ride Completed Successfully!</h4>
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
        <strong>Thank you for choosing EV Ride! ⚡</strong>
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

// Stop ride simulation
export function stopRideSimulation() {
  if (rideAnimation) {
    clearInterval(rideAnimation);
  }
  setRideInProgress(false);
}

// Reset booking
function resetBooking() {
  document.getElementById("fareSection").classList.add("hidden");
  stopRideSimulation();
  document.getElementById("citySelect").value = "Delhi";
  updateLocationDropdowns();
  updateMapRoute();
}