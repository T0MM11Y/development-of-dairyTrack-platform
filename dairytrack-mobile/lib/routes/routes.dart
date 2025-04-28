import 'package:dairy_track/config/api/peternakan/blog.dart';
import 'package:dairy_track/modules/auth/login.dart';
import 'package:dairy_track/modules/home/home.dart';

//pakan
import 'package:dairy_track/model/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:dairy_track/modules/pakan_sapi/menuPakan.dart';
import 'package:dairy_track/modules/pakan_sapi/feedType/allFeedType.dart';
import 'package:dairy_track/modules/pakan_sapi/feedType/addFeedType.dart';
import 'package:dairy_track/modules/pakan_sapi/feedType/editFeedType.dart';
import 'package:dairy_track/modules/pakan_sapi/Nutrition/listNutrition.dart';
import 'package:dairy_track/modules/pakan_sapi/feed/allFeed.dart';
import 'package:dairy_track/modules/pakan_sapi/feed/editFeed.dart';
import 'package:dairy_track/modules/pakan_sapi/feedStock/allFeedStock.dart';
import 'package:dairy_track/modules/pakan_sapi/feedStock/editFeedStock.dart';
import 'package:dairy_track/modules/pakan_sapi/feedStock/addFeedStock.dart';
import 'package:dairy_track/modules/pakan_sapi/dailyFeedSchedule/allSchedule.dart';
import 'package:dairy_track/modules/pakan_sapi/dailyFeedSchedule/addSchedule.dart';
import 'package:dairy_track/modules/pakan_sapi/dailyFeedSchedule/editSchedule.dart';
import 'package:dairy_track/modules/pakan_sapi/feedItem/listFeedItem.dart';
import 'package:dairy_track/modules/pakan_sapi/feedItem/addFeedItem.dart';
import 'package:dairy_track/modules/pakan_sapi/feedItem/editFeedItem.dart';

//susu dan peternakan
import 'package:dairy_track/modules/peternakan/blog/allBlog.dart';
import 'package:dairy_track/modules/peternakan/blog/createBlog.dart';
import 'package:dairy_track/modules/peternakan/blog/topicBlog/create_topic_blog.dart';
import 'package:dairy_track/modules/peternakan/cow/addCow.dart';
import 'package:dairy_track/modules/peternakan/cow/allCow.dart';
import 'package:dairy_track/modules/peternakan/gallery/allGallery.dart';
import 'package:dairy_track/modules/peternakan/gallery/createGallery.dart';
import 'package:dairy_track/modules/peternakan/farmer/addPeternak.dart';
import 'package:dairy_track/modules/peternakan/farmer/allPeternak.dart';
import 'package:dairy_track/modules/peternakan/supervisor/addSupervisor.dart';
import 'package:dairy_track/modules/peternakan/supervisor/allSupervisor.dart';
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

// Sales and Financial ==================================
import 'package:dairy_track/modules/penjualan/menuPenjualan.dart';
import 'package:dairy_track/model/penjualan/productType.dart';
import 'package:dairy_track/model/penjualan/product.dart';
import 'package:dairy_track/modules/penjualan/productType/listProductType.dart';
import 'package:dairy_track/modules/penjualan/productType/createProductType.dart';
import 'package:dairy_track/modules/penjualan/productType/editProductType.dart';
import 'package:dairy_track/modules/penjualan/product/listProductStock.dart';
import 'package:dairy_track/modules/penjualan/product/createProductStock.dart';
import 'package:dairy_track/modules/penjualan/product/editProductStock.dart';
import 'package:dairy_track/modules/penjualan/product/productHistory.dart';
import 'package:dairy_track/modules/penjualan/finance/listFinance.dart';

class Routes {
  // Route constants
  static const String loginn = '/login';

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
  static const String feedType = '/jenis-pakan';
  static const String addfeedType = '/tambah-jenis-pakan';
  static const String editFeedType = '/edit-feed-type';
  static const String listNutrisi = '/list-nutrisi';
  static const String feed = '/daftar-pakan';
  static const String editFeed = '/edit-pakan';
  static const String feedStock = '/stok-pakan';
  static const String editFeedStock = '/edit-stok-pakan';
  static const String addFeedStock = '/tambah-stok-pakan';
  static const String feedSchedule = '/jadwal-pakan';
  static const String addfeedSchedule = '/tambah-jadwal-pakan';
  static const String editFeedSchedule = '/edit-jadwal-pakan';
  static const String feedItem = '/item-pakan';
  static const String addfeedItem = '/tambah-item-pakan';
  static const String editfeedItem = '/edit-item-pakan';

