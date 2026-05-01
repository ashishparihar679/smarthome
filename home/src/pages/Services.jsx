import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FaTools, FaShieldAlt, FaClock, FaStar } from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Service(){

const [services,setServices] = useState([])
const [loading,setLoading] = useState(true)

const navigate = useNavigate()

useEffect(()=>{
loadServices()
},[])

const loadServices = ()=>{

API.get("services/")
.then(res=>{
setServices(res.data)
setLoading(false)
})

}

const handleBook = (serviceId)=>{

const role = localStorage.getItem("role")

if(!role){
toast.warning("Please login first")
navigate("/login")
return
}

navigate("/booking",{state:{serviceId:serviceId}})

}

return(

<div className="home-container">

{/* HERO SECTION */}

<div className="hero-section">

<div className="hero-overlay">

<h1>Professional Home Services</h1>

<p>
Book trusted electricians, plumbers, cleaners and more
</p>

<button
className="hero-btn"
onClick={()=>navigate("/booking")}
>
Explore Services
</button>

</div>

</div>


{/* SERVICES */}

<h2 className="section-title">Our Services</h2>

<div className="services-grid">

{loading ?

Array(6).fill().map((_,i)=>(
<Skeleton key={i} height={160}/>
))

:

services.map(service=>(

<motion.div
key={service.id}
className="service-card"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.3}}
whileHover={{scale:1.05}}
>

<div className="service-icon">
<FaTools/>
</div>

<h3>{service.name}</h3>

<p>
Professional {service.name} service for your home
</p>

<button 
className="book-btn"
onClick={()=>handleBook(service.id)}
>
Book Now
</button>

</motion.div>

))

}

</div>


{/* WHY CHOOSE US */}

<div className="why-section">

<h2>Why Choose Us</h2>

<div className="why-grid">

<div className="why-card">
<FaShieldAlt/>
<h3>Verified Workers</h3>
<p>All professionals are background verified</p>
</div>

<div className="why-card">
<FaClock/>
<h3>Fast Service</h3>
<p>Book services within minutes</p>
</div>

<div className="why-card">
<FaStar/>
<h3>Top Rated</h3>
<p>Highly rated by customers</p>
</div>

</div>

</div>


{/* REVIEWS */}

<div className="review-section">

<h2>Customer Reviews</h2>

<div className="review-grid">

<div className="review-card">
<p>
"Very fast electrician service. Highly recommended."
</p>
<h4>Rahul Sharma</h4>
</div>

<div className="review-card">
<p>
"Cleaning team was professional and polite."
</p>
<h4>Anjali Verma</h4>
</div>

<div className="review-card">
<p>
"Best home repair service I have used."
</p>
<h4>Amit Singh</h4>
</div>

</div>

</div>


{/* CALL TO ACTION */}

<div className="cta-section">

<h2>Need Help With Your Home?</h2>

<p>Book trusted professionals today</p>

<button
className="cta-btn"
onClick={()=>navigate("/services")}
>
Book Service
</button>

</div>

</div>

)

}

export default Service