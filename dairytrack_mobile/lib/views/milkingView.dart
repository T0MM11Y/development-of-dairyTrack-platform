import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dairytrack_mobile/controller/APIURL1/milkingSessionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/usersManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'dart:io';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';

class MilkingView extends StatefulWidget {
  @override
  _MilkingViewState createState() => _MilkingViewState();
}

class _MilkingViewState extends State<MilkingView> {
  // Controllers
  final MilkingSessionController milkingSessionController =
      MilkingSessionController();
  final CowManagementController cowManagementController =
      CowManagementController();
  final UsersManagementController usersManagementController =
      UsersManagementController();
  final CattleDistributionController cattleDistributionController =
      CattleDistributionController();

  // Data variables
  Map<String, dynamic>? currentUser;
  List<dynamic> sessions = [];
  List<dynamic> cowList = [];
  List<dynamic> userManagedCows = [];
  List<dynamic> milkers = [];
  List<dynamic> availableFarmersForCow = [];
  bool isActionLoading = false;

  bool loading = true;
  bool loadingFarmers = false;
  bool isModalActionLoading = false;

  String? error;

  // Search and filter variables
  String searchTerm = '';
  String selectedCow = '';
  String selectedMilker = '';
  String selectedDate = '';
  int currentPage = 1;
  final int sessionsPerPage = 10;

  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final _editFormKey = GlobalKey<FormState>();
  final ScrollController _scrollController = ScrollController();

  // Text controllers for forms
  final TextEditingController _volumeController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _editVolumeController = TextEditingController();
  final TextEditingController _editNotesController = TextEditingController();

  // ADD THESE NEW CONTROLLERS
  final TextEditingController _dateController = TextEditingController();
  final TextEditingController _timeController = TextEditingController();
  final TextEditingController _editDateController = TextEditingController();
  final TextEditingController _editTimeController = TextEditingController();

  // Add session form state
  Map<String, dynamic> newSession = {
    'cow_id': '',
    'milker_id': '',
    'volume': '',
    'milking_time': '',
    'notes': '',
  };

  // Edit session form state
  Map<String, dynamic>? selectedSession;
  bool isEditing = false;

  // ADD STREAM CONTROLLERS
  final StreamController<List<dynamic>> _farmersStreamController =
      StreamController<List<dynamic>>.broadcast();
  final StreamController<bool> _loadingStreamController =
      StreamController<bool>.broadcast();

  Stream<List<dynamic>> get _farmersStream => _farmersStreamController.stream;
  Stream<bool> get _loadingStream => _loadingStreamController.stream;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _volumeController.dispose();
    _notesController.dispose();
    _editVolumeController.dispose();
    _editNotesController.dispose();
    _dateController.dispose();
    _timeController.dispose();
    _editDateController.dispose();
    _editTimeController.dispose();
// DISPOSE STREAM CONTROLLERS
    _farmersStreamController.close();
    _loadingStreamController.close();

