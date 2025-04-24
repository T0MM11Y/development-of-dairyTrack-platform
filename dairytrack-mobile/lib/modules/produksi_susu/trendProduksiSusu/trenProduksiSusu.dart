import 'package:dairy_track/config/api/produktivitas/dailyMilkTotal.dart';
import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/config/configApi5000.dart';

class TrenProduksiSusu extends StatefulWidget {
  @override
  _TrenProduksiSusuState createState() => _TrenProduksiSusuState();
}

class _TrenProduksiSusuState extends State<TrenProduksiSusu> {
  List<Map<String, dynamic>> data = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await getDailyMilkTotals();
      setState(() {
        data = response.map<Map<String, dynamic>>((item) {
          final volume = double.tryParse(item['volume_liters'].toString()) ?? 0;
          String status;
          if (volume < 18) {
            status = 'Decreasing';
          } else if (volume > 25) {
            status = 'Increasing';
          } else {
            status = 'Stable';
          }
          return {
            'cowName': item['cow_name'] ?? 'Unknown',
            'date': item['date'] ?? '',
            'volume': volume,
            'status': status,
          };
        }).toList();
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching data: ${e.toString()}')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Widget _buildChart() {
    if (data.isEmpty) {
      return Center(child: Text('No data available for chart'));
    }

    final spots = data.asMap().entries.map((entry) {
      final index = entry.key;
      final volume = entry.value['volume'] as double;
      return FlSpot(index.toDouble(), volume);
    }).toList();
    return LineChart(
      LineChartData(
        gridData: FlGridData(show: true),
        titlesData: FlTitlesData(
          leftTitles: AxisTitles(
            sideTitles: SideTitles(showTitles: true),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index >= 0 && index < data.length) {
                  return Text(
                    DateFormat('MM/dd').format(
                      DateTime.parse(data[index]['date']),
                    ),
                    style: TextStyle(fontSize: 10),
                  );
                }
                return Text('');
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: true),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            gradient: LinearGradient(colors: [Colors.blue, Colors.blue]),
            barWidth: 4,
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  Colors.blue.withOpacity(0.3),
                  Colors.blue.withOpacity(0.1)
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTable() {
    return DataTable(
      columns: const [
        DataColumn(label: Text('Cow Name')),
        DataColumn(label: Text('Date')),
        DataColumn(label: Text('Volume (Liters)')),
        DataColumn(label: Text('Status')),
      ],
      rows: data.map((item) {
        return DataRow(cells: [
          DataCell(Text(item['cowName'])),
          DataCell(Text(item['date'])),
          DataCell(Text(item['volume'].toString())),
          DataCell(Text(item['status'])),
        ]);
      }).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Tren Produksi Susu'),
        backgroundColor: Colors.teal,
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    SizedBox(
                      height: 300,
                      child: _buildChart(),
                    ),
                    SizedBox(height: 16),
                    _buildTable(),
                  ],
                ),
              ),
            ),
    );
  }
}
