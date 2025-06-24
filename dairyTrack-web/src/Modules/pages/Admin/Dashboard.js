import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Tabs,
  Tab,
  Spinner,
  Badge,
  Alert,
} from "react-bootstrap";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { motion } from "framer-motion";
import { Droplet, Wheat, PawPrint, LucideUsers } from "lucide-react";
import { getMilkingSessions } from "../../controllers/milkProductionController";
import {
  listCowsByUser,
  getUsersWithCows,
  getAllUsersAndAllCows,
} from "../../controllers/cattleDistributionController";
import { format, subDays, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { listBlogs } from "../../controllers/blogController";
import { listGalleries } from "../../controllers/galleryController";
import { getAllUsers } from "../../controllers/usersController";

const COLORS = [
  "#3D90D7",
  "#28a745",
  "#ffc107",
  "#dc3545",
  "#6f42c1",
  "#fd7e14",
];

const styles = {
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
  card: {
    borderRadius: "10px",
    border: "none",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.06)",
    transition: "transform 0.2s ease-in-out",
  },
  chartContainer: {
    height: "300px",
    marginTop: "10px",
  },
  welcomeCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "15px",
    border: "none",
  },
  statCard: {
    borderLeft: "4px solid #3D90D7",
    borderRadius: "10px",
    transition: "transform 0.2s ease-in-out",
  },
  floatingContainer: {
    position: "relative",
    minHeight: "200px",
    background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
    borderRadius: "20px",
    padding: "30px",
    overflow: "hidden",
  },
  floatingItem: {
    position: "absolute",
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 6px 10px rgba(0, 0, 0, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(10px)",
    animation: "float 6s ease-in-out infinite",
    transition: "all 0.3s ease",
  },
  floatingCow: {
    top: "20px",
    left: "10%",
    animationDelay: "0s",
    transform: "rotate(-2deg)",
  },
  floatingMilk: {
    top: "60px",
    right: "15%",
    animationDelay: "2s",
    transform: "rotate(3deg)",
  },
  floatingStats: {
    bottom: "30px",
    left: "20%",
    animationDelay: "4s",
    transform: "rotate(-1deg)",
  },
  floatingExtra: {
    top: "40px",
    left: "50%",
    animationDelay: "1s",
    transform: "rotate(2deg)",
    fontSize: "12px",
  },
  welcomeCardAnimated: {
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    color: "white",
    borderRadius: "20px",
    border: "none",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(79, 172, 254, 0.3)",
  },
  welcomeOverlay: {
    position: "absolute",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    background:
      "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
    zIndex: 1,
  },
  welcomeContent: {
    position: "relative",
    zIndex: 2,
  },
  floatingIcon: {
    position: "absolute",
    animation: "floatIcon 4s ease-in-out infinite",
    opacity: 0.2,
  },
  welcomeUserName: {
    background: "linear-gradient(45deg, #fff, #f0f8ff)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontWeight: "700",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
};

// Enhanced CSS animation
const floatingAnimation = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(var(--rotation, 0deg)); }
    50% { transform: translateY(-20px) rotate(var(--rotation, 0deg)); }
  }
  
  @keyframes floatIcon {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(5deg); }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.1); opacity: 1; }
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  
  .welcome-shimmer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 3s ease-in-out infinite;
  }
  
  .floating-item {
    animation: float 6s ease-in-out infinite;
  }
  
  .floating-item:nth-child(1) { --rotation: -2deg; animation-delay: 0s; }
  .floating-item:nth-child(2) { --rotation: 3deg; animation-delay: 2s; }
  .floating-item:nth-child(3) { --rotation: -1deg; animation-delay: 4s; }
  .floating-item:nth-child(4) { --rotation: 2deg; animation-delay: 1s; }
  
  .floating-item:hover {
    transform: translateY(-10px) scale(1.05) rotate(var(--rotation, 0deg));
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 10px 15px rgba(0, 0, 0, 0.1);
  }
  
  .role-badge {
    animation: pulse 2s ease-in-out infinite;
  }
