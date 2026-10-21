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
const [expandedWorker,setExpandedWorker] = useState(null)
const [reviewSummaries,setReviewSummaries] = useState({})

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

const toggleReviews = async (workerId) => {
  if (expandedWorker === workerId) { setExpandedWorker(null); return; }
  setExpandedWorker(workerId);
  if (reviewSummaries[workerId]) return;
  try {
    const { data } = await API.get(`professionals/${workerId}/reviews/`);
    setReviewSummaries((current) => ({ ...current, [workerId]: data }));
  } catch { toast.error("Could not load professional reviews"); }
};

return(

<div className="wk-container">

<h2 className="wk-title">Our Experts & Professionals</h2>

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
{worker.profile_photo ? <img src={worker.profile_photo} alt={`${worker.name} profile`} /> :
<FaUserTie/>
}
</div>

<h3>{worker.name}</h3>

<p className="wk-service">
<FaTools/> {worker.service_name}
</p>

<p className="wk-rating" aria-label={`Average rating ${worker.average_rating} out of 5`}>
★ {Number(worker.average_rating || 0).toFixed(1)}/5 · {worker.rating_count || 0} reviews
</p>
<p>{worker.experience || 0} years experience · {worker.service_area || "Service area on request"}</p>
<span className="wk-verified">{worker.available ? "Available" : "Currently unavailable"}</span>
{worker.skills && <p><strong>Skills:</strong> {worker.skills}</p>}
{worker.verified && <span className="wk-verified">✓ Verified professional</span>}

<button type="button" onClick={() => toggleReviews(worker.id)}>{expandedWorker === worker.id ? "Hide reviews" : "View reviews"}</button>
{expandedWorker === worker.id && <section className="wk-reviews" aria-label={`${worker.name} reviews`}>
  {reviewSummaries[worker.id] ? <>
    <p>Rating breakdown: {[5,4,3,2,1].map((star) => `${star}★ ${reviewSummaries[worker.id].distribution?.[star] || 0}`).join(" · ")}</p>
    {reviewSummaries[worker.id].reviews?.length ? reviewSummaries[worker.id].reviews.map((review) => <article key={review.id}><strong>{review.customer_name || "Customer"} · {"★".repeat(review.rating)}</strong><p>{review.comment || "No written comment"}</p></article>) : <p>No reviews yet</p>}
  </> : <p>Loading reviews…</p>}
</section>}

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
