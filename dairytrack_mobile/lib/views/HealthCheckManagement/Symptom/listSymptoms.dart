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

      final cowsRes = await _cowController.listCowsByUser(user['id']);
      final cowList = List<Map<String, dynamic>>.from(cowsRes['data']['cows'] ?? []);

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
    return hc['status'] != 'handled';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Gejala Pemeriksaan'),
        backgroundColor: Colors.green[700],
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: 'Tambah Gejala',
        child: const Icon(Icons.add),
        onPressed: () async {
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
                content: const Text(
                  'Tidak ada pemeriksaan yang tersedia untuk ditambahkan gejala.',
                ),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Tutup')),
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
                  padding: const EdgeInsets.all(12.0),
                  child: TextField(
                    decoration: InputDecoration(
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
                Expanded(
                  child: _filteredSymptoms.isEmpty
                      ? const Center(child: Text('Tidak ada data gejala'))
                      : ListView.builder(
                          itemCount: _filteredSymptoms.length,
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
                              elevation: 4,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              child: Padding(
                                padding: const EdgeInsets.all(12.0),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Expanded(
                                          child: Text(
                                            cow['name'] ?? 'Sapi Tidak Ditemukan',
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(
                                            color: statusColor.withOpacity(0.15),
                                            border: Border.all(color: statusColor),
                                            borderRadius: BorderRadius.circular(20),
                                          ),
                                          child: Text(
                                            statusText,
                                            style: TextStyle(color: statusColor, fontWeight: FontWeight.w600),
                                          ),
                                        ),
                                        PopupMenuButton<String>(
                                          onSelected: (value) async {
                                            if (value == 'edit') {
                                              if (!_isEditable(hc)) {
                                                showDialog(
                                                  context: context,
                                                  builder: (ctx) => AlertDialog(
                                                    title: const Text('Tidak Bisa Diedit'),
                                                    content: const Text('Pemeriksaan ini sudah ditangani.'),
                                                    actions: [
                                                      TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Mengerti')),
                                                    ],
                                                  ),
                                                );
                                                return;
                                              }

                                              final result = await Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) => EditSymptomView(symptomId: item['id'], onSaved: _loadData),
                                                ),
                                              );
                                              if (result == true) _loadData();
                                            } else if (value == 'view') {
                                              await Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) => SymptomViewPage(symptomId: item['id'], onClose: () => Navigator.pop(context)),
                                                ),
                                              );
                                            } else if (value == 'delete') {
                                              final confirm = await showDialog(
                                                context: context,
                                                builder: (context) => AlertDialog(
                                                  title: const Text('Konfirmasi Hapus'),
                                                  content: const Text('Yakin ingin menghapus data ini?'),
                                                  actions: [
                                                    TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Batal')),
                                                    TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Hapus')),
                                                  ],
                                                ),
                                              );
                                              if (confirm == true) {
                                                final res = await _symptomController.deleteSymptom(item['id']);
                                                if (res['success'] == true) {
                                                  ScaffoldMessenger.of(context).showSnackBar(
                                                    const SnackBar(
                                                      content: Text('✅ Data gejala berhasil dihapus'),
                                                      backgroundColor: Colors.green,
                                                      duration: Duration(seconds: 2),
                                                    ),
                                                  );
                                                  _loadData();
                                                }
                                              }
                                            }
                                          },
                                          itemBuilder: (context) => const [
                                            PopupMenuItem(value: 'view', child: Text('Lihat')),
                                            PopupMenuItem(value: 'edit', child: Text('Edit')),
                                            PopupMenuItem(value: 'delete', child: Text('Hapus')),
                                          ],
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      'Tanggal Pemeriksaan: ${formatToWIB(item['created_at'])}'
,
                                      style: const TextStyle(fontSize: 13, color: Colors.grey),
                                    ),
                                    if ((item['description'] ?? '').toString().isNotEmpty)
                                      Padding(
                                        padding: const EdgeInsets.only(top: 4),
                                        child: Text('Gejala: ${item['description']}', style: const TextStyle(fontSize: 14)),
                                      ),
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
                        onPressed: _filteredSymptoms.length == _pageSize ? () => setState(() => _currentPage++) : null,
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }
}
