import 'package:dairytrack_mobile/views/cowManagement/listOfCowsView.dart';
import 'package:dairytrack_mobile/views/usersManagement/listOfUsersView.dart';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:animate_do/animate_do.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:async';
import 'dart:math';

// Import notification controller and widget
import '../controller/APIURL1/notificationController.dart';
import '../widgets/notifications.dart';
import 'loginView.dart';

//Healthcheck
import '../views/HealthCheckManagement/HealthCheck/listHealthChecks.dart';
import '../views/HealthCheckManagement/Symptom/listSymptoms.dart';
import '../views/HealthCheckManagement/DiseaseHistory/listDiseaseHistory.dart';
import '../views/HealthCheckManagement/Reproduction/listReproduction.dart';
import '../views/HealthCheckManagement/HealthDashboard/dashboard.dart';

// Feed
import 'package:dairytrack_mobile/views/feedManagement/dailyFeedSchedule/listSchedule.dart';
import 'package:dairytrack_mobile/views/feedManagement/dailyFeedItem/listFeedItem.dart';
import 'package:dairytrack_mobile/views/feedManagement/feed/listFeed.dart';
import 'package:dairytrack_mobile/views/feedManagement/feedStock/listFeedStock.dart';
import 'package:dairytrack_mobile/views/feedManagement/feedType/listFeedType.dart';
import 'package:dairytrack_mobile/views/feedManagement/nutrition/listNutrition.dart';

class InitialSupervisorDashboard extends StatefulWidget {
  @override
  _InitialSupervisorDashboardState createState() =>
      _InitialSupervisorDashboardState();
}

