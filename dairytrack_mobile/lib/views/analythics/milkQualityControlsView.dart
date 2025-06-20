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

  // Pagination variables
  int _currentPage = 1;
  int _itemsPerPage = 10;
  int _totalPages = 1;
  List<Map<String, dynamic>> _paginatedData = [];

  // Filter states
  String _statusFilter = 'all';
  String _searchTerm = '';
  String _urgencyFilter = 'all';

  // Controllers
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  final TextEditingController _searchController = TextEditingController();
  final PageController _pageController = PageController();

  // User data
  String _userId = '';
  String _userRole = '';
  Map<String, dynamic>? currentUser;
  bool isFarmer = false;
  bool get isSupervisor => _userRole == 'Supervisor';

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
    _pageController.dispose();
    super.dispose();
  }

  // ...existing code...
  Future<void> _initializeUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Get user data using individual keys like in listOfCowsView.dart
      final userId = prefs.getInt('userId');
      final userName = prefs.getString('userName');
      final userUsername = prefs.getString('userUsername');
      final userEmail = prefs.getString('userEmail');
      final userRole = prefs.getString('userRole');
      final userToken = prefs.getString('userToken');
      final roleId = prefs.getInt('roleId');

      if (userId != null && userName != null) {
        setState(() {
          currentUser = {
            'id': userId,
            'user_id': userId,
            'name': userName,
            'username': userUsername ?? '',
            'email': userEmail ?? '',
            'role': userRole ?? 'Admin',
            'token': userToken ?? '',
            'role_id': roleId ??
                (userRole == 'Farmer' ? 3 : (userRole == 'Supervisor' ? 2 : 1)),
          };

          _userId = userId.toString();
          _userRole = userRole ?? 'Admin';
          isFarmer = currentUser?['role_id'] == 3;
        });

        await _loadAllData();
      } else {
        final userString = prefs.getString('user');
        if (userString != null) {
          setState(() {
            currentUser = jsonDecode(userString);
            _userId = currentUser!['id']?.toString() ??
                currentUser!['user_id']?.toString() ??
                '';
            _userRole = currentUser!['role'] ?? 'Admin';
            isFarmer = currentUser?['role_id'] == 3;
          });
        }
        await _loadAllData();
      }
    } catch (e) {
      _showErrorSnackBar('Error initializing user data: $e');
      await _loadAllData();
    }
  }

  Future<void> _loadAllData() async {
    if (_userId.isEmpty || _userRole.isEmpty) {
      print('User ID or Role is empty');
      return;
    }

    setState(() => _isLoading = true);

    try {
      // Jika Supervisor, gunakan 'Admin' untuk userRole saat request
      final effectiveRole = _userRole == 'Supervisor' ? 'Admin' : _userRole;
      final results = await Future.wait([
        _controller.getMilkBatchesByStatus(
          userId: _userId,
          userRole: effectiveRole,
        ),
        _controller.getExpiryAnalysis(
          userId: _userId,
          userRole: effectiveRole,
        ),
      ]);
      setState(() {
        _batchesByStatus = results[0]['data'];
        _expiryAnalysis = results[1]['data'];
        _processAllBatches();
        _applyFilters();
      });
    } catch (error) {
      _showErrorSnackBar('Error loading data: $error');
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
      hoursRemaining = -1.0;
    } else if (normalizedBatch['status'] == 'USED') {
      urgencyLevel = 'safe';
    }

    normalizedBatch['hours_until_expiry'] = hoursRemaining;
    normalizedBatch['urgency_level'] = urgencyLevel;

    // Ensure total_volume is a double
    if (normalizedBatch['total_volume'] != null) {
      final volume = normalizedBatch['total_volume'];
      normalizedBatch['total_volume'] =
          (volume is int) ? volume.toDouble() : volume;
    }

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

    // Reset to first page when filters change
    _currentPage = 1;
    _updatePagination();
  }

  void _updatePagination() {
    final totalItems = _filteredBatchesData.length;
    _totalPages = (totalItems / _itemsPerPage).ceil();
    if (_totalPages == 0) _totalPages = 1;

    // Ensure current page is valid
    if (_currentPage > _totalPages) {
      _currentPage = _totalPages;
    }

    final startIndex = (_currentPage - 1) * _itemsPerPage;
    final endIndex = (startIndex + _itemsPerPage).clamp(0, totalItems);

    setState(() {
      _paginatedData = _filteredBatchesData.sublist(
        startIndex,
        endIndex,
      );
    });
  }

  void _goToPage(int page) {
    if (page >= 1 && page <= _totalPages) {
      setState(() {
        _currentPage = page;
        _updatePagination();
      });
    }
  }

  void _changeItemsPerPage(int newItemsPerPage) {
    setState(() {
      _itemsPerPage = newItemsPerPage;
      _currentPage = 1;
      _updatePagination();
    });
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

    final hoursRemaining = batch['hours_until_expiry'];
    if (hoursRemaining == null) {
      return 'Unknown';
    }

    final double hours = (hoursRemaining is int)
        ? hoursRemaining.toDouble()
        : hoursRemaining as double;

    if (hours <= 0) {
      return 'Overdue';
    }

    if (hours < 1) {
      final minutes = (hours * 60).round();
      return '${minutes}m';
    } else if (hours < 24) {
      return '${hours.toStringAsFixed(1)}h';
    } else {
      final days = (hours / 24).round();
      return '${days}d';
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
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            // Supervisor dan Admin menampilkan teks yang sama
            isFarmer ? "My Milk Quality Controls" : "Milk Quality Controls",
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 1.2,
              shadows: [Shadow(blurRadius: 8, color: Colors.black26)],
            ),
          ),
          elevation: 8,
          // Supervisor dan Admin menggunakan warna yang sama
          backgroundColor: isFarmer
              ? Colors.teal[400]
              : isSupervisor
                  ? Colors.deepOrange[400]
                  : Colors.blueGrey[800],
          actions: [
            IconButton(
              icon: Icon(_autoRefresh ? Icons.autorenew : Icons.refresh,
                  color: Colors.white),
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
              icon: const Icon(Icons.update, color: Colors.white),
              onPressed: _updateExpiredBatches,
            ),
          ],
        ),
        body: _isLoading
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(),
                    SizedBox(height: 16),
                    Text('Loading milk expiry data...'),
                  ],
                ),
              )
            : RefreshIndicator(
                onRefresh: _loadAllData,
                child: Column(
                  children: [
                    _buildSearchBar(),
                    _buildSortingOptions(),
                    _buildPaginationControls(),
                    Expanded(
                      child: _filteredBatchesData.isEmpty
                          ? Center(
                              child: Text(isFarmer
                                  ? "No milk batches found for your managed cows."
                                  : "No milk batches found"))
                          : ListView(
                              children: [
                                _buildStatisticsCard(),
                                ..._paginatedData
                                    .asMap()
                                    .entries
                                    .map((entry) => _buildAnimatedBatchCard(
                                        entry.value, entry.key))
                                    .toList(),
                                SizedBox(height: 20),
                              ],
                            ),
                    ),
                    if (_filteredBatchesData.isNotEmpty)
                      _buildBottomPaginationControls(),
                  ],
                ),
              ),
      ),
    );
  }
