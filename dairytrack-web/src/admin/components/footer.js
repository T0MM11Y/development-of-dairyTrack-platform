import React from "react";

const Footer = () => {
  return (
    <footer className="footer text-center text-sm-center w-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
            {new Date().getFullYear()} © Tsth Farm Management.
          </div>
          <div className="col-sm-6">
            <div className="text-sm-end d-none d-sm-block">
              Crafted with <i className="dripicons-conversation"></i>{" "}
              Tsth~C0derr
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
