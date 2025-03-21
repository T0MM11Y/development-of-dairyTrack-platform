import React from "react";
import styles from "../assets/admin/css/login.module.css";

const Login = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // Add form submission logic here
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
          <div className={styles.error__message}></div>
        </form>
      </div>
    </div>
  );
};

export default Login;
