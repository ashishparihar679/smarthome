import React,{useEffect,useState} from "react"
import API from "../api/api"

import { motion } from "framer-motion"
import { FaUserTie, FaPhone, FaTools } from "react-icons/fa"

import Skeleton from "react-loading-skeleton"
import "react-loading-skeleton/dist/skeleton.css"

function Workers(){

const [workers,setWorkers] = useState([])
const [loading,setLoading] = useState(true)

useEffect(()=>{

API.get("workers/")
.then(res=>{
setWorkers(res.data)
setLoading(false)
})

},[])

return(

<div className="workers-container">

<h2 className="workers-title">Our Professionals</h2>

<div className="workers-grid">

{loading ?

Array(6).fill().map((_,i)=>(
<Skeleton key={i} height={180}/>
))

:

workers.map(worker=>(

<motion.div
key={worker.id}
className="worker-card"
initial={{opacity:0,y:30}}
animate={{opacity:1,y:0}}
transition={{duration:0.3}}
whileHover={{scale:1.05}}
>

<div className="worker-avatar">
<FaUserTie/>
</div>

<h3>{worker.name}</h3>

<p className="worker-service">
<FaTools/> {worker.service_name}
</p>

<p className="worker-phone">
<FaPhone/> {worker.phone}
</p>

</motion.div>

))

}

</div>

</div>

)

}

export default Workers