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
import Finance from "./pages/Admin/Finance/Finance";
import FinanceRecord from "./pages/Admin/Finance/FinanceRecords";

// URL_DISPLAY_MAP for beautifying URLs
const URL_DISPLAY_MAP = {
  "/about": "/about-us",
  "/contact": "/get-in-touch",
  "/blog": "/insights",
  "/gallery": "/showcase",
  "/products": "/marketplace",
  "/orders": "/my-orders",
  // Dashboard routes mapping (will be prefixed with role)
  "/dashboard": "/dashboard",
  "/list-users": "/dashboard/user-management",
  "/add-users": "/dashboard/create-user",
  "/edit-user": "/dashboard/edit-user",
  "/reset-password": "/dashboard/reset-credentials",
  "/cattle-distribution": "/dashboard/livestock-distribution",
  "/list-cows": "/dashboard/cattle-inventory",
  "/add-cow": "/dashboard/register-cattle",
  "/edit-cow": "/dashboard/update-cattle",
  "/list-of-gallery": "/dashboard/media-gallery",
  "/list-of-blog": "/dashboard/content-management",
  "/list-milking": "/dashboard/milk-production",
  "/cows-milk-analytics": "/dashboard/milk-analytics",
  "/milk-expiry-check": "/dashboard/quality-control",
  "/list-health-checks": "/dashboard/health-monitoring",
  "/add-health-check": "/dashboard/record-health",
  "/edit-health-check": "/dashboard/update-health",
  "/list-symptoms": "/dashboard/symptom-tracker",
  "/add-symptom": "/dashboard/log-symptom",
  "/edit-symptom": "/dashboard/modify-symptom",
  "/list-disease-history": "/dashboard/medical-records",
  "/add-disease-history": "/dashboard/add-medical-record",
  "/edit-disease-history": "/dashboard/update-medical-record",
  "/list-reproduction": "/dashboard/breeding-management",
  "/add-reproduction": "/dashboard/record-breeding",
  "/edit-reproduction": "/dashboard/update-breeding",
  "/health-dashboard": "/dashboard/wellness-overview",
  "/list-feedType": "/dashboard/feed-catalog",
  "/edit-feedType": "/dashboard/modify-feed-type",
  "/list-nutrition": "/dashboard/nutrition-guide",
  "/list-feed": "/dashboard/feed-inventory",
  "/edit-feed": "/dashboard/update-feed",
  "/list-stock": "/dashboard/stock-management",
  "/list-schedule": "/dashboard/feeding-schedule",
  "/list-feedItem": "/dashboard/feed-items",
  "/daily-feed-usage": "/dashboard/consumption-analytics",
  "/daily-nutrition": "/dashboard/nutrition-tracking",
  "/product-type": "/dashboard/product-categories",
  "/product": "/dashboard/inventory-hub",
  "/product-history": "/dashboard/sales-history",
  "/sales": "/dashboard/order-management",
  "/finance": "/dashboard/financial-overview",
  "/finance-record": "/dashboard/transaction-logs",
};

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

// Updated VALID_ROUTES to include role-based paths
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
  ...Object.keys(URL_DISPLAY_MAP),
];

// Utility Functions
const createReverseUrlMap = (urlMap) => {
  const reverseMap = {};
  Object.entries(urlMap).forEach(([key, value]) => {
    reverseMap[value] = key;
  });
  return reverseMap;
};

const REVERSE_URL_DISPLAY_MAP = createReverseUrlMap(URL_DISPLAY_MAP);

// Global state untuk user data
let globalCurrentUser = null;
const userInitializedRef = { current: false };

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

// Updated getDisplayUrl function
const getDisplayUrl = (currentPath) => {
  const userRole = getUserRole();
  const rolePrefix = getRolePrefix(userRole);

  console.log("getDisplayUrl Debug:", {
    currentPath,
    userRole,
    rolePrefix,
  });

  // Handle role-based dashboard routes
  if (currentPath.startsWith(`/${rolePrefix}/`)) {
    // Extract the path without role prefix
    const pathWithoutRole = currentPath.replace(`/${rolePrefix}`, "");

    // Check if it's a mapped route
    if (URL_DISPLAY_MAP[pathWithoutRole]) {
      const displayUrl = URL_DISPLAY_MAP[pathWithoutRole];
      return `/${rolePrefix}${displayUrl}`;
    }

    return currentPath;
  }

  // Handle public routes
  if (URL_DISPLAY_MAP[currentPath]) {
    return URL_DISPLAY_MAP[currentPath];
  }

  return currentPath;
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
  // Return empty page for invalid URLs
  return null;
};

