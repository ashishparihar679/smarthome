import { useEffect, useState } from "react"
import API from "../api/api"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { FaUsers } from "react-icons/fa"

function AdminUsers(){

const [users,setUsers] = useState([])
const [loading,setLoading] = useState(false)

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")
const [role,setRole] = useState("USER")

const [editId,setEditId] = useState(null)

useEffect(()=>{
  loadUsers()
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

/* ADD USER */

const addUser = async ()=>{

if(!username || !password){
  toast.warning("Username and Password required")
  return
}

try{
  setLoading(true)

  await API.post("user/add/",{
    username,
    password,
    first_name:firstName,
    last_name:lastName,
    email,
    phone,
    role
  })

  toast.success("User Added")
  clearForm()
  loadUsers()

}catch{
  toast.error("Error adding user")
}finally{
  setLoading(false)
}

}

/* EDIT */

const editUser = (user)=>{
  setEditId(user.id)
  setUsername(user.username || "")
  setFirstName(user.first_name || "")
  setLastName(user.last_name || "")
  setEmail(user.email || "")
  setPhone(user.phone || "")
  setRole(user.role || "USER")
}

/* UPDATE */

const updateUser = async ()=>{

try{
  await API.put(`user/update/${editId}/`,{
    username,
    first_name:firstName,
    last_name:lastName,
    email,
    phone,
    role
  })

  toast.success("User Updated")
  clearForm()
  loadUsers()

}catch{
  toast.error("Update Failed")
}

}

/* DELETE */

const deleteUser = async (id)=>{

const result = await Swal.fire({
  title:"Delete User?",
  text:"This action cannot be undone",
  icon:"warning",
  showCancelButton:true,
  confirmButtonColor:"#e74c3c"
})

if(result.isConfirmed){
  try{
    await API.delete(`user/delete/${id}/`)
    toast.success("User Deleted")
    loadUsers()
  }catch{
    toast.error("Delete Failed")
  }
}

}

/* CLEAR */

const clearForm = ()=>{
  setEditId(null)
  setUsername("")
  setPassword("")
  setFirstName("")
  setLastName("")
  setEmail("")
  setPhone("")
  setRole("USER")
}

return(

<div className="au-container">

<h1 className="au-title">
<FaUsers/> User Management
</h1>

{/* ===== STATS ===== */}

<div className="au-stats">

<div className="au-stat">
<h3>{users.length}</h3>
<p>Total Users</p>
</div>

<div className="au-stat">
<h3>{users.filter(u=>u.role==="USER").length}</h3>
<p>Customers</p>
</div>

<div className="au-stat">
<h3>{users.filter(u=>u.role==="WORKER").length}</h3>
<p>Workers</p>
</div>

</div>

{/* ===== FORM ===== */}

<motion.div
className="au-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
>

<h3>{editId ? "Edit User" : "Add User"}</h3>

<input value={username} placeholder="Username" onChange={(e)=>setUsername(e.target.value)}/>

{!editId && (
<input type="password" value={password} placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
)}

<input value={firstName} placeholder="First Name" onChange={(e)=>setFirstName(e.target.value)}/>
<input value={lastName} placeholder="Last Name" onChange={(e)=>setLastName(e.target.value)}/>
<input value={email} placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
<input value={phone} placeholder="Phone" onChange={(e)=>setPhone(e.target.value)}/>

<select value={role} onChange={(e)=>setRole(e.target.value)}>
<option value="USER">User</option>
<option value="WORKER">Worker</option>
<option value="ADMIN">Admin</option>
</select>

<button onClick={editId ? updateUser : addUser}>
{loading ? "Processing..." : editId ? "Update User" : "Add User"}
</button>

</motion.div>

{/* ===== TABLE ===== */}

<table className="au-table">

<thead>
<tr>
<th>ID</th>
<th>Username</th>
<th>Name</th>
<th>Email</th>
<th>Phone</th>
<th>Role</th>
<th>Action</th>
</tr>
</thead>

<tbody>

{users.length === 0 ? (
<tr><td colSpan="7">No users available</td></tr>
) : (

users.map(u=>(
<tr key={u.id}>
<td>{u.id}</td>
<td>{u.username}</td>
<td>{u.first_name} {u.last_name}</td>
<td>{u.email}</td>
<td>{u.phone}</td>
<td>{u.role}</td>

<td>
<button className="au-edit" onClick={()=>editUser(u)}>Edit</button>
<button className="au-delete" onClick={()=>deleteUser(u.id)}>Delete</button>
</td>
</tr>
))

)}

</tbody>

</table>

</div>

)

}

export default AdminUsers