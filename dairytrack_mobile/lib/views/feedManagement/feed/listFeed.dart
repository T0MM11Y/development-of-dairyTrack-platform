import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedController.dart';
import 'package:dairytrack_mobile/controller/APIURL4/nutritionController.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedTypeController.dart';
import '../model/feed.dart';
import '../model/feedType.dart';
import '../model/nutrition.dart';
import './addFeed.dart';
import './editFeed.dart';

class FeedView extends StatefulWidget {
  const FeedView({super.key});

  @override
  _FeedViewState createState() => _FeedViewState();
}

class _FeedViewState extends State<FeedView> {
  final FeedManagementController _feedController = FeedManagementController();
  final NutrisiManagementController _nutrisiController =
      NutrisiManagementController();
  final FeedTypeManagementController _feedTypeController =
      FeedTypeManagementController();
  List<Feed> _feedList = [];
  List<Feed> _filteredFeedList = [];
  List<FeedType> _feedTypes = [];
  List<Nutrisi> _nutrisiList = [];
  bool _isLoading = true;
  String _errorMessage = '';
  String _searchQuery = '';
  final int _userId = 1; // Replace with actual user ID

  @override
  void initState() {
    super.initState();
    _fetchAllData();
  }

  Future<void> _fetchAllData() async {
    setState(() => _isLoading = true);
    try {
      await Future.wait([
        _fetchFeedTypes(),
        _fetchNutrisi(),
        _fetchFeeds(),
      ]);
      if (!mounted) return;
      setState(() => _isLoading = false);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching data: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchFeedTypes() async {
    try {
      final response = await _feedTypeController.getAllFeedTypes();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _feedTypes = (response['data'] as List)
              .map((json) => FeedType.fromJson(json))
              .toList();
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch feed types';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching feed types: $e';
      });
    }
  }

