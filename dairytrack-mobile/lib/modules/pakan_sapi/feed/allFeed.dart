import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedNutrition.dart';
import 'package:dairy_track/modules/pakan_sapi/feed/addFeed.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllFeeds extends StatefulWidget {
  const AllFeeds({super.key});

  @override
  _AllFeedsState createState() => _AllFeedsState();
}

class _AllFeedsState extends State<AllFeeds> {
  Future<List<Feed>>? _feedsFuture;
  String? searchQuery;
  DateTime? selectedCreatedDate;
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();

  @override
  void initState() {
    super.initState();
    _feedsFuture = fetchFeeds();
  }

  Future<List<Feed>> fetchFeeds() async {
    try {
      final feeds = await getAllFeeds(name: searchQuery);
      return feeds.where((feed) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            feed.name.toLowerCase().contains(searchQuery!.toLowerCase());
        final matchesCreatedDate = selectedCreatedDate == null ||
            (DateFormat('yyyy-MM-dd').format(feed.createdAt) ==
                DateFormat('yyyy-MM-dd').format(selectedCreatedDate!));
        return matchesSearchQuery && matchesCreatedDate;
      }).toList();
    } catch (e) {
      throw Exception('Failed to fetch feeds: $e');
    }
  }

  Future<void> _refreshData() async {
    setState(() {
      _feedsFuture = fetchFeeds();
    });
  }

  Future<void> _exportToPDF() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Export to PDF feature coming soon')),
    );
  }

  Future<void> _exportToExcel() async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Export to Excel feature coming soon')),
    );
  }

  void _clearFilters() {
    setState(() {
      searchQuery = null;
      selectedCreatedDate = null;
      _feedsFuture = fetchFeeds();
    });
  }

  String _formatNumber(dynamic num) {
    if (num == null) return 'N/A';
    return NumberFormat.decimalPattern('id_ID').format(num).split(',')[0];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Pakan'),
        backgroundColor: const Color(0xFF5D90E7),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshData,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: _refreshData,
        child: Column(
          children: [
            _buildSearchFilterCard(),
            Expanded(
              child: FutureBuilder<List<Feed>>(
                future: _feedsFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline, size: 60, color: Colors.red),
                          const SizedBox(height: 16),
                          Text(
                            'Error: ${snapshot.error}',
                            style: const TextStyle(fontSize: 16),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _refreshData,
                            child: const Text('Coba Lagi'),
                          ),
                        ],
                      ),
                    );
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.no_food, size: 60, color: Colors.grey),
                          const SizedBox(height: 16),
                          const Text(
                            'Tidak ada data pakan ditemukan',
                            style: TextStyle(fontSize: 16),
                          ),
                          if (searchQuery != null || selectedCreatedDate != null)
                            TextButton(
                              onPressed: _clearFilters,
                              child: const Text('Hapus Filter'),
                            ),
                        ],
                      ),
                    );
                  }
                  final feeds = snapshot.data!;
                  return _buildFeedsList(feeds);
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const AddFeedPage()),
          ).then((result) {
            if (result == true) {
              _refreshData();
            }
          });
        },
        backgroundColor: const Color(0xFF1565C0),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildSearchFilterCard() {
    return Card(
      margin: const EdgeInsets.all(8),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    decoration: const InputDecoration(
                      labelText: 'Cari berdasarkan Nama',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.search),
                      contentPadding: EdgeInsets.symmetric(horizontal: 12),
                    ),
                    onChanged: (value) {
                      setState(() {
                        searchQuery = value.trim();
                        _feedsFuture = fetchFeeds();
                      });
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: InkWell(
                    onTap: () async {
                      final pickedDate = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(2000),
                        lastDate: DateTime(2100),
                      );
                      if (pickedDate != null) {
                        setState(() {
                          selectedCreatedDate = pickedDate;
                          _feedsFuture = fetchFeeds();
                        });
                      }
                    },
                    child: InputDecorator(
                      decoration: const InputDecoration(
                        labelText: 'Filter berdasarkan Tanggal',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 16,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            selectedCreatedDate == null
                                ? 'Pilih Tanggal'
                                : DateFormat('dd MMM yyyy').format(selectedCreatedDate!),
                          ),
                          const Icon(Icons.calendar_today, size: 20),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _refreshData,
                    icon: const Icon(Icons.search, size: 20),
                    label: const Text('Cari'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: _exportToPDF,
                  icon: const Icon(Icons.picture_as_pdf, size: 20),
                  label: const Text('PDF'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueGrey,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: _exportToExcel,
                  icon: const Icon(Icons.table_chart, size: 20),
                  label: const Text('Excel'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedsList(List<Feed> feeds) {
    return ListView.builder(
      itemCount: feeds.length,
      padding: const EdgeInsets.only(bottom: 80),
      itemBuilder: (context, index) {
        final feed = feeds[index];
        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          elevation: 3,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        feed.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 18,
                          color: Color(0xFF2196F3),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.blue),
                          onPressed: () {
                            Navigator.pushNamed(
                              context,
                              '/edit-pakan',
                              arguments: feed,
                            ).then((result) {
                              if (result == true) {
                                _refreshData();
                              }
                            });
                          },
                          tooltip: 'Edit',
                        ),
                        IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () => _showDeleteConfirmation(feed),
                          tooltip: 'Hapus',
                        ),
                      ],
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 8),
                _buildInfoRow('ID', '${feed.id}'),
                _buildInfoRow('Jenis', feed.feedType?.name ?? 'N/A'),
                _buildInfoRow('Stok Minimum', _formatNumber(feed.minStock)),
                _buildInfoRow(
                  'Harga',
                  'Rp ${_formatNumber(feed.price)}',
                ),
                _buildInfoRow(
                  'Dibuat',
                  DateFormat('dd MMM yyyy').format(feed.createdAt),
                ),
                _buildInfoRow(
                  'Diperbarui',
                  DateFormat('dd MMM yyyy').format(feed.updatedAt),
                ),
                _buildNutritionInfo(feed.feedNutrisiRecords),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                color: Colors.black87,
              ),
            ),
          ),
          const Text(': '),
          Expanded(
            child: Text(
              value,
              style: TextStyle(color: Colors.grey[700]),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNutritionInfo(List<FeedNutrisi>? nutrisiRecords) {
    if (nutrisiRecords == null || nutrisiRecords.isEmpty) {
      return _buildInfoRow('Nutrisi', 'Tidak ada data nutrisi');
    }
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Nutrisi:',
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: nutrisiRecords.map((record) {
              return Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  children: [
                    Text(
                      record.nutrisi?.name ?? 'Unknown',
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    Text(
                      '${_formatNumber(record.amount)} ${record.nutrisi?.unit ?? ''}',
                      style: TextStyle(color: Colors.grey[600], fontSize: 12),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Future<void> _showDeleteConfirmation(Feed feed) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Pakan'),
        content: Text('Anda yakin ingin menghapus "${feed.name}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Hapus',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await deleteFeed(feed.id!);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pakan berhasil dihapus')),
        );
        _refreshData();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menghapus: $e')),
        );
      }
    }
  }
}