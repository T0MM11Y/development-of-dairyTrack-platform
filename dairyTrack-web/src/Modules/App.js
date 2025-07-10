import React, {
  useLayoutEffect,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  useLocation,
  useHistory,
} from "react-router-dom";
import { logout } from "./controllers/authController";
import "./styles/App.css";

// UI Components
import Header from "./components/Header";
import Footer from "./components/Footer";
import AdminLayout from "./layouts/AdminLayout";
import { SocketProvider } from "../socket/socket";

// Public Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Blog";
import Blog from "./pages/Blog";
import Gallery from "./pages/Gallery";
import Product from "./pages/Product";
import Order from "./pages/Order";

// Admin Dashboard
import Admin from "./pages/Admin/Dashboard";

// User Management
import ListUsers from "./pages/Admin/UsersManagement/ListUsers";
import CreateUsers from "./pages/Admin/UsersManagement/CreateUsers";
import EditUser from "./pages/Admin/UsersManagement/EditUsers";
import ResetPassword from "./pages/Admin/UsersManagement/ResetPassword";

// Cattle Management
import CattleDistribution from "./pages/Admin/CattleDistribution";
import ListCows from "./pages/Admin/CowManagement/ListCows";
import CreateCows from "./pages/Admin/CowManagement/CreateCows";
import EditCow from "./pages/Admin/CowManagement/EditCows";

// Highlights Management
import ListOfGallery from "./pages/Admin/HighlightsManagement/Gallery/ListOfGallery";
import ListOfBlog from "./pages/Admin/HighlightsManagement/Blog/ListOfBlog";

// Milk Production
import ListMilking from "./pages/Admin/MilkProduction/ListMilking";
import CowsMilkAnalysis from "./pages/Admin/MilkProduction/Analythics/CowsMilkAnalysis";
import MilkExpiryCheck from "./pages/Admin/MilkProduction/Analythics/MilkExpiryCheck";

// Health Management
import ListHealthChecks from "./pages/Admin/HealthCheckManagement/HealthCheck/ListHealthChecks";
import CreateHealthCheck from "./pages/Admin/HealthCheckManagement/HealthCheck/CreateHealthCheck";
import EditHealthCheck from "./pages/Admin/HealthCheckManagement/HealthCheck/EditHealthCheck";
import ListSymptoms from "./pages/Admin/HealthCheckManagement/Symptom/ListSymptoms";
import CreateSymptom from "./pages/Admin/HealthCheckManagement/Symptom/CreateSymptom";
import EditSymptom from "./pages/Admin/HealthCheckManagement/Symptom/EditSymptom";
import ListDiseaseHistory from "./pages/Admin/HealthCheckManagement/DiseaseHistory/ListDiseaseHistory";
import CreateDiseaseHistory from "./pages/Admin/HealthCheckManagement/DiseaseHistory/CreateDiseaseHistory";
import EditDiseaseHistory from "./pages/Admin/HealthCheckManagement/DiseaseHistory/EditDiseaseHistory";
import ListReproduction from "./pages/Admin/HealthCheckManagement/Reproduction/ListReproduction";
import CreateReproduction from "./pages/Admin/HealthCheckManagement/Reproduction/CreateReproduction";
import EditReproduction from "./pages/Admin/HealthCheckManagement/Reproduction/EditReproduction";
import HealthDashboard from "./pages/Admin/HealthCheckManagement/HealthDashboard/Dashboard";

// Feed Management
import ListFeedTypes from "./pages/Admin/FeedManagement/FeedType/ListFeedType";
import EditFeedTypes from "./pages/Admin/FeedManagement/FeedType/EditFeedType";
import ListNutrition from "./pages/Admin/FeedManagement/Nutrition/ListNutrition";
import ListFeed from "./pages/Admin/FeedManagement/Feed/ListFeed";
import EditFeed from "./pages/Admin/FeedManagement/Feed/EditFeed";
import ListStock from "./pages/Admin/FeedManagement/FeedStock/FeedStockList";
import ListDailyFeedSchedule from "./pages/Admin/FeedManagement/DailyFeedSchedule/ListDailyFeedSchedule";
import ListDailyFeedItem from "./pages/Admin/FeedManagement/DailyFeedItem/ListDailyFeedItem";
import DailyFeedUsage from "./pages/Admin/FeedManagement/Grafik/DailyFeedUsage";
import DailyNutrition from "./pages/Admin/FeedManagement/Grafik/DailyNutrition";

