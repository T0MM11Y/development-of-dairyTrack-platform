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
    dashboard: "/admin/dashboard",
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

  // Menu data structure for consistency
  const menuItems = [
    {
      key: "dashboard",
      icon: "ri-dashboard-line",
      label: "Dashboard",
      path: "/admin/dashboard",
      submenus: [],
    },
    {
      key: "peternakan",
      icon: "ri-bar-chart-box-line",
      label: "Peternakan",
      path: "/admin/peternakan",
      submenus: [
        {
          path: "/admin/peternakan/farmer",
          icon: "ri-line-chart-line",
          label: "Data Peternak",
          show: userData?.role !== "farmer",
        },
        {
          path: "/admin/peternakan/sapi",
          icon: "ri-file-list-3-line",
          label: "Data Sapi",
          show: true,
        },
        {
          path: "/admin/peternakan/supervisor",
          icon: "ri-file-list-3-line",
          label: "Data Supervisor",
          show: userData?.role !== "farmer",
        },
        {
          path: "/admin/blog/all",
          icon: "ri-article-line",
          label: "Blog Articles",
          show: true,
        },
      ],
    },
    {
      key: "pakan",
      icon: "ri-seedling-line",
      label: "Pakan Sapi",
      path: "/admin/pakan",
      submenus: [
        {
          path: "/admin/pakan/jenis",
          icon: "ri-stack-line",
          label: "Jenis Pakan",
        },
        {
          path: "/admin/pakan",
          icon: "ri-leaf-line",
          label: "Pakan",
        },
        {
          path: "/admin/pakan-harian",
          icon: "ri-calendar-check-line",
          label: "Pakan Harian",
        },
        {
          path: "/admin/item-pakan-harian",
          icon: "ri-file-list-line",
          label: "Item Pakan",
        },
        {
          path: "/admin/pakan/stok",
          icon: "ri-box-3-line",
          label: "Stok Pakan",
        },
        {
          path: "/admin/nutrisi-pakan-harian",
          icon: "ri-restaurant-2-line",
          label: "Nutrisi",
        },
      ],
    },
    {
      key: "produktivitas",
      icon: "ri-bar-chart-box-line",
      label: "Produktivitas Susu",
      path: "/admin/susu",
      submenus: [
        {
          path: "/admin/milk-production/analysis",
          icon: "ri-line-chart-line",
          label: "Trend Produksi Susu",
        },
        {
          path: "/admin/susu/milk-production/phase",
          icon: "ri-file-list-3-line",
          label: "Analisis by Laktasi",
        },
        {
          path: "/admin/susu/produksi",
          icon: "ri-file-list-line",
          label: "Catatan Produksi Susu",
        },
      ],
    },
    {
      key: "kesehatan",
      icon: "ri-hospital-line",
      label: "Kesehatan Sapi",
      path: "/admin/kesehatan",
      submenus: [
        {
          path: "/admin/kesehatan/dashboard",
          icon: "ri-bar-chart-2-line",
          label: "Dashboard Kesehatan",
        },
        {
          path: "/admin/kesehatan/gejala",
          icon: "ri-health-book-line",
          label: "Gejala Penyakit Sapi",
        },
        {
          path: "/admin/kesehatan/riwayat",
          icon: "ri-history-line",
          label: "Riwayat Penyakit Sapi",
        },
        {
          path: "/admin/kesehatan/reproduksi",
          icon: "ri-parent-line",
          label: "Reproduksi Sapi",
        },
        {
          path: "/admin/kesehatan/pemeriksaan",
          icon: "ri-stethoscope-line",
          label: "Pemeriksaan Penyakit",
        },
      ],
    },
    {
      key: "keuangan",
      icon: "ri-money-dollar-circle-line",
      label: "Penjualan & Keuangan",
      path: "/admin/keuangan",
      submenus: [
        {
          path: "/admin/keuangan/product",
          icon: "ri-drinks-2-line",
          label: "Produk",
        },
        {
          path: "/admin/keuangan/type-product",
          icon: "ri-ink-bottle-line",
          label: "Tipe Produk",
        },
        {
          path: "/admin/keuangan/history-product",
          icon: "ri-history-line",
          label: "Riwayat Produk",
        },
        {
          path: "/admin/keuangan/sales",
          icon: "ri-store-line",
          label: "Penjualan",
        },
        {
          path: "/admin/keuangan/finance",
          icon: "ri-wallet-2-line",
          label: "Keuangan",
        },
      ],
    },
  ];

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
            {menuItems.map((menu) => (
              <motion.li
                key={menu.key}
                className={
                  isActive(menu.path) || isMenuOpen(menu.key) ? "mm-active" : ""
                }
                variants={menuItemVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {menu.submenus.length > 0 ? (
                  <>
                    <Link
                      to="#"
                      className="waves-effect d-flex justify-content-between align-items-center"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSubmenu(menu.key);
                      }}
                      style={{ padding: "10px 15px" }}
                    >
                      <div className="d-flex align-items-center">
                        <i className={menu.icon}></i>
                        {!isCollapsed && (
                          <span style={{ marginLeft: "10px" }}>
                            {menu.label}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && menu.submenus.length > 0 && (
                        <i
                          className={`ri-arrow-down-s-line ${
                            isMenuOpen(menu.key) ? "rotate-180" : ""
                          }`}
                        ></i>
                      )}
                    </Link>

                    <AnimatePresence>
                      {isMenuOpen(menu.key) && !isCollapsed && (
                        <motion.ul
                          className="sub-menu"
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={subMenuVariants}
                          transition={{ duration: 0.2 }}
                          style={{ paddingLeft: "30px" }}
                        >
                          {menu.submenus.map(
                            (submenu) =>
                              (submenu.show === undefined || submenu.show) && (
                                <motion.li
                                  key={submenu.path}
                                  variants={menuItemVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  <Link
                                    to={submenu.path}
                                    className={
                                      isActive(submenu.path) ? "active" : ""
                                    }
                                  >
                                    <i className={submenu.icon}></i>{" "}
                                    {submenu.label}
                                  </Link>
                                </motion.li>
                              )
                          )}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={menu.path}
                    className="waves-effect d-flex"
                    style={{ padding: "10px 15px" }}
                  >
                    <i className={menu.icon}></i>
                    {!isCollapsed && (
                      <span style={{ marginLeft: "10px" }}>{menu.label}</span>
                    )}
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
