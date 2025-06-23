import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  useLocation,
} from "react-router-dom";
import { useLayoutEffect, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Blog";
import Admin from "./pages/Admin/Dashboard";
import ResetPassword from "./pages/Admin/UsersManagement/ResetPassword";
import ListUsers from "./pages/Admin/UsersManagement/ListUsers";
import CreateUsers from "./pages/Admin/UsersManagement/CreateUsers";
import AdminLayout from "./layouts/AdminLayout";
import EditUser from "./pages/Admin/UsersManagement/EditUsers";
import "./styles/App.css";
import CattleDistribution from "./pages/Admin/CattleDistribution";
import ListCows from "./pages/Admin/CowManagement/ListCows";
import CreateCows from "./pages/Admin/CowManagement/CreateCows";
import EditCow from "./pages/Admin/CowManagement/EditCows";
import ListOfGallery from "./pages/Admin/HighlightsManagement/Gallery/ListOfGallery";
import ListOfBlog from "./pages/Admin/HighlightsManagement/Blog/ListOfBlog";
import ListMilking from "./pages/Admin/MilkProduction/ListMilking";
import Blog from "./pages/Blog";
import Gallery from "./pages/Gallery";
import { SocketProvider } from "../socket/socket";
import CowsMilkAnalysis from "./pages/Admin/MilkProduction/Analythics/CowsMilkAnalysis";
import MilkExpiryCheck from "./pages/Admin/MilkProduction/Analythics/MilkExpiryCheck";
// HealthCheck
import ListHealthChecks from "./pages/Admin/HealthCheckManagement/HealthCheck/ListHealthChecks";
import CreateHealthCheck from "./pages/Admin/HealthCheckManagement/HealthCheck/CreateHealthCheck";
import EditHealthCheck from "./pages/Admin/HealthCheckManagement/HealthCheck/EditHealthCheck";

// Symptom
import ListSymptoms from "./pages/Admin/HealthCheckManagement/Symptom/ListSymptoms";
import CreateSymptom from "./pages/Admin/HealthCheckManagement/Symptom/CreateSymptom";
import EditSymptom from "./pages/Admin/HealthCheckManagement/Symptom/EditSymptom";

// DiseaseHistory
import ListDiseaseHistory from "./pages/Admin/HealthCheckManagement/DiseaseHistory/ListDiseaseHistory";
import CreateDiseaseHistory from "./pages/Admin/HealthCheckManagement/DiseaseHistory/CreateDiseaseHistory";
import EditDiseaseHistory from "./pages/Admin/HealthCheckManagement/DiseaseHistory/EditDiseaseHistory";

// Reproduction
import ListReproduction from "./pages/Admin/HealthCheckManagement/Reproduction/ListReproduction";
import CreateReproduction from "./pages/Admin/HealthCheckManagement/Reproduction/CreateReproduction";
import EditReproduction from "./pages/Admin/HealthCheckManagement/Reproduction/EditReproduction";

// HealthDashboard
import HealthDashboard from "./pages/Admin/HealthCheckManagement/HealthDashboard/Dashboard";

// Feed
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

// sales and financial
import ProductType from "./pages/Admin/ProductType/listProductType";
import ProductStock from "./pages/Admin/Product/ListProductStock";
import ProductHistory from "./pages/Admin/ProductHistory/ListProductHistory";
import SalesOrder from "./pages/Admin/Order/ListOrder";
import Finance from "./pages/Admin/Finance/Finance";
import FinanceRecord from "./pages/Admin/Finance/FinanceRecords";
import Product from "./pages/Product";
import Order from "./pages/Order";

const urlDisplayMap = {
  "/about": "/about-us",
  "/contact": "/get-in-touch",
  "/blog": "/insights",
  "/gallery": "/showcase",
  "/products": "/marketplace",
  "/orders": "/my-orders",
  "/admin/list-users": "/dashboard/user-management",
  "/admin/add-users": "/dashboard/create-user",
  "/admin/edit-user/:userId": "/dashboard/edit-user",
  "/admin/reset-password": "/dashboard/reset-credentials",
  "/admin/cattle-distribution": "/dashboard/livestock-distribution",
  "/admin/list-cows": "/dashboard/cattle-inventory",
  "/admin/add-cow": "/dashboard/register-cattle",
  "/admin/edit-cow/:cowId": "/dashboard/update-cattle",
  "/admin/list-of-gallery": "/dashboard/media-gallery",
  "/admin/list-of-blog": "/dashboard/content-management",
  "/admin/list-milking": "/dashboard/milk-production",
  "/admin/cows-milk-analytics": "/dashboard/milk-analytics",
  "/admin/milk-expiry-check": "/dashboard/quality-control",
  "/admin/list-health-checks": "/dashboard/health-monitoring",
  "/admin/add-health-check": "/dashboard/record-health",
  "/admin/edit-health-check/:id": "/dashboard/update-health",
  "/admin/list-symptoms": "/dashboard/symptom-tracker",
  "/admin/add-symptom": "/dashboard/log-symptom",
  "/admin/edit-symptom/:id": "/dashboard/modify-symptom",
  "/admin/list-disease-history": "/dashboard/medical-records",
  "/admin/add-disease-history": "/dashboard/add-medical-record",
  "/admin/edit-disease-history/:id": "/dashboard/update-medical-record",
  "/admin/list-reproduction": "/dashboard/breeding-management",
  "/admin/add-reproduction": "/dashboard/record-breeding",
  "/admin/edit-reproduction/:id": "/dashboard/update-breeding",
  "/admin/health-dashboard": "/dashboard/wellness-overview",
  "/admin/list-feedType": "/dashboard/feed-catalog",
  "/admin/edit-feedType/:id": "/dashboard/modify-feed-type",
  "/admin/list-nutrition": "/dashboard/nutrition-guide",
  "/admin/list-feed": "/dashboard/feed-inventory",
  "/admin/edit-feed/:id": "/dashboard/update-feed",
  "/admin/list-stock": "/dashboard/stock-management",
  "/admin/list-schedule": "/dashboard/feeding-schedule",
  "/admin/list-feedItem": "/dashboard/feed-items",
  "/admin/daily-feed-usage": "/dashboard/consumption-analytics",
  "/admin/daily-nutrition": "/dashboard/nutrition-tracking",
  "/admin/product-type": "/dashboard/product-categories",
  "/admin/product": "/dashboard/inventory-hub",
  "/admin/product-history": "/dashboard/sales-history",
  "/admin/sales": "/dashboard/order-management",
  "/admin/finance": "/dashboard/financial-overview",
  "/admin/finance-record": "/dashboard/transaction-logs",
};

// Reverse mapping untuk mencari actual path dari display URL
const reverseUrlDisplayMap = {};
Object.keys(urlDisplayMap).forEach((key) => {
  reverseUrlDisplayMap[urlDisplayMap[key]] = key;
});

// Helper function to get display URL
const getDisplayUrl = (currentPath) => {
  let displayUrl = currentPath;

  // Check for exact matches first
  if (urlDisplayMap[currentPath]) {
    displayUrl = urlDisplayMap[currentPath];
  } else {
    // Check for dynamic routes (with parameters)
    Object.keys(urlDisplayMap).forEach((key) => {
      const keyParts = key.split("/");
      const pathParts = currentPath.split("/");

      if (keyParts.length === pathParts.length) {
        let matches = true;
        for (let i = 0; i < keyParts.length; i++) {
          if (keyParts[i].startsWith(":") || pathParts[i] === keyParts[i]) {
            continue;
          } else {
            matches = false;
            break;
          }
        }

        if (matches) {
          // Build display URL with actual parameter values
          displayUrl = urlDisplayMap[key];
          for (let i = 0; i < keyParts.length; i++) {
            if (keyParts[i].startsWith(":")) {
              displayUrl += "/" + pathParts[i];
            }
          }
        }
      }
    });
  }

  return displayUrl;
};

// Helper function to get actual path from display URL
const getActualPath = (displayPath) => {
  // Check for exact reverse mapping first
  if (reverseUrlDisplayMap[displayPath]) {
    return reverseUrlDisplayMap[displayPath];
  }

  // Check for dynamic routes
  for (const [actualPath, displayPattern] of Object.entries(urlDisplayMap)) {
    const displayParts = displayPattern.split("/");
    const pathParts = displayPath.split("/");

    if (displayParts.length === pathParts.length) {
      let actualPathResult = actualPath;
      let matches = true;

      for (let i = 0; i < displayParts.length; i++) {
        if (displayParts[i] === pathParts[i]) {
          continue;
        } else {
          // Check if this is a parameter placeholder in actual path
          const actualParts = actualPath.split("/");
          if (actualParts[i] && actualParts[i].startsWith(":")) {
            actualPathResult = actualPathResult.replace(
              actualParts[i],
              pathParts[i]
            );
            continue;
          } else {
            matches = false;
            break;
          }
        }
      }

      if (matches) {
        return actualPathResult;
      }
    }
  }

  return null;
};

// Helper function to check if path exists in routes
const isValidRoute = (path) => {
  const validRoutes = [
    "/",
    "/about",
    "/contact",
    "/blog",
    "/gallery",
    "/products",
    "/orders",
    "/admin",
    "/supervisor",
    "/farmer",
    ...Object.keys(urlDisplayMap),
  ];

  // Check exact matches
  if (validRoutes.includes(path)) {
    return true;
  }

  // Check dynamic routes
  return validRoutes.some((route) => {
    if (route.includes(":")) {
      const routeParts = route.split("/");
      const pathParts = path.split("/");

      if (routeParts.length === pathParts.length) {
        return routeParts.every(
          (part, index) => part.startsWith(":") || part === pathParts[index]
        );
      }
    }
    return false;
  });
};

// Component to handle invalid URLs
const InvalidUrlHandler = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          padding: "40px",
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h1 style={{ color: "#dc3545", marginBottom: "20px" }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: "18px", marginBottom: "20px", color: "#6c757d" }}>
          Please use navigation from web
        </p>
        <p style={{ fontSize: "14px", marginBottom: "30px", color: "#6c757d" }}>
          The URL you entered is not valid. Please use the website's navigation
          menu to access pages.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Go to Home Page
        </button>
      </div>
    </div>
  );
};

