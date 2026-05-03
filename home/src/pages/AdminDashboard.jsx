import { useEffect, useState } from "react";
import API from "../api/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { FaUsers, FaTools } from "react-icons/fa";

import {
BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

function AdminDashboard(){

const [services,setServices] = useState([])
const [workers,setWorkers] = useState([])
const [serviceName,setServiceName] = useState("")
const [loading,setLoading] = useState(false)

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

/* ================= LOAD ADMIN ================= */

const loadAdmin = async ()=>{
try{
  const res = await API.get(`user/profile/${adminId}/`)
  const data = res.data

  setAdmin(data)
  setFirstName(data.first_name || "")
  setLastName(data.last_name || "")
  setEmail(data.email || "")
  setPhone(data.phone || "")

}catch(err){
  toast.error("Failed to load profile")
}
}

/* ================= LOAD SERVICES ================= */

const loadServices = async ()=>{
try{
  const res = await API.get("services/")
  setServices(res.data || [])
}catch{
  toast.error("Failed to load services")
}
}

/* ================= LOAD WORKERS ================= */

const loadWorkers = async ()=>{
try{
  const res = await API.get("workers/")
  setWorkers(res.data || [])
}catch{
  toast.error("Failed to load workers")
}
}

/* ================= ADD SERVICE ================= */

const addService = async ()=>{

if(!serviceName.trim()){
  toast.warning("Enter service name")
  return
}

try{
  setLoading(true)

  await API.post("services/",{name:serviceName})

  toast.success("Service Added")

  setServiceName("")
  loadServices()

}catch{
  toast.error("Failed to add service")
}finally{
  setLoading(false)
}
}

/* ================= DELETE ================= */

const deleteService = async (id)=>{

const result = await Swal.fire({
  title:"Delete Service?",
  text:"This action cannot be undone",
  icon:"warning",
  showCancelButton:true,
  confirmButtonColor:"#e74c3c"
})

if(result.isConfirmed){

  try{
    await API.delete(`services/delete/${id}/`)
    toast.success("Service Deleted")
    loadServices()
  }catch{
    toast.error("Delete failed")
  }

}
}

/* ================= APPROVE WORKER ================= */

const approveWorker = async (id)=>{

try{
  await API.put(`worker/approve/${id}/`)
  toast.success("Worker Approved")
  loadWorkers()
}catch{
  toast.error("Approval failed")
}
}

/* ================= UPDATE ADMIN ================= */

const updateAdmin = async ()=>{

if(!firstName || !email){
  toast.warning("Name & Email required")
  return
}

try{
  await API.put(`user/profile/${adminId}/`,{
    first_name:firstName,
    last_name:lastName,
    email:email,
    phone:phone
  })

  toast.success("Profile Updated")
  setEdit(false)

}catch{
  toast.error("Update failed")
}
}

/* ================= CHART ================= */

const chartData = [
{name:"Services",value:services.length},
{name:"Workers",value:workers.length}
]

return(

<div className="admin-container">

<h1 className="admin-title">Admin Dashboard</h1>

{/* ===== ANALYTICS ===== */}

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

{/* ===== CHART ===== */}

<div className="chart-card">
<h3>Platform Overview</h3>

<ResponsiveContainer width="100%" height={250}>
<BarChart data={chartData}>
<XAxis dataKey="name"/>
<YAxis/>
<Tooltip/>
<Bar dataKey="value" fill="#2563eb"/>
</BarChart>
</ResponsiveContainer>

</div>

{/* ===== PROFILE ===== */}

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

<button onClick={()=>setEdit(true)}>Edit Profile</button>
</div>

) : (

<div>

<input value={firstName} onChange={(e)=>setFirstName(e.target.value)} placeholder="First Name"/>
<input value={lastName} onChange={(e)=>setLastName(e.target.value)} placeholder="Last Name"/>
<input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email"/>
<input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone"/>

<button onClick={updateAdmin}>Save</button>

</div>

)}

</motion.div>

{/* ===== SERVICES ===== */}

<div className="admin-card">

<h3>Services</h3>

<div className="service-add">

<input
placeholder="Enter service name"
value={serviceName}
onChange={(e)=>setServiceName(e.target.value)}
/>

<button onClick={addService}>
{loading ? "Adding..." : "Add"}
</button>

</div>

{services.length === 0 ? (
<p>No services available</p>
) : (

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

)}

</div>

{/* ===== WORKERS ===== */}

<div className="admin-card">

<h3>Workers</h3>

{workers.length === 0 ? (
<p>No workers available</p>
) : (

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

)}

</div>

</div>

)

}

export default AdminDashboard