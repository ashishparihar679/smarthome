import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import { getApiErrorMessage, isValidPhone } from "../utils/validation";
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
const location = useLocation();

const [services,setServices] = useState([]);
const [workers,setWorkers] = useState([]);
const [cities,setCities] = useState([]);

const [service,setService] = useState(location.state?.serviceId ? String(location.state.serviceId) : "");
const [worker,setWorker] = useState("");
const [date,setDate] = useState("");
const [address,setAddress] = useState("");
const [timeSlot,setTimeSlot] = useState("");
const [phone,setPhone] = useState("");
const [details,setDetails] = useState("");
const [instructions,setInstructions] = useState("");

const [loading,setLoading] = useState(true);
const [btnLoading,setBtnLoading] = useState(false);
const [success,setSuccess] = useState(false);


/* ================= LOAD ================= */

useEffect(()=>{
loadData()
},[])

const loadData = async ()=>{
try{
  const [sRes,wRes,cRes] = await Promise.all([
    API.get("services/"),
    API.get("workers/"),
    API.get("cities/")
  ])

  setServices(sRes.data || [])
  setWorkers(wRes.data || [])
  setCities(cRes.data || [])

}catch{
  toast.error("Failed to load data")
}finally{
  setLoading(false)
}
}

/* ================= SUBMIT ================= */

const submitBooking = async ()=>{

if(!service || !date || !address || !phone || !details){
  toast.warning("Please fill all fields")
  return
}
const today = new Date();
today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
if (date < today.toISOString().slice(0, 10)) { toast.warning("Choose today or a future date"); return; }
if (!isValidPhone(phone)) { toast.warning("Enter a valid contact number (7–15 digits)"); return; }
if (!details.trim()) { toast.warning("Describe the service you need"); return; }

try{
  setBtnLoading(true)

  const response = await API.post("bookings/",{
    service,
    worker: worker || null,
    booking_date:date,
    time_slot:timeSlot,
    address,
    contact_phone:phone,
    problem_description:details,
    instructions
  })

  toast.success(`Booking #${response.data.id} created successfully`)
  setSuccess(true)

}catch(error){
  toast.error(getApiErrorMessage(error, "Booking failed. Check your details and try again."))
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
<BookingSelect id="booking-service" name="service" value={service} onChange={(e)=>{setService(e.target.value);setWorker("")}} placeholder="Select a service" options={services.map((s)=>(
  { value: String(s.id), label: s.name }
))} />
</div>
</div>

{/* WORKER */}
<div className="bk-field">
<label htmlFor="booking-worker">Preferred professional</label>
<div className="bk-input">
<span className="bk-field-icon"><FaUserTie/></span>
<BookingSelect id="booking-worker" name="professional" value={worker} onChange={(e)=>setWorker(e.target.value)} placeholder="Let us assign a professional" options={workers.filter((w)=>String(w.service)===String(service)).map((w)=>(
  { value: String(w.id), label: `${w.name} · ★ ${w.average_rating || "New"} · ${w.experience || 0} yrs` }
))} />
</div>
</div>

{/* DATE */}
<div className="bk-field">
<label htmlFor="booking-date">Preferred date</label>
<div className="bk-input">
<span className="bk-field-icon"><FaCalendarAlt/></span>
<input id="booking-date" type="date" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)} value={date} onChange={(e)=>setDate(e.target.value)} required />
</div>
</div>

{/* ADDRESS */}
<div className="bk-field">
<label htmlFor="booking-address">Service address</label>
<div className="bk-input">
<span className="bk-field-icon"><FaMapMarkerAlt/></span>
<BookingSelect id="booking-address" name="address" value={address} onChange={(e)=>setAddress(e.target.value)} placeholder="Select your area" options={cities.map((city)=>(
  { value: city.name, label: city.name }
))} />
</div>
</div>

<div className="bk-field"><label htmlFor="booking-time">Preferred time slot</label><select id="booking-time" value={timeSlot} onChange={(e)=>setTimeSlot(e.target.value)}><option value="">Select a time</option><option>Morning (8 AM–12 PM)</option><option>Afternoon (12 PM–4 PM)</option><option>Evening (4 PM–8 PM)</option></select></div>
<div className="bk-field"><label htmlFor="booking-phone">Contact phone</label><input id="booking-phone" type="tel" maxLength={15} inputMode="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} required /></div>
<div className="bk-field"><label htmlFor="booking-details">What needs attention?</label><textarea id="booking-details" maxLength={3000} value={details} onChange={(e)=>setDetails(e.target.value)} required /></div>
<div className="bk-field"><label htmlFor="booking-instructions">Additional instructions</label><textarea id="booking-instructions" maxLength={3000} value={instructions} onChange={(e)=>setInstructions(e.target.value)} /></div>

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
