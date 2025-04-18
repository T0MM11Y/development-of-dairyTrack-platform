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

  @override
  void initState() {
    super.initState();
    _initializeData();
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
      // Handle error if needed
      debugPrint('Error loading user data: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Home'),
          backgroundColor: Globalstyle.primaryAccent,
        ),
        drawer: _buildDrawer(context),
        body: _buildBody(),
      ),
    );
  }

  Widget _buildDrawer(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: BoxDecoration(
              color: Globalstyle.primaryAccent,
            ),
            accountName: Text(
              userName,
              style: TextStyle(
                color: Globalstyle.primaryBackground,
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
                ),
              ),
            ),
          ),
          _buildDrawerItem(
            icon: Icons.home,
            title: 'Peternakan',
            onTap: () => _navigateTo(context, '/farm'),
          ),
          _buildDrawerItem(
            icon: Icons.local_drink,
            title: 'Produksi Susu',
            onTap: () => _navigateTo(context, '/milk-production'),
          ),
          _buildDrawerItem(
            icon: Icons.grass,
            title: 'Pakan Sapi',
            onTap: () => _navigateTo(context, '/cattle-feed'),
          ),
          _buildDrawerItem(
            icon: Icons.shopping_cart,
            title: 'Penjualan',
            onTap: () => _navigateTo(context, '/sales'),
          ),
          const Divider(),
          _buildDrawerItem(
            icon: Icons.logout,
            title: 'Logout',
            onTap: () => _homeController.showLogoutConfirmation(context),
          ),
        ],
      ),
    );
  }

  ListTile _buildDrawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      onTap: onTap,
    );
  }

  Widget _buildBody() {
    return Stack(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 50.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Add your main content here
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

  void _navigateTo(BuildContext context, String route) {
    Navigator.pushNamed(context, route);
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
