// src/api/rides.js
const BASE_URL = "http://localhost:5000/api/rides";

export const bookRide = async (rideData) => {
  const res = await fetch(`${BASE_URL}/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rideData),
  });
  return await res.json();
};

export const getRides = async (userId) => {
  const res = await fetch(`${BASE_URL}/${userId}`);
  return await res.json();
};
