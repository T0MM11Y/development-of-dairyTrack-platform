import 'package:dairy_track/config/api/produktivitas/dailyMilkTotal.dart';
import 'package:dairy_track/modules/produksi_susu/trendProduksiSusu/trenProduksiSusuDetail.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/model/produktivitas/dairyMilkTotal.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:syncfusion_flutter_datepicker/datepicker.dart';

class TrenProduksiSusuPage extends StatefulWidget {
  @override
  _TrenProduksiSusuPageState createState() => _TrenProduksiSusuPageState();
}

class _TrenProduksiSusuPageState extends State<TrenProduksiSusuPage> {
  late Future<List<DailyMilkTotal>> _dailyMilkTotals;
  DateTimeRange? _dateRange;
  String _selectedFilter = '7 Days';
  bool _showAverage = true;
  bool _showTarget = false;
  String? _selectedCow;
  double _targetVolume = 15.0;
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    final endDate = DateTime.now();
    final startDate = endDate.subtract(Duration(days: 7));
    _dateRange = DateTimeRange(start: startDate, end: endDate);
    _loadData();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _loadData() {
    setState(() {
      _dailyMilkTotals = getDailyMilkTotals(
        startDate: _dateRange?.start,
        endDate: _dateRange?.end,
        cowName: _selectedCow,
      );
    });
  }

  List<DailyMilkTotal> _filterByCow(List<DailyMilkTotal> data) {
    if (_selectedCow == null || _selectedCow!.isEmpty) {
      return data;
    }
    return data.where((item) => item.cow?.name == _selectedCow).toList();
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
    if (volume >= _targetVolume * 0.8) return Colors.blue;
    return Colors.red;
  }

