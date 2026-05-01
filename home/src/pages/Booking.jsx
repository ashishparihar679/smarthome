import { useEffect, useState } from "react";
import API from "../api/api";

import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { FaTools, FaUserTie, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

// import "./Booking.css";

function Booking(){

const [services,setServices] = useState([]);
const [workers,setWorkers] = useState([]);

const [service,setService] = useState("");
const [worker,setWorker] = useState("");
const [date,setDate] = useState("");
const [address,setAddress] = useState("");

const [loading,setLoading] = useState(true);
const [success,setSuccess] = useState(false);

const userId = localStorage.getItem("user_id");

useEffect(()=>{

API.get("services/")
.then(res=>{
setServices(res.data)
setLoading(false)
})
.catch(()=>{
toast.error("Failed to load services")
})

API.get("workers/")
.then(res=>{
setWorkers(res.data)
})
.catch(()=>{
toast.error("Failed to load workers")
})

},[])

const submitBooking = ()=>{

if(!service || !worker || !date || !address){
toast.warning("Please fill all fields")
return
}

API.post("bookings/",{
user:userId,
service:service,
worker:worker,
booking_date:date,
address:address
})

.then(()=>{
toast.success("Booking Created Successfully")
setSuccess(true)
})
.catch(()=>{
toast.error("Booking Failed")
})

}

if(loading){

return(

<div className="booking-container">

<div className="booking-card">

<Skeleton height={40}/>
<Skeleton height={40}/>
<Skeleton height={40}/>
<Skeleton height={40}/>

</div>

</div>

)

}

return(

<div className="booking-container">

{success ? (

<motion.div
className="success-box"
initial={{scale:0}}
animate={{scale:1}}
>

<h2>🎉 Booking Confirmed</h2>

<p>Your service has been booked successfully.</p>

<button onClick={()=>window.location.href="/"}>
Go Home
</button>

</motion.div>

) : (

<motion.div
className="booking-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
>

<h2>Book Service</h2>

<div className="input-group">
<FaTools/>
<select onChange={(e)=>setService(e.target.value)}>
<option value="">Select Service</option>
{services.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}
</select>
</div>

<div className="input-group">
<FaUserTie/>
<select onChange={(e)=>setWorker(e.target.value)}>
<option value="">Select Worker</option>
{workers.map(w=>(
<option key={w.id} value={w.id}>
{w.name}
</option>
))}
</select>
</div>

<div className="input-group">
<FaCalendarAlt/>
<input
type="date"
onChange={(e)=>setDate(e.target.value)}
/>
</div>

<div className="input-group">
<FaMapMarkerAlt/>
<select onChange={(e)=>setAddress(e.target.value)}>
<option value="">Select Address</option>
<option value="Anand Nagar">Anand Nagar</option>
<option value="MP Nagar">MP Nagar</option>
<option value="Indrapuri">Indrapuri</option>
</select>
</div>

<button
className="book-btn"
onClick={submitBooking}
>
Book Service
</button>

</motion.div>

)}

</div>

)

}

export default Booking