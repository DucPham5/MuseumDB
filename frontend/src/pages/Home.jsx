// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AnimatedLink from "../components/AnimatedLink";
import image1 from '/src/assets/image1.jpg';
import image2 from '/src/assets/image2.jpg';
import image3 from '/src/assets/image3.jpg';
import image4 from '/src/assets/image4.jpg';
import "../styles/home.css";

const images = [image1, image2, image3, image4];

const Home = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // tracks login status
  const [userRole, setUserRole] = useState(null); // tracks user role
  const [jobTitle, setJobTitle] = useState(null); // tracks job_title

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      console.log("🔍 Home checking login...");
      try { // https://museumdb.onrender.com/auth/profile
        const res = await fetch("https://museumdb.onrender.com/auth/profile", { // http://localhost:5000/auth/profile
          method: "GET",
          credentials: "include",
        });

        const data = await res.json();
        console.log("📡 /auth/profile response:", res.status, data);

        if (res.ok) {
          setIsLoggedIn(true);
          setUserRole(data.role); // saves role if true
          setJobTitle(data.job_title || null); // save job_title if available
        } else {
          setIsLoggedIn(false);
          setUserRole(null); // clears role on failed login
          setJobTitle(null); // also clears job_title on failed login
        }
      } catch (error) {
        console.error("Error checking login status in Home:", error);
        setIsLoggedIn(false);
        setUserRole(null);
        setJobTitle(null);
      }
    };

    checkLogin();
  }, []);

  let adminRoute = "/adminhome";
  let adminLabel = "Admin";

  if (jobTitle === "Manager") {
    adminRoute = "/managerhome";
    adminLabel = "Manager";
  } 
  else if (jobTitle === "Curator") {
    adminRoute = "/curatorhome";
    adminLabel = "Curator";
  }

  return (
    <div className="home-background"> {/* Apply background only to Home.jsx */}
    <div className="page-container">
      <div className="sidebar">
        <h1 className="museum-name">Houston Museum of Fine Arts</h1>
        <nav className="nav-links">
          <ul>
            {!isLoggedIn && <li><AnimatedLink to="/auth">Login</AnimatedLink></li>}
            {isLoggedIn && <li><AnimatedLink to="/profile">Profile</AnimatedLink></li>}
            <li><AnimatedLink to="/exhibitions">Exhibitions</AnimatedLink></li>
            <li><AnimatedLink to="/tickets">Tickets</AnimatedLink></li>
            <li><AnimatedLink to="/memberships">Memberships</AnimatedLink></li>
            <li><AnimatedLink to="/giftshop">Shop</AnimatedLink></li>
            <li><AnimatedLink to="/contact">Review</AnimatedLink></li>

            {/* Admin/Manager/Curator Link */}
            {isLoggedIn && (userRole === "admin" || userRole === "staff") && (
              <li><AnimatedLink to={adminRoute}>{adminLabel}</AnimatedLink></li>
            )}
          </ul>
        </nav>
      </div>
      <div className="main-content">
        <motion.div
          className="text-section"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="main-title">The gateway to all of history</h2>
          <p className="subtitle">
            Explore the evolution of artistic expression through contemporary exhibitions and timeless masterpieces.
          </p>
        </motion.div>
        <motion.div
          className="image-frame"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
            <img src={images[currentImage]} alt="Featured Artwork" className="featured-image" />
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home;
