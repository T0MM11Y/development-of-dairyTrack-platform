// import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
// import 'package:dairy_track/config/api/pakan/dailyFeedItem.dart';
// import 'package:dairy_track/config/api/pakan/feed.dart';
// import 'package:dairy_track/config/api/pakan/feedStock.dart';
// import 'package:dairy_track/config/api/peternakan/cow.dart';
// import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
// import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
// import 'package:dairy_track/model/pakan/feed.dart';
// import 'package:dairy_track/model/pakan/feedStock.dart';
// import 'package:dairy_track/model/peternakan/cow.dart';
// import 'package:flutter/material.dart';
// import 'package:flutter/services.dart';
// import 'package:intl/intl.dart';

// class EditFeedItemPage extends StatefulWidget {
//   final int dailyFeedId;
//   final VoidCallback? onUpdateSuccess;

//   const EditFeedItemPage({
//     super.key,
//     required this.dailyFeedId,
//     this.onUpdateSuccess,
//   });

//   @override
//   _EditFeedItemPageState createState() => _EditFeedItemPageState();
// }

// class _EditFeedItemPageState extends State<EditFeedItemPage> {
//   final DateFormat _dateFormat = DateFormat('dd MMM yyyy');
//   final _formKey = GlobalKey<FormState>();

//   bool _isLoading = true;
//   bool _isEditing = false;
//   String? _errorMessage;

//   DailyFeedSchedule? _dailyFeed;
//   List<FeedItem> _feedItems = [];
//   List<Feed> _feeds = [];
//   List<FeedStock> _feedStocks = [];
//   Map<int, Cow> _cowsMap = {};

//   List<Map<String, dynamic>> _formList = [];

//   @override
//   void initState() {
//     super.initState();
//     _loadData();
//   }

//   Future<void> _loadData() async {
//     setState(() {
//       _isLoading = true;
//       _errorMessage = null;
//     });

//     try {
//       final results = await Future.wait([
//         getDailyFeedById(widget.dailyFeedId),
//         getFeedItemsByDailyFeedId(widget.dailyFeedId),
//         getAllFeeds(),
//         getAllFeedStocks(),
//         getCows(),
//       ]);

//       final dailyFeed = results[0] as DailyFeedSchedule;
//       final feedItemsResponse = results[1] as Map<String, dynamic>;
//       final feedsList = results[2] as List<Feed>;
//       final feedStocksList = results[3] as List<FeedStock>;
//       final cowsList = results[4] as List<Cow>;

//       final feedItems = feedItemsResponse['success'] == true
//           ? (feedItemsResponse['data'] as List<dynamic>)
//               .map((item) => FeedItem.fromJson(item))
//               .toList()
//           : <FeedItem>[];

//       final cowsMap = <int, Cow>{};
//       for (var cow in cowsList) {
//         if (cow.id != null) {
//           if (cowsMap.containsKey(cow.id)) {
//             print('Warning: Overwriting duplicate cow ID: ${cow.id}');
//           }
//           cowsMap[cow.id!] = cow;
//         } else {
//           print('Warning: Skipping cow with null ID: ${cow.name}');
//         }
//       }

//       setState(() {
//         _dailyFeed = dailyFeed;
//         _feedItems = feedItems;
//         _feeds = feedsList;
//         _feedStocks = feedStocksList;
//         _cowsMap = cowsMap;
//         _formList = feedItems
//             .map((item) => <String, dynamic>{
//                   'id': item.id,
//                   'feed_id': item.feedId,
//                   'quantity': item.quantity.toString(),
//                   'daily_feed_id': item.dailyFeedId,
//                 })
//             .toList();
//         _isLoading = false;
//       });
//     } catch (e) {
//       setState(() {
//         _errorMessage = 'Gagal memuat data: $e';
//         _isLoading = false;
//       });
//     }
//   }

//   void _toggleEditMode() {
//     setState(() {
//       _isEditing = !_isEditing;
//       if (!_isEditing) {
//         _formList = _feedItems
//             .map((item) => <String, dynamic>{
//                   'id': item.id,
//                   'feed_id': item.feedId,
//                   'quantity': item.quantity.toString(),
//                   'daily_feed_id': item.dailyFeedId,
//                 })
//             .toList();
//       }
//     });
//   }

//   void _handleFormChange(int index, String field, dynamic value) {
//     setState(() {
//       _formList[index][field] = value;
//     });
//   }

