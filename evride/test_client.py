import requests
import json
import time

BASE_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + 70)
    print(f"  {title}")
    print(70)

def test_enhanced_api():
    """Test all API endpoints with enhanced features"""
    
    print("\n" + 35)
    print("EV RIDE BOOKING PLATFORM - ENHANCED TEST CLIENT")
    print(35)
    
    # 1. Check system status
    print_section("1. CHECKING SYSTEM STATUS")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f" Status: {response.status_code}")
        data = response.json()
        print(f" System Info:")
        print(f"   Status: {data.get('status')}")
        print(f"   Models Loaded: {data.get('models_loaded')}")
        print(f"   Features: {', '.join(data.get('features', []))}")
    except Exception as e:
        print(f" Error: {e}")
        return
    
    # 2. Check available drivers
    print_section("2. AVAILABLE DRIVERS")
    response = requests.get(f"{BASE_URL}/drivers/available")
    drivers_data = response.json()
    print(f" Available Drivers: {drivers_data['count']}")
    for i, driver in enumerate(drivers_data['drivers'][:3], 1):
        print(f"   {i}. {driver['name']} - {driver['vehicle_type']} - "
              f"Battery: {driver['ev_battery']}% - Rating: {driver['driver_rating']}")
    
    # 3. Request rides with different scenarios
    test_scenarios = [
        {
            "name": "Peak Hour Ride (High Surge)",
            "request": {
                "user_id": "USER001",
                "pickup": {"latitude": 28.6139, "longitude": 77.2090},
                "dropoff": {"latitude": 28.6500, "longitude": 77.2300},
                "city": "Delhi",
                "vehicle_type": "sedan",
                "user_type": "premium",
                "time_of_day": "evening"
            }
        },
        {
            "name": "Short Distance Economy Ride",
            "request": {
                "user_id": "USER002",
                "pickup": {"latitude": 28.6300, "longitude": 77.2200},
                "dropoff": {"latitude": 28.6350, "longitude": 77.2250},
                "city": "Delhi",
                "vehicle_type": "hatchback",
                "user_type": "regular"
            }
        },
        {
            "name": "Long Distance SUV Ride",
            "request": {
                "user_id": "USER003",
                "pickup": {"latitude": 28.5900, "longitude": 77.1900},
                "dropoff": {"latitude": 28.7000, "longitude": 77.3000},
                "city": "Delhi",
                "vehicle_type": "suv",
                "user_type": "premium"
            }
        }
    ]
    
    rides_created = []
    
    for idx, scenario in enumerate(test_scenarios, 1):
        print_section(f"3.{idx} REQUESTING RIDE: {scenario['name']}")
        
        try:
            response = requests.post(
                f"{BASE_URL}/ride/request",
                json=scenario['request']
            )
            
            if response.status_code == 200:
                ride_data = response.json()
                rides_created.append(ride_data)
                
                print(f" Ride Requested Successfully!")
                print(f"\n Ride Details:")
                print(f"   Ride ID: {ride_data['ride_id']}")
                print(f"   Driver: {ride_data['driver']['name']}")
                print(f"   Vehicle: {ride_data['driver']['vehicle_type']}")
                print(f"   Driver Rating: {ride_data['driver']['driver_rating']}")
                print(f"\n Pricing Breakdown:")
                print(f"   Base Fare: ₹{ride_data['base_fare']}")
                print(f"   Surge Multiplier: {ride_data['surge_multiplier']}x")
                print(f"   Total Fare: ₹{ride_data['estimated_fare']}")
                print(f"   Demand Factor: {ride_data['demand_factor']}")
                
                print(f"\n Trip Information:")
                print(f"   Distance: {ride_data['estimated_distance']} km")
                print(f"   Estimated Time: {ride_data['estimated_time']} minutes")
                print(f"   Route Points: {len(ride_data['optimized_route'])}")
                
                time.sleep(1)  # Simulate time between rides
            else:
                print(f" Request failed: {response.status_code}")
                print(f"   {response.json()}")
                
        except Exception as e:
            print(f" Error: {e}")
    
    # 4. Accept rides
    print_section("4. ACCEPTING RIDES")
    for i, ride in enumerate(rides_created[:2], 1):  # Accept first 2 rides
        try:
            response = requests.post(
                f"{BASE_URL}/ride/accept",
                params={
                    "ride_id": ride['ride_id'],
                    "driver_id": ride['driver']['driver_id']
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n Ride {i} Accepted:")
                print(f"   Ride ID: {result['ride_id']}")
                print(f"   Fare: ₹{result['fare']}")
            else:
                print(f" Accept failed: {response.json()}")
                
        except Exception as e:
            print(f" Error: {e}")
    
    # 5. Get ride details
    if rides_created:
        print_section("5. FETCHING RIDE DETAILS")
        ride_id = rides_created[0]['ride_id']
        
        try:
            response = requests.get(f"{BASE_URL}/ride/{ride_id}")
            if response.status_code == 200:
                ride = response.json()
                print(f"\n Ride Details for {ride_id}:")
                print(json.dumps(ride, indent=2))
            else:
                print(f" Failed to fetch ride: {response.json()}")
        except Exception as e:
            print(f" Error: {e}")
    
    # 6. Complete rides
    print_section("6. COMPLETING RIDES")
    for i, ride in enumerate(rides_created[:2], 1):
        try:
            response = requests.post(
                f"{BASE_URL}/ride/complete/{ride['ride_id']}"
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"\n Ride {i} Completed:")
                print(f"   Ride ID: {result['ride_id']}")
                print(f"   Final Fare: ₹{result['fare']}")
                print(f"   Distance: {result['distance']} km")
            else:
                print(f" Complete failed: {response.json()}")
                
        except Exception as e:
            print(f"Error: {e}")
    
    # 7. Get system statistics
    print_section("7. SYSTEM STATISTICS")
    try:
        response = requests.get(f"{BASE_URL}/admin/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"\n Platform Statistics:")
            print(f"   Models Loaded: {stats['models_loaded']}")
            print(f"   Total Rides: {stats['total_rides']}")
            print(f"   Completed Rides: {stats['completed_rides']}")
            print(f"   Pending Rides: {stats['pending_rides']}")
            print(f"   Available Drivers: {stats['available_drivers']}")
            print(f"   Average Fare: ₹{stats['average_fare']}")
            print(f"   Average Distance: {stats['average_distance']} km")
        else:
            print(f" Failed to fetch stats: {response.json()}")
    except Exception as e:
        print(f" Error: {e}")
    
    # 8. Fare comparison analysis
    if len(rides_created) >= 2:
        print_section("8. FARE COMPARISON ANALYSIS")
        print("\n Comparing Different Ride Types:\n")
        
        for ride in rides_created:
            fare_per_km = ride['estimated_fare'] / ride['estimated_distance']
            print(f" {ride['driver']['vehicle_type'].upper()}")
            print(f"   Distance: {ride['estimated_distance']} km")
            print(f"   Base Fare: ₹{ride['base_fare']}")
            print(f"   Surge: {ride['surge_multiplier']}x")
            print(f"   Total: ₹{ride['estimated_fare']}")
            print(f"   Per KM: ₹{fare_per_km:.2f}")
            print(f"   Demand: {ride['demand_factor']}")
            print()
    
    print_section("TEST COMPLETED SUCCESSFULLY! ")
    print("\n Key Observations:")
    print("   • ML model provides dynamic fare prediction")
    print("   • Surge pricing adjusts based on demand and traffic")
    print("   • Driver matching considers vehicle type and battery")
    print("   • Route optimization provides waypoints")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    try:
        test_enhanced_api()
    except requests.exceptions.ConnectionError:
        print("\n ERROR: Cannot connect to API!")
        print("   Make sure the server is running:")
        print("   uvicorn main_enhanced:app --reload --port 8000")
    except Exception as e:
        print(f"\n UNEXPECTED ERROR: {e}")