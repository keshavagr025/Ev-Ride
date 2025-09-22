import React, { useState, useEffect } from 'react';

const staticBookings = [
  {
    id: 1,
    from: "Home",
    to: "Office Complex",
    date: "Yesterday",
    time: "9:15 AM",
    fare: 165,
    rating: 5,
    driver: "Priya Singh"
  },
  {
    id: 2,
    from: "Mall",
    to: "Airport",
    date: "2 days ago",
    time: "7:30 PM",
    fare: 420,
    rating: 4,
    driver: "Ravi Patel"
  },
  {
    id: 3,
    from: "Hotel",
    to: "Railway Station",
    date: "3 days ago",
    time: "11:20 AM",
    fare: 280,
    rating: 5,
    driver: "Suresh Kumar"
  }
];

const RideHistory = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const localRides = JSON.parse(localStorage.getItem("rideHistory") || "[]");
    setRides([...localRides, ...staticBookings]);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-10">
      <div className="max-w-3xl mx-auto bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Your Ride History</h2>
        <div className="space-y-6">
          {rides.map((ride, idx) => (
            <div key={idx} className="bg-white/30 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between shadow-lg border border-white/30">
              <div>
                <div className="font-semibold text-lg">{ride.from} <span className="mx-2">→</span> {ride.to}</div>
                <div className="text-sm text-gray-200">{ride.date}, {ride.time}</div>
                <div className="text-sm text-gray-200">Driver: {ride.driver}</div>
              </div>
              <div className="flex flex-col items-end mt-3 md:mt-0">
                <div className="font-bold text-yellow-300">₹{ride.fare}</div>
                {ride.rating && (
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400 font-bold">{ride.rating}</span>
                    <svg className="w-5 h-5 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.388 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.388-2.46a1 1 0 00-1.175 0l-3.388 2.46c-.784.57-1.838-.197-1.539-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.394c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69l1.286-3.967z"/></svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RideHistory;