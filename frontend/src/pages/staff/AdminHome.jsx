import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const AdminHome = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("https://museumdb.onrender.com/notifications");
        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    fetch("https://museumdb.onrender.com/auth/profile", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if ((data.role === "staff" || data.role === "admin") && data.job_title === "Manager") {
          navigate("/managerhome");
          return;
        }
        if ((data.role === "staff" || data.role === "admin") && data.job_title === "Curator") {
          navigate("/curatorhome");
          return;
        }
        if (data.role === "customer") {
          navigate("/profile");
        } else if (data.role !== "staff" && data.role !== "admin") {
          alert("Access denied. Only staff and admins can access this page.");
          navigate("/");
        }
      })
      .catch((err) => {
        console.log("Error verifying role:", err);
        navigate("/");
      });
  }, []);

  return (
    <main className="admin-container">
      <h3 className="admin-title">Admin Dashboard</h3>

      <div className="admin-dashboard">
        {/* Reports Card */}
        <div className="admin-card">
          <h4>Reports</h4>
          <button onClick={() => navigate("/admin/total-report")} className="admin-button">
            Total Sales Report
          </button>
          <button onClick={() => navigate("/admin/exhibition-report")} className="admin-button">
            Exhibit Report
          </button>
          <button onClick={() => navigate("/admin/view-complaints")} className="admin-button">
            Complaint Reports
          </button>
        </div>

        {/* Manage Card */}
        <div className="admin-card">
          <h4>Manage</h4>
          <button onClick={() => navigate("/admin/manage-employees")} className="admin-button">
            Manage Employees
          </button>
          <button onClick={() => navigate("/admin/manage-artworks")} className="admin-button">
            Manage Artworks
          </button>
          <button onClick={() => navigate("/admin/manage-exhibits")} className="admin-button">
            Manage Exhibits
          </button>
          <button onClick={() => navigate("/admin/manage-giftshop")} className="admin-button">
            Manage Gift Shop
          </button>
          <button onClick={() => navigate("/admin/manage-tickets")} className="admin-button">
            Manage Tickets
          </button>
        </div>
      </div>

      <button onClick={() => navigate("/profile")} className="admin-profile-button">
        Go to Profile
      </button>
    </main>
  );
};

export default AdminHome;

