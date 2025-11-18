// analytics.js - Analytics and ride history

import { rideHistory } from './ride.js';

// Update analytics
export function updateAnalytics() {
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

// Display ride history
export function displayRideHistory() {
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