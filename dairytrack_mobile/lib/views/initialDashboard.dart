import 'package:dairytrack_mobile/views/cattleDistribution.dart';
import 'package:dairytrack_mobile/views/cowManagement/listOfCowsView.dart';
import 'package:dairytrack_mobile/views/highlights/blogView.dart';
import 'package:dairytrack_mobile/views/highlights/galleryView.dart';
import 'package:dairytrack_mobile/views/milkingView.dart';
import 'package:dairytrack_mobile/views/usersManagement/listOfUsersView.dart';
import 'package:flutter/material.dart';
import 'loginView.dart'; // Import LoginView
import 'package:shared_preferences/shared_preferences.dart';
import '../controller/APIURL1/loginController.dart';

class InitialDashboard extends StatefulWidget {
  @override
  _InitialDashboardState createState() => _InitialDashboardState();
}

class _InitialDashboardState extends State<InitialDashboard> {
  String _userName = "Guest";
  String _userEmail = "";
  bool _isLoggedIn = false;
  final LoginController _loginController = LoginController();

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userName = prefs.getString('userName') ?? "Guest";
      _userEmail = prefs.getString('userEmail') ?? "";
      _isLoggedIn = prefs.containsKey('userId');
    });
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await _loginController.logout();
    await prefs.clear(); // Clear all shared preferences
    setState(() {
      _userName = "Guest";
      _userEmail = "";
      _isLoggedIn = false;
    });
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginView()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200], // Light background
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: Text(
          "DairyTrack Dashboard",
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.blueGrey[800],
        elevation: 0, // Remove shadow
        actions: [
          if (_isLoggedIn)
            PopupMenuButton<String>(
              offset: Offset(0, 50),
              onSelected: (String item) {
                if (item == 'logout') {
                  _logout();
                }
              },
              itemBuilder: (BuildContext context) {
                return [
                  PopupMenuItem<String>(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout, color: Colors.blueGrey[800]),
                        SizedBox(width: 8),
                        Text('Logout'),
                      ],
                    ),
                  ),
                ];
              },
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: Text(
                    _userName.substring(0, 2).toUpperCase(),
                    style: TextStyle(color: Colors.blueGrey[800], fontSize: 18),
                  ),
                ),
              ),
            )
          else
            IconButton(
              icon: Icon(Icons.login, color: Colors.white),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => LoginView()),
                );
              },
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.3),
                    spreadRadius: 2,
                    blurRadius: 7,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Welcome to DairyTrack, $_userName!",
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w700,
                      color: Colors.blueGrey[800],
                    ),
                  ),
                  SizedBox(height: 8),
                  if (_userEmail.isNotEmpty)
                    Text(
                      "Email: $_userEmail",
                      style:
                          TextStyle(fontSize: 18, color: Colors.blueGrey[600]),
                    ),
                ],
              ),
            ),
            SizedBox(height: 24),
            Text(
              "Explore your options:",
              style: TextStyle(
                  fontSize: 20,
                  color: Colors.blueGrey[600],
                  fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 16),
            GridView.count(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              children: [
                _buildDashboardCard(
                  icon: Icons.analytics,
                  title: "Analytics",
                  color: Colors.blue,
                  onTap: () {},
                ),
                _buildDashboardCard(
                  icon: Icons.vertical_align_center,
                  title: "Cow Management",
                  color: Colors.green,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ListOfCowsView(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  icon: Icons.supervised_user_circle_outlined,
                  title: "Users Management",
                  color: Colors.indigo,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => ListOfUsersView(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  icon: Icons.map,
                  title: "Cattle Distribution",
                  color: Colors.orange,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => CattleDistribution(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  icon: Icons.photo,
                  title: "Gallery",
                  color: Colors.teal,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => GalleryView(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  icon: Icons.article,
                  title: "Blog",
                  color: Colors.purple,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => BlogView(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  icon: Icons.coffee_maker,
                  title: "Milking",
                  color: Colors.brown,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => MilkingView(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  icon: Icons.exit_to_app,
                  title: "Logout",
                  color: Colors.redAccent,
                  onTap: () {
                    _logout();
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDashboardCard({
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 5,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 40, color: color),
            SizedBox(height: 8),
            Text(
              title,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Colors.blueGrey[800],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
