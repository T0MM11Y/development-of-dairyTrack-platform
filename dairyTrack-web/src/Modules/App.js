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
        </Switch>
      </div>
    </Router>
  );
}

export default App;
