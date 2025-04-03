import 'package:dairy_track/modules/auth/login.dart';
import 'package:dairy_track/routes/routes.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter App',
      initialRoute: '/',
      routes: {
        '/': (context) => const LoginPage(),
        ...Routes.getRoutes(),
      },
    );
  }
}
