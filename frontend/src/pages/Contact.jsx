import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import "../styles/contact.css";

const ContactPage = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState("All Reviews");
  // Default sort option is "Most Recent to Oldest"
  const [sortOption, setSortOption] = useState("Most Recent to Oldest");
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showNotCustomerPrompt, setShowNotCustomerPrompt] = useState(false);
  const [exhibitions, setExhibitions] = useState([]);

  const [formData, setFormData] = useState({
    topic: "",
    title: "",
    message: "",
    rating: 0,
    maxStars: 5,
  });

  const topics = [...exhibitions.map((exhibit) => exhibit.Name), "Other"];

  // Compute unique filter options dynamically from reviews' Complaint_Type
  // (which now holds exhibit names).
  const filterOptions = useMemo(() => {
    const types = reviews.map((r) => r.Complaint_Type).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [reviews]);

  useEffect(() => { 
    fetch("https://museumdb.onrender.com/manage-exhibition")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setExhibitions(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { 
    fetch("https://museumdb.onrender.com/contact")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { 
    fetch("https://museumdb.onrender.com/auth/profile", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  // Compute sorted reviews whenever reviews, filter, or sortOption changes.
  const sortedReviews = useMemo(() => {
    let filteredReviews =
      filter === "All Reviews"
        ? [...reviews]
        : reviews.filter((c) => c.Complaint_Type === filter);

    if (sortOption === "Most Recent to Oldest") {
      filteredReviews.sort((a, b) => {
        const dateA = new Date(a.Complaint_Date);
        const dateB = new Date(b.Complaint_Date);
        const dateStrA = dateA.toISOString().slice(0, 10); // YYYY-MM-DD
        const dateStrB = dateB.toISOString().slice(0, 10);
        const timeA = a.Complaint_Time || "00:00:00";
        const timeB = b.Complaint_Time || "00:00:00";
        const dateTimeA = new Date(`${dateStrA}T${timeA}`);
        const dateTimeB = new Date(`${dateStrB}T${timeB}`);
        return dateTimeB - dateTimeA; // Descending: newest first
      });
    } else if (sortOption === "Oldest to Most Recent") {
      filteredReviews.sort((a, b) => {
        const dateA = new Date(a.Complaint_Date);
        const dateB = new Date(b.Complaint_Date);
        const dateStrA = dateA.toISOString().slice(0, 10);
        const dateStrB = dateB.toISOString().slice(0, 10);
        const timeA = a.Complaint_Time || "00:00:00";
        const timeB = b.Complaint_Time || "00:00:00";
        const dateTimeA = new Date(`${dateStrA}T${timeA}`);
        const dateTimeB = new Date(`${dateStrB}T${timeB}`);
        return dateTimeA - dateTimeB; // Ascending: oldest first
      });
    } else if (sortOption === "Rating (Highest to Lowest)") {
      filteredReviews.sort((a, b) => (b.Complaint_Rating || 0) - (a.Complaint_Rating || 0));
    } else if (sortOption === "Resolved to Pending") {
      const order = { "Resolved": 0, "Pending": 1 };
      filteredReviews.sort((a, b) => (order[a.Status] ?? 2) - (order[b.Status] ?? 2));
    }
    return filteredReviews;
  }, [reviews, filter, sortOption]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (rating) => {
    setFormData({ ...formData, rating });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user || user.role !== "customer") {
      alert("Only customers can submit reviews.");
      return;
    }

    const newComplaint = {
      customer_ID: user.customer_id,
      complaint_date: new Date().toISOString().slice(0, 10),
      complaint_time: new Date().toISOString().slice(11, 19),
      complaint_type: formData.topic,
      Complaint_Title: formData.title,
      Complaint_Rating: formData.rating,
      description: formData.message,
      status: "Pending",
      Ticket_ID: null,
      Staff_ID: null,
      Events_ID: null,
      Special_Exhibition_ID: null,
    };

    const now = new Date();
    const houstonTime = now.toLocaleTimeString("en-US", {
      timeZone: "America/Chicago",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    fetch("https://museumdb.onrender.com/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newComplaint),
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error) {
          return;
        }
        setReviews((prev) => [
          {
            Complaint_ID: resData.insertedId || Date.now(),
            Customer_ID: user.customer_id,
            Complaint_Date: newComplaint.complaint_date,
            Complaint_Time: houstonTime,
            Complaint_Type: newComplaint.complaint_type,
            Complaint_Title: newComplaint.Complaint_Title,
            Complaint_Rating: newComplaint.Complaint_Rating,
            Description: newComplaint.description,
            Status: newComplaint.status,
            Ticket_ID: null,
            Staff_ID: null,
            Events_ID: null,
            Special_Exhibition_ID: null,
          },
          ...prev,
        ]);
      })
      .catch(() => {})
      .finally(() => {
        setFormData({
          topic: "",
          title: "",
          message: "",
          rating: 0,
          maxStars: 5,
        });
        setShowForm(false);
      });
  };

  return (
    <div className="main-layout">
      <div className="review-container">
        <div className="review-header">
          <h1 className="review-title">Reviews ({sortedReviews.length})</h1>
          <div className="review-controls">
            <button
              className="add-review-button"
              onClick={() => {
                if (!user) {
                  setShowLoginPrompt(true);
                } else if (user.role !== "customer") {
                  setShowNotCustomerPrompt(true);
                } else {
                  setShowForm(!showForm);
                }
              }}
            >
              {showForm ? "Cancel" : "Add New Review"}
            </button>
            <select
              className="filter-dropdown"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All Reviews">All Reviews</option>
              {filterOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              className="filter-dropdown"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="Most Recent to Oldest">
                Most Recent to Oldest
              </option>
              <option value="Oldest to Most Recent">
                Oldest to Most Recent
              </option>
              <option value="Rating (Highest to Lowest)">
                Rating (Highest to Lowest)
              </option>
              <option value="Resolved to Pending">
                Resolved to Pending
              </option>
            </select>
          </div>
        </div>

        {showLoginPrompt && (
          <div className="login-modal">
            <div className="login-modal-content">
              <p className="login-modal-text">
                You need to <strong>log in</strong> to submit a review.
              </p>
              <button
                className="submit-review-button"
                onClick={() => setShowLoginPrompt(false)}
              >
                Okay
              </button>
            </div>
          </div>
        )}

        {showNotCustomerPrompt && (
          <div className="login-modal">
            <div className="login-modal-content">
              <p className="login-modal-text">
                Only <strong>customers</strong> are allowed to submit reviews.
              </p>
              <button
                className="submit-review-button"
                onClick={() => setShowNotCustomerPrompt(false)}
              >
                Okay
              </button>
            </div>
          </div>
        )}

        {showForm && user && (
          <div className="form-wrapper">
            <motion.h1 className="form-title">
              Please Describe Your Review!
            </motion.h1>
            <motion.form onSubmit={handleSubmit} className="review-form">
              <div className="form-group">
                <label>Exhibit</label>
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select an exhibit</option>
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter review title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Feedback</label>
                <textarea
                  name="message"
                  placeholder="Write your feedback"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                />
              </div>
              <div className="form-group">
                <label>Rating</label>
                <div className="rating-stars">
                  {Array.from({ length: formData.maxStars }, (_, i) => i + 1).map(
                    (num) => (
                      <span
                        key={num}
                        className={num <= formData.rating ? "star filled" : "star"}
                        onClick={() => handleRatingChange(num)}
                      >
                        ★
                      </span>
                    )
                  )}
                </div>
              </div>
              <button type="submit" className="submit-review-button">
                Submit Review
              </button>
            </motion.form>
          </div>
        )}

        <div className="review-list">
          {sortedReviews.length === 0 ? (
            <p className="no-reviews">No reviews yet.</p>
          ) : (
            sortedReviews.map((c, index) => (
              <motion.div
                className="review-card"
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <h2 className="review-card-title">
                  {c.Complaint_Title || "Untitled"}{" "}
                  {c.Complaint_Rating
                    ? `(Rating: ${c.Complaint_Rating}/5 stars)`
                    : ""}
                </h2>
                <p>
                  <strong>Description:</strong>{" "}
                  {c.Description || "No message"}
                </p>
                <p>
                  <strong>Exhibit:</strong>{" "}
                  {c.Complaint_Type || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {c.Complaint_Date
                    ? new Date(c.Complaint_Date).toISOString().slice(0, 10)
                    : "Unknown"}
                </p>
                <p>
                  <strong>Time (CST):</strong>{" "}
                  {c.Complaint_Time || "Unknown"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  {c.Status || "Pending"}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
