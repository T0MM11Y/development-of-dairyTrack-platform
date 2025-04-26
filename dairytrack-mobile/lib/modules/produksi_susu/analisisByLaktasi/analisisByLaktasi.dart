import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:dairy_track/model/produktivitas/dairyMilkTotal.dart';
import 'package:dairy_track/config/api/produktivitas/dailyMilkTotal.dart';

class AnalisisByLaktasiPage extends StatefulWidget {
  @override
  _AnalisisByLaktasiPageState createState() => _AnalisisByLaktasiPageState();
}

class _AnalisisByLaktasiPageState extends State<AnalisisByLaktasiPage> {
  late Future<List<DailyMilkTotal>> _dailyMilkTotals;
  double _targetVolume = 15.0;
  String _selectedFilter = 'All';
  List<String> _filters = ['All', 'Early', 'Peak', 'Mid', 'Late'];
  int _touchedIndex = -1;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() {
    setState(() {
      _dailyMilkTotals = getDailyMilkTotals();
    });
  }

  String _getStatus(double volume) {
    if (volume >= _targetVolume * 1.1) return "Above Target";
    if (volume >= _targetVolume) return "On Track";
    if (volume >= _targetVolume * 0.8) return "Below Target";
    return "Far Below Target";
  }

  Color _getStatusColor(double volume) {
    if (volume >= _targetVolume * 1.1) return Colors.green;
    if (volume >= _targetVolume) return Colors.lightGreen;
    if (volume >= _targetVolume * 0.8) return Colors.orange;
    return Colors.red;
  }

  Color _getPhaseColor(String phase) {
    switch (phase) {
      case 'Early':
        return Colors.blue;
      case 'Peak':
        return Colors.green;
      case 'Mid':
        return Colors.orange;
      case 'Late':
        return Colors.red;
      default:
        return Colors.purple;
    }
  }

  List<DailyMilkTotal> _filterData(List<DailyMilkTotal> data) {
    if (_selectedFilter == 'All') return data;
    return data
        .where((item) => item.cow?.lactationPhase == _selectedFilter)
        .toList();
  }

  Map<String, double> _calculatePhaseAverages(List<DailyMilkTotal> data) {
    Map<String, List<double>> phaseVolumes = {
      'Early': [],
      'Peak': [],
      'Mid': [],
      'Late': [],
    };

    for (var item in data) {
      if (item.cow?.lactationPhase != null) {
        phaseVolumes[item.cow!.lactationPhase]?.add(item.totalVolume);
      }
    }

    return {
      'Early': phaseVolumes['Early']?.isEmpty ?? true
          ? 0
          : phaseVolumes['Early']!.reduce((a, b) => a + b) /
              phaseVolumes['Early']!.length,
      'Peak': phaseVolumes['Peak']?.isEmpty ?? true
          ? 0
          : phaseVolumes['Peak']!.reduce((a, b) => a + b) /
              phaseVolumes['Peak']!.length,
      'Mid': phaseVolumes['Mid']?.isEmpty ?? true
          ? 0
          : phaseVolumes['Mid']!.reduce((a, b) => a + b) /
              phaseVolumes['Mid']!.length,
      'Late': phaseVolumes['Late']?.isEmpty ?? true
          ? 0
          : phaseVolumes['Late']!.reduce((a, b) => a + b) /
              phaseVolumes['Late']!.length,
    };
  }

