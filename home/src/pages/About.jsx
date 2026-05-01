import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaUsers, FaTools, FaHeadset } from "react-icons/fa";
// import "./About.css";

function About() {

  const navigate = useNavigate();

  const handleBook = () => {

    const role = localStorage.getItem("role");

    if (!role) {

      toast.warning("Please login first");

      setTimeout(()=>{
        navigate("/login");
      },1500)

      return;
    }

    navigate("/booking");
  };

  return (

<motion.section
className="about-section"
initial={{opacity:0}}
whileInView={{opacity:1}}
transition={{duration:0.8}}
>

<div className="about-container">

{/* LEFT */}

<motion.div
className="about-left"
initial={{x:-80,opacity:0}}
whileInView={{x:0,opacity:1}}
transition={{duration:0.6}}
>

<h2>About Our Home Services</h2>

<p>
We provide trusted home services like plumbing, electrical repair,
cleaning and appliance maintenance. Our mission is to make your
daily life easier with professional services delivered at your
doorstep.
</p>

<div className="about-stats">

<motion.div
className="stat-box"
whileHover={{scale:1.1}}
>

<FaUsers className="stat-icon"/>

<h3>10K+</h3>

<p>Happy Customers</p>

</motion.div>


<motion.div
className="stat-box"
whileHover={{scale:1.1}}
>

<FaTools className="stat-icon"/>

<h3>500+</h3>

<p>Verified Experts</p>

</motion.div>


<motion.div
className="stat-box"
whileHover={{scale:1.1}}
>

<FaHeadset className="stat-icon"/>

<h3>24/7</h3>

<p>Support</p>

</motion.div>

</div>

<button className="book-btn" onClick={handleBook}>
Book Now
</button>

</motion.div>


{/* RIGHT MAP */}

<motion.div
className="about-right"
initial={{x:80,opacity:0}}
whileInView={{x:0,opacity:1}}
transition={{duration:0.6}}
>

<iframe
title="location"
src="https://www.google.com/maps?q=23.2599,77.4126&z=15&output=embed"
loading="lazy"
className="map"
></iframe>

</motion.div>

</div>

</motion.section>

  );
}

export default About;