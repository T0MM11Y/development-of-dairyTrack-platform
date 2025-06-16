import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../../../controller/APIURL4/dailyScheduleController.dart';
import '../../../controller/APIURL4/dailyFeedItemController.dart';
import '../../../controller/APIURL4/feedStockController.dart';
import '../model/feed.dart';
import '../model/dailyFeed.dart';
import '../model/feedStock.dart';
import '../../../controller/APIURL1/cowManagementController.dart';

class AddFeedItemPage extends StatefulWidget {
  final List<Cow> cows;
  final String defaultDate;
  final int userId;

  const AddFeedItemPage({
    super.key,
    required this.cows,
    required this.defaultDate,
    required this.userId,
  });

  @override
  _AddFeedItemPageState createState() => _AddFeedItemPageState();
}

class _AddFeedItemPageState extends State<AddFeedItemPage> {
  final DailyFeedManagementController _feedController =
      DailyFeedManagementController();
  final DailyFeedItemManagementController _feedItemController =
      DailyFeedItemManagementController();
  final FeedStockManagementController _stockController =
      FeedStockManagementController();
  final TextEditingController _quantityController = TextEditingController();
  List<DailyFeed> _dailyFeeds = [];
  List<FeedStockModel> _feedStocks = [];
  List<Map<String, dynamic>> _selectedFeeds = [];
  String? _selectedDailyFeedId;
  String? _selectedFeedId;
  String _errorMessage = '';
  bool _isLoading = false;
  String? _userRole;
  bool _showDailyFeedDropdown = false;
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
      final feedResponse = await _feedController.getAllDailyFeeds(
        date: widget.defaultDate,
        userId: widget.userId,
      );
      final stockResponse = await _stockController.getAllFeedStocks();
      if (!mounted) return;

      print('Feed Response: $feedResponse');
      print('Stock Response: $stockResponse');

      if (feedResponse['success'] && stockResponse['success']) {
        final feeds = (feedResponse['data'] as List<dynamic>)
            .map((json) => DailyFeed.fromJson(json as Map<String, dynamic>))
            .toList();
        final feedStocks = (stockResponse['data'] as List<dynamic>)
            .map((json) {
              try {
                final feedId = json['feed_id'] is num
                    ? (json['feed_id'] as num).toInt()
                    : 0;
                final feedName = json['name'] ?? 'Unknown Feed';
                final unit = json['unit'] ?? 'kg';
                return FeedStockModel.fromJson(json, feedName, unit);
              } catch (e) {
                print('Error parsing feed stock: $e, JSON: $json');
                return null;
              }
            })
            .where((stock) => stock != null && stock.stock > 0)
            .cast<FeedStockModel>()
            .toList();

        print('Parsed daily feeds: $feeds');
        print('Parsed feed stocks: $feedStocks');

        setState(() {
          _dailyFeeds = feeds;
          _feedStocks = feedStocks;
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = feedResponse['message'] ??
              stockResponse['message'] ??
              'Gagal memuat data';
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
      print('Error in _fetchData: $e');
    }
  }

  // Helper function to format stock numbers properly
  String _formatStock(double stock) {
    if (stock == stock.toInt()) {
      return stock.toInt().toString();
    } else {
      return stock.toString().replaceAll(RegExp(r'\.?0+$'), '');
    }
  }

  void _addFeed() {
    if (_selectedFeedId == null || _quantityController.text.isEmpty) {
      setState(() {
        _errorMessage = 'Pilih pakan dan masukkan jumlah yang valid.';
      });
      return;
    }
    final quantity = double.tryParse(_quantityController.text);
    final feedStock = _feedStocks.firstWhere(
      (f) => f.feedId.toString() == _selectedFeedId,
      orElse: () => FeedStockModel(
          id: 0, feedId: 0, feedName: '', stock: 0, unit: '', updatedAt: ''),
    );
    if (feedStock.feedId == 0 || quantity == null || quantity <= 0) {
      setState(() {
        _errorMessage = 'Pakan tidak ditemukan atau jumlah tidak valid.';
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
      _selectedFeeds.add({
        'feedId': feedStock.feedId,
        'quantity': quantity,
        'name': feedStock.feedName,
        'unit': feedStock.unit,
      });
      _selectedFeedId = null;
      _quantityController.clear();
      _errorMessage = '';
    });
  }

  void _removeFeed(int feedId) {
    setState(() {
      _selectedFeeds.removeWhere((item) => item['feedId'] == feedId);
      _errorMessage = '';
    });
  }

  Future<void> _showConfirmationDialog() async {
    final selectedDailyFeed = _dailyFeeds.firstWhere(
      (feed) => feed.id.toString() == _selectedDailyFeedId,
      orElse: () => DailyFeed(
        id: 0,
        cowId: 0,
        cowName: 'Unknown Cow',
        date: '',
        session: '',
        weather: 'Tidak ada data',
        totalNutrients: {},
        userId: 0,
        userName: 'Unknown User',
        createdBy: {'id': 0, 'name': 'Unknown'},
        updatedBy: {'id': 0, 'name': 'Unknown'},
        createdAt: '',
        updatedAt: '',
      ),
    );
    final cow = widget.cows.firstWhere(
      (c) => c.id == selectedDailyFeed.cowId,
      orElse: () => Cow(
          id: 0,
          name: 'Sapi Tidak Diketahui',
          birth: '',
          breed: '',
          lactationPhase: '',
          weight: 0.0,
          gender: ''),
    );

    final feedItemsText = _selectedFeeds
        .map((item) => '${item['name']} - ${item['quantity']} ${item['unit']}')
        .join('\n');
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Penambahan'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Apakah anda yakin mau menambah item pakan untuk:'),
            Text('Sapi: ${cow.name}'),
            Text('Tanggal: ${selectedDailyFeed.date}'),
            Text('Sesi: ${selectedDailyFeed.session}'),
            const SizedBox(height: 10),
            const Text('Daftar Pakan:',
                style: TextStyle(fontWeight: FontWeight.bold)),
            Text(feedItemsText),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Ya', style: TextStyle(color: Colors.teal)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await _submit();
    }
  }