  Future<void> _fetchNutrisi() async {
    try {
      final response = await _nutrisiController.getAllNutrisi();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _nutrisiList = (response['data'] as List)
              .map((json) => Nutrisi.fromJson(json))
              .toList();
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch nutrisi';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching nutrisi: $e';
      });
    }
  }

  Future<void> _fetchFeeds() async {
    try {
      final response = await _feedController.getAllFeeds();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _feedList = (response['data'] as List)
              .map((json) => Feed.fromJson(json))
              .toList();
          _applyFilters();
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch feeds';
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching feeds: $e';
      });
    }
  }

  void _applyFilters() {
    setState(() {
      _filteredFeedList = _feedList
          .where((feed) =>
              feed.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              feed.typeName.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    });
  }

  Future<bool> _showSweetAlert({
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
                          "Cancel",
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
                          isDelete ? "Delete" : "Confirm",
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ) ??
        false;
  }

  Future<void> _deleteFeed(int feedId) async {
    final confirm = await _showSweetAlert(
      title: "Hapus Pakan",
      message: "Apakah Anda yakin ingin menghapus pakan ini?",
      isDelete: true,
    );

    if (!confirm) return;

    setState(() => _isLoading = true);
    try {
      final response = await _feedController.deleteFeed(feedId);
      if (!mounted) return;
      if (response['success']) {
        _showSnackBar(response['message'] ?? 'Pakan berhasil dihapus');
        await _fetchFeeds();
      } else {
        _showSnackBar(response['message'] ?? 'Gagal menghapus pakan');
      }
    } catch (e) {
      if (!mounted) return;
      _showSnackBar('Error menghapus pakan: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.teal.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 6,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _addFeed() {
    if (_feedTypes.isEmpty || _nutrisiList.isEmpty) {
      _showSnackBar('Jenis pakan atau nutrisi belum dimuat.');
      return;
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (context) => AddFeedForm(
        feedTypes: _feedTypes,
        nutrisiList: _nutrisiList,
        controller: _feedController,
        userId: _userId,
        onAdd: () {
          _fetchFeeds();
          _showSnackBar('Pakan berhasil ditambahkan');
        },
        onError: (message) {
          _showSnackBar(message);
        },
      ),
    );
  }

  void _editFeed(Feed feed) {
    if (_feedTypes.isEmpty || _nutrisiList.isEmpty) {
      _showSnackBar('Jenis pakan atau nutrisi belum dimuat.');
      return;
    }
    if (feed == null || feed.id == null) {
      _showSnackBar('Data pakan tidak valid.');
      return;
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => EditFeedForm(
        feed: feed,
        feedTypes: _feedTypes,
        nutrisiList: _nutrisiList,
        controller: _feedController,
        userId: _userId,
        onUpdate: () {
          _fetchFeeds();
          _showSnackBar('Pakan berhasil diperbarui');
        },
        onError: (message) {
          _showSnackBar(message);
        },
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Cari pakan...',
          prefixIcon: const Icon(Icons.search, color: Colors.teal),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Colors.grey),
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
          contentPadding:
              const EdgeInsets.symmetric(vertical: 0, horizontal: 20),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade100),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade400),
          ),
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

  Widget _buildFeedCard(Feed feed) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Card(
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.teal.shade100,
                    child: Icon(Icons.local_dining,
                        color: Colors.teal.shade800, size: 24),
                    radius: 22,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          feed.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Jenis: ${feed.typeName}',
                          style:
                              TextStyle(fontSize: 14, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.edit,
                            color: Colors.teal, size: 24),
                        onPressed: () => _editFeed(feed),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete,
                            color: Colors.red, size: 24),
                        onPressed: () => _deleteFeed(feed.id),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildInfoChip(
                      icon: Icons.scale, label: 'Unit: ${feed.unit}'),
                  _buildInfoChip(
                      icon: Icons.storage,
                      label: 'Min Stok: ${formatNumber(feed.minStock)}'),
                ],
              ),
              const SizedBox(height: 8),
              _buildInfoChip(
                  icon: Icons.monetization_on, label: formatPrice(feed.price)),
              const SizedBox(height: 12),
              Text(
                'Nutrisi:',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.teal.shade800,
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: feed.nutrisiList.isEmpty
                    ? [
                        Text(
                          'Tidak ada nutrisi',
                          style:
                              TextStyle(color: Colors.grey[600], fontSize: 14),
                        ),
                      ]
                    : feed.nutrisiList.map((nutrisi) {
                        return Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.teal.shade50,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.teal.shade100),
                          ),
                          child: Text(
                            '${nutrisi['name']}: ${formatNumber(nutrisi['amount'])} ${nutrisi['unit']}',
                            style: const TextStyle(
                                fontSize: 13, color: Colors.black87),
                          ),
                        );
                      }).toList(),
              ),
              const SizedBox(height: 8),
              Text(
                feed.createdAt.isNotEmpty
                    ? 'Dibuat: ${DateFormat('dd MMM yyyy').format(DateTime.parse(feed.createdAt))}'
                    : 'Dibuat: N/A',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.teal.shade50,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.teal.shade800),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 13, color: Colors.teal.shade800),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          "Manajemen Pakan",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade600,
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Text(_errorMessage,
                      style: const TextStyle(color: Colors.red)))
              : RefreshIndicator(
                  onRefresh: _fetchAllData,
                  child: Column(
                    children: [
                      _buildSearchBar(),
                      Expanded(
                        child: _filteredFeedList.isEmpty
                            ? const Center(
                                child: Text("Tidak ada pakan ditemukan"))
                            : ListView.builder(
                                padding:
                                    const EdgeInsets.symmetric(vertical: 10),
                                itemCount: _filteredFeedList.length,
                                itemBuilder: (context, index) {
                                  final feed = _filteredFeedList[index];
                                  return _buildFeedCard(feed);
                                },
                              ),
                      ),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addFeed,
        child: const Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.teal.shade600,
        elevation: 6,
      ),
    );
  }
}
