import { useEffect, useRef, useState } from "react";
import API from "../api/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

import {
  FaTools,
  FaUserTie,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCheck,
  FaChevronDown,
  FaShieldAlt,
  FaBolt,
  FaBroom,
  FaWrench,
} from "react-icons/fa";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function BookingSelect({ id, value, onChange, placeholder, options, name }) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value));

  const getOptionIcon = (label = "") => {
    const normalized = label.toLowerCase();
    if (name === "service" && /electric|electricity|lightning/.test(normalized)) return FaBolt;
    if (name === "service" && /clean|broom/.test(normalized)) return FaBroom;
    if (name === "service" && /plumb|repair|maintenance/.test(normalized)) return FaWrench;
    if (name === "professional") return FaUserTie;
    if (name === "address") return FaMapMarkerAlt;
    return FaTools;
  };

  const getOptionLabel = (label = "") => name === "service"
    ? label.replace(/\b\w/g, (character) => character.toUpperCase())
    : label;

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!selectRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="bk-custom-select" ref={selectRef}>
      <button
        type="button"
        id={id}
        className={`bk-select-trigger ${open ? "is-open" : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className={selected ? "" : "bk-select-placeholder"}>{selected?.label || placeholder}</span>
        <FaChevronDown className="bk-select-chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="bk-select-menu" role="menu" aria-label={name}>
          {options.map((option) => {
            const OptionIcon = getOptionIcon(option.label);
            return (
            <button
              type="button"
              role="menuitemradio"
              aria-checked={String(option.value) === String(value)}
              className={`bk-select-option ${String(option.value) === String(value) ? "is-selected" : ""}`}
              key={option.value}
              onClick={() => {
                onChange({ target: { value: option.value } });
                setOpen(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
            >
              <span className="bk-option-main">
                <span className="bk-option-icon"><OptionIcon aria-hidden="true" /></span>
                <span className="bk-option-label">{getOptionLabel(option.label)}</span>
              </span>
              {String(option.value) === String(value) && <FaCheck className="bk-option-check" aria-hidden="true" />}
            </button>
            );
          })}
          {options.length === 0 && <p className="bk-select-empty">No {name.toLowerCase()} available</p>}
        </div>
      )}
    </div>
  );
}

function Booking(){

const [services,setServices] = useState([]);
const [workers,setWorkers] = useState([]);

const [service,setService] = useState("");
const [worker,setWorker] = useState("");
const [date,setDate] = useState("");
const [address,setAddress] = useState("");

const [loading,setLoading] = useState(true);
const [btnLoading,setBtnLoading] = useState(false);
const [success,setSuccess] = useState(false);

const userId = localStorage.getItem("user_id");

/* ================= LOAD ================= */

useEffect(()=>{
loadData()
},[])

const loadData = async ()=>{
try{
  const [sRes,wRes] = await Promise.all([
    API.get("services/"),
    API.get("workers/")
  ])

  setServices(sRes.data || [])
  setWorkers(wRes.data || [])

}catch{
  toast.error("Failed to load data")
}finally{
  setLoading(false)
}
}

/* ================= SUBMIT ================= */

const submitBooking = async ()=>{

if(!service || !worker || !date || !address){
  toast.warning("Please fill all fields")
  return
}

try{
  setBtnLoading(true)

  await API.post("bookings/",{
    user:userId,
    service,
    worker,
    booking_date:date,
    address
  })

  toast.success("Booking Created Successfully")
  setSuccess(true)

}catch{
  toast.error("Booking Failed")
}finally{
  setBtnLoading(false)
}

}

/* ================= LOADING ================= */

if(loading){
return(
<div className="bk-container">
<div className="bk-card">
<Skeleton height={40}/>
<Skeleton height={40}/>
<Skeleton height={40}/>
<Skeleton height={40}/>
</div>
</div>
)
}

/* ================= UI ================= */

return(

<div className="bk-container">

{success ? (

<motion.div
className="bk-success"
initial={{scale:0}}
animate={{scale:1}}
>

<h2>🎉 Booking Confirmed</h2>
<p>Your service has been booked successfully.</p>

<button onClick={()=>window.location.href="/"}>
Go Home
</button>

</motion.div>

) : (

<motion.div
className="bk-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
>
<div className="bk-card-heading">
  <span className="bk-kicker"><FaShieldAlt /> SECURE SERVICE REQUEST</span>
  <h2>Book a service</h2>
  <p>Tell us what you need and we’ll help get it taken care of.</p>
</div>

{/* SERVICE */}
<div className="bk-field">
<label htmlFor="booking-service">Service category</label>
<div className="bk-input">
<span className="bk-field-icon"><FaTools/></span>
<BookingSelect id="booking-service" name="service" value={service} onChange={(e)=>setService(e.target.value)} placeholder="Select a service" options={services.map((s)=>(
  { value: String(s.id), label: s.name }
))} />
</div>
</div>

{/* WORKER */}
<div className="bk-field">
<label htmlFor="booking-worker">Preferred professional</label>
<div className="bk-input">
<span className="bk-field-icon"><FaUserTie/></span>
<BookingSelect id="booking-worker" name="professional" value={worker} onChange={(e)=>setWorker(e.target.value)} placeholder="Select a professional" options={workers.map((w)=>(
  { value: String(w.id), label: w.name }
))} />
</div>
</div>

{/* DATE */}
<div className="bk-field">
<label htmlFor="booking-date">Preferred date</label>
<div className="bk-input">
<span className="bk-field-icon"><FaCalendarAlt/></span>
<input id="booking-date" type="date" value={date} onChange={(e)=>setDate(e.target.value)}/>
</div>
</div>

{/* ADDRESS */}
<div className="bk-field">
<label htmlFor="booking-address">Service address</label>
<div className="bk-input">
<span className="bk-field-icon"><FaMapMarkerAlt/></span>
<BookingSelect id="booking-address" name="address" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Select your area" options={[
  { value: "Anand Nagar", label: "Anand Nagar" },
  { value: "MP Nagar", label: "MP Nagar" },
  { value: "Indrapuri", label: "Indrapuri" },
]} />
</div>
</div>

<button className="bk-btn" onClick={submitBooking}>
{btnLoading ? "Booking..." : <>Book Service <FaCheck aria-hidden="true" /></>}
</button>

<p className="bk-secure-note"><FaShieldAlt aria-hidden="true" /> Your booking details are handled securely.</p>

</motion.div>

)}

</div>

)

}

export default Booking
