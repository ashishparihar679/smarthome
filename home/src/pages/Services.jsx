import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaTools, FaShieldAlt, FaClock, FaStar, FaBolt, FaWrench, FaBroom, FaPaintRoller, FaHammer, FaSnowflake } from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const getServiceDescription = (serviceName = "") => {
  const name = serviceName.toLowerCase();

  if (name.includes("electric")) {
    return "Get help with lights, switches, wiring, and common electrical repairs around your home.";
  }
  if (name.includes("plumb")) {
    return "Find help for leaking taps, blocked drains, pipe repairs, and other everyday plumbing needs.";
  }
  if (name.includes("clean")) {
    return "Arrange a helping hand for regular home cleaning and a fresher, more comfortable space.";
  }
  if (name.includes("paint")) {
    return "Refresh your rooms with help for interior painting, touch-ups, and wall finishes.";
  }
  if (name.includes("carpent")) {
    return "Get assistance with furniture assembly, woodwork, shelves, doors, and small repairs.";
  }
  if (name.includes("appliance") || name.includes("repair")) {
    return "Request help diagnosing and fixing common household appliance and equipment problems.";
  }
  if (name.includes("ac") || name.includes("air condition")) {
    return "Book help with air-conditioning maintenance, cooling issues, and routine service needs.";
  }
  if (name.includes("pest")) {
    return "Find support for common pest concerns and practical treatment around your home.";
  }

  return `Request professional help with ${serviceName.toLowerCase()} and make your home-care task easier to manage.`;
};

const getServiceIcon = (serviceName = "") => {
  const name = serviceName.toLowerCase();
  if (name.includes("electric")) return FaBolt;
  if (name.includes("plumb") || name.includes("repair")) return FaWrench;
  if (name.includes("clean")) return FaBroom;
  if (name.includes("paint")) return FaPaintRoller;
  if (name.includes("carpent")) return FaHammer;
  if (name.includes("ac") || name.includes("air condition")) return FaSnowflake;
  return FaTools;
};

function ServiceIcon({ serviceName }) {
  const Icon = getServiceIcon(serviceName);
  return <Icon />;
}

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
        <div className="sm-hero-inner">
          <div className="sm-hero-overlay">
            <span className="sm-eyebrow"><span className="sm-live-dot" /> HOME CARE, MADE EASIER</span>
            <h1>Home services,<br /><span>made simple.</span></h1>
            <p>From everyday repairs to essential upkeep, find the right help for your home and request a booking in just a few steps.</p>

            <button
              className="sm-btn-primary sm-hero-button"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore services <span aria-hidden="true">↗</span>
            </button>
            <div className="sm-hero-proof"><span className="sm-proof-stars">★★★★★</span><span>Reliable help, right when you need it</span></div>
          </div>
          <div className="sm-hero-art" aria-hidden="true">
            <div className="sm-orbit sm-orbit-one" /><div className="sm-orbit sm-orbit-two" />
            <div className="sm-home-illustration"><div className="sm-house-roof" /><div className="sm-house-body"><span className="sm-house-window" /><span className="sm-house-door" /></div></div>
            <div className="sm-float-icon sm-float-tools"><FaTools /></div>
            <div className="sm-float-icon sm-float-shield"><FaShieldAlt /></div>
            <div className="sm-float-icon sm-float-spark">✦</div>
            <div className="sm-art-caption"><span className="sm-art-check">✓</span><span><b>Home care, handled</b><small>Find your service in minutes</small></span></div>
          </div>
        </div>
        <div className="sm-hero-bottom" aria-hidden="true"><span>01</span><i /><span>YOUR HOME, IN GOOD HANDS</span></div>
      </div>

      {/* SERVICES */}
      <section id="services" className="sm-services-section">
      <span className="sm-section-kicker">THE RIGHT HELP, RIGHT HERE</span>
      <h2 className="sm-title">What does your home need?</h2>
      <p className="sm-section-intro">Explore available service categories, choose what you need, and send a booking request with your preferred date and address.</p>

      <motion.div
        className="sm-grid"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.12 }}
      >

        {loading ? (
          Array(6).fill().map((_, i) => (
            <Skeleton key={i} height={210} borderRadius={20} />
          ))
        ) : services.length === 0 ? (
          <p className="sm-empty">No services available</p>
        ) : (
          services.map(service => (
            <motion.div
              key={service.id}
              className="sm-card"
              variants={item}
              whileHover={{ y: -7, rotateX: 2 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="sm-card-top"><div className="sm-icon"><ServiceIcon serviceName={service.name} /></div><span className="sm-card-arrow" aria-hidden="true">↗</span></div>

              <h3>{service.name}</h3>

              <p>
                {getServiceDescription(service.name)}
              </p>

              <button
                className="sm-btn-primary"
                onClick={() => handleBook(service.id)}
              >
                Book now <span aria-hidden="true">→</span>
              </button>

            </motion.div>
          ))
        )}

      </motion.div>
      </section>

      {/* WHY */}
      <div className="sm-why">
        <span className="sm-section-kicker">A BETTER WAY TO BOOK</span>
        <h2>A simpler way to care for your home</h2>
        <p className="sm-section-intro">Plan the work, send your request, and keep your service details together in one place.</p>

        <div className="sm-why-grid">

          <div className="sm-why-card">
            <span className="sm-why-icon"><FaShieldAlt /></span>
            <h3>Know who handles the work</h3>
            <p>Worker profiles include their service category and contact details, so you can see who is associated with your requested service.</p>
          </div>

          <div className="sm-why-card">
            <span className="sm-why-icon"><FaClock /></span>
            <h3>Simple booking requests</h3>
            <p>Select a service, add your preferred date and address, and submit your request through the booking flow.</p>
          </div>

          <div className="sm-why-card">
            <span className="sm-why-icon"><FaStar /></span>
            <h3>Keep track of bookings</h3>
            <p>Review your booking details and follow its status from your user dashboard.</p>
          </div>

        </div>
      </div>

      {/* CTA */}
      <div className="sm-cta">
        <span className="sm-section-kicker">A LITTLE LESS TO WORRY ABOUT</span>
        <h2>Ready to make home care easier?</h2>
        <p>Choose a service, share the details, and send your booking request. You can review its status from your dashboard.</p>

        <button
          className="sm-btn-primary"
          onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
        >
          Find your service <span aria-hidden="true">↗</span>
        </button>
      </div>

    </div>
  );
}

export default Service;
