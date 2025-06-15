import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controller/APIURL4/dailyFeedItemController.dart';
import '../../../controller/APIURL4/feedStockController.dart';
import '../model/dailyFeed.dart';
import '../model/dailyFeedItem.dart';
import '../model/feedStock.dart';
import '../../../controller/APIURL1/cowManagementController.dart';
import 'package:intl/intl.dart';

class EditFeedItemPage extends StatefulWidget {
  final DailyFeed feed;
  final List<Cow> cows;
  final int userId;

  const EditFeedItemPage({
    super.key,
    required this.feed,
    required this.cows,
    required this.userId,
  });

  @override
  _EditFeedItemPageState createState() => _EditFeedItemPageState();
}

class _EditFeedItemPageState extends State<EditFeedItemPage> {
  final DailyFeedItemManagementController _feedItemController =
      DailyFeedItemManagementController();
  final FeedStockManagementController _stockController =
      FeedStockManagementController();
  List<DailyFeedItem> _feedItems = [];
  List<FeedStockModel> _feeds = [];
  List<Map<String, dynamic>> _formList = [];
  String _errorMessage = '';
  String? _stockMessage;
  bool _isLoading = false;
  bool _isEditing = false;
  String? _userRole;
  bool _showFeedDropdown = false;

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _fetchData();
  }

  Future<void> _loadUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userRole = prefs.getString('userRole')?.toLowerCase();
    });
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      print(
          'Fetching feed items for dailyFeedId: ${widget.feed.id}, userId: ${widget.userId}');
      final itemResponse =
          await _feedItemController.getAllFeedItems(userId: widget.userId);
      final stockResponse = await _stockController.getAllFeedStocks();
      if (!mounted) return;

      print('Item Response: $itemResponse');
      print('Stock Response: $stockResponse');

      if (itemResponse['success'] && stockResponse['success']) {
        final feedItems = (itemResponse['data'] as List<dynamic>)
            .map((json) => DailyFeedItem.fromJson(json as Map<String, dynamic>))
            .where((item) => item.dailyFeedId == widget.feed.id)
            .toList();

        final feedStocks = (stockResponse['data'] as List<dynamic>)
            .map((json) {
              try {
                print('Parsing feed stock JSON: $json');
                final feedId = json['feed_id'] is num
                    ? (json['feed_id'] as num).toInt()
                    : int.tryParse(json['feed_id']?.toString() ?? '0') ?? 0;
                final feedName = json['name'] ?? 'Unknown Feed';
                final unit = json['unit'] ?? 'kg';
                final stockData = json is Map<String, dynamic> ? json : {};
                return FeedStockModel(
                  id: stockData['id'] is num
                      ? (stockData['id'] as num).toInt()
                      : int.tryParse(stockData['id']?.toString() ?? '0') ?? 0,
                  feedId: feedId,
                  feedName: feedName,
                  stock: stockData['stock'] is num
                      ? (stockData['stock'] as num).toDouble()
                      : double.tryParse(stockData['stock']?.toString() ?? '0') ??
                          0.0,
                  unit: unit,
                  updatedAt: stockData['updated_at']?.toString() ?? '',
                );
              } catch (e, stackTrace) {
                print(
                    'Error parsing feed stock: $e, StackTrace: $stackTrace, JSON: $json');
                return null;
              }
            })
            .where((stock) => stock != null && stock.stock > 0)
            .cast<FeedStockModel>()
            .toList();

        print('Parsed feed items: $feedItems');
        print('Parsed feed stocks: $feedStocks');

        setState(() {
          _feedItems = feedItems;
          _feeds = feedStocks;
          _formList = feedItems
              .map((item) => <String, dynamic>{
                    'id': item.id,
                    'feed_id': item.feedId.toString(),
                    'quantity': item.quantity.toString(),
                    'daily_feed_id': item.dailyFeedId,
                  })
              .toList();
          _stockMessage = null;
          _errorMessage = '';
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = itemResponse['message'] ??
              stockResponse['message'] ??
              'Gagal memuat data';
          _stockMessage = stockResponse['message'];
          _isLoading = false;
        });
      }
    } catch (e, stackTrace) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal memuat data: $e';
          _stockMessage = 'Terjadi kesalahan saat mengambil stok: $e';
          _isLoading = false;
        });
      }
      print('Error in _fetchData: $e, StackTrace: $stackTrace');
    }
  }

  String _formatStock(double stock) {
    if (stock == stock.toInt()) {
      return stock.toInt().toString();
    } else {
      return stock.toString().replaceAll(RegExp(r'\.?0+$'), '');
    }
  }

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
      _errorMessage = '';
      if (!_isEditing) {
        _formList = _feedItems
            .map((item) => <String, dynamic>{
                  'id': item.id,
                  'feed_id': item.feedId.toString(),
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                })
            .toList();
      }
    });
  }

  void _addFeedItem(Map<String, dynamic> item) {
    setState(() {
      _formList.add(<String, dynamic>{
        'feed_id': item['feed_id'] ?? '',
        'quantity': item['quantity'] ?? '',
        'daily_feed_id': widget.feed.id,
      });
      _errorMessage = '';
      _showFeedDropdown = false;
    });
  }

  void _removeFeedItem(int index) async {
    final item = _formList[index];
    if (item['id'] != null) {
      final feed = _feeds.firstWhere(
        (f) => f.feedId.toString() == item['feed_id'],
        orElse: () => FeedStockModel(
          id: 0,
          feedId: 0,
          feedName: 'Pakan',
          stock: 0,
          unit: 'kg',
          updatedAt: '',
        ),
      );
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Konfirmasi Hapus'),
          content: Text('Hapus pakan "${feed.feedName}"?'),
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

      setState(() => _isLoading = true);
      try {
        final response = await _feedItemController.deleteFeedItem(
            item['id'] as int, widget.userId);
        if (!mounted) return;

        if (response['success']) {
          setState(() {
            _formList.removeAt(index);
            _feedItems.removeWhere((feedItem) => feedItem.id == item['id']);
            _isLoading = false;
          });
        } else {
          setState(() {
            _errorMessage =
                response['message'] ?? 'Gagal menghapus item pakan.';
            _isLoading = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _errorMessage = 'Gagal menghapus: $e';
            _isLoading = false;
          });
        }
      }
    } else {
      setState(() {
        _formList.removeAt(index);
      });
    }
  }

  Future<void> _save() async {
    if (_formList.isEmpty) {
      setState(() {
        _errorMessage = 'Harus ada minimal satu jenis pakan.';
      });
      return;
    }

    final errors = <int, String>{};
    for (var i = 0; i < _formList.length; i++) {
      final item = _formList[i];
      if (item['feed_id'].isEmpty) {
        errors[i] = 'Pilih jenis pakan.';
      }
      final quantity = double.tryParse(item['quantity']);
      if (quantity == null || quantity <= 0) {
        errors[i] = 'Masukkan jumlah yang valid.';
      } else {
        final feed = _feeds.firstWhere(
          (f) => f.feedId.toString() == item['feed_id'],
          orElse: () => FeedStockModel(
            id: 0,
            feedId: 0,
            feedName: '',
            stock: 0,
            unit: 'kg',
            updatedAt: '',
          ),
        );
        if (feed.feedId == 0) {
          errors[i] = 'Pakan tidak ditemukan.';
        } else if (quantity > feed.stock) {
          errors[i] = 'Jumlah melebihi stok: ${_formatStock(feed.stock)} ${feed.unit}.';
        }
      }
    }

    if (errors.isNotEmpty) {
      setState(() {
        _errorMessage = 'Periksa input pakan: ${errors.values.join(", ")}';
      });
      return;
    }

    setState(() => _isLoading = true);
    try {
      final newItems = _formList.where((item) => item['id'] == null).toList();
      final updatedItems =
          _formList.where((item) => item['id'] != null).toList();

      if (newItems.isNotEmpty) {
        final feedItems = newItems
            .map((item) => {
                  'feed_id': int.parse(item['feed_id']),
                  'quantity': double.parse(item['quantity']),
                })
            .toList();
        final addResponse = await _feedItemController.addFeedItem(
          dailyFeedId: widget.feed.id,
          feedItems: feedItems,
          userId: widget.userId,
        );
        if (!addResponse['success']) {
          throw Exception(addResponse['message']);
        }
      }

      for (final item in updatedItems) {
        final updateResponse = await _feedItemController.updateFeedItem(
          id: item['id'] as int,
          quantity: double.parse(item['quantity']),
          userId: widget.userId,
        );
        if (!updateResponse['success']) {
          throw Exception(updateResponse['message']);
        }
      }

      if (mounted) {
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal menyimpan: $e';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_userRole != 'farmer' || widget.cows.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Edit Item Pakan',
              style: TextStyle(color: Colors.white)),
          backgroundColor: Colors.teal[700],
        ),
        body: const Center(
          child: Text(
            'Hanya pengguna dengan role "farmer" yang dapat mengedit item pakan, dan setidaknya ada satu sapi.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      );
    }

    final availableFeeds = _feeds
        .where((stock) =>
            !_formList.any((item) => item['feed_id'] == stock.feedId.toString()))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Item Pakan',
            style: TextStyle(color: Colors.white)),
        backgroundColor: Colors.teal[700],
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_errorMessage.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 16.0),
                      child: Text(_errorMessage,
                          style: const TextStyle(color: Colors.red)),
                    ),
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tanggal: ${widget.feed.date}',
                            style: const TextStyle(fontSize: 16),
                          ),
                          Text(
                            'Sesi: ${widget.feed.session}',
                            style: const TextStyle(fontSize: 16),
                          ),
                          Text(
                            'Sapi: ${widget.cows.firstWhere(
                                  (cow) => cow.id == widget.feed.cowId,
                                  orElse: () => Cow(
                                    id: widget.feed.cowId,
                                    name: 'Sapi #${widget.feed.cowId}',
                                    birth: DateFormat(
                                      "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
                                    ).format(DateTime.now()
                                        .subtract(const Duration(days: 365))),
                                    breed: 'Unknown',
                                    lactationPhase: 'None',
                                    weight: 0.0,
                                    gender: 'Unknown',
                                  ),
                                ).name}',
                            style: const TextStyle(fontSize: 16),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (_isEditing) ...[
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  flex: 2,
                                  child: GestureDetector(
                                    onTap: () {
                                      setState(() {
                                        _showFeedDropdown = !_showFeedDropdown;
                                      });
                                    },
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          vertical: 12, horizontal: 16),
                                      decoration: BoxDecoration(
                                        border:
                                            Border.all(color: Colors.grey[300]!),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.spaceBetween,
                                        children: [
                                          Expanded(
                                            child: Text(
                                              _formList.isNotEmpty &&
                                                      _formList.last['feed_id']
                                                          .isNotEmpty
                                                  ? '${_feeds.firstWhere((stock) => stock.feedId.toString() == _formList.last['feed_id']).feedName} (Stok: ${_formatStock(_feeds.firstWhere((stock) => stock.feedId.toString() == _formList.last['feed_id']).stock)} ${_feeds.firstWhere((stock) => stock.feedId.toString() == _formList.last['feed_id']).unit})'
                                                  : 'Pilih Pakan',
                                              style: TextStyle(
                                                fontSize: 16,
                                                color: _formList.isNotEmpty &&
                                                        _formList
                                                            .last['feed_id']
                                                            .isNotEmpty
                                                    ? Colors.black
                                                    : Colors.grey[600],
                                              ),
                                            ),
                                          ),
                                          Icon(
                                            _showFeedDropdown
                                                ? Icons.keyboard_arrow_up
                                                : Icons.keyboard_arrow_down,
                                            color: Colors.teal,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: TextFormField(
                                    initialValue: _formList.isNotEmpty
                                        ? _formList.last['quantity']
                                        : '',
                                    decoration: InputDecoration(
                                      labelText: 'Jumlah',
                                      border: const OutlineInputBorder(
                                          borderRadius: BorderRadius.all(
                                              Radius.circular(8))),
                                      labelStyle:
                                          const TextStyle(fontSize: 16),
                                      suffixText: _formList.isNotEmpty &&
                                              _formList.last['feed_id']
                                                  .isNotEmpty
                                          ? _feeds
                                              .firstWhere(
                                                (f) => f.feedId.toString() ==
                                                    _formList.last['feed_id'],
                                                orElse: () => FeedStockModel(
                                                  id: 0,
                                                  feedId: 0,
                                                  feedName: '',
                                                  stock: 0,
                                                  unit: 'kg',
                                                  updatedAt: '',
                                                ),
                                              )
                                              .unit
                                          : 'kg',
                                      suffixStyle:
                                          const TextStyle(fontSize: 16),
                                    ),
                                    keyboardType:
                                        const TextInputType.numberWithOptions(
                                            decimal: true),
                                    onChanged: (value) {
                                      setState(() {
                                        if (_formList.isNotEmpty) {
                                          _formList.last['quantity'] = value;
                                        }
                                      });
                                    },
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.teal,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: IconButton(
                                    icon: const Icon(Icons.add,
                                        color: Colors.white),
                                    onPressed: () {
                                      if (_formList.isNotEmpty &&
                                          _formList.last['feed_id'].isNotEmpty &&
                                          _formList.last['quantity']
                                              .isNotEmpty) {
                                        _addFeedItem(_formList.last);
                                      } else {
                                        setState(() {
                                          _errorMessage =
                                              'Pilih pakan dan masukkan jumlah.';
                                        });
                                      }
                                    },
                                  ),
                                ),
                              ],
                            ),
                            if (_showFeedDropdown)
                              Card(
                                elevation: 8,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                child: Container(
                                  constraints:
                                      const BoxConstraints(maxHeight: 240),
                                  margin: const EdgeInsets.only(top: 8),
                                  child: ListView(
                                    shrinkWrap: true,
                                    children: availableFeeds.map((stock) {
                                      return ListTile(
                                        title: Text(
                                          stock.feedName,
                                          style: const TextStyle(
                                              fontSize: 14,
                                              fontWeight: FontWeight.w500),
                                        ),
                                        subtitle: Text(
                                          'Stok: ${_formatStock(stock.stock)} ${stock.unit}',
                                          style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.grey[600]),
                                        ),
                                        onTap: () {
                                          setState(() {
                                            if (_formList.isEmpty) {
                                              _formList.add(<String, dynamic>{
                                                'feed_id': stock.feedId.toString(),
                                                'quantity': '',
                                                'daily_feed_id': widget.feed.id,
                                              });
                                            } else {
                                              _formList.last['feed_id'] =
                                                  stock.feedId.toString();
                                            }
                                            _showFeedDropdown = false;
                                            _errorMessage = '';
                                          });
                                        },
                                      );
                                    }).toList(),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (_formList.isNotEmpty) ...[
                      Card(
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        child: Column(
                          children: [
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16.0),
                              decoration: BoxDecoration(
                                color: Colors.teal[50],
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(12),
                                  topRight: Radius.circular(12),
                                ),
                              ),
                              child: const Text(
                                'Pakan yang Dipilih',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: Colors.teal,
                                ),
                              ),
                            ),
                            Container(
                              constraints: const BoxConstraints(maxHeight: 200),
                              child: ListView.builder(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 16.0, vertical: 8.0),
                                itemCount: _formList.length,
                                itemBuilder: (context, index) {
                                  final item = _formList[index];
                                  final feed = _feeds.firstWhere(
                                    (f) => f.feedId.toString() == item['feed_id'],
                                    orElse: () => FeedStockModel(
                                      id: 0,
                                      feedId: 0,
                                      feedName: 'Unknown Feed',
                                      stock: 0,
                                      unit: 'kg',
                                      updatedAt: '',
                                    ),
                                  );
                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 8.0),
                                    padding: const EdgeInsets.all(12.0),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[50],
                                      borderRadius: BorderRadius.circular(8),
                                      border:
                                          Border.all(color: Colors.grey[200]!),
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                feed.feedName,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                '${_formatStock(double.tryParse(item['quantity']) ?? 0)} ${feed.unit}',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline,
                                              color: Colors.red, size: 20),
                                          onPressed: () => _removeFeedItem(index),
                                          constraints: const BoxConstraints(
                                            minWidth: 32,
                                            minHeight: 32,
                                          ),
                                          padding: EdgeInsets.zero,
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ] else ...[
                      Container(
                        width: double.infinity,
                        height: 200,
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[300]!),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.grass_outlined,
                              size: 48,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              'Belum ada pakan yang dipilih',
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.grey[600],
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Pilih pakan dan klik tombol + untuk menambah',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[500],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),
                    ],
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _toggleEditMode,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.grey,
                              minimumSize: const Size(double.infinity, 48),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Batal',
                                style: TextStyle(color: Colors.white)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _save,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.teal,
                              minimumSize: const Size(double.infinity, 48),
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                            ),
                            child: const Text('Simpan',
                                style: TextStyle(color: Colors.white)),
                          ),
                        ),
                      ],
                    ),
                  ] else ...[
                    Card(
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      child: Column(
                        children: [
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.all(16.0),
                            decoration: BoxDecoration(
                              color: Colors.teal[50],
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(12),
                                topRight: Radius.circular(12),
                              ),
                            ),
                            child: const Text(
                              'Pakan yang Dipilih',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Colors.teal,
                              ),
                            ),
                          ),
                          Container(
                            constraints: const BoxConstraints(maxHeight: 200),
                            child: _feedItems.isEmpty
                                ? const Center(
                                    child: Text(
                                      'Tidak ada item pakan.',
                                      style: TextStyle(color: Colors.grey),
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16.0, vertical: 8.0),
                                    itemCount: _feedItems.length,
                                    itemBuilder: (context, index) {
                                      final item = _feedItems[index];
                                      final feed = _feeds.firstWhere(
                                        (f) => f.feedId == item.feedId,
                                        orElse: () => FeedStockModel(
                                          id: 0,
                                          feedId: 0,
                                          feedName: 'Unknown Feed',
                                          stock: 0,
                                          unit: 'kg',
                                          updatedAt: '',
                                        ),
                                      );
                                      return Container(
                                        margin:
                                            const EdgeInsets.only(bottom: 8.0),
                                        padding: const EdgeInsets.all(12.0),
                                        decoration: BoxDecoration(
                                          color: Colors.grey[50],
                                          borderRadius:
                                              BorderRadius.circular(8),
                                          border: Border.all(
                                              color: Colors.grey[200]!),
                                        ),
                                        child: Row(
                                          children: [
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment:
                                                    CrossAxisAlignment.start,
                                                children: [
                                                  Text(
                                                    item.feedName,
                                                    style: const TextStyle(
                                                      fontSize: 14,
                                                      fontWeight:
                                                          FontWeight.w500,
                                                    ),
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                  const SizedBox(height: 4),
                                                  Text(
                                                    '${_formatStock(item.quantity)} ${feed.unit}',
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      color: Colors.grey[600],
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      );
                                    },
                                  ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: _toggleEditMode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text(
                        'Edit',
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}