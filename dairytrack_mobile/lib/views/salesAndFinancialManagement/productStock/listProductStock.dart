import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/statisticCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/productStockCard.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStock/createProductStockModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStock/editProductStock.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/productStock/deleteProductStock.dart';

class ListProductStock extends StatefulWidget {
  const ListProductStock({super.key});

  @override
  _ListProductStockState createState() => _ListProductStockState();
}

class _ListProductStockState extends State<ListProductStock> {
  @override
  void initState() {
    super.initState();
    // Fetch stocks when widget is initialized
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<StockProvider>(context, listen: false).fetchStocks();
    });
  }

  @override
  Widget build(BuildContext context) {
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

        void showCreateStockModal() async {
          await showDialog(
            context: context,
            builder: (dialogContext) => const CreateStockModal(),
          );
          stockProvider.fetchStocks(); // Refresh data after dialog closes
        }

        void showEditStockModal(Stock stock) async {
          await showDialog(
            context: context,
            builder: (dialogContext) => EditStockModal(stock: stock),
          );
          stockProvider.fetchStocks(); // Refresh data after dialog closes
        }

        void showDeleteStockModal(Stock stock) {
          showDialog(
            context: context,
            builder: (dialogContext) => DeleteStockModal(stock: stock),
          );
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text(
              'Data Stok Produk',
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
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                )
              else
                RefreshIndicator(
                  onRefresh: stockProvider.fetchStocks,
                  child: Column(
                    children: [
                      Card(
                        margin: const EdgeInsets.all(16),
                        elevation: 6,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              const Text(
                                'Filter Data Stok',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF2C3E50),
                                ),
                                textAlign: TextAlign.center,
                              ),
                              const SizedBox(height: 16),
                              TextField(
                                decoration: InputDecoration(
                                  hintText: 'Cari berdasarkan Nama Produk...',
                                  prefixIcon: const Icon(Icons.search,
                                      color: Color(0xFF2C3E50)),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50), width: 2),
                                  ),
                                  filled: true,
                                  fillColor: Colors.white,
                                  contentPadding: const EdgeInsets.symmetric(
                                      vertical: 12, horizontal: 16),
                                  suffixIcon: stockProvider
                                          .searchQuery.isNotEmpty
                                      ? IconButton(
                                          icon: const Icon(Icons.clear,
                                              color: Color(0xFF2C3E50)),
                                          onPressed: () {
                                            stockProvider.setSearchQuery('');
                                          },
                                        )
                                      : null,
                                ),
                                onChanged: stockProvider.setSearchQuery,
                              ),
                              const SizedBox(height: 12),
                              DropdownButtonFormField<String?>(
                                value: stockProvider.selectedStatus,
                                decoration: InputDecoration(
                                  labelText: 'Filter Status',
                                  labelStyle:
                                      const TextStyle(color: Color(0xFF2C3E50)),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50)),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                        color: Color(0xFF2C3E50), width: 2),
                                  ),
                                  filled: true,
                                  fillColor: Colors.white,
                                  prefixIcon: const Icon(Icons.filter_list,
                                      color: Color(0xFF2C3E50)),
                                  contentPadding: const EdgeInsets.symmetric(
                                      horizontal: 16, vertical: 12),
                                ),
                                items: [
                                  const DropdownMenuItem<String?>(
                                    value: null,
                                    child: Text('Semua',
                                        style: TextStyle(
                                            color: Color(0xFF2C3E50))),
                                  ),
                                  ...['available', 'expired', 'contamination']
                                      .map((String status) {
                                    String displayStatus;
                                    switch (status) {
                                      case 'available':
                                        displayStatus = 'Tersedia';
                                        break;
                                      case 'expired':
                                        displayStatus = 'Kedaluwarsa';
                                        break;
                                      case 'contamination':
                                        displayStatus = 'Terkontaminasi';
                                        break;
                                      default:
                                        displayStatus = status;
                                    }
                                    return DropdownMenuItem<String>(
                                      value: status,
                                      child: Text(displayStatus,
                                          style: const TextStyle(
                                              color: Color(0xFF2C3E50))),
                                    );
                                  }).toList(),
                                ],
                                onChanged: stockProvider.setSelectedStatus,
                              ),
                            ],
                          ),
                        ),
                      ),
                      StatisticsCard(totalCount: totalItems, label: 'Sum Of Product Stocks'),
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
                                      'Tidak ada stok produk ditemukan',
                                      style: TextStyle(
                                        fontSize: 18,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'Klik tombol + untuk menambah stok produk',
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
                                            onEdit: () =>
                                                showEditStockModal(stock),
                                            onDelete: () =>
                                                showDeleteStockModal(stock),
                                          ))
                                      .toList(),
                                  const SizedBox(height: 80),
                                ],
                              ),
                      ),
                    ],
                  ),
                )
            ],
          ),
          floatingActionButton: FloatingActionButton(
            onPressed: showCreateStockModal,
            backgroundColor: const Color(0xFFE74C3C),
            child: const Icon(Icons.add, color: Colors.white),
          ),
        );
      },
    );
  }
}
