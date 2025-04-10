import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

const CuratorHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[DEBUG - CuratorHome] Fetching profile to verify Curator access...");
    fetch("https://museumdb.onrender.com/auth/profile", { // https://museumdb.onrender.com/auth/profile
      method: "GET", // http://localhost:5000/auth/profile
      credentials: "include",
    })
      .then((res) => {
        console.log("[DEBUG - CuratorHome] Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[DEBUG - CuratorHome] User data received:", data);
        if (!((data.role === "staff" || data.role === "admin") && data.job_title === "Curator")) {
          console.warn("[DEBUG - CuratorHome] Access denied for this user. Redirecting...");
          alert("Access denied. Only Curators can access this page.");
          navigate("/");
        } else {
          console.log("[DEBUG - CuratorHome] Access granted for Curator.");
        }
      })
      .catch((err) => {
        console.error("[DEBUG - CuratorHome] Error verifying role:", err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <main className="admin-container px-10 py-8">
      {/* Dashboard Title */}
      <h3 className="text-[#313639] text-4xl mb-8 tracking-wide text-center">
        Curator Dashboard
      </h3>

      {/* Two Column Layout */}
      <div className="admin-dashboard flex justify-between gap-10">
        {/* Reports Column */}
        <div className="admin-reports flex flex-col gap-4">
          <h4 className="text-2xl font-semibold text-[#1e1e1e]">Reports</h4>
          <button onClick={() => navigate('/admin/exhibition-report')} className="admin-button">
            Exhibit Report
          </button>
        </div>

        {/* Manage Column */}
        <div className="admin-management flex flex-col gap-4">
          <h4 className="text-2xl font-semibold text-[#1e1e1e]">Manage</h4>
          <button onClick={() => navigate('/admin/manage-exhibits')} className="admin-button">
            Manage Exhibits
          </button>
          <button onClick={() => navigate('/admin/manage-artworks')} className="admin-button">
            Manage Artworks
          </button>
        </div>
      </div>

      {/* Profile Button Centered at Bottom */}
      <div className="mt-10 text-center">
        <button
          onClick={() => navigate('/profile')}
          className="admin-button bg-[#1e1e1e] hover:bg-black"
        >
          Go to Profile
        </button>
      </div>
    </main>
  );
};

export default CuratorHome;
