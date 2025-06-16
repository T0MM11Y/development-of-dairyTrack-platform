import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedController.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedStockController.dart';
import '../model/feed.dart';
import '../model/feedStockHistory.dart';

class FeedStockHistory extends StatefulWidget {
  const FeedStockHistory({super.key});

  @override
  State<FeedStockHistory> createState() => _FeedStockHistoryState();
}

class _FeedStockHistoryState extends State<FeedStockHistory> {
  final FeedStockManagementController _stockController = FeedStockManagementController();
  final FeedManagementController _feedController = FeedManagementController();
  List<FeedStockHistoryModel> _historyList = [];
  List<FeedStockHistoryModel> _filteredHistoryList = [];
  List<Feed> _feedList = [];
  bool _isLoading = true;
  bool _isFeedLoading = true;
  String? _errorMessage;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchFeed();
    _fetchHistory();
  }

  Future<void> _fetchFeed() async {
    if (!mounted) return;
    setState(() => _isFeedLoading = true);
    try {
      final response = await _feedController.getAllFeeds();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _feedList = (response['data'] as List)
              .map((json) => Feed.fromJson(json))
              .toList();
          _isFeedLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Gagal mengambil data pakan';
          _isFeedLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error saat mengambil data pakan: $e';
        _isFeedLoading = false;
      });
    }
  }

  Future<void> _fetchHistory() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final response = await _stockController.getAllFeedStockHistory();
      if (!mounted) return;
      if (response['success']) {
        final feedMap = {for (var feed in _feedList) feed.id: feed};
        setState(() {
          _historyList = (response['data'] as List).map((json) {
            final feedId = json['feed_id'] is num ? (json['feed_id'] as num).toInt() : 0;
            final feed = feedMap[feedId];
            final feedName = json['feed_name'] as String? ?? feed?.name ?? 'Pakan Tidak Diketahui';
            final unit = feed?.unit ?? 'kg';
            return FeedStockHistoryModel.fromJson(json, feedName, unit);
          }).toList();
          _applyFilters();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Gagal mengambil riwayat stok';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error saat mengambil riwayat stok: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    if (!mounted) return;
    setState(() {
      _filteredHistoryList = _historyList
          .where((history) =>
              history.feedName.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              history.keterangan.toLowerCase().contains(_searchQuery.toLowerCase()))
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
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<bool> _showConfirmationDialog({
    required String title,
    required String message,
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
              const Icon(
                Icons.info,
                color: Colors.teal,
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
                      backgroundColor: Colors.teal,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      "Konfirmasi",
                      style: TextStyle(color: Colors.white),
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

  Future<void> _deleteHistory(int id, String feedName) async {
    final confirm = await _showConfirmationDialog(
      title: "Konfirmasi Hapus",
      message: "Apakah Anda yakin ingin menghapus riwayat untuk pakan \"$feedName\"?",
    );

    if (confirm) {
      try {
        final response = await _stockController.deleteFeedStockHistory(id);
        if (!mounted) return;
        if (response['success']) {
          _showSnackBar(response['message']);
          _fetchHistory();
        } else {
          _showSnackBar(response['message'], isError: true);
        }
      } catch (e) {
        if (!mounted) return;
        _showSnackBar('Error saat menghapus riwayat: $e', isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text(
          'Riwayat Stok Pakan',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade600,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: _isLoading || _isFeedLoading
                ? Center(child: CircularProgressIndicator(color: Colors.teal.shade600))
                : _errorMessage != null
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Text(
                            _errorMessage!,
                            style: const TextStyle(color: Colors.red, fontSize: 16),
                            textAlign: TextAlign.center,
                          ),
                        ),
                      )
                    : _filteredHistoryList.isEmpty
                        ? Center(
                            child: Text(
                              'Tidak ada riwayat ditemukan',
                              style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _fetchHistory,
                            color: Colors.teal.shade600,
                            child: ListView.builder(
                              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                              itemCount: _filteredHistoryList.length,
                              itemBuilder: (context, index) {
                                final history = _filteredHistoryList[index];
                                return _buildHistoryCard(history);
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Cari riwayat...',
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
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade600, width: 2),
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

  Widget _buildHistoryCard(FeedStockHistoryModel history) {
    // Helper method to safely format the date
    String formatDate(String dateString) {
      try {
        final date = DateTime.parse(dateString);
        return DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(date);
      } catch (e) {
        print('FeedStockHistory - Error formatting date: $dateString, Error: $e');
        return 'Tanggal Tidak Valid';
      }
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Card(
        elevation: 5,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(15),
            gradient: LinearGradient(
              colors: [Colors.teal.shade50, Colors.white],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.teal.withOpacity(0.2),
                blurRadius: 10,
                offset: const Offset(0, 4),
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
                      child: Icon(Icons.history, color: Colors.teal.shade800, size: 24),
                      radius: 24,
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            history.feedName,
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.teal.shade800,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            history.keterangan,
                            style: TextStyle(
                              fontSize: 16,
                              color: Colors.black87,
                              height: 1.3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.delete, color: Colors.red.shade600, size: 28),
                      onPressed: () => _deleteHistory(history.id, history.feedName),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Wrap(
                  spacing: 12,
                  runSpacing: 8,
                  children: [
                    _buildChip(
                      Icons.calendar_today,
                      history.createdAt.isNotEmpty
                          ? 'Tanggal: ${formatDate(history.createdAt)}'
                          : 'Tanggal: Tidak Tersedia',
                    ),
                    _buildChip(Icons.person, 'Pengguna: ${history.userId}'), // Use userName from model
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.teal.shade50.withOpacity(0.8),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.teal.shade200, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.teal.shade700),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(fontSize: 14, color: Colors.teal.shade800),
          ),
        ],
      ),
    );
  }
}