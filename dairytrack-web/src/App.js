import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Public
import Login from "./Auth/login";
import UserApp from "./user/UserApp";

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
import CowListPage from "./admin/pages/kesehatan/cows/CowListPage.js";
import CowCreatePage from "./admin/pages/kesehatan/cows/CowCreatePage.js";
import CowEditPage from "./admin/pages/kesehatan/cows/CowEditPage.js";

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
import "./assets/admin/css/bootstrap.min.css";
import "./assets/admin/css/icons.min.css";
import "./assets/admin/css/app.css";


import 'simplebar-react/dist/simplebar.min.css';

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
      <Route path="/" element={<UserApp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<UserApp />} />

      {/* Admin Default Redirect */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={withAdminLayout(Dashboard)} />
      <Route path="/admin/pakan/harian" element={withAdminLayout(PakanHarian)} />
      <Route path="/admin/pakan/stok" element={withAdminLayout(StokPakan)} />
      <Route path="/admin/susu/produksi" element={withAdminLayout(DataProduksiSusu)} />
      <Route path="/admin/susu/analisis" element={withAdminLayout(AnalisisProduksi)} />

      {/* Admin Kesehatan - Sapi */}
<Route path="/admin/kesehatan/sapi" element={withAdminLayout(CowListPage)} />
<Route path="/admin/kesehatan/sapi/create" element={withAdminLayout(CowCreatePage)} />
<Route path="/admin/kesehatan/sapi/edit/:id" element={withAdminLayout(CowEditPage)} />
      {/* Admin Kesehatan - Pemeriksaan */}
      <Route path="/admin/kesehatan/pemeriksaan" element={withAdminLayout(HealthCheckListPage)} />
      <Route path="/admin/kesehatan/pemeriksaan/create" element={withAdminLayout(HealthCheckCreatePage)} />
      <Route path="/admin/kesehatan/pemeriksaan/edit/:id" element={withAdminLayout(HealthCheckEditPage)} />

      {/* Admin Kesehatan - Gejala */}
      <Route path="/admin/kesehatan/gejala" element={withAdminLayout(SymptomListPage)} />
      <Route path="/admin/kesehatan/gejala/create" element={withAdminLayout(SymptomCreatePage)} />
      <Route path="/admin/kesehatan/gejala/edit/:id" element={withAdminLayout(SymptomEditPage)} />

      {/* Admin Kesehatan - Riwayat Penyakit */}
      <Route path="/admin/kesehatan/riwayat" element={withAdminLayout(DiseaseHistoryListPage)} />
      <Route path="/admin/kesehatan/riwayat/create" element={withAdminLayout(DiseaseHistoryCreatePage)} />
      <Route path="/admin/kesehatan/riwayat/edit/:id" element={withAdminLayout(DiseaseHistoryEditPage)} />

      {/* Admin Kesehatan - Reproduksi */}
      <Route path="/admin/kesehatan/reproduksi" element={withAdminLayout(ReproductionListPage)} />
      <Route path="/admin/kesehatan/reproduksi/create" element={withAdminLayout(ReproductionCreatePage)} />
      <Route path="/admin/kesehatan/reproduksi/edit/:id" element={withAdminLayout(ReproductionEditPage)} />

      <Route path="/admin/keuangan/pemasukan" element={withAdminLayout(Pemasukan)} />
      <Route path="/admin/keuangan/pengeluaran" element={withAdminLayout(Pengeluaran)} />
      <Route path="/admin/keuangan/laporan" element={withAdminLayout(LaporanKeuangan)} />
    </Routes>

  );
}

export default App;
