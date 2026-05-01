import { useEffect, useState } from "react"
import API from "../api/api"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import { FaUsers } from "react-icons/fa"
// import "./AdminUsers.css"

function AdminUsers(){

const [users,setUsers] = useState([])

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

const loadUsers = ()=>{

API.get("users/")
.then(res=>{
setUsers(res.data)
})
.catch(err=>{
toast.error("Failed to load users")
})

}

/* ADD USER */

const addUser = ()=>{

if(!username || !password){
toast.warning("Username and Password required")
return
}

API.post("user/add/",{

username:username,
password:password,
first_name:firstName,
last_name:lastName,
email:email,
phone:phone,
role:role

})
.then(()=>{

toast.success("User Added")

clearForm()
loadUsers()

})
.catch(()=>{
toast.error("Error adding user")
})

}

/* EDIT USER */

const editUser = (user)=>{

setEditId(user.id)

setUsername(user.username)
setFirstName(user.first_name)
setLastName(user.last_name)
setEmail(user.email)
setPhone(user.phone)
setRole(user.role)

}

/* UPDATE USER */

const updateUser = ()=>{

API.put(`user/update/${editId}/`,{

username:username,
first_name:firstName,
last_name:lastName,
email:email,
phone:phone,
role:role

})
.then(()=>{

toast.success("User Updated")

clearForm()
loadUsers()

})
.catch(()=>{
toast.error("Update Failed")
})

}

/* DELETE USER */

const deleteUser = (id)=>{

Swal.fire({
title:"Delete User?",
text:"This action cannot be undone",
icon:"warning",
showCancelButton:true,
confirmButtonColor:"#e74c3c"
}).then((result)=>{

if(result.isConfirmed){

API.delete(`user/delete/${id}/`)
.then(()=>{

toast.success("User Deleted")
loadUsers()

})

}

})

}

/* CLEAR FORM */

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

<div className="admin-users">

<h1 className="admin-title">
<FaUsers/> User Management
</h1>


{/* USER STATS */}

<div className="user-stats">

<div className="stat-card">
<h3>{users.length}</h3>
<p>Total Users</p>
</div>

<div className="stat-card">
<h3>{users.filter(u=>u.role==="USER").length}</h3>
<p>Customers</p>
</div>

<div className="stat-card">
<h3>{users.filter(u=>u.role==="WORKER").length}</h3>
<p>Workers</p>
</div>

</div>


{/* ADD / EDIT FORM */}

<motion.div
className="card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
>

<h3>{editId ? "Edit User" : "Add User"}</h3>

<input
value={username}
placeholder="Username"
onChange={(e)=>setUsername(e.target.value)}
/>

{!editId && (

<input
type="password"
value={password}
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

)}

<input
value={firstName}
placeholder="First Name"
onChange={(e)=>setFirstName(e.target.value)}
/>

<input
value={lastName}
placeholder="Last Name"
onChange={(e)=>setLastName(e.target.value)}
/>

<input
value={email}
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

<input
value={phone}
placeholder="Phone"
onChange={(e)=>setPhone(e.target.value)}
/>

<select
value={role}
onChange={(e)=>setRole(e.target.value)}
>

<option value="USER">User</option>
<option value="WORKER">Worker</option>
<option value="ADMIN">Admin</option>

</select>

{editId ? (

<button onClick={updateUser}>
Update User
</button>

) : (

<button onClick={addUser}>
Add User
</button>

)}

</motion.div>


{/* USERS TABLE */}

<table className="table">

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

{users.map((u)=>(
<motion.tr
key={u.id}
initial={{opacity:0}}
animate={{opacity:1}}
>

<td>{u.id}</td>
<td>{u.username}</td>
<td>{u.first_name} {u.last_name}</td>
<td>{u.email}</td>
<td>{u.phone}</td>
<td>{u.role}</td>

<td>

<button
className="edit-btn"
onClick={()=>editUser(u)}
>
Edit
</button>

<button
className="delete-btn"
onClick={()=>deleteUser(u.id)}
>
Delete
</button>

</td>

</motion.tr>
))}

</tbody>

</table>

</div>

)

}

export default AdminUsers