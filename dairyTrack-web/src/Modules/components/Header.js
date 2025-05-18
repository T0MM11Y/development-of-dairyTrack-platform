import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { login } from "../controllers/authController";
import { useHistory } from "react-router-dom";
import logo from "../../assets/logo.png";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Check if current page is blog
  const isBlogPage =
    location.pathname === "/blog" || location.pathname.startsWith("/blog/");

  // Function to check if a path is active
  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Load lockout state on component mount
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

  // Save lockout state whenever it changes
  useEffect(() => {
    if (lockoutTime > 0) {
      const lockoutEndTime = Date.now() + lockoutTime * 1000;
      localStorage.setItem("loginLockoutEndTime", lockoutEndTime.toString());
    } else {
      localStorage.removeItem("loginLockoutEndTime");
    }
  }, [lockoutTime]);

  // Add body class when modal is open to prevent scrolling
  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowPassword(false);
  };

  const toggleModal = () => {
    setShowModal(!showModal);
    if (showModal) {
      // If we're closing the modal
      resetForm();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setErrorMessage("");
    setSuccessMessage("");

    // Basic validation
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
        setErrorMessage("");
        setSuccessMessage("Login Successful! Redirecting...");
        setTimeout(() => {
          setSuccessMessage("");
          resetForm();
          toggleModal();
          history.push("/admin");
        }, 3000);
        setLoginAttempts(0);
      } else {
        setSuccessMessage("");
        setErrorMessage(result.message || "Login failed. Please try again.");

        // Use functional update to ensure we have the latest value
        setLoginAttempts((prevAttempts) => {
          const newAttempts = prevAttempts + 1;
          if (newAttempts >= 3) {
            setLockoutTime(30);
            return 0; // Reset attempts after lockout
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

  // Get header classes based on page and scroll state
  const getHeaderClasses = () => {
    const baseClass = "navbar navbar-expand-lg fixed-top";

    if (isBlogPage) {
      return `${baseClass} ${
        scrolled ? "navbar-blog-scrolled" : "navbar-blog"
      }`;
    }

    return `${baseClass} navbar-dark`;
  };

  return (
    <>
      <header>
        <nav className={getHeaderClasses()} id="mainNav">
          <div className="container">
            {/* Logo */}
            <Link className="navbar-brand" to="/">
              <img
                src={logo}
                alt="Logo"
                width="30"
                height="30"
                className="d-inline-block align-text-top logo-bg-white"
              />
              <span
                className={`brand-text ${
                  isBlogPage && !scrolled ? "text-light" : ""
                }`}
              >
                DairyTrack
              </span>
            </Link>

            {/* Toggle button for mobile view */}
            <button
              className={`navbar-toggler ${
                isBlogPage && !scrolled
                  ? "navbar-toggler-light"
                  : "navbar-toggler-dark"
              }`}
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            {/* Navigation Links */}
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/") ? "active" : ""} ${
                      isBlogPage && !scrolled ? "text-light" : ""
                    }`}
                    to="/"
                  >
                    <div
                      className="nav-link-icon"
                      style={{
                        letterSpacing: "0.1rem",
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "0.9rem",
                      }}
                    >
                      Home
                    </div>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/about") ? "active" : ""
                    } ${isBlogPage && !scrolled ? "text-light" : ""}`}
                    to="/about"
                  >
                    <div
                      className="nav-link-icon"
                      style={{
                        letterSpacing: "0.1rem",
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "0.9rem",
                      }}
                    >
                      About
                    </div>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isActive("/blog") ? "active" : ""} ${
                      isBlogPage && !scrolled ? "text-light" : ""
                    }`}
                    to="/blog"
                  >
                    <div
                      className="nav-link-icon"
                      style={{
                        letterSpacing: "0.1rem",
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "0.9rem",
                      }}
                    >
                      Blog
                    </div>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/product") ? "active" : ""
                    } ${isBlogPage && !scrolled ? "text-light" : ""}`}
                    to="/product"
                  >
                    <div
                      className="nav-link-icon"
                      style={{
                        letterSpacing: "0.1rem",
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "0.9rem",
                      }}
                    >
                      Product
                    </div>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/gallery") ? "active" : ""
                    } ${isBlogPage && !scrolled ? "text-light" : ""}`}
                    to="/gallery"
                  >
                    <div
                      className="nav-link-icon"
                      style={{
                        letterSpacing: "0.1rem",
                        fontFamily: "Roboto, sans-serif",
                        fontSize: "0.9rem",
                      }}
                    >
                      Gallery
                    </div>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${
                      isActive("/order") ? "active" : ""
                    } ${isBlogPage && !scrolled ? "text-light" : ""}`}
                    to="/order"
                  >
                    <div
                      className="nav-link-icon"
                      style={{
                        letterSpacing: "0.1rem",
                        fontSize: "0.9rem",
                        fontFamily: "Roboto, sans-serif",
                      }}
                    >
                      Order
                    </div>
                  </Link>
                </li>
              </ul>

              {/* Login Button */}
              <button
                className="btn btn-primary ms-lg-3"
                onClick={toggleModal}
                style={{
                  fontFamily: "Roboto, monospace",
                  fontWeight: "700",
                  fontSize: "0.8rem",
                  letterSpacing: "0.1rem",
                  height: "36px",
                }}
              >
                Login
              </button>
            </div>
          </div>
        </nav>
      </header>
      {/* Login Modal */}
      {showModal && (
        <div className="modal-blur-backdrop" onClick={toggleModal}>
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content material-modal shadow-lg border-0">
              <div className="modal-header bg-dark border-0 pb-1">
                <h5 className="modal-title fw-bold">Sign In</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={toggleModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body px-4 py-4">
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="far fa-user"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        id="username"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="fas fa-lock"></i>
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-start-0 border-end-0"
                        id="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        className="input-group-text bg-light border-start-0 cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ cursor: "pointer" }}
                      >
                        <i
                          className={`fas ${
                            showPassword ? "fa-eye-slash" : "fa-eye"
                          }`}
                        ></i>
                      </span>
                    </div>
                  </div>

                  {/* Loading Indicator */}
                  {loading && (
                    <div className="text-center mb-3">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div
                      className="alert alert-success py-2 small"
                      role="alert"
                    >
                      <i className="far fa-check-circle me-2"></i>
                      {successMessage}
                    </div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      <i className="far fa-exclamation-triangle me-2"></i>
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 text-white"
                    disabled={loading || lockoutTime > 0} // Disable button while loading or locked out
                  >
                    {loading
                      ? "Logging in..."
                      : lockoutTime > 0
                      ? `Locked (${lockoutTime}s)`
                      : "Sign In"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Blur backdrop styles */
        .modal-blur-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: fadeIn 0.2s ease-out;
        }

        .modal-content {
          animation: modalSlideIn 0.3s ease-out;
          border-radius: 12px;
          overflow: hidden;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          border-radius: 12px 12px 0 0;
        }

        .modal-open {
          overflow: hidden;
        }

        /* Style for active nav links */
        .nav-link.active {
          font-weight: bold;
          position: relative;
          color: #e9a319; /* Change to your desired active link color */
        }

        .nav-link.active:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          transform: scaleX(1);
          color: #e9a319; /* Change to your desired active link color */
          width: 100%;
          height: 2px;
          background-color: currentColor;
        }
      `}</style>
    </>
  );
};

export default Header;
