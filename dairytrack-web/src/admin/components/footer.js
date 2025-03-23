import React from "react";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">{new Date().getFullYear()} © Upcube.</div>
          <div className="col-sm-6">
            <div className="text-sm-end d-none d-sm-block">
              Crafted with <i className="mdi mdi-heart text-danger"></i> by
              Themesdesign
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
