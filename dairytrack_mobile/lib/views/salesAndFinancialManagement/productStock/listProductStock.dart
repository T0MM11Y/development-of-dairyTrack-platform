import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/statisticCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/productStockCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStock/createProductStockBottomSheet.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStock/editProductStockBottomSheet.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStock/deleteProductStock.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/filterCard.dart';

class ListProductStock extends StatefulWidget {
  const ListProductStock({super.key});

  @override
  _ListProductStockState createState() => _ListProductStockState();
}

class _ListProductStockState extends State<ListProductStock> {
  String _searchQuery = '';
  int? _userRoleId;

  @override
  void initState() {
    super.initState();
    _fetchUserRole();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<StockProvider>(context, listen: false).fetchStocks();
    });
  }

  Future<void> _fetchUserRole() async {
    try {
      final userData = await AuthUtils.getUser();
      setState(() {
        _userRoleId = userData['role_id'] ?? 0;
      });
    } catch (e) {
      // Handle error silently
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSupervisor = _userRoleId == 2;

    return Consumer2<StockProvider, ProductTypeProvider>(
      builder: (context, stockProvider, productTypeProvider, child) {
        final filteredStocks = stockProvider.stocks.where((stock) {
          final matchesSearchQuery = stockProvider.searchQuery.isEmpty ||
              stock.productTypeDetail.productName
                  .toLowerCase()
                  .contains(stockProvider.searchQuery.toLowerCase());
          final matchesStatus = stockProvider.selectedStatus == null ||
              stock.status == stockProvider.selectedStatus;
          return matchesSearchQuery && matchesStatus;
        }).toList();
        final totalItems = filteredStocks.length;

        void showCreateStockBottomSheet() {
          if (isSupervisor) return;
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            builder: (dialogContext) =>
                ChangeNotifierProvider<StockProvider>.value(
              value: stockProvider,
              child: const CreateStockBottomSheet(),
            ),
          );
        }

        void showEditStockBottomSheet(Stock stock) {
          if (isSupervisor) return;
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            builder: (dialogContext) =>
                ChangeNotifierProvider<StockProvider>.value(
              value: stockProvider,
              child: EditStockBottomSheet(stock: stock),
            ),
          );
        }

        void showDeleteStockModal(Stock stock) {
          if (isSupervisor) return;
          showDialog(
            context: context,
            builder: (dialogContext) =>
                ChangeNotifierProvider<StockProvider>.value(
              value: stockProvider,
              child: DeleteStockModal(stock: stock),
            ),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text(
              'Product Stocks',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
            backgroundColor: const Color(0xFF2C3E50),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: stockProvider.fetchStocks,
                tooltip: 'Refresh',
              ),
            ],
          ),
          body: Stack(
            children: [
              if (stockProvider.isLoading)
                const Center(child: CircularProgressIndicator())
              else if (stockProvider.errorMessage.isNotEmpty)
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        stockProvider.errorMessage,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: Colors.red),
                      ),
                      TextButton(
                        onPressed: stockProvider.fetchStocks,
                        child: const Text('Try Again'),
                      ),
                    ],
                  ),
                )
              else
                RefreshIndicator(
                  onRefresh: stockProvider.fetchStocks,
                  child: Column(
                    children: [
                      FilterCard(
                        title: 'Filter Product Stocks',
                        searchHint: 'Search by Product Name...',
                        searchQuery: _searchQuery,
                        onSearchChanged: (value) {
                          setState(() {
                            _searchQuery = value;
                            stockProvider.setSearchQuery(value);
                          });
                        },
                        onClearSearch: () {
                          setState(() {
                            _searchQuery = '';
                            stockProvider.setSearchQuery('');
                          });
                        },
                        selectedStatus: stockProvider.selectedStatus,
                        statusOptions: [
                          {'value': 'available', 'display': 'Available'},
                          {'value': 'expired', 'display': 'Expired'},
                          {'value': 'contamination', 'display': 'Contaminated'},
                        ],
                        onStatusChanged: stockProvider.setSelectedStatus,
                      ),
                      StatisticsCard(
                          totalCount: totalItems,
                          label: 'Total Product Stocks'),
                      Expanded(
                        child: filteredStocks.isEmpty
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
                                      'No product stocks found',
                                      style: TextStyle(
                                        fontSize: 18,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Click the + button to add a product stock',
                                      style: TextStyle(color: Colors.grey[500]),
                                    ),
                                  ],
                                ),
                              )
                            : ListView(
                                children: [
                                  ...filteredStocks
                                      .map((stock) => StockCard(
                                            stock: stock,
                                            provider: stockProvider,
                                            onEdit: isSupervisor
                                                ? null
                                                : () =>
                                                    showEditStockBottomSheet(
                                                        stock),
                                            onDelete: isSupervisor
                                                ? null
                                                : () =>
                                                    showDeleteStockModal(stock),
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
                ? 'Supervisors cannot create product stocks'
                : 'Add New Product Stock',
            child: FloatingActionButton(
              onPressed: isSupervisor ? null : showCreateStockBottomSheet,
              backgroundColor:
                  isSupervisor ? Colors.grey[400] : const Color(0xFFE74C3C),
              child: const Icon(Icons.add, color: Colors.white),
            ),
          ),
        );
      },
    );
  }
}
