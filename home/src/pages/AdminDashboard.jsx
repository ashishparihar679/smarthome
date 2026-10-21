import { useEffect, useState } from "react";
import API from "../api/api";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getApiErrorMessage, isValidEmail, isValidPhone } from "../utils/validation";
import Swal from "sweetalert2";
import { FaUsers, FaTools } from "react-icons/fa";

import {
BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

function AdminDashboard(){

const [services,setServices] = useState([])
const [cities,setCities] = useState([])
const [workers,setWorkers] = useState([])
const [serviceName,setServiceName] = useState("")
const [cityName,setCityName] = useState("")
const [loading,setLoading] = useState(false)
const [cityLoading,setCityLoading] = useState(false)

const [admin,setAdmin] = useState({})
const [edit,setEdit] = useState(false)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

const adminId = localStorage.getItem("user_id")

useEffect(()=>{
  loadServices()
  loadCities()
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

const loadCities = async ()=>{
try{
  const res = await API.get("cities/")
  setCities(res.data || [])
}catch{
  toast.error("Failed to load cities")
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
if (serviceName.trim().length > 100) { toast.warning("Service name must be 100 characters or fewer"); return; }
if (services.some((service) => service.name.toLowerCase() === serviceName.trim().toLowerCase())) { toast.warning("That service already exists"); return; }

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

const addCity = async ()=>{
if(!cityName.trim()){
  toast.warning("Enter city name")
  return
}
if (cityName.trim().length > 100) { toast.warning("City name must be 100 characters or fewer"); return; }
if (cities.some((city) => city.name.toLowerCase() === cityName.trim().toLowerCase())) { toast.warning("That city already exists"); return; }
try{
  setCityLoading(true)
  await API.post("cities/", {name: cityName.trim()})
  toast.success("City Added")
  setCityName("")
  loadCities()
}catch(err){
  const apiError = err.response?.data
  const message = apiError?.name?.[0] || apiError?.detail || apiError?.error || (typeof apiError === "string" ? apiError : null)
  toast.error(message || (err.response ? `Failed to add city (${err.response.status})` : "Cannot reach the server. Check that the backend is running."))
}finally{
  setCityLoading(false)
}
}

const deleteCity = async (id)=>{
const result = await Swal.fire({
  title:"Delete City?",
  text:"This city will be removed from the city list.",
  icon:"warning",
  showCancelButton:true,
  confirmButtonColor:"#e74c3c"
})
if(!result.isConfirmed) return
try{
  await API.delete(`cities/delete/${id}/`)
  toast.success("City Deleted")
  loadCities()
}catch{
  toast.error("Could not delete city")
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

const toggleWorkerAvailability = async (worker)=>{
try{
  const res = await API.put(`worker/availability/${worker.id}/`)
  setWorkers(current => current.map(item => item.id === worker.id ? {...item, available: res.data.available} : item))
  toast.success(res.data.available ? "Worker marked available" : "Worker marked unavailable")
}catch{
  toast.error("Could not update worker availability")
}
}

/* ================= UPDATE ADMIN ================= */

const updateAdmin = async ()=>{

if(!firstName.trim() || firstName.trim().length > 150 || lastName.trim().length > 150){
  toast.warning("Enter a first name and keep each name within 150 characters")
  return
}
if (!isValidEmail(email)) { toast.warning("Enter a valid email address"); return; }
if (!isValidPhone(phone)) { toast.warning("Enter a valid phone number (7–15 digits)"); return; }

try{
  await API.put(`user/profile/${adminId}/`,{
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

<input value={firstName} maxLength={150} onChange={(e)=>setFirstName(e.target.value)} placeholder="First Name" required />
<input value={lastName} maxLength={150} onChange={(e)=>setLastName(e.target.value)} placeholder="Last Name"/>
<input value={email} type="email" maxLength={254} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
<input value={phone} type="tel" maxLength={15} inputMode="tel" onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" required />

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
maxLength={100}
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

{/* ===== CITIES ===== */}
<div className="admin-card">
<h3>Cities</h3>
<div className="service-add">
<input
  placeholder="Enter city name"
  maxLength={100}
  value={cityName}
  onChange={(e)=>setCityName(e.target.value)}
  onKeyDown={(e)=>{if(e.key === "Enter") addCity()}}
/>
<button onClick={addCity} disabled={cityLoading}>
{cityLoading ? "Adding..." : "Add"}
</button>
</div>
{cities.length === 0 ? <p>No cities added yet</p> : (
<div className="services-grid">
{cities.map(city=>(
<div className="service-card" key={city.id}>
<h4>{city.name}</h4>
<button className="delete-btn" onClick={()=>deleteCity(city.id)}>Delete</button>
</div>
))}
</div>
)}
</div>

{/* ===== WORKERS ===== */}

<div className="admin-card">

<h3>Workers</h3>
<div className="worker-summary" aria-label="Worker approval summary">
<span>{workers.length} total</span>
<span>{workers.filter(w=>w.approved).length} approved</span>
<span>{workers.filter(w=>!w.approved).length} pending approval</span>
</div>

{workers.length === 0 ? (
<p>No workers available</p>
) : (

<div className="workers-grid">

{workers.map(w=>(

<div className="worker-card" key={w.id}>

<h4>{w.name}</h4>
<p>{w.phone}</p>
<p className="worker-service">{services.find(service => service.id === w.service)?.name || "Service not set"}</p>

<div className="worker-statuses">
<span className={`worker-status ${w.approved ? "is-approved":"is-pending"}`}>{w.approved ? "Approved":"Pending approval"}</span>
{w.approved && <span className={`worker-status ${w.available ? "is-available":"is-unavailable"}`}>{w.available ? "Available":"Unavailable"}</span>}
</div>

<div className="worker-actions">
<a className="worker-contact-btn" href={`tel:${w.phone}`}>Call worker</a>
{!w.approved && (
<button
className="approve-btn"
onClick={()=>approveWorker(w.id)}
>
Approve
</button>
)}
{w.approved && <button className="availability-btn" onClick={()=>toggleWorkerAvailability(w)}>{w.available ? "Mark unavailable":"Mark available"}</button>}
</div>

</div>

))}

</div>

)}

</div>

</div>

)

}

export default AdminDashboard
