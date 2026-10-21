import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import { getApiErrorMessage, isValidEmail, isValidPhone, isValidUsername } from "../utils/validation";

function WorkerRegister() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", phone: "", service: "", experience: "", service_area: "", skills: "", bio: "" });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => { API.get("services/").then(({ data }) => setServices(data || [])).catch(() => toast.error("Could not load services")); }, []);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.phone.trim() || !form.service) return toast.warning("Fill in all required fields");
    if (form.name.trim().length > 100) return toast.warning("Name must be 100 characters or fewer");
    if (form.skills.trim().length > 500) return toast.warning("Skills must be 500 characters or fewer");
    if (form.service_area.trim().length > 120) return toast.warning("Service area must be 120 characters or fewer");
    if (!isValidEmail(form.email)) return toast.warning("Enter a valid email address");
    if (form.username && (form.username.trim().length > 150 || !isValidUsername(form.username))) return toast.warning("Enter a valid username (150 characters max)");
    if (!isValidPhone(form.phone)) return toast.warning("Enter a valid phone number (7–15 digits)");
    if (form.password.length < 8) return toast.warning("Password must be at least 8 characters");
    if (form.experience && (!Number.isInteger(Number(form.experience)) || Number(form.experience) < 0 || Number(form.experience) > 60)) return toast.warning("Experience must be between 0 and 60 years");
    if (profilePhoto && (!profilePhoto.type.startsWith("image/") || profilePhoto.size > 5 * 1024 * 1024)) return toast.warning("Choose an image file smaller than 5 MB");
    setLoading(true);
    const parts = form.name.trim().split(/\s+/);
    try {
      const data = new FormData();
      Object.entries({ username: (form.username || form.email).trim(), password: form.password, email: form.email.trim(), phone: form.phone.trim(), role: "WORKER", first_name: parts[0], last_name: parts.slice(1).join(" "), service: form.service, experience: form.experience || 0, service_area: form.service_area.trim(), skills: form.skills.trim(), bio: form.bio.trim() }).forEach(([key, value]) => data.append(key, value));
      if (profilePhoto) data.append("profile_photo", profilePhoto);
      await API.post("register/", data);
      toast.success("Application submitted. Your profile will appear after admin verification.");
      navigate("/login");
    } catch (error) { toast.error(getApiErrorMessage(error, "Registration failed")); }
    finally { setLoading(false); }
  };
  return <div className="wr-container"><form className="wr-card" onSubmit={submit}>
    <h2>Join as a Professional</h2><p>Share your details to apply. New professionals remain pending until approved by an administrator.</p>
    <input name="name" placeholder="Full name *" value={form.name} onChange={change} maxLength={100} required />
    <input name="email" type="email" maxLength={254} placeholder="Email *" value={form.email} onChange={change} required />
    <input name="username" placeholder="Username (optional; defaults to email)" value={form.username} onChange={change} maxLength={150} />
    <input name="password" type="password" minLength="8" placeholder="Password (8+ characters) *" value={form.password} onChange={change} required />
    <input name="phone" type="tel" maxLength={15} inputMode="tel" placeholder="Phone number *" value={form.phone} onChange={change} required />
    <select name="service" value={form.service} onChange={change} required><option value="">Choose your service *</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
    <input name="experience" type="number" min="0" max="60" placeholder="Years of experience" value={form.experience} onChange={change} />
    <input name="service_area" placeholder="Service area" value={form.service_area} onChange={change} maxLength={120} />
    <input name="skills" placeholder="Skills (comma separated)" value={form.skills} onChange={change} maxLength={500} />
    <label htmlFor="professional-photo">Profile photo (optional, max 5 MB)</label>
    <input id="professional-photo" type="file" accept="image/*" onChange={(event) => setProfilePhoto(event.target.files?.[0] || null)} />
    <textarea name="bio" placeholder="Short professional bio" value={form.bio} onChange={change} />
    <button className="wr-btn" disabled={loading}>{loading ? "Submitting…" : "Submit application"}</button>
    <p>Already registered? <Link to="/login">Sign in</Link></p>
  </form></div>;
}

export default WorkerRegister;
