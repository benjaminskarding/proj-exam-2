import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import RequireAuth from "./routes/RequireAuth";
import RequireManager from "./routes/RequireManager";
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
import SearchResults from "./pages/searchResults/SearchResults";
import AboutUs from "./pages/staticDesignOnlyPages/AboutUs";
import ContactUs from "./pages/staticDesignOnlyPages/ContactUs";
import TermsOfService from "./pages/staticDesignOnlyPages/TermsOfService";
import PrivacyPolicy from "./pages/staticDesignOnlyPages/PrivacyPolicy";
import Cookies from "./pages/staticDesignOnlyPages/Cookies";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* public layout */}
          <Route element={<MainLayout />}>
            {/*  public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/venue/:id" element={<VenueDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Static informational routes */}
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cookies" element={<Cookies />} />

            {/* logged-in (customer OR manager) */}
            <Route element={<RequireAuth />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/bookings" element={<MyBookings />} />

              {/* manager-only  */}
              <Route element={<RequireManager />}>
                <Route path="/manage" element={<ManageVenues />} />
                <Route path="/venues/create" element={<CreateVenue />} />
                <Route path="/venues/edit/:id" element={<EditVenue />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
