import 'package:flutter/material.dart';
import '../controller/APIURL1/cattleDistributionController.dart';
import '../controller/APIURL1/cowManagementController.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class CattleDistribution extends StatefulWidget {
  const CattleDistribution({Key? key}) : super(key: key);

  @override
  State<CattleDistribution> createState() => _CattleDistributionState();
}

class _CattleDistributionState extends State<CattleDistribution>
    with TickerProviderStateMixin {
  final CattleDistributionController _controller =
      CattleDistributionController();

  bool _isLoading = true;
  bool _isAssignModalVisible = false;
  bool _isUnassignedModalVisible = false;

  List<Map<String, dynamic>> _farmersWithCows = [];
  List<dynamic> _allUsers = [];
  List<dynamic> _allCows = [];
  List<dynamic> _unassignedCows = [];

  // Selected values for assignment
  int? _selectedFarmerId;
  int? _selectedCowId;

  // Dashboard statistics
  Map<String, dynamic> _dashboardStats = {
    'totalFarmers': 0,
    'totalCows': 0,
    'assignedCows': 0,
    'unassignedCows': 0,
    'breedDistribution': [],
    'farmerDistribution': [],
    'genderDistribution': [],
  };

  // Pagination
  int _currentPage = 1;
  int _itemsPerPage = 6;
  int _totalPages = 1;

  // Tab controller
  late TabController _tabController;

  // Current user
  Map<String, dynamic>? _currentUser;
  bool _isSupervisor = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadCurrentUser();
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userString = prefs.getString('user');
      if (userString != null) {
        final userData = jsonDecode(userString);
        setState(() {
          _currentUser = userData;
          _isSupervisor = userData['role_id'] == 2;
        });
      }
    } catch (e) {
      debugPrint('Error loading user data: $e');
    }
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Get farmers with cows
      final farmersWithCowsResponse = await _controller.getFarmersWithCows();
      if (farmersWithCowsResponse['success']) {
        setState(() {
          _farmersWithCows = List<Map<String, dynamic>>.from(
            farmersWithCowsResponse['data']['farmers_with_cows'] ?? [],
          );
        });
      }

      // Get all users and all cows
      final allUsersAndCowsResponse = await _controller.getAllUsersAndAllCows();
      if (allUsersAndCowsResponse['success']) {
        setState(() {
          _allUsers = allUsersAndCowsResponse['data']['users'] ?? [];
          _allCows = allUsersAndCowsResponse['data']['cows'] ?? [];
        });

        _calculateDashboardStats();
        _calculateTotalPages();
        _findUnassignedCows();
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error loading data: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _calculateDashboardStats() {
    // Count assigned cows
    final assignedCowIds = <int>{};

    for (final farmer in _farmersWithCows) {
      final cows = List<dynamic>.from(farmer['cows'] ?? []);
      for (final cow in cows) {
        assignedCowIds.add(cow['id']);
      }
    }

    // Calculate breed distribution
    final breedCount = <String, int>{};
    for (final cow in _allCows) {
      final breed = cow['breed'] as String;
      breedCount[breed] = (breedCount[breed] ?? 0) + 1;
    }

    final breedDistribution = breedCount.entries
        .map((entry) => {'name': entry.key, 'value': entry.value})
        .toList();

    // Calculate farmer distribution
    final farmerDistribution = _farmersWithCows
        .map(
          (farmer) => {
            'name': farmer['user']['username'],
            'count': (farmer['cows'] as List).length,
          },
        )
        .toList();

    // Calculate gender distribution
    final genderCount = {'Male': 0, 'Female': 0};
    for (final cow in _allCows) {
      final gender = cow['gender'] as String;
      if (gender.toLowerCase() == 'male') {
        genderCount['Male'] = genderCount['Male']! + 1;
      } else if (gender.toLowerCase() == 'female') {
        genderCount['Female'] = genderCount['Female']! + 1;
      }
    }

    final genderDistribution = [
      {'name': 'Male', 'value': genderCount['Male']},
      {'name': 'Female', 'value': genderCount['Female']},
    ];

    setState(() {
      _dashboardStats = {
        'totalFarmers': _allUsers.length,
        'totalCows': _allCows.length,
        'assignedCows': assignedCowIds.length,
        'unassignedCows': _allCows.length - assignedCowIds.length,
        'breedDistribution': breedDistribution,
        'farmerDistribution': farmerDistribution,
        'genderDistribution': genderDistribution,
      };
    });
  }

  void _findUnassignedCows() {
    final assignedCowIds = <int>{};

    for (final farmer in _farmersWithCows) {
      final cows = List<dynamic>.from(farmer['cows'] ?? []);
      for (final cow in cows) {
        assignedCowIds.add(cow['id']);
      }
    }

    setState(() {
      _unassignedCows =
          _allCows.where((cow) => !assignedCowIds.contains(cow['id'])).toList();
    });
  }

  void _calculateTotalPages() {
    setState(() {
      _totalPages = (_farmersWithCows.length / _itemsPerPage).ceil();
      if (_totalPages == 0) _totalPages = 1;

      if (_currentPage > _totalPages) {
        _currentPage = _totalPages;
      }
    });
  }

  List<Map<String, dynamic>> get _paginatedFarmers {
    final startIndex = (_currentPage - 1) * _itemsPerPage;
    final endIndex = startIndex + _itemsPerPage > _farmersWithCows.length
        ? _farmersWithCows.length
        : startIndex + _itemsPerPage;

    return _farmersWithCows
        .sublist(startIndex, endIndex)
        .cast<Map<String, dynamic>>();
  }

  Future<void> _assignCow() async {
    if (_selectedFarmerId == null || _selectedCowId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select both a farmer and a cow'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    try {
      final result = await _controller.assignCowToUser(
        _selectedFarmerId!,
        _selectedCowId!,
      );

      if (result['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cow successfully assigned to farmer'),
            backgroundColor: Colors.green,
          ),
        );

        setState(() {
          _isAssignModalVisible = false;
          _selectedFarmerId = null;
          _selectedCowId = null;
        });

        await _loadData();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: The cow is already assigned to a farmer'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('An unexpected error occurred: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _unassignCow(int farmerId, int cowId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900], // Latar belakang gelap
        title: Text(
          'Confirm Unassignment',
          style: TextStyle(color: Colors.white), // Teks putih
        ),
        content: Text(
          'Do you want to unassign this cow from the farmer?',
          style: TextStyle(color: Colors.white70), // Teks agak ट्रांसparan
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              'Cancel',
              style: TextStyle(color: Colors.white), // Teks putih
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: Text(
              'Unassign',
              style: TextStyle(color: Colors.white), // Teks putih
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        final result = await _controller.unassignCowFromUser(farmerId, cowId);

        if (result['success']) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Cow successfully unassigned from farmer'),
              backgroundColor: Colors.green,
            ),
          );

          await _loadData();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: ${result['message']}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('An unexpected error occurred: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Cattle Distribution',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w500,
                color: Colors.white)),
        backgroundColor:
            _isSupervisor ? Colors.deepOrange[400] : Colors.blueGrey[700],
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Stack(
        children: [
          Column(
            children: [
              // Dashboard stats cards
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: _buildDashboardStats(),
              ),

              // Tab bar
              TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(
                      icon: Icon(Icons.table_chart, color: Colors.blueGrey),
                      text: 'Distribution'),
                  Tab(
                      icon: Icon(Icons.analytics, color: Colors.blueGrey),
                      text: 'Analytics'),
                ],
                indicatorColor: Colors.blueGrey,
                labelColor: Colors.blueGrey,
                unselectedLabelColor: Colors.grey[400],
              ),

              // Tab content
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [_buildDistributionTab(), _buildAnalyticsTab()],
                ),
              ),
            ],
          ),

          // Unassigned Cows Modal as overlay
          if (_isUnassignedModalVisible)
            GestureDetector(
              onTap: () => setState(() => _isUnassignedModalVisible = false),
              child: Container(
                color: Colors.black54,
                child: Center(
                  child: GestureDetector(
                    onTap:
                        () {}, // Prevent closing when tapping the modal content
                    child: Container(
                      width: MediaQuery.of(context).size.width * 0.85,
                      height: MediaQuery.of(context).size.height * 0.7,
                      margin: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.grey[900],
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.5),
                            blurRadius: 15,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: _buildUnassignedCowsModalContent(),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      floatingActionButton: _isSupervisor
          ? null
          : FloatingActionButton(
              onPressed: () => setState(() => _isAssignModalVisible = true),
              backgroundColor: Colors.blueGrey[800],
              child: const Icon(Icons.link, color: Colors.white),
              tooltip: 'Assign Cow to Farmer',
            ),
      // Assign Cow Modal
      bottomSheet: _isAssignModalVisible ? _buildAssignCowModal() : null,
    );
  }

  Widget _buildUnassignedCowsModalContent() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Unassigned Cattle',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () =>
                    setState(() => _isUnassignedModalVisible = false),
              ),
            ],
          ),
          const Text(
            'View cattle that are currently unassigned to any farmer.',
            style: TextStyle(fontSize: 14, color: Colors.white70),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: _unassignedCows.isEmpty
                ? const Center(
                    child: Text(
                      'No unassigned cattle available.',
                      style: TextStyle(color: Colors.white),
                    ),
                  )
                : ListView.builder(
                    itemCount: _unassignedCows.length,
                    itemBuilder: (context, index) {
                      final cow = _unassignedCows[index];
                      return Card(
                        color: Colors.grey[800],
                        margin: const EdgeInsets.only(bottom: 8.0),
                        child: ListTile(
                          leading: Icon(
                            cow['gender'].toString().toLowerCase() == 'female'
                                ? Icons.female
                                : Icons.male,
                            color: cow['gender'].toString().toLowerCase() ==
                                    'female'
                                ? Colors.pink
                                : Colors.blue,
                          ),
                          title: Text(
                            cow['name'],
                            style: const TextStyle(color: Colors.white),
                          ),
                          subtitle: Text(
                            '${cow['breed']} • Age: ${cow['age'] ?? 'Unknown'}',
                            style: const TextStyle(color: Colors.white70),
                          ),
                          trailing: Text(
                            'ID: ${cow['id']}',
                            style: const TextStyle(
                                color: Colors.white54, fontSize: 12),
                          ),
                        ),
                      );
                    },
                  ),
          ),
          const SizedBox(height: 16),
          Center(
            child: ElevatedButton(
              onPressed: () =>
                  setState(() => _isUnassignedModalVisible = false),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueGrey[700],
                padding:
                    const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              ),
              child: const Text(
                'Close',
                style: TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardStats() {
    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 8.0),
              child: Text(
                'Distribution Dashboard',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              childAspectRatio: 1.6,
              children: [
                _buildStatCard(
                  title: 'Total Farmers',
                  value: _dashboardStats['totalFarmers'].toString(),
                  icon: Icons.person,
                  color: Colors.blue,
                ),
                _buildStatCard(
                  title: 'Total Cattle',
                  value: _dashboardStats['totalCows'].toString(),
                  icon: Icons.pets,
                  color: Colors.green,
                ),
                _buildStatCard(
                  title: 'Assigned Cattle',
                  value: _dashboardStats['assignedCows'].toString(),
                  icon: Icons.link,
                  color: Colors.teal,
                ),
                _buildStatCard(
                  title: 'Unassigned Cattle',
                  value: _dashboardStats['unassignedCows'].toString(),
                  icon: Icons.link_off,
                  color: Colors.orange,
                  onTap: () => setState(() => _isUnassignedModalVisible = true),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 2,
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 28),
              const SizedBox(height: 8),
              Text(
                value,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                title,
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDistributionTab() {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          // Farmers and their cows list
          Expanded(
            child: _farmersWithCows.isEmpty
                ? const Center(
                    child: Text('No cattle distribution data available'),
                  )
                : ListView.builder(
                    itemCount: _paginatedFarmers.length,
                    itemBuilder: (context, index) {
                      final farmer = _paginatedFarmers[index];
                      final user = farmer['user'];
                      final cows = List<dynamic>.from(farmer['cows'] ?? []);

                      return Card(
                        margin: const EdgeInsets.only(bottom: 8.0),
                        child: ListTile(
                          title: Text(
                            user['username'],
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          subtitle: cows.isEmpty
                              ? const Text(
                                  'No cattle assigned',
                                  style: TextStyle(
                                    fontStyle: FontStyle.italic,
                                  ),
                                )
                              : Wrap(
                                  spacing: 4,
                                  runSpacing: 4,
                                  children: cows.map<Widget>((cow) {
                                    return Chip(
                                      label: Text(
                                        '${cow['name']} (${cow['breed']})',
                                        style: const TextStyle(
                                          fontSize: 12,
                                        ),
                                      ),
                                      deleteIcon: _isSupervisor
                                          ? null
                                          : const Icon(
                                              Icons.close,
                                              size: 14,
                                            ),
                                      onDeleted: _isSupervisor
                                          ? null
                                          : () => _unassignCow(
                                                user['id'],
                                                cow['id'],
                                              ),
                                      backgroundColor: Colors.blue[100],
                                    );
                                  }).toList(),
                                ),
                        ),
                      );
                    },
                  ),
          ),

          // Pagination controls
          _totalPages > 1
              ? Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.keyboard_double_arrow_left),
                      onPressed: _currentPage <= 1
                          ? null
                          : () => setState(() => _currentPage = 1),
                    ),
                    IconButton(
                      icon: const Icon(Icons.chevron_left),
                      onPressed: _currentPage <= 1
                          ? null
                          : () => setState(() => _currentPage--),
                    ),
                    Text('$_currentPage / $_totalPages'),
                    IconButton(
                      icon: const Icon(Icons.chevron_right),
                      onPressed: _currentPage >= _totalPages
                          ? null
                          : () => setState(() => _currentPage++),
                    ),
                    IconButton(
                      icon: const Icon(Icons.keyboard_double_arrow_right),
                      onPressed: _currentPage >= _totalPages
                          ? null
                          : () => setState(() => _currentPage = _totalPages),
                    ),
                  ],
                )
              : const SizedBox.shrink(),
        ],
      ),
    );
  }

  Widget _buildAnalyticsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Gender Distribution Card
          Card(
            margin: const EdgeInsets.only(bottom: 16.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Gender Distribution',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(height: 200, child: _buildGenderDistributionChart()),
                ],
              ),
            ),
          ),

          // Breed Information Card
          Card(
            margin: const EdgeInsets.only(bottom: 16.0),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Breed Information',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Girolando Breed',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'The Girolando is a hybrid breed developed in Brazil by crossing Gir cattle, known for their heat tolerance and milk production, with Holstein cattle, renowned for their high milk yield. This breed is highly adaptable to tropical climates and is widely used in dairy farming due to its excellent productivity and resilience.',
                    style: TextStyle(fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Girolando cattle are known for their ability to produce high-quality milk even in challenging environmental conditions, making them a preferred choice for farmers in tropical regions.',
                    style: TextStyle(fontSize: 14),
                  ),
                ],
              ),
            ),
          ),

          // Farmer Distribution Card
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Farmer Cattle Management',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 16),
                  ..._dashboardStats['farmerDistribution'].map<Widget>((
                    farmer,
                  ) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Row(
                        children: [
                          Expanded(flex: 3, child: Text(farmer['name'])),
                          Expanded(
                            flex: 7,
                            child: LinearProgressIndicator(
                              value: farmer['count'] /
                                  (_dashboardStats['totalCows'] > 0
                                      ? _dashboardStats['totalCows']
                                      : 1),
                              backgroundColor: Colors.grey[300],
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.blue,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('${farmer['count']}'),
                        ],
                      ),
                    );
                  }).toList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGenderDistributionChart() {
    final genderData = _dashboardStats['genderDistribution'];

    if (genderData.isEmpty || genderData.every((item) => item['value'] == 0)) {
      return const Center(child: Text('No gender data available'));
    }

    final maleValue = genderData[0]['value'] ?? 0;
    final femaleValue = genderData[1]['value'] ?? 0;
    final total = maleValue + femaleValue;

    return Row(
      children: [
        Expanded(
          flex: 3,
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 30,
              sections: [
                PieChartSectionData(
                  value: maleValue.toDouble(),
                  title: 'Male',
                  color: Colors.blue,
                  radius: 60,
                  titleStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                PieChartSectionData(
                  value: femaleValue.toDouble(),
                  title: 'Female',
                  color: Colors.green,
                  radius: 60,
                  titleStyle: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          flex: 2,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildLegendItem(
                color: Colors.blue,
                title: 'Male',
                value:
                    '$maleValue (${total > 0 ? ((maleValue / total) * 100).round() : 0}%)',
              ),
              const SizedBox(height: 16),
              _buildLegendItem(
                color: Colors.green,
                title: 'Female',
                value:
                    '$femaleValue (${total > 0 ? ((femaleValue / total) * 100).round() : 0}%)',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLegendItem({
    required Color color,
    required String title,
    required String value,
  }) {
    return Row(
      children: [
        Container(width: 16, height: 16, color: color),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title),
            Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ],
    );
  }

  Widget _buildAssignCowModal() {
    return Container(
      height: MediaQuery.of(context).size.height * 0.6,
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.grey[900], // Latar belakang gelap
        borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5), // Warna bayangan disesuaikan
            blurRadius: 10,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Assign Cow to Farmer',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white), // Teks putih
              ),
              IconButton(
                icon:
                    const Icon(Icons.close, color: Colors.white), // Ikon putih
                onPressed: () => setState(() => _isAssignModalVisible = false),
              ),
            ],
          ),
          const Text(
            'Select a farmer and a cow to assign them together.',
            style: TextStyle(fontSize: 14, color: Colors.white70), // Teks putih
          ),
          const SizedBox(height: 16),
          // Farmer selection
          const Text(
            'Select Farmer',
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.white), // Teks putih
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<int>(
            dropdownColor: Colors.grey[800], // Warna dropdown gelap
            value: _selectedFarmerId,
            onChanged: (value) => setState(() => _selectedFarmerId = value),
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              hintStyle: TextStyle(color: Colors.white70),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.grey[700]!),
              ),
              focusedBorder: const OutlineInputBorder(
                borderSide: BorderSide(color: Colors.blue),
              ),
            ),
            style: const TextStyle(color: Colors.white),
            items: _allUsers
                .where((user) =>
                    user['role_id'] == 3) // Filter for farmers (role_id 3)
                .map<DropdownMenuItem<int>>((user) {
              return DropdownMenuItem<int>(
                value: user['id'],
                child: Text(
                  user['username'],
                  style: const TextStyle(color: Colors.white),
                ),
              );
            }).toList(),
            hint: const Text(
              '-- Select Farmer --',
              style: TextStyle(color: Colors.white70),
            ),
          ),
          const SizedBox(height: 16),
          // Cow selection
          const Text(
            'Select Cow',
            style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.white), // Teks putih
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<int>(
            dropdownColor: Colors.grey[800],
            value: _selectedCowId,
            onChanged: (value) => setState(() => _selectedCowId = value),
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              hintStyle: const TextStyle(color: Colors.white70),
              enabledBorder: OutlineInputBorder(
                borderSide: BorderSide(color: Colors.grey[700]!),
              ),
              focusedBorder: const OutlineInputBorder(
                borderSide: BorderSide(color: Colors.blue),
              ),
            ),
            style: const TextStyle(color: Colors.white),
            items: _allCows.map<DropdownMenuItem<int>>((cow) {
              return DropdownMenuItem<int>(
                value: cow['id'],
                child: Text(
                  '${cow['name']} (${cow['breed']}, ${cow['gender']})',
                  style: const TextStyle(color: Colors.white),
                ),
              );
            }).toList(),
            hint: const Text(
              '-- Select Cow --',
              style: TextStyle(color: Colors.white70),
            ),
          ),
          const Spacer(),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () =>
                      setState(() => _isAssignModalVisible = false),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    side: BorderSide(color: Colors.grey[600]!),
                  ),
                  child: const Text(
                    'Cancel',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: _assignCow,
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    backgroundColor:
                        Colors.blueGrey[800], // Warna latar belakang tombol"
                  ),
                  child: const Text(
                    'Assign',
                    style: TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
