import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:dairytrack_mobile/views/HealthCheckManagement/Symptom/createSymptom.dart';
import 'package:dairytrack_mobile/views/HealthCheckManagement/Symptom/editSymptom.dart';
import 'package:dairytrack_mobile/views/HealthCheckManagement/Symptom/viewSymptom.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:excel/excel.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:permission_handler/permission_handler.dart';
import 'package:printing/printing.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io'; 
import 'package:open_file/open_file.dart';
import 'package:pdf/pdf.dart'; 
class SymptomListView extends StatefulWidget {
  const SymptomListView({super.key});

  @override
  State<SymptomListView> createState() => _SymptomListViewState();
}

String formatToWIB(String isoString) {
  final dateTime = DateTime.parse(isoString);
  final localWIB = dateTime.toLocal();
  return DateFormat("dd MMMM yyyy, HH:mm", "id_ID").format(localWIB) + ' WIB';
}

class _SymptomListViewState extends State<SymptomListView> {
  final _symptomController = SymptomController();
  final _healthCheckController = HealthCheckController();
  final _cowController = CattleDistributionController();

  List<Map<String, dynamic>> _symptoms = [];
  List<Map<String, dynamic>> _healthChecks = [];
  List<Map<String, dynamic>> _cows = [];
  Map<String, dynamic>? _currentUser;

  bool get _isAdmin => _currentUser?['role_id'] == 1;
  bool get _isSupervisor => _currentUser?['role_id'] == 2;

  String _search = '';
  bool _loading = true;
  int _currentPage = 1;
  final int _pageSize = 5;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<Map<String, dynamic>> _getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    if (userString != null) {
      return jsonDecode(userString) as Map<String, dynamic>;
    } else {
      throw Exception('User not found in SharedPreferences');
    }
  }

  Future<void> _loadData() async {
  setState(() => _loading = true);
  try {
    final user = await _getUser();
    _currentUser = user;
    final userId = user['id'];

    List<Map<String, dynamic>> cowList = [];

    if (_isAdmin || _isSupervisor) {
      // Ambil semua sapi untuk admin/supervisor
      final allCowModel = await CowManagementController().listCows();
      cowList = allCowModel.map((c) => c.toJson()).cast<Map<String, dynamic>>().toList();
    } else {
      // User biasa → hanya sapi miliknya
      final cowsRes = await _cowController.listCowsByUser(userId);
      cowList = List<Map<String, dynamic>>.from(cowsRes['data']['cows'] ?? []);
    }

    final hcRes = await _healthCheckController.getHealthChecks();
    final symRes = await _symptomController.getSymptoms();

    setState(() {
      _cows = cowList;
      _healthChecks = List<Map<String, dynamic>>.from(hcRes['data'] ?? []);
      _symptoms = List<Map<String, dynamic>>.from(symRes['data'] ?? []);
      _loading = false;
    });
  } catch (e) {
    debugPrint("❌ Error loading data: $e");
    setState(() => _loading = false);
  }
}


  List<Map<String, dynamic>> get _filteredSymptoms {
    final filtered = _symptoms.where((s) {
      final hc = _healthChecks.firstWhere((h) => h['id'] == s['health_check'], orElse: () => {});
      if (hc.isEmpty) return false;
      final cowId = hc['cow'] is Map ? hc['cow']['id'] : hc['cow'];
      final cow = _cows.firstWhere((c) => c['id'] == cowId, orElse: () => {});
      if (cow.isEmpty) return false;
      return (cow['name'] ?? '').toString().toLowerCase().contains(_search.toLowerCase());
    }).toList();

    filtered.sort((a, b) {
      final dateA = DateTime.tryParse(a['created_at'] ?? '') ?? DateTime(2000);
      final dateB = DateTime.tryParse(b['created_at'] ?? '') ?? DateTime(2000);
      return dateB.compareTo(dateA);
    });

    final start = (_currentPage - 1) * _pageSize;
    return filtered.skip(start).take(_pageSize).toList();
  }

  bool _isEditable(Map<String, dynamic> hc) {
    return !_isAdmin && !_isSupervisor && hc['status'] != 'handled';
  }
 Future<void> exportSymptomToExcel(BuildContext context) async {
  final excel = Excel.createExcel();
  final sheet = excel['Laporan_Gejala_Sapi'];
  final headers = [
    'Nama Sapi', 'Suhu Rektal', 'Denyut Jantung', 'Laju Pernapasan', 'Ruminasi',
    'Kondisi Mata', 'Kondisi Mulut', 'Kondisi Hidung', 'Kondisi Anus', 'Kondisi Kaki',
    'Kondisi Kulit', 'Perilaku', 'Berat Badan', 'Kondisi Kelamin'
  ];

  sheet.appendRow(headers);

  // 💠 Tambahkan style ke header
  for (int i = 0; i < headers.length; i++) {
    final cell = sheet.cell(CellIndex.indexByColumnRow(columnIndex: i, rowIndex: 0));
    cell.cellStyle = CellStyle(
      bold: true,
      fontFamily: getFontFamily(FontFamily.Calibri),
      fontSize: 10,
      horizontalAlign: HorizontalAlign.Center,
      verticalAlign: VerticalAlign.Center,
      backgroundColorHex: "#DDDDDD",
    );
  }

  // Data isi
  for (var s in _symptoms) {
    final hc = _healthChecks.firstWhere((h) => h['id'] == s['health_check'], orElse: () => {});
    final cowId = hc['cow'] is Map ? hc['cow']['id'] : hc['cow'];
    final cow = _cows.firstWhere((c) => c['id'] == cowId, orElse: () => {});
    final cowName = cow['name'] ?? '-';

    sheet.appendRow([
      cowName,
      hc['rectal_temperature'] ?? '-',
      hc['heart_rate'] ?? '-',
      hc['respiration_rate'] ?? '-',
      hc['rumination'] ?? '-',
      s['eye_condition'] ?? '-',
      s['mouth_condition'] ?? '-',
      s['nose_condition'] ?? '-',
      s['anus_condition'] ?? '-',
      s['leg_condition'] ?? '-',
      s['skin_condition'] ?? '-',
      s['behavior'] ?? '-',
      s['weight_condition'] ?? '-',
      s['reproductive_condition'] ?? '-',
    ]);
  }

  // 🧠 Hitung lebar maksimal untuk setiap kolom
  final maxLengths = List<int>.filled(headers.length, 0);
  for (int i = 0; i < headers.length; i++) {
    maxLengths[i] = headers[i].length;
  }
  for (var row in sheet.rows.skip(1)) {
    for (int i = 0; i < headers.length; i++) {
      final value = row[i]?.value?.toString() ?? '';
      if (value.length > maxLengths[i]) {
        maxLengths[i] = value.length;
      }
    }
  }

  // ✅ Terapkan lebar kolom dinamis berdasarkan panjang isi
  for (int i = 0; i < maxLengths.length; i++) {
    sheet.setColWidth(i, (maxLengths[i] + 5).toDouble()); // Tambah padding
  }

  // 🚀 Simpan dan buka file
  try {
    final dir = await getDownloadsDirectory();
    final file = File('${dir!.path}/Laporan_Gejala_Sapi.xlsx')
      ..createSync(recursive: true)
      ..writeAsBytesSync(excel.encode()!);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text("Laporan_Gejala_Sapi.xlsx siap diunduh"),
        action: SnackBarAction(
          label: 'Buka',
          onPressed: () {
            OpenFile.open(file.path);
          },
        ),
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text("Gagal menyimpan file: $e")),
    );
  }
}