//   void _addFeedItemRow() {
//     if (_formList.length >= 3) {
//       _showErrorDialog('Perhatian', 'Maksimal 3 jenis pakan untuk satu sesi');
//       return;
//     }

//     setState(() {
//       _formList.add(<String, dynamic>{
//         'id': null,
//         'feed_id': null,
//         'quantity': '',
//         'daily_feed_id': widget.dailyFeedId,
//       });
//     });
//   }

//   Future<void> _removeFeedItemRow(int index) async {
//     final item = _formList[index];

//     if (item['id'] != null) {
//       final confirm = await showDialog<bool>(
//         context: context,
//         builder: (context) => AlertDialog(
//           title: const Text('Konfirmasi'),
//           content: const Text('Apakah Anda yakin ingin menghapus item pakan ini?'),
//           actions: [
//             TextButton(
//               onPressed: () => Navigator.pop(context, false),
//               child: const Text('Batal'),
//             ),
//             TextButton(
//               onPressed: () => Navigator.pop(context, true),
//               child: const Text('Hapus', style: TextStyle(color: Colors.red)),
//             ),
//           ],
//         ),
//       );

//       if (confirm != true) return;

//       setState(() {
//         _isLoading = true;
//       });

//       try {
//         final response = await deleteFeedItem(item['id'] as int);
//         if (response['success'] == true) {
//           setState(() {
//             _feedItems.removeWhere((feedItem) => feedItem.id == item['id']);
//             _formList.removeAt(index);
//           });
//           _showSuccessDialog('Berhasil', 'Item pakan berhasil dihapus');
//         } else {
//           throw Exception(response['message'] ?? 'Gagal menghapus item pakan');
//         }
//       } catch (e) {
//         _showErrorDialog('Gagal', 'Gagal menghapus item pakan: $e');
//       } finally {
//         setState(() {
//           _isLoading = false;
//         });
//       }
//     } else {
//       setState(() {
//         _formList.removeAt(index);
//       });
//     }
//   }

//   List<Feed> _getAvailableFeedsForRow(int currentIndex) {
//     final selectedFeedIds = _formList
//         .asMap()
//         .entries
//         .where((entry) => entry.key != currentIndex && entry.value['feed_id'] != null)
//         .map((entry) => entry.value['feed_id'] as int)
//         .toSet();

//     return _feeds.where((feed) => !selectedFeedIds.contains(feed.id)).toList();
//   }

//   double _getFeedStock(int? feedId) {
//     if (feedId == null) return 0.0;
//     final matchingStocks = _feedStocks.where((stock) => stock.feedId == feedId).toList();
//     if (matchingStocks.isEmpty) return 0.0;
//     matchingStocks.sort((a, b) => b.updatedAt.compareTo(a.updatedAt));
//     return matchingStocks.first.stock;
//   }

//   Future<void> _handleSave() async {
//     if (!_formKey.currentState!.validate()) return;

//     final confirm = await showDialog<bool>(
//       context: context,
//       builder: (context) => AlertDialog(
//         title: const Text('Konfirmasi'),
//         content: const Text('Apakah Anda yakin ingin menyimpan perubahan?'),
//         actions: [
//           TextButton(
//             onPressed: () => Navigator.pop(context, false),
//             child: const Text('Batal'),
//           ),
//           TextButton(
//             onPressed: () => Navigator.pop(context, true),
//             child: const Text('Simpan'),
//           ),
//         ],
//       ),
//     );

//     if (confirm != true) return;

//     setState(() {
//       _isLoading = true;
//       _errorMessage = null;
//     });

//     try {
//       // Check for duplicate feed_ids
//       final feedIdCounts = <int, int>{};
//       for (var item in _formList) {
//         final feedId = item['feed_id'] as int?;
//         if (feedId != null) {
//           feedIdCounts[feedId] = (feedIdCounts[feedId] ?? 0) + 1;
//         }
//       }
//       final duplicateFeedIds =
//           feedIdCounts.entries.where((entry) => entry.value > 1).map((e) => e.key);
//       if (duplicateFeedIds.isNotEmpty) {
//         final duplicateFeedNames = duplicateFeedIds
//             .map((id) => _feeds.firstWhere((feed) => feed.id == id).name)
//             .join(', ');
//         throw Exception(
//             '$duplicateFeedNames dipilih lebih dari sekali. Pilih jenis pakan berbeda.');
//       }

