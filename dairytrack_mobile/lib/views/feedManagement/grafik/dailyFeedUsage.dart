import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../../../controller/APIURL4/dailyFeedItemController.dart';

class FeedUsagePage extends StatefulWidget {
  const FeedUsagePage({super.key});

  @override
  _FeedUsagePageState createState() => _FeedUsagePageState();
}

class _FeedUsagePageState extends State<FeedUsagePage> {
  final DailyFeedItemManagementController _controller =
      DailyFeedItemManagementController();
  List<Map<String, dynamic>> _feedUsageData = [];
  List<Map<String, dynamic>> _dailyData = [];
  bool _isLoading = true;
  String _errorMessage = '';
  int? _userId;
  DateTime _selectedStartDate = DateTime(2025, 6, 9); // 9 Juni 2025
  DateTime _selectedEndDate = DateTime(2025, 6, 16); // 16 Juni 2025

  List<String> _feedNames = [
    'Ampas Tahu',
    'Dedak',
    'Jagung Giling',
    'Kulit Kacang',
    'Rumput Gajah',
    'Vitamin B Complex',
  ];

  Map<String, Color> _feedColors = {
    'Ampas Tahu': const Color(0xFF4FC3F7),
    'Dedak': const Color(0xFF66BB6A),
    'Jagung Giling': const Color(0xFFEF5350),
    'Kulit Kacang': const Color(0xFFFF9800),
    'Rumput Gajah': const Color(0xFFAB47BC),
    'Vitamin B Complex': const Color(0xFF26A69A),
  };

  @override
  void initState() {
    super.initState();
    _loadUserIdAndFetchData();
  }

