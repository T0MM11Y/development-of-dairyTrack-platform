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
  final DateFormat _apiDateFormat = DateFormat('yyyy-MM-dd'); // Format tanggal API
  bool _isLoading = true;
  List<DailyFeedSchedule> _feedSchedules = [];
  List<FeedItem> _feedItems = [];
  Map<int, Cow> _cowsMap = {};

  // Filter
  DateTime? _selectedDate; // Tanggal spesifik yang dipilih
  int? _selectedDay; // Hari dalam seminggu (0=Ahad, 1=Senin, ..., 6=Sabtu)
  String _searchQuery = '';
  final TextEditingController _searchController = TextEditingController();

  // Daftar nama hari untuk dropdown
  final List<String> _dayNames = [
    'Ahad',
    'Senin',
    'Selasa',
    'Rabu',
    'Kamis',
    'Jumat',
    'Sabtu'
  ];

  @override
  void initState() {
    super.initState();
    _selectedDate = DateTime.now(); // Default ke hari ini
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Load semua jadwal, item pakan, dan sapi
      final schedulesResponse = await getAllDailyFeeds();
      final cowsList = await getCows();
      final feedItemsResponse = await FeedItemService.getAllFeedItems();

      setState(() {
        _feedSchedules = schedulesResponse;
        _feedItems = (feedItemsResponse['success'] == true)
            ? (feedItemsResponse['data'] as List<dynamic>)
                .map((item) => FeedItem.fromJson(item))
                .toList()
            : [];

        // Buat map untuk pencarian sapi lebih cepat
        _cowsMap = {};
        for (var cow in cowsList) {
          if (cow.id != null) {
            _cowsMap[cow.id!] = cow;
          }
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memuat data: $e')),
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

  // Kelompokkan item pakan berdasarkan dailyFeedId
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

  // Filter jadwal berdasarkan tanggal/hari dan pencarian
  List<DailyFeedSchedule> get _filteredSchedules {
    return _feedSchedules.where((schedule) {
      // Parse schedule.date (String) ke DateTime
      DateTime scheduleDate;
      try {
        scheduleDate = _apiDateFormat.parse(schedule.date);
      } catch (e) {
        return false; // Lewati tanggal yang tidak valid
      }

      // Filter tanggal atau hari
      if (_selectedDate != null) {
        // Filter berdasarkan tanggal spesifik
        final selectedDate = _selectedDate!;
        if (scheduleDate.year != selectedDate.year ||
            scheduleDate.month != selectedDate.month ||
            scheduleDate.day != selectedDate.day) {
          return false;
        }
      } else if (_selectedDay != null) {
        // Filter berdasarkan hari dalam seminggu
        if (scheduleDate.weekday != _selectedDay) {
          return false;
        }
      } else {
        // Default: hanya hari ini
        final today = DateTime.now();
        if (scheduleDate.year != today.year ||
            scheduleDate.month != today.month ||
            scheduleDate.day != today.day) {
          return false;
        }
      }

      // Pencarian teks
      if (_searchQuery.isEmpty) {
        return true;
      }

      final query = _searchQuery.toLowerCase();
      final cow = _cowsMap[schedule.cowId];

      // Pencarian di berbagai field
      final items =
          _feedItems.where((item) => item.dailyFeedId == schedule.id).toList();

      return (cow?.name.toLowerCase().contains(query) ?? false) ||
          schedule.session.toLowerCase().contains(query) ||
          (schedule.weather?.toLowerCase().contains(query) ?? false) ||
          items.any((item) =>
              (item.feed?.name.toLowerCase().contains(query) ?? false) ||
              item.quantity.toString().contains(query));
    }).toList();
  }

  // Kelompokkan jadwal berdasarkan sapi dan tanggal
  Map<String, List<DailyFeedSchedule>> _groupedSchedules() {
    final Map<String, List<DailyFeedSchedule>> groupedSchedules = {};

    for (var schedule in _filteredSchedules) {
      String key =
          '${schedule.cowId}_${_dateFormat.format(_apiDateFormat.parse(schedule.date))}';
      if (!groupedSchedules.containsKey(key)) {
        groupedSchedules[key] = [];
      }
      groupedSchedules[key]!.add(schedule);
    }
    return groupedSchedules;
  }

  void _showFilterDialog() {
    String? tempFilterType = _selectedDate != null
        ? 'date'
        : _selectedDay != null
            ? 'day'
            : 'today'; // Tipe filter sementara
    DateTime? tempSelectedDate = _selectedDate;
    int? tempSelectedDay = _selectedDay;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            title: const Text('Pilih Filter'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Pilih tipe filter (Tanggal atau Hari)
                DropdownButton<String>(
                  value: tempFilterType,
                  isExpanded: true,
                  hint: const Text('Pilih Tipe Filter'),
                  items: const [
                    DropdownMenuItem(value: 'today', child: Text('Hari Ini')),
                    DropdownMenuItem(value: 'date', child: Text('Tanggal Spesifik')),
                    DropdownMenuItem(value: 'day', child: Text('Hari dalam Seminggu')),
                  ],
                  onChanged: (value) {
                    setState(() {
                      tempFilterType = value;
                      if (value == 'today') {
                        tempSelectedDate = DateTime.now();
                        tempSelectedDay = null;
                      } else if (value == 'date') {
                        tempSelectedDate = tempSelectedDate ?? DateTime.now();
                        tempSelectedDay = null;
                      } else if (value == 'day') {
                        tempSelectedDate = null;
                        tempSelectedDay = tempSelectedDay ?? 1; // Default: Senin
                      }
                    });
                  },
                ),
                const SizedBox(height: 16),
                // Filter tanggal spesifik
                if (tempFilterType == 'date')
                  InkWell(
                    onTap: () async {
                      final picked = await showDatePicker(
                        context: context,
                        initialDate: tempSelectedDate ?? DateTime.now(),
                        firstDate: DateTime(2020),
                        lastDate: DateTime(2030),
                      );
                      if (picked != null) {
                        setState(() {
                          tempSelectedDate = picked;
                        });
                      }
                    },
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Tanggal',
                        border: OutlineInputBorder(),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(tempSelectedDate != null
                              ? _dateFormat.format(tempSelectedDate!)
                              : 'Pilih Tanggal'),
                          const Icon(Icons.calendar_today, size: 20),
                        ],
                      ),
                    ),
                  ),
                // Filter hari dalam seminggu
                if (tempFilterType == 'day')
                  DropdownButton<int>(
                    value: tempSelectedDay,
                    isExpanded: true,
                    hint: const Text('Pilih Hari'),
                    items: _dayNames.asMap().entries.map((entry) {
                      return DropdownMenuItem(
                        value: entry.key,
                        child: Text(entry.value),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        tempSelectedDay = value;
                      });
                    },
                  ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () {
                  setState(() {
                    tempFilterType = 'today';
                    tempSelectedDate = DateTime.now();
                    tempSelectedDay = null;
                  });
                },
                child: const Text('Hari Ini'),
              ),
              TextButton(
                onPressed: () {
                  setState(() {
                    if (tempFilterType == 'today') {
                      _selectedDate = DateTime.now();
                      _selectedDay = null;
                    } else if (tempFilterType == 'date') {
                      _selectedDate = tempSelectedDate;
                      _selectedDay = null;
                    } else if (tempFilterType == 'day') {
                      _selectedDate = null;
                      _selectedDay = tempSelectedDay;
                    }
                  });
                  Navigator.pop(context);
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
      arguments: schedule.id,
    ).then((result) {
      if (result == true && mounted) {
        _loadData();
      }
    });
  }

  void _navigateToAdd() {
    Navigator.pushNamed(
      context,
      '/tambah-item-pakan',
    ).then((result) {
      if (result == true && mounted) {
        _loadData();
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
            'Apakah Anda yakin ingin menghapus semua data pakan untuk sapi ${cow?.name ?? 'ID: ${schedule.cowId}'} pada tanggal ${_dateFormat.format(_apiDateFormat.parse(schedule.date))} sesi ${schedule.session}?'),
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
      // Hapus semua item pakan untuk jadwal ini
      final itemsToDelete =
          _feedItems.where((item) => item.dailyFeedId == schedule.id).toList();

      if (itemsToDelete.isNotEmpty) {
        for (var item in itemsToDelete) {
          final deleteResponse = await FeedItemService.deleteFeedItem(item.id);
          if (deleteResponse['success'] != true) {
            throw Exception(
                deleteResponse['message'] ?? 'Gagal menghapus item pakan');
          }
        }
      }

      // Hapus jadwal itu sendiri
      await deleteDailyFeed(schedule.id);

      // Tampilkan pesan sukses
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Data pakan berhasil dihapus')),
        );
      }

      // Muat ulang data
      await _loadData();
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

                  // Indikator filter
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Row(
                      children: [
                        const Icon(Icons.filter_list,
                            size: 16, color: Colors.grey),
                        const SizedBox(width: 4),
                        Text(
                          _selectedDate != null
                              ? 'Tanggal: ${_dateFormat.format(_selectedDate!)}'
                              : _selectedDay != null
                                  ? 'Hari: ${_dayNames[_selectedDay!]}'
                                  : 'Tanggal: ${_dateFormat.format(DateTime.now())}',
                          style: const TextStyle(
                              color: Colors.grey, fontSize: 12),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed: () {
                            setState(() {
                              _selectedDate = DateTime.now(); // Reset ke hari ini
                              _selectedDay = null;
                            });
                          },
                          style: TextButton.styleFrom(
                            visualDensity: VisualDensity.compact,
                            padding: EdgeInsets.zero,
                            minimumSize: const Size(48, 24),
                          ),
                          child: const Text('Hari Ini',
                              style: TextStyle(fontSize: 12)),
                        ),
                      ],
                    ),
                  ),

                  // Daftar jadwal dengan item pakan
                  Expanded(
                    child: groupedSchedules.isEmpty
                        ? Center(
                            child: Text(
                              _searchQuery.isNotEmpty
                                  ? 'Tidak ada data yang sesuai dengan pencarian Anda'
                                  : _selectedDay != null
                                      ? 'Tidak ada data pakan harian untuk hari ${_dayNames[_selectedDay!]}'
                                      : 'Tidak ada data pakan harian untuk tanggal ini',
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
                              final cowId = schedules.first.cowId;
                              final cow = _cowsMap[cowId];

                              return Card(
                                margin: const EdgeInsets.symmetric(
                                    vertical: 8.0, horizontal: 4.0),
                                elevation: 2.0,
                                child: Column(
                                  children: [
                                    // Header dengan nama sapi dan tanggal
                                    ListTile(
                                      title: Text(
                                        cow?.name ?? 'Sapi #${cowId}',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Text(
                                          'Tanggal: ${_dateFormat.format(_apiDateFormat.parse(schedules.first.date))}'),
                                    ),
                                    // Untuk setiap sesi dan item pakan
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
                                      // Tampilkan item pakan untuk sesi ini
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
                                                  'Jumlah: ${item.quantity} kg'),
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