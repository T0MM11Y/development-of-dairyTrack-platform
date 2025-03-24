import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import profileImage from "../../assets/admin/images/users/avatar-1.jpg";

const Sidebar = () => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const isMenuOpen = (key) => openMenus.includes(key);
  const isActive = (path) => location.pathname.startsWith(path);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const content = document.querySelector(".main-content");
    if (content) {
      content.style.marginLeft = isCollapsed ? "90px" : "250px";
      content.style.transition = "margin-left 0.3s ease-in-out";
    }
  }, [isCollapsed]);

  const sidebarStyle = {
    width: isCollapsed ? "70px" : "250px",
    transition: "width 0.3s ease-in-out",
    
  };

  return (
    <div class="vertical-menu">
                <div data-simplebar class="h-100">
                <div className="user-profile text-center mt-3">
          <img
            src={profileImage}
            alt="User Avatar"
            className="avatar-md rounded-circle"
          />
          <div className="mt-3">
            <h4 className="font-size-16 mb-1">JHON</h4>
            <span className="text-muted">
              <i className="ri-record-circle-line align-middle font-size-14 text-success"></i>
              Online
            </span>
          </div>
        </div>

        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            <li className="menu-title">
              <i className="ri-menu-line me-2"></i>DairyTrack Menu
            </li>

            <li className={isActive("/admin/dashboard") ? "mm-active" : ""}>
      <Link to="/admin/dashboard" className="waves-effect">
        <i className="ri-dashboard-line"></i> <span>Dashboard</span>
      </Link>
    </li>
            {/* Pakan Sapi */}
            <li className={isMenuOpen("pakan") ? "mm-active" : ""}>
              <a
                href="#!"
                onClick={() => toggleSubmenu("pakan")}
                className="has-arrow waves-effect"
              >
                <i className="ri-restaurant-line"></i>
                <span>Pakan Sapi</span>
              </a>
              <ul className="sub-menu" style={{ display: isMenuOpen("pakan") ? "block" : "none" }}>
              <li><Link to="/admin/pakan/harian">Pakan Harian</Link></li>
              <li><Link to="/admin/pakan/stok">Stok Pakan</Link></li>
              </ul>
            </li>

            {/* Produktivitas Susu */}
            <li className={isMenuOpen("produktivitas") ? "mm-active" : ""}>
              <a
                href="#!"
                onClick={() => toggleSubmenu("produktivitas")}
                className="has-arrow waves-effect"
              >
                <i className="ri-bar-chart-box-line"></i>
                <span>Produktivitas Susu</span>
              </a>
              <ul className="sub-menu" style={{ display: isMenuOpen("produktivitas") ? "block" : "none" }}>
              <li><Link to="/admin/susu/produksi">Data Produksi Susu</Link></li>
              <li><Link to="/admin/susu/analisis">Analisis Produksi</Link></li>
              </ul>
            </li>

            {/* Kesehatan Sapi */}
            <li className={isMenuOpen("kesehatan") ? "mm-active" : ""}>
              <a
                href="#!"
                onClick={() => toggleSubmenu("kesehatan")}
                className="has-arrow waves-effect"
              >
                <i className="ri-hospital-line"></i>
                <span>Kesehatan Sapi</span>
              </a>
              <ul className="sub-menu" style={{ display: isMenuOpen("kesehatan") ? "block" : "none" }}>
              <li><Link to="/admin/kesehatan/data-sapi">Data Sapi</Link></li>
        <li><Link to="/admin/kesehatan/gejala">Gejala Penyakit Sapi</Link></li>
        <li><Link to="/admin/kesehatan/riwayat">Riwayat Penyakit Sapi</Link></li>
        <li><Link to="/admin/kesehatan/reproduksi">Reproduksi Sapi</Link></li>
        <li><Link to="/admin/kesehatan/pemeriksaan">Pemeriksaan Penyakit</Link></li>
              </ul>
            </li>

            {/* Keuangan */}
            <li className={isMenuOpen("keuangan") ? "mm-active" : ""}>
              <a
                href="#!"
                onClick={() => toggleSubmenu("keuangan")}
                className="has-arrow waves-effect"
              >
                <i className="ri-money-dollar-circle-line"></i>
                <span>Keuangan</span>
              </a>
              <ul className="sub-menu" style={{ display: isMenuOpen("keuangan") ? "block" : "none" }}>
                <li><Link to="/admin/keuangan/pemasukan">Pemasukan</Link></li>
        <li><Link to="/admin/keuangan/pengeluaran">Pengeluaran</Link></li>
        <li><Link to="/admin/keuangan/laporan">Laporan Keuangan</Link></li>
              </ul>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
