import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

def load_and_preprocess_data(path):
    df = pd.read_csv(path)

    # Drop rows with missing values
    df.dropna(inplace=True)

    # Basic feature selection (example — modify as per your dataset)
    X = df[['distance', 'duration', 'pickup_longitude', 'pickup_latitude', 'dropoff_longitude', 'dropoff_latitude']]
    y_fare = df['fare_amount']
    y_distance = df['distance']

    # Split for training and testing
    X_train_fare, X_test_fare, y_train_fare, y_test_fare = train_test_split(X, y_fare, test_size=0.2, random_state=42)
    X_train_dist, X_test_dist, y_train_dist, y_test_dist = train_test_split(X, y_distance, test_size=0.2, random_state=42)

    # Scale features
    scaler = StandardScaler()
    X_train_fare = scaler.fit_transform(X_train_fare)
    X_test_fare = scaler.transform(X_test_fare)
    X_train_dist = scaler.fit_transform(X_train_dist)
    X_test_dist = scaler.transform(X_test_dist)

    return X_train_fare, X_test_fare, y_train_fare, y_test_fare, X_train_dist, X_test_dist, y_train_dist, y_test_dist
