# Dataset Integration & ML Training Module for EV Ride Dataset
# Optimized for your specific dataset columns

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
    
    def __init__(self, file_path):
        self.file_path = file_path
        self.df = None
        self.label_encoders = {}
        
    def load_data(self):
        """Load dataset from file"""
        file_ext = os.path.splitext(self.file_path)[1].lower()
        
        try:
            if file_ext == '.csv':
                self.df = pd.read_csv(self.file_path)
            elif file_ext in ['.xlsx', '.xls']:
                self.df = pd.read_excel(self.file_path)
            elif file_ext == '.json':
                self.df = pd.read_json(self.file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_ext}")
            
            print(f"✅ Dataset loaded successfully!")
            print(f"📊 Shape: {self.df.shape}")
            print(f"📋 Columns: {list(self.df.columns)}")
            return self.df
            
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            return None
    
    def preprocess_data(self):
        """Preprocess and clean data"""
        if self.df is None:
            print("❌ No dataset loaded. Call load_data() first.")
            return None
        
        print("\n" + "="*60)
        print("DATA PREPROCESSING")
        print("="*60)
        
        # Convert column names to lowercase
        self.df.columns = self.df.columns.str.lower().str.strip()
        
        # Handle missing values
        print(f"\n📊 Missing values:")
        missing = self.df.isnull().sum()
        if missing.sum() > 0:
            print(missing[missing > 0])
            # Fill numerical columns with median
            num_cols = self.df.select_dtypes(include=[np.number]).columns
            self.df[num_cols] = self.df[num_cols].fillna(self.df[num_cols].median())
            # Fill categorical with mode
            cat_cols = self.df.select_dtypes(include=['object']).columns
            for col in cat_cols:
                self.df[col].fillna(self.df[col].mode()[0], inplace=True)
        else:
            print("No missing values found!")
        
        # Remove outliers
        print(f"\n🧹 Removing outliers...")
        initial_rows = len(self.df)
        
        # Remove invalid distances
        self.df = self.df[self.df['distance_km'] > 0]
        self.df = self.df[self.df['distance_km'] < 200]
        
        # Remove invalid fares
        self.df = self.df[self.df['fare_amount_inr'] > 0]
        self.df = self.df[self.df['fare_amount_inr'] < 10000]
        
        # Remove invalid durations
        self.df = self.df[self.df['duration_minutes'] > 0]
        self.df = self.df[self.df['duration_minutes'] < 300]
        
        removed = initial_rows - len(self.df)
        print(f"   Removed {removed} outlier rows ({removed/initial_rows*100:.2f}%)")
        print(f"   Final shape: {self.df.shape}")
        
        return self.df
    
    def encode_categorical(self):
        """Encode categorical variables"""
        if self.df is None:
            return None
        
        print("\n" + "="*60)
        print("ENCODING CATEGORICAL FEATURES")
        print("="*60)
        
        categorical_cols = ['city', 'traffic_level', 'vehicle_type', 
                           'time_of_day', 'weather_condition', 'user_type']
        
        for col in categorical_cols:
            if col in self.df.columns:
                le = LabelEncoder()
                self.df[f'{col}_encoded'] = le.fit_transform(self.df[col].astype(str))
                self.label_encoders[col] = le
                print(f"   ✅ {col}: {len(le.classes_)} unique values")
        
        # Special handling for day_of_week if it's text
        if 'day_of_week' in self.df.columns:
            # Check if it's text (like Monday, Tuesday)
            if self.df['day_of_week'].dtype == 'object':
                day_mapping = {
                    'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 
                    'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6
                }
                self.df['day_of_week'] = self.df['day_of_week'].map(day_mapping)
                print(f"   ✅ day_of_week: Converted text to numeric (0-6)")
        
        # Special handling for traffic_level if it's already numeric
        if 'traffic_level' in self.df.columns:
            # Check if traffic_level is already numeric
            if pd.api.types.is_numeric_dtype(self.df['traffic_level']):
                # If numeric (0-100), use it directly as encoded
                self.df['traffic_level_encoded'] = self.df['traffic_level']
                print(f"   ✅ traffic_level: Using numeric values (0-100)")
        
        return self.df
    
    def get_summary(self):
        """Get dataset summary"""
        if self.df is None:
            return None
        
        print("\n" + "="*60)
        print("DATASET SUMMARY")
        print("="*60)
        print(f"Total Records: {len(self.df)}")
        print(f"\n📊 Numerical Statistics:")
        print(self.df.describe())
        
        print(f"\n📋 Categorical Distribution:")
        cat_cols = ['city', 'traffic_level', 'vehicle_type', 'time_of_day', 'weather_condition']
        for col in cat_cols:
            if col in self.df.columns:
                print(f"\n{col}:")
                print(self.df[col].value_counts().head())
        
        print(f"\n💰 Fare Statistics:")
        print(f"   Mean Fare: ₹{self.df['fare_amount_inr'].mean():.2f}")
        print(f"   Median Fare: ₹{self.df['fare_amount_inr'].median():.2f}")
        print(f"   Min Fare: ₹{self.df['fare_amount_inr'].min():.2f}")
        print(f"   Max Fare: ₹{self.df['fare_amount_inr'].max():.2f}")
        
        return self.df.describe()


