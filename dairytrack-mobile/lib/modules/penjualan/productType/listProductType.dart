import 'package:dairy_track/config/api/penjualan/productType.dart';
import 'package:dairy_track/model/penjualan/productType.dart';
import 'package:flutter/material.dart';

class ListProductTypes extends StatefulWidget {
  const ListProductTypes({super.key});

  @override
  _ListProductTypesState createState() => _ListProductTypesState();
}

class _ListProductTypesState extends State<ListProductTypes> {
  String? searchQuery;
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();
  int? _deletingId; // Menyimpan ID item yang sedang dihapus

  Future<List<ProdukType>> fetchProductTypes() async {
    try {
      final productTypes = await getProductTypes();
      return productTypes.where((productType) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            productType.productName
                .toLowerCase()
                .contains(searchQuery!.toLowerCase());
        return matchesSearchQuery;
      }).toList();
    } catch (e) {
      throw Exception('Failed to fetch product types: $e');
    }
  }

  Future<void> _refreshData() async {
    setState(() {
      // Trigger rebuild with fresh data
    });
    return Future.value();
  }

  Future<void> _deleteProductType(int id, String productName) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Hapus Jenis Produk'),
        content: Text('Anda yakin ingin menghapus "$productName"?'),
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
        _deletingId = id; // Tandai item yang sedang dihapus
      });

      try {
        await deleteProductType(id);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Jenis produk berhasil dihapus')),
        );
        await _refreshData();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menghapus: $e')),
        );
      } finally {
        setState(() {
          _deletingId = null; // Reset status loading
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Jenis Produk'),
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
              child: FutureBuilder<List<ProdukType>>(
                future: fetchProductTypes(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(
                        child: Text('Tidak ada jenis produk ditemukan.'));
                  }

                  final productTypes = snapshot.data!;
                  return ListView.builder(
                    itemCount: productTypes.length,
                    itemBuilder: (context, index) {
                      final productType = productTypes[index];
                      final isDeleting = _deletingId == productType.id;

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
                              // Gambar produk
                              SizedBox(
                                width: 100,
                                height: 100,
                                child: Center(
                                  child: productType.image.isNotEmpty
                                      ? Image.network(
                                          productType.image,
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
                              // Informasi produk
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
                                            productType.productName,
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
                                                  '/edit-product-type',
                                                  arguments: productType,
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
                                                        _deleteProductType(
                                                            productType.id,
                                                            productType
                                                                .productName),
                                                    tooltip: 'Hapus',
                                                  ),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Deskripsi: ${productType.productDescription}',
                                      style: TextStyle(color: Colors.grey[600]),
                                      overflow: TextOverflow.ellipsis,
                                      maxLines: 2,
                                    ),
                                    Text(
                                      'Harga: Rp ${productType.price}',
                                      style: TextStyle(color: Colors.grey[600]),
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    Text(
                                      'Satuan: ${productType.unit}',
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
            '/create-product-type',
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
