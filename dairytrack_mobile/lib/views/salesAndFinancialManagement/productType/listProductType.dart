import 'package:dairytrack_mobile/views/GuestView/BlogGuestsView.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/statisticCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/productTypeCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productType/createProductTypeModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productType/editProductTypeModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productType/deleteProductTypeModal.dart';
import 'package:dairytrack_mobile/views/initialAdminDashboard.dart';

class ListProductTypes extends StatefulWidget {
  const ListProductTypes({super.key});

  @override
  _ListProductTypesState createState() => _ListProductTypesState();
}

class _ListProductTypesState extends State<ListProductTypes> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<ProductTypeProvider>(
      create: (_) => ProductTypeProvider()..fetchProductTypes(),
      child: Consumer<ProductTypeProvider>(
        builder: (context, provider, child) {
          final totalItems = provider.productTypes.length;

          // Fungsi untuk membuka modal dengan menyediakan provider secara eksplisit
          void showCreateProductTypeModal() {
            showDialog(
              context: context,
              builder: (dialogContext) =>
                  ChangeNotifierProvider<ProductTypeProvider>.value(
                value: provider, // Gunakan instance provider yang sudah ada
                child: const CreateProductTypeModal(),
              ),
            );
          }

          void showEditProductTypeModal(ProdukType product) {
            showDialog(
              context: context,
              builder: (dialogContext) =>
                  ChangeNotifierProvider<ProductTypeProvider>.value(
                value: provider,
                child: EditProductTypeModal(product: product),
              ),
            );
          }

          void showDeleteProductTypeModal(ProdukType product) {
            showDialog(
              context: context,
              builder: (dialogContext) =>
                  ChangeNotifierProvider<ProductTypeProvider>.value(
                value: provider,
                child: DeleteProductTypeModal(product: product),
              ),
            );
          }

          return Scaffold(
            appBar: AppBar(
              title: const Text(
                'Data Jenis Produk',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              backgroundColor: AppColors.mediumGray,
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.white),
                  onPressed: provider.fetchProductTypes,
                  tooltip: 'Refresh',
                ),
              ],
            ),
            body: Stack(
              children: [
                if (provider.isLoading)
                  const Center(child: CircularProgressIndicator())
                else if (provider.errorMessage.isNotEmpty)
                  Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          provider.errorMessage,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.red),
                        ),
                        TextButton(
                          onPressed: provider.fetchProductTypes,
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  )
                else
                  RefreshIndicator(
                    onRefresh: provider.fetchProductTypes,
                    child: Column(
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: TextField(
                            decoration: InputDecoration(
                              hintText: 'Cari berdasarkan Nama Produk...',
                              prefixIcon: const Icon(Icons.search),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide:
                                    BorderSide(color: Colors.grey[300]!),
                              ),
                              filled: true,
                              fillColor: Colors.grey[100],
                              contentPadding:
                                  const EdgeInsets.symmetric(vertical: 0),
                              suffixIcon: _searchQuery.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear),
                                      onPressed: () {
                                        setState(() {
                                          _searchQuery = '';
                                          provider.setSearchQuery('');
                                        });
                                      },
                                    )
                                  : null,
                            ),
                            onChanged: (value) {
                              setState(() {
                                _searchQuery = value;
                                provider.setSearchQuery(value);
                              });
                            },
                          ),
                        ),
                        StatisticsCard(
                            totalCount: totalItems,
                            label: 'Sum Of Product Types'),
                        Expanded(
                          child: provider.productTypes.isEmpty
                              ? Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(
                                        Icons.inventory_2_outlined,
                                        size: 64,
                                        color: Colors.grey[400],
                                      ),
                                      const SizedBox(height: 16),
                                      Text(
                                        'Tidak ada jenis produk ditemukan',
                                        style: TextStyle(
                                          fontSize: 18,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Klik tombol + untuk menambah jenis produk',
                                        style:
                                            TextStyle(color: Colors.grey[500]),
                                      ),
                                    ],
                                  ),
                                )
                              : ListView(
                                  children: [
                                    ...provider.productTypes
                                        .map((product) => ProductTypeCard(
                                              productType: product,
                                              provider: provider,
                                              onEdit: () =>
                                                  showEditProductTypeModal(
                                                      product),
                                              onDelete: () =>
                                                  showDeleteProductTypeModal(
                                                      product),
                                            ))
                                        .toList(),
                                    const SizedBox(height: 80),
                                  ],
                                ),
                        ),
                      ],
                    ),
                  ),
              ],
            ),
            floatingActionButton: FloatingActionButton(
              onPressed: showCreateProductTypeModal,
              backgroundColor: Colors.blueGrey[800],
              child: const Icon(Icons.add, color: Colors.white),
            ),
          );
        },
      ),
    );
  }
}
