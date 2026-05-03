import { useState, useEffect } from "react";
import API from "../api/api";

import { toast } from "react-toastify";
import { motion } from "framer-motion";

import { FaUserTie, FaPhone, FaTools } from "react-icons/fa";

function WorkerRegister(){

const [name,setName] = useState("")
const [phone,setPhone] = useState("")
const [service,setService] = useState("")

const [services,setServices] = useState([])
const [loading,setLoading] = useState(false)

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

const submitWorker = async ()=>{

if(!name || !phone || !service){
  toast.warning("Please fill all fields")
  return
}

if(phone.length < 10){
  toast.warning("Enter valid phone number")
  return
}

try{
  setLoading(true)

  await API.post("workers/",{
    name,
    phone,
    service,
    available:true,
    approved:false
  })

  toast.success("Worker Registration Successful")

  setName("")
  setPhone("")
  setService("")

}catch{
  toast.error("Registration Failed")
}finally{
  setLoading(false)
}

}

return(

<div className="wr-container">

<motion.div
className="wr-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Worker Registration 🛠️</h2>

{/* NAME */}

<div className="wr-input">
<FaUserTie/>
<input
placeholder="Enter Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>
</div>

{/* PHONE */}

<div className="wr-input">
<FaPhone/>
<input
placeholder="Enter Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>
</div>

{/* SERVICE */}

<div className="wr-input">
<FaTools/>
<select
value={service}
onChange={(e)=>setService(e.target.value)}
>
<option value="">Select Service</option>

{services.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>
</div>

{/* BUTTON */}

<button
className="wr-btn"
onClick={submitWorker}
disabled={loading}
>
{loading ? "Registering..." : "Register Worker"}
</button>

</motion.div>

</div>

)

}

export default WorkerRegister