import { useState, useEffect } from "react";
import API from "../api/api";

import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import {
FaUser,
FaEnvelope,
FaLock,
FaPhone,
FaTools
} from "react-icons/fa";

function Signup(){

const navigate = useNavigate()

const [username,setUsername] = useState("");
const [password,setPassword] = useState("");
const [phone,setPhone] = useState("");
const [role,setRole] = useState("USER");

const [firstName,setFirstName] = useState("");
const [lastName,setLastName] = useState("");
const [email,setEmail] = useState("");

const [serviceId,setServiceId] = useState("");
const [services,setServices] = useState([]);

const [loading,setLoading] = useState(false);

useEffect(()=>{

API.get("services/")
.then(res=>{
setServices(res.data)
})

},[])


const submitSignup = (e)=>{

e.preventDefault();

if(!username || !password || !email){
toast.warning("Please fill required fields")
return
}

if(role === "WORKER" && !serviceId){
toast.warning("Please select service")
return
}

setLoading(true)

API.post("register/",{

username:username,
password:password,
phone:phone,
role:role,

first_name:firstName,
last_name:lastName,
email:email,

service:serviceId

})

.then(()=>{

toast.success("Account Created Successfully")

toast.info("Please login to continue")

/* redirect to login page */

navigate("/login")

setUsername("")
setPassword("")
setPhone("")
setFirstName("")
setLastName("")
setEmail("")
setRole("USER")
setServiceId("")

setLoading(false)

})

.catch(err=>{

setLoading(false)

if(err.response?.data?.username){
toast.error(err.response.data.username[0])
}
else if(err.response?.data?.email){
toast.error(err.response.data.email[0])
}
else{
toast.error("Signup Failed")
}

})

}

return(

<div className="signup-container">

<motion.div
className="signup-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Create Account</h2>

<form onSubmit={submitSignup}>

<div className="input-group">
<FaUser/>
<input
value={firstName}
placeholder="First Name"
onChange={(e)=>setFirstName(e.target.value)}
/>
</div>

<div className="input-group">
<FaUser/>
<input
value={lastName}
placeholder="Last Name"
onChange={(e)=>setLastName(e.target.value)}
/>
</div>

<div className="input-group">
<FaUser/>
<input
value={username}
placeholder="Username"
onChange={(e)=>setUsername(e.target.value)}
/>
</div>

<div className="input-group">
<FaEnvelope/>
<input
value={email}
type="email"
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>
</div>

<div className="input-group">
<FaLock/>
<input
value={password}
type="password"
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>
</div>

<div className="input-group">
<FaPhone/>
<input
value={phone}
placeholder="Phone"
onChange={(e)=>setPhone(e.target.value)}
/>
</div>

<select
className="role-select"
value={role}
onChange={(e)=>setRole(e.target.value)}
>

<option value="USER">User</option>
<option value="WORKER">Worker</option>
<option value="ADMIN">Admin</option>

</select>

{role === "WORKER" && (

<div className="input-group">

<FaTools/>

<select
value={serviceId}
onChange={(e)=>setServiceId(e.target.value)}
>

<option>Select Service</option>

{services.map(service=>(

<option key={service.id} value={service.id}>
{service.name}
</option>

))}

</select>

</div>

)}

{/* BUTTON GROUP */}

<div className="btn-group">

<button
className="signup-btn"
type="submit"
disabled={loading}
>
{loading ? "Creating..." : "Signup"}
</button>
<br />
<br />
<p>if you are already signup please login here</p>
<button
type="button"
className="login-btn"
onClick={()=>navigate("/login")}
>
Login
</button>

</div>

</form>

</motion.div>

</div>

)

}

export default Signup