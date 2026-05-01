import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FaTools, FaPlus } from "react-icons/fa";
// import "./Add.css";

function Add() {

const [name,setName] = useState("");

const handleSubmit = async (e)=>{

e.preventDefault();

if(!name){
toast.warning("Please select a service");
return;
}

const data = {
name:name
};

try{

await axios.post("http://127.0.0.1:8000/services",data);

toast.success("Service Added Successfully");

setName("");

}catch(err){

toast.error("Failed to add service");

}

};

return(

<div className="add-service-container">

<motion.div
className="add-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2 className="add-title">
<FaTools/> Add Service
</h2>

<form onSubmit={handleSubmit}>

<select
value={name}
onChange={(e)=>setName(e.target.value)}
className="service-select"
>

<option value="">Select Service</option>

<option value="Painter">🎨 Painter</option>

<option value="Electrician">⚡ Electrician</option>

<option value="Sweeper">🧹 Sweeper</option>

<option value="Welder">🔩 Welder</option>

<option value="Labour">👷 Labour</option>

</select>

<button
type="submit"
className="add-btn"
>

<FaPlus/> Add Service

</button>

</form>

</motion.div>

</div>

)

}

export default Add;