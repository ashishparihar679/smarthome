import { useEffect, useState } from "react"
import API from "../api/api"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { FaUsers } from "react-icons/fa"

function AdminUsers(){

const [users,setUsers] = useState([])
const [services,setServices] = useState([])

const [loading,setLoading] = useState(false)
const [editId,setEditId] = useState(null)

/* FORM STATE */
const [form,setForm] = useState({
  username:"",
  password:"",
  firstName:"",
  lastName:"",
  email:"",
  phone:"",
  role:"USER",
  serviceId:""
})

/* FILTER + SEARCH */
const [search,setSearch] = useState("")
const [filterService,setFilterService] = useState("")

/* PAGINATION */
const [currentPage,setCurrentPage] = useState(1)
const usersPerPage = 5

useEffect(()=>{
  loadUsers()
  loadServices()
},[])

/* LOAD USERS */
const loadUsers = async ()=>{
try{
  const res = await API.get("users/")
  setUsers(res.data || [])
}catch{
  toast.error("Failed to load users")
}
}

/* LOAD SERVICES */
const loadServices = async ()=>{
try{
  const res = await API.get("services/")
  setServices(res.data || [])
}catch{
  toast.error("Failed to load services")
}
}

/* HANDLE INPUT */
const handleChange = (e)=>{
  setForm({...form,[e.target.name]:e.target.value})
}

/* ADD / UPDATE */
const submitUser = async ()=>{

if(!form.username){
  toast.warning("Username required")
  return
}

if(!editId && !form.password){
  toast.warning("Password required")
  return
}

if(form.role === "WORKER" && !form.serviceId){
  toast.warning("Select service")
  return
}

try{
  setLoading(true)

  const payload = {
    username:form.username,
    password:form.password,
    first_name:form.firstName,
    last_name:form.lastName,
    email:form.email,
    phone:form.phone,
    role:form.role,
    service: form.role === "WORKER" ? form.serviceId : null
  }

  if(editId){
    await API.put(`user/update/${editId}/`,payload)
    toast.success("User Updated")
  }else{
    await API.post("user/add/",payload)
    toast.success("User Added")
  }

  clearForm()
  loadUsers()

}catch{
  toast.error("Operation Failed")
}finally{
  setLoading(false)
}

}

/* EDIT */
const editUser = (u)=>{
  setEditId(u.id)
  setForm({
    username:u.username || "",
    password:"",
    firstName:u.first_name || "",
    lastName:u.last_name || "",
    email:u.email || "",
    phone:u.phone || "",
    role:u.role || "USER",
    serviceId:u.service || ""
  })

  window.scrollTo({top:0,behavior:"smooth"}) // 👈 FORM TOP PE
}

/* DELETE */
const deleteUser = async (id)=>{
const result = await Swal.fire({
  title:"Delete User?",
  icon:"warning",
  showCancelButton:true
})

if(result.isConfirmed){
  await API.delete(`user/delete/${id}/`)
  toast.success("Deleted")
  loadUsers()
}
}

/* CLEAR */
const clearForm = ()=>{
  setEditId(null)
  setForm({
    username:"",
    password:"",
    firstName:"",
    lastName:"",
    email:"",
    phone:"",
    role:"USER",
    serviceId:""
  })
}

/* FILTER + SEARCH LOGIC */
const filteredUsers = users.filter(u=>{
  return (
    (u.username.toLowerCase().includes(search.toLowerCase()) ||
     u.email?.toLowerCase().includes(search.toLowerCase())) &&
    (filterService ? u.service == filterService : true)
  )
})

/* PAGINATION */
const indexOfLast = currentPage * usersPerPage
const indexOfFirst = indexOfLast - usersPerPage
const currentUsers = filteredUsers.slice(indexOfFirst,indexOfLast)

const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

/* GET SERVICE NAME */
const getServiceName = (id)=>{
  const s = services.find(x=>x.id == id)
  return s ? s.name : "-"
}

return(

<div className="au-container">

<h1><FaUsers/> User Management</h1>


{/* 🧾 FORM */}
<motion.div className="au-card">

<h3>{editId ? "Edit User" : "Add User"}</h3>

<input name="username" value={form.username} onChange={handleChange} placeholder="Username"/>

{!editId && (
<input name="password" value={form.password} onChange={handleChange} placeholder="Password"/>
)}

<input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name"/>
<input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name"/>
<input name="email" value={form.email} onChange={handleChange} placeholder="Email"/>
<input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone"/>

<select name="role" value={form.role} onChange={handleChange}>
<option value="USER">User</option>
<option value="WORKER">Worker</option>
<option value="ADMIN">Admin</option>
</select>

{form.role === "WORKER" && (
<select name="serviceId" value={form.serviceId} onChange={handleChange}>
<option value="">Select Service</option>
{services.map(s=>(
<option key={s.id} value={s.id}>{s.name}</option>
))}
</select>
)}

<button onClick={submitUser}>
{loading ? "Processing..." : editId ? "Update User" : "Add User"}
</button>

{editId && <button onClick={clearForm}>Cancel</button>}

</motion.div>
<div className="au-filter-bar">

<input
className="au-search"
placeholder="Search username/email"
value={search}
onChange={(e)=>setSearch(e.target.value)}
/>

<select
className="au-select"
value={filterService}
onChange={(e)=>setFilterService(e.target.value)}
>
<option value="">All Services</option>
{services.map(s=>(
<option key={s.id} value={s.id}>{s.name}</option>
))}
</select>

</div>
{/* 📋 TABLE */}
<div className="au-table-wrapper">

<table className="au-table">

<thead>
<tr>
<th>ID</th>
<th>Username</th>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Role</th>
<th>Service</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{currentUsers.map(u=>(
<tr key={u.id}>
<td data-label="ID">{u.id}</td>
<td data-label="Username">{u.username}</td>
<td data-label="Name">{u.first_name} {u.last_name}</td>
<td data-label="Email">{u.email}</td>
<td data-label="Phone">{u.phone}</td>
<td data-label="Role">{u.role}</td>
<td data-label="Service">{getServiceName(u.service)}</td>

<td data-label="Action">
<button onClick={()=>editUser(u)}>Edit</button>
<button onClick={()=>deleteUser(u.id)}>Delete</button>
</td>
</tr>
))}

</tbody>

</table>

</div>

{/* 📄 PAGINATION */}
<div style={{marginTop:"10px"}}>
{[...Array(totalPages)].map((_,i)=>(
<button key={i} onClick={()=>setCurrentPage(i+1)}>
{i+1}
</button>
))}
</div>

</div>
)

}

export default AdminUsers