// Sales & Financial
import ProductType from "./pages/Admin/ProductType/listProductType";
import ProductStock from "./pages/Admin/Product/ListProductStock";
import ProductHistory from "./pages/Admin/ProductHistory/ListProductHistory";
import SalesOrder from "./pages/Admin/Order/ListOrder";
import SalesTransaction from "./pages/Admin/SalesTransaction/ListSalesTransaction";
import Finance from "./pages/Admin/Finance/Finance";
import FinanceRecord from "./pages/Admin/Finance/FinanceRecords";

// Role-based route mapping
const ROLE_ROUTE_MAP = {
  1: "admin", // Admin
  2: "supervisor", // Supervisor
  3: "farmer", // Farmer
};

// Role-based feature access control
const ROLE_PERMISSIONS = {
  1: {
    // Admin - Full access
    userManagement: true,
    cattleManagement: true,
    highlightsManagement: true,
    milkProduction: true,
    healthManagement: true,
    feedManagement: true,
    salesFinancial: true,
  },
  2: {
    // Supervisor - Limited admin access
    userManagement: false,
    cattleManagement: true,
    highlightsManagement: true,
    milkProduction: true,
    healthManagement: true,
    feedManagement: true,
    salesFinancial: true,
  },
  3: {
    // Farmer - Operational access only
    userManagement: false,
    cattleManagement: false,
    highlightsManagement: false,
    milkProduction: true,
    healthManagement: true,
    feedManagement: true,
    salesFinancial: false,
  },
};

// Valid routes for validation
const VALID_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/blog",
  "/gallery",
  "/products",
  "/orders",
  // Role-based dashboard routes
  "/admin",
  "/admin/*",
  "/supervisor",
  "/supervisor/*",
  "/farmer",
  "/farmer/*",
];
/**
 * Fungsi untuk mengubah waktu UTC ISO string ke waktu lokal Asia/Jakarta (WIB)
 * @param {string} utcString - ISO string dari backend, contoh: "2025-07-01T16:04:28.775928Z"
 * @returns {string} - Waktu lokal dalam format string, contoh: "2025-07-01 23:04:28"
 */
function toJakartaTimeString(utcString) {
  if (!utcString) return "";
  const date = new Date(utcString);
  // Format: YYYY-MM-DD HH:mm:ss
  return date
    .toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\./g, ":")
    .replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$3-$2-$1");
}

// Global state untuk user data
let globalCurrentUser = null;
const userInitializedRef = { current: false };

// Contoh penggunaan di pengecekan expired/log:
const isTokenExpired = () => {
  try {
    const userData = getNormalizedUserData();
    const expiredUtc = userData?.token_expires_at;
    const expiredJakarta = toJakartaTimeString(expiredUtc);
    const now = new Date();
    const nowJakarta = toJakartaTimeString(now.toISOString());
    console.log(
      "Token expired check (UTC):",
      expiredUtc,
      "| (Jakarta):",
      expiredJakarta,
      "| Now (UTC):",
      now.toISOString(),
      "| Now (Jakarta):",
      nowJakarta
    );
    if (!expiredUtc) return false;
    const expiresAt = new Date(expiredUtc);
    return now > expiresAt;
  } catch (e) {
    return false;
  }
};

// Fungsi paksa logout
const forceLogout = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      if (userData?.token && userData?.user_id) {
        try {
          await logout(userData.token, userData.user_id);
        } catch (e) {}
      }
    }
  } catch (e) {
    // Abaikan error parsing
  }
  // Hapus localStorage dan redirect
  localStorage.removeItem("user");
  globalCurrentUser = null;
  userInitializedRef.current = false;
  window.location.href = "/";
};

