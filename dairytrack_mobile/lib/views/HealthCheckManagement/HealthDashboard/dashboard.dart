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

  Future<void> _loadData() async {
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

      final sehat = healthChecks.where((e) => !(e['needs_attention'] ?? false)).length;
      final sakit = healthChecks.where((e) => (e['needs_attention'] ?? false) && e['status'] != 'handled').length;
      final ditangani = healthChecks.where((e) => (e['needs_attention'] ?? false) && e['status'] == 'handled').length;

      setState(() {
        summary = {
          'pemeriksaan': healthChecks.length,
          'gejala': symptoms.length,
          'penyakit': diseases.length,
          'reproduksi': reproductions.length,
        };

        chartDiseaseData = _groupBy(diseases, 'disease_name');

        chartHealthData = [
          if (sehat > 0) {'name': 'Sehat', 'value': sehat},
          if (sakit > 0) {'name': 'Butuh Perhatian', 'value': sakit},
          if (ditangani > 0) {'name': 'Sudah Ditangani', 'value': ditangani},
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

        _loading = false;
      });
    } catch (e) {
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
      final key = item[field] ?? 'Tidak Diketahui';
      grouped[key] = (grouped[key] ?? 0) + 1;
    }
    return grouped.entries.map((e) => {'name': e.key, 'value': e.value}).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Dashboard Kesehatan')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Filter Tanggal
                  Row(
                    children: [
                      Expanded(child: _datePickerTile('Tanggal Mulai', startDate, (d) => setState(() => startDate = d))),
                      const SizedBox(width: 12),
                      Expanded(child: _datePickerTile('Tanggal Akhir', endDate, (d) => setState(() => endDate = d))),
                      IconButton(
                        onPressed: _loadData,
                        icon: const Icon(Icons.refresh),
                        tooltip: 'Terapkan Filter',
                      )
                    ],
                  ),
                  const SizedBox(height: 20),

                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: [
                      _summaryCard('Pemeriksaan', summary['pemeriksaan'], Colors.blue),
                      _summaryCard('Gejala', summary['gejala'], Colors.indigo),
                      _summaryCard('Penyakit', summary['penyakit'], Colors.red),
                      _summaryCard('Reproduksi', summary['reproduksi'], Colors.orange),
                    ],
                  ),
                  const SizedBox(height: 24),
                  _sectionTitle('Statistik Penyakit'),
                  SizedBox(height: 200, child: BarChart(_barData(chartDiseaseData, Colors.red))),
                  const SizedBox(height: 24),
                  _sectionTitle('Kondisi Kesehatan Ternak'),
                  SizedBox(height: 200, child: BarChart(_barData(chartHealthData, Colors.blue))),
                  const SizedBox(height: 24),
                  _sectionTitle('Tabel Riwayat Penyakit'),
                  _buildTable(paginatedDiseaseData, ['cowname', 'penyakit', 'keterangan']),
                  _buildPagination(diseasePage, tableDiseaseData.length, (v) => setState(() => diseasePage = v)),
                  const SizedBox(height: 24),
                  _sectionTitle('Tabel Pemeriksaan Kesehatan'),
                  _buildTable(paginatedHealthData, ['cowname', 'suhu', 'detak', 'napas', 'ruminasi']),
                  _buildPagination(healthPage, tableHealthData.length, (v) => setState(() => healthPage = v)),
                ],
              ),
            ),
    );
  }

  Widget _sectionTitle(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
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
        children: [
          Icon(Icons.analytics, color: color, size: 30),
          const SizedBox(height: 8),
          Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
          Text('$value', style: TextStyle(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  BarChartData _barData(List<Map<String, dynamic>> data, Color baseColor) {
  return BarChartData(
    alignment: BarChartAlignment.spaceAround,
    titlesData: FlTitlesData(
      leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: true)),
      bottomTitles: AxisTitles(
        sideTitles: SideTitles(
          showTitles: true,
          getTitlesWidget: (value, _) {
            final index = value.toInt();
            if (index < 0 || index >= data.length) return const SizedBox.shrink();
            return Text(
              data[index]['name'],
              style: const TextStyle(fontSize: 10),
              textAlign: TextAlign.center,
            );
          },
        ),
      ),
    ),
    barGroups: List.generate(data.length, (i) {
      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: (data[i]['value'] as num).toDouble(),
            width: 20,
            color: baseColor,
            borderRadius: BorderRadius.circular(6),
          ),
        ],
      );
    }),
    borderData: FlBorderData(show: false),
  );
}


  Widget _buildTable(List<Map<String, dynamic>> data, List<String> keys) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8),
      elevation: 2,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: keys.map((k) => DataColumn(label: Text(k.toUpperCase()))).toList(),
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
          label: const Text("Sebelumnya"),
        ),
        Text("Halaman $page dari $maxPage"),
        TextButton.icon(
          onPressed: page < maxPage ? () => onChange(page + 1) : null,
          icon: const Text("Selanjutnya"),
          label: const Icon(Icons.chevron_right),
        ),
      ],
    );
  }
}
