import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "simplebar-react/dist/simplebar.min.css";
import avatar1 from "../../assets/admin/images/users/toon_9.png";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState([]);
  const [userData, setUserData] = useState(null);

  // Mapping of menu keys to their base paths
  const menuPaths = {
    peternakan: "/admin/peternakan",
    pakan: "/admin/pakan",
    produktivitas: "/admin/susu",
    kesehatan: "/admin/kesehatan",
    keuangan: "/admin/keuangan",
  };

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    // Automatically open menus based on current route
    const activeMenus = Object.keys(menuPaths).filter((key) =>
      location.pathname.startsWith(menuPaths[key])
    );
    setOpenMenus(activeMenus);
  }, [location.pathname]);

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const isMenuOpen = (key) => openMenus.includes(key);
  const isActive = (path) => location.pathname.startsWith(path);

  // Animation variants
  const subMenuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const menuItemVariants = {
    hover: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
    },
  };

  return (
    <motion.div
      className="vertical-menu"
      initial={{ width: 275 }}
      animate={{ width: isCollapsed ? 80 : 275 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      style={{
        height: "100vh",
        position: "fixed",
        zIndex: 100,
        background: "#fff",
        boxShadow: "0 0 15px rgba(0,0,0,0.1)",
      }}
    >
      <div
        data-simplebar
        style={{
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Toggle Button */}
        <motion.div
          className="text-center py-2 cursor-pointer"
          onClick={toggleSidebar}
          style={{ borderBottom: "1px solid #eee" }}
          whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
          whileTap={{ scale: 0.95 }}
        >
          <i
            className={`ri-${isCollapsed ? "menu-unfold" : "menu-fold"}-line`}
          ></i>
        </motion.div>

        {/* User Profile */}
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            transition={{ duration: 0.2 }}
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
              <div style={{ fontWeight: "bold" }}>
                {userData
                  ? `${userData.first_name} ${userData.last_name}`
                  : "Guest User"}
              </div>
              <div style={{ fontSize: "12px", color: "#666" }}>
                {userData ? userData.email : "No Email"}
              </div>
            </div>
          </motion.div>
        )}

        <div id="sidebar-menu">
          <ul className="metismenu list-unstyled" id="side-menu">
            {/* Dashboard */}
            <motion.li
              className={isActive("/admin/dashboard") ? "mm-active" : ""}
              variants={menuItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="/admin/dashboard"
                className="waves-effect d-flex"
                style={{ padding: "10px 15px" }}
              >
                <i className="ri-dashboard-line"></i>
                {!isCollapsed && (
                  <span style={{ marginLeft: "10px" }}>Dashboard</span>
                )}
              </Link>
            </motion.li>

            {/* Peternakan */}
            <motion.li
              className={isMenuOpen("peternakan") ? "mm-active" : ""}
              variants={menuItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("peternakan");
                }}
                style={{ padding: "10px 15px" }}
              >
                <div className="d-flex align-items-center">
                  <i className="ri-bar-chart-box-line"></i>
                  {!isCollapsed && (
                    <span style={{ marginLeft: "10px" }}>Peternakan</span>
                  )}
                </div>
                {!isCollapsed && (
                  <i
                    className={`ri-arrow-down-s-line ${
                      isMenuOpen("peternakan") ? "rotate-180" : ""
                    }`}
                  ></i>
                )}
              </Link>

              <AnimatePresence>
                {isMenuOpen("peternakan") && !isCollapsed && (
                  <motion.ul
                    className="sub-menu"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={subMenuVariants}
                    transition={{ duration: 0.2 }}
                    style={{ paddingLeft: "30px" }}
                  >
                    {userData?.role !== "farmer" && (
                      <motion.li
                        variants={menuItemVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Link
                          to="/admin/peternakan/farmer"
                          className={
                            isActive("/admin/peternakan/farmer") ? "active" : ""
                          }
                        >
                          <i className="ri-line-chart-line"></i> Data Peternak
                        </Link>
                      </motion.li>
                    )}
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/peternakan/sapi"
                        className={
                          isActive("/admin/peternakan/sapi") ? "active" : ""
                        }
                      >
                        <i className="ri-file-list-3-line"></i> Data Sapi
                      </Link>
                    </motion.li>
                    {userData?.role !== "farmer" && (
                      <motion.li
                        variants={menuItemVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Link
                          to="/admin/peternakan/supervisor"
                          className={
                            isActive("/admin/peternakan/supervisor")
                              ? "active"
                              : ""
                          }
                        >
                          <i className="ri-file-list-3-line"></i> Data
                          Supervisor
                        </Link>
                      </motion.li>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>

            {/* Pakan Sapi */}
            <motion.li
              className={isMenuOpen("pakan") ? "mm-active" : ""}
              variants={menuItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("pakan");
                }}
                style={{ padding: "10px 15px" }}
              >
                <div className="d-flex align-items-center">
                  <i className="ri-restaurant-line"></i>
                  {!isCollapsed && (
                    <span style={{ marginLeft: "10px" }}>Pakan Sapi</span>
                  )}
                </div>
                {!isCollapsed && (
                  <i
                    className={`ri-arrow-down-s-line ${
                      isMenuOpen("pakan") ? "rotate-180" : ""
                    }`}
                  ></i>
                )}
              </Link>

              <AnimatePresence>
                {isMenuOpen("pakan") && !isCollapsed && (
                  <motion.ul
                    className="sub-menu"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={subMenuVariants}
                    transition={{ duration: 0.2 }}
                    style={{ paddingLeft: "30px" }}
                  >
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/pakan/jenis"
                        className={
                          isActive("/admin/pakan/jenis") ? "active" : ""
                        }
                      >
                        <i className="ri-stack-line"></i> Jenis Pakan
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/pakan"
                        className={isActive("/admin/pakan") ? "active" : ""}
                      >
                        <i className="ri-stack-line"></i> Pakan
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/pakan-harian"
                        className={
                          isActive("/admin/pakan-harian") ? "active" : ""
                        }
                      >
                        <i className="ri-calendar-line"></i> Pakan Harian
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/pakan/stok"
                        className={
                          isActive("/admin/pakan/stok") ? "active" : ""
                        }
                      >
                        <i className="ri-stack-line"></i> Stok Pakan
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/sesi-pakan"
                        className={
                          isActive("/admin/sesi-pakan") ? "active" : ""
                        }
                      >
                        <i className="ri-stack-line"></i> Sesi Pakan
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/detail-pakan-harian"
                        className={
                          isActive("/admin/detail-pakan-harian") ? "active" : ""
                        }
                      >
                        <i className="ri-stack-line"></i> Detail Pakan Harian
                      </Link>
                    </motion.li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>

            {/* Produktivitas Susu */}
            <motion.li
              className={isMenuOpen("produktivitas") ? "mm-active" : ""}
              variants={menuItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("produktivitas");
                }}
                style={{ padding: "10px 15px" }}
              >
                <div className="d-flex align-items-center">
                  <i className="ri-bar-chart-box-line"></i>
                  {!isCollapsed && (
                    <span style={{ marginLeft: "10px" }}>
                      Produktivitas Susu
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <i
                    className={`ri-arrow-down-s-line ${
                      isMenuOpen("produktivitas") ? "rotate-180" : ""
                    }`}
                  ></i>
                )}
              </Link>

              <AnimatePresence>
                {isMenuOpen("produktivitas") && !isCollapsed && (
                  <motion.ul
                    className="sub-menu"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={subMenuVariants}
                    transition={{ duration: 0.2 }}
                    style={{ paddingLeft: "30px" }}
                  >
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/susu/produksi"
                        className={
                          isActive("/admin/susu/produksi") ? "active" : ""
                        }
                      >
                        <i className="ri-database-2-line"></i> Data Produksi
                        Susu
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/susu/analisis"
                        className={
                          isActive("/admin/susu/analisis") ? "active" : ""
                        }
                      >
                        <i className="ri-line-chart-line"></i> Analisis Produksi
                      </Link>
                    </motion.li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>

            {/* Kesehatan Sapi */}
            <motion.li
              className={isMenuOpen("kesehatan") ? "mm-active" : ""}
              variants={menuItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("kesehatan");
                }}
                style={{ padding: "10px 15px" }}
              >
                <div className="d-flex align-items-center">
                  <i className="ri-hospital-line"></i>
                  {!isCollapsed && (
                    <span style={{ marginLeft: "10px" }}>Kesehatan Sapi</span>
                  )}
                </div>
                {!isCollapsed && (
                  <i
                    className={`ri-arrow-down-s-line ${
                      isMenuOpen("kesehatan") ? "rotate-180" : ""
                    }`}
                  ></i>
                )}
              </Link>

              <AnimatePresence>
                {isMenuOpen("kesehatan") && !isCollapsed && (
                  <motion.ul
                    className="sub-menu"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={subMenuVariants}
                    transition={{ duration: 0.2 }}
                    style={{ paddingLeft: "30px" }}
                  >
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/kesehatan/gejala"
                        className={
                          isActive("/admin/kesehatan/gejala") ? "active" : ""
                        }
                      >
                        <i className="ri-health-book-line"></i> Gejala Penyakit
                        Sapi
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/kesehatan/riwayat"
                        className={
                          isActive("/admin/kesehatan/riwayat") ? "active" : ""
                        }
                      >
                        <i className="ri-history-line"></i> Riwayat Penyakit
                        Sapi
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/kesehatan/reproduksi"
                        className={
                          isActive("/admin/kesehatan/reproduksi")
                            ? "active"
                            : ""
                        }
                      >
                        <i className="ri-parent-line"></i> Reproduksi Sapi
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/kesehatan/pemeriksaan"
                        className={
                          isActive("/admin/kesehatan/pemeriksaan")
                            ? "active"
                            : ""
                        }
                      >
                        <i className="ri-stethoscope-line"></i> Pemeriksaan
                        Penyakit
                      </Link>
                    </motion.li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>

            {/* Keuangan */}
            <motion.li
              className={isMenuOpen("keuangan") ? "mm-active" : ""}
              variants={menuItemVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Link
                to="#"
                className="waves-effect d-flex justify-content-between align-items-center"
                onClick={(e) => {
                  e.preventDefault();
                  toggleSubmenu("keuangan");
                }}
                style={{ padding: "10px 15px" }}
              >
                <div className="d-flex align-items-center">
                  <i className="ri-money-dollar-circle-line"></i>
                  {!isCollapsed && (
                    <span style={{ marginLeft: "10px" }}>
                      Penjualan & Keuangan
                    </span>
                  )}
                </div>
                {!isCollapsed && (
                  <i
                    className={`ri-arrow-down-s-line ${
                      isMenuOpen("keuangan") ? "rotate-180" : ""
                    }`}
                  ></i>
                )}
              </Link>

              <AnimatePresence>
                {isMenuOpen("keuangan") && !isCollapsed && (
                  <motion.ul
                    className="sub-menu"
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={subMenuVariants}
                    transition={{ duration: 0.2 }}
                    style={{ paddingLeft: "30px" }}
                  >
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/keuangan/product"
                        className={
                          isActive("/admin/keuangan/product") ? "active" : ""
                        }
                      >
                        <i className="ri-ink-bottle-line"></i> Product
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/keuangan/product-history"
                        className={
                          isActive("/admin/keuangan/product-history") ? "active" : ""
                        }
                      >
                        <i className="ri-history-line"></i> History Product
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/keuangan/sales"
                        className={
                          isActive("/admin/keuangan/sales") ? "active" : ""
                        }
                      >
                        <i className="ri-store-line"></i> Penjualan
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={menuItemVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      <Link
                        to="/admin/keuangan/finance"
                        className={
                          isActive("/admin/keuangan/finance") ? "active" : ""
                        }
                      >
                        <i className="ri-wallet-2-line"></i> Keuangan
                      </Link>
                    </motion.li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
