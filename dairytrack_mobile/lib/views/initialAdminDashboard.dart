import 'dart:async';
import 'dart:math';
import 'package:dairytrack_mobile/controller/APIURL1/loginController.dart';
import 'package:dairytrack_mobile/views/analythics/milkProductionAnalysisView.dart';
import 'package:dairytrack_mobile/views/analythics/milkQualityControlsView.dart';
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

// Sales & Financial
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productType/listProductType.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/finance/financeView.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/order/listOrder.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStock/listProductStock.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStockHistory/listProductStockHistory.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/salesTransaction/salesTrasactionView.dart';

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
// Tambahkan variabel untuk FAB
  bool _isFabExpanded = false;
  late AnimationController _fabAnimationController;
  late Animation<double> _fabExpandAnimation;
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
          label: 'Cattle', // Changed from 'Sapi'
          route: 'cows',
          widget: () => ListOfCowsView(),
        ),
        NavigationItem(
          icon: Icons.local_drink,
          label: 'Milking', // Changed from 'Pemerahan'
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
          label:
              'Milk Quality Analysis', // Changed from 'Analisis Kualitas Susu'
          route: 'milkQuality',
          widget: () => MilkQualityControlsView(),
        ),
        NavigationItem(
          icon: Icons.people,
          label: 'User',
          route: 'users',
          widget: () => ListOfUsersView(),
        ),
        NavigationItem(
          icon: Icons.analytics,
          label: 'Cattle Distribution',
          route: 'distribution',
          widget: () => CattleDistribution(),
        ),
        NavigationItem(
          icon: Icons.article,
          label: 'Blogs',
          route: 'blogs',
          widget: () => BlogView(),
        ),
        NavigationItem(
          icon: Icons.photo_library,
          label: 'Gallery',
          route: 'gallery',
          widget: () => GalleryView(),
        ),
        NavigationItem(
          icon: Icons.medical_services,
          label: 'health-checks', // Fixed capitalization
          route: 'health-checks',
          widget: () => HealthCheckListView(),
        ),
        NavigationItem(
          icon: Icons.visibility,
          label: 'Symptom',
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
          icon: Icons.category, // Represents product types or categories
          label: 'Product Type',
          route: '/productType', // Standardized route with leading slash
          widget: () => ListProductTypes(), // Keep as provided
        ),
        NavigationItem(
          icon: Icons.inventory_2, // Represents stock or inventory
          label: 'Product Stock',
          route: '/productStock',
          widget: () => ListProductStock(), // Assumed widget for stock
        ),
        NavigationItem(
          icon: Icons.history, // Represents historical data
          label: 'Product History',
          route: '/productHistory',
          widget: () => ProductStockHistoryView(), // Assumed widget for history
        ),
        NavigationItem(
          icon: Icons.point_of_sale, // Represents sales transactions
          label: 'Sales',
          route: '/order',
          widget: () => ListOrderView(), // Assumed widget for sales
        ),
        NavigationItem(
          icon: Icons.receipt_long, // Represents sales transactions
          label: 'Sales Transactions',
          route: '/salesTransactions',
          widget: () => SalesTransactionView(), // Assumed widget for sales
        ),
        NavigationItem(
          icon: Icons.account_balance, // Represents financial data
          label: 'Finance',
          route: '/finance',
          widget: () => FinanceView(),
        ),
        NavigationItem(
          icon: Icons.medical_services,
          label: 'health-checks', // Changed from 'Pemeriksaan Kesehatan'
          route: 'health-checks',
          widget: () => HealthCheckListView(),
        ),
        NavigationItem(
          icon: Icons.category, // Feed type = feed category
          label: 'Feed Type', // Changed from 'Jenis Pakan'
          route: 'feed-type',
          widget: () => FeedTypeView(),
        ),
        NavigationItem(
          icon: Icons
              .local_florist, // Changed: 'local_florist' better symbolizes nutrition with a natural, plant-based connotation.
          label: 'Nutrition Type', // Changed from 'Jenis Nutrisi'
          route: 'nutrition',
          widget: () => NutrisiView(),
        ),
        NavigationItem(
          icon: Icons.kitchen,
          label: 'Feed', // Changed from 'Pakan'
          route: 'feed',
          widget: () => FeedView(),
        ),
        NavigationItem(
          icon: Icons.inventory,
          label: 'Feed Stock', // Changed from 'Stock Pakan'
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
          icon: Icons.monitor_heart,
          label: 'Health Dashboard', // Changed from 'HealthDashboard'
          route: 'health-dashboard',
          widget: () => HealthDashboardView(),
        ),
        NavigationItem(
          icon: Icons.checklist,
          label: 'Daily Feed Item', // Changed from 'Feed Item Harian'
          route: 'feed-item',
          widget: () => DailyFeedItemsPage(),
        ),
       
      ];

  @override
  void initState() {
    super.initState();
    _fabAnimationController = AnimationController(
      duration: Duration(milliseconds: 300),
      vsync: this,
    );
    _fabExpandAnimation = CurvedAnimation(
      parent: _fabAnimationController,
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

  Widget _buildFloatingActionButtons() {
    // Kelompokkan menu sesuai kebutuhan admin
    final cattleManagement = [navigationItems[1], navigationItems[6]];
    final milkingAnalysis = [
      navigationItems[2],
      navigationItems[3],
      navigationItems[4]
    ];
    final userManagement = [navigationItems[5]];
    final contentManagement = [navigationItems[7], navigationItems[8]];
    final cattleHealth = [
      navigationItems[9],
      navigationItems[10],
      navigationItems[11],
      navigationItems[12],
      navigationItems[23]
    ];
    final feedManagement = [
      navigationItems[19],
      navigationItems[20],
      navigationItems[21],
      navigationItems[22],
      navigationItems[23],
      navigationItems[25]
    ];
    final productsSales = [
      navigationItems[13],
      navigationItems[14],
      navigationItems[15],
      navigationItems[16],
      navigationItems[17],
      navigationItems[18]
    ];

    return Positioned(
      bottom: 20,
      right: 16,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (_isFabExpanded) ...[
            _buildFabGroup('Products & Sales', Icons.storefront,
                Colors.deepPurple, productsSales),
            _buildFabGroup(
                'Feed Management', Icons.grass, Colors.green, feedManagement),
            _buildFabGroup('Health Check Management', Icons.medical_services, Colors.red,
                cattleHealth),
            _buildFabGroup('Content Management', Icons.library_books,
                Colors.amber, contentManagement),
            _buildFabGroup(
                'User Management', Icons.people, Colors.blue, userManagement),
            _buildFabGroup('Milking & Analysis', Icons.local_drink,
                Colors.blueGrey, milkingAnalysis),
            _buildFabGroup('Cattle Management', Icons.pets, Colors.brown,
                cattleManagement),
            // Change Password
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
                            fontWeight: FontWeight.w500),
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
              child: Icon(_isFabExpanded ? Icons.close : Icons.menu, size: 28),
            ),
          ),
        ],
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
                        color: Colors.blueGrey[50],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        Icons.lock_outline,
                        color: Colors.blueGrey[600],
                        size: 20,
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Change Password',
                        style: TextStyle(
                          color: Colors.blueGrey[800],
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
                                  Icon(Icons.lock, color: Colors.blueGrey[600]),
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
                                    BorderSide(color: Colors.blueGrey[600]!),
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
                                  color: Colors.blueGrey[600]),
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
                                    BorderSide(color: Colors.blueGrey[600]!),
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
                                  color: Colors.blueGrey[600]),
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
                                    BorderSide(color: Colors.blueGrey[600]!),
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
                          ? Colors.blueGrey[600]
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
                  valueColor:
                      AlwaysStoppedAnimation<Color>(Colors.blueGrey[600]!),
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

  Widget _buildFabGroup(
      String title, IconData icon, Color color, List<NavigationItem> items) {
    return ScaleTransition(
      scale: _fabExpandAnimation,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                title,
                style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500),
              ),
            ),
            const SizedBox(width: 8),
            FloatingActionButton(
              heroTag: title,
              backgroundColor: color,
              foregroundColor: Colors.white,
              elevation: 6,
              mini: true,
              onPressed: () {
                _toggleFab();
                _showMenuDialog(title, items);
              },
              child: Icon(icon, size: 20),
            ),
          ],
        ),
      ),
    );
  }

  void _showMenuDialog(String title, List<NavigationItem> items) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: Colors.blueGrey[50],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.blueGrey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(Icons.menu, color: Colors.blueGrey[600], size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: Colors.blueGrey[800],
                      fontSize: 18),
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
                    border: Border.all(color: Colors.blueGrey[200]!),
                  ),
                  child: ListTile(
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.blueGrey[50],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(item.icon,
                          color: Colors.blueGrey[600], size: 20),
                    ),
                    title: Text(
                      item.label,
                      style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Colors.blueGrey[800]),
                    ),
                    trailing: Icon(Icons.arrow_forward_ios,
                        size: 16, color: Colors.blueGrey[400]),
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
              child:
                  Text('Close', style: TextStyle(color: Colors.blueGrey[600])),
            ),
          ],
        );
      },
    );
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
                    'Latest Notifications',
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
                    'See All',
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
                              color: Colors.blueGrey, size: 24),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              notification['title'] ?? 'Notifikasi',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.blueGrey[800],
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
                            backgroundColor: Colors.blueGrey,
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
                          'Welcome, ${currentUser!['name']}!',
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
                    'Admin Dashboard - Manage all aspects of the farm with full control',
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
                          'System Statistics',
                          style: TextStyle(
                            fontSize: 16, // Konsisten dengan judul lain
                            fontWeight: FontWeight.w700,
                            color: Colors.blueGrey[800],
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Overview of livestock data',
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
                      title: 'Total Cow',
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
              'Composition of lactation phase of cows on farms',
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
                        'Total Cow',
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
                'Detailed Statistics',
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
                    'Daily Activity Chart',
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
              'Todays livestock data visualization',
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
        'color': Colors.blueGrey[600]!,
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
                'Data Information',
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
                label: 'Milk Production',
                value:
                    '${dashboardStats['totalMilkToday'].toStringAsFixed(1)}L',
              ),
              SizedBox(width: 12),
              _buildCompactLegendItem(
                color: Colors.blueGrey[600]!,
                label: 'Blog Articles',
                value: '${dashboardStats['totalBlogs']}',
              ),
            ],
          ),
          SizedBox(height: 6),
          Row(
            children: [
              _buildCompactLegendItem(
                color: Colors.amber[700]!,
                label: 'Gallery Photos',
                value: '${dashboardStats['totalGalleries']}',
              ),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Click the graphic for details',
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
        'color': Colors.blueGrey[600]!,
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
                color: Colors.blueGrey[600]!,
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
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.only(
          topRight: Radius.circular(12),
          bottomRight: Radius.circular(12),
        ),
      ),
      child: Column(
        children: [
          // Enhanced professional header
          Container(
            width: double.infinity,
            height: 110, // Slightly taller for better proportion
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.blueGrey[800]!, Colors.blueGrey[700]!],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.blueGrey[900]!.withOpacity(0.2),
                  blurRadius: 4,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: SafeArea(
              child: Padding(
                padding: EdgeInsets.all(14),
                child: Row(
                  children: [
                    // Enhanced avatar with subtle glow
                    Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.white.withOpacity(0.15),
                            blurRadius: 12,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: CircleAvatar(
                        radius: 24,
                        backgroundColor: Colors.white.withOpacity(0.18),
                        child: Icon(
                          Icons.admin_panel_settings,
                          color: Colors.white,
                          size: 26,
                        ),
                      ),
                    ),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            currentUser?['name'] ?? 'Administrator',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.3,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 4),
                          Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Administrator',
                              style: TextStyle(
                                color: Colors.white.withOpacity(0.9),
                                fontSize: 11,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Main menu with enhanced styling
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: Colors.grey[50],
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.03),
                    blurRadius: 6,
                    spreadRadius: 1,
                  ),
                ],
              ),
              child: ListView(
                padding: EdgeInsets.symmetric(vertical: 12, horizontal: 4),
                children: [
                  // Dashboard item with subtle highlight
                  _buildNavItem(
                    title: 'Dashboard',
                    icon: Icons.dashboard,
                    index: 0,
                    color: Colors.blueGrey[700]!,
                  ),

                  // Enhanced divider
                  Padding(
                    padding: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                    child: Container(
                      height: 1.2,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.blueGrey[200]!.withOpacity(0.1),
                            Colors.blueGrey[300]!.withOpacity(0.8),
                            Colors.blueGrey[200]!.withOpacity(0.1),
                          ],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        ),
                      ),
                    ),
                  ),

                  // Enhanced navigation groups with consistent styling
                  _buildNavGroup(
                    title: 'Cattle Management',
                    icon: Icons.pets,
                    color: Colors.blueGrey[700]!,
                    items: [
                      {'index': 1, 'item': navigationItems[1]},
                      {'index': 6, 'item': navigationItems[6]},
                    ],
                  ),

                  _buildNavGroup(
                    title: 'Milking & Analysis',
                    icon: Icons.local_drink,
                    color: Colors.blueGrey[700]!,
                    items: [
                      {'index': 2, 'item': navigationItems[2]},
                      {'index': 3, 'item': navigationItems[3]},
                      {'index': 4, 'item': navigationItems[4]},
                    ],
                  ),

                  _buildNavGroup(
                    title: 'User Management',
                    icon: Icons.people,
                    color: Colors.blueGrey[700]!,
                    items: [
                      {'index': 5, 'item': navigationItems[5]},
                    ],
                  ),

                  _buildNavGroup(
                    title: 'Content Management',
                    icon: Icons.library_books,
                    color: Colors.blueGrey[700]!,
                    items: [
                      {'index': 7, 'item': navigationItems[7]},
                      {'index': 8, 'item': navigationItems[8]},
                    ],
                  ),

                  _buildNavGroup(
                    title: 'Cattle Health',
                    icon: Icons.medical_services,
                    color: Colors.blueGrey[700]!,
                    items: [
                      {'index': 9, 'item': navigationItems[9]},
                      {'index': 10, 'item': navigationItems[10]},
                      {'index': 11, 'item': navigationItems[11]},
                      {'index': 12, 'item': navigationItems[12]},
                      {'index': 24, 'item': navigationItems[24]},
                    ],
                  ),

                  _buildNavGroup(
                    title: 'Feed Management',
                    icon: Icons.grass,
                    color: Colors.blueGrey[700]!,
                    items: [
                      {'index': 19, 'item': navigationItems[19]},
                      {'index': 20, 'item': navigationItems[20]},
                      {'index': 21, 'item': navigationItems[21]},
                      {'index': 22, 'item': navigationItems[22]},
                      {'index': 23, 'item': navigationItems[23]},
                      {'index': 25, 'item': navigationItems[25]},
                    ],
                  ),

                  _buildNavGroup(
                    title: 'Products & Sales',
                    icon: Icons.storefront,
                    color: Colors.blueGrey[700]!,
                    items: [
                      {'index': 13, 'item': navigationItems[13]},
                      {'index': 14, 'item': navigationItems[14]},
                      {'index': 15, 'item': navigationItems[15]},
                      {'index': 16, 'item': navigationItems[16]},
                      {'index': 17, 'item': navigationItems[17]},
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // Enhanced navigation item with subtle animation and better styling
  Widget _buildNavItem({
    required String title,
    required IconData icon,
    required int index,
    required Color color,
  }) {
    final isSelected = _selectedIndex == index;

    return AnimatedContainer(
      duration: Duration(milliseconds: 200),
      margin: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isSelected ? color.withOpacity(0.08) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        border: isSelected
            ? Border.all(
                color: color.withOpacity(0.3),
                width: 1,
              )
            : null,
      ),
      child: ListTile(
        dense: true,
        visualDensity: VisualDensity(horizontal: 0, vertical: -1),
        leading: Container(
          padding: EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: isSelected ? color.withOpacity(0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
          ),
          child: Icon(
            icon,
            color: isSelected ? color : Colors.grey[600],
            size: 18,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: isSelected ? color : Colors.grey[800],
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            fontSize: 13,
            letterSpacing: 0.2,
          ),
        ),
        selected: isSelected,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        onTap: () {
          setState(() {
            _selectedIndex = index;
          });
          Navigator.pop(context);
          _navigateToView(navigationItems[index]);
        },
      ),
    );
  }

  // Enhanced expansion tile with subtle animations and better styling
  Widget _buildNavGroup({
    required String title,
    required IconData icon,
    required Color color,
    required List<Map<String, dynamic>> items,
  }) {
    return Theme(
      data: Theme.of(context).copyWith(
        dividerColor: Colors.transparent,
      ),
      child: Container(
        margin: EdgeInsets.only(bottom: 4),
        decoration: BoxDecoration(
          border: Border(
            left: BorderSide(
              color: color.withOpacity(0.2),
              width: 3,
            ),
          ),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: ExpansionTile(
            leading: Container(
              padding: EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: color.withOpacity(0.08),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(
                icon,
                color: color,
                size: 18,
              ),
            ),
            title: Text(
              title,
              style: TextStyle(
                color: Colors.grey[800],
                fontWeight: FontWeight.w600,
                fontSize: 13,
                letterSpacing: 0.2,
              ),
            ),
            childrenPadding: EdgeInsets.only(left: 16),
            iconColor: color,
            collapsedIconColor: color,
            backgroundColor: Colors.grey[100],
            collapsedBackgroundColor: Colors.transparent,
            initiallyExpanded: false,
            tilePadding: EdgeInsets.symmetric(horizontal: 16, vertical: 0),
            children: items.map((itemData) {
              final index = itemData['index'] as int;
              final item = itemData['item'] as NavigationItem;
              final isSelected = _selectedIndex == index;

              return AnimatedContainer(
                duration: Duration(milliseconds: 150),
                decoration: BoxDecoration(
                  color:
                      isSelected ? color.withOpacity(0.08) : Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                ),
                margin: EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                child: ListTile(
                  dense: true,
                  visualDensity: VisualDensity(horizontal: 0, vertical: -2),
                  leading: Icon(
                    item.icon,
                    color: isSelected ? color : Colors.grey[600],
                    size: 16,
                  ),
                  title: Text(
                    item.label,
                    style: TextStyle(
                      fontSize: 12,
                      color: isSelected ? color : Colors.grey[800],
                      fontWeight:
                          isSelected ? FontWeight.w500 : FontWeight.normal,
                    ),
                  ),
                  selected: isSelected,
                  selectedTileColor: color.withOpacity(0.1),
                  onTap: () {
                    setState(() {
                      _selectedIndex = index;
                    });
                    Navigator.pop(context);
                    _navigateToView(item);
                  },
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
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

// ...existing code...
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
          colors: [Color(0xFFe0eafc), Color(0xFFcfdef3)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        key: _scaffoldKey,
        backgroundColor: Colors.transparent,
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
          actions: [
            _buildNotificationButton(),
            SizedBox(width: 8),
          ],
        ),
        body: Stack(
          children: [
            RefreshIndicator(
              color: Colors.blueGrey[800],
              onRefresh: _initializeDashboard,
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.only(bottom: 80),
                child: Column(
                  children: [
                    _buildWelcomeCard(),
                    _buildNotificationPreview(),
                    _buildQuickStats(),
                    _buildStatsOverview(),
                    _buildLactationChart(),
                    SizedBox(height: 80),
                  ],
                ),
              ),
            ),
            _buildFloatingActionButtons(),
          ],
        ),
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
}
// ...existing code...

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
