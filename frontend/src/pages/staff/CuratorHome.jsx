import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const CuratorHome = () => {
  const navigate = useNavigate();

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
        if (!((data.role === "staff" || data.role === "admin") && data.job_title === "Curator")) {
          alert("Access denied. Only Curators can access this page.");
          navigate("/");
        }
      })
      .catch((err) => {
        console.error("[CuratorHome] Role verification error:", err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <main className="admin-container">
      <h3 className="admin-title">Curator Dashboard</h3>

      <div className="admin-dashboard">
        {/* Reports Card */}
        <div className="admin-card">
          <h4>Reports</h4>
          <button onClick={() => navigate("/admin/exhibition-report")} className="admin-button">
            Exhibit Report
          </button>
        </div>

        {/* Manage Card */}
        <div className="admin-card">
          <h4>Manage</h4>
          <button onClick={() => navigate("/admin/manage-exhibits")} className="admin-button">
            Manage Exhibits
          </button>
          <button onClick={() => navigate("/admin/manage-artworks")} className="admin-button">
            Manage Artworks
          </button>
        </div>
      </div>

      <button onClick={() => navigate("/profile")} className="admin-profile-button">
        Go to Profile
      </button>
    </main>
  );
};

export default CuratorHome;
