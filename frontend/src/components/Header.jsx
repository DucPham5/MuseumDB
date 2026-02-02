import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AnimatedLink from "./AnimatedLink";
import { FaShoppingCart } from "react-icons/fa";
import { FaBell } from "react-icons/fa"; // Notification bell icon

import "../styles/header.css";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'staff' or 'customer'
  const [jobTitle, setJobTitle] = useState(null); // like "Manager" or "Curator"

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      console.log("[Header] Checking login...");
      try {
        const res = await fetch("https://museumdb.onrender.com/auth/profile", { // https://museumdb.onrender.com/auth/profile
          method: "GET", // https://museumdb.onrender.com/auth/profile
          credentials: "include",
        });

        const data = await res.json();
        console.log("📡 [Header] /auth/profile response:", res.status, data);

        if (res.ok) {
          setIsLoggedIn(true);
          setUserRole(data.role);
          setJobTitle(data.job_title || null); // might be undefined for customers
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
          setJobTitle(null);
        }
      } catch (error) {
        console.error("[Header] Error checking login:", error);
        setIsLoggedIn(false);
        setUserRole(null);
        setJobTitle(null);
      }
    };

    checkLogin();
  }, [location.pathname]);

  // Handle notifications dropdown
// Refresh notifications when other components dispatch a refresh event
useEffect(() => {
  const handleRefresh = () => {
    if (userRole === "admin") {
      // fetch("https://museumdb.onrender.com/notifications?status=unread")
         fetch("https://museumdb.onrender.com/notifications?status=unread")

        .then(res => res.json())
        .then(data => setNotifications(data))
        .catch(err => console.error("Failed to refresh notifications:", err));
    }
  };

  window.addEventListener("refresh-notifications", handleRefresh);
  handleRefresh(); // Initial fetch when component mounts, if userRole is admin

  return () => {
    window.removeEventListener("refresh-notifications", handleRefresh);
  };
}, [userRole]);


  

  const isTicketsPage = location.pathname === "/tickets";
  const isMembershipPage = location.pathname === "/memberships";
  const isGiftshopPage = location.pathname.startsWith("/Giftshop") && location.pathname !== "/Giftshop";
  const isShoppingCart = location.pathname === "/cart";
  const isContactPage = location.pathname === "/contact";

  const loginLinkStyle = isLoggedIn ? { display: "none" } : {};
  const profileLinkStyle = isLoggedIn ? {} : { display: "none" };

  const isManager = jobTitle === "Manager";
  const isCurator = jobTitle === "Curator";

  return (
    <header
      className={`header ${scrolled ? "scrolled" : ""} ${
        isTicketsPage || isContactPage || isMembershipPage || isGiftshopPage || isShoppingCart ? "tickets-page" : ""
      }`}
    >
      <h1 className="logo">
        <AnimatedLink to="/">MFA</AnimatedLink>
      </h1>
      <nav className="nav-links">
        <AnimatedLink to="/giftshop">Shop</AnimatedLink>
        <AnimatedLink to="/tickets">Tickets</AnimatedLink>
        <AnimatedLink to="/exhibitions">Exhibitions</AnimatedLink>
        <AnimatedLink to="/memberships">Memberships</AnimatedLink>
        <AnimatedLink to="/contact">Review</AnimatedLink>

        {/* Login tab - visible only if not logged in */}
        {!isLoggedIn && (
          <AnimatedLink to="/Auth" className="login">
            Login
          </AnimatedLink>
        )}

        {/* Profile tab - visible only if logged in */}
        {isLoggedIn && (
          <AnimatedLink to="/profile" className="login">
            Profile
          </AnimatedLink>
        )}

        {/* Dynamic Admin/Manager/Curator Link */}
        {(userRole === "admin" || userRole === "staff") && (
          <AnimatedLink
            to={
              isManager
                ? "/managerhome"
                : isCurator
                ? "/curatorhome"
                : "/adminhome"
            }
          >
            {isManager ? "Manager" : isCurator ? "Curator" : "Admin"}
          </AnimatedLink>
        )}
        

        {/* Notifications for admin users */}
        {userRole === "admin" && (
        <div className="notification-icon-container" style={{ position: "relative" }}>
          <FaBell
            className="notification-icon"
            style={{ cursor: "pointer", marginRight: "10px" }}
            onClick={() => setShowNotifications(prev => !prev)}
            onDoubleClick={() => {
              window.location.href = "/admin/notifications"; // or use `navigate()` if you're using React Router
            }}
          />
          {notifications.filter(note => note.status === 'unread').length > 0 && (
            <span className="notification-badge">
              {notifications.filter(note => note.status === 'unread').length}
            </span>
          )}

          {showNotifications && (
            <div className="notification-dropdown">
              <ul>
                {notifications.map((note, i) => (
                  <li key={i}>{note.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

        <AnimatedLink to="/cart">
          <FaShoppingCart />
        </AnimatedLink>
      </nav>
    </header>
  );
};

export default Header;