class EnhancedFarePredictor:
    """Enhanced Random Forest model for fare prediction"""
    
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=200,
            max_depth=20,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.feature_columns = None
        self.is_fitted = False
        
    def prepare_features(self, df):
        """Prepare features for training"""
        # Select relevant features from your dataset
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
        
        # Check if all features available
        available_features = [col for col in feature_cols if col in df.columns]
        
        if len(available_features) < 5:
            print(f"❌ Not enough features. Available: {available_features}")
            return None, None
        
        self.feature_columns = available_features
        X = df[self.feature_columns].copy()
        
        # Ensure all columns are numeric
        for col in X.columns:
            if X[col].dtype == 'object':
                print(f"⚠️ Converting {col} to numeric")
                X[col] = pd.to_numeric(X[col], errors='coerce')
        
        # Handle any remaining missing values
        if X.isnull().any().any():
            print(f"⚠️ Filling {X.isnull().sum().sum()} missing values with median")
            X.fillna(X.median(numeric_only=True), inplace=True)
        
        # Target variable
        y = df['fare_amount_inr']
        
        return X, y
    
    def train(self, df, test_size=0.2):
        """Train the fare prediction model"""
        print("\n" + "="*60)
        print("TRAINING ENHANCED FARE PREDICTION MODEL")
        print("="*60)
        
        X, y = self.prepare_features(df)
        
        if X is None or y is None:
            return False
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, shuffle=True
        )
        
        print(f"\n📊 Data Split:")
        print(f"   Training set: {len(X_train)} samples")
        print(f"   Test set: {len(X_test)} samples")
        print(f"   Features used: {len(self.feature_columns)}")
        
        # Scale features
        print(f"\n🔄 Scaling features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        print(f"🔄 Training Random Forest model...")
        self.model.fit(X_train_scaled, y_train)
        self.is_fitted = True
        
        # Evaluate
        train_pred = self.model.predict(X_train_scaled)
        test_pred = self.model.predict(X_test_scaled)
        
        train_mae = mean_absolute_error(y_train, train_pred)
        test_mae = mean_absolute_error(y_test, test_pred)
        train_rmse = np.sqrt(mean_squared_error(y_train, train_pred))
        test_rmse = np.sqrt(mean_squared_error(y_test, test_pred))
        train_r2 = r2_score(y_train, train_pred)
        test_r2 = r2_score(y_test, test_pred)
        
        print(f"\n" + "="*60)
        print("MODEL PERFORMANCE")
        print("="*60)
        print(f"📊 Training Metrics:")
        print(f"   MAE:  ₹{train_mae:.2f}")
        print(f"   RMSE: ₹{train_rmse:.2f}")
        print(f"   R²:   {train_r2:.4f}")
        
        print(f"\n📊 Testing Metrics:")
        print(f"   MAE:  ₹{test_mae:.2f}")
        print(f"   RMSE: ₹{test_rmse:.2f}")
        print(f"   R²:   {test_r2:.4f}")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n📈 Top 10 Feature Importance:")
        print(feature_importance.head(10).to_string(index=False))
        
        # Prediction accuracy analysis
        errors = np.abs(test_pred - y_test)
        print(f"\n🎯 Prediction Accuracy:")
        print(f"   Mean Error: ₹{errors.mean():.2f}")
        print(f"   Median Error: ₹{errors.median():.2f}")
        print(f"   95% Predictions within: ₹{np.percentile(errors, 95):.2f}")
        
        return True
    
    def predict(self, features_dict):
        """Predict fare for new ride"""
        if not self.is_fitted:
            print("❌ Model not fitted. Train the model first.")
            return None
        
        # Create feature array in correct order
        features_array = np.array([[features_dict.get(col, 0) for col in self.feature_columns]])
        features_scaled = self.scaler.transform(features_array)
        
        return self.model.predict(features_scaled)[0]
    
    def save_model(self, filename='models/fare_model_enhanced.pkl'):
        """Save trained model"""
        os.makedirs(os.path.dirname(filename), exist_ok=True)
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_columns': self.feature_columns,
            'is_fitted': self.is_fitted
        }
        joblib.dump(model_data, filename)
        print(f"✅ Model saved to {filename}")
    
    def load_model(self, filename='models/fare_model_enhanced.pkl'):
        """Load trained model"""
        model_data = joblib.load(filename)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_columns = model_data['feature_columns']
        self.is_fitted = model_data['is_fitted']
        print(f"✅ Model loaded from {filename}")


# ==============================================
# MAIN TRAINING PIPELINE
# ==============================================

