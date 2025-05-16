import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
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
import MilkTrend from "./pages/Admin/MilkProduction/MilkTrend";
import Blog from "./pages/Blog";
import Gallery from "./pages/Gallery";
import Product from "./pages/Product";
import Order from "./pages/Order";
import { SocketProvider } from "../socket/socket";
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

// sales and financial
import ProductType from "./pages/Admin/ProductType/listProductType";
import ProductStock from "./pages/Admin/Product/ListProductStock";
import ProductHistory from "./pages/Admin/ProductHistory/ListProductHistory";
import SalesOrder from "./pages/Admin/Order/ListOrder";

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
        <div className="App">
          <Switch>
            {/* Rute untuk halaman utama */}
            <Route path="/" exact>
              <Header />
              <Home />
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
            <Route path="/product">
              <Header />
              <Product />
              <Footer />
            </Route>
            <Route path="/gallery">
              <Header />
              <Gallery />
              <Footer />
            </Route>
            <Route path="/order">
              <Header />
              <Order />
              <Footer />
            </Route>

            {/* Rute untuk halaman admin - with authentication protection */}
            <ProtectedRoute path="/admin" exact>
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

            <ProtectedRoute path="/admin/milk-trend">
              <AdminLayout>
                <MilkTrend />
              </AdminLayout>
            </ProtectedRoute>
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
          </Switch>
        </div>{" "}
      </SocketProvider>
    </Router>
  );
}

export default App;
