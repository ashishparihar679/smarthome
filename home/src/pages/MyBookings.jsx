import React,{useEffect,useState} from "react"
import API from "../api/api"
import { motion } from "framer-motion"
import { FaMapMarkerAlt } from "react-icons/fa"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
// import "./MyBookings.css"

function MyBookings(){

const [bookings,setBookings] = useState([])
const [loading,setLoading] = useState(true)

useEffect(()=>{

API.get("bookings/")
.then(res=>{
setBookings(res.data)
setLoading(false)
})

},[])

if(loading){

return(

<div className="mybookings-container">

<h2 className="mybookings-title">My Bookings</h2>

<Skeleton height={100} count={3}/>

</div>

)

}

return(

<div className="mybookings-container">

<h2 className="mybookings-title">My Bookings</h2>

<div className="booking-grid">

{bookings.map(b=>(

<motion.div
className="booking-card"
key={b.id}
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.3}}
>

<div className="booking-header">

<FaMapMarkerAlt className="location-icon"/>

<p className="booking-address">
{b.address}
</p>

</div>

<p className={`booking-status status-${b.status}`}>
Status: {b.status}
</p>

</motion.div>

))}

</div>

</div>

)

}

export default MyBookings