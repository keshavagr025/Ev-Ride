import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Dashboard from "./pages/dashboard";
import BookRide from "./pages/bookRide";
import RideHistory from "./pages/RideHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/book-ride" element={<BookRide />} />
        <Route path="/ride-history" element={<RideHistory />} />
      </Routes>
    </Router>
  );
}

export default App;
