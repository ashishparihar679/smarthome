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
const [edit,setEdit] = useState(false)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

useEffect(()=>{

API.get(`user/profile/${workerId}/`)
.then(res=>{
setProfile(res.data)

setFirstName(res.data.first_name)
setLastName(res.data.last_name)
setEmail(res.data.email)
setPhone(res.data.phone)
})

API.get(`worker/bookings/?worker=${workerId}`)
.then(res=>{
setBookings(res.data)
})

},[])


const updateProfile = ()=>{

API.put(`user/profile/${workerId}/`,{

first_name:firstName,
last_name:lastName,
email:email,
phone:phone

})
.then(()=>{
toast.success("Profile Updated")

setProfile({
...profile,
first_name:firstName,
last_name:lastName,
email:email,
phone:phone
})

setEdit(false)
})

}

const acceptBooking = (id)=>{

Swal.fire({
title:"Accept Booking?",
icon:"question",
showCancelButton:true
}).then((result)=>{

if(result.isConfirmed){

API.put(`booking/accept/${id}/`)
.then(()=>{

toast.success("Booking Accepted")

setBookings(bookings.map(b=>
b.id===id ? {...b,status:"ACCEPTED"} : b
))

})

}

})

}

const rejectBooking = (id)=>{

Swal.fire({
title:"Reject Booking?",
icon:"warning",
showCancelButton:true
}).then((result)=>{

if(result.isConfirmed){

API.put(`booking/reject/${id}/`)
.then(()=>{

toast.error("Booking Rejected")

setBookings(bookings.map(b=>
b.id===id ? {...b,status:"REJECTED"} : b
))

})

}

})

}

const completeBooking = (id)=>{

API.put(`booking/complete/${id}/`)
.then(()=>{

toast.success("Service Completed")

setBookings(bookings.map(b=>
b.id===id ? {...b,status:"COMPLETED"} : b
))

})

}

const logout = ()=>{
localStorage.clear()
window.location.href="/login"
}

return(

<div className="worker-dashboard">

<h1>Worker Dashboard</h1>

<button className="logout-btn" onClick={logout}>
Logout
</button>


{/* STATS */}

<div className="worker-stats">

<div className="stat-card">
<FaUserTie/>
<h3>{profile.first_name}</h3>
<p>Worker Profile</p>
</div>

<div className="stat-card">
<FaTools/>
<h3>{bookings.length}</h3>
<p>Total Requests</p>
</div>

</div>


{/* PROFILE */}

<motion.div
className="dashboard-card"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
>

<h2>Worker Profile</h2>

{!edit ? (

<div>

<p><b>Name:</b> {profile.first_name} {profile.last_name}</p>
<p><b>Email:</b> {profile.email}</p>
<p><b>Phone:</b> {profile.phone}</p>

<button onClick={()=>setEdit(true)}>
Edit Profile
</button>

</div>

) : (

<div className="edit-form">

<input
value={firstName}
onChange={(e)=>setFirstName(e.target.value)}
/>

<input
value={lastName}
onChange={(e)=>setLastName(e.target.value)}
/>

<input
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<input
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>

<button onClick={updateProfile}>
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

<h2>Service Requests</h2>

<table className="dashboard-table">

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

{bookings.map((b)=>(

<tr key={b.id}>

<td>{b.id}</td>
<td>{b.service_name}</td>
<td>{b.booking_date}</td>
<td>{b.address}</td>

<td className={`status-${b.status}`}>
{b.status}
</td>

<td>

{b.status==="PENDING" && (

<>
<button
className="accept-btn"
onClick={()=>acceptBooking(b.id)}
>
Accept
</button>

<button
className="reject-btn"
onClick={()=>rejectBooking(b.id)}
>
Reject
</button>
</>

)}

{b.status==="ACCEPTED" && (

<button
className="complete-btn"
onClick={()=>completeBooking(b.id)}
>
Complete
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

export default WorkerDashboard