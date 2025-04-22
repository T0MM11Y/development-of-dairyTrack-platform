import 'package:dairy_track/config/api/peternakan/blog.dart';
import 'package:dairy_track/modules/home/home.dart';
import 'package:dairy_track/modules/pakan_sapi/menuPakan.dart';
import 'package:dairy_track/modules/penjualan/menuPenjualan.dart';
import 'package:dairy_track/modules/peternakan/blog/allBlog.dart';
import 'package:dairy_track/modules/peternakan/blog/createBlog.dart';
import 'package:dairy_track/modules/peternakan/blog/topicBlog/create_topic_blog.dart';
import 'package:dairy_track/modules/peternakan/cow/addCow.dart';
import 'package:dairy_track/modules/peternakan/cow/allCow.dart';
import 'package:dairy_track/modules/peternakan/gallery/allGallery.dart';
import 'package:dairy_track/modules/peternakan/gallery/createGallery.dart';
import 'package:dairy_track/modules/peternakan/menuPeternakan.dart';
import 'package:dairy_track/modules/peternakan/farmer/addPeternak.dart';
import 'package:dairy_track/modules/peternakan/farmer/allPeternak.dart';
import 'package:dairy_track/modules/peternakan/supervisor/addSupervisor.dart';
import 'package:dairy_track/modules/peternakan/supervisor/allSupervisor.dart';
import 'package:dairy_track/modules/produksi_susu/menuProduction.dart';
import 'package:dairy_track/modules/produksi_susu/dataProduksiSusu/dataProduksiSusu.dart';
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
  static const String addCow = '/add-cow';
  static const String allSupervisor = '/all-supervisor';
  static const String addSupervisor = '/add-supervisor';
  static const String allBlog = '/all-blog';
  static const String addBlog = '/add-blog';
  static const String createtopicBlog = '/create-topic-blog';
  static const String allGallery = '/all-gallery';
  static const String addGallery = '/add-gallery';

  static const String pakan = '/pakan';
  static const String penjualan = '/penjualan';

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
      addCow: (context) => AddCow(),
      allSupervisor: (context) => AllSupervisor(),
      addSupervisor: (context) => AddSupervisor(),
      allBlog: (context) => AllBlog(),
      addBlog: (context) => CreateBlog(),
      createtopicBlog: (context) => CreateTopicBlog(),
      allGallery: (context) => AllGallery(),
      addGallery: (context) => CreateGallery(),

      // Pakan route
      pakan: (context) => MenuPakan(),

      // Penjualan route
      penjualan: (context) => MenuPenjualan(),
    };
  }
}
