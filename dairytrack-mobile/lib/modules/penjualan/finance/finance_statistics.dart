import 'package:dairy_track/config/api/penjualan/finance.dart';
import 'package:dairy_track/model/penjualan/finance.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';

class FinanceStatistics extends StatefulWidget {
  const FinanceStatistics({super.key});

  @override
  _FinanceStatisticsState createState() => _FinanceStatisticsState();
}

class _FinanceStatisticsState extends State<FinanceStatistics> {
  final _startDateController = TextEditingController();
  final _endDateController = TextEditingController();
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();

  @override
  void initState() {
    super.initState();
    _startDateController.text = DateFormat('yyyy-MM-dd')
        .format(DateTime.now().subtract(const Duration(days: 30)));
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

  Future<List<Finance>> fetchFinances() async {
    try {
      final startDate = _startDateController.text;
      final endDate = _endDateController.text;
      final queryString = 'start_date=$startDate&end_date=$endDate';
      final finances = await getFinances(queryString: queryString);
      return finances;
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat data keuangan: $e')),
      );
      return [];
    }
  }

  Future<void> _refreshData() async {
    setState(() {});
    return Future.value();
  }

  // Aggregate daily totals for income and expense
  Map<String, Map<String, double>> _aggregateDailyTotals(
      List<Finance> finances) {
    final totals = <String, Map<String, double>>{};
    for (var finance in finances) {
      final date = DateFormat('yyyy-MM-dd').format(finance.transactionDate);
      totals[date] ??= {'income': 0.0, 'expense': 0.0};
      if (finance.transactionType == 'income') {
        totals[date]!['income'] = totals[date]!['income']! + finance.amount;
      } else if (finance.transactionType == 'expense') {
        totals[date]!['expense'] = totals[date]!['expense']! + finance.amount;
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
        title: const Text('Statistik Keuangan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: _refreshData,
        child: Column(
          children: [
            // Date Filter
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
                  ],
                ),
              ),
            ),
            // Bar Chart
            Expanded(
              child: FutureBuilder<List<Finance>>(
                future: fetchFinances(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(
                        child: Text('Tidak ada data keuangan ditemukan.'));
                  }

                  final finances = snapshot.data!;
                  final dailyTotals = _aggregateDailyTotals(finances);
                  final dates = dailyTotals.keys.toList()
                    ..sort(); // Sort dates chronologically
                  final barGroups = <BarChartGroupData>[];
                  for (int i = 0; i < dates.length; i++) {
                    final date = dates[i];
                    final income = dailyTotals[date]!['income']!;
                    final expense = dailyTotals[date]!['expense']!;
                    barGroups.add(
                      BarChartGroupData(
                        x: i,
                        barRods: [
                          BarChartRodData(
                            toY: income,
                            color: Colors.blue,
                            width: 10,
                          ),
                          BarChartRodData(
                            toY: expense,
                            color: Colors.red,
                            width: 10,
                          ),
                        ],
                      ),
                    );
                  }

                  return Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Pemasukan vs Pengeluaran Harian',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Expanded(
                          child: BarChart(
                            BarChartData(
                              barGroups: barGroups,
                              borderData: FlBorderData(show: false),
                              titlesData: FlTitlesData(
                                leftTitles: AxisTitles(
                                  sideTitles: SideTitles(
                                    showTitles: true,
                                    reservedSize: 40,
                                    getTitlesWidget: (value, meta) {
                                      return Text(
                                        NumberFormat.compact(locale: 'id_ID')
                                            .format(value),
                                        style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 12),
                                      );
                                    },
                                  ),
                                ),
                                bottomTitles: AxisTitles(
                                  sideTitles: SideTitles(
                                    showTitles: true,
                                    reservedSize: 30,
                                    getTitlesWidget: (value, meta) {
                                      final index = value.toInt();
                                      if (index < 0 || index >= dates.length)
                                        return const Text('');
                                      return Text(
                                        DateFormat('dd MMM').format(
                                            DateTime.parse(dates[index])),
                                        style: TextStyle(
                                            color: Colors.grey[600],
                                            fontSize: 12),
                                      );
                                    },
                                  ),
                                ),
                                topTitles: const AxisTitles(
                                    sideTitles: SideTitles(showTitles: false)),
                                rightTitles: const AxisTitles(
                                    sideTitles: SideTitles(showTitles: false)),
                              ),
                              gridData: FlGridData(show: true),
                              barTouchData: BarTouchData(
                                enabled: true,
                                touchTooltipData: BarTouchTooltipData(
                                  getTooltipItem:
                                      (group, groupIndex, rod, rodIndex) {
                                    final date = dates[groupIndex];
                                    final type = rodIndex == 0
                                        ? 'Pemasukan'
                                        : 'Pengeluaran';
                                    final amount = rod.toY;
                                    return BarTooltipItem(
                                      '$type\n${DateFormat('dd MMM yyyy').format(DateTime.parse(date))}\nRp ${NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0).format(amount)}',
                                      const TextStyle(color: Colors.white),
                                    );
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
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