//       // Separate new and updated items
//       final newItems = _formList.where((item) => item['id'] == null).toList();
//       final updatedItems = _formList.where((item) => item['id'] != null).toList();

//       // Handle new items
//       if (newItems.isNotEmpty) {
//         final newFeedItems = newItems
//             .map((item) => {
//                   'feed_id': item['feed_id'] as int,
//                   'quantity': double.parse(item['quantity'] as String),
//                 })
//             .toList();
//         final response = await FeedItemService.addFeedItems(
//           dailyFeedId: widget.dailyFeedId,
//           feedItems: newFeedItems,
//         );
//         if (!response['success']) {
//           throw Exception(response['message'] ?? 'Gagal menambah item pakan');
//         }
//       }

//       // Handle updated items
//       if (updatedItems.isNotEmpty) {
//         final updatedFeedItems = updatedItems
//             .map((item) => {
//                   'id': item['id'] as int,
//                   'quantity': double.parse(item['quantity'] as String),
//                 })
//             .toList();
//         final response = await FeedItemService.bulkUpdateFeedItems(items: updatedFeedItems);
//         if (!response['success']) {
//           throw Exception(response['message'] ?? 'Gagal memperbarui item pakan');
//         }
//       }

//       // Reload data
//       await _loadData();
//       setState(() {
//         _isEditing = false;
//       });

//       _showSuccessDialog('Berhasil', 'Data pakan harian berhasil diperbarui');
//       widget.onUpdateSuccess?.call();
//     } catch (e) {
//       setState(() {
//         _errorMessage = e.toString().contains('Stok tidak cukup')
//             ? e.toString()
//             : 'Gagal menyimpan data: $e';
//         _isLoading = false;
//       });
//     }
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

//   void _showSuccessDialog(String title, String message) {
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

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: const Text('Edit Item Pakan Harian'),
//         backgroundColor: const Color(0xFF17A2B8),
//         actions: [
//           if (!_isEditing)
//             IconButton(
//               icon: const Icon(Icons.edit),
//               onPressed: _isLoading ? null : _toggleEditMode,
//               tooltip: 'Edit',
//             ),
//         ],
//       ),
//       body: _isLoading
//           ? const Center(child: CircularProgressIndicator())
//           : SingleChildScrollView(
//               padding: const EdgeInsets.all(16.0),
//               child: Form(
//                 key: _formKey,
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     if (_errorMessage != null)
//                       Container(
//                         padding: const EdgeInsets.all(8.0),
//                         margin: const EdgeInsets.only(bottom: 16.0),
//                         decoration: BoxDecoration(
//                           color: Colors.red.shade100,
//                           borderRadius: BorderRadius.circular(8.0),
//                         ),
//                         child: Text(
//                           _errorMessage!,
//                           style: TextStyle(color: Colors.red.shade800),
//                         ),
//                       ),
//                     const Text(
//                       'Detail Sesi',
//                       style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18.0),
//                     ),
//                     const SizedBox(height: 8.0),
//                     Card(
//                       elevation: 2,
//                       child: Padding(
//                         padding: const EdgeInsets.all(16.0),
//                         child: Row(
//                           children: [
//                             Expanded(
//                               child: Column(
//                                 crossAxisAlignment: CrossAxisAlignment.start,
//                                 children: [
//                                   const Text('Tanggal', style: TextStyle(color: Colors.grey)),
//                                   Text(_dailyFeed != null
//                                       ? _dateFormat.format(DateTime.parse(_dailyFeed!.date))
//                                       : '-'),
//                                 ],
//                               ),
//                             ),
//                             Expanded(
//                               child: Column(
//                                 crossAxisAlignment: CrossAxisAlignment.start,
//                                 children: [
//                                   const Text('Sesi', style: TextStyle(color: Colors.grey)),
//                                   Text(_dailyFeed != null
//                                       ? (_dailyFeed!.session.isNotEmpty
//                                           ? _dailyFeed!.session[0].toUpperCase() +
//                                               _dailyFeed!.session.substring(1)
//                                           : '-')
//                                       : '-'),
//                                 ],
//                               ),
//                             ),
//                             Expanded(
//                               child: Column(
//                                 crossAxisAlignment: CrossAxisAlignment.start,
//                                 children: [
//                                   const Text('Sapi', style: TextStyle(color: Colors.grey)),
//                                   Text(_dailyFeed != null
//                                       ? (_cowsMap[_dailyFeed!.cowId]?.name ??
//                                           'Sapi #${_dailyFeed!.cowId}')
//                                       : '-'),
//                                 ],
//                               ),
//                             ),
//                           ],
//                         ),
//                       ),
//                     ),
//                     const SizedBox(height: 24.0),
//                     if (_isEditing) ...[
//                       ..._formList.asMap().entries.map((entry) {
//                         final index = entry.key;
//                         final item = entry.value;

