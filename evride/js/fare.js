import { cityLocations, vehicleRates } from './config.js';
import { requestRideFromBackend } from './backend.js';
import { showAlert } from './ui.js';

export let selectedVehicle = "Sedan";

// Select vehicle
export function selectVehicle(vehicle, element) {
  selectedVehicle = vehicle;
  document.querySelectorAll(".vehicle-card").forEach((card) => {
    card.classList.remove("selected");
  });
  element.classList.add("selected");
  
  const priceElement = element.querySelector('.vehicle-price');
  import('./ui.js').then(ui => {
    ui.updateVehiclePriceDisplay(vehicle, priceElement);
  });
}

// Calculate Fare
export async function calculateFare() {
  const pickupLocation = document.getElementById("pickupLocation").value;
  const dropLocation = document.getElementById("dropLocation").value;
  const city = document.getElementById("citySelect").value;

  if (!pickupLocation || !dropLocation) {
    showAlert("Please select both pickup and drop locations", "error");
    return;
  }

  if (pickupLocation === dropLocation) {
    showAlert("Pickup and drop locations cannot be the same", "error");
    return;
  }

  const locations = cityLocations[city] || {};
  const pickupCoords = locations[pickupLocation];
  const dropCoords = locations[dropLocation];

  if (!pickupCoords || !dropCoords) {
    showAlert("Invalid locations selected", "error");
    return;
  }

  showAlert("Calculating fare using ML model...", "success");

  try {
    const rideData = {
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
    };

    const data = await requestRideFromBackend(rideData);

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

    showAlert("Fare calculated using ML model! Driver: " + data.driver.name, "success");

    window.currentRideData = data;

  } catch (error) {
    console.error("Backend error:", error);
    showAlert("Backend unavailable, using fallback calculation", "error");
    
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