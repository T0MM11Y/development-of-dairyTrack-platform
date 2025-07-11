// // salesTransactionProvider.dart
// import 'dart:io';
// import 'package:dairytrack_mobile/controller/APIURL2/controller/salesTransactionController.dart';
// import 'package:dairytrack_mobile/controller/APIURL2/models/salesTransaction.dart';
// import 'package:device_info_plus/device_info_plus.dart';
// import 'package:flutter/material.dart';
// import 'package:logger/logger.dart';
// import 'package:path_provider/path_provider.dart';
// import 'package:permission_handler/permission_handler.dart';
// import 'package:flutter_local_notifications/flutter_local_notifications.dart';

// class SalesTransactionProvider with ChangeNotifier {
//   final SalesTransactionController _controller = SalesTransactionController();
//   final _logger = Logger();
//   final FlutterLocalNotificationsPlugin _notificationsPlugin =
//       FlutterLocalNotificationsPlugin();

//   List<SalesTransaction> _transactions = [];
//   String? _searchQuery;
//   bool _isLoading = false;
//   String _errorMessage = '';
//   bool _isExporting = false;

//   List<SalesTransaction> get transactions =>
//       _searchQuery == null || _searchQuery!.isEmpty
//           ? _transactions
//           : _transactions
//               .where((item) => item.order.customerName
//                   .toLowerCase()
//                   .contains(_searchQuery!.toLowerCase()))
//               .toList();
//   bool get isLoading => _isLoading;
//   String get errorMessage => _errorMessage;
//   bool get isExporting => _isExporting;

//   SalesTransactionProvider() {
//     _initializeNotifications();
//   }

//   void _initializeNotifications() async {
//     try {
//       const initializationSettings = InitializationSettings(
//         android: AndroidInitializationSettings('logo'),
//       );
//       await _notificationsPlugin.initialize(initializationSettings);
//       _logger.i('Notifications initialized successfully');
//     } catch (e) {
//       _logger.e('Error initializing notifications: $e');
//     }
//   }

//   Future<void> fetchTransactions({String queryString = ''}) async {
//     _isLoading = true;
//     _errorMessage = '';
//     notifyListeners();

//     try {
//       _transactions =
//           await _controller.getSalesTransactions(queryString: queryString);
//       _isLoading = false;
//       _logger.i('Successfully fetched ${_transactions.length} transaction items');
//       notifyListeners();
//     } catch (e) {
//       _isLoading = false;
//       _errorMessage = 'Gagal memuat transaksi penjualan: $e';
//       _logger.e('Error fetching transactions: $e');
//       notifyListeners();
//     }
//   }

//   void setSearchQuery(String? query) {
//     _searchQuery = query;
//     notifyListeners();
//   }

//   Future<void> exportToPdf(
//       {String queryString = '', BuildContext? context}) async {
//     _isExporting = true;
//     notifyListeners();

//     try {
//       if (await _requestPermissions(context: null)) {
//         final result = await _controller.exportSalesTransactionsAsPdf(
//             queryString: queryString);
//         if (result['success']) {
//           final bytes = result['data'] as List<int>;
//           final filename = result['filename'] as String;
//           final file = await _saveFile(bytes, filename);
//           await _showNotification(
//               'Export PDF Berhasil', 'File disimpan di ${file.path}');
//           _logger.i('PDF exported successfully: ${file.path}');
//         } else {
//           _errorMessage = result['message'];
//           await _showNotification('Export PDF Gagal', _errorMessage);
//           _logger.e('Failed to export PDF: ${_errorMessage}');
//         }
//       } else {
//         _errorMessage = 'Izin penyimpanan atau notifikasi ditolak';
//         await _showNotification('Export PDF Gagal', _errorMessage);
//         _logger.e(_errorMessage);
//       }
//     } catch (e) {
//       _errorMessage = 'Gagal mengekspor PDF: $e';
//       await _showNotification('Export PDF Gagal', _errorMessage);
//       _logger.e('Error exporting PDF: $e');
//     } finally {
//       _isExporting = false;
//       notifyListeners();
//     }
//   }

//   Future<void> exportToExcel(
//       {String queryString = '', BuildContext? context}) async {
//     _isExporting = true;
//     notifyListeners();

