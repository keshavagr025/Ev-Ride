from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import numpy as np
import joblib

def train_distance_model(X_train, X_test, y_train, y_test, save_path):
    print("Training Hybrid (Random Forest + KNN) model for distance optimization...")

    rf = RandomForestRegressor(n_estimators=150, random_state=42)
    knn = KNeighborsRegressor(n_neighbors=5)

    rf.fit(X_train, y_train)
    knn.fit(X_train, y_train)

    # Hybrid prediction: average of RF + KNN
    rf_preds = rf.predict(X_test)
    knn_preds = knn.predict(X_test)
    hybrid_preds = (rf_preds + knn_preds) / 2

    mae = mean_absolute_error(y_test, hybrid_preds)
    r2 = r2_score(y_test, hybrid_preds)

    print(f"Hybrid model trained successfully! MAE: {mae:.2f}, R²: {r2:.2f}")

    hybrid_model = {"rf": rf, "knn": knn}
    joblib.dump(hybrid_model, save_path)
    print(f"Model saved at: {save_path}")