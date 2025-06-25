import 'dart:io';
import 'dart:async';

import 'package:dairytrack_mobile/controller/APIURL1/loginController.dart';
import 'package:dairytrack_mobile/services/notificationService.dart';
import 'package:dairytrack_mobile/views/analythics/milkProductionAnalysisView.dart';
import 'package:dairytrack_mobile/views/analythics/milkQualityControlsView.dart';

//Feed View
import 'package:dairytrack_mobile/views/feedManagement/dailyFeedSchedule/listSchedule.dart';
import 'package:dairytrack_mobile/views/feedManagement/dailyFeedItem/listFeedItem.dart';
import 'package:dairytrack_mobile/views/feedManagement/feed/listFeed.dart';
import 'package:dairytrack_mobile/views/feedManagement/feedStock/listFeedStock.dart';
import 'package:dairytrack_mobile/views/feedManagement/feedType/listFeedType.dart';
import 'package:dairytrack_mobile/views/feedManagement/grafik/dailyFeedUsage.dart';
import 'package:dairytrack_mobile/views/feedManagement/nutrition/listNutrition.dart';
import 'package:dairytrack_mobile/views/feedManagement/grafik/dailyFeedUsage.dart';

import 'package:dairytrack_mobile/views/milkingView.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'dart:math';
import 'package:intl/date_symbol_data_local.dart';

// Import controllers
import '../controller/APIURL1/milkingSessionController.dart';
import '../controller/APIURL1/cattleDistributionController.dart';
import '../controller/APIURL1/notificationController.dart';

//Healthcheck
import '../views/HealthCheckManagement/HealthCheck/listHealthChecks.dart';
import '../views/HealthCheckManagement/Symptom/listSymptoms.dart';
import '../views/HealthCheckManagement/DiseaseHistory/listDiseaseHistory.dart';
import '../views/HealthCheckManagement/Reproduction/listReproduction.dart';
import '../views/HealthCheckManagement/HealthDashboard/dashboard.dart';

// Import views for navigation
import 'cowManagement/listOfCowsView.dart';
import 'loginView.dart';
import '../widgets/notifications.dart';

class InitialFarmerDashboard extends StatefulWidget {
  @override
  _InitialFarmerDashboardState createState() => _InitialFarmerDashboardState();
}