// ...existing code...
// ...existing code...

  Widget _buildPaginationControls() {
    if (_filteredBatchesData.isEmpty) return SizedBox.shrink();

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Flexible(
                flex: 2,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(
                      child: Text(
                        'Items per page:',
                        style: TextStyle(
                            fontSize: 14, fontWeight: FontWeight.w500),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    SizedBox(width: 8),
                    Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey[300]!),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<int>(
                          value: _itemsPerPage,
                          isDense: true,
                          items: [5, 10, 15, 20, 25].map((int value) {
                            return DropdownMenuItem<int>(
                              value: value,
                              child: Text(value.toString()),
                            );
                          }).toList(),
                          onChanged: (int? newValue) {
                            if (newValue != null) {
                              _changeItemsPerPage(newValue);
                            }
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(width: 8),
              Flexible(
                flex: 3,
                child: Text(
                  'Showing ${(_currentPage - 1) * _itemsPerPage + 1}-${(_currentPage * _itemsPerPage).clamp(0, _filteredBatchesData.length)} of ${_filteredBatchesData.length}',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                  textAlign: TextAlign.end,
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBottomPaginationControls() {
    return Container(
      padding: EdgeInsets.all(16),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Previous button
            IconButton(
              onPressed:
                  _currentPage > 1 ? () => _goToPage(_currentPage - 1) : null,
              icon: Icon(Icons.chevron_left, size: 20),
              style: IconButton.styleFrom(
                backgroundColor:
                    _currentPage > 1 ? Colors.blue[50] : Colors.grey[100],
                foregroundColor: _currentPage > 1 ? Colors.blue : Colors.grey,
                minimumSize: Size(36, 36),
                maximumSize: Size(36, 36),
              ),
            ),

            SizedBox(width: 8),

            // Page numbers
            ..._buildPageNumbers(),

            SizedBox(width: 8),

            // Next button
            IconButton(
              onPressed: _currentPage < _totalPages
                  ? () => _goToPage(_currentPage + 1)
                  : null,
              icon: Icon(Icons.chevron_right, size: 20),
              style: IconButton.styleFrom(
                backgroundColor: _currentPage < _totalPages
                    ? Colors.blue[50]
                    : Colors.grey[100],
                foregroundColor:
                    _currentPage < _totalPages ? Colors.blue : Colors.grey,
                minimumSize: Size(36, 36),
                maximumSize: Size(36, 36),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildPageNumbers() {
    List<Widget> pageNumbers = [];
    int startPage = (_currentPage - 2).clamp(1, _totalPages);
    int endPage = (_currentPage + 2).clamp(1, _totalPages);

    // Show first page if not in range
    if (startPage > 1) {
      pageNumbers.add(_buildPageButton(1));
      if (startPage > 2) {
        pageNumbers.add(Padding(
          padding: EdgeInsets.symmetric(horizontal: 4),
          child:
              Text('...', style: TextStyle(color: Colors.grey, fontSize: 12)),
        ));
      }
    }

    // Show page range
    for (int i = startPage; i <= endPage; i++) {
      pageNumbers.add(_buildPageButton(i));
    }

    // Show last page if not in range
    if (endPage < _totalPages) {
      if (endPage < _totalPages - 1) {
        pageNumbers.add(Padding(
          padding: EdgeInsets.symmetric(horizontal: 4),
          child:
              Text('...', style: TextStyle(color: Colors.grey, fontSize: 12)),
        ));
      }
      pageNumbers.add(_buildPageButton(_totalPages));
    }

    return pageNumbers;
  }

  Widget _buildPageButton(int pageNumber) {
    bool isCurrentPage = pageNumber == _currentPage;
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 2),
      child: Material(
        color: isCurrentPage ? Colors.blue : Colors.grey[100],
        borderRadius: BorderRadius.circular(6),
        child: InkWell(
          borderRadius: BorderRadius.circular(6),
          onTap: () => _goToPage(pageNumber),
          child: Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            child: Text(
              pageNumber.toString(),
              style: TextStyle(
                color: isCurrentPage ? Colors.white : Colors.black87,
                fontWeight: isCurrentPage ? FontWeight.bold : FontWeight.normal,
                fontSize: 12,
              ),
            ),
          ),
        ),
      ),
    );
  }

// ...existing code...
// ...existing code...

  Widget _buildAnimatedBatchCard(Map<String, dynamic> batch, int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 400 + index * 60),
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 30 * (1 - value)),
            child: child,
          ),
        );
      },
      child: _buildBatchCard(batch),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        controller: _searchController,
        decoration: InputDecoration(
          hintText: 'Search milk batches...',
          prefixIcon: Icon(Icons.search),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          filled: true,
          fillColor: Colors.grey[100],
          contentPadding: EdgeInsets.symmetric(vertical: 0),
          suffixIcon: _searchTerm.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {
                      _searchTerm = '';
                      _applyFilters();
                    });
                  },
                )
              : null,
        ),
        onChanged: (value) {
          setState(() {
            _searchTerm = value;
            _applyFilters();
          });
        },
      ),
    );
  }

  Widget _buildSortingOptions() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Text(
            'Filter by:',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.blueGrey[800],
              fontSize: 15,
              letterSpacing: 0.5,
            ),
          ),
          SizedBox(width: 8),
          ...['FRESH', 'EXPIRED', 'USED'].map((status) {
            bool selected = _statusFilter == status;
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ChoiceChip(
                label: Text(
                  status.toLowerCase().replaceRange(0, 1, status[0]),
                  style: TextStyle(
                    color: selected ? Colors.white : Colors.blueGrey[800],
                    fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                    letterSpacing: 0.5,
                  ),
                ),
                selected: selected,
                selectedColor: Colors.teal[400],
                backgroundColor: Colors.blueGrey[50],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: selected ? Colors.teal : Colors.blueGrey[100]!,
                    width: selected ? 2 : 1,
                  ),
                ),
                elevation: selected ? 4 : 0,
                shadowColor: Colors.teal.withOpacity(0.2),
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      _statusFilter = status;
                      _applyFilters();
                    });
                  }
                },
              ),
            );
          }).toList(),
          Padding(
            padding: const EdgeInsets.only(right: 8.0),
            child: ChoiceChip(
              label: Text(
                'All',
                style: TextStyle(
                  color: _statusFilter == 'all'
                      ? Colors.white
                      : Colors.blueGrey[800],
                  fontWeight: _statusFilter == 'all'
                      ? FontWeight.bold
                      : FontWeight.normal,
                  letterSpacing: 0.5,
                ),
              ),
              selected: _statusFilter == 'all',
              selectedColor: Colors.teal[400],
              backgroundColor: Colors.blueGrey[50],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(
                  color: _statusFilter == 'all'
                      ? Colors.teal
                      : Colors.blueGrey[100]!,
                  width: _statusFilter == 'all' ? 2 : 1,
                ),
              ),
              elevation: _statusFilter == 'all' ? 4 : 0,
              shadowColor: Colors.teal.withOpacity(0.2),
              onSelected: (selected) {
                if (selected) {
                  setState(() {
                    _statusFilter = 'all';
                    _applyFilters();
                  });
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  // ...existing code...

  Widget _buildBatchCard(Map<String, dynamic> batch) {
    final urgencyColor = urgencyColors[batch['urgency_level']] ?? Colors.grey;
    final statusColor = statusColors[batch['status']] ?? Colors.grey;

    return Card(
      elevation: 4,
      margin: EdgeInsets.symmetric(vertical: 6, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ExpansionTile(
        leading: CircleAvatar(
          radius: 22,
          backgroundColor: urgencyColor.withOpacity(0.15),
          child: Icon(Icons.water_drop, color: urgencyColor, size: 24),
        ),
        title: Text(
          batch['batch_number'] ?? 'N/A',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        subtitle: Text(
          "${batch['total_volume'] ?? 0}L • ${batch['status'] ?? 'UNKNOWN'}",
          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
        ),
        trailing: Container(
          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: urgencyColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
            border:
                Border.all(color: urgencyColor.withOpacity(0.3), width: 0.5),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.schedule, size: 12, color: urgencyColor),
              SizedBox(width: 2),
              Text(
                _formatTimeRemaining(batch),
                style: TextStyle(
                  color: urgencyColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 10,
                ),
              ),
            ],
          ),
        ),
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Column(
              children: [
                _buildCompactInfoRow(
                    'Volume', '${batch['total_volume'] ?? 0}L'),
                _buildCompactInfoRow('Status', batch['status'] ?? 'UNKNOWN'),
                _buildCompactInfoRow(
                    'Urgency', batch['urgency_level'] ?? 'unknown'),
                if (batch['production_date'] != null)
                  _buildCompactInfoRow(
                    'Produced',
                    DateFormat('dd/MM/yy HH:mm')
                        .format(DateTime.parse(batch['production_date'])),
                  ),
                if (batch['expiry_date'] != null)
                  _buildCompactInfoRow(
                    'Expires',
                    DateFormat('dd/MM/yy HH:mm')
                        .format(DateTime.parse(batch['expiry_date'])),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactInfoRow(String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          SizedBox(
            width: 70,
            child: Text(
              '$label:',
              style: TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 12,
                color: Colors.grey[700],
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey[800],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ...existing code...
  Widget _buildBatchInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          SizedBox(width: 8),
          Text('$label:', style: TextStyle(fontWeight: FontWeight.w500)),
          SizedBox(width: 8),
          Expanded(
            child: Text(value, style: TextStyle(color: Colors.grey[800])),
          ),
        ],
      ),
    );
  }

  Widget _buildStatisticsCard() {
    if (_batchesByStatus == null) return const SizedBox.shrink();

    final summary = _batchesByStatus!['summary'] ?? {};
    int freshCount = summary['fresh_count'] ?? 0;
    int expiredCount = summary['expired_count'] ?? 0;
    int usedCount = summary['used_count'] ?? 0;
    int totalCount = freshCount + expiredCount + usedCount;

    double freshPercent = totalCount == 0 ? 0 : (freshCount / totalCount) * 100;
    double expiredPercent =
        totalCount == 0 ? 0 : (expiredCount / totalCount) * 100;
    double usedPercent = totalCount == 0 ? 0 : (usedCount / totalCount) * 100;

    return Card(
      margin: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.bar_chart, color: Colors.blueGrey, size: 28),
                SizedBox(width: 10),
                Text(
                  // Supervisor dan Admin menampilkan teks yang sama
                  isFarmer
                      ? 'My Milk Batch Statistics'
                      : 'Milk Batch Statistics',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 18),
            _buildStatusStatistics(freshCount, freshPercent, expiredCount,
                expiredPercent, usedCount, usedPercent),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusStatistics(
      int freshCount,
      double freshPercent,
      int expiredCount,
      double expiredPercent,
      int usedCount,
      double usedPercent) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Status Distribution',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        SizedBox(height: 10),
        Column(
          children: [
            _buildStatusRow('Fresh', freshCount, freshPercent, Colors.green),
            SizedBox(height: 8),
            _buildStatusRow(
                'Expired', expiredCount, expiredPercent, Colors.red),
            SizedBox(height: 8),
            _buildStatusRow('Used', usedCount, usedPercent, Colors.grey),
          ],
        ),
      ],
    );
  }

  Widget _buildStatusRow(String label, int count, double percent, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.circle, color: color, size: 12),
            SizedBox(width: 6),
            Text(
              '$label: $count (${percent.toStringAsFixed(1)}%)',
              style: TextStyle(fontWeight: FontWeight.w500, fontSize: 12),
            ),
          ],
        ),
        SizedBox(height: 4),
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: LinearProgressIndicator(
            value: percent / 100,
            backgroundColor: color.withOpacity(0.2),
            color: color,
            minHeight: 8,
          ),
        ),
      ],
    );
  }
}

class _ChartData {
  final String name;
  final int value;
  final Color color;

  _ChartData(this.name, this.value, this.color);
}