Future<void> exportSymptomToPdf(BuildContext context) async {
 final pdf = pw.Document(); // Tidak perlu parameter apapun

  final headers = [
    'Nama Sapi', 'Suhu Rektal', 'Denyut Jantung', 'Laju Pernapasan', 'Ruminasi',
    'Kondisi Mata', 'Kondisi Mulut', 'Kondisi Hidung', 'Kondisi Anus', 'Kondisi Kaki',
    'Kondisi Kulit', 'Perilaku', 'Berat Badan', 'Kondisi Kelamin'
  ];

  final dataRows = _symptoms.map((s) {
    final hc = _healthChecks.firstWhere((h) => h['id'] == s['health_check'], orElse: () => {});
    final cowId = hc['cow'] is Map ? hc['cow']['id'] : hc['cow'];
    final cow = _cows.firstWhere((c) => c['id'] == cowId, orElse: () => {});
    final cowName = cow['name'] ?? '-';
    return [
      cowName,
      hc['rectal_temperature']?.toString() ?? '-',
      hc['heart_rate']?.toString() ?? '-',
      hc['respiration_rate']?.toString() ?? '-',
      hc['rumination']?.toString() ?? '-',
      s['eye_condition'] ?? '-',
      s['mouth_condition'] ?? '-',
      s['nose_condition'] ?? '-',
      s['anus_condition'] ?? '-',
      s['leg_condition'] ?? '-',
      s['skin_condition'] ?? '-',
      s['behavior'] ?? '-',
      s['weight_condition'] ?? '-',
      s['reproductive_condition'] ?? '-',
    ];
  }).toList();

 pdf.addPage(
  pw.MultiPage(
    pageFormat: PdfPageFormat.a4.landscape,
    build: (_) => [
      pw.Text(
        'Laporan Data Gejala Sapi',
        style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold),
      ),
      pw.SizedBox(height: 12),
     pw.Table.fromTextArray(
  headers: headers,
  data: dataRows,
  headerStyle: pw.TextStyle(
    fontWeight: pw.FontWeight.bold,
    fontSize: 9,
  ),
  cellStyle: pw.TextStyle(fontSize: 8),
  headerDecoration: pw.BoxDecoration(color: PdfColors.grey300),
  cellAlignment: pw.Alignment.centerLeft,
  columnWidths: {
    0: pw.FixedColumnWidth(70),  // Nama Sapi
    1: pw.FixedColumnWidth(55),  // Suhu Rektal
    2: pw.FixedColumnWidth(55),  // Denyut Jantung
    3: pw.FixedColumnWidth(55),  // Laju Pernapasan
    4: pw.FixedColumnWidth(55),  // Ruminasi
    5: pw.FixedColumnWidth(75),  // Kondisi Mata
    6: pw.FixedColumnWidth(75),  // Kondisi Mulut
    7: pw.FixedColumnWidth(75),  // Kondisi Hidung
    8: pw.FixedColumnWidth(75),  // Kondisi Anus
    9: pw.FixedColumnWidth(75),  // Kondisi Kaki
    10: pw.FixedColumnWidth(75), // Kondisi Kulit
    11: pw.FixedColumnWidth(65), // Perilaku
    12: pw.FixedColumnWidth(70), // Berat Badan
    13: pw.FixedColumnWidth(75), // Kondisi Kelamin
  },
  cellAlignments: {
    0: pw.Alignment.center,
    1: pw.Alignment.center,
    2: pw.Alignment.center,
    3: pw.Alignment.center,
    4: pw.Alignment.center,
  },
),
    ],
  ),
);


  try {
    final dir = await getDownloadsDirectory();
    final file = File('${dir!.path}/Laporan_Gejala_Sapi.pdf')
      ..createSync(recursive: true)
      ..writeAsBytesSync(await pdf.save());
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text("Laporan_Gejala_Sapi.pdf siap diunduh"),
        action: SnackBarAction(
          label: 'Buka',
          onPressed: () {
            OpenFile.open(file.path);
          },
        ),
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Gagal menyimpan file PDF: $e")));
  }
}


