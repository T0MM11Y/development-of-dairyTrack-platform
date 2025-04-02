import { Route, Routes, Navigate } from "react-router-dom";
import "./configuration/i18n";
import React from "react";

// Public
import Login from "./Auth/login";
import withUserLayout from "./user/withUserLayout";

// Admin Layout
import Header from "./admin/components/header";
import Sidebar from "./admin/components/sidebar";
import Footer from "./admin/components/footer";

// Admin Pages
import Dashboard from "./admin/pages/dashboard/Dashboard";

import JenisPakan from "./admin/pages/pakan/FeedType/FeedTypeListPage.js";
import TambahJenisPakan from "./admin/pages/pakan/FeedType/CreateFeedType.js";
import Pakan from "./admin/pages/pakan/Feed/FeedListPage.js";
import TambahPakan from "./admin/pages/pakan/Feed/CreateFeed.js";
import StokPakan from "./admin/pages/pakan/FeedStock/feedStockList.js";
import TambahStokPakan from "./admin/pages/pakan/FeedStock/AddStock.js";
import PakanHarian from "./admin/pages/pakan/DailyFeed/DailyFeedList.js";
import TambahPakanHarian from "./admin/pages/pakan/DailyFeed/CreateDailyFeed.js";
import DetailPakanHarian from "./admin/pages/pakan/DailyFeedDetail/DailyFeedDetail.js";
import TambahDetailPakan from "./admin/pages/pakan/DailyFeedDetail/CreateDailyFeedDetail.js";

import DataProduksiSusu from "./admin/pages/produktivitas/DataProduksiSusu";
import AnalisisProduksi from "./admin/pages/produktivitas/AnalisisProduksi";

import Pemasukan from "./admin/pages/keuangan/Pemasukan";
import Pengeluaran from "./admin/pages/keuangan/Pengeluaran";
import LaporanKeuangan from "./admin/pages/keuangan/LaporanKeuangan";

//kesehatan
import CowListPage from "./admin/pages/peternakan/cows/CowListPage.js";
import CowCreatePage from "./admin/pages/peternakan/cows/CowCreatePage.js";
import CowEditPage from "./admin/pages/peternakan/cows/CowEditPage.js";

import FarmerListPage from "./admin/pages/peternakan/farmers/FarmerListPage.js";
import FarmerCreatePage from "./admin/pages/peternakan/farmers/FarmerCreatePage.js";
import FarmerEditPage from "./admin/pages/peternakan/farmers/FarmerEditPage.js";

import SupervisorListPage from "./admin/pages/peternakan/supervisor/SupervisorListPage.js";
import SupervisorCreatePage from "./admin/pages/peternakan/supervisor/SupervisorCreatePage.js";
import SupervisorEditPage from "./admin/pages/peternakan/supervisor/SupervisorEditPage.js";

// Symptoms
import SymptomListPage from "./admin/pages/kesehatan/symptoms/SymptomListPage.js";
import SymptomCreatePage from "./admin/pages/kesehatan/symptoms/SymptomCreatePage.js";
import SymptomEditPage from "./admin/pages/kesehatan/symptoms/SymptomEditPage.js";

import HealthCheckListPage from "./admin/pages/kesehatan/health-checks/HealthCheckListPage.js";
import HealthCheckCreatePage from "./admin/pages/kesehatan/health-checks/HealthCheckCreatePage.js";
import HealthCheckEditPage from "./admin/pages/kesehatan/health-checks/HealthCheckEditPage.js";

import DiseaseHistoryListPage from "./admin/pages/kesehatan/disease-history/DiseaseHistoryListPage.js";
import DiseaseHistoryCreatePage from "./admin/pages/kesehatan/disease-history/DiseaseHistoryCreatePage.js";
import DiseaseHistoryEditPage from "./admin/pages/kesehatan/disease-history/DiseaseHistoryEditPage.js";

