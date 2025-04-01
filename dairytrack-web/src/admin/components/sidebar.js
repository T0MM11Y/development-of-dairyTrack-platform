import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "simplebar-react/dist/simplebar.min.css";
import avatar1 from "../../assets/admin/images/users/toon_9.png"; // Import gambar avatar

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState([]);

  // Data statis untuk nama dan email
  const userData = {
    name: "Gustavo Brazillian",
    email: "gus.tavo@example.com",
  };

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const isMenuOpen = (key) => openMenus.includes(key);
  const isActive = (path) => location.pathname.startsWith(path);

  useEffect(() => {
    const content = document.querySelector(".main-content");
    if (content) {
      content.style.marginLeft = "225px"; // Sesuaikan dengan lebar sidebar
      content.style.width = "calc(100% - 225px)"; // Sesuaikan dengan lebar sidebar
    }

    const sidebar = document.querySelector(".vertical-menu");
    if (sidebar) {
      sidebar.style.width = "225px"; // Lebar sidebar yang baru
    }
  }, []);

  return (
    <div
      className="vertical-menu"
      style={{
        width: "200px", // Lebar sidebar yang baru
        transition: "width 0.3s ease-in-out",
      }}
    >
      <div
        data-simplebar
        style={{
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Avatar dan Email */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px",
            borderBottom: "1px solid #ddd",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              overflow: "hidden",
              marginRight: "10px",
            }}
          >
            <img
              src={avatar1}
              alt="Avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <div>
            <div style={{ fontWeight: "bold" }}>{userData.name}</div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {userData.email}
            </div>
          </div>
        </div>

        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className={isActive("/admin/dashboard") ? "mm-active" : ""}>
              <Link to="/admin/dashboard" className="waves-effect d-flex">
                <i className="ri-dashboard-line"></i>
                <span>Dashboard</span>
              </Link>
            </li>

            {/* Peternakan */}
            <li className={isMenuOpen("peternakan") ? "mm-active" : ""}>
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("peternakan");
                }}
                aria-expanded={isMenuOpen("peternakan")}
              >
                <div>
                  <i className="ri-bar-chart-box-line"></i>
                  <span>Peternakan</span>
                </div>
                <i className="ri-arrow-down-s-line"></i>
              </Link>
              {isMenuOpen("peternakan") && (
                <ul
                  className="sub-menu mm-show"
                  style={{ paddingLeft: "20px" }}
                >
                  <li>
                    <Link
                      to="/admin/peternakan/farmer"
                      className={
                        isActive("/admin/peternakan/farmer") ? "active" : ""
                      }
                    >
                      <i className="ri-line-chart-line"></i> Data Peternak
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/peternakan/sapi"
                      className={
                        isActive("/admin/peternakan/sapi") ? "active" : ""
                      }
                    >
                      <i className="ri-file-list-3-line"></i> Data Sapi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/peternakan/supervisor"
                      className={
                        isActive("/admin/peternakan/supervisor") ? "active" : ""
                      }
                    >
                      <i className="ri-file-list-3-line"></i> Data Supervisor
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Pakan Sapi */}
            <li className={isMenuOpen("pakan") ? "mm-active" : ""}>
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("pakan");
                }}
                aria-expanded={isMenuOpen("pakan")}
              >
                <div>
                  <i className="ri-restaurant-line"></i>
                  <span>Pakan Sapi</span>
                </div>
                <i className="ri-arrow-down-s-line"></i>
              </Link>
              {isMenuOpen("pakan") && (
                <ul
                  className="sub-menu mm-show"
                  style={{ paddingLeft: "20px" }}
                >
                  <li>
                    <Link
                      to="/admin/pakan/jenis"
                      className={isActive("/admin/pakan/jenis") ? "active" : ""}
                    >
                      <i className="ri-stack-line"></i> Jenis Pakan
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/pakan"
                      className={isActive("/admin/pakan") ? "active" : ""}
                    >
                      <i className="ri-stack-line"></i> Pakan
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/pakan-harian"
                      className={
                        isActive("/admin/pakan-harian") ? "active" : ""
                      }
                    >
                      <i className="ri-calendar-line"></i> Pakan Harian
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/pakan/stok"
                      className={isActive("/admin/pakan/stok") ? "active" : ""}
                    >
                      <i className="ri-stack-line"></i> Stok Pakan
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/detail-pakan-harian"
                      className={isActive("/admin/detail-pakan-harian") ? "active" : ""}
                    >
                      <i className="ri-stack-line"></i> Detail Pakan Harian
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Produktivitas Susu */}
            <li className={isMenuOpen("produktivitas") ? "mm-active" : ""}>
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("produktivitas");
                }}
                aria-expanded={isMenuOpen("produktivitas")}
              >
                <div>
                  <i className="ri-bar-chart-box-line"></i>
                  <span>Produktivitas Susu</span>
                </div>
                <i className="ri-arrow-down-s-line"></i>
              </Link>
              {isMenuOpen("produktivitas") && (
                <ul
                  className="sub-menu mm-show"
                  style={{ paddingLeft: "20px" }}
                >
                  <li>
                    <Link
                      to="/admin/susu/produksi"
                      className={
                        isActive("/admin/susu/produksi") ? "active" : ""
                      }
                    >
                      <i className="ri-database-2-line"></i> Data Produksi Susu
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/susu/analisis"
                      className={
                        isActive("/admin/susu/analisis") ? "active" : ""
                      }
                    >
                      <i className="ri-line-chart-line"></i> Analisis Produksi
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Kesehatan Sapi */}
            <li className={isMenuOpen("kesehatan") ? "mm-active" : ""}>
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("kesehatan");
                }}
                aria-expanded={isMenuOpen("kesehatan")}
              >
                <div>
                  <i className="ri-hospital-line"></i>
                  <span>Kesehatan Sapi</span>
                </div>
                <i className="ri-arrow-down-s-line"></i>
              </Link>

              {isMenuOpen("kesehatan") && (
                <ul
                  className="sub-menu mm-show"
                  style={{ paddingLeft: "20px" }}
                >
                  <li>
                    <Link
                      to="/admin/kesehatan/gejala"
                      className={
                        isActive("/admin/kesehatan/gejala") ? "active" : ""
                      }
                    >
                      <i className="ri-health-book-line"></i> Gejala Penyakit
                      Sapi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/kesehatan/riwayat"
                      className={
                        isActive("/admin/kesehatan/riwayat") ? "active" : ""
                      }
                    >
                      <i className="ri-history-line"></i> Riwayat Penyakit Sapi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/kesehatan/reproduksi"
                      className={
                        isActive("/admin/kesehatan/reproduksi") ? "active" : ""
                      }
                    >
                      <i className="ri-parent-line"></i> Reproduksi Sapi
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/kesehatan/pemeriksaan"
                      className={
                        isActive("/admin/kesehatan/pemeriksaan") ? "active" : ""
                      }
                    >
                      <i className="ri-stethoscope-line"></i> Pemeriksaan
                      Penyakit
                    </Link>
                  </li>
                </ul>
              )}
            </li>

            {/* Keuangan */}
            <li className={isMenuOpen("keuangan") ? "mm-active" : ""}>
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("keuangan");
                }}
                aria-expanded={isMenuOpen("keuangan")}
              >
                <div>
                  <i className="ri-money-dollar-circle-line"></i>
                  <span>Keuangan</span>
                </div>
                <i className="ri-arrow-down-s-line"></i>
              </Link>
              {isMenuOpen("keuangan") && (
                <ul
                  className="sub-menu mm-show"
                  style={{ paddingLeft: "20px" }}
                >
                  <li>
                    <Link
                      to="/admin/keuangan/pemasukan"
                      className={
                        isActive("/admin/keuangan/pemasukan") ? "active" : ""
                      }
                    >
                      <i className="ri-arrow-up-circle-line"></i> Pemasukan
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/keuangan/pengeluaran"
                      className={
                        isActive("/admin/keuangan/pengeluaran") ? "active" : ""
                      }
                    >
                      <i className="ri-arrow-down-circle-line"></i> Pengeluaran
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/keuangan/laporan"
                      className={
                        isActive("/admin/keuangan/laporan") ? "active" : ""
                      }
                    >
                      <i className="ri-file-chart-line"></i> Laporan Keuangan
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
