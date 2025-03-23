import React from "react";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Footer from "./components/footer";
import Content from "./components/content";

// Import CSS
import "../assets/admin/css/bootstrap.min.css";
import "../assets/admin/css/icons.min.css";
import "../assets/admin/css/app.css";

const AdminApp = () => {
  return (
    <div id="layout-wrapper">
      <Header />
      <Sidebar />
      <div className="main-content">
        <Content />
        <Footer />
      </div>
    </div>
  );
};

export default AdminApp;
