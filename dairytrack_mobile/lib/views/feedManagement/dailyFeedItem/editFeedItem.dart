import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../controller/APIURL4/dailyFeedItemController.dart';
import '../../../controller/APIURL4/feedStockController.dart';
import '../model/feed.dart';
import '../model/dailyFeed.dart';
import '../model/dailyFeedItem.dart';
import '../../../controller/APIURL1/cowManagementController.dart';
import 'package:intl/intl.dart'; // Harus ada di sini


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
  final DailyFeedItemManagementController _feedItemController = DailyFeedItemManagementController();
  final FeedStockManagementController _stockController = FeedStockManagementController();
  List<DailyFeedItem> _feedItems = [];
  List<Map<String, dynamic>> _feeds = [];
  List<Map<String, dynamic>> _formList = [];
  String _errorMessage = '';
  bool _isLoading = false;
  bool _isEditing = false;
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
      final itemResponse = await _feedItemController.getFeedItemsByDailyFeedId(widget.feed.id, widget.userId);
      final stockResponse = await _stockController.getAllFeedStocks();
      if (!mounted) return;

      if (itemResponse['success'] && stockResponse['success']) {
        final feedItems = (itemResponse['data'] as List<dynamic>)
            .map((json) => DailyFeedItem.fromJson(json as Map<String, dynamic>))
            .toList();
        final feedStocks = (stockResponse['data'] as List<dynamic>)
            .map((json) => {
                  'id': json['id'],
                  'name': json['name'] ?? 'Feed #${json['id']}',
                  'stock': double.tryParse(json['stock']?.toString() ?? '0') ?? 0,
                  'unit': json['unit'] ?? 'kg',
                })
            .toList();

        setState(() {
          _feedItems = feedItems;
          _feeds = feedStocks;
          _formList = feedItems
              .map((item) => {
                    'id': item.id,
                    'feed_id': item.feedId.toString(),
                    'quantity': item.quantity.toString(),
                    'daily_feed_id': item.dailyFeedId,
                  })
              .toList();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = itemResponse['message'] ??
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

  void _toggleEditMode() {
    setState(() {
      _isEditing = !_isEditing;
      _errorMessage = '';
      if (!_isEditing) {
        _formList = _feedItems
            .map((item) => {
                  'id': item.id,
                  'feed_id': item.feedId.toString(),
                  'quantity': item.quantity.toString(),
                  'daily_feed_id': item.dailyFeedId,
                })
            .toList();
      }
    });
  }

  void _addFeedItem() {
    setState(() {
      _formList.add({
        'feed_id': '',
        'quantity': '',
        'daily_feed_id': widget.feed.id,
      });
    });
  }

  void _removeFeedItem(int index) async {
    final item = _formList[index];
    if (item['id'] != null) {
      final feed = _feeds.firstWhere(
        (f) => f['id'].toString() == item['feed_id'],
        orElse: () => {'name': 'Pakan'},
      );
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Konfirmasi Hapus'),
          content: Text('Hapus pakan "${feed['name']}"?'),
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
        final response = await _feedItemController.deleteFeedItem(item['id'] as int, widget.userId);
        if (!mounted) return;

        if (response['success']) {
          setState(() {
            _formList.removeAt(index);
            _feedItems.removeWhere((feedItem) => feedItem.id == item['id']);
            _isLoading = false;
          });
        } else {
          setState(() {
            _errorMessage = response['message'] ?? 'Gagal menghapus item pakan.';
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
        final stock = _feeds.firstWhere(
                (f) => f['id'].toString() == item['feed_id'],
                orElse: () => {'stock': 0})['stock'] as double;
        if (quantity > stock) {
          errors[i] = 'Jumlah melebihi stok: $stock kg.';
        }
      }
    }

    if (errors.isNotEmpty) {
      setState(() {
        _errorMessage = 'Periksa input pakan.';
      });
      return;
    }

    setState(() => _isLoading = true);
    try {
      final newItems = _formList.where((item) => item['id'] == null).toList();
      final updatedItems = _formList.where((item) => item['id'] != null).toList();

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
          title: const Text('Edit Item Pakan'),
          backgroundColor: Colors.teal.shade700,
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

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Edit Item Pakan',
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
                        ).format(DateTime.now().subtract(const Duration(days: 365))),
                        breed: 'Unknown',
                        lactationPhase: 'None',
                        weight: 0.0,
                        gender: 'Unknown',
                      ),
                    ).name}',
                    style: const TextStyle(fontSize: 16),
                  ),
                  const SizedBox(height: 16),
                  if (_isEditing) ...[
                    Expanded(
                      child: ListView.builder(
                        itemCount: _formList.length,
                        itemBuilder: (context, index) {
                          final item = _formList[index];
                          final availableFeeds = _feeds
                              .where((feed) => !_formList
                                  .asMap()
                                  .entries
                                  .where((entry) => entry.key != index)
                                  .map((entry) => entry.value)
                                  .any((entry) => entry['feed_id'] == feed['id'].toString()))
                              .toList();
                          return Card(
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(
                                children: [
                                  DropdownButtonFormField<String>(
                                    value: item['feed_id'].isNotEmpty
                                        ? item['feed_id']
                                        : null,
                                    decoration: InputDecoration(
                                      labelText: 'Jenis Pakan',
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
                                            child: Text(feed['name']),
                                          )),
                                    ],
                                    onChanged: item['id'] != null
                                        ? null
                                        : (value) {
                                            setState(() {
                                              _formList[index]['feed_id'] = value ?? '';
                                              _errorMessage = '';
                                            });
                                          },
                                  ),
                                  const SizedBox(height: 8),
                                  TextFormField(
                                    initialValue: item['quantity'],
                                    decoration: InputDecoration(
                                      labelText: 'Jumlah (${_feeds.firstWhere(
                                            (f) => f['id'].toString() == item['feed_id'],
                                            orElse: () => {'unit': 'kg'},
                                          )['unit']})',
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                                    onChanged: (value) {
                                      setState(() {
                                        _formList[index]['quantity'] = value;
                                        _errorMessage = '';
                                      });
                                    },
                                  ),
                                  if (item['feed_id'].isNotEmpty)
                                    Text(
                                      'Stok tersedia: ${_feeds.firstWhere(
                                        (f) => f['id'].toString() == item['feed_id'],
                                        orElse: () => {'stock': 0},
                                      )['stock']} kg',
                                      style: const TextStyle(color: Colors.teal),
                                    ),
                                  IconButton(
                                    icon: const Icon(Icons.delete, color: Colors.red),
                                    onPressed: () => _removeFeedItem(index),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    TextButton(
                      onPressed: _addFeedItem,
                      child: const Text(
                        '+ Tambah Pakan',
                        style: TextStyle(color: Colors.teal),
                      ),
                    ),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        ElevatedButton(
                          onPressed: _toggleEditMode,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.grey,
                          ),
                          child: const Text('Batal'),
                        ),
                        ElevatedButton(
                          onPressed: _save,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal,
                          ),
                          child: const Text('Simpan', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  ] else ...[
                    Expanded(
                      child: _feedItems.isEmpty
                          ? const Center(
                              child: Text(
                                'Tidak ada item pakan.',
                                style: TextStyle(color: Colors.grey),
                              ),
                            )
                          : ListView.builder(
                              itemCount: _feedItems.length,
                              itemBuilder: (context, index) {
                                final item = _feedItems[index];
                                return Card(
                                  margin: const EdgeInsets.symmetric(vertical: 8),
                                  child: ListTile(
                                    title: Text(item.feedName),
                                    subtitle: Text(
                                        'Jumlah: ${item.quantity} kg\nStok tersedia: ${_feeds.firstWhere(
                                          (f) => f['id'] == item.feedId,
                                          orElse: () => {'stock': 0},
                                        )['stock']} kg'),
                                  ),
                                );
                              },
                            ),
                    ),
                    ElevatedButton(
                      onPressed: _toggleEditMode,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
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
