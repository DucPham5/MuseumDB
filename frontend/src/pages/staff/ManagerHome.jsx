import "../../styles/admin.css";
import { useNavigate } from "react-router-dom";
import React, { useEffect } from "react";

const ManagerHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("[DEBUG - ManagerHome] Fetching profile to verify Manager access...");
    fetch("https://museumdb.onrender.com/auth/profile", { // https://museumdb.onrender.com/auth/profile
      method: "GET", // http://localhost:5000/auth/profile
      credentials: "include",
    })
      .then((res) => {
        console.log("[DEBUG - ManagerHome] Response status:", res.status);
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[DEBUG - ManagerHome] User data received:", data);
        // If user is not staff or job_title is not "Manager", deny or redirect
        if (!((data.role === "staff" || data.role === "admin") && data.job_title === "Manager")) {
          console.warn("[DEBUG - ManagerHome] Access denied for this user. Redirecting...");
          alert("Access denied. Only Managers can access this page.");
          navigate("/");
        } else {
          console.log("[DEBUG - ManagerHome] Access granted for Manager.");
        }
      })
      .catch((err) => {
        console.error("[DEBUG - ManagerHome] Error verifying role:", err);
        navigate("/");
      });
  }, [navigate]);

  return (
    <main className="admin-container px-10 py-8">
      {/* Dashboard Title */}
      <h3 className="text-[#313639] text-4xl mb-8 tracking-wide text-center">
        Manager Dashboard
      </h3>

      {/* Two Column Layout */}
      <div className="admin-dashboard flex justify-between gap-10">
        {/* Reports Column */}
        <div className="admin-reports flex flex-col gap-4">
          <h4 className="text-2xl font-semibold text-[#1e1e1e]">Reports</h4>
          <button onClick={() => navigate('/admin/view-complaints')} className="admin-button">
            View Complaints
          </button>
        </div>

        {/* Manage Column */}
        <div className="admin-management flex flex-col gap-4">
          <h4 className="text-2xl font-semibold text-[#1e1e1e]">Manage</h4>
          <button onClick={() => navigate('/admin/manage-employees')} className="admin-button">
            Manage Employees
          </button>
          <button onClick={() => navigate('/admin/manage-giftshop')} className="admin-button">
            Manage Gift Shop
          </button>
        </div>
      </div>

      {/* Profile Button Centered at Bottom */}
      <div className="mt-10 text-center">
        <button onClick={() => navigate('/profile')} className="admin-button bg-[#1e1e1e] hover:bg-black">
          Go to Profile
        </button>
      </div>
    </main>
  );
};

export default ManagerHome;
