import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Helper to move map to fit both markers
const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions, { padding: [60, 60] });
    } else if (positions.length === 1) {
      map.setView(positions[0], 14);
    }
  }, [positions, map]);
  return null;
};

const BookRide = () => {
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupPos, setPickupPos] = useState(null);
  const [dropPos, setDropPos] = useState(null);

  // Suggestions
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  // Geolocation for pickup (default)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPickupPos([pos.coords.latitude, pos.coords.longitude]),
        () => setPickupPos([23.2599, 77.4126]) // fallback: Bhopal
      );
    } else {
      setPickupPos([23.2599, 77.4126]);
    }
  }, []);

  // Fetch suggestions for pickup
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!pickup) return setPickupSuggestions([]);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        pickup + ", Bhopal, India"
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      setPickupSuggestions(data);
    };
    fetchSuggestions();
  }, [pickup]);

  // Fetch suggestions for drop
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!drop) return setDropSuggestions([]);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        drop + ", Bhopal, India"
      )}`;
      const res = await fetch(url);
      const data = await res.json();
      setDropSuggestions(data);
    };
    fetchSuggestions();
  }, [drop]);

  // When user selects a suggestion
  const selectPickup = (s) => {
    setPickup(s.display_name);
    setPickupPos([parseFloat(s.lat), parseFloat(s.lon)]);
    setPickupSuggestions([]);
  };
  const selectDrop = (s) => {
    setDrop(s.display_name);
    setDropPos([parseFloat(s.lat), parseFloat(s.lon)]);
    setDropSuggestions([]);
  };

  // Collect all marker positions for fitBounds
  const markerPositions = [];
  if (pickupPos) markerPositions.push(pickupPos);
  if (dropPos) markerPositions.push(dropPos);

  // Dashed polyline positions
  const polylinePositions = pickupPos && dropPos ? [pickupPos, dropPos] : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const ride = {
      from: pickup,
      to: drop,
      date: document.querySelector('input[type="date"]').value,
      time: document.querySelector('input[type="time"]').value,
      fare: Math.floor(Math.random() * 300) + 100, // You can use ML fare if available
      rating: null,
      driver: "To be assigned",
    };
    // Save to localStorage
    const rides = JSON.parse(localStorage.getItem("rideHistory") || "[]");
    rides.unshift(ride); // add to start
    localStorage.setItem("rideHistory", JSON.stringify(rides));
    alert("Ride booked successfully!");
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
      {/* Form Section */}
      <div className="flex flex-1 items-center justify-center">
        <form
          className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl w-full max-w-md flex flex-col gap-6 border border-white/50"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 mb-4 drop-shadow">
            Book Your Ride
          </h2>

          <div className="relative">
            <label className="block text-blue-700 font-semibold mb-1">
              Pickup Location
            </label>
            <input
              type="text"
              placeholder="Enter pickup location"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              required
              className="p-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-blue-50"
              autoComplete="off"
            />
            {pickupSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white w-full border rounded-xl shadow max-h-48 overflow-y-auto mt-1">
                {pickupSuggestions.map((s) => (
                  <li
                    key={s.place_id}
                    className="p-2 hover:bg-blue-100 cursor-pointer text-black rounded"
                    onClick={() => selectPickup(s)}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="block text-pink-700 font-semibold mb-1">
              Drop Location
            </label>
            <input
              type="text"
              placeholder="Enter drop location"
              value={drop}
              onChange={(e) => setDrop(e.target.value)}
              required
              className="p-3 border border-pink-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 w-full bg-pink-50"
              autoComplete="off"
            />
            {dropSuggestions.length > 0 && (
              <ul className="absolute z-10 bg-white w-full border rounded-xl shadow max-h-48 overflow-y-auto mt-1">
                {dropSuggestions.map((s) => (
                  <li
                    key={s.place_id}
                    className="p-2 hover:bg-pink-100 cursor-pointer text-black rounded"
                    onClick={() => selectDrop(s)}
                  >
                    {s.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-1">Date</label>
              <input
                type="date"
                required
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 w-full bg-gray-50"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-1">Time</label>
              <input
                type="time"
                required
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 w-full bg-gray-50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 rounded-2xl font-bold text-lg shadow hover:scale-105 transition"
          >
            Book Ride
          </button>
        </form>
      </div>

      {/* Map Section */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full h-[28rem] rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          <MapContainer
            center={pickupPos || [23.2599, 77.4126]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Dashed line between pickup and drop */}
            {polylinePositions.length === 2 && (
              <Polyline
                positions={polylinePositions}
                pathOptions={{
                  color: "#7c3aed",
                  weight: 5,
                  dashArray: "12 12",
                  lineCap: "round",
                }}
              />
            )}
            {pickupPos && (
              <Marker position={pickupPos}>
                <Popup>
                  <span className="font-bold text-blue-700">Pickup</span>
                </Popup>
              </Marker>
            )}
            {dropPos && (
              <Marker
                position={dropPos}
                icon={
                  new L.Icon({
                    iconUrl:
                      "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                  })
                }
              >
                <Popup>
                  <span className="font-bold text-pink-700">Drop</span>
                </Popup>
              </Marker>
            )}
            <FitBounds positions={markerPositions} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default BookRide;