`;

const Dashboard = () => {
  // State management
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [milkingSessions, setMilkingSessions] = useState([]);
  const [userManagedCows, setUserManagedCows] = useState([]);
  const [allUsersWithCows, setAllUsersWithCows] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalCows: 0,
    totalFarmers: 0,
    totalMilkToday: 0,
    avgMilkPerCow: 0,
  });

  // Add new state for blog and gallery counts
  const [contentStats, setContentStats] = useState({
    totalBlogs: 0,
    totalGalleries: 0,
  });

  // Get current user from localStorage
  const getCurrentUser = () => {
    if (typeof localStorage !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      // Redirect to login if no user data found
      window.location.href = "/"; // Adjust the path as needed
    }
  }, []);
  // Function to calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const now = new Date();

    // Check if birth date is valid
    if (isNaN(birth.getTime())) return null;

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();

    // Adjust if current month/day is before birth month/day
    if (months < 0) {
      years--;
      months += 12;
    } else if (months === 0 && now.getDate() < birth.getDate()) {
      years--;
      months = 11;
    } else if (now.getDate() < birth.getDate()) {
      months--;
    }

    return { years, months };
  };

  // Function to format age display
  const formatAge = (birthDate) => {
    const age = calculateAge(birthDate);
    if (!age) return "N/A";

    const { years, months } = age;

    if (years === 0) {
      return `${months} bulan`;
    } else if (months === 0) {
      return `${years} tahun`;
    } else {
      return `${years}th ${months}bln`;
    }
  };

  // Utility function to get local date string
  const getLocalDateString = (date = new Date()) => {
    return date.toLocaleDateString("sv-SE"); // YYYY-MM-DD format
  };

  // Convert timestamp to local date string for filtering
  const getSessionLocalDate = (timestamp) => {
    const date = new Date(timestamp);
    return getLocalDateString(date);
  };

  // Calculate total milk production per cow
  const cowMilkProduction = useMemo(() => {
    if (!milkingSessions.length || !userManagedCows.length) return {};

    const production = {};

    // Initialize with cow data
    userManagedCows.forEach((cow) => {
      production[cow.id] = {
        cowData: cow,
        totalVolume: 0,
        sessionsCount: 0,
        avgPerSession: 0,
        todayVolume: 0,
      };
    });

    const today = getLocalDateString();

    // Calculate production for each cow
    milkingSessions.forEach((session) => {
      const cowId = session.cow_id;
      if (production[cowId]) {
        const volume = parseFloat(session.volume || 0);
        production[cowId].totalVolume += volume;
        production[cowId].sessionsCount += 1;

        // Check if session is today
        if (getSessionLocalDate(session.milking_time) === today) {
          production[cowId].todayVolume += volume;
        }
      }
    });

    // Calculate averages
    Object.keys(production).forEach((cowId) => {
      const cow = production[cowId];
      cow.avgPerSession =
        cow.sessionsCount > 0 ? cow.totalVolume / cow.sessionsCount : 0;
    });

    return production;
  }, [milkingSessions, userManagedCows]);

  // Fetch data on component mount
  // Fetch data on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const userData = getCurrentUser();
        if (userData) {
          setCurrentUser(userData);

          // Fetch milking sessions
          const sessionsResponse = await getMilkingSessions();
          if (sessionsResponse.success && sessionsResponse.sessions) {
            setMilkingSessions(sessionsResponse.sessions);
          }

          // Fetch blog and gallery data for all users
          const fetchContentData = async () => {
            try {
              const [blogsResponse, galleriesResponse] = await Promise.all([
                listBlogs(),
                listGalleries(),
              ]);

              setContentStats({
                totalBlogs: blogsResponse.success
                  ? blogsResponse.blogs?.length || 0
                  : 0,
                totalGalleries: galleriesResponse.success
                  ? galleriesResponse.galleries?.length || 0
                  : 0,
              });
            } catch (error) {
              console.error("Error fetching content data:", error);
              setContentStats({
                totalBlogs: 0,
                totalGalleries: 0,
              });
            }
          };

          await fetchContentData();

          // Fetch user's managed cows if user is a farmer
          if (userData.role_id === 3) {
            const userId = userData.id || userData.user_id;
            const cowsResponse = await listCowsByUser(userId);
            if (cowsResponse.success && cowsResponse.cows) {
              setUserManagedCows(cowsResponse.cows);
            }
          }

          // Fetch all users with cows for admin/supervisor
          if (userData.role_id === 1 || userData.role_id === 2) {
            const usersWithCowsResponse = await getUsersWithCows();
            if (usersWithCowsResponse.success) {
              setAllUsersWithCows(usersWithCowsResponse.usersWithCows || []);
            }

            const allDataResponse = await getAllUsersAndAllCows();
            const allUsersResponse = await getAllUsers();
            if (allDataResponse.success) {
              const totalCows = allDataResponse.cows?.length || 0;
              const totalFarmers =
                allDataResponse.users?.filter((user) => user.role_id === 3)
                  .length || 0;
              const totalSupervisors =
                allUsersResponse.users?.filter((user) => user.role_id === 2)
                  .length || 0;
              const totalAdmins =
                allUsersResponse.users?.filter((user) => user.role_id === 1)
                  .length || 0;

              setDashboardStats((prev) => ({
                ...prev,
                totalCows,
                totalFarmers,
                totalSupervisors,
                totalAdmins,
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, []);

  // Calculate milk production trends
  const milkProductionTrend = useMemo(() => {
    if (!milkingSessions.length) return [];

    // Get last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      last7Days.push(getLocalDateString(date));
    }

    // Filter sessions based on user role
    let filteredSessions = milkingSessions;
    if (currentUser?.role_id === 3 && userManagedCows.length > 0) {
      const managedCowIds = userManagedCows.map((cow) => cow.id);
      filteredSessions = milkingSessions.filter((session) =>
        managedCowIds.includes(session.cow_id)
      );
    }

    // Group sessions by date and calculate total volume
    const dailyProduction = last7Days.map((date) => {
      const daysSessions = filteredSessions.filter(
        (session) => getSessionLocalDate(session.milking_time) === date
      );

      const totalVolume = daysSessions.reduce(
        (sum, session) => sum + parseFloat(session.volume || 0),
        0
      );

      return {
        date: format(new Date(date), "dd MMM", { locale: id }),
        volume: totalVolume,
        sessions: daysSessions.length,
      };
    });

    return dailyProduction;
  }, [milkingSessions, currentUser, userManagedCows]);

  // Calculate today's statistics
  const todayStats = useMemo(() => {
    const today = getLocalDateString();
    let todaySessions = milkingSessions.filter(
      (session) => getSessionLocalDate(session.milking_time) === today
    );

    // Filter for farmer's cows only
    if (currentUser?.role_id === 3 && userManagedCows.length > 0) {
      const managedCowIds = userManagedCows.map((cow) => cow.id);
      todaySessions = todaySessions.filter((session) =>
        managedCowIds.includes(session.cow_id)
      );
    }

    const totalMilkToday = todaySessions.reduce(
      (sum, session) => sum + parseFloat(session.volume || 0),
      0
    );

    const activeCows =
      currentUser?.role_id === 3
        ? userManagedCows.length
        : dashboardStats.totalCows;
    const avgMilkPerCow = activeCows > 0 ? totalMilkToday / activeCows : 0;

    return {
      totalMilkToday: totalMilkToday.toFixed(1),
      avgMilkPerCow: avgMilkPerCow.toFixed(1),
      sessionsToday: todaySessions.length,
      // Add blog and gallery counts
      totalBlogs: contentStats.totalBlogs,
      totalGalleries: contentStats.totalGalleries,
    };
  }, [
    milkingSessions,
    currentUser,
    userManagedCows,
    dashboardStats.totalCows,
    contentStats,
  ]);

  // Get user role display
  const getUserRole = (roleId) => {
    switch (roleId) {
      case 1:
        return { name: "Admin", color: "danger" };
      case 2:
        return { name: "Supervisor", color: "warning" };
      case 3:
        return { name: "Farmer", color: "success" };
      default:
        return { name: "Unknown", color: "secondary" };
    }
  };

  // Cow lactation distribution for pie chart
  const lactationDistribution = useMemo(() => {
    const cows =
      currentUser?.role_id === 3
        ? userManagedCows
        : allUsersWithCows.flatMap((farmer) => farmer.cows || []);

    const lactationCount = {};
    cows.forEach((cow) => {
      const phase = cow.lactation_phase || "Unknown";
      lactationCount[phase] = (lactationCount[phase] || 0) + 1;
    });

    return Object.entries(lactationCount).map(([phase, count]) => ({
      name: phase,
      value: count,
    }));
  }, [userManagedCows, allUsersWithCows, currentUser]);

  if (!currentUser) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Authentication Error</Alert.Heading>
        <p>Please log in to access the dashboard.</p>
      </Alert>
    );
  }

  const userRole = getUserRole(currentUser.role_id);

  return (
    <div className="container-fluid">
      {/* Add CSS Animation */}
      <style jsx>{floatingAnimation}</style>
      {/* Enhanced Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
      >
        <Card style={styles.welcomeCardAnimated} className="mb-4">
          {/* Shimmer Effect */}
          <div className="welcome-shimmer"></div>

          {/* Background Overlay */}
          <div style={styles.welcomeOverlay}></div>

          {/* Floating Background Icons */}
          <div
            style={{
              ...styles.floatingIcon,
              top: "10px",
              right: "20px",
              fontSize: "120px",
              color: "rgba(255,255,255,0.1)",
              animationDelay: "0s",
            }}
          >
            🐄
          </div>
          <div
            style={{
              ...styles.floatingIcon,
              bottom: "10px",
              left: "30px",
              fontSize: "80px",
              color: "rgba(255,255,255,0.08)",
              animationDelay: "2s",
            }}
          >
            🥛
          </div>
          <div
            style={{
              ...styles.floatingIcon,
              top: "50%",
              right: "100px",
              fontSize: "60px",
              color: "rgba(255,255,255,0.06)",
              animationDelay: "1s",
            }}
          >
            🌾
          </div>

          <Card.Body className="py-5" style={styles.welcomeContent}>
            <Row className="align-items-center">
              <Col md={8}>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <h2 className="mb-3" style={styles.welcomeUserName}>
                    <motion.i
                      className="fas fa-hand-wave me-3"
                      animate={{ rotate: [0, 20, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                      style={{ display: "inline-block", fontSize: "32px" }}
                    ></motion.i>
                    Welcome, {currentUser.name || currentUser.username}!
                  </h2>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <p
                    className="mb-3"
                    style={{ fontSize: "18px", opacity: 0.95, lineHeight: 1.6 }}
                  >
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="role-badge"
                    >
                      <Badge
                        bg={userRole.color}
                        className="me-3 px-3 py-2"
                        style={{
                          fontSize: "14px",
                          borderRadius: "20px",
                          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                        }}
                      >
                        {userRole.name}
                      </Badge>
                    </motion.span>
                    Dairy Track Dashboard - Manage your farm easily and
                    efficiently
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="d-flex align-items-center"
                >
                  <div className="d-flex align-items-center me-4">
                    <motion.i
                      className="fas fa-calendar-alt me-2"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    ></motion.i>
                    <span
                      style={{
                        opacity: 0.9,
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {format(new Date(), "EEEE, dd MMMM yyyy", { locale: id })}
                    </span>
                  </div>

                  <div className="d-flex align-items-center">
                    <motion.i
                      className="fas fa-clock me-2"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      style={{ color: "rgba(255,255,255,0.9)" }}
                    ></motion.i>
                    <span
                      style={{
                        opacity: 0.9,
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      {new Date().toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              </Col>

              <Col md={4} className="text-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.9,
                    duration: 0.8,
                    type: "spring",
                    stiffness: 120,
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.3 },
                  }}
                  style={{
                    fontSize: "80px",
                    opacity: 0.8,
                    filter: "drop-shadow(0 4px 20px rgba(255,255,255,0.3))",
                    cursor: "pointer",
                  }}
                >
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {currentUser.role_id === 3
                      ? "👨‍🌾"
                      : currentUser.role_id === 2
                      ? "👨‍💼"
                      : "👨‍💻"}
                  </motion.div>
                </motion.div>

                {/* Updated Stats Preview - Hide blog, gallery, and farmer counts for farmers */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1, duration: 0.6 }}
                  className="mt-3"
                >
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="text-center"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div style={{ fontSize: "20px" }}>🐄</div>
                      <small style={{ fontSize: "11px", opacity: 0.9 }}>
                        {currentUser.role_id === 3
                          ? userManagedCows.length
                          : dashboardStats.totalCows}{" "}
                        Cow
                      </small>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="text-center"
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <div style={{ fontSize: "20px" }}>🥛</div>
                      <small style={{ fontSize: "11px", opacity: 0.9 }}>
                        {todayStats.totalMilkToday}L Today
                      </small>
                    </motion.div>

                    {/* Hide blog count for farmers */}
                    {currentUser.role_id !== 3 && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="text-center"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <div style={{ fontSize: "20px" }}>📝</div>
                        <small style={{ fontSize: "11px", opacity: 0.9 }}>
                          {todayStats.totalBlogs} Blog
                        </small>
                      </motion.div>
                    )}

                    {/* Hide gallery count for farmers */}
                    {currentUser.role_id !== 3 && (
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="text-center"
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          backdropFilter: "blur(10px)",
                        }}
                      >
                        <div style={{ fontSize: "20px" }}>📸</div>
                        <small style={{ fontSize: "11px", opacity: 0.9 }}>
                          {todayStats.totalGalleries} Gallery
                        </small>
                      </motion.div>
                    )}

                    {/* Show supervisor and admin counts only for non-farmers */}
                    {currentUser.role_id !== 3 && (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="text-center"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "12px",
                            padding: "8px 12px",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <div style={{ fontSize: "20px" }}>👨‍💼</div>
                          <small style={{ fontSize: "11px", opacity: 0.9 }}>
                            {dashboardStats.totalSupervisors} Supervisor
                          </small>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="text-center"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "12px",
                            padding: "8px 12px",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <div style={{ fontSize: "20px" }}>👨‍💻</div>
                          <small style={{ fontSize: "11px", opacity: 0.9 }}>
                            {dashboardStats.totalAdmins} Admin
                          </small>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="text-center"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            borderRadius: "12px",
                            padding: "8px 12px",
                            backdropFilter: "blur(10px)",
                          }}
                        >
                          <div style={{ fontSize: "20px" }}>👩‍🌾</div>
                          <small style={{ fontSize: "11px", opacity: 0.9 }}>
                            {dashboardStats.totalFarmers} Farmer
                          </small>
                        </motion.div>
                      </>
                    )}
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </motion.div>
      {/* Charts Section */}
      <Row>
        {currentUser?.role_id === 1 ? (
          // Admin Dashboard - Show Recent Data Overview
          <>
            <Col lg={6} className="mb-4">
              <Card style={styles.card}>
                <Card.Header className="bg-white border-bottom-0 pb-0">
                  <h5 style={styles.heading}>
                    <i className="fas fa-chart-bar me-2"></i>
                    System Statistics
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    Summary of overall system data
                  </p>
                </Card.Header>
                <Card.Body>
                  <Row className="g-3">
                    <Col md={6}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(33, 150, 243, 0.2)",
                        }}
                      >
                        <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                          🐄
                        </div>
                        <h4 style={{ color: "#1565c0", fontWeight: "bold" }}>
                          {dashboardStats.totalCows}
                        </h4>
                        <small style={{ color: "#1565c0", opacity: 0.8 }}>
                          Total Sapi
                        </small>
                      </motion.div>
                    </Col>
                    <Col md={6}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(76, 175, 80, 0.2)",
                        }}
                      >
                        <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                          👩‍🌾
                        </div>
                        <h4 style={{ color: "#2e7d32", fontWeight: "bold" }}>
                          {dashboardStats.totalFarmers}
                        </h4>
                        <small style={{ color: "#2e7d32", opacity: 0.8 }}>
                          Total Farmer
                        </small>
                      </motion.div>
                    </Col>
                    <Col md={6}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(156, 39, 176, 0.2)",
                        }}
                      >
                        <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                          🧑‍💼
                        </div>
                        <h4 style={{ color: "#7b1fa2", fontWeight: "bold" }}>
                          {dashboardStats.totalSupervisors}
                        </h4>
                        <small style={{ color: "#7b1fa2", opacity: 0.8 }}>
                          Total Supervisor
                        </small>
                      </motion.div>
                    </Col>
                    <Col md={6}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="text-center p-3"
                        style={{
                          background:
                            "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
                          borderRadius: "12px",
                          border: "1px solid rgba(255, 152, 0, 0.2)",
                        }}
                      >
                        <div style={{ fontSize: "32px", marginBottom: "10px" }}>
                          👤
                        </div>
                        <h4 style={{ color: "#ef6c00", fontWeight: "bold" }}>
                          {dashboardStats.totalAdmins}
                        </h4>
                        <small style={{ color: "#ef6c00", opacity: 0.8 }}>
                          Total Admin
                        </small>
                      </motion.div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card style={styles.card}>
                <Card.Header className="bg-white border-bottom-0 pb-0">
                  <h5 style={styles.heading}>
                    <i className="fas fa-chart-pie me-2"></i>
                    Distribution Lactation Phases
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    Composition of lactation phase of cows on farms{" "}
                  </p>
                </Card.Header>
                <Card.Body>
                  {lactationDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={lactationDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {lactationDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-5">
                      <i
                        className="fas fa-cow text-muted"
                        style={{ fontSize: "48px" }}
                      ></i>
                      <p className="text-muted mt-3">
                        There is no data on cattle yet
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </>
        ) : currentUser?.role_id === 2 ? (
          // Supervisor Dashboard - Show Map & Location and Lactation Distribution
          <>
            <Col lg={8} className="mb-4">
              <Card style={styles.card}>
                <Card.Header className="bg-white border-bottom-0 pb-0">
                  <h5 style={styles.heading}>
                    <i className="fas fa-map-marked-alt me-2"></i>
                    DairyTrack Farm Location
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    Find our farm locations for supervision visits
                  </p>
                </Card.Header>
                <Card.Body>
                  <motion.div
                    className="map-container mb-4"
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <iframe
                      src="https://maps.google.com/maps?width=600&height=350&hl=en&q=Taman%20Sains%20Teknologi%20Herbal%20dan%20Hortikultura%20(TSTH2)&t=p&z=6&ie=UTF8&iwloc=B&output=embed"
                      title="Lokasi DairyTrack - Taman Sains Teknologi Herbal dan Hortikultura"
                      style={{
                        width: "100%",
                        height: "280px",
                        border: "none",
                        borderRadius: "8px",
                      }}
                      loading="lazy"
                      frameBorder="0"
                      allowFullScreen=""
                    ></iframe>
                  </motion.div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} className="mb-4">
              <Card style={styles.card}>
                <Card.Header className="bg-white border-bottom-0 pb-0">
                  <h5 style={styles.heading}>
                    <i className="fas fa-chart-pie me-2"></i>
                    Distribution of Lactation Phases
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    Lactation phase composition of cows across farms
                  </p>
                </Card.Header>
                <Card.Body>
                  {lactationDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={lactationDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {lactationDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-5">
                      <i
                        className="fas fa-cow text-muted"
                        style={{ fontSize: "48px" }}
                      ></i>
                      <p className="text-muted mt-3">
                        There is no data on cattle yet
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </>
        ) : (
          // Farmer Dashboard - Show Trend Production and Lactation Distribution
          <>
            <Col lg={8} className="mb-4">
              <Card style={styles.card}>
                <Card.Header className="bg-white border-bottom-0 pb-0">
                  <h5 style={styles.heading}>
                    <i className="fas fa-chart-area me-2"></i>
                    Milk Production Analysis (Last 7 Days){" "}
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    The area graph displays the trend of total daily milk
                    production from the cows you manage.
                  </p>
                </Card.Header>
                <Card.Body>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={milkProductionTrend}>
                      <defs>
                        <linearGradient
                          id="colorVolume"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3D90D7"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3D90D7"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: "#e0e6ed" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: "#e0e6ed" }}
                        label={{
                          value: "Volume (L)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e0e6ed",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                        }}
                        formatter={(value, name) => [
                          `${value}L`,
                          name === "volume" ? "Total Production" : name,
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="volume"
                        stroke="#3D90D7"
                        fill="url(#colorVolume)"
                        strokeWidth={3}
                        activeDot={{ r: 6, stroke: "#3D90D7", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4} className="mb-4">
              <Card style={styles.card}>
                <Card.Header className="bg-white border-bottom-0 pb-0">
                  <h5 style={styles.heading}>
                    <i className="fas fa-chart-pie me-2"></i>
                    Lactation Phase Distribution
                  </h5>
                  <p style={styles.subheading} className="mb-0">
                    The composition of the lactation phase of the cows you
                    manage{" "}
                  </p>
                </Card.Header>
                <Card.Body>
                  {lactationDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={lactationDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {lactationDistribution.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-5">
                      <i
                        className="fas fa-cow text-muted"
                        style={{ fontSize: "48px" }}
                      ></i>
                      <p className="text-muted mt-3">
                        There is no data on cattle yet
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </>
        )}
      </Row>
      {((currentUser.role_id === 3 && userManagedCows.length > 0) ||
        (currentUser.role_id !== 3 && allUsersWithCows.length > 0)) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <div
            style={{
              ...styles.floatingContainer,
              minHeight: "auto",
              background: "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
            }}
          >
            <h5 style={styles.heading} className="mb-3">
              <i className="fas fa-list me-2"></i>
              {currentUser.role_id === 3
                ? "The Cows You Manage & Milk Production"
                : "All Cows in Farm & Milk Production"}
            </h5>

            <div className="row g-3">
              {(() => {
                // Process data to avoid duplicates
                let processedCows = [];

                if (currentUser.role_id === 3) {
                  // For farmers - use userManagedCows directly
                  processedCows = userManagedCows;
                } else {
                  // For admin/supervisor - create unique list to avoid duplicates
                  const uniqueCowsMap = new Map();

                  allUsersWithCows.forEach((farmer) => {
                    (farmer.cows || []).forEach((cow) => {
                      // Use cow.id as unique identifier
                      if (!uniqueCowsMap.has(cow.id)) {
                        uniqueCowsMap.set(cow.id, {
                          ...cow,
                          farmerName: farmer.name || farmer.username,
                          farmerId: farmer.id,
                        });
                      }
                    });
                  });

                  processedCows = Array.from(uniqueCowsMap.values());
                }

                return processedCows.map((cow, index) => {
                  // Create truly unique key
                  const uniqueKey =
                    currentUser.role_id === 3
                      ? `farmer-cow-${cow.id}`
                      : `admin-cow-${cow.id}-farmer-${
                          cow.farmerId || "unassigned"
                        }`;

                  const production =
                    currentUser.role_id === 3
                      ? cowMilkProduction[cow.id] || {
                          totalVolume: 0,
                          sessionsCount: 0,
                          avgPerSession: 0,
                          todayVolume: 0,
                        }
                      : // Calculate production for all cows (admin/supervisor view)
                        (() => {
                          const cowSessions = milkingSessions.filter(
                            (session) => session.cow_id === cow.id
                          );
                          const today = getLocalDateString();
                          const todaySessions = cowSessions.filter(
                            (session) =>
                              getSessionLocalDate(session.milking_time) ===
                              today
                          );

                          const totalVolume = cowSessions.reduce(
                            (sum, session) =>
                              sum + parseFloat(session.volume || 0),
                            0
                          );
                          const todayVolume = todaySessions.reduce(
                            (sum, session) =>
                              sum + parseFloat(session.volume || 0),
                            0
                          );
                          const avgPerSession =
                            cowSessions.length > 0
                              ? totalVolume / cowSessions.length
                              : 0;

                          return {
                            totalVolume,
                            sessionsCount: cowSessions.length,
                            avgPerSession,
                            todayVolume,
                          };
                        })();

                  return (
                    <div key={uniqueKey} className="col-md-6 col-lg-4">
                      <motion.div
                        className="floating-item"
                        style={{
                          position: "relative",
                          background:
                            "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                          borderRadius: "12px",
                          padding: "15px",
                          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.9)",
                          animationDelay: `${index * 0.2}s`,
                        }}
                        whileHover={{
                          scale: 1.03,
                          y: -5,
                          boxShadow: "0 12px 30px rgba(0, 0, 0, 0.12)",
                        }}
                      >
                        <div className="d-flex align-items-start">
                          <div className="me-3" style={{ fontSize: "24px" }}>
                            {/* Gender-specific emoji */}
                            {cow.gender?.toLowerCase() === "female" ||
                            cow.gender?.toLowerCase() === "female"
                              ? "🐄"
                              : "🐂"}
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-1">{cow.name}</h6>

                            {/* Show farmer name for admin/supervisor */}
                            {currentUser.role_id !== 3 && cow.farmerName && (
                              <div className="mb-2">
                                <Badge
                                  bg="outline-primary"
                                  text="dark"
                                  style={{ fontSize: "10px" }}
                                >
                                  <i className="fas fa-user me-1"></i>
                                  Farmer: {cow.farmerName}
                                </Badge>
                              </div>
                            )}

                            {/* Cow Basic Info */}
                            <div className="d-flex flex-wrap gap-1 mb-2">
                              <Badge
                                bg="outline-primary"
                                text="dark"
                                style={{ fontSize: "10px" }}
                              >
                                ID: {cow.id}
                              </Badge>
                              <Badge
                                bg="outline-secondary"
                                text="dark"
                                style={{ fontSize: "10px" }}
                              >
                                {cow.breed}
                              </Badge>
                              <Badge
                                bg={
                                  cow.gender?.toLowerCase() === "female" ||
                                  cow.gender?.toLowerCase() === "female"
                                    ? "outline-info"
                                    : "outline-warning"
                                }
                                text="dark"
                                style={{ fontSize: "10px" }}
                              >
                                {cow.gender?.toLowerCase() === "female" ||
                                cow.gender?.toLowerCase() === "female"
                                  ? "♀ female"
                                  : "♂ Male"}
                              </Badge>
                              <motion.div whileHover={{ scale: 1.05 }}>
                                <Badge
                                  bg="outline-success"
                                  text="dark"
                                  style={{
                                    fontSize: "10px",
                                    transition: "all 0.2s ease",
                                    cursor: "pointer",
                                  }}
                                  title={
                                    cow.birth
                                      ? `Lahir: ${new Date(
                                          cow.birth
                                        ).toLocaleDateString("id-ID")}`
                                      : "Tanggal lahir tidak tersedia"
                                  }
                                >
                                  <i
                                    className="fas fa-birthday-cake me-1"
                                    style={{ fontSize: "8px" }}
                                  ></i>
                                  {formatAge(cow.birth)}
                                </Badge>
                              </motion.div>
                            </div>

                            {/* Conditional Content Based on Gender */}
                            {cow.gender?.toLowerCase() === "female" ||
                            cow.gender?.toLowerCase() === "female" ? (
                              // Female Cow - Show Production Statistics
                              <>
                                {/* Production Statistics */}
                                <div className="mb-2">
                                  <div className="row g-1">
                                    <div className="col-6">
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)",
                                          borderRadius: "8px",
                                          border:
                                            "1px solid rgba(76, 175, 80, 0.2)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            color: "#2e7d32",
                                          }}
                                        >
                                          {production.totalVolume.toFixed(1)}L
                                        </div>
                                        <small
                                          style={{
                                            fontSize: "9px",
                                            color: "#2e7d32",
                                            opacity: 0.8,
                                          }}
                                        >
                                          Total Production
                                        </small>
                                      </motion.div>
                                    </div>
                                    <div className="col-6">
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                          borderRadius: "8px",
                                          border:
                                            "1px solid rgba(33, 150, 243, 0.2)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            color: "#1565c0",
                                          }}
                                        >
                                          {production.todayVolume.toFixed(1)}L
                                        </div>
                                        <small
                                          style={{
                                            fontSize: "9px",
                                            color: "#1565c0",
                                            opacity: 0.8,
                                          }}
                                        >
                                          Hari Ini
                                        </small>
                                      </motion.div>
                                    </div>
                                  </div>

                                  <div className="row g-1 mt-1">
                                    <div className="col-6">
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)",
                                          borderRadius: "8px",
                                          border:
                                            "1px solid rgba(255, 152, 0, 0.2)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            color: "#ef6c00",
                                          }}
                                        >
                                          {production.avgPerSession.toFixed(1)}L
                                        </div>
                                        <small
                                          style={{
                                            fontSize: "9px",
                                            color: "#ef6c00",
                                            opacity: 0.8,
                                          }}
                                        >
                                          Rata-rata/Sesi
                                        </small>
                                      </motion.div>
                                    </div>
                                    <div className="col-6">
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%)",
                                          borderRadius: "8px",
                                          border:
                                            "1px solid rgba(233, 30, 99, 0.2)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            color: "#c2185b",
                                          }}
                                        >
                                          {production.sessionsCount}
                                        </div>
                                        <small
                                          style={{
                                            fontSize: "9px",
                                            color: "#c2185b",
                                            opacity: 0.8,
                                          }}
                                        >
                                          Total Session
                                        </small>
                                      </motion.div>
                                    </div>
                                  </div>
                                </div>

                                {/* Lactation Phase and Weight for Female */}
                                <div className="d-flex justify-content-between align-items-center">
                                  <Badge
                                    bg={
                                      cow.lactation_phase === "Early"
                                        ? "success"
                                        : cow.lactation_phase === "Mid"
                                        ? "warning"
                                        : cow.lactation_phase === "Late"
                                        ? "danger"
                                        : "secondary"
                                    }
                                    style={{ fontSize: "9px" }}
                                  >
                                    {cow.lactation_phase || "N/A"}
                                  </Badge>
                                  <small className="text-muted">
                                    {cow.weight ? `${cow.weight} kg` : "N/A"}
                                  </small>
                                </div>

                                {/* Performance Indicator for Female */}
                                <div className="mt-2">
                                  <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                      background:
                                        production.avgPerSession >= 15
                                          ? "linear-gradient(135deg, #4caf50 0%, #81c784 100%)"
                                          : production.avgPerSession >= 10
                                          ? "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)"
                                          : "linear-gradient(135deg, #f44336 0%, #ef5350 100%)",
                                      borderRadius: "12px",
                                      padding: "4px 8px",
                                    }}
                                  >
                                    <motion.span
                                      animate={{ scale: [1, 1.1, 1] }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      }}
                                      style={{
                                        fontSize: "10px",
                                        color: "white",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {production.avgPerSession >= 15
                                        ? "🌟 High Production"
                                        : production.avgPerSession >= 10
                                        ? "⚡ Medium Production"
                                        : "📈 Need Attention"}
                                    </motion.span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              // Male Cow - Show Non-Production Info
                              <>
                                {/* Male Cow Information */}
                                <div className="mb-2">
                                  <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="text-center p-3"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
                                      borderRadius: "12px",
                                      border:
                                        "1px solid rgba(158, 158, 158, 0.2)",
                                    }}
                                  >
                                    <div
                                      style={{
                                        fontSize: "24px",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      🚫🥛
                                    </div>
                                    <div
                                      style={{
                                        fontSize: "11px",
                                        fontWeight: "bold",
                                        color: "#757575",
                                        marginBottom: "4px",
                                      }}
                                    >
                                      Stud Cows
                                    </div>
                                    <small
                                      style={{
                                        fontSize: "9px",
                                        color: "#757575",
                                        opacity: 0.8,
                                        lineHeight: 1.3,
                                      }}
                                    >
                                      Does not produce milk
                                    </small>
                                  </motion.div>
                                </div>

                                {/* Male Cow Additional Info */}
                                <div className="mb-2">
                                  <div className="row g-1">
                                    <div className="col-6">
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%)",
                                          borderRadius: "8px",
                                          border:
                                            "1px solid rgba(63, 81, 181, 0.2)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            color: "#3f51b5",
                                          }}
                                        >
                                          🐂
                                        </div>
                                        <small
                                          style={{
                                            fontSize: "9px",
                                            color: "#3f51b5",
                                            opacity: 0.8,
                                          }}
                                        >
                                          Breeding Girolando
                                        </small>
                                      </motion.div>
                                    </div>
                                    <div className="col-6">
                                      <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        className="text-center p-2"
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)",
                                          borderRadius: "8px",
                                          border:
                                            "1px solid rgba(156, 39, 176, 0.2)",
                                        }}
                                      >
                                        <div
                                          style={{
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                            color: "#7b1fa2",
                                          }}
                                        >
                                          💪
                                        </div>
                                        <small
                                          style={{
                                            fontSize: "9px",
                                            color: "#7b1fa2",
                                            opacity: 0.8,
                                          }}
                                        >
                                          Strong & Healthy
                                        </small>
                                      </motion.div>
                                    </div>
                                  </div>
                                </div>

                                {/* Weight Info for Male */}
                                <div className="d-flex justify-content-between align-items-center">
                                  <Badge bg="info" style={{ fontSize: "9px" }}>
                                    <i className="fas fa-male me-1"></i>
                                    Stud
                                  </Badge>
                                  <small className="text-muted">
                                    {cow.weight ? `${cow.weight} kg` : "N/A"}
                                  </small>
                                </div>

                                {/* Role Indicator for Male */}
                                <div className="mt-2">
                                  <div
                                    className="d-flex align-items-center justify-content-center"
                                    style={{
                                      background:
                                        "linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)",
                                      borderRadius: "12px",
                                      padding: "4px 8px",
                                    }}
                                  >
                                    <motion.span
                                      animate={{ scale: [1, 1.05, 1] }}
                                      transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                      }}
                                      style={{
                                        fontSize: "10px",
                                        color: "white",
                                        fontWeight: "bold",
                                      }}
                                    >
                                      🐂 Stud
                                    </motion.span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
