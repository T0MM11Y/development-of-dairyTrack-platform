import 'package:dairy_track/modules/home/home.dart';
import 'package:dairy_track/modules/produksi_susu/all-production.dart';
import 'package:flutter/material.dart';

class Routes {
  static const String home = '/home';
  static const String milkProduction = '/milk-production';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      home: (context) => const HomeScreen(),
      milkProduction: (context) => DataProduksiSusu(),
    };
  }
}