def train_models_from_dataset(dataset_path):
    """Complete training pipeline for EV ride dataset"""
    
    print("\n" + "="*60)
    print("EV RIDE BOOKING - ML MODEL TRAINING")
    print("Dataset: EV Ride with Enhanced Features")
    print("="*60)
    
    # 1. Load Dataset
    print("\n[1/5] Loading Dataset...")
    loader = EVRideDatasetLoader(dataset_path)
    df = loader.load_data()
    
    if df is None:
        print("\n❌ Failed to load dataset!")
        return None  # Return None instead of unpacking
    
    # 2. Preprocess
    print("\n[2/5] Preprocessing Data...")
    df = loader.preprocess_data()
    
    if df is None or len(df) == 0:
        print("\n❌ No data after preprocessing!")
        return None
    
    # 3. Encode Categorical Variables
    print("\n[3/5] Encoding Categorical Features...")
    df = loader.encode_categorical()
    
    # 4. Get Summary
    print("\n[4/5] Analyzing Dataset...")
    loader.get_summary()
    
    # 5. Train Fare Prediction Model
    print("\n[5/5] Training ML Model...")
    fare_predictor = EnhancedFarePredictor()
    success = fare_predictor.train(df)
    
    if success:
        fare_predictor.save_model('models/fare_model_enhanced.pkl')
        
        # Save label encoders
        joblib.dump(loader.label_encoders, 'models/label_encoders.pkl')
        print("✅ Label encoders saved")
    else:
        print("\n❌ Model training failed!")
        return None
    
    print("\n" + "="*60)
    print("✅ MODEL TRAINING COMPLETED SUCCESSFULLY!")
    print("="*60)
    
    return fare_predictor, loader.label_encoders


# ==============================================
# USAGE EXAMPLE
# ==============================================

if __name__ == "__main__":
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    # Auto-detect CSV files in current directory
    print("\n" + "🔍 "*30)
    print("Searching for CSV files in current directory...")
    print("🔍 "*30)
    
    csv_files = [f for f in os.listdir('.') if f.endswith('.csv')]
    
    if not csv_files:
        print("\n❌ No CSV files found in current directory!")
        print("Please provide the full path to your dataset:")
        dataset_path = input("Enter CSV file path: ").strip()
    elif len(csv_files) == 1:
        dataset_path = csv_files[0]
        print(f"\n✅ Found dataset: {dataset_path}")
    else:
        print(f"\n📁 Found {len(csv_files)} CSV files:")
        for i, file in enumerate(csv_files, 1):
            size = os.path.getsize(file) / (1024*1024)  # MB
            print(f"   {i}. {file} ({size:.2f} MB)")
        
        choice = input("\nSelect file number (or press Enter for file 1): ").strip()
        if choice.isdigit() and 1 <= int(choice) <= len(csv_files):
            dataset_path = csv_files[int(choice) - 1]
        else:
            dataset_path = csv_files[0]
        
        print(f"✅ Selected: {dataset_path}")
    
    # Train models
    print("\n" + "🚀 "*30)
    print("Starting EV Ride ML Training Pipeline")
    print("🚀 "*30)
    
    result = train_models_from_dataset(dataset_path)
    
    if result is None:
        print("\n❌ Training failed! Check the error above.")
        print("\n💡 Common Issues:")
        print("   1. Wrong file path")
        print("   2. File is corrupted or empty")
        print("   3. Missing required columns")
        print("   4. Encoding issues (try utf-8)")
        exit(1)
    
    fare_model, label_encoders = result
    
    # Test prediction
    if fare_model and fare_model.is_fitted:
        print("\n" + "="*60)
        print("TESTING FARE PREDICTION")
        print("="*60)
        
        # Sample test data
        test_features = {
            'distance_km': 10.5,
            'duration_minutes': 25,
            'demand_factor': 1.2,
            'battery_health_percent': 85,
            'energy_consumption_kwh': 2.5,
            'route_difficulty': 3,
            'day_of_week': 4,
            'temperature_celsius': 28,
            'humidity_percent': 65,
            'driver_rating': 4.5,
            'surge_multiplier': 1.5,
            'historical_pricing_factor': 1.1,
            'is_holiday': 0,
            'charging_stations_nearby': 3,
            'city_encoded': 0,
            'traffic_level_encoded': 2,
            'vehicle_type_encoded': 1,
            'time_of_day_encoded': 2,
            'weather_condition_encoded': 0,
            'user_type_encoded': 1
        }
        
        try:
            predicted_fare = fare_model.predict(test_features)
            print(f"\n🎯 Test Prediction:")
            print(f"   Distance: {test_features['distance_km']} km")
            print(f"   Duration: {test_features['duration_minutes']} mins")
            print(f"   Surge: {test_features['surge_multiplier']}x")
            print(f"   Predicted Fare: ₹{predicted_fare:.2f}")
            
            print("\n✅ Model is ready for production use!")
            print("   Use this model in your FastAPI application.")
        except Exception as e:
            print(f"\n⚠️ Prediction test failed: {e}")
            print("   Model saved but test failed. Check feature names.")
    
    print("\n" + "="*60)
    print("Training pipeline completed!")
    print("Files created:")
    print("   - models/fare_model_enhanced.pkl")
    print("   - models/label_encoders.pkl")
    print("\nNext step: Run FastAPI server")
    print("   uvicorn main_enhanced:app --reload")
    print("="*60)