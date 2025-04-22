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
import 'package:intl/intl.dart';

class AddFeedItemPage extends StatefulWidget {
  const AddFeedItemPage({super.key});

  @override
  _AddFeedItemPageState createState() => _AddFeedItemPageState();
}

class _AddFeedItemPageState extends State<AddFeedItemPage> {
  final DateFormat _dateFormat = DateFormat('dd MMM yyyy');

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
    {'feed_id': null, 'quantity': ''}
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final results = await Future.wait([
        getDailyFeedSchedules(),
        getCows(),
        getFeeds(),
        getDailyFeedItems(),
        getFeedStocks(),
      ]);

      final List<DailyFeedSchedule> schedules = results[0] as List<DailyFeedSchedule>;
      final List<Cow> cowsList = results[1] as List<Cow>;
      final List<Feed> feedsList = results[2] as List<Feed>;
      final List<FeedItem> feedItemsList = results[3] as List<FeedItem>;
      final List<FeedStock> feedStocksList = results[4] as List<FeedStock>;

      final Map<int, Cow> cowsMap = {for (var cow in cowsList) cow.id: cow};

      setState(() {
        _dailyFeeds = schedules;
        _feeds = feedsList;
        _feedItems = feedItemsList;
        _feedStocks = feedStocksList;
        _cowsMap = cowsMap;
      });

