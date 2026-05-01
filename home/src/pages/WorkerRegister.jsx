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

// services load
useEffect(()=>{

API.get("services/")
.then(res=>{
setServices(res.data)
})

},[])

// submit worker
const submitWorker = ()=>{

if(!name || !phone || !service){
toast.warning("Please fill all fields")
return
}

setLoading(true)

API.post("workers/",{

name:name,
phone:phone,
service:service,
available:true,
approved:false

})
.then(()=>{

toast.success("Worker Registration Successful")

setName("")
setPhone("")
setService("")
setLoading(false)

})
.catch(err=>{

toast.error("Registration Failed")
setLoading(false)

})

}

return(

<div className="worker-register-container">

<motion.div
className="worker-register-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Worker Registration</h2>

<div className="input-group">

<FaUserTie/>

<input
placeholder="Enter Name"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

</div>

<div className="input-group">

<FaPhone/>

<input
placeholder="Enter Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
/>

</div>


<div className="input-group">

<FaTools/>

<select
value={service}
onChange={(e)=>setService(e.target.value)}
>

<option value="">Select Service</option>

{services.map(service=>(

<option key={service.id} value={service.id}>
{service.name}
</option>

))}

</select>

</div>


<button
className="worker-register-btn"
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