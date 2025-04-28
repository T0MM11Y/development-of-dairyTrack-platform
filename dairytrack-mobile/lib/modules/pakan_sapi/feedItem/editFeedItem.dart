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
import 'package:flutter/services.dart';
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
  final _formKey = GlobalKey<FormState>();

  bool _isLoading = true;
  bool _isEditing = false;
  String? _errorMessage;

  DailyFeedSchedule? _dailyFeed;
  List<FeedItem> _feedItems = [];
  List<Feed> _feeds = [];
  List<FeedStock> _feedStocks = [];
  Map<int, Cow> _cowsMap = {};

  List<Map<String, dynamic>> _formList = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      print("Loading data for dailyFeedId: ${widget.dailyFeedId}");

      final results = await Future.wait([
        getDailyFeedById(widget.dailyFeedId),
        FeedItemService.getFeedItemsByDailyFeedId(widget.dailyFeedId),
        getAllFeeds(),
        getAllFeedStocks(),
        getCows(),
      ]).timeout(const Duration(seconds: 10), onTimeout: () {
        throw Exception(
            'Timeout while loading data. Check your internet connection.');
      });

      final dailyFeed = results[0] as DailyFeedSchedule;
      final feedItemsResponse = results[1] as Map<String, dynamic>;
      final feedsList = results[2] as List<Feed>;
      final feedStocksList = results[3] as List<FeedStock>;
      final cowsList = results[4] as List<Cow>;

      print("Feed items response: $feedItemsResponse");

      final feedItems = feedItemsResponse['success'] == true
          ? (feedItemsResponse['data'] as List<dynamic>? ?? []).map((item) {
              print("Parsing feed item: $item");
              return FeedItem.fromJson(item);
            }).toList()
          : <FeedItem>[];

      if (feedItems.isEmpty) {
        print(
            "No feed items from getFeedItemsByDailyFeedId, trying getAllFeedItems...");
        final allFeedItemsResponse = await FeedItemService.getAllFeedItems();
        print("All feed items response: $allFeedItemsResponse");
        if (allFeedItemsResponse['success'] == true) {
          final allFeedItems =
              (allFeedItemsResponse['data'] as List<dynamic>? ?? [])
                  .map((item) => FeedItem.fromJson(item))
                  .toList();
          feedItems.addAll(
            allFeedItems
                .where((item) => item.dailyFeedId == widget.dailyFeedId),
          );
        }
      }

      final cowsMap = <int, Cow>{};
      for (var cow in cowsList) {
        if (cow.id != null) {
          if (cowsMap.containsKey(cow.id)) {
            print('Warning: Overwriting duplicate cow ID: ${cow.id}');
          }
          cowsMap[cow.id!] = cow;
        } else {
          print('Warning: Skipping cow with null ID: ${cow.name}');
        }
      }

      setState(() {
        _dailyFeed = dailyFeed;
        _feedItems = feedItems;
        _feeds = feedsList;
        _feedStocks = feedStocksList;
        _cowsMap = cowsMap;
        _formList = feedItems
            .map((item) => <String, dynamic>{
                  'id': item.id,
                  'feed_id': item.feedId,
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                })
            .toList();
        _isLoading = false;
        print("Loaded ${_feedItems.length} feed items");
        if (_feedItems.isEmpty) {
          _errorMessage = 'Tidak ada item pakan untuk sesi ini.';
        }
      });
    } catch (e) {
      String errorMsg;
      if (e.toString().contains('timeout')) {
        errorMsg =
            'Timeout while loading data. Check your internet connection.';
      } else if (e.toString().contains('404')) {
        errorMsg = 'Data not found. Please try again.';
      } else {
        errorMsg = 'Failed to load data: $e';
      }
      print("Error loading data: $e");
      setState(() {
        _errorMessage = errorMsg;
        _isLoading = false;
      });
    }
  }

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
      if (!_isEditing) {
        _formList = _feedItems
            .map((item) => <String, dynamic>{
                  'id': item.id,
                  'feed_id': item.feedId,
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                })
            .toList();
      }
    });
  }

  void _handleFormChange(int index, String key, dynamic value) {
    setState(() {
      if (key == 'quantity') {
        final trimmedValue = value?.toString().trim() ?? '0';
        // Print untuk debugging
        print("Raw quantity input: '$value', trimmed: '$trimmedValue'");

        // Pastikan nilai tidak kosong dan valid
        final parsedValue = double.tryParse(trimmedValue);
        _formList[index][key] = trimmedValue.isEmpty ? '0' : trimmedValue;

        // Log nilai setelah diubah
        print("Stored quantity value: ${_formList[index][key]}");
      } else {
        _formList[index][key] = value;
      }
    });
  }

  void _addFeedItemRow() {
    if (_formList.length >= 3) {
      _showErrorDialog('Perhatian', 'Maksimal 3 jenis pakan untuk satu sesi');
      return;
    }

    setState(() {
      _formList.add(<String, dynamic>{
        'id': null,
        'feed_id': null,
        'quantity': '0',
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
          content:
              const Text('Apakah Anda yakin ingin menghapus item pakan ini?'),
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
        final response =
            await FeedItemService.deleteFeedItem(item['id'] as int);
        if (response['success'] == true) {
          setState(() {
            _feedItems.removeWhere((feedItem) => feedItem.id == item['id']);
            _formList.removeAt(index);
          });
          _showSuccessDialog('Berhasil', 'Item pakan berhasil dihapus');
        } else {
          throw Exception(response['message'] ?? 'Gagal menghapus item pakan');
        }
      } catch (e) {
        _showErrorDialog('Gagal', 'Gagal menghapus item pakan: $e');
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
        .where((entry) =>
            entry.key != currentIndex && entry.value['feed_id'] != null)
        .map((entry) => entry.value['feed_id'] as int)
        .toSet();

    return _feeds.where((feed) => !selectedFeedIds.contains(feed.id)).toList();
  }

  double _getFeedStock(int? feedId) {
    if (feedId == null) return 0.0;
    final matchingStocks =
        _feedStocks.where((stock) => stock.feedId == feedId).toList();
    if (matchingStocks.isEmpty) return 0.0;
    matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
    return matchingStocks.first.stock ?? 0.0;
  }

  String formatNumber(double number) {
    if (number == number.toInt()) {
      return number.toInt().toString();
    }
    return number.toString();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;

    final newItems = _formList.where((item) => item['id'] == null).toList();
    final updatedItems = _formList.where((item) => item['id'] != null).toList();
    final removedItems = _feedItems
        .where((feedItem) =>
            !_formList.any((formItem) => formItem['id'] == feedItem.id))
        .toList();

    final List<String> changes = [];

    if (newItems.isNotEmpty) {
      changes.add('Ditambahkan:');
      for (var item in newItems) {
        final feedId = item['feed_id'] as int;
        final quantity = item['quantity'] as String;
        final feedName = _feeds
            .firstWhere(
              (feed) => feed.id == feedId,
              orElse: () => Feed(id: feedId, name: 'Pakan #$feedId', typeId: 0),
            )
            .name;
        changes.add('- $feedName: ${formatNumber(double.parse(quantity))} kg');
      }
    }

    if (updatedItems.isNotEmpty) {
      changes.add('Diperbarui:');
      for (var item in updatedItems) {
        final feedId = item['feed_id'] as int;
        final newQuantity = double.parse(item['quantity'] as String);
        final feedItem = _feedItems.firstWhere((fi) => fi.id == item['id']);
        if (newQuantity != feedItem.quantity) {
          final feedName = _feeds
              .firstWhere(
                (feed) => feed.id == feedId,
                orElse: () =>
                    Feed(id: feedId, name: 'Pakan #$feedId', typeId: 0),
              )
              .name;
          changes.add(
              '- $feedName: ${formatNumber(feedItem.quantity)} kg → ${formatNumber(newQuantity)} kg');
        }
      }
    }

    if (removedItems.isNotEmpty) {
      changes.add('Dihapus:');
      for (var item in removedItems) {
        final feedName = _feeds
            .firstWhere(
              (feed) => feed.id == item.feedId,
              orElse: () => Feed(
                  id: item.feedId, name: 'Pakan #${item.feedId}', typeId: 0),
            )
            .name;
        changes.add('- $feedName: ${formatNumber(item.quantity)} kg');
      }
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Perubahan'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Berikut adalah perubahan yang akan disimpan:'),
              const SizedBox(height: 10),
              if (changes.isEmpty)
                const Text('Tidak ada perubahan.')
              else
                ...changes.map((change) => Text(change)),
            ],
          ),
        ),
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
      _errorMessage = null;
    });

    try {
      print("Form list before saving: $_formList");

      for (var item in _formList) {
        print("Processing item: $item");
        final feedId = item['feed_id'] as int?;
        final quantityStr = item['quantity']?.toString().trim();
        if (feedId == null || quantityStr == null || quantityStr.isEmpty) {
          throw Exception(
              'Data pakan tidak lengkap. Pastikan semua field terisi. Item: $item');
        }
        final quantity = double.tryParse(quantityStr);
        if (quantity == null) {
          throw Exception(
              'Jumlah pakan tidak valid: "$quantityStr". Pastikan hanya berisi angka.');
        }
        final stock = _getFeedStock(feedId);
        if (quantity > stock) {
          final feedName = _feeds
              .firstWhere(
                (feed) => feed.id == feedId,
                orElse: () =>
                    Feed(id: feedId, name: 'Pakan #$feedId', typeId: 0),
              )
              .name;
          throw Exception(
              'Stok $feedName tidak cukup. Tersedia hanya ${formatNumber(stock)} kg.');
        }
      }

      if (newItems.isNotEmpty) {
        final feedItemsPayload = newItems
            .map((item) => {
                  'feed_id': item['feed_id'] as int,
                  'quantity': double.parse(item['quantity'] as String),
                })
            .toList();

        final response = await FeedItemService.addFeedItems(
          dailyFeedId: widget.dailyFeedId,
          feedItems: feedItemsPayload,
        );

        if (!response['success']) {
          throw Exception(response['message'] ?? 'Gagal menambah item pakan');
        }

        print("addFeedItems response: $response");

        List<dynamic> rawFeedItems = [];
        if (response['data'] != null) {
          if (response['data']['DailyFeedItems'] != null) {
            rawFeedItems = response['data']['DailyFeedItems'] as List<dynamic>;
          } else if (response['data']['feedItems'] != null) {
            rawFeedItems = response['data']['feedItems'] as List<dynamic>;
          } else if (response['data']['feed_items'] != null) {
            rawFeedItems = response['data']['feed_items'] as List<dynamic>;
          } else {
            print(
                "No feed items found in response. Available keys in data: ${response['data'].keys}");
          }
        } else {
          print("No 'data' key in response: $response");
        }

        final addedFeedItems = rawFeedItems.map((item) {
          print("Parsing feed item: $item");
          return FeedItem.fromJson(item);
        }).toList();

        print("Added feed items: $addedFeedItems");
        _feedItems.addAll(addedFeedItems);
      }

      if (updatedItems.isNotEmpty) {
        final updatedFeedItems = updatedItems
            .map((item) => {
                  'id': item['id'] as int,
                  'quantity': double.parse(item['quantity'] as String),
                })
            .toList();
        final response =
            await FeedItemService.bulkUpdateFeedItems(items: updatedFeedItems);
        if (!response['success']) {
          throw Exception(
              response['message'] ?? 'Gagal memperbarui item pakan');
        }

        for (var updatedItem in updatedItems) {
          final index =
              _feedItems.indexWhere((item) => item.id == updatedItem['id']);
          if (index != -1) {
            _feedItems[index] = FeedItem(
              id: _feedItems[index].id,
              dailyFeedId: _feedItems[index].dailyFeedId,
              feedId: _feedItems[index].feedId,
              quantity: double.parse(updatedItem['quantity'] as String),
              feed: _feedItems[index].feed,
              createdAt: _feedItems[index].createdAt,
              updatedAt: _feedItems[index].updatedAt,
            );
          }
        }
      }

      if (removedItems.isNotEmpty) {
        for (var item in removedItems) {
          final response = await FeedItemService.deleteFeedItem(item.id);
          if (!response['success']) {
            throw Exception(
                response['message'] ?? 'Gagal menghapus item pakan');
          }
        }
        _feedItems.removeWhere((item) => removedItems.contains(item));
      }

      setState(() {
        _isEditing = false;
        _formList = _feedItems
            .map((item) => <String, dynamic>{
                  'id': item.id,
                  'feed_id': item.feedId,
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                })
            .toList();
        _isLoading = false;
        _errorMessage = null;
      });

      _showSuccessDialog('Berhasil', 'Data pakan harian berhasil diperbarui');
      widget.onUpdateSuccess?.call();
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _errorMessage = e.toString().contains('Stok tidak cukup')
            ? e.toString()
            : 'Gagal menyimpan data: $e';
        _isLoading = false;
      });

      if (mounted) {
        _showErrorDialog('Gagal', _errorMessage!);
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Item Pakan Harian'),
        backgroundColor: const Color(0xFF17A2B8),
        actions: [
          if (!_isEditing && _feedItems.isNotEmpty)
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
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_errorMessage != null)
                      Container(
                        padding: const EdgeInsets.all(8.0),
                        margin: const EdgeInsets.only(bottom: 16.0),
                        decoration: BoxDecoration(
                          color: Colors.red.shade100,
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: Text(
                          _errorMessage!,
                          style: TextStyle(color: Colors.red.shade800),
                        ),
                      ),
                    const Text(
                      'Detail Sesi',
                      style: TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 18.0),
                    ),
                    const SizedBox(height: 8.0),
                    Card(
                      elevation: 2,
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Tanggal',
                                      style: TextStyle(color: Colors.grey)),
                                  Text(_dailyFeed != null
                                      ? _dateFormat.format(
                                          DateTime.parse(_dailyFeed!.date))
                                      : '-'),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Sesi',
                                      style: TextStyle(color: Colors.grey)),
                                  Text(_dailyFeed != null
                                      ? (_dailyFeed!.session.isNotEmpty
                                          ? _dailyFeed!.session[0]
                                                  .toUpperCase() +
                                              _dailyFeed!.session.substring(1)
                                          : '-')
                                      : '-'),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text('Sapi',
                                      style: TextStyle(color: Colors.grey)),
                                  Text(_dailyFeed != null
                                      ? (_cowsMap[_dailyFeed!.cowId]?.name ??
                                          'Sapi #${_dailyFeed!.cowId}')
                                      : '-'),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24.0),
                    if (_isEditing) ...[
                      if (_formList.isEmpty)
                        const Card(
                          elevation: 2,
                          child: Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Center(
                              child: Text(
                                'Tidak ada item pakan. Tambahkan pakan baru.',
                                style: TextStyle(color: Colors.grey),
                              ),
                            ),
                          ),
                        )
                      else
                        ..._formList.asMap().entries.map((entry) {
                          final index = entry.key;
                          final item = entry.value;

                          return Card(
                            elevation: 2,
                            margin: const EdgeInsets.only(bottom: 16.0),
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        'Jenis Pakan #${index + 1}',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16.0),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete,
                                            color: Colors.red),
                                        onPressed: () =>
                                            _removeFeedItemRow(index),
                                        tooltip: 'Hapus Item',
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8.0),
                                  Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Expanded(
                                        flex: 3,
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            DropdownButtonFormField<int>(
                                              decoration: InputDecoration(
                                                labelText: 'Jenis Pakan',
                                                border: OutlineInputBorder(
                                                  borderRadius:
                                                      BorderRadius.circular(
                                                          8.0),
                                                ),
                                              ),
                                              value: item['feed_id'] as int?,
                                              hint: const Text('Pilih pakan'),
                                              isExpanded: true,
                                              items: _getAvailableFeedsForRow(
                                                      index)
                                                  .map((feed) =>
                                                      DropdownMenuItem(
                                                        value: feed.id,
                                                        child: Text(feed.name),
                                                      ))
                                                  .toList(),
                                              onChanged: item['id'] != null
                                                  ? null
                                                  : (value) =>
                                                      _handleFormChange(index,
                                                          'feed_id', value),
                                              validator: (value) =>
                                                  value == null
                                                      ? 'Pilih jenis pakan'
                                                      : null,
                                              disabledHint: const Text(
                                                  'Tidak dapat diubah'),
                                            ),
                                            if (item['feed_id'] != null) ...[
                                              const SizedBox(height: 8.0),
                                              Text(
                                                'Stok: ${formatNumber(_getFeedStock(item['feed_id'] as int?))} kg',
                                                style: const TextStyle(
                                                    fontWeight: FontWeight.bold,
                                                    color: Colors.blue),
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
                                                borderRadius:
                                                    BorderRadius.circular(8.0),
                                              ),
                                              errorMaxLines: 2,
                                            ),
                                            keyboardType:
                                                TextInputType.numberWithOptions(
                                                    decimal: true),
                                            initialValue:
                                                item['quantity']?.toString() ??
                                                    '0',
                                            inputFormatters: [
                                              FilteringTextInputFormatter.allow(
                                                  RegExp(r'[0-9.]')),
                                            ],
                                            onChanged: (value) {
                                              // Langsung konversi dan simpan sebagai string dari double
                                              final parsedValue =
                                                  double.tryParse(value) ?? 0.0;
                                              _handleFormChange(
                                                  index,
                                                  'quantity',
                                                  parsedValue.toString());
                                            },
                                            // Validator tetap sama
                                          )),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        }),
                      if (_formList.length < 3)
                        Align(
                          alignment: Alignment.centerRight,
                          child: TextButton.icon(
                            onPressed: _addFeedItemRow,
                            icon:
                                const Icon(Icons.add, color: Color(0xFF17A2B8)),
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
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8.0),
                            ),
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
                              : const Text('Simpan',
                                  style: TextStyle(fontSize: 16)),
                        ),
                      ),
                    ] else ...[
                      const Text(
                        'Daftar Pakan',
                        style: TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 18.0),
                      ),
                      const SizedBox(height: 8.0),
                      if (_feedItems.isEmpty)
                        Card(
                          elevation: 2,
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Center(
                              child: Text(
                                'Tidak ada data pakan untuk sesi ini.',
                                style: TextStyle(color: Colors.grey.shade600),
                              ),
                            ),
                          ),
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
                              decoration:
                                  BoxDecoration(color: Colors.grey.shade200),
                              children: const [
                                Padding(
                                  padding: EdgeInsets.all(8.0),
                                  child: Text(
                                    'No',
                                    textAlign: TextAlign.center,
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                ),
                                Padding(
                                  padding: EdgeInsets.all(8.0),
                                  child: Text(
                                    'Jenis Pakan',
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                ),
                                Padding(
                                  padding: EdgeInsets.all(8.0),
                                  child: Text(
                                    'Jumlah (kg)',
                                    textAlign: TextAlign.center,
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
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
                                    child: Text(item.feed?.name ??
                                        'Pakan #${item.feedId}'),
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.all(8.0),
                                    child: Text(
                                      '${formatNumber(item.quantity)} kg',
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
            ),
    );
  }
}
