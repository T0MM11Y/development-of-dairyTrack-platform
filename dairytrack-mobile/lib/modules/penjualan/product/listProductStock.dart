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
  String? _selectedStatus; // null untuk "Semua"
  String? _selectedProductType; // null untuk "Semua"
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
        final matchesStatus =
            _selectedStatus == null || stock.status == _selectedStatus;
        final matchesProductType = _selectedProductType == null ||
            stock.productTypeDetail.productName == _selectedProductType;
        return matchesSearchQuery && matchesStatus && matchesProductType;
      }).toList();
    } catch (e) {
      print('Error fetching product stocks: $e');
      throw Exception('Failed to fetch product stocks: $e');
    }
  }

  Future<List<String>> _fetchProductTypes() async {
    try {
      final productStocks = await getProductStocks();
      return productStocks
          .map((stock) => stock.productTypeDetail.productName)
          .toSet()
          .toList();
    } catch (e) {
      print('Error fetching product types: $e');
      return [];
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
                child: Column(
                  children: [
                    TextFormField(
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
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String?>(
                      value: _selectedStatus,
                      decoration: const InputDecoration(
                        labelText: 'Filter Status',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.filter_list),
                      ),
                      items: [
                        const DropdownMenuItem<String?>(
                          value: null,
                          child: Text('Semua'),
                        ),
                        ...['available', 'expired', 'contamination']
                            .map((String status) {
                          return DropdownMenuItem<String>(
                            value: status,
                            child: Text(status),
                          );
                        }).toList(),
                      ],
                      onChanged: (String? newValue) {
                        setState(() {
                          _selectedStatus = newValue;
                        });
                      },
                    ),
                    const SizedBox(height: 16),
                    FutureBuilder<List<String>>(
                      future: _fetchProductTypes(),
                      builder: (context, snapshot) {
                        if (snapshot.connectionState ==
                            ConnectionState.waiting) {
                          return const CircularProgressIndicator();
                        } else if (snapshot.hasError) {
                          return const Text('Gagal memuat tipe produk');
                        } else if (!snapshot.hasData ||
                            snapshot.data!.isEmpty) {
                          return const Text('Tidak ada tipe produk ditemukan');
                        }

                        final productTypes = snapshot.data!;
                        return DropdownButtonFormField<String?>(
                          value: _selectedProductType,
                          decoration: const InputDecoration(
                            labelText: 'Filter Tipe Produk',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.category),
                          ),
                          items: [
                            const DropdownMenuItem<String?>(
                              value: null,
                              child: Text('Semua'),
                            ),
                            ...productTypes.map((String type) {
                              return DropdownMenuItem<String>(
                                value: type,
                                child: Text(type),
                              );
                            }).toList(),
                          ],
                          onChanged: (String? newValue) {
                            setState(() {
                              _selectedProductType = newValue;
                            });
                          },
                        );
                      },
                    ),
                  ],
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
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Remaining Stock',
                                        style: TextStyle(
                                          fontWeight: FontWeight.normal,
                                          fontSize: 16,
                                        ),
                                      ),
                                      Text(
                                        '${stock.quantity} Liters',
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 17,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    stock.status,
                                    style: TextStyle(
                                      color: stock.status == 'available'
                                          ? Colors.green
                                          : Colors.grey[600],
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  SizedBox(
                                    width: 100,
                                    height: 100,
                                    child: Center(
                                      child: stock.productTypeDetail.image
                                              .isNotEmpty
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
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        const SizedBox(height: 10),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            const Text(
                                              'Type: ',
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold),
                                            ),
                                            Expanded(
                                              child: Text(
                                                stock.productTypeDetail
                                                    .productName,
                                                style: TextStyle(
                                                    color: Colors.grey[600]),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const Divider(
                                            height: 16,
                                            thickness: 1,
                                            color: Colors.grey),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            const Text(
                                              'Production: ',
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold),
                                            ),
                                            Expanded(
                                              child: Text(
                                                DateFormat('dd MMM yyyy')
                                                    .format(stock.productionAt),
                                                style: TextStyle(
                                                    color: Colors.grey[600]),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                        const Divider(
                                            height: 16,
                                            thickness: 1,
                                            color: Colors.grey),
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            const Text(
                                              'Expired: ',
                                              style: TextStyle(
                                                  fontWeight: FontWeight.bold),
                                            ),
                                            Expanded(
                                              child: Text(
                                                DateFormat('dd MMM yyyy')
                                                    .format(stock.expiryAt),
                                                style: TextStyle(
                                                    color: Colors.grey[600]),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.end,
                                children: [
                                  ElevatedButton(
                                    onPressed: () {
                                      Navigator.pushNamed(
                                        context,
                                        '/edit-product-stock',
                                        arguments: stock,
                                      ).then((result) {
                                        if (result == true) {
                                          _refreshData();
                                        }
                                      });
                                    },
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: Colors.yellow,
                                      foregroundColor: Colors.black,
                                    ),
                                    child: const Text('Edit'),
                                  ),
                                  const SizedBox(width: 15),
                                  isDeleting
                                      ? const SizedBox(
                                          width: 24,
                                          height: 24,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : ElevatedButton(
                                          onPressed: () => _deleteProductStock(
                                              stock.id,
                                              stock.productTypeDetail
                                                  .productName),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.red,
                                            foregroundColor: Colors.white,
                                          ),
                                          child: const Text('Delete'),
                                        ),
                                ],
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
