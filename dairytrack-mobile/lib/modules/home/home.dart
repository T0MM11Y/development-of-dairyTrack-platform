import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/theme/GlobalStyle.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final HomeController _homeController = HomeController();
  String userName = HomeController.defaultUserName;
  String userEmail = HomeController.defaultUserEmail;
  bool isLoading = false;

  // Statistics data
  int totalCows = 0;
  double totalIncome = 0;
  int sickCows = 0;
  double milkProductionAvg = 0;

  @override
  void initState() {
    super.initState();
    _initializeData();
    _loadStatistics();
  }

  Future<void> _initializeData() async {
    setState(() => isLoading = true);
    await _loadUserData();
    setState(() => isLoading = false);
  }

  Future<void> _loadUserData() async {
    try {
      final userData = await _homeController.loadUserData();
      setState(() {
        userName = userData['userName'] ?? HomeController.defaultUserName;
        userEmail = userData['userEmail'] ?? HomeController.defaultUserEmail;
      });
    } catch (e) {
      debugPrint('Error loading user data: $e');
    }
  }

  Future<void> _loadStatistics() async {
    try {
      // In a real app, you would fetch these from your API
      // For now, we'll use mock data
      setState(() {
        totalCows = 42;
        totalIncome = 12500000;
        sickCows = 3;
        milkProductionAvg = 12.5;
      });
    } catch (e) {
      debugPrint('Error loading statistics: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async => false,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: AppBar(
          title: const Text('Home'),
          backgroundColor: Globalstyle.primaryAccent,
          actions: [
            IconButton(
              color: Colors.white,
              icon: const Icon(Icons.notifications),
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: const Text('Notifikasi'),
                    content: const Text('Tidak ada notifikasi baru.'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('OK'),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
        drawer: _buildDrawer(context),
        body: _buildBody(),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
            decoration: BoxDecoration(
              color: Globalstyle.primaryAccent,
            ),
            accountName: Text(
              userName,
              style: TextStyle(
                color: Globalstyle.primaryBackground,
                fontWeight: FontWeight.bold,
              ),
            ),
            accountEmail: Text(
              userEmail,
              style: TextStyle(
                color: Globalstyle.primaryBackground,
              ),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Globalstyle.secondaryAccent,
              child: Text(
                userName.isNotEmpty ? userName[0].toUpperCase() : 'N',
                style: TextStyle(
                  fontSize: 24.0,
                  color: Globalstyle.primaryBackground,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _buildDrawerItem(
                  icon: Icons.person,
                  title: 'Data Peternak',
                  onTap: () => Navigator.pushNamed(context, '/all-peternak'),
                  textStyle: const TextStyle(
                    fontSize: 12,
                    letterSpacing: 1.0,
                  ),
                ),
                _buildDrawerItem(
                  icon: Icons.pets,
                  title: 'Data Sapi',
                  onTap: () => Navigator.pushNamed(context, '/all-cow'),
                  textStyle: const TextStyle(
                    fontSize: 12,
                    letterSpacing: 1.0,
                  ),
                ),
                _buildDrawerItem(
                  icon: Icons.supervisor_account,
                  title: 'Data Supervisor',
                  onTap: () => Navigator.pushNamed(context, '/all-supervisor'),
                  textStyle: const TextStyle(
                    fontSize: 12,
                    letterSpacing: 1.0,
                  ),
                ),
                const Divider(),
                _buildDrawerItem(
                  icon: Icons.article,
                  title: 'Blog Articles',
                  onTap: () => Navigator.pushNamed(context, '/all-blog'),
                  textStyle: const TextStyle(
                    fontSize: 12,
                    letterSpacing: 1.0,
                  ),
                ),
                _buildDrawerItem(
                  icon: Icons.photo_library,
                  title: 'Gallery',
                  onTap: () => Navigator.pushNamed(context, '/all-gallery'),
                  textStyle: const TextStyle(
                    fontSize: 12,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text(
                'Logout',
                style: TextStyle(
                    color: Colors.red,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    letterSpacing: 1.0),
              ),
              onTap: () => _homeController.showLogoutConfirmation(context),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    return Stack(
      children: [
        Container(
          color: Colors.white,
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.all(20.0),
                color: const Color.fromARGB(255, 128, 128, 128),
                child: Center(
                  child: StreamBuilder<DateTime>(
                    stream: Stream.periodic(
                        const Duration(seconds: 1), (_) => DateTime.now()),
                    builder: (context, snapshot) {
                      if (!snapshot.hasData) {
                        return const Text(
                          'Loading...',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        );
                      }
                      final now = snapshot.data!;
                      final formattedDate =
                          '${_getDayName(now.weekday)}, ${now.day}-${now.month}-${now.year}';
                      final formattedTime =
                          '${now.hour == 0 ? 12 : now.hour > 12 ? now.hour - 12 : now.hour}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')} ${now.hour >= 12 ? 'PM' : 'AM'}';
                      final greeting = _getGreeting(now.hour);
                      return Align(
                        alignment: Alignment.centerLeft,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '$greeting, $userName!',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                fontFamily: "'Roboto Mono', monospace",
                                letterSpacing: 0.6,
                              ),
                            ),
                            const SizedBox(height: 10),
                            Text(
                              formattedDate,
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 12,
                                  fontStyle: FontStyle.italic,
                                  fontFamily: "'Roboto Mono', monospace",
                                  fontWeight: FontWeight.bold,
                                  letterSpacing: 1.2),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              formattedTime,
                              style: const TextStyle(
                                color: Colors.greenAccent,
                                fontSize: 13,
                                fontFamily: "'Roboto Mono', monospace",
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2.5,
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
              // Statistics Section
              Container(
                padding:
                    const EdgeInsets.symmetric(vertical: 10, horizontal: 20),
                color: Colors.grey[200],
                child: Column(
                  children: [
                    const Text(
                      'Statistik Hari Ini',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatCard(
                          icon: Icons.pets,
                          title: 'Total Sapi',
                          value: totalCows.toString(),
                          color: Colors.blue,
                        ),
                        _buildStatCard(
                          icon: Icons.attach_money,
                          title: 'Pendapatan',
                          value: 'Rp${totalIncome.toStringAsFixed(0)}',
                          color: Colors.green,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildStatCard(
                          icon: Icons.medical_services,
                          title: 'Sapi Sakit',
                          value: sickCows.toString(),
                          color: Colors.orange,
                        ),
                        _buildStatCard(
                          icon: Icons.local_drink,
                          title: 'Rata-rata Susu (L)',
                          value: milkProductionAvg.toStringAsFixed(1),
                          color: Colors.purple,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Container(
                  color: Colors.white,
                  padding: const EdgeInsets.only(top: 1, left: 29, right: 29),
                  child: Center(
                    child: GridView.count(
                      shrinkWrap: true,
                      crossAxisCount: 2,
                      crossAxisSpacing: 20,
                      mainAxisSpacing: 20,
                      childAspectRatio: 1,
                      children: [
                        _buildMenuCard(
                          context,
                          imagePath: 'assets/images/milk_production.png',
                          title: 'Produksi Susu',
                          color: Colors.blue,
                          route: '/milk-production',
                        ),
                        _buildMenuCard(
                          context,
                          imagePath: 'assets/images/pakan.png',
                          title: 'Pakan Sapi',
                          color: Colors.green,
                          route: '/pakan',
                        ),
                        _buildMenuCard(
                          context,
                          imagePath: 'assets/images/health.png',
                          title: 'Pemeriksaan Kesehatan',
                          color: Colors.red,
                          route: '/pemeriksaan-kesehatan',
                        ),
                        _buildMenuCard(
                          context,
                          imagePath: 'assets/images/money.png',
                          title: 'Penjualan',
                          color: Colors.orange,
                          route: '/penjualan',
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        if (isLoading)
          Container(
            color: Colors.black.withOpacity(0.5),
            child: const Center(
              child: CircularProgressIndicator(
                color: Globalstyle.primaryAccent,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      width: 150,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.3),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 30, color: color),
          const SizedBox(height: 5),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  String _getGreeting(int hour) {
    if (hour >= 5 && hour < 12) {
      return 'Selamat Pagi';
    } else if (hour >= 12 && hour < 18) {
      return 'Selamat Siang';
    } else {
      return 'Selamat Malam';
    }
  }

  Widget _buildMenuCard(
    BuildContext context, {
    required String imagePath,
    required String title,
    required Color color,
    required String route,
  }) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _navigateTo(context, route),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                imagePath,
                height: 80,
                width: 80,
                fit: BoxFit.cover,
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: TextStyle(
                  fontSize: 12,
                  letterSpacing: 1.2,
                  fontWeight: FontWeight.w600,
                  color: color,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  ListTile _buildDrawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    TextStyle? textStyle,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(
        title,
        style: textStyle ??
            const TextStyle(
              fontSize: 14,
              letterSpacing: 1.0,
            ),
      ),
      onTap: onTap,
    );
  }

  void _navigateTo(BuildContext context, String route) {
    Navigator.pushNamed(context, route);
  }

  String _getDayName(int weekday) {
    switch (weekday) {
      case 1:
        return 'Senin';
      case 2:
        return 'Selasa';
      case 3:
        return 'Rabu';
      case 4:
        return 'Kamis';
      case 5:
        return 'Jumat';
      case 6:
        return 'Sabtu';
      case 7:
        return 'Minggu';
      default:
        return '';
    }
  }
}

class HomeController {
  static const String defaultUserName = 'Nama Pengguna';
  static const String defaultUserEmail = 'email@example.com';
  static const String logoutErrorMessage = 'Logout gagal. Silakan coba lagi.';
  static const String generalErrorMessage =
      'Terjadi kesalahan. Silakan coba lagi.';

  Future<Map<String, String>> loadUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userData = prefs.getString("user");

      if (userData == null) {
        return _defaultUserData();
      }

      final user = jsonDecode(userData);
      return {
        'userName':
            '${user['first_name'] ?? ''} ${user['last_name'] ?? ''}'.trim(),
        'userEmail': user['email'] ?? defaultUserEmail,
      };
    } catch (e) {
      debugPrint('Error parsing user data: $e');
      return _defaultUserData();
    }
  }

  Map<String, String> _defaultUserData() {
    return {
      'userName': defaultUserName,
      'userEmail': defaultUserEmail,
    };
  }

  Future<void> logout(BuildContext context) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userData = prefs.getString("user");
      final userEmail = userData != null
          ? jsonDecode(userData)['email'] ?? "unknown@example.com"
          : "unknown@example.com";

      final response = await fetchAPI(
        "auth/logout",
        method: "POST",
        data: {"email": userEmail},
        isFormData: false,
      );

      if (response['status'] == 200) {
        await prefs.clear();
        _showSnackBar(context, "Logout berhasil!");
        await Future.delayed(const Duration(seconds: 3));
        _navigateToLogin(context);
      } else {
        _showSnackBar(context, response['message'] ?? logoutErrorMessage);
      }
    } catch (e) {
      debugPrint('Logout error: $e');
      _showSnackBar(context, generalErrorMessage);
    }
  }

  void showLogoutConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Logout'),
        content: const Text('Apakah Anda yakin ingin logout?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tidak'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              logout(context);
            },
            child: const Text('Ya'),
          ),
        ],
      ),
    );
  }

  void _showSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _navigateToLogin(BuildContext context) {
    Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
  }
}
