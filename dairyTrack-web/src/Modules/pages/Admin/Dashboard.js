import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Tabs,
  Tab,
} from "react-bootstrap";
import { getUsersWithCows } from "../../controllers/cattleDistributionController"; // Import
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  Legend,
  LabelList,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { Droplet, Wheat, PawPrint, LucideUsers } from "lucide-react";
import Swal from "sweetalert2";
// Import controllers
import { listCows } from "../../controllers/cowsController";
import { getAllUsers } from "../../controllers/usersController";
import { getMilkingSessions } from "../../controllers/milkProductionController";
import { getFeedUsageByDate } from "../../controllers/feedItemController";
import { listCowsByUser } from "../../controllers/cattleDistributionController";
import financeController from "../../controllers/financeController.js";
import { getHealthChecks } from "../../controllers/healthCheckController";
import { getOrders } from "../../controllers/orderController";

import Modal from "react-bootstrap/Modal"; // Tambahkan import Modal jika belum ada

// CSS styles defined in a separate object for consistency
const styles = {
  // Typography
  fontFamily: "'Roboto', sans-serif",
  heading: {
    fontWeight: "500",
    color: "#3D90D7",
    fontSize: "21px",
    fontFamily: "Roboto, Monospace",
    letterSpacing: "0.5px",
  },
  subheading: {
    fontSize: "14px",
    color: "#6c757d",
    fontFamily: "Roboto, sans-serif",
  },
  value: {
    fontWeight: "700",
    fontSize: "1.25rem",
    color: "#2c3e50",
  },
  // Cards
  card: {
    borderRadius: "10px",
    border: "none",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)",
  },
  cardHeader: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#2c3e50",
    borderBottom: "none",
  },
  // Icons
  iconContainer: {
    borderRadius: "50%",
    width: "45px",
    height: "45px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "12px",
  },
  // Badges
  badge: {
    fontSize: "0.75rem",
    fontWeight: "500",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  // Charts
  chartContainer: {
    height: "300px",
    marginTop: "10px",
  },
  // Table
  table: {
    fontSize: "0.85rem",
    borderCollapse: "separate",
    borderSpacing: "0 4px",
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    color: "#495057",
    fontWeight: "600",
    border: "none",
    position: "sticky",
    top: 0,
    zIndex: 1,
    fontSize: "13px",
    fontFamily: "Roboto, sans-serif",
    letterSpacing: "0.9px",
    textTransform: "capitalize",
  },
  // Tab styles
  tabContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    padding: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  // Stat cards
  statCard: {
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)",
    borderRadius: "19px",
    border: "0",
  },
  statValue: {
    fontSize: "14px",
    fontWeight: "800",
    fontFamily: "Roboto, Monospace",
    fontStyle: "italic",
  },
  statLabel: {
    fontSize: "15px",
  },
  statDescription: {
    fontSize: "12px",
    fontStyle: "italic",
    lineHeight: "1.4",
  },
};

// Animation variants
const animations = {
  card: {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  },
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  },
};

// Validate financeController
if (
  !financeController ||
  typeof financeController.getIncomes !== "function" ||
  typeof financeController.getExpenses !== "function"
) {
  console.error(
    "Error: financeController is not valid or missing required functions"
  );
  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to load finance controller. Please check the application configuration.",
  });
}