// Komponen pengecekan token expired global (idle-based)
const TokenExpiryChecker = () => {
  const idleTimeout = 30000; // 30 detik tanpa aktivitas
  const idleTimerRef = useRef(null);

  // Fungsi untuk cek expired
  const checkAndLogout = useCallback(() => {
    if (isTokenExpired()) {
      console.log("Token expired, force logout!");
      forceLogout();
    }
  }, []);

  // Reset timer setiap ada aktivitas
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(checkAndLogout, idleTimeout);
  }, [checkAndLogout]);

  useEffect(() => {
    // Daftar event yang dianggap aktivitas user
    const events = [
      "mousemove",
      "keydown",
      "mousedown",
      "touchstart",
      "scroll",
    ];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    // Set timer pertama kali
    resetIdleTimer();

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [resetIdleTimer]);

  return null;
};
// Function to get normalized user data
const getNormalizedUserData = () => {
  if (globalCurrentUser) {
    return globalCurrentUser;
  }

  try {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (!userData.user_id && !userData.id) {
      return null;
    }

    const normalizedUser = {
      ...userData,
      user_id: userData.user_id || userData.id,
    };

    globalCurrentUser = normalizedUser;
    return normalizedUser;
  } catch (error) {
    console.error("Error getting normalized user data:", error);
    return null;
  }
};

// Function to get user role from normalized data
const getUserRole = () => {
  const userData = getNormalizedUserData();
  return userData?.role_id || null;
};

// Function to get role prefix based on role_id
const getRolePrefix = (roleId) => {
  switch (roleId) {
    case 1:
      return "admin";
    case 2:
      return "supervisor";
    case 3:
      return "farmer";
    default:
      return "";
  }
};

// Function to check if user has permission for a feature
const hasPermission = (feature) => {
  const userRole = getUserRole();
  if (!userRole || !ROLE_PERMISSIONS[userRole]) return false;
  return ROLE_PERMISSIONS[userRole][feature];
};

// Updated route validation
const isValidRoute = (path) => {
  const userRole = getUserRole();
  const rolePrefix = getRolePrefix(userRole);

  // Check if path matches user's role
  if (path.startsWith("/admin") && rolePrefix !== "admin") return false;
  if (path.startsWith("/supervisor") && rolePrefix !== "supervisor")
    return false;
  if (path.startsWith("/farmer") && rolePrefix !== "farmer") return false;

  // Check exact matches
  if (VALID_ROUTES.includes(path)) return true;

  // Check role-based paths
  if (rolePrefix && path.startsWith(`/${rolePrefix}/`)) {
    return true;
  }

  // Check dynamic routes
  return VALID_ROUTES.some((route) => {
    if (route.includes(":") || route.includes("*")) {
      const routeParts = route.split("/");
      const pathParts = path.split("/");

      return routeParts.every((part, index) => {
        if (part === "*") return true;
        if (part.startsWith(":")) return true;
        return part === pathParts[index];
      });
    }
    return false;
  });
};

// Authentication Service - Updated to use normalized data
const authService = {
  isAuthenticated: () => {
    try {
      const userData = getNormalizedUserData();
      return !!(userData?.token && userData?.user_id);
    } catch (error) {
      console.error("Auth check error:", error);
      return false;
    }
  },

  getUserData: () => {
    return getNormalizedUserData();
  },

  clearUserData: () => {
    localStorage.removeItem("user");
    globalCurrentUser = null;
    userInitializedRef.current = false;
  },
};

// Enhanced Invalid URL Handler Component
const InvalidUrlHandler = () => {
  const userRole = getUserRole();
  const rolePrefix = getRolePrefix(userRole);

  // Tentukan dashboardPath sesuai role user
  let dashboardPath = "/";
  if (rolePrefix) {
    dashboardPath = `/${rolePrefix}`;
  }

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          padding: "40px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <h2 style={{ color: "#d32f2f", marginBottom: "16px" }}>
          404 - Halaman Tidak Ditemukan
        </h2>
        <p style={{ color: "#666", marginBottom: "24px", lineHeight: "1.5" }}>
          URL yang Anda akses tidak valid atau tidak tersedia untuk role Anda.
        </p>
        <p style={{ color: "#888", fontSize: "14px", marginBottom: "32px" }}>
          Role Anda: <strong>{rolePrefix || "Guest"}</strong>
        </p>
        <button
          style={{
            padding: "12px 32px",
            fontSize: "16px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            transition: "background-color 0.3s",
            fontWeight: "500",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1565c0")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#1976d2")}
          onClick={() => {
            console.log(`Redirecting to dashboard: ${dashboardPath}`);
            window.location.href = dashboardPath;
          }}
        >
          {rolePrefix
            ? `Kembali ke Dashboard ${
                rolePrefix.charAt(0).toUpperCase() + rolePrefix.slice(1)
              }`
            : "Kembali ke Beranda"}
        </button>
      </div>
    </div>
  );
};

