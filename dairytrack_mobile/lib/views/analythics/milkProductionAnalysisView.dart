import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../controller/APIURL1/milkingSessionController.dart';
import '../../controller/APIURL1/cowManagementController.dart';
import '../../controller/APIURL1/cattleDistributionController.dart';
import '../../controller/APIURL1/usersManagementController.dart';
import '../../controller/APIURL1/loginController.dart';

class MilkProductionAnalysisView extends StatefulWidget {
  @override
  _MilkProductionAnalysisViewState createState() =>
      _MilkProductionAnalysisViewState();
}

class _MilkProductionAnalysisViewState extends State<MilkProductionAnalysisView>
    with TickerProviderStateMixin {
  // Controllers
  final MilkingSessionController _milkingController =
      MilkingSessionController();
  final CowManagementController _cowController = CowManagementController();
  final CattleDistributionController _cattleController =
      CattleDistributionController();
  final UsersManagementController _userController = UsersManagementController();
  final LoginController _loginController = LoginController();

  // Animation Controllers
  late AnimationController _fadeAnimationController;
  late AnimationController _slideAnimationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  // State variables
  bool _isLoading = true;
  List<Map<String, dynamic>> _cows = [];
  Map<String, dynamic>? _selectedCow;
  List<Map<String, dynamic>> _milkingSessions = [];
  List<Map<String, dynamic>> _dailySummaries = [];
  Map<String, dynamic>? _currentUser;
  Map<String, dynamic>? _cowPerformance;

  // Date range
  DateTime _startDate = DateTime.now().subtract(Duration(days: 30));
  DateTime _endDate = DateTime.now();

  // Colors
  static const Color primaryColor = Color(0xFF3D90D7);
  static const Color successColor = Color(0xFF28a745);
  static const Color warningColor = Color(0xFFffc107);
  static const Color dangerColor = Color(0xFFdc3545);
  static const Color infoColor = Color(0xFF17a2b8);

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    _initializeData();
  }

  void _initializeAnimations() {
    _fadeAnimationController = AnimationController(
      duration: Duration(milliseconds: 800),
      vsync: this,
    );

    _slideAnimationController = AnimationController(
      duration: Duration(milliseconds: 600),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeAnimationController,
      curve: Curves.easeInOut,
    ));

    _slideAnimation = Tween<Offset>(
      begin: Offset(0, 0.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideAnimationController,
      curve: Curves.easeOutCubic,
    ));

    _fadeAnimationController.forward();
    _slideAnimationController.forward();
  }

  Future<void> _initializeData() async {
    try {
      setState(() => _isLoading = true);

      // Get current user from stored auth token
      _currentUser = await _getCurrentUser();
      if (_currentUser == null) {
        _showErrorDialog('Authentication Error', 'Please log in to continue.');
        return;
      }

      // Load cows based on user role
      await _loadCows();

      // Load milking sessions
      await _loadMilkingSessions();
    } catch (e) {
      _showErrorDialog('Error', 'Failed to load data: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  // Helper method to safely convert dynamic data to Map<String, dynamic>
  Map<String, dynamic> _safeMapConvert(dynamic data) {
    if (data == null) return {};
    if (data is Map<String, dynamic>) return data;
    if (data is Map) {
      return Map<String, dynamic>.from(data);
    }
    return {};
  }

  // Helper method to safely convert dynamic data to List<Map<String, dynamic>>
  List<Map<String, dynamic>> _safeListConvert(dynamic data) {
    if (data == null) return [];
    if (data is List<Map<String, dynamic>>) return data;
    if (data is List) {
      return data.map((item) => _safeMapConvert(item)).toList();
    }
    return [];
  }

  Future<Map<String, dynamic>?> _getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Retrieve and safely cast values from SharedPreferences
      final userId = prefs.getInt('userId');
      final userName = prefs.getString('userName');
      final userUsername = prefs.getString('userUsername');
      final userEmail = prefs.getString('userEmail');
      final userRole = prefs.getString('userRole');
      final userToken = prefs
          .getString('authToken'); // Use 'authToken' as in the original code

      // Ensure required fields are not null
      if (userId != null && userName != null) {
        return {
          'user_id': userId,
          'id': userId,
          'name': userName,
          'username': userUsername ?? '',
          'email': userEmail ?? '',
          'role': userRole ?? 'Farmer',
          'token': userToken ?? '',
        };
      } else {
        return null;
      }
    } catch (e) {
      print('Error getting current user: $e');
      return null;
    }
  }

  Future<void> _loadCows() async {
    try {
      List<Map<String, dynamic>> cowsData = [];

      if (_currentUser!['role'] == "Farmer") {
        // Farmer - get only managed cows
        final result =
            await _cattleController.listCowsByUser(_currentUser!['user_id']);
        print('Farmer cows result: $result'); // Debug

        if (result['success'] == true) {
          final cows = result['cows'];
          if (cows != null) {
            cowsData = _safeListConvert(cows);
          }
        }
      } else {
        // Admin/Supervisor - get all cows with farmers and avoid duplicates
        final usersResult = await _cattleController.getUsersWithCows();
        print('Users with cows result: $usersResult'); // Debug

        if (usersResult['success'] == true) {
          final usersWithCows = usersResult['usersWithCows'];
          if (usersWithCows != null) {
            final usersList = _safeListConvert(usersWithCows);

            // Use Map to track unique cows by ID to avoid duplicates
            Map<dynamic, Map<String, dynamic>> uniqueCowsMap = {};

            for (final farmer in usersList) {
              final farmerData = _safeMapConvert(farmer);
              final cows = farmerData['cows'];

              if (cows != null) {
                final cowsList = _safeListConvert(cows);
                for (final cow in cowsList) {
                  final cowData = _safeMapConvert(cow);
                  final cowId = cowData['id'];

                  // Only add if this cow ID hasn't been seen before
                  if (cowId != null && !uniqueCowsMap.containsKey(cowId)) {
                    uniqueCowsMap[cowId] = {
                      ...cowData,
                      'farmerName': farmerData['name'] ??
                          farmerData['username'] ??
                          'Unknown',
                      'farmerId': farmerData['id'],
                    };
                  }
                }
              }
            }

            // Convert map values back to list
            cowsData = uniqueCowsMap.values.toList();
          }
        }
      }

      setState(() {
        _cows = cowsData;
      });

      print('Loaded ${cowsData.length} unique cows'); // Debug
    } catch (e) {
      print('Error loading cows: $e');
      _showErrorDialog('Error', 'Failed to load cows: $e');
    }
  }

  Future<void> _loadMilkingSessions() async {
    try {
      final result = await _milkingController.getMilkingSessions();
      print('Milking sessions result: $result'); // Debug

      final sessions = _safeListConvert(result);

      setState(() {
        _milkingSessions = sessions;
      });

      print('Loaded ${sessions.length} milking sessions'); // Debug
    } catch (e) {
      print('Error loading milking sessions: $e');
      _showErrorDialog('Error', 'Failed to load milking sessions: $e');
    }
  }

  Future<void> _loadDailySummaries() async {
    if (_selectedCow == null) return;

    try {
      _calculateDailySummaries();
    } catch (e) {
      print('Error loading daily summaries: $e');
    }
  }

  void _calculateDailySummaries() {
    if (_selectedCow == null) return;

    try {
      final selectedCowData = _safeMapConvert(_selectedCow);
      final cowId = selectedCowData['id'];

      final cowSessions = _milkingSessions.where((session) {
        final sessionData = _safeMapConvert(session);
        return sessionData['cow_id'] == cowId;
      }).toList();

      final dailyData = <String, Map<String, dynamic>>{};

      for (final session in cowSessions) {
        final sessionData = _safeMapConvert(session);
        final milkingTimeStr = sessionData['milking_time']?.toString();

        if (milkingTimeStr != null) {
          try {
            final sessionDate = DateTime.parse(milkingTimeStr);

            if (sessionDate.isAfter(_startDate.subtract(Duration(days: 1))) &&
                sessionDate.isBefore(_endDate.add(Duration(days: 1)))) {
              final dateKey = DateFormat('yyyy-MM-dd').format(sessionDate);

              if (!dailyData.containsKey(dateKey)) {
                dailyData[dateKey] = {
                  'date': dateKey,
                  'volume': 0.0,
                  'sessions': 0,
                };
              }

              final volume =
                  double.tryParse(sessionData['volume']?.toString() ?? '0') ??
                      0.0;
              dailyData[dateKey]!['volume'] =
                  (dailyData[dateKey]!['volume'] as double) + volume;
              dailyData[dateKey]!['sessions'] =
                  (dailyData[dateKey]!['sessions'] as int) + 1;
            }
          } catch (e) {
            print('Error parsing date: $milkingTimeStr - $e');
          }
        }
      }

      final summaries = dailyData.values.toList();
      summaries
          .sort((a, b) => (a['date'] as String).compareTo(b['date'] as String));

      setState(() {
        _dailySummaries = summaries;
      });
    } catch (e) {
      print('Error calculating daily summaries: $e');
    }
  }

  void _calculateCowPerformance() {
    if (_selectedCow == null) {
      setState(() => _cowPerformance = null);
      return;
    }

    try {
      final selectedCowData = _safeMapConvert(_selectedCow);
      final cowId = selectedCowData['id'];

      final cowSessions = _milkingSessions.where((session) {
        final sessionData = _safeMapConvert(session);
        return sessionData['cow_id'] == cowId;
      }).toList();

      final bool isMale =
          selectedCowData['gender']?.toString().toLowerCase() == 'male';

      if (isMale) {
        setState(() {
          _cowPerformance = {
            'isMale': true,
            'totalSessions': 0,
            'totalVolume': '0.0',
            'avgPerSession': '0.0',
            'rangeVolume': '0.0',
            'rangeSessions': 0,
            'highestProduction': '0.0',
            'lowestProduction': '0.0',
            'lastMilking': 'Sapi pejantan tidak diperah',
            'breedingInfo': {
              'status': 'Aktif untuk pembiakan',
              'age': _formatAge(selectedCowData['birth']?.toString()),
              'maturityStatus': _getMaturityStatus(),
            },
          };
        });
        return;
      }

      double totalVolume = 0.0;
      for (final session in cowSessions) {
        final sessionData = _safeMapConvert(session);
        totalVolume +=
            double.tryParse(sessionData['volume']?.toString() ?? '0') ?? 0.0;
      }

      final avgPerSession =
          cowSessions.isNotEmpty ? totalVolume / cowSessions.length : 0.0;

      final rangeSessions = cowSessions.where((session) {
        final sessionData = _safeMapConvert(session);
        final milkingTimeStr = sessionData['milking_time']?.toString();

        if (milkingTimeStr != null) {
          try {
            final sessionDate = DateTime.parse(milkingTimeStr);
            return sessionDate
                    .isAfter(_startDate.subtract(Duration(days: 1))) &&
                sessionDate.isBefore(_endDate.add(Duration(days: 1)));
          } catch (e) {
            return false;
          }
        }
        return false;
      }).toList();

      double rangeVolume = 0.0;
      List<double> rangeVolumes = [];

      for (final session in rangeSessions) {
        final sessionData = _safeMapConvert(session);
        final volume =
            double.tryParse(sessionData['volume']?.toString() ?? '0') ?? 0.0;
        rangeVolume += volume;
        rangeVolumes.add(volume);
      }

      final highestProduction = rangeVolumes.isNotEmpty
          ? rangeVolumes.reduce((a, b) => a > b ? a : b)
          : 0.0;
      final lowestProduction = rangeVolumes.isNotEmpty
          ? rangeVolumes.reduce((a, b) => a < b ? a : b)
          : 0.0;

      String lastMilking = 'No data';
      if (cowSessions.isNotEmpty) {
        try {
          Map<String, dynamic>? lastSession;
          DateTime? latestDate;

          for (final session in cowSessions) {
            final sessionData = _safeMapConvert(session);
            final milkingTimeStr = sessionData['milking_time']?.toString();

            if (milkingTimeStr != null) {
              try {
                final sessionDate = DateTime.parse(milkingTimeStr);
                if (latestDate == null || sessionDate.isAfter(latestDate)) {
                  latestDate = sessionDate;
                  lastSession = sessionData;
                }
              } catch (e) {
                // Skip invalid dates
              }
            }
          }

          if (lastSession != null && latestDate != null) {
            lastMilking = DateFormat('dd/MM/yyyy HH:mm').format(latestDate);
          }
        } catch (e) {
          print('Error calculating last milking: $e');
        }
      }

      setState(() {
        _cowPerformance = {
          'isMale': false,
          'totalSessions': cowSessions.length,
          'totalVolume': totalVolume.toStringAsFixed(1),
          'avgPerSession': avgPerSession.toStringAsFixed(1),
          'rangeVolume': rangeVolume.toStringAsFixed(1),
          'rangeSessions': rangeSessions.length,
          'highestProduction': highestProduction.toStringAsFixed(1),
          'lowestProduction': lowestProduction.toStringAsFixed(1),
          'lastMilking': lastMilking,
        };
      });
    } catch (e) {
      print('Error calculating cow performance: $e');
    }
  }

  String _formatAge(String? birthDate) {
    if (birthDate == null) return 'N/A';

    try {
      // Use DateFormat to parse the specific date format
      final birth = DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
          .parse(birthDate, true)
          .toLocal();
      final now = DateTime.now();

      int years = now.year - birth.year;
      int months = now.month - birth.month;

      if (months < 0) {
        years--;
        months += 12;
      }

      if (years == 0) {
        return '$months bulan';
      } else if (months == 0) {
        return '$years tahun';
      } else {
        return '${years}th ${months}bl';
      }
    } catch (e) {
      print('Error parsing birth date: $e');
      return 'N/A';
    }
  }

  String _getMaturityStatus() {
    if (_selectedCow == null) return 'N/A';

    final selectedCowData = _safeMapConvert(_selectedCow);
    final birthStr = selectedCowData['birth']?.toString();

    if (birthStr == null) return 'N/A';

    try {
      // Use DateFormat to parse the specific date format
      final birth = DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
          .parse(birthStr, true)
          .toLocal();
      final now = DateTime.now();
      final totalMonths =
          (now.year - birth.year) * 12 + (now.month - birth.month);

      return totalMonths >= 18
          ? 'Dewasa - siap kawin'
          : 'Muda - belum siap kawin';
    } catch (e) {
      print('Error parsing birth date: $e');
      return 'N/A';
    }
  }

  String _getLactationPhase(Map<String, dynamic> cow) {
    try {
      final cowData = _safeMapConvert(cow);
      final gender = cowData['gender']?.toString().toLowerCase();

      if (gender == 'male') return 'Bull';

      final birthStr = cowData['birth']?.toString();
      if (birthStr == null) return 'Unknown';

      // Parse the date string using DateFormat
      final birth = DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
          .parse(birthStr, true)
          .toLocal();
      final now = DateTime.now();
      final totalMonths =
          (now.year - birth.year) * 12 + (now.month - birth.month);

      if (totalMonths < 15) return 'Calf';
      if (totalMonths < 24) return 'Heifer';

      // For mature cows, check milking data
      final cowId = cowData['id'];
      final cowSessions = _milkingSessions.where((session) {
        final sessionData = _safeMapConvert(session);
        return sessionData['cow_id'] == cowId;
      }).toList();

      if (cowSessions.isEmpty) return 'Dry';

      final recentSessions = cowSessions.where((session) {
        final sessionData = _safeMapConvert(session);
        final milkingTimeStr = sessionData['milking_time']?.toString();

        if (milkingTimeStr != null) {
          try {
            final sessionDate = DateTime.parse(milkingTimeStr);
            final daysAgo = DateTime.now().difference(sessionDate).inDays;
            return daysAgo <= 30;
          } catch (e) {
            return false;
          }
        }
        return false;
      }).toList();

      if (recentSessions.isEmpty) return 'Dry';

      double totalVolume = 0.0;
      for (final session in recentSessions) {
        final sessionData = _safeMapConvert(session);
        totalVolume +=
            double.tryParse(sessionData['volume']?.toString() ?? '0') ?? 0.0;
      }

      final avgVolume = totalVolume / recentSessions.length;

      if (avgVolume >= 15) return 'Early';
      if (avgVolume >= 8) return 'Mid';
      if (avgVolume >= 3) return 'Late';
      return 'Dry';
    } catch (e) {
      print('Error getting lactation phase: $e');
      return 'Unknown';
    }
  }

  Color _getLactationColor(String phase) {
    switch (phase) {
      case 'Bull':
        return infoColor;
      case 'Calf':
        return Colors.grey[400]!;
      case 'Heifer':
        return Colors.grey[600]!;
      case 'Dry':
        return warningColor;
      case 'Early':
        return successColor;
      case 'Mid':
        return primaryColor;
      case 'Late':
        return dangerColor;
      default:
        return Colors.grey[800]!;
    }
  }

  String _getLactationDescription(String phase) {
    switch (phase) {
      case 'Bull':
        return 'Sapi Pejantan - untuk pembiakan';
      case 'Calf':
        return 'Pedet - masih menyusu';
      case 'Heifer':
        return 'Dara - belum pernah beranak';
      case 'Dry':
        return 'Kering - tidak sedang laktasi';
      case 'Early':
        return 'Awal Laktasi - produksi tinggi';
      case 'Mid':
        return 'Mid Laktasi - produksi stabil';
      case 'Late':
        return 'Akhir Laktasi - produksi menurun';
      default:
        return 'Status tidak diketahui';
    }
  }

  void _selectCow(Map<String, dynamic> cow) {
    setState(() {
      _selectedCow = _safeMapConvert(cow);
    });
    _calculateCowPerformance();
    _loadDailySummaries();
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now().subtract(Duration(days: 365)),
      lastDate: DateTime.now(),
      initialDateRange: DateTimeRange(start: _startDate, end: _endDate),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
                  primary: primaryColor,
                ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
      });
      _calculateCowPerformance();
      _loadDailySummaries();
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text('OK'),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _fadeAnimationController.dispose();
    _slideAnimationController.dispose();
    super.dispose();
  }

  // ... Rest of the build methods remain the same but with type-safe data access ...

  @override
  Widget build(BuildContext context) {
    if (_currentUser == null) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Authentication Error'),
          backgroundColor: dangerColor,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: primaryColor),
              SizedBox(height: 16),
              Text(
                'Please Wait ...',
                style: TextStyle(fontSize: 18),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    if (_isLoading) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Loading...'),
          backgroundColor: primaryColor,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: primaryColor),
              SizedBox(height: 16),
              Text('Loading cows data...'),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          'Analysis Milk Production',
          style: TextStyle(
            fontWeight: FontWeight.w500,
            letterSpacing: 0.5,
            fontSize: 19,
            color: Colors.white,
          ),
        ),
        backgroundColor: _currentUser!['role'] == "Farmer"
            ? Colors.teal[400]
            : _currentUser!['role'] == "Supervisor"
                ? Colors.deepOrange[400]
                : Colors.blueGrey[800],
        elevation: 0,
        actions: [
          if (_selectedCow != null && !(_cowPerformance?['isMale'] ?? false))
            IconButton(
              icon: Icon(Icons.date_range),
              onPressed: _selectDateRange,
              tooltip: 'Pilih Rentang Tanggal',
            ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SlideTransition(
          position: _slideAnimation,
          child: SingleChildScrollView(
            padding: EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(),
                SizedBox(height: 16),
                if (_selectedCow != null) ...[
                  _buildSelectedCowInfo(),
                  SizedBox(height: 16),
                ],
                if (_selectedCow != null && _cowPerformance != null) ...[
                  _buildPerformanceStats(),
                  SizedBox(height: 16),
                ],
                if (_selectedCow != null &&
                    _cowPerformance != null &&
                    !(_cowPerformance!['isMale'] ?? false)) ...[
                  _buildProductionChart(),
                  SizedBox(height: 16),
                ],
                if (_selectedCow != null &&
                    _cowPerformance != null &&
                    (_cowPerformance!['isMale'] ?? false)) ...[
                  _buildBreedingInfo(),
                  SizedBox(height: 16),
                ],
                _buildCowsGrid(),
                if (_selectedCow == null && _cows.isNotEmpty) ...[
                  SizedBox(height: 16),
                  _buildInstructions(),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  // Continue dengan method build yang sama seperti sebelumnya...
  // Pastikan semua method build menggunakan _safeMapConvert untuk data access

  Widget _buildCowsGrid() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.pets, color: primaryColor, size: 24),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  _currentUser!['role'] == "Farmer"
                      ? 'The Cows You Manage'
                      : 'All Cows on the Farm',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    color: primaryColor,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'Click on the cow card to see detailed analysis',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 16),
          if (_cows.isEmpty)
            Container(
              height: 200,
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.pets, size: 48, color: Colors.grey[400]),
                    SizedBox(height: 16),
                    Text(
                      _currentUser!['role'] == "Farmer"
                          ? 'There are no cows assigned to you yet'
                          : 'There is no data on cattle yet',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          else
            GridView.builder(
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.8,
              ),
              itemCount: _cows.length,
              itemBuilder: (context, index) {
                final cowData = _safeMapConvert(_cows[index]);
                final lactationPhase = _getLactationPhase(cowData);
                final isSelected = _selectedCow != null &&
                    _safeMapConvert(_selectedCow)['id'] == cowData['id'];
                final isMale =
                    cowData['gender']?.toString().toLowerCase() == 'male';

                return GestureDetector(
                  onTap: () => _selectCow(cowData),
                  child: AnimatedContainer(
                    duration: Duration(milliseconds: 200),
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? primaryColor.withOpacity(0.1)
                          : Colors.white,
                      borderRadius: BorderRadius.circular(15),
                      border: Border.all(
                        color: isSelected ? primaryColor : Colors.grey[200]!,
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black
                              .withOpacity(isSelected ? 0.15 : 0.05),
                          blurRadius: isSelected ? 10 : 5,
                          offset: Offset(0, isSelected ? 4 : 2),
                        ),
                      ],
                    ),
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      cowData['name']?.toString() ?? 'N/A',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.grey[800],
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'ID: ${cowData['id']?.toString() ?? 'N/A'}',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                isMale ? '🐂' : '🐄',
                                style: TextStyle(fontSize: 24),
                              ),
                            ],
                          ),
                          SizedBox(height: 8),
                          Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: _getLactationColor(lactationPhase),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              lactationPhase,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          SizedBox(height: 4),
                          Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey[400]!),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              cowData['breed']?.toString() ?? 'N/A',
                              style: TextStyle(
                                color: Colors.grey[600],
                                fontSize: 10,
                              ),
                            ),
                          ),
                          SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.cake,
                                  size: 12, color: Colors.grey[600]),
                              SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  _formatAge(cowData['birth']?.toString()),
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.wc, size: 12, color: Colors.grey[600]),
                              SizedBox(width: 4),
                              Text(
                                cowData['gender']?.toString() ?? 'N/A',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.grey[600],
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 8),
                          Text(
                            _getLactationDescription(lactationPhase),
                            style: TextStyle(
                              fontSize: 9,
                              color: Colors.grey[500],
                              fontStyle: FontStyle.italic,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                          if (_currentUser!['role'] != "Farmer" &&
                              cowData['farmerName'] != null) ...[
                            SizedBox(height: 8),
                            Container(
                              padding: EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: Colors.grey[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.person,
                                      size: 10, color: Colors.grey[600]),
                                  SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      cowData['farmerName']?.toString() ??
                                          'Unknown',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: Colors.grey[600],
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                          if (isSelected) ...[
                            SizedBox(height: 8),
                            Container(
                              padding: EdgeInsets.all(6),
                              decoration: BoxDecoration(
                                color: primaryColor.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  Icon(Icons.check_circle,
                                      size: 10, color: primaryColor),
                                  SizedBox(width: 4),
                                  Expanded(
                                    child: Text(
                                      'Selected for analysis',
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: primaryColor,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
        ],
      ),
    );
  }

  // Add the remaining build methods with safe type conversion...
  // (I'll include the key ones here, but you can add the rest following the same pattern)

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [primaryColor.withOpacity(0.1), Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: primaryColor.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.analytics, color: primaryColor, size: 28),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Analysis of Cows Milk Production',
                  style: TextStyle(
                    fontSize: 21,
                    fontWeight: FontWeight.w500,
                    color: primaryColor,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          Text(
            'Milk production performance analysis per cow with detailed graphs and statistics',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSelectedCowInfo() {
    if (_selectedCow == null) return SizedBox.shrink();

    final selectedCowData = _safeMapConvert(_selectedCow);

    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.grey[100]!, Colors.white],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                '🐄',
                style: TextStyle(fontSize: 24),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Analysis for: ${selectedCowData['name']?.toString() ?? 'N/A'}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.9,
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 12),
          if (!(_cowPerformance?['isMale'] ?? false))
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: primaryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Row(
                children: [
                  Icon(Icons.date_range, color: primaryColor, size: 20),
                  SizedBox(width: 8),
                  Text(
                    'Period: ${DateFormat('dd/MM/yyyy').format(_startDate)} - ${DateFormat('dd/MM/yyyy').format(_endDate)}',
                    style: TextStyle(
                      fontWeight: FontWeight.w500,
                      color: primaryColor,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPerformanceStats() {
    if (_cowPerformance == null) return SizedBox.shrink();

    if (_cowPerformance!['isMale'] ?? false) {
      return _buildMaleStats();
    } else {
      return _buildFemaleStats();
    }
  }

  Widget _buildMaleStats() {
    if (_cowPerformance == null) return SizedBox.shrink();

    final breedingInfo = _safeMapConvert(_cowPerformance!['breedingInfo']);

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, Colors.grey[50]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Stud Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: primaryColor,
            ),
          ),
          SizedBox(height: 16),
          Center(
            child: Column(
              children: [
                Text('🐂', style: TextStyle(fontSize: 64)),
                SizedBox(height: 8),
                Text(
                  'Stud Cows',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 4),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: infoColor,
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Text(
                    'Bull',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(height: 20),
          _buildInfoCard(
            icon: Icons.favorite,
            title: 'Status',
            value: breedingInfo['status']?.toString() ?? 'N/A',
            color: primaryColor,
          ),
          SizedBox(height: 12),
          _buildInfoCard(
            icon: Icons.cake,
            title: 'Age',
            value: breedingInfo['age']?.toString() ?? 'N/A',
            color: successColor,
          ),
          SizedBox(height: 12),
          _buildInfoCard(
            icon: Icons.check_circle,
            title: 'Maturity',
            value: breedingInfo['maturityStatus']?.toString() ?? 'N/A',
            color: warningColor,
          ),
        ],
      ),
    );
  }

  Widget _buildFemaleStats() {
    if (_cowPerformance == null) return SizedBox.shrink();

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.white, Colors.grey[50]!],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Performance Statistics',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: primaryColor,
            ),
          ),
          SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.2,
            children: [
              _buildStatCard(
                icon: Icons.water_drop,
                title: 'Total Period',
                value: '${_cowPerformance!['rangeVolume']?.toString() ?? '0'}L',
                color: primaryColor,
              ),
              _buildStatCard(
                icon: Icons.trending_up,
                title: 'Average/Session',
                value:
                    '${_cowPerformance!['avgPerSession']?.toString() ?? '0'}L',
                color: successColor,
              ),
              _buildStatCard(
                icon: Icons.event_available,
                title: 'Period Session',
                value:
                    '${_cowPerformance!['rangeSessions']?.toString() ?? '0'}',
                color: warningColor,
              ),
              _buildStatCard(
                icon: Icons.arrow_upward,
                title: 'Highest',
                value:
                    '${_cowPerformance!['highestProduction']?.toString() ?? '0'}L',
                color: Colors.green[600]!,
              ),
            ],
          ),
          SizedBox(height: 12),
          Container(
            padding: EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.purple[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              children: [
                Icon(Icons.schedule, color: Colors.purple[600], size: 20),
                SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Last Milk',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.purple[600],
                          fontSize: 12,
                        ),
                      ),
                      Text(
                        _cowPerformance!['lastMilking']?.toString() ?? 'N/A',
                        style: TextStyle(
                          color: Colors.purple[600],
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withOpacity(0.1), color.withOpacity(0.05)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 10,
              color: color.withOpacity(0.8),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String title,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withOpacity(0.1), color.withOpacity(0.05)],
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 20),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: color,
                    fontSize: 12,
                  ),
                ),
                Text(
                  value,
                  style: TextStyle(
                    color: color,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductionChart() {
    if (_dailySummaries.isEmpty) {
      return Container(
        height: 300,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 15,
              offset: Offset(0, 6),
            ),
          ],
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.bar_chart, size: 48, color: Colors.grey[400]),
              SizedBox(height: 16),
              Text(
                'No production data available',
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

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Daily Production Trend',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: primaryColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Milk production volume per day in the selected period',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 20),
          Container(
            height: 250,
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: true,
                  drawHorizontalLine: true,
                  horizontalInterval: 5,
                  getDrawingHorizontalLine: (value) {
                    return FlLine(
                      color: Colors.grey[300]!,
                      strokeWidth: 1,
                    );
                  },
                  getDrawingVerticalLine: (value) {
                    return FlLine(
                      color: Colors.grey[300]!,
                      strokeWidth: 1,
                    );
                  },
                ),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          '${value.toInt()}L',
                          style: TextStyle(fontSize: 10),
                        );
                      },
                    ),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      interval: (_dailySummaries.length / 5).ceil().toDouble(),
                      getTitlesWidget: (value, meta) {
                        final index = value.toInt();
                        if (index >= 0 && index < _dailySummaries.length) {
                          final summaryData =
                              _safeMapConvert(_dailySummaries[index]);
                          final dateStr = summaryData['date']?.toString();
                          if (dateStr != null) {
                            try {
                              final date = DateTime.parse(dateStr);
                              return Text(
                                DateFormat('dd/MM').format(date),
                                style: TextStyle(fontSize: 10),
                              );
                            } catch (e) {
                              return Text('');
                            }
                          }
                        }
                        return Text('');
                      },
                    ),
                  ),
                  rightTitles:
                      AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles:
                      AxisTitles(sideTitles: SideTitles(showTitles: false)),
                ),
                borderData: FlBorderData(
                  show: true,
                  border: Border.all(color: Colors.grey[300]!, width: 1),
                ),
                lineBarsData: [
                  LineChartBarData(
                    spots: _dailySummaries.asMap().entries.map((entry) {
                      final summaryData = _safeMapConvert(entry.value);
                      final volume = double.tryParse(
                              summaryData['volume']?.toString() ?? '0') ??
                          0.0;
                      return FlSpot(
                        entry.key.toDouble(),
                        volume,
                      );
                    }).toList(),
                    isCurved: true,
                    color: primaryColor,
                    barWidth: 3,
                    dotData: FlDotData(
                      show: true,
                      getDotPainter: (spot, percent, barData, index) {
                        return FlDotCirclePainter(
                          radius: 4,
                          color: primaryColor,
                          strokeWidth: 2,
                          strokeColor: Colors.white,
                        );
                      },
                    ),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          primaryColor.withOpacity(0.3),
                          primaryColor.withOpacity(0.0),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBreedingInfo() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 15,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Breeding Information',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: primaryColor,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Complete information about bulls and their functions',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 20),
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: infoColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: infoColor.withOpacity(0.3)),
            ),
            child: Column(
              children: [
                Icon(Icons.male, size: 32, color: infoColor),
                SizedBox(height: 8),
                Text(
                  'Stud Cows',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: infoColor,
                  ),
                ),
                SizedBox(height: 8),
                Text(
                  'This cow is a stud used for breeding and stocking. The stud does not produce milk, but has an important role in reproduction and genetic development of the herd.',
                  style: TextStyle(
                    fontSize: 12,
                    color: infoColor,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
          SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.1,
            children: [
              _buildBreedingCard(
                icon: Icons.biotech,
                title: 'Genetic Breeding',
                description: 'Produces offspring with superior genetics',
                color: primaryColor,
              ),
              _buildBreedingCard(
                icon: Icons.favorite,
                title: 'Reproduction',
                description: 'Mates with females to produce calves',
                color: dangerColor,
              ),
              _buildBreedingCard(
                icon: Icons.shield,
                title: 'Herd Security',
                description: 'Protects the herd from predator threats',
                color: successColor,
              ),
              _buildBreedingCard(
                icon: Icons.trending_up,
                title: 'Quality Improvement',
                description: 'Improves the quality of herd offspring',
                color: warningColor,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBreedingCard({
    required IconData icon,
    required String title,
    required String description,
    required Color color,
  }) {
    return Container(
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: color, size: 24),
          SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.grey[800],
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 4),
          Text(
            description,
            style: TextStyle(
              fontSize: 10,
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildInstructions() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: infoColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: infoColor.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.info, color: infoColor, size: 24),
          SizedBox(width: 12),
          Expanded(
            child: Text(
              'Select a cow from the card above to view detailed milk production analysis or breeding information.',
              style: TextStyle(
                color: infoColor,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