//                         return Card(
//                           elevation: 2,
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
//                                       'Jenis Pakan #${index + 1}',
//                                       style: const TextStyle(
//                                           fontWeight: FontWeight.bold, fontSize: 16.0),
//                                     ),
//                                     if (_formList.length > 1)
//                                       IconButton(
//                                         icon: const Icon(Icons.delete, color: Colors.red),
//                                         onPressed: () => _removeFeedItemRow(index),
//                                         tooltip: 'Hapus Item',
//                                       ),
//                                   ],
//                                 ),
//                                 const SizedBox(height: 8.0),
//                                 Row(
//                                   crossAxisAlignment: CrossAxisAlignment.start,
//                                   children: [
//                                     Expanded(
//                                       flex: 3,
//                                       child: Column(
//                                         crossAxisAlignment: CrossAxisAlignment.start,
//                                         children: [
//                                           DropdownButtonFormField<int>(
//                                             decoration: InputDecoration(
//                                               labelText: 'Jenis Pakan',
//                                               border: OutlineInputBorder(
//                                                 borderRadius: BorderRadius.circular(8.0),
//                                               ),
//                                             ),
//                                             value: item['feed_id'] as int?,
//                                             hint: const Text('Pilih pakan'),
//                                             isExpanded: true,
//                                             items: _getAvailableFeedsForRow(index)
//                                                 .map((feed) => DropdownMenuItem(
//                                                       value: feed.id,
//                                                       child: Text(feed.name),
//                                                     ))
//                                                 .toList(),
//                                             onChanged: item['id'] != null
//                                                 ? null
//                                                 : (value) =>
//                                                     _handleFormChange(index, 'feed_id', value),
//                                             validator: (value) =>
//                                                 value == null ? 'Pilih jenis pakan' : null,
//                                             disabledHint: const Text('Tidak dapat diubah'),
//                                           ),
//                                           if (item['feed_id'] != null) ...[
//                                             const SizedBox(height: 8.0),
//                                             Text(
//                                               'Stok: ${_getFeedStock(item['feed_id'] as int?)} kg',
//                                               style: const TextStyle(
//                                                   fontWeight: FontWeight.bold,
//                                                   color: Colors.blue),
//                                             ),
//                                           ],
//                                         ],
//                                       ),
//                                     ),
//                                     const SizedBox(width: 12.0),
//                                     Expanded(
//                                       flex: 2,
//                                       child: TextFormField(
//                                         decoration: InputDecoration(
//                                           labelText: 'Jumlah (kg)',
//                                           border: OutlineInputBorder(
//                                             borderRadius: BorderRadius.circular(8.0),
//                                           ),
//                                           errorMaxLines: 2,
//                                         ),
//                                         keyboardType:
//                                             const TextInputType.numberWithOptions(decimal: true),
//                                         initialValue: item['quantity'].toString(),
//                                         inputFormatters: [
//                                           FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$')),
//                                         ],
//                                         validator: (value) {
//                                           if (value == null || value.trim().isEmpty) {
//                                             return 'Masukkan jumlah';
//                                           }
//                                           final quantity = double.tryParse(value);
//                                           if (quantity == null || quantity <= 0) {
//                                             return 'Jumlah harus lebih dari 0';
//                                           }
//                                           if (item['feed_id'] != null) {
//                                             final stock = _getFeedStock(item['feed_id'] as int?);
//                                             if (quantity > stock) {
//                                               return 'Stok hanya $stock kg';
//                                             }
//                                           }
//                                           return null;
//                                         },
//                                         onChanged: (value) =>
//                                             _handleFormChange(index, 'quantity', value),
//                                       ),
//                                     ),
//                                   ],
//                                 ),
//                               ],
//                             ),
//                           ),
//                         );
//                       }),
//                       if (_formList.length < 3)
//                         Align(
//                           alignment: Alignment.centerRight,
//                           child: TextButton.icon(
//                             onPressed: _addFeedItemRow,
//                             icon: const Icon(Icons.add, color: Color(0xFF17A2B8)),
//                             label: const Text(
//                               'Tambah Jenis Pakan',
//                               style: TextStyle(color: Color(0xFF17A2B8)),
//                             ),
//                           ),
//                         ),
//                       const SizedBox(height: 24.0),
//                       SizedBox(
//                         width: double.infinity,
//                         height: 50.0,
//                         child: ElevatedButton(
//                           style: ElevatedButton.styleFrom(
//                             backgroundColor: const Color(0xFF17A2B8),
//                             foregroundColor: Colors.white,
//                             shape: RoundedRectangleBorder(
//                               borderRadius: BorderRadius.circular(8.0),
//                             ),
//                           ),
//                           onPressed: _isLoading ? null : _handleSave,
//                           child: _isLoading
//                               ? const Row(
//                                   mainAxisAlignment: MainAxisAlignment.center,
//                                   children: [
//                                     SizedBox(
//                                       width: 20,
//                                       height: 20,
//                                       child: CircularProgressIndicator(
//                                         color: Colors.white,
//                                         strokeWidth: 2.0,
//                                       ),
//                                     ),
//                                     SizedBox(width: 12.0),
//                                     Text('Menyimpan...'),
//                                   ],
//                                 )
//                               : const Text('Simpan', style: TextStyle(fontSize: 16)),
//                         ),
//                       ),
//                     ] else ...[
//                       const Text(
//                         'Daftar Pakan',
//                         style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18.0),
//                       ),
//                       const SizedBox(height: 8.0),
//                       if (_feedItems.isEmpty)
//                         Card(
//                           elevation: 2,
//                           child: Padding(
//                             padding: const EdgeInsets.all(16.0),
//                             child: Center(
//                               child: Text(
//                                 'Tidak ada data pakan untuk sesi ini.',
//                                 style: TextStyle(color: Colors.grey.shade600),
//                               ),
//                             ),
//                           ),
//                         )
//                       else
//                         Table(
//                           border: TableBorder.all(color: Colors.grey.shade300),
//                           columnWidths: const {
//                             0: FlexColumnWidth(1),
//                             1: FlexColumnWidth(3),
//                             2: FlexColumnWidth(2),
//                           },
//                           children: [
//                             TableRow(
//                               decoration: BoxDecoration(color: Colors.grey.shade200),
//                               children: const [
//                                 Padding(
//                                   padding: EdgeInsets.all(8.0),
//                                   child: Text(
//                                     'No',
//                                     textAlign: TextAlign.center,
//                                     style: TextStyle(fontWeight: FontWeight.bold),
//                                   ),
//                                 ),
//                                 Padding(
//                                   padding: EdgeInsets.all(8.0),
//                                   child: Text(
//                                     'Jenis Pakan',
//                                     style: TextStyle(fontWeight: FontWeight.bold),
//                                   ),
//                                 ),
//                                 Padding(
//                                   padding: EdgeInsets.all(8.0),
//                                   child: Text(
//                                     'Jumlah (kg)',
//                                     textAlign: TextAlign.center,
//                                     style: TextStyle(fontWeight: FontWeight.bold),
//                                   ),
//                                 ),
//                               ],
//                             ),
//                             ..._feedItems.asMap().entries.map((entry) {
//                               final index = entry.key;
//                               final item = entry.value;
//                               return TableRow(
//                                 children: [
//                                   Padding(
//                                     padding: const EdgeInsets.all(8.0),
//                                     child: Text(
//                                       '${index + 1}',
//                                       textAlign: TextAlign.center,
//                                     ),
//                                   ),
//                                   Padding(
//                                     padding: const EdgeInsets.all(8.0),
//                                     child: Text(item.feed?.name ?? 'Pakan #${item.feedId}'),
//                                   ),
//                                   Padding(
//                                     padding: const EdgeInsets.all(8.0),
//                                     child: Text(
//                                       '${item.quantity} kg',
//                                       textAlign: TextAlign.center,
//                                     ),
//                                   ),
//                                 ],
//                               );
//                             }),
//                           ],
//                         ),
//                     ],
//                   ],
//                 ),
//               ),
//             ),
//     );
//   }
// }