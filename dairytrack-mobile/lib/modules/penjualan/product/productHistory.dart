import 'dart:io';
import 'package:dairy_track/config/api/penjualan/productHistory.dart';
import 'package:dairy_track/model/penjualan/productHistory.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:open_file/open_file.dart';

class ProductHistoryList extends StatefulWidget {
  const ProductHistoryList({super.key});

  @override
  _ProductHistoryListState createState() => _ProductHistoryListState();
}

class _ProductHistoryListState extends State<ProductHistoryList> {
  final _startDateController = TextEditingController();
  final _endDateController = TextEditingController();
  final GlobalKey<RefreshIndicatorState> _refreshIndicatorKey =
      GlobalKey<RefreshIndicatorState>();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _startDateController.text = DateFormat('yyyy-MM-dd')
        .format(DateTime.now().subtract(const Duration(days: 30)));
    _endDateController.text = DateFormat('yyyy-MM-dd').format(DateTime.now());
  }

  Future<void> _selectDate(
      BuildContext context, TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.parse(controller.text),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        controller.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  Future<List<ProductHistory>> fetchProductHistories() async {
    try {
      final startDate = _startDateController.text;
      final endDate = _endDateController.text;
      final queryString = 'start_date=$startDate&end_date=$endDate';
      final histories = await getProductStockHistorys(queryString: queryString);
      return histories;
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat data riwayat produk: $e')),
      );
      return [];
    }
  }

  Future<void> _refreshData() async {
    setState(() {});
    return Future.value();
  }

  Future<bool> _requestStoragePermission() async {
    if (!Platform.isAndroid) {
      print(
          'Non-Android platform (likely iOS): No storage permission required');
      return true;
    }

    // Default to assuming Android 11+ (API 30) if device info fails
    int sdkInt = 30;
    try {
      print('Attempting to initialize DeviceInfoPlugin');
      final androidInfo = await DeviceInfoPlugin().androidInfo;
      sdkInt = androidInfo.version.sdkInt;
      print('Android SDK version: $sdkInt');
    } catch (e) {
      print('Error getting device info: $e');
      print('Assuming Android 11+ (SDK 30) for permission handling');
    }

    Permission permission =
        sdkInt >= 30 ? Permission.manageExternalStorage : Permission.storage;
    print('Selected permission: $permission');

    // Check current permission status
    var status = await permission.status;
    print('Initial permission status ($permission): $status');

    if (status.isGranted) {
      print('Permission already granted');
      return true;
    }

    if (status.isPermanentlyDenied) {
      print('Permission permanently denied, redirecting to settings');
      await _showSettingsDialog();
      status = await permission.status;
      print('Permission status after settings: $status');
      return status.isGranted;
    }

    // Request permission
    status = await permission.request();
    print('Requested permission status ($permission): $status');

    if (status.isGranted) {
      print('Permission granted');
      return true;
    }

    if (status.isPermanentlyDenied) {
      print(
          'Permission permanently denied after request, redirecting to settings');
      await _showSettingsDialog();
      status = await permission.status;
      print('Permission status after second settings check: $status');
      return status.isGranted;
    }

    if (status.isDenied) {
      print('Permission denied (not permanently), user must retry');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
              'Izin penyimpanan ditolak. Silakan coba lagi atau aktifkan di pengaturan.'),
        ),
      );
    }

    return false;
  }

  Future<void> _showSettingsDialog() async {
    await showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Izin Penyimpanan Diperlukan'),
        content: const Text(
            'Aplikasi memerlukan izin untuk menyimpan file ke folder Downloads. Silakan aktifkan izin "Akses semua file" di pengaturan aplikasi.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final opened = await openAppSettings();
              print('Opened app settings: $opened');
            },
            child: const Text('Buka Pengaturan'),
          ),
        ],
      ),
    );
  }

  Future<Directory> _getDownloadsDirectory() async {
    if (Platform.isAndroid) {
      final directory = Directory('/storage/emulated/0/Download');
      print('Attempting to access Downloads directory: ${directory.path}');
      if (await directory.exists()) {
        print('Downloads directory exists and is accessible');
        return directory;
      }
      print(
          'Downloads directory inaccessible, falling back to documents directory');
      final fallbackDir = await getApplicationDocumentsDirectory();
      print('Using fallback directory: ${fallbackDir.path}');
      return fallbackDir;
    } else if (Platform.isIOS) {
      final dir = await getApplicationDocumentsDirectory();
      print('iOS: Using Documents directory: ${dir.path}');
      return dir;
    }
    final dir = await getApplicationDocumentsDirectory();
    print('Unsupported platform, using Documents directory: ${dir.path}');
    return dir;
  }

  Future<void> _exportFile({required bool isPdf}) async {
    setState(() {
      _isLoading = true;
    });

    try {
      final hasPermission = await _requestStoragePermission();
      print('Permission granted: $hasPermission');
      if (!hasPermission) {
        throw Exception(
            'Izin penyimpanan ditolak. Silakan aktifkan izin "Akses semua file" di pengaturan aplikasi.');
      }

      final startDate = _startDateController.text;
      final endDate = _endDateController.text;
      final queryString = 'start_date=$startDate&end_date=$endDate';
      print('Exporting file (PDF: $isPdf) with query: $queryString');
      final bytes = isPdf
          ? await getProductStockHistoryExportPdf(queryString: queryString)
          : await getProductStockHistoryExportExcel(queryString: queryString);

      final directory = await _getDownloadsDirectory();
      final fileName = isPdf
          ? 'product_history_${startDate}_to_${endDate}.pdf'
          : 'product_history_${startDate}_to_${endDate}.xlsx';
      final filePath = '${directory.path}/$fileName';
      print('Attempting to save file to: $filePath');

      final file = File(filePath);
      try {
        await file.writeAsBytes(bytes);
        print('File saved successfully to: $filePath');
      } catch (e) {
        print('Error writing file: $e');
        throw Exception('Gagal menyimpan file ke $filePath: $e');
      }

      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('File disimpan di: $filePath')),
      );

      // Automatically open the file to prompt "Open with" dialog
      try {
        final result = await OpenFile.open(filePath);
        print('OpenFile result: ${result.message}');
        if (result.type != ResultType.done) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Gagal membuka file: ${result.message}'),
            ),
          );
        }
      } catch (e) {
        print('Error opening file: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
                'Gagal membuka file. Silakan buka file dari folder Downloads.'),
          ),
        );
      }
    } catch (e) {
      print('Export error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal mengekspor file: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
      print('Export operation completed');
    }
  }

  // Helper method to determine card color based on changeType
  Color _getCardColor(String changeType) {
    switch (changeType.toLowerCase()) {
      case 'expired':
        return Colors.red[100]!;
      case 'sold':
        return Colors.green[100]!;
      case 'contamination':
        return Colors.yellow[100]!;
      default:
        return Colors.white;
    }
  }

  @override
  void dispose() {
    _startDateController.dispose();
    _endDateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Riwayat Produk'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: RefreshIndicator(
        key: _refreshIndicatorKey,
        onRefresh: _refreshData,
        child: Column(
          children: [
            Card(
              margin: const EdgeInsets.all(8),
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: Column(
                  children: [
                    TextFormField(
                      controller: _startDateController,
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Mulai',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () => _selectDate(context, _startDateController),
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _endDateController,
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Akhir',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () => _selectDate(context, _endDateController),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading
                                ? null
                                : () => _exportFile(isPdf: true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue[700],
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: _isLoading
                                ? const CircularProgressIndicator(
                                    color: Colors.white,
                                  )
                                : const Text('Ekspor PDF'),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading
                                ? null
                                : () => _exportFile(isPdf: false),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green[700],
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 16),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: _isLoading
                                ? const CircularProgressIndicator(
                                    color: Colors.white,
                                  )
                                : const Text('Ekspor Excel'),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Expanded(
              child: FutureBuilder<List<ProductHistory>>(
                future: fetchProductHistories(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return const Center(
                        child:
                            Text('Tidak ada data riwayat produk ditemukan.'));
                  }

                  final histories = snapshot.data!;
                  return ListView.builder(
                    itemCount: histories.length,
                    itemBuilder: (context, index) {
                      final history = histories[index];
                      return Card(
                        margin: const EdgeInsets.symmetric(
                            vertical: 8, horizontal: 16),
                        elevation: 4,
                        color: _getCardColor(history.changeType),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          title: Text(
                            history.productName,
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 8),
                              Text(
                                'Tanggal: ${DateFormat('dd MMM yyyy').format(history.changeDate)}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Tipe Perubahan: ${history.changeType}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Jumlah Perubahan: ${history.quantityChange} ${history.unit}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Stok Produk: ${history.productStock} ${history.unit}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              Text(
                                'Total Harga: Rp ${NumberFormat.currency(locale: 'id_ID', symbol: '', decimalDigits: 0).format(history.totalPrice)}',
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
