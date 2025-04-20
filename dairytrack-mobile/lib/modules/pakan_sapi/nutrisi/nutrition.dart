// import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
// import 'package:dairy_track/config/api/peternakan/cow.dart';
// import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
// import 'package:dairy_track/model/peternakan/cow.dart';
// import 'package:fl_chart/fl_chart.dart';
// import 'package:flutter/material.dart';
// import 'package:intl/intl.dart';

// class FeedNutritionSummaryPage extends StatefulWidget {
//   const FeedNutritionSummaryPage({super.key});

//   @override
//   _FeedNutritionSummaryPageState createState() => _FeedNutritionSummaryPageState();
// }

// class _FeedNutritionSummaryPageState extends State<FeedNutritionSummaryPage> {
//   final DateFormat _dateFormat = DateFormat('dd MMM yyyy');
//   bool _isLoading = false;
//   String _errorMessage = '';
//   List<DailyFeedSchedule> _nutritionData = [];
//   Map<int, Cow> _cowNames = {};
//   String? _selectedCow;
//   DateTime _startDate = DateTime.now().subtract(const Duration(days: 30));
//   DateTime _endDate = DateTime.now();
//   int _currentPage = 1;
//   final int _itemsPerPage = 10;

//   @override
//   void initState() {
//     super.initState();
//     _fetchData();
//   }

//   Future<void> _fetchData() async {
//     setState(() {
//       _isLoading = true;
//       _errorMessage = '';
//     });

//     try {
//       final params = {
//         'start_date': DateFormat('yyyy-MM-dd').format(_startDate),
//         'end_date': DateFormat('yyyy-MM-dd').format(_endDate),
//         if (_selectedCow != null) 'cow_id': _selectedCow,
//       };

//       final results = await Future.wait([
//         getDailyFeedSchedules(params),
//         getCows(),
//       ]);

//       final List<DailyFeedSchedule> feeds = results[0] as List<DailyFeedSchedule>;
//       final List<Cow> cows = results[1] as List<Cow>;

//       final Map<int, Cow> cowMap = {for (var cow in cows) cow.id: cow};

//       setState(() {
//         _nutritionData = feeds;
//         _cowNames = cowMap;
//         _isLoading = false;
//       });
//     } catch (e) {
//       setState(() {
//         _errorMessage = 'Gagal memuat data nutrisi: $e';
//         _isLoading = false;
//       });
//       _showErrorDialog('Error', 'Gagal memuat data nutrisi.');
//     }
//   }

//   List<DailyFeedSchedule> get _filteredData {
//     return _nutritionData.where((item) {
//       final dateMatch = item.date.isAfter(_startDate.subtract(const Duration(days: 1))) &&
//           item.date.isBefore(_endDate.add(const Duration(days: 1)));
//       final cowMatch = _selectedCow == null || item.cowId.toString() == _selectedCow;
//       return dateMatch && cowMatch;
//     }).toList();
//   }

//   List<int> get _uniqueCows {
//     return _nutritionData.map((item) => item.cowId).toSet().toList();
//   }

//   Map<int, Map<String, List<DailyFeedSchedule>>> get _groupedData {
//     final Map<int, Map<String, List<DailyFeedSchedule>>> grouped = {};
//     for (var item in _filteredData) {
//       final cowId = item.cowId;
//       final dateKey = DateFormat('yyyy-MM-dd').format(item.date);
//       grouped.putIfAbsent(cowId, () => {});
//       grouped[cowId]!.putIfAbsent(dateKey, () => []).add(item);
//     }
//     return grouped;
//   }

//   List<DailyFeedSchedule> get _paginatedData {
//     final start = (_currentPage - 1) * _itemsPerPage;
//     return _filteredData.skip(start).take(_itemsPerPage).toList();
//   }

//   int get _totalPages => (_filteredData.length / _itemsPerPage).ceil();

//   Future<void> _selectDateRange(BuildContext context, bool isStart) async {
//     final DateTime? picked = await showDatePicker(
//       context: context,
//       initialDate: isStart ? _startDate : _endDate,
//       firstDate: DateTime(2000),
//       lastDate: DateTime.now(),
//     );
//     if (picked != null) {
//       setState(() {
//         if (isStart) {
//           _startDate = picked;
//         } else {
//           _endDate = picked;
//         }
//         _currentPage = 1;
//       });
//     }
//   }