//     try {
//       if (await _requestPermissions(context: null)) {
//         final result = await _controller.exportSalesTransactionsAsExcel(
//             queryString: queryString);
//         if (result['success']) {
//           final bytes = result['data'] as List<int>;
//           final filename = result['filename'] as String;
//           final file = await _saveFile(bytes, filename);
//           await _showNotification(
//               'Export Excel Berhasil', 'File disimpan di ${file.path}');
//           _logger.i('Excel exported successfully: ${file.path}');
//         } else {
//           _errorMessage = result['message'];
//           await _showNotification('Export Excel Gagal', _errorMessage);
//           _logger.e('Failed to export Excel: ${_errorMessage}');
//         }
//       } else {
//         _errorMessage = 'Izin penyimpanan atau notifikasi ditolak';
//         await _showNotification('Export Excel Gagal', _errorMessage);
//         _logger.e(_errorMessage);
//       }
//     } catch (e) {
//       _errorMessage = 'Gagal mengekspor Excel: $e';
//       await _showNotification('Export Excel Gagal', _errorMessage);
//       _logger.e('Error exporting Excel: $e');
//     } finally {
//       _isExporting = false;
//       notifyListeners();
//     }
//   }

//   Future<bool> _requestPermissions({BuildContext? context}) async {
//     var storageStatus = await Permission.storage.status;
//     var notificationStatus = await Permission.notification.status;

//     if (context != null) {
//       bool shouldRequest = await showDialog<bool>(
//             context: context,
//             builder: (context) => AlertDialog(
//               title: Text('Izin Diperlukan'),
//               content: Text(
//                   'Aplikasi memerlukan izin penyimpanan untuk menyimpan file dan izin notifikasi untuk menampilkan status ekspor. Izinkan akses?'),
//               actions: [
//                 TextButton(
//                   onPressed: () => Navigator.pop(context, false),
//                   child: Text('Tolak'),
//                 ),
//                 TextButton(
//                   onPressed: () => Navigator.pop(context, true),
//                   child: Text('Izinkan'),
//                 ),
//               ],
//             ),
//           ) ??
//           false;

//       if (!shouldRequest) {
//         _errorMessage =
//             'Izin penyimpanan atau notifikasi ditolak oleh pengguna';
//         _logger.e(_errorMessage);
//         return false;
//       }
//     }

//     if (Platform.isAndroid) {
//       try {
//         if (await _isAndroid11OrHigher()) {
//           storageStatus = await Permission.manageExternalStorage.status;
//           if (!storageStatus.isGranted) {
//             storageStatus = await Permission.manageExternalStorage.request();
//           }
//         } else {
//           if (!storageStatus.isGranted) {
//             storageStatus = await Permission.storage.request();
//           }
//         }
//       } catch (e) {
//         _logger.e('Error checking Android version: $e');
//         if (!storageStatus.isGranted) {
//           storageStatus = await Permission.storage.request();
//         }
//       }

//       if (storageStatus.isPermanentlyDenied) {
//         _errorMessage =
//             'Izin penyimpanan ditolak permanen. Buka pengaturan untuk mengaktifkan.';
//         _logger.e(_errorMessage);
//         if (context != null) {
//           await showDialog(
//             context: context,
//             builder: (context) => AlertDialog(
//               title: Text('Izin Ditolak Permanen'),
//               content: Text(
//                   'Izin penyimpanan ditolak permanen. Buka pengaturan aplikasi untuk mengaktifkan izin penyimpanan.'),
//               actions: [
//                 TextButton(
//                   onPressed: () => Navigator.pop(context),
//                   child: Text('Batal'),
//                 ),
//                 TextButton(
//                   onPressed: () async {
//                     await openAppSettings();
//                     Navigator.pop(context);
//                   },
//                   child: Text('Buka Pengaturan'),
//                 ),
//               ],
//             ),
//           );
//         }
//         return false;
//       }

//       if (!notificationStatus.isGranted) {
//         notificationStatus = await Permission.notification.request();
//       }
//       if (notificationStatus.isPermanentlyDenied) {
//         _errorMessage =
//             'Izin notifikasi ditolak permanen. Buka pengaturan untuk mengaktifkan.';
//         _logger.e(_errorMessage);
//         if (context != null) {
//           await showDialog(
//             context: context,
//             builder: (context) => AlertDialog(
//               title: Text('Izin Ditolak Permanen'),
//               content: Text(
//                   'Izin notifikasi ditolak permanen. Buka pengaturan aplikasi untuk mengaktifkan izin notifikasi.'),
//               actions: [
//                 TextButton(
//                   onPressed: () => Navigator.pop(context),
//                   child: Text('Batal'),
//                 ),
//                 TextButton(
//                   onPressed: () async {
//                     await openAppSettings();
//                     Navigator.pop(context);
//                   },
//                   child: Text('Buka Pengaturan'),
//                 ),
//               ],
//             ),
//           );
//         }
//         return false;
//       }

