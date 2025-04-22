import 'package:dairy_track/modules/home/home.dart';
import 'package:flutter/material.dart';

class Routes {
  static const String home = '/home';

  static Map<String, WidgetBuilder> getRoutes() {
    return {
      home: (context) => const HomeScreen(),
    };
  }
}