import ReproductionListPage from "./admin/pages/kesehatan/reproduction/ReproductionListPage.js";
import ReproductionCreatePage from "./admin/pages/kesehatan/reproduction/ReproductionCreatePage.js";
import ReproductionEditPage from "./admin/pages/kesehatan/reproduction/ReproductionEditPage.js";

// Import CSS
import "./assets/admin/css/icons.min.css";
import "./assets/admin/css/app.css";
import "./assets/admin/css/bootstrap.min.css";

import "simplebar-react/dist/simplebar.min.css";

// User Pages
import IdentitasPeternakanPage from "./user/pages/IdentitasPeternakanPage";
import SejarahPage from "./user/pages/SejarahPage";
import FasilitasPage from "./user/pages/FasilitasPage";
import ProduksiSusuPage from "./user/pages/ProduksiSusuPage";
import ProdukPage from "./user/pages/ProdukPage";
import GaleriPage from "./user/pages/GaleriPage";
import DashboardUser from "./user/pages/Dashboard";
import ContactUs from "./user/pages/ContactUs";
const withAdminLayout = (Component) => {
  const AdminLayout = () => {
    return (
      <div id="layout-wrapper" style={{ display: "flex", height: "100vh" }}>
        <div className="sidebar" style={{ width: "250px", flexShrink: 0 }}>
          <Sidebar />
        </div>

        <div
          className="main-content"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <Header />
          <div
            className="content"
            style={{ flex: 1, overflow: "auto", padding: "20px" }}
          >
            <Component />
          </div>
          <Footer />
        </div>
      </div>
    );
  };

  return <AdminLayout />;
};

