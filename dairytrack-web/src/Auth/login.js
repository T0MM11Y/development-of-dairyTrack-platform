import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to admin if already logged in
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/admin", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingText((prev) =>
          prev === "Processing..." ? "Processing" : prev + "."
        );
      }, 500);
    } else {
      setLoadingText("Processing");
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await login({ email, password });

      if (response.status === 200) {
        navigate("/admin", { replace: true });
        window.history.pushState(null, null, window.location.href);
        window.onpopstate = () => {
          navigate("/admin", { replace: true });
        };
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
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
