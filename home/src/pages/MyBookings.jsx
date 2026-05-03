import React,{useEffect,useState} from "react"
import API from "../api/api"
import { motion } from "framer-motion"
import { FaMapMarkerAlt } from "react-icons/fa"
import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { toast } from "react-toastify"

function MyBookings(){

const [bookings,setBookings] = useState([])
const [loading,setLoading] = useState(true)

/* LOAD BOOKINGS */

useEffect(()=>{
  loadBookings()
},[])

const loadBookings = async ()=>{
try{
  const res = await API.get("bookings/")
  setBookings(res.data || [])
}catch{
  toast.error("Failed to load bookings")
}finally{
  setLoading(false)
}
}

/* LOADING UI */

if(loading){
return(
<div className="mb-container">
<h2 className="mb-title">My Bookings</h2>
<Skeleton height={100} count={3}/>
</div>
)
}

/* MAIN UI */

return(

<div className="mb-container">

<h2 className="mb-title">My Bookings</h2>

{bookings.length === 0 ? (

<p className="mb-empty">No bookings found</p>

) : (

<div className="mb-grid">

{bookings.map(b=>(

<motion.div
className="mb-card"
key={b.id}
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.3}}
>

<div className="mb-header">

<FaMapMarkerAlt className="mb-icon"/>

<p className="mb-address">
{b.address}
</p>

</div>

<p className={`mb-status mb-${b.status}`}>
{b.status}
</p>

</motion.div>

))}

</div>

)}

</div>

)

}

export default MyBookings