import { useEffect, useState } from "react";
import API from "../api/api";

import { toast } from "react-toastify";
import Swal from "sweetalert2";

import { motion } from "framer-motion";
import { FaUserTie, FaTools } from "react-icons/fa";
import { getApiErrorMessage, isValidEmail, isValidPhone } from "../utils/validation";

function WorkerDashboard(){

const workerId = localStorage.getItem("user_id")

const [profile,setProfile] = useState({})
const [bookings,setBookings] = useState([])
const [reviews,setReviews] = useState([])
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
  if (data.professional_profile?.id) {
    const reviewRes = await API.get(`professionals/${data.professional_profile.id}/reviews/`)
    setReviews(reviewRes.data.reviews || [])
  }

}catch{
  toast.error("Failed to load data")
}finally{
  setLoading(false)
}

}

/* UPDATE PROFILE */

const updateProfile = async ()=>{
if (!firstName.trim() || firstName.trim().length > 150 || lastName.trim().length > 150) { toast.warning("Enter a first name and keep each name within 150 characters"); return; }
if (!isValidEmail(email)) { toast.warning("Enter a valid email address"); return; }
if (!isValidPhone(phone)) { toast.warning("Enter a valid phone number (7–15 digits)"); return; }
try{

  await API.put(`user/profile/${workerId}/`,{
    first_name:firstName.trim(),
    last_name:lastName.trim(),
    email:email.trim(),
    phone:phone.trim()
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

}catch(error){
  toast.error(getApiErrorMessage(error, "Profile update failed"))
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

const startBooking = async (id)=>{
try{
  await API.put(`booking/start/${id}/`)
  setBookings(prev => prev.map(b => b.id === id ? {...b, status:"IN_PROGRESS"} : b))
}catch{ toast.error("Could not update booking") }
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

<h1 className="wd-title">Professional Dashboard</h1>
{profile.professional_profile && <p className="wd-rating">★ {Number(profile.professional_profile.average_rating || 0).toFixed(1)}/5 · {profile.professional_profile.rating_count || 0} customer reviews {profile.professional_profile.approved ? "· Verified" : "· Pending verification"}</p>}
{reviews.length > 0 && <section className="wd-card" aria-label="Customer reviews"><h2>Customer Reviews</h2>{reviews.map((review) => <article key={review.id}><strong>{review.customer_name || "Customer"} · {"★".repeat(review.rating)}</strong><p>{review.comment || "No written comment"}</p></article>)}</section>}

<button className="wd-logout" onClick={logout}>
Logout
</button>

{/* ===== STATS ===== */}

<div className="wd-stats">

<div className="wd-stat">
<FaUserTie/>
<h3>{profile.first_name}</h3>
<p>Professional Profile</p>
</div>

<div className="wd-stat">
<FaTools/>
<h3>{bookings.length}</h3>
<p>Total Jobs</p>
</div>
<div className="wd-stat"><FaTools/><h3>{bookings.filter((booking) => booking.status === "COMPLETED").length}</h3><p>Completed Jobs</p></div>
<div className="wd-stat"><FaTools/><h3>{bookings.filter((booking) => booking.status === "PENDING").length}</h3><p>Pending Requests</p></div>

</div>

{/* ===== PROFILE ===== */}

<motion.div className="wd-card">

<h2>Professional Profile</h2>

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

<input value={firstName} maxLength={150} placeholder="First name" onChange={e=>setFirstName(e.target.value)} required />
<input value={lastName} maxLength={150} placeholder="Last name" onChange={e=>setLastName(e.target.value)}/>
<input type="email" maxLength={254} value={email} placeholder="Email address" onChange={e=>setEmail(e.target.value)} required />
<input type="tel" maxLength={15} inputMode="tel" value={phone} placeholder="Phone number" onChange={e=>setPhone(e.target.value)} required />

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
<button className="wd-accept" onClick={()=>startBooking(b.id)}>Start service</button>
)}

{b.status==="IN_PROGRESS" && (
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
