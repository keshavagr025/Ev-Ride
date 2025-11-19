from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from geopy.distance import geodesic
from fastapi import WebSocket

app = FastAPI(
    title="EV Ride Booking Platform - Production Ready",
    description="ML-powered EV ride booking with fare prediction and driver matching",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.websocket("/ws/driver/{driver_id}")
async def driver_updates(websocket: WebSocket, driver_id: str):
    await websocket.accept()
    try:
        while True:
            driver = drivers_db.get(driver_id)
            if driver:
                await websocket.send_json({
                    "latitude": driver.latitude,
                    "longitude": driver.longitude
                })
            await asyncio.sleep(2)
    except Exception:
        await websocket.close()




# Data Models
class Location(BaseModel):
    latitude: float
    longitude: float

class RideRequest(BaseModel):
    user_id: str
    pickup: Location
    dropoff: Location
    city: str = "Delhi"
    vehicle_type: str = "sedan"
    user_type: str = "regular"
    time_of_day: Optional[str] = None  # morning/afternoon/evening/night

class Driver(BaseModel):
    driver_id: str
    name: str
    current_location: Location
    available: bool
    ev_battery: float
    vehicle_type: str
    driver_rating: float

class RideResponse(BaseModel):
    ride_id: str
    driver: Driver
    estimated_fare: float
    base_fare: float
    surge_multiplier: float
    estimated_distance: float
    estimated_time: float
    demand_factor: float
    optimized_route: List[Location]
    
    

# Enhanced Model Manager
class EnhancedModelManager:
    def __init__(self):
        self.fare_model = None
        self.fare_scaler = None
        self.fare_features = None
        self.label_encoders = None
        self.models_loaded = False
        
    def load_models(self):
        """Load pre-trained models"""
        try:
            # Load fare prediction model
            if os.path.exists('models/fare_model_enhanced.pkl'):
                fare_data = joblib.load('models/fare_model_enhanced.pkl')
                self.fare_model = fare_data['model']
                self.fare_scaler = fare_data['scaler']
                self.fare_features = fare_data['feature_columns']
                print("Enhanced Fare model loaded")
            else:
                print("Fare model not found. Using default calculations.")
                
            # Load label encoders
            if os.path.exists('models/label_encoders.pkl'):
                self.label_encoders = joblib.load('models/label_encoders.pkl')
                print("Label encoders loaded")
            else:
                print("Label encoders not found.")
                
            self.models_loaded = True
            return True
            
        except Exception as e:
            print(f"Error loading models: {e}")
            return False
    
    def encode_categorical(self, value, category):
        """Encode categorical value"""
        if self.label_encoders and category in self.label_encoders:
            try:
                return self.label_encoders[category].transform([value])[0]
            except:
                # If value not seen during training, use default (0)
                return 0
        return 0
    
    def get_time_of_day(self):
        """Get current time of day"""
        hour = datetime.now().hour
        if 5 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 21:
            return "evening"
        else:
            return "night"
    
    def get_traffic_level(self, hour, day_of_week):
        """Estimate traffic level"""
        # Peak hours
        if day_of_week < 5:  # Weekday
            if 8 <= hour <= 10 or 17 <= hour <= 20:
                return "high"
            elif 6 <= hour <= 8 or 10 <= hour <= 17 or 20 <= hour <= 22:
                return "medium"
        return "low"

    
    def calculate_demand_factor(self, hour, day_of_week, is_holiday):
        """Calculate demand factor"""
        base_demand = 1.0
        
        # Time-based demand
        if 8 <= hour <= 10 or 17 <= hour <= 20:
            base_demand += 0.3  # Peak hours
        elif 22 <= hour or hour <= 6:
            base_demand -= 0.2  # Late night
        
        # Weekend demand
        if day_of_week >= 5:
            base_demand += 0.15
        
        # Holiday demand
        if is_holiday:
            base_demand += 0.25
        
        return round(max(0.7, min(2.0, base_demand)), 2)
    
    def calculate_surge_multiplier(self, demand_factor, traffic_level):
        """Calculate surge multiplier"""
        surge = 1.0
        
        # Demand-based surge
        if demand_factor > 1.4:
            surge = 1.5
        elif demand_factor > 1.2:
            surge = 1.3
        elif demand_factor > 1.0:
            surge = 1.1
        
        # Traffic-based adjustment
        if traffic_level == "high":
            surge += 0.2
        elif traffic_level == "medium":
            surge += 0.1
        
        return round(surge, 2)
    
    def predict_fare(self, ride_features):
        """Predict fare using trained model"""
        if self.fare_model is None or not self.models_loaded:
            # Fallback calculation
            base = 40
            per_km = 12
            fare = base + (ride_features['distance_km'] * per_km)
            fare *= ride_features.get('surge_multiplier', 1.0)
            return fare
        
        try:
            # Prepare features in correct order
            features_dict = {}
            for col in self.fare_features:
                if col in ride_features:
                    features_dict[col] = ride_features[col]
                else:
                    features_dict[col] = 0  # Default value
            
            features_array = np.array([[features_dict[col] for col in self.fare_features]])
            features_scaled = self.fare_scaler.transform(features_array)
            
            predicted_fare = self.fare_model.predict(features_scaled)[0]
            return max(40, predicted_fare)  # Minimum fare ₹40
            
        except Exception as e:
            print(f"Error in fare prediction: {e}")
            # Fallback
            base = 40
            per_km = 12
            fare = base + (ride_features['distance_km'] * per_km)
            fare *= ride_features.get('surge_multiplier', 1.0)
            return fare
        
    ## Find the nearest driver for our ride 
    
    def find_nearest_driver(self, pickup_lat, pickup_lon, available_drivers):
        """Find nearest driver - FIXED VERSION"""
        if not available_drivers:
            return None, float('inf')
        
        min_dist = float('inf')
        best_driver = None
        
        for driver in available_drivers:
            dist = geodesic(
                (pickup_lat, pickup_lon),
                (driver.current_location.latitude, driver.current_location.longitude)
            ).km
            
            # Consider both distance and battery
            
            score = dist + ((100 - driver.ev_battery) / 10)
            
            if score < min_dist:
                min_dist = dist
                best_driver = driver
        
        return best_driver, min_dist

# Initialize model manager

model_manager = EnhancedModelManager()

# In-Memory Storage   

rides_db = {}
drivers_db = {}

# Sample drivers with enhanced data

sample_drivers = [
    {"driver_id": "D001", "name": "Rajesh Kumar", "location": (28.6139, 77.2090), 
     "available": True, "battery": 85.0, "vehicle": "sedan", "rating": 4.5},
    {"driver_id": "D002", "name": "Amit Singh", "location": (28.6300, 77.2200), 
     "available": True, "battery": 92.0, "vehicle": "suv", "rating": 4.7},
    {"driver_id": "D003", "name": "Priya Sharma", "location": (28.6000, 77.2000), 
     "available": True, "battery": 78.0, "vehicle": "hatchback", "rating": 4.3},
    {"driver_id": "D004", "name": "Rahul Verma", "location": (28.6500, 77.2300), 
     "available": True, "battery": 88.0, "vehicle": "sedan", "rating": 4.6},
    {"driver_id": "D005", "name": "Sneha Patel", "location": (28.5900, 77.1900), 
     "available": True, "battery": 95.0, "vehicle": "suv", "rating": 4.8},
]

for d in sample_drivers:
    drivers_db[d["driver_id"]] = Driver(
        driver_id=d["driver_id"],
        name=d["name"],
        current_location=Location(latitude=d["location"][0], longitude=d["location"][1]),
        available=d["available"],
        ev_battery=d["battery"],
        vehicle_type=d["vehicle"],
        driver_rating=d["rating"]
    )

# Helper Functions 
def calculate_distance(loc1: Location, loc2: Location) -> float:
    """Calculate distance between two locations"""
    return geodesic(
        (loc1.latitude, loc1.longitude), 
        (loc2.latitude, loc2.longitude)
    ).km

def estimate_duration(distance_km: float, traffic_level: str) -> float:
    """Estimate trip duration in minutes"""
    base_speed = 30  # km/h
    
    if traffic_level == "high":
        speed = 20
    elif traffic_level == "medium":
        speed = 25
    else:
        speed = 35
    
    duration = (distance_km / speed) * 60
    return round(duration, 2)

def optimize_route(pickup: Location, dropoff: Location) -> List[Location]:
    """Optimize route (simplified)"""
    mid_lat = (pickup.latitude + dropoff.latitude) / 2
    mid_lng = (pickup.longitude + dropoff.longitude) / 2
    return [
        pickup,
        Location(latitude=mid_lat, longitude=mid_lng),
        dropoff
    ]

def is_holiday() -> bool:
    """Check if today is holiday"""
    # In production, use holiday calendar API
    return False

# Startup Event

@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    print("\n" + "="*60)
    print("Starting EV Ride Booking Platform...")
    print("="*60)
    model_manager.load_models()
    print("Server ready!")
    print("="*60 + "\n")

#  API Endpoints

@app.get("/")
def root():
    return {
        "message": "EV Ride Booking Platform - Production API v2.0",
        "status": "online",
        "models_loaded": model_manager.models_loaded,
        "features": [
            "ML-powered fare prediction",
            "Smart driver matching",
            "Real-time surge pricing",
            "Route optimization"
        ],
        "endpoints": {
            "request_ride": "POST /ride/request",
            "accept_ride": "POST /ride/accept",
            "complete_ride": "POST /ride/complete/{ride_id}",
            "get_ride": "GET /ride/{ride_id}",
            "available_drivers": "GET /drivers/available",
            "model_stats": "GET /admin/stats"
        }
    }

@app.post("/ride/request", response_model=RideResponse)
async def request_ride(ride_request: RideRequest):
    """Request a ride with ML-powered pricing"""
    
    # Get available drivers
    available_drivers = [d for d in drivers_db.values() 
                        if d.available and d.ev_battery > 20]
    
    if not available_drivers:
        raise HTTPException(status_code=404, detail="No available drivers found")
    
    # Find nearest driver
    selected_driver, driver_distance = model_manager.find_nearest_driver(
        ride_request.pickup.latitude,
        ride_request.pickup.longitude,
        available_drivers
    )
    
    if selected_driver is None:
        raise HTTPException(status_code=404, detail="Could not match driver")
    
    # Calculate trip details
    trip_distance = calculate_distance(ride_request.pickup, ride_request.dropoff)
    
    # Get contextual data
    now = datetime.now()
    current_hour = now.hour
    current_day = now.weekday()
    is_holiday_today = is_holiday()
    
    # Determine time of day
    time_of_day = ride_request.time_of_day or model_manager.get_time_of_day()
    
    # Calculate traffic and demand
    traffic_level = model_manager.get_traffic_level(current_hour, current_day)
    demand_factor = model_manager.calculate_demand_factor(
        current_hour, current_day, is_holiday_today
    )
    surge_multiplier = model_manager.calculate_surge_multiplier(
        demand_factor, traffic_level
    )
    
    # Estimate duration
    trip_duration = estimate_duration(trip_distance, traffic_level)
    
    # Prepare features for ML prediction
    ride_features = {
        'distance_km': trip_distance,
        'duration_minutes': trip_duration,
        'demand_factor': demand_factor,
        'battery_health_percent': selected_driver.ev_battery,
        'energy_consumption_kwh': trip_distance * 0.25,  # Approx 0.25 kWh/km
        'route_difficulty': 3,  # Medium difficulty (1-5 scale)
        'day_of_week': current_day,
        'temperature_celsius': 28,  # Default, integrate weather API
        'humidity_percent': 65,
        'driver_rating': selected_driver.driver_rating,
        'surge_multiplier': surge_multiplier,
        'historical_pricing_factor': 1.0,
        'is_holiday': int(is_holiday_today),
        'charging_stations_nearby': 3,  # Default
        # Encoded features
        'city_encoded': model_manager.encode_categorical(ride_request.city, 'city'),
        'traffic_level_encoded': model_manager.encode_categorical(traffic_level, 'traffic_level'),
        'vehicle_type_encoded': model_manager.encode_categorical(ride_request.vehicle_type, 'vehicle_type'),
        'time_of_day_encoded': model_manager.encode_categorical(time_of_day, 'time_of_day'),
        'weather_condition_encoded': model_manager.encode_categorical('clear', 'weather_condition'),
        'user_type_encoded': model_manager.encode_categorical(ride_request.user_type, 'user_type'),
    }
    
    # Predict fare using ML model
    estimated_fare = model_manager.predict_fare(ride_features)
    base_fare = estimated_fare / surge_multiplier
    
    # Optimize route
    optimized_route = optimize_route(ride_request.pickup, ride_request.dropoff)
    
    # Create ride
    ride_id = f"RIDE_{len(rides_db) + 1}_{now.strftime('%Y%m%d%H%M%S')}"
    ride_data = {
        "ride_id": ride_id,
        "user_id": ride_request.user_id,
        "driver_id": selected_driver.driver_id,
        "pickup": ride_request.pickup,
        "dropoff": ride_request.dropoff,
        "fare": estimated_fare,
        "base_fare": base_fare,
        "surge_multiplier": surge_multiplier,
        "distance": trip_distance,
        "duration": trip_duration,
        "demand_factor": demand_factor,
        "traffic_level": traffic_level,
        "status": "pending",
        "created_at": now.isoformat()
    }
    rides_db[ride_id] = ride_data
    
    # Mark driver as busy
    drivers_db[selected_driver.driver_id].available = False
    
    return RideResponse(
        ride_id=ride_id,
        driver=selected_driver,
        estimated_fare=round(estimated_fare, 2),
        base_fare=round(base_fare, 2),
        surge_multiplier=surge_multiplier,
        estimated_distance=round(trip_distance, 2),
        estimated_time=round(trip_duration, 2),
        demand_factor=demand_factor,
        optimized_route=optimized_route
    )



@app.post("/ride/accept")
async def accept_ride(ride_id: str, driver_id: str):
    """Driver accepts ride"""
    if ride_id not in rides_db:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    ride = rides_db[ride_id]
    if ride["driver_id"] != driver_id:
        raise HTTPException(status_code=403, detail="Not assigned to this ride")
    
    ride["status"] = "accepted"
    ride["accepted_at"] = datetime.now().isoformat()
    
    return {
        "message": "Ride accepted successfully",
        "ride_id": ride_id,
        "fare": ride["fare"]
    }



@app.post("/ride/complete/{ride_id}")
async def complete_ride(ride_id: str):
    """Complete ride"""
    if ride_id not in rides_db:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    ride = rides_db[ride_id]
    ride["status"] = "completed"
    ride["completed_at"] = datetime.now().isoformat()
    
    # Make driver available
    drivers_db[ride["driver_id"]].available = True
    
    return {
        "message": "Ride completed successfully",
        "ride_id": ride_id,
        "fare": ride["fare"],
        "distance": ride["distance"]
    }
    


@app.get("/ride/{ride_id}")
async def get_ride(ride_id: str):
    """Get ride details"""
    if ride_id not in rides_db:
        raise HTTPException(status_code=404, detail="Ride not found")
    return rides_db[ride_id]



@app.get("/drivers/available")
async def get_available_drivers():
    """Get all available drivers"""
    available = [d for d in drivers_db.values() if d.available]
    return {
        "count": len(available),
        "drivers": available
    }

@app.get("/admin/stats")
async def get_stats():
    """Get system statistics"""
    total_rides = len(rides_db)
    completed_rides = len([r for r in rides_db.values() if r["status"] == "completed"])
    
    if completed_rides > 0:
        avg_fare = sum(r["fare"] for r in rides_db.values() if r["status"] == "completed") / completed_rides
        avg_distance = sum(r["distance"] for r in rides_db.values() if r["status"] == "completed") / completed_rides
    else:
        avg_fare = 0
        avg_distance = 0
    
    return {
        "models_loaded": model_manager.models_loaded,
        "total_rides": total_rides,
        "completed_rides": completed_rides,
        "pending_rides": total_rides - completed_rides,
        "available_drivers": len([d for d in drivers_db.values() if d.available]),
        "average_fare": round(avg_fare, 2),
        "average_distance": round(avg_distance, 2)
    }

# uvicorn main_enhanced:app --reload --port 8000