    super.dispose();
  }

  // Initialize data
  Future<void> _initializeData() async {
    await _getCurrentUser();
    await _fetchData();
  }

  // Get current user from shared preferences
  Future<void> _getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');
      final userName = prefs.getString('userName');
      final userUsername = prefs.getString('userUsername');
      final userEmail = prefs.getString('userEmail');
      final userRole = prefs.getString('userRole');
      final userToken = prefs.getString('userToken');

      if (userId != null) {
        setState(() {
          currentUser = {
            'id': userId,
            'user_id': userId,
            'name': userName ?? '',
            'username': userUsername ?? '',
            'email': userEmail ?? '',
            'role': userRole ?? 'Farmer',
            'role_id': userRole == 'Admin'
                ? 1
                : userRole == 'Supervisor'
                    ? 2
                    : 3,
            'token': userToken ?? '',
          };
        });
      }
    } catch (e) {
      print('Error getting current user: $e');
    }
  }

  // Fetch all data
  Future<void> _fetchData() async {
    setState(() {
      loading = true;
      error = null;
    });

    try {
      await Future.wait([
        _fetchMilkingSessions(),
        _fetchCows(),
        _fetchUserManagedCows(),
        if (currentUser?['role_id'] == 1) _fetchFarmers(),
      ]);
    } catch (e) {
      setState(() {
        error = e.toString();
      });
    } finally {
      setState(() {
        loading = false;
      });
    }
  }

  // Fetch milking sessions
  Future<void> _fetchMilkingSessions() async {
    try {
      final result = await milkingSessionController.getMilkingSessions();
      setState(() {
        sessions = result ?? [];
      });
    } catch (e) {
      print('Error fetching milking sessions: $e');
      setState(() {
        sessions = [];
      });
    }
  }

  // Fetch all cows
  Future<void> _fetchCows() async {
    try {
      final result = await cowManagementController.listCows();
      setState(() {
        cowList = result ?? [];
      });
    } catch (e) {
      print('Error fetching cows: $e');
      setState(() {
        cowList = [];
      });
    }
  }

  // Fetch user managed cows
  Future<void> _fetchUserManagedCows() async {
    if (currentUser == null || currentUser!['role_id'] == 1) return;

    try {
      final userId = currentUser!['id'] ?? currentUser!['user_id'];
      final result = await cattleDistributionController.listCowsByUser(userId);

      if (result['success'] == true) {
        final data = result['data'] as Map<String, dynamic>? ?? {};
        final cowsData = data['cows'] as List<dynamic>? ?? [];
        setState(() {
          userManagedCows = cowsData;
        });
      }
    } catch (e) {
      print('Error fetching user managed cows: $e');
      setState(() {
        userManagedCows = [];
      });
    }
  }

  // Fetch farmers (for admin only)
  Future<void> _fetchFarmers() async {
    try {
      final result = await usersManagementController.listUsers();
      setState(() {
        milkers = (result ?? [])
            .where((user) => user.roleId?.toString() == '3') // Farmer role
            .toList();
      });
    } catch (e) {
      print('Error fetching farmers: $e');
      setState(() {
        milkers = [];
      });
    }
  }

  Future<void> _fetchFarmersForCow(String cowId) async {
    print('DEBUG: _fetchFarmersForCow called with cowId: $cowId');

    if (currentUser?['role_id'] != 1 || cowId.isEmpty) {
      print('DEBUG: Not admin or cowId empty, resetting farmers list');
      _farmersStreamController.add([]);
      _loadingStreamController.add(false);
      return;
    }

    print('DEBUG: Starting to fetch farmers for cow $cowId');

    try {
      final result =
          await cattleDistributionController.getFarmersForCow(int.parse(cowId));

      print('DEBUG: API result: $result');
      print('DEBUG: Farmers data: ${result['farmers']}');

      if (result['success'] == true) {
        final farmers = result['farmers'] as List<dynamic>? ?? [];
        print('DEBUG: Setting ${farmers.length} farmers for cow $cowId');

        // Update streams
        _farmersStreamController.add(farmers);
        _loadingStreamController.add(false);

        // Also update state for backward compatibility
        if (mounted) {
          setState(() {
            availableFarmersForCow = farmers;
            loadingFarmers = false;
          });
        }

        print('DEBUG: Streams updated - farmersCount: ${farmers.length}');
      } else {
        print('DEBUG: API returned error: ${result['message']}');
        _farmersStreamController.add([]);
        _loadingStreamController.add(false);
      }
    } catch (e) {
      print('DEBUG: Exception occurred: $e');
      _farmersStreamController.add([]);
      _loadingStreamController.add(false);
    }

    print('DEBUG: _fetchFarmersForCow completed for cowId: $cowId');
  }

  // Get local date string
  String _getLocalDateString([DateTime? date]) {
    final targetDate = date ?? DateTime.now();
    return DateFormat('yyyy-MM-dd').format(targetDate);
  }

  // Get session local date
  String _getSessionLocalDate(String timestamp) {
    try {
      final date = DateTime.parse(timestamp);
      return _getLocalDateString(date);
    } catch (e) {
      return '';
    }
  }

  // Calculate milk statistics
  Map<String, dynamic> get _milkStats {
    final today = _getLocalDateString();

    // Filter sessions based on user role
    List<dynamic> baseSessions = sessions;
    if (currentUser?['role_id'] != 1 && userManagedCows.isNotEmpty) {
      final managedCowIds =
          userManagedCows.map((cow) => cow['id'] ?? cow.id).toSet();
      baseSessions = sessions
          .where((session) => managedCowIds.contains(session['cow_id']))
          .toList();
    }

    // Apply current filters
    List<dynamic> filteredSessions = baseSessions.where((session) {
      bool matchesSearch = true;
      bool matchesCow =
          selectedCow.isEmpty || session['cow_id'].toString() == selectedCow;
      bool matchesMilker = selectedMilker.isEmpty ||
          session['milker_id'].toString() == selectedMilker;
      bool matchesDate = selectedDate.isEmpty ||
          _getSessionLocalDate(session['milking_time']) == selectedDate;

      if (searchTerm.isNotEmpty) {
        final searchLower = searchTerm.toLowerCase();
        matchesSearch = session['cow_name']
                    ?.toString()
                    .toLowerCase()
                    .contains(searchLower) ==
                true ||
            session['milker_name']
                    ?.toString()
                    .toLowerCase()
                    .contains(searchLower) ==
                true ||
            session['volume']?.toString().contains(searchTerm) == true ||
            session['notes']?.toString().toLowerCase().contains(searchLower) ==
                true ||
            _getSessionLocalDate(session['milking_time']).contains(searchTerm);
      }

      return matchesSearch && matchesCow && matchesMilker && matchesDate;
    }).toList();

    // Calculate statistics
    final totalVolume = filteredSessions.fold<double>(
        0.0,
        (sum, session) =>
            sum + (double.tryParse(session['volume']?.toString() ?? '0') ?? 0));
    final totalSessions = filteredSessions.length;

    final todaySessions = filteredSessions
        .where(
            (session) => _getSessionLocalDate(session['milking_time']) == today)
        .toList();
    final todayVolume = todaySessions.fold<double>(
        0.0,
        (sum, session) =>
            sum + (double.tryParse(session['volume']?.toString() ?? '0') ?? 0));

    // Base statistics (unfiltered)
    final baseTotalVolume = baseSessions.fold<double>(
        0.0,
        (sum, session) =>
            sum + (double.tryParse(session['volume']?.toString() ?? '0') ?? 0));
    final baseTotalSessions = baseSessions.length;
    final baseTodaySessions = baseSessions
        .where(
            (session) => _getSessionLocalDate(session['milking_time']) == today)
        .toList();
    final baseTodayVolume = baseTodaySessions.fold<double>(
        0.0,
        (sum, session) =>
            sum + (double.tryParse(session['volume']?.toString() ?? '0') ?? 0));

    final hasActiveFilters = searchTerm.isNotEmpty ||
        selectedCow.isNotEmpty ||
        selectedMilker.isNotEmpty ||
        selectedDate.isNotEmpty;

    return {
      'totalVolume': totalVolume.toStringAsFixed(2),
      'totalSessions': totalSessions,
      'todayVolume': todayVolume.toStringAsFixed(2),
      'todaySessions': todaySessions.length,
      'avgVolumePerSession': totalSessions > 0
          ? (totalVolume / totalSessions).toStringAsFixed(2)
          : '0.00',
      'baseTotalVolume': baseTotalVolume.toStringAsFixed(2),
      'baseTotalSessions': baseTotalSessions,
      'baseTodayVolume': baseTodayVolume.toStringAsFixed(2),
      'baseTodaySessions': baseTodaySessions.length,
      'baseAvgVolumePerSession': baseTotalSessions > 0
          ? (baseTotalVolume / baseTotalSessions).toStringAsFixed(2)
          : '0.00',
      'hasActiveFilters': hasActiveFilters,
    };
  }

  // Get filtered and paginated sessions
  Map<String, dynamic> get _filteredAndPaginatedSessions {
    // Filter sessions based on user role
    List<dynamic> filteredSessions = sessions;
    if (currentUser?['role_id'] != 1 && userManagedCows.isNotEmpty) {
      final managedCowIds =
          userManagedCows.map((cow) => cow['id'] ?? cow.id).toSet();
      filteredSessions = sessions
          .where((session) => managedCowIds.contains(session['cow_id']))
          .toList();
    }

    // Apply search and filters
    filteredSessions = filteredSessions.where((session) {
      bool matchesSearch = true;
      bool matchesCow =
          selectedCow.isEmpty || session['cow_id'].toString() == selectedCow;
      bool matchesMilker = selectedMilker.isEmpty ||
          session['milker_id'].toString() == selectedMilker;
      bool matchesDate = selectedDate.isEmpty ||
          _getSessionLocalDate(session['milking_time']) == selectedDate;

      if (searchTerm.isNotEmpty) {
        final searchLower = searchTerm.toLowerCase();
        matchesSearch = session['cow_name']
                    ?.toString()
                    .toLowerCase()
                    .contains(searchLower) ==
                true ||
            session['milker_name']
                    ?.toString()
                    .toLowerCase()
                    .contains(searchLower) ==
                true ||
            session['volume']?.toString().contains(searchTerm) == true ||
            session['notes']?.toString().toLowerCase().contains(searchLower) ==
                true ||
            _getSessionLocalDate(session['milking_time']).contains(searchTerm);
      }

      return matchesSearch && matchesCow && matchesMilker && matchesDate;
    }).toList();

    // Sort by milking time (most recent first)
    filteredSessions.sort((a, b) => DateTime.parse(b['milking_time'])
        .compareTo(DateTime.parse(a['milking_time'])));

    // Calculate pagination
    final totalItems = filteredSessions.length;
    final totalPages = (totalItems / sessionsPerPage).ceil();
    final startIndex = (currentPage - 1) * sessionsPerPage;
    final endIndex = (startIndex + sessionsPerPage).clamp(0, totalItems);
    final currentSessions = filteredSessions.sublist(startIndex, endIndex);

    return {
      'filteredSessions': filteredSessions,
      'currentSessions': currentSessions,
      'totalItems': totalItems,
      'totalPages': totalPages,
    };
  }

  // Get unique cows and milkers for filters
  Map<String, List<Map<String, dynamic>>> get _uniqueOptions {
    final uniqueCows = <String, Map<String, dynamic>>{};
    final uniqueMilkers = <String, Map<String, dynamic>>{};

    // Filter sessions based on user role first
    List<dynamic> filteredSessions = sessions;
    if (currentUser?['role_id'] != 1 && userManagedCows.isNotEmpty) {
      final managedCowIds =
          userManagedCows.map((cow) => cow['id'] ?? cow.id).toSet();
      filteredSessions = sessions
          .where((session) => managedCowIds.contains(session['cow_id']))
          .toList();
    }

    for (final session in filteredSessions) {
      final cowId = session['cow_id']?.toString();
      final milkerId = session['milker_id']?.toString();

      if (cowId != null && !uniqueCows.containsKey(cowId)) {
        uniqueCows[cowId] = {
          'id': cowId,
          'name': session['cow_name'] ?? 'Cow #$cowId',
        };
      }

      if (milkerId != null && !uniqueMilkers.containsKey(milkerId)) {
        uniqueMilkers[milkerId] = {
          'id': milkerId,
          'name': session['milker_name'] ?? 'Milker #$milkerId',
        };
      }
    }

    return {
      'cows': uniqueCows.values.toList(),
      'milkers': uniqueMilkers.values.toList(),
    };
  }

  // Get milking time label with badge
  Widget _getMilkingTimeLabel(String timeStr) {
    final date = DateTime.parse(timeStr);
    final hours = date.hour;
    final timeLabel = DateFormat('HH:mm').format(date);

    Color badgeColor;
    String periodLabel;
    IconData icon;

    if (hours < 12) {
      badgeColor = Colors.orange;
      periodLabel = 'Pagi';
      icon = Icons.wb_sunny;
    } else if (hours < 18) {
      badgeColor = Colors.blue;
      periodLabel = 'Siang';
      icon = Icons.wb_cloudy;
    } else {
      badgeColor = Colors.indigo;
      periodLabel = 'Sore';
      icon = Icons.nights_stay;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          timeLabel,
          style: TextStyle(
            fontFamily: 'monospace',
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
        SizedBox(width: 4),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
            color: badgeColor,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 10, color: Colors.white),
              SizedBox(width: 2),
              Text(
                periodLabel,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 8,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _handleCowSelectionInAdd(String cowId) {
    print('DEBUG: _handleCowSelectionInAdd called with cowId: $cowId');

    setState(() {
      newSession['cow_id'] = cowId;
      newSession['milker_id'] = ''; // Reset milker_id
    });

    // Reset streams
    _farmersStreamController.add([]);
    _loadingStreamController.add(false);

    // Hanya fetch farmers jika cowId valid dan user adalah admin
    if (currentUser?['role_id'] == 1 && cowId.isNotEmpty && cowId != '') {
      print('DEBUG: Setting loadingFarmers to true for cowId: $cowId');
      _loadingStreamController.add(true);
      _fetchFarmersForCow(cowId);
    } else {
      print('DEBUG: Not fetching farmers - not admin or empty cowId');
    }
  }

  void _handleCowSelectionInEdit(String cowId) {
    setState(() {
      selectedSession!['cow_id'] = cowId;
      selectedSession!['milker_id'] = ''; // Reset milker_id
    });

    // Reset streams
    _farmersStreamController.add([]);
    _loadingStreamController.add(false);

    // Hanya fetch farmers jika cowId valid dan user adalah admin
    if (currentUser?['role_id'] == 1 && cowId.isNotEmpty && cowId != '') {
      _loadingStreamController.add(true);
      _fetchFarmersForCow(cowId);
    }
  }

  // Open add modal
  void _openAddModal() {
    final userId = currentUser?['id']?.toString() ??
        currentUser?['user_id']?.toString() ??
        '';
    final milkerId = currentUser?['role_id'] == 1 ? '' : userId;

    final now = DateTime.now();
    final dateString = DateFormat('yyyy-MM-dd').format(now);
    final timeString = DateFormat('HH:mm').format(now);

    setState(() {
      newSession = {
        'cow_id': '',
        'milker_id': milkerId,
        'volume': '',
        'milking_time': '${dateString}T$timeString',
        'notes': '',
      };
    });

    // Reset controllers
    _volumeController.clear();
    _notesController.clear();
    _dateController.text = dateString;
    _timeController.text = timeString;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildAddSessionModal(),
    );
  }

  // Open edit modal
  void _openEditModal(dynamic session) {
    final localMilkingTime = DateTime.parse(session['milking_time']);
    final dateString = DateFormat('yyyy-MM-dd').format(localMilkingTime);
    final timeString = DateFormat('HH:mm').format(localMilkingTime);

    setState(() {
      selectedSession = Map<String, dynamic>.from(session);
      selectedSession!['cow_id'] = session['cow_id'].toString();
      selectedSession!['milking_time'] = '${dateString}T$timeString';
      // Reset farmers list and loading state
      availableFarmersForCow = [];
      loadingFarmers = false;
    });

    // Set controller values
    _editVolumeController.text = selectedSession!['volume'].toString();
    _editNotesController.text = selectedSession!['notes']?.toString() ?? '';
    _editDateController.text = dateString;
    _editTimeController.text = timeString;

    // Fetch farmers for the selected cow if admin
    if (currentUser?['role_id'] == 1 && selectedSession!['cow_id'].isNotEmpty) {
      setState(() {
        loadingFarmers = true;
      });
      _fetchFarmersForCow(selectedSession!['cow_id']);
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildEditSessionModal(),
    );
  }

// Ubah _handleAddSession
  Future<void> _handleAddSession() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      isActionLoading = true;
      isModalActionLoading = true; // Disable seluruh modal
    });

    final userId = currentUser?['id']?.toString() ??
        currentUser?['user_id']?.toString() ??
        '';
    String finalMilkerId = newSession['milker_id'];

    // Validation for milker_id
    if (currentUser?['role_id'] == 1 && finalMilkerId.isEmpty) {
      setState(() {
        isActionLoading = false;
        isModalActionLoading = false;
      });
      _showErrorDialog('Silakan pilih pemerah');
      return;
    }

    if (currentUser?['role_id'] != 1 && finalMilkerId.isEmpty) {
      finalMilkerId = userId;
    }

    if (finalMilkerId.isEmpty) {
      setState(() {
        isActionLoading = false;
        isModalActionLoading = false;
      });
      _showErrorDialog('ID pemerah tidak valid');
      return;
    }

    // Create session data
    final creatorInfo =
        'Created by: ${currentUser?['name'] ?? currentUser?['username']} (Role: ${currentUser?['role_id'] == 1 ? 'Admin' : currentUser?['role_id'] == 2 ? 'Supervisor' : 'Farmer'}, ID: $userId)';
    final sessionData = {
      'cow_id': int.parse(newSession['cow_id']),
      'milker_id': int.parse(finalMilkerId),
      'volume': double.parse(newSession['volume']),
      'milking_time': newSession['milking_time'],
      'notes': newSession['notes'].isNotEmpty
          ? '${newSession['notes']}\n\n$creatorInfo'
          : creatorInfo,
    };

    try {
      final response =
          await milkingSessionController.addMilkingSession(sessionData);
      if (response['success'] == true) {
        Navigator.pop(context);
        _showSuccessDialog('Sesi pemerahan berhasil ditambahkan');
        await _fetchData();
      } else {
        _showErrorDialog(
            response['message'] ?? 'Gagal menambahkan sesi pemerahan');
      }
    } catch (e) {
      _showErrorDialog('Terjadi kesalahan: $e');
    } finally {
      setState(() {
        isActionLoading = false;
        isModalActionLoading = false;
      });
    }
  }

  // Ubah _handleEditSession
  Future<void> _handleEditSession() async {
    if (!_editFormKey.currentState!.validate()) return;

    setState(() {
      isActionLoading = true;
      isModalActionLoading = true; // Disable seluruh modal
    });

    final sessionData = {
      'cow_id': int.parse(selectedSession!['cow_id']),
      'milker_id': int.parse(selectedSession!['milker_id'].toString()),
      'volume': double.parse(_editVolumeController.text),
      'milking_time': selectedSession!['milking_time'],
      'notes': _editNotesController.text,
    };

    try {
      final response = await milkingSessionController.updateMilkingSession(
        selectedSession!['id'],
        sessionData,
      );

      if (response['success'] == true) {
        Navigator.pop(context);
        _showSuccessDialog('Sesi pemerahan berhasil diperbarui');
        await _fetchData();
      } else {
        _showErrorDialog(
            response['message'] ?? 'Gagal memperbarui sesi pemerahan');
      }
    } catch (e) {
      _showErrorDialog('Terjadi kesalahan: $e');
    } finally {
      setState(() {
        isActionLoading = false;
        isModalActionLoading = false;
      });
    }
  }

  // Delete session
  Future<void> _handleDeleteSession(int sessionId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF23272F), // Dark background
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
            SizedBox(width: 8),
            Text(
              'Konfirmasi Hapus',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.red[300], // Lighter red for dark bg
              ),
            ),
          ],
        ),
        content: Text(
          'Apakah Anda yakin ingin menghapus sesi pemerahan ini? Tindakan ini tidak dapat dibatalkan.',
          style: TextStyle(
            fontSize: 14,
            color: Colors.white, // White text for dark bg
          ),
        ),
        actions: [
          TextButton(
            onPressed:
                isActionLoading ? null : () => Navigator.pop(context, false),
            child: Text(
              'Batal',
              style: TextStyle(
                color: Color(0xFF3D90D7),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          ElevatedButton.icon(
            onPressed:
                isActionLoading ? null : () => Navigator.pop(context, true),
            icon: Icon(Icons.delete, size: 16, color: Colors.white),
            label: Text(
              'Hapus',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red[700],
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      setState(() {
        isActionLoading = true;
      });
      try {
        final response =
            await milkingSessionController.deleteMilkingSession(sessionId);
        if (response['success'] == true) {
          _showSuccessDialog('Sesi pemerahan berhasil dihapus');
          await _fetchData();
        } else {
          _showErrorDialog(
              response['message'] ?? 'Gagal menghapus sesi pemerahan');
        }
      } catch (e) {
        _showErrorDialog('Terjadi kesalahan: $e');
      } finally {
        setState(() {
          isActionLoading = false;
        });
      }
    }
  }

  // Export to PDF
  Future<void> _exportToPDF() async {
    try {
      final response =
          await milkingSessionController.exportMilkingSessionsToPDF();
      if (response['success'] == true) {
        final bytes = response['data'];
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/milking_sessions.pdf';
        final file = File(filePath);
        await file.writeAsBytes(bytes);
        OpenFile.open(filePath);
      } else {
        _showErrorDialog(response['message'] ?? 'Gagal mengekspor ke PDF');
      }
    } catch (e) {
      _showErrorDialog('Terjadi kesalahan: $e');
    }
  }

  // Export to Excel
  Future<void> _exportToExcel() async {
    try {
      final response =
          await milkingSessionController.exportMilkingSessionsToExcel();
      if (response['success'] == true) {
        final bytes = response['data'];
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/milking_sessions.xlsx';
        final file = File(filePath);
        await file.writeAsBytes(bytes);
        OpenFile.open(filePath);
      } else {
        _showErrorDialog(response['message'] ?? 'Gagal mengekspor ke Excel');
      }
    } catch (e) {
      _showErrorDialog('Terjadi kesalahan: $e');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF23272F), // Dark background
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.red[900]!.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              padding: EdgeInsets.all(8),
              child:
                  Icon(Icons.error_outline, color: Colors.red[300], size: 28),
            ),
            SizedBox(width: 10),
            Text(
              'Terjadi Kesalahan',
              style: TextStyle(
                color: Colors.red[200],
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        content: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.info, color: Colors.red[200], size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  height: 1.5,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.close, color: Colors.blue[200]),
            label: Text('Tutup',
                style: TextStyle(
                    color: Colors.blue[200], fontWeight: FontWeight.bold)),
            style: TextButton.styleFrom(
              foregroundColor: Colors.blue[200],
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF23272F), // Dark background
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.green[900]!.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              padding: EdgeInsets.all(8),
              child: Icon(Icons.check_circle_outline,
                  color: Colors.greenAccent[200], size: 28),
            ),
            SizedBox(width: 10),
            Text(
              'Berhasil!',
              style: TextStyle(
                color: Colors.greenAccent[200],
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        content: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.info_outline, color: Colors.greenAccent[100], size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  height: 1.5,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.check, color: Colors.blue[200]),
            label: Text('OK',
                style: TextStyle(
                    color: Colors.blue[200], fontWeight: FontWeight.bold)),
            style: TextButton.styleFrom(
              foregroundColor: Colors.blue[200],
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  // Clear all filters
  void _clearAllFilters() {
    setState(() {
      searchTerm = '';
      selectedCow = '';
      selectedMilker = '';
      selectedDate = '';
      currentPage = 1;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Milking Management'),
          backgroundColor: Color(0xFF3D90D7),
          foregroundColor: Colors.white,
        ),
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(
          title: Text('Milking Management'),
          backgroundColor: Color(0xFF3D90D7),
          foregroundColor: Colors.white,
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.error, size: 64, color: Colors.red),
              SizedBox(height: 16),
              Text('Error: $error'),
              SizedBox(height: 16),
              ElevatedButton(
                onPressed: _fetchData,
                child: Text('Coba Lagi'),
              ),
            ],
          ),
        ),
      );
    }

    final milkStats = _milkStats;
    final paginatedData = _filteredAndPaginatedSessions;
    final uniqueOptions = _uniqueOptions;
    final isSupervisor = currentUser?['role_id'] == 2;

    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text('Milking Management'),
        backgroundColor: Color(0xFF3D90D7),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            icon: Icon(Icons.download),
            onSelected: (value) {
              if (value == 'pdf') {
                _exportToPDF();
              } else if (value == 'excel') {
                _exportToExcel();
              }
            },
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'pdf',
                child: Row(
                  children: [
                    Icon(Icons.picture_as_pdf, color: Colors.red),
                    SizedBox(width: 8),
                    Text('Export PDF'),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'excel',
                child: Row(
                  children: [
                    Icon(Icons.table_view, color: Colors.green),
                    SizedBox(width: 8),
                    Text('Export Excel'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchData,
        child: Column(
          children: [
            // Header with stats
            Container(
              color: Color(0xFF3D90D7),
              padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Milking Statistics',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _buildCompactStatCard(
                        'Total Sessions',
                        milkStats['hasActiveFilters']
                            ? milkStats['totalSessions'].toString()
                            : milkStats['baseTotalSessions'].toString(),
                        Icons.calendar_today,
                        Colors.orange,
                      ),
                      _buildCompactStatCard(
                        'Total Volume',
                        '${milkStats['hasActiveFilters'] ? milkStats['totalVolume'] : milkStats['baseTotalVolume']} L',
                        Icons.local_drink,
                        const Color.fromARGB(255, 127, 239, 90),
                      ),
                      _buildCompactStatCard(
                        'Today',
                        '${milkStats['hasActiveFilters'] ? milkStats['todayVolume'] : milkStats['baseTodayVolume']} L',
                        Icons.today,
                        const Color.fromARGB(255, 30, 210, 255),
                      ),
                      _buildCompactStatCard(
                        'Average',
                        '${milkStats['hasActiveFilters'] ? milkStats['avgVolumePerSession'] : milkStats['baseAvgVolumePerSession']} L',
                        Icons.trending_up,
                        const Color.fromARGB(255, 234, 152, 248),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Search and filters
            Container(
              color: Colors.white,
              padding: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
              child: Column(
                children: [
                  // Search bar
                  TextField(
                    decoration: InputDecoration(
                      hintText: 'Cari sesi...',
                      prefixIcon: Icon(Icons.search, size: 20),
                      suffixIcon: searchTerm.isNotEmpty
                          ? IconButton(
                              icon: Icon(Icons.clear, size: 18),
                              onPressed: () => setState(() {
                                searchTerm = '';
                                currentPage = 1;
                              }),
                            )
                          : null,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    ),
                    style: TextStyle(fontSize: 14),
                    onChanged: (value) => setState(() {
                      searchTerm = value;
                      currentPage = 1;
                    }),
                  ),
                  SizedBox(height: 8),

                  // Filter row
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          decoration: InputDecoration(
                            labelText: 'Cow',
                            labelStyle: TextStyle(fontSize: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 8),
                          ),
                          value: selectedCow.isEmpty ? null : selectedCow,
                          items: [
                            DropdownMenuItem(
                                value: '',
                                child: Text('All',
                                    style: TextStyle(fontSize: 12))),
                            ...uniqueOptions['cows']!
                                .map((cow) => DropdownMenuItem(
                                      value: cow['id'],
                                      child: Text(cow['name'],
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(fontSize: 12)),
                                    )),
                          ],
                          onChanged: (value) => setState(() {
                            selectedCow = value ?? '';
                            currentPage = 1;
                          }),
                        ),
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          decoration: InputDecoration(
                            labelText: 'Milker',
                            labelStyle: TextStyle(fontSize: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 8),
                          ),
                          value: selectedMilker.isEmpty ? null : selectedMilker,
                          items: [
                            DropdownMenuItem(
                                value: '',
                                child: Text('All',
                                    style: TextStyle(fontSize: 12))),
                            ...uniqueOptions['milkers']!
                                .map((milker) => DropdownMenuItem(
                                      value: milker['id'],
                                      child: Text(milker['name'],
                                          overflow: TextOverflow.ellipsis,
                                          style: TextStyle(fontSize: 12)),
                                    )),
                          ],
                          onChanged: (value) => setState(() {
                            selectedMilker = value ?? '';
                            currentPage = 1;
                          }),
                        ),
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: TextFormField(
                          decoration: InputDecoration(
                            labelText: 'Tanggal',
                            labelStyle: TextStyle(fontSize: 12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            suffixIcon: selectedDate.isNotEmpty
                                ? IconButton(
                                    icon: Icon(Icons.clear, size: 16),
                                    onPressed: () => setState(() {
                                      selectedDate = '';
                                      currentPage = 1;
                                    }),
                                  )
                                : Icon(Icons.calendar_today, size: 16),
                          ),
                          readOnly: true,
                          style: TextStyle(fontSize: 12),
                          onTap: () async {
                            final date = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime(2020),
                              lastDate: DateTime.now().add(Duration(days: 365)),
                            );
                            if (date != null) {
                              setState(() {
                                selectedDate =
                                    DateFormat('yyyy-MM-dd').format(date);
                                currentPage = 1;
                              });
                            }
                          },
                          controller: TextEditingController(text: selectedDate),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Sessions list
            Expanded(
              child: paginatedData['currentSessions'].isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      controller: _scrollController,
                      padding: EdgeInsets.all(12),
                      itemCount: paginatedData['currentSessions'].length,
                      itemBuilder: (context, index) {
                        final session = paginatedData['currentSessions'][index];
                        return _buildCompactSessionCard(session, index);
                      },
                    ),
            ),

            // Pagination
            if (paginatedData['totalPages'] > 1)
              _buildPagination(paginatedData),
          ],
        ),
      ),
      floatingActionButton: isSupervisor
          ? null
          : FloatingActionButton(
              onPressed: _openAddModal,
              backgroundColor: Color(0xFF3D90D7),
              child: Icon(Icons.add, color: Colors.white),
              mini: true,
            ),
    );
  }

  // Helper for compact stat card
  Widget _buildCompactStatCard(
      String title, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 24),
        SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          title,
          style: TextStyle(
            fontSize: 10,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }

  Widget _buildCompactSessionCard(dynamic session, int index) {
    final isSupervisor = currentUser?['role_id'] == 2;
    final volume = double.parse(session['volume'].toString());
    final volumeColor = Color(0xFF3D90D7)!.withOpacity(0.8);

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
      child: Card(
        elevation: 6,
        margin: EdgeInsets.symmetric(vertical: 8, horizontal: 10),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        shadowColor: Colors.blueGrey.withOpacity(0.2),
        color: Colors.white,
        child: ExpansionTile(
          leading: CircleAvatar(
            radius: 20,
            backgroundColor: volumeColor.withOpacity(0.1),
            child: Icon(
              Icons.water_drop,
              color: volumeColor,
              size: 28,
            ),
          ),
          title: Text(
            '${session['cow_name'] ?? 'Sapi #${session['cow_id']}'} • ${session['milker_name'] ?? 'Pemerah #${session['milker_id']}'}',
            style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
                fontFamily: "Roboto, Monospace",
                letterSpacing: 1.5,
                color: Colors.blueGrey[800]),
          ),
          subtitle: Text(
            "Volume: ${volume.toStringAsFixed(1)} L • ${DateFormat('dd MMM yyyy, HH:mm').format(DateTime.parse(session['milking_time']))}",
            style: TextStyle(fontSize: 13, color: Colors.grey[700]),
          ),
          trailing: Chip(
            label: Text("${volume.toStringAsFixed(1)} L"),
            backgroundColor: volumeColor.withOpacity(0.1),
            labelStyle: TextStyle(
              color: volumeColor,
              fontSize: 13,
              fontWeight: FontWeight.bold,
            ),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Cow & Milker Info (horizontal layout)
                  Row(
                    children: [
                      // Cow Info
                      Expanded(
                        child: Container(
                          padding: EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey[200]!),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor:
                                    Color(0xFF3D90D7).withOpacity(0.15),
                                child: Icon(Icons.pets,
                                    color: Color(0xFF3D90D7), size: 20),
                                radius: 18,
                              ),
                              SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      session['cow_name'] ??
                                          'ID: ${session['cow_id']}',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.blueGrey[800],
                                        fontWeight: FontWeight.bold,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'Sapi',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Colors.blueGrey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      SizedBox(width: 12),
                      // Milker Info
                      Expanded(
                        child: Container(
                          padding: EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: Colors.grey[200]!),
                          ),
                          child: Row(
                            children: [
                              CircleAvatar(
                                backgroundColor:
                                    Color(0xFF3D90D7).withOpacity(0.15),
                                child: Icon(Icons.person,
                                    color: Color(0xFF3D90D7), size: 20),
                                radius: 18,
                              ),
                              SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      session['milker_name'] ??
                                          'ID: ${session['milker_id']}',
                                      style: TextStyle(
                                        fontSize: 13,
                                        color: Colors.blueGrey[800],
                                        fontWeight: FontWeight.bold,
                                      ),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'Milker',
                                      style: TextStyle(
                                        fontSize: 10,
                                        color: Colors.blueGrey[600],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Date & Time Info
                  Row(
                    children: [
                      // Date
                      Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.calendar_today,
                                size: 14, color: Colors.blueGrey[700]),
                            SizedBox(width: 6),
                            Text(
                              DateFormat('dd MMM yyyy').format(
                                  DateTime.parse(session['milking_time'])),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.blueGrey[800],
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(width: 10),
                      // Time
                      Container(
                        padding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: _getMilkingTimeLabel(session['milking_time']),
                      ),
                    ],
                  ),

                  // Volume Detail Row
                  SizedBox(height: 12),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Color(0xFF3D90D7).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(10),
                      border:
                          Border.all(color: Color(0xFF3D90D7).withOpacity(0.2)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.water_drop,
                            size: 16, color: Color(0xFF3D90D7)),
                        SizedBox(width: 8),
                        Text(
                          'Volume: ${volume.toStringAsFixed(1)} L',
                          style: TextStyle(
                            fontSize: 13,
                            color: Color(0xFF3D90D7),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Notes Preview (if exists)
                  if (session['notes'] != null &&
                      session['notes'].toString().isNotEmpty) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.sticky_note_2,
                              size: 16, color: Colors.blueGrey[600]),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              session['notes'].toString().length > 80
                                  ? '${session['notes'].toString().substring(0, 80)}...'
                                  : session['notes'].toString(),
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.blueGrey[700],
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  Divider(height: 24, color: Colors.grey[300]),

                  // Action Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      ElevatedButton.icon(
                        icon: const Icon(
                          Icons.visibility,
                          size: 18,
                          color: Colors.white,
                        ),
                        label: const Text(
                          "Detail",
                          style: TextStyle(fontSize: 13, color: Colors.white),
                        ),
                        onPressed: isActionLoading
                            ? null
                            : () => _showSessionDetails(session),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueGrey[600],
                          padding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                      if (!isSupervisor) ...[
                        SizedBox(width: 8),
                        ElevatedButton.icon(
                          icon: const Icon(
                            Icons.edit,
                            size: 18,
                            color: Colors.white,
                          ),
                          label: const Text(
                            "Edit",
                            style: TextStyle(fontSize: 13, color: Colors.white),
                          ),
                          onPressed: isActionLoading
                              ? null
                              : () => _openEditModal(session),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFF3D90D7),
                            padding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                        SizedBox(width: 8),
                        ElevatedButton.icon(
                          icon: const Icon(
                            Icons.delete,
                            size: 18,
                            color: Colors.white,
                          ),
                          label: const Text(
                            "Delete",
                            style: TextStyle(fontSize: 13, color: Colors.white),
                          ),
                          onPressed: isActionLoading
                              ? null
                              : () => _handleDeleteSession(session['id']),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red[600],
                            padding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 8,
                            ),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ],
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

  // Method untuk menampilkan detail session
  void _showSessionDetails(dynamic session) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Center(
        child: Container(
          width: MediaQuery.of(context).size.width * 0.95,
          height: MediaQuery.of(context).size.height * 0.8,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 20,
                offset: Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            children: [
              // Header dengan gradient
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF3D90D7), Colors.blue[800]!],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child:
                          Icon(Icons.water_drop, color: Colors.white, size: 24),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Milking Session Details',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.5,
                            ),
                          ),
                          Text(
                            'Informasi lengkap sesi #${session['id']}',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.close, color: Colors.white, size: 28),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // Content
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Session Info Card
                      _buildAnimatedDetailCard(
                        'Informasi Sesi',
                        Icons.info_outline,
                        Colors.blue,
                        [
                          _buildDetailInfoRow(
                              'Nomor Sesi', '#${session['id']}', Icons.tag),
                          _buildDetailInfoRow(
                              'Volume',
                              '${double.parse(session['volume'].toString()).toStringAsFixed(1)} L',
                              Icons.water_drop),
                          _buildDetailInfoRow(
                              'Tanggal',
                              DateFormat('dd MMMM yyyy').format(
                                  DateTime.parse(session['milking_time'])),
                              Icons.calendar_today),
                          _buildDetailInfoRow(
                              'Waktu',
                              DateFormat('HH:mm').format(
                                  DateTime.parse(session['milking_time'])),
                              Icons.access_time),
                        ],
                        0,
                      ),

                      SizedBox(height: 16),

                      // Cow Info Card
                      _buildAnimatedDetailCard(
                        'Informasi Sapi',
                        Icons.pets,
                        Colors.pink,
                        [
                          _buildDetailInfoRow(
                              'Nama Sapi',
                              session['cow_name'] ?? 'Tidak diketahui',
                              Icons.pets),
                          _buildDetailInfoRow('ID Sapi',
                              session['cow_id'].toString(), Icons.fingerprint),
                        ],
                        1,
                      ),

                      SizedBox(height: 16),

                      // Milker Info Card
                      _buildAnimatedDetailCard(
                        'Informasi Pemerah',
                        Icons.person,
                        Colors.green,
                        [
                          _buildDetailInfoRow(
                              'Nama Pemerah',
                              session['milker_name'] ?? 'Tidak diketahui',
                              Icons.person),
                          _buildDetailInfoRow('ID Pemerah',
                              session['milker_id'].toString(), Icons.badge),
                        ],
                        2,
                      ),

                      // Notes Card (if exists)
                      if (session['notes'] != null &&
                          session['notes'].toString().isNotEmpty) ...[
                        SizedBox(height: 16),
                        _buildAnimatedDetailCard(
                          'Catatan',
                          Icons.sticky_note_2,
                          Colors.orange,
                          [
                            Container(
                              width: double.infinity,
                              padding: EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.orange[50],
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: Colors.orange[200]!),
                              ),
                              child: Text(
                                session['notes'].toString(),
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.orange[900],
                                  height: 1.6,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ),
                          ],
                          3,
                        ),
                      ],

                      SizedBox(height: 20),

                      // Action Button
                      Container(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => Navigator.pop(context),
                          icon: Icon(Icons.check, color: Colors.white),
                          label: Text(
                            'Tutup Detail',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFF3D90D7),
                            padding: EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            elevation: 4,
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
      ),
    );
  }

  // Helper method untuk animated detail card (mirip dengan listOfCowsView.dart)
  Widget _buildAnimatedDetailCard(String title, IconData titleIcon,
      Color accentColor, List<Widget> children, int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 400 + index * 100),
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 20 * (1 - value)),
            child: child,
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: accentColor.withOpacity(0.1),
              blurRadius: 12,
              offset: Offset(0, 4),
            ),
          ],
          border: Border.all(color: accentColor.withOpacity(0.2), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Header
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    accentColor.withOpacity(0.1),
                    accentColor.withOpacity(0.05)
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                border: Border(
                  bottom: BorderSide(color: accentColor.withOpacity(0.2)),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    padding: EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: accentColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(titleIcon, color: accentColor, size: 20),
                  ),
                  SizedBox(width: 12),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: accentColor.withOpacity(0.8),
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
            ),
            // Card Content
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: children,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper method untuk detail info row (mirip dengan listOfCowsView.dart)
  Widget _buildDetailInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Color(0xFF3D90D7).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: Color(0xFF3D90D7)),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                    letterSpacing: 0.3,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.blueGrey[800],
                    fontWeight: FontWeight.w600,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
// ...existing code...

  // Build empty state
  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: Colors.grey[400],
          ),
          SizedBox(height: 16),
          Text(
            'Tidak ada sesi pemerahan ditemukan',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Coba ubah filter pencarian atau tambah sesi baru',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
            ),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 16),
          if (_milkStats['hasActiveFilters'])
            ElevatedButton.icon(
              onPressed: _clearAllFilters,
              icon: Icon(Icons.clear_all),
              label: Text('Reset Filter'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF3D90D7),
                foregroundColor: Colors.white,
              ),
            ),
        ],
      ),
    );
  }

  // Build pagination
  Widget _buildPagination(Map<String, dynamic> paginatedData) {
    final totalPages = paginatedData['totalPages'];

    return Container(
      color: Colors.white,
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          Text(
            'Menampilkan ${((currentPage - 1) * sessionsPerPage + 1)} - ${(currentPage * sessionsPerPage).clamp(0, paginatedData['totalItems'])} dari ${paginatedData['totalItems']} sesi',
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey[600],
            ),
          ),
          SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              IconButton(
                onPressed: currentPage > 1
                    ? () => setState(() => currentPage--)
                    : null,
                icon: Icon(Icons.chevron_left),
              ),
              ...List.generate(
                totalPages > 5 ? 5 : totalPages,
                (index) {
                  int pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = index + 1;
                  } else {
                    if (currentPage <= 3) {
                      pageNumber = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + index;
                    } else {
                      pageNumber = currentPage - 2 + index;
                    }
                  }

                  return Container(
                    margin: EdgeInsets.symmetric(horizontal: 2),
                    child: InkWell(
                      onTap: () => setState(() => currentPage = pageNumber),
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: currentPage == pageNumber
                              ? Color(0xFF3D90D7)
                              : Colors.transparent,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: currentPage == pageNumber
                                ? Color(0xFF3D90D7)!
                                : Colors.grey[300]!,
                          ),
                        ),
                        child: Center(
                          child: Text(
                            pageNumber.toString(),
                            style: TextStyle(
                              color: currentPage == pageNumber
                                  ? Colors.white
                                  : Colors.grey[700],
                              fontWeight: currentPage == pageNumber
                                  ? FontWeight.bold
                                  : FontWeight.normal,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
              IconButton(
                onPressed: currentPage < totalPages
                    ? () => setState(() => currentPage++)
                    : null,
                icon: Icon(Icons.chevron_right),
              ),
            ],
          ),
        ],
      ),
    );
  }

