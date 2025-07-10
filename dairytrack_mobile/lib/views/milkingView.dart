import 'dart:async';
import 'dart:io';
import 'package:dairytrack_mobile/views/addMilking.dart';
import 'package:dairytrack_mobile/views/editMilking.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:dairytrack_mobile/controller/APIURL1/milkingSessionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/usersManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';

class MilkingView extends StatefulWidget {
  @override
  _MilkingViewState createState() => _MilkingViewState();
}

class _MilkingViewState extends State<MilkingView> {
  final _milkingController = MilkingSessionController();
  final _cowController = CowManagementController();
  final _userController = UsersManagementController();
  final _cattleController = CattleDistributionController();
  final _scrollController = ScrollController();

  Map<String, dynamic>? currentUser;
  List<dynamic> sessions = [], cowList = [], userManagedCows = [], milkers = [];
  bool isActionLoading = false, loading = true, isGlobalLoading = false;
  String? error,
      searchTerm = '',
      selectedCow = '',
      selectedMilker = '',
      selectedDate = '';
  int currentPage = 1, sessionsPerPage = 10;

  @override
  void initState() {
    super.initState();
    _initializeData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _initializeData() async {
    await _getCurrentUser();
    await _fetchData();
  }

  Future<void> _getCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');
      if (userId == null) return;

      setState(() {
        currentUser = {
          'id': userId,
          'user_id': userId,
          'name': prefs.getString('userName') ?? '',
          'username': prefs.getString('userUsername') ?? '',
          'email': prefs.getString('userEmail') ?? '',
          'role': prefs.getString('userRole') ?? 'Farmer',
          'role_id': _getRoleId(prefs.getString('userRole')),
          'token': prefs.getString('userToken') ?? '',
        };
      });
    } catch (e) {
      print('Error getting current user: $e');
    }
  }

  int _getRoleId(String? role) {
    switch (role) {
      case 'Admin':
        return 1;
      case 'Supervisor':
        return 2;
      default:
        return 3;
    }
  }

  Future<void> _fetchData() async {
    setState(() {
      loading = isGlobalLoading = true;
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
      setState(() => error = e.toString());
    } finally {
      setState(() => loading = isGlobalLoading = false);
    }
  }

  Future<void> _fetchMilkingSessions() async {
    try {
      final result = await _milkingController.getMilkingSessions();
      setState(() => sessions = result);
    } catch (e) {
      print('Error fetching milking sessions: $e');
      setState(() => sessions = []);
    }
  }

  Future<void> _fetchCows() async {
    try {
      final result = await _cowController.listCows();
      setState(() => cowList = result);
    } catch (e) {
      print('Error fetching cows: $e');
      setState(() => cowList = []);
    }
  }

  Future<void> _fetchUserManagedCows() async {
    if (currentUser == null || currentUser!['role_id'] == 1) return;

    try {
      final userId = currentUser!['id'] ?? currentUser!['user_id'];
      final result = await _cattleController.listCowsByUser(userId);
      if (result['success'] == true) {
        final cowsData = (result['data']?['cows'] as List?) ?? [];
        setState(() => userManagedCows = cowsData);
      }
    } catch (e) {
      print('Error fetching user managed cows: $e');
      setState(() => userManagedCows = []);
    }
  }

  Future<void> _fetchFarmers() async {
    try {
      final result = await _userController.listUsers();
      setState(() {
        milkers =
            result.where((user) => user.roleId.toString() == '3').toList();
      });
    } catch (e) {
      print('Error fetching farmers: $e');
      setState(() => milkers = []);
    }
  }

  String _getLocalDateString([DateTime? date]) =>
      DateFormat('yyyy-MM-dd').format(date ?? DateTime.now());

  String _getSessionLocalDate(String timestamp) {
    try {
      return _getLocalDateString(DateTime.parse(timestamp));
    } catch (e) {
      return '';
    }
  }

  Map<String, dynamic> get _milkStats {
    final today = _getLocalDateString();
    var baseSessions = sessions;

    if (currentUser?['role_id'] != 1 && userManagedCows.isNotEmpty) {
      final managedCowIds =
          userManagedCows.map((cow) => cow['id'] ?? cow.id).toSet();
      baseSessions =
          sessions.where((s) => managedCowIds.contains(s['cow_id'])).toList();
    }

    final filteredSessions = baseSessions.where(_matchesFilters).toList();
    final todaySessions = filteredSessions
        .where((s) => _getSessionLocalDate(s['milking_time']) == today)
        .toList();

    final totalVolume = _sumVolume(filteredSessions);
    final baseTotalVolume = _sumVolume(baseSessions);
    final todayVolume = _sumVolume(todaySessions);
    final baseTodaySessions = baseSessions
        .where((s) => _getSessionLocalDate(s['milking_time']) == today)
        .toList();
    final baseTodayVolume = _sumVolume(baseTodaySessions);

    final hasActiveFilters = searchTerm!.isNotEmpty ||
        selectedCow!.isNotEmpty ||
        selectedMilker!.isNotEmpty ||
        selectedDate!.isNotEmpty;

    return {
      'totalVolume': totalVolume.toStringAsFixed(2),
      'totalSessions': filteredSessions.length,
      'todayVolume': todayVolume.toStringAsFixed(2),
      'todaySessions': todaySessions.length,
      'avgVolumePerSession': filteredSessions.isEmpty
          ? '0.00'
          : (totalVolume / filteredSessions.length).toStringAsFixed(2),
      'baseTotalVolume': baseTotalVolume.toStringAsFixed(2),
      'baseTotalSessions': baseSessions.length,
      'baseTodayVolume': baseTodayVolume.toStringAsFixed(2),
      'baseTodaySessions': baseTodaySessions.length,
      'baseAvgVolumePerSession': baseSessions.isEmpty
          ? '0.00'
          : (baseTotalVolume / baseSessions.length).toStringAsFixed(2),
      'hasActiveFilters': hasActiveFilters,
    };
  }

  double _sumVolume(List<dynamic> sessions) => sessions.fold(0.0,
      (sum, s) => sum + (double.tryParse(s['volume']?.toString() ?? '0') ?? 0));

  bool _matchesFilters(dynamic session) {
    if (searchTerm!.isNotEmpty) {
      final searchLower = searchTerm?.toLowerCase();
      if (!(session['cow_name']
                  ?.toString()
                  .toLowerCase()
                  .contains(searchLower!) ==
              true ||
          session['milker_name']
                  ?.toString()
                  .toLowerCase()
                  .contains(searchLower!) ==
              true ||
          session['volume']?.toString().contains(searchTerm!) == true ||
          session['notes']?.toString().toLowerCase().contains(searchLower!) ==
              true ||
          _getSessionLocalDate(session['milking_time'])
              .contains(searchTerm!))) {
        return false;
      }
    }

    return (selectedCow!.isEmpty ||
            session['cow_id'].toString() == selectedCow) &&
        (selectedMilker!.isEmpty ||
            session['milker_id'].toString() == selectedMilker) &&
        (selectedDate!.isEmpty ||
            _getSessionLocalDate(session['milking_time']) == selectedDate);
  }

  Map<String, dynamic> get _filteredAndPaginatedSessions {
    var filteredSessions = sessions;

    if (currentUser?['role_id'] != 1 && userManagedCows.isNotEmpty) {
      final managedCowIds =
          userManagedCows.map((cow) => cow['id'] ?? cow.id).toSet();
      filteredSessions =
          sessions.where((s) => managedCowIds.contains(s['cow_id'])).toList();
    }

    filteredSessions = filteredSessions.where(_matchesFilters).toList();
    filteredSessions.sort((a, b) => DateTime.parse(b['milking_time'])
        .compareTo(DateTime.parse(a['milking_time'])));

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

  Map<String, List<Map<String, dynamic>>> get _uniqueOptions {
    final uniqueCows = <String, Map<String, dynamic>>{};
    final uniqueMilkers = <String, Map<String, dynamic>>{};
    var filteredSessions = sessions;

    if (currentUser?['role_id'] != 1 && userManagedCows.isNotEmpty) {
      final managedCowIds =
          userManagedCows.map((cow) => cow['id'] ?? cow.id).toSet();
      filteredSessions =
          sessions.where((s) => managedCowIds.contains(s['cow_id'])).toList();
    }

    for (final session in filteredSessions) {
      final cowId = session['cow_id']?.toString();
      if (cowId != null && !uniqueCows.containsKey(cowId)) {
        uniqueCows[cowId] = {
          'id': cowId,
          'name': session['cow_name'] ?? 'Cow #$cowId',
        };
      }

      final milkerId = session['milker_id']?.toString();
      if (milkerId != null && !uniqueMilkers.containsKey(milkerId)) {
        uniqueMilkers[milkerId] = {
          'id': milkerId,
          'name': session['milker_name'] ?? 'Milker #$milkerId',
        };
      }
    }

    return {
      'cows': uniqueCows.values.toList(),
      'milkers': uniqueMilkers.values.toList()
    };
  }

  Widget _getMilkingTimeLabel(String timeStr) {
    final date = DateTime.parse(timeStr);
    final hours = date.hour;
    final timeLabel = DateFormat('HH:mm').format(date);

    final periodInfo = hours < 12
        ? _PeriodInfo(Colors.orange, 'Pagi', Icons.wb_sunny)
        : hours < 18
            ? _PeriodInfo(Colors.blue, 'Siang', Icons.wb_cloudy)
            : _PeriodInfo(Colors.indigo, 'Sore', Icons.nights_stay);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(timeLabel,
            style: TextStyle(
                fontFamily: 'monospace',
                fontWeight: FontWeight.bold,
                fontSize: 12)),
        SizedBox(width: 4),
        Container(
          padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
          decoration: BoxDecoration(
              color: periodInfo.color, borderRadius: BorderRadius.circular(10)),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(periodInfo.icon, size: 10, color: Colors.white),
              SizedBox(width: 2),
              Text(periodInfo.label,
                  style: TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                      fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }

  void _openAddModal() => showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => AddMilkingModal(
          currentUser: currentUser,
          cowList: cowList,
          userManagedCows: userManagedCows,
          onSessionAdded: _fetchData,
        ),
      );

  void _openEditModal(dynamic session) => showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => EditMilkingModal(
          currentUser: currentUser,
          cowList: cowList,
          userManagedCows: userManagedCows,
          session: session,
          onSessionUpdated: _fetchData,
        ),
      );

  Future<void> _handleDeleteSession(int sessionId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF23272F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: Colors.red, size: 28),
            SizedBox(width: 8),
            Text('Confirm Delete',
                style: TextStyle(
                    fontWeight: FontWeight.bold, color: Colors.red[300])),
          ],
        ),
        content: Text(
          'Are you sure you want to delete this milking session? This action cannot be undone.',
          style: TextStyle(fontSize: 14, color: Colors.white),
        ),
        actions: [
          TextButton(
            onPressed: (isActionLoading || isGlobalLoading)
                ? null
                : () => Navigator.pop(context, false),
            child: Text('Cancel',
                style: TextStyle(
                    color: Color(0xFF3D90D7), fontWeight: FontWeight.bold)),
          ),
          ElevatedButton.icon(
            onPressed: (isActionLoading || isGlobalLoading)
                ? null
                : () => Navigator.pop(context, true),
            icon: Icon(Icons.delete, size: 16, color: Colors.white),
            label: Text('Delete',
                style: TextStyle(
                    fontWeight: FontWeight.bold, color: Colors.white)),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red[700],
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => isActionLoading = isGlobalLoading = true);
    try {
      final response = await _milkingController.deleteMilkingSession(sessionId);
      if (response['success'] == true) {
        _showSuccessDialog('Milking session successfully deleted');
        await _fetchData();
      } else {
        _showErrorDialog(
            response['message'] ?? 'Failed to delete milking session');
      }
    } catch (e) {
      _showErrorDialog('There is an error: $e');
    } finally {
      setState(() => isActionLoading = isGlobalLoading = false);
    }
  }

  Future<void> _exportToPDF() async {
    try {
      final response = await _milkingController.exportMilkingSessionsToPDF();
      if (response['success'] == true) {
        final file = File(
            '${(await getApplicationDocumentsDirectory()).path}/milking_sessions.pdf');
        await file.writeAsBytes(response['data']);
        OpenFile.open(file.path);
      } else {
        _showErrorDialog(response['message'] ?? 'Failed to export to PDF');
      }
    } catch (e) {
      _showErrorDialog('There is an error: $e');
    }
  }

  Future<void> _exportToExcel() async {
    try {
      final response = await _milkingController.exportMilkingSessionsToExcel();
      if (response['success'] == true) {
        final file = File(
            '${(await getApplicationDocumentsDirectory()).path}/milking_sessions.xlsx');
        await file.writeAsBytes(response['data']);
        OpenFile.open(file.path);
      } else {
        _showErrorDialog(response['message'] ?? 'Gagal mengekspor ke Excel');
      }
    } catch (e) {
      _showErrorDialog('There is an error: $e');
    }
  }

  void _showErrorDialog(String message) => showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF23272F),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
              Text('There is an error',
                  style: TextStyle(
                      color: Colors.red[200],
                      fontWeight: FontWeight.bold,
                      fontSize: 18)),
            ],
          ),
          content: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info, color: Colors.red[200], size: 20),
              SizedBox(width: 10),
              Expanded(
                  child: Text(message,
                      style: TextStyle(
                          color: Colors.white, fontSize: 15, height: 1.5))),
            ],
          ),
          actions: [
            TextButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: Icon(Icons.close, color: Colors.blue[200]),
              label: Text('Close',
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

  void _showSuccessDialog(String message) => showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF23272F),
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
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
              Text('Berhasil!',
                  style: TextStyle(
                      color: Colors.greenAccent[200],
                      fontWeight: FontWeight.bold,
                      fontSize: 18)),
            ],
          ),
          content: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline,
                  color: Colors.greenAccent[100], size: 20),
              SizedBox(width: 10),
              Expanded(
                  child: Text(message,
                      style: TextStyle(
                          color: Colors.white, fontSize: 15, height: 1.5))),
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

  // ...existing code...
  Widget _buildCompactStatCard(
      String title, String value, IconData icon, Color color) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      padding: EdgeInsets.symmetric(vertical: 18, horizontal: 14),
      decoration: BoxDecoration(
        color: Colors.white, // Basic background
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.grey[300]!, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.08),
            blurRadius: 12,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          CircleAvatar(
            backgroundColor: color.withOpacity(0.15),
            radius: 28,
            child: Icon(icon, color: color, size: 32), // Only icon is colored
          ),
          SizedBox(height: 10),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.blueGrey[900], // Basic color
              letterSpacing: 0.5,
            ),
          ),
          SizedBox(height: 6),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: Colors.blueGrey[700], // Basic color
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
            ),
          ),
          SizedBox(height: 10),
          Container(
            width: 38,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey[200], // Basic color
              borderRadius: BorderRadius.circular(2),
            ),
          ),
        ],
      ),
    );
  }

  void _clearAllFilters() {
    setState(() {
      searchTerm = selectedCow = selectedMilker = selectedDate = '';
      currentPage = 1;
    });
  }

  Widget _buildAnimatedDetailCard(String title, IconData titleIcon,
      Color accentColor, List<Widget> children, int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 400 + index * 100),
      builder: (context, value, child) => Opacity(
        opacity: value,
        child: Transform.translate(
            offset: Offset(0, 20 * (1 - value)), child: child),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: accentColor.withOpacity(0.1),
                blurRadius: 12,
                offset: Offset(0, 4))
          ],
          border: Border.all(color: accentColor.withOpacity(0.2), width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
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
                    bottom: BorderSide(color: accentColor.withOpacity(0.2))),
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
                  Text(title,
                      style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: accentColor.withOpacity(0.8))),
                ],
              ),
            ),
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(children: children),
            ),
          ],
        ),
      ),
    );
  }

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
                  color: Colors.black26, blurRadius: 20, offset: Offset(0, 10))
            ],
          ),
          child: Column(
            children: [
              Container(
                padding: EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                      colors: [Color(0xFF3D90D7), Colors.blue[800]!]),
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
                          Text('Milking Session Details',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold)),
                          Text('Complete session information #${session['id']}',
                              style: TextStyle(
                                  color: Colors.white70, fontSize: 14)),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: Icon(Icons.close, color: Colors.white, size: 28),
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white.withOpacity(0.2),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
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
                      _buildAnimatedDetailCard(
                        'Cattle Information',
                        Icons.pets,
                        Colors.pink,
                        [
                          _buildDetailInfoRow('Cow Name',
                              session['cow_name'] ?? 'Unknown', Icons.pets),
                          _buildDetailInfoRow('ID Sapi',
                              session['cow_id'].toString(), Icons.fingerprint),
                        ],
                        1,
                      ),
                      SizedBox(height: 16),
                      _buildAnimatedDetailCard(
                        'Informasi Pemerah',
                        Icons.person,
                        Colors.green,
                        [
                          _buildDetailInfoRow(
                              'Milker Name',
                              session['milker_name'] ?? 'Unknown',
                              Icons.person),
                          _buildDetailInfoRow('ID Pemerah',
                              session['milker_id'].toString(), Icons.badge),
                        ],
                        2,
                      ),
                      if (session['notes'] != null &&
                          session['notes'].toString().isNotEmpty) ...[
                        SizedBox(height: 16),
                        _buildAnimatedDetailCard(
                          'Notes',
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
                                    fontStyle: FontStyle.italic),
                              ),
                            ),
                          ],
                          3,
                        ),
                      ],
                      SizedBox(height: 20),
                      Container(
                        width: double.infinity,
                        child: ElevatedButton.icon(
                          onPressed: () => Navigator.pop(context),
                          icon: Icon(Icons.check, color: Colors.white),
                          label: Text('Close Details',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold)),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Color(0xFF3D90D7),
                            padding: EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
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

  Widget _buildDetailInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: EdgeInsets.all(6),
            decoration: BoxDecoration(
                color: Colors.grey[200],
                borderRadius: BorderRadius.circular(6)),
            child: Icon(icon, size: 16, color: Colors.grey[600]),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                        fontWeight: FontWeight.w500)),
                SizedBox(height: 2),
                Text(value,
                    style: TextStyle(
                        fontSize: 14,
                        color: Colors.blueGrey[800],
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCompactSessionCard(dynamic session, int index) {
    final isSupervisor = currentUser?['role_id'] == 2;
    final volume = double.parse(session['volume'].toString());
    final volumeColor = Color(0xFF3D90D7).withOpacity(0.8);

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 400 + index * 60),
      builder: (context, value, child) => Opacity(
        opacity: value,
        child: Transform.translate(
            offset: Offset(0, 30 * (1 - value)), child: child),
      ),
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
            child: Icon(Icons.water_drop, color: volumeColor, size: 28),
          ),
          title: Text(
            '${session['cow_name'] ?? 'Cow #${session['cow_id']}'} • ${session['milker_name'] ?? 'Milker #${session['milker_id']}'}',
            style: TextStyle(
                fontWeight: FontWeight.w600,
                fontSize: 14,
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
                color: volumeColor, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      _buildInfoContainer(
                        session['cow_name'] ?? 'ID: ${session['cow_id']}',
                        'Cow',
                        Icons.pets,
                        Color(0xFF3D90D7),
                      ),
                      SizedBox(width: 12),
                      _buildInfoContainer(
                        session['milker_name'] ?? 'ID: ${session['milker_id']}',
                        'Milker',
                        Icons.person,
                        Color(0xFF3D90D7),
                      ),
                    ],
                  ),
                  SizedBox(height: 16),
                  Row(
                    children: [
                      _buildDateTimeContainer(
                        DateFormat('dd MMM yyyy')
                            .format(DateTime.parse(session['milking_time'])),
                        Icons.calendar_today,
                      ),
                      SizedBox(width: 10),
                      _buildDateTimeContainer(
                        DateFormat('HH:mm')
                            .format(DateTime.parse(session['milking_time'])),
                        Icons.access_time,
                      ),
                    ],
                  ),
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
                        Text('Volume: ${volume.toStringAsFixed(1)} L',
                            style: TextStyle(
                                fontSize: 13,
                                color: Color(0xFF3D90D7),
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
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
                                  fontStyle: FontStyle.italic),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  Divider(height: 24, color: Colors.grey[300]),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      _buildActionButton(
                        Icons.visibility,
                        "Detail",
                        Colors.blueGrey[600]!,
                        () => _showSessionDetails(session),
                      ),
                      if (!isSupervisor) ...[
                        SizedBox(width: 8),
                        _buildActionButton(
                          Icons.edit,
                          "Edit",
                          Color(0xFF3D90D7),
                          () => _openEditModal(session),
                        ),
                        SizedBox(width: 8),
                        _buildActionButton(
                          Icons.delete,
                          "Delete",
                          Colors.red[600]!,
                          () => _handleDeleteSession(session['id']),
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

  Widget _buildInfoContainer(
      String title, String subtitle, IconData icon, Color color) {
    return Expanded(
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
              backgroundColor: color.withOpacity(0.15),
              child: Icon(icon, color: color, size: 20),
              radius: 18,
            ),
            SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          fontSize: 13,
                          color: Colors.blueGrey[800],
                          fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis),
                  Text(subtitle,
                      style:
                          TextStyle(fontSize: 10, color: Colors.blueGrey[600])),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateTimeContainer(String text, IconData icon) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.blueGrey[700]),
          SizedBox(width: 6),
          Text(text,
              style: TextStyle(
                  fontSize: 12,
                  color: Colors.blueGrey[800],
                  fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildActionButton(
      IconData icon, String label, Color color, VoidCallback onPressed) {
    return ElevatedButton.icon(
      icon: Icon(icon, size: 18, color: Colors.white),
      label: Text(label, style: TextStyle(fontSize: 13, color: Colors.white)),
      onPressed: (isActionLoading || isGlobalLoading) ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildEmptyState() {
    final hasFilters = searchTerm!.isNotEmpty ||
        selectedCow!.isNotEmpty ||
        selectedMilker!.isNotEmpty ||
        selectedDate!.isNotEmpty;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(hasFilters ? Icons.search_off : Icons.water_drop_outlined,
              size: 64, color: Colors.grey[400]),
          SizedBox(height: 16),
          Text(
            hasFilters
                ? 'No sessions match your filters'
                : 'No milking sessions yet',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600]),
          ),
          SizedBox(height: 8),
          Text(
            hasFilters
                ? 'Try adjusting your search or filter criteria'
                : 'Start by adding your first milking session',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 20),
          if (hasFilters)
            _buildClearFilterButton()
          else if (currentUser?['role_id'] != 2)
            _buildAddSessionButton(),
        ],
      ),
    );
  }

  Widget _buildClearFilterButton() {
    return ElevatedButton.icon(
      onPressed: _clearAllFilters,
      icon: Icon(Icons.clear_all, color: Colors.white),
      label: Text('Clear Filters', style: TextStyle(color: Colors.white)),
      style: ElevatedButton.styleFrom(
        backgroundColor: Color(0xFF3D90D7),
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildAddSessionButton() {
    return ElevatedButton.icon(
      onPressed: isGlobalLoading ? null : _openAddModal,
      icon: Icon(Icons.add, color: Colors.white),
      label: Text('Add Milking Session', style: TextStyle(color: Colors.white)),
      style: ElevatedButton.styleFrom(
        backgroundColor: Color(0xFF3D90D7),
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildPagination(Map<String, dynamic> paginatedData) {
    final totalPages = paginatedData['totalPages'] as int;
    final totalItems = paginatedData['totalItems'] as int;

    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Colors.grey[300]!)),
      ),
      child: Row(
        children: [
          Flexible(
            flex: 2,
            child: Text(
              'Page $currentPage of $totalPages ($totalItems items)',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          SizedBox(width: 8),
          Flexible(
            flex: 3,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildPaginationButton(Icons.chevron_left, currentPage > 1,
                      () => setState(() => currentPage--)),
                  SizedBox(width: 8),
                  ..._buildPageNumbers(totalPages),
                  SizedBox(width: 8),
                  _buildPaginationButton(
                      Icons.chevron_right,
                      currentPage < totalPages,
                      () => setState(() => currentPage++)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaginationButton(
      IconData icon, bool enabled, VoidCallback onPressed) {
    return IconButton(
      onPressed: enabled ? onPressed : null,
      icon: Icon(icon),
      style: IconButton.styleFrom(
        backgroundColor: enabled ? Color(0xFF3D90D7) : Colors.grey[300],
        foregroundColor: enabled ? Colors.white : Colors.grey[500],
      ),
    );
  }

  List<Widget> _buildPageNumbers(int totalPages) {
    return List.generate(
      totalPages > 5 ? 5 : totalPages,
      (index) {
        int pageNumber;
        if (totalPages <= 5) {
          pageNumber = index + 1;
        } else if (currentPage <= 3) {
          pageNumber = index + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNumber = totalPages - 4 + index;
        } else {
          pageNumber = currentPage - 2 + index;
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
                border: Border.all(
                    color: currentPage == pageNumber
                        ? Color(0xFF3D90D7)
                        : Colors.grey[300]!),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Center(
                child: Text(
                  pageNumber.toString(),
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: currentPage == pageNumber
                        ? Colors.white
                        : Colors.grey[600],
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  void _showCowFilterDialog(List<Map<String, dynamic>> cows) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Filter by Cow',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Container(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: cows.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return _buildFilterOption('All', selectedCow!.isEmpty, () {
                  setState(() => selectedCow = '');
                  Navigator.pop(context);
                });
              }
              final cow = cows[index - 1];
              return _buildFilterOption(cow['name'], selectedCow == cow['id'],
                  () {
                setState(() => selectedCow = cow['id']);
                Navigator.pop(context);
              });
            },
          ),
        ),
        actions: [
          TextButton(
              child: Text('Cancel'), onPressed: () => Navigator.pop(context))
        ],
      ),
    );
  }

  ListTile _buildFilterOption(String title, bool selected, VoidCallback onTap) {
    return ListTile(
      title: Text(title, style: TextStyle(fontSize: 14)),
      selected: selected,
      leading: Icon(
          selected ? Icons.check_circle : Icons.radio_button_unchecked,
          color: selected ? Colors.green : null,
          size: 20),
      contentPadding: EdgeInsets.symmetric(horizontal: 8, vertical: 0),
      dense: true,
      onTap: onTap,
    );
  }

  void _showMilkerFilterDialog(List<Map<String, dynamic>> milkers) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Filter by Milker',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Container(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: milkers.length + 1,
            itemBuilder: (context, index) {
              if (index == 0) {
                return _buildFilterOption('All', selectedMilker!.isEmpty, () {
                  setState(() => selectedMilker = '');
                  Navigator.pop(context);
                });
              }
              final milker = milkers[index - 1];
              return _buildFilterOption(
                  milker['name'], selectedMilker == milker['id'], () {
                setState(() => selectedMilker = milker['id']);
                Navigator.pop(context);
              });
            },
          ),
        ),
        actions: [
          TextButton(
              child: Text('Cancel'), onPressed: () => Navigator.pop(context))
        ],
      ),
    );
  }

  Future<void> _showDatePicker() async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: selectedDate!.isNotEmpty
          ? DateTime.parse(selectedDate!)
          : DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (BuildContext context, Widget? child) {
        return Theme(
          data: ThemeData.light().copyWith(
            colorScheme: ColorScheme.light(
              primary: Color(0xFF3D90D7),
              onPrimary: Colors.white,
              surface: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        selectedDate = _getLocalDateString(picked);
        currentPage = 1;
      });
    }
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
        body: Center(child: CircularProgressIndicator()),
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
                onPressed: isGlobalLoading ? null : _fetchData,
                child: isGlobalLoading
                    ? SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white)),
                      )
                    : Text('Try again'),
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
        title: Text(
          'Milking Management',
          style: TextStyle(fontWeight: FontWeight.w600, letterSpacing: 0.5),
        ),
        backgroundColor: Color(0xFF3D90D7),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            tooltip: "Refresh data",
            onPressed: isGlobalLoading ? null : _fetchData,
          ),
          PopupMenuButton<String>(
            icon: Icon(Icons.download),
            tooltip: "Export data",
            onSelected: (value) =>
                value == 'pdf' ? _exportToPDF() : _exportToExcel(),
            itemBuilder: (context) => [
              PopupMenuItem(
                value: 'pdf',
                child: Row(
                  children: [
                    Icon(Icons.picture_as_pdf,
                        color: Colors.red[700], size: 20),
                    SizedBox(width: 12),
                    Text('Export to PDF', style: TextStyle(fontSize: 14)),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'excel',
                child: Row(
                  children: [
                    Icon(Icons.table_view, color: Colors.green[700], size: 20),
                    SizedBox(width: 12),
                    Text('Export to Excel', style: TextStyle(fontSize: 14)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchData,
        color: Color(0xFF3D90D7),
        displacement: 20,
        strokeWidth: 3,
        child: Column(
          children: [
            // Statistics Header with enhanced gradient
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Color(0xFF3D90D7), Color(0xFF2A7BBF)],
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              padding: EdgeInsets.fromLTRB(16, 24, 16, 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.analytics_outlined,
                          color: Colors.white.withOpacity(0.9), size: 20),
                      SizedBox(width: 8),
                      Text(
                        'Milking Statistics',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.9),
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      if (milkStats['hasActiveFilters']) ...[
                        SizedBox(width: 8),
                        Container(
                          padding:
                              EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            'Filtered',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                      Spacer(),
                      if (milkStats['hasActiveFilters'])
                        TextButton.icon(
                          onPressed: _clearAllFilters,
                          icon: Icon(Icons.filter_list_off,
                              color: Colors.white.withOpacity(0.9), size: 16),
                          label: Text(
                            'Clear Filters',
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 12,
                            ),
                          ),
                          style: TextButton.styleFrom(
                            backgroundColor: Colors.white.withOpacity(0.1),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                            padding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 4),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 16),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    physics: BouncingScrollPhysics(),
                    child: Row(
                      children: [
                        _buildEnhancedStatCard(
                          'Total Sessions',
                          milkStats['hasActiveFilters']
                              ? milkStats['totalSessions'].toString()
                              : milkStats['baseTotalSessions'].toString(),
                          Icons.calendar_month_rounded,
                          Colors.orange[400]!,
                          milkStats['hasActiveFilters']
                              ? 'of ${milkStats['baseTotalSessions']} total'
                              : null,
                        ),
                        _buildEnhancedStatCard(
                          'Total Volume',
                          '${milkStats['hasActiveFilters'] ? milkStats['totalVolume'] : milkStats['baseTotalVolume']} L',
                          Icons.water_drop_rounded,
                          Colors.green[500]!,
                          milkStats['hasActiveFilters']
                              ? 'of ${milkStats['baseTotalVolume']} L total'
                              : null,
                        ),
                        _buildEnhancedStatCard(
                          'Today',
                          '${milkStats['hasActiveFilters'] ? milkStats['todayVolume'] : milkStats['baseTodayVolume']} L',
                          Icons.today_rounded,
                          Colors.blue[400]!,
                          milkStats['hasActiveFilters']
                              ? 'of ${milkStats['baseTodayVolume']} L today'
                              : 'Today\'s volume',
                        ),
                        _buildEnhancedStatCard(
                          'Average',
                          '${milkStats['hasActiveFilters'] ? milkStats['avgVolumePerSession'] : milkStats['baseAvgVolumePerSession']} L',
                          Icons.trending_up_rounded,
                          Colors.purple[400]!,
                          'Per session',
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Search and filter section
            Container(
              color: Colors.white,
              padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: PopupMenuButton<String>(
                          icon: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.filter_list_rounded,
                                  size: 18, color: Color(0xFF3D90D7)),
                              SizedBox(width: 2),
                              Icon(Icons.arrow_drop_down_rounded,
                                  size: 20, color: Colors.grey[700]),
                            ],
                          ),
                          tooltip: 'Filter options',
                          padding: EdgeInsets.zero,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 4,
                          offset: Offset(0, 8),
                          onSelected: (value) {
                            switch (value) {
                              case 'cow':
                                _showCowFilterDialog(uniqueOptions['cows']!);
                                break;
                              case 'milker':
                                _showMilkerFilterDialog(
                                    uniqueOptions['milkers']!);
                                break;
                              case 'date':
                                _showDatePicker();
                                break;
                              case 'clear':
                                _clearAllFilters();
                                break;
                            }
                          },
                          itemBuilder: (context) => [
                            _buildPopupMenuItem(
                                'cow', 'Filter by Cow', Icons.pets_rounded),
                            _buildPopupMenuItem('milker', 'Filter by Milker',
                                Icons.person_rounded),
                            _buildPopupMenuItem('date', 'Filter by Date',
                                Icons.calendar_today_rounded),
                            _buildPopupMenuItem('clear', 'Clear All Filters',
                                Icons.clear_all_rounded),
                          ],
                        ),
                      ),
                      SizedBox(width: 10),
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            hintText: 'Search by cow, milker, volume...',
                            hintStyle: TextStyle(
                                fontSize: 13, color: Colors.grey[500]),
                            prefixIcon: Icon(Icons.search_rounded,
                                size: 18, color: Colors.grey[600]),
                            suffixIcon: searchTerm!.isNotEmpty
                                ? IconButton(
                                    icon: Icon(Icons.clear_rounded, size: 18),
                                    onPressed: () => setState(() {
                                      searchTerm = '';
                                      currentPage = 1;
                                    }),
                                  )
                                : null,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey[300]!),
                            ),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Colors.grey[300]!),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide(color: Color(0xFF3D90D7)),
                            ),
                            filled: true,
                            fillColor: Colors.grey[100],
                            contentPadding: EdgeInsets.symmetric(
                                horizontal: 8, vertical: 10),
                            isDense: true,
                          ),
                          style: TextStyle(fontSize: 14),
                          onChanged: (value) => setState(() {
                            searchTerm = value;
                            currentPage = 1;
                          }),
                        ),
                      ),
                    ],
                  ),

                  // Active filters
                  if (selectedCow!.isNotEmpty ||
                      selectedMilker!.isNotEmpty ||
                      selectedDate!.isNotEmpty)
                    Container(
                      margin: EdgeInsets.only(top: 12),
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.blue[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.blue[100]!),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(Icons.filter_alt_rounded,
                                  size: 14, color: Colors.blue[800]),
                              SizedBox(width: 6),
                              Text(
                                'Active Filters',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: Colors.blue[800],
                                ),
                              ),
                              Spacer(),
                              InkWell(
                                onTap: _clearAllFilters,
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.clear_all_rounded,
                                        size: 14, color: Colors.blue[800]),
                                    SizedBox(width: 2),
                                    Text(
                                      'Clear All',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w500,
                                        color: Colors.blue[800],
                                      ),
                                    ),
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(4),
                              ),
                            ],
                          ),
                          SizedBox(height: 6),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            physics: BouncingScrollPhysics(),
                            child: Row(
                              children: [
                                if (selectedCow!.isNotEmpty)
                                  _buildEnhancedFilterChip(
                                    'Cow',
                                    uniqueOptions['cows']!.firstWhere(
                                        (c) => c['id'] == selectedCow)['name'],
                                    Icons.pets_rounded,
                                    Colors.blue[700]!,
                                    () => setState(() {
                                      selectedCow = '';
                                      currentPage = 1;
                                    }),
                                  ),
                                if (selectedMilker!.isNotEmpty)
                                  _buildEnhancedFilterChip(
                                    'Milker',
                                    uniqueOptions['milkers']!.firstWhere((m) =>
                                        m['id'] == selectedMilker)['name'],
                                    Icons.person_rounded,
                                    Colors.green[700]!,
                                    () => setState(() {
                                      selectedMilker = '';
                                      currentPage = 1;
                                    }),
                                  ),
                                if (selectedDate!.isNotEmpty)
                                  _buildEnhancedFilterChip(
                                    'Date',
                                    selectedDate!,
                                    Icons.calendar_today_rounded,
                                    Colors.amber[700]!,
                                    () => setState(() {
                                      selectedDate = '';
                                      currentPage = 1;
                                    }),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            // List or empty state
            Expanded(
              child: paginatedData['currentSessions'].isEmpty
                  ? _buildEmptyState()
                  : ListView.builder(
                      controller: _scrollController,
                      padding: EdgeInsets.all(12),
                      physics: BouncingScrollPhysics(),
                      itemCount: paginatedData['currentSessions'].length,
                      itemBuilder: (context, index) => _buildCompactSessionCard(
                        paginatedData['currentSessions'][index],
                        index,
                      ),
                    ),
            ),

            // Pagination
            if (paginatedData['totalPages'] > 1)
              Container(
                width: double.infinity,
                padding: EdgeInsets.fromLTRB(16, 12, 16, 16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 8,
                      offset: Offset(0, -2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Container(
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                      margin: EdgeInsets.only(bottom: 12),
                    ),
                    Row(
                      children: [
                        Flexible(
                          flex: 2,
                          child: Text(
                            'Page $currentPage of ${paginatedData['totalPages']} (${paginatedData['totalItems']} items)',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey[600]),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        SizedBox(width: 8),
                        Flexible(
                          flex: 3,
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            physics: BouncingScrollPhysics(),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _buildEnhancedPaginationButton(
                                  Icons.keyboard_double_arrow_left_rounded,
                                  currentPage > 1,
                                  () => setState(() => currentPage = 1),
                                ),
                                SizedBox(width: 6),
                                _buildEnhancedPaginationButton(
                                  Icons.chevron_left_rounded,
                                  currentPage > 1,
                                  () => setState(() => currentPage--),
                                ),
                                SizedBox(width: 10),
                                ..._buildEnhancedPageNumbers(
                                  paginatedData['totalPages'] as int,
                                ),
                                SizedBox(width: 10),
                                _buildEnhancedPaginationButton(
                                  Icons.chevron_right_rounded,
                                  currentPage < paginatedData['totalPages'],
                                  () => setState(() => currentPage++),
                                ),
                                SizedBox(width: 6),
                                _buildEnhancedPaginationButton(
                                  Icons.keyboard_double_arrow_right_rounded,
                                  currentPage < paginatedData['totalPages'],
                                  () => setState(() => currentPage =
                                      paginatedData['totalPages']),
                                ),
                              ],
                            ),
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
      floatingActionButton: isSupervisor
          ? null
          : Padding(
              padding:
                  const EdgeInsets.only(bottom: 56.0, right: 8.0), // Lebih naik
              child: FloatingActionButton.extended(
                onPressed: isGlobalLoading ? null : _openAddModal,
                backgroundColor:
                    isGlobalLoading ? Colors.grey[400] : Color(0xFF3D90D7),
                elevation: 4,
                icon: isGlobalLoading
                    ? SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Icon(Icons.add, color: Colors.white, size: 18),
                label: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.0),
                  child: Text(
                    'Add',
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                      fontSize: 12,
                      letterSpacing: 0.1,
                    ),
                  ),
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
            ),
    );
  }

  // Add this method to your class
  Widget _buildEnhancedStatCard(
      String title, String value, IconData icon, Color color,
      [String? subtitle]) {
    return Container(
      width: 140,
      margin: EdgeInsets.symmetric(horizontal: 6),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.2),
            blurRadius: 8,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 22),
          ),
          SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.blueGrey[900],
            ),
          ),
          SizedBox(height: 4),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              color: Colors.blueGrey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          if (subtitle != null) ...[
            SizedBox(height: 4),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 11,
                color: Colors.blueGrey[400],
                fontStyle: FontStyle.italic,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEnhancedFilterChip(String label, String value, IconData icon,
      Color color, VoidCallback onRemove) {
    return Container(
      margin: EdgeInsets.only(right: 8),
      child: Chip(
        avatar: Icon(icon, size: 14, color: color),
        label: Text(
          '$label: $value',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: color,
          ),
        ),
        deleteIcon: Icon(Icons.close_rounded, size: 14),
        onDeleted: onRemove,
        backgroundColor: color.withOpacity(0.12),
        side: BorderSide(color: color.withOpacity(0.3)),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        padding: EdgeInsets.symmetric(horizontal: 4),
        materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
        visualDensity: VisualDensity.compact,
      ),
    );
  }

  Widget _buildEnhancedPaginationButton(
      IconData icon, bool enabled, VoidCallback onPressed) {
    return Material(
      color: enabled ? Color(0xFF3D90D7) : Colors.grey[300],
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: enabled ? onPressed : null,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          width: 36,
          height: 36,
          child: Icon(
            icon,
            color: enabled ? Colors.white : Colors.grey[500],
            size: 20,
          ),
        ),
      ),
    );
  }

  List<Widget> _buildEnhancedPageNumbers(int totalPages) {
    List<Widget> pageNumbers = [];

    // Logic to determine which page numbers to show
    List<int> pagesToShow = [];
    if (totalPages <= 5) {
      pagesToShow = List.generate(totalPages, (i) => i + 1);
    } else if (currentPage <= 3) {
      pagesToShow = [1, 2, 3, 4, 5];
    } else if (currentPage >= totalPages - 2) {
      pagesToShow = [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      ];
    } else {
      pagesToShow = [
        currentPage - 2,
        currentPage - 1,
        currentPage,
        currentPage + 1,
        currentPage + 2
      ];
    }

    for (int pageNumber in pagesToShow) {
      final isCurrentPage = pageNumber == currentPage;

      pageNumbers.add(
        Container(
          margin: EdgeInsets.symmetric(horizontal: 2),
          child: Material(
            color: isCurrentPage ? Color(0xFF3D90D7) : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: isCurrentPage
                  ? null
                  : () => setState(() => currentPage = pageNumber),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  border: Border.all(
                    color:
                        isCurrentPage ? Color(0xFF3D90D7) : Colors.grey[300]!,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    pageNumber.toString(),
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isCurrentPage ? Colors.white : Colors.grey[700],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      );
    }

    return pageNumbers;
  }

  PopupMenuItem<String> _buildPopupMenuItem(
      String value, String text, IconData icon) {
    return PopupMenuItem(
      value: value,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: Row(
          children: [
            Icon(icon,
                size: 18,
                color: value == 'clear' ? Colors.red : Color(0xFF3D90D7)),
            SizedBox(width: 12),
            Text(
              text,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PeriodInfo {
  final Color color;
  final String label;
  final IconData icon;

  _PeriodInfo(this.color, this.label, this.icon);
}
