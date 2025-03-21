import React from "react";
import { useNavigate } from "react-router-dom";

import styles from "../assets/admin/css/login.module.css";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Arahkan ke admin langsung
    navigate("/admin");
  };

  return (
    <div className={styles.login__body}>
      <div className={styles.login__container}>
        <p className={styles.login__label}>🔒 Login</p>
        <form onSubmit={handleSubmit}>
          <div className={styles.input__container}>
            <input
              type="text"
              name="Email"
              className={styles.input__field}
              placeholder="Email"
            />
          </div>
          <div className={styles.input__container}>
            <input
              type="password"
              name="password"
              className={styles.input__field}
              placeholder="Password"
            />
          </div>
          <button type="submit" className={styles["button--submit"]}>
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
