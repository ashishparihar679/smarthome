import { useState } from "react"
import API from "../api/api"
import { toast } from "react-toastify"
import { motion } from "framer-motion"
import { FaUser, FaLock, FaPhone } from "react-icons/fa"

function Register(){

const [username,setUsername] = useState("")
const [password,setPassword] = useState("")
const [phone,setPhone] = useState("")

const submitUser = ()=>{

if(!username || !password || !phone){
toast.warning("Please fill all fields")
return
}

API.post("register/",{

username:username,
password:password,
phone:phone,
role:"USER"

})

.then(()=>{
toast.success("User Created Successfully")

setUsername("")
setPassword("")
setPhone("")
})

.catch(()=>{
toast.error("Registration Failed")
})

}

return(

<div className="register-container">

<motion.div
className="register-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.5}}
>

<h2>Create Account</h2>

<div className="input-group">

<FaUser/>

<input
placeholder="Username"
value={username}
onChange={e=>setUsername(e.target.value)}
/>

</div>


<div className="input-group">

<FaLock/>

<input
type="password"
placeholder="Password"
value={password}
onChange={e=>setPassword(e.target.value)}
/>

</div>


<div className="input-group">

<FaPhone/>

<input
placeholder="Phone"
value={phone}
onChange={e=>setPhone(e.target.value)}
/>

</div>


<button
className="register-btn"
onClick={submitUser}
>

Register

</button>

</motion.div>

</div>

)

}

export default Register