import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Star,
  Zap,
  Phone,
  User,
  Settings,
  History,
  Wallet,
  Shield,
  Plus,
  ArrowRight,
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user] = useState({
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    rides: 47,
    rating: 4.8,
    savings: 2340,
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [openBookings] = useState([
    {
      id: 1,
      from: "Bhopal Railway Station",
      to: "MP Nagar Zone 2",
      date: "Today",
      time: "2:30 PM",
      status: "Confirmed",
      driver: "Amit Kumar",
      vehicleType: "Tesla Model 3",
      fare: 245,
      bookingTime: "12:15 PM",
    },
    {
      id: 2,
      from: "AIIMS Bhopal",
      to: "New Market",
      date: "Today",
      time: "6:45 PM",
      status: "Pending",
      fare: 180,
      bookingTime: "1:20 PM",
    },
  ]);

  const [previousBookings] = useState([
    {
      id: 1,
      from: "Home",
      to: "Office Complex",
      date: "Yesterday",
      time: "9:15 AM",
      fare: 165,
      rating: 5,
      driver: "Priya Singh",
    },
    {
      id: 2,
      from: "Mall",
      to: "Airport",
      date: "2 days ago",
      time: "7:30 PM",
      fare: 420,
      rating: 4,
      driver: "Ravi Patel",
    },
    {
      id: 3,
      from: "Hotel",
      to: "Railway Station",
      date: "3 days ago",
      time: "11:20 AM",
      fare: 280,
      rating: 5,
      driver: "Suresh Kumar",
    },
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Find next confirmed ride
  const nextRide = openBookings.find((b) => b.status === "Confirmed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-800">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full flex items-center justify-center animate-pulse shadow">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
              EvRide
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center bg-white/80 px-4 py-2 rounded-xl shadow">
              <div className="text-blue-500 font-medium">Current Time</div>
              <div className="font-bold text-lg">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-white/80 px-4 py-2 rounded-xl shadow">
              <User className="w-5 h-5 text-blue-400" />
              <span className="font-bold text-blue-500">{user.name}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-r from-green-200 to-blue-200 rounded-2xl p-6 flex items-center gap-4 shadow-md">
            <Car className="w-10 h-10 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{user.rides}</div>
              <div className="text-gray-500">Total Rides</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-200 to-pink-200 rounded-2xl p-6 flex items-center gap-4 shadow-md">
            <Star className="w-10 h-10 text-pink-500" />
            <div>
              <div className="text-2xl font-bold">{user.rating}</div>
              <div className="text-gray-500">Your Rating</div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-cyan-200 to-purple-200 rounded-2xl p-6 flex items-center gap-4 shadow-md">
            <Wallet className="w-10 h-10 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">₹{user.savings}</div>
              <div className="text-gray-500">Total Savings</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Open Book Rides */}
          <div className="lg:col-span-2 space-y-6">
            {/* Next Ride Card */}
            {nextRide && (
              <div className="bg-white/90 rounded-2xl shadow-md p-6 flex flex-col md:flex-row md:items-center md:justify-between border border-blue-100 mb-4">
                <div>
                  <div className="text-lg font-bold text-green-600 mb-1 flex items-center gap-2">
                    <Car className="w-6 h-6" /> Next Ride (Confirmed)
                  </div>
                  <div className="text-xl font-semibold">
                    {nextRide.from}{" "}
                    <ArrowRight className="inline mx-2" /> {nextRide.to}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {nextRide.date}, {nextRide.time} &nbsp;|&nbsp; Driver:{" "}
                    {nextRide.driver}
                  </div>
                </div>
                <div className="flex flex-col items-end mt-4 md:mt-0">
                  <div className="text-lg font-bold text-yellow-600">
                    ₹{nextRide.fare}
                  </div>
                  <div className="text-xs text-gray-400">
                    Vehicle: {nextRide.vehicleType}
                  </div>
                </div>
              </div>
            )}

            {/* Open Bookings */}
            <div className="bg-white/70 rounded-2xl shadow p-4 border border-blue-100">
              <div className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-600">
                <History className="w-6 h-6" /> Active Bookings
              </div>
              <div className="space-y-3">
                {openBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between bg-white/80 rounded-xl p-4 border border-blue-100"
                  >
                    <div>
                      <div className="font-semibold text-base text-blue-700">
                        {booking.from}{" "}
                        <ArrowRight className="inline mx-2" /> {booking.to}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.date}, {booking.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          booking.status === "Confirmed"
                            ? "bg-green-200 text-green-700"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span className="text-yellow-600 font-bold">
                        ₹{booking.fare}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-6">
              <button
                onClick={() => navigate("/book-ride")}
                className="w-full p-8 bg-gradient-to-r from-pink-200 via-red-200 to-yellow-200 text-gray-800 rounded-3xl font-bold text-2xl hover:scale-105 transition transform shadow-md border border-pink-100"
              >
                <Plus className="w-8 h-8 mx-auto mb-2 text-pink-500" />
                Book New Ride
              </button>
              <button
                onClick={() => navigate("/ride-history")}
                className="w-full p-8 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 text-gray-800 rounded-3xl font-bold text-2xl hover:scale-105 transition transform shadow-md border border-blue-100"
              >
                <History className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                View Ride History
              </button>
            </div>
          </div>

          {/* Right Column - Quick Actions & Previous Bookings */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/90 rounded-2xl shadow-md p-6 border border-blue-100">
              <div className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-600">
                <Shield className="w-6 h-6" /> Quick Actions
              </div>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-200 to-blue-200 text-blue-700 font-semibold shadow hover:scale-105 transition">
                  <Wallet className="w-5 h-5" /> Wallet
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-200 to-pink-200 text-pink-700 font-semibold shadow hover:scale-105 transition">
                  <Phone className="w-5 h-5" /> Support
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-200 to-blue-200 text-purple-700 font-semibold shadow hover:scale-105 transition">
                  <Settings className="w-5 h-5" /> Settings
                </button>
              </div>
            </div>

            {/* Previous Bookings */}
            <div className="bg-white/70 rounded-2xl shadow p-4 border border-blue-100">
              <div className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-600">
                <History className="w-6 h-6" /> Previous Bookings
              </div>
              <div className="space-y-3">
                {previousBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between bg-white/80 rounded-xl p-4 border border-blue-100"
                  >
                    <div>
                      <div className="font-semibold text-base text-blue-700">
                        {booking.from}{" "}
                        <ArrowRight className="inline mx-2" /> {booking.to}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.date}, {booking.time}
                      </div>
                      <div className="text-xs text-gray-400">
                        Driver: {booking.driver}
                      </div>
                    </div>
                    <div className="flex flex-col items-end mt-2 md:mt-0">
                      <span className="text-yellow-600 font-bold">
                        ₹{booking.fare}
                      </span>
                      <span className="flex items-center text-yellow-500 font-bold text-sm mt-1">
                        <Star className="w-4 h-4 mr-1" /> {booking.rating}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
