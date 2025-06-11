import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controller/APIURL4/dailyScheduleController.dart';
import '../../../controller/APIURL4/dailyFeedItemController.dart';
import '../../../controller/APIURL4/feedStockController.dart';
import '../model/feed.dart';
import '../model/dailyFeed.dart';
import '../../../controller/APIURL1/cowManagementController.dart';
import 'package:intl/intl.dart';

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
  final DailyFeedManagementController _feedController = DailyFeedManagementController();
  final DailyFeedItemManagementController _feedItemController = DailyFeedItemManagementController();
  final FeedStockManagementController _stockController = FeedStockManagementController();
  final TextEditingController _quantityController = TextEditingController();
  List<DailyFeed> _dailyFeeds = [];
  List<Map<String, dynamic>> _feeds = [];
  List<Map<String, dynamic>> _selectedFeeds = [];
  String? _selectedDailyFeedId;
  String? _selectedFeedId;
  String _errorMessage = '';
  bool _isLoading = false;
  String? _userRole;

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

      if (feedResponse['success'] && stockResponse['success']) {
        final feeds = (feedResponse['data'] as List<dynamic>)
            .map((json) => DailyFeed.fromJson(json as Map<String, dynamic>))
            .toList();
        final feedStocks = (stockResponse['data'] as List<dynamic>)
            .map((json) => {
                  'id': json['id'],
                  'name': json['name'] ?? 'Feed #${json['id']}',
                  'stock': double.tryParse(json['stock']?.toString() ?? '0') ?? 0,
                  'unit': json['unit'] ?? 'kg',
                })
            .where((feed) => feed['stock'] > 0)
            .toList();

        setState(() {
          _dailyFeeds = feeds;
          _feeds = feedStocks;
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
    final feed = _feeds.firstWhere(
      (f) => f['id'].toString() == _selectedFeedId,
      orElse: () => {},
    );
    if (feed.isEmpty || quantity == null || quantity <= 0) {
      setState(() {
        _errorMessage = 'Pakan tidak ditemukan atau jumlah tidak valid.';
      });
      return;
    }

    if (quantity > feed['stock']) {
      setState(() {
        _errorMessage =
            'Jumlah melebihi stok tersedia: ${feed['stock']} ${feed['unit']}.';
      });
      return;
    }

    setState(() {
      _selectedFeeds.add({
        'feedId': int.parse(_selectedFeedId!),
        'quantity': quantity,
        'name': feed['name'],
        'unit': feed['unit'],
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
          _errorMessage = response['message'] ?? 'Gagal menambahkan item pakan.';
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
          title: const Text('Tambah Item Pakan'),
          backgroundColor: Colors.teal.shade700,
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

    final availableFeeds = _feeds
        .where((feed) =>
            !_selectedFeeds.any((selected) => selected['feedId'] == feed['id']))
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Tambah Item Pakan',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.teal.shade700,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_errorMessage.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Text(
                        _errorMessage,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ),
                  DropdownButtonFormField<String>(
                    value: _selectedDailyFeedId,
                    decoration: InputDecoration(
                      labelText: 'Pilih Sesi Pakan',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    items: [
                      const DropdownMenuItem(
                        value: null,
                        child: Text('Pilih Sesi Pakan'),
                      ),
                      ..._dailyFeeds.map((feed) => DropdownMenuItem(
                            value: feed.id.toString(),
                            child: Text(
                              '${widget.cows.firstWhere(
                                (cow) => cow.id == feed.cowId,
                                orElse: () => Cow(
                                  id: feed.cowId,
                                  name: 'Sapi #${feed.cowId}',
                                  birth: DateFormat(
                                    "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
                                  ).format(DateTime.now().subtract(const Duration(days: 365))),
                                  breed: 'Unknown',
                                  lactationPhase: 'None',
                                  weight: 0.0,
                                  gender: 'Unknown',
                                ),
                              ).name} - ${feed.date} (${feed.session})',
                            ),
                          )),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _selectedDailyFeedId = value;
                        _errorMessage = '';
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        flex: 2,
                        child: DropdownButtonFormField<String>(
                          value: _selectedFeedId,
                          decoration: InputDecoration(
                            labelText: 'Pilih Pakan',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          items: [
                            const DropdownMenuItem(
                              value: null,
                              child: Text('Pilih Pakan'),
                            ),
                            ...availableFeeds.map((feed) => DropdownMenuItem(
                                  value: feed['id'].toString(),
                                  child: Text(
                                      '${feed['name']} (Stok: ${feed['stock']} ${feed['unit']})'),
                                )),
                          ],
                          onChanged: (value) {
                            setState(() {
                              _selectedFeedId = value;
                              _errorMessage = '';
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 1,
                        child: TextFormField(
                          controller: _quantityController,
                          decoration: InputDecoration(
                            labelText: 'Jumlah (${_selectedFeedId != null ? _feeds.firstWhere((f) => f['id'].toString() == _selectedFeedId, orElse: () => {'unit': 'kg'})['unit'] : 'kg'})',
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.add_circle, color: Colors.teal),
                        onPressed: _addFeed,
                      ),
                    ],
                  ),
                  if (_selectedFeeds.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    const Text(
                      'Pakan yang Dipilih',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Expanded(
                      child: ListView(
                        children: _selectedFeeds.map((item) {
                          return ListTile(
                            title: Text(item['name']),
                            subtitle: Text('Jumlah: ${item['quantity']} ${item['unit']}'),
                            trailing: IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () => _removeFeed(item['feedId']),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ],
                  const Spacer(),
                  ElevatedButton(
                    onPressed: _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      minimumSize: const Size(double.infinity, 50),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Simpan',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
