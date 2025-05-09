import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import VenueDetails from "./pages/venues/VenueDetails";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Profile from "./pages/profile/Profile";
import MyBookings from "./pages/bookings/MyBookings";
import MainLayout from "./layouts/MainLayout";
import ManageVenues from "./pages/venues/ManageVenues";
import CreateVenue from "./pages/venues/CreateVenue";
import EditVenue from "./pages/venues/EditVenue";

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
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/manage" element={<ManageVenues />} />
            <Route path="/venues/create" element={<CreateVenue />} />
            <Route path="/venues/edit/:id" element={<EditVenue />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
