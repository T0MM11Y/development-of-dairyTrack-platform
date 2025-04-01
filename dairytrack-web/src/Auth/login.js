import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "../assets/client/css/style.css";
import iconLogin from "../assets/client/img/logo/logo.png";
import { login } from "../api/auth/login";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing");
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    if (error) {
      console.log("Error state updated:", error); // Debug error state
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      console.log("Loading started"); // Debug loading state
      interval = setInterval(() => {
        setLoadingText((prev) =>
          prev === "Processing..." ? "Processing" : prev + "."
        );
      }, 500);
    } else {
      console.log("Loading stopped"); // Debug loading state
      setLoadingText("Processing");
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Login form submitted with:", { email, password }); // Debug form data
    setIsLoading(true);

    try {
      const response = await login({ email, password });
      console.log("Login response:", response); // Debug API response

      if (response.status === 200) {
        console.log("Login successful, redirecting to /admin"); // Debug successful login
        navigate("/admin"); // Redirect to /admin
      } else {
        console.log("Login failed with message:", response.message); // Debug failed login
        setError(response.message);
      }
    } catch (error) {
      console.error("Login error:", error); // Debug unexpected error
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
      console.log("Login process finished"); // Debug process completion
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#f4f4f4" }}
    >
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-text">{loadingText}</div>
        </div>
      )}

      <div className="w-100 px-4" style={{ maxWidth: "350px" }}>
        <div className="text-center mb-4">
          <img src={iconLogin} height="120" alt="Logo" />
        </div>

        {error && (
          <div className="alert alert-danger text-center fs-6">{error}</div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-bold">
              Email
            </label>
            <input
              type="email"
              className="form-control form-control-lg"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={{ height: "35px", borderRadius: "10px" }}
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-bold">
              Password
            </label>
            <div className="input-group input-group-lg">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{ height: "35px", borderRadius: "10px", width: "80%" }}
              />
              <span
                className="input-group-text border-0 bg-transparent"
                style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
                onClick={() => !isLoading && setShowPassword(!showPassword)}
              >
                <i
                  className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}
                  style={{ color: "#666" }}
                ></i>
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-info w-100 py-2"
            disabled={isLoading}
            style={{ borderRadius: "10px", fontSize: "1.2rem" }}
          >
            {isLoading ? "Loading..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