class _InitialFarmerDashboardState extends State<InitialFarmerDashboard>
    with TickerProviderStateMixin {
  late AnimationController _fabAnimationController;
  late Animation<double> _fabExpandAnimation;
  late AnimationController _fabExpandController;

  // Controllers
  final MilkingSessionController _milkingController =
      MilkingSessionController();
  final CattleDistributionController _cattleController =
      CattleDistributionController();
  final NotificationController _notificationController =
      NotificationController();
  bool _isFabExpanded = false;

  // Animation controllers
  late AnimationController _welcomeAnimationController;
  late AnimationController _cardAnimationController;
  late AnimationController _floatingAnimationController;
  late AnimationController _pulseAnimationController;
  late AnimationController _notificationBadgeController;

  // Animations
  late Animation<double> _welcomeAnimation;
  late Animation<double> _cardAnimation;
  late Animation<double> _floatingAnimation;
  late Animation<double> _pulseAnimation;
  late Animation<double> _notificationBadgeAnimation;

  // Navigation and UI state
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  // Data variables
  Map<String, dynamic>? currentUser;
  bool isLoading = true;
  List<dynamic> milkingSessions = [];
  List<Cow> userManagedCows = [];
  List<User> allUsers = [];

  // Notification variables
  int unreadCount = 0;
  List<dynamic> recentNotifications = [];
  Timer? _notificationTimer;

  // Farmer-specific data
  Map<String, dynamic> farmerStats = {
    'totalCows': 0,
    'totalMilkToday': 0.0,
    'avgMilkPerCow': 0.0,
    'sessionsToday': 0,
  };

  // Milk production trend (7 days)
  List<Map<String, dynamic>> milkProductionTrend = [];

  // Lactation distribution data for farmer's cows
  List<Map<String, dynamic>> lactationDistribution = [];

  // Cow milk production details
  Map<int, Map<String, dynamic>> cowMilkProduction = {};

  // Colors for charts
  final List<Color> chartColors = [
    Colors.teal[400]!, // Early lactation
    Colors.blue[400]!, // Mid lactation
    Colors.orange[400]!, // Late lactation
    Colors.grey[400]!, // No data
  ];

  // Farmer navigation items
  List<NavigationItem> get navigationItems => [
        NavigationItem(
          icon: Icons.dashboard,
          label: 'Dashboard',
          route: 'dashboard',
          widget: () => InitialFarmerDashboard(),
        ),
        NavigationItem(
          icon: Icons.pets,
          label: 'My Cows',
          route: 'cows',
          widget: () => ListOfCowsView(),
        ),
        NavigationItem(
          icon: Icons.local_drink,
          label: 'Milking',
          route: 'milking',
          widget: () => MilkingView(),
        ),
        NavigationItem(
          icon: Icons.bar_chart,
          label: 'Milking Analysis',
          route: 'analytics',
          widget: () => MilkProductionAnalysisView(),
        ),
        NavigationItem(
          icon: Icons.analytics,
          label: 'Milk Quality Analysis',
          route: 'milkQuality',
          widget: () => MilkQualityControlsView(),
        ),
        NavigationItem(
          icon: Icons.category,
          label: 'Feed Types',
          route: 'feed-type',
          widget: () => FeedTypeView(),
        ),
        NavigationItem(
          icon: Icons.local_florist,
          label: 'Nutrition Types',
          route: 'nutrition',
          widget: () => NutrisiView(),
        ),
        NavigationItem(
          icon: Icons.kitchen,
          label: 'Feed',
          route: 'feed',
          widget: () => FeedView(),
        ),
        NavigationItem(
          icon: Icons.inventory,
          label: 'Feed Stock',
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
          label: 'Daily Feed Items',
          route: 'feed-item',
          widget: () => DailyFeedItemsPage(),
        ),
        NavigationItem(
          icon: Icons.checklist,
          label: 'Feed Usage Chart',
          route: 'feed-usage',
          widget: () => FeedUsagePage(),
        ),
        NavigationItem(
          icon: Icons.medical_services,
          label: 'Health Checks',
          route: 'health-checks',
          widget: () => HealthCheckListView(),
        ),
        NavigationItem(
          icon: Icons.visibility,
          label: 'Symptoms',
          route: 'symptoms',
          widget: () => SymptomListView(),
        ),
        NavigationItem(
          icon: Icons.coronavirus,
          label: 'Disease History',
          route: 'disease-history',
          widget: () => DiseaseHistoryListView(),
        ),
        NavigationItem(
          icon: Icons.pregnant_woman,
          label: 'Reproduction',
          route: 'reproduction',
          widget: () => ReproductionListView(),
        ),
        NavigationItem(
          icon: Icons.monitor_heart,
          label: 'Health Dashboard',
          route: 'health-dashboard',
          widget: () => HealthDashboardView(),
        ),
      ];

  @override
  void initState() {
    super.initState();
    _fabExpandController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _fabExpandAnimation = CurvedAnimation(
      parent: _fabExpandController,
      curve: Curves.easeInOut,
    );
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
    _pulseAnimationController = AnimationController(
      duration: Duration(seconds: 2),
      vsync: this,
    );
    _notificationBadgeController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );
// Tambahkan FAB animation controller
    _fabAnimationController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    _fabExpandAnimation = CurvedAnimation(
      parent: _fabAnimationController,
      curve: Curves.easeInOut,
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
    _pulseAnimation = CurvedAnimation(
      parent: _pulseAnimationController,
      curve: Curves.easeInOut,
    );
    _notificationBadgeAnimation = CurvedAnimation(
      parent: _notificationBadgeController,
      curve: Curves.elasticOut,
    );

    _welcomeAnimationController.forward();
    _cardAnimationController.forward();
    _floatingAnimationController.repeat(reverse: true);
    _pulseAnimationController.repeat(reverse: true);
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
      // Save old notifications to compare
      final List<dynamic> oldNotifications = List.from(recentNotifications);
      final notifResult = await _notificationController.getNotifications();

      if (notifResult['success']) {
        // 1. Get displayed notification IDs from SharedPreferences
        final prefs = await SharedPreferences.getInstance();
        final displayedIds =
            prefs.getStringList('displayed_notification_ids') ?? [];

        final today = DateTime.now();
        final todayString = DateFormat('yyyy-MM-dd').format(today);

        final newNotifications =
            (notifResult['data']['notifications'] as List? ?? [])
                .where((notification) =>
                        !(notification['is_read'] ?? false) && // Is unread
                        !oldNotifications.any((old) =>
                            old['id'] ==
                            notification['id']) && // Is new in this session
                        !displayedIds.contains(notification['id']
                            .toString()) // Has not been displayed before
                    )
                .toList();

        // 2. Show statusbar notification ONLY for today's notifications
        for (var notification in newNotifications) {
          // Check if notification has a valid creation date
          final String createdAt = notification['created_at'] ?? '';
          if (createdAt.isNotEmpty) {
            try {
              final notifDate = DateTime.parse(createdAt);
              final notifDateString =
                  DateFormat('yyyy-MM-dd').format(notifDate);

              // Only show status bar notification if it's from today
              if (notifDateString == todayString) {
                NotificationService().showNotification(
                  id: notification['id'] ??
                      DateTime.now().millisecondsSinceEpoch,
                  title: notification['title'] ?? 'Notifikasi baru',
                  body: notification['message'] ?? '',
                  type: notification['type'] ?? 'general',
                );
              }
            } catch (e) {
              print('Error parsing notification date: $e');
            }
          }

          // 3. Add the ID to displayed IDs list regardless of date
          // (to prevent showing again even if it's not from today)
          displayedIds.add(notification['id'].toString());
        }

        // 4. Save the updated list back to SharedPreferences
        // Limit stored IDs to prevent excessive storage (e.g., last 100 notifications)
        if (displayedIds.length > 100) {
          displayedIds.removeRange(0, displayedIds.length - 100);
        }
        await prefs.setStringList('displayed_notification_ids', displayedIds);

        // 5. Update state with new notifications for the UI
        setState(() {
          final oldCount = unreadCount;

          if (notifResult['success']) {
            recentNotifications =
                (notifResult['data']['notifications'] as List? ?? [])
                    .take(5)
                    .toList();
            unreadCount = recentNotifications
                .where((notif) => !(notif['is_read'] ?? false))
                .length;

            // Animation logic remains unchanged
            if (unreadCount > oldCount && oldCount >= 0) {
              _notificationBadgeController.forward().then((_) {
                _notificationBadgeController.reverse();
              });
            }
          }
        });
      }
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
    _pulseAnimationController.dispose();
    _notificationBadgeController.dispose();
    _fabAnimationController.dispose(); // Tambahkan ini
    _notificationTimer?.cancel();
    super.dispose();
  }

  void _toggleFab() {
    setState(() {
      _isFabExpanded = !_isFabExpanded;
    });

    if (_isFabExpanded) {
      _fabAnimationController.forward();
    } else {
      _fabAnimationController.reverse();
    }
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
            'role': userRole ?? 'Farmer',
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

  // ...existing code...
  Widget _buildFloatingActionButtons() {
    // Group navigation items by category
    final cowManagement = [navigationItems[1]]; // My Cows
    final milkingAnalysis = [
      navigationItems[2],
      navigationItems[3],
      navigationItems[4]
    ]; // Milking, Analysis
    final feedManagement = navigationItems.sublist(5, 12); // Feed related
    final healthManagement = navigationItems.sublist(12); // Health related

    return Positioned(
      bottom: 20,
      right: 16,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_isFabExpanded) ...[
            // Health Management Group
            ScaleTransition(
              scale: _fabExpandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.red[600],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Health Check Management',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "Health Check Management",
                      backgroundColor: Colors.red[600],
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showMenuDialog('Health Check Management', healthManagement);
                      },
                      child: const Icon(Icons.health_and_safety, size: 20),
                    ),
                  ],
                ),
              ),
            ),

            // Feed Management Group
            ScaleTransition(
              scale: _fabExpandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.green[600],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Feed Management',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "feed_management",
                      backgroundColor: Colors.green[600],
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showMenuDialog('Feed Management', feedManagement);
                      },
                      child: const Icon(Icons.grass, size: 20),
                    ),
                  ],
                ),
              ),
            ),

            // Milking & Analysis Group
            ScaleTransition(
              scale: _fabExpandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.blueGrey[700],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Milking & Analysis',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "milking_analysis",
                      backgroundColor: Colors.blueGrey[700],
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showMenuDialog('Milking & Analysis', milkingAnalysis);
                      },
                      child: const Icon(Icons.local_drink, size: 20),
                    ),
                  ],
                ),
              ),
            ),

            // Cattle Management Group
            ScaleTransition(
              scale: _fabExpandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.brown[600],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'My Cows',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "cattle_management",
                      backgroundColor: Colors.brown[600],
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _navigateToView(cowManagement[0]);
                      },
                      child: const Icon(Icons.pets, size: 20),
                    ),
                  ],
                ),
              ),
            ),

            // Change Password FAB
            ScaleTransition(
              scale: _fabExpandAnimation,
              child: Container(
                margin: const EdgeInsets.only(bottom: 12),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.purple[600],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'Change Password',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    FloatingActionButton(
                      heroTag: "change_password",
                      backgroundColor: Colors.purple[600],
                      foregroundColor: Colors.white,
                      elevation: 6,
                      mini: true,
                      onPressed: () {
                        _toggleFab();
                        _showChangePasswordDialog();
                      },
                      child: const Icon(Icons.lock_reset, size: 20),
                    ),
                  ],
                ),
              ),
            ),
          ],

          // Main FAB
          FloatingActionButton(
            heroTag: "main_fab",
            backgroundColor:
                _isFabExpanded ? Colors.grey[600] : Colors.blueGrey[800],
            foregroundColor: Colors.white,
            elevation: 8,
            onPressed: _toggleFab,
            child: AnimatedRotation(
              duration: const Duration(milliseconds: 300),
              turns: _isFabExpanded ? 0.125 : 0.0,
              child: Icon(
                _isFabExpanded ? Icons.close : Icons.menu,
                size: 28,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showMenuDialog(String title, List<NavigationItem> items) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.teal[50],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.teal[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  _getGroupIcon(title),
                  color: Colors.teal[600],
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: Colors.teal[800],
                    fontSize: 18,
                  ),
                ),
              ),
            ],
          ),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: items.length,
              itemBuilder: (context, index) {
                final item = items[index];
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.teal[200]!),
                  ),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.teal[50],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        item.icon,
                        color: Colors.teal[600],
                        size: 20,
                      ),
                    ),
                    title: Text(
                      item.label,
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: Colors.teal[800],
                      ),
                    ),
                    trailing: Icon(
                      Icons.arrow_forward_ios,
                      size: 16,
                      color: Colors.teal[400],
                    ),
                    onTap: () {
                      Navigator.pop(context);
                      _navigateToView(item);
                    },
                  ),
                );
              },
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(
                'Close',
                style: TextStyle(color: Colors.teal[600]),
              ),
            ),
          ],
        );
      },
    );
  }

  IconData _getGroupIcon(String title) {
    switch (title) {
      case 'Health Management':
        return Icons.health_and_safety;
      case 'Feed Management':
        return Icons.grass;
      case 'Milking & Analysis':
        return Icons.local_drink;
      case 'Cattle Management':
        return Icons.pets;
      default:
        return Icons.menu;
    }
  }

  Future<void> _initializeDashboard() async {
    setState(() {
      isLoading = true;
    });

    try {
      await Future.wait([
        _loadFarmerCows(),
        _loadMilkingSessions(),
      ]);

      _calculateFarmerStats();
      _calculateMilkProductionTrend();
      _calculateLactationDistribution();
      _calculateCowMilkProduction();
    } catch (e) {
      print('Error initializing dashboard: $e');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> _loadFarmerCows() async {
    try {
      if (currentUser != null) {
        print('DEBUG: Loading cows for user ID: ${currentUser!['id']}');

        final result =
            await _cattleController.listCowsByUser(currentUser!['id']);
        print('DEBUG: API Response: $result');

        if (result['success']) {
          final data = result['data'] as Map<String, dynamic>? ?? {};
          final cowsData = data['cows'] as List<dynamic>? ?? [];
          print('DEBUG: Cows data received: ${cowsData.length} cows');

          setState(() {
            userManagedCows =
                cowsData.map((cowData) => Cow.fromJson(cowData)).toList();
          });
          print('DEBUG: userManagedCows set: ${userManagedCows.length} cows');
        } else {
          print('DEBUG: API call failed: ${result['message']}');
          setState(() {
            userManagedCows = [];
          });
        }
      }
    } catch (e) {
      print('ERROR loading farmer cows: $e');
      setState(() {
        userManagedCows = [];
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

  String _getLocalDateString([DateTime? date]) {
    final targetDate = date ?? DateTime.now();
    return DateFormat('yyyy-MM-dd').format(targetDate);
  }

  String _getSessionLocalDate(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      return _getLocalDateString(date);
    } catch (e) {
      return '';
    }
  }

  void _calculateFarmerStats() {
    final today = _getLocalDateString();
    double totalMilkToday = 0.0;
    int sessionsToday = 0;

    // Filter sessions for farmer's cows only
    final managedCowIds = userManagedCows.map((cow) => cow.id).toSet();

    final todaySessions = milkingSessions.where((session) {
      final cowId = session['cow_id'];
      final sessionDate = _getSessionLocalDate(session['milking_time']);
      return managedCowIds.contains(cowId) && sessionDate == today;
    }).toList();

    for (var session in todaySessions) {
      totalMilkToday +=
          double.tryParse(session['volume']?.toString() ?? '0') ?? 0;
      sessionsToday++;
    }

    final avgMilkPerCow = userManagedCows.isNotEmpty
        ? totalMilkToday / userManagedCows.length
        : 0.0;

    setState(() {
      farmerStats = {
        'totalCows': userManagedCows.length,
        'totalMilkToday': totalMilkToday,
        'avgMilkPerCow': avgMilkPerCow,
        'sessionsToday': sessionsToday,
      };
    });
  }

  void _calculateMilkProductionTrend() {
    final managedCowIds = userManagedCows.map((cow) => cow.id).toSet();

    // Get last 7 days
    List<String> last7Days = [];
    for (int i = 6; i >= 0; i--) {
      final date = DateTime.now().subtract(Duration(days: i));
      last7Days.add(_getLocalDateString(date));
    }

    // Filter sessions for farmer's cows
    final farmerSessions = milkingSessions.where((session) {
      return managedCowIds.contains(session['cow_id']);
    }).toList();

    // Calculate daily production
    final dailyProduction = last7Days.map((date) {
      final daysSessions = farmerSessions
          .where((session) =>
              _getSessionLocalDate(session['milking_time']) == date)
          .toList();

      final totalVolume = daysSessions.fold<double>(
          0.0,
          (sum, session) =>
              sum +
              (double.tryParse(session['volume']?.toString() ?? '0') ?? 0));

      return {
        'date': DateFormat('dd MMM', 'id_ID').format(DateTime.parse(date)),
        'volume': totalVolume,
        'sessions': daysSessions.length,
      };
    }).toList();

    setState(() {
      milkProductionTrend = dailyProduction.cast<Map<String, dynamic>>();
    });
  }

  void _calculateLactationDistribution() {
    Map<String, int> lactationCount = {};

    for (var cow in userManagedCows) {
      final phase = cow.lactationPhase ?? 'Unknown';
      lactationCount[phase] = (lactationCount[phase] ?? 0) + 1;
    }

    setState(() {
      lactationDistribution = lactationCount.entries
          .map((entry) => {
                'name': entry.key,
                'value': entry.value,
                'percentage': userManagedCows.isNotEmpty
                    ? (entry.value / userManagedCows.length * 100)
                        .toStringAsFixed(1)
                    : '0.0',
              })
          .toList();
    });
  }

  void _calculateCowMilkProduction() {
    final managedCowIds = userManagedCows.map((cow) => cow.id).toSet();
    final today = _getLocalDateString();

    Map<int, Map<String, dynamic>> production = {};

    // Initialize with cow data
    for (var cow in userManagedCows) {
      production[cow.id] = {
        'cowData': cow,
        'totalVolume': 0.0,
        'sessionsCount': 0,
        'avgPerSession': 0.0,
        'todayVolume': 0.0,
      };
    }

    // Calculate production for each cow
    for (var session in milkingSessions) {
      final cowId = session['cow_id'];
      if (managedCowIds.contains(cowId)) {
        final volume =
            double.tryParse(session['volume']?.toString() ?? '0') ?? 0;
        production[cowId]!['totalVolume'] += volume;
        production[cowId]!['sessionsCount'] += 1;

        // Check if session is today
        if (_getSessionLocalDate(session['milking_time']) == today) {
          production[cowId]!['todayVolume'] += volume;
        }
      }
    }

    // Calculate averages
    production.forEach((cowId, data) {
      final sessionsCount = data['sessionsCount'] as int;
      if (sessionsCount > 0) {
        data['avgPerSession'] = data['totalVolume'] / sessionsCount;
      }
    });

    setState(() {
      cowMilkProduction = production;
    });
  }

  String _formatAge(String? birthDate) {
    if (birthDate == null || birthDate.isEmpty) return 'N/A';

    try {
      DateTime birth;

      // Handle different date formats
      if (birthDate.contains(',')) {
        // RFC 2822 format: "Fri, 11 Mar 2022 00:00:00 GMT"
        birth = HttpDate.parse(birthDate);
      } else {
        // ISO format or other standard formats
        birth = DateTime.parse(birthDate);
      }

      final now = DateTime.now();

      int years = now.year - birth.year;
      int months = now.month - birth.month;

      if (months < 0) {
        years--;
        months += 12;
      } else if (months == 0 && now.day < birth.day) {
        years--;
        months = 11;
      } else if (now.day < birth.day) {
        months--;
      }

      if (years == 0) {
        return '$months bulan';
      } else if (months == 0) {
        return '$years tahun';
      } else {
        return '${years}th ${months}bln';
      }
    } catch (e) {
      print('Error parsing birth date: $birthDate - $e');
      return 'N/A';
    }
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
                    'Latest Notifications',
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
                    'See All',
                    style: TextStyle(
                      color: Colors.green[700],
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
                              notification['title'] ?? 'Notification',
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
                          child: Text('Close'),
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
                              notification['title'] ?? 'Notification',
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
          minHeight: 130,
          maxHeight: 300,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.teal[400]!,
              Colors.teal[600]!
            ], // Ganti base warna ke teal
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.teal[800]!, width: 2), // Border teal
          boxShadow: [
            BoxShadow(
              color: Colors.teal[400]!.withOpacity(0.3),
              blurRadius: 20,
              offset: Offset(0, 10),
            ),
          ],
        ),
        child: Stack(
          children: [
            // Floating background icons
            Positioned(
              top: 10,
              right: 20,
              child: AnimatedBuilder(
                animation: _floatingAnimation,
                builder: (context, child) => Transform.translate(
                  offset:
                      Offset(0, sin(_floatingAnimation.value * 2 * pi) * 10),
                  child: Text(
                    '🐄',
                    style: TextStyle(
                      fontSize: 60,
                      color: Colors.white.withOpacity(0.15),
                      fontFamily: 'Courier',
                    ),
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 10,
              left: 30,
              child: AnimatedBuilder(
                animation: _floatingAnimation,
                builder: (context, child) => Transform.translate(
                  offset: Offset(
                      0, sin((_floatingAnimation.value + 0.5) * 2 * pi) * 8),
                  child: Text(
                    '🥛',
                    style: TextStyle(
                      fontSize: 40,
                      color: Colors.white.withOpacity(0.12),
                      fontFamily: 'Courier',
                    ),
                  ),
                ),
              ),
            ),

            // Add some farm-themed particles
            Positioned(
              top: 60,
              left: 40,
              child: AnimatedBuilder(
                animation: _floatingAnimation,
                builder: (context, child) => Transform.translate(
                  offset: Offset(
                      0, sin((_floatingAnimation.value + 0.2) * 2 * pi) * 5),
                  child: Text(
                    '🌾',
                    style: TextStyle(
                      fontSize: 24,
                      color: Colors.white.withOpacity(0.12),
                      fontFamily: 'Courier',
                    ),
                  ),
                ),
              ),
            ),

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
                          border: Border.all(
                              color: Colors.teal[800]!,
                              width: 1), // Border teal
                        ),
                        child: Text(
                          '👨‍🌾',
                          style: TextStyle(fontSize: 20),
                        ),
                      ),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Welcome, ${currentUser!['name']}!',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: MediaQuery.of(context).size.width < 400
                                ? 16
                                : 20,
                            fontWeight: FontWeight.w700,
                            fontFamily: 'Roboto',
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 12),
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) => Transform.scale(
                      scale: 1.0 + (_pulseAnimation.value * 0.05),
                      child: Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.teal[100]!
                              .withOpacity(0.8), // Ganti badge ke teal
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                              color: Colors.teal[400]!,
                              width: 1), // Border teal
                        ),
                        child: Text(
                          'Farmer',
                          style: TextStyle(
                            color: Colors.teal[900], // Teks badge teal gelap
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            fontFamily: 'Roboto',
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 12),
                  Text(
                    'Farmer Dashboard - Manage your farm easily and efficiently',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.9),
                      fontSize: 12,
                      height: 1.4,
                      fontFamily: 'Roboto',
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
                            fontFamily: 'Roboto',
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
                          fontFamily: 'Roboto',
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 16),
                  // Quick stats preview
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _buildQuickStatPreview(
                          '🐄', '${farmerStats['totalCows']}', 'Sapi'),
                      _buildQuickStatPreview(
                          '🥛',
                          '${farmerStats['totalMilkToday'].toStringAsFixed(1)}L',
                          'Hari Ini'),
                      _buildQuickStatPreview(
                          '📊', '${farmerStats['sessionsToday']}', 'Sesi'),
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

  Widget _buildQuickStatPreview(String icon, String value, String label) {
    return Container(
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(icon, style: TextStyle(fontSize: 16)),
          SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            label,
            style: TextStyle(
              color: Colors.white70,
              fontSize: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMilkProductionChart() {
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
                Icon(Icons.trending_up, color: Colors.blue[600], size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Milk Production Analysis (Last 7 Days)',
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
              'The graph shows the trend of total daily milk production from the cows you manage.',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[600],
              ),
            ),
            SizedBox(height: 16),
            milkProductionTrend.isEmpty
                ? Container(
                    height: 200,
                    child: Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.local_drink,
                              size: 48, color: Colors.grey[400]),
                          SizedBox(height: 16),
                          Text(
                            'There is no milk production data yet',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  )
                : Container(
                    height: 200,
                    child: _buildSimpleChart(),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildSimpleChart() {
    if (milkProductionTrend.isEmpty) return SizedBox.shrink();

    final maxVolume = milkProductionTrend
        .map((e) => e['volume'] as double)
        .reduce((a, b) => a > b ? a : b);

    return Column(
      children: [
        Expanded(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: milkProductionTrend.asMap().entries.map((entry) {
              final index = entry.key;
              final data = entry.value;
              final volume = data['volume'] as double;
              final height = maxVolume > 0 ? (volume / maxVolume) * 120 : 0.0;

              return Expanded(
                child: GestureDetector(
                  onTap: () {
                    _showProductionDetail(data);
                  },
                  child: Container(
                    margin: EdgeInsets.symmetric(horizontal: 2),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Volume text
                        if (volume > 0)
                          Text(
                            '${volume.toStringAsFixed(1)}L',
                            style: TextStyle(
                              fontSize: 8,
                              fontWeight: FontWeight.bold,
                              color: Colors.blue[600],
                            ),
                          ),
                        SizedBox(height: 4),
                        // Bar
                        AnimatedContainer(
                          duration: Duration(milliseconds: 800),
                          curve: Curves.easeOutBack,
                          height: height,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [Colors.blue[400]!, Colors.blue[600]!],
                              begin: Alignment.bottomCenter,
                              end: Alignment.topCenter,
                            ),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        SizedBox(height: 8),
                        // Date label
                        Text(
                          data['date'],
                          style: TextStyle(
                            fontSize: 8,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  void _showProductionDetail(Map<String, dynamic> data) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Production Details'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tanggal: ${data['date']}'),
            SizedBox(height: 8),
            Text('Total Produksi: ${data['volume'].toStringAsFixed(1)}L'),
            SizedBox(height: 8),
            Text('Jumlah Sesi: ${data['sessions']}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Tutup'),
          ),
        ],
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
                Icon(Icons.pie_chart, color: Colors.orange[600], size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Distribution of Lactation Phases',
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
              'The composition of the lactation phase of the cows you manage',
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
                            'There is no data on cattle yet',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ],
                      ),
                    ),
                  )
                : Container(
                    constraints: BoxConstraints(maxHeight: 200),
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: lactationDistribution.length,
                      itemBuilder: (context, index) {
                        final item = lactationDistribution[index];
                        final color = chartColors[index % chartColors.length];

                        return Container(
                          margin: EdgeInsets.only(bottom: 8),
                          child: Row(
                            children: [
                              Container(
                                width: 12,
                                height: 12,
                                decoration: BoxDecoration(
                                  color: color,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                              SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  item['name'],
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              Text(
                                '${item['value']} (${item['percentage']}%)',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: color,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildMyCowsList() {
    if (userManagedCows.isEmpty) return SizedBox.shrink();

    return SlideTransition(
      position: Tween<Offset>(
        begin: Offset(0, 0.5),
        end: Offset.zero,
      ).animate(_cardAnimation),
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.green[50],
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      Icons.pets,
                      color: Colors.green[600],
                      size: 20,
                    ),
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'The Cows You Manage & Milk Production',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.blueGrey[800],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            GridView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: MediaQuery.of(context).size.width > 600 ? 3 : 2,
                crossAxisSpacing: 10,
                mainAxisSpacing: 10,
                childAspectRatio:
                    MediaQuery.of(context).size.width > 600 ? 0.8 : 0.75,
              ),
              itemCount: userManagedCows.length,
              itemBuilder: (context, index) {
                final cow = userManagedCows[index];
                final production = cowMilkProduction[cow.id] ??
                    {
                      'totalVolume': 0.0,
                      'sessionsCount': 0,
                      'avgPerSession': 0.0,
                      'todayVolume': 0.0,
                    };

                return _buildCowCard(cow, production);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCowCard(Cow cow, Map<String, dynamic> production) {
    final isFemale = cow.gender?.toLowerCase() == 'female' ||
        cow.gender?.toLowerCase() == 'betina';

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, Colors.grey[50]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!, width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 8,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Padding(
        padding: EdgeInsets.all(8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header with cow info
            Row(
              children: [
                Text(
                  isFemale ? '🐄' : '🐂',
                  style: TextStyle(fontSize: 20),
                ),
                SizedBox(width: 6),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cow.name ?? 'Unknown',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.blueGrey[800],
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        'ID: ${cow.id}',
                        style: TextStyle(
                          fontSize: 8,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            SizedBox(height: 6),

            // Basic info
            Wrap(
              spacing: 2,
              runSpacing: 2,
              children: [
                _buildInfoChip(cow.breed ?? 'Unknown', Colors.blue),
                _buildInfoChip(isFemale ? '♀ Betina' : '♂ Jantan',
                    isFemale ? Colors.pink : Colors.orange),
                _buildInfoChip(_formatAge(cow.birth), Colors.green),
              ],
            ),

            SizedBox(height: 8),

            if (isFemale) ...[
              // Production stats for female cows
              Container(
                padding: EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: Colors.blue[50],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildProductionStat(
                          '${production['totalVolume'].toStringAsFixed(1)}L',
                          'Total',
                          Colors.blue[600]!,
                        ),
                        _buildProductionStat(
                          '${production['todayVolume'].toStringAsFixed(1)}L',
                          'Hari Ini',
                          Colors.green[600]!,
                        ),
                      ],
                    ),
                    SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildProductionStat(
                          '${production['avgPerSession'].toStringAsFixed(1)}L',
                          'Rata-rata',
                          Colors.orange[600]!,
                        ),
                        _buildProductionStat(
                          '${production['sessionsCount']}',
                          'Sesi',
                          Colors.purple[600]!,
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              SizedBox(height: 6),

              // Lactation phase and performance
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Flexible(
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: _getLactationColor(cow.lactationPhase),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        cow.lactationPhase ?? 'N/A',
                        style: TextStyle(
                          fontSize: 7,
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 4),
                  Text(
                    '${cow.weight ?? 0} kg',
                    style: TextStyle(
                      fontSize: 8,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),

              SizedBox(height: 6),

              // Performance indicator
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(vertical: 3),
                decoration: BoxDecoration(
                  color: _getPerformanceColor(production['avgPerSession']),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _getPerformanceText(production['avgPerSession']),
                  style: TextStyle(
                    fontSize: 8,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
            ] else ...[
              // Male cow info
              Expanded(
                child: Container(
                  padding: EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        '🚫🥛',
                        style: TextStyle(fontSize: 20),
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Sapi Pejantan',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[700],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Does not produce milk',
                        style: TextStyle(
                          fontSize: 8,
                          color: Colors.grey[600],
                        ),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: 4),
                      Text(
                        '${cow.weight ?? 0} kg',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(String text, Color color) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 4, vertical: 1),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 7,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _buildProductionStat(String value, String label, Color color) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            fontSize: 7,
            color: color.withOpacity(0.8),
          ),
        ),
      ],
    );
  }

  Color _getLactationColor(String? phase) {
    switch (phase) {
      case 'Early':
        return Colors.green[600]!;
      case 'Mid':
        return Colors.blue[600]!;
      case 'Late':
        return Colors.orange[600]!;
      default:
        return Colors.grey[600]!;
    }
  }

  Color _getPerformanceColor(double avgPerSession) {
    if (avgPerSession >= 15) return Colors.green[600]!;
    if (avgPerSession >= 10) return Colors.orange[600]!;
    return Colors.red[600]!;
  }

  String _getPerformanceText(double avgPerSession) {
    if (avgPerSession >= 15) return '🌟 Produksi Tinggi';
    if (avgPerSession >= 10) return '⚡ Produksi Sedang';
    return '📈 Perlu Perhatian';
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
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFe0eafc), Color(0xFFcfdef3)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          elevation: 0,
          backgroundColor: Colors.teal[400],
          title: Text(
            'Farmer Dashboard',
            style: TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          automaticallyImplyLeading: false, // Hilangkan hamburger menu
          actions: [
            _buildNotificationButton(),
            SizedBox(width: 8),
          ],
        ),
        body: Stack(
          // Ganti body menjadi Stack
          children: [
            // Main content
            isLoading
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        CircularProgressIndicator(
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.teal[400]!),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Loading farm data...',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _initializeDashboard,
                    color: const Color.fromRGBO(0, 150, 136, 1),
                    child: SingleChildScrollView(
                      physics: AlwaysScrollableScrollPhysics(),
                      child: Column(
                        children: [
                          _buildWelcomeCard(),
                          _buildNotificationPreview(),
                          _buildMilkProductionChart(),
                          _buildLactationChart(),
                          _buildMyCowsList(),
                          SizedBox(height: 80), // beri ruang untuk FAB
                        ],
                      ),
                    ),
                  ),

            // Floating Action Buttons
            _buildFloatingActionButtons(),
          ],
        ),

        // Pindahkan logout FAB ke kiri bawah
        floatingActionButtonLocation: FloatingActionButtonLocation.startFloat,
        floatingActionButton: FloatingActionButton(
          onPressed: () async {
            final shouldLogout = await showDialog<bool>(
              context: context,
              builder: (context) => AlertDialog(
                backgroundColor: const Color(0xFF23272F),
                title: Text(
                  'Confirm Exit',
                  style: TextStyle(color: Colors.white),
                ),
                content: Text(
                  'Are you sure you want to exit the application?',
                  style: TextStyle(color: Colors.white70),
                ),
                actions: [
                  TextButton(
                    onPressed: () => Navigator.pop(context, false),
                    child: Text('Cancel',
                        style: TextStyle(color: Colors.tealAccent)),
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
                    child: Text('Exit', style: TextStyle(color: Colors.white)),
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
          tooltip: 'Exit',
        ),
      ),
    );
  }

  void _showChangePasswordDialog() {
    final _currentPasswordController = TextEditingController();
    final _newPasswordController = TextEditingController();
    final _confirmPasswordController = TextEditingController();
    final _formKey = GlobalKey<FormState>();
    final _loginController = LoginController();
    bool _isCurrentPasswordVisible = false;
    bool _isNewPasswordVisible = false;
    bool _isConfirmPasswordVisible = false;
    bool _isLoading = false;

    // Password strength variables
    double _passwordStrength = 0.0;
    String _passwordFeedback = "";
    Color _strengthColor = Colors.red;

    // Password strength calculation function
    void _calculatePasswordStrength(String password) {
      if (password.isEmpty) {
        _passwordStrength = 0.0;
        _passwordFeedback = "";
        _strengthColor = Colors.red;
        return;
      }

      double strength = 0;
      String feedback = "";

      // Length check
      if (password.length >= 8) {
        strength += 25;
      } else {
        feedback = "Password should be at least 8 characters";
      }

      // Contains lowercase
      if (RegExp(r'[a-z]').hasMatch(password)) strength += 15;
      // Contains uppercase
      if (RegExp(r'[A-Z]').hasMatch(password)) strength += 15;
      // Contains numbers
      if (RegExp(r'[0-9]').hasMatch(password)) strength += 15;
      // Contains special chars
      if (RegExp(r'[^A-Za-z0-9]').hasMatch(password)) strength += 30;

      // Set feedback and color based on strength
      if (strength <= 30) {
        feedback = feedback.isEmpty ? "Password is weak" : feedback;
        _strengthColor = Colors.red;
      } else if (strength <= 60) {
        feedback = feedback.isEmpty ? "Password is moderate" : feedback;
        _strengthColor = Colors.orange;
      } else if (strength <= 80) {
        feedback = feedback.isEmpty ? "Password is strong" : feedback;
        _strengthColor = Colors.blue;
      } else {
        feedback = "Password is very strong";
        _strengthColor = Colors.green;
      }

      _passwordStrength = strength;
      _passwordFeedback = feedback;
    }

    showDialog(
      context: context,
      barrierDismissible: false, // Prevent tap outside to dismiss
      builder: (BuildContext context) {
        return PopScope(
          // Use PopScope instead of WillPopScope for newer Flutter versions
          canPop: false, // Completely prevent popping
          onPopInvoked: (bool didPop) {
            // This will be called when back button is pressed, but won't dismiss
            if (didPop) return;
            // Optionally show a message that dialog cannot be dismissed
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Please complete the password change or cancel'),
                duration: Duration(seconds: 1),
              ),
            );
          },
          child: StatefulBuilder(
            builder: (context, setState) {
              return AlertDialog(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
                title: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.teal[50],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.lock_outline,
                        color: Colors.teal[600],
                        size: 20,
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Change Password',
                        style: TextStyle(
                          color: Colors.teal[800],
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
                content: SingleChildScrollView(
                  child: Container(
                    width: double.maxFinite,
                    constraints: BoxConstraints(
                      maxHeight: MediaQuery.of(context).size.height * 0.6,
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Current Password Field
                          TextFormField(
                            controller: _currentPasswordController,
                            obscureText: !_isCurrentPasswordVisible,
                            decoration: InputDecoration(
                              labelText: 'Current Password',
                              hintText: 'Enter your current password',
                              prefixIcon:
                                  Icon(Icons.lock, color: Colors.teal[600]),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isCurrentPasswordVisible
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                  color: Colors.grey[600],
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isCurrentPasswordVisible =
                                        !_isCurrentPasswordVisible;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide:
                                    BorderSide(color: Colors.teal[600]!),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your current password';
                              }
                              return null;
                            },
                          ),
                          SizedBox(height: 16),

                          // New Password Field with Strength Indicator
                          TextFormField(
                            controller: _newPasswordController,
                            obscureText: !_isNewPasswordVisible,
                            decoration: InputDecoration(
                              labelText: 'New Password',
                              hintText: 'Enter your new password',
                              prefixIcon: Icon(Icons.lock_reset,
                                  color: Colors.teal[600]),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isNewPasswordVisible
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                  color: Colors.grey[600],
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isNewPasswordVisible =
                                        !_isNewPasswordVisible;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide:
                                    BorderSide(color: Colors.teal[600]!),
                              ),
                            ),
                            onChanged: (value) {
                              setState(() {
                                _calculatePasswordStrength(value);
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter a new password';
                              }
                              if (value.length < 8) {
                                return 'Password must be at least 8 characters';
                              }
                              return null;
                            },
                          ),

                          // Password Strength Indicator
                          if (_newPasswordController.text.isNotEmpty) ...[
                            SizedBox(height: 12),
                            Container(
                              width: double.infinity,
                              padding: EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.grey[50],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey[200]!),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'Password Strength',
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey[700],
                                    ),
                                  ),
                                  SizedBox(height: 8),
                                  Container(
                                    width: double.infinity,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      borderRadius: BorderRadius.circular(4),
                                      color: Colors.grey[300],
                                    ),
                                    child: FractionallySizedBox(
                                      alignment: Alignment.centerLeft,
                                      widthFactor: _passwordStrength / 100,
                                      child: Container(
                                        decoration: BoxDecoration(
                                          borderRadius:
                                              BorderRadius.circular(4),
                                          color: _strengthColor,
                                        ),
                                      ),
                                    ),
                                  ),
                                  SizedBox(height: 8),
                                  if (_passwordFeedback.isNotEmpty)
                                    Text(
                                      _passwordFeedback,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: _strengthColor,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  SizedBox(height: 8),
                                  Text(
                                    'Requirements:',
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                  SizedBox(height: 6),
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: _buildRequirementChip(
                                              'Min 8 characters',
                                              _newPasswordController
                                                      .text.length >=
                                                  8,
                                            ),
                                          ),
                                          SizedBox(width: 4),
                                          Expanded(
                                            child: _buildRequirementChip(
                                              'Uppercase (A-Z)',
                                              RegExp(r'[A-Z]').hasMatch(
                                                  _newPasswordController.text),
                                            ),
                                          ),
                                        ],
                                      ),
                                      SizedBox(height: 4),
                                      Row(
                                        children: [
                                          Expanded(
                                            child: _buildRequirementChip(
                                              'Lowercase (a-z)',
                                              RegExp(r'[a-z]').hasMatch(
                                                  _newPasswordController.text),
                                            ),
                                          ),
                                          SizedBox(width: 4),
                                          Expanded(
                                            child: _buildRequirementChip(
                                              'Number (0-9)',
                                              RegExp(r'[0-9]').hasMatch(
                                                  _newPasswordController.text),
                                            ),
                                          ),
                                        ],
                                      ),
                                      SizedBox(height: 4),
                                      _buildRequirementChip(
                                        'Special character (!@#\$%^&*)',
                                        RegExp(r'[^A-Za-z0-9]').hasMatch(
                                            _newPasswordController.text),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],

                          SizedBox(height: 16),

                          // Confirm Password Field
                          TextFormField(
                            controller: _confirmPasswordController,
                            obscureText: !_isConfirmPasswordVisible,
                            decoration: InputDecoration(
                              labelText: 'Confirm New Password',
                              hintText: 'Confirm your new password',
                              prefixIcon: Icon(Icons.lock_clock,
                                  color: Colors.teal[600]),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _isConfirmPasswordVisible
                                      ? Icons.visibility_off
                                      : Icons.visibility,
                                  color: Colors.grey[600],
                                ),
                                onPressed: () {
                                  setState(() {
                                    _isConfirmPasswordVisible =
                                        !_isConfirmPasswordVisible;
                                  });
                                },
                              ),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide:
                                    BorderSide(color: Colors.teal[600]!),
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please confirm your new password';
                              }
                              if (value != _newPasswordController.text) {
                                return 'Passwords do not match';
                              }
                              return null;
                            },
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                actions: [
                  TextButton(
                    onPressed: _isLoading
                        ? null
                        : () {
                            Navigator.pop(context);
                          },
                    child: Text(
                      'Cancel',
                      style: TextStyle(color: Colors.grey[600]),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _isLoading || _passwordStrength < 50
                        ? null
                        : () async {
                            if (_formKey.currentState!.validate()) {
                              setState(() {
                                _isLoading = true;
                              });

                              try {
                                final result =
                                    await _loginController.changePassword(
                                  oldPassword: _currentPasswordController.text,
                                  newPassword: _newPasswordController.text,
                                );

                                setState(() {
                                  _isLoading = false;
                                });

                                Navigator.pop(context);

                                if (result['status'] == 'success') {
                                  _showPasswordChangeSuccessDialog();
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Row(
                                        children: [
                                          Icon(Icons.error,
                                              color: Colors.white),
                                          SizedBox(width: 8),
                                          Flexible(
                                            child: Text(result['message'] ??
                                                'Failed to change password'),
                                          ),
                                        ],
                                      ),
                                      backgroundColor: Colors.red[600],
                                      behavior: SnackBarBehavior.floating,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                    ),
                                  );
                                }
                              } catch (e) {
                                setState(() {
                                  _isLoading = false;
                                });

                                Navigator.pop(context);

                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Row(
                                      children: [
                                        Icon(Icons.error, color: Colors.white),
                                        SizedBox(width: 8),
                                        Flexible(
                                          child: Text('An error occurred: $e'),
                                        ),
                                      ],
                                    ),
                                    backgroundColor: Colors.red[600],
                                    behavior: SnackBarBehavior.floating,
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                  ),
                                );
                              }
                            }
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _passwordStrength >= 50
                          ? Colors.teal[600]
                          : Colors.grey[400],
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding:
                          EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                    child: _isLoading
                        ? SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : Text('Change Password'),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

// Updated helper widget for requirement chips with better layout
  Widget _buildRequirementChip(String text, bool isValid) {
    return Container(
      width: double.infinity, // Take full width
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isValid ? Colors.green[50] : Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
        border: Border.all(
          color: isValid ? Colors.green[300]! : Colors.grey[300]!,
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.max,
        children: [
          Icon(
            isValid ? Icons.check_circle : Icons.radio_button_unchecked,
            size: 14,
            color: isValid ? Colors.green[600] : Colors.grey[500],
          ),
          SizedBox(width: 6),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 10,
                color: isValid ? Colors.green[700] : Colors.grey[600],
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

// ...existing code...
  // Add this new method for success dialog
  void _showPasswordChangeSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return WillPopScope(
          // Add this wrapper here too
          onWillPop: () async {
            // Prevent back button from closing the dialog
            return false;
          },
          child: AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            content: Container(
              padding: EdgeInsets.all(20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Success animation icon
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.green[100],
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.check_circle,
                      color: Colors.green[600],
                      size: 50,
                    ),
                  ),
                  SizedBox(height: 24),

                  // Success title
                  Text(
                    'Password Changed Successfully!',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[700],
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 16),

                  // Success message
                  Text(
                    'Your password has been changed successfully. For security reasons, you will be redirected to the login page to sign in with your new password.',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                      height: 1.4,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  SizedBox(height: 24),

                  // Countdown or direct redirect button
                  Container(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context); // Close success dialog
                        _redirectToLogin();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[600],
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.login, size: 20),
                          SizedBox(width: 8),
                          Text(
                            'Continue to Login',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
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
        );
      },
    );

    // Auto redirect after 5 seconds if user doesn't click
    Timer(Duration(seconds: 5), () {
      if (Navigator.canPop(context)) {
        Navigator.pop(context); // Close success dialog if still open
        _redirectToLogin();
      }
    });
  }

  // Add this method to handle redirect to login
  Future<void> _redirectToLogin() async {
    try {
      // Clear all user data from SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.clear();

      // Show a brief loading indicator
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => Center(
          child: Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.teal[600]!),
                ),
                SizedBox(height: 16),
                Text(
                  'Redirecting to login...',
                  style: TextStyle(
                    color: Colors.grey[700],
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ),
      );

      // Wait a moment for the loading indicator
      await Future.delayed(Duration(seconds: 1));

      // Navigate to login and remove all previous routes
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) => LoginView(),
        ),
        (route) => false,
      );

      // Show welcome back message on login page
      Future.delayed(Duration(milliseconds: 500), () {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Row(
                children: [
                  Icon(Icons.info, color: Colors.white),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Please sign in with your new password',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
              backgroundColor: Colors.blue[600],
              behavior: SnackBarBehavior.floating,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              duration: Duration(seconds: 3),
            ),
          );
        }
      });
    } catch (e) {
      print('Error during redirect to login: $e');
      // Fallback navigation
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => LoginView()),
        (route) => false,
      );
    }
  }

// Enhanced navigation item with subtle animation and better styling

// Enhanced expansion tile with subtle animations and better styling
}

// Navigation Item class
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

// Cow model class (if not defined elsewhere)
class Cow {
  final int id;
  final String? name;
  final String? breed;
  final String? gender;
  final String? birth;
  final double? weight;
  final String? lactationPhase;

  Cow({
    required this.id,
    this.name,
    this.breed,
    this.gender,
    this.birth,
    this.weight,
    this.lactationPhase,
  });

  factory Cow.fromJson(Map<String, dynamic> json) {
    return Cow(
      id: json['id'] ?? 0,
      name: json['name']?.toString(),
      breed: json['breed']?.toString(),
      gender: json['gender']?.toString(),
      birth: json['birth']?.toString(),
      weight: double.tryParse(json['weight']?.toString() ?? '0') ?? 0.0,
      lactationPhase: json['lactation_phase']?.toString(),
    );
  }
}

// User model class (if not defined elsewhere)
class User {
  final int id;
  final String? name;
  final String? username;
  final String? email;
  final String? role;

  User({
    required this.id,
    this.name,
    this.username,
    this.email,
    this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? 0,
      name: json['name']?.toString(),
      username: json['username']?.toString(),
      email: json['email']?.toString(),
      role: json['role']?.toString(),
    );
  }
}