// User Initializer Component
const UserInitializer = () => {
  const initializedRef = useRef(false);

  // Initialize user - ONE TIME ONLY
  useEffect(() => {
    if (!initializedRef.current) {
      // Pengecekan user data
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.user_id && !userData.id) {
        // Redirect to login if no user data found
        console.log("No user data found - App.js initialization");
        return;
      }

      const normalizedUser = {
        ...userData,
        user_id: userData.user_id || userData.id,
      };

      // Role-based URL validation
      const currentPath = window.location.pathname.toLowerCase();
      const userRole = normalizedUser.role_id;

      // Check if URL contains role-specific paths that don't match user's role
      if (currentPath.includes("/admin") && userRole !== 1) {
        // User is not admin but trying to access admin routes
        console.log(
          "Unauthorized access to admin routes - logging out and redirecting"
        );
        // Auto logout
        authService.clearUserData();
        logout();
        window.location.href = "/";
        return;
      }

      if (currentPath.includes("/supervisor") && userRole !== 2) {
        // User is not supervisor but trying to access supervisor routes
        console.log(
          "Unauthorized access to supervisor routes - logging out and redirecting"
        );
        // Auto logout
        authService.clearUserData();
        logout();
        window.location.href = "/";
        return;
      }

      if (currentPath.includes("/farmer") && userRole !== 3) {
        // User is not farmer but trying to access farmer routes
        console.log(
          "Unauthorized access to farmer routes - logging out and redirecting"
        );
        // Auto logout
        authService.clearUserData();
        logout();
        window.location.href = "/";
        return;
      }

      // Additional check for dashboard routes based on role
      if (currentPath.includes("/dashboard")) {
        const allowedRoles = [1, 2, 3]; // Admin, Supervisor, Farmer
        if (!allowedRoles.includes(userRole)) {
          console.log(
            "Unauthorized access to dashboard - logging out and redirecting"
          );
          // Auto logout
          authService.clearUserData();
          logout();
          window.location.href = "/";
          return;
        }
      }

      // Set global user data
      globalCurrentUser = normalizedUser;
      console.log(
        "App component initialized with user:",
        normalizedUser,
        "Current path:",
        currentPath
      );

      initializedRef.current = true;
    }
  }, []);

  return null;
};

// Enhanced Protected Route Component
const ProtectedRoute = ({ children, roles = [], ...rest }) => {
  const isAuthenticated = authService.isAuthenticated();

  // Role-based access control (if needed)
  const hasRequiredRole = (userRoles, requiredRoles) => {
    if (!requiredRoles.length) return true;
    return requiredRoles.some((role) => userRoles?.includes(role));
  };

  return (
    <Route
      {...rest}
      render={({ location }) => {
        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: "/",
                state: {
                  from: location,
                  message: "Please log in to access this area.",
                },
              }}
            />
          );
        }

        // Additional role checking can be implemented here
        const userData = authService.getUserData();
        if (roles.length && !hasRequiredRole(userData?.roles, roles)) {
          return (
            <Redirect
              to={{
                pathname: "/admin",
                state: {
                  message: "You don't have permission to access this page.",
                },
              }}
            />
          );
        }

        return children;
      }}
    />
  );
};

// Public Route Component (for pages that should not be accessible when logged in)
const PublicRoute = ({ children, restricted = false, ...rest }) => {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Route
      {...rest}
      render={() => {
        if (restricted && isAuthenticated) {
          return <Redirect to="/admin" />;
        }
        return children;
      }}
    />
  );
};

