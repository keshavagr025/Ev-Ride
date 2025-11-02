from utils.preprocess import load_and_preprocess_data
from models.fare_prediction_model import train_fare_model

if _name_ == "_main_":
    X_train_fare, X_test_fare, y_train_fare, y_test_fare, _, _, _, _ = load_and_preprocess_data("ml/data/data.csv")
    train_fare_model(X_train_fare, X_test_fare, y_train_fare, y_test_fare, "ml/models/fare_prediction_model.pkl")
from utils.preprocess import load_and_preprocess_data
from models.distance_optimization_model import train_distance_model

if _name_ == "_main_":
    _, _, _, _, X_train_dist, X_test_dist, y_train_dist, y_test_dist = load_and_preprocess_data("ml/data/data.csv")
    train_distance_model(X_train_dist, X_test_dist, y_train_dist, y_test_dist, "ml/models/distance_optimization_model.pkl")