  Map<String, List<DailyMilkTotal>> _groupByPhase(List<DailyMilkTotal> data) {
    Map<String, List<DailyMilkTotal>> groupedData = {
      'Early': [],
      'Peak': [],
      'Mid': [],
      'Late': [],
    };

    for (var item in data) {
      if (item.cow?.lactationPhase != null) {
        groupedData[item.cow!.lactationPhase]?.add(item);
      }
    }

    return groupedData;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Analysis by Lactation'),
        actions: [
          DropdownButton<String>(
            value: _selectedFilter,
            items: _filters.map((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
            onChanged: (String? newValue) {
              setState(() {
                _selectedFilter = newValue!;
              });
            },
          ),
          SizedBox(width: 16),
        ],
      ),
      body: FutureBuilder<List<DailyMilkTotal>>(
        future: _dailyMilkTotals,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.error_outline, size: 48, color: Colors.red),
                  SizedBox(height: 16),
                  Text('Error: ${snapshot.error}'),
                  SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _loadData,
                    child: Text('Retry'),
                  ),
                ],
              ),
            );
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Text('No data available'),
            );
          }

          final filteredData = _filterData(snapshot.data!);
          final phaseAverages = _calculatePhaseAverages(snapshot.data!);
          final groupedData = _groupByPhase(snapshot.data!);

          return SingleChildScrollView(
            child: Column(
              children: [
                // Summary Cards
                Padding(
                  padding: EdgeInsets.all(8.0),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Expanded(
                            child: _buildSummaryCard(
                                'Early', phaseAverages['Early']!, Colors.blue),
                          ),
                          SizedBox(width: 8.0),
                          Expanded(
                            child: _buildSummaryCard(
                                'Peak', phaseAverages['Peak']!, Colors.green),
                          ),
                        ],
                      ),
                      SizedBox(height: 8.0),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Expanded(
                            child: _buildSummaryCard(
                                'Mid', phaseAverages['Mid']!, Colors.orange),
                          ),
                          SizedBox(width: 8.0),
                          Expanded(
                            child: _buildSummaryCard(
                                'Late', phaseAverages['Late']!, Colors.red),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // Wrap all charts in a horizontal scrollable container
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      // Bar Chart - Average by Lactation Phase
                      Container(
                        width: 300, // Set a fixed width for each chart
                        height: 300,
                        padding: EdgeInsets.all(16),
                        child: BarChart(
                          BarChartData(
                            alignment: BarChartAlignment.spaceAround,
                            maxY: phaseAverages.values
                                    .reduce((a, b) => a > b ? a : b) *
                                1.2,
                            barTouchData: BarTouchData(
                              enabled: true,
                              touchTooltipData: BarTouchTooltipData(
                                getTooltipItem:
                                    (group, groupIndex, rod, rodIndex) {
                                  final phase = _filters[groupIndex + 1];
                                  return BarTooltipItem(
                                    '$phase\n${rod.toY.toStringAsFixed(2)} L',
                                    TextStyle(
                                      color: _getPhaseColor(phase),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  );
                                },
                              ),
                            ),
                            titlesData: FlTitlesData(
                              show: true,
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  getTitlesWidget: (value, meta) {
                                    return Padding(
                                      padding: const EdgeInsets.only(top: 8.0),
                                      child: Text(
                                        _filters[value.toInt() + 1],
                                        style: TextStyle(
                                          color: _getPhaseColor(
                                              _filters[value.toInt() + 1]),
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    );
                                  },
                                  reservedSize: 40,
                                ),
                              ),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 40,
                                ),
                              ),
                            ),
                            borderData: FlBorderData(show: false),
                            barGroups: [
                              BarChartGroupData(
                                x: 0,
                                barRods: [
                                  BarChartRodData(
                                    toY: phaseAverages['Early']!,
                                    color: Colors.blue,
                                    width: 20,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ],
                              ),
                              BarChartGroupData(
                                x: 1,
                                barRods: [
                                  BarChartRodData(
                                    toY: phaseAverages['Peak']!,
                                    color: Colors.green,
                                    width: 20,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ],
                              ),
                              BarChartGroupData(
                                x: 2,
                                barRods: [
                                  BarChartRodData(
                                    toY: phaseAverages['Mid']!,
                                    color: Colors.orange,
                                    width: 20,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ],
                              ),
                              BarChartGroupData(
                                x: 3,
                                barRods: [
                                  BarChartRodData(
                                    toY: phaseAverages['Late']!,
                                    color: Colors.red,
                                    width: 20,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Pie Chart - Distribution by Phase
                      Container(
                        width: 300, // Set a fixed width for each chart
                        height: 300,
                        padding: EdgeInsets.all(16),
                        child: PieChart(
                          PieChartData(
                            pieTouchData: PieTouchData(
                              touchCallback:
                                  (FlTouchEvent event, pieTouchResponse) {
                                setState(() {
                                  if (!event.isInterestedForInteractions ||
                                      pieTouchResponse == null ||
                                      pieTouchResponse.touchedSection == null) {
                                    _touchedIndex = -1;
                                    return;
                                  }
                                  _touchedIndex = pieTouchResponse
                                      .touchedSection!.touchedSectionIndex;
                                });
                              },
                            ),
                            sectionsSpace: 0,
                            centerSpaceRadius: 60,
                            sections: [
                              PieChartSectionData(
                                color: Colors.blue,
                                value: groupedData['Early']!.length.toDouble(),
                                title: '${groupedData['Early']!.length}',
                                radius: _touchedIndex == 0 ? 50 : 40,
                                titleStyle: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              PieChartSectionData(
                                color: Colors.green,
                                value: groupedData['Peak']!.length.toDouble(),
                                title: '${groupedData['Peak']!.length}',
                                radius: _touchedIndex == 1 ? 50 : 40,
                                titleStyle: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              PieChartSectionData(
                                color: Colors.orange,
                                value: groupedData['Mid']!.length.toDouble(),
                                title: '${groupedData['Mid']!.length}',
                                radius: _touchedIndex == 2 ? 50 : 40,
                                titleStyle: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              PieChartSectionData(
                                color: Colors.red,
                                value: groupedData['Late']!.length.toDouble(),
                                title: '${groupedData['Late']!.length}',
                                radius: _touchedIndex == 3 ? 50 : 40,
                                titleStyle: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      // Line Chart - Trend by Date
                      Container(
                        width: 300, // Set a fixed width for each chart
                        height: 300,
                        padding: EdgeInsets.all(16),
                        child: LineChart(
                          LineChartData(
                            lineTouchData: LineTouchData(
                              enabled: true,
                              touchTooltipData: LineTouchTooltipData(
                                getTooltipItems:
                                    (List<LineBarSpot> touchedSpots) {
                                  return touchedSpots.map((spot) {
                                    final date = DateFormat('MMM dd').format(
                                      spot.x.toInt() == 0
                                          ? groupedData['Early']![
                                                  spot.spotIndex]
                                              .date
                                          : spot.x.toInt() == 1
                                              ? groupedData['Peak']![
                                                      spot.spotIndex]
                                                  .date
                                              : spot.x.toInt() == 2
                                                  ? groupedData['Mid']![
                                                          spot.spotIndex]
                                                      .date
                                                  : groupedData['Late']![
                                                          spot.spotIndex]
                                                      .date,
                                    );
                                    return LineTooltipItem(
                                      '${_filters[spot.x.toInt() + 1]}\n$date\n${spot.y.toStringAsFixed(2)} L',
                                      TextStyle(
                                          color: _getPhaseColor(
                                              _filters[spot.x.toInt() + 1])),
                                    );
                                  }).toList();
                                },
                              ),
                            ),
                            gridData: FlGridData(show: true),
                            titlesData: FlTitlesData(
                              show: true,
                              bottomTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 22,
                                ),
                              ),
                              leftTitles: AxisTitles(
                                sideTitles: SideTitles(
                                  showTitles: true,
                                  reservedSize: 40,
                                ),
                              ),
                            ),
                            borderData: FlBorderData(
                              show: true,
                              border: Border.all(
                                  color: const Color(0xff37434d), width: 1),
                            ),
                            minX: 0,
                            maxX: 4,
                            minY: 0,
                            maxY: snapshot.data!
                                    .map((e) => e.totalVolume)
                                    .reduce((a, b) => a > b ? a : b) *
                                1.2,
                            lineBarsData: [
                              LineChartBarData(
                                spots: groupedData['Early']!
                                    .asMap()
                                    .entries
                                    .map((e) => FlSpot(0, e.value.totalVolume))
                                    .toList(),
                                isCurved: true,
                                color: Colors.blue,
                                barWidth: 4,
                                isStrokeCapRound: true,
                                dotData: FlDotData(show: false),
                                belowBarData: BarAreaData(show: false),
                              ),
                              LineChartBarData(
                                spots: groupedData['Peak']!
                                    .asMap()
                                    .entries
                                    .map((e) => FlSpot(1, e.value.totalVolume))
                                    .toList(),
                                isCurved: true,
                                color: Colors.green,
                                barWidth: 4,
                                isStrokeCapRound: true,
                                dotData: FlDotData(show: false),
                                belowBarData: BarAreaData(show: false),
                              ),
                              LineChartBarData(
                                spots: groupedData['Mid']!
                                    .asMap()
                                    .entries
                                    .map((e) => FlSpot(2, e.value.totalVolume))
                                    .toList(),
                                isCurved: true,
                                color: Colors.orange,
                                barWidth: 4,
                                isStrokeCapRound: true,
                                dotData: FlDotData(show: false),
                                belowBarData: BarAreaData(show: false),
                              ),
                              LineChartBarData(
                                spots: groupedData['Late']!
                                    .asMap()
                                    .entries
                                    .map((e) => FlSpot(3, e.value.totalVolume))
                                    .toList(),
                                isCurved: true,
                                color: Colors.red,
                                barWidth: 4,
                                isStrokeCapRound: true,
                                dotData: FlDotData(show: false),
                                belowBarData: BarAreaData(show: false),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Data Table
                // Ganti bagian Data Table dengan tampilan berbasis kartu
                SingleChildScrollView(
                  child: Column(
                    children: filteredData.map((milkTotal) {
                      final status = _getStatus(milkTotal.totalVolume);
                      return Card(
                        elevation: 6, // Tambahkan bayangan untuk efek 3D
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(16), // Sudut membulat
                        ),
                        margin:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        child: Padding(
                          padding: EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  CircleAvatar(
                                    backgroundColor: Colors.brown[200],
                                    child: Icon(
                                      Icons.pets, // Ikon sapi
                                      color: Colors.brown[800],
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      milkTotal.cow?.name ?? 'Unknown Cow',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 18,
                                        color: Colors.brown[800],
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(
                                          milkTotal.totalVolume),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      status,
                                      style: TextStyle(color: Colors.white),
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 16),
                              Divider(color: Colors.grey[300]), // Garis pemisah
                              SizedBox(height: 16),
                              Row(
                                children: [
                                  Icon(Icons.calendar_today,
                                      color: Colors.blue[700], size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Date:',
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  Spacer(),
                                  Text(
                                    DateFormat('MMM dd, yyyy')
                                        .format(milkTotal.date),
                                    style: TextStyle(color: Colors.grey[700]),
                                  ),
                                ],
                              ),
                              SizedBox(height: 12),
                              Row(
                                children: [
                                  Icon(Icons.local_drink,
                                      color: Colors.blue[700], size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Volume:',
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  Spacer(),
                                  Text(
                                    '${milkTotal.totalVolume.toStringAsFixed(2)} L',
                                    style: TextStyle(color: Colors.blue[700]),
                                  ),
                                ],
                              ),
                              SizedBox(height: 12),
                              Row(
                                children: [
                                  Icon(Icons.grass,
                                      color: Colors.green[700], size: 20),
                                  SizedBox(width: 8),
                                  Text(
                                    'Lactation:',
                                    style:
                                        TextStyle(fontWeight: FontWeight.bold),
                                  ),
                                  Spacer(),
                                  Container(
                                    padding: EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getPhaseColor(
                                          milkTotal.cow?.lactationPhase ?? ''),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      milkTotal.cow?.lactationPhase ??
                                          'Unknown',
                                      style: TextStyle(color: Colors.white),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSummaryCard(String phase, double average, Color color) {
    return Card(
      elevation: 4, // Tambahkan bayangan
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12), // Sudut membulat
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [color.withOpacity(0.3), color.withOpacity(0.1)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Padding(
          padding: EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Icon(
                    Icons.water_drop, // Ikon tetesan air
                    color: color,
                    size: 28,
                  ),
                  SizedBox(width: 12),
                  Text(
                    phase,
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              Text(
                '${average.toStringAsFixed(2)} L',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              SizedBox(height: 6),
              Text(
                'Avg. Production',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLegendItem(Color color, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4.0),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 12,
            height: 12,
            color: color,
          ),
          SizedBox(width: 4),
          Text(
            text,
            style: TextStyle(fontSize: 12),
          ),
        ],
      ),
    );
  }
}
