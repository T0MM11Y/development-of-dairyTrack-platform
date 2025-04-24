import 'package:dairy_track/config/api/penjualan/product.dart';
import 'package:dairy_track/model/penjualan/product.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ListProductStocks extends StatefulWidget {
  const ListProductStocks({super.key});

  @override
  _ListProductStocksState createState() => _ListProductStocksState();
}

class _ListProductStocksState extends State<ListProductStocks> {
  String? searchQuery;
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();
  int? _deletingId;

  Future<List<ProductStock>> fetchProductStocks() async {
    try {
      final productStocks = await getProductStocks();
      return productStocks.where((stock) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            stock.productTypeDetail.productName
                .toLowerCase()
                .contains(searchQuery!.toLowerCase());
        return matchesSearchQuery;
      }).toList();
    } catch (e) {
      throw Exception('Failed to fetch product stocks: $e');
    }
  }

  Future<void> _refreshData() async {
    setState(() {});
    return Future.value();
  }

  Future<void> _deleteProductStock(int id, String productName) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Stok Produk'),
        content: Text('Anda yakin ingin menghapus stok "$productName"?'),
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
      setState(() {
        _deletingId = id;
      });

      try {
        await deleteProductStock(id);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Stok produk berhasil dihapus')),
        );
        await _refreshData();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menghapus: $e')),
        );
      } finally {
        setState(() {
          _deletingId = null;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Stok Produk'),
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
                child: TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Cari berdasarkan Nama Produk',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.search),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12),
                  ),
                  onChanged: (value) {
                    setState(() {
                      searchQuery = value.trim();
                    });
                  },
                ),
              ),
            ),
            Expanded(
              child: FutureBuilder<List<ProductStock>>(
                future: fetchProductStocks(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(
                        child: Text('Tidak ada stok produk ditemukan.'));
                  }

                  final productStocks = snapshot.data!;
                  return ListView.builder(
                    itemCount: productStocks.length,
                    itemBuilder: (context, index) {
                      final stock = productStocks[index];
                      final isDeleting = _deletingId == stock.id;

                      return Card(
                        margin: const EdgeInsets.symmetric(
                            vertical: 8, horizontal: 16),
                        elevation: 4,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              SizedBox(
                                width: 100,
                                height: 100,
                                child: Center(
                                  child:
                                      stock.productTypeDetail.image.isNotEmpty
                                          ? Image.network(
                                              stock.productTypeDetail.image,
                                              fit: BoxFit.cover,
                                              loadingBuilder: (context, child,
                                                  loadingProgress) {
                                                if (loadingProgress == null)
                                                  return child;
                                                return const CircularProgressIndicator();
                                              },
                                              errorBuilder:
                                                  (context, error, stackTrace) {
                                                return const Icon(
                                                  Icons.broken_image,
                                                  size: 50,
                                                  color: Colors.grey,
                                                );
                                              },
                                            )
                                          : const Icon(
                                              Icons.image_not_supported,
                                              size: 50,
                                              color: Colors.grey,
                                            ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Flexible(
                                          child: Text(
                                            stock.productTypeDetail.productName,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 18,
                                              color: Colors.blue,
                                            ),
                                            overflow: TextOverflow.ellipsis,
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
                                                  '/edit-product-stock',
                                                ).then((result) {
                                                  if (result == true) {
                                                    _refreshData();
                                                  }
                                                });
                                              },
                                              tooltip: 'Edit',
                                            ),
                                            isDeleting
                                                ? const SizedBox(
                                                    width: 24,
                                                    height: 24,
                                                    child:
                                                        CircularProgressIndicator(
                                                      strokeWidth: 2,
                                                    ),
                                                  )
                                                : IconButton(
                                                    icon: const Icon(
                                                        Icons.delete,
                                                        color: Colors.red),
                                                    onPressed: () =>
                                                        _deleteProductStock(
                                                            stock.id,
                                                            stock
                                                                .productTypeDetail
                                                                .productName),
                                                    tooltip: 'Hapus',
                                                  ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Jumlah: ${stock.quantity} ${stock.productTypeDetail.unit}',
                                      style: TextStyle(color: Colors.grey[600]),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'Kadaluarsa: ${DateFormat('dd MMM yyyy').format(stock.expiryAt)}',
                                      style: TextStyle(color: Colors.grey[600]),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'Status: ${stock.status}',
                                      style: TextStyle(color: Colors.grey[600]),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ],
                                ),
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
          Navigator.pushNamed(
            context,
            '/create-product-stock',
          ).then((result) {
            if (result == true) {
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
