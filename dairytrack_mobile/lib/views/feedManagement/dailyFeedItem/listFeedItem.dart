import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controller/APIURL4/dailyScheduleController.dart';
import '../../../controller/APIURL1/cowManagementController.dart';
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
      final response = _userRole == 'farmer'
          ? await _cowController.listCowsByUser(_userId)
          : await _cowController.listCows();
      if (!mounted) return;
      setState(() {
        _cows = response is Map<String, dynamic> && response['success']
            ? List<Cow>.from(response['cows'])
            : response is List<Cow>
                ? response
                : [];
        _isLoadingCows = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Gagal memuat data sapi: $e';
        _isLoadingCows = false;
      });
    }
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final feedResponse = await _feedController.getAllDailyFeeds(
        date: _selectedDate,
        userId: _userId,
      );
      final feedItemResponse =
          await _feedItemController.getAllFeedItems(userId: _userId);
      if (!mounted) return;
      if (feedResponse['success'] && feedItemResponse['success']) {
        final feeds = (feedResponse['data'] as List<dynamic>)
            .map((json) => DailyFeed.fromJson(json as Map<String, dynamic>))
            .toList();
        final feedItems = (feedItemResponse['data'] as List<dynamic>)
            .map((json) => DailyFeedItem.fromJson(json as Map<String, dynamic>))
            .toList();
        setState(() {
          _feeds = feeds;
          _feedItems = feedItems;
          _groupFeedItems();
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
    final cowNames = _cows.fold<Map<int, String>>({}, (map, cow) {
      map[cow.id] = cow.name;
      return map;
    });
    final allowedCowIds = _cows.map((cow) => cow.id).toSet();
    final filteredFeeds = _userRole == 'farmer'
        ? _feeds.where((feed) => allowedCowIds.contains(feed.cowId)).toList()
        : _feeds;
    for (var feed in filteredFeeds) {
      final key = '${feed.cowId}-${feed.date}';
      final items = _feedItems.where((item) => item.dailyFeedId == feed.id).toList();
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
            },
          },
        };
      }
      _groupedFeedItems[key]['sessions'][feed.session] = {
        'items': items,
        'daily_feed_id': feed.id,
        'weather': feed.weather,
        'feed': feed,
      };
    }
    _groupedFeedItems = Map.fromEntries(
      _groupedFeedItems.entries.where((entry) {
        final group = entry.value;
        if (_searchQuery.isEmpty) return true;
        final searchLower = _searchQuery.toLowerCase();
        return group['date'].toLowerCase().contains(searchLower) ||
            group['cow'].toLowerCase().contains(searchLower) ||
            group['sessions'].values.any((session) =>
                (session['items'] as List<DailyFeedItem>).any((item) =>
                    item.feedName.toLowerCase().contains(searchLower) ||
                    item.quantity.toString().contains(searchLower)) ||
                (session['weather'] as String).toLowerCase().contains(searchLower));
      }),
    );
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: isError ? Colors.red.shade700 : Colors.teal.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(10),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _navigateToAdd() {
    if (_cows.isEmpty) {
      _showSnackBar('Tidak ada sapi tersedia untuk menambah item pakan.',
          isError: true);
      return;
    }
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddFeedItemPage(
          cows: _cows,
          defaultDate: _selectedDate,
          userId: _userId,
        ),
      ),
    ).then((result) {
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
        builder: (context) => EditFeedItemPage(
          feed: feed,
          cows: _cows,
          userId: _userId,
        ),
      ),
    ).then((result) {
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        title: const Text('Konfirmasi Hapus'),
        content: Text(
          'Hapus jadwal pakan untuk ${feed.cowName} pada $formattedDate sesi ${feed.session}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal', style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);
      try {
        final items = _feedItems.where((item) => item.dailyFeedId == feed.id).toList();
        for (var item in items) {
          final response = await _feedItemController.deleteFeedItem(item.id, _userId);
          if (!response['success']) throw Exception(response['message']);
        }
        final response = await _feedController.deleteDailyFeed(feed.id, _userId);
        if (!mounted) return;
        if (response['success']) {
          _showSnackBar(response['message']);
          await _fetchData();
        } else {
          _showSnackBar(response['message'] ?? 'Gagal menghapus jadwal pakan.',
              isError: true);
        }
      } catch (e) {
        if (mounted) {
          _showSnackBar('Gagal menghapus: $e', isError: true);
        }
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    }
  }

  Widget _buildFeedCard(String key, Map<String, dynamic> group) {
    final isFarmer = _userRole == 'farmer';
    final sessions = ['Pagi', 'Siang', 'Sore'];

    return AnimatedOpacity(
      opacity: 1.0,
      duration: const Duration(milliseconds: 300),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        child: ExpansionTile(
          leading: CircleAvatar(
            backgroundColor: Colors.teal.shade50,
            child: const Icon(Icons.pets, color: Colors.teal, size: 20),
          ),
          title: Text(
            '${group['cow']} - ${_dateFormat.format(DateTime.parse(group['date']))}',
            style: const TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 16,
              color: Colors.teal,
            ),
          ),
          children: sessions.map((session) {
            final sessionData = group['sessions'][session];
            final items = sessionData['items'] as List<DailyFeedItem>;
            final feed = sessionData['feed'] as DailyFeed?;

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: ListTile(
                title: Text(
                  'Sesi: $session',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                    color: Colors.black87,
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 4),
                    Text(
                      'Cuaca: ${sessionData['weather']}',
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Item Pakan:',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                    if (items.isEmpty)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Text(
                          'Tidak ada item pakan',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
                        ),
                      )
                    else
                      ...items.asMap().entries.map((entry) {
                        final index = entry.key;
                        final item = entry.value;
                        return ListTile(
                          dense: true,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                          leading: CircleAvatar(
                            radius: 16,
                            backgroundColor: Colors.teal.shade100,
                            child: Text(
                              '${index + 1}',
                              style: const TextStyle(
                                color: Colors.teal,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          title: Text(
                            item.feedName,
                            style: const TextStyle(fontSize: 14),
                          ),
                          subtitle: Text(
                            'Jumlah: ${item.quantity} kg',
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 13,
                            ),
                          ),
                        );
                      }),
                  ],
                ),
                trailing: isFarmer && sessionData['daily_feed_id'] != null
                    ? Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit, color: Colors.amber),
                            onPressed: feed != null ? () => _navigateToEdit(feed) : null,
                            tooltip: 'Edit Jadwal',
                          ),
                          if (items.isNotEmpty)
                            IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed:
                                  feed != null ? () => _deleteFeedSchedule(feed) : null,
                              tooltip: 'Hapus Jadwal',
                            ),
                        ],
                      )
                    : null,
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFarmer = _userRole == 'farmer';

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text(
          'Data Pakan Harian',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade700,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _fetchData,
            tooltip: 'Muat Ulang',
          ),
        ],
      ),
      floatingActionButton: isFarmer
          ? ScaleTransition(
              scale: _fabAnimation,
              child: FloatingActionButton(
                onPressed: _navigateToAdd,
                backgroundColor: Colors.teal.shade600,
                child: const Icon(Icons.add, color: Colors.white),
                tooltip: 'Tambah Item Pakan',
              ),
            )
          : null,
      body: Column(
        children: [
          Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.teal.shade700, Colors.teal.shade500],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  readOnly: true,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Pilih Tanggal',
                    labelStyle: const TextStyle(color: Colors.white70),
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.15),
                    prefixIcon: const Icon(Icons.calendar_today, color: Colors.white70),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Colors.white, width: 1.5),
                    ),
                  ),
                  controller: TextEditingController(
                      text: _dateFormat.format(DateTime.parse(_selectedDate))),
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
                            colorScheme: const ColorScheme.light(primary: Colors.teal),
                            buttonTheme: const ButtonThemeData(textTheme: ButtonTextTheme.primary),
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (picked != null && mounted) {
                      setState(() {
                        _selectedDate = _apiDateFormat.format(picked);
                      });
                      await _fetchData();
                    }
                  },
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _searchController,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Cari nama sapi, sesi, cuaca...',
                    hintStyle: const TextStyle(color: Colors.white70),
                    prefixIcon: const Icon(Icons.search, color: Colors.white70),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear, color: Colors.white70),
                            onPressed: () {
                              if (mounted) {
                                setState(() {
                                  _searchQuery = '';
                                  _searchController.clear();
                                  _groupFeedItems();
                                });
                              }
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: Colors.white.withOpacity(0.15),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: Colors.white, width: 1.5),
                    ),
                  ),
                  onChanged: (value) {
                    if (mounted) {
                      setState(() {
                        _searchQuery = value;
                        _groupFeedItems();
                      });
                    }
                  },
                ),
              ],
            ),
          ),
          Expanded(
            child: _isLoading || _isLoadingCows
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const CircularProgressIndicator(color: Colors.teal),
                        const SizedBox(height: 16),
                        Text(
                          'Memuat data...',
                          style: TextStyle(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  )
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.error_outline,
                              color: Colors.red.shade600,
                              size: 40,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              _errorMessage,
                              style: const TextStyle(
                                color: Colors.black54,
                                fontSize: 16,
                              ),
                              textAlign: TextAlign.center,
                            ),
                            if (_errorMessage.contains('tidak'))
                              Padding(
                                padding: const EdgeInsets.all(8.0),
                                child: Text(
                                  'Coba pilih tanggal lain atau pastikan data sapi tersedia.',
                                  style: TextStyle(
                                    color: Colors.grey.shade500,
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _fetchData,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.teal,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                ),
                              ),
                              child: const Text(
                                'Refresh',
                                style: TextStyle(color: Colors.white),
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: Colors.teal,
                        onRefresh: _fetchData,
                        child: _groupedFeedItems.isEmpty
                            ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      Icons.feed,
                                      size: 50,
                                      color: Colors.grey.shade400,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Tidak ada data pakan untuk tanggal ini.',
                                      style: TextStyle(
                                        color: Colors.grey.shade500,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                              )
                            : ListView.builder(
                                physics: const AlwaysScrollableScrollPhysics(),
                                padding: const EdgeInsets.symmetric(vertical: 8),
                                itemCount: _groupedFeedItems.length,
                                itemBuilder: (context, index) {
                                  final entry = _groupedFeedItems.entries.elementAt(index);
                                  return _buildFeedCard(entry.key, entry.value);
                                },
                              ),
                      ),
          ),
        ],
      ),
    );
  }
}
