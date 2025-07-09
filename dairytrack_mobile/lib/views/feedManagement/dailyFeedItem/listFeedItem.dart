import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controller/APIURL4/dailyScheduleController.dart';
import '../../../controller/APIURL1/cowManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import '../../../controller/APIURL4/dailyFeedItemController.dart';
import '../model/feed.dart';
import '../model/dailyFeed.dart';
import '../model/dailyFeedItem.dart';
import 'editFeedItem.dart';
import 'addFeedItem.dart';

class DailyFeedItemsPage extends StatefulWidget {
  const DailyFeedItemsPage({super.key});

  @override
  _DailyFeedItemsPageState createState() => _DailyFeedItemsPageState();
}

class _DailyFeedItemsPageState extends State<DailyFeedItemsPage>
    with SingleTickerProviderStateMixin {
  final DailyFeedManagementController _feedController =
      DailyFeedManagementController();
  final DailyFeedItemManagementController _feedItemController =
      DailyFeedItemManagementController();
  final CattleDistributionController _cowDistributionController =
      CattleDistributionController();
  final CowManagementController _cowController = CowManagementController();
  final DateFormat _dateFormat = DateFormat('dd MMM yyyy', 'id');
  final DateFormat _apiDateFormat = DateFormat('yyyy-MM-dd');
  List<DailyFeed> _feeds = [];
  List<DailyFeedItem> _feedItems = [];
  List<Cow> _cows = [];
  Map<String, dynamic> _groupedFeedItems = {};
  bool _isLoading = true;
  bool _isLoadingCows = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String? _userRole;
  int _userId = 0;
  final TextEditingController _searchController = TextEditingController();
  late AnimationController _fabAnimationController;
  late Animation<double> _fabAnimation;
  bool _showNoFeedItemsModal = false; // State for modal visibility
  List<Map<String, dynamic>> _cowsWithNoFeedItems =
      []; // State for cows with no feed items

  @override
  void initState() {
    super.initState();
    _fabAnimationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _fabAnimation = Tween<double>(begin: 1.0, end: 1.1).animate(
      CurvedAnimation(
        parent: _fabAnimationController,
        curve: Curves.easeInOut,
      ),
    );
    initializeDateFormatting('id', null).then((_) {
      _loadUserData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _fabAnimationController.dispose();
    super.dispose();
  }

  Future<void> _loadUserData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      setState(() {
        _userRole = prefs.getString('userRole')?.toLowerCase();
        _userId = prefs.getInt('userId') ?? 0;
      });
      await _fetchCows();
      if (_cows.isEmpty && _userRole == 'farmer') {
        setState(() {
          _errorMessage = 'Tidak ada sapi yang tersedia.';
          _isLoading = false;
          _isLoadingCows = false;
        });
        return;
      }
      await _fetchData();
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal memuat data pengguna: $e';
          _isLoading = false;
          _isLoadingCows = false;
        });
      }
    }
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
          List<dynamic> cowsList = responseData is List
              ? responseData
              : (responseData['cows'] as List);
          cows = cowsList.map((json) => Cow.fromJson(json)).toList();
          print('Fetched cows for farmer: $cows');
          setState(() {
            _cows = cows;
            _isLoadingCows = false;
          });
        } else {
          setState(() {
            _errorMessage = response['message'] ?? 'Gagal mengambil data sapi';
            _isLoadingCows = false;
          });
        }
      } else if (_userRole == 'admin' || _userRole == 'supervisor') {
        final response = await _cowController.listCows();
        if (!mounted) return;
        cows = response;
        print('Fetched cows for admin/supervisor: $cows');
        setState(() {
          _cows = cows;
          _isLoadingCows = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Peran tidak dikenal: $_userRole';
          _isLoadingCows = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error mengambil data sapi: $e';
        _isLoadingCows = false;
      });
    }
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final feedResponse = await _feedController.getAllDailyFeeds(
          date: _selectedDate, userId: _userId);
      final feedItemResponse =
          await _feedItemController.getAllFeedItems(userId: _userId);
      if (!mounted) return;
      if (feedResponse['success'] && feedItemResponse['success']) {
        List<DailyFeed> feeds = (feedResponse['data'] as List)
            .map((json) => DailyFeed.fromJson(json))
            .toList();
        List<DailyFeedItem> feedItems = (feedItemResponse['data'] as List)
            .map((json) => DailyFeedItem.fromJson(json))
            .toList();
        if (_userRole == 'farmer') {
          final cowIds = _cows.map((cow) => cow.id).toSet();
          feeds = feeds.where((feed) => cowIds.contains(feed.cowId)).toList();
        }
        setState(() {
          _feeds = feeds;
          _feedItems = feedItems;
          _groupFeedItems();
          _calculateCowsWithNoFeedItems();
          _isLoading = false;
          _errorMessage = '';
        });
      } else {
        setState(() {
          _errorMessage = feedResponse['message'] ??
              feedItemResponse['message'] ??
              'Gagal memuat data pakan';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal memuat data: $e';
          _isLoading = false;
        });
      }
    }
  }

  void _groupFeedItems() {
    _groupedFeedItems = {};
    final cowNames = _cows
        .fold<Map<int, String>>({}, (map, cow) => map..[cow.id] = cow.name);
    for (var feed in _feeds) {
      final key = '${feed.cowId}-${feed.date}';
      final items =
          _feedItems.where((item) => item.dailyFeedId == feed.id).toList();
      final cowName = cowNames[feed.cowId] ?? 'Sapi #${feed.cowId}';
      if (!_groupedFeedItems.containsKey(key)) {
        _groupedFeedItems[key] = {
          'cow_id': feed.cowId,
          'cow': cowName,
          'date': feed.date,
          'sessions': {
            'Pagi': {
              'items': [],
              'daily_feed_id': null,
              'weather': 'Tidak Ada',
              'feed': null
            },
            'Siang': {
              'items': [],
              'daily_feed_id': null,
              'weather': 'Tidak Ada',
              'feed': null
            },
            'Sore': {
              'items': [],
              'daily_feed_id': null,
              'weather': 'Tidak Ada',
              'feed': null
            }
          },
        };
      }
      _groupedFeedItems[key]['sessions'][feed.session] = {
        'items': items,
        'daily_feed_id': feed.id,
        'weather': feed.weather,
        'feed': feed
      };
    }
    if (_searchQuery.isNotEmpty) {
      final searchLower = _searchQuery.toLowerCase();
      _groupedFeedItems =
          Map.fromEntries(_groupedFeedItems.entries.where((entry) {
        final group = entry.value;
        return group['date'].toLowerCase().contains(searchLower) ||
            group['cow'].toLowerCase().contains(searchLower) ||
            group['sessions'].values.any((session) =>
                (session['items'] as List<DailyFeedItem>).any((item) =>
                    item.feedName.toLowerCase().contains(searchLower) ||
                    item.quantity.toString().contains(searchLower)) ||
                (session['weather'] as String)
                    .toLowerCase()
                    .contains(searchLower));
      }));
    }
  }

  void _calculateCowsWithNoFeedItems() {
    final List<Map<String, dynamic>> noFeedItems = _feeds
        .where((feed) => !_feedItems.any((item) => item.dailyFeedId == feed.id))
        .map((feed) => ({
              'cow_id': feed.cowId,
              'cow_name': feed.cowName,
              'date': feed.date,
              'session': feed.session,
              'daily_feed_id': feed.id,
            }))
        .toList();
    setState(() {
      _cowsWithNoFeedItems = noFeedItems;
    });
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: isError ? Colors.red.shade700 : Colors.teal.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(10),
        duration: const Duration(seconds: 3)));
  }

  void _navigateToAdd() {
    if (_isLoadingCows) {
      _showSnackBar('Sedang memuat data sapi. Silakan coba lagi sebentar.',
          isError: true);
      return;
    }
    if (_cows.isEmpty) {
      _showSnackBar('Tidak ada sapi tersedia. Hubungi admin.', isError: true);
      return;
    }
    Navigator.push(
        context,
        MaterialPageRoute(
            builder: (context) => AddFeedItemPage(
                cows: _cows,
                defaultDate: _selectedDate,
                userId: _userId))).then((result) {
      if (result == true && mounted) {
        _fetchData();
        _showSnackBar('Item pakan berhasil ditambahkan.');
      }
    });
  }

  void _navigateToEdit(DailyFeed feed) {
    Navigator.push(
            context,
            MaterialPageRoute(
                builder: (context) =>
                    EditFeedItemPage(feed: feed, cows: _cows, userId: _userId)))
        .then((result) {
      if (result == true && mounted) {
        _fetchData();
        _showSnackBar('Item pakan berhasil diperbarui.');
      }
    });
  }

  Future<void> _deleteFeedSchedule(DailyFeed feed) async {
    final formattedDate = _dateFormat.format(DateTime.parse(feed.date));
    final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15)),
                title: const Text('Konfirmasi Hapus'),
                content: Text(
                    'Hapus jadwal pakan untuk ${feed.cowName} pada $formattedDate sesi ${feed.session}?'),
                actions: [
                  TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Batal',
                          style: TextStyle(color: Colors.grey))),
                  TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('Hapus',
                          style: TextStyle(color: Colors.red)))
                ]));
    if (confirm == true) {
      setState(() => _isLoading = true);
      try {
        final items =
            _feedItems.where((item) => item.dailyFeedId == feed.id).toList();
        for (var item in items) {
          final response =
              await _feedItemController.deleteFeedItem(item.id, _userId);
          if (!response['success']) throw Exception(response['message']);
        }
        final response =
            await _feedController.deleteDailyFeed(feed.id, _userId);
        if (!mounted) return;
        if (response['success']) {
          _showSnackBar(response['message']);
          await _fetchData();
        } else {
          _showSnackBar(response['message'] ?? 'Gagal menghapus jadwal pakan.',
              isError: true);
        }
      } catch (e) {
        if (mounted) _showSnackBar('Gagal menghapus: $e', isError: true);
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildFeedCard(String key, Map<String, dynamic> group) {
    final isFarmer = _userRole == 'farmer';
    final sessions = ['Pagi', 'Siang', 'Sore'];
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ExpansionTile(
        leading: CircleAvatar(
            backgroundColor: Colors.teal.shade100,
            child:
                const Icon(Icons.local_dining, color: Colors.teal, size: 18)),
        title: Text(
            '${group['cow']} - ${_dateFormat.format(DateTime.parse(group['date']))}',
            style: TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                color: Colors.teal.shade800)),
        collapsedBackgroundColor: Colors.teal.shade50,
        childrenPadding: const EdgeInsets.all(8),
        children: sessions.map((session) {
          final sessionData = group['sessions'][session];
          final items = (sessionData['items'] as List)
              .map((item) => item as DailyFeedItem)
              .toList();
          final feed = sessionData['feed'] as DailyFeed?;
          return Padding(
            padding: const EdgeInsets.only(bottom: 6),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(horizontal: 8),
              leading: CircleAvatar(
                  radius: 12,
                  backgroundColor: Colors.teal.shade200,
                  child: Text(session[0],
                      style:
                          const TextStyle(color: Colors.white, fontSize: 12))),
              title: Text('Sesi $session',
                  style: TextStyle(
                      fontWeight: FontWeight.w500,
                      fontSize: 14,
                      color: Colors.teal.shade900)),
              subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Cuaca: ${sessionData['weather']}',
                        style: TextStyle(
                            color: Colors.grey.shade700, fontSize: 12)),
                    const SizedBox(height: 4),
                    const Text('Item Pakan:',
                        style: TextStyle(
                            fontWeight: FontWeight.w500, fontSize: 12)),
                    if (items.isEmpty)
                      Text('Tidak ada item',
                          style: TextStyle(
                              color: Colors.grey.shade500, fontSize: 12))
                    else
                      ...items.asMap().entries.map((e) => Padding(
                          padding: const EdgeInsets.only(top: 2),
                          child: Text(
                              '${e.key + 1}. ${e.value.feedName} (${e.value.quantity} kg)',
                              style: TextStyle(
                                  fontSize: 12, color: Colors.black87))))
                  ]),
              trailing: isFarmer && sessionData['daily_feed_id'] != null
                  ? Row(mainAxisSize: MainAxisSize.min, children: [
                      IconButton(
                          icon: Icon(Icons.edit, color: Colors.amber.shade700),
                          onPressed:
                              feed != null ? () => _navigateToEdit(feed) : null,
                          tooltip: 'Edit',
                          iconSize: 18),
                      if (items.isNotEmpty)
                        IconButton(
                            icon:
                                Icon(Icons.delete, color: Colors.red.shade700),
                            onPressed: feed != null
                                ? () => _deleteFeedSchedule(feed)
                                : null,
                            tooltip: 'Hapus',
                            iconSize: 18),
                    ])
                  : null,
            ),
          );
        }).toList(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFarmer = _userRole == 'farmer';
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('Data Pakan Harian',
            style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.white)),
        backgroundColor: Colors.teal.shade800,
        elevation: 2,
        leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios, color: Colors.white),
            onPressed: () => Navigator.of(context).pop()),
        actions: [
          if (_cowsWithNoFeedItems.isNotEmpty)
            IconButton(
              icon: Icon(
                _showNoFeedItemsModal
                    ? Icons.warning_amber_rounded
                    : Icons.warning,
                color: Colors.white,
              ),
              onPressed: () {
                setState(() {
                  _showNoFeedItemsModal = !_showNoFeedItemsModal;
                });
              },
              tooltip: _showNoFeedItemsModal
                  ? 'Sembunyikan Sapi tanpa Item Pakan'
                  : 'Tampilkan Sapi tanpa Item Pakan',
            ),
          IconButton(
              icon: const Icon(Icons.refresh, color: Colors.white),
              onPressed: _fetchData,
              tooltip: 'Muat Ulang'),
        ],
      ),
      floatingActionButton: isFarmer
          ? ScaleTransition(
              scale: _fabAnimation,
              child: FloatingActionButton(
                onPressed: _navigateToAdd,
                backgroundColor: Colors.teal.shade700,
                child: const Icon(Icons.add, color: Colors.white),
                tooltip: 'Tambah Item',
                elevation: 4,
              ),
            )
          : null,
      body: Stack(
        children: [
          Column(
            children: [
              Container(
                decoration: BoxDecoration(
                    gradient: LinearGradient(
                        colors: [Colors.teal.shade800, Colors.teal.shade400],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight)),
                padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        readOnly: true,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          labelText: 'Tanggal',
                          labelStyle: const TextStyle(
                              color: Colors.white70, fontSize: 14),
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.2),
                          prefixIcon: const Icon(Icons.calendar_today,
                              color: Colors.white70),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide.none),
                          focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(
                                  color: Colors.white, width: 1.5)),
                        ),
                        controller: TextEditingController(
                            text: _dateFormat
                                .format(DateTime.parse(_selectedDate))),
                        onTap: () async {
                          final DateTime? picked = await showDatePicker(
                              context: context,
                              initialDate: DateTime.parse(_selectedDate),
                              firstDate: DateTime(2000),
                              lastDate: DateTime.now(),
                              builder: (context, child) => Theme(
                                  data: ThemeData.light().copyWith(
                                      primaryColor: Colors.teal,
                                      colorScheme: const ColorScheme.light(
                                          primary: Colors.teal),
                                      buttonTheme: const ButtonThemeData(
                                          textTheme: ButtonTextTheme.primary)),
                                  child: child!));
                          if (picked != null && mounted) {
                            setState(() =>
                                _selectedDate = _apiDateFormat.format(picked));
                            await _fetchData();
                          }
                        },
                      ),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _searchController,
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Cari...',
                          hintStyle: const TextStyle(
                              color: Colors.white70, fontSize: 12),
                          prefixIcon:
                              const Icon(Icons.search, color: Colors.white70),
                          suffixIcon: _searchQuery.isNotEmpty
                              ? IconButton(
                                  icon: const Icon(Icons.clear,
                                      color: Colors.white70),
                                  onPressed: () {
                                    if (mounted)
                                      setState(() {
                                        _searchQuery = '';
                                        _searchController.clear();
                                        _groupFeedItems();
                                      });
                                  })
                              : null,
                          filled: true,
                          fillColor: Colors.white.withOpacity(0.2),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide.none),
                          focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: const BorderSide(
                                  color: Colors.white, width: 1.5)),
                        ),
                        onChanged: (value) => mounted
                            ? setState(() {
                                _searchQuery = value;
                                _groupFeedItems();
                              })
                            : null,
                      ),
                    ]),
              ),
              Expanded(
                child: _isLoading || _isLoadingCows
                    ? Center(
                        child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                            CircularProgressIndicator(
                                color: Colors.teal.shade700),
                            const SizedBox(height: 8),
                            Text('Memuat...',
                                style: TextStyle(
                                    color: Colors.grey.shade600, fontSize: 14))
                          ]))
                    : _errorMessage.isNotEmpty
                        ? Center(
                            child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                Icon(Icons.warning_amber_rounded,
                                    color: Colors.orange.shade700, size: 40),
                                const SizedBox(height: 8),
                                Text(_errorMessage,
                                    style: const TextStyle(
                                        color: Colors.black87, fontSize: 14),
                                    textAlign: TextAlign.center),
                                if (_errorMessage.contains('tidak'))
                                  Padding(
                                      padding: const EdgeInsets.all(6),
                                      child: Text('Coba tanggal lain.',
                                          style: TextStyle(
                                              color: Colors.grey.shade600,
                                              fontSize: 12),
                                          textAlign: TextAlign.center)),
                                const SizedBox(height: 8),
                                ElevatedButton(
                                    onPressed: _fetchData,
                                    style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.teal.shade700,
                                        shape: RoundedRectangleBorder(
                                            borderRadius:
                                                BorderRadius.circular(8)),
                                        padding: const EdgeInsets.symmetric(
                                            horizontal: 12, vertical: 6)),
                                    child: const Text('Refresh',
                                        style: TextStyle(
                                            color: Colors.white,
                                            fontSize: 14))),
                              ]))
                        : RefreshIndicator(
                            color: Colors.teal.shade700,
                            onRefresh: _fetchData,
                            child: _groupedFeedItems.isEmpty
                                ? Center(
                                    child: Column(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                        Icon(Icons.grass,
                                            size: 40,
                                            color: Colors.teal.shade300),
                                        const SizedBox(height: 8),
                                        Text('Tidak ada data.',
                                            style: TextStyle(
                                                color: Colors.grey.shade600,
                                                fontSize: 14))
                                      ]))
                                : ListView.builder(
                                    physics:
                                        const AlwaysScrollableScrollPhysics(),
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 6),
                                    itemCount: _groupedFeedItems.length,
                                    itemBuilder: (context, index) {
                                      final entry = _groupedFeedItems.entries
                                          .elementAt(index);
                                      return _buildFeedCard(
                                          entry.key, entry.value);
                                    },
                                  ),
                          ),
              ),
            ],
          ),
          if (_showNoFeedItemsModal)
            ModalBarrier(
              dismissible: true,
              color: Colors.black.withOpacity(0.5),
              onDismiss: () => setState(() => _showNoFeedItemsModal = false),
            ),
          if (_showNoFeedItemsModal)
            Center(
              child: Container(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.6,
                  maxWidth: MediaQuery.of(context).size.width * 0.9,
                ),
                margin: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                        color: Colors.black26,
                        blurRadius: 10,
                        offset: Offset(0, 4))
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.teal.shade800,
                        borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(15)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Expanded(
                            child: Text(
                              'Sapi tanpa Item Pakan',
                              style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, color: Colors.white),
                            onPressed: () =>
                                setState(() => _showNoFeedItemsModal = false),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: _cowsWithNoFeedItems.isEmpty
                          ? Center(
                              child: Padding(
                                padding: const EdgeInsets.all(16),
                                child: Text(
                                  _feeds.isEmpty
                                      ? 'Tidak ada jadwal pakan untuk tanggal ini.'
                                      : 'Semua jadwal pakan memiliki item pakan.',
                                  style: TextStyle(
                                      color: Colors.grey.shade600,
                                      fontSize: 14),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            )
                          : ListView.builder(
                              shrinkWrap: true,
                              padding: const EdgeInsets.all(8),
                              itemCount: _cowsWithNoFeedItems.length,
                              itemBuilder: (context, index) {
                                final cow = _cowsWithNoFeedItems[index];
                                return Card(
                                  elevation: 2,
                                  shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(8)),
                                  margin:
                                      const EdgeInsets.symmetric(vertical: 4),
                                  child: ListTile(
                                    contentPadding: const EdgeInsets.all(8),
                                    title: Text(
                                      cow['cow_name'],
                                      style: const TextStyle(
                                          fontWeight: FontWeight.w500,
                                          fontSize: 14),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    subtitle: Text(
                                      'Sesi: ${cow['session']}, Tanggal: ${_dateFormat.format(DateTime.parse(cow['date']))}',
                                      style: TextStyle(
                                          color: Colors.grey.shade600,
                                          fontSize: 12),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    trailing: isFarmer
                                        ? IconButton(
                                            icon: Icon(Icons.edit,
                                                color: Colors.amber.shade700),
                                            onPressed: () {
                                              final feed = _feeds.firstWhere(
                                                (f) =>
                                                    f.id ==
                                                    cow['daily_feed_id'],
                                                orElse: () => DailyFeed(
                                                    id: cow['daily_feed_id'],
                                                    cowId: cow['cow_id'],
                                                    date: cow['date'],
                                                    session: cow['session'],
                                                    cowName: cow['cow_name'],
                                                    totalNutrients:
                                                        cow['total_nutrients'] ??
                                                            0,
                                                    userId: _userId,
                                                    createdAt:
                                                        cow['created_at'] ?? '',
                                                    updatedAt:
                                                        cow['updated_at'] ?? '',
                                                    createdBy:
                                                        cow['user_id'] ?? 0,
                                                    updatedBy:
                                                        cow['user_id'] ?? 0,
                                                    userName: '',
                                                    weather: 'Tidak Ada'),
                                              );
                                              _navigateToEdit(feed);
                                              setState(() =>
                                                  _showNoFeedItemsModal =
                                                      false);
                                            },
                                          )
                                        : null,
                                  ),
                                );
                              },
                            ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(8),
                      child: ElevatedButton(
                        onPressed: () =>
                            setState(() => _showNoFeedItemsModal = false),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal.shade700,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16, vertical: 8),
                        ),
                        child: const Text('Tutup',
                            style:
                                TextStyle(color: Colors.white, fontSize: 14)),
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
}
