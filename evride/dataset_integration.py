# EV Ride Dataset Integration & ML Training Module
# Optimized for real-world ride data (your_ride_data.csv)

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class EVRideDatasetLoader:
    """Load and preprocess EV ride dataset"""
    
    def _init_(self, file_path='your_ride_data.csv'):
        self.file_path = file_path
        self.df = None
        self.label_encoders = {}
        
    def load_data(self):
        """Load dataset from CSV file"""
        try:
            print(f"📂 Loading dataset: {self.file_path}")
            self.df = pd.read_csv(self.file_path, encoding='utf-8')
            
            print(f"✅ Dataset loaded successfully!")
            print(f"📊 Shape: {self.df.shape[0]} rows × {self.df.shape[1]} columns")
            print(f"📋 Columns: {list(self.df.columns)}")
            print(f"💾 Memory usage: {self.df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
            
            return self.df
            
        except FileNotFoundError:
            print(f"❌ File not found: {self.file_path}")
            print("💡 Make sure 'your_ride_data.csv' is in the same directory")
            return None
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            return None
    
    def preprocess_data(self):
        """Preprocess and clean data for real-world scenarios"""
        if self.df is None:
            print("❌ No dataset loaded. Call load_data() first.")
            return None
        
        print("\n" + "="*70)
        print("🧹 DATA PREPROCESSING & CLEANING")
        print("="*70)
        
        # Convert column names to lowercase and remove whitespace
        self.df.columns = self.df.columns.str.lower().str.strip()
        
        # Handle missing values
        print(f"\n📊 Checking for missing values...")
        missing = self.df.isnull().sum()
        if missing.sum() > 0:
            print("⚠  Missing values found:")
            for col, count in missing[missing > 0].items():
                print(f"   {col}: {count} ({count/len(self.df)*100:.2f}%)")
            
            # Fill numerical columns with median
            num_cols = self.df.select_dtypes(include=[np.number]).columns
            for col in num_cols:
                if self.df[col].isnull().any():
                    self.df[col].fillna(self.df[col].median(), inplace=True)
            
            # Fill categorical with mode
            cat_cols = self.df.select_dtypes(include=['object']).columns
            for col in cat_cols:
                if self.df[col].isnull().any():
                    self.df[col].fillna(self.df[col].mode()[0], inplace=True)
            
            print("✅ Missing values handled!")
        else:
            print("✅ No missing values found!")
        
        # Remove outliers and invalid data
        print(f"\n🧹 Removing outliers and invalid data...")
        initial_rows = len(self.df)
        
        # Remove invalid distances (realistic range: 0.5 to 200 km)
        if 'distance_km' in self.df.columns:
            self.df = self.df[(self.df['distance_km'] >= 0.5) & (self.df['distance_km'] <= 200)]
        
        # Remove invalid fares (realistic range: ₹10 to ₹10000)
        if 'fare_amount_inr' in self.df.columns:
            self.df = self.df[(self.df['fare_amount_inr'] >= 10) & (self.df['fare_amount_inr'] <= 10000)]
        
        # Remove invalid durations (realistic range: 5 to 300 minutes)
        if 'duration_minutes' in self.df.columns:
            self.df = self.df[(self.df['duration_minutes'] >= 5) & (self.df['duration_minutes'] <= 300)]
        
        # Remove invalid battery health (0-100%)
        if 'battery_health_percent' in self.df.columns:
            self.df = self.df[(self.df['battery_health_percent'] >= 50) & (self.df['battery_health_percent'] <= 100)]
        
        # Remove invalid ratings (1-5 scale)
        if 'driver_rating' in self.df.columns:
            self.df = self.df[(self.df['driver_rating'] >= 1) & (self.df['driver_rating'] <= 5)]
        
        removed = initial_rows - len(self.df)
        print(f"   ⚠  Removed {removed} outlier rows ({removed/initial_rows*100:.2f}%)")
        print(f"   ✅ Clean dataset: {self.df.shape[0]} rows × {self.df.shape[1]} columns")
        
        return self.df
    
    def encode_categorical(self):
        """Encode categorical variables for ML"""
        if self.df is None:
            return None
        
        print("\n" + "="*70)
        print("🔢 ENCODING CATEGORICAL FEATURES")
        print("="*70)
        
        categorical_cols = ['city', 'traffic_level', 'vehicle_type', 
                           'time_of_day', 'weather_condition', 'user_type']
        
        for col in categorical_cols:
            if col in self.df.columns:
                le = LabelEncoder()
                self.df[f'{col}_encoded'] = le.fit_transform(self.df[col].astype(str))
                self.label_encoders[col] = le
                unique_values = len(le.classes_)
                print(f"   ✅ {col}: {unique_values} categories → {list(le.classes_[:3])}{'...' if unique_values > 3 else ''}")
        
        # Handle day_of_week if it's text
        if 'day_of_week' in self.df.columns:
            if self.df['day_of_week'].dtype == 'object':
                day_mapping = {
                    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 
                    'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6,
                    'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4, 'Sat': 5, 'Sun': 6
                }
                self.df['day_of_week'] = self.df['day_of_week'].map(day_mapping).fillna(0)
                print(f"   ✅ day_of_week: Converted to numeric (0-6)")
        
        return self.df
    
    def get_summary(self):
        """Get comprehensive dataset summary"""
        if self.df is None:
            return None
        
        print("\n" + "="*70)
        print("📊 DATASET SUMMARY & STATISTICS")
        print("="*70)
        print(f"Total Records: {len(self.df):,}")
        print(f"Time Period: {self.df.index[0]} to {self.df.index[-1]}")
        
        print(f"\n📈 NUMERICAL FEATURES STATISTICS:")
        print("-" * 70)
        numerical_stats = self.df.describe()
        print(numerical_stats.to_string())
        
        print(f"\n📋 CATEGORICAL FEATURES DISTRIBUTION:")
        print("-" * 70)
        cat_cols = ['city', 'vehicle_type', 'time_of_day', 'weather_condition', 'user_type']
        for col in cat_cols:
            if col in self.df.columns:
                print(f"\n🔹 {col.upper()}:")
                value_counts = self.df[col].value_counts().head(5)
                for value, count in value_counts.items():
                    percentage = (count / len(self.df)) * 100
                    print(f"   {value}: {count:,} ({percentage:.1f}%)")
        
        print(f"\n💰 FARE ANALYSIS:")
        print("-" * 70)
        if 'fare_amount_inr' in self.df.columns:
            print(f"   Average Fare:    ₹{self.df['fare_amount_inr'].mean():.2f}")
            print(f"   Median Fare:     ₹{self.df['fare_amount_inr'].median():.2f}")
            print(f"   Min Fare:        ₹{self.df['fare_amount_inr'].min():.2f}")
            print(f"   Max Fare:        ₹{self.df['fare_amount_inr'].max():.2f}")
            print(f"   Std Deviation:   ₹{self.df['fare_amount_inr'].std():.2f}")
        
        print(f"\n🚗 RIDE ANALYSIS:")
        print("-" * 70)
        if 'distance_km' in self.df.columns:
            print(f"   Average Distance: {self.df['distance_km'].mean():.2f} km")
            print(f"   Total Distance:   {self.df['distance_km'].sum():,.2f} km")
        if 'duration_minutes' in self.df.columns:
            print(f"   Average Duration: {self.df['duration_minutes'].mean():.2f} mins")
            print(f"   Total Duration:   {self.df['duration_minutes'].sum():,.0f} mins")
        
        return self.df.describe()


class EnhancedFarePredictor:
    """Production-ready Random Forest model for fare prediction"""
    
    def _init_(self):
        self.model = RandomForestRegressor(
            n_estimators=200,        # More trees for better accuracy
            max_depth=20,            # Prevent overfitting
            min_samples_split=5,     # Require 5 samples to split
            min_samples_leaf=2,      # Require 2 samples in leaf
            max_features='sqrt',     # Use sqrt of features
            random_state=42,
            n_jobs=-1,               # Use all CPU cores
            verbose=0
        )
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.is_fitted = False
        
    def prepare_features(self, df):
        """Prepare features for training"""
        # All possible features from your dataset
        feature_cols = [
            'distance_km',
            'duration_minutes',
            'demand_factor',
            'battery_health_percent',
            'energy_consumption_kwh',
            'route_difficulty',
            'day_of_week',
            'temperature_celsius',
            'humidity_percent',
            'driver_rating',
            'surge_multiplier',
            'historical_pricing_factor',
            'is_holiday',
            'charging_stations_nearby',
            # Encoded categorical features
            'city_encoded',
            'traffic_level_encoded',
            'vehicle_type_encoded',
            'time_of_day_encoded',
            'weather_condition_encoded',
            'user_type_encoded'
        ]
        
        # Select only available features
        available_features = [col for col in feature_cols if col in df.columns]
        
        if len(available_features) < 3:
            print(f"❌ Insufficient features. Found: {available_features}")
            return None, None
        
        self.feature_columns = available_features
        X = df[self.feature_columns].copy()
        
        # Ensure all columns are numeric
        for col in X.columns:
            if X[col].dtype == 'object':
                X[col] = pd.to_numeric(X[col], errors='coerce')
        
        # Handle any remaining NaN
        if X.isnull().any().any():
            X.fillna(X.median(), inplace=True)
        
        y = df['fare_amount_inr']
        
        return X, y
    
    def train(self, df, test_size=0.2):
        """Train the ML model with progress tracking"""
        print("\n" + "="*70)
        print("🚀 TRAINING ENHANCED FARE PREDICTION MODEL")
        print("="*70)
        
        X, y = self.prepare_features(df)
        
        if X is None or y is None:
            return False
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, shuffle=True
        )
        
        print(f"\n📊 Training Configuration:")
        print(f"   Training samples:   {len(X_train):,}")
        print(f"   Testing samples:    {len(X_test):,}")
        print(f"   Features used:      {len(self.feature_columns)}")
        print(f"   Test split:         {test_size*100:.0f}%")
        
        # Scale features
        print(f"\n⚙  Scaling features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        print(f"🔄 Training Random Forest (200 trees)...")
        print(f"   This may take 30-60 seconds...")
        self.model.fit(X_train_scaled, y_train)
        self.is_fitted = True
        print(f"✅ Model training completed!")
        
        # Evaluate
        train_pred = self.model.predict(X_train_scaled)
        test_pred = self.model.predict(X_test_scaled)
        
        train_mae = mean_absolute_error(y_train, train_pred)
        test_mae = mean_absolute_error(y_test, test_pred)
        train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
        test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
        train_r2 = r2_score(y_train, train_pred)
        test_r2 = r2_score(y_test, test_pred)
        
        print(f"\n" + "="*70)
        print("📊 MODEL PERFORMANCE METRICS")
        print("="*70)
        
        print(f"\n🎯 TRAINING SET PERFORMANCE:")
        print(f"   Mean Absolute Error (MAE):  ₹{train_mae:.2f}")
        print(f"   Root Mean Squared Error:    ₹{train_rmse:.2f}")
        print(f"   R² Score:                   {train_r2:.4f} ({train_r2*100:.2f}%)")
        
        print(f"\n🎯 TESTING SET PERFORMANCE:")
        print(f"   Mean Absolute Error (MAE):  ₹{test_mae:.2f}")
        print(f"   Root Mean Squared Error:    ₹{test_rmse:.2f}")
        print(f"   R² Score:                   {test_r2:.4f} ({test_r2*100:.2f}%)")
        
        # Overfitting check
        overfit_score = (train_r2 - test_r2) / train_r2 * 100
        print(f"\n🔍 Overfitting Check:")
        if overfit_score < 10:
            print(f"   ✅ Model is well-balanced ({overfit_score:.2f}% difference)")
        elif overfit_score < 20:
            print(f"   ⚠  Slight overfitting detected ({overfit_score:.2f}% difference)")
        else:
            print(f"   ❌ High overfitting detected ({overfit_score:.2f}% difference)")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n📈 TOP 10 MOST IMPORTANT FEATURES:")
        print("-" * 70)
        for idx, row in feature_importance.head(10).iterrows():
            bar = '█' * int(row['importance'] * 50)
            print(f"   {row['feature']:30s} {bar} {row['importance']:.4f}")
        
        # Prediction accuracy analysis
        errors = np.abs(test_pred - y_test)
        print(f"\n🎯 PREDICTION ACCURACY ANALYSIS:")
        print("-" * 70)
        print(f"   Mean Error:           ₹{errors.mean():.2f}")
        print(f"   Median Error:         ₹{errors.median():.2f}")
        print(f"   90% within:           ₹{np.percentile(errors, 90):.2f}")
        print(f"   95% within:           ₹{np.percentile(errors, 95):.2f}")
        print(f"   Max Error:            ₹{errors.max():.2f}")
        
        return True
    
    def predict(self, features_dict):
        """Predict fare for new ride"""
        if not self.is_fitted:
            print("❌ Model not fitted. Train the model first.")
            return None
        
        features_array = np.array([[features_dict.get(col, 0) for col in self.feature_columns]])
        features_scaled = self.scaler.transform(features_array)
        
        return self.model.predict(features_scaled)[0]
    
    def save_model(self, filename='models/fare_model_enhanced.pkl'):
        """Save trained model to disk"""
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'is_fitted': self.is_fitted,
            'training_date': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        joblib.dump(model_data, filename)
        file_size = os.path.getsize(filename) / 1024  # KB
        print(f"✅ Model saved: {filename} ({file_size:.2f} KB)")
    
    def load_model(self, filename='models/fare_model_enhanced.pkl'):
        """Load trained model from disk"""
        model_data = joblib.load(filename)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        self.is_fitted = model_data['is_fitted']
        print(f"✅ Model loaded: {filename}")
        if 'training_date' in model_data:
            print(f"   Trained on: {model_data['training_date']}")


# ==============================================
# MAIN TRAINING PIPELINE
# ==============================================

def train_models_from_dataset(dataset_path='your_ride_data.csv'):
    """Complete end-to-end training pipeline"""
    
    print("\n" + "="*70)
    print("🚗 EV RIDE BOOKING - MACHINE LEARNING MODEL TRAINING")
    print("="*70)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📂 Dataset: {dataset_path}")
    print("="*70)
    
    # Step 1: Load Dataset
    print("\n[STEP 1/5] 📥 LOADING DATASET...")
    loader = EVRideDatasetLoader(dataset_path)
    df = loader.load_data()
    
    if df is None:
        print("\n❌ TRAINING FAILED: Could not load dataset!")
        return None
    
    # Step 2: Preprocess
    print("\n[STEP 2/5] 🧹 PREPROCESSING DATA...")
    df = loader.preprocess_data()
    
    if df is None or len(df) == 0:
        print("\n❌ TRAINING FAILED: No data after preprocessing!")
        return None
    
    # Step 3: Encode Categorical
    print("\n[STEP 3/5] 🔢 ENCODING CATEGORICAL FEATURES...")
    df = loader.encode_categorical()
    
    # Step 4: Analyze Dataset
    print("\n[STEP 4/5] 📊 ANALYZING DATASET...")
    loader.get_summary()
    
    # Step 5: Train Model
    print("\n[STEP 5/5] 🚀 TRAINING ML MODEL...")
    fare_predictor = EnhancedFarePredictor()
    success = fare_predictor.train(df, test_size=0.2)
    
    if success:
        # Save model
        fare_predictor.save_model('models/fare_model_enhanced.pkl')
        
        # Save label encoders
        joblib.dump(loader.label_encoders, 'models/label_encoders.pkl')
        print("✅ Label encoders saved: models/label_encoders.pkl")
        
        print("\n" + "="*70)
        print("✅ MODEL TRAINING COMPLETED SUCCESSFULLY!")
        print("="*70)
        print("📦 Trained Files:")
        print("   1. models/fare_model_enhanced.pkl")
        print("   2. models/label_encoders.pkl")
        print("\n🚀 Next Steps:")
        print("   - Use this model in your FastAPI application")
        print("   - Run: uvicorn main_enhanced:app --reload")
        print("="*70)
        
        return fare_predictor, loader.label_encoders
    else:
        print("\n❌ MODEL TRAINING FAILED!")
        return None


# ==============================================
# RUN TRAINING
# ==============================================

if _name_ == "_main_":
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    # Train with your_ride_data.csv
    print("\n" + "🚀 "*35)
    print("STARTING EV RIDE ML TRAINING PIPELINE")
    print("🚀 "*35)
    
    result = train_models_from_dataset('your_ride_data.csv')
    
    if result is None:
        print("\n❌ TRAINING FAILED!")
        print("\n💡 Troubleshooting Tips:")
        print("   1. Ensure 'your_ride_data.csv' exists in the current directory")
        print("   2. Check if CSV has correct columns")
        print("   3. Verify CSV is not corrupted or empty")
        print("   4. Try opening CSV in Excel to verify data")
        exit(1)
    
    fare_model, label_encoders = result
    
    # Test prediction with real-world example
    if fare_model and fare_model.is_fitted:
        print("\n" + "="*70)
        print("🧪 TESTING FARE PREDICTION WITH SAMPLE DATA")
        print("="*70)
        
        # Sample test scenario
        test_features = {
            'distance_km': 12.5,
            'duration_minutes': 30,
            'demand_factor': 1.3,
            'battery_health_percent': 88,
            'energy_consumption_kwh': 3.2,
            'route_difficulty': 4,
            'day_of_week': 5,  # Friday
            'temperature_celsius': 32,
            'humidity_percent': 70,
            'driver_rating': 4.7,
            'surge_multiplier': 1.8,
            'historical_pricing_factor': 1.15,
            'is_holiday': 0,
            'charging_stations_nearby': 5,
            'city_encoded': 0,
            'traffic_level_encoded': 3,  # High traffic
            'vehicle_type_encoded': 1,
            'time_of_day_encoded': 2,    # Evening
            'weather_condition_encoded': 0,
            'user_type_encoded': 1
        }
        
        try:
            predicted_fare = fare_model.predict(test_features)
            
            print(f"\n🎯 TEST SCENARIO:")
            print(f"   📍 Distance:        {test_features['distance_km']} km")
            print(f"   ⏱  Duration:        {test_features['duration_minutes']} minutes")
            print(f"   🔋 Battery Health:  {test_features['battery_health_percent']}%")
            print(f"   📈 Surge Factor:    {test_features['surge_multiplier']}x")
            print(f"   🚦 Traffic Level:   High")
            print(f"   ⭐ Driver Rating:   {test_features['driver_rating']}/5")
            
            print(f"\n💰 PREDICTED FARE: ₹{predicted_fare:.2f}")
            print(f"   (Per km: ₹{predicted_fare/test_features['distance_km']:.2f})")
            
            print("\n✅ MODEL IS READY FOR PRODUCTION!")
            print("   Integration: FastAPI, Flask, or Django")
            
        except Exception as e:
            print(f"\n⚠  Prediction test encountered an issue: {e}")
            print("   Model trained but test failed. Check feature compatibility.")
    
    print("\n" + "="*70)
    print("🎉 TRAINING PIPELINE COMPLETED!")
    print("="*70)
    print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n📚 Ready to integrate with your EV booking system!")
    print("="*70)