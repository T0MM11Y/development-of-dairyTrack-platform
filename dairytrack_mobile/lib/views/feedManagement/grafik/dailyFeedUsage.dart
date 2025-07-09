import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import '../../../controller/APIURL4/dailyFeedItemController.dart';

enum FilterPeriod { today, thisWeek, thisMonth, thisYear, custom }

enum AggregationInterval { daily, weekly, monthly, yearly }

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
  DateTime _selectedStartDate = DateTime(2025, 6, 9);
  DateTime _selectedEndDate = DateTime(2025, 6, 16);

  FilterPeriod _selectedPeriod = FilterPeriod.custom;
  AggregationInterval _aggregationInterval = AggregationInterval.daily;
  double _zoomLevel = 1.0;
  double _minZoom = 0.5;
  double _maxZoom = 3.0;
  ScrollController _horizontalScrollController = ScrollController();

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

  @override
  void dispose() {
    _horizontalScrollController.dispose();
    super.dispose();
  }

  void _applyPeriodFilter(FilterPeriod period) {
    setState(() {
      _selectedPeriod = period;
      final now = DateTime.now();
      switch (period) {
        case FilterPeriod.today:
          _selectedStartDate = DateTime(now.year, now.month, now.day);
          _selectedEndDate = DateTime(now.year, now.month, now.day);
          _aggregationInterval = AggregationInterval.daily;
          break;
        case FilterPeriod.thisWeek:
          final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
          _selectedStartDate =
              DateTime(startOfWeek.year, startOfWeek.month, startOfWeek.day);
          _selectedEndDate = DateTime(now.year, now.month, now.day);
          _aggregationInterval = AggregationInterval.daily;
          break;
        case FilterPeriod.thisMonth:
          _selectedStartDate = DateTime(now.year, now.month, 1);
          _selectedEndDate = DateTime(now.year, now.month + 1, 0);
          _aggregationInterval = AggregationInterval.weekly;
          break;
        case FilterPeriod.thisYear:
          _selectedStartDate = DateTime(now.year, 1, 1);
          _selectedEndDate = DateTime(now.year, 12, 31);
          _aggregationInterval = AggregationInterval.monthly;
          break;
        case FilterPeriod.custom:
          // Keep current dates, let user choose aggregation
          break;
      }
    });
    _fetchFeedUsage();
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
    final Map<String, List<Map<String, dynamic>>> groupedFeeds = {};
    final dateFormat = DateFormat('yyyy-MM-dd');

    // Generate all dates in the range
    DateTime currentDate = _selectedStartDate;
    while (currentDate.isBefore(_selectedEndDate) ||
        currentDate.isAtSameMomentAs(_selectedEndDate)) {
      final dateStr = dateFormat.format(currentDate);
      if (!groupedFeeds.containsKey(dateStr)) {
        groupedFeeds[dateStr] = [];
      }
      currentDate = currentDate.add(const Duration(days: 1));
    }

    // Fill data from API
    for (var item in data) {
      final dateStr = item['date'] as String;
      final feeds = item['feeds'] as List<Map<String, dynamic>>;
      if (groupedFeeds.containsKey(dateStr)) {
        groupedFeeds[dateStr]!.addAll(feeds);
      }
    }

    // Aggregate data based on selected interval
    return _aggregateData(groupedFeeds);
  }

  List<Map<String, dynamic>> _aggregateData(
      Map<String, List<Map<String, dynamic>>> dailyFeeds) {
    final List<Map<String, dynamic>> result = [];
    final dateFormat = DateFormat('yyyy-MM-dd');

    switch (_aggregationInterval) {
      case AggregationInterval.daily:
        for (var entry in dailyFeeds.entries) {
          final dateStr = entry.key;
          final date = dateFormat.parse(dateStr);
          final dayName = DateFormat('EEEE', 'id_ID').format(date);
          final dateDisplay = DateFormat('dd MMM').format(date);

          final Map<String, double> feedTotals = {};
          for (var feedName in _feedNames) {
            feedTotals[feedName] = 0.0;
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
        break;

      case AggregationInterval.weekly:
        final Map<String, Map<String, double>> weeklyData = {};
        for (var entry in dailyFeeds.entries) {
          final date = dateFormat.parse(entry.key);
          final weekStart = date.subtract(Duration(days: date.weekday - 1));
          final weekKey = dateFormat.format(weekStart);

          if (!weeklyData.containsKey(weekKey)) {
            weeklyData[weekKey] = {};
            for (var feedName in _feedNames) {
              weeklyData[weekKey]![feedName] = 0.0;
            }
          }

          for (var feed in entry.value) {
            final feedName = feed['feed_name'] as String;
            final quantity = double.parse(feed['quantity_kg'] as String);
            weeklyData[weekKey]![feedName] =
                (weeklyData[weekKey]![feedName] ?? 0) + quantity;
          }
        }

        for (var entry in weeklyData.entries) {
          final weekStart = dateFormat.parse(entry.key);
          final weekEnd = weekStart.add(const Duration(days: 6));
          final dateDisplay =
              '${DateFormat('dd MMM').format(weekStart)} - ${DateFormat('dd MMM').format(weekEnd)}';

          result.add({
            'date': entry.key,
            'dayName': 'Minggu',
            'dateDisplay': dateDisplay,
            'feeds': entry.value,
          });
        }
        break;

      case AggregationInterval.monthly:
        final Map<String, Map<String, double>> monthlyData = {};
        for (var entry in dailyFeeds.entries) {
          final date = dateFormat.parse(entry.key);
          final monthKey =
              '${date.year}-${date.month.toString().padLeft(2, '0')}-01';

          if (!monthlyData.containsKey(monthKey)) {
            monthlyData[monthKey] = {};
            for (var feedName in _feedNames) {
              monthlyData[monthKey]![feedName] = 0.0;
            }
          }

          for (var feed in entry.value) {
            final feedName = feed['feed_name'] as String;
            final quantity = double.parse(feed['quantity_kg'] as String);
            monthlyData[monthKey]![feedName] =
                (monthlyData[monthKey]![feedName] ?? 0) + quantity;
          }
        }

        for (var entry in monthlyData.entries) {
          final monthStart = dateFormat.parse(entry.key);
          final dateDisplay = DateFormat('MMM yyyy').format(monthStart);

          result.add({
            'date': entry.key,
            'dayName': 'Bulan',
            'dateDisplay': dateDisplay,
            'feeds': entry.value,
          });
        }
        break;

      case AggregationInterval.yearly:
        final Map<String, Map<String, double>> yearlyData = {};
        for (var entry in dailyFeeds.entries) {
          final date = dateFormat.parse(entry.key);
          final yearKey = '${date.year}-01-01';

          if (!yearlyData.containsKey(yearKey)) {
            yearlyData[yearKey] = {};
            for (var feedName in _feedNames) {
              yearlyData[yearKey]![feedName] = 0.0;
            }
          }

          for (var feed in entry.value) {
            final feedName = feed['feed_name'] as String;
            final quantity = double.parse(feed['quantity_kg'] as String);
            yearlyData[yearKey]![feedName] =
                (yearlyData[yearKey]![feedName] ?? 0) + quantity;
          }
        }

        for (var entry in yearlyData.entries) {
          final yearStart = dateFormat.parse(entry.key);
          final dateDisplay = DateFormat('yyyy').format(yearStart);

          result.add({
            'date': entry.key,
            'dayName': 'Tahun',
            'dateDisplay': dateDisplay,
            'feeds': entry.value,
          });
        }
        break;
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
        _selectedPeriod = FilterPeriod.custom;
      });
      _showCustomFilterDialog(); // Show aggregation options after date selection
    }
  }

  void _showCustomFilterDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Text('Filter Custom'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Pilih Interval Agregasi:',
                      style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  ...AggregationInterval.values.map((interval) {
                    String title = '';
                    switch (interval) {
                      case AggregationInterval.daily:
                        title = 'Harian';
                        break;
                      case AggregationInterval.weekly:
                        title = 'Mingguan';
                        break;
                      case AggregationInterval.monthly:
                        title = 'Bulanan';
                        break;
                      case AggregationInterval.yearly:
                        title = 'Tahunan';
                        break;
                    }
                    return RadioListTile<AggregationInterval>(
                      title: Text(title),
                      value: interval,
                      groupValue: _aggregationInterval,
                      onChanged: (AggregationInterval? value) {
                        if (value != null) {
                          setDialogState(() {
                            _aggregationInterval = value;
                          });
                        }
                      },
                    );
                  }).toList(),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Batal'),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                    _fetchFeedUsage();
                  },
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.teal),
                  child: const Text('Terapkan',
                      style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Widget _buildPeriodFilterChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildFilterChip('Hari Ini', FilterPeriod.today),
          const SizedBox(width: 8),
          _buildFilterChip('Minggu Ini', FilterPeriod.thisWeek),
          const SizedBox(width: 8),
          _buildFilterChip('Bulan Ini', FilterPeriod.thisMonth),
          const SizedBox(width: 8),
          _buildFilterChip('Tahun Ini', FilterPeriod.thisYear),
          const SizedBox(width: 8),
          _buildFilterChip('Custom', FilterPeriod.custom),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, FilterPeriod period) {
    final isSelected = _selectedPeriod == period;
    return FilterChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (bool selected) {
        if (period == FilterPeriod.custom) {
          _selectDateRange();
        } else {
          _applyPeriodFilter(period);
        }
      },
      selectedColor: Colors.teal.withOpacity(0.2),
      checkmarkColor: Colors.teal,
      labelStyle: TextStyle(
        color: isSelected ? Colors.teal : Colors.grey[700],
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
    );
  }

  Widget _buildZoomControls() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.zoom_out),
            onPressed: _zoomLevel > _minZoom
                ? () {
                    setState(() {
                      _zoomLevel = (_zoomLevel - 0.2).clamp(_minZoom, _maxZoom);
                    });
                  }
                : null,
            iconSize: 20,
          ),
          Text(
            '${(_zoomLevel * 100).round()}%',
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
          IconButton(
            icon: const Icon(Icons.zoom_in),
            onPressed: _zoomLevel < _maxZoom
                ? () {
                    setState(() {
                      _zoomLevel = (_zoomLevel + 0.2).clamp(_minZoom, _maxZoom);
                    });
                  }
                : null,
            iconSize: 20,
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Penggunaan Pakan Harian',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
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
                      // Period Filter Section
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
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Filter Periode',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.teal,
                              ),
                            ),
                            const SizedBox(height: 12),
                            _buildPeriodFilterChips(),
                            const SizedBox(height: 12),
                            Row(
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
                                        fontSize: 14,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.teal,
                                      ),
                                    ),
                                  ],
                                ),
                                ElevatedButton.icon(
                                  onPressed: _selectDateRange,
                                  icon:
                                      const Icon(Icons.edit_calendar, size: 16),
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
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Chart Section
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
                              // Title
                              const Text(
                                'Grafik Penggunaan Pakan',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.teal,
                                ),
                              ),
                              const SizedBox(height: 8),
                              // Zoom Controls
                              _buildZoomControls(),
                              const SizedBox(height: 16),
                              // Feed Legend
                              Wrap(
                                spacing: 8,
                                runSpacing: 4,
                                children: _feedNames.map((feedName) {
                                  return Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.grey[50],
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                          color: Colors.grey.withOpacity(0.2)),
                                    ),
                                    child: Row(
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
                                        const SizedBox(width: 6),
                                        ConstrainedBox(
                                          constraints: BoxConstraints(
                                            maxWidth: MediaQuery.of(context)
                                                    .size
                                                    .width /
                                                4,
                                          ),
                                          child: Text(
                                            feedName,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w500,
                                            ),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ),
                              const SizedBox(height: 16),
                              // Rest of the chart code remains unchanged
                              if (_dailyData.isNotEmpty)
                                GestureDetector(
                                  onScaleUpdate: (ScaleUpdateDetails details) {
                                    setState(() {
                                      _zoomLevel = (_zoomLevel * details.scale)
                                          .clamp(_minZoom, _maxZoom);
                                    });
                                  },
                                  child: SizedBox(
                                    height: 350,
                                    child: SingleChildScrollView(
                                      controller: _horizontalScrollController,
                                      scrollDirection: Axis.horizontal,
                                      child: Container(
                                        width: (_dailyData.length *
                                                80.0 *
                                                _zoomLevel)
                                            .clamp(300, double.infinity),
                                        child: BarChart(
                                          BarChartData(
                                            alignment:
                                                BarChartAlignment.spaceAround,
                                            maxY: _getMaxValue(),
                                            minY: 0,
                                            groupsSpace: 8 * _zoomLevel,
                                            barTouchData: BarTouchData(
                                              enabled: true,
                                              touchTooltipData:
                                                  BarTouchTooltipData(
                                                getTooltipColor: (group) =>
                                                    Colors.grey[800]!,
                                                tooltipMargin: 8,
                                                getTooltipItem: (group,
                                                    groupIndex, rod, rodIndex) {
                                                  if (groupIndex <
                                                          _dailyData.length &&
                                                      rodIndex <
                                                          _feedNames.length) {
                                                    final feedName =
                                                        _feedNames[rodIndex];
                                                    final value = rod.toY;
                                                    return BarTooltipItem(
                                                      '$feedName\n${value.toStringAsFixed(0)} kg',
                                                      const TextStyle(
                                                        color: Colors.white,
                                                        fontSize: 12,
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                    );
                                                  }
                                                  return null;
                                                },
                                              ),
                                            ),
                                            titlesData: FlTitlesData(
                                              show: true,
                                              bottomTitles: AxisTitles(
                                                sideTitles: SideTitles(
                                                  showTitles: true,
                                                  reservedSize: 60,
                                                  getTitlesWidget:
                                                      (value, meta) {
                                                    final index = value.toInt();
                                                    if (index >= 0 &&
                                                        index <
                                                            _dailyData.length) {
                                                      return Padding(
                                                        padding:
                                                            const EdgeInsets
                                                                .only(top: 8),
                                                        child: Column(
                                                          mainAxisSize:
                                                              MainAxisSize.min,
                                                          children: [
                                                            Text(
                                                              _dailyData[index][
                                                                  'dateDisplay'],
                                                              style: TextStyle(
                                                                fontSize: (10 *
                                                                        _zoomLevel)
                                                                    .clamp(
                                                                        8, 12),
                                                                color: Colors
                                                                    .black87,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w500,
                                                              ),
                                                              textAlign:
                                                                  TextAlign
                                                                      .center,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                              maxLines: 1,
                                                            ),
                                                            Text(
                                                              _dailyData[index]
                                                                  ['dayName'],
                                                              style: TextStyle(
                                                                fontSize: (9 *
                                                                        _zoomLevel)
                                                                    .clamp(
                                                                        7, 11),
                                                                color: Colors
                                                                    .grey[600],
                                                                fontWeight:
                                                                    FontWeight
                                                                        .w400,
                                                              ),
                                                              textAlign:
                                                                  TextAlign
                                                                      .center,
                                                              overflow:
                                                                  TextOverflow
                                                                      .ellipsis,
                                                              maxLines: 1,
                                                            ),
                                                          ],
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
                                                  reservedSize: 40,
                                                  interval: _getMaxValue() / 5,
                                                  getTitlesWidget:
                                                      (value, meta) {
                                                    return Text(
                                                      '${value.toInt()}kg',
                                                      style: TextStyle(
                                                        fontSize: 10,
                                                        color: Colors.grey[600],
                                                        fontWeight:
                                                            FontWeight.w500,
                                                      ),
                                                    );
                                                  },
                                                ),
                                              ),
                                              topTitles: const AxisTitles(
                                                sideTitles: SideTitles(
                                                    showTitles: false),
                                              ),
                                              rightTitles: const AxisTitles(
                                                sideTitles: SideTitles(
                                                    showTitles: false),
                                              ),
                                            ),
                                            borderData: FlBorderData(
                                              show: true,
                                              border: Border(
                                                left: BorderSide(
                                                    color: Colors.grey
                                                        .withOpacity(0.2)),
                                                bottom: BorderSide(
                                                    color: Colors.grey
                                                        .withOpacity(0.2)),
                                              ),
                                            ),
                                            gridData: FlGridData(
                                              show: true,
                                              drawVerticalLine: true,
                                              verticalInterval: 1,
                                              horizontalInterval:
                                                  _getMaxValue() / 5,
                                              getDrawingHorizontalLine:
                                                  (value) {
                                                return FlLine(
                                                  color: Colors.grey
                                                      .withOpacity(0.1),
                                                  strokeWidth: 1,
                                                );
                                              },
                                              getDrawingVerticalLine: (value) {
                                                return FlLine(
                                                  color: Colors.grey
                                                      .withOpacity(0.1),
                                                  strokeWidth: 1,
                                                );
                                              },
                                            ),
                                            barGroups: _buildBarGroups(),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                )
                              else
                                const Center(
                                  child: Text(
                                    'Tidak ada data untuk periode ini',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      // Data Table Section
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
                                'Detail Penggunaan Pakan',
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
                                    columnSpacing: 16,
                                    columns: [
                                      const DataColumn(
                                        label: Text(
                                          'Tanggal',
                                          style: TextStyle(
                                              fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      ..._feedNames.map((feedName) =>
                                          DataColumn(
                                            label: ConstrainedBox(
                                              constraints: BoxConstraints(
                                                maxWidth: MediaQuery.of(context)
                                                        .size
                                                        .width /
                                                    4,
                                              ),
                                              child: Text(
                                                feedName,
                                                style: const TextStyle(
                                                    fontWeight:
                                                        FontWeight.bold),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          )),
                                    ],
                                    rows: _dailyData.map((data) {
                                      return DataRow(
                                        cells: [
                                          DataCell(
                                            ConstrainedBox(
                                              constraints: const BoxConstraints(
                                                  maxWidth: 100),
                                              child: Text(
                                                '${data['dateDisplay']} (${data['dayName']})',
                                                style: const TextStyle(
                                                    fontSize: 12),
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ),
                                          ),
                                          ..._feedNames.map((feedName) {
                                            final value =
                                                data['feeds'][feedName] ?? 0.0;
                                            return DataCell(
                                              Text(
                                                value.toStringAsFixed(1),
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  color: _feedColors[feedName],
                                                  fontWeight: FontWeight.w500,
                                                ),
                                              ),
                                            );
                                          }),
                                        ],
                                      );
                                    }).toList(),
                                  ),
                                )
                              else
                                const Center(
                                  child: Text(
                                    'Tidak ada data untuk ditampilkan',
                                    style: TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey,
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
    for (var data in _dailyData) {
      final feeds = data['feeds'] as Map<String, double>;
      final total = feeds.values.fold<double>(0, (sum, value) => sum + value);
      if (total > maxValue) maxValue = total;
    }

    // Adjust maxY based on the maximum data value
    if (maxValue <= 50) {
      return 50.0;
    } else if (maxValue <= 100) {
      return 100.0;
    } else if (maxValue <= 150) {
      return 150.0;
    } else if (maxValue <= 200) {
      return 200.0;
    } else if (maxValue <= 250) {
      return 250.0;
    } else {
      // For values above 250, round up to the nearest 50 with a 10% margin
      return ((maxValue * 1.1) / 50).ceil() * 50.0;
    }
  }

  List<BarChartGroupData> _buildBarGroups() {
    return _dailyData.asMap().entries.map((entry) {
      final index = entry.key;
      final data = entry.value;
      final feeds = data['feeds'] as Map<String, double>;

      final barRods = _feedNames.asMap().entries.map((feedEntry) {
        final feedIndex = feedEntry.key;
        final feedName = feedEntry.value;
        final value = feeds[feedName] ?? 0.0;

        return BarChartRodData(
          toY: value,
          color: _feedColors[feedName],
          width: (8 * _zoomLevel).clamp(4, 12),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
        );
      }).toList();

      return BarChartGroupData(
        x: index,
        barRods: barRods,
        showingTooltipIndicators: [],
      );
    }).toList();
  }
}
