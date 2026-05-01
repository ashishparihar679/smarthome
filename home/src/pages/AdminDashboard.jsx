import { useEffect, useState } from "react";
import API from "../api/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaUsers, FaTools } from "react-icons/fa";

import {
BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

// import "./AdminDashboard.css";

function AdminDashboard(){

const [services,setServices] = useState([])
const [workers,setWorkers] = useState([])
const [serviceName,setServiceName] = useState("")

const [admin,setAdmin] = useState({})
const [edit,setEdit] = useState(false)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

const adminId = localStorage.getItem("user_id")

useEffect(()=>{
loadServices()
loadWorkers()
loadAdmin()
},[])

const loadAdmin = async ()=>{
try{
const res = await API.get(`user/profile/${adminId}/`)
setAdmin(res.data)

setFirstName(res.data.first_name)
setLastName(res.data.last_name)
setEmail(res.data.email)
setPhone(res.data.phone)

}catch(err){
console.log(err)
}
}

const loadServices = async ()=>{
try{
const res = await API.get("services/")
setServices(res.data)
}catch(err){
console.log(err)
}
}

const loadWorkers = async ()=>{
try{
const res = await API.get("workers/")
setWorkers(res.data)
}catch(err){
console.log(err)
}
}

/* ADD SERVICE */

const addService = async ()=>{

if(!serviceName.trim()){
toast.warning("Enter service name")
return
}

try{

await API.post("services/",{name:serviceName})

toast.success("Service Added")

setServiceName("")
loadServices()

}catch(err){
toast.error("Failed")
}
}

/* DELETE SERVICE */

const deleteService = async (id)=>{

Swal.fire({
title:"Delete Service?",
text:"This action cannot be undone",
icon:"warning",
showCancelButton:true,
confirmButtonColor:"#e74c3c"
}).then(async(result)=>{

if(result.isConfirmed){

await API.delete(`services/delete/${id}/`)
toast.success("Service Deleted")
loadServices()

}

})

}

/* APPROVE WORKER */

const approveWorker = async (id)=>{

try{

await API.put(`worker/approve/${id}/`)

toast.success("Worker Approved")

loadWorkers()

}catch(err){
toast.error("Error approving worker")
}

}

/* UPDATE ADMIN */

const updateAdmin = async ()=>{

try{

await API.put(`user/profile/${adminId}/`,{

first_name:firstName,
last_name:lastName,
email:email,
phone:phone

})

toast.success("Profile Updated")

setEdit(false)

}catch(err){
toast.error("Update Failed")
}

}

/* CHART DATA */

const chartData = [
{name:"Services",value:services.length},
{name:"Workers",value:workers.length}
]

return(

<div className="admin-container">

<h1 className="admin-title">Admin Dashboard</h1>


{/* ANALYTICS */}

<div className="analytics-grid">

<div className="analytics-card">
<FaTools className="analytics-icon"/>
<h3>{services.length}</h3>
<p>Total Services</p>
</div>

<div className="analytics-card">
<FaUsers className="analytics-icon"/>
<h3>{workers.length}</h3>
<p>Total Workers</p>
</div>

</div>


{/* CHART */}

<div className="chart-card">

<h3>Platform Overview</h3>

<ResponsiveContainer width="100%" height={250}>

<BarChart data={chartData}>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="value" fill="#4a90e2"/>

</BarChart>

</ResponsiveContainer>

</div>


{/* PROFILE */}

<motion.div
className="admin-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
>

<h3>Admin Profile</h3>

{!edit ? (

<div>

<p><b>Name:</b> {admin.first_name} {admin.last_name}</p>
<p><b>Email:</b> {admin.email}</p>

<button onClick={()=>setEdit(true)}>
Edit Profile
</button>

</div>

) : (

<div>

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

<button onClick={updateAdmin}>
Save
</button>

</div>

)}

</motion.div>


{/* SERVICES */}

<div className="admin-card">

<h3>Services</h3>

<div className="service-add">

<input
placeholder="Enter service name"
value={serviceName}
onChange={(e)=>setServiceName(e.target.value)}
/>

<button onClick={addService}>
Add
</button>

</div>

<div className="services-grid">

{services.map(s=>(

<div className="service-card" key={s.id}>

<h4>{s.name}</h4>

<button
className="delete-btn"
onClick={()=>deleteService(s.id)}
>
Delete
</button>

</div>

))}

</div>

</div>


{/* WORKERS */}

<div className="admin-card">

<h3>Workers</h3>

<div className="workers-grid">

{workers.map(w=>(

<div className="worker-card" key={w.id}>

<h4>{w.name}</h4>

<p>{w.phone}</p>

<p className={w.approved ? "approved":"pending"}>

{w.approved ? "Approved":"Pending"}

</p>

{!w.approved && (

<button
className="approve-btn"
onClick={()=>approveWorker(w.id)}
>
Approve
</button>

)}

</div>

))}

</div>

</div>

</div>

)

}

export default AdminDashboard