// Component to handle URL display changes and validation
const URLDisplayHandler = () => {
  const location = useLocation();

  useLayoutEffect(() => {
    const currentPath = location.pathname;
    const displayUrl = getDisplayUrl(currentPath);

    // Update browser URL display without affecting React Router
    if (displayUrl !== currentPath && window.location.pathname !== displayUrl) {
      window.history.replaceState(null, "", displayUrl);
    }
  }, [location.pathname]);

  useEffect(() => {
    // Handle browser navigation (back/forward buttons)
    const handlePopState = (event) => {
      const currentDisplayUrl = window.location.pathname;
      const actualPath = getActualPath(currentDisplayUrl);

      if (actualPath && isValidRoute(actualPath)) {
        // Valid route, navigate to actual path
        if (currentDisplayUrl !== actualPath) {
          window.history.replaceState(null, "", actualPath);
          window.location.reload();
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
};

// Route validator component
const RouteValidator = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Check if current path is valid
  if (!isValidRoute(currentPath)) {
    // Check if it's a display URL that needs to be converted
    const actualPath = getActualPath(currentPath);
    if (actualPath && isValidRoute(actualPath)) {
      return <Redirect to={actualPath} />;
    }

    // Invalid URL, show error message
    return <InvalidUrlHandler />;
  }

  return children;
};

// Protected Route component to check authentication
const ProtectedRoute = ({ children, ...rest }) => {
  // Check if user data exists in localStorage
  const isAuthenticated = () => {
    const userData = localStorage.getItem("user");
    return userData !== null;
  };

  return (
    <Route
      {...rest}
      render={({ location }) =>
        isAuthenticated() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: {
                from: location,
                message: "Please log in to access the admin area.",
              },
            }}
          />
        )
      }
    />
  );
};

function App() {
  return (
    <Router>
      <SocketProvider>
        <URLDisplayHandler />
        <RouteValidator>
          <div className="App">
            <Switch>
              {/* Rute untuk halaman utama */}
              <Route path="/" exact>
                <Header />
                <Home />
                <Footer />
              </Route>
              <Route path="/about">
                <Header />
                <About />
                <Footer />
              </Route>
              <Route path="/contact">
                <Header />
                <Contact />
                <Footer />
              </Route>
              <Route path="/blog">
                <Header />
                <Blog />
                <Footer />
              </Route>

              <Route path="/gallery">
                <Header />
                <Gallery />
                <Footer />
              </Route>

              {/* Sales & financial */}
              <Route path="/products">
                <Header />
                <Product />
                <Footer />
              </Route>

              <Route path="/orders">
                <Header />
                <Order />
                <Footer />
              </Route>
              {/* Sales & financial */}

              {/* Rute untuk halaman admin - with authentication protection */}
              <ProtectedRoute path="/admin" exact>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
              <ProtectedRoute path="/supervisor" exact>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>
              <ProtectedRoute path="/farmer" exact>
                <AdminLayout>
                  <Admin />
                </AdminLayout>
              </ProtectedRoute>

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
              {/* HealthCheck */}
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
              {/* Symptom */}
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
              {/* DiseaseHistory */}
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
              {/* Reproduction */}
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
              {/* Health Dashboard */}
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
                  <ListFeedTypes />
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
                  <ListFeed />
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

              {/* Saless and Fincancial Section */}
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

              {/* Fallback route for any unmatched paths */}
              <Route path="*">
                <InvalidUrlHandler />
              </Route>
            </Switch>
          </div>
        </RouteValidator>
      </SocketProvider>
    </Router>
  );
}

export default App;
