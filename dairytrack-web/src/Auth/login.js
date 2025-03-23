import React from "react";
import "../assets/admin/css/bootstrap.min.css";
import "../assets/client/css/style.css";

import iconLogin from "../assets/admin/images/logo-dark.png";

const Login = () => {
  const handleLogin = (e) => {
    e.preventDefault();
    window.location.href = "/admin";
  };

  return (
    <div className="auth-body-bg d-flex justify-content-center align-items-center vh-100">
      <div className="bg-overlay"></div>
      <div className="wrapper-page">
        <div className="container-fluid p-0">
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "100%",
              margin: "20px",
              padding: "30px",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="card-body">
              <div className="text-center mt-4">
                <div className="mb-3">
                  <a href="index.html" className="auth-logo">
                    <img
                      src={iconLogin}
                      height="30"
                      className="logo-dark mx-auto"
                      alt=""
                    />
                  </a>
                </div>
              </div>

              <h4 className="text-muted text-center font-size-18">
                <b>Sign In</b>
              </h4>

              <div className="p-2">
                <form className="form-horizontal mt-3" onSubmit={handleLogin}>
                  <div className="form-group mb-3 row">
                    <div className="col-12">
                      <input
                        className="form-control"
                        type="text"
                        required
                        placeholder="Email"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="form-group mb-3 row">
                    <div className="col-12">
                      <input
                        className="form-control"
                        type="password"
                        required
                        placeholder="Password"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div className="form-group mb-3 row">
                    <div className="col-12">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="customCheck1"
                        />
                        <label
                          className="form-label ms-1"
                          htmlFor="customCheck1"
                        >
                          Remember me
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-group mb-3 text-center row mt-3 pt-1">
                    <div className="col-12">
                      <button
                        className="btn btn-info w-100 waves-effect waves-light"
                        type="submit"
                      >
                        Log In
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              {/* end */}
            </div>
            {/* end cardbody */}
          </div>
          {/* end card */}
        </div>
        {/* end container */}
      </div>
    </div>
  );
};

export default Login;
