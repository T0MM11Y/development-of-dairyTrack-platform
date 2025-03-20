import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Dashboard from "./Dashboard";

function AdminApp() {
  const [currentPage, setCurrentPage] = React.useState("dashboard");

  const renderContent = () => {
    switch (currentPage) {
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="admin-app">
      <Header />
      <div className="admin-content">
        <Sidebar setCurrentPage={setCurrentPage} />
        <main className="admin-main">{renderContent()}</main>
      </div>
      <Footer />
    </div>
  );
}

export default AdminApp;
