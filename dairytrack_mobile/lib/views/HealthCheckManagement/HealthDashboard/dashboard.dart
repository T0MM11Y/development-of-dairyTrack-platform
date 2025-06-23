// Tampilan diperbaiki agar lebih rapi dan mobile-friendly
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/diseaseHistoryController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/reproductionController.dart';

class HealthDashboardView extends StatefulWidget {
  const HealthDashboardView({super.key});

  @override
  State<HealthDashboardView> createState() => _HealthDashboardViewState();
}

class _HealthDashboardViewState extends State<HealthDashboardView> {
  final _healthCheckController = HealthCheckController();
  final _diseaseController = DiseaseHistoryController();
  final _symptomController = SymptomController();
  final _reproductionController = ReproductionController();

  Map<String, dynamic> summary = {
    'pemeriksaan': 0,
    'gejala': 0,
    'penyakit': 0,
    'reproduksi': 0,
  };

  List<Map<String, dynamic>> chartDiseaseData = [];
  List<Map<String, dynamic>> chartHealthData = [];
  List<Map<String, dynamic>> tableDiseaseData = [];
  List<Map<String, dynamic>> tableHealthData = [];

  bool _loading = true;

  DateTime? startDate;
  DateTime? endDate;
  int diseasePage = 1;
  int healthPage = 1;
  final int pageSize = 5;

  List<Map<String, dynamic>> get paginatedDiseaseData {
    final start = (diseasePage - 1) * pageSize;
    final end = start + pageSize;
    return tableDiseaseData.sublist(start, end > tableDiseaseData.length ? tableDiseaseData.length : end);
  }