// Role-Based Route Configuration
const RouteConfig = () => {
  const userRole = getUserRole();

  return (
    <Switch>
      {/* Public Routes */}
      <PublicRoute path="/" exact>
        <Header />
        <Home />
        <Footer />
      </PublicRoute>

      <PublicRoute path="/about">
        <Header />
        <About />
        <Footer />
      </PublicRoute>

      <PublicRoute path="/contact">
        <Header />
        <Contact />
        <Footer />
      </PublicRoute>

      <PublicRoute path="/blog">
        <Header />
        <Blog />
        <Footer />
      </PublicRoute>

      <PublicRoute path="/gallery">
        <Header />
        <Gallery />
        <Footer />
      </PublicRoute>

      <PublicRoute path="/products">
        <Header />
        <Product />
        <Footer />
      </PublicRoute>

      <PublicRoute path="/orders">
        <Header />
        <Order />
        <Footer />
      </PublicRoute>

      {/* ADMIN ROUTES - Role ID: 1 */}
      {userRole === 1 && (
        <>
          <ProtectedRoute path="/admin" exact>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </ProtectedRoute>

          {/* User Management - Admin Only */}
          <ProtectedRoute path="/admin/list-users">
            <AdminLayout>
              <ListUsers />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/add-users">
            <AdminLayout>
              <CreateUsers />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-user/:userId">
            <AdminLayout>
              <EditUser />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/reset-password">
            <AdminLayout>
              <ResetPassword />
            </AdminLayout>
          </ProtectedRoute>

          {/* Cattle Management */}
          <ProtectedRoute path="/admin/cattle-distribution">
            <AdminLayout>
              <CattleDistribution />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-cows">
            <AdminLayout>
              <ListCows />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/add-cow">
            <AdminLayout>
              <CreateCows />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-cow/:cowId">
            <AdminLayout>
              <EditCow />
            </AdminLayout>
          </ProtectedRoute>

          {/* Highlights Management */}
          <ProtectedRoute path="/admin/list-of-gallery">
            <AdminLayout>
              <ListOfGallery />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-of-blog">
            <AdminLayout>
              <ListOfBlog />
            </AdminLayout>
          </ProtectedRoute>

          {/* Milk Production */}
          <ProtectedRoute path="/admin/list-milking">
            <AdminLayout>
              <ListMilking />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/cows-milk-analytics">
            <AdminLayout>
              <CowsMilkAnalysis />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/milk-expiry-check">
            <AdminLayout>
              <MilkExpiryCheck />
            </AdminLayout>
          </ProtectedRoute>

          {/* Health Management */}
          <ProtectedRoute path="/admin/list-health-checks">
            <AdminLayout>
              <ListHealthChecks />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/add-health-check">
            <AdminLayout>
              <CreateHealthCheck />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-health-check/:id">
            <AdminLayout>
              <EditHealthCheck />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-symptoms">
            <AdminLayout>
              <ListSymptoms />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/add-symptom">
            <AdminLayout>
              <CreateSymptom />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-symptom/:id">
            <AdminLayout>
              <EditSymptom />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-disease-history">
            <AdminLayout>
              <ListDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/add-disease-history">
            <AdminLayout>
              <CreateDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-disease-history/:id">
            <AdminLayout>
              <EditDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-reproduction">
            <AdminLayout>
              <ListReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/add-reproduction">
            <AdminLayout>
              <CreateReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-reproduction/:id">
            <AdminLayout>
              <EditReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/health-dashboard">
            <AdminLayout>
              <HealthDashboard />
            </AdminLayout>
          </ProtectedRoute>

          {/* Feed Management */}
          <ProtectedRoute path="/admin/list-feedType">
            <AdminLayout>
              <ListFeedTypes />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-feedType/:id">
            <AdminLayout>
              <EditFeedTypes />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-nutrition">
            <AdminLayout>
              <ListNutrition />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-feed">
            <AdminLayout>
              <ListFeed />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/edit-feed/:id">
            <AdminLayout>
              <EditFeed />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-stock">
            <AdminLayout>
              <ListStock />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-schedule">
            <AdminLayout>
              <ListDailyFeedSchedule />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/list-feedItem">
            <AdminLayout>
              <ListDailyFeedItem />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/daily-feed-usage">
            <AdminLayout>
              <DailyFeedUsage />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/daily-nutrition">
            <AdminLayout>
              <DailyNutrition />
            </AdminLayout>
          </ProtectedRoute>

          {/* Sales & Financial */}
          <ProtectedRoute path="/admin/product-type">
            <AdminLayout>
              <ProductType />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/product">
            <AdminLayout>
              <ProductStock />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/product-history">
            <AdminLayout>
              <ProductHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/sales">
            <AdminLayout>
              <SalesOrder />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/finance">
            <AdminLayout>
              <Finance />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/sales-transaction">
            <AdminLayout>
              <SalesTransaction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/admin/finance-record">
            <AdminLayout>
              <FinanceRecord />
            </AdminLayout>
          </ProtectedRoute>
        </>
      )}

      {/* SUPERVISOR ROUTES - Role ID: 2 */}
      {userRole === 2 && (
        <>
          <ProtectedRoute path="/supervisor" exact>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </ProtectedRoute>

          {/* Cattle Management */}
          <ProtectedRoute path="/supervisor/cattle-distribution">
            <AdminLayout>
              <CattleDistribution />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-cows">
            <AdminLayout>
              <ListCows />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/add-cow">
            <AdminLayout>
              <CreateCows />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/edit-cow/:cowId">
            <AdminLayout>
              <EditCow />
            </AdminLayout>
          </ProtectedRoute>

          {/* Highlights Management */}
          <ProtectedRoute path="/supervisor/list-of-gallery">
            <AdminLayout>
              <ListOfGallery />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-of-blog">
            <AdminLayout>
              <ListOfBlog />
            </AdminLayout>
          </ProtectedRoute>

          {/* Milk Production */}
          <ProtectedRoute path="/supervisor/list-milking">
            <AdminLayout>
              <ListMilking />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/cows-milk-analytics">
            <AdminLayout>
              <CowsMilkAnalysis />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/milk-expiry-check">
            <AdminLayout>
              <MilkExpiryCheck />
            </AdminLayout>
          </ProtectedRoute>

          {/* Health Management */}
          <ProtectedRoute path="/supervisor/list-health-checks">
            <AdminLayout>
              <ListHealthChecks />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/add-health-check">
            <AdminLayout>
              <CreateHealthCheck />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/edit-health-check/:id">
            <AdminLayout>
              <EditHealthCheck />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-symptoms">
            <AdminLayout>
              <ListSymptoms />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/add-symptom">
            <AdminLayout>
              <CreateSymptom />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/edit-symptom/:id">
            <AdminLayout>
              <EditSymptom />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-disease-history">
            <AdminLayout>
              <ListDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/add-disease-history">
            <AdminLayout>
              <CreateDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/edit-disease-history/:id">
            <AdminLayout>
              <EditDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-reproduction">
            <AdminLayout>
              <ListReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/add-reproduction">
            <AdminLayout>
              <CreateReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/edit-reproduction/:id">
            <AdminLayout>
              <EditReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/health-dashboard">
            <AdminLayout>
              <HealthDashboard />
            </AdminLayout>
          </ProtectedRoute>

          {/* Feed Management */}
          <ProtectedRoute path="/supervisor/list-feedType">
            <AdminLayout>
              <ListFeedTypes />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/edit-feedType/:id">
            <AdminLayout>
              <EditFeedTypes />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-nutrition">
            <AdminLayout>
              <ListNutrition />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-feed">
            <AdminLayout>
              <ListFeed />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/edit-feed/:id">
            <AdminLayout>
              <EditFeed />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-stock">
            <AdminLayout>
              <ListStock />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-schedule">
            <AdminLayout>
              <ListDailyFeedSchedule />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/list-feedItem">
            <AdminLayout>
              <ListDailyFeedItem />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/daily-feed-usage">
            <AdminLayout>
              <DailyFeedUsage />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/daily-nutrition">
            <AdminLayout>
              <DailyNutrition />
            </AdminLayout>
          </ProtectedRoute>

          {/* Sales & Financial */}
          <ProtectedRoute path="/supervisor/product-type">
            <AdminLayout>
              <ProductType />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/product">
            <AdminLayout>
              <ProductStock />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/product-history">
            <AdminLayout>
              <ProductHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/sales">
            <AdminLayout>
              <SalesOrder />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/sales-transaction">
            <AdminLayout>
              <SalesTransaction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/finance">
            <AdminLayout>
              <Finance />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/supervisor/finance-record">
            <AdminLayout>
              <FinanceRecord />
            </AdminLayout>
          </ProtectedRoute>
        </>
      )}

      {/* FARMER ROUTES - Role ID: 3 */}
      {userRole === 3 && (
        <>
          <ProtectedRoute path="/farmer" exact>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </ProtectedRoute>

          {/* Cattle Management - View Only */}
          <ProtectedRoute path="/farmer/list-cows">
            <AdminLayout>
              <ListCows />
            </AdminLayout>
          </ProtectedRoute>

          {/* Milk Production */}
          <ProtectedRoute path="/farmer/list-milking">
            <AdminLayout>
              <ListMilking />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/cows-milk-analytics">
            <AdminLayout>
              <CowsMilkAnalysis />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/milk-expiry-check">
            <AdminLayout>
              <MilkExpiryCheck />
            </AdminLayout>
          </ProtectedRoute>

          {/* Health Management */}
          <ProtectedRoute path="/farmer/list-health-checks">
            <AdminLayout>
              <ListHealthChecks />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/add-health-check">
            <AdminLayout>
              <CreateHealthCheck />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/edit-health-check/:id">
            <AdminLayout>
              <EditHealthCheck />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-symptoms">
            <AdminLayout>
              <ListSymptoms />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/add-symptom">
            <AdminLayout>
              <CreateSymptom />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/edit-symptom/:id">
            <AdminLayout>
              <EditSymptom />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-disease-history">
            <AdminLayout>
              <ListDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/add-disease-history">
            <AdminLayout>
              <CreateDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/edit-disease-history/:id">
            <AdminLayout>
              <EditDiseaseHistory />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-reproduction">
            <AdminLayout>
              <ListReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/add-reproduction">
            <AdminLayout>
              <CreateReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/edit-reproduction/:id">
            <AdminLayout>
              <EditReproduction />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/health-dashboard">
            <AdminLayout>
              <HealthDashboard />
            </AdminLayout>
          </ProtectedRoute>

          {/* Feed Management */}
          <ProtectedRoute path="/farmer/list-feedType">
            <AdminLayout>
              <ListFeedTypes />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/edit-feedType/:id">
            <AdminLayout>
              <EditFeedTypes />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-nutrition">
            <AdminLayout>
              <ListNutrition />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-feed">
            <AdminLayout>
              <ListFeed />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/edit-feed/:id">
            <AdminLayout>
              <EditFeed />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-stock">
            <AdminLayout>
              <ListStock />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-schedule">
            <AdminLayout>
              <ListDailyFeedSchedule />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/list-feedItem">
            <AdminLayout>
              <ListDailyFeedItem />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/daily-feed-usage">
            <AdminLayout>
              <DailyFeedUsage />
            </AdminLayout>
          </ProtectedRoute>

          <ProtectedRoute path="/farmer/daily-nutrition">
            <AdminLayout>
              <DailyNutrition />
            </AdminLayout>
          </ProtectedRoute>
        </>
      )}

      {/* Catch-all route for invalid URLs */}
      <Route path="*">
        <InvalidUrlHandler />
      </Route>
    </Switch>
  );
};

function App() {
  const location = useLocation();

  // Daftar path public (tanpa parameter)
  const PUBLIC_PATHS = [
    "/",
    "/about",
    "/contact",
    "/blog",
    "/gallery",
    "/products",
    "/orders",
  ];

  // Cek apakah saat ini di public page
  const isPublicPage = PUBLIC_PATHS.includes(location.pathname);

  return (
    <SocketProvider>
      {/* TokenExpiryChecker hanya untuk halaman non-public */}
      {!isPublicPage && <TokenExpiryChecker />}
      <UserInitializer />
      <div className="App">
        <RouteConfig />
      </div>
    </SocketProvider>
  );
}

// Agar useLocation bisa dipakai di App, wrap dengan Router
function AppWithRouter() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWithRouter;