@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: const Color(0xFFf5f7fa),
    appBar: AppBar(
      centerTitle: true,
      elevation: 0,
      title: const Text(
        'Gejala Pemeriksaan',
        style: TextStyle(fontWeight: FontWeight.bold),
      ),
      flexibleSpace: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFFe0eafc), Color(0xFFcfdef3)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
      ),
    ),
    
    floatingActionButton: FloatingActionButton(
  tooltip: 'Tambah Gejala',
  backgroundColor: Colors.teal[600],
  child: const Icon(Icons.add),
  onPressed: () async {
    if (_isAdmin || _isSupervisor) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Akses Ditolak'),
          content: const Text('Role ini tidak memiliki izin untuk menambah gejala.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Tutup'),
            ),
          ],
        ),
      );
      return;
    }

    final availableHealthChecks = _healthChecks.where((hc) {
      final alreadyHasSymptom = _symptoms.any((s) => s['health_check'] == hc['id']);
      final isAccessible = _cows.any((cow) => cow['id'] == (hc['cow'] is Map ? hc['cow']['id'] : hc['cow']));
      return hc['needs_attention'] == true &&
          hc['status'] != 'handled' &&
          !alreadyHasSymptom &&
          isAccessible;
    }).toList();

    if (availableHealthChecks.isEmpty) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Tidak Bisa Menambah Gejala'),
          content: const Text('Tidak ada pemeriksaan yang tersedia untuk ditambahkan gejala.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Tutup'),
            ),
          ],
        ),
      );
      return;
    }

              final result = await Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => CreateSymptomView(onSaved: _loadData)),
              );
              if (result == true) _loadData();
            },
          ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(16),
                child: TextField(
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    labelText: 'Cari nama sapi...',
                    prefixIcon: const Icon(Icons.search),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onChanged: (val) => setState(() {
                    _search = val;
                    _currentPage = 1;
                  }),
                ),
              ),
           // Tambahkan ke bagian atas ListView atau AppBar actions tombol berikut:
Padding(
  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
  child: Row(
    mainAxisAlignment: MainAxisAlignment.end,
    children: [
      ElevatedButton.icon(
        onPressed: () => exportSymptomToExcel(context),
        icon: const Icon(Icons.table_chart),
        label: const Text("Export Excel"),
        style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
      ),
      const SizedBox(width: 8),
      ElevatedButton.icon(
        onPressed: () => exportSymptomToPdf(context),
        icon: const Icon(Icons.picture_as_pdf),
        label: const Text("Export PDF"),
        style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
      ),
    ],
  ),
),

              Expanded(
                child: _filteredSymptoms.isEmpty
                    ? const Center(child: Text('Tidak ada data gejala'))
                    : ListView.builder(
                        itemCount: _filteredSymptoms.length,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemBuilder: (context, index) {
                          final item = _filteredSymptoms[index];
                          final hc = _healthChecks.firstWhere((h) => h['id'] == item['health_check'], orElse: () => {});
                          final cowId = hc['cow'] is Map ? hc['cow']['id'] : hc['cow'];
                          final cow = _cows.firstWhere((c) => c['id'] == cowId, orElse: () => {});
                          final status = (hc['status'] ?? '').toLowerCase();

                          Color statusColor;
                          String statusText;
                          if (status == 'healthy') {
                            statusColor = Colors.green;
                            statusText = 'Sehat';
                          } else if (status == 'handled') {
                            statusColor = Colors.blue;
                            statusText = 'Sudah Ditangani';
                          } else {
                            statusColor = Colors.red;
                            statusText = 'Belum Ditangani';
                          }

                          return Card(
                            elevation: 3,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            margin: const EdgeInsets.symmetric(vertical: 8),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          cow['name'] ?? 'Sapi Tidak Ditemukan',
                                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: statusColor.withOpacity(0.15),
                                          borderRadius: BorderRadius.circular(20),
                                        ),
                                        child: Text(
                                          statusText,
                                          style: TextStyle(color: statusColor, fontWeight: FontWeight.w600),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    'Tanggal Pemeriksaan: ${formatToWIB(item['created_at'])}',
                                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                                  ),
                                  if ((item['description'] ?? '').toString().isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 6),
                                      child: Text('Gejala: ${item['description']}',
                                          style: const TextStyle(fontSize: 14)),
                                    ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                     ElevatedButton.icon(
  icon: const Icon(Icons.visibility, size: 18),
  label: const Text('Lihat'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.blueGrey,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 12),
  ),
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => SymptomViewPage(
          symptomId: item['id'],
          onClose: () => Navigator.pop(context),
        ),
      ),
    );
  },
),
const SizedBox(width: 8),

                                      
                                      ElevatedButton.icon(
  icon: const Icon(Icons.edit, size: 18),
  label: const Text('Edit'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.orange,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 12),
  ),
  onPressed: () async {
    if (_isAdmin || _isSupervisor) {
       showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Akses Ditolak'),
          content: const Text('Role ini tidak memiliki izin untuk mengedit data.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Tutup'),
            ),
          ],
        ),
      );
      return;
    }

    if (!_isEditable(hc)) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Tidak Bisa Diedit'),
          content: const Text('Pemeriksaan ini sudah ditangani.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Mengerti'),
            ),
          ],
        ),
      );
      return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditSymptomView(
          symptomId: item['id'],
          onSaved: _loadData,
        ),
      ),
    );

    if (result == true) _loadData();
  },
),
const SizedBox(width: 8),

                                     ElevatedButton.icon(
  icon: const Icon(Icons.delete, size: 18),
  label: const Text('Hapus'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.redAccent,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 12),
  ),
  onPressed: () async {
    if (_isAdmin || _isSupervisor) {
       showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Akses Ditolak'),
          content: const Text('Role ini tidak memiliki izin untuk menghapus data.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Tutup'),
            ),
          ],
        ),
      );
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi Hapus'),
        content: const Text('Yakin ingin menghapus data ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final res = await _symptomController.deleteSymptom(item['id']);
      if (res['success'] == true) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const AlertDialog(
            title: Text('Berhasil'),
            content: Text('Data gejala berhasil dihapus.'),
          ),
        );

        await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
        if (context.mounted) {
          Navigator.of(context).pop(); // Tutup dialog sukses
          _loadData(); // Refresh data
        }
      } else {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Text('Gagal'),
            content: Text(res['message'] ?? 'Gagal menghapus data.'),
          ),
        );

        await Future.delayed(const Duration(seconds: 2));
        if (context.mounted) Navigator.of(context).pop(); // Tutup dialog gagal
      }
    }
  },
),
const SizedBox(width: 8),

                                    ],
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back),
                      onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                    ),
                    Text('Halaman $_currentPage'),
                    IconButton(
                      icon: const Icon(Icons.arrow_forward),
                      onPressed: _filteredSymptoms.length == _pageSize
                          ? () => setState(() => _currentPage++)
                          : null,
                    ),
                  ],
                ),
              ),
            ],
          ),
  );
}
}
Widget _actionButton({
  required IconData icon,
  required Color color,
  required String tooltip,
  required VoidCallback onPressed,
}) {
  return IconButton(
    icon: Icon(icon, color: color),
    tooltip: tooltip,
    onPressed: onPressed,
  );
}
