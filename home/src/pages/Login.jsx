import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import { isValidEmail, getApiErrorMessage } from "../utils/validation";

function Login(){

const navigate = useNavigate()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [showPassword,setShowPassword] = useState(false)
const [loading,setLoading] = useState(false)

const submitLogin = async ()=>{

if(!email || !password){
  toast.warning("Please enter email and password")
  return
}
if (!isValidEmail(email)) { toast.warning("Enter a valid email address"); return; }

try{
  setLoading(true)

  const res = await API.post("login/",{
    email,
    password
  })

  if(res.data.message === "Login Successful"){

    toast.success("Login Successful")

    const role = res.data.role

    localStorage.setItem("role", role)
    localStorage.setItem("user_id", res.data.user_id)
    localStorage.setItem("email", res.data.email)
    localStorage.setItem("access_token", res.data.access)
    localStorage.setItem("refresh_token", res.data.refresh)

    // ROLE BASED NAVIGATION
    if(role === "USER") navigate("/UserDashboard")
    else if(role === "WORKER") navigate("/worker-dashboard")
    else if(role === "ADMIN") navigate("/admin")

  }else{
    toast.error("Login Failed")
  }

}catch(error){
  toast.error(getApiErrorMessage(error, "Invalid email or password"))
}finally{
  setLoading(false)
}

}

return(

<div className="lg-container">

<motion.div
className="lg-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Welcome Back 👋</h2>

{/* EMAIL */}

<div className="lg-input">
<FaEnvelope/>
<input
type="email"
placeholder="Enter Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>
</div>

{/* PASSWORD */}

<div className="lg-input">
<FaLock/>
<input
type={showPassword ? "text" : "password"}
placeholder="Enter Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<span
className="lg-eye"
onClick={()=>setShowPassword(!showPassword)}
>
{showPassword ? <FaEyeSlash/> : <FaEye/>}
</span>

</div>

{/* BUTTON */}

<button
className="lg-btn"
onClick={submitLogin}
disabled={loading}
>

{loading ? <ClipLoader size={20} color="#fff"/> : "Login"}

</button>

<p className="lg-text">
Don't have an account?
</p>

<button
type="button"
className="lg-btn secondary"
onClick={()=>navigate("/signup")}
>
Signup
</button>

</motion.div>

</div>

)

}

export default Login
