import 'package:dairy_track/modules/home/home.dart';
import 'package:dairy_track/modules/pakan_sapi/menuPakan.dart';
import 'package:dairy_track/modules/penjualan/menuPenjualan.dart';
import 'package:dairy_track/modules/peternakan/cow/allCow.dart';
import 'package:dairy_track/modules/peternakan/menuPeternakan.dart';
import 'package:dairy_track/modules/peternakan/farmer/addPeternak.dart';
import 'package:dairy_track/modules/peternakan/farmer/allPeternak.dart';
import 'package:dairy_track/modules/produksi_susu/menuProduction.dart';
import 'package:dairy_track/modules/produksi_susu/dataProduksiSusu/dataProduksiSusu.dart';
// === Import untuk Pemeriksaan Kesehatan ===
import 'package:dairy_track/modules/pemeriksaan_kesehatan/menuPemeriksaanKesehatan.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/gejala_penyakit_sapi/allGejala.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/gejala_penyakit_sapi/addGejala.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/pemeriksaan_penyakit_sapi/allPemeriksaanPenyakitSapi.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/pemeriksaan_penyakit_sapi/addPemeriksaanPenyakitSapi.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/riwayat_penyakit_sapi/allRiwayatPenyakitSapi.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/riwayat_penyakit_sapi/addRiwayatPenyakitSapi.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/reproduksi_sapi/allReproduksi.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/reproduksi_sapi/addReproduksi.dart';
import 'package:flutter/material.dart';

class Routes {
  // Route constants
  static const String home = '/home';
  static const String milkProduction = '/milk-production';
  static const String dataProduksiSusu = '/data-produksi-susu';
  static const String peternakan = '/peternakan';
  static const String allPeternak = '/all-peternak';
  static const String addPeternak = '/add-peternak';
  static const String allCow = '/all-cow';
  static const String pakan = '/pakan';
  static const String penjualan = '/penjualan';
 // Pemeriksaan kesehatan (menu)
  static const String pemeriksaanKesehatan = '/pemeriksaan-kesehatan';

  // Pemeriksaan Penyakit Sapi
  static const String pemeriksaanPenyakitSapi = '/all-pemeriksaan-penyakit-sapi';
  static const String addPemeriksaanPenyakitSapi = '/add-pemeriksaan-penyakit-sapi';

  // Gejala Penyakit Sapi
  static const String gejalaPenyakitSapi = '/all-gejala';
  static const String addGejalaPenyakitSapi = '/add-gejala';

  // Riwayat Pemeriksaan
  static const String riwayatPemeriksaan = '/all-riwayat-penyakit-sapi';
  static const String addRiwayatPemeriksaan = '/add-riwayat-penyakit-sapi';

  // Reproduksi Sapi
  static const String reproduksiSapi = '/all-reproduksi';
  static const String addReproduksiSapi = '/add-reproduksi';

  // Route mapping
  static Map<String, WidgetBuilder> getRoutes() {
    return {
      // Home route
      home: (context) => const HomeScreen(),

      // Milk production routes
      milkProduction: (context) => MenuProduction(),
      dataProduksiSusu: (context) => DataProduksiSusu(),

      // Peternakan routes
      peternakan: (context) => MenuPeternakan(),
      allPeternak: (context) => AllPeternak(),
      addPeternak: (context) => AddPeternak(),
      allCow: (context) => AllCow(),

      // Pakan route
      pakan: (context) => MenuPakan(),

      // Penjualan route
      penjualan: (context) => MenuPenjualan(),
      // Pemeriksaan Kesehatan (menu utama)
      pemeriksaanKesehatan: (context) => MenuPemeriksaanKesehatan(),

      // Pemeriksaan Penyakit Sapi
      pemeriksaanPenyakitSapi: (context) => AllPemeriksaanPenyakitSapi(),
      addPemeriksaanPenyakitSapi: (context) => AddPemeriksaanPenyakitSapi(),

      // Gejala Penyakit Sapi
      gejalaPenyakitSapi: (context) => AllGejala(),
      addGejalaPenyakitSapi: (context) => AddGejala(),

      // Riwayat Pemeriksaan
      riwayatPemeriksaan: (context) => AllRiwayatPenyakitSapi(),
      addRiwayatPemeriksaan: (context) => AddRiwayatPenyakitSapi(),

      // Reproduksi Sapi
      reproduksiSapi: (context) => AllReproduksi(),
      addReproduksiSapi: (context) => AddReproduksi(),
    };
  }
}
