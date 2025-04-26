import 'dart:io';
import 'package:dairy_track/config/api/penjualan/productHistory.dart';
import 'package:dairy_track/model/penjualan/productHistory.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';

class ProductHistoryList extends StatefulWidget {
  const ProductHistoryList({super.key});

  @override
  _ProductHistoryListState createState() => _ProductHistoryListState();
}

class _ProductHistoryListState extends State<ProductHistoryList> {
  final _startDateController = TextEditingController();
  final _endDateController = TextEditingController();
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _startDateController.text = DateFormat('yyyy-MM-dd')
        .format(DateTime.now().subtract(Duration(days: 30)));
    _endDateController.text = DateFormat('yyyy-MM-dd').format(DateTime.now());
  }

  Future<void> _selectDate(
      BuildContext context, TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.parse(controller.text),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        controller.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  Future<List<ProductHistory>> fetchProductHistory() async {
    try {
      final startDate = _startDateController.text;
      final endDate = _endDateController.text;
      final queryString = 'start_date=$startDate&end_date=$endDate';
      final history = await getProductStockHistorys(queryString: queryString);
      return history;
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat data riwayat stok: $e')),
      );
      return [];
    }
  }

  Future<void> _refreshData() async {
    setState(() {});
    return Future.value();
  }

  Future<void> _exportFile({required bool isPdf}) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final startDate = _startDateController.text;
      final endDate = _endDateController.text;
      final queryString = 'start_date=$startDate&end_date=$endDate';
      final bytes = isPdf
          ? await getProductStockHistoryExportPdf(queryString: queryString)
          : await getProductStockHistoryExportExcel(queryString: queryString);

      // Menyimpan file di direktori dokumen aplikasi (tidak memerlukan izin eksternal)
      final directory = await getApplicationDocumentsDirectory();
      final fileName = isPdf
          ? 'product_history_${startDate}_to_${endDate}.pdf'
          : 'product_history_${startDate}_to_${endDate}.xlsx';
      final filePath = '${directory.path}/$fileName';
      final file = File(filePath);
      await file.writeAsBytes(bytes);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('File disimpan di: $filePath')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal mengekspor file: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // Menghitung total quantity_change per change_type
  Map<String, double> _calculateChangeTypeTotals(List<ProductHistory> history) {
    final totals = {'sold': 0.0, 'restock': 0.0};
    for (var item in history) {
      if (item.changeType == 'sold') {
        totals['sold'] = totals['sold']! + item.quantityChange;
      } else if (item.changeType == 'restock') {
        totals['restock'] = totals['restock']! + item.quantityChange;
      }
    }
    return totals;
  }

  @override
  void dispose() {
    _startDateController.dispose();
    _endDateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Stok Produk'),
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
                      controller: _startDateController,
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Mulai',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () => _selectDate(context, _startDateController),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _endDateController,
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Akhir',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () => _selectDate(context, _endDateController),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading
                                ? null
                                : () => _exportFile(isPdf: true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue[700],
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: _isLoading
                                ? const CircularProgressIndicator(
                                    color: Colors.white)
                                : const Text('Ekspor PDF'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading
                                ? null
                                : () => _exportFile(isPdf: false),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green[700],
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: _isLoading
                                ? const CircularProgressIndicator(
                                    color: Colors.white)
                                : const Text('Ekspor Excel'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: FutureBuilder<List<ProductHistory>>(
                future: fetchProductHistory(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(
                        child: Text('Tidak ada data riwayat stok ditemukan.'));
                  }

                  final history = snapshot.data!;
                  final totals = _calculateChangeTypeTotals(history);

                  return Column(
                    children: [
                      Card(
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
                              const Text(
                                'Perbandingan Sold vs Restock',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 16),
                              SizedBox(
                                height: 200,
                                child: PieChart(
                                  PieChartData(
                                    sections: [
                                      PieChartSectionData(
                                        color: Colors.blue,
                                        value: totals['sold'],
                                        title:
                                            'Sold\n${totals['sold'].toInt()} unit',
                                        radius: 80,
                                        titleStyle: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                      PieChartSectionData(
                                        color: Colors.green,
                                        value: totals['restock'],
                                        title:
                                            'Restock\n${totals['restock'].toInt()} unit',
                                        radius: 80,
                                        titleStyle: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ],
                                    centerSpaceRadius: 40,
                                    sectionsSpace: 2,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      Expanded(
                        child: ListView.builder(
                          itemCount: history.length,
                          itemBuilder: (context, index) {
                            final item = history[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                  vertical: 8, horizontal: 16),
                              elevation: 4,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(16),
                                title: Text(
                                  item.productName,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const SizedBox(height: 8),
                                    Text(
                                      'Tanggal: ${DateFormat('dd MMM yyyy').format(item.changeDate)}',
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                                    Text(
                                      'Jenis Perubahan: ${item.changeType}',
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                                    Text(
                                      'Jumlah: ${item.quantityChange} ${item.unit}',
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                                    Text(
                                      'Stok Setelah: ${item.productStock} ${item.unit}',
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                                    Text(
                                      'Total Harga: Rp ${NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0).format(item.totalPrice)}',
                                      style: TextStyle(color: Colors.grey[600]),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
