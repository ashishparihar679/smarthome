import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import { getApiErrorMessage, isValidEmail, isValidPhone, isValidUsername } from "../utils/validation";

function WorkerRegister() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", phone: "", service: "", experience: "", service_area: "", skills: "", bio: "" });
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
    setLoading(true);
    const parts = form.name.trim().split(/\s+/);
    try {
      const data = new FormData();
      Object.entries({ username: (form.username || form.email).trim(), password: form.password, email: form.email.trim(), phone: form.phone.trim(), role: "WORKER", first_name: parts[0], last_name: parts.slice(1).join(" "), service: form.service, experience: form.experience || 0, service_area: form.service_area.trim(), skills: form.skills.trim(), bio: form.bio.trim() }).forEach(([key, value]) => data.append(key, value));
      await API.post("register/", data);
      toast.success("Application submitted. Your profile will appear after admin verification.");
      navigate("/login");
    } catch (error) { toast.error(getApiErrorMessage(error, "Registration failed")); }
    finally { setLoading(false); }
  };
  return <div className="wr-container"><form className="wr-card" onSubmit={submit}>
    <header className="wr-heading">
      <h2>Join as a Professional</h2>
      <p>Share your details to apply. New professionals remain pending until approved by an administrator.</p>
    </header>
    <div className="wr-fields">
      <div className="wr-field"><label htmlFor="wr-name">Full name <span>*</span></label><input id="wr-name" name="name" placeholder="Your full name" value={form.name} onChange={change} maxLength={100} autoComplete="name" required /></div>
      <div className="wr-field"><label htmlFor="wr-email">Email <span>*</span></label><input id="wr-email" name="email" type="email" maxLength={254} placeholder="you@example.com" value={form.email} onChange={change} autoComplete="email" required /></div>
      <div className="wr-field"><label htmlFor="wr-username">Username <small>(optional; defaults to email)</small></label><input id="wr-username" name="username" placeholder="Choose a username" value={form.username} onChange={change} maxLength={150} autoComplete="username" /></div>
      <div className="wr-field"><label htmlFor="wr-password">Password <span>*</span></label><input id="wr-password" name="password" type="password" minLength="8" placeholder="At least 8 characters" value={form.password} onChange={change} autoComplete="new-password" required /></div>
      <div className="wr-field"><label htmlFor="wr-phone">Phone number <span>*</span></label><input id="wr-phone" name="phone" type="tel" maxLength={15} inputMode="tel" placeholder="Your phone number" value={form.phone} onChange={change} autoComplete="tel" required /></div>
      <div className="wr-field"><label htmlFor="wr-service">Choose your service <span>*</span></label><select id="wr-service" name="service" value={form.service} onChange={change} required><option value="">Select a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></div>
      <div className="wr-field"><label htmlFor="wr-experience">Years of experience</label><input id="wr-experience" name="experience" type="number" min="0" max="60" placeholder="e.g. 5" value={form.experience} onChange={change} /></div>
      <div className="wr-field"><label htmlFor="wr-service-area">Service area</label><input id="wr-service-area" name="service_area" placeholder="City or neighborhood" value={form.service_area} onChange={change} maxLength={120} autoComplete="address-level2" /></div>
      <div className="wr-field wr-field-wide"><label htmlFor="wr-skills">Skills <small>(comma separated)</small></label><input id="wr-skills" name="skills" placeholder="e.g. wiring, smart lighting, repairs" value={form.skills} onChange={change} maxLength={500} /></div>
      <div className="wr-field wr-field-wide"><label htmlFor="wr-bio">Short professional bio</label><textarea id="wr-bio" name="bio" placeholder="Tell clients a little about your experience and approach" value={form.bio} onChange={change} rows="4" /></div>
    </div>
    <button className="wr-btn" disabled={loading}>{loading ? "Submitting…" : "Submit application"}</button>
    <p className="wr-signin">Already registered? <Link to="/login">Sign in</Link></p>
  </form></div>;
}

export default WorkerRegister;
