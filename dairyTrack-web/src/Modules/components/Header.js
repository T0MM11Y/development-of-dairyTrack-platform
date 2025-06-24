import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { login } from "../controllers/authController";
import { useHistory } from "react-router-dom";
import logo from "../../assets/logo.png";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [redirecting, setRedirecting] = useState(false); // State untuk loading overlay

  const [lockoutTime, setLockoutTime] = useState(0);

  // Enhanced theme
  const theme = {
    primary: "#E9A319",
    primaryGradient: "linear-gradient(135deg, #E9A319 0%, #F4B942 100%)",
    dark: "#2d3748",
    glass: "rgba(255, 255, 255, 0.1)",
    glassBorder: "rgba(255, 255, 255, 0.2)",
    shadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    glowShadow: "0 0 30px rgba(233, 163, 25, 0.3)",
  };

  // Animation variants
  const animations = {
    navbar: {
      hidden: { y: -100, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    },
    navLink: {
      rest: { scale: 1 },
      hover: {
        scale: 1.05,
        transition: { duration: 0.2 },
      },
    },
    modal: {
      hidden: { opacity: 0, scale: 0.8, y: 50 },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
          duration: 0.4,
          ease: [0.25, 0.46, 0.45, 0.94],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        y: 50,
        transition: { duration: 0.3 },
      },
    },
    backdrop: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
      exit: { opacity: 0 },
    },
    mobileMenu: {
      hidden: { opacity: 0, height: 0 },
      visible: {
        opacity: 1,
        height: "auto",
        transition: { duration: 0.3 },
      },
    },
    // Animation untuk loading overlay
    loadingOverlay: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" },
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      console.log("User data loaded from localStorage:", JSON.parse(savedUser));
    } else {
      console.log("No user data found in localStorage.");
    }
  }, []);
  const isBlogPage =
    location.pathname === "/blog" || location.pathname.startsWith("/blog/");

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // Enhanced scroll handler
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load lockout state
  useEffect(() => {
    const savedLockoutEndTime = localStorage.getItem("loginLockoutEndTime");
    if (savedLockoutEndTime) {
      const remainingTime = Math.floor(
        (parseInt(savedLockoutEndTime) - Date.now()) / 1000
      );
      if (remainingTime > 0) {
        setLockoutTime(remainingTime);
      } else {
        localStorage.removeItem("loginLockoutEndTime");
      }
    }
  }, []);

  // Timer for lockout
  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  useEffect(() => {
    if (lockoutTime > 0) {
      const lockoutEndTime = Date.now() + lockoutTime * 1000;
      localStorage.setItem("loginLockoutEndTime", lockoutEndTime.toString());
    } else {
      localStorage.removeItem("loginLockoutEndTime");
    }
  }, [lockoutTime]);

  // Body scroll lock
  useEffect(() => {
    if (showModal || mobileMenuOpen || redirecting) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [showModal, mobileMenuOpen, redirecting]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowPassword(false);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    if (showModal) resetForm();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Modified handleLogin function
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (username.trim().length < 3) {
      setErrorMessage("Username must be at least 3 characters");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    if (lockoutTime > 0) {
      setErrorMessage(
        `Please wait ${lockoutTime} seconds before trying again.`
      );
      return;
    }

    setLoading(true);
    try {
      const result = await login(username, password);

      if (result.success) {
        // Simpan data user dan token ke localStorage
        localStorage.setItem("user", JSON.stringify(result.data));
        localStorage.setItem("token", result.token || result.data.token); // Simpan token
        console.log("User data saved to localStorage:", result.data);
        console.log(
          "Token saved to localStorage:",
          result.token || result.data.token
        );

        setErrorMessage("");
        setSuccessMessage("Login Successful! Redirecting...");
        setLoginSuccess(true);

        setTimeout(() => {
          setRedirecting(true); // Tampilkan loading overlay

          setTimeout(() => {
            // Redirect berdasarkan role
            const userRole = result.data.role_id;

            if (userRole === 1) {
              // Admin
              window.location.href = "/admin";
            } else if (userRole === 2) {
              // Supervisor
              window.location.href = "/supervisor";
            } else if (userRole === 3) {
              // Farmer
              window.location.href = "/farmer";
            } else {
              // Role tidak dikenal, redirect ke home
              window.location.href = "/";
            }
          }, 1500); // Delay untuk menampilkan loading overlay
        }, 2000);

        setLoginAttempts(0);
      } else {
        setSuccessMessage("");
        setErrorMessage(result.message || "Login failed. Please try again.");
        setLoginAttempts((prev) => {
          const newAttempts = prev + 1;
          if (newAttempts >= 3) {
            setLockoutTime(30);
            return 0;
          }
          return newAttempts;
        });
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ...existing code... (getHeaderClasses dan navLinks tetap sama)
  const getHeaderClasses = () => {
    const baseStyles = {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      background: scrolled
        ? "rgba(255, 255, 255, 0.9)"
        : isBlogPage
        ? "transparent"
        : "rgba(255, 255, 255, 0.95)",
      borderBottom: scrolled ? "1px solid rgba(233, 163, 25, 0.1)" : "none",
      boxShadow: scrolled ? "0 8px 32px rgba(0, 0, 0, 0.1)" : "none",
    };

    return baseStyles;
  };

  const navLinks = [
    { path: "/", label: "Home", icon: "fas fa-home" },
    { path: "/about", label: "About", icon: "fas fa-info-circle" },
    { path: "/blog", label: "Blog", icon: "fas fa-blog" },
    { path: "/gallery", label: "Gallery", icon: "fas fa-images" },
    { path: "/products", label: "Products", icon: "fas fa-glass-whiskey" },
    { path: "/orders", label: "Orders", icon: "fas fa-shopping-cart" },
  ];

  return (
    <>
      <motion.header
        initial="hidden"
        animate="visible"
        variants={animations.navbar}
        style={getHeaderClasses()}
        className="modern-header"
      >
        {/* Header content tetap sama */}
        <div className="container">
          <div className="header-content">
            {/* Enhanced Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="logo-container"
            >
              <Link to="/" className="brand-link">
                <div className="logo-wrapper">
                  <img
                    src={logo}
                    alt="DairyTrack Logo"
                    className="logo-image"
                  />
                  <div className="logo-glow"></div>
                </div>
                <span
                  className={`brand-text ${
                    isBlogPage && !scrolled ? "light" : "dark"
                  }`}
                >
                  DairyTrack
                </span>
              </Link>
            </motion.div>
            {/* Desktop Navigation */}
            <nav className="desktop-nav">
              <ul className="nav-list">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.path}
                    className="nav-item"
                    variants={animations.navLink}
                    initial="rest"
                    whileHover="hover"
                  >
                    <Link
                      to={link.path}
                      className={`nav-link ${
                        isActive(link.path) ? "active" : ""
                      } ${isBlogPage && !scrolled ? "light" : "dark"}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="nav-link-content">
                        <i className={`${link.icon} nav-icon`}></i>
                        <span className="nav-text">{link.label}</span>
                      </div>
                      {isActive(link.path) && (
                        <motion.div
                          className="nav-indicator"
                          layoutId="activeTab"
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            {/* Action Buttons */}
            <div className="header-actions">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: theme.glowShadow }}
                whileTap={{ scale: 0.95 }}
                className="login-btn"
                onClick={toggleModal}
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                <span>Login</span>
              </motion.button>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`mobile-toggle ${mobileMenuOpen ? "active" : ""} ${
                  isBlogPage && !scrolled ? "light" : "dark"
                }`}
                onClick={toggleMobileMenu}
              >
                <span className="toggle-line line1"></span>
                <span className="toggle-line line2"></span>
                <span className="toggle-line line3"></span>
              </motion.button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={animations.mobileMenu}
                className="mobile-nav"
              >
                <div className="mobile-nav-content">
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: index * 0.1 },
                      }}
                      className="mobile-nav-item"
                    >
                      <Link
                        to={link.path}
                        className={`mobile-nav-link ${
                          isActive(link.path) ? "active" : ""
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <i className={`${link.icon} mobile-nav-icon`}></i>
                        <span>{link.label}</span>
                        {isActive(link.path) && (
                          <div className="mobile-nav-indicator"></div>
                        )}
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Enhanced Login Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={animations.backdrop}
            className="modal-backdrop"
            onClick={toggleModal}
          >
            <motion.div
              variants={animations.modal}
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-card">
                {/* Modal Header */}
                <div className="modal-header">
                  <div className="modal-header-content">
                    <div className="modal-icon">
                      <i className="fas fa-shield-alt"></i>
                    </div>
                    <div>
                      <h3 className="modal-title">Welcome Back</h3>
                      <p className="modal-subtitle">Sign in to your account</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="modal-close"
                    onClick={toggleModal}
                    disabled={loading}
                  >
                    <i className="fas fa-times"></i>
                  </motion.button>
                </div>

                {/* Modal Body */}
                <div className="modal-body">
                  <form onSubmit={handleLogin} className="login-form">
                    {/* Username Field */}
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <i className="fas fa-user"></i>
                        </div>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter your username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <div className="input-wrapper">
                        <div className="input-icon">
                          <i className="fas fa-lock"></i>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-input"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={loading}
                        />
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i
                            className={`fas ${
                              showPassword ? "fa-eye-slash" : "fa-eye"
                            }`}
                          ></i>
                        </motion.button>
                      </div>
                    </div>

                    {/* Messages */}
                    <AnimatePresence>
                      {(successMessage || errorMessage) && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`message ${
                            successMessage ? "success" : "error"
                          }`}
                        >
                          <i
                            className={`fas ${
                              successMessage
                                ? "fa-check-circle"
                                : "fa-exclamation-triangle"
                            }`}
                          ></i>
                          <span>{successMessage || errorMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="submit-btn"
                      disabled={loading || lockoutTime > 0 || loginSuccess}
                    >
                      {loading ? (
                        <div className="loading-content">
                          <div className="loading-spinner"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : lockoutTime > 0 ? (
                        <span>Locked ({lockoutTime}s)</span>
                      ) : (
                        <div className="btn-content">
                          <i className="fas fa-sign-in-alt"></i>
                          <span>Sign In</span>
                        </div>
                      )}
                    </motion.button>

                    {/* Security Notice */}
                    <div className="security-notice">
                      <i className="fas fa-shield-alt"></i>
                      <span>Your login is secured with encryption</span>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay - Tambahan baru */}
      <AnimatePresence>
        {redirecting && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={animations.loadingOverlay}
            className="redirect-overlay"
          >
            <div className="redirect-content">
              <motion.div
                className="redirect-logo"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <img src={logo} alt="DairyTrack" />
              </motion.div>

              <motion.div
                className="redirect-spinner"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "linear",
                }}
              ></motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="redirect-title"
              >
                Redirecting ...
              </motion.h3>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="redirect-subtitle"
              >
                Please wait while we prepare your dashboard...
              </motion.p>

              <motion.div
                className="redirect-progress"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              ></motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        /* ...existing styles tetap sama... */
        .modern-header {
          font-family: "Inter", sans-serif;
          padding: 0.5rem 0; /* Dikurangi dari 1rem menjadi 0.5rem */
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        /* Logo Styles */
        .logo-container {
          z-index: 10;
        }

        .brand-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          gap: 0.75rem;
        }

        .logo-wrapper {
          position: relative;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-image {
          width: 35px;
          height: 25px;
          border-radius: 50%;
          position: relative;
          z-index: 2;
          background: white;
          padding: 2px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .logo-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${theme.primaryGradient};
          border-radius: 50%;
          opacity: 0.3;
          filter: blur(8px);
          animation: pulse 2s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from {
            transform: scale(0.9);
            opacity: 0.3;
          }
          to {
            transform: scale(1.1);
            opacity: 0.6;
          }
        }

        .brand-text {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          transition: all 0.3s ease;
        }

        .brand-text.light {
          color: white;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .brand-text.dark {
          color: ${theme.dark};
          background: ${theme.primaryGradient};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: none;
        }

        @media (min-width: 992px) {
          .desktop-nav {
            display: block;
          }
        }

        .nav-list {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .nav-item {
          position: relative;
        }

        .nav-link {
          display: block;
          text-decoration: none;
          position: relative;
          padding: 0.75rem 0;
          transition: all 0.3s ease;
        }

        .nav-link-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-icon {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .nav-text {
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.025em;
        }

        .nav-link.light {
          color: rgba(255, 255, 255, 0.9);
        }

        .nav-link.light:hover {
          color: white;
        }

        .nav-link.dark {
          color: ${theme.dark};
        }

        .nav-link.dark:hover {
          color: ${theme.primary};
        }

        .nav-link.active {
          color: ${theme.primary} !important;
          font-weight: 600;
        }

        .nav-indicator {
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: ${theme.primaryGradient};
          border-radius: 2px;
        }

        /* Header Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .login-btn {
          background: ${theme.primaryGradient};
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(233, 163, 25, 0.3);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Mobile Toggle */
        .mobile-toggle {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          width: 40px;
          height: 40px;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        @media (min-width: 992px) {
          .mobile-toggle {
            display: none;
          }
        }

        .toggle-line {
          width: 24px;
          height: 2px;
          transition: all 0.3s ease;
          border-radius: 1px;
        }

        .mobile-toggle.light .toggle-line {
          background: white;
        }

        .mobile-toggle.dark .toggle-line {
          background: ${theme.dark};
        }

        .mobile-toggle.active .line1 {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .mobile-toggle.active .line2 {
          opacity: 0;
        }

        .mobile-toggle.active .line3 {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Mobile Navigation */
        .mobile-nav {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-top: 1px solid rgba(233, 163, 25, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        @media (min-width: 992px) {
          .mobile-nav {
            display: none;
          }
        }

        .mobile-nav-content {
          padding: 1rem 0;
        }

        .mobile-nav-item {
          margin-bottom: 0.5rem;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 2rem;
          text-decoration: none;
          color: ${theme.dark};
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }

        .mobile-nav-link:hover {
          background: rgba(233, 163, 25, 0.1);
          color: ${theme.primary};
        }

        .mobile-nav-link.active {
          background: rgba(233, 163, 25, 0.1);
          color: ${theme.primary};
          font-weight: 600;
        }

        .mobile-nav-icon {
          font-size: 1.1rem;
        }

        .mobile-nav-indicator {
          position: absolute;
          right: 1rem;
          width: 4px;
          height: 4px;
          background: ${theme.primary};
          border-radius: 50%;
        } /* Modal Styles */
        .modal-backdrop {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(8px) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 2000 !important;
          padding: 1rem !important;
          box-sizing: border-box !important;
        }

        .modal-container {
          width: 450px !important;
          max-width: 450px !important;
          min-width: 450px !important;
          max-height: 90vh !important;
          overflow-y: auto !important;
          position: relative !important;
          box-sizing: border-box !important;
        }

        .modal-card {
          background: white !important;
          border-radius: 24px !important;
          overflow: hidden !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2) !important;
          position: relative !important;
          min-height: 500px !important;
          max-height: none !important;
          height: auto !important;
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          box-sizing: border-box !important;
        } /* Modal Header */
        .modal-header {
          background: ${theme.primaryGradient};
          color: white;
          padding: 2rem;
          position: relative;
          overflow: hidden;
          min-height: 120px;
          max-height: 120px;
          flex-shrink: 0;
          flex-grow: 0;
        }

        .modal-header::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -20px;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .modal-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 2;
        }

        .modal-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          backdrop-filter: blur(10px);
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }

        .modal-subtitle {
          margin: 0.25rem 0 0;
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          backdrop-filter: blur(10px);
        } /* Modal Body */
        .modal-body {
          padding: 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 380px;
          max-height: none;
          box-sizing: border-box;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          box-sizing: border-box;
        }

        .form-label {
          font-weight: 600;
          color: ${theme.dark};
          font-size: 0.9rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          box-sizing: border-box;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: #718096;
          font-size: 1rem;
          z-index: 2;
        }
        .form-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: white;
          box-sizing: border-box;
          min-height: 50px;
        }

        .form-input:focus {
          outline: none;
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px rgba(233, 163, 25, 0.1);
        }

        .form-input:disabled {
          background: #f7fafc;
          cursor: not-allowed;
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .password-toggle:hover {
          color: ${theme.primary};
          background: rgba(233, 163, 25, 0.1);
        } /* Messages */
        .message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          min-height: 50px;
          max-height: 50px;
          height: 50px;
          transition: all 0.3s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .message.success {
          background: rgba(72, 187, 120, 0.1);
          color: #2f855a;
          border: 1px solid rgba(72, 187, 120, 0.2);
        }

        .message.error {
          background: rgba(245, 101, 101, 0.1);
          color: #c53030;
          border: 1px solid rgba(245, 101, 101, 0.2);
        } /* Submit Button */
        .submit-btn {
          background: ${theme.primaryGradient};
          border: none;
          color: white;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(233, 163, 25, 0.3);
          min-height: 56px;
          max-height: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          box-sizing: border-box;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .loading-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        } /* Security Notice */
        .security-notice {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          font-size: 0.8rem;
          color: #718096;
          margin-top: 0.5rem;
          height: 24px;
          min-height: 24px;
          max-height: 24px;
          width: 100%;
          box-sizing: border-box;
        }

        /* NEW: Redirect Overlay Styles */
        .redirect-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #e9a319 0%, #f4b942 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: "Inter", sans-serif;
        }

        .redirect-content {
          text-align: center;
          color: white;
          max-width: 400px;
          padding: 2rem;
        }

        .redirect-logo {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .redirect-logo img {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: white;
          padding: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .redirect-spinner {
          width: 80px;
          height: 80px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          margin: 0 auto 2rem;
          position: absolute;
          top: 0;
          left: 0;
        }

        .redirect-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 1rem;
          line-height: 1.2;
        }

        .redirect-subtitle {
          font-size: 1rem;
          opacity: 0.9;
          margin: 0 0 2rem;
          line-height: 1.5;
        }

        .redirect-progress {
          height: 4px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 2px;
          margin-top: 2rem;
          position: relative;
          overflow: hidden;
        }

        .redirect-progress::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 30%;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 2px;
          animation: progress-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes progress-shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }

        /* Utility Classes */
        .modal-open {
          overflow: hidden;
        } /* Responsive Design */
        @media (max-width: 576px) {
          .container {
            padding: 0 1rem;
          }

          .modal-container {
            min-width: 300px;
            max-width: 350px;
            width: 100%;
          }

          .modal-card {
            min-height: 450px;
            max-height: none;
            height: auto;
            width: 100%;
          }

          .modal-body {
            padding: 1.5rem;
            min-height: 330px;
            max-height: none;
          }

          .modal-header {
            padding: 1.5rem;
            min-height: 100px;
            max-height: 100px;
          }

          .header-content {
            gap: 1rem;
          }

          .form-input {
            min-height: 45px;
          }

          .submit-btn {
            min-height: 50px;
            max-height: 50px;
            height: 50px;
          }

          .message {
            min-height: 45px;
            max-height: 45px;
            height: 45px;
          }

          .redirect-content {
            padding: 1.5rem;
          }

          .redirect-title {
            font-size: 1.5rem;
          }

          .redirect-subtitle {
            font-size: 0.9rem;
          }

          .redirect-logo {
            width: 60px;
            height: 60px;
          }

          .redirect-logo img {
            width: 40px;
            height: 40px;
          }

          .redirect-spinner {
            width: 60px;
            height: 60px;
          }
        }

        /* Additional fixes for consistent sizing across all pages */
        @media (min-width: 577px) and (max-width: 768px) {
          .modal-container {
            min-width: 400px;
            max-width: 450px;
            width: 100%;
          }

          .modal-card {
            min-height: 500px;
            max-height: none;
            height: auto;
            width: 100%;
          }
        }

        @media (min-width: 769px) {
          .modal-container {
            min-width: 450px;
            max-width: 450px;
            width: 450px;
          }

          .modal-card {
            min-height: 500px;
            max-height: none;
            height: auto;
            width: 100%;
          }
        }

        /* Force consistent modal sizing regardless of page context */
        .modal-backdrop .modal-container {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          margin: 0 !important;
        }

        .modal-backdrop .modal-card {
          position: relative !important;
          margin: 0 !important;
          transform: none !important;
        }
      `}</style>
    </>
  );
};

export default Header;
