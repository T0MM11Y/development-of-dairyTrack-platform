import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/financeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/finance.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/finance/AddIncomeModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/finance/AddExpenseModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/finance/AddIncomeTypeModal.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/finance/AddExpenseTypeModal.dart';
import 'package:fl_chart/fl_chart.dart';

class FinanceView extends StatefulWidget {
  const FinanceView({Key? key}) : super(key: key);

  @override
  _FinanceViewState createState() => _FinanceViewState();
}

class _FinanceViewState extends State<FinanceView> {
  final TextEditingController _searchController = TextEditingController();
  DateTime? _startDate;
  DateTime? _endDate;
  final DateFormat _dateFormat = DateFormat('yyyy-MM-dd');

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<FinanceProvider>(context, listen: false).fetchAllData();
    });
  }

  Future<void> _selectDate(BuildContext context, bool isStart) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isStart) {
          _startDate = picked;
        } else {
          _endDate = picked;
        }
      });
      _applyFilter();
    }
  }

  void _applyFilter() {
    String queryString = '';
    if (_startDate != null) {
      queryString += 'start_date=${_dateFormat.format(_startDate!)}';
    }
    if (_endDate != null) {
      queryString +=
          '${queryString.isNotEmpty ? '&' : ''}end_date=${_dateFormat.format(_endDate!)}';
    }
    Provider.of<FinanceProvider>(context, listen: false)
        .fetchAllData(queryString: queryString);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Keuangan'),
        backgroundColor: Colors.blueGrey[800],
        actions: [
          IconButton(
            icon: const Icon(Icons.picture_as_pdf),
            onPressed: () {
              final provider =
                  Provider.of<FinanceProvider>(context, listen: false);
              String queryString = '';
              if (_startDate != null) {
                queryString += 'start_date=${_dateFormat.format(_startDate!)}';
              }
              if (_endDate != null) {
                queryString +=
                    '${queryString.isNotEmpty ? '&' : ''}end_date=${_dateFormat.format(_endDate!)}';
              }
              provider.exportToPdf(queryString: queryString, context: context);
            },
          ),
          IconButton(
            icon: const Icon(Icons.table_chart),
            onPressed: () {
              final provider =
                  Provider.of<FinanceProvider>(context, listen: false);
              String queryString = '';
              if (_startDate != null) {
                queryString += 'start_date=${_dateFormat.format(_startDate!)}';
              }
              if (_endDate != null) {
                queryString +=
                    '${queryString.isNotEmpty ? '&' : ''}end_date=${_dateFormat.format(_endDate!)}';
              }
              provider.exportToExcel(
                  queryString: queryString, context: context);
            },
          ),
        ],
      ),
      body: Consumer<FinanceProvider>(
        builder: (context, provider, child) {
          return SingleChildScrollView(
            child: Column(
              children: [
                // Summary Cards
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Card(
                          elevation: 4,
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              children: [
                                const Text(
                                  'Saldo Tersedia',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Rp ${provider.availableBalance.toStringAsFixed(2)}',
                                  style: TextStyle(
                                    color: provider.availableBalance >= 0
                                        ? Colors.green
                                        : Colors.red,
                                    fontSize: 18,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Card(
                          elevation: 4,
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              children: [
                                const Text(
                                  'Total Pendapatan',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Rp ${provider.totalIncome.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: Colors.green,
                                    fontSize: 18,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Card(
                          elevation: 4,
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              children: [
                                const Text(
                                  'Total Pengeluaran',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Rp ${provider.totalExpense.toStringAsFixed(2)}',
                                  style: const TextStyle(
                                    color: Colors.red,
                                    fontSize: 18,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                // Donut Chart
                if (provider.chartData.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: Card(
                      elevation: 4,
                      child: Column(
                        children: [
                          const Padding(
                            padding: EdgeInsets.all(16.0),
                            child: Text(
                              'Distribusi Keuangan',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                          ),
                          SizedBox(
                            height: 200,
                            child: PieChart(
                              PieChartData(
                                sections:
                                    provider.chartData.entries.map((entry) {
                                  return PieChartSectionData(
                                    value: entry.value['amount'] as double,
                                    title: '${entry.value['percentage']}%',
                                    color: entry.value['type'] == 'income'
                                        ? Colors.green
                                        : Colors.red,
                                    radius: 80,
                                    titleStyle: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white,
                                    ),
                                  );
                                }).toList(),
                                sectionsSpace: 2,
                                centerSpaceRadius: 40,
                              ),
                            ),
                          ),
                          // Legend
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Wrap(
                              spacing: 8.0,
                              runSpacing: 4.0,
                              children: provider.chartData.entries
                                  .toList()
                                  .asMap()
                                  .entries
                                  .map((entry) {
                                final index = entry.key;
                                final data = entry.value.value;
                                final key = entry.value.key;
                                return Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Container(
                                      width: 16,
                                      height: 16,
                                      color: data['type'] == 'income'
                                          ? Colors.green
                                          : Colors.red,
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      '$key: ${data['percentage']}% (Rp ${data['amount'].toStringAsFixed(2)})',
                                      style: const TextStyle(fontSize: 12),
                                    ),
                                  ],
                                );
                              }).toList(),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                // Search Bar
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      labelText: 'Cari berdasarkan deskripsi',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.search),
                    ),
                    onChanged: (value) {
                      provider.setSearchQuery(value);
                    },
                  ),
                ),
                // Date Filters
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _selectDate(context, true),
                          child: Text(_startDate == null
                              ? 'Pilih Tanggal Mulai'
                              : _dateFormat.format(_startDate!)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () => _selectDate(context, false),
                          child: Text(_endDate == null
                              ? 'Pilih Tanggal Akhir'
                              : _dateFormat.format(_endDate!)),
                        ),
                      ),
                    ],
                  ),
                ),
                // Transaction List
                if (provider.isLoading)
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: CircularProgressIndicator(),
                  )
                else if (provider.errorMessage.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      provider.errorMessage,
                      style: const TextStyle(color: Colors.red),
                    ),
                  )
                else if (provider.transactions.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Text('Tidak ada transaksi'),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: provider.transactions.length,
                    itemBuilder: (context, index) {
                      final transaction = provider.transactions[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                            vertical: 8, horizontal: 16),
                        child: ListTile(
                          title: Text(transaction.description),
                          subtitle: Text(
                            'Tipe: ${transaction.transactionType} | Tanggal: ${_dateFormat.format(transaction.transactionDate)}',
                          ),
                          trailing: Text(
                            'Rp ${transaction.amount}',
                            style: TextStyle(
                              color: transaction.transactionType == 'income'
                                  ? Colors.green
                                  : Colors.red,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.blueGrey[800],
        onPressed: () {
          showModalBottomSheet(
            context: context,
            builder: (context) => Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                ListTile(
                  leading: const Icon(Icons.add_circle),
                  title: const Text('Tambah Pendapatan'),
                  onTap: () {
                    Navigator.pop(context);
                    showDialog(
                      context: context,
                      builder: (context) => const AddIncomeModal(),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.remove_circle),
                  title: const Text('Tambah Pengeluaran'),
                  onTap: () {
                    Navigator.pop(context);
                    showDialog(
                      context: context,
                      builder: (context) => const AddExpenseModal(),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.category),
                  title: const Text('Tambah Jenis Pendapatan'),
                  onTap: () {
                    Navigator.pop(context);
                    showDialog(
                      context: context,
                      builder: (context) => const AddIncomeTypeModal(),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.category),
                  title: const Text('Tambah Jenis Pengeluaran'),
                  onTap: () {
                    Navigator.pop(context);
                    showDialog(
                      context: context,
                      builder: (context) => const AddExpenseTypeModal(),
                    );
                  },
                ),
              ],
            ),
          );
        },
        child: const Icon(Icons.add),
      ),
    );
  }
}
