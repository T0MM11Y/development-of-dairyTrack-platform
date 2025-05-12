import {
  BrowserRouter as Router,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin/Dashboard";
import ListUsers from "./pages/Admin/UsersManagement/ListUsers"; // Import halaman Users
import CreateUsers from "./pages/Admin/UsersManagement/CreateUsers"; // Import halaman Create Users
import AdminLayout from "./layouts/AdminLayout";
import EditUser from "./pages/Admin/UsersManagement/EditUsers"; // Import halaman Edit Users
import "./styles/App.css";
import CattleDistribution from "./pages/Admin/CattleDistribution"; // Import halaman Cattle Distribution
import ListCows from "./pages/Admin/CowManagement/ListCows"; // Import halaman List Cows
import CreateCows from "./pages/Admin/CowManagement/CreateCows";
import EditCow from "./pages/Admin/CowManagement/EditCows";
import { checkToken } from "./controllers/authController"; // Import fungsi checkToken
import ListOfGallery from "./pages/Admin/HighlightsManagement/Gallery/ListOfGallery";
import ListOfBlog from "./pages/Admin/HighlightsManagement/Blog/ListOfBlog";

function App() {
  const history = useHistory();

  useEffect(() => {
    const validateToken = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const { token } = JSON.parse(storedUser);
        try {
          const result = await checkToken(token);
          if (!result.success) {
            localStorage.removeItem("user");
            history.push("/"); // Arahkan ke halaman utama jika token tidak valid
          }
        } catch (error) {
          console.error("Error validating token:", error);
          localStorage.removeItem("user");
          history.push("/");
        }
      }
    };

    validateToken();
  }, [history]);

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

          {/* Rute untuk halaman admin */}
          <Route path="/admin" exact>
            <AdminLayout>
              <Admin />
            </AdminLayout>
          </Route>
          <Route path="/admin/list-users">
            <AdminLayout>
              <ListUsers /> {/* Tambahkan komponen Users */}
            </AdminLayout>
          </Route>
          <Route path="/admin/add-users">
            <AdminLayout>
              <CreateUsers /> {/* Tambahkan komponen Create Users */}
            </AdminLayout>
          </Route>
          <Route path="/admin/edit-user/:userId">
            <AdminLayout>
              <EditUser />
            </AdminLayout>
          </Route>
          <Route path="/admin/cattle-distribution">
            <AdminLayout>
              <CattleDistribution />
            </AdminLayout>
          </Route>
          <Route path="/admin/list-cows">
            <AdminLayout>
              <ListCows />
            </AdminLayout>
          </Route>
          <Route path="/admin/add-cow">
            <AdminLayout>
              <CreateCows /> {/* Tambahkan komponen Create Users */}
            </AdminLayout>
          </Route>
          <Route path="/admin/edit-cow/:cowId">
            <AdminLayout>
              <EditCow />
            </AdminLayout>
          </Route>
          <Route path="/admin/list-of-gallery">
            <AdminLayout>
              <ListOfGallery />
            </AdminLayout>
          </Route>
          <Route path="/admin/list-of-blog">
            <AdminLayout>
              <ListOfBlog />
            </AdminLayout>
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
