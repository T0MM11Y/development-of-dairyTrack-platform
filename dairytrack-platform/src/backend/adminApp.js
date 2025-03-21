import "../assets/admin/vendor/fontawesome/css/fontawesome.min.css";
import "../assets/admin/vendor/fontawesome/css/solid.min.css";
import "../assets/admin/vendor/fontawesome/css/brands.min.css";
import "../assets/admin/vendor/bootstrap/css/bootstrap.min.css";
import "../assets/admin/css/master.css";
import $ from "jquery";
import { useEffect } from "react";
import "bootstrap/dist/js/bootstrap.bundle.min"; // Bootstrap JS

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

function AdminApp() {
  useEffect(() => {
    const handleSidebarToggle = () => {
      $("#sidebar").toggleClass("active");
    };

    $("#sidebarCollapse").on("click", handleSidebarToggle);

    return () => {
      $("#sidebarCollapse").off("click", handleSidebarToggle);
    };
  }, []);

  const chartData = {
    labels: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ],
    datasets: [
      {
        label: "Sales",
        data: [10, 20, 30, 50, 65, 55, 45, 75, 70, 25, 15, 10],
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        fill: false,
      },
      {
        label: "Production",
        data: [15, 25, 35, 60, 75, 65, 50, 80, 75, 30, 20, 15],
        borderColor: "red",
        backgroundColor: "rgba(255, 0, 0, 0.2)",
        fill: false,
      },
    ],
  };

  const milkPriority = [
    { kode: "0001", quantity: "15L", expired: "4 hours left", color: "danger" },
    { kode: "0001", quantity: "15L", expired: "4 hours left", color: "danger" },
    { kode: "0001", quantity: "15L", expired: "4 hours left", color: "danger" },
    { kode: "0001", quantity: "15L", expired: "4 hours left", color: "warning" },
    { kode: "0001", quantity: "15L", expired: "4 hours left", color: "success" },
    { kode: "0001", quantity: "15L", expired: "4 hours left", color: "success" },
  ];

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

            {/* Statistik Susu */}
            <div className="row">
              {[
                { title: "Total Available Milk", value: "50 Liter" },
                { title: "Total Sales", value: "30 Liter" },
                { title: "Total Expired Milk", value: "45 Liter" },
                { title: "Total Revenue", value: "Rp 5.000.000" },
              ].map((item, index) => (
                <div key={index} className="col-sm-6 col-md-6 col-lg-3 mt-3">
                  <div className="card text-center p-3">
                    <p className="detail-subtitle">{item.title}</p>
                    <h4 className="number text-primary">{item.value}</h4>
                  </div>
                </div>
              ))}
            </div>

            {/* Grafik Penjualan dan Produksi Susu */}
            <div className="row mt-4">
              <div className="col-lg-8">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Milk Sales & Production</h5>
                    <Line data={chartData} />
                  </div>
                </div>
              </div>

              {/* Prioritas Susu */}
              <div className="col-lg-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Milk Priority</h5>
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Kode</th>
                          <th>Quantity</th>
                          <th>Expired Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {milkPriority.map((item, index) => (
                          <tr key={index}>
                            <td>{item.kode}</td>
                            <td>{item.quantity}</td>
                            <td>
                              <span className={`badge bg-${item.color}`}>
                                {item.expired}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Daftar Pesanan */}
            <div className="row mt-4">
              <div className="col-12">
                <h5 className="mt-3">List of Orders</h5>
                {/* Konten daftar pesanan bisa ditambahkan di sini */}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default AdminApp;
