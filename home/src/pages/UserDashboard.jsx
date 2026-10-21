import { useCallback, useEffect,useState } from "react"
import API from "../api/api"

import { toast } from "react-toastify"
import Swal from "sweetalert2"

import { motion } from "framer-motion"

import { FaUser, FaCalendarCheck } from "react-icons/fa"
import { getApiErrorMessage, isValidEmail, isValidPhone } from "../utils/validation"

function UserDashboard(){

const userId = localStorage.getItem("user_id")

const [profile,setProfile] = useState({})
const [bookings,setBookings] = useState([])
const [loading,setLoading] = useState(true)
const [edit,setEdit] = useState(false)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

/* LOAD DATA */

const loadData = useCallback(async ()=>{
try{

  const [profileRes, bookingRes] = await Promise.all([
    API.get(`user/profile/${userId}/`),
    API.get("bookings/")
  ])

  const profileData = profileRes.data

  setProfile(profileData)
  setFirstName(profileData.first_name || "")
  setLastName(profileData.last_name || "")
  setEmail(profileData.email || "")
  setPhone(profileData.phone || "")

  // FIX: userId type issue
  const myBookings = (bookingRes.data || []).filter(
    b => String(b.user) === String(userId)
  )

  setBookings(myBookings)

}catch{
  toast.error("Failed to load data")
}finally{
  setLoading(false)
}
},[userId])

useEffect(()=>{
loadData()
},[loadData])

/* UPDATE PROFILE */

const updateProfile = async ()=>{

if (!firstName.trim() || firstName.trim().length > 150 || lastName.trim().length > 150) { toast.warning("Enter a first name and keep each name within 150 characters"); return; }
if (!isValidEmail(email)) { toast.warning("Enter a valid email address"); return; }
if (!isValidPhone(phone)) { toast.warning("Enter a valid phone number (7–15 digits)"); return; }

try{
  await API.put(`user/profile/${userId}/`,{
    first_name:firstName.trim(),
    last_name:lastName.trim(),
    email:email.trim(),
    phone:phone.trim()
  })

  toast.success("Profile Updated")
  setEdit(false)

}catch(error){
  toast.error(getApiErrorMessage(error, "Profile update failed"))
}

}

/* CANCEL BOOKING */

const cancelBooking = async (id)=>{

const result = await Swal.fire({
  title:"Cancel Booking?",
  text:"Are you sure?",
  icon:"warning",
  showCancelButton:true,
  confirmButtonColor:"#e74c3c"
})

if(result.isConfirmed){

  try{
    await API.put(`booking/cancel/${id}/`)

    toast.success("Booking Cancelled")

    setBookings(prev =>
      prev.map(b =>
        b.id===id ? {...b,status:"CANCELLED"} : b
      )
    )

  }catch{
    toast.error("Cancel failed")
  }

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

<div className="ud-container">

<h1 className="ud-title">User Dashboard</h1>

<button className="ud-logout" onClick={logout}>
Logout
</button>

{/* ===== STATS ===== */}

<div className="ud-stats">

<div className="ud-stat">
<FaUser/>
<h3>{profile.first_name}</h3>
<p>User Profile</p>
</div>

<div className="ud-stat">
<FaCalendarCheck/>
<h3>{bookings.length}</h3>
<p>Total Bookings</p>
</div>

<div className="ud-stat"><FaCalendarCheck/><h3>{bookings.filter(b=>["ACCEPTED","IN_PROGRESS"].includes(b.status)).length}</h3><p>Active</p></div>
<div className="ud-stat"><FaCalendarCheck/><h3>{bookings.filter(b=>b.status==="PENDING").length}</h3><p>Pending</p></div>
<div className="ud-stat"><FaCalendarCheck/><h3>{bookings.filter(b=>b.status==="COMPLETED").length}</h3><p>Completed</p></div>
<div className="ud-stat"><FaCalendarCheck/><h3>{bookings.filter(b=>b.status==="CANCELLED").length}</h3><p>Cancelled</p></div>

</div>

{/* ===== PROFILE ===== */}

<motion.div className="ud-card">

<h2>My Profile</h2>

{!edit ? (

<div>

<p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
<p><b>Email:</b> {profile.email}</p>
<p><b>Phone:</b> {profile.phone}</p>

<button className="ud-btn" onClick={()=>setEdit(true)}>
Edit Profile
</button>

</div>

) : (

<div className="ud-form">

<input value={firstName} maxLength={150} placeholder="First name" onChange={e=>setFirstName(e.target.value)} required />
<input value={lastName} maxLength={150} placeholder="Last name" onChange={e=>setLastName(e.target.value)}/>
<input type="email" maxLength={254} value={email} placeholder="Email address" onChange={e=>setEmail(e.target.value)} required />
<input type="tel" maxLength={15} inputMode="tel" value={phone} placeholder="Phone number" onChange={e=>setPhone(e.target.value)} required />

<button className="ud-btn" onClick={updateProfile}>
Save
</button>

</div>

)}

</motion.div>

{/* ===== BOOKINGS ===== */}

<motion.div className="ud-card">

<h2>My Bookings</h2>

{bookings.length === 0 ? (

<p>No bookings found</p>

) : (

<table className="ud-table">

<thead>
<tr>
<th>ID</th>
<th>Service</th>
<th>Worker</th>
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
<td>{b.worker_name}</td>
<td>{b.booking_date}</td>
<td>{b.address}</td>

<td className={`ud-${b.status}`}>
{b.status}
</td>

<td>

{b.status==="PENDING" && (
<button className="ud-cancel" onClick={()=>cancelBooking(b.id)}>
Cancel
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

export default UserDashboard