// Build add session modal
  Widget _buildAddSessionModal() {
    // Cek apakah sapi sudah dipilih
    final isCowSelected = newSession['cow_id'] != null &&
        newSession['cow_id'].toString().isNotEmpty &&
        newSession['cow_id'] != '';

    final List<dynamic> filteredFarmers =
        isCowSelected ? availableFarmersForCow : [];
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Modal header
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue[700],
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Icon(Icons.add_circle, color: Colors.white),
                SizedBox(width: 8),
                Text(
                  'Add Milking Session',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(Icons.close, color: Colors.white),
                ),
              ],
            ),
          ),

          // Modal body
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: EdgeInsets.all(16),
                children: [
                  // Cow selection
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Pilih Sapi *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.pets),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    value: newSession['cow_id'].isEmpty ||
                            newSession['cow_id'] == ''
                        ? null
                        : newSession['cow_id'],
                    items: [
                      DropdownMenuItem(
                          value: '',
                          child: Text('-- Pilih Sapi --',
                              style: TextStyle(color: Colors.grey[600]))),
                      ...(currentUser?['role_id'] == 1
                              ? cowList
                              : userManagedCows)
                          .where((cow) =>
                              (cow is Map &&
                                  (cow['gender'] ?? '').toLowerCase() ==
                                      'female') ||
                              (cow is Cow &&
                                  (cow.gender ?? '').toLowerCase() == 'female'))
                          .map((cow) {
                            final cowName = cow is Map ? cow['name'] : cow.name;
                            final cowId = cow is Map ? cow['id'] : cow.id;

                            // Validasi nama sapi tidak kosong
                            if (cowName == null ||
                                cowName.toString().trim().isEmpty) {
                              return null; // Skip sapi dengan nama kosong
                            }

                            return DropdownMenuItem(
                              value: cowId.toString(),
                              child: Text('$cowName (ID: $cowId)'),
                            );
                          })
                          .where((item) => item != null)
                          .cast<DropdownMenuItem<String>>()
                    ],
                    validator: (value) {
                      if (value == null || value.isEmpty || value == '') {
                        return 'Please select the cow first';
                      }
                      return null;
                    },
                    onChanged: (value) => _handleCowSelectionInAdd(value ?? ''),
                  ),
                  SizedBox(height: 16),
                  if (currentUser?['role_id'] == 1)
                    StreamBuilder<bool>(
                      stream: _loadingStream,
                      initialData: false,
                      builder: (context, loadingSnapshot) {
                        final isLoading = loadingSnapshot.data ?? false;

                        return StreamBuilder<List<dynamic>>(
                          stream: _farmersStream,
                          initialData: [],
                          builder: (context, farmersSnapshot) {
                            final farmers = farmersSnapshot.data ?? [];
                            final isCowSelected = newSession['cow_id'] !=
                                    null &&
                                newSession['cow_id'].toString().isNotEmpty &&
                                newSession['cow_id'] != '';

                            print(
                                'DEBUG: StreamBuilder rebuild - cowId: ${newSession['cow_id']}, isCowSelected: $isCowSelected, isLoading: $isLoading, farmersCount: ${farmers.length}');

                            return Column(
                              children: [
                                DropdownButtonFormField<String>(
                                  key: ValueKey(
                                      'milker_dropdown_${newSession['cow_id']}_${farmers.length}_$isLoading'),
                                  decoration: InputDecoration(
                                    labelText: 'Pilih Pemerah *',
                                    border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8)),
                                    prefixIcon: Icon(Icons.person),
                                    errorStyle: TextStyle(fontSize: 12),
                                    fillColor: isCowSelected
                                        ? Colors.white
                                        : Colors.grey[100],
                                    filled: true,
                                  ),
                                  value: isCowSelected &&
                                          newSession['milker_id'].isNotEmpty &&
                                          newSession['milker_id'] != '' &&
                                          farmers.any((farmer) =>
                                              (farmer['user_id'] ??
                                                      farmer['id'])
                                                  .toString() ==
                                              newSession['milker_id'])
                                      ? newSession['milker_id']
                                      : null,
                                  items: [
                                    DropdownMenuItem(
                                        value: '',
                                        child: Text(
                                            !isCowSelected
                                                ? '-- Pilih Sapi Terlebih Dahulu --'
                                                : isLoading
                                                    ? '-- Memuat Pemerah... --'
                                                    : farmers.isEmpty
                                                        ? '-- Tidak Ada Pemerah Tersedia --'
                                                        : '-- Pilih Pemerah --',
                                            style: TextStyle(
                                                color: Colors.grey[600]))),
                                    if (isCowSelected && !isLoading)
                                      ...farmers
                                          .map((farmer) {
                                            final farmerName =
                                                farmer['username'] ??
                                                    farmer['name'];
                                            final farmerId =
                                                farmer['user_id'] ??
                                                    farmer['id'];
                                            if (farmerName == null ||
                                                farmerName
                                                    .toString()
                                                    .trim()
                                                    .isEmpty) {
                                              return null;
                                            }
                                            return DropdownMenuItem(
                                              value: farmerId.toString(),
                                              child: Text(
                                                  '$farmerName (ID: $farmerId)'),
                                            );
                                          })
                                          .where((item) => item != null)
                                          .cast<DropdownMenuItem<String>>(),
                                  ],
                                  validator: (value) {
                                    if (!isCowSelected) {
                                      return 'Pilih sapi terlebih dahulu';
                                    }
                                    if (isLoading) {
                                      return 'Menunggu data pemerah dimuat...';
                                    }
                                    if (farmers.isEmpty) {
                                      return 'Tidak ada pemerah tersedia untuk sapi ini';
                                    }
                                    if (value == null ||
                                        value.isEmpty ||
                                        value == '') {
                                      return 'Silakan pilih pemerah';
                                    }
                                    return null;
                                  },
                                  onChanged: (isCowSelected &&
                                          !isLoading &&
                                          farmers.isNotEmpty)
                                      ? (value) {
                                          print(
                                              'DEBUG: Milker selected: $value');
                                          setState(() {
                                            newSession['milker_id'] =
                                                value ?? '';
                                          });
                                        }
                                      : null,
                                  disabledHint: Text(
                                      !isCowSelected
                                          ? 'Pilih sapi terlebih dahulu'
                                          : isLoading
                                              ? 'Memuat data pemerah...'
                                              : 'Tidak ada pemerah tersedia',
                                      style:
                                          TextStyle(color: Colors.grey[500])),
                                ),

                                // Loading indicator
                                if (isCowSelected && isLoading) ...[
                                  SizedBox(height: 8),
                                  Container(
                                    padding: EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.blue[50],
                                      borderRadius: BorderRadius.circular(8),
                                      border:
                                          Border.all(color: Colors.blue[200]!),
                                    ),
                                    child: Row(
                                      children: [
                                        SizedBox(
                                          width: 16,
                                          height: 16,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor:
                                                AlwaysStoppedAnimation<Color>(
                                                    Colors.blue[600]!),
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        Text(
                                          'Memuat data pemerah untuk sapi yang dipilih...',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.blue[800],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],

                                // No farmers warning
                                if (isCowSelected &&
                                    !isLoading &&
                                    farmers.isEmpty) ...[
                                  SizedBox(height: 8),
                                  Container(
                                    padding: EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.red[50],
                                      borderRadius: BorderRadius.circular(8),
                                      border:
                                          Border.all(color: Colors.red[200]!),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.warning,
                                            color: Colors.red[700], size: 20),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            'Tidak ada pemerah yang tersedia untuk sapi ini. Pastikan sapi sudah didistribusikan ke pemerah.',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.red[800],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            );
                          },
                        );
                      },
                    )
                  else
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.person, color: Colors.grey[600]),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Pemerah',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  '${currentUser?['name'] ?? currentUser?['username'] ?? 'Nama tidak tersedia'} (ID: ${currentUser?['id'] ?? currentUser?['user_id'] ?? 'ID tidak tersedia'})',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[800],
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Loading indicator for farmers
                  if (currentUser?['role_id'] == 1 &&
                      loadingFarmers &&
                      isCowSelected) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.blue[600]!),
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Memuat data pemerah untuk sapi yang dipilih...',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue[800],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Warning message if cow/milker data is incomplete
                  if ((currentUser?['role_id'] == 1 ? cowList : userManagedCows)
                      .any((cow) {
                    final cowName = cow is Map ? cow['name'] : cow.name;
                    return cowName == null || cowName.toString().trim().isEmpty;
                  })) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.orange[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.warning,
                              color: Colors.orange[700], size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Beberapa sapi tidak memiliki nama yang valid dan tidak ditampilkan dalam daftar',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.orange[800],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // No farmers available warning
                  if (currentUser?['role_id'] == 1 &&
                      isCowSelected &&
                      !loadingFarmers &&
                      filteredFarmers.isEmpty) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.warning, color: Colors.red[700], size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Tidak ada pemerah yang tersedia untuk sapi ini. Pastikan sapi sudah didistribusikan ke pemerah.',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.red[800],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  SizedBox(height: 16),

                  // Volume input with quick buttons
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        controller: _volumeController,
                        decoration: InputDecoration(
                          labelText: 'Volume (Liter) *',
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8)),
                          prefixIcon: Icon(Icons.local_drink),
                          errorStyle: TextStyle(fontSize: 12),
                        ),
                        keyboardType:
                            TextInputType.numberWithOptions(decimal: true),
                        validator: (value) {
                          if (value?.isEmpty == true)
                            return 'Masukkan volume susu';
                          final volume = double.tryParse(value!);
                          if (volume == null || volume <= 0)
                            return 'Volume harus berupa angka positif';
                          if (volume > 100)
                            return 'Volume terlalu besar (maksimal 100L)';
                          return null;
                        },
                        onChanged: (value) => setState(() {
                          newSession['volume'] = value;
                        }),
                      ),
                      SizedBox(height: 8),

                      // Quick volume buttons
                      Text(
                        'Volume Cepat:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: ['3.0', '5.0', '7.5', '10.0', '15.0', '20.0']
                            .map(
                              (volume) => OutlinedButton(
                                onPressed: () => setState(() {
                                  _volumeController.text = volume;
                                  newSession['volume'] = volume;
                                }),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.add, size: 12),
                                    SizedBox(width: 4),
                                    Text('$volume L'),
                                  ],
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.green[700],
                                  side: BorderSide(color: Colors.green[300]!),
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                ),
                              ),
                            )
                            .toList(),
                      ),

                      // Volume info display
                      if (newSession['volume'].isNotEmpty)
                        Container(
                          margin: EdgeInsets.only(top: 8),
                          padding: EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Volume terpilih: ${double.tryParse(newSession['volume']) != null ? double.parse(newSession['volume']).toStringAsFixed(1) : '0.0'} Liter ${_getVolumeCategory(newSession['volume'])}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[700],
                            ),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Date input
                  TextFormField(
                    controller: _dateController,
                    decoration: InputDecoration(
                      labelText: 'Tanggal Pemerahan *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.calendar_today),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    readOnly: true,
                    validator: (value) {
                      if (value?.isEmpty == true)
                        return 'Pilih tanggal pemerahan';
                      return null;
                    },
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now().add(Duration(days: 1)),
                      );
                      if (date != null) {
                        final dateString =
                            DateFormat('yyyy-MM-dd').format(date);
                        setState(() {
                          _dateController.text = dateString;
                          newSession['milking_time'] =
                              '${dateString}T${_timeController.text}';
                        });
                      }
                    },
                  ),
                  SizedBox(height: 16),

                  // Time input
                  TextFormField(
                    controller: _timeController,
                    decoration: InputDecoration(
                      labelText: 'Waktu Pemerahan *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.access_time),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    readOnly: true,
                    validator: (value) {
                      if (value?.isEmpty == true)
                        return 'Pilih waktu pemerahan';
                      return null;
                    },
                    onTap: () async {
                      final time = await showTimePicker(
                        context: context,
                        initialTime: TimeOfDay.now(),
                      );
                      if (time != null) {
                        final timeString =
                            '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
                        setState(() {
                          _timeController.text = timeString;
                          newSession['milking_time'] =
                              '${_dateController.text}T$timeString';
                        });
                      }
                    },
                  ),
                  SizedBox(height: 16),

                  // Quick time buttons
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Waktu Cepat:',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildQuickTimeButton(
                              '05:00', 'Pagi', Icons.wb_sunny, Colors.orange),
                          _buildQuickTimeButton(
                              '14:00', 'Siang', Icons.wb_cloudy, Colors.blue),
                          _buildQuickTimeButton('18:00', 'Sore',
                              Icons.nights_stay, Colors.indigo),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Notes section with quick notes
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Catatan (Opsional)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[800],
                        ),
                      ),
                      SizedBox(height: 8),

                      // Quick notes buttons
                      Text(
                        'Catatan Cepat:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          _buildQuickNoteButton('Kondisi Sehat', Icons.favorite,
                              Colors.red, false),
                          _buildQuickNoteButton('Produksi Normal',
                              Icons.check_circle, Colors.green, false),
                          _buildQuickNoteButton('Pemerahan Lancar',
                              Icons.schedule, Colors.blue, false),
                          _buildQuickNoteButton('Perlu Perhatian',
                              Icons.warning, Colors.orange, false),
                          _buildQuickNoteButton('Kualitas Baik', Icons.thumb_up,
                              Colors.purple, false),
                          _buildQuickNoteButton('Sapi Stress',
                              Icons.sentiment_dissatisfied, Colors.grey, false),
                          _buildQuickNoteButton('Produksi Menurun',
                              Icons.trending_down, Colors.red, false),
                          _buildQuickNoteButton(
                              'Peralatan OK', Icons.build, Colors.green, false),
                        ],
                      ),

                      // Clear all notes button
                      if (newSession['notes'].isNotEmpty)
                        Container(
                          margin: EdgeInsets.only(top: 8),
                          child: OutlinedButton.icon(
                            onPressed: () => setState(() {
                              _notesController.clear();
                              newSession['notes'] = '';
                            }),
                            icon: Icon(Icons.clear, size: 16),
                            label: Text('Hapus Semua Catatan'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red[700],
                              side: BorderSide(color: Colors.red[300]!),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                            ),
                          ),
                        ),

                      SizedBox(height: 12),

                      // Notes text field
                      TextFormField(
                        controller: _notesController,
                        decoration: InputDecoration(
                          labelText: 'Catatan Detail',
                          hintText:
                              'Masukkan catatan tentang sesi pemerahan ini atau gunakan pilihan catatan cepat di atas...',
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8)),
                          prefixIcon: Icon(Icons.note),
                        ),
                        maxLines: 4,
                        maxLength: 500,
                        onChanged: (value) => setState(() {
                          newSession['notes'] = value;
                        }),
                      ),

                      // Character count
                      if (newSession['notes'].isNotEmpty)
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          child: Text(
                            'Karakter: ${newSession['notes'].length}/500',
                            style: TextStyle(
                              fontSize: 12,
                              color: newSession['notes'].length > 450
                                  ? Colors.red[600]
                                  : Colors.grey[600],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed:
                        isActionLoading ? null : () => Navigator.pop(context),
                    child: isActionLoading
                        ? SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text('Cancel'),
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: isActionLoading
                        ? null
                        : () {
                            if (!isActionLoading) {
                              _handleAddSession();
                            }
                          },
                    child: isActionLoading
                        ? SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text('Save'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue[700],
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

// Build edit session modal with validation
  Widget _buildEditSessionModal() {
    if (selectedSession == null) return Container();

    // --- FIX: Ensure unique cow IDs for dropdown ---
    final cowSource = currentUser?['role_id'] == 1 ? cowList : userManagedCows;
    final uniqueCowMap = <String, dynamic>{};
    for (var cow in cowSource) {
      final id = (cow is Map ? cow['id'] : cow.id).toString();
      final name = cow is Map ? cow['name'] : cow.name;

      // Skip sapi dengan nama kosong
      if (name != null && name.toString().trim().isNotEmpty) {
        if (!uniqueCowMap.containsKey(id)) {
          uniqueCowMap[id] = cow;
        }
      }
    }

    // Check if cow is selected
    final selectedCowId = selectedSession!['cow_id'].toString();
    final isCowSelected = selectedCowId.isNotEmpty && selectedCowId != '';
    final cowDropdownValue =
        uniqueCowMap.containsKey(selectedCowId) ? selectedCowId : null;

    // --- FIX: Ensure unique milker IDs for dropdown (if needed) ---
    final uniqueFarmerMap = <String, dynamic>{};
    for (var farmer in availableFarmersForCow) {
      final id = (farmer['user_id'] ?? farmer['id']).toString();
      final name = farmer['username'] ?? farmer['name'];

      // Skip pemerah dengan nama kosong
      if (name != null && name.toString().trim().isNotEmpty) {
        if (!uniqueFarmerMap.containsKey(id)) {
          uniqueFarmerMap[id] = farmer;
        }
      }
    }
    final selectedMilkerId = selectedSession!['milker_id'].toString();
    final milkerDropdownValue =
        isCowSelected && uniqueFarmerMap.containsKey(selectedMilkerId)
            ? selectedMilkerId
            : null;

    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Modal header
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.orange[700],
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Icon(Icons.edit, color: Colors.white),
                SizedBox(width: 8),
                Text(
                  'Edit Sesi Pemerahan',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Spacer(),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(Icons.close, color: Colors.white),
                ),
              ],
            ),
          ),

          // Modal body
          Expanded(
            child: Form(
              key: _editFormKey,
              child: ListView(
                padding: EdgeInsets.all(16),
                children: [
                  // Cow selection
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Pilih Sapi *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.pets),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    value: cowDropdownValue,
                    items: [
                      DropdownMenuItem(
                          value: '',
                          child: Text('-- Pilih Sapi --',
                              style: TextStyle(color: Colors.grey[600]))),
                      ...uniqueCowMap.values
                          .where((cow) =>
                              (cow is Map &&
                                  (cow['gender'] ?? '').toLowerCase() ==
                                      'female') ||
                              (cow is Cow &&
                                  (cow.gender ?? '').toLowerCase() == 'female'))
                          .map((cow) => DropdownMenuItem(
                                value: (cow is Map ? cow['id'] : cow.id)
                                    .toString(),
                                child: Text(
                                    '${cow is Map ? cow['name'] : cow.name} (ID: ${(cow is Map ? cow['id'] : cow.id)})'),
                              ))
                    ],
                    validator: (value) {
                      if (value == null || value.isEmpty || value == '') {
                        return 'Silakan pilih sapi';
                      }
                      return null;
                    },
                    onChanged: (value) =>
                        _handleCowSelectionInEdit(value ?? ''),
                  ),
                  SizedBox(height: 16),

                  if (currentUser?['role_id'] == 1)
                    StreamBuilder<bool>(
                      stream: _loadingStream,
                      initialData: false,
                      builder: (context, loadingSnapshot) {
                        final isLoading = loadingSnapshot.data ?? false;

                        return StreamBuilder<List<dynamic>>(
                          stream: _farmersStream,
                          initialData: [],
                          builder: (context, farmersSnapshot) {
                            final farmers = farmersSnapshot.data ?? [];
                            final selectedCowId =
                                selectedSession!['cow_id'].toString();
                            final isCowSelected =
                                selectedCowId.isNotEmpty && selectedCowId != '';

                            final selectedMilkerId =
                                selectedSession!['milker_id'].toString();
                            final milkerDropdownValue = isCowSelected &&
                                    farmers.any((farmer) =>
                                        (farmer['user_id'] ?? farmer['id'])
                                            .toString() ==
                                        selectedMilkerId)
                                ? selectedMilkerId
                                : null;

                            return DropdownButtonFormField<String>(
                              key: ValueKey(
                                  'milker_dropdown_edit_${selectedSession!['cow_id']}_${farmers.length}_$isLoading'),
                              decoration: InputDecoration(
                                labelText: 'Pilih Pemerah *',
                                border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(8)),
                                prefixIcon: Icon(Icons.person),
                                errorStyle: TextStyle(fontSize: 12),
                                fillColor: isCowSelected
                                    ? Colors.white
                                    : Colors.grey[100],
                                filled: true,
                              ),
                              value: milkerDropdownValue,
                              items: [
                                DropdownMenuItem(
                                    value: '',
                                    child: Text(
                                        !isCowSelected
                                            ? '-- Pilih Sapi Terlebih Dahulu --'
                                            : isLoading
                                                ? '-- Memuat Pemerah... --'
                                                : farmers.isEmpty
                                                    ? '-- Tidak Ada Pemerah Tersedia --'
                                                    : '-- Pilih Pemerah --',
                                        style: TextStyle(
                                            color: Colors.grey[600]))),
                                if (isCowSelected && !isLoading)
                                  ...farmers
                                      .map((farmer) {
                                        final farmerName = farmer['username'] ??
                                            farmer['name'];
                                        final farmerId =
                                            farmer['user_id'] ?? farmer['id'];
                                        if (farmerName == null ||
                                            farmerName
                                                .toString()
                                                .trim()
                                                .isEmpty) {
                                          return null;
                                        }
                                        return DropdownMenuItem(
                                          value: farmerId.toString(),
                                          child: Text(
                                              '$farmerName (ID: $farmerId)'),
                                        );
                                      })
                                      .where((item) => item != null)
                                      .cast<DropdownMenuItem<String>>(),
                              ],
                              validator: (value) {
                                if (!isCowSelected) {
                                  return 'Pilih sapi terlebih dahulu';
                                }
                                if (isLoading) {
                                  return 'Menunggu data pemerah dimuat...';
                                }
                                if (farmers.isEmpty) {
                                  return 'Tidak ada pemerah tersedia untuk sapi ini';
                                }
                                if (value == null ||
                                    value.isEmpty ||
                                    value == '') {
                                  return 'Silakan pilih pemerah';
                                }
                                return null;
                              },
                              onChanged: (isCowSelected &&
                                      !isLoading &&
                                      farmers.isNotEmpty)
                                  ? (value) {
                                      setState(() {
                                        selectedSession!['milker_id'] =
                                            value ?? '';
                                      });
                                    }
                                  : null,
                              disabledHint: Text(
                                  !isCowSelected
                                      ? 'Pilih sapi terlebih dahulu'
                                      : isLoading
                                          ? 'Memuat data pemerah...'
                                          : 'Tidak ada pemerah tersedia',
                                  style: TextStyle(color: Colors.grey[500])),
                            );
                          },
                        );
                      },
                    )
                  else
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.person, color: Colors.grey[600]),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Pemerah',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  selectedSession!['milker_name'] ??
                                      'ID: ${selectedSession!['milker_id']}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[800],
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  // Loading indicator for farmers
                  if (currentUser?['role_id'] == 1 &&
                      loadingFarmers &&
                      isCowSelected) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[200]!),
                      ),
                      child: Row(
                        children: [
                          SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.blue[600]!),
                            ),
                          ),
                          SizedBox(width: 8),
                          Text(
                            'Memuat data pemerah untuk sapi yang dipilih...',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.blue[800],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // Warning message if data is incomplete
                  if (uniqueCowMap.length < cowSource.length ||
                      (currentUser?['role_id'] == 1 &&
                          uniqueFarmerMap.length <
                              availableFarmersForCow.length)) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.orange[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.warning,
                              color: Colors.orange[700], size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Beberapa data sapi atau pemerah tidak memiliki nama yang valid',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.orange[800],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  // No farmers available warning
                  if (currentUser?['role_id'] == 1 &&
                      isCowSelected &&
                      !loadingFarmers &&
                      availableFarmersForCow.isEmpty) ...[
                    SizedBox(height: 8),
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red[200]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.warning, color: Colors.red[700], size: 20),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Tidak ada pemerah yang tersedia untuk sapi ini. Pastikan sapi sudah didistribusikan ke pemerah.',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.red[800],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  SizedBox(height: 16),

                  // Volume input with quick buttons
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        controller: _editVolumeController,
                        decoration: InputDecoration(
                          labelText: 'Volume (Liter) *',
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8)),
                          prefixIcon: Icon(Icons.local_drink),
                          errorStyle: TextStyle(fontSize: 12),
                        ),
                        keyboardType:
                            TextInputType.numberWithOptions(decimal: true),
                        validator: (value) {
                          if (value?.isEmpty == true)
                            return 'Masukkan volume susu';
                          final volume = double.tryParse(value!);
                          if (volume == null || volume <= 0)
                            return 'Volume harus berupa angka positif';
                          if (volume > 100)
                            return 'Volume terlalu besar (maksimal 100L)';
                          return null;
                        },
                        onChanged: (value) => setState(() {
                          selectedSession!['volume'] = value;
                        }),
                      ),
                      SizedBox(height: 8),

                      // Quick volume buttons
                      Text(
                        'Volume Cepat:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: ['3.0', '5.0', '7.5', '10.0', '15.0', '20.0']
                            .map(
                              (volume) => OutlinedButton(
                                onPressed: () => setState(() {
                                  _editVolumeController.text = volume;
                                  selectedSession!['volume'] = volume;
                                }),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.add, size: 12),
                                    SizedBox(width: 4),
                                    Text('$volume L'),
                                  ],
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.green[700],
                                  side: BorderSide(color: Colors.green[300]!),
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                ),
                              ),
                            )
                            .toList(),
                      ),

                      // Volume info display
                      if (selectedSession!['volume'].toString().isNotEmpty)
                        Container(
                          margin: EdgeInsets.only(top: 8),
                          padding: EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Volume terpilih: ${double.tryParse(selectedSession!['volume'].toString()) != null ? double.parse(selectedSession!['volume'].toString()).toStringAsFixed(1) : '0.0'} Liter ${_getVolumeCategory(selectedSession!['volume'].toString())}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[700],
                            ),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Date input
                  TextFormField(
                    controller: _editDateController,
                    decoration: InputDecoration(
                      labelText: 'Tanggal Pemerahan *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.calendar_today),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    readOnly: true,
                    validator: (value) {
                      if (value?.isEmpty == true)
                        return 'Pilih tanggal pemerahan';
                      return null;
                    },
                    onTap: () async {
                      final date = await showDatePicker(
                        context: context,
                        initialDate: DateTime.parse(_editDateController.text),
                        firstDate: DateTime(2020),
                        lastDate: DateTime.now().add(Duration(days: 1)),
                      );
                      if (date != null) {
                        final dateString =
                            DateFormat('yyyy-MM-dd').format(date);
                        setState(() {
                          _editDateController.text = dateString;
                          selectedSession!['milking_time'] =
                              '${dateString}T${_editTimeController.text}';
                        });
                      }
                    },
                  ),
                  SizedBox(height: 16),

                  // Time input
                  TextFormField(
                    controller: _editTimeController,
                    decoration: InputDecoration(
                      labelText: 'Waktu Pemerahan *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.access_time),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    readOnly: true,
                    validator: (value) {
                      if (value?.isEmpty == true)
                        return 'Pilih waktu pemerahan';
                      return null;
                    },
                    onTap: () async {
                      final currentTime = _editTimeController.text.split(':');
                      final time = await showTimePicker(
                        context: context,
                        initialTime: TimeOfDay(
                          hour: int.parse(currentTime[0]),
                          minute: int.parse(currentTime[1]),
                        ),
                      );
                      if (time != null) {
                        final timeString =
                            '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
                        setState(() {
                          _editTimeController.text = timeString;
                          selectedSession!['milking_time'] =
                              '${_editDateController.text}T$timeString';
                        });
                      }
                    },
                  ),
                  SizedBox(height: 16),

                  // Quick time buttons
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Waktu Cepat:',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildQuickTimeButton(
                              '05:00', 'Pagi', Icons.wb_sunny, Colors.orange,
                              isEdit: true),
                          _buildQuickTimeButton(
                              '14:00', 'Siang', Icons.wb_cloudy, Colors.blue,
                              isEdit: true),
                          _buildQuickTimeButton(
                              '18:00', 'Sore', Icons.nights_stay, Colors.indigo,
                              isEdit: true),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Notes section with quick notes
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Catatan (Opsional)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[800],
                        ),
                      ),
                      SizedBox(height: 8),

                      // Quick notes buttons
                      Text(
                        'Catatan Cepat:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          _buildQuickNoteButton('Kondisi Sehat', Icons.favorite,
                              Colors.red, true),
                          _buildQuickNoteButton('Produksi Normal',
                              Icons.check_circle, Colors.green, true),
                          _buildQuickNoteButton('Pemerahan Lancar',
                              Icons.schedule, Colors.blue, true),
                          _buildQuickNoteButton('Perlu Perhatian',
                              Icons.warning, Colors.orange, true),
                          _buildQuickNoteButton('Kualitas Baik', Icons.thumb_up,
                              Colors.purple, true),
                          _buildQuickNoteButton('Sapi Stress',
                              Icons.sentiment_dissatisfied, Colors.grey, true),
                          _buildQuickNoteButton('Produksi Menurun',
                              Icons.trending_down, Colors.red, true),
                          _buildQuickNoteButton(
                              'Peralatan OK', Icons.build, Colors.green, true),
                        ],
                      ),

                      // Clear all notes button
                      if (selectedSession!['notes']?.toString().isNotEmpty ==
                          true)
                        Container(
                          margin: EdgeInsets.only(top: 8),
                          child: OutlinedButton.icon(
                            onPressed: () => setState(() {
                              _editNotesController.clear();
                              selectedSession!['notes'] = '';
                            }),
                            icon: Icon(Icons.clear, size: 16),
                            label: Text('Hapus Semua Catatan'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red[700],
                              side: BorderSide(color: Colors.red[300]!),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                            ),
                          ),
                        ),

                      SizedBox(height: 12),

                      // Notes text field
                      TextFormField(
                        controller: _editNotesController,
                        decoration: InputDecoration(
                          labelText: 'Catatan Detail',
                          hintText:
                              'Masukkan catatan tentang sesi pemerahan ini atau gunakan pilihan catatan cepat di atas...',
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8)),
                          prefixIcon: Icon(Icons.note),
                        ),
                        maxLines: 4,
                        maxLength: 500,
                        onChanged: (value) => setState(() {
                          selectedSession!['notes'] = value;
                        }),
                      ),

                      // Character count
                      if (selectedSession!['notes']?.toString().isNotEmpty ==
                          true)
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          child: Text(
                            'Karakter: ${selectedSession!['notes']?.toString().length ?? 0}/500',
                            style: TextStyle(
                              fontSize: 12,
                              color: (selectedSession!['notes']
                                              ?.toString()
                                              .length ??
                                          0) >
                                      450
                                  ? Colors.red[600]
                                  : Colors.grey[600],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed:
                        isActionLoading ? null : () => Navigator.pop(context),
                    child: isActionLoading
                        ? SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text('Batal'),
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: isActionLoading
                        ? null
                        : () {
                            if (!isActionLoading) {
                              _handleEditSession();
                            }
                          },
                    child: isActionLoading
                        ? SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text('Perbarui'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange[700],
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Build quick note button
  Widget _buildQuickNoteButton(
      String note, IconData icon, Color color, bool isEdit) {
    return OutlinedButton(
      onPressed: () {
        setState(() {
          String currentNotes = isEdit
              ? (_editNotesController.text.isEmpty
                  ? ''
                  : _editNotesController.text)
              : (_notesController.text.isEmpty ? '' : _notesController.text);

          String newNotes = currentNotes.isEmpty
              ? note
              : currentNotes.contains(note)
                  ? currentNotes
                  : '$currentNotes, $note';

          if (isEdit) {
            _editNotesController.text = newNotes;
            selectedSession!['notes'] = newNotes;
          } else {
            _notesController.text = newNotes;
            newSession['notes'] = newNotes;
          }
        });
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          SizedBox(width: 4),
          Text(
            note,
            style: TextStyle(
              fontSize: 10,
              color: color,
            ),
          ),
        ],
      ),
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withOpacity(0.5)),
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
    );
  }

  // Get volume category helper
  String _getVolumeCategory(String volumeStr) {
    final volume = double.tryParse(volumeStr) ?? 0.0;
    if (volume < 3) return '(Volume Rendah)';
    if (volume <= 10) return '(Volume Normal)';
    if (volume <= 20) return '(Volume Tinggi)';
    return '(Volume Sangat Tinggi)';
  }

  // Build quick time button
  Widget _buildQuickTimeButton(
      String time, String label, IconData icon, Color color,
      {bool isEdit = false}) {
    return OutlinedButton(
      onPressed: () {
        setState(() {
          if (isEdit) {
            _editTimeController.text = time;
            selectedSession!['milking_time'] =
                '${_editDateController.text}T$time';
          } else {
            _timeController.text = time;
            newSession['milking_time'] = '${_dateController.text}T$time';
          }
        });
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          SizedBox(width: 4),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                time,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withOpacity(0.5)),
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }
}
