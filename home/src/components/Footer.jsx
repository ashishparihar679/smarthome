import { Link } from "react-router-dom";
import { FaArrowUp, FaMapMarkerAlt } from "react-icons/fa";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <Link className="site-footer-logo" to="/">🏠 SmartHome</Link>
          <p>Dependable home services, with a simpler way to find the help you need.</p>
          <a className="site-footer-location" href="https://maps.google.com/?q=23.2599,77.4126" target="_blank" rel="noreferrer">
            <FaMapMarkerAlt aria-hidden="true" /> Bhopal, Madhya Pradesh
          </a>
        </div>

        <div className="site-footer-column">
          <h2>Explore</h2>
          <Link to="/">Home</Link>
          <Link to="/workers">Our professionals</Link>
          <Link to="/booking">Book a service</Link>
          <Link to="/my-bookings">My bookings</Link>
        </div>

        <div className="site-footer-column">
          <h2>Home services</h2>
          <Link to="/#services">Electrical</Link>
          <Link to="/#services">Plumbing</Link>
          <Link to="/#services">Cleaning</Link>
          <Link to="/#services">Repairs &amp; maintenance</Link>
        </div>

        <div className="site-footer-column">
          <h2>Your account</h2>
          <Link to="/Login">Login</Link>
          <Link to="/Signup">Create an account</Link>
          <Link to="/WorkerRegister">Join as a professional</Link>
        </div>
      </div>
      <div className="site-footer-bottom">
        <span>© {new Date().getFullYear()} SmartHome. All rights reserved.</span>
        <a className="site-footer-top" href="#root" aria-label="Back to top"><FaArrowUp aria-hidden="true" /></a>
      </div>
    </footer>
  );
}

export default Footer;
