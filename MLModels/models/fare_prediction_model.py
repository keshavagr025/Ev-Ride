from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

def train_fare_model(X_train, X_test, y_train, y_test, save_path):
    print("Training Random Forest model for fare prediction...")

    model = RandomForestRegressor(n_estimators=200, random_state=42)
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    print(f" Model trained successfully! MAE: {mae:.2f}, R²: {r2:.2f}")
    joblib.dump(model, save_path)
    print(f" Model saved at: {save_path}")