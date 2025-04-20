import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/pakan/dailyFeedItem.dart';
import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/pakan/feedStock.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class EditFeedItemPage extends StatefulWidget {
  final int dailyFeedId;
  final VoidCallback? onUpdateSuccess;

  const EditFeedItemPage({
    super.key,
    required this.dailyFeedId,
    this.onUpdateSuccess,
  });

  @override
  _EditFeedItemPageState createState() => _EditFeedItemPageState();
}

class _EditFeedItemPageState extends State<EditFeedItemPage> {
  final DateFormat _dateFormat = DateFormat('dd MMM yyyy');

  bool _isLoading = true;
  bool _isEditing = false;
  String _errorMessage = '';

  DailyFeedSchedule? _dailyFeed;
  List<FeedItem> _feedItems = [];
  List<Feed> _feeds = [];
  List<FeedStock> _feedStocks = [];
  Map<int, Cow> _cowsMap = {};

  List<Map<String, Object?>> _formList = [];

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
        getDailyFeedScheduleById(widget.dailyFeedId),
        getFeedItemsByScheduleId(widget.dailyFeedId),
        getFeeds(),
        getFeedStocks(),
        getCows(),
      ]);

      final DailyFeedSchedule dailyFeed = results[0] as DailyFeedSchedule;
      final List<FeedItem> feedItems = results[1] as List<FeedItem>;
      final List<Feed> feedsList = results[2] as List<Feed>;
      final List<FeedStock> feedStocksList = results[3] as List<FeedStock>;
      final List<Cow> cowsList = results[4] as List<Cow>;

      final Map<int, Cow> cowsMap = {for (var cow in cowsList) cow.id: cow};

      setState(() {
        _dailyFeed = dailyFeed;
        _feedItems = feedItems;
        _feeds = feedsList;
        _feedStocks = feedStocksList;
        _cowsMap = cowsMap;
        _formList = feedItems.map((item) => <String, Object?>{
          'id': item.id,
          'feed_id': item.feedId,
          'quantity': item.quantity.toString(),
          'daily_feed_id': item.dailyFeedId,
        }).toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading data: $e';
        _isLoading = false;
      });
    }
  }

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
      if (!_isEditing) {
        _formList = _feedItems.map((item) => <String, Object?>{
          'id': item.id,
          'feed_id': item.feedId,
          'quantity': item.quantity.toString(),
          'daily_feed_id': item.dailyFeedId,
        }).toList();
      }
    });
  }

  void _handleFormChange(int index, String field, Object? value) {
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
      _formList.add(<String, Object?>{
        'id': null,
        'feed_id': null,
        'quantity': '',
        'daily_feed_id': widget.dailyFeedId,
      });
    });
  }

  Future<void> _removeFeedItemRow(int index) async {
    final item = _formList[index];

    if (item['id'] != null) {
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Konfirmasi'),
          content: const Text('Apakah Anda yakin ingin menghapus item pakan ini?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Hapus', style: TextStyle(color: Colors.red)),
            ),
          ],
        ),
      );

      if (confirm != true) return;

      setState(() {
        _isLoading = true;
      });

      try {
        await deleteFeedItem(item['id'] as int);
        setState(() {
          _feedItems.removeWhere((feedItem) => feedItem.id == item['id']);
          _formList.removeAt(index);
        });
        _showSuccessDialog('Berhasil!', 'Item pakan berhasil dihapus');
      } catch (e) {
        _showErrorDialog('Error', 'Gagal menghapus item pakan: $e');
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    } else {
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
        .map((entry) => entry.value['feed_id'] as int)
        .toList();

    return _feeds.where((feed) => !selectedFeedIds.contains(feed.id)).toList();
  }

  double _getFeedStock(int? feedId) {
    if (feedId == null) return 0.0;

    final matchingStocks = _feedStocks.where((stock) => stock.feedId == feedId).toList();
    if (matchingStocks.isEmpty) return 0.0;

    matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return matchingStocks.first.stock;
  }

  Future<void> _handleSave() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi'),
        content: const Text('Apakah Anda yakin ingin menyimpan perubahan pada data pakan harian?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Simpan'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      if (!_validateFeedItems()) {
        setState(() {
          _isLoading = false;
        });
        return;
      }

      // Check for duplicate feed_ids
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
        setState(() {
          _isLoading = false;
        });
        return;
      }

      // Separate new and updated items
      final newItems = _formList.where((item) => item['id'] == null).toList();
      final updatedItems = _formList.where((item) => item['id'] != null).toList();

      // Handle new items
      if (newItems.isNotEmpty) {
        final newFeedItems = newItems.map((item) {
          return FeedItem(
            id: 0,
            dailyFeedId: widget.dailyFeedId,
            feedId: item['feed_id'] as int,
            quantity: double.parse(item['quantity'] as String),
            feed: _feeds.firstWhere((f) => f.id == item['feed_id']),
          );
        }).toList();

        await addFeedItems(widget.dailyFeedId, newFeedItems);
      }

      // Handle updated items using bulk update
      if (updatedItems.isNotEmpty) {
        final updatedFeedItems = updatedItems.map((item) {
          return FeedItem(
            id: item['id'] as int,
            dailyFeedId: widget.dailyFeedId,
            feedId: item['feed_id'] as int,
            quantity: double.parse(item['quantity'] as String),
            feed: _feeds.firstWhere((f) => f.id == item['feed_id']),
          );
        }).toList();

        await bulkUpdateFeedItems(updatedFeedItems);
      }

      // Reload data to ensure consistency
      await _loadData();
      setState(() {
        _isEditing = false;
      });

      _showSuccessDialog('Berhasil!', 'Data pakan harian berhasil diperbarui');
      widget.onUpdateSuccess?.call();
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
      _showErrorDialog('Error', e.toString().contains('Stok tidak cukup')
          ? e.toString()
          : 'Gagal menyimpan data pakan: $e');
    }
  }

  bool _validateFeedItems() {
    if (_formList.isEmpty) {
      _showErrorDialog('Perhatian', 'Harus ada minimal satu jenis pakan');
      return false;
    }

    if (_formList.length > 3) {
      _showErrorDialog('Perhatian', 'Maksimal 3 jenis pakan untuk satu sesi');
      return false;
    }

    for (var item in _formList) {
      if (item['feed_id'] == null || (item['quantity'] as String).trim().isEmpty) {
        _showErrorDialog('Form Tidak Lengkap', 'Semua item pakan harus memiliki jenis dan jumlah yang valid');
        return false;
      }
      final quantity = double.tryParse(item['quantity'] as String) ?? 0.0;
      if (quantity <= 0) {
        _showErrorDialog('Form Tidak Lengkap', 'Jumlah pakan harus lebih dari 0');
        return false;
      }
      final availableStock = _getFeedStock(item['feed_id'] as int?);
      if (quantity > availableStock) {
        final feedName = _feeds.firstWhere((feed) => feed.id == item['feed_id']).name;
        _showErrorDialog(
          'Stok Tidak Mencukupi',
          '$feedName: Tersedia $availableStock kg, diminta $quantity kg',
        );
        return false;
      }
    }

    return true;
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
              Navigator.pop(context);
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

  String _getCowName() {
    if (_dailyFeed == null) return '-';
    return _cowsMap[_dailyFeed!.cowId]?.name ?? 'Sapi #${_dailyFeed!.cowId}';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail dan Edit Item Pakan'),
        backgroundColor: const Color(0xFF17A2B8),
        actions: [
          if (!_isEditing)
            IconButton(
              icon: const Icon(Icons.edit),
              onPressed: _isLoading ? null : _toggleEditMode,
              tooltip: 'Edit',
            ),
        ],
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
                              Text(_dailyFeed != null ? _dateFormat.format(_dailyFeed!.date) : '-'),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Sesi', style: TextStyle(color: Colors.grey)),
                              const SizedBox(height: 4.0),
                              Text(_dailyFeed != null ? _formatSession(_dailyFeed!.session) : '-'),
                            ],
                          ),
                        ),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Sapi', style: TextStyle(color: Colors.grey)),
                              const SizedBox(height: 4.0),
                              Text(_getCowName()),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24.0),

                  if (_isEditing) ...[
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
                                      onChanged: item['id'] != null
                                          ? null // Disable for existing items, per React code
                                          : (value) => _handleFormChange(index, 'feed_id', value),
                                    ),
                                    if (item['feed_id'] != null) ...[
                                      const SizedBox(height: 8.0),
                                      Text(
                                        'Stok tersedia: ${_getFeedStock(item['feed_id'] as int?)} kg',
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
                          if (item['feed_id'] != null && (item['quantity'] as String).isNotEmpty)
                            Builder(builder: (context) {
                              final requestedQuantity = double.tryParse(item['quantity'] as String) ?? 0.0;
                              final availableStock = _getFeedStock(item['feed_id'] as int?);
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
                    }),

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
                        onPressed: _isLoading ? null : _handleSave,
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
                            : const Text('Simpan'),
                      ),
                    ),
                  ] else ...[
                    if (_feedItems.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade50,
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: const Text('Tidak ada data pakan untuk sesi ini.'),
                      )
                    else
                      Table(
                        border: TableBorder.all(color: Colors.grey.shade300),
                        columnWidths: const {
                          0: FlexColumnWidth(1),
                          1: FlexColumnWidth(3),
                          2: FlexColumnWidth(2),
                        },
                        children: [
                          TableRow(
                            decoration: BoxDecoration(color: Colors.grey.shade200),
                            children: const [
                              Padding(
                                padding: EdgeInsets.all(8.0),
                                child: Text(
                                  'No',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsets.all(8.0),
                                child: Text(
                                  'Jenis Pakan',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsets.all(8.0),
                                child: Text(
                                  'Jumlah (kg)',
                                  textAlign: TextAlign.center,
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          ..._feedItems.asMap().entries.map((entry) {
                            final index = entry.key;
                            final item = entry.value;
                            return TableRow(
                              children: [
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Text(
                                    '${index + 1}',
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Text(
                                    item.feed?.name ??
                                        _feeds.firstWhere((f) => f.id == item.feedId, orElse: () => Feed(id: 0, name: '-')).name,
                                  ),
                                ),
                                Padding(
                                  padding: const EdgeInsets.all(8.0),
                                  child: Text(
                                    '${item.quantity} kg',
                                    textAlign: TextAlign.center,
                                  ),
                                ),
                              ],
                            );
                          }),
                        ],
                      ),
                  ],
                ],
              ),
            ),
    );
  }
}