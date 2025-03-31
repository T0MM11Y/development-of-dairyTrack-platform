import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Public
import Login from "./Auth/login";
import withUserLayout from "./user/withUserLayout";

// Admin Layout
import Header from "./admin/components/header";
import Sidebar from "./admin/components/sidebar";
import Footer from "./admin/components/footer";

// Admin Pages
import Dashboard from "./admin/pages/dashboard/Dashboard";

import PakanHarian from "./admin/pages/pakan/PakanHarian";
import StokPakan from "./admin/pages/pakan/StokPakan";

import DataProduksiSusu from "./admin/pages/produktivitas/DataProduksiSusu";
import AnalisisProduksi from "./admin/pages/produktivitas/AnalisisProduksi";

import Pemasukan from "./admin/pages/keuangan/Pemasukan";
import Pengeluaran from "./admin/pages/keuangan/Pengeluaran";
import LaporanKeuangan from "./admin/pages/keuangan/LaporanKeuangan";

//kesehatan
// BENAR ✅ (folder sesuai yang kamu punya)
// Cows
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
// Admin Layout Wrapper
const withAdminLayout = (Component) => (
  <div id="layout-wrapper">
    <Header />
    <Sidebar />
    <div className="main-content">
      <div className="content px-12">
        <Component />
      </div>
      <Footer />
    </div>
  </div>
);

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
      <Route path="/identitas-peternakan" element={withUserLayout(IdentitasPeternakanPage)} />

      {/* Admin Default Redirect */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={withAdminLayout(Dashboard)} />
      <Route
        path="/admin/pakan/harian"
        element={withAdminLayout(PakanHarian)}
      />
      <Route path="/admin/pakan/stok" element={withAdminLayout(StokPakan)} />
      <Route
        path="/admin/susu/produksi"
        element={withAdminLayout(DataProduksiSusu)}
      />
      <Route
        path="/admin/susu/analisis"
        element={withAdminLayout(AnalisisProduksi)}
      />

      {/* Admin peternakan - Sapi */}
      <Route
        path="/admin/peternakan/sapi"
        element={withAdminLayout(CowListPage)}
      />
      <Route
        path="/admin/peternakan/sapi/create"
        element={withAdminLayout(CowCreatePage)}
      />
      <Route
        path="/admin/peternakan/sapi/edit/:id"
        element={withAdminLayout(CowEditPage)}
      />

      {/* Admin peternakan - Farmers */}
      <Route
        path="/admin/peternakan/farmer"
        element={withAdminLayout(FarmerListPage)}
      />
      <Route
        path="/admin/peternakan/farmer/create"
        element={withAdminLayout(FarmerCreatePage)}
      />
      <Route
        path="/admin/peternakan/farmer/edit/:id"
        element={withAdminLayout(FarmerEditPage)}
      />

      {/* Admin peternakan - Supervisor */}
      <Route
        path="/admin/peternakan/supervisor"
        element={withAdminLayout(SupervisorListPage)}
      />
      <Route
        path="/admin/peternakan/supervisor/create"
        element={withAdminLayout(SupervisorCreatePage)}
      />
      <Route
        path="/admin/peternakan/supervisor/edit/:id"
        element={withAdminLayout(SupervisorEditPage)}
      />
      {/* Admin Kesehatan - Pemeriksaan */}
      <Route
        path="/admin/kesehatan/pemeriksaan"
        element={withAdminLayout(HealthCheckListPage)}
      />
      <Route
        path="/admin/kesehatan/pemeriksaan/create"
        element={withAdminLayout(HealthCheckCreatePage)}
      />
      <Route
        path="/admin/kesehatan/pemeriksaan/edit/:id"
        element={withAdminLayout(HealthCheckEditPage)}
      />

      {/* Admin Kesehatan - Gejala */}
      <Route
        path="/admin/kesehatan/gejala"
        element={withAdminLayout(SymptomListPage)}
      />
      <Route
        path="/admin/kesehatan/gejala/create"
        element={withAdminLayout(SymptomCreatePage)}
      />
      <Route
        path="/admin/kesehatan/gejala/edit/:id"
        element={withAdminLayout(SymptomEditPage)}
      />

      {/* Admin Kesehatan - Riwayat Penyakit */}
      <Route
        path="/admin/kesehatan/riwayat"
        element={withAdminLayout(DiseaseHistoryListPage)}
      />
      <Route
        path="/admin/kesehatan/riwayat/create"
        element={withAdminLayout(DiseaseHistoryCreatePage)}
      />
      <Route
        path="/admin/kesehatan/riwayat/edit/:id"
        element={withAdminLayout(DiseaseHistoryEditPage)}
      />

      {/* Admin Kesehatan - Reproduksi */}
      <Route
        path="/admin/kesehatan/reproduksi"
        element={withAdminLayout(ReproductionListPage)}
      />
      <Route
        path="/admin/kesehatan/reproduksi/create"
        element={withAdminLayout(ReproductionCreatePage)}
      />
      <Route
        path="/admin/kesehatan/reproduksi/edit/:id"
        element={withAdminLayout(ReproductionEditPage)}
      />

      <Route
        path="/admin/keuangan/pemasukan"
        element={withAdminLayout(Pemasukan)}
      />
      <Route
        path="/admin/keuangan/pengeluaran"
        element={withAdminLayout(Pengeluaran)}
      />
      <Route
        path="/admin/keuangan/laporan"
        element={withAdminLayout(LaporanKeuangan)}
      />
    </Routes>
  );
}

export default App;
