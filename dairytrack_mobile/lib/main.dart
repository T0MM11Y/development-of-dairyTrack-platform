import 'package:dairytrack_mobile/views/initialDashboard.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Tambahkan import untuk SharedPreferences
import 'views/loginView.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized(); // Pastikan binding diinisialisasi
  await clearSession(); // Hapus sesi lokal sebelum aplikasi dijalankan
  runApp(const MyApp());
}

Future<void> clearSession() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.clear(); // Hapus semua data yang tersimpan di SharedPreferences
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
      home: InitialDashboard(), // Ganti dengan LoginView jika diperlukan
    );
  }
}