//   void _applyFilters() {
//     if (_selectedCow == null) {
//       _showErrorDialog('Perhatian', 'Silakan pilih sapi terlebih dahulu.');
//       return;
//     }
//     if (_startDate.isAfter(_endDate)) {
//       _showErrorDialog('Perhatian', 'Tanggal mulai harus sebelum tanggal akhir.');
//       return;
//     }
//     _fetchData();
//   }

//   void _showErrorDialog(String title, String message) {
//     showDialog(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: Text(title),
//         content: Text(message),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.pop(context),
//             child: const Text('OK'),
//           ),
//         ],
//       ),
//     );
//   }

//   void _showFeedDetails(DailyFeedSchedule item) {
//     if (item.feedItems == null || item.feedItems!.isEmpty) {
//       _showErrorDialog('Info', 'Tidak ada detail pakan tersedia.');
//       return;
//     }

//     showDialog(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: Text('Detail Pakan - ${_cowNames[item.cowId]?.name ?? 'Sapi #${item.cowId}'}'),
//         content: SingleChildScrollView(
//           child: Column(
//             crossAxisAlignment: CrossAxisAlignment.start,
//             children: [
//               Text('Tanggal: ${_dateFormat.format(item.date)}'),
//               Text('Sesi: ${item.session[0].toUpperCase()}${item.session.substring(1)}'),
//               Text('Cuaca: ${item.weather ?? '-'}'),
//               const SizedBox(height: 16),
//               DataTable(
//                 columns: const [
//                   DataColumn(label: Text('Pakan')),
//                   DataColumn(label: Text('Jumlah (kg)'), numeric: true),
//                   DataColumn(label: Text('Protein (g)'), numeric: true),
//                   DataColumn(label: Text('Energi (kcal)'), numeric: true),
//                   DataColumn(label: Text('Serat (g)'), numeric: true),
//                 ],
//                 rows: item.feedItems!.map((feedItem) => DataRow(cells: [
//                   DataCell(Text(feedItem.feed?.name ?? '-')),
//                   DataCell(Text(feedItem.quantity.toStringAsFixed(2))),
//                   DataCell(Text(feedItem.feed?.protein?.toStringAsFixed(2) ?? '0')),
//                   DataCell(Text(feedItem.feed?.energy?.toStringAsFixed(2) ?? '0')),
//                   DataCell(Text(feedItem.feed?.fiber?.toStringAsFixed(2) ?? '0')),
//                 ])).toList(),
//               ),
//             ],
//           ),
//         ),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.pop(context),
//             child: const Text('Tutup'),
//           ),
//         ],
//       ),
//     );
//   }

//   void _showNutritionCharts(int cowId) {
//     final cowData = _filteredData.where((item) => item.cowId == cowId).toList()
//       ..sort((a, b) => a.date.compareTo(b.date));

//     if (cowData.isEmpty) {
//       _showErrorDialog('Perhatian', 'Tidak ada data nutrisi untuk sapi ini.');
//       return;
//     }