      _filterAvailableDailyFeeds();
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading data: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
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
      final feedDate = DateTime(feed.date.year, feed.date.month, feed.date.day);
      final isValidDate = !feedDate.isBefore(todayStart);
      final itemCount = feedItemCounts[feed.id] ?? 0;
      return isValidDate && itemCount < 3;
    }).toList();

    setState(() {
      _dailyFeeds = validDailyFeeds;
    });
  }

  void _updateSelectedSchedule(String? idString) {
    final id = idString != null ? int.tryParse(idString) : null;

    setState(() {
      _selectedDailyFeedId = id;
      _selectedDailyFeedDetails = id != null
          ? _dailyFeeds.firstWhere((feed) => feed.id == id, orElse: () => _dailyFeeds.first)
          : null;
    });
  }

  void _handleFormChange(int index, String field, dynamic value) {
    setState(() {
      _formList[index][field] = value;
    });
  }

  void _addFeedItemRow() {
    if (_formList.length >= 3) {
      _showErrorDialog('Perhatian', 'Maksimal 3 jenis pakan untuk satu sesi');
      return;
    }

    setState(() {
      _formList.add({'feed_id': null, 'quantity': ''});
    });
  }

  void _removeFeedItemRow(int index) {
    if (_formList.length > 1) {
      setState(() {
        _formList.removeAt(index);
      });
    }
  }

  List<Feed> _getAvailableFeedsForRow(int currentIndex) {
    final selectedFeedIds = _formList
        .asMap()
        .entries
        .where((entry) => entry.key != currentIndex && entry.value['feed_id'] != null)
        .map((entry) => entry.value['feed_id'] as int?)
        .whereType<int>()
        .toList();

    return _feeds.where((feed) => !selectedFeedIds.contains(feed.id)).toList();
  }

  double _getFeedStock(int? feedId) {
    if (feedId == null) {
      print('Debug: feedId is null, returning 0.0');
      return 0.0;
    }

    final matchingStocks = _feedStocks.where((stock) => stock.feedId == feedId).toList();
    print('Debug: Found ${matchingStocks.length} FeedStock entries for feedId $feedId');

    if (matchingStocks.isEmpty) {
      print('Debug: No matching FeedStock entries, returning 0.0');
      return 0.0;
    }

    matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    print('Debug: Most recent FeedStock: id=${matchingStocks.first.id}, stock=${matchingStocks.first.stock}, updatedAt=${matchingStocks.first.updatedAt}');

    return matchingStocks.first.stock;
  }

  Future<void> _submitForm() async {
  if (_selectedDailyFeedId == null) {
    _showErrorDialog('Error', 'Silakan pilih sesi pakan harian terlebih dahulu.');
    return;
  }

  for (var item in _formList) {
    if (item['feed_id'] == null || item['quantity'].toString().trim().isEmpty) {
      _showErrorDialog('Error', 'Semua field harus diisi.');
      return;
    }
  }

  for (var item in _formList) {
    final feedId = item['feed_id'] as int?;
    final quantityStr = item['quantity'].toString();
    final requestedQuantity = double.tryParse(quantityStr) ?? 0.0;
    final availableStock = _getFeedStock(feedId);

    if (requestedQuantity > availableStock) {
      final feedName = _feeds.firstWhere((feed) => feed.id == feedId).name;
      _showErrorDialog(
        'Stok Tidak Mencukupi',
        '$feedName: Tersedia $availableStock kg, diminta $requestedQuantity kg',
      );
      return;
    }
  }

  final feedIdCounts = <int, int>{};
  for (var item in _formList) {
    final feedId = item['feed_id'] as int?;
    if (feedId != null) {
      feedIdCounts[feedId] = (feedIdCounts[feedId] ?? 0) + 1;
    }
  }
  final duplicateFeedIds = feedIdCounts.entries.where((entry) => entry.value > 1).map((e) => e.key);
  if (duplicateFeedIds.isNotEmpty) {
    final duplicateFeedNames = duplicateFeedIds
        .map((id) => _feeds.firstWhere((feed) => feed.id == id).name)
        .join(', ');
    _showErrorDialog(
      'Pakan Duplikat',
      '$duplicateFeedNames sudah dipilih lebih dari satu kali. Silakan pilih jenis pakan yang berbeda.',
    );
    return;
  }

  setState(() {
    _isLoading = true;
    _errorMessage = '';
  });

  try {
    final List<FeedItem> newFeedItems = _formList.map((item) {
      return FeedItem(
        id: 0,
        dailyFeedId: _selectedDailyFeedId!, // Still needed for the FeedItem object
        feedId: item['feed_id'] as int,
        quantity: double.parse(item['quantity'].toString()),
        feed: null,
      );
    }).toList();

    print('Debug: Attempting to add feed items: ${newFeedItems.map((item) => {
      "feed_id": item.feedId,
      "quantity": item.quantity,
    }).toList()}');

    await addFeedItems(_selectedDailyFeedId!, newFeedItems);

    _showSuccessDialog('Berhasil!', 'Data pakan harian berhasil ditambahkan');

    if (mounted) {
      Navigator.pop(context, true);
    }
  } catch (e) {
    setState(() {
      _errorMessage = 'Error: $e';
    });
    _showErrorDialog('Error', 'Gagal menyimpan data pakan: $e');
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
            onPressed: () => Navigator.pop(context),
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
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
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
                    items: _dailyFeeds.isEmpty
                        ? [
                            const DropdownMenuItem(
                              value: '',
                              child: Text('Tidak ada sesi tersedia'),
                            )
                          ]
                        : _dailyFeeds.map((feed) {
                            final itemCount = _feedItems.where((item) => item.dailyFeedId == feed.id).length;
                            final cowName = _cowsMap[feed.cowId]?.name ?? 'Sapi #${feed.cowId}';
                            return DropdownMenuItem(
                              value: feed.id.toString(),
                              child: Text(
                                '${_dateFormat.format(feed.date)} - Sesi ${_formatSession(feed.session)} - $cowName ($itemCount/3 pakan)',
                              ),
                            );
                          }).toList(),
                    onChanged: (value) => _updateSelectedSchedule(value),
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
                                const Text('Tanggal', style: TextStyle(color: Colors.grey)),
                                const SizedBox(height: 4.0),
                                Text(_dateFormat.format(_selectedDailyFeedDetails!.date)),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Sesi', style: TextStyle(color: Colors.grey)),
                                const SizedBox(height: 4.0),
                                Text(_formatSession(_selectedDailyFeedDetails!.session)),
                              ],
                            ),
                          ),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Sapi', style: TextStyle(color: Colors.grey)),
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
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
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
                                    items: _getAvailableFeedsForRow(index).map((feed) {
                                      return DropdownMenuItem(
                                        value: feed.id,
                                        child: Text(feed.name),
                                      );
                                    }).toList(),
                                    onChanged: (value) => _handleFormChange(index, 'feed_id', value),
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
                                onChanged: (value) => _handleFormChange(index, 'quantity', value),
                              ),
                            ),
                          ],
                        ),
                        if (item['feed_id'] != null && item['quantity'].toString().isNotEmpty)
                          Builder(builder: (context) {
                            final requestedQuantity = double.tryParse(item['quantity'].toString()) ?? 0.0;
                            final availableStock = _getFeedStock(item['feed_id']);
                            if (requestedQuantity > availableStock) {
                              return Padding(
                                padding: const EdgeInsets.only(top: 8.0),
                                child: Text(
                                  'Stok tidak mencukupi: Tersedia $availableStock kg',
                                  style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                                ),
                              );
                            }
                            return const SizedBox.shrink();
                          }),
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
    );
  }
}