class _InitialSupervisorDashboardState extends State<InitialSupervisorDashboard>
    with TickerProviderStateMixin {
  // Animation controllers
  late AnimationController _animationController;
  late AnimationController _notificationBadgeController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _notificationBadgeAnimation;

  // Navigation state
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // Notification controller and variables
  final NotificationController _notificationController =
      NotificationController();
  int unreadCount = 0;
  List<dynamic> recentNotifications = [];
  Timer? _notificationTimer;

  Map<String, dynamic>? currentUser;
  bool isLoading = true;
  bool _localeInitialized = false;

  // Stats data
  int totalCows = 0;
  int totalFarmers = 0;
  int totalAdmins = 0;
  int totalSupervisors = 0;
  int totalBlogs = 0;
  int totalGalleries = 0;
  double todayMilkProduction = 0.0;

  // Lactation distribution data
  List<LactationData> lactationData = [];

  // Supervisor navigation items
  List<NavigationItem> get navigationItems => [
        NavigationItem(
          icon: Icons.dashboard,
          label: 'Dashboard',
          route: 'dashboard',
          widget: () => InitialSupervisorDashboard(),
        ),
        NavigationItem(
          icon: Icons.people,
          label: 'Kelola Farmer',
          route: 'farmers',
          widget: () => ListOfUsersView(),
        ),
        NavigationItem(
          icon: Icons.pets,
          label: 'Data Sapi',
          route: 'cattle',
          widget: () => ListOfCowsView(),
        ),
        NavigationItem(
          icon: Icons.analytics,
          label: 'Analisis',
          route: 'analytics',
          widget: () => Container(), // Replace with actual page
        ),
        NavigationItem(
          icon: Icons.article,
          label: 'Blog',
          route: 'blog',
          widget: () => Container(), // Replace with actual page
        ),
        NavigationItem(
          icon: Icons.photo_library,
          label: 'Gallery',
          route: 'gallery',
          widget: () => Container(), // Replace with actual page
        ),
              NavigationItem(
        icon: Icons.medical_services,
        label: 'Pemeriksaan Kesehatan',
        route: 'health-checks',
        widget: () => HealthCheckListView(),
      ),
      NavigationItem(
        icon: Icons.visibility,
        label: 'Gejala',
        route: 'symptoms',
        widget: () => SymptomListView(),
      ),
      NavigationItem(
        icon: Icons.coronavirus,
        label: 'Riwayat Penyakit',
        route: 'disease-history',
        widget: () => DiseaseHistoryListView(),
      ),
      NavigationItem(
        icon: Icons.pregnant_woman,
        label: 'Reproduksi',
        route: 'reproduction',
        widget: () => ReproductionListView(),
      ),
       NavigationItem(
          icon: Icons.monitor_heart,
          label: 'HealthDashboard',
          route: 'health-dashboard',
          widget: () => HealthDashboardView(),
        ),
      NavigationItem(
          icon: Icons.category,
          label: 'Jenis Pakan',
          route: 'feed-type',
          widget: () => FeedTypeView(),
        ),
        NavigationItem(
          icon: Icons
              .local_florist, // Changed: 'local_florist' better symbolizes nutrition with a natural, plant-based connotation.
          label: 'Jenis Nutrisi',
          route: 'nutrition',
          widget: () => NutrisiView(),
        ),
        NavigationItem(
          icon: Icons.kitchen,
          label: 'Pakan',
          route: 'feed',
          widget: () => FeedView(),
        ),
        NavigationItem(
          icon: Icons.inventory,
          label: 'Stock Pakan',
          route: 'feed-stock',
          widget: () => FeedStockList(),
        ),
        NavigationItem(
          icon: Icons.event,
          label: 'Feed Schedule',
          route: 'feed-schedule',
          widget: () => DailyFeedView(),
        ),
        NavigationItem(
          icon: Icons.checklist,
          label: 'Feed Item Harian',
          route: 'feed-item',
          widget: () => DailyFeedItemsPage(),
        ),
      ];

  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    try {
      // Initialize Indonesian locale first
      await initializeDateFormatting('id_ID', null);
      _localeInitialized = true;
    } catch (e) {
      print('Failed to initialize Indonesian locale: $e');
      _localeInitialized = false;
    }

    _initializeAnimations();
    _loadUserData();
    _loadDashboardData();
    _startNotificationPolling();
    _animationController.forward();
  }

  void _initializeAnimations() {
    _animationController = AnimationController(
      duration: Duration(milliseconds: 2000),
      vsync: this,
    );
    _notificationBadgeController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
    _notificationBadgeAnimation = CurvedAnimation(
      parent: _notificationBadgeController,
      curve: Curves.elasticOut,
    );
  }

  void _startNotificationPolling() {
    // Load notifications immediately
    _loadNotifications();

    // Poll every 30 seconds
    _notificationTimer = Timer.periodic(Duration(seconds: 30), (timer) {
      _loadNotifications();
    });
  }

  Future<void> _loadNotifications() async {
    try {
      // Load unread count
      final countResult = await _notificationController.getUnreadCount();

      // Load recent notifications for preview
      final notifResult = await _notificationController.getNotifications();

      setState(() {
        final oldCount = unreadCount;

        if (countResult['success']) {
          unreadCount = countResult['count'];
        } else {
          unreadCount = 0;
        }

        if (notifResult['success']) {
          recentNotifications =
              (notifResult['data']['notifications'] as List? ?? [])
                  .take(5)
                  .toList();
        } else {
          recentNotifications = [];
        }

        // Animate badge if there are new notifications
        if (unreadCount > oldCount && oldCount >= 0) {
          _notificationBadgeController.forward().then((_) {
            _notificationBadgeController.reverse();
          });
        }
      });
    } catch (e) {
      print('Error loading notifications: $e');
      setState(() {
        unreadCount = 0;
        recentNotifications = [];
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _notificationBadgeController.dispose();
    _notificationTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    try {
      SharedPreferences prefs = await SharedPreferences.getInstance();

      // Try to get user data from new format first
      final userId = prefs.getInt('userId');
      final userName = prefs.getString('userName');
      final userUsername = prefs.getString('userUsername');
      final userEmail = prefs.getString('userEmail');
      final userRole = prefs.getString('userRole');
      final userToken = prefs.getString('userToken');

      if (userId != null && userName != null) {
        setState(() {
          currentUser = {
            'id': userId,
            'name': userName,
            'username': userUsername ?? '',
            'email': userEmail ?? '',
            'role': userRole ?? 'Supervisor',
            'token': userToken ?? '',
          };
        });
      } else {
        // Fallback to old format
        String? userString = prefs.getString('user');
        if (userString != null) {
          setState(() {
            currentUser = jsonDecode(userString);
          });
        }
      }
    } catch (e) {
      print('Error loading user data: $e');
    }
  }

  Future<void> _loadDashboardData() async {
    // Simulate loading data - replace with actual API calls
    await Future.delayed(Duration(seconds: 2));

    setState(() {
      // Mock data - replace with actual API data
      totalCows = 45;
      totalFarmers = 12;
      totalAdmins = 2;
      totalSupervisors = 3;
      totalBlogs = 15;
      totalGalleries = 8;
      todayMilkProduction = 127.5;

      // Lactation distribution mock data
      lactationData = [
        LactationData('Early', 15, Colors.green),
        LactationData('Mid', 20, Colors.orange),
        LactationData('Late', 8, Colors.red),
        LactationData('Dry', 2, Colors.grey),
      ];

      isLoading = false;
    });
  }

  void _navigateToView(NavigationItem item) {
    if (item.route == 'dashboard') {
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => item.widget(),
        settings: RouteSettings(name: item.route),
      ),
    );
  }

  void _navigateToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginView()),
    );
  }

  // Safe date formatting method
  String _getFormattedDate() {
    try {
      if (_localeInitialized) {
        return DateFormat('EEEE, dd MMMM yyyy', 'id_ID').format(DateTime.now());
      } else {
        return DateFormat('EEEE, dd MMMM yyyy').format(DateTime.now());
      }
    } catch (e) {
      // Fallback to default locale if Indonesian locale fails
      return DateFormat('EEEE, dd MMMM yyyy').format(DateTime.now());
    }
  }

  Widget _buildNotificationButton() {
    return Stack(
      children: [
        IconButton(
          icon: Icon(Icons.notifications, color: Colors.white),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => NotificationWidget(),
              ),
            ).then((_) {
              // Reload notifications when returning from notification page
              _loadNotifications();
            });
          },
        ),
        if (unreadCount > 0)
          Positioned(
            right: 8,
            top: 8,
            child: ScaleTransition(
              scale: _notificationBadgeAnimation,
              child: Container(
                padding: EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(10),
                ),
                constraints: BoxConstraints(
                  minWidth: 16,
                  minHeight: 16,
                ),
                child: Text(
                  unreadCount > 99 ? '99+' : unreadCount.toString(),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildNotificationPreview() {
    if (recentNotifications.isEmpty) return SizedBox.shrink();

    return FadeInDown(
      duration: Duration(milliseconds: 800),
      delay: Duration(milliseconds: 400),
      child: Container(
        margin: EdgeInsets.only(bottom: 20),
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
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
                Icon(Icons.notifications_active,
                    color: Colors.orange[600], size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Notifikasi Terbaru',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.blueGrey[800],
                    ),
                  ),
                ),
                if (unreadCount > 0)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$unreadCount baru',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                SizedBox(width: 8),
                TextButton(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => NotificationWidget(),
                      ),
                    ).then((_) => _loadNotifications());
                  },
                  child: Text(
                    'Lihat Semua',
                    style: TextStyle(
                      color: Colors.blue[700],
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            ...recentNotifications.take(3).map((notification) {
              final isUnread = !(notification['is_read'] ?? false);
              final type = notification['type'];

              return Container(
                margin: EdgeInsets.only(bottom: 8),
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: isUnread ? Colors.blue[50] : Colors.grey[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isUnread ? Colors.blue[200]! : Colors.grey[200]!,
                    width: 1,
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: _getNotificationColor(type).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Icon(
                        _getNotificationIcon(type),
                        size: 16,
                        color: _getNotificationColor(type),
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            notification['title'] ?? 'Notifikasi',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight:
                                  isUnread ? FontWeight.bold : FontWeight.w600,
                              color: Colors.blueGrey[800],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 2),
                          Text(
                            notification['message'] ?? '',
                            style: TextStyle(
                              fontSize: 10,
                              color: Colors.grey[600],
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    if (isUnread)
                      Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                      ),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  IconData _getNotificationIcon(String? type) {
    switch (type) {
      case 'milking_reminder':
        return Icons.local_drink;
      case 'cow_health':
        return Icons.health_and_safety;
      case 'system_update':
        return Icons.system_update;
      case 'milk_quality':
        return Icons.analytics;
      case 'general':
        return Icons.info;
      case 'warning':
        return Icons.warning;
      case 'success':
        return Icons.check_circle;
      default:
        return Icons.notifications;
    }
  }

  Color _getNotificationColor(String? type) {
    switch (type) {
      case 'milking_reminder':
        return Colors.blue;
      case 'cow_health':
        return Colors.red;
      case 'system_update':
        return Colors.orange;
      case 'milk_quality':
        return Colors.purple;
      case 'general':
        return Colors.grey;
      case 'warning':
        return Colors.amber;
      case 'success':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  Widget _buildSidebar() {
    return Drawer(
      child: Column(
        children: [
          Container(
            width: double.infinity,
            height: 200,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blue[700]!, Colors.blue[500]!],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 30,
                      backgroundColor: Colors.white.withOpacity(0.3),
                      child: Text(
                        '👨‍💼',
                        style: TextStyle(fontSize: 35),
                      ),
                    ),
                    SizedBox(height: 12),
                    Text(
                      currentUser?['name'] ?? 'Supervisor',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.orange.withOpacity(0.8),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'Supervisor',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(vertical: 8),
              itemCount: navigationItems.length,
              itemBuilder: (context, index) {
                final item = navigationItems[index];
                final isSelected = _selectedIndex == index;

                return Container(
                  margin: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color:
                        isSelected ? Colors.blue[700]!.withOpacity(0.1) : null,
                  ),
                  child: ListTile(
                    leading: Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Colors.blue[700]!.withOpacity(0.2)
                            : Colors.grey[100],
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        item.icon,
                        color: isSelected ? Colors.blue[700] : Colors.grey[600],
                        size: 20,
                      ),
                    ),
                    title: Text(
                      item.label,
                      style: TextStyle(
                        color: isSelected ? Colors.blue[700] : Colors.grey[800],
                        fontWeight:
                            isSelected ? FontWeight.w600 : FontWeight.normal,
                        fontSize: 14,
                      ),
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    onTap: () {
                      setState(() {
                        _selectedIndex = index;
                      });
                      Navigator.pop(context);
                      _navigateToView(item);
                    },
                  ),
                );
              },
            ),
          ),
          Container(
            width: double.infinity,
            height: 1,
            color: Colors.grey[300],
          ),
          Container(
            margin: EdgeInsets.all(8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.red.withOpacity(0.1),
            ),
            child: ListTile(
              leading: Container(
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(Icons.logout, color: Colors.red, size: 20),
              ),
              title: Text(
                'Keluar',
                style: TextStyle(
                  color: Colors.red,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              onTap: () async {
                final shouldLogout = await showDialog<bool>(
                  context: context,
                  builder: (context) => AlertDialog(
                    title: Text('Konfirmasi Keluar'),
                    content:
                        Text('Apakah Anda yakin ingin keluar dari aplikasi?'),
                    actions: [
                      TextButton(
                        onPressed: () => Navigator.pop(context, false),
                        child: Text('Batal'),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context, true),
                        style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red),
                        child: Text('Keluar',
                            style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                );

                if (shouldLogout == true) {
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.clear();
                  _navigateToLogin();
                }
              },
            ),
          ),
          SizedBox(height: 8),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        backgroundColor: Colors.grey[50],
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(Colors.blue[700]!),
              ),
              SizedBox(height: 20),
              Text(
                'Memuat Dashboard...',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.grey[50],
      drawer: MediaQuery.of(context).size.width > 600 ? null : _buildSidebar(),
      appBar: AppBar(
        title: Text(
          'Supervisor Dashboard',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.blue[700],
        elevation: 0,
        leading: MediaQuery.of(context).size.width > 600
            ? null
            : IconButton(
                icon: Icon(Icons.menu, color: Colors.white),
                onPressed: () => _scaffoldKey.currentState?.openDrawer(),
              ),
        actions: [
          _buildNotificationButton(),
          SizedBox(width: 8),
        ],
      ),
      body: Row(
        children: [
          // Sidebar for larger screens
          if (MediaQuery.of(context).size.width > 600)
            Container(
              width: 250,
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    blurRadius: 10,
                    offset: Offset(2, 0),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    padding: EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [Colors.blue[700]!, Colors.blue[500]!],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                    child: Column(
                      children: [
                        CircleAvatar(
                          radius: 25,
                          backgroundColor: Colors.white.withOpacity(0.3),
                          child: Text('👨‍💼', style: TextStyle(fontSize: 30)),
                        ),
                        SizedBox(height: 12),
                        Text(
                          currentUser?['name'] ?? 'Supervisor',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Supervisor',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Expanded(
                    child: ListView.builder(
                      itemCount: navigationItems.length,
                      itemBuilder: (context, index) {
                        final item = navigationItems[index];
                        final isSelected = _selectedIndex == index;

                        return ListTile(
                          leading: Icon(
                            item.icon,
                            color: isSelected
                                ? Colors.blue[700]
                                : Colors.grey[600],
                            size: 20,
                          ),
                          title: Text(
                            item.label,
                            style: TextStyle(
                              color: isSelected
                                  ? Colors.blue[700]
                                  : Colors.grey[800],
                              fontWeight: isSelected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                              fontSize: 14,
                            ),
                          ),
                          selected: isSelected,
                          selectedTileColor: Colors.blue[700]!.withOpacity(0.1),
                          onTap: () {
                            setState(() {
                              _selectedIndex = index;
                            });
                            _navigateToView(item);
                          },
                        );
                      },
                    ),
                  ),
                  Divider(),
                  ListTile(
                    leading: Icon(Icons.logout, color: Colors.red, size: 20),
                    title: Text(
                      'Keluar',
                      style: TextStyle(color: Colors.red, fontSize: 14),
                    ),
                    onTap: () async {
                      final prefs = await SharedPreferences.getInstance();
                      await prefs.clear();
                      _navigateToLogin();
                    },
                  ),
                ],
              ),
            ),

          // Main content
          Expanded(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: RefreshIndicator(
                onRefresh: () async {
                  await _loadDashboardData();
                  await _loadNotifications();
                },
                color: Colors.blue[700],
                child: SingleChildScrollView(
                  physics: AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildWelcomeCard(),
                      SizedBox(height: 20),
                      _buildNotificationPreview(),
                      _buildStatsCards(),
                      SizedBox(height: 20),
                      _buildMapCard(),
                      SizedBox(height: 20),
                      _buildLactationChart(),
                      SizedBox(height: 20),
                      _buildQuickActions(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard() {
    return FadeInDown(
      duration: Duration(milliseconds: 800),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF4FACFE),
              Color(0xFF00F2FE),
            ],
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.blue.withOpacity(0.3),
              spreadRadius: 0,
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(
                      Icons.supervisor_account,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Selamat Datang, ${currentUser?['name'] ?? 'Supervisor'}!',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 4),
                        Container(
                          padding:
                              EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.orange,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            'Supervisor',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    '👨‍💼',
                    style: TextStyle(fontSize: 40),
                  ),
                ],
              ),
              SizedBox(height: 16),
              Text(
                'Dashboard Dairy Track - Supervisi peternakan dengan mudah dan efisien',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.9),
                  fontSize: 14,
                  height: 1.4,
                ),
              ),
              SizedBox(height: 12),
              Row(
                children: [
                  Icon(Icons.calendar_today, color: Colors.white70, size: 16),
                  SizedBox(width: 8),
                  Text(
                    _getFormattedDate(), // Use safe method
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                  Spacer(),
                  Icon(Icons.access_time, color: Colors.white70, size: 16),
                  SizedBox(width: 8),
                  Text(
                    DateFormat('HH:mm').format(DateTime.now()),
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsCards() {
    return Column(
      children: [
        FadeInLeft(
          duration: Duration(milliseconds: 800),
          delay: Duration(milliseconds: 200),
          child: Row(
            children: [
              Expanded(
                  child: _buildStatCard(
                      '🐄', '$totalCows', 'Total Sapi', Colors.blue)),
              SizedBox(width: 12),
              Expanded(
                  child: _buildStatCard(
                      '👩‍🌾', '$totalFarmers', 'Farmer', Colors.green)),
            ],
          ),
        ),
        SizedBox(height: 12),
        FadeInRight(
          duration: Duration(milliseconds: 800),
          delay: Duration(milliseconds: 400),
          child: Row(
            children: [
              Expanded(
                  child: _buildStatCard('👨‍💼', '$totalSupervisors',
                      'Supervisor', Colors.purple)),
              SizedBox(width: 12),
              Expanded(
                  child: _buildStatCard(
                      '👨‍💻', '$totalAdmins', 'Admin', Colors.orange)),
            ],
          ),
        ),
        SizedBox(height: 12),
        FadeInUp(
          duration: Duration(milliseconds: 800),
          delay: Duration(milliseconds: 600),
          child: Row(
            children: [
              Expanded(
                  child: _buildStatCard(
                      '📝', '$totalBlogs', 'Blog', Colors.indigo)),
              SizedBox(width: 12),
              Expanded(
                  child: _buildStatCard(
                      '📸', '$totalGalleries', 'Gallery', Colors.pink)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String emoji, String value, String label, Color color) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            spreadRadius: 0,
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        children: [
          Text(emoji, style: TextStyle(fontSize: 24)),
          SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              fontSize: 11,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapCard() {
    return FadeInUp(
      duration: Duration(milliseconds: 800),
      delay: Duration(milliseconds: 800),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 0,
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.map, color: Colors.blue[700], size: 24),
                      SizedBox(width: 8),
                      Text(
                        'Lokasi Peternakan DairyTrack',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[700],
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Temukan lokasi peternakan untuk kunjungan supervisi',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
            Container(
              height: 280,
              margin: EdgeInsets.only(left: 16, right: 16, bottom: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[300]!),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // Attractive placeholder with gradient background
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            Colors.blue[100]!,
                            Colors.blue[50]!,
                            Colors.green[50]!,
                          ],
                        ),
                      ),
                      child: Stack(
                        children: [
                          // Background pattern
                          Positioned.fill(
                            child: CustomPaint(
                              painter: MapPatternPainter(),
                            ),
                          ),
                          // Main content
                          Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Container(
                                padding: EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.blue.withOpacity(0.2),
                                      blurRadius: 15,
                                      spreadRadius: 2,
                                    ),
                                  ],
                                ),
                                child: Icon(
                                  Icons.location_on,
                                  size: 50,
                                  color: Colors.blue[700],
                                ),
                              ),
                              SizedBox(height: 20),
                              Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 20, vertical: 12),
                                decoration: BoxDecoration(
                                  color: Colors.white.withOpacity(0.9),
                                  borderRadius: BorderRadius.circular(25),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 10,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      'Peta Lokasi Peternakan',
                                      style: TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.blue[700],
                                      ),
                                    ),
                                    SizedBox(height: 8),
                                    Text(
                                      'Taman Sains Teknologi\nHerbal dan Hortikultura',
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey[700],
                                        height: 1.3,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              SizedBox(height: 16),
                              Container(
                                padding: EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.blue[700],
                                  borderRadius: BorderRadius.circular(20),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.blue.withOpacity(0.3),
                                      blurRadius: 8,
                                      spreadRadius: 1,
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.gps_fixed,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                    SizedBox(width: 8),
                                    Text(
                                      'Latitude: -7.0000, Longitude: 110.0000',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    // Top overlay with location marker
                    Positioned(
                      top: 16,
                      right: 16,
                      child: Container(
                        padding: EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              Icons.location_on,
                              size: 16,
                              color: Colors.blue[700],
                            ),
                            SizedBox(width: 4),
                            Text(
                              'DairyTrack',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w500,
                                color: Colors.blue[700],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.only(left: 16, right: 16, bottom: 16),
              child: Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.blue[200]!),
                ),
                child: Row(
                  children: [
                    Icon(Icons.location_on, color: Colors.blue[700], size: 20),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Taman Sains Teknologi Herbal dan Hortikultura (TSTH2)',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.blue[700],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLactationChart() {
    return FadeInUp(
      duration: Duration(milliseconds: 800),
      delay: Duration(milliseconds: 1000),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 0,
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.pie_chart, color: Colors.blue[700], size: 24),
                  SizedBox(width: 8),
                  Text(
                    'Distribusi Fase Laktasi',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue[700],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 4),
              Text(
                'Komposisi fase laktasi sapi di seluruh peternakan',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
              SizedBox(height: 20),
              Container(
                height: 200,
                child: PieChart(
                  PieChartData(
                    sectionsSpace: 2,
                    centerSpaceRadius: 40,
                    sections: lactationData.map((data) {
                      return PieChartSectionData(
                        color: data.color,
                        value: data.count.toDouble(),
                        title: '${data.count}',
                        radius: 60,
                        titleStyle: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              SizedBox(height: 16),
              Wrap(
                spacing: 16,
                runSpacing: 8,
                children: lactationData.map((data) {
                  return Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: data.color,
                          shape: BoxShape.circle,
                        ),
                      ),
                      SizedBox(width: 4),
                      Text(
                        '${data.phase} (${data.count})',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[700],
                        ),
                      ),
                    ],
                  );
                }).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    return FadeInUp(
      duration: Duration(milliseconds: 800),
      delay: Duration(milliseconds: 1200),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 0,
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Aksi Cepat',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.blue[700],
                ),
              ),
              SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.assignment,
                      label: 'Laporan',
                      color: Colors.green,
                      onTap: () {
                        // Navigate to reports
                      },
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.people,
                      label: 'Kelola Farmer',
                      color: Colors.orange,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => ListOfUsersView(),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.pets,
                      label: 'Data Sapi',
                      color: Colors.blue,
                      onTap: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => ListOfCowsView(),
                          ),
                        );
                      },
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: _buildActionButton(
                      icon: Icons.analytics,
                      label: 'Analisis',
                      color: Colors.purple,
                      onTap: () {},
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.3)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// Navigation item model
class NavigationItem {
  final IconData icon;
  final String label;
  final String route;
  final Widget Function() widget;

  NavigationItem({
    required this.icon,
    required this.label,
    required this.route,
    required this.widget,
  });
}

class LactationData {
  final String phase;
  final int count;
  final Color color;

  LactationData(this.phase, this.count, this.color);
}

class MapPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.1)
      ..strokeWidth = 1.0
      ..style = PaintingStyle.stroke;

    // Draw grid pattern
    for (double i = 0; i < size.width; i += 30) {
      canvas.drawLine(
        Offset(i, 0),
        Offset(i, size.height),
        paint,
      );
    }

    for (double i = 0; i < size.height; i += 30) {
      canvas.drawLine(
        Offset(0, i),
        Offset(size.width, i),
        paint,
      );
    }

    // Draw some decorative paths (like roads)
    final pathPaint = Paint()
      ..color = Colors.blue.withOpacity(0.2)
      ..strokeWidth = 3.0
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(0, size.height * 0.7);
    path.quadraticBezierTo(
      size.width * 0.3,
      size.height * 0.5,
      size.width * 0.6,
      size.height * 0.8,
    );
    path.quadraticBezierTo(
      size.width * 0.8,
      size.height * 0.9,
      size.width,
      size.height * 0.6,
    );

    canvas.drawPath(path, pathPaint);

    // Draw another path
    final path2 = Path();
    path2.moveTo(size.width * 0.2, 0);
    path2.quadraticBezierTo(
      size.width * 0.4,
      size.height * 0.3,
      size.width * 0.8,
      size.height * 0.4,
    );

    canvas.drawPath(path2, pathPaint);
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
