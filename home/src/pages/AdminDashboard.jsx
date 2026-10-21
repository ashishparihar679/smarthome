import { useCallback, useEffect, useState } from "react";
import API from "../api/api";
import { createElement } from "react";
import { toast } from "react-toastify";
import { getApiErrorMessage, isValidEmail, isValidPhone } from "../utils/validation";
import Swal from "sweetalert2";
import { FaUsers, FaTools, FaUserShield, FaUserTie, FaCalendarCheck, FaMapMarkedAlt, FaStar, FaUserClock, FaClipboardList } from "react-icons/fa";

import {
BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const CHART_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185", "#22d3ee"];
const TOOLTIP_STYLE = { backgroundColor: "#101e33", border: "1px solid #344a66", borderRadius: 12, color: "#e5eefb" };
function MetricCard({ icon: Icon, label, value, note, accent = "blue" }) {
  return <article className={`analytics-card analytics-card-${accent}`}>
    <span className="analytics-icon-wrap">{createElement(Icon, { "aria-hidden": true })}</span>
    <div><p>{label}</p><strong>{typeof value === "number" ? value.toLocaleString() : value}</strong>{note && <small>{note}</small>}</div>
  </article>;
}

function AdminDashboard(){

const [services,setServices] = useState([])
const [cities,setCities] = useState([])
const [workers,setWorkers] = useState([])
const [serviceName,setServiceName] = useState("")
const [cityName,setCityName] = useState("")
const [loading,setLoading] = useState(false)
const [cityLoading,setCityLoading] = useState(false)
const [analytics,setAnalytics] = useState(null)
const [analyticsLoading,setAnalyticsLoading] = useState(true)
const [analyticsError,setAnalyticsError] = useState("")
const [dateRange,setDateRange] = useState("30d")
const [customStart,setCustomStart] = useState("")
const [customEnd,setCustomEnd] = useState("")
const [bucket,setBucket] = useState("day")
const [cityFilter,setCityFilter] = useState("")
const [serviceFilter,setServiceFilter] = useState("")
const [statusFilter,setStatusFilter] = useState("")
const [serviceSort,setServiceSort] = useState({key:"total",direction:"desc"})
const [citySort,setCitySort] = useState({key:"bookings",direction:"desc"})

const [admin,setAdmin] = useState({})
const [edit,setEdit] = useState(false)

const [firstName,setFirstName] = useState("")
const [lastName,setLastName] = useState("")
const [email,setEmail] = useState("")
const [phone,setPhone] = useState("")

const adminId = localStorage.getItem("user_id")

useEffect(()=>{
  loadServices()
  loadCities()
  loadWorkers()
  loadAdmin()
},[loadAdmin])

useEffect(()=>{
  if(dateRange === "custom" && (!customStart || !customEnd)) return
  let current = true
  const params = {range:dateRange,bucket,city:cityFilter,service:serviceFilter,status:statusFilter}
  if(dateRange === "custom") { params.start = customStart; params.end = customEnd }
  setAnalyticsLoading(true)
  setAnalyticsError("")
  setAnalytics(null)
  API.get("admin/analytics/",{params})
    .then(({data})=>{if(current) setAnalytics(data)})
    .catch((error)=>{if(current) {setAnalyticsError(getApiErrorMessage(error,"Could not load analytics")); setAnalytics(null)}})
    .finally(()=>{if(current) setAnalyticsLoading(false)})
  return ()=>{current = false}
},[dateRange,customStart,customEnd,bucket,cityFilter,serviceFilter,statusFilter])

/* ================= LOAD ADMIN ================= */

const loadAdmin = useCallback(async ()=>{
try{
  const res = await API.get(`user/profile/${adminId}/`)
  const data = res.data

  setAdmin(data)
  setFirstName(data.first_name || "")
  setLastName(data.last_name || "")
  setEmail(data.email || "")
  setPhone(data.phone || "")

}catch{
  toast.error("Failed to load profile")
}
},[adminId])

/* ================= LOAD SERVICES ================= */

const loadServices = async ()=>{
try{
  const res = await API.get("services/")
  setServices(res.data || [])
}catch{
  toast.error("Failed to load services")
}
}

const loadCities = async ()=>{
try{
  const res = await API.get("cities/")
  setCities(res.data || [])
}catch{
  toast.error("Failed to load cities")
}
}

/* ================= LOAD WORKERS ================= */

const loadWorkers = async ()=>{
try{
  const res = await API.get("workers/")
  setWorkers(res.data || [])
}catch{
  toast.error("Failed to load workers")
}
}

/* ================= ADD SERVICE ================= */

const addService = async ()=>{

if(!serviceName.trim()){
  toast.warning("Enter service name")
  return
}
if (serviceName.trim().length > 100) { toast.warning("Service name must be 100 characters or fewer"); return; }
if (services.some((service) => service.name.toLowerCase() === serviceName.trim().toLowerCase())) { toast.warning("That service already exists"); return; }

try{
  setLoading(true)

  await API.post("services/",{name:serviceName})

  toast.success("Service Added")

  setServiceName("")
  loadServices()

}catch{
  toast.error("Failed to add service")
}finally{
  setLoading(false)
}
}

/* ================= DELETE ================= */

const deleteService = async (id)=>{

const result = await Swal.fire({
  title:"Delete Service?",
  text:"This action cannot be undone",
  icon:"warning",
  showCancelButton:true,
  confirmButtonColor:"#e74c3c"
})

if(result.isConfirmed){

  try{
    await API.delete(`services/delete/${id}/`)
    toast.success("Service Deleted")
    loadServices()
  }catch{
    toast.error("Delete failed")
  }

}
}

const addCity = async ()=>{
if(!cityName.trim()){
  toast.warning("Enter city name")
  return
}
if (cityName.trim().length > 100) { toast.warning("City name must be 100 characters or fewer"); return; }
if (cities.some((city) => city.name.toLowerCase() === cityName.trim().toLowerCase())) { toast.warning("That city already exists"); return; }
try{
  setCityLoading(true)
  await API.post("cities/", {name: cityName.trim()})
  toast.success("City Added")
  setCityName("")
  loadCities()
}catch(err){
  const apiError = err.response?.data
  const message = apiError?.name?.[0] || apiError?.detail || apiError?.error || (typeof apiError === "string" ? apiError : null)
  toast.error(message || (err.response ? `Failed to add city (${err.response.status})` : "Cannot reach the server. Check that the backend is running."))
}finally{
  setCityLoading(false)
}
}

const deleteCity = async (id)=>{
const result = await Swal.fire({
  title:"Delete City?",
  text:"This city will be removed from the city list.",
  icon:"warning",
  showCancelButton:true,
  confirmButtonColor:"#e74c3c"
})
if(!result.isConfirmed) return
try{
  await API.delete(`cities/delete/${id}/`)
  toast.success("City Deleted")
  loadCities()
}catch{
  toast.error("Could not delete city")
}
}

/* ================= APPROVE WORKER ================= */

const approveWorker = async (id)=>{

try{
  await API.put(`worker/approve/${id}/`)
  toast.success("Worker Approved")
  loadWorkers()
}catch{
  toast.error("Approval failed")
}
}

const toggleWorkerAvailability = async (worker)=>{
try{
  const res = await API.put(`worker/availability/${worker.id}/`)
  setWorkers(current => current.map(item => item.id === worker.id ? {...item, available: res.data.available} : item))
  toast.success(res.data.available ? "Worker marked available" : "Worker marked unavailable")
}catch{
  toast.error("Could not update worker availability")
}
}

/* ================= UPDATE ADMIN ================= */

const updateAdmin = async ()=>{

if(!firstName.trim() || firstName.trim().length > 150 || lastName.trim().length > 150){
  toast.warning("Enter a first name and keep each name within 150 characters")
  return
}
if (!isValidEmail(email)) { toast.warning("Enter a valid email address"); return; }
if (!isValidPhone(phone)) { toast.warning("Enter a valid phone number (7–15 digits)"); return; }

try{
  await API.put(`user/profile/${adminId}/`,{
    first_name:firstName.trim(),
    last_name:lastName.trim(),
    email:email.trim(),
    phone:phone.trim()
  })

  toast.success("Profile Updated")
  setEdit(false)

}catch(error){
  toast.error(getApiErrorMessage(error, "Profile update failed"))
}
}

const sortRows = (rows, sort) => [...(rows || [])].sort((left,right)=>{
  const a = left[sort.key] ?? 0
  const b = right[sort.key] ?? 0
  const comparison = typeof a === "string" ? a.localeCompare(b) : Number(a) - Number(b)
  return sort.direction === "asc" ? comparison : -comparison
})
const sortedServices = sortRows(analytics?.services,serviceSort)
const sortedCities = sortRows(analytics?.cities,citySort)
const topServices = [...(analytics?.services || [])].sort((a,b)=>b.total-a.total).slice(0,5)
const trendServices = (analytics?.services || []).filter(service=>service.total > 0).sort((a,b)=>b.total-a.total).slice(0,5)
const serviceTrendData = (()=>{
  const points = new Map()
  ;(analytics?.service_growth || []).forEach(item=>{
    if(!points.has(item.date)) points.set(item.date,{date:item.date})
    points.get(item.date)[`service-${item.service_id}`] = item.bookings
  })
  return [...points.values()]
})()
const activeCities = [...(analytics?.cities || [])].filter(city=>city.bookings > 0).sort((a,b)=>b.bookings-a.bookings)
const availabilityGaps = (analytics?.cities || []).filter(city=>city.availability_gap).length
const mostRequested = topServices[0]
const leastRequested = [...(analytics?.services || [])].filter(service=>service.total > 0).sort((a,b)=>a.total-b.total)[0]
const leastActiveCity = [...activeCities].sort((a,b)=>a.bookings-b.bookings)[0]
const changeSort = (setter,current,key) => setter(current.key === key ? {...current,direction:current.direction === "asc" ? "desc" : "asc"} : {key,direction:"desc"})

return(

<div className="admin-container">

<h1 className="admin-title">Admin Dashboard</h1>

<nav className="analytics-nav" aria-label="Analytics sections">
  <a href="#platform-overview">Platform overview</a><a href="#user-overview">User overview</a><a href="#city-analytics">City &amp; service areas</a><a href="#service-analytics">Service performance</a>
</nav>

<section className="admin-analytics" id="platform-overview" aria-labelledby="platform-overview-title">
  <div className="analytics-section-heading"><div><h2 id="platform-overview-title">Platform Overview</h2><p>Database-backed totals with date and category filters for the selected period.</p></div>
    <span className="analytics-period-note">Lifetime totals are labeled separately</span>
  </div>
  <div className="analytics-filters">
    <label>Date range<select value={dateRange} onChange={event=>{const value=event.target.value;setDateRange(value);if(value === "custom"){setAnalytics(null);setAnalyticsLoading(false)}}}><option value="today">Today</option><option value="7d">Last 7 days</option><option value="30d">Last 30 days</option><option value="month">This month</option><option value="custom">Custom range</option></select></label>
    {dateRange === "custom" && <><label>Start date<input type="date" value={customStart} onChange={event=>setCustomStart(event.target.value)}/></label><label>End date<input type="date" value={customEnd} onChange={event=>setCustomEnd(event.target.value)}/></label></>}
    <label>City<select value={cityFilter} onChange={event=>setCityFilter(event.target.value)}><option value="">All cities</option>{cities.map(city=><option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
    <label>Service<select value={serviceFilter} onChange={event=>setServiceFilter(event.target.value)}><option value="">All services</option>{services.map(service=><option key={service.id} value={service.id}>{service.name}</option>)}</select></label>
    <label>Booking status<select value={statusFilter} onChange={event=>setStatusFilter(event.target.value)}><option value="">All statuses</option>{["PENDING","ACCEPTED","IN_PROGRESS","COMPLETED","CANCELLED","REJECTED"].map(status=><option key={status} value={status}>{status.replace("_"," ").toLowerCase().replace(/^./,letter=>letter.toUpperCase())}</option>)}</select></label>
    <label>Trend grouping<select value={bucket} onChange={event=>setBucket(event.target.value)}><option value="day">By day</option><option value="week">By week</option><option value="month">By month</option></select></label>
  </div>
  {dateRange === "custom" && (!customStart || !customEnd) && <p className="analytics-filter-hint">Choose both dates to load a custom range.</p>}
  {analyticsLoading && <div className="analytics-loading" role="status">Loading analytics…</div>}
  {analyticsError && <div className="analytics-error" role="alert">{analyticsError}</div>}
  {analytics && <>
    <p className="analytics-date-caption">Selected period: {analytics.filters.start} to {analytics.filters.end} · user totals use registration date; booking totals use booking creation date.</p>
    <div className="analytics-grid">
      <MetricCard icon={FaUsers} label="Total users" value={analytics.global.total} note="Lifetime"/>
      <MetricCard icon={FaUserTie} label="Customers" value={analytics.global.customers} note="Lifetime" accent="cyan"/>
      <MetricCard icon={FaTools} label="Professionals" value={analytics.global.professionals} note="Professional profiles" accent="violet"/>
      <MetricCard icon={FaUserShield} label="Administrators" value={analytics.global.administrators} note="Role or staff access" accent="amber"/>
      <MetricCard icon={FaUserClock} label="Pending approvals" value={analytics.global.pending_professional_approvals} note="Awaiting admin approval" accent="amber"/>
      <MetricCard icon={FaClipboardList} label="Service categories" value={analytics.global.service_categories} note="Current catalogue"/>
      <MetricCard icon={FaCalendarCheck} label="Bookings" value={analytics.global.bookings.total} note="Lifetime" accent="cyan"/>
      <MetricCard icon={FaMapMarkedAlt} label="Catalog cities" value={analytics.global.cities} note="Curated city list" accent="violet"/>
      <MetricCard icon={FaMapMarkedAlt} label="Professional service areas" value={analytics.global.service_areas} note="Normalized area labels" accent="cyan"/>
      <MetricCard icon={FaCalendarCheck} label="Lifetime pending bookings" value={analytics.global.bookings.pending} accent="amber"/>
      <MetricCard icon={FaCalendarCheck} label="Lifetime completed bookings" value={analytics.global.bookings.completed} accent="green"/>
      <MetricCard icon={FaCalendarCheck} label="Lifetime cancelled / rejected" value={analytics.global.bookings.cancelled + analytics.global.bookings.rejected} accent="rose"/>
      <MetricCard icon={FaStar} label="Average customer rating" value={`${analytics.global.average_rating.toFixed(1)} / 5`} note={`${analytics.global.review_count.toLocaleString()} reviews`} accent="amber"/>
      <MetricCard icon={FaUserClock} label="Active / inactive users" value={`${analytics.global.active.toLocaleString()} / ${analytics.global.inactive.toLocaleString()}`} note="Account status"/>
    </div>
    <h3 className="analytics-subtitle">Selected period · filtered bookings</h3>
    <div className="analytics-grid analytics-grid-compact">
      <MetricCard icon={FaUsers} label="New registrations" value={analytics.period.users.total} note="Date range only"/>
      <MetricCard icon={FaCalendarCheck} label="Bookings" value={analytics.period.bookings.total} note="Selected city, service & status" accent="cyan"/>
      <MetricCard icon={FaCalendarCheck} label="Completed" value={analytics.period.bookings.completed} accent="green"/>
      <MetricCard icon={FaClipboardList} label="Pending" value={analytics.period.bookings.pending} accent="amber"/>
      <MetricCard icon={FaClipboardList} label="Cancelled / rejected" value={analytics.period.bookings.cancelled + analytics.period.bookings.rejected} accent="rose"/>
      <MetricCard icon={FaStar} label="Period average rating" value={`${analytics.period.average_rating.toFixed(1)} / 5`} accent="amber"/>
    </div>
    <div className="analytics-chart-grid">
      <article className="chart-card analytics-chart-card"><h3>User Overview · Role Distribution</h3><p>Unique users by account role; role totals do not overlap.</p>
        {analytics.role_distribution.some(item=>item.value > 0) ? <ResponsiveContainer width="100%" height={270}><PieChart><Pie data={analytics.role_distribution} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={62} outerRadius={94} paddingAngle={3}>{analytics.role_distribution.map((entry,index)=><Cell key={entry.role} fill={CHART_COLORS[index % CHART_COLORS.length]}/>)}</Pie><Tooltip contentStyle={TOOLTIP_STYLE}/><Legend/></PieChart></ResponsiveContainer> : <div className="analytics-empty">No user records yet.</div>}
      </article>
      <article className="chart-card analytics-chart-card"><h3>User Growth · {bucket}</h3><p>New accounts registered in the selected date range.</p>
        {analytics.user_growth.length ? <ResponsiveContainer width="100%" height={270}><LineChart data={analytics.user_growth} margin={{top:12,right:14,bottom:5,left:0}}><CartesianGrid stroke="#263a54" strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fill:"#a8bad0",fontSize:11}}/><YAxis allowDecimals={false} tick={{fill:"#a8bad0",fontSize:11}}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Line type="monotone" dataKey="users" name="Registrations" stroke="#60a5fa" strokeWidth={3} dot={{r:3,fill:"#93c5fd"}} activeDot={{r:6}}/></LineChart></ResponsiveContainer> : <div className="analytics-empty">No registrations in this date range.</div>}
      </article>
      <article className="chart-card analytics-chart-card"><h3>Booking Trends · {bucket}</h3><p>Booking requests created in the selected period.</p>
        {analytics.booking_growth.length ? <ResponsiveContainer width="100%" height={270}><LineChart data={analytics.booking_growth} margin={{top:12,right:14,bottom:5,left:0}}><CartesianGrid stroke="#263a54" strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fill:"#a8bad0",fontSize:11}}/><YAxis allowDecimals={false} tick={{fill:"#a8bad0",fontSize:11}}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Line type="monotone" dataKey="bookings" name="Bookings" stroke="#34d399" strokeWidth={3} dot={{r:3,fill:"#6ee7b7"}} activeDot={{r:6}}/></LineChart></ResponsiveContainer> : <div className="analytics-empty">No bookings in this date range.</div>}
      </article>
      <article className="chart-card analytics-chart-card"><h3>Booking Status Distribution</h3><p>Statuses in the selected period and filters.</p>
        {analytics.period.bookings.total ? <ResponsiveContainer width="100%" height={270}><PieChart><Pie data={analytics.booking_status_distribution} dataKey="value" nameKey="name" cx="50%" cy="48%" innerRadius={62} outerRadius={94} paddingAngle={3}>{analytics.booking_status_distribution.map((entry,index)=><Cell key={entry.status} fill={CHART_COLORS[index % CHART_COLORS.length]}/>)}</Pie><Tooltip contentStyle={TOOLTIP_STYLE}/><Legend/></PieChart></ResponsiveContainer> : <div className="analytics-empty">No bookings match these filters.</div>}
      </article>
    </div>
  </>}
</section>

<section className="admin-analytics" id="user-overview" aria-labelledby="user-overview-title">
  <div className="analytics-section-heading"><div><h2 id="user-overview-title">User Overview</h2><p>Lifetime role totals, account activity, approval queue, and registration trends.</p></div></div>
  {analytics && <div className="analytics-highlight-row"><div><strong>{analytics.global.active.toLocaleString()}</strong><span>active accounts</span></div><div><strong>{analytics.global.inactive.toLocaleString()}</strong><span>inactive accounts</span></div><div><strong>{analytics.period.users.customers.toLocaleString()}</strong><span>new customers in range</span></div><div><strong>{analytics.period.users.professionals.toLocaleString()}</strong><span>new professionals in range</span></div></div>}
</section>

<section className="admin-analytics" id="city-analytics" aria-labelledby="city-analytics-title">
  <div className="analytics-section-heading"><div><h2 id="city-analytics-title">City &amp; Service Area Analytics</h2><p>City matches use the curated City list against booking addresses and professional service areas. Customer counts reflect customers with matching bookings.</p></div>
    {activeCities[0] && <span className="analytics-period-note">Most active: {activeCities[0].name}</span>}
  </div>
  {analytics && <div className="analytics-highlight-row"><div><strong>{analytics.global.cities.toLocaleString()}</strong><span>catalog cities</span></div><div><strong>{analytics.global.service_areas.toLocaleString()}</strong><span>normalized professional areas</span></div><div><strong>{activeCities[0]?.name || "—"}</strong><span>highest booking demand</span></div><div><strong>{leastActiveCity?.name || "—"}</strong><span>lowest city demand with bookings</span></div><div><strong>{availabilityGaps.toLocaleString()}</strong><span>cities with bookings, no available professionals</span></div></div>}
  <div className="analytics-chart-grid analytics-city-grid">
    <article className="chart-card analytics-chart-card"><h3>Bookings by City</h3><p>Matched to city names in the curated location list.</p>
      {activeCities.length ? <ResponsiveContainer width="100%" height={300}><BarChart data={activeCities.slice(0,10)} layout="vertical" margin={{top:8,right:20,bottom:5,left:12}}><CartesianGrid stroke="#263a54" strokeDasharray="3 3"/><XAxis type="number" allowDecimals={false} tick={{fill:"#a8bad0",fontSize:11}}/><YAxis type="category" dataKey="name" width={96} tick={{fill:"#c6d4e6",fontSize:11}}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Bar dataKey="bookings" name="Bookings" fill="#60a5fa" radius={[0,7,7,0]}/></BarChart></ResponsiveContainer> : <div className="analytics-empty">No booking addresses match a catalog city.</div>}
    </article>
    <article className="chart-card analytics-chart-card analytics-table-card"><h3>City Ranking</h3><p>Sortable current-period results.</p><div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><button onClick={()=>changeSort(setCitySort,citySort,"name")}>City ↕</button></th><th><button onClick={()=>changeSort(setCitySort,citySort,"bookings")}>Bookings ↕</button></th><th><button onClick={()=>changeSort(setCitySort,citySort,"customers_with_bookings")}>Booked customers ↕</button></th><th><button onClick={()=>changeSort(setCitySort,citySort,"available_professionals")}>Available pros ↕</button></th><th>Top services</th><th>Coverage</th></tr></thead><tbody>{sortedCities.map(city=><tr key={city.id}><td>{city.name}</td><td>{city.bookings}</td><td>{city.customers_with_bookings}</td><td>{city.available_professionals}</td><td>{city.services.length ? city.services.join(", ") : "—"}</td><td><span className={city.availability_gap ? "analytics-tag analytics-tag-gap" : "analytics-tag"}>{city.availability_gap ? "No pros available" : city.bookings ? "Available" : "No demand"}</span></td></tr>)}</tbody></table></div>{!sortedCities.length && <div className="analytics-empty">No city records found. Add cities to the existing city catalogue to enable matching.</div>}</article>
  </div>
</section>

<section className="admin-analytics" id="service-analytics" aria-labelledby="service-analytics-title">
  <div className="analytics-section-heading"><div><h2 id="service-analytics-title">Service Performance &amp; Demand</h2><p>Booking volumes are separate from the service catalogue count. No revenue metric is shown because this platform has no payment records.</p></div>
    <div className="analytics-ranking-pills"><span>Most requested: {mostRequested?.total ? mostRequested.name : "—"}</span><span>Lowest with demand: {leastRequested?.name || "—"}</span></div>
  </div>
  <div className="analytics-chart-grid">
    <article className="chart-card analytics-chart-card"><h3>Top Services by Booking Volume</h3><p>Selected period and filters · top five.</p>
      {topServices.some(service=>service.total > 0) ? <ResponsiveContainer width="100%" height={290}><BarChart data={topServices} margin={{top:12,right:14,bottom:30,left:0}}><CartesianGrid stroke="#263a54" strokeDasharray="3 3"/><XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} tick={{fill:"#c6d4e6",fontSize:11}}/><YAxis allowDecimals={false} tick={{fill:"#a8bad0",fontSize:11}}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Bar dataKey="total" name="Bookings" fill="#60a5fa" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer> : <div className="analytics-empty">No service bookings match these filters.</div>}
    </article>
    <article className="chart-card analytics-chart-card"><h3>Completed vs Cancelled / Rejected</h3><p>Service demand outcomes in the current period.</p>
      {topServices.some(service=>service.total > 0) ? <ResponsiveContainer width="100%" height={290}><BarChart data={topServices} margin={{top:12,right:14,bottom:30,left:0}}><CartesianGrid stroke="#263a54" strokeDasharray="3 3"/><XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={60} tick={{fill:"#c6d4e6",fontSize:11}}/><YAxis allowDecimals={false} tick={{fill:"#a8bad0",fontSize:11}}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Legend/><Bar dataKey="completed" name="Completed" fill="#34d399" radius={[5,5,0,0]}/><Bar dataKey="cancelled" name="Cancelled" fill="#fb7185"/><Bar dataKey="rejected" name="Rejected" fill="#f97373"/></BarChart></ResponsiveContainer> : <div className="analytics-empty">No service outcome data yet.</div>}
    </article>
    <article className="chart-card analytics-chart-card"><h3>Service Demand Trends · {bucket}</h3><p>Weekly, monthly, or daily bookings by the five most requested services.</p>
      {trendServices.length && serviceTrendData.length ? <ResponsiveContainer width="100%" height={290}><LineChart data={serviceTrendData} margin={{top:12,right:14,bottom:5,left:0}}><CartesianGrid stroke="#263a54" strokeDasharray="3 3"/><XAxis dataKey="date" tick={{fill:"#a8bad0",fontSize:11}}/><YAxis allowDecimals={false} tick={{fill:"#a8bad0",fontSize:11}}/><Tooltip contentStyle={TOOLTIP_STYLE}/><Legend/>{trendServices.map((service,index)=><Line key={service.id} type="monotone" dataKey={`service-${service.id}`} name={service.name} stroke={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={2.5} dot={{r:2}} activeDot={{r:5}}/> )}</LineChart></ResponsiveContainer> : <div className="analytics-empty">No service trends in this date range.</div>}
    </article>
  </div>
  <article className="chart-card analytics-table-card"><h3>Service Demand Ranking</h3><p>Click a column heading to sort. Availability counts include approved professionals currently marked available.</p><div className="analytics-table-wrap"><table className="analytics-table"><thead><tr><th><button onClick={()=>changeSort(setServiceSort,serviceSort,"name")}>Service ↕</button></th><th><button onClick={()=>changeSort(setServiceSort,serviceSort,"total")}>Bookings ↕</button></th><th><button onClick={()=>changeSort(setServiceSort,serviceSort,"completed")}>Completed ↕</button></th><th><button onClick={()=>changeSort(setServiceSort,serviceSort,"cancelled")}>Cancelled ↕</button></th><th><button onClick={()=>changeSort(setServiceSort,serviceSort,"professionals")}>Professionals ↕</button></th><th>Available</th><th>Pending</th><th>Accepted</th><th>In progress</th><th>Rejected</th><th>Completion</th><th>Avg rating</th><th>Demand</th></tr></thead><tbody>{sortedServices.map(service=><tr key={service.id}><td>{service.name}</td><td>{service.total}</td><td>{service.completed}</td><td>{service.cancelled}</td><td>{service.professionals}</td><td>{service.available_professionals}</td><td>{service.pending}</td><td>{service.accepted}</td><td>{service.in_progress}</td><td>{service.rejected}</td><td>{service.completion_rate}%</td><td>{service.average_rating ? `${service.average_rating.toFixed(1)} / 5` : "—"}</td><td><span className={`analytics-tag ${service.id === mostRequested?.id && service.total ? "analytics-tag-high" : service.id === leastRequested?.id ? "analytics-tag-low" : ""}`}>{service.id === mostRequested?.id && service.total ? "High demand" : service.id === leastRequested?.id ? "Lowest demand" : service.total === 0 ? "No demand" : "Steady"}</span></td></tr>)}</tbody></table></div>{!sortedServices.length && <div className="analytics-empty">No service categories found.</div>}</article>
</section>

{/* ===== PROFILE ===== */}

<div className="admin-card">

<h3>Admin Profile</h3>

{!edit ? (

<div>
<p><b>Name:</b> {admin.first_name} {admin.last_name}</p>
<p><b>Email:</b> {admin.email}</p>

<button onClick={()=>setEdit(true)}>Edit Profile</button>
</div>

) : (

<div>

<input value={firstName} maxLength={150} onChange={(e)=>setFirstName(e.target.value)} placeholder="First Name" required />
<input value={lastName} maxLength={150} onChange={(e)=>setLastName(e.target.value)} placeholder="Last Name"/>
<input value={email} type="email" maxLength={254} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" required />
<input value={phone} type="tel" maxLength={15} inputMode="tel" onChange={(e)=>setPhone(e.target.value)} placeholder="Phone" required />

<button onClick={updateAdmin}>Save</button>

</div>

)}

</div>

{/* ===== SERVICES ===== */}

<div className="admin-card">

<h3>Services</h3>

<div className="service-add">

<input
placeholder="Enter service name"
maxLength={100}
value={serviceName}
onChange={(e)=>setServiceName(e.target.value)}
/>

<button onClick={addService}>
{loading ? "Adding..." : "Add"}
</button>

</div>

{services.length === 0 ? (
<p>No services available</p>
) : (

<div className="services-grid">

{services.map(s=>(

<div className="service-card" key={s.id}>
<h4>{s.name}</h4>

<button
className="delete-btn"
onClick={()=>deleteService(s.id)}
>
Delete
</button>

</div>

))}

</div>

)}

</div>

{/* ===== CITIES ===== */}
<div className="admin-card">
<h3>Cities</h3>
<div className="service-add">
<input
  placeholder="Enter city name"
  maxLength={100}
  value={cityName}
  onChange={(e)=>setCityName(e.target.value)}
  onKeyDown={(e)=>{if(e.key === "Enter") addCity()}}
/>
<button onClick={addCity} disabled={cityLoading}>
{cityLoading ? "Adding..." : "Add"}
</button>
</div>
{cities.length === 0 ? <p>No cities added yet</p> : (
<div className="services-grid">
{cities.map(city=>(
<div className="service-card" key={city.id}>
<h4>{city.name}</h4>
<button className="delete-btn" onClick={()=>deleteCity(city.id)}>Delete</button>
</div>
))}
</div>
)}
</div>

{/* ===== WORKERS ===== */}

<div className="admin-card">

<h3>Workers</h3>
<div className="worker-summary" aria-label="Worker approval summary">
<span>{workers.length} total</span>
<span>{workers.filter(w=>w.approved).length} approved</span>
<span>{workers.filter(w=>!w.approved).length} pending approval</span>
</div>

{workers.length === 0 ? (
<p>No workers available</p>
) : (

<div className="workers-grid">

{workers.map(w=>(

<div className="worker-card" key={w.id}>

<h4>{w.name}</h4>
<p>{w.phone}</p>
<p className="worker-service">{services.find(service => service.id === w.service)?.name || "Service not set"}</p>

<div className="worker-statuses">
<span className={`worker-status ${w.approved ? "is-approved":"is-pending"}`}>{w.approved ? "Approved":"Pending approval"}</span>
{w.approved && <span className={`worker-status ${w.available ? "is-available":"is-unavailable"}`}>{w.available ? "Available":"Unavailable"}</span>}
</div>

<div className="worker-actions">
<a className="worker-contact-btn" href={`tel:${w.phone}`}>Call worker</a>
{!w.approved && (
<button
className="approve-btn"
onClick={()=>approveWorker(w.id)}
>
Approve
</button>
)}
{w.approved && <button className="availability-btn" onClick={()=>toggleWorkerAvailability(w)}>{w.available ? "Mark unavailable":"Mark available"}</button>}
</div>

</div>

))}

</div>

)}

</div>

</div>

)

}

export default AdminDashboard
