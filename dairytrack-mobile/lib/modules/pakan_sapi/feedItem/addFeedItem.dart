import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/pakan/dailyFeedItem.dart';
import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/config/api/pakan/feedStock.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:intl/intl.dart';


class AddFeedItemPage extends StatefulWidget {
  const AddFeedItemPage({super.key});

  @override
  _AddFeedItemPageState createState() => _AddFeedItemPageState();
}

class _AddFeedItemPageState extends State<AddFeedItemPage> {
  final DateFormat _dateFormat = DateFormat('dd MMM yyyy');
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = true;
  String _errorMessage = '';

  List<DailyFeedSchedule> _dailyFeeds = [];
  List<Feed> _feeds = [];
  List<FeedItem> _feedItems = [];
  List<FeedStock> _feedStocks = [];
  Map<int, Cow> _cowsMap = {};

  int? _selectedDailyFeedId;
  DailyFeedSchedule? _selectedDailyFeedDetails;

  List<Map<String, dynamic>> _formList = [
    {'feed_id': null, 'quantity': ''},
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    if (mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });
    }

    try {
      final results = await Future.wait([
        getAllDailyFeeds(),
        getCows(),
        getAllFeeds(),
        FeedItemService.getAllFeedItems(), // Static method
        getAllFeedStocks(),
      ]);

      final List<DailyFeedSchedule> schedules = results[0] as List<DailyFeedSchedule>;
      final List<Cow> cowsList = results[1] as List<Cow>;
      final List<Feed> feedsList = results[2] as List<Feed>;
      final Map<String, dynamic> feedItemsResponse = results[3] as Map<String, dynamic>;
      final List<FeedStock> feedStocksList = results[4] as List<FeedStock>;

      final List<FeedItem> feedItemsList = feedItemsResponse['success'] == true
          ? (feedItemsResponse['data'] as List)
              .map((item) => FeedItem.fromJson(item))
              .toList()
          : [];

      final Map<int, Cow> cowsMap = {};
      for (var cow in cowsList) {
        if (cow.id != null) {
          cowsMap[cow.id!] = cow;
        } else {
          print('Warning: Cow with null ID found: ${cow.name}');
        }
      }

      if (mounted) {
        setState(() {
          _dailyFeeds = schedules;
          _feeds = feedsList;
          _feedItems = feedItemsList;
          _feedStocks = feedStocksList;
          _cowsMap = cowsMap;
          _isLoading = false;
        });
      }

      _filterAvailableDailyFeeds();
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error loading data: $e';
          _isLoading = false;
        });
        SchedulerBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _showErrorDialog('Error', 'Gagal memuat data: $e');
          }
        });
      }
    }
  }

  void _filterAvailableDailyFeeds() {
    final today = DateTime.now();
    final todayStart = DateTime(today.year, today.month, today.day);

    final Map<int, int> feedItemCounts = {};
    for (var item in _feedItems) {
      feedItemCounts[item.dailyFeedId] = (feedItemCounts[item.dailyFeedId] ?? 0) + 1;
    }

    final validDailyFeeds = _dailyFeeds.where((feed) {
      final feedDate = DateTime.parse(feed.date);
      final isValidDate = !feedDate.isBefore(todayStart);
      final itemCount = feedItemCounts[feed.id] ?? 0;
      return isValidDate && itemCount < 3;
    }).toList();

    if (mounted) {
      setState(() {
        _dailyFeeds = validDailyFeeds;
      });
    }
  }

  void _updateSelectedSchedule(String? idString) {
    final id = idString != null ? int.tryParse(idString) : null;

    if (mounted) {
      setState(() {
        _selectedDailyFeedId = id;
        _selectedDailyFeedDetails = id != null
            ? _dailyFeeds.firstWhere(
                (feed) => feed.id == id,
                orElse: () => null as DailyFeedSchedule,
              )
            : null;
      });
    }
  }

  void _handleFormChange(int index, String field, dynamic value) {
    if (mounted) {
      setState(() {
        if (field == 'feed_id') {
          final selectedFeedIds = _formList
              .asMap()
              .entries
              .where((entry) => entry.key != index && entry.value['feed_id'] != null)
              .map((entry) => entry.value['feed_id'] as int)
              .toSet();
          if (selectedFeedIds.contains(value)) {
            _showErrorDialog('Perhatian',
                'Jenis pakan ini sudah dipilih. Silakan pilih jenis pakan lain.');
            return;
          }
        }
        _formList[index][field] = value;
      });
    }
  }

  void _addFeedItemRow() {
    if (_formList.length >= 3) {
      _showErrorDialog('Perhatian', 'Maksimal 3 jenis pakan untuk satu sesi');
      return;
    }

    if (mounted) {
      setState(() {
        _formList.add({'feed_id': null, 'quantity': ''});
      });
    }
  }

  void _removeFeedItemRow(int index) {
    if (_formList.length > 1) {
      if (mounted) {
        setState(() {
          _formList.removeAt(index);
        });
      }
    }
  }

  List<Feed> _getAvailableFeedsForRow(int currentIndex) {
    final selectedFeedIds = _formList
        .asMap()
        .entries
        .where((entry) => entry.key != currentIndex && entry.value['feed_id'] != null)
        .map((entry) => entry.value['feed_id'] as int)
        .toList();

    return _feeds.where((feed) => !selectedFeedIds.contains(feed.id)).toList();
  }

  double _getFeedStock(int? feedId) {
    if (feedId == null) {
      return 0.0;
    }

    final matchingStocks = _feedStocks.where((stock) => stock.feedId == feedId).toList();
    if (matchingStocks.isEmpty) {
      return 0.0;
    }

    matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return matchingStocks.first.stock ?? 0.0; // Added null safety
  }

  Future<void> _submitForm() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedDailyFeedId == null) {
      if (mounted) {
        _showErrorDialog('Error', 'Silakan pilih sesi pakan harian terlebih dahulu.');
      }
      return;
    }

    final List<Map<String, dynamic>> newItems = [];
    for (var item in _formList) {
      final feedId = item['feed_id'] as int?;
      final quantityStr = item['quantity']?.toString();
      if (feedId == null || quantityStr == null || quantityStr.trim().isEmpty) {
        if (mounted) {
          _showErrorDialog('Error', 'Semua field harus diisi.');
        }
        return;
      }

      final requestedQuantity = double.tryParse(quantityStr) ?? 0.0;
      final availableStock = _getFeedStock(feedId);

      if (requestedQuantity <= 0) {
        if (mounted) {
          _showErrorDialog('Error', 'Jumlah harus lebih dari 0.');
        }
        return;
      }

      if (requestedQuantity > availableStock) {
        final feedName = _feeds.firstWhere((feed) => feed.id == feedId).name;
        if (mounted) {
          _showErrorDialog(
            'Stok Tidak Mencukupi',
            '$feedName: Tersedia $availableStock kg, diminta $requestedQuantity kg',
          );
        }
        return;
      }

      newItems.add({
        'feed_id': feedId,
        'quantity': requestedQuantity,
        'feed_name': _feeds.firstWhere((feed) => feed.id == feedId).name,
      });
    }

    // Show confirmation dialog
    final sessionInfo = _selectedDailyFeedDetails != null
        ? 'Sesi: ${_formatSession(_selectedDailyFeedDetails!.session)}, '
            'Tanggal: ${_dateFormat.format(DateTime.parse(_selectedDailyFeedDetails!.date))}, '
            'Sapi: ${_cowsMap[_selectedDailyFeedDetails!.cowId]?.name ?? "Sapi #${_selectedDailyFeedDetails!.cowId}"}'
        : 'Sesi ID: $_selectedDailyFeedId';
    final itemDescriptions = newItems
        .map((item) => '${item['feed_name']}: ${item['quantity']} kg')
        .toList();
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Konfirmasi'),
          content: Text(
            'Apakah Anda yakin ingin menambahkan pakan berikut untuk $sessionInfo?\n'
            '${itemDescriptions.join('\n')}',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false), // Cancel
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true), // Confirm
              child: const Text('Ya, Tambah'),
            ),
          ],
        );
      },
    );

    if (confirm != true) {
      return;
    }

    if (mounted) {
      setState(() {
        _isLoading = true;
        _errorMessage = '';
      });
    }

    try {
      final List<Map<String, dynamic>> feedItems = newItems
          .map((item) => {
                'feed_id': item['feed_id'],
                'quantity': item['quantity'],
              })
          .toList();

      final response = await FeedItemService.addFeedItems(
        dailyFeedId: _selectedDailyFeedId!,
        feedItems: feedItems,
      );

      if (response['success'] == true) {
        if (mounted) {
          _showSuccessDialog(
            'Berhasil!',
            'Berhasil menambahkan pakan untuk $sessionInfo:\n${itemDescriptions.join('\n')}',
          );
          await Future.delayed(const Duration(seconds: 2)); // Allow dialog to be seen
          if (mounted) {
            Navigator.pop(context, true);
          }
        }
      } else {
        throw Exception(response['message'] ?? 'Gagal menambahkan item pakan');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Error: $e';
        });
        _showErrorDialog('Error', 'Gagal menyimpan data pakan: $e');
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              if (mounted) {
                Navigator.pop(context, true); // Pop back to previous screen
              }
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  String _formatSession(String session) {
    return session.isNotEmpty ? session[0].toUpperCase() + session.substring(1) : session;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Item Pakan'),
        backgroundColor: const Color(0xFF17A2B8),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF17A2B8)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_errorMessage.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.all(8.0),
                        margin: const EdgeInsets.only(bottom: 16.0),
                        decoration: BoxDecoration(
                          color: Colors.red.shade100,
                          borderRadius: BorderRadius.circular(4.0),
                        ),
                        child: Text(
                          _errorMessage,
                          style: TextStyle(color: Colors.red.shade800),
                        ),
                      ),
                    const Text(
                      'Sesi Pemberian Pakan',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
                    ),
                    const SizedBox(height: 8.0),
                    DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 16.0),
                      ),
                      value: _selectedDailyFeedId?.toString(),
                      hint: const Text('Pilih sesi pemberian pakan'),
                      isExpanded: true,
                      validator: (value) => value == null ? 'Harap pilih sesi pakan' : null,
                      items: _dailyFeeds.isEmpty
                          ? [
                              const DropdownMenuItem(
                                value: '',
                                child: Text('Tidak ada sesi tersedia'),
                              ),
                            ]
                          : _dailyFeeds.map((feed) {
                              final itemCount = _feedItems
                                  .where((item) => item.dailyFeedId == feed.id)
                                  .length;
                              final cowName = _cowsMap[feed.cowId]?.name ?? 'Sapi #${feed.cowId}';
                              return DropdownMenuItem(
                                value: feed.id.toString(),
                                child: Text(
                                  '${_dateFormat.format(DateTime.parse(feed.date))} - '
                                  'Sesi ${_formatSession(feed.session)} - '
                                  '$cowName ($itemCount/3 pakan)',
                                ),
                              );
                            }).toList(),
                      onChanged: _dailyFeeds.isEmpty
                          ? null
                          : (value) => _updateSelectedSchedule(value),
                    ),
                    const SizedBox(height: 4.0),
                    const Text(
                      'Pilih sesi pemberian pakan untuk menambahkan jenis pakan',
                      style: TextStyle(fontSize: 12.0, color: Colors.grey),
                    ),
                    const SizedBox(height: 24.0),
                    if (_selectedDailyFeedDetails != null) ...[
                      const Text(
                        'Detail Sesi',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
                      ),
                      const SizedBox(height: 8.0),
                      Container(
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Tanggal',
                                      style: TextStyle(color: Colors.grey)),
                                  const SizedBox(height: 4.0),
                                  Text(_dateFormat
                                      .format(DateTime.parse(_selectedDailyFeedDetails!.date))),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Sesi',
                                      style: TextStyle(color: Colors.grey)),
                                  const SizedBox(height: 4.0),
                                  Text(_formatSession(_selectedDailyFeedDetails!.session)),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Sapi',
                                      style: TextStyle(color: Colors.grey)),
                                  const SizedBox(height: 4.0),
                                  Text(_cowsMap[_selectedDailyFeedDetails!.cowId]?.name ??
                                      'Sapi #${_selectedDailyFeedDetails!.cowId}'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24.0),
                    ],
                    ..._formList.asMap().entries.map((entry) {
                      final index = entry.key;
                      final item = entry.value;

                      return Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                'Jenis Pakan #${index + 1}',
                                style: const TextStyle(
                                    fontWeight: FontWeight.bold, fontSize: 16.0),
                              ),
                              if (_formList.length > 1)
                                TextButton.icon(
                                  onPressed: () => _removeFeedItemRow(index),
                                  icon: const Icon(Icons.delete, color: Colors.red),
                                  label: const Text('Hapus', style: TextStyle(color: Colors.red)),
                                  style: TextButton.styleFrom(
                                    padding: EdgeInsets.zero,
                                    minimumSize: const Size(0, 0),
                                  ),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8.0),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                flex: 3,
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    DropdownButtonFormField<int>(
                                      decoration: InputDecoration(
                                        labelText: 'Jenis Pakan',
                                        border: OutlineInputBorder(
                                          borderRadius: BorderRadius.circular(8.0),
                                        ),
                                      ),
                                      value: item['feed_id'] as int?,
                                      hint: const Text('Pilih pakan'),
                                      isExpanded: true,
                                      validator: (value) =>
                                          value == null ? 'Harap pilih jenis pakan' : null,
                                      items: _getAvailableFeedsForRow(index).map((feed) {
                                        return DropdownMenuItem(
                                          value: feed.id,
                                          child: Text(feed.name),
                                        );
                                      }).toList(),
                                      onChanged: (value) =>
                                          _handleFormChange(index, 'feed_id', value),
                                    ),
                                    if (item['feed_id'] != null) ...[
                                      const SizedBox(height: 8.0),
                                      Text(
                                        'Stok tersedia: ${_getFeedStock(item['feed_id'])} kg',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Colors.blue,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                              const SizedBox(width: 12.0),
                              Expanded(
                                flex: 2,
                                child: TextFormField(
                                  decoration: InputDecoration(
                                    labelText: 'Jumlah (kg)',
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(8.0),
                                    ),
                                  ),
                                  keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                  initialValue: item['quantity'].toString(),
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'Masukkan jumlah';
                                    }
                                    final qty = double.tryParse(value);
                                    if (qty == null || qty <= 0) {
                                      return 'Jumlah harus lebih dari 0';
                                    }
                                    if (item['feed_id'] != null) {
                                      final availableStock = _getFeedStock(item['feed_id']);
                                      if (qty > availableStock) {
                                        return 'Stok hanya $availableStock kg';
                                      }
                                    }
                                    return null;
                                  },
                                  onChanged: (value) =>
                                      _handleFormChange(index, 'quantity', value),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16.0),
                        ],
                      );
                    }).toList(),
                    if (_formList.length < 3)
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton.icon(
                          onPressed: _addFeedItemRow,
                          icon: const Icon(Icons.add, color: Color(0xFF17A2B8)),
                          label: const Text(
                            'Tambah Jenis Pakan',
                            style: TextStyle(color: Color(0xFF17A2B8)),
                          ),
                        ),
                      ),
                    const SizedBox(height: 24.0),
                    SizedBox(
                      width: double.infinity,
                      height: 50.0,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF17A2B8),
                          foregroundColor: Colors.white,
                        ),
                        onPressed: _isLoading ? null : _submitForm,
                        child: _isLoading
                            ? const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2.0,
                                    ),
                                  ),
                                  SizedBox(width: 12.0),
                                  Text('Menyimpan...'),
                                ],
                              )
                            : const Text('Tambah Pakan'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}