const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={withUserLayout(DashboardUser)} />
      <Route path="/logout" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Login />} />

      {/* User Routes */}
      <Route path="/dashboard" element={withUserLayout(DashboardUser)} />
      <Route path="/sejarah" element={withUserLayout(SejarahPage)} />
      <Route path="/fasilitas" element={withUserLayout(FasilitasPage)} />
      <Route path="/produksi-susu" element={withUserLayout(ProduksiSusuPage)} />
      <Route path="/produk" element={withUserLayout(ProdukPage)} />
      <Route path="/galeri" element={withUserLayout(GaleriPage)} />
      <Route
        path="/identitas-peternakan"
        element={withUserLayout(IdentitasPeternakanPage)}
      />
      <Route path="/contact-us" element={withUserLayout(ContactUs)} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={<ProtectedRoute>{withAdminLayout(Dashboard)}</ProtectedRoute>}
      />

      <Route
        path="/admin/pakan/jenis"
        element={<ProtectedRoute>{withAdminLayout(JenisPakan)}</ProtectedRoute>}
      />
      <Route
        path="/admin/pakan/jenis/tambah"
        element={
          <ProtectedRoute>{withAdminLayout(TambahJenisPakan)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/pakan"
        element={<ProtectedRoute>{withAdminLayout(Pakan)}</ProtectedRoute>}
      />
      <Route
        path="/admin/pakan/tambah"
        element={
          <ProtectedRoute>{withAdminLayout(TambahPakan)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/pakan/stok"
        element={<ProtectedRoute>{withAdminLayout(StokPakan)}</ProtectedRoute>}
      />
      <Route
        path="/admin/pakan/tambah-stok"
        element={
          <ProtectedRoute>{withAdminLayout(TambahStokPakan)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/pakan-harian"
        element={
          <ProtectedRoute>{withAdminLayout(PakanHarian)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/tambah/pakan-harian"
        element={
          <ProtectedRoute>{withAdminLayout(TambahPakanHarian)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/detail-pakan-harian"
        element={
          <ProtectedRoute>{withAdminLayout(DetailPakanHarian)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/tambah/detail-pakan-harian"
        element={
          <ProtectedRoute>{withAdminLayout(TambahDetailPakan)}</ProtectedRoute>
        }
      />

      <Route
        path="/admin/susu/produksi"
        element={
          <ProtectedRoute>{withAdminLayout(DataProduksiSusu)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/susu/analisis"
        element={
          <ProtectedRoute>{withAdminLayout(AnalisisProduksi)}</ProtectedRoute>
        }
      />

      {/* Admin peternakan - Sapi */}
      <Route
        path="/admin/peternakan/sapi"
        element={
          <ProtectedRoute>{withAdminLayout(CowListPage)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/peternakan/sapi/create"
        element={
          <ProtectedRoute>{withAdminLayout(CowCreatePage)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/peternakan/sapi/edit/:id"
        element={
          <ProtectedRoute>{withAdminLayout(CowEditPage)}</ProtectedRoute>
        }
      />

      {/* Admin peternakan - Farmers */}
      <Route
        path="/admin/peternakan/farmer"
        element={
          <ProtectedRoute>{withAdminLayout(FarmerListPage)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/peternakan/farmer/create"
        element={
          <ProtectedRoute>{withAdminLayout(FarmerCreatePage)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/peternakan/farmer/edit/:id"
        element={
          <ProtectedRoute>{withAdminLayout(FarmerEditPage)}</ProtectedRoute>
        }
      />

      {/* Admin peternakan - Supervisor */}
      <Route
        path="/admin/peternakan/supervisor"
        element={
          <ProtectedRoute>{withAdminLayout(SupervisorListPage)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/peternakan/supervisor/create"
        element={
          <ProtectedRoute>
            {withAdminLayout(SupervisorCreatePage)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/peternakan/supervisor/edit/:id"
        element={
          <ProtectedRoute>{withAdminLayout(SupervisorEditPage)}</ProtectedRoute>
        }
      />

      {/* Admin Kesehatan - Pemeriksaan */}
      <Route
        path="/admin/kesehatan/pemeriksaan"
        element={
          <ProtectedRoute>
            {withAdminLayout(HealthCheckListPage)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/pemeriksaan/create"
        element={
          <ProtectedRoute>
            {withAdminLayout(HealthCheckCreatePage)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/pemeriksaan/edit/:id"
        element={
          <ProtectedRoute>
            {withAdminLayout(HealthCheckEditPage)}
          </ProtectedRoute>
        }
      />

      {/* Admin Kesehatan - Gejala */}
      <Route
        path="/admin/kesehatan/gejala"
        element={
          <ProtectedRoute>{withAdminLayout(SymptomListPage)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/gejala/create"
        element={
          <ProtectedRoute>{withAdminLayout(SymptomCreatePage)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/gejala/edit/:id"
        element={
          <ProtectedRoute>{withAdminLayout(SymptomEditPage)}</ProtectedRoute>
        }
      />

      {/* Admin Kesehatan - Riwayat Penyakit */}
      <Route
        path="/admin/kesehatan/riwayat"
        element={
          <ProtectedRoute>
            {withAdminLayout(DiseaseHistoryListPage)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/riwayat/create"
        element={
          <ProtectedRoute>
            {withAdminLayout(DiseaseHistoryCreatePage)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/riwayat/edit/:id"
        element={
          <ProtectedRoute>
            {withAdminLayout(DiseaseHistoryEditPage)}
          </ProtectedRoute>
        }
      />

      {/* Admin Kesehatan - Reproduksi */}
      <Route
        path="/admin/kesehatan/reproduksi"
        element={
          <ProtectedRoute>
            {withAdminLayout(ReproductionListPage)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/reproduksi/create"
        element={
          <ProtectedRoute>
            {withAdminLayout(ReproductionCreatePage)}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kesehatan/reproduksi/edit/:id"
        element={
          <ProtectedRoute>
            {withAdminLayout(ReproductionEditPage)}
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/keuangan/pemasukan"
        element={<ProtectedRoute>{withAdminLayout(Pemasukan)}</ProtectedRoute>}
      />
      <Route
        path="/admin/keuangan/pengeluaran"
        element={
          <ProtectedRoute>{withAdminLayout(Pengeluaran)}</ProtectedRoute>
        }
      />
      <Route
        path="/admin/keuangan/laporan"
        element={
          <ProtectedRoute>{withAdminLayout(LaporanKeuangan)}</ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;