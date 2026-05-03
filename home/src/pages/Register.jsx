import { useState } from "react"
import API from "../api/api"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { FaUser, FaLock, FaPhone } from "react-icons/fa"
import { ClipLoader } from "react-spinners"

function Register(){

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [phone,setPhone] = useState("")
const [loading,setLoading] = useState(false)

/* SUBMIT */

const submitUser = async ()=>{

if(!username || !password || !phone){
  toast.warning("Please fill all fields")
  return
}

// simple phone validation
if(phone.length < 10){
  toast.warning("Enter valid phone number")
  return
}

try{
  setLoading(true)

  await API.post("register/",{
    username,
    password,
    phone,
    role:"USER"
  })

  toast.success("User Created Successfully")

  setUsername("")
  setPassword("")
  setPhone("")

}catch{
  toast.error("Registration Failed")
}finally{
  setLoading(false)
}

}

return(

<div className="rg-container">

<motion.div
className="rg-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Create Account 🚀</h2>

{/* USERNAME */}

<div className="rg-input">
<FaUser/>
<input
placeholder="Username"
value={username}
onChange={e=>setUsername(e.target.value)}
/>
</div>

{/* PASSWORD */}

<div className="rg-input">
<FaLock/>
<input
type="password"
placeholder="Password"
value={password}
onChange={e=>setPassword(e.target.value)}
/>
</div>

{/* PHONE */}

<div className="rg-input">
<FaPhone/>
<input
placeholder="Phone Number"
value={phone}
onChange={e=>setPhone(e.target.value)}
/>
</div>

{/* BUTTON */}

<button
className="rg-btn"
onClick={submitUser}
disabled={loading}
>
{loading ? <ClipLoader size={20} color="#fff"/> : "Register"}
</button>

</motion.div>

</div>

)

}

export default Register