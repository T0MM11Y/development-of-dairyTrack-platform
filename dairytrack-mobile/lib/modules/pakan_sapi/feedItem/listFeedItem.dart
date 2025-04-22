import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/pakan/dailyFeedItem.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DailyFeedItemsPage extends StatefulWidget {
  const DailyFeedItemsPage({super.key});

  @override
  _DailyFeedItemsPageState createState() => _DailyFeedItemsPageState();
}

class _DailyFeedItemsPageState extends State<DailyFeedItemsPage> {
  final DateFormat _dateFormat = DateFormat('dd MMM yyyy');
  bool _isLoading = true;
  List<DailyFeedSchedule> _feedSchedules = [];
  List<FeedItem> _feedItems = [];
  Map<int, Cow> _cowsMap = {};

  // Filters
  DateTime? _startDate;
  DateTime? _endDate;
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Load all schedules, feed items, and cows
      final schedules = await getDailyFeedSchedules();
      final cowsList = await getCows();
      final feedItems = await getDailyFeedItems();

      setState(() {
        _feedSchedules = schedules;
        _feedItems = feedItems;

        // Create a map for faster cow lookups
        final Map<int, Cow> cowsMap = {};
        for (var cow in cowsList) {
          if (cow.id != null) {
            if (cowsMap.containsKey(cow.id)) {
              // Handle duplicate IDs (optional)
              print('Warning: Duplicate cow ID found: ${cow.id}');
            }
            cowsMap[cow.id!] = cow;
          } else {
            // Log or handle cows with null IDs (optional)
            print('Warning: Cow with null ID found: ${cow.name}');
          }
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading data: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  // Group feed items by dailyFeedId
  Map<int, List<FeedItem>> _getGroupedFeedItems() {
    final Map<int, List<FeedItem>> grouped = {};
    for (var item in _feedItems) {
      if (!grouped.containsKey(item.dailyFeedId)) {
        grouped[item.dailyFeedId] = [];
      }
      grouped[item.dailyFeedId]!.add(item);
    }
    return grouped;
  }

  // Get filtered feed schedules
  List<DailyFeedSchedule> get _filteredSchedules {
    return _feedSchedules.where((schedule) {
      // Date filtering
      final scheduleDate = schedule.date;
      if (_startDate != null && scheduleDate.isBefore(_startDate!)) {
        return false;
      }
      if (_endDate != null && scheduleDate.isAfter(_endDate!)) {
        return false;
      }

      // Text search
      if (_searchQuery.isEmpty) {
        return true;
      }

      final query = _searchQuery.toLowerCase();
      final cow = _cowsMap[schedule.cowId];

      // Get feed items for this schedule
      final items =
          _feedItems.where((item) => item.dailyFeedId == schedule.id).toList();

      // Search in various fields
      return (cow?.name.toLowerCase().contains(query) ?? false) ||
          schedule.session.toLowerCase().contains(query) ||
          (schedule.weather?.toLowerCase().contains(query) ?? false) ||
          items.any((item) =>
              (item.feed?.name.toLowerCase().contains(query) ?? false) ||
              item.quantity.toString().contains(query));
    }).toList();
  }

  // Group schedules by cow and date
  Map<String, List<DailyFeedSchedule>> _groupedSchedules() {
    final Map<String, List<DailyFeedSchedule>> groupedSchedules = {};

    for (var schedule in _filteredSchedules) {
      String key =
          '${schedule.cowId}_${_dateFormat.format(schedule.date)}'; // Key combining cow ID and date

      if (!groupedSchedules.containsKey(key)) {
        groupedSchedules[key] = [];
      }
      groupedSchedules[key]!.add(schedule);
    }
    return groupedSchedules;
  }

  void _showFilterDialog() {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Filter Data'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _startDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2030),
                    );
                    if (picked != null) {
                      setState(() {
                        _startDate = picked;
                      });
                    }
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Tanggal Mulai',
                      border: OutlineInputBorder(),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_startDate != null
                            ? _dateFormat.format(_startDate!)
                            : 'Pilih Tanggal'),
                        const Icon(Icons.calendar_today, size: 20),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _endDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2030),
                    );
                    if (picked != null) {
                      setState(() {
                        _endDate = picked;
                      });
                    }
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'Tanggal Akhir',
                      border: OutlineInputBorder(),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(_endDate != null
                            ? _dateFormat.format(_endDate!)
                            : 'Pilih Tanggal'),
                        const Icon(Icons.calendar_today, size: 20),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  setState(() {
                    _startDate = null;
                    _endDate = null;
                  });
                },
                child: const Text('Reset'),
              ),
              TextButton(
                onPressed: () {
                  Navigator.pop(context);
                  setState(() {}); // Refresh main state to apply filters
                },
                child: const Text('Terapkan'),
              ),
            ],
          );
        },
      ),
    );
  }

  void _navigateToDetail(DailyFeedSchedule schedule) {
    Navigator.pushNamed(
      context,
      '/edit-item-pakan',
      arguments: schedule
          .id, // Pass the dailyFeedId (int) instead of the schedule object
    ).then((result) {
      if (result == true) {
        _loadData(); // Reload data when returning from detail page
      }
    });
  }

  void _navigateToAdd() {
    Navigator.pushNamed(
      context,
      '/tambah-item-pakan',
    ).then((result) {
      if (result == true) {
        _loadData(); // Reload data when returning from add page
      }
    });
  }

  Future<void> _showDeleteConfirmation(DailyFeedSchedule schedule) async {
    final cow = _cowsMap[schedule.cowId];

    return showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Hapus'),
        content: Text(
            'Apakah Anda yakin ingin menghapus semua data pakan untuk sapi ${cow?.name ?? 'ID: ${schedule.cowId}'} pada tanggal ${_dateFormat.format(schedule.date)} sesi ${schedule.session}?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          TextButton(
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            onPressed: () async {
              Navigator.pop(context);
              await _deleteFeedSchedule(schedule);
            },
            child: const Text('Hapus'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteFeedSchedule(DailyFeedSchedule schedule) async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Find all feed items for this schedule and delete them first
      final itemsToDelete =
          _feedItems.where((item) => item.dailyFeedId == schedule.id).toList();

      if (itemsToDelete.isNotEmpty) {
        for (var item in itemsToDelete) {
          await deleteFeedItem(item.id);
        }
      }

      // Then delete the schedule itself
      await deleteDailyFeedSchedule(schedule.id);

      // Show success message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Data pakan berhasil dihapus')),
        );
      }

      // Reload data
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menghapus data: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatSession(String session) {
    return session.isNotEmpty
        ? session[0].toUpperCase() + session.substring(1)
        : session;
  }

  @override
  Widget build(BuildContext context) {
    // Group schedules and grouped items
    final groupedSchedules = _groupedSchedules();
    final groupedItems = _getGroupedFeedItems();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Pakan Harian'),
        backgroundColor: const Color(0xFF17A2B8),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: _showFilterDialog,
            tooltip: 'Filter',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToAdd,
        backgroundColor: const Color(0xFF17A2B8),
        child: const Icon(Icons.add),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: Column(
                children: [
                  // Search bar
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: TextField(
                      controller: _searchController,
                      decoration: InputDecoration(
                        hintText: 'Cari berdasarkan nama sapi, cuaca, dll',
                        prefixIcon: const Icon(Icons.search),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        contentPadding:
                            const EdgeInsets.symmetric(vertical: 0.0),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() {
                                    _searchQuery = '';
                                  });
                                },
                              )
                            : null,
                      ),
                      onChanged: (value) {
                        setState(() {
                          _searchQuery = value;
                        });
                      },
                    ),
                  ),

                  // Filter indicators
                  if (_startDate != null || _endDate != null)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16.0),
                      child: Row(
                        children: [
                          const Icon(Icons.filter_list,
                              size: 16, color: Colors.grey),
                          const SizedBox(width: 4),
                          Text(
                            'Tanggal: ${_startDate != null ? _dateFormat.format(_startDate!) : 'Awal'} - ${_endDate != null ? _dateFormat.format(_endDate!) : 'Akhir'}',
                            style: const TextStyle(
                                color: Colors.grey, fontSize: 12),
                          ),
                          const Spacer(),
                          TextButton(
                            onPressed: () {
                              setState(() {
                                _startDate = null;
                                _endDate = null;
                              });
                            },
                            style: TextButton.styleFrom(
                              visualDensity: VisualDensity.compact,
                              padding: EdgeInsets.zero,
                              minimumSize: const Size(48, 24),
                            ),
                            child: const Text('Reset',
                                style: TextStyle(fontSize: 12)),
                          ),
                        ],
                      ),
                    ),

                  // List of schedules with their feed items
                  Expanded(
                    child: groupedSchedules.isEmpty
                        ? Center(
                            child: Text(
                              _searchQuery.isNotEmpty
                                  ? 'Tidak ada data yang sesuai dengan pencarian Anda'
                                  : 'Tidak ada data pakan harian tersedia',
                              style: const TextStyle(color: Colors.grey),
                            ),
                          )
                        : ListView.builder(
                            itemCount: groupedSchedules.length,
                            padding: const EdgeInsets.all(8.0),
                            itemBuilder: (context, index) {
                              final key =
                                  groupedSchedules.keys.elementAt(index);
                              final schedules = groupedSchedules[key]!;
                              final cowId = schedules.first
                                  .cowId; // Assume same cowId for grouped sessions
                              final cow = _cowsMap[cowId];

                              return Card(
                                margin: const EdgeInsets.symmetric(
                                    vertical: 8.0, horizontal: 4.0),
                                elevation: 2.0,
                                child: Column(
                                  children: [
                                    // Header with cow name and date
                                    ListTile(
                                      title: Text(
                                        cow?.name ?? 'Sapi #${cowId}',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Text(
                                          'Tanggal: ${_dateFormat.format(schedules.first.date)}'),
                                    ),
                                    // For each session and its feed items
                                    for (var schedule in schedules) ...[
                                      ListTile(
                                        title: Text(
                                            'Sesi: ${_formatSession(schedule.session)}'),
                                        trailing: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            IconButton(
                                              icon: const Icon(Icons.edit,
                                                  color: Colors.blue),
                                              onPressed: () =>
                                                  _navigateToDetail(schedule),
                                            ),
                                            IconButton(
                                              icon: const Icon(Icons.delete,
                                                  color: Colors.red),
                                              onPressed: () =>
                                                  _showDeleteConfirmation(
                                                      schedule),
                                            ),
                                          ],
                                        ),
                                      ),
                                      // Display the feed items for this session
                                      if (groupedItems[schedule.id]?.isEmpty ??
                                          true)
                                        const Padding(
                                          padding: EdgeInsets.all(16.0),
                                          child: Text(
                                              'Tidak ada item pakan tersedia'),
                                        )
                                      else
                                        ListView.builder(
                                          shrinkWrap: true,
                                          physics:
                                              const NeverScrollableScrollPhysics(),
                                          itemCount: groupedItems[schedule.id]
                                                  ?.length ??
                                              0,
                                          itemBuilder: (context, idx) {
                                            final item =
                                                groupedItems[schedule.id]![idx];
                                            return ListTile(
                                              dense: true,
                                              leading: CircleAvatar(
                                                backgroundColor:
                                                    Colors.green.shade100,
                                                child: Text('${idx + 1}'),
                                              ),
                                              title: Text(item.feed?.name ??
                                                  'Unknown Feed'),
                                              subtitle: Text(
                                                  'Quantity: ${item.quantity} kg'),
                                            );
                                          },
                                        ),
                                    ],
                                  ],
                                ),
                              );
                            },
                          ),
                  ),
                ],
              ),
            ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }
}
