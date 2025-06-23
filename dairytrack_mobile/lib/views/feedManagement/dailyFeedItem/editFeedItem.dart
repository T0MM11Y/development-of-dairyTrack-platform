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
  Map<int, FeedStockModel> _feedCache = {};
  String _errorMessage = '';
  String? _stockMessage;
  bool _isLoading = false;
  bool _isEditing = false;
  String? _userRole;
  bool _showFeedDropdown = false;
  String? _selectedFeedId;
  final TextEditingController _quantityController = TextEditingController();
  final Map<int, TextEditingController> _quantityControllers = {};

  @override
  void initState() {
    super.initState();
    _loadUserRole();
    _fetchData();
  }

  @override
  void dispose() {
    _quantityController.dispose();
    _quantityControllers.values.forEach((controller) => controller.dispose());
    super.dispose();
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
      print('Fetching feed items for dailyFeedId: ${widget.feed.id}, userId: ${widget.userId}');
      final itemResponse = await _feedItemController.getAllFeedItems(
        dailyFeedId: widget.feed.id,
        userId: widget.userId,
      );
      final stockResponse = await _stockController.getAllFeedStocks();
      if (!mounted) return;

      print('Item Response: $itemResponse');
      print('Stock Response: $stockResponse');

      // Handle stock response
      if (stockResponse['success']) {
        final feedStocks = (stockResponse['data'] as List<dynamic>)
            .map((json) {
              try {
                if (json == null || json is! Map<String, dynamic>) {
                  print('Invalid stock JSON: $json');
                  return null;
                }
                final feedId = json['id'] is num
                    ? (json['id'] as num).toInt()
                    : int.tryParse(json['id']?.toString() ?? '0') ?? 0;
                final feedName = json['name']?.toString() ?? 'Unknown Feed';
                final stockData = json['stock'] as Map<String, dynamic>?;
                final stock = stockData != null
                    ? (stockData['stock'] is num
                        ? (stockData['stock'] as num).toDouble()
                        : double.tryParse(stockData['stock']?.toString() ?? '0') ?? 0.0)
                    : 0.0;
                final unit = stockData?['unit']?.toString() ?? 'kg';
                final stockId = stockData != null
                    ? (stockData['id'] is num
                        ? (stockData['id'] as num).toInt()
                        : int.tryParse(stockData['id']?.toString() ?? '0') ?? 0)
                    : 0;
                final updatedAt = stockData?['updated_at']?.toString() ?? '';

                if (feedId == 0 || feedName == 'Unknown Feed') {
                  print('Invalid feed stock: $json');
                  return null;
                }

                return FeedStockModel(
                  id: stockId,
                  feedId: feedId,
                  feedName: feedName,
                  stock: stock,
                  unit: unit,
                  updatedAt: updatedAt,
                );
              } catch (e, stackTrace) {
                print('Error parsing feed stock: $e, StackTrace: $stackTrace, JSON: $json');
                return null;
              }
            })
            .where((stock) => stock != null)
            .cast<FeedStockModel>()
            .toList();

        final feedCache = {for (var stock in feedStocks) stock.feedId: stock};

        setState(() {
          _feeds = feedStocks.where((stock) => stock.stock > 0).toList();
          _feedCache = feedCache;
          _stockMessage = _feeds.isEmpty
              ? 'Tidak ada stok pakan tersedia. Silakan tambah stok pakan.'
              : null;
        });
      } else {
        setState(() {
          _stockMessage = stockResponse['message'] ?? 'Gagal memuat stok pakan';
        });
      }

      // Handle feed item response
      if (itemResponse['success']) {
        final feedItems = (itemResponse['data'] as List<dynamic>)
            .map((json) {
              try {
                if (json == null || json is! Map<String, dynamic>) {
                  print('Invalid feed item JSON: $json');
                  return null;
                }
                final item = DailyFeedItem.fromJson(json);
                if (item.dailyFeedId != widget.feed.id) return null;
                final feedName = item.feedName.isNotEmpty
                    ? item.feedName
                    : _feedCache[item.feedId]?.feedName ?? 'Unknown Feed';
                return DailyFeedItem(
                  id: item.id,
                  dailyFeedId: item.dailyFeedId,
                  feedId: item.feedId,
                  feedName: feedName,
                  quantity: item.quantity,
                  userId: item.userId,
                  createdBy: item.createdBy,
                  updatedBy: item.updatedBy,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
                  nutrients: item.nutrients,
                );
              } catch (e, stackTrace) {
                print('Error parsing feed item: $e, StackTrace: $stackTrace, JSON: $json');
                return null;
              }
            })
            .where((item) => item != null)
            .cast<DailyFeedItem>()
            .toList();

        setState(() {
          _feedItems = feedItems;
          _formList = feedItems
              .map((item) {
                final controller = TextEditingController(text: item.quantity.toString());
                _quantityControllers[item.id] = controller;
                return <String, dynamic>{
                  'id': item.id,
                  'feed_id': item.feedId.toString(),
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                  'feed_name': item.feedName,
                };
              })
              .toList();
          _errorMessage = feedItems.isEmpty ? 'Belum ada item pakan untuk sesi ini. Tambah pakan baru di bawah.' : '';
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = itemResponse['message'] ?? 'Gagal memuat data pakan';
          _isLoading = false;
        });
      }
    } catch (e, stackTrace) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal memuat data: $e';
          _isLoading = false;
        });
      }
      print('Error in _fetchData: $e, StackTrace: $stackTrace');
    }
  }

  String _formatStock(double stock) {
    final value = stock.toStringAsFixed(1); // Ensure one decimal place for precision
    return value.endsWith('.0') ? value.split('.')[0] : value.replaceAll(RegExp(r'0+$'), ''); // Remove .0 and trailing zeros
  }

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
      _errorMessage = '';
      _selectedFeedId = null;
      _quantityController.clear();
      _showFeedDropdown = false;
      if (!_isEditing) {
        _formList = _feedItems
            .map((item) {
              final controller = _quantityControllers[item.id] ?? TextEditingController(text: item.quantity.toString());
              _quantityControllers[item.id] = controller;
              return <String, dynamic>{
                'id': item.id,
                'feed_id': item.feedId.toString(),
                'quantity': controller.text,
                'daily_feed_id': item.dailyFeedId,
                'feed_name': item.feedName,
              };
            })
            .toList();
      }
    });
  }

  void _addFeedItem() {
    if (_selectedFeedId == null || _quantityController.text.isEmpty) {
      setState(() {
        _errorMessage = 'Pilih pakan dan masukkan jumlah yang valid.';
      });
      return;
    }

    final quantity = double.tryParse(_quantityController.text);
    final feedId = int.tryParse(_selectedFeedId!);
    if (feedId == null || quantity == null || quantity <= 0) {
      setState(() {
        _errorMessage = 'ID pakan atau jumlah tidak valid.';
      });
      return;
    }

    final feedStock = _feedCache[feedId];
    if (feedStock == null) {
      setState(() {
        _errorMessage = 'Pakan tidak ditemukan di stok.';
      });
      return;
    }

    if (quantity > feedStock.stock) {
      setState(() {
        _errorMessage =
            'Jumlah melebihi stok tersedia: ${_formatStock(feedStock.stock)} ${feedStock.unit}.';
      });
      return;
    }

    setState(() {
      final newId = _formList.isEmpty ? 0 : _formList.map((item) => item['id'] ?? 0).reduce((a, b) => a > b ? a : b) + 1;
      _formList.add(<String, dynamic>{
        'id': null, // New item, id will be assigned by backend
        'feed_id': _selectedFeedId,
        'quantity': _quantityController.text,
        'daily_feed_id': widget.feed.id,
        'feed_name': feedStock.feedName,
      });
      _quantityControllers[newId] = TextEditingController(text: _quantityController.text);
      _selectedFeedId = null;
      _quantityController.clear();
      _errorMessage = '';
      _showFeedDropdown = false;
    });
  }

  void _removeFeedItem(int index) async {
    final item = _formList[index];
    final feedId = int.tryParse(item['feed_id']);
    if (feedId == null) {
      setState(() {
        _formList.removeAt(index);
        _quantityControllers.remove(item['id']);
        _errorMessage = 'ID pakan tidak valid.';
      });
      return;
    }

    final feedName = item['feed_name'] ?? _feedCache[feedId]?.feedName ?? 'Unknown Feed';

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Penghapusan'),
        content: Text('Apakah Anda yakin ingin menghapus pakan "$feedName"?'),
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

    if (item['id'] != null) {
      setState(() => _isLoading = true);
      try {
        final response = await _feedItemController.deleteFeedItem(
            item['id'] as int, widget.userId);
        if (!mounted) return;

        if (response['success']) {
          setState(() {
            _formList.removeAt(index);
            _feedItems.removeWhere((feedItem) => feedItem.id == item['id']);
            _quantityControllers.remove(item['id']);
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
        _quantityControllers.remove(item['id']);
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
        continue;
      }
      final feedId = int.tryParse(item['feed_id']);
      if (feedId == null) {
        errors[i] = 'ID pakan tidak valid.';
        continue;
      }
      final quantity = double.tryParse(item['quantity']);
      if (quantity == null || quantity <= 0) {
        errors[i] = 'Masukkan jumlah yang valid.';
        continue;
      }
      final feed = _feedCache[feedId];
      if (feed == null) {
        errors[i] = 'Pakan tidak ditemukan di stok.';
        continue;
      }
      if (quantity > feed.stock) {
        errors[i] =
            'Jumlah melebihi stok: ${_formatStock(feed.stock)} ${feed.unit}.';
      }
    }

    if (errors.isNotEmpty) {
      setState(() {
        _errorMessage = 'Periksa input pakan: ${errors.values.join(", ")}';
      });
      return;
    }

    // Compare _formList with _feedItems to determine changes
    final addedItems = _formList.where((item) => item['id'] == null).toList();
    final updatedItems = _formList
        .where((item) =>
            item['id'] != null &&
            _feedItems.any((feedItem) =>
                feedItem.id == item['id'] &&
                feedItem.quantity != double.tryParse(item['quantity'])))
        .toList();
    final deletedItems = _feedItems
        .where((feedItem) =>
            !_formList.any((item) => item['id'] == feedItem.id))
        .toList();

    // Show confirmation dialog
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Perubahan'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (addedItems.isNotEmpty) ...[
                const Text('Ditambahkan:',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                ...addedItems.map((item) {
                  final feedId = int.parse(item['feed_id']);
                  return Text(
                      '- ${item['feed_name']} (${_formatStock(double.parse(item['quantity']))} ${_feedCache[feedId]?.unit ?? 'kg'})');
                }),
                const SizedBox(height: 8),
              ],
              if (updatedItems.isNotEmpty) ...[
                const Text('Diubah:',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                ...updatedItems.map((item) {
                  final feedId = int.parse(item['feed_id']);
                  final original = _feedItems.firstWhere((feedItem) => feedItem.id == item['id']);
                  return Text(
                      '- ${item['feed_name']}: ${_formatStock(original.quantity)} ${_feedCache[feedId]?.unit ?? 'kg'} → ${_formatStock(double.parse(item['quantity']))} ${_feedCache[feedId]?.unit ?? 'kg'}');
                }),
                const SizedBox(height: 8),
              ],
              if (deletedItems.isNotEmpty) ...[
                const Text('Dihapus:',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                ...deletedItems.map((item) => Text('- ${item.feedName} (${_formatStock(item.quantity)} ${_feedCache[item.feedId]?.unit ?? 'kg'})')),
              ],
              if (addedItems.isEmpty && updatedItems.isEmpty && deletedItems.isEmpty)
                const Text('Tidak ada perubahan.'),
              const SizedBox(height: 16),
              const Text('Apakah Anda yakin ingin menyimpan perubahan?'),
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
            child: const Text('Simpan', style: TextStyle(color: Colors.teal)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    try {
      if (addedItems.isNotEmpty) {
        final feedItems = addedItems
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
          throw Exception(addResponse['message'] ?? 'Gagal menambah item pakan');
        }
      }

      for (final item in updatedItems) {
        final updateResponse = await _feedItemController.updateFeedItem(
          id: item['id'] as int,
          quantity: double.parse(item['quantity']),
          userId: widget.userId,
        );
        if (!updateResponse['success']) {
          throw Exception(updateResponse['message'] ?? 'Gagal memperbarui item pakan');
        }
      }

      for (final item in deletedItems) {
        final deleteResponse = await _feedItemController.deleteFeedItem(
          item.id,
          widget.userId,
        );
        if (!deleteResponse['success']) {
          throw Exception(deleteResponse['message'] ?? 'Gagal menghapus item pakan');
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
              style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          backgroundColor: Colors.teal[700],
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Hanya pengguna dengan role "farmer" yang dapat mengedit item pakan, dan setidaknya ada satu sapi.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
            ),
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
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
        backgroundColor: Colors.teal[700],
        elevation: 0,
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
                    Container(
                      padding: const EdgeInsets.all(12.0),
                      margin: const EdgeInsets.only(bottom: 16.0),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red[200]!),
                      ),
                      child: Text(_errorMessage,
                          style: const TextStyle(color: Colors.red)),
                    ),
                  if (_stockMessage != null)
                    Container(
                      padding: const EdgeInsets.all(12.0),
                      margin: const EdgeInsets.only(bottom: 16.0),
                      decoration: BoxDecoration(
                        color: Colors.red[50],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red[200]!),
                      ),
                      child: Text(_stockMessage!,
                          style: const TextStyle(color: Colors.red)),
                    ),
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.teal[50],
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(Icons.calendar_today,
                                    size: 20, color: Colors.teal[700]),
                                const SizedBox(width: 8),
                                Text(
                                  'Tanggal: ${widget.feed.date}',
                                  style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.teal[900],
                                      fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Icon(Icons.access_time,
                                    size: 20, color: Colors.teal[700]),
                                const SizedBox(width: 8),
                                Text(
                                  'Sesi: ${widget.feed.session}',
                                  style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.teal[900],
                                      fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Icon(Icons.pets,
                                    size: 20, color: Colors.teal[700]),
                                const SizedBox(width: 8),
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
                                  style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.teal[900],
                                      fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                          ],
                        ),
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
                                      if (availableFeeds.isEmpty) {
                                        setState(() {
                                          _errorMessage =
                                              'Tidak ada pakan tersedia untuk dipilih.';
                                        });
                                      } else {
                                        setState(() {
                                          _showFeedDropdown = !_showFeedDropdown;
                                          _errorMessage = '';
                                        });
                                      }
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
                                              _selectedFeedId == null
                                                  ? 'Pilih Pakan'
                                                  : (_feedCache[int.tryParse(_selectedFeedId!) ?? 0]
                                                          ?.feedName ??
                                                      'Unknown Feed') +
                                                  ' (Stok: ${_formatStock(_feedCache[int.tryParse(_selectedFeedId!) ?? 0]?.stock ?? 0)} ${_feedCache[int.tryParse(_selectedFeedId!) ?? 0]?.unit ?? "kg"})',
                                              style: TextStyle(
                                                fontSize: 16,
                                                color: _selectedFeedId == null
                                                    ? Colors.grey[600]
                                                    : Colors.black,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                          Icon(
                                            _showFeedDropdown
                                                ? Icons.keyboard_arrow_up
                                                : Icons.keyboard_arrow_down,
                                            color: availableFeeds.isEmpty
                                                ? Colors.grey
                                                : Colors.teal,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: TextFormField(
                                    controller: _quantityController,
                                    decoration: InputDecoration(
                                      labelText: 'Jumlah',
                                      border: const OutlineInputBorder(
                                          borderRadius: BorderRadius.all(
                                              Radius.circular(8))),
                                      labelStyle:
                                          const TextStyle(fontSize: 16),
                                      suffixText: _selectedFeedId != null
                                          ? _feedCache[
                                                  int.tryParse(_selectedFeedId!) ??
                                                      0]
                                              ?.unit ??
                                              'kg'
                                          : 'kg',
                                      suffixStyle:
                                          const TextStyle(fontSize: 16),
                                    ),
                                    keyboardType:
                                        const TextInputType.numberWithOptions(
                                            decimal: true),
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
                                    onPressed: _addFeedItem,
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
                                  child: availableFeeds.isEmpty
                                      ? const Padding(
                                          padding: EdgeInsets.all(16.0),
                                          child: Text(
                                            'Tidak ada pakan tersedia untuk dipilih.',
                                            style: TextStyle(
                                              fontSize: 14,
                                              color: Colors.grey,
                                            ),
                                          ),
                                        )
                                      : ListView(
                                          shrinkWrap: true,
                                          children: availableFeeds.map((stock) {
                                            return ListTile(
                                              title: Text(
                                                stock.feedName,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                              subtitle: Text(
                                                'Stok: ${_formatStock(stock.stock)} ${stock.unit}',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                              onTap: () {
                                                setState(() {
                                                  _selectedFeedId =
                                                      stock.feedId.toString();
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
                              padding: const EdgeInsets.all(12.0),
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
                              constraints: const BoxConstraints(maxHeight: 300),
                              child: ListView.builder(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12.0, vertical: 8.0),
                                itemCount: _formList.length,
                                itemBuilder: (context, index) {
                                  final item = _formList[index];
                                  final feedId = int.tryParse(item['feed_id']);
                                  final feedName = item['feed_name'] ??
                                      (feedId != null
                                          ? _feedCache[feedId]?.feedName
                                          : 'Unknown Feed');
                                  final feedUnit = feedId != null
                                      ? _feedCache[feedId]?.unit ?? 'kg'
                                      : 'kg';
                                  final controller = _quantityControllers[item['id'] ?? index] ??
                                      TextEditingController(text: item['quantity']);
                                  _quantityControllers[item['id'] ?? index] = controller;

                                  return Container(
                                    margin: const EdgeInsets.only(bottom: 4.0),
                                    padding: const EdgeInsets.all(8.0),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[50],
                                      borderRadius: BorderRadius.circular(6),
                                      border:
                                          Border.all(color: Colors.grey[200]!),
                                    ),
                                    child: Row(
                                      children: [
                                        Expanded(
                                          flex: 3,
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                feedName,
                                                style: const TextStyle(
                                                  fontSize: 13,
                                                  fontWeight: FontWeight.w500,
                                                ),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              Text(
                                                'Stok: ${_formatStock(_feedCache[feedId]?.stock ?? 0)} $feedUnit',
                                                style: TextStyle(
                                                  fontSize: 11,
                                                  color: Colors.grey[600],
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          flex: 2,
                                          child: TextFormField(
                                            controller: controller,
                                            decoration: InputDecoration(
                                              labelText: 'Jumlah',
                                              border: const OutlineInputBorder(
                                                  borderRadius: BorderRadius.all(
                                                      Radius.circular(6))),
                                              suffixText: feedUnit,
                                              suffixStyle:
                                                  const TextStyle(fontSize: 11),
                                              contentPadding:
                                                  const EdgeInsets.symmetric(
                                                      vertical: 4, horizontal: 12),
                                            ),
                                            keyboardType:
                                                const TextInputType.numberWithOptions(
                                                    decimal: true),
                                            style: const TextStyle(fontSize: 13),
                                            onChanged: (value) {
                                              setState(() {
                                                item['quantity'] = value;
                                              });
                                            },
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline,
                                              color: Colors.red, size: 16),
                                          onPressed: () => _removeFeedItem(index),
                                          constraints: const BoxConstraints(
                                            minWidth: 24,
                                            minHeight: 24,
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
                              backgroundColor: Colors.grey[600],
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
                            constraints: const BoxConstraints(maxHeight: 300),
                            child: _feedItems.isEmpty
                                ? Padding(
                                    padding: const EdgeInsets.all(16.0),
                                    child: Text(
                                      'Belum ada item pakan untuk sesi ini. Klik "Tambah Pakan" untuk memulai.',
                                      style: TextStyle(
                                          color: Colors.grey[600], fontSize: 14),
                                      textAlign: TextAlign.center,
                                    ),
                                  )
                                : ListView.builder(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 16.0, vertical: 8.0),
                                    itemCount: _feedItems.length,
                                    itemBuilder: (context, index) {
                                      final item = _feedItems[index];
                                      final feed = _feedCache[item.feedId];
                                      final feedName = item.feedName.isNotEmpty
                                          ? item.feedName
                                          : feed?.feedName ?? 'Unknown Feed';
                                      final feedUnit = feed?.unit ?? 'kg';
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
                                                    feedName,
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
                                                    'Stok: ${_formatStock(item.quantity)} $feedUnit',
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
                      onPressed: _feeds.isEmpty ? null : _toggleEditMode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            _feeds.isEmpty ? Colors.grey : Colors.teal,
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      child: Text(
                        _feeds.isEmpty ? 'Tidak ada stok pakan' : 'Tambah Pakan',
                        style: const TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ],
              ),
            ),
    );
  }
}