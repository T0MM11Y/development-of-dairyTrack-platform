import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedController.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedStockController.dart';
import '../model/feed.dart';
import '../model/feedStock.dart';
import './addStock.dart';
import './stockHistory.dart';

class FeedStockList extends StatefulWidget {
  const FeedStockList({super.key});

  @override
  _FeedStockListState createState() => _FeedStockListState();
}

class _FeedStockListState extends State<FeedStockList> {
  final FeedStockManagementController _stockController = FeedStockManagementController();
  final FeedManagementController _feedController = FeedManagementController();
  List<FeedStockModel> _feedStockList = [];
  List<FeedStockModel> _filteredFeedStockList = [];
  List<Feed> _feedList = [];
  bool _isLoading = true;
  bool _isLoadingFeeds = true;
  String _errorMessage = '';
  String _searchQuery = '';
  final int _userId = 13;

  @override
  void initState() {
    super.initState();
    _fetchFeeds();
    _fetchFeedStocks();
  }

  Future<void> _fetchFeeds() async {
    if (!mounted) return;
    setState(() => _isLoadingFeeds = true);
    try {
      final response = await _feedController.getAllFeeds();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _feedList = (response['data'] as List)
              .map((json) => Feed.fromJson(json))
              .toList();
          _isLoadingFeeds = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Gagal mengambil data pakan';
          _isLoadingFeeds = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error mengambil pakan: $e';
        _isLoadingFeeds = false;
      });
    }
  }

  Future<void> _fetchFeedStocks() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final response = await _stockController.getAllFeedStocks();
      if (!mounted) return;
      if (response['success']) {
        final feedMap = {for (var feed in _feedList) feed.id: feed};
        setState(() {
          _feedStockList = (response['data'] as List)
              .map((json) {
                final feedId = json['feed_id'] is num ? (json['feed_id'] as num).toInt() : 0;
                final feed = feedMap[feedId];
                final feedName = json['name'] ?? feed?.name ?? 'Pakan Tidak Diketahui';
                final unit = feed?.unit ?? 'kg';
                print('FeedStockList - updatedAt: ${json['updated_at']}'); // Debug log
                return FeedStockModel.fromJson(json, feedName, unit);
              })
              .toList();
          _applyFilters();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Gagal mengambil stok pakan';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error mengambil stok pakan: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    if (!mounted) return;
    setState(() {
      _filteredFeedStockList = _feedStockList
          .where((stock) =>
              stock.feedName.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    });
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: isError ? Colors.red.shade600 : Colors.teal.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Future<bool> _showConfirmationDialog({
    required String title,
    required String message,
    bool isDelete = false,
  }) async {
    return await showDialog<bool>(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            gradient: LinearGradient(
              colors: [Colors.teal.shade50, Colors.white],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                isDelete ? Icons.warning_amber_rounded : Icons.info,
                color: isDelete ? Colors.red : Colors.teal,
                size: 50,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Colors.black87),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      "Batal",
                      style: TextStyle(color: Colors.black87),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isDelete ? Colors.red : Colors.teal,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: Text(
                      isDelete ? "Hapus" : "Konfirmasi",
                      style: const TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ) ?? false;
  }

  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text(
          'Manajemen Stok Pakan',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade600,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.history, color: Colors.white),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (context) => const FeedStockHistory()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: _isLoading || _isLoadingFeeds
                ? Center(child: CircularProgressIndicator(color: Colors.teal.shade600))
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Text(
                          _errorMessage,
                          style: const TextStyle(color: Colors.red, fontSize: 16),
                        ),
                      )
                    : _filteredFeedStockList.isEmpty
                        ? Center(
                            child: Text(
                              'Tidak ada stok pakan ditemukan',
                              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _fetchFeedStocks,
                            color: Colors.teal.shade600,
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                              itemCount: _filteredFeedStockList.length,
                              itemBuilder: (context, index) {
                                final stock = _filteredFeedStockList[index];
                                return _buildFeedStockCard(stock);
                              },
                            ),
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => FeedStockAdd(
              feedList: _feedList,
              onSuccess: _fetchFeedStocks,
            ),
          ),
        ),
        child: const Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.teal.shade600,
        elevation: 6,
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Cari stok pakan...',
          prefixIcon: Icon(Icons.search, color: Colors.teal.shade600),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, color: Colors.grey.shade600),
                  onPressed: () {
                    setState(() {
                      _searchQuery = '';
                      _applyFilters();
                    });
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade100),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade400, width: 2),
          ),
          contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 20),
        ),
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
            _applyFilters();
          });
        },
      ),
    );
  }

  Widget _buildFeedStockCard(FeedStockModel stock) {
    // Helper method to safely format the date
    String formatDate(String dateString) {
      try {
        final date = DateTime.parse(dateString);
        return DateFormat('dd MMM yyyy', 'id_ID').format(date);
      } catch (e) {
        print('FeedStockList - Error formatting date: $dateString, Error: $e');
        return 'T/A';
      }
    }

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.teal.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.teal.shade100,
                    child: Icon(Icons.store, color: Colors.teal.shade800, size: 24),
                    radius: 22,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          stock.feedName,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.teal.shade800,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Stok: ${formatNumber(stock.stock)} ${stock.unit}',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: Colors.teal.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(Icons.add_circle, color: Colors.teal.shade600, size: 24),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => FeedStockAdd(
                              feedList: _feedList,
                              preselectedFeedId: stock.feedId,
                              onSuccess: _fetchFeedStocks,
                            ),
                          ),
                        ),
                      ),
                      IconButton(
                        icon: Icon(Icons.edit, color: Colors.teal.shade600, size: 24),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => FeedStockAdd(
                              feedList: _feedList,
                              stock: stock,
                              onSuccess: _fetchFeedStocks,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _buildInfoChip(Icons.scale, 'Satuan: ${stock.unit}'),
              const SizedBox(height: 8),
              Text(
                stock.updatedAt.isNotEmpty
                    ? 'Diperbarui: ${formatDate(stock.updatedAt)}'
                    : 'Diperbarui: T/A',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.teal.shade50,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.teal.shade600),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 13, color: Colors.teal.shade800),
          ),
        ],
      ),
    );
  }
}

String formatNumber(double value) {
  final String formatted = value.toStringAsFixed(2).replaceAll(RegExp(r'\.0+$'), '');
  final formatter = NumberFormat('#,##0', 'id_ID');
  return formatter.format(double.parse(formatted));
}
