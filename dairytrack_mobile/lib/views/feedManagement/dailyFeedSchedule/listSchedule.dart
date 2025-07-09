import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart'; // Added for locale initialization
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controller/APIURL4/dailyScheduleController.dart';
import '../../../controller/APIURL1/cowManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import '../model/dailyFeed.dart';
import 'addSchedule.dart';
import 'editSchedule.dart';

class DailyFeedView extends StatefulWidget {
  const DailyFeedView({super.key});

  @override
  _DailyFeedViewState createState() => _DailyFeedViewState();
}

class _DailyFeedViewState extends State<DailyFeedView> {
  final DailyFeedManagementController _feedController =
      DailyFeedManagementController();
  final CowManagementController _cowController = CowManagementController();
  final CattleDistributionController _cowDistributionController =
      CattleDistributionController();
  List<DailyFeed> _feeds = [];
  List<DailyFeed> _filteredFeeds = [];
  List<Map<String, dynamic>> _groupedFeeds = [];
  List<Cow> _cows = [];
  List<Map<String, dynamic>> _cowsWithMissingSessions = [];
  bool _isLoading = true;
  bool _isLoadingCows = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String? _userRole;
  int _userId = 0;
  final List<String> _sessions = ['Pagi', 'Siang', 'Sore'];
  final Map<String, List<DailyFeed>> _feedsCache = {};
  bool _showMissingSessions = false;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Initialize locale for date formatting
    initializeDateFormatting('id', null).then((_) {
      _loadUserData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userRole = prefs.getString('userRole')?.toLowerCase();
      _userId = prefs.getInt('userId') ?? 0;
    });
    await _fetchCows();
    await _fetchDailyFeeds();
  }

  Future<void> _fetchCows() async {
    if (!mounted) return;
    setState(() => _isLoadingCows = true);
    try {
      List<Cow> cows = [];

      if (_userRole == 'farmer') {
        final response =
            await _cowDistributionController.listCowsByUser(_userId);
        if (!mounted) return;
        if (response['success']) {
          final responseData = response['data'];
          List<dynamic> cowsList;
          if (responseData is List) {
            cowsList = responseData;
          } else if (responseData is Map &&
              responseData.containsKey('cows') &&
              responseData['cows'] is List) {
            cowsList = responseData['cows'];
          } else {
            setState(() {
              _errorMessage =
                  'Unexpected response format from listCowsByUser: ${responseData.runtimeType}';
              _isLoadingCows = false;
            });
            return;
          }
          cows = cowsList
              .map((json) => Cow.fromJson(json as Map<String, dynamic>))
              .toList();
          setState(() {
            _cows = cows;
            _isLoadingCows = false;
          });
        } else {
          setState(() {
            _errorMessage =
                response['message'] ?? 'Failed to fetch cows for farmer';
            _isLoadingCows = false;
          });
        }
      } else if (_userRole == 'admin' || _userRole == 'supervisor') {
        try {
          final response = await _cowController.listCows();
          if (!mounted) return;
          cows = response;
          setState(() {
            _cows = cows;
            _isLoadingCows = false;
          });
        } catch (e) {
          if (!mounted) return;
          setState(() {
            _errorMessage = 'Error fetching cows for admin/supervisor: $e';
            _isLoadingCows = false;
          });
        }
      } else {
        setState(() {
          _errorMessage = 'Unknown role: $_userRole';
          _isLoadingCows = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching cows: $e';
        _isLoadingCows = false;
      });
    }
  }

  Future<void> _fetchDailyFeeds() async {
    if (!mounted) return;
    setState(() => _isLoading = true);

    try {
      if (_feedsCache.containsKey(_selectedDate)) {
        setState(() {
          _feeds = _feedsCache[_selectedDate]!;
          _applyFiltersAndGroup();
          _calculateMissingSessions();
          _isLoading = false;
        });
        return;
      }

      final response = await _feedController.getAllDailyFeeds(
        date: _selectedDate,
        userId: _userId,
      );

      if (!mounted) return;
      if (response['success']) {
        List<DailyFeed> feeds = (response['data'] as List)
            .map((json) => DailyFeed.fromJson(json as Map<String, dynamic>))
            .toList();

        if (_userRole == 'farmer') {
          final cowIds = _cows.map((cow) => cow.id).toSet();
          feeds = feeds.where((feed) => cowIds.contains(feed.cowId)).toList();
        }

        _feedsCache[_selectedDate] = feeds;

        setState(() {
          _feeds = feeds;
          _applyFiltersAndGroup();
          _calculateMissingSessions();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch daily feeds';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching daily feeds: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFiltersAndGroup() {
    _filteredFeeds = _feeds
        .where((feed) =>
            feed.cowName.toLowerCase().contains(_searchQuery.toLowerCase()))
        .toList();

    final grouped = _filteredFeeds.fold<Map<String, Map<String, dynamic>>>(
      {},
      (acc, feed) {
        final key = '${feed.cowId}_${feed.date}';
        if (!acc.containsKey(key)) {
          acc[key] = {
            'cowId': feed.cowId,
            'cowName': feed.cowName,
            'date': feed.date,
            'sessions': <DailyFeed>[],
          };
        }
        (acc[key]!['sessions'] as List<DailyFeed>).add(feed);
        return acc;
      },
    );
    setState(() {
      _groupedFeeds = grouped.values.toList();
    });
  }

  void _calculateMissingSessions() {
    final groupedFeeds = _feeds.fold<Map<String, Map<String, dynamic>>>(
      {},
      (acc, feed) {
        final key = '${feed.cowId}_${feed.date}';
        if (!acc.containsKey(key)) {
          acc[key] = {
            'cowId': feed.cowId,
            'cowName': feed.cowName,
            'date': feed.date,
            'sessions': <DailyFeed>[],
          };
        }
        (acc[key]!['sessions'] as List<DailyFeed>).add(feed);
        return acc;
      },
    );

    List<Cow> cowsToCheck = _cows;
    final missing = cowsToCheck
        .map((cow) {
          final key = '${cow.id}_$_selectedDate';
          final existingSessions =
              (groupedFeeds[key]?['sessions'] as List<DailyFeed>?)
                      ?.map((feed) => feed.session)
                      .toList() ??
                  [];
          final missingSessions = _sessions
              .where((session) => !existingSessions.contains(session))
              .toList();
          if (missingSessions.isNotEmpty) {
            return {
              'id': cow.id,
              'name': cow.name,
              'missingSessions': missingSessions,
            };
          }
          return null;
        })
        .whereType<Map<String, dynamic>>()
        .toList();

    setState(() {
      _cowsWithMissingSessions = missing;
    });
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.teal.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 6,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<void> _autoCreateDailyFeed(
      int cowId, String cowName, String session) async {
    final formattedDate =
        DateFormat('dd MMMM yyyy', 'id').format(DateTime.parse(_selectedDate));
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Buat Jadwal'),
        content: Text(
          'Apakah Anda mau buat jadwal sesi $session tanggal $formattedDate untuk sapi $cowName?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Ya, Buat!'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final response = await _feedController.createDailyFeed(
          cowId: cowId,
          date: _selectedDate,
          session: session,
          userId: _userId,
          items: [],
        );
        if (!mounted) return;
        if (response['success']) {
          _feedsCache.remove(_selectedDate);
          _showSnackBar(response['message']);
          await _fetchDailyFeeds();
        } else {
          _showSnackBar(response['message'] ?? 'Gagal membuat jadwal pakan.');
        }
      } catch (e) {
        if (!mounted) return;
        _showSnackBar('Error creating daily feed: $e');
      }
    }
  }

  void _addDailyFeed() {
    if (_cows.isEmpty) {
      _showSnackBar('Tidak ada sapi tersedia untuk jadwal pakan.');
      return;
    }
    try {
      // Validate _selectedDate format
      DateTime.parse(_selectedDate);
    } catch (e) {
      print('Invalid selectedDate: $_selectedDate, error: $e');
      _showSnackBar('Tanggal yang dipilih tidak valid.');
      return;
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => AddDailyFeedForm(
        cows: _cows,
        defaultDate: _selectedDate,
        controller: _feedController,
        userId: _userId,
        userRole: _userRole,
        onAdd: () {
          _feedsCache.remove(_selectedDate);
          _fetchDailyFeeds();
          _showSnackBar('Jadwal pakan berhasil ditambahkan.');
        },
        onError: _showSnackBar,
      ),
    );
  }

  void _editDailyFeed(DailyFeed feed) {
    if (_cows.isEmpty) {
      _showSnackBar('Tidak ada sapi tersedia untuk jadwal pakan.');
      return;
    }
    if (feed == null || feed.id == null) {
      _showSnackBar('Data jadwal pakan tidak valid.');
      return;
    }
    try {
      // Validate feed.date format
      DateTime.parse(feed.date);
    } catch (e) {
      print('Invalid feed.date: ${feed.date}, error: $e');
      _showSnackBar('Tanggal jadwal pakan tidak valid.');
      return;
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => EditDailyFeedForm(
        feed: feed,
        cows: _cows,
        controller: _feedController,
        userId: _userId,
        userRole: _userRole,
        onUpdate: () {
          _feedsCache.remove(_selectedDate);
          _fetchDailyFeeds();
          _showSnackBar('Jadwal pakan berhasil diperbarui.');
        },
        onError: _showSnackBar,
      ),
    );
  }

  Future<void> _deleteDailyFeed(
      int id, String cowName, String date, String session) async {
    final formattedDate =
        DateFormat('dd MMMM yyyy', 'id').format(DateTime.parse(date));
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Hapus'),
        content: Text(
          'Apakah Anda yakin ingin menghapus jadwal pakan untuk sapi $cowName pada $formattedDate sesi $session?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Ya, Hapus!'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        final response = await _feedController.deleteDailyFeed(id, _userId);
        if (!mounted) return;
        if (response['success']) {
          _feedsCache.remove(_selectedDate);
          _showSnackBar(response['message']);
          await _fetchDailyFeeds();
        } else {
          _showSnackBar(response['message'] ?? 'Gagal menghapus jadwal pakan.');
        }
      } catch (e) {
        if (!mounted) return;
        _showSnackBar('Error deleting daily feed: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFarmer = _userRole == 'farmer';

    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text(
          'Jadwal Pakan Harian',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade600,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          // Show warning icon only if there are cows with missing sessions
          if (_cowsWithMissingSessions.isNotEmpty)
            IconButton(
              icon: Icon(
                _showMissingSessions
                    ? Icons.warning_amber_rounded
                    : Icons.warning,
                color: Colors.white,
              ),
              onPressed: () {
                setState(() {
                  _showMissingSessions = !_showMissingSessions;
                });
              },
              tooltip: _showMissingSessions
                  ? 'Sembunyikan Sapi tanpa Jadwal'
                  : 'Tampilkan Sapi tanpa Jadwal',
            ),
        ],
      ),
      floatingActionButton: isFarmer
          ? FloatingActionButton(
              onPressed: _addDailyFeed,
              backgroundColor: Colors.teal.shade600,
              child: const Icon(Icons.add, color: Colors.white),
              tooltip: 'Tambah Jadwal Pakan',
            )
          : null,
      body: Column(
        children: [
          // Date Picker and Search Bar (unchanged)
          Container(
            color: Colors.teal.shade600,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    readOnly: true,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      labelText: 'Pilih Tanggal',
                      labelStyle: const TextStyle(color: Colors.white70),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.white24,
                      prefixIcon: const Icon(Icons.calendar_today,
                          color: Colors.white70),
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 0, horizontal: 12),
                    ),
                    controller: TextEditingController(
                      text: DateFormat('dd MMM yyyy', 'id')
                          .format(DateTime.parse(_selectedDate)),
                    ),
                    onTap: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.parse(_selectedDate),
                        firstDate: DateTime(2000),
                        lastDate: DateTime.now(),
                        builder: (context, child) {
                          return Theme(
                            data: ThemeData.light().copyWith(
                              primaryColor: Colors.teal,
                              colorScheme:
                                  const ColorScheme.light(primary: Colors.teal),
                              buttonTheme: const ButtonThemeData(
                                  textTheme: ButtonTextTheme.primary),
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (picked != null && mounted) {
                        setState(() {
                          _selectedDate =
                              DateFormat('yyyy-MM-dd').format(picked);
                        });
                        await _fetchDailyFeeds();
                      }
                    },
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _searchController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Cari berdasarkan nama sapi...',
                      hintStyle: const TextStyle(color: Colors.white70),
                      prefixIcon:
                          const Icon(Icons.search, color: Colors.white70),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear,
                                  color: Colors.white70),
                              onPressed: () {
                                if (mounted) {
                                  setState(() {
                                    _searchQuery = '';
                                    _searchController.clear();
                                    _applyFiltersAndGroup();
                                  });
                                }
                              },
                            )
                          : null,
                      filled: true,
                      fillColor: Colors.white24,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          vertical: 0, horizontal: 20),
                    ),
                    onChanged: (value) {
                      if (mounted) {
                        setState(() {
                          _searchQuery = value;
                          _applyFiltersAndGroup();
                        });
                      }
                    },
                  ),
                ],
              ),
            ),
          ),
          // Feed List
          Expanded(
            child: _isLoading || _isLoadingCows
                ? const Center(
                    child: CircularProgressIndicator(color: Colors.teal))
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Text(_errorMessage,
                            style: const TextStyle(
                                color: Colors.red, fontSize: 16)))
                    : ListView(
                        physics: const AlwaysScrollableScrollPhysics(),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        children: [
                          // Sapi dengan Jadwal Tidak Lengkap
                          if (_showMissingSessions &&
                              _cowsWithMissingSessions.isNotEmpty)
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 8),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.orange.shade50,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.warning_amber_rounded,
                                          color: Colors.orange,
                                          size: 24,
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            'Sapi tanpa Jadwal (${_cowsWithMissingSessions.length})',
                                            style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.teal,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  ConstrainedBox(
                                    constraints: BoxConstraints(
                                      maxHeight: MediaQuery.of(context)
                                              .size
                                              .height *
                                          0.4, // Limit height to prevent overflow
                                    ),
                                    child: ListView.builder(
                                      shrinkWrap: true,
                                      physics:
                                          const NeverScrollableScrollPhysics(),
                                      itemCount:
                                          _cowsWithMissingSessions.length,
                                      itemBuilder: (context, index) {
                                        final cow =
                                            _cowsWithMissingSessions[index];
                                        return Card(
                                          elevation: 2,
                                          shape: RoundedRectangleBorder(
                                              borderRadius:
                                                  BorderRadius.circular(12)),
                                          color: Colors.white,
                                          margin:
                                              const EdgeInsets.only(bottom: 8),
                                          child: Padding(
                                            padding: const EdgeInsets.all(12),
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Row(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment
                                                          .spaceBetween,
                                                  children: [
                                                    Expanded(
                                                      child: Text(
                                                        cow['name'],
                                                        style: const TextStyle(
                                                          fontSize: 16,
                                                          fontWeight:
                                                              FontWeight.w600,
                                                          color: Colors.black87,
                                                        ),
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                      ),
                                                    ),
                                                    Text(
                                                      '(${cow['missingSessions'].length} sesi)',
                                                      style: TextStyle(
                                                          fontSize: 14,
                                                          color: Colors
                                                              .grey.shade600),
                                                    ),
                                                  ],
                                                ),
                                                const SizedBox(height: 8),
                                                Text(
                                                  'Sesi hilang: ${(cow['missingSessions'] as List<String>).join(", ")}',
                                                  style: const TextStyle(
                                                      fontSize: 14,
                                                      color: Colors.teal),
                                                  overflow:
                                                      TextOverflow.ellipsis,
                                                ),
                                                if (isFarmer) ...[
                                                  const SizedBox(height: 12),
                                                  Wrap(
                                                    spacing: 8,
                                                    runSpacing: 8,
                                                    children:
                                                        (cow['missingSessions']
                                                                as List<String>)
                                                            .map<Widget>(
                                                                (session) {
                                                      return ElevatedButton(
                                                        onPressed: () {
                                                          _autoCreateDailyFeed(
                                                              cow['id'],
                                                              cow['name'],
                                                              session);
                                                        },
                                                        style: ElevatedButton
                                                            .styleFrom(
                                                          backgroundColor:
                                                              Colors.teal
                                                                  .shade600,
                                                          shape: RoundedRectangleBorder(
                                                              borderRadius:
                                                                  BorderRadius
                                                                      .circular(
                                                                          8)),
                                                          padding:
                                                              const EdgeInsets
                                                                  .symmetric(
                                                                  horizontal:
                                                                      12,
                                                                  vertical: 8),
                                                        ),
                                                        child: Text(
                                                          'Buat Sesi $session',
                                                          style:
                                                              const TextStyle(
                                                                  color: Colors
                                                                      .white,
                                                                  fontSize: 12),
                                                          overflow: TextOverflow
                                                              .ellipsis,
                                                        ),
                                                      );
                                                    }).toList(),
                                                  ),
                                                ],
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          // List Jadwal Pakan (unchanged)
                          if (_groupedFeeds.isEmpty && !_showMissingSessions)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.all(16.0),
                                child: Text(
                                  'Tidak ada jadwal pakan untuk tanggal ini.',
                                  style: TextStyle(
                                      fontSize: 16, color: Colors.grey),
                                ),
                              ),
                            )
                          else
                            ..._groupedFeeds.expand<Widget>((group) {
                              return (group['sessions'] as List<DailyFeed>)
                                  .map<Widget>((feed) {
                                return _buildFeedCard(
                                    feed, group['cowName'], group['date']);
                              });
                            }),
                        ],
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeedCard(DailyFeed feed, String cowName, String date) {
    final isFarmer = _userRole == 'farmer';

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Card(
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        color: Colors.white,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.teal.shade100, width: 1),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left: Cow Info and Details
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.pets, color: Colors.teal, size: 24),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                cowName,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.teal,
                                ),
                              ),
                              Text(
                                'Tanggal: ${DateFormat('dd MMM yyyy', 'id').format(DateTime.parse(date))}',
                                style: TextStyle(
                                    fontSize: 14, color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 20, thickness: 1, color: Colors.teal),
                    Row(
                      children: [
                        const Icon(Icons.schedule,
                            color: Colors.teal, size: 16),
                        const SizedBox(width: 8),
                        Text('Sesi: ${feed.session}',
                            style: TextStyle(
                                fontSize: 14, color: Colors.grey.shade800)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.cloud, color: Colors.teal, size: 16),
                        const SizedBox(width: 8),
                        Text('Cuaca: ${feed.weather}',
                            style: TextStyle(
                                fontSize: 14, color: Colors.grey.shade800)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.person, color: Colors.teal, size: 16),
                        const SizedBox(width: 8),
                        Text('Oleh: ${feed.userName}',
                            style: TextStyle(
                                fontSize: 14, color: Colors.grey.shade800)),
                      ],
                    ),
                  ],
                ),
              ),
              // Right: Action Buttons for Farmers
              if (isFarmer)
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.edit, color: Colors.orange),
                      onPressed: () => _editDailyFeed(feed),
                      tooltip: 'Edit Jadwal',
                    ),
                    const SizedBox(height: 8),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _deleteDailyFeed(
                          feed.id, cowName, date, feed.session),
                      tooltip: 'Hapus Jadwal',
                    ),
                  ],
                ),
            ],
          ),
        ),
      ),
    );
  }
}
