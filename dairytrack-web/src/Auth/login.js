import React, { useState } from "react";
import "../assets/client/css/style.css";

import iconLogin from "../assets/client/img/logo/logo_white.png";
import loginSecurityImage from "../assets/admin/images/login.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    window.location.href = "/admin";
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div
              className="card shadow-lg border-0"
              style={{ borderRadius: "15px" }}
            >
              <div className="row g-0">
                {/* Left side - Login form */}
                <div
                  className="col-md-6 d-flex flex-column justify-content-center p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "15px 0 0 15px",
                  }}
                >
                  <div className="text-center mb-2">
                    <img src={iconLogin} height="40" alt="Logo" />
                  </div>

                  <div className="mb-1 text-center">
                    <p className="text-muted small">
                      Sign in to access your cattle farm admin account
                    </p>
                  </div>

                  <form onSubmit={handleLogin}>
                    <div className="mb-3">
                      <label
                        htmlFor="email"
                        className="form-label fw-medium small"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #ccc",
                          padding: "5px",
                          transition: "0.3s ease-in-out",
                        }}
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="password"
                        className="form-label fw-medium small"
                      >
                        Password
                      </label>
                      <div className="input-group input-group-sm">
                        <input
                          type={showPassword ? "text" : "password"}
                          className="form-control"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #ccc",
                            padding: "5px",
                            transition: "0.3s ease-in-out",
                          }}
                        />
                        <span
                          className="input-group-text"
                          style={{
                            cursor: "pointer",
                            background: "none",
                            border: "none",
                          }}
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i
                            className={
                              showPassword ? "fa fa-eye-slash" : "fa fa-eye"
                            }
                            style={{ fontSize: "1rem", color: "#666" }}
                          ></i>
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn w-100 py-2 mb-2"
                      style={{
                        background: "#34C8D3FF",
                        color: "white",
                        borderRadius: "8px",
                        fontWeight: "bold",
                        transition: "0.3s",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.background = "#34C8D3FF")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.background = "#34C8D3FF")
                      }
                    >
                      Sign in
                    </button>
                  </form>
                </div>

                {/* Right side - Image */}
                <div className="col-md-5 d-none d-md-block">
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <img
                      src={loginSecurityImage}
                      alt="Login Security"
                      className="img-fluid"
                      style={{
                        borderRadius: "0 15px 15px 0",
                        maxHeight: "80%", // Reduce height to 80% of the container
                        maxWidth: "80%", // Reduce width to 80% of the container
                        width: "auto", // Maintain aspect ratio
                        objectFit: "cover", // Scale the image to cover the container
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
