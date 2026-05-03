import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaHome, FaUser, FaSignOutAlt, FaMoon } from "react-icons/fa"

function Navbar(){

const navigate = useNavigate()
const location = useLocation()

const role = localStorage.getItem("role")

const [menuOpen,setMenuOpen] = useState(false)
const [dark,setDark] = useState(false)

// ================= INITIAL THEME LOAD =================

useEffect(()=>{
  const savedTheme = localStorage.getItem("theme")
  if(savedTheme === "dark"){
    setDark(true)
    document.body.classList.add("smarthome-dark")
  }
},[])

// ================= DARK MODE =================

useEffect(()=>{
  if(dark){
    document.body.classList.add("smarthome-dark")
    localStorage.setItem("theme","dark")
  }else{
    document.body.classList.remove("smarthome-dark")
    localStorage.setItem("theme","light")
  }
},[dark])

// ================= LOGOUT =================

const logout = ()=>{
  localStorage.clear()
  navigate("/login")
}

// ================= ACTIVE LINK (BETTER) =================

const isActive = (path)=>{
  return location.pathname.startsWith(path)
}

// ================= CLOSE MENU ON CLICK =================

const handleLinkClick = ()=>{
  setMenuOpen(false)
}

// ================= ANIMATION =================

const navVariants = {
  hidden:{y:-80, opacity:0},
  visible:{
    y:0,
    opacity:1,
    transition:{ duration:0.4 }
  }
}

return(

<motion.nav
className="sm-navbar"
variants={navVariants}
initial="hidden"
animate="visible"
>

<div className="sm-container">

<div className="sm-logo">
🏠 SmartHome
</div>

<div
className="sm-menu-icon"
onClick={()=>setMenuOpen(!menuOpen)}
>
☰
</div>

<ul className={`sm-links ${menuOpen ? "open" : ""}`}>

<li className={isActive("/") ? "sm-active" : ""}>
<Link to="/" onClick={handleLinkClick}>
<FaHome/> Services
</Link>
</li>

{/* USER */}
{role === "USER" && (
<>
<li className={isActive("/UserDashboard") ? "sm-active" : ""}>
<Link to="/UserDashboard" onClick={handleLinkClick}>
<FaUser/> Dashboard
</Link>
</li>

<li className={isActive("/booking") ? "sm-active" : ""}>
<Link to="/booking" onClick={handleLinkClick}>
Book Service
</Link>
</li>
</>
)}

{/* WORKER */}
{role === "WORKER" && (
<li className={isActive("/worker-dashboard") ? "sm-active" : ""}>
<Link to="/worker-dashboard" onClick={handleLinkClick}>
<FaUser/> Dashboard
</Link>
</li>
)}

{/* ADMIN */}
{role === "ADMIN" && (
<>
<li className={isActive("/admin") ? "sm-active" : ""}>
<Link to="/admin" onClick={handleLinkClick}>Dashboard</Link>
</li>

<li className={isActive("/AdminUsers") ? "sm-active" : ""}>
<Link to="/AdminUsers" onClick={handleLinkClick}>SuperDashboard</Link>
</li>
</>
)}

{/* GUEST */}
{!role && (
<>
<li className={isActive("/signup") ? "sm-active" : ""}>
<Link to="/signup" onClick={handleLinkClick}>Signup</Link>
</li>

<li className={isActive("/login") ? "sm-active" : ""}>
<Link to="/login" onClick={handleLinkClick}>Login</Link>
</li>
</>
)}

{/* THEME */}
<li>
<button
className="sm-theme-btn"
onClick={()=>setDark(!dark)}
>
<FaMoon/>
</button>
</li>

{/* LOGOUT */}
{role && (
<li>
<button className="sm-logout-btn" onClick={logout}>
<FaSignOutAlt/> Logout
</button>
</li>
)}

</ul>

</div>

</motion.nav>

)

}

export default Navbar