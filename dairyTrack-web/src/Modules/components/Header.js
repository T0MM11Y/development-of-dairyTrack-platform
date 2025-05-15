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
            <div className="modal-content material-modal">
              <div className="modal-header">
                <h5 className="modal-title">Login</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={toggleModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                      {errorMessage}
                    </div>
                  )}
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={handleLogin}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="btn btn-secondary w-100 mt-2"
                  onClick={toggleModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
