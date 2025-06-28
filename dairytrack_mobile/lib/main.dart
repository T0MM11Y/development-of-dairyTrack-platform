import 'package:dairytrack_mobile/controller/APIURL2/providers/financeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/orderProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockHistoryProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/salesTransactionProvider.dart';
import 'package:dairytrack_mobile/services/notificationService.dart';
import 'package:dairytrack_mobile/views/initialDashboard.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'routes/route.dart'; // Import routing system

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await clearSession();

  // Inisialisasi timezone dengan package yang benar
  await _configureLocalTimeZone();

  // Inisialisasi notification service
  await NotificationService().initialize();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ProductStockHistoryProvider()),
        ChangeNotifierProvider(create: (_) => StockProvider()),
        ChangeNotifierProvider(create: (_) => ProductTypeProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => FinanceProvider()),
        ChangeNotifierProvider(create: (_) => SalesTransactionProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

Future<void> _configureLocalTimeZone() async {
  tz.initializeTimeZones();
  final String timeZoneName = 'Asia/Jakarta'; // Sesuaikan dengan lokasi Anda
  tz.setLocalLocation(tz.getLocation(timeZoneName));
}

Future<void> clearSession() async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.clear();
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TSTH² DairyTrack',
      debugShowCheckedModeBanner: false,

      // Configure routing system
      initialRoute: '/initial', // Route awal ke InitialDashboard
      onGenerateRoute: (settings) {
        // Handle initial dashboard route
        if (settings.name == '/initial') {
          return MaterialPageRoute(
            builder: (context) => InitialDashboard(),
            settings: settings,
          );
        }

        // Use AppRoutes for other routes
        return AppRoutes.generateRoute(settings);
      },

      // Remaining code unchanged...
      // Handle unknown routes
      onUnknownRoute: (settings) {
        return MaterialPageRoute(
          builder: (context) => Scaffold(
            appBar: AppBar(
              title: Text('Page Not Found'),
              backgroundColor: Color(0xFF1E3A8A),
              foregroundColor: Colors.white,
            ),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.error_outline,
                    size: 64,
                    color: Color(0xFFEF4444),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Page Not Found',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF111827),
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Route "${settings.name}" not found',
                    style: TextStyle(
                      fontSize: 16,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                  SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.pushReplacementNamed(context, '/initial');
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Color(0xFF059669),
                      foregroundColor: Colors.white,
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text('Go to Home'),
                  ),
                ],
              ),
            ),
          ),
        );
      },

      // Theme configuration
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
    );
  }
}
