import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:dairy_track/model/produktivitas/dairyMilkTotal.dart';

class TrenProduksiSusuDetailPage extends StatelessWidget {
  final DailyMilkTotal milkTotal;
  final List<DailyMilkTotal> historicalData;

  TrenProduksiSusuDetailPage({
    required this.milkTotal,
    required this.historicalData,
  });

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('EEEE, MMM dd, yyyy');
    final formattedDate = dateFormat.format(milkTotal.date);

    // Filter historical data for the selected cow
    final cowData = historicalData
        .where((data) => data.cow?.name == milkTotal.cow?.name)
        .toList()
      ..sort((a, b) => a.date.compareTo(b.date));

    // Calculate statistics
    final totalVolume =
        cowData.fold(0.0, (sum, item) => sum + item.totalVolume);
    final averageVolume = cowData.isNotEmpty ? totalVolume / cowData.length : 0;
    final maxVolume = cowData.isNotEmpty
        ? cowData.map((e) => e.totalVolume).reduce((a, b) => a > b ? a : b)
        : 0;
    final minVolume = cowData.isNotEmpty
        ? cowData.map((e) => e.totalVolume).reduce((a, b) => a < b ? a : b)
        : 0;

    return Scaffold(
      appBar: AppBar(
        title: Text('Milk Production Detail'),
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.blue.shade100, Colors.blue.shade300],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Cow Details
              _buildInfoCard(
                icon: Icons.pets,
                label: 'Cow Name',
                value: milkTotal.cow?.name ?? 'Unknown Cow',
              ),
              SizedBox(height: 16),
              _buildInfoCard(
                icon: Icons.calendar_today,
                label: 'Date',
                value: formattedDate,
              ),
              SizedBox(height: 16),
              _buildInfoCard(
                icon: Icons.local_drink,
                label: 'Total Volume',
                value: '${milkTotal.totalVolume.toStringAsFixed(2)} L',
                valueColor: Colors.blue,
              ),
              SizedBox(height: 16),
              _buildInfoCard(
                icon: Icons.info,
                label: 'Status',
                value: () {
                  if (milkTotal.totalVolume < 15) {
                    return 'Below Normal';
                  } else if (milkTotal.totalVolume <= 25) {
                    return 'Normal';
                  } else {
                    return 'Above Normal';
                  }
                }(),
                valueColor: () {
                  if (milkTotal.totalVolume < 15) {
                    return Colors.red;
                  } else if (milkTotal.totalVolume <= 25) {
                    return Colors.blue;
                  } else {
                    return Colors.green;
                  }
                }(),
              ),
              SizedBox(height: 32),

              // Statistics
              Text(
                'Statistics:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStatCard('Average',
                      '${averageVolume.toStringAsFixed(2)} L', Colors.orange),
                  _buildStatCard('Maximum', '${maxVolume.toStringAsFixed(2)} L',
                      Colors.green),
                  _buildStatCard('Minimum', '${minVolume.toStringAsFixed(2)} L',
                      Colors.red),
                ],
              ),
              SizedBox(height: 32),

              // Chart
              Text(
                'Production Trend:',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              SizedBox(height: 16),
              cowData.isNotEmpty
                  ? Container(
                      height: 300,
                      child: LineChart(
                        LineChartData(
                          gridData: FlGridData(show: true),
                          titlesData: FlTitlesData(
                            leftTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                reservedSize: 40,
                                getTitlesWidget: (value, meta) {
                                  return Text(
                                    '${value.toInt()} L',
                                    style: TextStyle(fontSize: 10),
                                  );
                                },
                              ),
                            ),
                            bottomTitles: AxisTitles(
                              sideTitles: SideTitles(
                                showTitles: true,
                                getTitlesWidget: (value, meta) {
                                  final index = value.toInt();
                                  if (index >= 0 && index < cowData.length) {
                                    return Text(
                                      DateFormat('dd/MM')
                                          .format(cowData[index].date),
                                      style: TextStyle(fontSize: 10),
                                    );
                                  }
                                  return SizedBox.shrink();
                                },
                              ),
                            ),
                          ),
                          borderData: FlBorderData(show: true),
                          lineBarsData: [
                            LineChartBarData(
                              spots: cowData
                                  .asMap()
                                  .entries
                                  .map((entry) => FlSpot(
                                        entry.key.toDouble(),
                                        entry.value.totalVolume,
                                      ))
                                  .toList(),
                              isCurved: true,
                              color: Colors.blue,
                              barWidth: 3,
                              belowBarData: BarAreaData(
                                show: true,
                                color: Colors.blue.withOpacity(0.1),
                              ),
                            ),
                          ],
                          minX: 0,
                          maxX: (cowData.length - 1).toDouble(),
                          minY: 0,
                          maxY: maxVolume * 1.2,
                        ),
                      ),
                    )
                  : Center(
                      child: Text('No historical data available'),
                    ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoCard({
    required IconData icon,
    required String label,
    required String value,
    Color? valueColor,
  }) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          children: [
            Icon(icon, size: 32, color: Colors.blue),
            SizedBox(width: 16),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                ),
                SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: valueColor ?? Colors.black,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Card(
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              label,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
            SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