  static const String penjualan = '/penjualan';
  static const String pemeriksaanKesehatan = '/pemeriksaan-kesehatan';

  // Pemeriksaan Penyakit Sapi
  static const String pemeriksaanPenyakitSapi =
      '/all-pemeriksaan-penyakit-sapi';
  static const String addPemeriksaanPenyakitSapi =
      '/add-pemeriksaan-penyakit-sapi';

  // Gejala Penyakit Sapi
  static const String gejalaPenyakitSapi = '/all-gejala';
  static const String addGejalaPenyakitSapi = '/add-gejala';

  // Riwayat Pemeriksaan
  static const String riwayatPemeriksaan = '/all-riwayat-penyakit-sapi';
  static const String addRiwayatPemeriksaan = '/add-riwayat-penyakit-sapi';

  // Reproduksi Sapi
  static const String reproduksiSapi = '/all-reproduksi';
  static const String addReproduksiSapi = '/add-reproduksi';

  // Sales And Financial =======================================================
  static const String listProductType = '/product-type';
  static const String createProductType = '/create-product-type';
  static const String editProductType = '/edit-product-type';
  static const String listProductStock = '/product-stock';
  static const String createProductStock = '/create-product-stock';
  static const String editProductStock = '/edit-product-stock';
  static const String productHistory = '/product-history';

  static const String listFinance = '/finance';
  // Sales And Financial =======================================================

  // Route mapping
  static Map<String, WidgetBuilder> getRoutes() {
    return {
      loginn: (context) => LoginPage(),
      // Home route
      home: (context) => const HomeScreen(),

      // Milk production routes
      milkProduction: (context) => MenuProduction(),
      dataProduksiSusu: (context) => DataProduksiSusu(),

      // Peternakan routes
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
      feedType: (context) => AllFeedTypes(),
      addfeedType: (context) => AddFeedType(),
      editFeedType: (context) => EditFeedType(
            feedType: ModalRoute.of(context)!.settings.arguments as FeedType,
          ),
      listNutrisi :(context) => NutritionListPage(),
      feed: (context) => AllFeeds(),
      editFeed: (context) => EditFeedPage(
            feed: ModalRoute.of(context)!.settings.arguments as Feed,
          ),
      feedStock: (context) => AllFeedStocks(),
      editFeedStock: (context) => EditFeedStock(
            feedStock: ModalRoute.of(context)!.settings.arguments as FeedStock,
          ),
      addFeedStock: (context) => AddFeedStock(
            preSelectedFeed:
                ModalRoute.of(context)!.settings.arguments as Feed?,
          ),
      feedSchedule: (context) => AllDailyFeedSchedules(),
      addfeedSchedule: (context) => AddDailyFeedSchedule(),
      editFeedSchedule: (context) => EditDailyFeedSchedule(),

      feedItem: (context) => DailyFeedItemsPage(),
      addfeedItem: (context) => AddFeedItemPage(),
      editfeedItem: (context) {
        final dailyFeedId = ModalRoute.of(context)!.settings.arguments as int?;
        if (dailyFeedId == null) {
          return const Scaffold(
            body: Center(child: Text('Error: Daily Feed ID not provided')),
          );
        }
        return EditFeedItemPage(dailyFeedId: dailyFeedId);
      },

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

      // Sales And Financial ===================================================================
      // Product Type

      listProductType: (context) => ListProductTypes(),
      createProductType: (context) => CreateProductType(),
      editProductType: (context) {
        final productType =
            ModalRoute.of(context)!.settings.arguments as ProdukType;
        return EditProductType(productType: productType);
      },
      listProductStock: (context) => ListProductStocks(),
      createProductStock: (context) => CreateProductStock(),
      editProductStock: (context) {
        final productStock =
            ModalRoute.of(context)!.settings.arguments as ProductStock;
        return EditProductStock(productStock: productStock);
      },
      listFinance: (context) => FinanceList(),
      productHistory: (context) => ProductHistoryList(),
      // Sales And Financial ===================================================================
    };
  }
}
