import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "simplebar-react/dist/simplebar.min.css";
import avatar1 from "../../assets/admin/images/users/toon_9.png";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = ({ isCollapsed, isMobile, isOpen, onClose }) => {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Cek dari localStorage saat pertama kali render
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme === "true";
  });
  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    localStorage.setItem("darkMode", nextMode); // simpan statusnya
  };

  // Mapping of menu keys to their base paths and additional related paths
  const menuPaths = {
    dashboard: ["/admin/dashboard"],
    peternakan: ["/admin/peternakan", "/admin/blog/all", "/admin/gallery/all"],
    pakan: [
      "/admin/pakan",
      "/admin/pakan-harian",
      "/admin/item-pakan-harian",
      "/admin/nutrisi-pakan-harian",
    ],
    produktivitas: ["/admin/susu"],
    kesehatan: ["/admin/kesehatan"],
    keuangan: ["/admin/keuangan"],
  };

  useEffect(() => {
    console.log("Sidebar render - isMobile:", isMobile, "| isOpen:", isOpen);

    // Load user data from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    }

    // Automatically open menus based on current route
    const activeMenus = Object.keys(menuPaths).filter((key) =>
      menuPaths[key].some((path) => location.pathname.startsWith(path))
    );
    setOpenMenus(activeMenus);
  }, [location.pathname]);

  const toggleSubmenu = (key) => {
    setOpenMenus((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]
    );
  };

  const isMenuOpen = (key) => openMenus.includes(key);
  const isActive = (paths) =>
    paths.some((path) => location.pathname.startsWith(path));

  // Animation variants
  const subMenuVariants = {
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  const menuItemVariants = {
    hover: {
      backgroundColor: "rgba(0, 0, 0, 0.05)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
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
        {
          path: "/admin/gallery/all",
          icon: "ri-article-line",
          label: "Gallery",
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
          path: "/admin/pakan/dashboard",
          icon: "ri-dashboard-line",
          label: "Dashboard Pakan",
        },
        {
          path: "/admin/pakan/jenis",
          icon: "ri-stack-line",
          label: "Jenis Pakan",
        },
        {
          path: "/admin/nutrisi",
          icon: "ri-leaf-line",
          label: "Nutrisi",
        },
        {
          path: "/admin/pakan",
          icon: "ri-leaf-line",
          label: "Pakan",
        },
        {
          path: "/admin/pakan/stok",
          icon: "ri-box-3-line",
          label: "Stok Pakan",
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
          path: "/admin/susu/produksi",
          icon: "ri-file-list-line",
          label: "Catatan Produksi Susu",
        },
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
          path: "/admin/susu/kesegaransusu",
          icon: "ri-file-list-line",
          label: "Kesegaran Produksi Susu",
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
          path: "/admin/kesehatan/pemeriksaan",
          icon: "ri-stethoscope-line",
          label: "Pemeriksaan Penyakit",
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
    <div
      style={{
        position: "fixed",
        top: 60,
        bottom: 0,
        left: 0,
        width: 275,
        background: isDarkMode ? "#1e1e2f" : "#ffffff",
        zIndex: 1040,
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
        color: isDarkMode ? "#f0f0f0" : "#333333",
        transition: "all 0.3s ease",
      }}
    >
      <div data-simplebar style={{ height: "100vh", overflowY: "auto" }}>
        {isMobile && (
          <div className="d-flex justify-content-end p-3 border-bottom">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onClose}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        )}

        {/* Profile & Dark Mode Toggle */}
        {!isCollapsed && (
          <>
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: isCollapsed ? 0 : 1 }}
              transition={{ duration: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px",
                borderBottom: `1px solid ${isDarkMode ? "#444" : "#ddd"}`,
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
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {userData
                    ? `${userData.first_name} ${userData.last_name}`
                    : "Guest User"}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: isDarkMode ? "#aaa" : "#666",
                  }}
                >
                  {userData ? userData.email : "No Email"}
                </div>
              </div>
            </motion.div>

            <div
              style={{
                padding: "12px 20px",
                borderBottom: `1px solid ${isDarkMode ? "#444" : "#eee"}`,
              }}
            >
              <button
                onClick={toggleDarkMode}
                style={{
                  width: "100%",
                  background: isDarkMode ? "#444" : "#f5f5f5",
                  color: isDarkMode ? "#fff" : "#333",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {isDarkMode ? "🌙 Mode Gelap Aktif" : "☀️ Mode Terang Aktif"}
              </button>
            </div>
          </>
        )}

        {/* Sidebar Menu */}
        <div id="sidebar-menu">
          <ul className="list-unstyled sidebar-menu mt-3">
            {menuItems.map((menu) => (
              <motion.li
                key={menu.key}
                className={`menu-item ${isMenuOpen(menu.key) ? "open" : ""} ${
                  isActive(menuPaths[menu.key]) ? "active" : ""
                }`}
                variants={menuItemVariants}
                whileHover="hover"tst
                whileTap="tap"
              >
                {menu.submenus.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(menu.key)}
                      className="menu-btn d-flex justify-between align-items-center w-100 px-3 py-3 border-0 bg-transparent"
                      style={{
                        fontSize: "17px",
                        fontWeight: "500",
                        color: isDarkMode ? "#eee" : "#333",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        transition: "all 0.3s ease",
                        backgroundColor: isMenuOpen(menu.key)
                          ? isDarkMode
                            ? "#2a2a3a"
                            : "#f8f8f8"
                          : "transparent",
                      }}
                    >
                      <span
                        className="d-flex align-items-center"
                        style={{ gap: "10px" }}
                      >
                        <i
                          className={menu.icon}
                          style={{ fontSize: "20px" }}
                        ></i>
                        <span
                          style={{
                            opacity: isCollapsed ? 0 : 1,
                            transition: "opacity 0.2s ease",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {menu.label}
                        </span>
                      </span>
                      <i
                        className={`ri-arrow-down-s-line transition ${
                          isMenuOpen(menu.key) ? "rotate-180" : ""
                        }`}
                        style={{ fontSize: "18px" }}
                      ></i>
                    </button>

                    <AnimatePresence>
                      {isMenuOpen(menu.key) && (
                        <motion.ul
                          className="submenu list-unstyled ps-4"
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={subMenuVariants}
                        >
                          {menu.submenus
                            .filter(
                              (submenu) =>
                                submenu.show === undefined || submenu.show
                            )
                            .map((submenu) => (
                              <li
                                key={submenu.path}
                                className="submenu-item mb-1"
                              >
                                <Link
                                  to={submenu.path}
                                  className="submenu-link d-flex align-items-center px-3 py-2 rounded"
                                  style={{
                                    fontSize: "15px",
                                    fontWeight: "400",
                                    color:
                                      location.pathname === submenu.path
                                        ? isDarkMode
                                          ? "#00e676"
                                          : "#198754"
                                        : isDarkMode
                                        ? "#ccc"
                                        : "#555",
                                    backgroundColor:
                                      location.pathname === submenu.path
                                        ? isDarkMode
                                          ? "#2a4436"
                                          : "#e6fff2"
                                        : "transparent",
                                    transition: "all 0.2s ease",
                                    gap: "10px",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      isDarkMode ? "#2c2c3a" : "#f1f1f1")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.backgroundColor =
                                      location.pathname === submenu.path
                                        ? isDarkMode
                                          ? "#2a4436"
                                          : "#e6fff2"
                                        : "transparent")
                                  }
                                >
                                  <i
                                    className={submenu.icon}
                                    style={{
                                      fontSize: "18px",
                                      minWidth: "18px",
                                    }}
                                  ></i>
                                  <span>{submenu.label}</span>
                                </Link>
                              </li>
                            ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link
                    to={menu.path}
                    style={{
                      color: isDarkMode ? "#e6e6e6" : "#333",
                      backgroundColor:
                        location.pathname === menu.path
                          ? isDarkMode
                            ? "#2d2d3c"
                            : "#e6f0ff"
                          : "transparent",
                      fontSize: "17px",
                      fontWeight: "500",
                      padding: "10px 16px",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      transition: "all 0.25s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        location.pathname === menu.path
                          ? isDarkMode
                            ? "#2d2d3c"
                            : "#e6f0ff"
                          : isDarkMode
                          ? "#2a2a3a"
                          : "#f0f0f0")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        location.pathname === menu.path
                          ? isDarkMode
                            ? "#2d2d3c"
                            : "#e6f0ff"
                          : "transparent")
                    }
                  >
                    <i className={menu.icon} style={{ fontSize: "22px" }}></i>
                    <span>{menu.label}</span>
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
