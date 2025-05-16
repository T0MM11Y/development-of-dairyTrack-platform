import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { login } from "../controllers/authController";
import { useHistory } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/logo.png";

const Header = () => {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const history = useHistory();
  const location = useLocation();

  // Check if current page is blog
  const isBlogPage =
    location.pathname === "/blog" || location.pathname.startsWith("/blog/");

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

  const toggleModal = () => {
    // User is not logged in, show the login modal
    setShowModal(!showModal);
    setErrorMessage(""); // Clear error message when modal is toggled
  };

  const handleLogin = async () => {
    const result = await login(username, password);
    if (result.success) {
      // Get the user's role from the login result
      const userRole = result.data?.role || "user";

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: `Welcome to the ${userRole} page!`,
      });
      toggleModal(); // Close modal on successful login
      history.push("/admin"); // Redirect to admin page
    } else {
      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: result.message || "Login failed. Please try again.",
      });
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
                    className={`nav-link ${
                      isBlogPage && !scrolled ? "text-light" : ""
                    }`}
                    to="/"
                  >
                    <div
                      className="nav-link-icon "
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
                      isBlogPage && !scrolled ? "text-light" : ""
                    }`}
                    to="/about"
                  >
                    <div
                      className="nav-link-icon "
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
                    className={`nav-link ${
                      location.pathname === "/blog" ? "active" : ""
                    } ${isBlogPage && !scrolled ? "text-light" : ""}`}
                    to="/blog"
                  >
                    <div
                      className="nav-link-icon "
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
                      isBlogPage && !scrolled ? "text-light" : ""
                    }`}
                    to="/product"
                  >
                    <div
                      className="nav-link-icon "
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
                      isBlogPage && !scrolled ? "text-light" : ""
                    }`}
                    to="/gallery"
                  >
                    <div
                      className="nav-link-icon "
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
                      isBlogPage && !scrolled ? "text-light" : ""
                    }`}
                    to="/order"
                  >
                    <div
                      className="nav-link-icon "
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

              {/* Login Button - Updated to always use btn-primary styling */}
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
        <div className="modal-backdrop">
          <div className="modal-dialog modal-dialog-centered">
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                  }}
                >
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
                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="rememberMe"
                      />
                      <label
                        className="form-check-label small"
                        htmlFor="rememberMe"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                  {errorMessage && (
                    <div className="alert alert-danger py-2 small" role="alert">
                      <i className="far fa-exclamation-triangle me-2"></i>
                      {errorMessage}
                    </div>
                  )}
                  <button type="submit" className="btn btn-primary w-100 py-2">
                    <i className="fa fa-sign-in-alt me-2"></i>
                    Sign In
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
