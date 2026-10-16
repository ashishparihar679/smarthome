import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "../src/index.css";
import { useEffect } from "react";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { motion } from "framer-motion";

import Services from "./pages/Services";
import Workers from "./pages/Workers";
import Booking from "./pages/Booking";
import WorkerDashboard from "./pages/WorkerDashboard";
import MyBookings from "./pages/MyBookings";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import WorkerRegister from "./pages/WorkerRegister";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminUsers from "./pages/AdminUsers";
import About from "./pages/About";
import Footer from "./components/Footer";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />

      {/* Page Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Routes>
          <Route path="/" element={<Services />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          <Route path="/UserDashboard" element={<UserDashboard />} />
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/WorkerRegister" element={<WorkerRegister />} />
          <Route path="/Login" element={<Login />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/AdminUsers" element={<AdminUsers />} />
        </Routes>
      </motion.div>

      <About />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
