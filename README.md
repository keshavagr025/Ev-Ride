EvRide

EvRide is an Electric Ride Booking platform built using the MERN stack (MongoDB, Express, React, Node.js) with Google Maps integration + Machine Learning based Fare & Distance Optimization.
This project provides users with an EV-focused ride booking experience for smart mobility with dynamic pricing.

Features

User authentication and profile handling

Google Maps powered ride tracking & navigation

EV Ride booking & real-time ride status

AI/ML Powered Fare Prediction (Random Forest)

AI/ML Powered Distance Optimization (Hybrid Random Forest + KNN)

Tech Stack

Frontend: React

Backend: Node.js, Express

Database: MongoDB

Mapping API: Google Maps API

ML Models: Python, Scikit-Learn

Installation

Clone the repository:

git clone https://github.com/<your-account>/EvRide.git
cd EvRide


Install dependencies:

# backend
cd backend
npm install

# frontend
cd ../frontend
npm install


Setup environment variables in backend/.env:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key


Run the project:

# backend
cd backend
npm start

# frontend
cd ../frontend
npm start


Open browser & go to
http://localhost:3000

Machine Learning Used
Task	Model Used	Purpose
Fare Prediction	Random Forest Regression	Predict dynamic & optimized EV Ride Fare
Distance Optimization	Hybrid Random Forest + KNN Model	Find shortest + efficient route for EV rides

ML Models Folder Recommended:

EvRide/
├── ml-models/
│   ├─ fare_random_forest.ipynb
│   └─ distance_hybrid_rf_knn.ipynb

Project Structure
EvRide/
├── backend/     
├── frontend/    
├── ml-models/   # ML Notebooks
├── README.md    
└── ...

Contributing

Contributions are welcome!

Fork Repo

Create Feature Branch

Submit PR

License

This project is licensed under the MIT License.

Team / Author

Minor Project - EvRide

Team Members: Khushal Kumar Sahu + Group

AI & MERN Based EV Ride Optimization Project