// User Initializer Component - Enhanced to trigger URL update
const UserInitializer = () => {
  const initializedRef = useRef(false);
  const location = useLocation();
  const [userReady, setUserReady] = useState(false);

  // Initialize user - ONE TIME ONLY
  useEffect(() => {
    if (!initializedRef.current) {
      // Pengecekan user data - sama seperti di Notification.js
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      if (!userData.user_id && !userData.id) {
        // Redirect to login if no user data found
        console.log("No user data found - App.js initialization");
        setUserReady(true);
        return;
      }

      const normalizedUser = {
        ...userData,
        user_id: userData.user_id || userData.id,
      };

      // Role-based URL validation - sama seperti di Notification.js
      const currentPath = window.location.pathname.toLowerCase();
      const userRole = normalizedUser.role_id;

      // Check if URL contains role-specific paths that don't match user's role
      if (currentPath.includes("/admin") && userRole !== 1) {
        // User is not admin but trying to access admin routes
        console.log(
          "Unauthorized access to admin routes - redirecting to login"
        );
        window.location.href = "/";
        return;
      }

      if (currentPath.includes("/supervisor") && userRole !== 2) {
        // User is not supervisor but trying to access supervisor routes
        console.log(
          "Unauthorized access to supervisor routes - redirecting to login"
        );
        window.location.href = "/";
        return;
      }

      if (currentPath.includes("/farmer") && userRole !== 3) {
        // User is not farmer but trying to access farmer routes
        console.log(
          "Unauthorized access to farmer routes - redirecting to login"
        );
        window.location.href = "/";
        return;
      }

      // Additional check for dashboard routes based on role
      if (currentPath.includes("/dashboard")) {
        const allowedRoles = [1, 2, 3]; // Admin, Supervisor, Farmer
        if (!allowedRoles.includes(userRole)) {
          console.log(
            "Unauthorized access to dashboard - redirecting to login"
          );
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
      setUserReady(true);
    }
  }, []);

  // Trigger URL update after user initialization
  useEffect(() => {
    if (userReady && globalCurrentUser) {
      // Small delay to ensure user data is properly set
      const timer = setTimeout(() => {
        const newDisplayUrl = getDisplayUrl(location.pathname);
        console.log("UserInitializer: Checking URL update", {
          currentPath: location.pathname,
          newDisplayUrl,
          currentWindowUrl: window.location.pathname,
        });

        if (
          newDisplayUrl !== location.pathname &&
          newDisplayUrl !== window.location.pathname
        ) {
          console.log(
            "UserInitializer: Updating URL from",
            window.location.pathname,
            "to",
            newDisplayUrl
          );
          window.history.replaceState(null, "", newDisplayUrl);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [userReady, location.pathname]);

  return null;
};

// URL Display Handler Component - Fixed version
const URLDisplayHandler = () => {
  const location = useLocation();
  const history = useHistory();

  useLayoutEffect(() => {
    const currentPath = location.pathname;

    if (!isValidRoute(currentPath)) {
      return; // Let the catch-all route handle invalid URLs
    }

    // Only proceed if user is initialized
    if (globalCurrentUser || !authService.isAuthenticated()) {
      const displayUrl = getDisplayUrl(currentPath);

      console.log("URLDisplayHandler: Processing", {
        currentPath,
        displayUrl,
        windowPath: window.location.pathname,
        userRole: getUserRole(),
      });

      // Force update URL if display URL is different and user is authenticated
      if (
        displayUrl !== currentPath &&
        displayUrl !== window.location.pathname
      ) {
        console.log("URLDisplayHandler: Updating URL to", displayUrl);
        // Use replaceState to change URL without triggering navigation
        window.history.replaceState(null, "", displayUrl);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const handlePopState = (event) => {
      const currentDisplayUrl = window.location.pathname;
      let actualPath = REVERSE_URL_DISPLAY_MAP[currentDisplayUrl];

      // Handle role-prefixed URLs
      if (!actualPath) {
        const userRole = getUserRole();
        const rolePrefix = getRolePrefix(userRole);

        if (
          rolePrefix &&
          currentDisplayUrl.startsWith(`/${rolePrefix}/dashboard`)
        ) {
          // Remove role prefix and try to find the actual path
          const urlWithoutRolePrefix = currentDisplayUrl.replace(
            `/${rolePrefix}`,
            ""
          );
          actualPath = REVERSE_URL_DISPLAY_MAP[urlWithoutRolePrefix];
        }
      }

      if (actualPath && actualPath !== location.pathname) {
        // Prevent infinite loop by checking if we're already navigating
        history.replace(actualPath);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [history, location.pathname]);

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
  const rolePrefix = getRolePrefix(userRole);

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

// Main App Component
function App() {
  return (
    <Router>
      <SocketProvider>
        <UserInitializer />
        <URLDisplayHandler />
        <div className="App">
          <RouteConfig />
        </div>
      </SocketProvider>
    </Router>
  );
}

export default App;
