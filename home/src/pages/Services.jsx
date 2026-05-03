import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaTools, FaShieldAlt, FaClock, FaStar } from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Service() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const res = await API.get("services/");
      setServices(res.data || []);
    } catch (error) {
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = (serviceId) => {
    const role = localStorage.getItem("role");

    if (!role) {
      toast.warning("Please login first");
      navigate("/login");
      return;
    }

    navigate("/booking", { state: { serviceId } });
  };

  // animation container
  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="sm-home">

      {/* HERO */}
      <div className="sm-hero">
        <div className="sm-hero-overlay">
          <h1>Professional Home Services</h1>
          <p>Book trusted electricians, plumbers, cleaners and more</p>

          <button
            className="sm-btn-primary"
            onClick={() => navigate("/services")}
          >
            Explore Services
          </button>
        </div>
      </div>

      {/* SERVICES */}
      <h2 className="sm-title">Our Services</h2>

      <motion.div
        className="sm-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >

        {loading ? (
          Array(6).fill().map((_, i) => (
            <Skeleton key={i} height={180} borderRadius={12} />
          ))
        ) : services.length === 0 ? (
          <p className="sm-empty">No services available</p>
        ) : (
          services.map(service => (
            <motion.div
              key={service.id}
              className="sm-card"
              variants={item}
              whileHover={{ scale: 1.05 }}
            >
              <div className="sm-icon">
                <FaTools />
              </div>

              <h3>{service.name}</h3>

              <p>
                Professional {service.name} service for your home
              </p>

              <button
                className="sm-btn-primary"
                onClick={() => handleBook(service.id)}
              >
                Book Now
              </button>

            </motion.div>
          ))
        )}

      </motion.div>

      {/* WHY */}
      <div className="sm-why">
        <h2>Why Choose Us</h2>

        <div className="sm-why-grid">

          <div className="sm-why-card">
            <FaShieldAlt />
            <h3>Verified Workers</h3>
            <p>All professionals are verified</p>
          </div>

          <div className="sm-why-card">
            <FaClock />
            <h3>Fast Service</h3>
            <p>Quick booking system</p>
          </div>

          <div className="sm-why-card">
            <FaStar />
            <h3>Top Rated</h3>
            <p>Highly rated services</p>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="sm-cta">
        <h2>Need Help With Your Home?</h2>
        <p>Book trusted professionals today</p>

        <button
          className="sm-btn-primary"
          onClick={() => navigate("/services")}
        >
          Book Service
        </button>
      </div>

    </div>
  );
}

export default Service;