import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import VenueDetails from "./pages/VenueDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import VenueBookings from "./pages/VenueBookings";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/venue/:id" element={<VenueDetails />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/manage/bookings" element={<VenueBookings />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
