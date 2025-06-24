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
  bool get _isFarmer => _currentUser?['role_id'] == 3;

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
  return !_isAdmin && !_isSupervisor && hc['status'] != 'handled' && hc['status'] != 'healthy';
}

 Future<void> exportSymptomToExcel(BuildContext context) async {
  final excel = Excel.createExcel();
  final sheet = excel['Laporan_Gejala_Sapi'];
 final headers = [
  'Cow Name', 'Rectal Temperature', 'Heart Rate', 'Respiration Rate', 'Rumination',
  'Eye Condition', 'Mouth Condition', 'Nose Condition', 'Anus Condition', 'Leg Condition',
  'Skin Condition', 'Behavior', 'Body Weight', 'Genital Condition'
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
    final file = File('${dir!.path}/Cow_Symptoms_Report.xlsx')
      ..createSync(recursive: true)
      ..writeAsBytesSync(excel.encode()!);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
      content: const Text("Cow_Symptoms_Report.xlsx is ready for download"),
        action: SnackBarAction(
          label: 'Open',
          onPressed: () {
            OpenFile.open(file.path);
          },
        ),
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text("Failed to save file: $e")),
    );
  }
}

Future<void> exportSymptomToPdf(BuildContext context) async {
 final pdf = pw.Document(); // Tidak perlu parameter apapun

 final headers = [
  'Cow Name', 'Rectal Temperature', 'Heart Rate', 'Respiration Rate', 'Rumination',
  'Eye Condition', 'Mouth Condition', 'Nose Condition', 'Anus Condition', 'Leg Condition',
  'Skin Condition', 'Behavior', 'Body Weight', 'Genital Condition'
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
        'Cow Symptom Report ',
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
final file = File('${dir!.path}/Symptom_Report_Cow.pdf')
      ..createSync(recursive: true)
      ..writeAsBytesSync(await pdf.save());
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
content: const Text("The Cow Symptoms Report (PDF) is ready to download"),
        action: SnackBarAction(
          label: 'Open',
          onPressed: () {
            OpenFile.open(file.path);
          },
        ),
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error occurred while saving PDF file: $e")));
  }
}


@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: const Color(0xFFf5f7fa),
    appBar: AppBar(
  centerTitle: true,
  elevation: 8,
  backgroundColor: _isFarmer
      ? Colors.teal[400]
      : _isSupervisor
          ? Colors.blue[700]
          : Colors.blueGrey[800],
  title: const Text(
    'Health Check Symptoms',
    style: TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 20,
      color: Colors.white,
      shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
    ),
  ),
),

    
    floatingActionButton: FloatingActionButton(
  tooltip: 'Add Data',
backgroundColor: _isFarmer
      ? Colors.teal[400]
      : _isSupervisor
          ? Colors.blue[700]
          : Colors.blueGrey[800],  child: const Icon(Icons.add),
  onPressed: () async {
    if (_isAdmin || _isSupervisor) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Access Denied'),
content: const Text('This role does not have permission to add symptoms.'),

          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('close'),
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
          title: const Text('Unable to Add Symptoms'),
content: const Text('There are no health checks available for adding symptoms.'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
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
                    labelText: 'Search cow name...',
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
                    ? const Center(child: Text('No symptom data available'))
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
                            statusText = 'Healthy';
                          } else if (status == 'handled') {
                            statusColor = Colors.blue;
                            statusText = 'Handled';
                          } else {
                            statusColor = Colors.red;
                            statusText = 'Not Handled';
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
                                          cow['name'] ?? 'Cow not found',
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
                                    'Date Created: ${formatToWIB(item['created_at'])}',
                                    style: const TextStyle(fontSize: 13, color: Colors.grey),
                                  ),
                                  Text(
  'Recorded By: ${item['created_by']?['name'] ?? 'Uknown'}',
  style: TextStyle(fontSize: 13, color: Colors.grey),
),
                                  if ((item['description'] ?? '').toString().isNotEmpty)
                                    Padding(
                                      padding: const EdgeInsets.only(top: 6),
                                      child: Text('Symptom: ${item['description']}',
                                          style: const TextStyle(fontSize: 14)),
                                    ),
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                     ElevatedButton.icon(
  icon: const Icon(Icons.visibility, size: 18),
  label: const Text('View'),
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
      title: const Text('Access Denied'),
      content: const Text('This role does not have permission to edit data.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Close'),
        ),
      ],
    ),
  );
  return;
}


 if (hc['status'] == 'handled') {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Cannot Be Edited'),
      content: const Text('This health check has already been handled and cannot be edited.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Understood'),
        ),
      ],
    ),
  );
  return;
}


  if (hc['status'] == 'healthy') {
  showDialog(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Cannot Be Edited'),
      content: const Text('This cow has been declared healthy and its data cannot be edited.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx),
          child: const Text('Understood'),
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
  label: const Text('Delete'),
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
          title: const Text('Access Denied'),
content: const Text('This role does not have permission to delete the data.'),

          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
       title: const Text('Delete Confirmation'),
content: const Text('Are you sure you want to delete this data?'),

        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
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
            title: Text('Success'),
            content: Text('Success delete data.'),
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
            title: const Text('Failed'),
            content: Text(res['message'] ?? 'Failed to delete data.'),
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
                    Text('Page $_currentPage'),
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
