import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
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
// HealthCheck
import ListHealthChecks from "./pages/Admin/CowManagement/HealthCheck/ListHealthChecks";
import CreateHealthCheck from "./pages/Admin/CowManagement/HealthCheck/CreateHealthCheck";
import EditHealthCheck from "./pages/Admin/CowManagement/HealthCheck/EditHealthCheck";

// Symptom
import ListSymptoms from "./pages/Admin/CowManagement/Symptom/ListSymptoms";
import CreateSymptom from "./pages/Admin/CowManagement/Symptom/CreateSymptom";
import EditSymptom from "./pages/Admin/CowManagement/Symptom/EditSymptom";

// DiseaseHistory
import ListDiseaseHistory from "./pages/Admin/CowManagement/DiseaseHistory/ListDiseaseHistory";
import CreateDiseaseHistory from "./pages/Admin/CowManagement/DiseaseHistory/CreateDiseaseHistory";
import EditDiseaseHistory from "./pages/Admin/CowManagement/DiseaseHistory/EditDiseaseHistory";

// Reproduction
import ListReproduction from "./pages/Admin/CowManagement/Reproduction/ListReproduction";
import CreateReproduction from "./pages/Admin/CowManagement/Reproduction/CreateReproduction";
import EditReproduction from "./pages/Admin/CowManagement/Reproduction/EditReproduction";

// HealthDashboard
import HealthDashboard from "./pages/Admin/CowManagement/HealthDashboard/Dashboard";



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
          </Route>
          <Route path="/contact">
            <Header />
            <Contact />
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
          {/* HealthCheck */}
<ProtectedRoute path="/admin/list-health-checks">
  <AdminLayout><ListHealthChecks /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/add-health-check">
  <AdminLayout><CreateHealthCheck /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/edit-health-check/:id">
  <AdminLayout><EditHealthCheck /></AdminLayout>
</ProtectedRoute>

{/* Symptom */}
<ProtectedRoute path="/admin/list-symptoms">
  <AdminLayout><ListSymptoms /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/add-symptom">
  <AdminLayout><CreateSymptom /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/edit-symptom/:id">
  <AdminLayout><EditSymptom /></AdminLayout>
</ProtectedRoute>

{/* DiseaseHistory */}
<ProtectedRoute path="/admin/list-disease-history">
  <AdminLayout><ListDiseaseHistory /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/add-disease-history">
  <AdminLayout><CreateDiseaseHistory /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/edit-disease-history/:id">
  <AdminLayout><EditDiseaseHistory /></AdminLayout>
</ProtectedRoute>

{/* Reproduction */}
<ProtectedRoute path="/admin/list-reproduction">
  <AdminLayout><ListReproduction /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/add-reproduction">
  <AdminLayout><CreateReproduction /></AdminLayout>
</ProtectedRoute>
<ProtectedRoute path="/admin/edit-reproduction/:id">
  <AdminLayout><EditReproduction /></AdminLayout>
</ProtectedRoute>
{/* Health Dashboard */}
<ProtectedRoute path="/admin/health-dashboard">
  <AdminLayout><HealthDashboard /></AdminLayout>
</ProtectedRoute>

        </Switch>
      </div>
    </Router>
  );
}

export default App;
