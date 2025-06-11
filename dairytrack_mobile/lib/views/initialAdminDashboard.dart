import 'dart:async';
import 'dart:math';
import 'package:dairytrack_mobile/views/cattleDistribution.dart';
import 'package:dairytrack_mobile/views/milkingView.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';

// Import controllers
import '../controller/APIURL1/cowManagementController.dart';
import '../controller/APIURL1/usersManagementController.dart';
import '../controller/APIURL1/milkingSessionController.dart';
import '../controller/APIURL1/blogManagementController.dart';
import '../controller/APIURL1/galleryManagementController.dart';
import '../controller/APIURL1/cattleDistributionController.dart';
import '../controller/APIURL1/notificationController.dart';

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
import 'package:dairytrack_mobile/views/feedManagement/model/feed.dart';
import 'package:dairytrack_mobile/views/feedManagement/nutrition/listNutrition.dart';

// Import views for navigation
import 'cowManagement/listOfCowsView.dart';
import 'usersManagement/listOfUsersView.dart';
import 'highlights/blogView.dart';
import 'highlights/galleryView.dart';
import 'loginView.dart';
import '../widgets/notifications.dart';

class InitialAdminDashboard extends StatefulWidget {
  @override
  _InitialAdminDashboardState createState() => _InitialAdminDashboardState();
}