//       _logger.i(
//           'Storage permission status: $storageStatus, Notification permission status: $notificationStatus');
//       return storageStatus.isGranted && notificationStatus.isGranted;
//     }

//     if (!storageStatus.isGranted) {
//       storageStatus = await Permission.storage.request();
//     }
//     if (storageStatus.isPermanentlyDenied) {
//       _errorMessage =
//           'Izin penyimpanan ditolak permanen. Buka pengaturan untuk mengaktifkan.';
//       _logger.e(_errorMessage);
//       if (context != null) {
//         await showDialog(
//           context: context,
//           builder: (context) => AlertDialog(
//             title: Text('Izin Ditolak Permanen'),
//             content: Text(
//                 'Izin penyimpanan ditolak permanen. Buka pengaturan aplikasi untuk mengaktifkan izin penyimpanan.'),
//             actions: [
//               TextButton(
//                 onPressed: () => Navigator.pop(context),
//                 child: Text('Batal'),
//               ),
//               TextButton(
//                 onPressed: () async {
//                   await openAppSettings();
//                   Navigator.pop(context);
//                 },
//                 child: Text('Buka Pengaturan'),
//               ),
//             ],
//           ),
//         );
//       }
//       return false;
//     }

//     _logger.i('Storage permission status: $storageStatus');
//     return storageStatus.isGranted;
//   }

//   Future<bool> _isAndroid11OrHigher() async {
//     if (Platform.isAndroid) {
//       try {
//         var sdkInt = await DeviceInfoPlugin()
//             .androidInfo
//             .then((info) => info.version.sdkInt);
//         _logger.i('Android SDK version: $sdkInt');
//         return sdkInt >= 30;
//       } catch (e) {
//         _logger.e('Error getting Android version: $e');
//         return false;
//       }
//     }
//     return false;
//   }

//   Future<File> _saveFile(List<int> bytes, String filename) async {
//     final directory = await getExternalStorageDirectory();
//     _logger.i('Storage directory: ${directory?.path}');
//     final filePath = '${directory!.path}/$filename';
//     final file = File(filePath);
//     await file.writeAsBytes(bytes);
//     return file;
//   }

//   Future<void> _showNotification(String title, String body) async {
//     const androidDetails = AndroidNotificationDetails(
//       'export_channel',
//       'Export Notifications',
//       channelDescription: 'Notifications for file export status',
//       importance: Importance.high,
//       priority: Priority.high,
//     );
//     const notificationDetails = NotificationDetails(
//       android: androidDetails,
//     );
//     try {
//       await _notificationsPlugin.show(
//         DateTime.now().millisecondsSinceEpoch % 100000,
//         title,
//         body,
//         notificationDetails,
//       );
//       _logger.i('Notification sent: $title - $body');
//     } catch (e) {
//       _logger.e('Error showing notification: $e');
//     }
//   }
// }

