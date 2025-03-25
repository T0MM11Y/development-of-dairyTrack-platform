import React, { useState } from "react";
import "../assets/client/css/style.css";

import iconLogin from "../assets/admin/images/logo-dark.png";
// You'll need to import your right-side image from your directory
import loginSecurityImage from "../assets/admin/images/login.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    window.location.href = "/admin";
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-white">
      <div className="container">
        <div className="row">
          {/* Left side - Login form */}
          <div className="col-md-6 d-flex flex-column justify-content-center p-4">
            <div className="text-start mb-4">
              <a
                href="/"
                className="d-flex justify-content-center align-items-center text-decoration-none"
              >
                <img src={iconLogin} height="30" alt="Logo" />
              </a>
            </div>

            <div className="mb-4 text-center">
              <h2 className="fw-bold mb-3">Hello!</h2>
              <p className="text-muted">
                Sign in to access your cattle farm admin account
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label fw-medium">
                  Email
                </label>
                <input
                  type="email"
                  className="form-control py-2"
                  id="email"
                  placeholder="bima@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-medium">
                  Password
                </label>
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control py-2"
                    id="password"
                    placeholder="••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}
                    ></i>
                  </span>
                </div>
              </div>

              <div className="d-flex justify-content-between mb-4">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="rememberMe">
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-decoration-none"
                  style={{ color: "#3299FF" }}
                >
                  Forgot Password
                </a>
              </div>

              <button
                type="submit"
                className="btn w-100 py-2 mb-3"
                style={{ backgroundColor: "#3299FF", color: "white" }}
              >
                Sign in
              </button>
            </form>

            <div className="text-center mt-3">
              <p>
                Don't have an account?{" "}
                <a href="/sign-up" style={{ color: "#3299FF" }}>
                  Sign up
                </a>
              </p>
            </div>

            <div className="text-center mt-3">
              <p className="text-muted">Or login with</p>
              <button className="btn btn-outline-secondary w-100">
                <img
                  src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg"
                  alt="Google"
                  height="20"
                  className="me-2"
                />
                Google
              </button>
            </div>
          </div>

          {/* Right side - Image */}
          <div className="col-md-6 d-flex align-items-center justify-content-center bg-light rounded-4">
            <div className="p-4 text-center">
              {/* Replace this comment with your image from your directory */}
              <img
                src={loginSecurityImage}
                alt="Login Security"
                className="img-fluid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