class _InitialAdminDashboardState extends State<InitialAdminDashboard>
    with TickerProviderStateMixin {
  // Controllers
  final CowManagementController _cowController = CowManagementController();
  final UsersManagementController _usersController =
      UsersManagementController();
  final MilkingSessionController _milkingController =
      MilkingSessionController();
  final BlogManagementController _blogController = BlogManagementController();
  final GalleryManagementController _galleryController =
      GalleryManagementController();
  final CattleDistributionController _cattleController =
      CattleDistributionController();
  final NotificationController _notificationController =
      NotificationController();

  // Animation controllers
  late AnimationController _welcomeAnimationController;
  late AnimationController _cardAnimationController;
  late AnimationController _floatingAnimationController;
  late AnimationController _notificationBadgeController;

  // Animations
  late Animation<double> _welcomeAnimation;
  late Animation<double> _cardAnimation;
  late Animation<double> _floatingAnimation;
  late Animation<double> _notificationBadgeAnimation;

  // Navigation and UI state
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // Data variables
  Map<String, dynamic>? currentUser;
  bool isLoading = true;
  List<dynamic> milkingSessions = [];
  List<Cow> allCows = [];
  List<User> allUsers = [];
  List<Blog> allBlogs = [];
  List<Gallery> allGalleries = [];
  Map<String, dynamic> allUsersWithCows = {};

  // Notification variables
  int unreadCount = 0;
  List<dynamic> recentNotifications = [];
  Timer? _notificationTimer;

  // Dashboard stats
  Map<String, dynamic> dashboardStats = {
    'totalCows': 0,
    'totalFarmers': 0,
    'totalSupervisors': 0,
    'totalAdmins': 0,
    'totalMilkToday': 0.0,
    'avgMilkPerCow': 0.0,
    'totalBlogs': 0,
    'totalGalleries': 0,
  };

  // Lactation distribution data
  List<Map<String, dynamic>> lactationDistribution = [];

  // Colors for charts
  final List<Color> chartColors = [
    Colors.green[400]!, // Early lactation
    Colors.blue[400]!, // Mid lactation
    Colors.orange[400]!, // Late lactation
    Colors.grey[400]!, // No data
  ];

  // Fixed navigation items for admin only
  List<NavigationItem> get navigationItems => [
        NavigationItem(
          icon: Icons.dashboard,
          label: 'Dashboard',
          route: 'dashboard',
          widget: () => InitialAdminDashboard(),
        ),
        NavigationItem(
          icon: Icons.pets,
          label: 'Sapi',
          route: 'cows',
          widget: () => ListOfCowsView(),
        ),
        NavigationItem(
          icon: Icons.local_drink,
          label: 'Pemerahan',
          route: 'milking',
          widget: () => MilkingView(),
        ),
        NavigationItem(
          icon: Icons.people,
          label: 'Pengguna',
          route: 'users',
          widget: () => ListOfUsersView(),
        ),
        NavigationItem(
          icon: Icons.analytics,
          label: 'Distribusi Sapi',
          route: 'distribution',
          widget: () => CattleDistribution(),
        ),
        NavigationItem(
          icon: Icons.article,
          label: 'Blog',
          route: 'blogs',
          widget: () => BlogView(),
        ),
        NavigationItem(
          icon: Icons.photo_library,
          label: 'Galeri',
          route: 'gallery',
          widget: () => GalleryView(),
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
          icon: Icons.category, // Jenis Pakan = kategori pakan
          label: 'Jenis Pakan',
          route: 'feed-Type',
          widget: () => FeedTypeView(),
        ),
        NavigationItem(
          icon: Icons
              .eco, // Jenis Nutrisi = daun/”eco” → identik dgn nutrisi & keseimbangan
          label: 'Jenis Nutrisi',
          route: 'nutrition',
          widget: () => NutrisiView(),
        ),
        NavigationItem(
          icon: Icons.rice_bowl, // Pakan = mangkuk pakan (rice bowl)
          label: 'Pakan',
          route: 'feed',
          widget: () => FeedView(),
        ),
        NavigationItem(
          icon: Icons.rice_bowl, // Pakan = mangkuk pakan (rice bowl)
          label: 'Stock Pakan',
          route: 'feed-stock',
          widget: () => FeedStockList(),
        ),
        NavigationItem(
          icon: Icons.schedule, // Feed Schedule = jadwal/clock
          label: 'Feed Schedule',
          route: 'feed-schedule',
          widget: () => DailyFeedView(),
        ),
        NavigationItem(
          icon: Icons.schedule, // Feed Schedule = jadwal/clock
          label: 'Feed Schedule',
          route: 'feed-item',
          widget: () => DailyFeedItemsPage(),
        ),
        NavigationItem(
  icon: Icons.monitor_heart,
  label: 'HealthDashboard',
  route: 'health-dashboard',
  widget: () => HealthDashboardView(),
),

      
      ];

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _initializeLocale();
    _getCurrentUser();
    _startNotificationPolling();
  }

  Future<void> _initializeLocale() async {
    await initializeDateFormatting('id_ID', null);
  }

  void _initializeAnimations() {
    _welcomeAnimationController = AnimationController(
      duration: Duration(milliseconds: 1200),
      vsync: this,
    );
    _cardAnimationController = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );
    _floatingAnimationController = AnimationController(
      duration: Duration(seconds: 6),
      vsync: this,
    );
    _notificationBadgeController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );

    _welcomeAnimation = CurvedAnimation(
      parent: _welcomeAnimationController,
      curve: Curves.elasticOut,
    );
    _cardAnimation = CurvedAnimation(
      parent: _cardAnimationController,
      curve: Curves.easeOutBack,
    );
    _floatingAnimation = CurvedAnimation(
      parent: _floatingAnimationController,
      curve: Curves.easeInOut,
    );
    _notificationBadgeAnimation = CurvedAnimation(
      parent: _notificationBadgeController,
      curve: Curves.elasticOut,
    );

    _welcomeAnimationController.forward();
    _cardAnimationController.forward();
    _floatingAnimationController.repeat(reverse: true);
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
    _welcomeAnimationController.dispose();
    _cardAnimationController.dispose();
    _floatingAnimationController.dispose();
    _notificationBadgeController.dispose();
    _notificationTimer?.cancel();
    super.dispose();
  }

  Future<void> _getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();

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
            'role': userRole ?? 'Administrator',
            'token': userToken ?? '',
          };
        });
        await _initializeDashboard();
      } else {
        _navigateToLogin();
      }
    } catch (e) {
      print('Error getting current user: $e');
      setState(() {
        isLoading = false;
      });
      _navigateToLogin();
    }
  }

  void _navigateToLogin() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => LoginView()),
    );
  }

  void _navigateToView(NavigationItem item) {
    if (item.route == 'dashboard') {
      // Stay on current dashboard
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

  Future<void> _initializeDashboard() async {
    setState(() {
      isLoading = true;
    });

    try {
      await Future.wait([
        _loadCows(),
        _loadUsers(),
        _loadMilkingSessions(),
        _loadBlogs(),
        _loadGalleries(),
        _loadUsersWithCows(),
      ]);

      _calculateDashboardStats();
      _calculateLactationDistribution();
    } catch (e) {
      print('Error initializing dashboard: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _loadCows() async {
    try {
      final cows = await _cowController.listCows();
      setState(() {
        allCows = cows.cast<Cow>();
      });
    } catch (e) {
      print('Error loading cows: $e');
      setState(() {
        allCows = [];
      });
    }
  }

  Future<void> _loadUsers() async {
    try {
      final users = await _usersController.listUsers();
      setState(() {
        allUsers = users.cast<User>();
      });
    } catch (e) {
      print('Error loading users: $e');
      setState(() {
        allUsers = [];
      });
    }
  }

  Future<void> _loadMilkingSessions() async {
    try {
      final sessions = await _milkingController.getMilkingSessions();
      setState(() {
        milkingSessions = sessions;
      });
    } catch (e) {
      print('Error loading milking sessions: $e');
      setState(() {
        milkingSessions = [];
      });
    }
  }

  Future<void> _loadBlogs() async {
    try {
      final blogs = await _blogController.listBlogs();
      setState(() {
        allBlogs = blogs.cast<Blog>();
      });
    } catch (e) {
      print('Error loading blogs: $e');
      setState(() {
        allBlogs = [];
      });
    }
  }

  Future<void> _loadGalleries() async {
    try {
      final galleries = await _galleryController.listGalleries();
      setState(() {
        allGalleries = galleries.cast<Gallery>();
      });
    } catch (e) {
      print('Error loading galleries: $e');
      setState(() {
        allGalleries = [];
      });
    }
  }

  Future<void> _loadUsersWithCows() async {
    try {
      final result = await _cattleController.getAllUsersAndAllCows();
      if (result['success']) {
        setState(() {
          allUsersWithCows = result['data'];
        });
      }
    } catch (e) {
      print('Error loading users with cows: $e');
    }
  }

  void _calculateDashboardStats() {
    final today = DateFormat('yyyy-MM-dd').format(DateTime.now());
    double totalMilkToday = 0.0;

    final todaySessions = milkingSessions.where((session) {
      try {
        final sessionDate = DateTime.parse(session['milking_time']);
        return DateFormat('yyyy-MM-dd').format(sessionDate) == today;
      } catch (e) {
        return false;
      }
    }).toList();

    for (var session in todaySessions) {
      totalMilkToday +=
          double.tryParse(session['volume']?.toString() ?? '0') ?? 0;
    }

    int totalFarmers = allUsers.where((user) => user.roleId == 3).length;
    int totalSupervisors = allUsers.where((user) => user.roleId == 2).length;
    int totalAdmins = allUsers.where((user) => user.roleId == 1).length;

    setState(() {
      dashboardStats = {
        'totalCows': allCows.length,
        'totalFarmers': totalFarmers,
        'totalSupervisors': totalSupervisors,
        'totalAdmins': totalAdmins,
        'totalMilkToday': totalMilkToday,
        'avgMilkPerCow':
            allCows.isNotEmpty ? totalMilkToday / allCows.length : 0.0,
        'totalBlogs': allBlogs.length,
        'totalGalleries': allGalleries.length,
      };
    });
  }

  void _calculateLactationDistribution() {
    Map<String, int> lactationCount = {};

    for (var cow in allCows) {
      final phase = cow.lactationPhase;
      lactationCount[phase] = (lactationCount[phase] ?? 0) + 1;
    }

    setState(() {
      lactationDistribution = lactationCount.entries
          .map((entry) => {
                'name': entry.key,
                'value': entry.value,
                'percentage': allCows.isNotEmpty
                    ? (entry.value / allCows.length * 100).toStringAsFixed(1)
                    : '0.0',
              })
          .toList();
    });
  }

  Widget _buildFloatingParticle(
      double left, double top, double size, Color color) {
    return AnimatedBuilder(
      animation: _floatingAnimation,
      builder: (context, child) {
        return Positioned(
          left: left,
          top: top + (sin(_floatingAnimation.value * 2 * pi) * 20),
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              color: color.withOpacity(0.3),
              shape: BoxShape.circle,
            ),
          ),
        );
      },
    );
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

    // Sinkronisasi jumlah notifikasi terbaru dengan unreadCount
    final displayedNotifications = recentNotifications.take(3).toList();
    final displayedUnreadCount = displayedNotifications
        .where((notification) => !(notification['is_read'] ?? false))
        .length;

    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(0, -0.5),
        end: Offset.zero,
      ).animate(_cardAnimation),
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                if (displayedUnreadCount > 0)
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '$displayedUnreadCount baru',
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
                      color: Colors.blueGrey[700],
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            ...displayedNotifications.map((notification) {
              final isUnread = !(notification['is_read'] ?? false);
              final type = notification['type'];

              return GestureDetector(
                onTap: () async {
                  // Tandai sebagai read di backend jika belum
                  if (isUnread && notification['id'] != null) {
                    await _notificationController
                        .markAsRead(notification['id']);
                    // Update state lokal agar UI langsung berubah
                    setState(() {
                      notification['is_read'] = true;
                    });
                    // Refresh notifikasi (opsional, agar badge & list update)
                    _loadNotifications();
                  }
                  // Tampilkan detail notifikasi (opsional)
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      title: Row(
                        children: [
                          Icon(Icons.notifications,
                              color: Colors.teal, size: 24),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              notification['title'] ?? 'Notifikasi',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.teal[800],
                              ),
                            ),
                          ),
                        ],
                      ),
                      content: Text(
                        notification['message'] ?? '',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey[700],
                        ),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context),
                          style: TextButton.styleFrom(
                            foregroundColor: Colors.white,
                            backgroundColor: Colors.teal,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text('Tutup'),
                        ),
                      ],
                    ),
                  );
                },
                child: Container(
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
                                fontWeight: isUnread
                                    ? FontWeight.bold
                                    : FontWeight.w600,
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

  Widget _buildWelcomeCard() {
    if (currentUser == null) return SizedBox.shrink();

    return ScaleTransition(
      scale: _welcomeAnimation,
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        constraints: BoxConstraints(
          minHeight: 120,
          maxHeight: 200,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.blueGrey[800]!, Colors.blueGrey[600]!],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.blueGrey[800]!.withOpacity(0.3),
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Responsive floating particles
            _buildFloatingParticle(20, 20, 6, Colors.white),
            _buildFloatingParticle(
                MediaQuery.of(context).size.width * 0.6, 40, 4, Colors.white),
            _buildFloatingParticle(50, 80, 8, Colors.white),
            _buildFloatingParticle(
                MediaQuery.of(context).size.width * 0.75, 70, 5, Colors.white),

            // Content
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
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
                          Icons.admin_panel_settings,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Selamat Datang, ${currentUser!['name']}!',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: MediaQuery.of(context).size.width < 400
                                ? 16
                                : 20,
                            fontWeight: FontWeight.w700,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.purple[600]!.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      'Administrator',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Admin Dashboard - Kelola semua aspek peternakan dengan kontrol penuh',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 12,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 12),
                  Row(
                    children: [
                      Icon(Icons.calendar_today,
                          color: Colors.white70, size: 14),
                      SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          DateFormat('EEEE, dd MMM yyyy', 'id_ID')
                              .format(DateTime.now()),
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 10,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      Icon(Icons.access_time, color: Colors.white70, size: 14),
                      SizedBox(width: 6),
                      Text(
                        DateFormat('HH:mm').format(DateTime.now()),
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 10,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsOverview() {
    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(0, 0.5),
        end: Offset.zero,
      ).animate(_cardAnimation),
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: EdgeInsets.all(16), // Lebih compact dari 20
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16), // Lebih compact dari 20
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1), // Lebih subtle
              blurRadius: 10, // Lebih compact dari 15
              offset: Offset(0, 5), // Lebih compact dari 8
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.only(bottom: 16), // Lebih compact dari 20
              child: Row(
                children: [
                  Icon(
                    Icons.bar_chart,
                    color: const Color.fromARGB(255, 29, 146, 140),
                    size: 20, // Mirip dengan icon lain
                  ),
                  SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Statistik Sistem',
                          style: TextStyle(
                            fontSize: 16, // Konsisten dengan judul lain
                            fontWeight: FontWeight.w700,
                            color: Colors.blueGrey[800],
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Overview data peternakan',
                          style: TextStyle(
                            fontSize: 12, // Konsisten dengan subtitle lain
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            LayoutBuilder(
              builder: (context, constraints) {
                int crossAxisCount = 2;
                double childAspectRatio = 1.0; // Lebih compact

                if (constraints.maxWidth > 600) {
                  crossAxisCount = 4;
                  childAspectRatio = 1.0;
                } else if (constraints.maxWidth > 400) {
                  crossAxisCount = 2;
                  childAspectRatio = 1.0;
                }

                return GridView.count(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  crossAxisCount: crossAxisCount,
                  crossAxisSpacing: 10, // Lebih compact dari 12
                  mainAxisSpacing: 10, // Lebih compact dari 12
                  childAspectRatio: childAspectRatio,
                  children: [
                    _buildStatCard(
                      icon: Icons.pets,
                      title: 'Total Sapi',
                      value: '${dashboardStats['totalCows']}',
                      color: Colors.brown[600]!,
                      bgColor: Colors.brown[50]!,
                      gradientColors: [
                        Colors.brown[600]!.withOpacity(0.1),
                        Colors.brown[600]!.withOpacity(0.05),
                      ],
                      onTap: () => _navigateToView(navigationItems[1]),
                    ),
                    _buildStatCard(
                      icon: Icons.people,
                      title: 'Total Farmer',
                      value: '${dashboardStats['totalFarmers']}',
                      color: Colors.green[600]!,
                      bgColor: Colors.green[50]!,
                      gradientColors: [
                        Colors.green[600]!.withOpacity(0.1),
                        Colors.green[600]!.withOpacity(0.05),
                      ],
                      onTap: () => _navigateToView(navigationItems[3]),
                    ),
                    _buildStatCard(
                      icon: Icons.supervisor_account,
                      title: 'Total Supervisor',
                      value: '${dashboardStats['totalSupervisors']}',
                      color: Colors.orange[600]!,
                      bgColor: Colors.orange[50]!,
                      gradientColors: [
                        Colors.orange[600]!.withOpacity(0.1),
                        Colors.orange[600]!.withOpacity(0.05),
                      ],
                      onTap: () => _navigateToView(navigationItems[3]),
                    ),
                    _buildStatCard(
                      icon: Icons.admin_panel_settings,
                      title: 'Total Admin',
                      value: '${dashboardStats['totalAdmins']}',
                      color: Colors.purple[600]!,
                      bgColor: Colors.purple[50]!,
                      gradientColors: [
                        Colors.purple[600]!.withOpacity(0.1),
                        Colors.purple[600]!.withOpacity(0.05),
                      ],
                      onTap: () => _navigateToView(navigationItems[3]),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
    required Color bgColor,
    List<Color>? gradientColors,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        padding: EdgeInsets.all(10), // Lebih compact dari 12
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12), // Lebih compact dari 16
          border: Border.all(
            color: color.withOpacity(0.2),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: color.withOpacity(0.08), // Lebih subtle
              blurRadius: 6, // Lebih compact dari 8
              offset: Offset(0, 3), // Lebih compact dari 4
              spreadRadius: 0,
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon container yang lebih kecil
            Container(
              width: 36, // Lebih kecil dari 40
              height: 36, // Lebih kecil dari 40
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    color.withOpacity(0.9),
                    color.withOpacity(0.7),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius:
                    BorderRadius.circular(18), // Sesuaikan dengan size
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.25), // Lebih subtle
                    blurRadius: 4, // Lebih compact dari 6
                    offset: Offset(0, 2), // Lebih compact dari 3
                  ),
                ],
              ),
              child: Icon(
                icon,
                color: Colors.white,
                size: 18, // Lebih kecil dari 20
              ),
            ),
            SizedBox(height: 6), // Lebih compact dari 8
            // Value text yang lebih kecil
            FittedBox(
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 18, // Lebih kecil dari 20
                  fontWeight: FontWeight.w900,
                  color: color,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            SizedBox(height: 3), // Lebih compact dari 4
            // Title text yang lebih kecil
            Text(
              title,
              style: TextStyle(
                fontSize: 9, // Lebih kecil dari 10
                color: Colors.grey[700],
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            SizedBox(height: 4), // Lebih compact dari 6
            // Indicator bar yang lebih tipis
            Container(
              width: double.infinity,
              height: 2, // Tetap 2
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    color.withOpacity(0.8),
                    color.withOpacity(0.3),
                  ],
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                ),
                borderRadius: BorderRadius.circular(1),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLactationChart() {
    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(0.5, 0),
        end: Offset.zero,
      ).animate(_cardAnimation),
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                Icon(Icons.pie_chart,
                    color: const Color.fromARGB(255, 219, 164, 80), size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Distribusi Fase Laktasi',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.blueGrey[800],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Komposisi fase laktasi sapi di peternakan',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 16),
            lactationDistribution.isEmpty
                ? Container(
                    height: 150,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.pets, size: 48, color: Colors.grey[400]),
                          SizedBox(height: 16),
                          Text(
                            'Belum ada data sapi',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  )
                : Column(
                    children: [
                      // Circular Progress Chart
                      _buildCircularChart(),
                      SizedBox(height: 20),
                      // Detailed List
                      _buildLactationDetailList(),
                    ],
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildCircularChart() {
    final total = lactationDistribution.fold<int>(
      0,
      (sum, item) => sum + (item['value'] as int),
    );

    return Container(
      height: 180,
      child: Row(
        children: [
          // Circular Chart
          Expanded(
            flex: 2,
            child: Container(
              height: 150,
              child: CustomPaint(
                painter: LactationChartPainter(
                  lactationDistribution: lactationDistribution,
                  chartColors: chartColors,
                  total: total,
                ),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        total.toString(),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.w900,
                          color: Colors.blueGrey[800],
                        ),
                      ),
                      Text(
                        'Total Sapi',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SizedBox(width: 16),
          // Legend
          Expanded(
            flex: 3,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: lactationDistribution.asMap().entries.map((entry) {
                final index = entry.key;
                final item = entry.value;
                final color = chartColors[index % chartColors.length];

                return Container(
                  margin: EdgeInsets.only(bottom: 12),
                  child: Row(
                    children: [
                      // Color indicator
                      Container(
                        width: 16,
                        height: 16,
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(8),
                          boxShadow: [
                            BoxShadow(
                              color: color.withOpacity(0.4),
                              blurRadius: 4,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item['name'],
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.blueGrey[800],
                              ),
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              '${item['value']} sapi (${item['percentage']}%)',
                              style: TextStyle(
                                fontSize: 10,
                                color: color,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLactationDetailList() {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey[200]!,
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.info_outline, size: 16, color: Colors.grey[600]),
              SizedBox(width: 8),
              Text(
                'Statistik Detail',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          // Progress bars for each lactation phase
          ...lactationDistribution.asMap().entries.map((entry) {
            final index = entry.key;
            final item = entry.value;
            final color = chartColors[index % chartColors.length];
            final percentage = double.parse(item['percentage']);

            return Container(
              margin: EdgeInsets.only(bottom: 10),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item['name'],
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                      Text(
                        '${item['percentage']}%',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: color,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),
                  Container(
                    height: 6,
                    decoration: BoxDecoration(
                      color: Colors.grey[200],
                      borderRadius: BorderRadius.circular(3),
                    ),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: percentage / 100,
                      child: AnimatedContainer(
                        duration: Duration(milliseconds: 1000),
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              color,
                              color.withOpacity(0.7),
                            ],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(3),
                          boxShadow: [
                            BoxShadow(
                              color: color.withOpacity(0.3),
                              blurRadius: 2,
                              offset: Offset(0, 1),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildQuickStats() {
    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(-0.5, 0),
        end: Offset.zero,
      ).animate(_cardAnimation),
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
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
                Icon(Icons.analytics, color: Colors.blue[600], size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Grafik Aktivitas Harian',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: Colors.blueGrey[800],
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Visualisasi data peternakan hari ini',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 16),
            // Grafik Bar Chart compact
            _buildCompactBarChart(),
            SizedBox(height: 16),
            // Legend compact
            _buildCompactChartLegend(),
          ],
        ),
      ),
    );
  }

  Widget _buildCompactBarChart() {
    // Data untuk grafik
    final List<Map<String, dynamic>> chartData = [
      {
        'label': 'Susu\nHari Ini',
        'value': dashboardStats['totalMilkToday'],
        'maxValue': 1000.0,
        'color': Colors.blue[600]!,
        'unit': 'L',
        'icon': Icons.local_drink,
      },
      {
        'label': 'Total\nBlog',
        'value': dashboardStats['totalBlogs'],
        'maxValue': 100.0,
        'color': Colors.teal[600]!,
        'unit': '',
        'icon': Icons.article,
      },
      {
        'label': 'Total\nGaleri',
        'value': dashboardStats['totalGalleries'],
        'maxValue': 100.0,
        'color': Colors.amber[700]!,
        'unit': '',
        'icon': Icons.photo_library,
      },
    ];

    return Container(
      height: 150, // Lebih compact dari 200
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: chartData.map((data) {
          final double value = (data['value'] as num).toDouble();
          final double maxValue = data['maxValue'] as double;
          final double normalizedHeight =
              (value / maxValue * 90).clamp(8.0, 90.0); // Tinggi dikurangi

          return Expanded(
            child: Padding(
              padding:
                  EdgeInsets.symmetric(horizontal: 6), // Padding lebih kecil
              child: GestureDetector(
                onTap: () {
                  // Navigate berdasarkan jenis data
                  if (data['label'].contains('Susu')) {
                    _navigateToView(navigationItems[2]);
                  } else if (data['label'].contains('Blog')) {
                    _navigateToView(navigationItems[5]);
                  } else if (data['label'].contains('Galeri')) {
                    _navigateToView(navigationItems[6]);
                  }
                },
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    // Value display compact
                    Container(
                      margin: EdgeInsets.only(bottom: 6),
                      padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: data['color'].withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: data['color'].withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        '${value.toStringAsFixed(value % 1 == 0 ? 0 : 1)}${data['unit']}',
                        style: TextStyle(
                          fontSize: 10, // Font lebih kecil
                          fontWeight: FontWeight.w700,
                          color: data['color'],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    // Animated Bar compact
                    AnimatedContainer(
                      duration: Duration(milliseconds: 1000),
                      width: double.infinity,
                      height: normalizedHeight,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            data['color'],
                            data['color'].withOpacity(0.7),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(6),
                          bottom: Radius.circular(3),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: data['color'].withOpacity(0.3),
                            blurRadius: 3,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Stack(
                        children: [
                          // Gradient overlay untuk efek glossy
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.white.withOpacity(0.3),
                                  Colors.transparent,
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.center,
                              ),
                              borderRadius: BorderRadius.vertical(
                                top: Radius.circular(6),
                              ),
                            ),
                          ),
                          // Icon di tengah bar (jika bar cukup tinggi)
                          if (normalizedHeight > 30)
                            Center(
                              child: Icon(
                                data['icon'],
                                color: Colors.white.withOpacity(0.8),
                                size: 16, // Icon lebih kecil
                              ),
                            ),
                        ],
                      ),
                    ),
                    SizedBox(height: 6),
                    // Label compact
                    Text(
                      data['label'],
                      style: TextStyle(
                        fontSize: 9, // Font lebih kecil
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[700],
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCompactChartLegend() {
    return Container(
      padding: EdgeInsets.all(12), // Padding lebih kecil
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(8), // Border radius lebih kecil
        border: Border.all(
          color: Colors.grey[200]!,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                size: 14, // Icon lebih kecil
                color: Colors.grey[600],
              ),
              SizedBox(width: 6),
              Text(
                'Informasi Data',
                style: TextStyle(
                  fontSize: 11, // Font lebih kecil
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          Row(
            children: [
              _buildCompactLegendItem(
                color: Colors.blue[600]!,
                label: 'Produksi Susu',
                value:
                    '${dashboardStats['totalMilkToday'].toStringAsFixed(1)}L',
              ),
              SizedBox(width: 12),
              _buildCompactLegendItem(
                color: Colors.teal[600]!,
                label: 'Artikel Blog',
                value: '${dashboardStats['totalBlogs']}',
              ),
            ],
          ),
          SizedBox(height: 6),
          Row(
            children: [
              _buildCompactLegendItem(
                color: Colors.amber[700]!,
                label: 'Foto Galeri',
                value: '${dashboardStats['totalGalleries']}',
              ),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Klik grafik untuk detail',
                  style: TextStyle(
                    fontSize: 9, // Font lebih kecil
                    color: Colors.grey[500],
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompactLegendItem({
    required Color color,
    required String label,
    required String value,
  }) {
    return Expanded(
      child: Row(
        children: [
          Container(
            width: 10, // Lebih kecil
            height: 10, // Lebih kecil
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          SizedBox(width: 4),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 9, // Font lebih kecil
                    color: Colors.grey[600],
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 10, // Font lebih kecil
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Method yang sudah ada tetap dipertahankan untuk backup
  Widget _buildBarChart() {
    // Data untuk grafik
    final List<Map<String, dynamic>> chartData = [
      {
        'label': 'Susu\nHari Ini',
        'value': dashboardStats['totalMilkToday'],
        'maxValue': 1000.0,
        'color': Colors.blue[600]!,
        'unit': 'L',
        'icon': Icons.local_drink,
      },
      {
        'label': 'Total\nBlog',
        'value': dashboardStats['totalBlogs'],
        'maxValue': 100.0,
        'color': Colors.teal[600]!,
        'unit': '',
        'icon': Icons.article,
      },
      {
        'label': 'Total\nGaleri',
        'value': dashboardStats['totalGalleries'],
        'maxValue': 100.0,
        'color': Colors.amber[700]!,
        'unit': '',
        'icon': Icons.photo_library,
      },
    ];

    return Container(
      height: 200,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: chartData.map((data) {
          final double value = (data['value'] as num).toDouble();
          final double maxValue = data['maxValue'] as double;
          final double normalizedHeight =
              (value / maxValue * 120).clamp(10.0, 120.0);

          return Expanded(
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: GestureDetector(
                onTap: () {
                  if (data['label'].contains('Susu')) {
                    _navigateToView(navigationItems[2]);
                  } else if (data['label'].contains('Blog')) {
                    _navigateToView(navigationItems[5]);
                  } else if (data['label'].contains('Galeri')) {
                    _navigateToView(navigationItems[6]);
                  }
                },
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Container(
                      margin: EdgeInsets.only(bottom: 8),
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: data['color'].withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: data['color'].withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Text(
                        '${value.toStringAsFixed(value % 1 == 0 ? 0 : 1)}${data['unit']}',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: data['color'],
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    AnimatedContainer(
                      duration: Duration(milliseconds: 1000),
                      width: double.infinity,
                      height: normalizedHeight,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            data['color'],
                            data['color'].withOpacity(0.7),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(8),
                          bottom: Radius.circular(4),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: data['color'].withOpacity(0.3),
                            blurRadius: 4,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Stack(
                        children: [
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.white.withOpacity(0.3),
                                  Colors.transparent,
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.center,
                              ),
                              borderRadius: BorderRadius.vertical(
                                top: Radius.circular(8),
                              ),
                            ),
                          ),
                          if (normalizedHeight > 40)
                            Center(
                              child: Icon(
                                data['icon'],
                                color: Colors.white.withOpacity(0.8),
                                size: 20,
                              ),
                            ),
                        ],
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      data['label'],
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[700],
                      ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildChartLegend() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.grey[200]!,
          width: 1,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(
                Icons.info_outline,
                size: 16,
                color: Colors.grey[600],
              ),
              SizedBox(width: 8),
              Text(
                'Informasi Grafik',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.grey[700],
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          Row(
            children: [
              _buildLegendItem(
                color: Colors.blue[600]!,
                label: 'Produksi Susu Harian',
                value:
                    '${dashboardStats['totalMilkToday'].toStringAsFixed(1)}L',
              ),
              SizedBox(width: 16),
              _buildLegendItem(
                color: Colors.teal[600]!,
                label: 'Artikel Blog Aktif',
                value: '${dashboardStats['totalBlogs']} artikel',
              ),
            ],
          ),
          SizedBox(height: 8),
          Row(
            children: [
              _buildLegendItem(
                color: Colors.amber[700]!,
                label: 'Koleksi Galeri',
                value: '${dashboardStats['totalGalleries']} foto',
              ),
              SizedBox(width: 16),
              Expanded(
                child: Text(
                  'Klik pada grafik untuk detail',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey[500],
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem({
    required Color color,
    required String label,
    required String value,
  }) {
    return Expanded(
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          SizedBox(width: 6),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey[600],
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar() {
    return Drawer(
      child: Column(
        children: [
          Container(
            width: double.infinity,
            height: 220,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blueGrey[800]!, Colors.blueGrey[600]!],
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
                      radius: 35,
                      backgroundColor: Colors.white.withOpacity(0.3),
                      child: Icon(
                        Icons.admin_panel_settings,
                        size: 40,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(height: 16),
                    Text(
                      currentUser?['name'] ?? 'Administrator',
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
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Text(
                        'Administrator',
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
                    color: isSelected
                        ? Colors.blueGrey[800]!.withOpacity(0.1)
                        : null,
                  ),
                  child: ListTile(
                    leading: Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? Colors.blueGrey[800]!.withOpacity(0.2)
                            : Colors.grey[100],
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Icon(
                        item.icon,
                        color: isSelected
                            ? Colors.blueGrey[800]
                            : Colors.grey[600],
                        size: 20,
                      ),
                    ),
                    title: Text(
                      item.label,
                      style: TextStyle(
                        color: isSelected
                            ? Colors.blueGrey[800]
                            : Colors.grey[800],
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
          SizedBox(height: 8),
        ],
      ),
    );
  }

  Future<void> _logout() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();

      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => LoginView()),
        (route) => false,
      );
    } catch (e) {
      print('Error during logout: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Terjadi kesalahan saat keluar'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (currentUser == null || isLoading) {
      return Scaffold(
        backgroundColor: Colors.grey[50],
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Colors.blueGrey[800]),
              SizedBox(height: 16),
              Text(
                'Memuat dashboard admin...',
                style: TextStyle(color: Colors.grey[600]),
              ),
            ],
          ),
        ),
      );
    }

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFe0eafc), Color(0xFFcfdef3)], // Warna gradasi
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor:
            Colors.transparent, // Transparan agar background terlihat
        drawer:
            MediaQuery.of(context).size.width > 600 ? null : _buildSidebar(),
        appBar: AppBar(
          title: Text(
            'Admin Dashboard',
            style: TextStyle(
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          backgroundColor: Colors.blueGrey[800],
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
                          colors: [
                            Colors.blueGrey[800]!,
                            Colors.blueGrey[600]!
                          ],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                      ),
                      child: Column(
                        children: [
                          CircleAvatar(
                            radius: 30,
                            backgroundColor: Colors.white.withOpacity(0.3),
                            child: Icon(
                              Icons.admin_panel_settings,
                              size: 35,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 12),
                          Text(
                            currentUser?['name'] ?? 'Administrator',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Administrator',
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
                                  ? Colors.blueGrey[800]
                                  : Colors.grey[600],
                              size: 20,
                            ),
                            title: Text(
                              item.label,
                              style: TextStyle(
                                color: isSelected
                                    ? Colors.blueGrey[800]
                                    : Colors.grey[800],
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.normal,
                                fontSize: 14,
                              ),
                            ),
                            selected: isSelected,
                            selectedTileColor:
                                Colors.blueGrey[800]!.withOpacity(0.1),
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
                        final shouldLogout = await showDialog<bool>(
                          context: context,
                          builder: (context) => AlertDialog(
                            backgroundColor: const Color(0xFF23272F),
                            title: Text(
                              'Konfirmasi Keluar',
                              style: TextStyle(color: Colors.white),
                            ),
                            content: Text(
                              'Apakah Anda yakin ingin keluar dari aplikasi?',
                              style: TextStyle(color: Colors.white70),
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(context, false),
                                child: Text('Batal',
                                    style:
                                        TextStyle(color: Colors.blueGrey[300])),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pop(context, true),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.red[400],
                                  foregroundColor: Colors.white,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                                child: Text('Keluar',
                                    style: TextStyle(color: Colors.white)),
                              ),
                            ],
                          ),
                        );
                        if (shouldLogout == true) {
                          _logout();
                        }
                      },
                    ),
                  ],
                ),
              ),

            // Main content
            Expanded(
              child: RefreshIndicator(
                color: Colors.blueGrey[800],
                onRefresh: _initializeDashboard,
                child: SingleChildScrollView(
                  physics: AlwaysScrollableScrollPhysics(),
                  padding: EdgeInsets.only(
                    bottom: MediaQuery.of(context).size.width <= 600 ? 80 : 20,
                  ),
                  child: Column(
                    children: [
                      _buildWelcomeCard(),
                      _buildNotificationPreview(),
                      _buildQuickStats(),
                      _buildStatsOverview(),
                      _buildLactationChart(),
                      SizedBox(height: 80), // beri ruang untuk FAB
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        // Tambahkan FloatingActionButton untuk logout
        floatingActionButton: MediaQuery.of(context).size.width <= 600
            ? FloatingActionButton(
                onPressed: () async {
                  final shouldLogout = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      backgroundColor: const Color(0xFF23272F),
                      title: Text(
                        'Konfirmasi Keluar',
                        style: TextStyle(color: Colors.white),
                      ),
                      content: Text(
                        'Apakah Anda yakin ingin keluar dari aplikasi?',
                        style: TextStyle(color: Colors.white70),
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(context, false),
                          child: Text('Batal',
                              style: TextStyle(color: Colors.blueGrey[300])),
                        ),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(context, true),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red[400],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: Text('Keluar',
                              style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );
                  if (shouldLogout == true) {
                    _logout();
                  }
                },
                backgroundColor: Colors.red[400],
                elevation: 4,
                child: Icon(Icons.logout, color: Colors.white, size: 24),
                tooltip: 'Keluar',
              )
            : null, // Hanya tampilkan pada layar kecil (mobile)
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

// Custom Painter untuk membuat circular chart
class LactationChartPainter extends CustomPainter {
  final List<Map<String, dynamic>> lactationDistribution;
  final List<Color> chartColors;
  final int total;

  LactationChartPainter({
    required this.lactationDistribution,
    required this.chartColors,
    required this.total,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (lactationDistribution.isEmpty || total == 0) return;

    final center = Offset(size.width / 2, size.height / 2);
    final radius = min(size.width, size.height) / 2 - 10;
    final strokeWidth = 20.0;

    // Background circle
    final backgroundPaint = Paint()
      ..color = Colors.grey[200]!
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    canvas.drawCircle(center, radius, backgroundPaint);

    // Draw segments
    double startAngle = -pi / 2; // Start from top

    for (int i = 0; i < lactationDistribution.length; i++) {
      final item = lactationDistribution[i];
      final value = item['value'] as int;
      final sweepAngle = (value / total) * 2 * pi;
      final color = chartColors[i % chartColors.length];

      // Create gradient paint
      final paint = Paint()
        ..shader = RadialGradient(
          colors: [
            color.withOpacity(0.8),
            color,
          ],
          center: Alignment.center,
          radius: 0.8,
        ).createShader(Rect.fromCircle(center: center, radius: radius))
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round;

      // Draw arc
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        paint,
      );

      // Add subtle shadow effect
      final shadowPaint = Paint()
        ..color = color.withOpacity(0.2)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth + 4
        ..strokeCap = StrokeCap.round;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        shadowPaint,
      );

      startAngle += sweepAngle;
    }

    // Draw center circle with shadow
    final centerShadowPaint = Paint()
      ..color = Colors.grey.withOpacity(0.1)
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, radius - strokeWidth + 5, centerShadowPaint);

    final centerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    canvas.drawCircle(center, radius - strokeWidth, centerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
