# FastAPI App with Trained ML Models
# Run after training models with dataset_integration.py

from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from geopy.distance import geodesic

app = FastAPI(title="EV Ride Booking Platform - Production Ready")

# ==================== Data Models ====================
class Location(BaseModel):
    latitude: float
    longitude: float

class RideRequest(BaseModel):
    user_id: str
    pickup: Location
    dropoff: Location
    requested_time: Optional[str] = None

class Driver(BaseModel):
    driver_id: str
    name: str
    current_location: Location
    available: bool
    ev_battery: float

class RideResponse(BaseModel):
    ride_id: str
    driver: Driver
    estimated_fare: float
    estimated_distance: float
    estimated_time: float
    optimized_route: List[Location]

# ==================== Load Trained Models ====================
class ModelManager:
    def __init__(self):
        self.fare_model = None
        self.driver_matcher = None
        self.models_loaded = False
        
    def load_models(self):
        """Load pre-trained models"""
        try:
            # Load fare prediction model
            if os.path.exists('models/fare_model.pkl'):
                fare_data = joblib.load('models/fare_model.pkl')
                self.fare_model = fare_data['model']
                self.fare_scaler = fare_data['scaler']
                self.fare_features = fare_data['feature_columns']
                print("✅ Fare model loaded")
            else:
                print("⚠️ Fare model not found. Using default calculations.")
                
            # Load driver matcher
            if os.path.exists('models/driver_matcher.pkl'):
                matcher_data = joblib.load('models/driver_matcher.pkl')
                self.driver_matcher = matcher_data['model']
                self.driver_data = matcher_data['driver_data']
                print("✅ Driver matcher loaded")
            else:
                print("⚠️ Driver matcher not found. Using simple nearest driver logic.")
                
            self.models_loaded = True
            return True
            
        except Exception as e:
            print(f"❌ Error loading models: {e}")
            return False
    
    def predict_fare(self, distance, hour, day_of_week, traffic_factor, battery_level):
        """Predict fare using trained model"""
        if self.fare_model is None:
            # Fallback calculation
            base_fare = 40
            per_km = 12
            fare = base_fare + (distance * per_km * traffic_factor)
            if hour >= 22 or hour <= 6:
                fare += 50  # Night charge
            return fare
        
        try:
            features = {
                'distance': distance,
                'hour': hour,
                'day_of_week': day_of_week,
                'traffic_factor': traffic_factor,
                'battery_level': battery_level
            }
            features_array = np.array([[features[col] for col in self.fare_features]])
            features_scaled = self.fare_scaler.transform(features_array)
            return self.fare_model.predict(features_scaled)[0]
        except Exception as e:
            print(f"Error in fare prediction: {e}")
            # Fallback
            return 40 + (distance * 12 * traffic_factor)
    
    def find_nearest_driver(self, pickup_lat, pickup_lon, available_drivers):
        """Find nearest driver using KNN or simple distance"""
        if self.driver_matcher is None or not available_drivers:
            # Use simple distance calculation
            distances = []
            for driver in available_drivers:
                dist = geodesic(
                    (pickup_lat, pickup_lon),
                    (driver.current_location.latitude, driver.current_location.longitude)
                ).km
                distances.append((driver, dist))
            
            distances.sort(key=lambda x: x[1])
            return distances[0] if distances else (None, float('inf'))
        
        try:
            # Use trained KNN model
            pickup_rad = np.radians([[pickup_lat, pickup_lon]])
            distances, indices = self.driver_matcher.kneighbors(pickup_rad, n_neighbors=1)
            distance_km = distances[0][0] * 6371
            
            # Find closest available driver
            min_dist = float('inf')
            best_driver = None
            for driver in available_drivers:
                dist = geodesic(
                    (pickup_lat, pickup_lon),
                    (driver.current_location.latitude, driver.current_location.longitude)
                ).km
                if dist < min_dist:
                    min_dist = dist
                    best_driver = driver
            
            return best_driver, min_dist
            
        except Exception as e:
            print(f"Error in driver matching: {e}")
            # Fallback to simple distance
            return self.find_nearest_driver(pickup_lat, pickup_lon, available_drivers)

# Initialize model manager
model_manager = ModelManager()

# ==================== In-Memory Storage ====================
rides_db = {}
drivers_db = {}

# Sample drivers
sample_drivers = [
    {"driver_id": "D001", "name": "Rajesh Kumar", "location": (28.6139, 77.2090), "available": True, "battery": 85.0},
    {"driver_id": "D002", "name": "Amit Singh", "location": (28.6300, 77.2200), "available": True, "battery": 92.0},
    {"driver_id": "D003", "name": "Priya Sharma", "location": (28.6000, 77.2000), "available": True, "battery": 78.0},
    {"driver_id": "D004", "name": "Rahul Verma", "location": (28.6500, 77.2300), "available": True, "battery": 88.0},
    {"driver_id": "D005", "name": "Sneha Patel", "location": (28.5900, 77.1900), "available": True, "battery": 95.0},
]

for d in sample_drivers:
    drivers_db[d["driver_id"]] = Driver(
        driver_id=d["driver_id"],
        name=d["name"],
        current_location=Location(latitude=d["location"][0], longitude=d["location"][1]),
        available=d["available"],
        ev_battery=d["battery"]
    )

# ==================== Helper Functions ====================
def calculate_distance(loc1: Location, loc2: Location) -> float:
    return geodesic((loc1.latitude, loc1.longitude), 
                   (loc2.latitude, loc2.longitude)).km