  Future<void> _loadUserIdAndFetchData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final userId = prefs.getInt('userId');
      if (userId == null) {
        setState(() {
          _errorMessage = 'User ID tidak ditemukan. Silakan login ulang.';
          _isLoading = false;
        });
        return;
      }
      setState(() {
        _userId = userId;
      });
      await _fetchFeedUsage();
    } catch (e) {
      setState(() {
        _errorMessage = 'Gagal memuat user ID: $e';
        _isLoading = false;
      });
    }
  }

  Future<void> _fetchFeedUsage() async {
    if (_userId == null) return;
    setState(() => _isLoading = true);
    try {
      final startDateStr = DateFormat('yyyy-MM-dd').format(_selectedStartDate);
      final endDateStr = DateFormat('yyyy-MM-dd').format(_selectedEndDate);

      final response = await _controller.getFeedUsageByDate(
        userId: _userId!,
        startDate: startDateStr,
        endDate: endDateStr,
      );
      if (!mounted) return;

      if (response['success']) {
        final data = response['data'] as List<dynamic>;
        final feedUsage = data.map((item) {
          final feeds =
              (item['feeds'] as List<dynamic>).cast<Map<String, dynamic>>();
          return {
            'date': item['date'] as String,
            'feeds': feeds,
          };
        }).toList();

        final dailyData = _processDailyData(feedUsage);

        setState(() {
          _feedUsageData = feedUsage;
          _dailyData = dailyData;
          _isLoading = false;
          _errorMessage = '';
        });
      } else {
        setState(() {
          _errorMessage =
              response['message'] ?? 'Gagal memuat data penggunaan pakan';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Gagal memuat data: $e';
          _isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> _processDailyData(
      List<Map<String, dynamic>> data) {
    final Map<String, List<Map<String, dynamic>>> dailyFeeds = {};
    final dateFormat = DateFormat('yyyy-MM-dd');

    // Tambahkan semua tanggal dari 9 Juni hingga 16 Juni 2025
    DateTime currentDate = _selectedStartDate;
    while (currentDate.isBefore(_selectedEndDate) ||
        currentDate.isAtSameMomentAs(_selectedEndDate)) {
      final dateStr = dateFormat.format(currentDate);
      if (!dailyFeeds.containsKey(dateStr)) {
        dailyFeeds[dateStr] = [];
      }
      currentDate = currentDate.add(const Duration(days: 1));
    }

    // Isi data dari API
    for (var item in data) {
      final dateStr = item['date'] as String;
      final feeds = item['feeds'] as List<Map<String, dynamic>>;
      if (dailyFeeds.containsKey(dateStr)) {
        dailyFeeds[dateStr]!.addAll(feeds);
      }
    }

    final List<Map<String, dynamic>> result = [];
    for (var entry in dailyFeeds.entries) {
      final dateStr = entry.key;
      final date = dateFormat.parse(dateStr);
      final dayName = DateFormat('EEEE', 'id_ID').format(date);
      final dateDisplay = DateFormat('dd MMM').format(date);

      final Map<String, double> feedTotals = {};
      for (var feedName in _feedNames) {
        feedTotals[feedName] = 0.0; // Default 0 jika tidak ada data
      }
      for (var feed in entry.value) {
        final feedName = feed['feed_name'] as String;
        final quantity = double.parse(feed['quantity_kg'] as String);
        feedTotals[feedName] = (feedTotals[feedName] ?? 0) + quantity;
      }

      result.add({
        'date': dateStr,
        'dayName': dayName,
        'dateDisplay': dateDisplay,
        'feeds': feedTotals,
      });
    }

    result.sort((a, b) => (a['date'] as String).compareTo(b['date'] as String));
    return result;
  }

  Future<void> _selectDateRange() async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      initialDateRange: DateTimeRange(
        start: _selectedStartDate,
        end: _selectedEndDate,
      ),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: Colors.teal,
              onPrimary: Colors.white,
              surface: Colors.white,
              onSurface: Colors.black,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        _selectedStartDate = picked.start;
        _selectedEndDate = picked.end;
      });
      await _fetchFeedUsage();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Penggunaan Pakan Harian',
            style: TextStyle(
                color: Colors.white,
                fontSize: 18,
                fontWeight: FontWeight.w600)),
        backgroundColor: Colors.teal,
        elevation: 2,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            child: IconButton(
              icon: const Icon(Icons.date_range, color: Colors.white),
              onPressed: _selectDateRange,
              tooltip: 'Pilih Periode',
            ),
          ),
        ],
      ),
      backgroundColor: Colors.grey[50],
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline,
                          size: 64, color: Colors.red[300]),
                      const SizedBox(height: 16),
                      Text(
                        _errorMessage,
                        style: const TextStyle(color: Colors.red, fontSize: 16),
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                )
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16.0),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Periode Data',
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  '${DateFormat('dd MMM yyyy').format(_selectedStartDate)} - ${DateFormat('dd MMM yyyy').format(_selectedEndDate)}',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.teal,
                                  ),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              onPressed: _selectDateRange,
                              icon: const Icon(Icons.edit_calendar, size: 16),
                              label: const Text('Ubah',
                                  style: TextStyle(fontSize: 13)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.teal,
                                foregroundColor: Colors.white,
                                elevation: 0,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 8),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Grafik Penggunaan Pakan Harian',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.teal,
                                ),
                              ),
                              const SizedBox(height: 16),
                              // Legenda Pakan di atas grafik
                              GridView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                gridDelegate:
                                    const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 3,
                                  childAspectRatio: 2.5,
                                  crossAxisSpacing: 8,
                                  mainAxisSpacing: 4,
                                ),
                                itemCount: _feedNames.length,
                                itemBuilder: (context, index) {
                                  final feedName = _feedNames[index];
                                  return Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 12,
                                        height: 12,
                                        decoration: BoxDecoration(
                                          color: _feedColors[feedName],
                                          borderRadius:
                                              BorderRadius.circular(4),
                                        ),
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        feedName,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                              const SizedBox(height: 16),
                              if (_dailyData.isNotEmpty)
                                SizedBox(
                                  height: 300,
                                  child: LineChart(
                                    LineChartData(
                                      gridData: FlGridData(
                                        show: true,
                                        drawVerticalLine: true,
                                        getDrawingHorizontalLine: (value) {
                                          return FlLine(
                                            color: Colors.grey.withOpacity(0.2),
                                            strokeWidth: 0.5,
                                          );
                                        },
                                        getDrawingVerticalLine: (value) {
                                          return FlLine(
                                            color: Colors.grey.withOpacity(0.2),
                                            strokeWidth: 0.5,
                                          );
                                        },
                                      ),
                                      titlesData: FlTitlesData(
                                        show: true,
                                        bottomTitles: AxisTitles(
                                          sideTitles: SideTitles(
                                            showTitles: true,
                                            reservedSize: 22,
                                            getTitlesWidget: (value, meta) {
                                              final index = value.toInt();
                                              if (index >= 0 &&
                                                  index < _dailyData.length) {
                                                return Text(
                                                  _dailyData[index]
                                                      ['dateDisplay'],
                                                  style: const TextStyle(
                                                    fontSize: 10,
                                                    color: Colors.black87,
                                                    fontWeight: FontWeight.w500,
                                                  ),
                                                );
                                              }
                                              return const Text('');
                                            },
                                          ),
                                        ),
                                        leftTitles: AxisTitles(
                                          sideTitles: SideTitles(
                                            showTitles: true,
                                            reservedSize: 28,
                                            getTitlesWidget: (value, meta) {
                                              return Text(
                                                value.toInt().toString(),
                                                style: TextStyle(
                                                  fontSize: 10,
                                                  color: Colors.grey[600],
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              );
                                            },
                                          ),
                                        ),
                                        topTitles: const AxisTitles(
                                          sideTitles: SideTitles(showTitles: false),
                                        ),
                                        rightTitles: const AxisTitles(
                                          sideTitles: SideTitles(showTitles: false),
                                        ),
                                      ),
                                      borderData: FlBorderData(
                                        show: true,
                                        border: Border.all(
                                            color:
                                                Colors.grey.withOpacity(0.3)),
                                      ),
                                      minX: 0,
                                      maxX: _dailyData.length - 1,
                                      minY: 0,
                                      maxY: _getMaxValue(),
                                      lineBarsData: _buildLineChartData(),
                                      // Parameter yang benar untuk interaksi dan tooltip
                                      lineTouchData: LineTouchData(
                                        enabled: true,
                                        touchTooltipData: LineTouchTooltipData(
                                          getTooltipColor: (touchedSpot) => Colors.grey[800] ?? Colors.black,
                                          tooltipMargin: 8,
                                          getTooltipItems: (List<LineBarSpot> touchedSpots) {
                                            return touchedSpots.map((spot) {
                                              if (spot.barIndex < 0 || spot.barIndex >= _feedNames.length) {
                                                return LineTooltipItem(
                                                  'Data tidak tersedia',
                                                  const TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 12,
                                                  ),
                                                );
                                              }
                                              final feedName = _feedNames[spot.barIndex];
                                              return LineTooltipItem(
                                                '$feedName\n${spot.y.toStringAsFixed(0)} kg',
                                                const TextStyle(
                                                  color: Colors.white,
                                                  fontSize: 12,
                                                ),
                                              );
                                            }).toList();
                                          },
                                        ),
                                      ),
                                    ),
                                  ),
                                )
                              else
                                Container(
                                  height: 200,
                                  child: Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(Icons.show_chart,
                                            size: 48, color: Colors.grey[400]),
                                        const SizedBox(height: 16),
                                        Text(
                                          'Tidak ada data untuk periode yang dipilih',
                                          style: TextStyle(
                                            fontSize: 16,
                                            color: Colors.grey[600],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.05),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Detail Penggunaan Pakan Harian',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.teal,
                                ),
                              ),
                              const SizedBox(height: 16),
                              if (_dailyData.isNotEmpty)
                                SingleChildScrollView(
                                  scrollDirection: Axis.horizontal,
                                  child: DataTable(
                                    columnSpacing: 16.0,
                                    columns: [
                                      DataColumn(
                                        label: Text('Tanggal',
                                            style: TextStyle(
                                                fontWeight: FontWeight.bold)),
                                      ),
                                      ..._feedNames.map((feed) => DataColumn(
                                            label: Text(feed,
                                                style: TextStyle(
                                                    fontWeight: FontWeight.bold)),
                                          )),
                                    ],
                                    rows: _dailyData.map((dayData) {
                                      final dateDisplay = dayData['dateDisplay'] ?? '';
                                      final feeds = dayData['feeds'] as Map<String, dynamic>? ?? {};
                                      return DataRow(
                                        cells: [
                                          DataCell(Text(dateDisplay.toString())),
                                          ..._feedNames.map((feedName) {
                                            final quantity = (feeds[feedName] as num?)?.toDouble() ?? 0.0;
                                            return DataCell(Text(
                                              quantity.toStringAsFixed(0),
                                              style: TextStyle(fontSize: 14),
                                            ));
                                          }),
                                        ],
                                      );
                                    }).toList(),
                                  ),
                                )
                              else
                                Center(
                                  child: Text(
                                    'Tidak ada data untuk ditampilkan',
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }

  double _getMaxValue() {
    double maxValue = 0;
    for (var dayData in _dailyData) {
      final feeds = dayData['feeds'] as Map<String, dynamic>?;
      if (feeds != null) {
        for (var quantity in feeds.values) {
          final numValue = (quantity as num?)?.toDouble() ?? 0.0;
          if (numValue > maxValue) maxValue = numValue;
        }
      }
    }
    return maxValue > 0 ? (maxValue * 1.2).ceilToDouble() : 60;
  }

  List<LineChartBarData> _buildLineChartData() {
    return _feedNames.map((feedName) {
      final List<FlSpot> spots = [];
      for (int i = 0; i < _dailyData.length; i++) {
        final feeds = _dailyData[i]['feeds'] as Map<String, dynamic>?;
        if (feeds != null) {
          final quantity = (feeds[feedName] as num?)?.toDouble() ?? 0.0;
          spots.add(FlSpot(i.toDouble(), quantity));
        } else {
          spots.add(FlSpot(i.toDouble(), 0.0));
        }
      }
      final color = _feedColors[feedName] ?? Colors.blue;
      return LineChartBarData(
        spots: spots,
        isCurved: true,
        color: color,
        barWidth: 2,
        dotData: FlDotData(show: true),
        belowBarData: BarAreaData(
          show: true,
          color: color.withOpacity(0.3),
        ),
      );
    }).toList();
  }
}