import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/modules/pakan_sapi/feed/addFeed.dart'; // Import the add page
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllFeeds extends StatefulWidget {
  const AllFeeds({super.key});

  @override
  _AllFeedsState createState() => _AllFeedsState();
}

class _AllFeedsState extends State<AllFeeds> {
  String? searchQuery;
  DateTime? selectedCreatedDate;
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();

  Future<List<Feed>> fetchFeeds() async {
    try {
      final feeds = await getFeeds();
      return feeds.where((feed) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            feed.name.toLowerCase().contains(searchQuery!.toLowerCase());

        final matchesCreatedDate = selectedCreatedDate == null ||
            (feed.createdAt != null &&
                DateFormat('yyyy-MM-dd').format(feed.createdAt!) ==
                    DateFormat('yyyy-MM-dd').format(selectedCreatedDate!));

        return matchesSearchQuery && matchesCreatedDate;
      }).toList();
    } catch (e) {
      throw Exception('Failed to fetch feeds: $e');
    }
  }

  Future<void> _refreshData() async {
    setState(() {
      // This will trigger a rebuild with fresh data
    });
    return Future.value();
  }

  Future<void> _exportToPDF() async {
    // TODO: Implement PDF export
  }

  Future<void> _exportToExcel() async {
    // TODO: Implement Excel export
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: _refreshData,
        child: Column(
          children: [
            Card(
              margin: const EdgeInsets.all(8),
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
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
                              contentPadding:
                                  EdgeInsets.symmetric(horizontal: 12),
                            ),
                            onChanged: (value) {
                              setState(() {
                                searchQuery = value.trim();
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
                                });
                              }
                            },
                            child: InputDecorator(
                              decoration: const InputDecoration(
                                labelText: 'Filter berdasarkan Tanggal Dibuat',
                                border: OutlineInputBorder(),
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 16,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    selectedCreatedDate == null
                                        ? 'Pilih Tanggal'
                                        : DateFormat('dd MMM yyyy')
                                            .format(selectedCreatedDate!),
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
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        SizedBox(
                          width: 100,
                          child: ElevatedButton.icon(
                            onPressed: _exportToPDF,
                            icon: const Icon(Icons.picture_as_pdf, size: 20),
                            label: const Text('PDF'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blueGrey,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 5),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          width: 100,
                          child: ElevatedButton.icon(
                            onPressed: _exportToExcel,
                            icon: const Icon(Icons.table_chart, size: 20),
                            label: const Text('Excel'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 5),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: _refreshData,
                            icon: const Icon(Icons.search, size: 20),
                            label: const Text('Cari'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 5),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: FutureBuilder<List<Feed>>(
                future: fetchFeeds(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(
                        child: Text('Tidak ada pakan ditemukan.'));
                  }

                  final feeds = snapshot.data!;
                  return ListView.builder(
                    itemCount: feeds.length,
                    itemBuilder: (context, index) {
                      final feed = feeds[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                            vertical: 8, horizontal: 16),
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
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
                                    feed.name,
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      fontSize: 18,
                                      color: Colors.blue,
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.edit,
                                            color: Colors.blue),
                                        onPressed: () {
                                          Navigator.pushNamed(
                                            context,
                                            '/edit-pakan',
                                            arguments: feed,
                                          ).then((result) {
                                            if (result == true) {
                                              // Trigger refresh when returning from edit page
                                              _refreshData();
                                            }
                                          });
                                        },
                                        tooltip: 'Edit',
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete,
                                            color: Colors.red),
                                        onPressed: () async {
                                          final confirm =
                                              await showDialog<bool>(
                                            context: context,
                                            builder: (context) => AlertDialog(
                                              title: const Text('Hapus Pakan'),
                                              content: Text(
                                                  'Anda yakin ingin menghapus "${feed.name}"?'),
                                              actions: [
                                                TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(
                                                          context, false),
                                                  child: const Text('Batal'),
                                                ),
                                                TextButton(
                                                  onPressed: () =>
                                                      Navigator.pop(
                                                          context, true),
                                                  child: const Text('Hapus',
                                                      style: TextStyle(
                                                          color: Colors.red)),
                                                ),
                                              ],
                                            ),
                                          );

                                          if (confirm == true) {
                                            try {
                                              await deleteFeed(feed.id);
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(
                                                const SnackBar(
                                                    content: Text(
                                                        'Pakan berhasil dihapus')),
                                              );
                                              _refreshData(); // Refresh after delete
                                            } catch (e) {
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(
                                                SnackBar(
                                                    content: Text(
                                                        'Gagal menghapus: $e')),
                                              );
                                            }
                                          }
                                        },
                                        tooltip: 'Hapus',
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'ID: ${feed.id}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Jenis: ${feed.feedType?.name ?? 'Unknown'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Protein: ${feed.protein != null ? feed.protein!.toInt() : 'N/A'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Energi: ${feed.energy != null ? feed.energy!.toInt() : 'N/A'} kcal',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Serat: ${feed.fiber != null ? feed.fiber!.toInt() : 'N/A'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Stok Minimum: ${feed.minStock ?? 'N/A'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Harga: Rp ${feed.price != null ? NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0).format(feed.price!) : 'N/A'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Dibuat: ${feed.createdAt != null ? DateFormat('dd MMM yyyy').format(feed.createdAt!) : 'N/A'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Terakhir Diperbarui: ${feed.updatedAt != null ? DateFormat('dd MMM yyyy').format(feed.updatedAt!) : 'N/A'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
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
              // Trigger refresh when returning from add page
              _refreshData();
            }
          });
        },
        backgroundColor: Colors.blue[700],
        child: const Icon(Icons.add),
      ),
    );
  }
}
