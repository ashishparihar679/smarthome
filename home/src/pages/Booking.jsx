import { useEffect, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import {
FaTools, FaUserTie, FaCalendarAlt, FaMapMarkerAlt
} from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Booking(){

const [services,setServices] = useState([]);
const [workers,setWorkers] = useState([]);

const [service,setService] = useState("");
const [worker,setWorker] = useState("");
const [date,setDate] = useState("");
const [address,setAddress] = useState("");

const [loading,setLoading] = useState(true);
const [btnLoading,setBtnLoading] = useState(false);
const [success,setSuccess] = useState(false);

const userId = localStorage.getItem("user_id");

/* ================= LOAD ================= */

useEffect(()=>{
loadData()
},[])

const loadData = async ()=>{
try{
  const [sRes,wRes] = await Promise.all([
    API.get("services/"),
    API.get("workers/")
  ])

  setServices(sRes.data || [])
  setWorkers(wRes.data || [])

}catch{
  toast.error("Failed to load data")
}finally{
  setLoading(false)
}
}

/* ================= SUBMIT ================= */

const submitBooking = async ()=>{

if(!service || !worker || !date || !address){
  toast.warning("Please fill all fields")
  return
}

try{
  setBtnLoading(true)

  await API.post("bookings/",{
    user:userId,
    service,
    worker,
    booking_date:date,
    address
  })

  toast.success("Booking Created Successfully")
  setSuccess(true)

}catch{
  toast.error("Booking Failed")
}finally{
  setBtnLoading(false)
}

}

/* ================= LOADING ================= */

if(loading){
return(
<div className="bk-container">
<div className="bk-card">
<Skeleton height={40}/>
<Skeleton height={40}/>
<Skeleton height={40}/>
<Skeleton height={40}/>
</div>
</div>
)
}

/* ================= UI ================= */

return(

<div className="bk-container">

{success ? (

<motion.div
className="bk-success"
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
className="bk-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
>

<h2>Book Service</h2>

{/* SERVICE */}

<div className="bk-input">
<FaTools/>
<select value={service} onChange={(e)=>setService(e.target.value)}>
<option value="">Select Service</option>
{services.map(s=>(
<option key={s.id} value={s.id}>{s.name}</option>
))}
</select>
</div>

{/* WORKER */}

<div className="bk-input">
<FaUserTie/>
<select value={worker} onChange={(e)=>setWorker(e.target.value)}>
<option value="">Select Worker</option>
{workers.map(w=>(
<option key={w.id} value={w.id}>{w.name}</option>
))}
</select>
</div>

{/* DATE */}

<div className="bk-input">
<FaCalendarAlt/>
<input type="date" value={date} onChange={(e)=>setDate(e.target.value)}/>
</div>

{/* ADDRESS */}

<div className="bk-input">
<FaMapMarkerAlt/>
<select value={address} onChange={(e)=>setAddress(e.target.value)}>
<option value="">Select Address</option>
<option>Anand Nagar</option>
<option>MP Nagar</option>
<option>Indrapuri</option>
</select>
</div>

<button className="bk-btn" onClick={submitBooking}>
{btnLoading ? "Booking..." : "Book Service"}
</button>

</motion.div>

)}

</div>

)

}

export default Booking