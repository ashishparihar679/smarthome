import { useState, useEffect } from "react";
import API from "../api/api";

import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import FormSelect from "../components/FormSelect";
import { getApiErrorMessage, isValidEmail, isValidPhone, isValidUsername } from "../utils/validation";

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

if(!username || !password || !email || !phone){
  toast.warning("Please fill required fields")
  return
}

if(password.length < 8){
  toast.warning("Password must be at least 8 characters")
  return
}

if (!isValidEmail(email)) { toast.warning("Enter a valid email address"); return; }
if (!isValidPhone(phone)) { toast.warning("Enter a valid phone number (7–15 digits)"); return; }
if (username.trim().length > 150) { toast.warning("Username cannot exceed 150 characters"); return; }
if (!isValidUsername(username)) { toast.warning("Username can use letters, numbers, @, ., +, -, _, and /"); return; }

if(role === "WORKER" && !serviceId){
  toast.warning("Please select service")
  return
}

try{
  setLoading(true)

  await API.post("register/",{
    username: username.trim(),
    password,
    phone: phone.trim(),
    role,
    first_name:firstName,
    last_name:lastName,
    email: email.trim(),
    service: role === "WORKER" ? serviceId : null
  })

  toast.success("Account Created Successfully")
  toast.info("Please login to continue")

  navigate("/login")

}catch(err){
  const errors = err.response?.data;
  const firstError = errors && Object.values(errors).flat(Infinity).find((value) => typeof value === "string");
  toast.error(firstError || getApiErrorMessage(err, "Signup failed. Check the form and try again."));

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
<input value={firstName} placeholder="First Name" maxLength={150} onChange={(e)=>setFirstName(e.target.value)}/>
</div>

<div className="sg-input"><FaUser/>
<input value={lastName} placeholder="Last Name" maxLength={150} onChange={(e)=>setLastName(e.target.value)}/>
</div>

<div className="sg-input"><FaUser/>
<input value={username} placeholder="Username" maxLength={150} onChange={(e)=>setUsername(e.target.value)} required />
</div>

<div className="sg-input"><FaEnvelope/>
<input value={email} type="email" maxLength={254} placeholder="Email" onChange={(e)=>setEmail(e.target.value)} required />
</div>

<div className="sg-input"><FaLock/>
<input value={password} type="password" minLength={8} placeholder="Password (at least 8 characters)" onChange={(e)=>setPassword(e.target.value)} required />
</div>

<div className="sg-input"><FaPhone/>
<input value={phone} type="tel" maxLength={15} inputMode="tel" placeholder="Phone" onChange={(e)=>setPhone(e.target.value)} required />
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
