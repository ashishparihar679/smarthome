import { useEffect, useState } from "react";
import API from "../api/api";

import { toast } from "react-toastify";
import Swal from "sweetalert2";

import { motion } from "framer-motion";
import { FaUserTie, FaTools } from "react-icons/fa";

function WorkerDashboard(){

const workerId = localStorage.getItem("user_id")

const [profile,setProfile] = useState({})
const [bookings,setBookings] = useState([])
const [loading,setLoading] = useState(true)
const [edit,setEdit] = useState(false)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

/* LOAD DATA */

useEffect(()=>{
loadData()
},[])

const loadData = async ()=>{
try{

  const [profileRes, bookingRes] = await Promise.all([
    API.get(`user/profile/${workerId}/`),
    API.get(`worker/bookings/?worker=${workerId}`)
  ])

  const data = profileRes.data

  setProfile(data)
  setFirstName(data.first_name || "")
  setLastName(data.last_name || "")
  setEmail(data.email || "")
  setPhone(data.phone || "")

  setBookings(bookingRes.data || [])

}catch{
  toast.error("Failed to load data")
}finally{
  setLoading(false)
}

}

/* UPDATE PROFILE */

const updateProfile = async ()=>{
try{

  await API.put(`user/profile/${workerId}/`,{
    first_name:firstName,
    last_name:lastName,
    email,
    phone
  })

  toast.success("Profile Updated")

  setProfile(prev=>({
    ...prev,
    first_name:firstName,
    last_name:lastName,
    email,
    phone
  }))

  setEdit(false)

}catch{
  toast.error("Update failed")
}
}

/* ACCEPT */

const acceptBooking = async (id)=>{

const result = await Swal.fire({
  title:"Accept Booking?",
  icon:"question",
  showCancelButton:true
})

if(result.isConfirmed){

  try{
    await API.put(`booking/accept/${id}/`)

    toast.success("Booking Accepted")

    setBookings(prev =>
      prev.map(b =>
        b.id===id ? {...b,status:"ACCEPTED"} : b
      )
    )

  }catch{
    toast.error("Failed")
  }

}

}

/* REJECT */

const rejectBooking = async (id)=>{

const result = await Swal.fire({
  title:"Reject Booking?",
  icon:"warning",
  showCancelButton:true
})

if(result.isConfirmed){

  try{
    await API.put(`booking/reject/${id}/`)

    toast.error("Booking Rejected")

    setBookings(prev =>
      prev.map(b =>
        b.id===id ? {...b,status:"REJECTED"} : b
      )
    )

  }catch{
    toast.error("Failed")
  }

}

}

/* COMPLETE */

const completeBooking = async (id)=>{
try{

  await API.put(`booking/complete/${id}/`)

  toast.success("Service Completed")

  setBookings(prev =>
    prev.map(b =>
      b.id===id ? {...b,status:"COMPLETED"} : b
    )
  )

}catch{
  toast.error("Failed")
}
}

/* LOGOUT */

const logout = ()=>{
localStorage.clear()
window.location.href="/login"
}

/* LOADING */

if(loading){
return <p style={{textAlign:"center"}}>Loading...</p>
}

/* UI */

return(

<div className="wd-container">

<h1 className="wd-title">Worker Dashboard</h1>

<button className="wd-logout" onClick={logout}>
Logout
</button>

{/* ===== STATS ===== */}

<div className="wd-stats">

<div className="wd-stat">
<FaUserTie/>
<h3>{profile.first_name}</h3>
<p>Worker Profile</p>
</div>

<div className="wd-stat">
<FaTools/>
<h3>{bookings.length}</h3>
<p>Total Requests</p>
</div>

</div>

{/* ===== PROFILE ===== */}

<motion.div className="wd-card">

<h2>Worker Profile</h2>

{!edit ? (

<div>

<p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
<p><b>Email:</b> {profile.email}</p>
<p><b>Phone:</b> {profile.phone}</p>

<button className="wd-btn" onClick={()=>setEdit(true)}>
Edit Profile
</button>

</div>

) : (

<div className="wd-form">

<input value={firstName} onChange={e=>setFirstName(e.target.value)}/>
<input value={lastName} onChange={e=>setLastName(e.target.value)}/>
<input value={email} onChange={e=>setEmail(e.target.value)}/>
<input value={phone} onChange={e=>setPhone(e.target.value)}/>

<button className="wd-btn" onClick={updateProfile}>
Save
</button>

</div>

)}

</motion.div>

{/* ===== BOOKINGS ===== */}

<motion.div className="wd-card">

<h2>Service Requests</h2>

{bookings.length === 0 ? (

<p>No requests</p>

) : (

<table className="wd-table">

<thead>
<tr>
<th>ID</th>
<th>Service</th>
<th>Date</th>
<th>Address</th>
<th>Status</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{bookings.map(b=>(

<tr key={b.id}>

<td>{b.id}</td>
<td>{b.service_name}</td>
<td>{b.booking_date}</td>
<td>{b.address}</td>

<td className={`wd-${b.status}`}>
{b.status}
</td>

<td>

{b.status==="PENDING" && (
<>
<button className="wd-accept" onClick={()=>acceptBooking(b.id)}>Accept</button>
<button className="wd-reject" onClick={()=>rejectBooking(b.id)}>Reject</button>
</>
)}

{b.status==="ACCEPTED" && (
<button className="wd-complete" onClick={()=>completeBooking(b.id)}>
Complete
</button>
)}

</td>

</tr>

))}

</tbody>

</table>

)}

</motion.div>

</div>

)

}

export default WorkerDashboard