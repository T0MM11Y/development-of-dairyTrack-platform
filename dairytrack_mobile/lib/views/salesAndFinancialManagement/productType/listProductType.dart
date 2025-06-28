import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/statisticCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/productTypeCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productType/createProductTypeBottomSheet.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productType/editProductTypeBottomSheet.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productType/deleteProductTypeModal.dart';

class ListProductTypes extends StatefulWidget {
  const ListProductTypes({super.key});

  @override
  _ListProductTypesState createState() => _ListProductTypesState();
}

class _ListProductTypesState extends State<ListProductTypes> {
  String _searchQuery = '';
  int? _userRoleId;

  @override
  void initState() {
    super.initState();
    _fetchUserRole();
  }

  Future<void> _fetchUserRole() async {
    try {
      final userData = await AuthUtils.getUser();
      setState(() {
        _userRoleId = userData['role_id'] ?? 0;
      });
    } catch (e) {
      // Handle error silently or show a snackbar if needed
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSupervisor = _userRoleId == 2;

    return ChangeNotifierProvider<ProductTypeProvider>(
      create: (_) => ProductTypeProvider()..fetchProductTypes(),
      child: Consumer<ProductTypeProvider>(
        builder: (context, provider, child) {
          final totalItems = provider.productTypes.length;

          // Function to open modals/bottom sheets with explicit provider
          void showCreateProductTypeModal() {
            if (isSupervisor) return; // Prevent action for supervisors
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              builder: (dialogContext) =>
                  ChangeNotifierProvider<ProductTypeProvider>.value(
                value: provider,
                child: const CreateProductTypeBottomSheet(),
              ),
            );
          }

          void showEditProductTypeModal(ProdukType product) {
            if (isSupervisor) return; // Prevent action for supervisors
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              builder: (dialogContext) =>
                  ChangeNotifierProvider<ProductTypeProvider>.value(
                value: provider,
                child: EditProductTypeBottomSheet(product: product),
              ),
            );
          }

          void showDeleteProductTypeModal(ProdukType product) {
            if (isSupervisor) return; // Prevent action for supervisors
            showDialog(
              // Changed back to showDialog
              context: context,
              builder: (dialogContext) =>
                  ChangeNotifierProvider<ProductTypeProvider>.value(
                value: provider,
                child: DeleteProductTypeModal(product: product),
              ),
            );
          }

          // Rest of the code remains unchanged
          return Scaffold(
            appBar: AppBar(
              title: const Text(
                'Product Types',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              backgroundColor: Colors.blueGrey[700],
              actions: [
                IconButton(
                  icon: const Icon(Icons.refresh, color: Colors.white),
                  onPressed: provider.fetchProductTypes,
                  tooltip: 'Refresh Data',
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
                          child: const Text('Try Again'),
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
                              hintText: 'Search by Product Name...',
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
                          label: 'Total Product Types',
                        ),
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
                                        'No product types found',
                                        style: TextStyle(
                                          fontSize: 18,
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'Click the + button to add a product type',
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
                                              onEdit: isSupervisor
                                                  ? null
                                                  : () =>
                                                      showEditProductTypeModal(
                                                          product),
                                              onDelete: isSupervisor
                                                  ? null
                                                  : () =>
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
            floatingActionButton: Tooltip(
              message: isSupervisor
                  ? 'Supervisors cannot create product types'
                  : 'Add New Product Type',
              child: FloatingActionButton(
                onPressed: isSupervisor ? null : showCreateProductTypeModal,
                backgroundColor:
                    isSupervisor ? Colors.grey[400] : Colors.blueGrey[800],
                child: const Icon(Icons.add, color: Colors.white),
              ),
            ),
          );
        },
      ),
    );
  }
}