import 'dart:io';
import 'package:dairytrack_mobile/controller/APIURL2/controller/salesTransactionController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/salesTransaction.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'dart:io';
import 'package:dairytrack_mobile/controller/APIURL2/controller/salesTransactionController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/salesTransaction.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class SalesTransactionProvider with ChangeNotifier {
  final SalesTransactionController _controller = SalesTransactionController();
  final Logger _logger = Logger();
  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  List<SalesTransaction> _transactions = [];
  String? _searchQuery;
  bool _isLoading = false;
  bool _isExporting = false;
  String _errorMessage = '';
  int _currentPage = 1;
  bool _hasMore = true;
  final int _pageSize = 10;

  List<SalesTransaction> get transactions =>
      _searchQuery == null || _searchQuery!.isEmpty
          ? _transactions
          : _transactions
              .where((item) => item.order.customerName
                  .toLowerCase()
                  .contains(_searchQuery!.toLowerCase()))
              .toList();
  bool get isLoading => _isLoading;
  bool get isExporting => _isExporting;
  String get errorMessage => _errorMessage;
  bool get hasMore => _hasMore;

  SalesTransactionProvider() {
    _initializeNotifications();
  }

  void _initializeNotifications() async {
    try {
      const initializationSettings = InitializationSettings(
        android: AndroidInitializationSettings('logo'),
      );
      await _notificationsPlugin.initialize(initializationSettings);
      _logger.i('Notifications initialized successfully');
    } catch (e) {
      _logger.e('Failed to initialize notifications: $e');
    }
  }

  Future<void> fetchTransactions(
      {String queryString = '', bool reset = false}) async {
    if (_isLoading || (!_hasMore && !reset)) {
      _logger.i(
          'Fetch skipped: isLoading=$_isLoading, hasMore=$_hasMore, reset=$reset');
      return;
    }

    _isLoading = true;
    _errorMessage = '';
    if (reset) {
      _transactions = [];
      _currentPage = 1;
      _hasMore = true;
    }
    notifyListeners();

    try {
      final query = queryString.isNotEmpty ? '$queryString&' : '';
      final response = await _controller.getSalesTransactions(
        queryString: '${query}page=$_currentPage&page_size=$_pageSize',
      );

      _logger.i('API response: $response');

      if (response.containsKey('data') && response['data'] is List) {
        final newTransactions = response['data'] as List<SalesTransaction>;
        _hasMore = response['hasMore'] as bool? ??
            (newTransactions.length == _pageSize);
        _currentPage++;
        _transactions =
            reset ? newTransactions : [..._transactions, ...newTransactions];
        _isLoading = false;
        _logger.i(
            'Fetched ${newTransactions.length} transactions, hasMore: $_hasMore, page: $_currentPage');
        notifyListeners();
      } else {
        throw Exception(
            'Invalid response structure: "data" key missing or not a list');
      }
    } catch (e) {
      _isLoading = false;
      _errorMessage = _processErrorMessage(e.toString());
      _logger.e('Failed to fetch transactions: $e');
      notifyListeners();
    }
  }

  void setSearchQuery(String? query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> exportToPdf(
      {String queryString = '', required BuildContext context}) async {
    _isExporting = true;
    notifyListeners();

    try {
      if (await _requestPermissions(context: context)) {
        final result = await _controller.exportSalesTransactionsAsPdf(
            queryString: queryString);
        if (result['success']) {
          final bytes = result['data'] as List<int>;
          final filename = result['filename'] as String;
          final file = await _saveFile(bytes, filename);
          await _showNotification(
              'PDF Export Successful', 'File saved to ${file.path}');
          _logger.i('PDF exported successfully: ${file.path}');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('PDF exported successfully to ${file.path}')),
          );
        } else {
          _errorMessage =
              result['message'] ?? 'Unknown error during PDF export';
          await _showNotification('PDF Export Failed', _errorMessage);
          _logger.e('Failed to export PDF: $_errorMessage');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to export PDF: $_errorMessage')),
          );
        }
      } else {
        _errorMessage = 'Storage or notification permissions denied';
        await _showNotification('PDF Export Failed', _errorMessage);
        _logger.e(_errorMessage);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage)),
        );
      }
    } catch (e) {
      _errorMessage = 'Failed to export PDF: $e';
      await _showNotification('PDF Export Failed', _errorMessage);
      _logger.e('Error exporting PDF: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage)),
      );
    } finally {
      _isExporting = false;
      notifyListeners();
    }
  }

  Future<void> exportToExcel(
      {String queryString = '', required BuildContext context}) async {
    _isExporting = true;
    notifyListeners();

    try {
      if (await _requestPermissions(context: context)) {
        final result = await _controller.exportSalesTransactionsAsExcel(
            queryString: queryString);
        if (result['success']) {
          final bytes = result['data'] as List<int>;
          final filename = result['filename'] as String;
          final file = await _saveFile(bytes, filename);
          await _showNotification(
              'Excel Export Successful', 'File saved to ${file.path}');
          _logger.i('Excel exported successfully: ${file.path}');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text('Excel exported successfully to ${file.path}')),
          );
        } else {
          _errorMessage =
              result['message'] ?? 'Unknown error during Excel export';
          await _showNotification('Excel Export Failed', _errorMessage);
          _logger.e('Failed to export Excel: $_errorMessage');
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed to export Excel: $_errorMessage')),
          );
        }
      } else {
        _errorMessage = 'Storage or notification permissions denied';
        await _showNotification('Excel Export Failed', _errorMessage);
        _logger.e(_errorMessage);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(_errorMessage)),
        );
      }
    } catch (e) {
      _errorMessage = 'Failed to export Excel: $e';
      await _showNotification('Excel Export Failed', _errorMessage);
      _logger.e('Error exporting Excel: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_errorMessage)),
      );
    } finally {
      _isExporting = false;
      notifyListeners();
    }
  }

  Future<bool> _requestPermissions({required BuildContext context}) async {
    var storageStatus = await Permission.storage.status;
    var notificationStatus = await Permission.notification.status;

    if (!storageStatus.isGranted || !notificationStatus.isGranted) {
      bool shouldRequest = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Permissions Required'),
              content: const Text(
                  'The app requires storage permission to save files and notification permission to show export status. Allow access?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('Deny'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('Allow'),
                ),
              ],
            ),
          ) ??
          false;

      if (!shouldRequest) {
        _errorMessage = 'Storage or notification permissions denied by user';
        _logger.e(_errorMessage);
        return false;
      }
    }

    if (Platform.isAndroid) {
      try {
        if (await _isAndroid11OrHigher()) {
          storageStatus = await Permission.manageExternalStorage.status;
          if (!storageStatus.isGranted) {
            storageStatus = await Permission.manageExternalStorage.request();
          }
        } else {
          if (!storageStatus.isGranted) {
            storageStatus = await Permission.storage.request();
          }
        }
      } catch (e) {
        _logger.e('Error checking Android version: $e');
        if (!storageStatus.isGranted) {
          storageStatus = await Permission.storage.request();
        }
      }

      if (storageStatus.isPermanentlyDenied) {
        _errorMessage =
            'Storage permission permanently denied. Please enable it in app settings.';
        _logger.e(_errorMessage);
        await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Permission Permanently Denied'),
            content: const Text(
                'Storage permission is permanently denied. Please enable it in app settings.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () async {
                  await openAppSettings();
                  Navigator.pop(context);
                },
                child: const Text('Open Settings'),
              ),
            ],
          ),
        );
        return false;
      }

      if (!notificationStatus.isGranted) {
        notificationStatus = await Permission.notification.request();
      }
      if (notificationStatus.isPermanentlyDenied) {
        _errorMessage =
            'Notification permission permanently denied. Please enable it in app settings.';
        _logger.e(_errorMessage);
        await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Permission Permanently Denied'),
            content: const Text(
                'Notification permission is permanently denied. Please enable it in app settings.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () async {
                  await openAppSettings();
                  Navigator.pop(context);
                },
                child: const Text('Open Settings'),
              ),
            ],
          ),
        );
        return false;
      }

      _logger.i(
          'Storage permission: $storageStatus, Notification permission: $notificationStatus');
      return storageStatus.isGranted && notificationStatus.isGranted;
    }

    if (!storageStatus.isGranted) {
      storageStatus = await Permission.storage.request();
    }
    if (storageStatus.isPermanentlyDenied) {
      _errorMessage =
          'Storage permission permanently denied. Please enable it in app settings.';
      _logger.e(_errorMessage);
      await showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Permission Permanently Denied'),
          content: const Text(
              'Storage permission is permanently denied. Please enable it in app settings.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () async {
                await openAppSettings();
                Navigator.pop(context);
              },
              child: const Text('Open Settings'),
            ),
          ],
        ),
      );
      return false;
    }

    _logger.i('Storage permission: $storageStatus');
    return storageStatus.isGranted;
  }

  Future<bool> _isAndroid11OrHigher() async {
    if (Platform.isAndroid) {
      try {
        final androidInfo = await DeviceInfoPlugin().androidInfo;
        final sdkInt = androidInfo.version.sdkInt;
        _logger.i('Android SDK version: $sdkInt');
        return sdkInt >= 30;
      } catch (e) {
        _logger.e('Error getting Android version: $e');
        return false;
      }
    }
    return false;
  }

  Future<File> _saveFile(List<int> bytes, String filename) async {
    final directory = await getExternalStorageDirectory();
    _logger.i('Storage directory: ${directory?.path}');
    final filePath = '${directory!.path}/$filename';
    final file = File(filePath);
    await file.writeAsBytes(bytes);
    return file;
  }

  Future<void> _showNotification(String title, String body) async {
    const androidDetails = AndroidNotificationDetails(
      'export_channel',
      'Export Notifications',
      channelDescription: 'Notifications for file export status',
      importance: Importance.high,
      priority: Priority.high,
    );
    const notificationDetails = NotificationDetails(android: androidDetails);
    try {
      await _notificationsPlugin.show(
        DateTime.now().millisecondsSinceEpoch % 100000,
        title,
        body,
        notificationDetails,
      );
      _logger.i('Notification sent: $title - $body');
    } catch (e) {
      _logger.e('Failed to send notification: $e');
    }
  }

  String _processErrorMessage(String error) {
    if (error.contains('No internet connection')) {
      return 'No internet connection. Please check your network.';
    } else if (error.contains('Request timeout')) {
      return 'Request timed out. Please try again later.';
    } else {
      return 'An error occurred: ${error.replaceFirst('Exception: ', '')}';
    }
  }
}
