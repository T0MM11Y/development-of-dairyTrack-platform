import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'dart:convert';
import '../../controller/APIURL1/milkQualityControlsController.dart';

class MilkQualityControlsView extends StatefulWidget {
  const MilkQualityControlsView({Key? key}) : super(key: key);

  @override
  State<MilkQualityControlsView> createState() =>
      _MilkQualityControlsViewState();
}

class _MilkQualityControlsViewState extends State<MilkQualityControlsView>
    with TickerProviderStateMixin {
  final MilkQualityControlsController _controller =
      MilkQualityControlsController();

  bool _isLoading = true;
  bool _autoRefresh = true;
  Map<String, dynamic>? _batchesByStatus;
  Map<String, dynamic>? _expiryAnalysis;
  List<Map<String, dynamic>> _allBatchesData = [];
  List<Map<String, dynamic>> _filteredBatchesData = [];

  // Filter states
  String _statusFilter = 'all';
  String _searchTerm = '';
  String _urgencyFilter = 'all';

  // Controllers
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  final TextEditingController _searchController = TextEditingController();

  // User data
  String _userId = '';
  String _userRole = '';

  // Constants
  static const Map<String, Color> statusColors = {
    'FRESH': Colors.green,
    'EXPIRED': Colors.red,
    'USED': Colors.grey,
  };

  static const Map<String, Color> urgencyColors = {
    'overdue': Colors.red,
    'warning': Colors.orange,
    'caution': Colors.green,
    'safe': Colors.grey,
    'unknown': Colors.black,
  };

  static const Map<String, int> urgencyOrder = {
    'overdue': 0,
    'warning': 1,
    'caution': 2,
    'safe': 3,
    'unknown': 4,
  };

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );

    _initializeUserData();
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _initializeUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Retrieve and safely cast values from SharedPreferences
      final userId = prefs.getInt('userId');
      final userRole = prefs.getString('userRole');

      if (userId != null && userRole != null) {
        setState(() {
          _userId = userId.toString();
          _userRole = userRole;
        });
        await _loadAllData();
      } else {
        _showErrorSnackBar(
            'Failed to retrieve user data. Please log in again.');
      }
    } catch (e) {
      _showErrorSnackBar('Error initializing user data: $e');
    }
  }

  Future<void> _loadAllData() async {
    if (_userId.isEmpty || _userRole.isEmpty) {
      print('User ID or Role is empty');
      return;
    }

    setState(() => _isLoading = true);

    try {
      final results = await Future.wait([
        _controller.getMilkBatchesByStatus(
          userId: _userId,
          userRole: _userRole,
        ),
        _controller.getExpiryAnalysis(
          userId: _userId,
          userRole: _userRole,
        ),
      ]);

      print('Raw API Response: $results');

      setState(() {
        _batchesByStatus = results[0]['data'];
        _expiryAnalysis = results[1]['data'];
        print('Batches By Status: $_batchesByStatus');
        print('Expiry Analysis: $_expiryAnalysis');
        _processAllBatches();
        _applyFilters();
      });
    } catch (error) {
      _showErrorSnackBar('Error loading data: $error');
      print('Error loading data: $error');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _processAllBatches() {
    if (_batchesByStatus == null) return;

    _allBatchesData.clear();

    // Process fresh batches
    if (_batchesByStatus!['fresh'] != null) {
      for (var batch in _batchesByStatus!['fresh']) {
        _allBatchesData.add(_processBatchData(batch));
      }
    }

    // Process expired batches
    if (_batchesByStatus!['expired'] != null) {
      for (var batch in _batchesByStatus!['expired']) {
        _allBatchesData.add(_processBatchData(batch));
      }
    }

    // Process used batches
    if (_batchesByStatus!['used'] != null) {
      for (var batch in _batchesByStatus!['used']) {
        _allBatchesData.add(_processBatchData(batch));
      }
    }

    // Sort by urgency
    _allBatchesData.sort((a, b) {
      final urgencyDiff = (urgencyOrder[a['urgency_level']] ?? 4) -
          (urgencyOrder[b['urgency_level']] ?? 4);
      if (urgencyDiff != 0) return urgencyDiff;

      if (a['hours_until_expiry'] != null && b['hours_until_expiry'] != null) {
        return (a['hours_until_expiry'] as double)
            .compareTo(b['hours_until_expiry']);
      }
      return 0;
    });
  }

  Map<String, dynamic> _processBatchData(Map<String, dynamic> batch) {
    final normalizedBatch = Map<String, dynamic>.from(batch);
    normalizedBatch['status'] =
        (batch['status']?.toString().toUpperCase()) ?? 'UNKNOWN';

    String urgencyLevel = 'unknown';
    double? hoursRemaining;

    if (normalizedBatch['expiry_date'] != null &&
        normalizedBatch['status'] == 'FRESH') {
      try {
        final expiryDate = DateTime.parse(normalizedBatch['expiry_date']);
        final now = DateTime.now();
        final diffInMs =
            expiryDate.millisecondsSinceEpoch - now.millisecondsSinceEpoch;
        hoursRemaining = diffInMs / (1000 * 60 * 60);
        urgencyLevel = _getUrgencyLevelFromHours(hoursRemaining);
      } catch (e) {
        // Handle date parsing error
      }
    } else if (normalizedBatch['status'] == 'EXPIRED') {
      urgencyLevel = 'overdue';
      hoursRemaining = -1;
    } else if (normalizedBatch['status'] == 'USED') {
      urgencyLevel = 'safe';
    }

    normalizedBatch['hours_until_expiry'] = hoursRemaining;
    normalizedBatch['urgency_level'] = urgencyLevel;

    return normalizedBatch;
  }

  String _getUrgencyLevelFromHours(double hours) {
    if (hours <= 0) return 'overdue';
    if (hours <= 2) return 'warning';
    if (hours <= 4) return 'caution';
    return 'safe';
  }

  void _applyFilters() {
    _filteredBatchesData = _allBatchesData.where((batch) {
      final statusMatch = _statusFilter == 'all' ||
          batch['status'] == _statusFilter.toUpperCase();

      final searchMatch = _searchTerm.isEmpty ||
          [
            batch['batch_number'],
            batch['total_volume']?.toString(),
            batch['cow_name'],
            batch['cow_id']?.toString(),
          ].any((field) =>
              field?.toLowerCase().contains(_searchTerm.toLowerCase()) ??
              false);

      final urgencyMatch =
          _urgencyFilter == 'all' || batch['urgency_level'] == _urgencyFilter;

      return statusMatch && searchMatch && urgencyMatch;
    }).toList();
  }

  Future<void> _updateExpiredBatches() async {
    try {
      final result = await _controller.updateExpiredMilkBatches(
        userId: _userId,
        userRole: _userRole,
      );

      if (result['success'] == true) {
        _showSuccessSnackBar('Expired batches updated successfully');
        await _loadAllData();
      } else {
        _showErrorSnackBar(
            result['message'] ?? 'Failed to update expired batches');
      }
    } catch (error) {
      _showErrorSnackBar('Error updating expired batches: $error');
    }
  }

  void _showErrorSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _showSuccessSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  void _clearFilters() {
    setState(() {
      _statusFilter = 'all';
      _searchTerm = '';
      _urgencyFilter = 'all';
      _searchController.clear();
      _applyFilters();
    });
  }

  String _formatTimeRemaining(Map<String, dynamic> batch) {
    if (batch['expiry_date'] == null || batch['status'] == 'EXPIRED') {
      return '-';
    }

    final hoursRemaining = batch['hours_until_expiry'] as double?;
    if (hoursRemaining == null || hoursRemaining <= 0) {
      return 'Overdue';
    }

    if (hoursRemaining < 1) {
      final minutes = (hoursRemaining * 60).round();
      return '${minutes}m';
    } else if (hoursRemaining < 24) {
      return '${hoursRemaining.toStringAsFixed(1)}h';
    } else {
      final days = (hoursRemaining / 24).round();
      return '${days}d';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: const Text(
          'Milk Quality Controls',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 20,
          ),
        ),
        backgroundColor: const Color(0xFF3D90D7),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(_autoRefresh ? Icons.autorenew : Icons.refresh),
            onPressed: () {
              setState(() {
                _autoRefresh = !_autoRefresh;
              });
              if (_autoRefresh) {
                _loadAllData();
              }
            },
          ),
          IconButton(
            icon: const Icon(Icons.update),
            onPressed: _updateExpiredBatches,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Loading milk expiry data...'),
                ],
              ),
            )
          : FadeTransition(
              opacity: _fadeAnimation,
              child: RefreshIndicator(
                onRefresh: _loadAllData,
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildHeaderCard(),
                      const SizedBox(height: 16),
                      _buildSummaryCards(),
                      const SizedBox(height: 16),
                      _buildStatusChart(),
                      const SizedBox(height: 16),
                      _buildFilterSection(),
                      const SizedBox(height: 16),
                      _buildBatchesList(),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildHeaderCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: const LinearGradient(
            colors: [Color(0xFF3D90D7), Color(0xFF2C7BD0)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(
              children: [
                Icon(Icons.access_time, color: Colors.white, size: 24),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Milk Expiry Check & Analysis',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Monitor milk batch expiry status with 8-hour shelf life tracking',
              style: TextStyle(
                color: Colors.white.withOpacity(0.9),
                fontSize: 14,
              ),
            ),
            if (_batchesByStatus?['user_managed_cows'] != null)
              Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '${(_batchesByStatus!['user_managed_cows'] as List).length} managed cows',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryCards() {
    if (_batchesByStatus == null) return const SizedBox.shrink();

    final summary = _batchesByStatus!['summary'] ?? {};

    return LayoutBuilder(
      builder: (context, constraints) {
        return Row(
          children: [
            Expanded(
              child: _buildSummaryCard(
                'Fresh Batches',
                summary['fresh_count'] ?? 0,
                summary['total_fresh_volume'] ?? 0,
                statusColors['FRESH']!,
                Icons.check_circle,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildSummaryCard(
                'Expired Batches',
                summary['expired_count'] ?? 0,
                summary['total_expired_volume'] ?? 0,
                statusColors['EXPIRED']!,
                Icons.cancel,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: _buildSummaryCard(
                'Used Batches',
                summary['used_count'] ?? 0,
                summary['total_used_volume'] ?? 0,
                statusColors['USED']!,
                Icons.archive,
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildSummaryCard(
      String title, int count, double volume, Color color, IconData icon) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: const Color(0xFFFAFAFA), // Warna background card yang lembut
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: LinearGradient(
            colors: [
              Colors.white,
              color.withOpacity(0.05), // Gradient halus dengan warna status
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 12),
            Text(
              count.toString(),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              title,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF64748B), // Warna slate-500 custom
                fontWeight: FontWeight.w500,
              ),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
            ),
            const SizedBox(height: 2),
            Text(
              '${volume.toStringAsFixed(1)}L',
              style: TextStyle(
                fontSize: 10,
                color: color,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusChart() {
    if (_batchesByStatus == null) return const SizedBox.shrink();

    final summary = _batchesByStatus!['summary'] ?? {};
    final chartData = [
      _ChartData('Fresh', summary['fresh_count'] ?? 0,
          const Color(0xFF10B981)), // Emerald-500
      _ChartData('Expired', summary['expired_count'] ?? 0,
          const Color(0xFFEF4444)), // Red-500
      _ChartData('Used', summary['used_count'] ?? 0,
          const Color(0xFF6B7280)), // Gray-500
    ];

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: const LinearGradient(
            colors: [
              Colors.white,
              Color(0xFFF8FAFC), // Slate-50
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3D90D7).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.bar_chart,
                    color: Color(0xFF3D90D7),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Batch Status Distribution',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate-800
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            SizedBox(
              height: 200,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: chartData
                          .map((e) => e.value.toDouble())
                          .reduce((a, b) => a > b ? a : b) *
                      1.2,
                  barTouchData: BarTouchData(
                    enabled: true,
                    touchTooltipData: BarTouchTooltipData(
                      getTooltipColor: (group) =>
                          const Color(0xFF334155), // Correct parameter name
                      tooltipBorderRadius: BorderRadius.circular(8),
                      getTooltipItem: (group, groupIndex, rod, rodIndex) {
                        return BarTooltipItem(
                          '${chartData[group.x].name}\n${rod.toY.round()} batches',
                          const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                          ),
                        );
                      },
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        getTitlesWidget: (value, meta) {
                          if (value.toInt() < chartData.length) {
                            return Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                chartData[value.toInt()].name,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF64748B), // Slate-500
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            );
                          }
                          return const Text('');
                        },
                      ),
                    ),
                    leftTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: chartData.asMap().entries.map((entry) {
                    return BarChartGroupData(
                      x: entry.key,
                      barRods: [
                        BarChartRodData(
                          toY: entry.value.value.toDouble(),
                          color: entry.value.color,
                          width: 40,
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(6),
                            topRight: Radius.circular(6),
                          ),
                          gradient: LinearGradient(
                            colors: [
                              entry.value.color,
                              entry.value.color.withOpacity(0.7),
                            ],
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                          ),
                        ),
                      ],
                    );
                  }).toList(),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterSection() {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          gradient: const LinearGradient(
            colors: [
              Colors.white,
              Color(0xFFF1F5F9), // Slate-100
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3D90D7).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(
                    Icons.filter_list,
                    color: Color(0xFF3D90D7),
                    size: 20,
                  ),
                ),
                const SizedBox(width: 12),
                const Text(
                  'Filter & Search Batches',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF1E293B), // Slate-800
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by batch number, volume, cow...',
                hintStyle: const TextStyle(
                  color: Color(0xFF94A3B8), // Slate-400
                ),
                prefixIcon: const Icon(
                  Icons.search,
                  color: Color(0xFF64748B), // Slate-500
                ),
                suffixIcon: _searchTerm.isNotEmpty
                    ? IconButton(
                        icon: const Icon(
                          Icons.clear,
                          color: Color(0xFF64748B), // Slate-500
                        ),
                        onPressed: () {
                          _searchController.clear();
                          setState(() {
                            _searchTerm = '';
                            _applyFilters();
                          });
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(
                    color: Color(0xFFE2E8F0), // Slate-200
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(
                    color: Color(0xFF3D90D7),
                    width: 2,
                  ),
                ),
                filled: true,
                fillColor: const Color(0xFFFAFAFA),
              ),
              onChanged: (value) {
                setState(() {
                  _searchTerm = value;
                  _applyFilters();
                });
              },
            ),
            const SizedBox(height: 12),
            LayoutBuilder(
              builder: (context, constraints) {
                if (constraints.maxWidth < 400) {
                  // Stack vertically on small screens
                  return Column(
                    children: [
                      DropdownButtonFormField<String>(
                        value: _statusFilter,
                        decoration: InputDecoration(
                          labelText: 'Status',
                          labelStyle: const TextStyle(
                            color: Color(0xFF64748B), // Slate-500
                          ),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFFE2E8F0), // Slate-200
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8),
                            borderSide: const BorderSide(
                              color: Color(0xFF3D90D7),
                              width: 2,
                            ),
                          ),
                          filled: true,
                          fillColor: const Color(0xFFFAFAFA),
                        ),
                        dropdownColor: Colors.white,
                        items: const [
                          DropdownMenuItem(
                              value: 'all', child: Text('All Status')),
                          DropdownMenuItem(
                              value: 'FRESH', child: Text('Fresh')),
                          DropdownMenuItem(
                              value: 'EXPIRED', child: Text('Expired')),
                          DropdownMenuItem(value: 'USED', child: Text('Used')),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _statusFilter = value!;
                            _applyFilters();
                          });
                        },
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _clearFilters,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF3D90D7),
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.clear_all, size: 18),
                              SizedBox(width: 4),
                              Text('Clear Filters'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  );
                } else {
                  // Show horizontally on larger screens
                  return Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _statusFilter,
                          decoration: InputDecoration(
                            labelText: 'Status',
                            labelStyle: const TextStyle(
                              color: Color(0xFF64748B), // Slate-500
                            ),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                color: Color(0xFFE2E8F0), // Slate-200
                              ),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                              borderSide: const BorderSide(
                                color: Color(0xFF3D90D7),
                                width: 2,
                              ),
                            ),
                            filled: true,
                            fillColor: const Color(0xFFFAFAFA),
                          ),
                          dropdownColor: Colors.white,
                          items: const [
                            DropdownMenuItem(
                                value: 'all', child: Text('All Status')),
                            DropdownMenuItem(
                                value: 'FRESH', child: Text('Fresh')),
                            DropdownMenuItem(
                                value: 'EXPIRED', child: Text('Expired')),
                            DropdownMenuItem(
                                value: 'USED', child: Text('Used')),
                          ],
                          onChanged: (value) {
                            setState(() {
                              _statusFilter = value!;
                              _applyFilters();
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _clearFilters,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3D90D7),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 12,
                          ),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.clear_all, size: 18),
                            SizedBox(width: 4),
                            Text('Clear'),
                          ],
                        ),
                      ),
                    ],
                  );
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBatchesList() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      color: Colors.white, // Menghilangkan warna bawaan dan set ke putih
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Expanded(
                  child: Text(
                    'All Milk Batches',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Color(
                          0xFF3D90D7), // Warna custom bukan bawaan Flutter
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  '${_filteredBatchesData.length} batches',
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF666666), // Warna custom untuk grey
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (_filteredBatchesData.isEmpty)
              Center(
                child: Column(
                  children: [
                    Icon(
                      Icons.inbox,
                      size: 48,
                      color: Color(0xFF999999), // Warna custom untuk grey
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'No batches found',
                      style: TextStyle(
                        color: Color(0xFF666666), // Warna custom untuk grey
                      ),
                    ),
                  ],
                ),
              )
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _filteredBatchesData.length,
                separatorBuilder: (context, index) => const SizedBox(height: 8),
                itemBuilder: (context, index) {
                  final batch = _filteredBatchesData[index];
                  return _buildBatchItem(batch);
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildBatchItem(Map<String, dynamic> batch) {
    final urgencyColor = urgencyColors[batch['urgency_level']] ?? Colors.grey;
    final statusColor = statusColors[batch['status']] ?? Colors.grey;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row: Batch Number + Urgency Indicator + Time Remaining
            Row(
              children: [
                // Urgency indicator
                Container(
                  width: 4,
                  height: 20,
                  decoration: BoxDecoration(
                    color: urgencyColor,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(width: 8),
                // Batch number
                Expanded(
                  child: Text(
                    batch['batch_number'] ?? 'N/A',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
                // Time remaining
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: urgencyColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: urgencyColor.withOpacity(0.3)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.access_time, size: 14, color: urgencyColor),
                      const SizedBox(width: 4),
                      Text(
                        _formatTimeRemaining(batch),
                        style: TextStyle(
                          color: urgencyColor,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Volume and Status Row - Stacked vertically on small screens
            LayoutBuilder(
              builder: (context, constraints) {
                if (constraints.maxWidth < 300) {
                  // Stack vertically for very small screens
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Volume
                      Row(
                        children: [
                          const Icon(Icons.water_drop,
                              size: 16, color: Colors.blue),
                          const SizedBox(width: 4),
                          Text(
                            '${batch['total_volume'] ?? 0}L',
                            style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      // Status
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          batch['status'] ?? 'UNKNOWN',
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  );
                } else {
                  // Horizontal layout for larger screens
                  return Row(
                    children: [
                      // Volume
                      const Icon(Icons.water_drop,
                          size: 16, color: Colors.blue),
                      const SizedBox(width: 4),
                      Text(
                        '${batch['total_volume'] ?? 0}L',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(width: 16),
                      // Status
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          batch['status'] ?? 'UNKNOWN',
                          style: TextStyle(
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  );
                }
              },
            ),

            // Dates - Always stacked vertically to save space
            if (batch['production_date'] != null ||
                batch['expiry_date'] != null)
              const SizedBox(height: 8),

            // Production date
            if (batch['production_date'] != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 2),
                child: Row(
                  children: [
                    const Icon(Icons.schedule, size: 12, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      'Produced: ',
                      style: const TextStyle(fontSize: 11, color: Colors.grey),
                    ),
                    Expanded(
                      child: Text(
                        DateFormat('dd/MM/yy HH:mm')
                            .format(DateTime.parse(batch['production_date'])),
                        style: const TextStyle(
                          fontSize: 11,
                          color: Colors.grey,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

            // Expiry date
            if (batch['expiry_date'] != null)
              Row(
                children: [
                  const Icon(Icons.event, size: 12, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    'Expires: ',
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                  Expanded(
                    child: Text(
                      DateFormat('dd/MM/yy HH:mm')
                          .format(DateTime.parse(batch['expiry_date'])),
                      style: TextStyle(
                        fontSize: 11,
                        color: batch['status'] == 'EXPIRED'
                            ? Colors.red
                            : Colors.grey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}

class _ChartData {
  final String name;
  final int value;
  final Color color;

  _ChartData(this.name, this.value, this.color);
}
