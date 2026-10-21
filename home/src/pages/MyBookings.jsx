import { useEffect, useState } from "react";
import API from "../api/api";
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
  const [cancelling, setCancelling] = useState(null);
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
    if (!window.confirm(`Cancel booking #${booking.id}?`)) return;
    setCancelling(booking.id);
    try {
      await API.put(`booking/cancel/${booking.id}/`);
      setBookings((current) => current.map((item) => item.id === booking.id ? { ...item, status: "CANCELLED" } : item));
      toast.success("Booking cancelled");
    } catch (error) { toast.error(error.response?.data?.detail || "Could not cancel this booking"); }
    finally { setCancelling(null); }
  };

  const filtered = bookings.filter((booking) => filter === "ALL" || booking.status === filter);

  if (loading) return <div className="mb-container"><h2 className="mb-title">My Bookings</h2><p>Loading your bookings…</p></div>;

  return <div className="mb-container">
    <h2 className="mb-title">My Bookings</h2>
    <label className="mb-filter">Filter by status <select value={filter} onChange={(event) => setFilter(event.target.value)}>
      <option value="ALL">All bookings</option>{["PENDING", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
    </select></label>
    {filtered.length === 0 ? <p className="mb-empty">No bookings found.</p> : <div className="mb-grid">
      {filtered.map((booking) => <article className="mb-card" key={booking.id}>
        <header className="mb-card-header"><h3>Booking #{booking.id} · {booking.service_name}</h3><span className={`mb-status mb-${booking.status}`}>{statusLabel(booking.status)}</span></header>
        <p className="mb-address"><FaMapMarkerAlt aria-hidden="true" /> <span>{booking.address}</span></p>
        <p className="mb-meta"><span className="mb-meta-label">Date &amp; time</span><span>{booking.booking_date}{booking.time_slot && ` · ${booking.time_slot}`}</span></p>
        <p className="mb-meta"><span className="mb-meta-label">Professional</span><span>{booking.worker_name || "Being assigned"}</span></p>
        {booking.worker && <p className="mb-rating-summary">{booking.worker_photo && <img src={booking.worker_photo} alt={`${booking.worker_name} profile`} width="40" height="40" />}<span><FaStar aria-hidden="true" /> {Number(booking.worker_rating || 0).toFixed(1)}/5 · {booking.worker_rating_count || 0} reviews</span></p>}
        <button className="mb-btn mb-btn-details" type="button" onClick={() => setExpanded((current) => ({ ...current, [booking.id]: !current[booking.id] }))}>{expanded[booking.id] ? "Hide details" : "View details"}</button>
        {expanded[booking.id] && <section className="mb-details" aria-label={`Booking ${booking.id} details`}>
          <p><strong>Service:</strong> {booking.service_name}</p>
          <p><strong>Address:</strong> {booking.address}</p>
          <p><strong>Contact:</strong> {booking.contact_phone || "Not provided"}</p>
          <p><strong>Problem:</strong> {booking.problem_description || "Not provided"}</p>
          {booking.instructions && <p><strong>Instructions:</strong> {booking.instructions}</p>}
        </section>}
        {["PENDING", "ACCEPTED"].includes(booking.status) && <button className="mb-btn mb-btn-cancel" type="button" disabled={cancelling === booking.id} onClick={() => cancelBooking(booking)}>{cancelling === booking.id ? "Cancelling…" : "Cancel booking"}</button>}
        {booking.status === "COMPLETED" && booking.worker && (booking.review ? <p aria-label={`Rated ${booking.review.rating} out of 5`}>{"★".repeat(booking.review.rating)}{"☆".repeat(5 - booking.review.rating)} {booking.review.comment}</p> : <div className="mb-review">
          <p className="mb-review-label">Rate your professional</p>
          <div className="mb-stars" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => <button className={Number(ratings[booking.id]) >= star ? "is-selected" : ""} type="button" key={star} aria-label={`${star} star${star > 1 ? "s" : ""}`} aria-checked={Number(ratings[booking.id]) === star} role="radio" tabIndex={Number(ratings[booking.id]) === star || (!ratings[booking.id] && star === 1) ? 0 : -1} onKeyDown={(event) => { if (["ArrowRight", "ArrowUp"].includes(event.key)) { event.preventDefault(); const next = Math.min(star + 1, 5); setRatings((value) => ({ ...value, [booking.id]: next })); event.currentTarget.parentElement?.children[next - 1]?.focus(); } else if (["ArrowLeft", "ArrowDown"].includes(event.key)) { event.preventDefault(); const next = Math.max(star - 1, 1); setRatings((value) => ({ ...value, [booking.id]: next })); event.currentTarget.parentElement?.children[next - 1]?.focus(); } }} onClick={() => setRatings((value) => ({ ...value, [booking.id]: star }))}><FaStar /></button>)}
          </div>
          <textarea aria-label="Optional review" placeholder="Share a few details (optional)" value={reviews[booking.id] || ""} onChange={(event) => setReviews((value) => ({ ...value, [booking.id]: event.target.value }))} />
          <button className="mb-btn mb-btn-review" type="button" disabled={saving === booking.id} onClick={() => submitReview(booking)}>{saving === booking.id ? "Submitting…" : "Submit review"}</button>
        </div>)}
      </article>)}
    </div>}
  </div>;
}

export default MyBookings;
