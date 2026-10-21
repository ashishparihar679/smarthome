import { useEffect, useState } from "react";
import API from "../api/api";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";

const statusLabel = (status) => ({ IN_PROGRESS: "In Progress" }[status] || status?.toLowerCase().replace(/^./, (c) => c.toUpperCase()));

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});
  const [saving, setSaving] = useState(null);
  const [expanded, setExpanded] = useState({});

  const loadBookings = async () => {
    try {
      const response = await API.get("bookings/");
      setBookings(response.data || []);
    } catch { toast.error("Failed to load your bookings"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadBookings(); }, []);

  const submitReview = async (booking) => {
    const rating = Number(ratings[booking.id]);
    if (!rating) return toast.warning("Choose a star rating first");
    setSaving(booking.id);
    try {
      const response = await API.post(`bookings/${booking.id}/review/`, { rating, comment: reviews[booking.id] || "" });
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, review: response.data } : item));
      toast.success("Thanks for sharing your review");
    } catch (error) { toast.error(error.response?.data?.detail || "Could not submit your review"); }
    finally { setSaving(null); }
  };

  const cancelBooking = async (booking) => {
    try {
      await API.put(`booking/cancel/${booking.id}/`);
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: "CANCELLED" } : item));
      toast.success("Booking cancelled");
    } catch (error) { toast.error(error.response?.data?.detail || "Could not cancel this booking"); }
  };

  const filtered = bookings.filter((booking) => filter === "ALL" || booking.status === filter);

  if (loading) return <div className="mb-container"><h2 className="mb-title">My Bookings</h2><p>Loading your bookings…</p></div>;

  return <div className="mb-container">
    <h2 className="mb-title">My Bookings</h2>
    <label>Filter by status <select value={filter} onChange={(event) => setFilter(event.target.value)}>
      <option value="ALL">All bookings</option>{["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
    </select></label>
    {filtered.length === 0 ? <p className="mb-empty">No bookings found.</p> : <div className="mb-grid">
      {filtered.map((booking) => <motion.article className="mb-card" key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h3>Booking #{booking.id} · {booking.service_name}</h3>
        <p><FaMapMarkerAlt /> {booking.address}</p>
        <p>{booking.booking_date}{booking.time_slot && ` · ${booking.time_slot}`}</p>
        <p>Professional: {booking.worker_name || "Being assigned"}</p>
        {booking.worker && <p>{booking.worker_photo && <img src={booking.worker_photo} alt={`${booking.worker_name} profile`} width="40" height="40" style={{ borderRadius: "50%", objectFit: "cover", verticalAlign: "middle", marginRight: 8 }} />}★ {Number(booking.worker_rating || 0).toFixed(1)}/5 · {booking.worker_rating_count || 0} reviews</p>}
        <button type="button" onClick={() => setExpanded((current) => ({ ...current, [booking.id]: !current[booking.id] }))}>{expanded[booking.id] ? "Hide details" : "View details"}</button>
        {expanded[booking.id] && <section className="mb-details" aria-label={`Booking ${booking.id} details`}>
          <p><strong>Service:</strong> {booking.service_name}</p>
          <p><strong>Address:</strong> {booking.address}</p>
          <p><strong>Contact:</strong> {booking.contact_phone || "Not provided"}</p>
          <p><strong>Problem:</strong> {booking.problem_description || "Not provided"}</p>
          {booking.instructions && <p><strong>Instructions:</strong> {booking.instructions}</p>}
        </section>}
        <p className={`mb-status mb-${booking.status}`}>{statusLabel(booking.status)}</p>
        {["PENDING", "ACCEPTED"].includes(booking.status) && <button type="button" onClick={() => cancelBooking(booking)}>Cancel booking</button>}
        {booking.status === "COMPLETED" && booking.worker && (booking.review ? <p aria-label={`Rated ${booking.review.rating} out of 5`}>{"★".repeat(booking.review.rating)}{"☆".repeat(5 - booking.review.rating)} {booking.review.comment}</p> : <div className="mb-review">
          <p>Rate your professional</p>
          <div role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => <button type="button" key={star} aria-label={`${star} star${star > 1 ? "s" : ""}`} aria-checked={Number(ratings[booking.id]) === star} role="radio" onClick={() => setRatings((value) => ({ ...value, [booking.id]: star }))} style={{ color: Number(ratings[booking.id]) >= star ? "#f5a623" : "#aaa", background: "none", border: 0, cursor: "pointer" }}><FaStar /></button>)}
          </div>
          <textarea aria-label="Optional review" placeholder="Share a few details (optional)" value={reviews[booking.id] || ""} onChange={(event) => setReviews((value) => ({ ...value, [booking.id]: event.target.value }))} />
          <button type="button" disabled={saving === booking.id} onClick={() => submitReview(booking)}>{saving === booking.id ? "Submitting…" : "Submit review"}</button>
        </div>)}
      </motion.article>)}
    </div>}
  </div>;
}

export default MyBookings;
