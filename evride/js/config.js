// config.js - All configuration and constants

// Python Backend API URL
export const API_BASE_URL = "http://127.0.0.1:8000";

// Vehicle pricing with base rates
export const vehicleRates = {
  'Sedan': 12,
  'SUV': 15, 
  'Hatchback': 10,
  'Premium': 20
};

export const vehicleIcons = {
  'Sedan': '🚗',
  'SUV': '🚙',
  'Hatchback': '🚘',
  'Premium': '🏎️'
};

// City-wise famous locations with coordinates
export const cityLocations = {
  Delhi: {
    "Connaught Place": [28.6315, 77.2167],
    "India Gate": [28.6129, 77.2295],
    "Red Fort": [28.6562, 77.241],
    "Qutub Minar": [28.5244, 77.1855],
    "Lotus Temple": [28.5535, 77.2588],
    "Hauz Khas": [28.5494, 77.1994],
    "Chandni Chowk": [28.6506, 77.2303],
    Saket: [28.5244, 77.2066],
    Rohini: [28.7491, 77.0674],
    Dwarka: [28.5921, 77.046],
  },
  Mumbai: {
    "Gateway of India": [18.922, 72.8347],
    "Marine Drive": [18.9432, 72.8236],
    Bandra: [19.0596, 72.8295],
    Andheri: [19.1136, 72.8697],
    Colaba: [18.9067, 72.8147],
    "Juhu Beach": [19.0989, 72.8269],
    Powai: [19.1197, 72.905],
    "CST Station": [18.9398, 72.8355],
    "Worli Sea Link": [19.0176, 72.8143],
    BKC: [19.0656, 72.8696],
  },
  Bangalore: {
    "MG Road": [12.9716, 77.5946],
    Koramangala: [12.9352, 77.6245],
    Indiranagar: [12.9784, 77.6408],
    Whitefield: [12.9698, 77.7499],
    "Electronic City": [12.8458, 77.6593],
    Marathahalli: [12.9591, 77.7011],
    "HSR Layout": [12.9116, 77.6473],
    "JP Nagar": [12.9082, 77.5853],
    Jayanagar: [12.925, 77.5838],
    Yelahanka: [13.1007, 77.5963],
  },
  Hyderabad: {
    Charminar: [17.3616, 78.4747],
    "Hitech City": [17.4435, 78.3772],
    Gachibowli: [17.4399, 78.3487],
    "Banjara Hills": [17.4239, 78.4738],
    Secunderabad: [17.4399, 78.4983],
    Madhapur: [17.4483, 78.3915],
    Kukatpally: [17.4849, 78.3914],
    "Jubilee Hills": [17.4326, 78.4071],
    KPHB: [17.4892, 78.3915],
    Uppal: [17.4065, 78.5593],
  },
  Chennai: {
    "Marina Beach": [13.0499, 80.2824],
    "T Nagar": [13.0418, 80.2341],
    "Anna Nagar": [13.085, 80.2101],
    Velachery: [12.975, 80.2212],
    OMR: [12.8956, 80.227],
    Adyar: [13.0067, 80.2572],
    Mylapore: [13.0339, 80.2619],
    Tambaram: [12.9249, 80.1],
    Porur: [13.0358, 80.1563],
    Guindy: [13.0067, 80.2206],
  },
  Kolkata: {
    "Howrah Bridge": [22.5851, 88.3469],
    "Victoria Memorial": [22.5448, 88.3426],
    "Park Street": [22.5535, 88.3619],
    "Salt Lake": [22.5697, 88.4177],
    Esplanade: [22.5697, 88.3501],
    Sealdah: [22.5697, 88.3697],
    "New Town": [22.5858, 88.4643],
    Ballygunge: [22.5329, 88.3643],
    Rajarhat: [22.6211, 88.4643],
    Jadavpur: [22.4986, 88.3643],
  },
  Pune: {
    "FC Road": [18.5314, 73.8446],
    "Koregaon Park": [18.5362, 73.8958],
    Hinjewadi: [18.5912, 73.7389],
    Kothrud: [18.5074, 73.8077],
    "Viman Nagar": [18.5679, 73.9143],
    "Shivaji Nagar": [18.5304, 73.8567],
    Wakad: [18.5978, 73.7643],
    Magarpatta: [18.5157, 73.9295],
    Aundh: [18.5593, 73.8078],
    Baner: [18.5592, 73.7867],
  },
};

export const cityCenter = {
  Delhi: [28.6139, 77.209],
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Pune: [18.5204, 73.8567],
};