def optimize_route(pickup: Location, dropoff: Location) -> List[Location]:
    mid_lat = (pickup.latitude + dropoff.latitude) / 2
    mid_lng = (pickup.longitude + dropoff.longitude) / 2
    return [pickup, Location(latitude=mid_lat, longitude=mid_lng), dropoff]

def get_traffic_factor() -> float:
    hour = datetime.now().hour
    if 8 <= hour <= 10 or 17 <= hour <= 20:
        return 1.3
    elif 22 <= hour or hour <= 6:
        return 0.9
    return 1.0

# ==================== Startup Event ====================
@app.on_event("startup")
async def startup_event():
    """Load models on startup"""
    print("\n" + "="*60)
    print("Starting EV Ride Booking Platform...")
    print("="*60)
    model_manager.load_models()
    print("✅ Server ready!")
    print("="*60 + "\n")

# ==================== API Endpoints ====================
@app.get("/")
def root():
    return {
        "message": "EV Ride Booking Platform - Production API",
        "version": "2.0",
        "models_loaded": model_manager.models_loaded,
        "endpoints": {
            "request_ride": "POST /ride/request",
            "accept_ride": "POST /ride/accept",
            "get_ride": "GET /ride/{ride_id}",
            "available_drivers": "GET /drivers/available",
            "upload_dataset": "POST /admin/upload-dataset",
            "model_stats": "GET /admin/model-stats"
        }
    }

@app.post("/ride/request", response_model=RideResponse)
async def request_ride(ride_request: RideRequest):
    """Request a ride with ML-powered matching and pricing"""
    
    available_drivers = [d for d in drivers_db.values() if d.available and d.ev_battery > 20]
    
    if not available_drivers:
        raise HTTPException(status_code=404, detail="No available drivers found")
    
    # Find nearest driver using trained model
    pickup_coords = (ride_request.pickup.latitude, ride_request.pickup.longitude)
    selected_driver, driver_distance = model_manager.find_nearest_driver(
        ride_request.pickup.latitude,
        ride_request.pickup.longitude,
        available_drivers
    )
    
    if selected_driver is None:
        raise HTTPException(status_code=404, detail="Could not match driver")
    
    # Calculate trip distance
    trip_distance = calculate_distance(ride_request.pickup, ride_request.dropoff)
    
    # Predict fare using trained Random Forest model
    current_hour = datetime.now().hour
    current_day = datetime.now().weekday()
    traffic_factor = get_traffic_factor()
    
    estimated_fare = model_manager.predict_fare(
        distance=trip_distance,
        hour=current_hour,
        day_of_week=current_day,
        battery_level=selected_driver.ev_battery,
        traffic_factor=traffic_factor
    )
    
    # Optimize route
    optimized_route = optimize_route(ride_request.pickup, ride_request.dropoff)
    
    # Estimate time
    estimated_time = (trip_distance / 30) * 60
    
    # Create ride
    ride_id = f"RIDE_{len(rides_db) + 1}_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    ride_data = {
        "ride_id": ride_id,
        "user_id": ride_request.user_id,
        "driver_id": selected_driver.driver_id,
        "pickup": ride_request.pickup,
        "dropoff": ride_request.dropoff,
        "fare": estimated_fare,
        "distance": trip_distance,
        "driver_distance": driver_distance,
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    rides_db[ride_id] = ride_data
    
    # Mark driver as busy
    drivers_db[selected_driver.driver_id].available = False
    
    return RideResponse(
        ride_id=ride_id,
        driver=selected_driver,
        estimated_fare=round(estimated_fare, 2),
        estimated_distance=round(trip_distance, 2),
        estimated_time=round(estimated_time, 2),
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
    
    return {"message": "Ride accepted", "ride_id": ride_id}

@app.get("/ride/{ride_id}")
async def get_ride(ride_id: str):
    """Get ride details"""
    if ride_id not in rides_db:
        raise HTTPException(status_code=404, detail="Ride not found")
    return rides_db[ride_id]

@app.get("/drivers/available")
async def get_available_drivers():
    """Get available drivers"""
    available = [d for d in drivers_db.values() if d.available]
    return {"count": len(available), "drivers": available}

@app.post("/driver/complete-ride/{ride_id}")
async def complete_ride(ride_id: str):
    """Complete ride and free driver"""
    if ride_id not in rides_db:
        raise HTTPException(status_code=404, detail="Ride not found")
    
    ride = rides_db[ride_id]
    ride["status"] = "completed"
    ride["completed_at"] = datetime.now().isoformat()
    
    drivers_db[ride["driver_id"]].available = True
    
    return {"message": "Ride completed", "fare": ride["fare"]}

@app.post("/admin/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload new dataset and retrain models"""
    try:
        # Save uploaded file
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        return {
            "message": "Dataset uploaded successfully",
            "filename": file.filename,
            "note": "Run training script to retrain models"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/admin/model-stats")
async def model_stats():
    """Get model statistics"""
    return {
        "models_loaded": model_manager.models_loaded,
        "fare_model_available": model_manager.fare_model is not None,
        "driver_matcher_available": model_manager.driver_matcher is not None,
        "total_rides": len(rides_db),
        "available_drivers": len([d for d in drivers_db.values() if d.available])
    }

# Run with: uvicorn main_integrated:app --reload --port 8000