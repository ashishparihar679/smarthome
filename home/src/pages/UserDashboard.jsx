import { useEffect,useState } from "react"
import API from "../api/api"

import { toast } from "react-toastify"
import Swal from "sweetalert2"

import { motion } from "framer-motion"

import { FaUser, FaCalendarCheck } from "react-icons/fa"

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

useEffect(()=>{
loadData()
},[])

const loadData = async ()=>{
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

}

/* UPDATE PROFILE */

const updateProfile = async ()=>{

try{
  await API.put(`user/profile/${userId}/`,{
    first_name:firstName,
    last_name:lastName,
    email,
    phone
  })

  toast.success("Profile Updated")
  setEdit(false)

}catch{
  toast.error("Update Failed")
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

<input value={firstName} onChange={e=>setFirstName(e.target.value)}/>
<input value={lastName} onChange={e=>setLastName(e.target.value)}/>
<input value={email} onChange={e=>setEmail(e.target.value)}/>
<input value={phone} onChange={e=>setPhone(e.target.value)}/>

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