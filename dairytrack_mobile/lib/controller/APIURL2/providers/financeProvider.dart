// financeProvider.dart
import 'dart:io';
import 'package:dairytrack_mobile/controller/APIURL2/controller/financeController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/finance.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:logger/logger.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class FinanceProvider with ChangeNotifier {
  final FinanceController _controller = FinanceController();
  final _logger = Logger();
  final FlutterLocalNotificationsPlugin _notificationsPlugin =
      FlutterLocalNotificationsPlugin();

  List<FinanceTransaction> _transactions = [];
  List<Income> _incomes = [];
  List<Expense> _expenses = [];
  List<IncomeType> _incomeTypes = [];
  List<ExpenseType> _expenseTypes = [];
  String? _searchQuery;
  bool _isLoading = false;
  String _errorMessage = '';
  bool _isExporting = false;

  List<FinanceTransaction> get transactions =>
      _searchQuery == null || _searchQuery!.isEmpty
          ? _transactions
          : _transactions
              .where((item) => item.description
                  .toLowerCase()
                  .contains(_searchQuery!.toLowerCase()))
              .toList();

  double get totalIncome =>
      _incomes.fold(0.0, (sum, item) => sum + double.parse(item.amount));
  double get totalExpense =>
      _expenses.fold(0.0, (sum, item) => sum + double.parse(item.amount));
  double get availableBalance => totalIncome - totalExpense;

  // Data for donut chart with percentages
  Map<String, Map<String, dynamic>> get chartData {
    final Map<String, Map<String, dynamic>> data = {};
    final total = totalIncome + totalExpense;

    // Income
    for (var income in _incomes) {
      if (income.incomeTypeDetail != null) {
        final typeName = 'Income: ${income.incomeTypeDetail!.name}';
        final amount = double.parse(income.amount);
        data[typeName] = {
          'amount': (data[typeName]?['amount'] ?? 0.0) + amount,
          'type': 'income',
        };
      }
    }

    // Expense
    for (var expense in _expenses) {
      if (expense.expenseTypeDetail != null) {
        final typeName = 'Expense: ${expense.expenseTypeDetail!.name}';
        final amount = double.parse(expense.amount);
        data[typeName] = {
          'amount': (data[typeName]?['amount'] ?? 0.0) + amount,
          'type': 'expense',
        };
      }
    }

    // Calculate percentages
    data.forEach((key, value) {
      value['percentage'] = total > 0
          ? (value['amount'] / total * 100).toStringAsFixed(2)
          : '0.00';
    });

    return data;
  }

  bool get isLoading => _isLoading;
  String get errorMessage => _errorMessage;
  bool get isExporting => _isExporting;
  List<IncomeType> get incomeTypes => _incomeTypes;
  List<ExpenseType> get expenseTypes => _expenseTypes;

  FinanceProvider() {
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
      _logger.e('Error initializing notifications: $e');
    }
  }

  Future<void> fetchAllData({String queryString = ''}) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      _transactions =
          await _controller.getFinanceTransactions(queryString: queryString);
      _incomes = await _controller.getIncomes(queryString: queryString);
      _expenses = await _controller.getExpenses(queryString: queryString);
      _incomeTypes = await _controller.getIncomeTypes();
      _expenseTypes = await _controller.getExpenseTypes();
      _isLoading = false;
      _logger.i('Successfully fetched ${_transactions.length} transactions, '
          '${_incomes.length} incomes, ${_expenses.length} expenses');
      notifyListeners();
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal memuat data keuangan: $e';
      _logger.e('Error fetching data: $e');
      notifyListeners();
    }
  }

  void setSearchQuery(String? query) {
    _searchQuery = query; // Fixed typo
    notifyListeners();
  }

  Future<void> exportToPdf(
      {String queryString = '', required BuildContext context}) async {
    _isExporting = true;
    notifyListeners();

    try {
      if (await _requestPermissions(context: context)) {
        final result =
            await _controller.exportFinanceAsPdf(queryString: queryString);
        if (result['success']) {
          final bytes = result['data'] as List<int>;
          final filename = result['filename'] as String;
          final file = await _saveFile(bytes, filename);
          await _showNotification(
              'Export PDF Berhasil', 'File disimpan di ${file.path}');
          _logger.i('PDF exported successfully: ${file.path}');
        } else {
          _errorMessage = result['message'];
          await _showNotification('Export PDF Gagal', _errorMessage);
          _logger.e('Failed to export PDF: ${_errorMessage}');
        }
      } else {
        _errorMessage = 'Izin penyimpanan atau notifikasi ditolak';
        await _showNotification('Export PDF Gagal', _errorMessage);
        _logger.e(_errorMessage);
      }
    } catch (e) {
      _errorMessage = 'Gagal mengekspor PDF: $e';
      await _showNotification('Export PDF Gagal', _errorMessage);
      _logger.e('Error exporting PDF: $e');
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
        final result =
            await _controller.exportFinanceAsExcel(queryString: queryString);
        if (result['success']) {
          final bytes = result['data'] as List<int>;
          final filename = result['filename'] as String;
          final file = await _saveFile(bytes, filename);
          await _showNotification(
              'Export Excel Berhasil', 'File disimpan di ${file.path}');
          _logger.i('Excel exported successfully: ${file.path}');
        } else {
          _errorMessage = result['message'];
          await _showNotification('Export Excel Gagal', _errorMessage);
          _logger.e('Failed to export Excel: ${_errorMessage}');
        }
      } else {
        _errorMessage = 'Izin penyimpanan atau notifikasi ditolak';
        await _showNotification('Export Excel Gagal', _errorMessage);
        _logger.e(_errorMessage);
      }
    } catch (e) {
      _errorMessage = 'Gagal mengekspor Excel: $e';
      await _showNotification('Export Excel Gagal', _errorMessage);
      _logger.e('Error exporting Excel: $e');
    } finally {
      _isExporting = false;
      notifyListeners();
    }
  }

  Future<bool> addIncome(Income income) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final success = await _controller.createIncome(income);
      _isLoading = false;
      if (success) {
        await fetchAllData(); // Refresh data
        _logger.i('Income added successfully');
      }
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal menambahkan pendapatan: $e';
      _logger.e('Error adding income: $e');
      notifyListeners();
      return false;
    }
  }

  Future<bool> addExpense(Expense expense) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final success = await _controller.createExpense(expense);
      _isLoading = false;
      if (success) {
        await fetchAllData(); // Refresh data
        _logger.i('Expense added successfully');
      }
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal menambahkan pengeluaran: $e';
      _logger.e('Error adding expense: $e');
      notifyListeners();
      return false;
    }
  }

  Future<bool> addIncomeType(IncomeType incomeType) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final success = await _controller.createIncomeType(incomeType);
      _isLoading = false;
      if (success) {
        await fetchAllData(); // Reload income types
        _logger.i('Income type added successfully');
      }
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal menambahkan jenis pendapatan: $e';
      _logger.e('Error adding income type: $e');
      notifyListeners();
      return false;
    }
  }

  Future<bool> addExpenseType(ExpenseType expenseType) async {
    _isLoading = true;
    _errorMessage = '';
    notifyListeners();

    try {
      final success = await _controller.createExpenseType(expenseType);
      _isLoading = false;
      if (success) {
        await fetchAllData(); // Reload expense types
        _logger.i('Expense type added successfully');
      }
      notifyListeners();
      return success;
    } catch (e) {
      _isLoading = false;
      _errorMessage = 'Gagal menambahkan jenis pengeluaran: $e';
      _logger.e('Error adding expense type: $e');
      notifyListeners();
      return false;
    }
  }

  Future<bool> _requestPermissions({required BuildContext context}) async {
    var storageStatus = await Permission.storage.status;
    var notificationStatus = await Permission.notification.status;

    final shouldRequest = await showDialog<bool>(
          context: context,
          builder: (dialogContext) => AlertDialog(
            title: const Text('Izin Diperlukan'),
            content: const Text(
                'Aplikasi memerlukan izin penyimpanan untuk menyimpan file dan izin notifikasi untuk menampilkan status ekspor.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, false),
                child: const Text('Tolak'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(dialogContext, true),
                child: const Text('Izinkan'),
              ),
            ],
          ),
        ) ??
        false;

    if (!shouldRequest) {
      _errorMessage = 'Izin penyimpanan ditolak oleh pengguna';
      _logger.e(_errorMessage);
      return false;
    }

    if (Platform.isAndroid) {
      try {
        if (await _isAndroid11OrGreater()) {
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
        _errorMessage = 'Izin penyimpanan ditolak permanen. Buka pengaturan.';
        _logger.e(_errorMessage);
        await showDialog(
          context: context,
          builder: (dialogContext) => AlertDialog(
            title: const Text('Izin Ditolak Permanen'),
            content: const Text(
                'Izin penyimpanan ditolak permanen. Buka pengaturan aplikasi.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('Batal'),
              ),
              TextButton(
                onPressed: () async {
                  await openAppSettings();
                  Navigator.pop(dialogContext);
                },
                child: const Text('Buka Pengaturan'),
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
        _errorMessage = 'Izin notifikasi ditolak permanen. Buka pengaturan.';
        _logger.e(_errorMessage);
        await showDialog(
          context: context,
          builder: (dialogContext) => AlertDialog(
            title: const Text('Izin Ditolak Permanen'),
            content: const Text(
                'Izin notifikasi ditolak permanen. Buka pengaturan aplikasi.'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('Batal'),
              ),
              TextButton(
                onPressed: () async {
                  await openAppSettings();
                  Navigator.pop(dialogContext);
                },
                child: const Text('Buka Pengaturan'),
              ),
            ],
          ),
        );
        return false;
      }

      _logger.i('Storage: $storageStatus, Notification: $notificationStatus');
      return storageStatus.isGranted && notificationStatus.isGranted;
    }

    if (!storageStatus.isGranted) {
      storageStatus = await Permission.storage.request();
    }
    if (storageStatus.isPermanentlyDenied) {
      _errorMessage = 'Izin penyimpanan ditolak permanen. Buka pengaturan.';
      _logger.e(_errorMessage);
      await showDialog(
        context: context,
        builder: (dialogContext) => AlertDialog(
          title: const Text('Izin Ditolak Permanen'),
          content: const Text(
              'Izin penyimpanan ditolak permanen. Buka pengaturan aplikasi.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () async {
                await openAppSettings();
                Navigator.pop(dialogContext);
              },
              child: const Text('Buka Pengaturan'),
            ),
          ],
        ),
      );
      return false;
    }

    _logger.i('Storage: $storageStatus');
    return storageStatus.isGranted;
  }

  Future<bool> _isAndroid11OrGreater() async {
    if (Platform.isAndroid) {
      try {
        var sdkInt = await DeviceInfoPlugin()
            .androidInfo
            .then((info) => info.version.sdkInt);
        _logger.i('Android SDK: $sdkInt');
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
      'finance_notification_channel',
      'Finance Notifications',
      channelDescription: 'Notifications for finance transactions and exports',
      importance: Importance.high,
      priority: Priority.high,
    );
    const notificationDetails = NotificationDetails(
      android: androidDetails,
    );
    try {
      await _notificationsPlugin.show(
        DateTime.now().millisecondsSinceEpoch % 100000,
        title,
        body,
        notificationDetails,
      );
      _logger.i('Notification: $title - $body');
    } catch (e) {
      _logger.e('Error showing notification: $e');
    }
  }
}