//     showModalBottomSheet(
//       context: context,
//       isScrollControlled: true,
//       builder: (context) => DraggableScrollableSheet(
//         initialChildSize: 0.9,
//         minChildSize: 0.5,
//         maxChildSize: 0.95,
//         expand: false,
//         builder: (context, scrollController) => SingleChildScrollView(
//           controller: scrollController,
//           child: Padding(
//             padding: const EdgeInsets.all(16.0),
//             child: Column(
//               crossAxisAlignment: CrossAxisAlignment.start,
//               children: [
//                 Text(
//                   'Grafik Nutrisi - ${_cowNames[cowId]?.name ?? 'Sapi #$cowId'}',
//                   style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
//                 ),
//                 const SizedBox(height: 16),
//                 const Text('Tren Nutrisi Harian', style: TextStyle(fontWeight: FontWeight.bold)),
//                 SizedBox(
//                   height: 300,
//                   child: LineChart(
//                     LineChartData(
//                       gridData: const FlGridData(show: true),
//                       titlesData: FlTitlesData(
//                         bottomTitles: AxisTitles(
//                           sideTitles: SideTitles(
//                             showTitles: true,
//                             getTitlesWidget: (value, meta) {
//                               final index = value.toInt();
//                               if (index >= 0 && index < cowData.length) {
//                                 final date = DateFormat('dd MMM').format(cowData[index].date);
//                                 final session = cowData[index].session[0].toUpperCase();
//                                 return Text('$date ($session)', style: const TextStyle(fontSize: 10));
//                               }
//                               return const Text('');
//                             },
//                             reservedSize: 40,
//                             interval: 1,
//                           ),
//                         ),
//                         leftTitles: AxisTitles(
//                           sideTitles: SideTitles(showTitles: true, reservedSize: 40),
//                         ),
//                       ),
//                       borderData: FlBorderData(show: true),
//                       lineBarsData: [
//                         LineChartBarData(
//                           spots: cowData.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.totalProtein ?? 0)).toList(),
//                           isCurved: true,
//                           color: Colors.purple,
//                           barWidth: 2,
//                           dotData: const FlDotData(show: false),
//                         ),
//                         LineChartBarData(
//                           spots: cowData.asMap().entries.map((e) => FlSpot(e.key.toDouble(), (e.value.totalEnergy ?? 0) / 1000)).toList(),
//                           isCurved: true,
//                           color: Colors.green,
//                           barWidth: 2,
//                           dotData: const FlDotData(show: false),
//                         ),
//                         LineChartBarData(
//                           spots: cowData.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value.totalFiber ?? 0)).toList(),
//                           isCurved: true,
//                           color: Colors.yellow[700],
//                           barWidth: 2,
//                           dotData: const FlDotData(show: false),
//                         ),
//                       ],
//                     ),
//                   ),
//                 ),
//                 const SizedBox(height: 16),
//                 const Text('Distribusi Nutrisi', style: TextStyle(fontWeight: FontWeight.bold)),
//                 SizedBox(
//                   height: 250,
//                   child: PieChart(
//                     PieChartData(
//                       sections: [
//                         PieChartSectionData(
//                           value: cowData.fold(0.0, (sum, item) => sum + (item.totalProtein ?? 0)) / cowData.length,
//                           color: Colors.purple,
//                           title: 'Protein',
//                           radius: 80,
//                         ),
//                         PieChartSectionData(
//                           value: cowData.fold(0.0, (sum, item) => sum + ((item.totalEnergy ?? 0) / 1000)) / cowData.length,
//                           color: Colors.green,
//                           title: 'Energi',
//                           radius: 80,
//                         ),
//                         PieChartSectionData(
//                           value: cowData.fold(0.0, (sum, item) => sum + (item.totalFiber ?? 0)) / cowData.length,
//                           color: Colors.yellow[700],
//                           title: 'Serat',
//                           radius: 80,
//                         ),
//                       ],
//                       sectionsSpace: 2,
//                       centerSpaceRadius: 40,
//                     ),
//                   ),
//                 ),
//                 const SizedBox(height: 16),
//                 ElevatedButton(
//                   onPressed: () => Navigator.pop(context),
//                   child: const Text('Tutup'),
//                 ),
//               ],
//             ),
//           ),
//         ),
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Ringkasan Nutrisi Pakan'),
//         backgroundColor: const Color(0xFF17A2B8),
//         actions: [
//           IconButton(
//             icon: const Icon(Icons.refresh),
//             onPressed: _isLoading ? null : _fetchData,
//             tooltip: 'Refresh',
//           ),
//         ],
//       ),
//       body: _isLoading
//           ? const Center(child: CircularProgressIndicator())
//           : SingleChildScrollView(
//               padding: const EdgeInsets.all(16.0),
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   if (_errorMessage.isNotEmpty)
//                     Container(
//                       padding: const EdgeInsets.all(8.0),
//                       margin: const EdgeInsets.only(bottom: 16.0),
//                       decoration: BoxDecoration(
//                         color: Colors.red.shade100,
//                         borderRadius: BorderRadius.circular(4.0),
//                       ),
//                       child: Text(
//                         _errorMessage,
//                         style: TextStyle(color: Colors.red.shade800),
//                       ),
//                     ),
//                   Card(
//                     child: Padding(
//                       padding: const EdgeInsets.all(16.0),
//                       child: Column(
//                         crossAxisAlignment: CrossAxisAlignment.start,
//                         children: [
//                           const Text(
//                             'Filter',
//                             style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
//                           ),
//                           const SizedBox(height: 8),
//                           DropdownButtonFormField<String>(
//                             decoration: const InputDecoration(
//                               labelText: 'Pilih Sapi *',
//                               border: OutlineInputBorder(),
//                             ),
//                             value: _selectedCow,
//                             items: _uniqueCows.map((cowId) => DropdownMenuItem(
//                               value: cowId.toString(),
//                               child: Text(_cowNames[cowId]?.name ?? 'Sapi #$cowId'),
//                             )).toList(),
//                             onChanged: (value) => setState(() {
//                               _selectedCow = value;
//                               _currentPage = 1;
//                             }),
//                             hint: const Text('Pilih sapi untuk melihat grafik'),
//                           ),
//                           const SizedBox(height: 16),
//                           Row(
//                             children: [
//                               Expanded(
//                                 child: InkWell(
//                                   onTap: () => _selectDateRange(context, true),
//                                   child: InputDecorator(
//                                     decoration: const InputDecoration(
//                                       labelText: 'Tanggal Mulai',
//                                       border: OutlineInputBorder(),
//                                     ),
//                                     child: Text(_dateFormat.format(_startDate)),
//                                   ),
//                                 ),
//                               ),
//                               const SizedBox(width: 8),
//                               Expanded(
//                                 child: InkWell(
//                                   onTap: () => _selectDateRange(context, false),
//                                   child: InputDecorator(
//                                     decoration: const InputDecoration(
//                                       labelText: 'Tanggal Akhir',
//                                       border: OutlineInputBorder(),
//                                     ),
//                                     child: Text(_dateFormat.format(_endDate)),
//                                   ),
//                                 ),
//                               ),
//                             ],
//                           ),
//                           const SizedBox(height: 16),
//                           SizedBox(
//                             width: double.infinity,
//                             child: ElevatedButton(
//                               onPressed: _applyFilters,
//                               style: ElevatedButton.styleFrom(
//                                 backgroundColor: const Color(0xFF17A2B8),
//                                 foregroundColor: Colors.white,
//                               ),
//                               child: const Text('Terapkan Filter'),
//                             ),
//                           ),
//                         ],
//                       ),
//                     ),
//                   ),
//                   const SizedBox(height: 16),
//                   if (_selectedCow != null) ...[
//                     Card(
//                       child: Padding(
//                         padding: const EdgeInsets.all(16.0),
//                         child: Column(
//                           crossAxisAlignment: CrossAxisAlignment.start,
//                           children: [
//                             const Text(
//                               'Statistik Nutrisi',
//                               style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
//                             ),
//                             const SizedBox(height: 8),
//                             Row(
//                               children: [
//                                 Expanded(
//                                   child: Card(
//                                     color: Colors.blue.shade50,
//                                     child: Padding(
//                                       padding: const EdgeInsets.all(8.0),
//                                       child: Column(
//                                         children: [
//                                           const Text('Protein', style: TextStyle(fontWeight: FontWeight.bold)),
//                                           Text(
//                                             '${(_filteredData.fold(0.0, (sum, item) => sum + (item.totalProtein ?? 0)) / _filteredData.length).toStringAsFixed(2)} g',
//                                             style: const TextStyle(color: Colors.blue),
//                                           ),
//                                         ],
//                                       ),
//                                     ),
//                                   ),
//                                 ),
//                                 Expanded(
//                                   child: Card(
//                                     color: Colors.green.shade50,
//                                     child: Padding(
//                                       padding: const EdgeInsets.all(8.0),
//                                       child: Column(
//                                         children: [
//                                           const Text('Energi', style: TextStyle(fontWeight: FontWeight.bold)),
//                                           Text(
//                                             '${(_filteredData.fold(0.0, (sum, item) => sum + (item.totalEnergy ?? 0)) / _filteredData.length).toStringAsFixed(2)} kcal',
//                                             style: const TextStyle(color: Colors.green),
//                                           ),
//                                         ],
//                                       ),
//                                     ),
//                                   ),
//                                 ),
//                               ],
//                             ),
//                             Row(
//                               children: [
//                                 Expanded(
//                                   child: Card(
//                                     color: Colors.yellow.shade50,
//                                     child: Padding(
//                                       padding: const EdgeInsets.all(8.0),
//                                       child: Column(
//                                         children: [
//                                           const Text('Serat', style: TextStyle(fontWeight: FontWeight.bold)),
//                                           Text(
//                                             '${(_filteredData.fold(0.0, (sum, item) => sum + (item.totalFiber ?? 0)) / _filteredData.length).toStringAsFixed(2)} g',
//                                             style: const TextStyle(color: Colors.yellow),
//                                           ),
//                                         ],
//                                       ),
//                                     ),
//                                   ),
//                                 ),
//                                 Expanded(
//                                   child: Card(
//                                     color: Colors.teal.shade50,
//                                     child: Padding(
//                                       padding: const EdgeInsets.all(8.0),
//                                       child: Column(
//                                         children: [
//                                           const Text('Pakan', style: TextStyle(fontWeight: FontWeight.bold)),
//                                           Text(
//                                             '${_filteredData.length} kali',
//                                             style: const TextStyle(color: Colors.teal),
//                                           ),
//                                         ],
//                                       ),
//                                     ),
//                                   ),
//                                 ),
//                               ],
//                             ),
//                           ],
//                         ),
//                       ),
//                     ),
//                     const SizedBox(height: 16),
//                     const Text(
//                       'Riwayat Nutrisi Harian',
//                       style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
//                     ),
//                     const SizedBox(height: 8),
//                     if (_groupedData.isEmpty)
//                       const Card(
//                         child: Padding(
//                           padding: EdgeInsets.all(16.0),
//                           child: Text('Tidak ada data nutrisi tersedia.'),
//                         ),
//                       )
//                     else
//                       ..._groupedData.entries.map((cowEntry) {
//                         final cowId = cowEntry.key;
//                         final days = cowEntry.value;
//                         return Card(
//                           margin: const EdgeInsets.only(bottom: 16.0),
//                           child: Padding(
//                             padding: const EdgeInsets.all(16.0),
//                             child: Column(
//                               crossAxisAlignment: CrossAxisAlignment.start,
//                               children: [
//                                 Row(
//                                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                                   children: [
//                                     Text(
//                                       _cowNames[cowId]?.name ?? 'Sapi #$cowId',
//                                       style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
//                                     ),
//                                     TextButton(
//                                       onPressed: () => _showNutritionCharts(cowId),
//                                       child: const Text('Lihat Grafik', style: TextStyle(color: Color(0xFF17A2B8))),
//                                     ),
//                                   ],
//                                 ),
//                                 const SizedBox(height: 8),
//                                 ...days.entries.map((dayEntry) {
//                                   final date = DateTime.parse(dayEntry.key);
//                                   final sessions = dayEntry.value;
//                                   return Column(
//                                     crossAxisAlignment: CrossAxisAlignment.start,
//                                     children: [
//                                       Text(
//                                         _dateFormat.format(date),
//                                         style: const TextStyle(fontWeight: FontWeight.bold),
//                                       ),
//                                       const SizedBox(height: 8),
//                                       ...sessions.map((item) => ListTile(
//                                         title: Text(
//                                           '${item.session[0].toUpperCase()}${item.session.substring(1)}',
//                                           style: const TextStyle(fontWeight: FontWeight.bold),
//                                         ),
//                                         subtitle: Column(
//                                           crossAxisAlignment: CrossAxisAlignment.start,
//                                           children: [
//                                             Text('Cuaca: ${item.weather ?? '-'}'),
//                                             Text('Protein: ${item.totalProtein?.toStringAsFixed(2) ?? '0'} g'),
//                                             Text('Energi: ${item.totalEnergy?.toStringAsFixed(2) ?? '0'} kcal'),
//                                             Text('Serat: ${item.totalFiber?.toStringAsFixed(2) ?? '0'} g'),
//                                           ],
//                                         ),
//                                         trailing: IconButton(
//                                           icon: const Icon(Icons.visibility, color: Color(0xFF17A2B8)),
//                                           onPressed: () => _showFeedDetails(item),
//                                         ),
//                                       )),
//                                       const Divider(),
//                                     ],
//                                   );
//                                 }),
//                               ],
//                             ),
//                           ),
//                         );
//                       }),
//                     if (_totalPages > 1)
//                       Row(
//                         mainAxisAlignment: MainAxisAlignment.spaceBetween,
//                         children: [
//                           TextButton(
//                             onPressed: _currentPage == 1 ? null : () => setState(() => _currentPage--),
//                             child: const Text('Sebelumnya'),
//                           ),
//                           Text('Halaman $_currentPage dari $_totalPages'),
//                           TextButton(
//                             onPressed: _currentPage == _totalPages ? null : () => setState(() => _currentPage++),
//                             child: const Text('Selanjutnya'),
//                           ),
//                         ],
//                       ),
//                   ],
//                 ],
//               ),
//             ),
//     );
//   }
// }