  List<Map<String, dynamic>> get paginatedHealthData {
    final start = (healthPage - 1) * pageSize;
    final end = start + pageSize;
    return tableHealthData.sublist(start, end > tableHealthData.length ? tableHealthData.length : end);
  }

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _showAlertDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('OK')),
        ],
      ),
    );
  }

  Future<void> _loadData({bool isFilter = false}) async {
    if (isFilter && (startDate == null || endDate == null)) {
      _showAlertDialog('Empty Date', 'Please fill in Start Date and End Date first.');
      return;
    }

    setState(() => _loading = true);

    try {
      final healthRes = await _healthCheckController.getHealthChecks();
      final diseaseRes = await _diseaseController.getDiseaseHistories();
      final symptomRes = await _symptomController.getSymptoms();
      final reproRes = await _reproductionController.getReproductions();

      final healthChecks = _filterByDate(healthRes['data'] ?? []);
      final diseases = _filterByDate(diseaseRes['data'] ?? []);
      final symptoms = _filterByDate(symptomRes['data'] ?? []);
      final reproductions = _filterByDate(reproRes['data'] ?? [], 'recorded_at');

      final healthy = healthChecks.where((e) => !(e['needs_attention'] ?? false)).length;
      final sick = healthChecks.where((e) => (e['needs_attention'] ?? false) && e['status'] != 'handled').length;
      final handled = healthChecks.where((e) => (e['needs_attention'] ?? false) && e['status'] == 'handled').length;

      setState(() {
        summary = {
          'pemeriksaan': healthChecks.length,
          'gejala': symptoms.length,
          'penyakit': diseases.length,
          'reproduksi': reproductions.length,
        };

        chartDiseaseData = _groupBy(diseases, 'disease_name');

        chartHealthData = [
          if (healthy > 0) {'name': 'Healthy', 'value': healthy},
          if (sick > 0) {'name': 'Needs Attention', 'value': sick},
          if (handled > 0) {'name': 'Handled', 'value': handled},
        ];

        tableDiseaseData = diseases.map((e) => {
          'cowname': e['health_check']?['cow']?['name'] ?? '-',
          'penyakit': e['disease_name'] ?? '-',
          'keterangan': e['description'] ?? '-',
        }).toList();

        tableHealthData = healthChecks.map((e) => {
          'cowname': e['cow']?['name'] ?? '-',
          'suhu': e['rectal_temperature']?.toString() ?? '-',
          'detak': e['heart_rate']?.toString() ?? '-',
          'napas': e['respiration_rate']?.toString() ?? '-',
          'ruminasi': e['rumination']?.toString() ?? '-',
        }).toList();
      });

      if (isFilter) {
        final total = healthChecks.length + diseases.length + symptoms.length + reproductions.length;
        _showAlertDialog(
          total == 0 ? 'No Data Found' : 'Filter Successful',
          total == 0 ? 'No data found in the selected date range.' : 'Data successfully filtered by date.',
        );
      }
    } catch (e) {
      _showAlertDialog('Failed to Fetch Data', 'An error occurred while fetching data.');
    } finally {
      setState(() => _loading = false);
    }
  }

  List _filterByDate(List data, [String field = 'created_at']) {
    if (startDate == null || endDate == null) return data;
    return data.where((e) {
      final date = DateTime.tryParse(e[field] ?? '') ?? DateTime.now();
      return date.isAfter(startDate!.subtract(const Duration(days: 1))) && date.isBefore(endDate!.add(const Duration(days: 1)));
    }).toList();
  }

  List<Map<String, dynamic>> _groupBy(List data, String field) {
    final Map<String, int> grouped = {};
    for (var item in data) {
      final key = item[field] ?? 'Unknown';
      grouped[key] = (grouped[key] ?? 0) + 1;
    }
    return grouped.entries.map((e) => {'name': e.key, 'value': e.value}).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Health Dashboard')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionTitle('Date Filter'),
                  _buildDateFilter(),
                  const SizedBox(height: 24),
                  _sectionTitle('Summary'),
                  _buildSummaryCards(),
                  const SizedBox(height: 24),
                  _sectionTitle('Disease Statistics'),
                  _buildChart(chartDiseaseData, Colors.red),
                  const SizedBox(height: 24),
                  _sectionTitle('Livestock Health Condition'),
                  _buildChart(chartHealthData, Colors.blue),
                  const SizedBox(height: 24),
                  _sectionTitle('Disease History Table'),
                  _buildTable(paginatedDiseaseData, ['cowname', 'penyakit', 'keterangan']),
                  _buildPagination(diseasePage, tableDiseaseData.length, (v) => setState(() => diseasePage = v)),
                  const SizedBox(height: 24),
                  _sectionTitle('Health Check Table'),
                  _buildTable(paginatedHealthData, ['cowname', 'suhu', 'detak', 'napas', 'ruminasi']),
                  _buildPagination(healthPage, tableHealthData.length, (v) => setState(() => healthPage = v)),
                ],
              ),
            ),
    );
  }

  Widget _buildDateFilter() {
    return Wrap(
      spacing: 12,
      runSpacing: 12,
      children: [
        _datePickerTile('Start Date', startDate, (d) => setState(() => startDate = d)),
        _datePickerTile('End Date', endDate, (d) => setState(() => endDate = d)),
        ElevatedButton.icon(
          onPressed: () => _loadData(isFilter: true),
          icon: const Icon(Icons.search),
          label: const Text('Search'),
        ),
        ElevatedButton.icon(
          onPressed: () {
            setState(() {
              startDate = null;
              endDate = null;
            });
            _loadData();
          },
          icon: const Icon(Icons.refresh),
          label: const Text('Reset'),
          style: ElevatedButton.styleFrom(backgroundColor: Colors.grey),
        ),
      ],
    );
  }

  Widget _buildSummaryCards() {
    final items = [
      ['Health Checks', summary['pemeriksaan'], Colors.blue],
      ['Symptoms', summary['gejala'], Colors.indigo],
      ['Diseases', summary['penyakit'], Colors.red],
      ['Reproduction', summary['reproduksi'], Colors.orange],
    ];

    return Wrap(
      spacing: 12,
      runSpacing: 12,
      alignment: WrapAlignment.center,
      children: items.map((item) => _summaryCard(item[0] as String, item[1] as int, item[2] as Color)).toList(),
    );
  }

  Widget _summaryCard(String title, int? value, Color color) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        border: Border.all(color: color.withOpacity(0.3)),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(Icons.analytics, color: color, size: 30),
          const SizedBox(height: 8),
          Text(
            title,
            style: TextStyle(color: color, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          Text(
            '$value',
            style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildChart(List<Map<String, dynamic>> data, Color baseColor) {
    final int barCount = data.length;
    final double screenWidth = MediaQuery.of(context).size.width;
    final double barSpacing = 70;
    final bool isScrollable = barCount > 4;
    final double chartWidth = isScrollable ? barCount * barSpacing : screenWidth;

    return SizedBox(
      height: 300,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: isScrollable ? const BouncingScrollPhysics() : const NeverScrollableScrollPhysics(),
        child: SizedBox(
          width: chartWidth,
          child: Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: BarChart(
              BarChartData(
                alignment: isScrollable ? BarChartAlignment.start : BarChartAlignment.spaceAround,
                barGroups: List.generate(barCount, (i) {
                  return BarChartGroupData(
                    x: i,
                    barRods: [
                      BarChartRodData(
                        toY: (data[i]['value'] as num).toDouble(),
                        width: 24,
                        color: baseColor,
                        borderRadius: BorderRadius.circular(4),
                        backDrawRodData: BackgroundBarChartRodData(
                          show: true,
                          toY: (data[i]['value'] as num).toDouble() + 2,
                          color: Colors.grey[200]!,
                        ),
                      ),
                    ],
                  );
                }),
                titlesData: FlTitlesData(
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(showTitles: true, reservedSize: 32),
                  ),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (value, _) {
                        final index = value.toInt();
                        if (index < 0 || index >= data.length) return const SizedBox.shrink();

                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: SizedBox(
                            width: 60,
                            child: Transform.rotate(
                              angle: -0.8,
                              child: Text(
                                data[index]['name'],
                                style: const TextStyle(fontSize: 11),
                                textAlign: TextAlign.left,
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  topTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: false,
                      reservedSize: 32,
                    ),
                  ),
                ),
                gridData: FlGridData(show: true),
                borderData: FlBorderData(show: false),
                barTouchData: BarTouchData(
                  enabled: true,
                  touchTooltipData: BarTouchTooltipData(
                    tooltipMargin: 12,
                    fitInsideVertically: true,
                    getTooltipItem: (group, groupIndex, rod, rodIndex) {
                      return BarTooltipItem(
                        '${data[group.x.toInt()]['name']}\n${rod.toY.toInt()}',
                        const TextStyle(color: Colors.white),
                      );
                    },
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _sectionTitle(String text) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Text(text, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
      );

  Widget _datePickerTile(String label, DateTime? value, Function(DateTime) onPicked) {
    return GestureDetector(
      onTap: () async {
        DateTime? picked = await showDatePicker(
          context: context,
          initialDate: value ?? DateTime.now(),
          firstDate: DateTime(2020),
          lastDate: DateTime.now(),
        );
        if (picked != null) onPicked(picked);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(value != null ? DateFormat('dd MMM yyyy').format(value) : label),
            const Icon(Icons.calendar_today, size: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildTable(List<Map<String, dynamic>> data, List<String> keys) {
     final Map<String, String> columnTitles = {
    'cowname': 'Cow Name',
    'penyakit': 'Disease',
    'keterangan': 'Description',
    'suhu': 'Temperature',
    'detak': 'Heart Rate',
    'napas': 'Respiration',
    'ruminasi': 'Rumination',
  };
    return Card(
    margin: const EdgeInsets.symmetric(vertical: 8),
    elevation: 2,
    child: SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: keys.map((k) => DataColumn(label: Text(columnTitles[k] ?? k))).toList(),
        rows: data.map((row) {
          return DataRow(cells: keys.map((k) => DataCell(Text(row[k]?.toString() ?? '-'))).toList());
        }).toList(),
        ),
      ),
    );
  }

  Widget _buildPagination(int page, int total, Function(int) onChange) {
    final maxPage = (total / pageSize).ceil();
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        TextButton.icon(
          onPressed: page > 1 ? () => onChange(page - 1) : null,
          icon: const Icon(Icons.chevron_left),
          label: const Text("Previous"),
        ),
        Text("Page $page of $maxPage"),
        TextButton.icon(
          onPressed: page < maxPage ? () => onChange(page + 1) : null,
          icon: const Icon(Icons.chevron_right),
          label: const Text("Next"),
        ),
      ],
    );
  }
}
