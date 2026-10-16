import { useState, useEffect } from "react";
import API from "../api/api";

import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FormSelect from "../components/FormSelect";

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

/* LOAD SERVICES */

useEffect(()=>{
loadServices()
},[])

const loadServices = async ()=>{
try{
  const res = await API.get("services/")
  setServices(res.data || [])
}catch{
  toast.error("Failed to load services")
}
}

/* SUBMIT */

const submitSignup = async (e)=>{

e.preventDefault();

if(!username || !password || !email){
  toast.warning("Please fill required fields")
  return
}

if(password.length < 5){
  toast.warning("Password must be at least 5 characters")
  return
}

if(role === "WORKER" && !serviceId){
  toast.warning("Please select service")
  return
}

try{
  setLoading(true)

  await API.post("register/",{
    username,
    password,
    phone,
    role,
    first_name:firstName,
    last_name:lastName,
    email,
    service: role === "WORKER" ? serviceId : null
  })

  toast.success("Account Created Successfully")
  toast.info("Please login to continue")

  navigate("/login")

}catch(err){

  if(err.response?.data?.username){
    toast.error(err.response.data.username[0])
  }else if(err.response?.data?.email){
    toast.error(err.response.data.email[0])
  }else{
    toast.error("Signup Failed")
  }

}finally{
  setLoading(false)
}

}

return(

<div className="sg-container">

<motion.div
className="sg-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Create Account 🚀</h2>

<form onSubmit={submitSignup}>

<div className="sg-input"><FaUser/>
<input value={firstName} placeholder="First Name" onChange={(e)=>setFirstName(e.target.value)}/>
</div>

<div className="sg-input"><FaUser/>
<input value={lastName} placeholder="Last Name" onChange={(e)=>setLastName(e.target.value)}/>
</div>

<div className="sg-input"><FaUser/>
<input value={username} placeholder="Username" onChange={(e)=>setUsername(e.target.value)}/>
</div>

<div className="sg-input"><FaEnvelope/>
<input value={email} type="email" placeholder="Email" onChange={(e)=>setEmail(e.target.value)}/>
</div>

<div className="sg-input"><FaLock/>
<input value={password} type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)}/>
</div>

<div className="sg-input"><FaPhone/>
<input value={phone} placeholder="Phone" onChange={(e)=>setPhone(e.target.value)}/>
</div>

<div className="sg-role-field">
<span className="sg-role-icon"><FaUser aria-hidden="true" /></span>
<FormSelect
  id="signup-role"
  className="sg-role-select"
  name="account type"
  value={role}
  onChange={(e)=>setRole(e.target.value)}
  placeholder="Select account type"
  options={[
    { value: "USER", label: "User" },
    { value: "WORKER", label: "Worker" },
    { value: "ADMIN", label: "Admin" },
  ]}
/>
</div>

{role === "WORKER" && (

<div className="sg-input">

<FaTools/>

<FormSelect
  id="signup-service"
  name="service"
  value={serviceId}
  onChange={(e)=>setServiceId(e.target.value)}
  placeholder="Select Service"
  options={services.map((service)=>(
    { value: String(service.id), label: service.name }
  ))}
/>

</div>

)}

<div className="sg-btn-group">

<button className="sg-btn" type="submit" disabled={loading}>
{loading ? "Creating..." : "Signup"}
</button>

<button
type="button"
className="sg-btn secondary"
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
