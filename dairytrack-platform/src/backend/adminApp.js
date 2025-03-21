import "../assets/admin/vendor/fontawesome/css/fontawesome.min.css";
import "../assets/admin/vendor/fontawesome/css/solid.min.css";
import "../assets/admin/vendor/fontawesome/css/brands.min.css";
import "../assets/admin/vendor/bootstrap/css/bootstrap.min.css";
import "../assets/admin/css/master.css";
import $ from "jquery";
import { useEffect } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min"; // Ensure Bootstrap JS is imported

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";

function AdminApp() {
  useEffect(() => {
    const handleSidebarToggle = () => {
      $("#sidebar").toggleClass("active");
    };

    $("#sidebarCollapse").on("click", handleSidebarToggle);

    // Cleanup function to remove the event listener
    return () => {
      $("#sidebarCollapse").off("click", handleSidebarToggle);
    };
  }, []);

  return (
    <div className="wrapper">
      <Sidebar />
      <div id="body" className="active">
        <Header />
        <div className="content">
          <div className="container">
            <div className="row">
              <div className="col-md-12 page-header">
                <div className="page-pretitle">Overview</div>
                <h2 className="page-title">Dashboard</h2>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 col-md-6 col-lg-3 mt-3">
                <div className="card">
                  <div className="content">
                    <div className="row">
                      <div className="col-sm-4">
                        <div className="icon-big text-center">
                          <i className="teal fas fa-shopping-cart"></i>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <div className="detail">
                          <p className="detail-subtitle">New Orders</p>
                          <span className="number">6,267</span>
                        </div>
                      </div>
                    </div>
                    <Footer />
                  </div>
                </div>
              </div>
              {/* ... other cards ... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminApp;
