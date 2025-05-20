import 'package:dairytrack_mobile/views/initialDashboard.dart';
import 'package:flutter/material.dart';
import 'views/loginView.dart'; // Tambahkan import untuk LoginView

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DairyTrack',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      home: InitialDashboard(), // Ganti dengan LoginView
    );
  }
}
