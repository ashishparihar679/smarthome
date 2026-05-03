import React,{useEffect,useState} from "react"
import API from "../api/api"

import { motion } from "framer-motion"
import { FaUserTie, FaPhone, FaTools } from "react-icons/fa"

import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"
import { toast } from "react-toastify"

function Workers(){

const [workers,setWorkers] = useState([])
const [loading,setLoading] = useState(true)

/* LOAD WORKERS */

useEffect(()=>{
loadWorkers()
},[])

const loadWorkers = async ()=>{
try{
  const res = await API.get("workers/")
  setWorkers(res.data || [])
}catch{
  toast.error("Failed to load workers")
}finally{
  setLoading(false)
}
}

return(

<div className="wk-container">

<h2 className="wk-title">Our Professionals 👷</h2>

<div className="wk-grid">

{loading ? (

Array(6).fill().map((_,i)=>(
<Skeleton key={i} height={180}/>
))

) : workers.length === 0 ? (

<p className="wk-empty">No workers available</p>

) : (

workers.map(worker=>(

<motion.div
key={worker.id}
className="wk-card"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.3}}
whileHover={{scale:1.05}}
>

<div className="wk-avatar">
<FaUserTie/>
</div>

<h3>{worker.name}</h3>

<p className="wk-service">
<FaTools/> {worker.service_name}
</p>

<p className="wk-phone">
<FaPhone/> {worker.phone}
</p>

</motion.div>

))

)}

</div>

</div>

)

}

export default Workers