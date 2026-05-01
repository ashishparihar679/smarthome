import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { ClipLoader } from "react-spinners";

// import "./Login.css";

function Login(){

const navigate = useNavigate()

const [email,setEmail] = useState("")
const [password,setPassword] = useState("")
const [showPassword,setShowPassword] = useState(false)
const [loading,setLoading] = useState(false)

const submitLogin = ()=>{

if(!email || !password){
toast.warning("Please enter email and password")
return
}

setLoading(true)

API.post("login/",{
email:email,
password:password
})

.then(res=>{

setLoading(false)

if(res.data.message === "Login Successful"){

toast.success("Login Successful")

const role = res.data.role

localStorage.setItem("role", res.data.role)
localStorage.setItem("user_id", res.data.user_id)
localStorage.setItem("email", res.data.email)

if(role === "USER"){
navigate("/UserDashboard")
}

if(role === "WORKER"){
navigate("/worker-dashboard")
}

if(role === "ADMIN"){
navigate("/admin")
}

}

})
.catch(()=>{

setLoading(false)

toast.error("Invalid Email or Password")

})

}

return(

<div className="login-container">

<motion.div
className="login-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Login</h2>

<div className="input-group">

<FaEnvelope/>

<input
type="email"
placeholder="Email"
onChange={(e)=>setEmail(e.target.value)}
/>

</div>


<div className="input-group">

<FaLock/>

<input
type={showPassword ? "text" : "password"}
placeholder="Password"
onChange={(e)=>setPassword(e.target.value)}
/>

<span
className="eye-icon"
onClick={()=>setShowPassword(!showPassword)}
>

{showPassword ? <FaEyeSlash/> : <FaEye/>}

</span>

</div>


<button
className="login-btn"
onClick={submitLogin}
disabled={loading}
>

{loading ? <ClipLoader size={20} color="#fff"/> : "Login"}

</button>
<br />
<p>if you are not signup please signup here</p>
<button
type="button"
className="login-btn"
onClick={()=>navigate("/signup")}
>
signup
</button>

</motion.div>

</div>

)

}

export default Login