  Future<void> _submit() async {
    if (_selectedDailyFeedId == null || _selectedFeeds.isEmpty) {
      setState(() {
        _errorMessage = 'Pilih sesi pakan dan tambahkan setidaknya satu pakan.';
      });
      return;
    }

    setState(() => _isLoading = true);
    try {
      final feedItems = _selectedFeeds
          .map((item) => {
                'feed_id': item['feedId'],
                'quantity': item['quantity'],
              })
          .toList();
      final response = await _feedItemController.addFeedItem(
        dailyFeedId: int.parse(_selectedDailyFeedId!),
        feedItems: feedItems,
        userId: widget.userId,
      );
      if (!mounted) return;

      if (response['success']) {
        Navigator.pop(context, true);
      } else {
        setState(() {
          _errorMessage =
              response['message'] ?? 'Gagal menambahkan item pakan.';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal menambahkan: $e';
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
          title: const Text('Tambah Item Pakan',
              style: TextStyle(color: Colors.white)),
          backgroundColor: Colors.teal[700],
        ),
        body: const Center(
          child: Text(
            'Hanya pengguna dengan role "farmer" yang dapat menambah item pakan, dan setidaknya ada satu sapi.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      );
    }

    final availableFeeds = _feedStocks
        .where((stock) => !_selectedFeeds
            .any((selected) => selected['feedId'] == stock.feedId))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Item Pakan',
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
                  // Dropdown Sesi Pakan
                  Card(
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        children: [
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _showDailyFeedDropdown =
                                    !_showDailyFeedDropdown;
                                _showFeedDropdown = false;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  vertical: 12, horizontal: 16),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      _selectedDailyFeedId == null
                                          ? 'Pilih Sesi Pakan'
                                          : '${widget.cows.firstWhere((cow) => cow.id == _dailyFeeds.firstWhere((feed) => feed.id.toString() == _selectedDailyFeedId).cowId, orElse: () => Cow(id: 0, name: 'Sapi #${_dailyFeeds.firstWhere((feed) => feed.id.toString() == _selectedDailyFeedId).cowId}', birth: '', breed: '', lactationPhase: '', weight: 0.0, gender: '')).name} - ${_dailyFeeds.firstWhere((feed) => feed.id.toString() == _selectedDailyFeedId).date} (${_dailyFeeds.firstWhere((feed) => feed.id.toString() == _selectedDailyFeedId).session})',
                                      style: TextStyle(
                                        fontSize: 16,
                                        color: _selectedDailyFeedId == null
                                            ? Colors.grey[600]
                                            : Colors.black,
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    _showDailyFeedDropdown
                                        ? Icons.keyboard_arrow_up
                                        : Icons.keyboard_arrow_down,
                                    color: Colors.teal,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (_showDailyFeedDropdown)
                            Card(
                              elevation: 8,
                              shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12)),
                              child: Container(
                                constraints:
                                    const BoxConstraints(maxHeight: 200),
                                margin: const EdgeInsets.only(top: 8),
                                child: ListView(
                                  shrinkWrap: true,
                                  children: _dailyFeeds.map((feed) {
                                    return ListTile(
                                      title: Text(
                                        '${widget.cows.firstWhere((cow) => cow.id == feed.cowId, orElse: () => Cow(id: feed.cowId, name: 'Sapi #${feed.cowId}', birth: '', breed: '', lactationPhase: '', weight: 0.0, gender: '')).name} - ${feed.date} (${feed.session})',
                                        style: const TextStyle(fontSize: 14),
                                      ),
                                      onTap: () {
                                        setState(() {
                                          _selectedDailyFeedId =
                                              feed.id.toString();
                                          _showDailyFeedDropdown = false;
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
                  // Dropdown Pakan dan Input Jumlah
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
                                      _showDailyFeedDropdown = false;
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
                                            _selectedFeedId == null
                                                ? 'Pilih Pakan'
                                                : '${availableFeeds.firstWhere((stock) => stock.feedId.toString() == _selectedFeedId).feedName} (Stok: ${_formatStock(availableFeeds.firstWhere((stock) => stock.feedId.toString() == _selectedFeedId).stock)} ${availableFeeds.firstWhere((stock) => stock.feedId.toString() == _selectedFeedId).unit})',
                                            style: TextStyle(
                                              fontSize: 16,
                                              color: _selectedFeedId == null
                                                  ? Colors.grey[600]
                                                  : Colors.black,
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
                                  controller: _quantityController,
                                  decoration: InputDecoration(
                                    labelText: 'Jumlah',
                                    border: const OutlineInputBorder(
                                        borderRadius: BorderRadius.all(
                                            Radius.circular(8))),
                                    labelStyle: const TextStyle(fontSize: 16),
                                    suffixText: _selectedFeedId != null
                                        ? _feedStocks
                                            .firstWhere(
                                                (f) =>
                                                    f.feedId.toString() ==
                                                    _selectedFeedId,
                                                orElse: () => FeedStockModel(
                                                    id: 0,
                                                    feedId: 0,
                                                    feedName: '',
                                                    stock: 0,
                                                    unit: 'kg',
                                                    updatedAt: ''))
                                            .unit
                                        : 'kg',
                                    suffixStyle: const TextStyle(fontSize: 16),
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
                                  onPressed: _addFeed,
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
                  // Daftar Pakan yang Dipilih
                  if (_selectedFeeds.isNotEmpty) ...[
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
                              itemCount: _selectedFeeds.length,
                              itemBuilder: (context, index) {
                                final item = _selectedFeeds[index];
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
                                              item['name'],
                                              style: const TextStyle(
                                                fontSize: 14,
                                                fontWeight: FontWeight.w500,
                                              ),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              '${_formatStock(item['quantity'])} ${item['unit']}',
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
                                        onPressed: () =>
                                            _removeFeed(item['feedId']),
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
                  // Tombol Simpan
                  ElevatedButton(
                    onPressed:
                        _selectedFeeds.isEmpty ? null : _showConfirmationDialog,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      minimumSize: const Size(double.infinity, 48),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12)),
                      disabledBackgroundColor: Colors.teal[200],
                      elevation: 2,
                    ),
                    child: Text(
                      _selectedFeeds.isEmpty
                          ? 'Pilih Pakan Terlebih Dahulu'
                          : 'Simpan (${_selectedFeeds.length} item)',
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 15,
                          fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
