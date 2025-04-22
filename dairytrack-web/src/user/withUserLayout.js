import React from "react";
import "../assets/client/css/bootstrap.min.css";
import "../assets/client/css/default.css";
import "../assets/client/css/style.css";
import "../assets/client/css/responsive.css";
import "../assets/client/css/fontawesome-all.min.css";
import "../assets/client/css/magnific-popup.css";
import "../assets/client/css/slick.css";
import "../assets/client/css/animate.min.css";

import Header from "./components/header";
import Footer from "./components/footer";

const withUserLayout = (Component) => {
  return (
    <div
      className="user-app"
      style={{ width: "100%", margin: "0", padding: "0" }}
    >
      <Header />
      <div
        className="user-body"
        style={{ width: "100%", margin: "0", padding: "0" }}
      >
        <Component />
      </div>
      <div
        className="user-footer"
        style={{
          width: "100%",
          margin: "100px 0 0", // Tambahkan margin atas untuk jarak
          padding: "0",
        }}
      >
        <Footer />
      </div>
    </div>
  );
};

export default withUserLayout;
