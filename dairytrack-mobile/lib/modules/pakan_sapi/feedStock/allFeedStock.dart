import 'package:dairy_track/config/api/pakan/feedStock.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllFeedStocks extends StatefulWidget {
  const AllFeedStocks({super.key});

  @override
  _AllFeedStocksState createState() => _AllFeedStocksState();
}

class _AllFeedStocksState extends State<AllFeedStocks> {
  String? searchQuery;
  DateTime? selectedCreatedDate;
  Future<List<FeedStock>>? _feedStocksFuture;
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();

  @override
  void initState() {
    super.initState();
    _refreshFeedStocks();
  }

  Future<List<FeedStock>> fetchFeedStocks() async {
    try {
      final feedStocks = await getAllFeedStocks();
      return feedStocks.where((feedStock) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            (feedStock.feed?.name ?? '')
                .toLowerCase()
                .contains(searchQuery!.toLowerCase());

        final matchesCreatedDate = selectedCreatedDate == null ||
            DateFormat('yyyy-MM-dd').format(feedStock.createdAt) ==
                DateFormat('yyyy-MM-dd').format(selectedCreatedDate!);

        return matchesSearchQuery && matchesCreatedDate;
      }).toList();
    } catch (e) {
      throw Exception('Gagal memuat stok pakan: $e');
    }
  }

  Future<void> _exportToPDF() async {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Fitur ekspor PDF belum diimplementasikan')),
      );
    }
  }

  Future<void> _exportToExcel() async {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Fitur ekspor Excel belum diimplementasikan')),
      );
    }
  }

  Future<void> _refreshFeedStocks() async {
    setState(() {
      _feedStocksFuture = fetchFeedStocks().catchError((error) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$error')),
          );
        }
        return <FeedStock>[]; // Return empty list on error
      });
    });
  }

  void _clearFilters() {
    setState(() {
      searchQuery = null;
      selectedCreatedDate = null;
      _refreshFeedStocks();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Stok Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _refreshFeedStocks,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: _refreshFeedStocks,
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
                              labelText: 'Cari berdasarkan Nama Pakan',
                              border: OutlineInputBorder(),
                              prefixIcon: Icon(Icons.search),
                              contentPadding:
                                  EdgeInsets.symmetric(horizontal: 12),
                            ),
                            onChanged: (value) {
                              setState(() {
                                searchQuery = value.trim();
                                _refreshFeedStocks();
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
                                  _refreshFeedStocks();
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
                            onPressed: _refreshFeedStocks,
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
                    if (searchQuery != null || selectedCreatedDate != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: TextButton(
                          onPressed: _clearFilters,
                          child: const Text('Hapus Filter'),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: FutureBuilder<List<FeedStock>>(
                future: _feedStocksFuture,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline,
                              size: 60, color: Colors.red),
                          const SizedBox(height: 16),
                          Text(
                            'Error: ${snapshot.error}',
                            style: const TextStyle(fontSize: 16),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: _refreshFeedStocks,
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
                          const Icon(Icons.no_food,
                              size: 60, color: Colors.grey),
                          const SizedBox(height: 16),
                          const Text(
                            'Tidak ada stok pakan ditemukan',
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

                  final feedStocks = snapshot.data!;
                  return ListView.builder(
                    itemCount: feedStocks.length,
                    itemBuilder: (context, index) {
                      final feedStock = feedStocks[index];
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
                              Text(
                                feedStock.feed?.name ?? 'Unknown',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: Colors.blue,
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Expanded(
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(
                                          horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.blue[100],
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            Icons.inventory_2,
                                            color: Colors.blue[800],
                                            size: 20,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            'Stok: ${feedStock.stock.toInt()} kg',
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16,
                                              color: Colors.blue[800],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  IconButton(
                                    icon: const Icon(Icons.edit,
                                        color: Colors.blue),
                                    onPressed: () {
                                      Navigator.pushNamed(
                                        context,
                                        '/edit-stok-pakan',
                                        arguments: feedStock,
                                      ).then((result) {
                                        if (result == true && mounted) {
                                          _refreshFeedStocks();
                                        }
                                      });
                                    },
                                    tooltip: 'Edit',
                                    style: IconButton.styleFrom(
                                      backgroundColor: Colors.blue[50],
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.add,
                                        color: Colors.green),
                                    onPressed: feedStock.feed != null
                                        ? () {
                                            Navigator.pushNamed(
                                              context,
                                              '/tambah-stok-pakan',
                                              arguments: feedStock.feed,
                                            ).then((result) {
                                              if (result == true && mounted) {
                                                _refreshFeedStocks();
                                              }
                                            });
                                          }
                                        : null,
                                    tooltip: 'Tambah Stok',
                                    style: IconButton.styleFrom(
                                      backgroundColor: Colors.green[50],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'ID: ${feedStock.id}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Pakan: ${feedStock.feed?.name ?? 'Unknown'}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Dibuat: ${DateFormat('dd MMM yyyy').format(feedStock.createdAt)}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Terakhir Diperbarui: ${DateFormat('dd MMM yyyy').format(feedStock.updatedAt)}',
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
          Navigator.pushNamed(context, '/tambah-stok-pakan').then((result) {
            if (result == true && mounted) {
              _refreshFeedStocks();
            }
          });
        },
        backgroundColor: Colors.blue[700],
        child: const Icon(Icons.add),
      ),
    );
  }
}