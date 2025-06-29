// salesTransactionView.dart
import 'package:dairytrack_mobile/controller/APIURL2/models/salesTransaction.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/salesTransactionProvider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:logger/logger.dart';

class SalesTransactionView extends StatefulWidget {
  @override
  _SalesTransactionViewState createState() => _SalesTransactionViewState();
}

class _SalesTransactionViewState extends State<SalesTransactionView>
    with TickerProviderStateMixin {
  late AnimationController _chartAnimationController;
  late Animation<double> _chartAnimation;
  TextEditingController _searchController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;
  String? _selectedPaymentMethod;
  final Logger _logger = Logger();

  @override
  void initState() {
    super.initState();
    _initializeAnimations();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<SalesTransactionProvider>(context, listen: false)
          .fetchTransactions();
    });
  }

  void _initializeAnimations() {
    _chartAnimationController = AnimationController(
      duration: Duration(milliseconds: 1000),
      vsync: this,
    );
    _chartAnimation = CurvedAnimation(
      parent: _chartAnimationController,
      curve: Curves.easeOut,
    );
    _chartAnimationController.forward();
  }

  @override
  void dispose() {
    _chartAnimationController.dispose();
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      appBar: AppBar(
        title: Text(
          'Transaksi Penjualan',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
        ),
        backgroundColor: Colors.blueGrey[800],
        elevation: 0,
        actions: [
          IconButton(
            icon: Icon(Icons.download, color: Colors.white),
            onPressed: _showExportOptions,
            tooltip: 'Ekspor Data',
          ),
        ],
      ),
      body: Consumer<SalesTransactionProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return Center(
              child: CircularProgressIndicator(color: Colors.blueGrey[800]),
            );
          }
          if (provider.errorMessage.isNotEmpty) {
            return Center(
              child: Text(
                provider.errorMessage,
                style: TextStyle(color: Colors.red, fontSize: 16),
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: () =>
                provider.fetchTransactions(queryString: _buildQueryString()),
            child: SingleChildScrollView(
              physics: AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSearchBar(provider),
                  SizedBox(height: 16),
                  _buildFilterSection(provider),
                  SizedBox(height: 16),
                  _buildDonutChart(provider),
                  SizedBox(height: 16),
                  _buildDetailedStatistics(provider.transactions),
                  SizedBox(height: 16),
                  _buildTransactionList(provider),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSearchBar(SalesTransactionProvider provider) {
    return TextField(
      controller: _searchController,
      decoration: InputDecoration(
        hintText: 'Cari berdasarkan nama pelanggan...',
        prefixIcon: Icon(Icons.search, color: Colors.grey[600]),
        suffixIcon: _searchController.text.isNotEmpty
            ? IconButton(
                icon: Icon(Icons.clear, color: Colors.grey[600]),
                onPressed: () {
                  _searchController.clear();
                  provider.setSearchQuery(null);
                },
              )
            : null,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        contentPadding: EdgeInsets.symmetric(vertical: 12),
      ),
      onChanged: (value) => provider.setSearchQuery(value),
    );
  }

  Widget _buildFilterSection(SalesTransactionProvider provider) {
    final paymentMethods = provider.transactions
        .map((e) => e.paymentMethod)
        .toSet()
        .toList()
      ..sort();

    return Card(
      elevation: 2,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ExpansionTile(
        initiallyExpanded: false,
        tilePadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        title: Text(
          'Filter Data',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: Colors.blueGrey[800],
          ),
        ),
        trailing: Icon(
          Icons.expand_more,
          color: Colors.blueGrey[800],
        ),
        childrenPadding: EdgeInsets.all(16),
        children: [
          Text(
            'Filter Tanggal',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.blueGrey[600],
            ),
          ),
          SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _startDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2030),
                    );
                    if (picked != null) {
                      setState(() => _startDate = picked);
                    }
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _startDate == null
                          ? 'Pilih Tanggal Mulai'
                          : DateFormat('dd MMM yyyy').format(_startDate!),
                      style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                    ),
                  ),
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: GestureDetector(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _endDate ?? DateTime.now(),
                      firstDate: DateTime(2020),
                      lastDate: DateTime(2030),
                    );
                    if (picked != null) {
                      setState(() => _endDate = picked);
                    }
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey[300]!),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      _endDate == null
                          ? 'Pilih Tanggal Selesai'
                          : DateFormat('dd MMM yyyy').format(_endDate!),
                      style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                    ),
                  ),
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          Text(
            'Metode Pembayaran',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.blueGrey[600],
            ),
          ),
          SizedBox(height: 8),
          DropdownButtonFormField<String?>(
            value: _selectedPaymentMethod,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: BorderSide(color: Colors.grey[300]!),
              ),
              contentPadding:
                  EdgeInsets.symmetric(vertical: 12, horizontal: 16),
            ),
            hint: Text('Pilih Metode Pembayaran',
                style: TextStyle(color: Colors.grey[700])),
            items: [
              DropdownMenuItem<String?>(
                value: null,
                child: Text('Semua'),
              ),
              ...paymentMethods.map((method) => DropdownMenuItem<String>(
                    value: method,
                    child: Text(method),
                  )),
            ],
            onChanged: (value) {
              setState(() => _selectedPaymentMethod = value);
            },
          ),
          SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              ElevatedButton(
                onPressed: () {
                  if (_startDate != null && _endDate != null) {
                    if (_endDate!.isBefore(_startDate!)) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                            content: Text(
                                'Tanggal akhir tidak boleh sebelum tanggal mulai')),
                      );
                      return;
                    }
                  }
                  final query = _buildQueryString();
                  _logger.i('Applying filter with query: $query');
                  provider.fetchTransactions(queryString: query).then((_) {
                    if (provider.errorMessage.isNotEmpty) {
                      _logger.e('Filter error: ${provider.errorMessage}');
                    } else {
                      _logger.i('Filter applied successfully');
                    }
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Filter diterapkan')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blueGrey[800],
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                  padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                ),
                child: Text('Filter', style: TextStyle(fontSize: 14)),
              ),
              if (_startDate != null ||
                  _endDate != null ||
                  _selectedPaymentMethod != null)
                TextButton(
                  onPressed: () {
                    setState(() {
                      _startDate = null;
                      _endDate = null;
                      _selectedPaymentMethod = null;
                    });
                    _logger.i('Resetting filters');
                    provider.fetchTransactions();
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Filter dihapus')),
                    );
                  },
                  child: Text('Hapus Filter',
                      style: TextStyle(color: Colors.red[600])),
                ),
            ],
          ),
        ],
      ),
    );
  }

  String _buildQueryString() {
    final params = <String, String>{};
    if (_startDate != null) {
      params['start_date'] = DateFormat('yyyy-MM-dd').format(_startDate!);
    }
    if (_endDate != null) {
      params['end_date'] = DateFormat('yyyy-MM-dd').format(_endDate!);
    }
    if (_selectedPaymentMethod != null) {
      params['payment_method'] = Uri.encodeComponent(_selectedPaymentMethod!);
    }
    final query = params.entries.map((e) => '${e.key}=${e.value}').join('&');
    _logger.i('Generated query string: $query');
    return query;
  }

  Widget _buildDonutChart(SalesTransactionProvider provider) {
    final transactions = provider.transactions;
    final Map<String, double> paymentMethodMap = {};
    for (var item in transactions) {
      paymentMethodMap[item.paymentMethod] =
          (paymentMethodMap[item.paymentMethod] ?? 0) +
              double.parse(item.totalPrice);
    }
    final totalAmount =
        paymentMethodMap.values.fold(0.0, (sum, amount) => sum + amount);

    final chartData =
        paymentMethodMap.entries.toList().asMap().entries.map((entry) {
      final index = entry.key;
      final mapEntry = entry.value;
      final percentage =
          totalAmount > 0 ? (mapEntry.value / totalAmount * 100) : 0.0;
      return PieChartSectionData(
        color: _getChartColor(index % _chartColors.length),
        value: mapEntry.value,
        title: '${mapEntry.key}\n${percentage.toStringAsFixed(1)}%',
        radius: 60,
        titleStyle: TextStyle(
            fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
      );
    }).toList();

    return SlideTransition(
      position: Tween<Offset>(begin: Offset(0.5, 0), end: Offset.zero)
          .animate(_chartAnimation),
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 10,
                offset: Offset(0, 5)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.donut_large, color: Colors.teal[600], size: 20),
                SizedBox(width: 8),
                Text(
                  'Distribusi Metode Pembayaran',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.blueGrey[800],
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Persentase total penjualan berdasarkan metode pembayaran',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            SizedBox(height: 16),
            Container(
              height: 200,
              child: PieChart(
                PieChartData(
                  sections: chartData.isEmpty
                      ? [
                          PieChartSectionData(
                            color: Colors.grey[300],
                            value: 1,
                            title: 'Tidak ada data',
                            radius: 60,
                            titleStyle: TextStyle(
                                fontSize: 12, color: Colors.grey[600]),
                          ),
                        ]
                      : chartData,
                  centerSpaceRadius: 40,
                  sectionsSpace: 2,
                ),
              ),
            ),
            SizedBox(height: 16),
            _buildChartLegend(paymentMethodMap),
          ],
        ),
      ),
    );
  }

  Widget _buildChartLegend(Map<String, double> paymentMethodMap) {
    return Wrap(
      spacing: 16,
      runSpacing: 8,
      children: paymentMethodMap.entries.toList().asMap().entries.map((entry) {
        final index = entry.key;
        final item = entry.value;
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: _getChartColor(index % _chartColors.length),
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            SizedBox(width: 8),
            Text(
              '${item.key}: Rp ${item.value.toStringAsFixed(0)}',
              style: TextStyle(fontSize: 12, color: Colors.grey[700]),
            ),
          ],
        );
      }).toList(),
    );
  }

  Widget _buildDetailedStatistics(List<SalesTransaction> transactions) {
    final productNames = transactions
        .expand((t) => t.order.orderItems
            .map((i) => i.productTypeDetail?.productName ?? ''))
        .toSet()
        .toList();
    final stats = productNames.map((name) {
      final items = transactions
          .expand((t) => t.order.orderItems)
          .where((i) => i.productTypeDetail?.productName == name)
          .toList();
      final totalAmount = items.fold(0.0,
          (sum, item) => sum + (double.tryParse(item.totalPrice ?? '0') ?? 0));
      final percentage = transactions.isNotEmpty
          ? (totalAmount /
              transactions.fold(
                  0.0, (sum, t) => sum + (double.tryParse(t.totalPrice) ?? 0)) *
              100)
          : 0.0;
      return {'name': name, 'amount': totalAmount, 'percentage': percentage};
    }).toList();

    return SlideTransition(
      position: Tween<Offset>(begin: Offset(0, 0.5), end: Offset.zero)
          .animate(_chartAnimation),
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 10,
                offset: Offset(0, 5)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.bar_chart, color: Colors.blue[600], size: 20),
                SizedBox(width: 8),
                Text(
                  'Perbandingan Produk',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.blueGrey[800],
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Persentase penjualan berdasarkan nama produk',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            SizedBox(height: 16),
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ...stats.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    final color = _getChartColor(index % _chartColors.length);
                    return Container(
                      margin: EdgeInsets.only(bottom: 10),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                item['name'] as String,
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500,
                                    color: Colors.grey[700]),
                              ),
                              Text(
                                '${(item['percentage'] as double).toStringAsFixed(1)}%',
                                style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: color),
                              ),
                            ],
                          ),
                          SizedBox(height: 4),
                          Container(
                            height: 6,
                            decoration: BoxDecoration(
                              color: Colors.grey[200],
                              borderRadius: BorderRadius.circular(3),
                            ),
                            child: FractionallySizedBox(
                              alignment: Alignment.centerLeft,
                              widthFactor: (item['percentage'] as double) / 100,
                              child: Container(
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [color, color.withOpacity(0.7)],
                                    begin: Alignment.centerLeft,
                                    end: Alignment.centerRight,
                                  ),
                                  borderRadius: BorderRadius.circular(3),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTransactionList(SalesTransactionProvider provider) {
    final transactions = provider.transactions;
    return SlideTransition(
      position: Tween<Offset>(begin: Offset(-0.5, 0), end: Offset.zero)
          .animate(_chartAnimation),
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                blurRadius: 10,
                offset: Offset(0, 5)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.history, color: Colors.purple[600], size: 20),
                SizedBox(width: 8),
                Text(
                  'Daftar Transaksi Penjualan',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: Colors.blueGrey[800],
                  ),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              'Riwayat transaksi penjualan',
              style: TextStyle(fontSize: 12, color: Colors.grey[600]),
            ),
            SizedBox(height: 16),
            transactions.isEmpty
                ? Center(
                    child: Column(
                      children: [
                        Icon(Icons.history_toggle_off,
                            size: 48, color: Colors.grey[400]),
                        SizedBox(height: 16),
                        Text(
                          'Belum ada transaksi penjualan',
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: transactions.length,
                    itemBuilder: (context, index) {
                      final item = transactions[index];
                      final iconColor = _getIconColor(item.paymentMethod);
                      return Card(
                        margin: EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: iconColor.withOpacity(0.2),
                            child: Icon(
                              Icons.monetization_on,
                              color: iconColor,
                              size: 20,
                            ),
                          ),
                          title: Text(
                            item.order.customerName,
                            style: TextStyle(
                                fontSize: 14, fontWeight: FontWeight.w600),
                          ),
                          subtitle: Text(
                            'Order: ${item.order.orderNo}\nTotal: Rp ${item.totalPrice}\nMetode: ${item.paymentMethod}\nTanggal: ${DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(item.transactionDate)}',
                            style: TextStyle(
                                fontSize: 12, color: Colors.grey[600]),
                          ),
                          trailing: Text(
                            'Rp ${item.totalPrice}',
                            style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.green[600]),
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }

  Color _getIconColor(String paymentMethod) {
    switch (paymentMethod.toLowerCase()) {
      case 'cash':
        return Colors.green[600]!;
      case 'card':
        return Colors.blue[600]!;
      case 'transfer':
        return Colors.purple[600]!;
      default:
        return Colors.blueGrey[600]!;
    }
  }

  void _showExportOptions() {
    showModalBottomSheet(
      context: context,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Consumer<SalesTransactionProvider>(
          builder: (context, provider, child) => Container(
            padding: EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Ekspor Transaksi Penjualan',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Colors.blueGrey[800]),
                ),
                SizedBox(height: 16),
                ListTile(
                  leading: Icon(Icons.picture_as_pdf, color: Colors.red[600]),
                  title: Text('Ekspor sebagai PDF'),
                  enabled: !provider.isExporting,
                  onTap: () {
                    Navigator.pop(context);
                    provider.exportToPdf(
                      queryString: _buildQueryString(),
                      context: context,
                    );
                  },
                ),
                ListTile(
                  leading: Icon(Icons.table_chart, color: Colors.green[600]),
                  title: Text('Ekspor sebagai Excel'),
                  enabled: !provider.isExporting,
                  onTap: () {
                    Navigator.pop(context);
                    provider.exportToExcel(
                      queryString: _buildQueryString(),
                      context: context,
                    );
                  },
                ),
                SizedBox(height: 16),
                if (provider.isExporting)
                  CircularProgressIndicator(color: Colors.blueGrey[800]),
              ],
            ),
          ),
        );
      },
    );
  }

  final List<Color> _chartColors = [
    Colors.blue[600]!,
    Colors.teal[600]!,
    Colors.orange[600]!,
    Colors.purple[600]!,
    Colors.green[600]!,
  ];

  Color _getChartColor(int index) => _chartColors[index % _chartColors.length];
}
