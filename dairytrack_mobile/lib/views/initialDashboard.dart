import 'package:dairytrack_mobile/views/cattleDistribution.dart';
import 'package:dairytrack_mobile/views/cowManagement/listOfCowsView.dart';
import 'package:dairytrack_mobile/views/highlights/blogView.dart';
import 'package:dairytrack_mobile/views/highlights/galleryView.dart';
import 'package:dairytrack_mobile/views/milkingView.dart';
import 'package:dairytrack_mobile/views/usersManagement/listOfUsersView.dart';
import 'package:dairytrack_mobile/views/feedManagement/feedType/listFeedType.dart';
import 'package:dairytrack_mobile/views/feedManagement/nutrition/listNutrition.dart';
import 'package:dairytrack_mobile/views/feedManagement/feed/listFeed.dart';
import 'package:dairytrack_mobile/views/feedManagement/feedStock/listFeedStock.dart';
import 'package:flutter/material.dart';
import 'loginView.dart'; // Import LoginView
import 'package:shared_preferences/shared_preferences.dart';
import '../controller/APIURL1/loginController.dart';

class InitialDashboard extends StatefulWidget {
  @override
  _InitialDashboardState createState() => _InitialDashboardState();
}

class _InitialDashboardState extends State<InitialDashboard>
    with SingleTickerProviderStateMixin {
  String _userName = "Guest";
  String _userEmail = "";
  bool _isLoggedIn = false;
  final LoginController _loginController = LoginController();
  int _currentIndex = 0;
  late AnimationController _animationController;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _animationController = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
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

  Widget _buildHomeContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome card with animation
          TweenAnimationBuilder(
            tween: Tween<double>(begin: 0.0, end: 1.0),
            duration: Duration(milliseconds: 800),
            builder: (context, double value, child) {
              return Opacity(
                opacity: value,
                child: Transform.translate(
                  offset: Offset(0, (1 - value) * 20),
                  child: child,
                ),
              );
            },
            child: Container(
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.blueGrey.shade800, Colors.blueGrey.shade600],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.4),
                    spreadRadius: 2,
                    blurRadius: 10,
                    offset: Offset(0, 5),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: Colors.white,
                        radius: 30,
                        child: Text(
                          _userName
                              .substring(0, _userName.length > 1 ? 2 : 1)
                              .toUpperCase(),
                          style: TextStyle(
                              color: Colors.blueGrey[800],
                              fontWeight: FontWeight.bold,
                              fontSize: 20),
                        ),
                      ),
                      SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Welcome back,",
                              style: TextStyle(
                                fontSize: 16,
                                color: Colors.white70,
                              ),
                            ),
                            Text(
                              _userName,
                              style: TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                            if (_userEmail.isNotEmpty)
                              Text(
                                _userEmail,
                                style: TextStyle(
                                    fontSize: 14, color: Colors.white70),
                                overflow: TextOverflow.ellipsis,
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          SizedBox(height: 24),

          // Quick stats section
          Text(
            "Quick Stats",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.blueGrey[800],
            ),
          ),
          SizedBox(height: 16),

          // Stats cards
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  title: "Milk Today",
                  value: "120L",
                  icon: Icons.opacity,
                  color: Colors.blue,
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  title: "Active Cows",
                  value: "45",
                  icon: Icons.pets,
                  color: Colors.green,
                ),
              ),
            ],
          ),

          SizedBox(height: 24),

          // Recent activities section
          Text(
            "Recent Activities",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.blueGrey[800],
            ),
          ),
          SizedBox(height: 16),

          _buildActivityItem(
            title: "Morning Milking Complete",
            time: "Today, 6:30 AM",
            icon: Icons.check_circle,
            color: Colors.green,
          ),
          _buildActivityItem(
            title: "New Cow Added: Holstein #248",
            time: "Yesterday, 3:45 PM",
            icon: Icons.add_circle,
            color: Colors.blue,
          ),
          _buildActivityItem(
            title: "Vaccination Scheduled",
            time: "May 24, 2025",
            icon: Icons.event,
            color: Colors.orange,
          ),

          SizedBox(height: 24),

          // Quick actions section
          Text(
            "Quick Actions",
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w600,
              color: Colors.blueGrey[800],
            ),
          ),
          SizedBox(height: 16),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildQuickAction(
                icon: Icons.add_circle,
                label: "Add Cow",
                color: Colors.green,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => ListOfCowsView()),
                  );
                },
              ),
              _buildQuickAction(
                icon: Icons.opacity,
                label: "Record Milk",
                color: Colors.blue,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => MilkingView()),
                  );
                },
              ),
              _buildQuickAction(
                icon: Icons.photo_camera,
                label: "Gallery",
                color: Colors.teal,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => GalleryView()),
                  );
                },
              ),
              _buildQuickAction(
                icon: Icons.map,
                label: "Map",
                color: Colors.orange,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => CattleDistribution()),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAnalyticsContent() {
    return Center(
      child: Text("Analytics Coming Soon", style: TextStyle(fontSize: 20)),
    );
  }

  Widget _buildManagementContent() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text("Management Options",
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          SizedBox(height: 30),
          Wrap(
            spacing: 20,
            runSpacing: 20,
            alignment: WrapAlignment.center,
            children: [
              _buildManagementOption(
                title: "Cow Management",
                icon: Icons.pets,
                color: Colors.green,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => ListOfCowsView()),
                  );
                },
              ),
              _buildManagementOption(
                title: "Users Management",
                icon: Icons.people,
                color: Colors.indigo,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => ListOfUsersView()),
                  );
                },
              ),
              _buildManagementOption(
                title: "Milking Records",
                icon: Icons.opacity,
                color: Colors.blue,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => MilkingView()),
                  );
                },
              ),
              _buildManagementOption(
                title: "Distribution Map",
                icon: Icons.map,
                color: Colors.orange,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (context) => CattleDistribution()),
                  );
                },
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContentSection() {
    switch (_currentIndex) {
      case 0:
        return _buildHomeContent();
      case 1:
        return _buildAnalyticsContent();
      case 2:
        return _buildManagementContent();
      default:
        return _buildHomeContent();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(
          "DairyTrack",
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.blueGrey[800],
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {
              // Show notifications
            },
          ),
          SizedBox(width: 8),
          IconButton(
            icon: Icon(
              _isLoggedIn
                  ? Icons.logout
                  : Icons.login, // Ganti ikon berdasarkan status login
              color: Colors.white,
            ),
            onPressed: () {
              if (_isLoggedIn) {
                // Tampilkan dialog konfirmasi sebelum logout
                showDialog(
                  context: context,
                  builder: (BuildContext context) {
                    return AlertDialog(
                      title: Text("Logout"),
                      content: Text("Are you sure you want to logout?"),
                      actions: [
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pop(); // Tutup dialog
                          },
                          child: Text("Cancel"),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.of(context).pop(); // Tutup dialog
                            _logout(); // Panggil fungsi logout
                          },
                          child: Text("Logout"),
                        ),
                      ],
                    );
                  },
                );
              } else {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) =>
                          LoginView()), // Navigasi ke halaman login
                );
              }
            },
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            DrawerHeader(
              decoration: BoxDecoration(
                color: Colors.blueGrey[800],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.white,
                    radius: 30,
                    child: Text(
                      _userName
                          .substring(0, _userName.length > 1 ? 2 : 1)
                          .toUpperCase(),
                      style: TextStyle(
                          color: Colors.blueGrey[800],
                          fontSize: 20,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                  SizedBox(height: 12),
                  Text(
                    _userName,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  if (_userEmail.isNotEmpty)
                    Text(
                      _userEmail,
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 14,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
            _buildDrawerItem(
              icon: Icons.dashboard,
              title: "Dashboard",
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _currentIndex = 0;
                });
              },
              isSelected: _currentIndex == 0,
            ),
            _buildDrawerItem(
              icon: Icons.analytics,
              title: "Analytics",
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _currentIndex = 1;
                });
              },
              isSelected: _currentIndex == 1,
            ),
            _buildDrawerItem(
              icon: Icons.manage_accounts,
              title: "Management",
              onTap: () {
                Navigator.pop(context);
                setState(() {
                  _currentIndex = 2;
                });
              },
              isSelected: _currentIndex == 2,
            ),
            _buildDrawerItem(
              icon: Icons.pets,
              title: "Cow Management",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ListOfCowsView()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.people,
              title: "Users Management",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => ListOfUsersView()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.opacity,
              title: "Milking Records",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => MilkingView()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.map,
              title: "Cattle Distribution",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => CattleDistribution()),
                );
              },
            ),
            Divider(),
            _buildDrawerItem(
              icon: Icons.photo_library,
              title: "Feed Type",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => FeedTypeView()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.photo_library,
              title: "Nutrition",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => NutrisiView()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.photo_library,
              title: "Feed",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => FeedView()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.photo_library,
              title: "Feed Stock",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => FeedStockView()),
                );
              },
            ),
            Divider(),
            _buildDrawerItem(
              icon: Icons.photo_library,
              title: "Gallery",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => GalleryView()),
                );
              },
            ),
            _buildDrawerItem(
              icon: Icons.article,
              title: "Blog",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => BlogView()),
                );
              },
            ),
            Divider(),
            _buildDrawerItem(
              icon: Icons.settings,
              title: "Settings",
              onTap: () {
                Navigator.pop(context);
                // Navigate to settings
              },
            ),
            _buildDrawerItem(
              icon: Icons.exit_to_app,
              title: "Logout",
              onTap: () {
                Navigator.pop(context);
                _logout();
              },
            ),
          ],
        ),
      ),
      body: _buildContentSection(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        selectedItemColor: Colors.blueGrey[800],
        unselectedItemColor: Colors.grey,
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: "Home",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.analytics),
            label: "Analytics",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.manage_accounts),
            label: "Management",
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // Quick action
          showModalBottomSheet(
            context: context,
            builder: (BuildContext context) {
              return Container(
                padding: EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "Quick Actions",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildQuickAction(
                          icon: Icons.add_circle,
                          label: "Add Cow",
                          color: Colors.green,
                          onTap: () {
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => ListOfCowsView()),
                            );
                          },
                        ),
                        _buildQuickAction(
                          icon: Icons.opacity,
                          label: "Record Milk",
                          color: Colors.blue,
                          onTap: () {
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => MilkingView()),
                            );
                          },
                        ),
                        _buildQuickAction(
                          icon: Icons.person_add,
                          label: "New User",
                          color: Colors.indigo,
                          onTap: () {
                            Navigator.pop(context);
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                  builder: (context) => ListOfUsersView()),
                            );
                          },
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          );
        },
        backgroundColor: Colors.blueGrey[800],
        child: Icon(Icons.add),
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isSelected = false,
  }) {
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? Colors.blueGrey[800] : Colors.grey[600],
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? Colors.blueGrey[800] : Colors.black87,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      onTap: onTap,
      tileColor: isSelected ? Colors.grey[200] : null,
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.2),
            spreadRadius: 1,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: Colors.grey[600],
                  fontSize: 14,
                ),
              ),
              Icon(
                icon,
                color: color,
                size: 20,
              ),
            ],
          ),
          SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: Colors.blueGrey[800],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem({
    required String title,
    required String time,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 2,
            offset: Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: Colors.blueGrey[800],
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  time,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAction({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: color,
              size: 24,
            ),
          ),
          SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.blueGrey[700],
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildManagementOption({
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: 150,
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.2),
              spreadRadius: 1,
              blurRadius: 5,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 30, color: color),
            ),
            SizedBox(height: 12),
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
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
