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

import DataSapi from "./admin/pages/kesehatan/DataSapi";
import GejalaPenyakit from "./admin/pages/kesehatan/GejalaPenyakit";
import RiwayatPenyakit from "./admin/pages/kesehatan/RiwayatPenyakit";
import ReproduksiSapi from "./admin/pages/kesehatan/ReproduksiSapi";
import PemeriksaanPenyakit from "./admin/pages/kesehatan/PemeriksaanPenyakit";

import Pemasukan from "./admin/pages/keuangan/Pemasukan";
import Pengeluaran from "./admin/pages/keuangan/Pengeluaran";
import LaporanKeuangan from "./admin/pages/keuangan/LaporanKeuangan";

// Import CSS
import "./assets/admin/css/bootstrap.min.css";
import "./assets/admin/css/icons.min.css";
import "./assets/admin/css/app.css";



// Admin Layout Wrapper
const withAdminLayout = (Component) => (
  <div id="layout-wrapper">
    <Header />
    <Sidebar />
    <div className="main-content">
      <div className="content p-4">
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
      <Route path="/admin/kesehatan/data-sapi" element={withAdminLayout(DataSapi)} />
      <Route path="/admin/kesehatan/gejala" element={withAdminLayout(GejalaPenyakit)} />
      <Route path="/admin/kesehatan/riwayat" element={withAdminLayout(RiwayatPenyakit)} />
      <Route path="/admin/kesehatan/reproduksi" element={withAdminLayout(ReproduksiSapi)} />
      <Route path="/admin/kesehatan/pemeriksaan" element={withAdminLayout(PemeriksaanPenyakit)} />
      <Route path="/admin/keuangan/pemasukan" element={withAdminLayout(Pemasukan)} />
      <Route path="/admin/keuangan/pengeluaran" element={withAdminLayout(Pengeluaran)} />
      <Route path="/admin/keuangan/laporan" element={withAdminLayout(LaporanKeuangan)} />
    </Routes>

  );
}

export default App;
