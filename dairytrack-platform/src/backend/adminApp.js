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
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
  } from "recharts";
  const salesData = [
    { month: "Jan", sales: 20, production: 25 },
    { month: "Feb", sales: 30, production: 35 },
    { month: "Mar", sales: 40, production: 45 },
    { month: "Apr", sales: 50, production: 55 },
    { month: "May", sales: 60, production: 65 },
    { month: "Jun", sales: 70, production: 75 },
    { month: "Jul", sales: 60, production: 70 },
    { month: "Aug", sales: 75, production: 80 },
    { month: "Sep", sales: 85, production: 90 },
    { month: "Oct", sales: 25, production: 30 },
    { month: "Nov", sales: 10, production: 15 },
    { month: "Dec", sales: 5, production: 10 },
  ];

  const milkPriority = [
    { kode: "0001", quantity: "15 L", expired: "4 hours left", status: "red" },
    { kode: "0002", quantity: "15 L", expired: "4 hours left", status: "yellow" },
    { kode: "0003", quantity: "15 L", expired: "4 hours left", status: "yellow" },
    { kode: "0004", quantity: "15 L", expired: "4 hours left", status: "green" },
    { kode: "0005", quantity: "15 L", expired: "4 hours left", status: "green" },
  ];

  const healthDistribution = [
    { name: "Sehat", value: 85.7, color: "green" },
    { name: "Perlu Perhatian", value: 10.7, color: "yellow" },
    { name: "Darurat", value: 3.6, color: "red" },
  ];

  const sickCowsTrend = [
    { date: "2024-02-26", count: 5 },
    { date: "2024-02-27", count: 7 },
    { date: "2024-02-28", count: 10 },
    { date: "2024-02-29", count: 15 },
    { date: "2024-03-01", count: 12 },
    { date: "2024-03-02", count: 6 },
    { date: "2024-03-03", count: 4 },
  ];

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
    {/* Total Available Milk */}
    <div className="col-sm-6 col-md-6 col-lg-3 mt-3">
      <div className="card">
        <div className="content">
          <div className="row">
            <div className="col-sm-4">
              <div className="icon-big text-center">
                <i className="teal fas fa-prescription-bottle"></i>
              </div>
            </div>
            <div className="col-sm-8">
              <div className="detail">
                <p className="detail-subtitle">Available Milk</p>
                <span className="number">12,345 L</span>
              </div>
            </div>
          </div>
          <div className="footer">
            <hr />
            <div className="stats">
              <i className="fas fa-calendar"></i> Updated Today
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Total Sales */}
    <div className="col-sm-6 col-md-6 col-lg-3 mt-3">
      <div className="card">
        <div className="content">
          <div className="row">
            <div className="col-sm-4">
              <div className="icon-big text-center">
                <i className="teal fas fa-shopping-bag"></i>
              </div>
            </div>
            <div className="col-sm-8">
              <div className="detail">
                <p className="detail-subtitle">Total Sales</p>
                <span className="number">1,245</span>
              </div>
            </div>
          </div>
          <div className="footer">
            <hr />
            <div className="stats">
              <i className="fas fa-calendar-check"></i> This Month
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Total Expired Milk */}
    <div className="col-sm-6 col-md-6 col-lg-3 mt-3">
      <div className="card">
        <div className="content">
          <div className="row">
            <div className="col-sm-4">
              <div className="icon-big text-center">
                <i className="teal fas fa-trash-alt"></i>
              </div>
            </div>
            <div className="col-sm-8">
              <div className="detail">
                <p className="detail-subtitle">Expired Milk</p>
                <span className="number">340 L</span>
              </div>
            </div>
          </div>
          <div className="footer">
            <hr />
            <div className="stats">
              <i className="fas fa-exclamation-triangle"></i> Last Checked
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Total Revenue */}
    <div className="col-sm-6 col-md-6 col-lg-3 mt-3">
      <div className="card">
        <div className="content">
          <div className="row">
            <div className="col-sm-4">
              <div className="icon-big text-center">
                <i className="teal fas fa-dollar-sign"></i>
              </div>
            </div>
            <div className="col-sm-8">
              <div className="detail">
                <p className="detail-subtitle">Revenue</p>
                <span className="number">$87,500</span>
              </div>
            </div>
          </div>
          <div className="footer">
            <hr />
            <div className="stats">
              <i className="fas fa-wallet"></i> This Quarter
            </div>
          </div>
        </div>
      </div>
    </div>
                {/* ... other cards ... */}
              
        <div className="row mt-4">
        {/* Grafik Penjualan dan Produksi Susu */}
        <div className="col-lg-8 mb-4">
          <div className="card p-3">
            <h5>Milk Sales & Production</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="blue" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="production" stroke="red" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabel Prioritas Susu */}
        <div className="col-lg-4 mb-4">
          <div className="card p-3">
            <h5>Milk Priority</h5>
            <table className="table table-bordered">
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
                      <span
                        className={`badge ${
                          item.status === "red"
                            ? "bg-danger"
                            : item.status === "yellow"
                            ? "bg-warning"
                            : "bg-success"
                        }`}
                      >
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

      <div className="row">
        {/* Pie Chart Distribusi Kesehatan Sapi */}
        <div className="col-lg-6 mb-4">
          <div className="card p-3">
            <h5>Distribusi Kesehatan Sapi</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tren Jumlah Sapi Sakit */}
        <div className="col-lg-6 mb-4">
          <div className="card p-3">
            <h5>Tren Jumlah Sapi Sakit per Hari</h5>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sickCowsTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="red" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </div>
      </div>
            </div>
          </div>
        </div>
    );
  }

  export default AdminApp;
