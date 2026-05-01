import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import { FaHome, FaUser, FaSignOutAlt, FaMoon } from "react-icons/fa"
// import "./Navbar.css"

function Navbar(){

const navigate = useNavigate()

const role = localStorage.getItem("role")

const [menuOpen,setMenuOpen] = useState(false)
const [dark,setDark] = useState(false)

const logout = ()=>{
localStorage.clear()
navigate("/login")
}

const toggleTheme = ()=>{

setDark(!dark)

if(!dark){
document.body.classList.add("dark")
}else{
document.body.classList.remove("dark")
}

}

return(

<motion.nav
className="navbar"
initial={{y:-80}}
animate={{y:0}}
transition={{duration:0.5}}
>

<div className="nav-container">

<div className="logo">
🏠 SmartHome
</div>

<div
className="menu-icon"
onClick={()=>setMenuOpen(!menuOpen)}
>
☰
</div>

<ul className={menuOpen ? "nav-links active" : "nav-links"}>

<li>
<Link to="/">
<FaHome/> Services
</Link>
</li>

{/* USER */}

{role === "USER" && (
<>
<li>
<Link to="/UserDashboard">
<FaUser/> Dashboard
</Link>
</li>

<li>
<Link to="/booking">
Book Service
</Link>
</li>
</>
)}

{/* WORKER */}

{role === "WORKER" && (
<li>
<Link to="/worker-dashboard">
<FaUser/> Dashboard
</Link>
</li>
)}

{/* ADMIN */}

{role === "ADMIN" && (
<>
<li>
<Link to="/admin">
Dashboard
</Link>
</li>

<li>
<Link to="/AdminUsers">
SuperDashboard
</Link>
</li>
</>
)}

{/* GUEST */}

{!role && (
<>
<li>
<Link to="/signup">Signup</Link>
</li>

<li>
<Link to="/login">Login</Link>
</li>
</>
)}

<li>

{/* <button
className="theme-btn"
onClick={toggleTheme}
>

<FaMoon/>

</button> */}

</li>

{role && (

<li>

<button
className="logout-btn"
onClick={logout}
>

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