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
const [edit,setEdit] = useState(false)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

useEffect(()=>{

API.get(`user/profile/${userId}/`)
.then(res=>{
setProfile(res.data)

setFirstName(res.data.first_name)
setLastName(res.data.last_name)
setEmail(res.data.email)
setPhone(res.data.phone)

})

API.get("bookings/")
.then(res=>{
const myBookings = res.data.filter(b=>b.user==userId)
setBookings(myBookings)
})

},[])

const updateProfile = ()=>{

API.put(`user/profile/${userId}/`,{

first_name:firstName,
last_name:lastName,
email:email,
phone:phone

})
.then(()=>{
toast.success("Profile Updated")
setEdit(false)
})

}

const cancelBooking = (id)=>{

Swal.fire({
title:"Cancel Booking?",
text:"Are you sure?",
icon:"warning",
showCancelButton:true,
confirmButtonColor:"#e74c3c"
}).then((result)=>{

if(result.isConfirmed){

API.put(`booking/cancel/${id}/`)
.then(()=>{

toast.success("Booking Cancelled")

setBookings(bookings.map(b=>
b.id===id ? {...b,status:"CANCELLED"} : b
))

})

}

})

}

const logout = ()=>{
localStorage.clear()
window.location.href="/login"
}

return(

<div className="user-dashboard">

<h1>User Dashboard</h1>

<button className="logout-btn" onClick={logout}>
Logout
</button>


{/* STATS */}

<div className="dashboard-stats">

<div className="stat-card">
<FaUser/>
<h3>{profile.first_name}</h3>
<p>User Profile</p>
</div>

<div className="stat-card">
<FaCalendarCheck/>
<h3>{bookings.length}</h3>
<p>Total Bookings</p>
</div>

</div>


{/* PROFILE */}

<motion.div
className="dashboard-card"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
>

<h2>My Profile</h2>

{!edit ? (

<div>

<p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
<p><b>Email:</b> {profile.email}</p>
<p><b>Phone:</b> {profile.phone}</p>

<button
className="primary-btn"
onClick={()=>setEdit(true)}
>
Edit Profile
</button>

</div>

) : (

<div className="edit-form">

<input
value={firstName}
onChange={e=>setFirstName(e.target.value)}
/>

<input
value={lastName}
onChange={e=>setLastName(e.target.value)}
/>

<input
value={email}
onChange={e=>setEmail(e.target.value)}
/>

<input
value={phone}
onChange={e=>setPhone(e.target.value)}
/>

<button
className="primary-btn"
onClick={updateProfile}
>
Save
</button>

</div>

)}

</motion.div>


{/* BOOKINGS */}

<motion.div
className="dashboard-card"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
>

<h2>My Bookings</h2>

<table className="dashboard-table">

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
<td className={`status-${b.status}`}>
{b.status}
</td>

<td>

{b.status==="PENDING" && (

<button
className="cancel-btn"
onClick={()=>cancelBooking(b.id)}
>
Cancel
</button>

)}

</td>

</tr>

))}

</tbody>

</table>

</motion.div>

</div>

)

}

export default UserDashboard