  Future<void> _selectDateRange(BuildContext context) async {
    final DateRangePickerController _dateRangeController =
        DateRangePickerController();

    if (_dateRange != null) {
      _dateRangeController.selectedRange = PickerDateRange(
        _dateRange!.start,
        _dateRange!.end,
      );
    }

    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Select Date Range'),
        content: Container(
          width: MediaQuery.of(context).size.width * 0.9,
          height: MediaQuery.of(context).size.height * 0.5,
          child: SfDateRangePicker(
            controller: _dateRangeController,
            view: DateRangePickerView.month,
            selectionMode: DateRangePickerSelectionMode.range,
            maxDate: DateTime.now(),
            showActionButtons: true,
            onSubmit: (value) {
              if (_dateRangeController.selectedRange != null) {
                final PickerDateRange range =
                    _dateRangeController.selectedRange!;
                if (range.startDate != null && range.endDate != null) {
                  setState(() {
                    _dateRange = DateTimeRange(
                      start: range.startDate!,
                      end: range.endDate!,
                    );
                    _selectedFilter = 'Custom';
                    _loadData();
                  });
                }
                Navigator.pop(context);
              }
            },
            onCancel: () => Navigator.pop(context),
          ),
        ),
      ),
    );
  }

  void _applyQuickFilter(String filter) {
    final now = DateTime.now();
    DateTime startDate;

    switch (filter) {
      case '7 Days':
        startDate = now.subtract(Duration(days: 7));
        break;
      case '30 Days':
        startDate = now.subtract(Duration(days: 30));
        break;
      case '3 Months':
        startDate = now.subtract(Duration(days: 90));
        break;
      case '6 Months':
        startDate = now.subtract(Duration(days: 180));
        break;
      case '1 Year':
        startDate = now.subtract(Duration(days: 365));
        break;
      default:
        startDate = now.subtract(Duration(days: 7));
    }

    setState(() {
      _dateRange = DateTimeRange(start: startDate, end: now);
      _selectedFilter = filter;
      _loadData();
    });
  }

  Widget _buildFilterChips() {
    final filters = [
      '7 Days',
      '30 Days',
      '3 Months',
      '6 Months',
      '1 Year',
      'Custom'
    ];

    return Container(
      height: 50,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: filters.map((filter) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4.0),
            child: FilterChip(
              label: Text(filter),
              selected: _selectedFilter == filter,
              selectedColor: Theme.of(context).primaryColor.withOpacity(0.2),
              checkmarkColor: Theme.of(context).primaryColor,
              onSelected: (selected) {
                if (filter == 'Custom') {
                  _selectDateRange(context);
                } else {
                  _applyQuickFilter(filter);
                }
              },
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCowFilter(List<String> cowNames) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8.0),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _selectedCow,
          hint: Text('All Cows'),
          isExpanded: true,
          items: [
            DropdownMenuItem<String>(
              value: null,
              child: Text('All Cows'),
            ),
            ...cowNames.map((name) {
              return DropdownMenuItem(
                value: name,
                child: Text(name),
              );
            }).toList(),
          ],
          onChanged: (value) {
            setState(() {
              _selectedCow = value;
              _loadData();
            });
          },
        ),
      ),
    );
  }

  Widget _buildLegend() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _legendItem(Colors.blue, 'Volume'),
          SizedBox(width: 16),
          if (_showAverage) _legendItem(Colors.orange, 'Average'),
          if (_showAverage) SizedBox(width: 16),
          if (_showTarget) _legendItem(Colors.green, 'Target'),
        ],
      ),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 16,
          height: 4,
          color: color,
        ),
        SizedBox(width: 4),
        Text(label, style: TextStyle(fontSize: 12)),
      ],
    );
  }

  Widget _buildChart(List<DailyMilkTotal> dailyMilkTotals) {
    final dateFormat = DateFormat('dd/MM');
    final filteredData = _filterByCow(dailyMilkTotals);
    final sortedData = List<DailyMilkTotal>.from(filteredData)
      ..sort((a, b) => a.date.compareTo(b.date));

    if (sortedData.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Text('No data available for the selected criteria'),
        ),
      );
    }

    // Calculate average
    final averageVolume = sortedData.isNotEmpty
        ? sortedData.map((e) => e.totalVolume).reduce((a, b) => a + b) /
            sortedData.length
        : 0;

    return Column(
      children: [
        Container(
          height: 300,
          padding: EdgeInsets.all(16.0),
          child: LineChart(
            LineChartData(
              gridData: FlGridData(
                show: true,
                drawVerticalLine: true,
                horizontalInterval: 5,
                verticalInterval: 1,
              ),
              titlesData: FlTitlesData(
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    interval: 5,
                    reservedSize: 40,
                    getTitlesWidget: (value, meta) {
                      return Text(
                        '${value.toInt()} L',
                        style: TextStyle(fontSize: 10, color: Colors.grey[600]),
                      );
                    },
                  ),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (value, meta) {
                      final index = value.toInt();
                      if (index >= 0 &&
                          index < sortedData.length &&
                          index % 2 == 0) {
                        return Padding(
                          padding: const EdgeInsets.only(top: 8.0),
                          child: Text(
                            dateFormat.format(sortedData[index].date),
                            style: TextStyle(
                                fontSize: 10, color: Colors.grey[600]),
                          ),
                        );
                      }
                      return SizedBox.shrink();
                    },
                    reservedSize: 30,
                  ),
                ),
                topTitles:
                    AxisTitles(sideTitles: SideTitles(showTitles: false)),
                rightTitles:
                    AxisTitles(sideTitles: SideTitles(showTitles: false)),
              ),
              borderData: FlBorderData(
                  show: true, border: Border.all(color: Colors.grey[300]!)),
              lineBarsData: [
                LineChartBarData(
                  spots: sortedData
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
                  isStrokeCapRound: true,
                  belowBarData: BarAreaData(
                    show: true,
                    color: Colors.blue.withOpacity(0.1),
                  ),
                  dotData: FlDotData(
                    show: true,
                    getDotPainter: (spot, percent, barData, index) {
                      return FlDotCirclePainter(
                        radius: 4,
                        color: Colors.white,
                        strokeWidth: 2,
                        strokeColor: Colors.blue,
                      );
                    },
                  ),
                ),
                if (_showAverage)
                  LineChartBarData(
                    spots: [
                      FlSpot(0, averageVolume.toDouble()),
                      FlSpot((sortedData.length - 1).toDouble(),
                          averageVolume.toDouble()),
                    ],
                    isCurved: false,
                    color: Colors.orange,
                    barWidth: 2,
                    dashArray: [5, 5],
                    dotData: FlDotData(show: false),
                  ),
                if (_showTarget)
                  LineChartBarData(
                    spots: [
                      FlSpot(0, _targetVolume),
                      FlSpot((sortedData.length - 1).toDouble(), _targetVolume),
                    ],
                    isCurved: false,
                    color: Colors.green,
                    barWidth: 2,
                    dashArray: [5, 5],
                    dotData: FlDotData(show: false),
                  ),
              ],
              minX: 0,
              maxX: (sortedData.length - 1).toDouble(),
              minY: 0,
              maxY: sortedData.isNotEmpty
                  ? sortedData
                          .map((e) => e.totalVolume)
                          .reduce((a, b) => a > b ? a : b) *
                      1.2
                  : 20,
            ),
          ),
        ),
        _buildLegend(),
      ],
    );
  }

  Widget _buildStatsCard(List<DailyMilkTotal> data) {
    final filteredData = _filterByCow(data);

    if (filteredData.isEmpty) {
      return Card(
        margin: EdgeInsets.all(16.0),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Center(
            child: Text('No statistics available for the selected criteria'),
          ),
        ),
      );
    }

    final totalVolume =
        filteredData.map((e) => e.totalVolume).reduce((a, b) => a + b);
    final averageVolume = totalVolume / filteredData.length;
    final maxVolume =
        filteredData.map((e) => e.totalVolume).reduce((a, b) => a > b ? a : b);
    final minVolume =
        filteredData.map((e) => e.totalVolume).reduce((a, b) => a < b ? a : b);

    final dateFormat = DateFormat('MMM dd, yyyy');
    final startDate = dateFormat.format(_dateRange!.start);
    final endDate = dateFormat.format(_dateRange!.end);

    return Card(
      elevation: 3,
      margin: EdgeInsets.all(16.0),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Production Statistics',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                Text(
                  '$startDate - $endDate',
                  style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                ),
              ],
            ),
            Divider(height: 24),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'Total',
                    '${totalVolume.toStringAsFixed(1)} L',
                    Icons.opacity,
                    Colors.blue,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Average',
                    '${averageVolume.toStringAsFixed(1)} L',
                    Icons.bar_chart,
                    Colors.orange,
                  ),
                ),
              ],
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatItem(
                    'Maximum',
                    '${maxVolume.toStringAsFixed(1)} L',
                    Icons.arrow_upward,
                    Colors.green,
                  ),
                ),
                Expanded(
                  child: _buildStatItem(
                    'Minimum',
                    '${minVolume.toStringAsFixed(1)} L',
                    Icons.arrow_downward,
                    Colors.red,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(
      String label, String value, IconData icon, Color color) {
    return Card(
      elevation: 0,
      color: color.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, color: color, size: 16),
                SizedBox(width: 8),
                Text(
                  label,
                  style: TextStyle(color: Colors.grey[700]),
                ),
              ],
            ),
            SizedBox(height: 8),
            Text(
              value,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductionList(List<DailyMilkTotal> dailyMilkTotals) {
    final filteredData = _filterByCow(dailyMilkTotals);
    final sortedData = List<DailyMilkTotal>.from(filteredData)
      ..sort((a, b) => b.date.compareTo(a.date)); // Sort by date descending

    if (sortedData.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child:
              Text('No production records available for the selected criteria'),
        ),
      );
    }

    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: sortedData.length,
      itemBuilder: (context, index) {
        final milkTotal = sortedData[index];
        return Card(
          margin: EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          child: ListTile(
            contentPadding:
                EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
            leading: CircleAvatar(
              backgroundColor:
                  _getStatusColor(milkTotal.totalVolume).withOpacity(0.2),
              child: Icon(
                Icons.opacity,
                color: _getStatusColor(milkTotal.totalVolume),
                size: 20,
              ),
            ),
            title: Row(
              children: [
                Text(
                  milkTotal.cow?.name ?? 'Unknown Cow',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                SizedBox(width: 8),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getStatusColor(milkTotal.totalVolume),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _getStatus(milkTotal.totalVolume),
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(height: 4),
                Text(
                  DateFormat('EEEE, MMM dd, yyyy').format(milkTotal.date),
                  style: TextStyle(fontSize: 12),
                ),
                SizedBox(height: 4),
                Text(
                  '${milkTotal.totalVolume.toStringAsFixed(2)} L',
                  style: TextStyle(
                    color: _getStatusColor(milkTotal.totalVolume),
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            trailing: Icon(Icons.chevron_right),
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TrenProduksiSusuDetailPage(
                    milkTotal: milkTotal,
                    historicalData:
                        dailyMilkTotals, // Pass the required argument
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Milk Production Trend Analysis'),
        elevation: 0,
      ),
      body: FutureBuilder<List<DailyMilkTotal>>(
        future: _dailyMilkTotals,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
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
              ),
            );
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
            return Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.no_drinks, size: 48, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No production data available'),
                ],
              ),
            );
          }

          final dailyMilkTotals = snapshot.data!;
          final cowNames = dailyMilkTotals
              .map((e) => e.cow?.name ?? 'Unknown Cow')
              .toSet()
              .toList();

          return RefreshIndicator(
            onRefresh: () async {
              _loadData();
            },
            child: SingleChildScrollView(
              controller: _scrollController,
              physics: AlwaysScrollableScrollPhysics(),
              padding: EdgeInsets.only(bottom: 80),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    color: Theme.of(context).primaryColor.withOpacity(0.05),
                    padding: EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Date Range',
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                        SizedBox(height: 8),
                        _buildFilterChips(),
                      ],
                    ),
                  ),
                  _buildStatsCard(dailyMilkTotals),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Milk Volume Chart',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Row(
                          children: [
                            Switch(
                              value: _showAverage,
                              onChanged: (value) {
                                setState(() {
                                  _showAverage = value;
                                });
                              },
                            ),
                            Text('Avg'),
                            SizedBox(width: 8),
                            Switch(
                              value: _showTarget,
                              onChanged: (value) {
                                setState(() {
                                  _showTarget = value;
                                });
                              },
                            ),
                            Text('Target'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  _buildChart(dailyMilkTotals),
                  Divider(height: 32),
                  Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Filter by Cow',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 8),
                        _buildCowFilter(cowNames),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16.0),
                    child: Text(
                      'Production Records',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  SizedBox(height: 8),
                  _buildProductionList(dailyMilkTotals),
                ],
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: Text('Set Target Volume'),
              content: TextField(
                keyboardType: TextInputType.numberWithOptions(decimal: true),
                decoration: InputDecoration(
                  labelText: 'Target Volume (Liters)',
                  hintText: 'Enter target volume',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.flag),
                ),
                controller:
                    TextEditingController(text: _targetVolume.toString()),
                onChanged: (value) {
                  _targetVolume = double.tryParse(value) ?? _targetVolume;
                },
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    setState(() {});
                  },
                  child: Text('Save'),
                ),
              ],
            ),
          );
        },
        child: Icon(Icons.flag),
        tooltip: 'Set Target Volume',
      ),
    );
  }
}
