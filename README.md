🚗 Starting EV Ride Booking Platform...
✅ Enhanced Fare model loaded
✅ Label encoders loaded
✅ Server ready!
```


EvRide

EvRide is an Electric Ride Booking platform built using the MERN stack (MongoDB, Express, React, Node.js) with Google Maps integration + Machine Learning based Fare & Distance Optimization.
This project provides users with an EV-focused ride booking experience for smart mobility with dynamic pricing.

Features:
1.User authentication and profile handling
2.Google Maps powered ride tracking & navigation
3.EV Ride booking & real-time ride status
4. AI/ML Powered Fare Prediction (Random Forest)
5.AI/ML Powered Distance Optimization

Machine Learning Used:
1.Fare Prediction	Random Forest Regression	Predict dynamic & optimized EV Ride Fare


Installation
Clone the repository:
git clone https://github.com/<your-account>/EvRide.git
cd EvRide

🛠️ Tech Stack
Backend
FastAPI (Python)
Uvicorn
CSV dataset processing

Frontend
HTML5
CSS3
JavaScript (Vanilla JS)
Leaflet.js

Frontend Flow
1.User enters pickup & drop location
2.JavaScript → calls FastAPI using fetch()
3.Backend → Calculates fare
4.Results are shown on UI interface

evride/
│── __pycache__/
│── credentials/               # API keys or auth related files (if any)
│── frontend/                  # Additional UI files (if any)
│── models/                    # ML model files, .pkl, etc.
│── app.js                     # Frontend JavaScript logic
│── app.txt
│── dataset_integration.py     # CSV reading + dataset processing
│── front.html                 # UI (Main front page)
│── index.html                 # Homepage or ride summary page
│── main_enhanced.py           # Main FastAPI server file (enhanced version)
│── main_integrated.py         # FastAPI + model integrated version
│── style.css                  # Styling for the website
│── test_client.py             # API testing script
│── your_ride_data.csv         # Dataset used for fare prediction / analysis




Run the project:
1.Create Virtual Environment
python -m venv venv
source venv/bin/activate         # (Windows) venv\Scripts\activate

2.Install Dependencies
pip install fastapi uvicorn pandas numpy

3.Run FastAPI Server
uvicorn main_integrated:app --reload

4.Open Frontend
Simply open front.html or index.html in your browser or open by live server 

API Endpoints
1. Predict Fare
POST /predict_fare



Contributing:
Contributions are welcome!

Fork Repo
Create Feature Branch

Submit PR

License

This project is licensed under the MIT License.

Team / Author

Minor Project - EvRide

Team Members: Khushal Kumar Sahu + Keshav Agrawal  + Khushi Agrawal

AI & ML Based EV Ride Optimization Project