const Dashboard = () => {
  // State declarations
  const [loading, setLoading] = useState(true);
  const [isFarmer, setIsFarmer] = useState(false);
  const [totalCows, setTotalCows] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [milkProductionData, setMilkProductionData] = useState([]);
  const [feedUsageData, setFeedUsageData] = useState([]);
  const [healthCheckData, setHealthCheckData] = useState([]);
  const [activeTab, setActiveTab] = useState("production");
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [userManagedCows, setUserManagedCows] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: "2025-05-18",
    endDate: "2025-05-24",
  });

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState([]);

  const handleTotalCowsClick = async () => {
    try {
      if (isFarmer) {
        // Untuk farmer, tampilkan sapi yang mereka kelola
        const formattedData = userManagedCows.map((cow) => ({
          cowName: cow.name || "Unknown",
          cowId: cow.id || "N/A",
        }));
        setModalData(formattedData);
      } else {
        // Untuk admin, tampilkan siapa yang mengelola setiap sapi
        const usersWithCowsResponse = await getUsersWithCows();
        console.log("Users with cows response:", usersWithCowsResponse);
        if (usersWithCowsResponse.success) {
          const usersWithCows = usersWithCowsResponse.usersWithCows || [];
          const cowsWithManagers = [];

          usersWithCows.forEach((farmer) => {
            farmer.cows.forEach((cow) => {
              cowsWithManagers.push({
                cowName: cow.name || "Unknown",
                manager: farmer.user.username || "Unknown", // Ambil username dari farmer.user
              });
            });
          });

          setModalData(cowsWithManagers);
        } else {
          throw new Error(
            usersWithCowsResponse.message || "Failed to fetch data."
          );
        }
      }
      setShowModal(true);
    } catch (err) {
      console.error("Error fetching cow data:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to fetch cow data.",
      });
    }
  };
  // Function to close modal
  const handleCloseModal = () => setShowModal(false);

  // Animation hooks
  const { ref: statsRef, inView: statsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: chartsRef, inView: chartsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const { startDate, endDate } = dateRange;

  // Automatic tab switching logic
  useEffect(() => {
    const tabOrder = ["production", "health", "orders", "feed"];
    let tabIndex = 0;

    const intervalId = setInterval(() => {
      tabIndex = (tabIndex + 1) % tabOrder.length;
      setActiveTab(tabOrder[tabIndex]);
    }, 6500);

    return () => clearInterval(intervalId);
  }, []);

  // Main data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || userManagedCows === undefined) return;

      setLoading(true);
      setError(null);

      try {
        // ...existing data fetching logic...
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to load dashboard data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userManagedCows, dateRange]);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setCurrentUser(userData);
        // Check if user is a farmer (assuming role_id 3 is for farmers)
        setIsFarmer(userData.role_id === 3);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  // Fetch user-managed cows
  useEffect(() => {
    const fetchUserManagedCows = async () => {
      if (currentUser?.user_id) {
        try {
          const { success, cows } = await listCowsByUser(currentUser.user_id);
          if (success && cows) {
            setUserManagedCows(cows);
          }
        } catch (err) {
          console.error("Error fetching user's cows:", err);
        }
      }
    };

    fetchUserManagedCows();
  }, [currentUser]);

  // Main data fetching
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || userManagedCows === undefined) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch Total Cows
        const cowsResponse = await listCows();
        if (cowsResponse.success) {
          if (isFarmer && userManagedCows.length > 0) {
            // For farmers, only count managed cows
            setTotalCows(userManagedCows.length);
          } else {
            // For admins and supervisors, count all cows
            setTotalCows(cowsResponse.cows.length);
          }
        } else {
          throw new Error(cowsResponse.message || "Failed to fetch cows.");
        }

        // Fetch Total Farmers
        const farmersResponse = await getAllUsers();
        if (farmersResponse.success) {
          const farmers = farmersResponse.users.filter(
            (user) => user.role_id === 3
          );
          setTotalFarmers(farmers.length);
        } else {
          throw new Error(
            farmersResponse.message || "Failed to fetch farmers."
          );
        }

        // Fetch Milking Sessions
        const milkingResponse = await getMilkingSessions();
        if (milkingResponse.success && milkingResponse.sessions) {
          let filteredSessions = milkingResponse.sessions;

          // Filter by user's managed cows if farmer only
          if (isFarmer && userManagedCows.length > 0) {
            const managedCowIds = userManagedCows.map((cow) => String(cow.id));
            filteredSessions = filteredSessions.filter((session) =>
              managedCowIds.includes(String(session.cow_id))
            );
          }

          // Process milk production data by date
          const milkByDate = {};
          for (
            let date = new Date(startDate);
            date <= new Date(endDate);
            date.setDate(date.getDate() + 1)
          ) {
            const formattedDate = date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            milkByDate[formattedDate] = 0;
          }

          filteredSessions.forEach((session) => {
            const date = new Date(session.milking_time).toLocaleDateString(
              "id-ID",
              { day: "numeric", month: "short" }
            );
            if (milkByDate[date] !== undefined) {
              milkByDate[date] += parseFloat(session.volume || 0);
            }
          });

          const formattedMilkData = Object.entries(milkByDate).map(
            ([date, volume]) => ({
              date,
              volume: parseFloat(volume.toFixed(2)),
            })
          );

          setMilkProductionData(formattedMilkData);
        } else {
          throw new Error(
            milkingResponse.message || "Failed to fetch milking sessions."
          );
        }

        // In the feed usage data fetch section
        const feedResponse = await getFeedUsageByDate({
          start_date: startDate,
          end_date: endDate,
        });

        if (feedResponse.success && Array.isArray(feedResponse.data)) {
          // Process feed usage data by date
          const feedByDate = {};
          for (
            let date = new Date(startDate);
            date <= new Date(endDate);
            date.setDate(date.getDate() + 1)
          ) {
            const formattedDate = date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            feedByDate[formattedDate] = 0;
          }

          let filteredFeedData = feedResponse.data;

          // Filter by user's managed cows if farmer
          if (isFarmer && userManagedCows.length > 0) {
            const managedCowIds = userManagedCows.map((cow) => String(cow.id));
            filteredFeedData = filteredFeedData.filter((day) => {
              return day.feeds.some(
                (feed) =>
                  feed.cow_id && managedCowIds.includes(String(feed.cow_id))
              );
            });
          }

          filteredFeedData.forEach((day) => {
            const date = new Date(day.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            if (feedByDate[date] !== undefined) {
              if (isFarmer && userManagedCows.length > 0) {
                const managedCowIds = userManagedCows.map((cow) =>
                  String(cow.id)
                );
                // For farmers, only sum feed for their managed cows
                feedByDate[date] += day.feeds
                  .filter(
                    (feed) =>
                      feed.cow_id && managedCowIds.includes(String(feed.cow_id))
                  )
                  .reduce(
                    (sum, feed) => sum + parseFloat(feed.quantity_kg || 0),
                    0
                  );
              } else {
                // For admins, sum all feeds
                feedByDate[date] += day.feeds.reduce(
                  (sum, feed) => sum + parseFloat(feed.quantity_kg || 0),
                  0
                );
              }
            }
          });

          const formattedFeedData = Object.entries(feedByDate).map(
            ([date, quantity]) => ({
              date,
              feed: parseFloat(quantity.toFixed(2)),
            })
          );

          setFeedUsageData(formattedFeedData);
        } else {
          console.warn("Unexpected feed usage response:", feedResponse);
        }

        // Fetch Health Checks
        const healthResponse = await getHealthChecks();

        if (Array.isArray(healthResponse)) {
          const uniqueHealthChecks = Array.from(
            new Map(healthResponse.map((check) => [check.id, check])).values()
          );

          let filteredHealthChecks = uniqueHealthChecks;

          // Filter by user's managed cows if farmer only
          if (isFarmer && userManagedCows.length > 0) {
            const managedCowIds = userManagedCows.map((cow) => cow.id);
            filteredHealthChecks = filteredHealthChecks.filter((check) =>
              managedCowIds.includes(check?.cow?.id)
            );
          }

          // Process health check data by date
          const healthByDate = {};
          for (
            let date = new Date(startDate);
            date <= new Date(endDate);
            date.setDate(date.getDate() + 1)
          ) {
            const formattedDate = date.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            healthByDate[formattedDate] = 0;
          }

          filteredHealthChecks.forEach((check) => {
            const checkupDate = new Date(check.checkup_date);
            if (isNaN(checkupDate.getTime())) {
              console.warn("Invalid checkup_date:", check.checkup_date);
              return;
            }
            const date = checkupDate.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
            });
            if (healthByDate[date] !== undefined) {
              healthByDate[date] += 1;
            }
          });

          const formattedHealthData = Object.entries(healthByDate).map(
            ([date, checks]) => ({
              date,
              checks,
            })
          );

          setHealthCheckData(formattedHealthData);
        } else {
          console.warn("Unexpected health checks response:", healthResponse);
        }

        // Fetch Orders
        const ordersResponse = await getOrders();
        if (ordersResponse.success && Array.isArray(ordersResponse.orders)) {
          const formattedOrders = ordersResponse.orders
            .slice(0, 8) // Limit to prevent overflow
            .map((order) => ({
              order_no: order.order_no || "N/A",
              customer_name: order.customer_name || "Unknown",
              total: parseFloat(order.total_price || 0).toLocaleString(
                "id-ID",
                {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }
              ),
              status: order.status || "Unknown",
            }));

          setOrders(formattedOrders);
        } else {
          console.warn("Invalid orders response:", ordersResponse);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "Failed to load dashboard data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userManagedCows, dateRange]);

  // Render loading state
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="text-center py-5 bg-light">
        <p className="text-danger">Error: {error}</p>
        <Button
          variant="primary"
          onClick={() => window.location.reload()}
          className="mt-3 rounded-pill"
        >
          Coba Lagi
        </Button>
      </div>
    );
  }

  // Helper functions for status badges
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Completed":
        return "bg-success";
      case "Pending":
        return "bg-warning text-dark";
      case "Processed":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Completed":
        return "✓ Selesai";
      case "Pending":
        return "⏳ Menunggu";
      case "Processed":
        return "⟳ Diproses";
      case "Requested":
        return "↓ Diminta";
      default:
        return status;
    }
  };

  return (
    <div className="container-fluid ">
      <Card className="shadow-lg border-0 rounded-lg mb-1">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h4 style={styles.heading}>
              <i className="fas fa-chart-line me-2"></i>
              Dairy Track Dashboard
            </h4>
          </div>
          <p style={styles.subheading} className="mt-2 mb-0">
            <i className="fas fa-info-circle me-2"></i>
            This dashboard provides real-time insights into your dairy farm
            operations, including cattle management, milk production, and order
            tracking.
          </p>
        </Card.Header>
        <Card.Body>
          {/* Welcome Banner */}
          <div className="mb-4 p-3 bg-light rounded-3">
            <Row className="align-items-center">
              <Col md={8}>
                <h5
                  className="mb-1"
                  style={{ color: "#3D90D7", fontWeight: "500" }}
                >
                  Selamat datang, {currentUser?.name || "Admin"}!
                </h5>
                <div style={styles.subheading}>
                  {currentTime.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  |{" "}
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Col>
              <Col md={4} className="text-md-end"></Col>
            </Row>
          </div>

          {/* Stats Cards */}
          <motion.div
            ref={statsRef}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={animations.container}
            className="mb-4"
          >
            <Row>
              {[
                {
                  title: "Total Sapi",
                  value: totalCows,
                  badge: isFarmer ? "Sapi Dikelola" : "Sapi Terdaftar",
                  icon: <PawPrint size={22} color="#0d6efd" />,
                  bgColor: "#e3f2fd",
                  iconColor: "#0d6efd",
                  badgeClass: "bg-primary-subtle text-primary",
                  description: isFarmer
                    ? "Jumlah sapi yang Anda kelola."
                    : "Jumlah total sapi yang terdaftar dalam sistem.",
                  onClick: handleTotalCowsClick, // Tambahkan event handler
                },
                {
                  title: "Total Peternak",
                  value: totalFarmers,
                  badge: "Peternak Aktif",
                  icon: <LucideUsers size={22} color="#0dcaf0" />,
                  bgColor: "#e0f7fa",
                  iconColor: "#0dcaf0",
                  badgeClass: "bg-info-subtle text-info",
                  description:
                    "Jumlah peternak yang aktif mengelola peternakan.",
                },
                {
                  title: "Produksi Susu",
                  value: `${milkProductionData
                    .reduce((sum, item) => sum + item.volume, 0)
                    .toFixed(2)} L`,
                  badge: isFarmer ? "Sapi Dikelola" : "Produksi Mingguan",
                  icon: <Droplet size={22} color="#198754" />,
                  bgColor: "#e8f5e9",
                  iconColor: "#198754",
                  badgeClass: "bg-success-subtle text-success",
                  description: isFarmer
                    ? "yang dihasilkan sapi kelolaan Anda minggu ini."
                    : "Total volume susu yang diproduksi minggu ini.",
                },
                {
                  title: "Penggunaan Pakan",
                  value: `${feedUsageData
                    .reduce((sum, item) => sum + item.feed, 0)
                    .toFixed(2)} kg`,
                  badge: "Konsumsi Mingguan",
                  icon: <Wheat size={22} color="#ffc107" />,
                  bgColor: "#fff8e1",
                  iconColor: "#ffc107",
                  badgeClass: "bg-warning-subtle text-warning",
                  description:
                    "Total penggunaan pakan seluruh sapi minggu ini.",
                },
              ].map((stat, index) => (
                <Col md={6} lg={3} className="mb-3" key={index}>
                  <motion.div
                    variants={animations.item}
                    whileHover={{ y: -5 }}
                    onClick={stat.onClick} // Tambahkan event handler di sini
                    style={{ cursor: stat.onClick ? "pointer" : "default" }} // Tambahkan gaya pointer jika ada onClick
                  >
                    <Card style={styles.statCard}>
                      <Card.Body className="p-3">
                        <div className="d-flex align-items-center">
                          <div
                            style={{
                              ...styles.iconContainer,
                              backgroundColor: stat.bgColor,
                            }}
                          >
                            {stat.icon}
                          </div>
                          <div>
                            <div style={styles.subheading}>{stat.title}</div>
                            <div style={styles.statValue}>{stat.value}</div>
                            <div className="mt-1">
                              <span
                                className={`badge ${stat.badgeClass}`}
                                style={styles.badge}
                              >
                                {stat.badge}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2" style={styles.statDescription}>
                          <i className="fas fa-info-circle me-1 text-muted"></i>
                          {stat.description}
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>

          {/* Tabs for Charts and Tables */}
          <motion.div
            ref={chartsRef}
            initial="hidden"
            animate={chartsInView ? "visible" : "hidden"}
            variants={animations.container}
          >
            <Tabs
              activeKey={activeTab}
              onSelect={(key) => setActiveTab(key)}
              className="mb-3"
              fill
              style={styles.tabContainer}
            >
              {/* Milk Production Tab */}
              <Tab
                eventKey="production"
                title={
                  <span style={{ color: "#6c757d", fontWeight: "normal" }}>
                    <i className="fas fa-tint me-2"></i>Produksi Susu
                  </span>
                }
              >
                <motion.div
                  variants={animations.item}
                  style={{ minHeight: "450px" }}
                >
                  <Row>
                    <Col lg={8} className="mb-4">
                      <Card style={styles.card}>
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">Produksi Susu Mingguan</h5>
                          <p
                            className="text-muted mt-1"
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fas fa-info-circle me-2"></i>
                            Grafik volume produksi susu selama 7 hari terakhir
                            dari seluruh sapi.
                          </p>
                        </Card.Header>
                        <Card.Body>
                          <div style={styles.chartContainer} className="mt-3">
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                data={milkProductionData}
                                margin={{
                                  top: 10,
                                  right: 10,
                                  left: 10,
                                  bottom: 20,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f0f0f0"
                                />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  axisLine={{ stroke: "#e0e0e0" }}
                                />
                                <YAxis
                                  tickFormatter={(value) => `${value}L`}
                                  tick={{ fontSize: 12 }}
                                  axisLine={{ stroke: "#e0e0e0" }}
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value} Liter`,
                                    "Volume",
                                  ]}
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Bar
                                  dataKey="volume"
                                  name="Volume Susu"
                                  fill="#0d6efd"
                                  radius={[4, 4, 0, 0]}
                                  barSize={36}
                                >
                                  <LabelList
                                    dataKey="volume"
                                    position="top"
                                    style={{
                                      fontSize: "0.7rem",
                                      fill: "#495057",
                                    }}
                                    formatter={(value) => `${value}L`}
                                  />
                                </Bar>
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={4}>
                      <Card style={{ ...styles.card, height: "88%" }}>
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">Statistik Produksi</h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-flex flex-column mt-3">
                            {[
                              {
                                label: "Total Produksi",
                                value: `${milkProductionData
                                  .reduce((sum, item) => sum + item.volume, 0)
                                  .toFixed(2)} L`,
                                icon: "fa-fill-drip",
                                color: "primary",
                              },
                              {
                                label: "Rata-Rata Harian",
                                value: `${(
                                  milkProductionData.reduce(
                                    (sum, item) => sum + item.volume,
                                    0
                                  ) / 7
                                ).toFixed(2)} L`,
                                icon: "fa-calendar-day",
                                color: "success",
                              },
                              {
                                label: "Produksi Tertinggi",
                                value: `${Math.max(
                                  ...milkProductionData.map(
                                    (item) => item.volume
                                  )
                                ).toFixed(2)} L`,
                                icon: "fa-arrow-up",
                                color: "danger",
                              },
                              {
                                label: "Produksi Terendah",
                                value: `${Math.min(
                                  ...milkProductionData
                                    .filter((item) => item.volume > 0)
                                    .map((item) => item.volume)
                                ).toFixed(2)} L`,
                                icon: "fa-arrow-down text-light",
                                color: "warning",
                              },
                            ].map((stat, idx) => (
                              <div
                                key={idx}
                                className="d-flex align-items-center mb-2 p-2 rounded"
                                style={{ backgroundColor: "#f8f9fa" }}
                              >
                                <div
                                  className={`rounded-circle bg-${stat.color} bg-opacity-10 d-flex align-items-center justify-content-center me-2`}
                                  style={{ width: "36px", height: "36px" }}
                                >
                                  <i
                                    className={`fas ${stat.icon} text-${stat.color}`}
                                  ></i>
                                </div>
                                <div>
                                  <div
                                    className="text-muted"
                                    style={{
                                      fontSize: "13px",
                                      fontFamily: "'Roboto Mono', monospace",
                                      fontWeight: "500",
                                      letterSpacing: "0.2px",
                                    }}
                                  >
                                    {stat.label}
                                  </div>
                                  <div
                                    className="fw-400"
                                    style={{
                                      fontSize: "17px",
                                      fontFamily: "'Roboto Mono', monospace",
                                      fontWeight: "400",
                                      letterSpacing: "0.5px",
                                      lineHeight: "1.2",
                                    }}
                                  >
                                    {stat.value}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </motion.div>
              </Tab>

              {/* Health Checks Tab */}
              <Tab
                eventKey="health"
                title={
                  <span style={{ color: "#6c757d", fontWeight: "normal" }}>
                    <i className="fas fa-heartbeat me-2"></i>Kesehatan
                  </span>
                }
              >
                <motion.div
                  variants={animations.item}
                  style={{ minHeight: "450px" }}
                >
                  <Row>
                    <Col lg={8} className="mb-4">
                      <Card style={styles.card}>
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">
                            Pemeriksaan Kesehatan Mingguan
                          </h5>
                          <p
                            className="text-muted mt-1"
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fas fa-info-circle me-2"></i>
                            Grafik jumlah pemeriksaan kesehatan yang dilakukan
                            selama 7 hari terakhir.
                          </p>
                        </Card.Header>
                        <Card.Body>
                          <div style={styles.chartContainer} className="mt-3">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={healthCheckData}
                                margin={{
                                  top: 10,
                                  right: 10,
                                  left: 10,
                                  bottom: 20,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f0f0f0"
                                />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  axisLine={{ stroke: "#e0e0e0" }}
                                />
                                <YAxis
                                  allowDecimals={false}
                                  tick={{ fontSize: 12 }}
                                  axisLine={{ stroke: "#e0e0e0" }}
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value} kali`,
                                    "Pemeriksaan",
                                  ]}
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Bar
                                  dataKey="checks"
                                  name="Jumlah Pemeriksaan"
                                  fill="#6f42c1"
                                  radius={[4, 4, 0, 0]}
                                  barSize={36}
                                >
                                  <LabelList
                                    dataKey="checks"
                                    position="top"
                                    style={{
                                      fontSize: "0.7rem",
                                      fill: "#495057",
                                    }}
                                  />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={4}>
                      <Card style={{ ...styles.card, height: "100%" }}>
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">Panduan Kesehatan Sapi</h5>
                        </Card.Header>
                        <Card.Body>
                          <div className="d-flex flex-column">
                            <h6 className="text-primary mb-2">
                              Tips Menjaga Kesehatan Sapi
                            </h6>
                            <ul
                              className="text-muted"
                              style={{ fontSize: "14px", lineHeight: "1.6" }}
                            >
                              <li>Lakukan pemeriksaan rutin setiap minggu</li>
                              <li>
                                Perhatikan asupan nutrisi dan kualitas pakan
                              </li>
                              <li>
                                Jaga kebersihan kandang untuk mencegah penyakit
                              </li>
                              <li>
                                Amati perubahan perilaku yang dapat
                                mengindikasikan masalah kesehatan
                              </li>
                              <li>
                                Segera konsultasi dengan dokter hewan jika ada
                                gejala tidak normal
                              </li>
                            </ul>
                            <div
                              className="alert alert-info mt-auto"
                              style={{ fontSize: "13px" }}
                            >
                              <i className="fas fa-info-circle me-2"></i>
                              Total pemeriksaan minggu ini:{" "}
                              <strong>
                                {healthCheckData.reduce(
                                  (sum, item) => sum + item.checks,
                                  0
                                )}{" "}
                                kali
                              </strong>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </motion.div>
              </Tab>

              {/* Orders Tab */}
              <Tab
                eventKey="orders"
                title={
                  <span style={{ color: "#6c757d", fontWeight: "normal" }}>
                    <i className="fas fa-shopping-cart me-2"></i>Pesanan
                  </span>
                }
              >
                <motion.div
                  variants={animations.item}
                  style={{ minHeight: "450px" }}
                >
                  <Card style={styles.card}>
                    <Card.Header className="bg-white">
                      <h5 className="mb-0">Pesanan Terbaru</h5>
                      <p
                        className="text-muted mt-1"
                        style={{ fontSize: "14px" }}
                      >
                        <i className="fas fa-info-circle me-2"></i>
                        Daftar pesanan terbaru dari pelanggan.
                      </p>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive rounded-3">
                        <table className="table table-hover table-bordered mb-0">
                          <thead>
                            <tr>
                              <th
                                scope="col"
                                className="text-center fw-medium"
                                style={styles.tableHeader}
                              >
                                #
                              </th>
                              <th
                                scope="col"
                                className="fw-medium"
                                style={styles.tableHeader}
                              >
                                No. Pesanan
                              </th>
                              <th
                                scope="col"
                                className="fw-medium"
                                style={styles.tableHeader}
                              >
                                Pelanggan
                              </th>
                              <th
                                scope="col"
                                className="fw-medium"
                                style={styles.tableHeader}
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="fw-medium"
                                style={styles.tableHeader}
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.length > 0 ? (
                              orders.map((order, index) => (
                                <tr key={index}>
                                  <td className="text-center text-muted">
                                    {index + 1}
                                  </td>
                                  <td className="fw-medium">
                                    {order.order_no}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <div
                                        className="rounded-circle d-flex justify-content-center align-items-center me-2 bg-primary bg-opacity-10"
                                        style={{
                                          width: "32px",
                                          height: "32px",
                                        }}
                                      >
                                        <i className="fas fa-user-circle text-primary"></i>
                                      </div>
                                      <div className="text-dark">
                                        {order.customer_name}
                                      </div>
                                    </div>
                                  </td>
                                  <td>{order.total}</td>
                                  <td>
                                    <span
                                      className={`badge ${getStatusBadgeClass(
                                        order.status
                                      )}`}
                                      style={styles.badge}
                                    >
                                      {getStatusLabel(order.status)}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center py-3">
                                  <div className="text-muted">
                                    <i className="fas fa-shopping-cart fs-3 d-block mb-2"></i>
                                    Tidak ada pesanan
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Tab>

              {/* Feed Usage Tab */}
              <Tab
                eventKey="feed"
                title={
                  <span style={{ color: "#6c757d", fontWeight: "normal" }}>
                    <i className="fas fa-leaf me-2"></i>Pakan
                  </span>
                }
              >
                <motion.div
                  variants={animations.item}
                  style={{ minHeight: "450px" }}
                >
                  <Row>
                    <Col lg={6} className="mb-4">
                      <Card style={{ ...styles.card, height: "100%" }}>
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">Penggunaan Pakan Mingguan</h5>
                          <p
                            className="text-muted mt-1"
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fas fa-info-circle me-2"></i>
                            Grafik penggunaan pakan selama 7 hari terakhir.
                          </p>
                        </Card.Header>
                        <Card.Body>
                          <div style={styles.chartContainer} className="mt-3">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={feedUsageData}
                                margin={{
                                  top: 10,
                                  right: 10,
                                  left: 10,
                                  bottom: 20,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#f0f0f0"
                                />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fontSize: 12 }}
                                  axisLine={{ stroke: "#e0e0e0" }}
                                />
                                <YAxis
                                  tickFormatter={(value) => `${value}kg`}
                                  tick={{ fontSize: 12 }}
                                  axisLine={{ stroke: "#e0e0e0" }}
                                />
                                <Tooltip
                                  formatter={(value) => [
                                    `${value} kg`,
                                    "Jumlah",
                                  ]}
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Bar
                                  dataKey="feed"
                                  name="Penggunaan Pakan"
                                  fill="#ffc107"
                                  radius={[4, 4, 0, 0]}
                                  barSize={36}
                                >
                                  <LabelList
                                    dataKey="feed"
                                    position="top"
                                    style={{
                                      fontSize: "0.7rem",
                                      fill: "#495057",
                                    }}
                                    formatter={(value) => `${value}kg`}
                                  />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col lg={6}>
                      <Card style={{ ...styles.card, height: "100%" }}>
                        <Card.Header className="bg-white">
                          <h5 className="mb-0">Komposisi Pakan</h5>
                          <p
                            className="text-muted mt-1"
                            style={{ fontSize: "14px" }}
                          >
                            <i className="fas fa-info-circle me-2"></i>
                            Persentase komposisi pakan yang digunakan.
                          </p>
                        </Card.Header>
                        <Card.Body>
                          <div style={styles.chartContainer} className="mt-3">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    {
                                      name: "Rumput Segar",
                                      value:
                                        feedUsageData.reduce(
                                          (sum, item) => sum + item.feed,
                                          0
                                        ) * 0.65,
                                    },
                                    {
                                      name: "Konsentrat",
                                      value:
                                        feedUsageData.reduce(
                                          (sum, item) => sum + item.feed,
                                          0
                                        ) * 0.25,
                                    },
                                    {
                                      name: "Vitamin & Mineral",
                                      value:
                                        feedUsageData.reduce(
                                          (sum, item) => sum + item.feed,
                                          0
                                        ) * 0.1,
                                    },
                                  ]}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  label={(entry) =>
                                    `${entry.name}: ${(
                                      entry.percent * 100
                                    ).toFixed(0)}%`
                                  }
                                  labelLine={false}
                                >
                                  <Cell key="Rumput Segar" fill="#2ecc71" />
                                  <Cell key="Konsentrat" fill="#f39c12" />
                                  <Cell
                                    key="Vitamin & Mineral"
                                    fill="#3498db"
                                  />
                                </Pie>
                                <Tooltip
                                  formatter={(value) => [
                                    `${value.toFixed(1)} kg`,
                                    "",
                                  ]}
                                  contentStyle={{
                                    backgroundColor: "#fff",
                                    border: "none",
                                    borderRadius: "8px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <Legend
                                  verticalAlign="bottom"
                                  layout="horizontal"
                                  iconSize={10}
                                  iconType="circle"
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </motion.div>
              </Tab>
            </Tabs>
          </motion.div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-info-circle me-2"></i>
            {isFarmer ? "Sapi yang Anda Kelola" : "Daftar Sapi dan Pengelola"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalData.length > 0 ? (
            <Table striped bordered hover responsive className="text-center">
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th>Nama Sapi</th>
                  <th>{isFarmer ? "ID Sapi" : "Pengelola"}</th>
                </tr>
              </thead>
              <tbody>
                {modalData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.cowName}</td>
                    <td>{isFarmer ? item.cowId : item.manager}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <i className="fas fa-exclamation-circle text-muted fs-1 mb-3"></i>
              <p className="text-muted">Tidak ada data yang tersedia.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button variant="secondary" onClick={handleCloseModal}>
            Tutup
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Dashboard;
