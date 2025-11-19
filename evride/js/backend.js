import { API_BASE_URL } from './config.js';
import { showAlert } from './ui.js';

// Check Python Backend Status
export async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    console.log("Python Backend Connected:", data);
    showAlert("ML Backend connected! Using advanced model", "success");
    return true;
  } catch (error) {
    console.warn("Python Backend not available:", error);
    showAlert("Backend offline - using fallback mode", "error");
    return false;
  }
}

// Request ride from backend
export async function requestRideFromBackend(rideData) {
  const response = await fetch(`${API_BASE_URL}/ride/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(rideData)
  });

  if (!response.ok) {
    throw new Error('Backend error');
  }

  return await response.json();
}

// Complete ride notification to backend
export async function notifyRideCompletion(rideId) {
  try {
    if (rideId) {
      await fetch(`${API_BASE_URL}/ride/complete/${rideId}`, {
        method: 'POST'
      });
    }
  } catch (error) {
    console.log("Backend notification failed:", error);
  }
}