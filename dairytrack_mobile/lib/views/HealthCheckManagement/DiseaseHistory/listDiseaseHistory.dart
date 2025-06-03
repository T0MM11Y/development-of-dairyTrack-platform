import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL3/diseaseHistoryController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'createDiseaseHistory.dart';
import 'editDiseaseHistory.dart';
import 'ViewDiseaseHistory.dart';

class DiseaseHistoryListView extends StatefulWidget {
  const DiseaseHistoryListView({super.key});

  @override
  State<DiseaseHistoryListView> createState() => _DiseaseHistoryListViewState();
}

class _DiseaseHistoryListViewState extends State<DiseaseHistoryListView> {
  final _controller = DiseaseHistoryController();

  List<dynamic> _diseaseHistories = [];
  List<dynamic> _healthChecks = [];
  List<dynamic> _symptoms = [];
  List<dynamic> _cows = [];
  List<dynamic> _userManagedCows = [];

  bool _loading = true;
  bool _submitting = false;
  String _search = '';
  int _currentPage = 1;
  final int _pageSize = 5;
  Map<String, dynamic>? _currentUser;

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

    // Ambil sapi milik user
    final cowsByUser = await CattleDistributionController().listCowsByUser(user['id']);
    final cowList = cowsByUser['data']?['cows'] ?? [];

    // Ambil semua data yang diperlukan
    final diseaseRes = await _controller.getDiseaseHistories();
    final checkRes = await HealthCheckController().getHealthChecks();
    final symptomRes = await SymptomController().getSymptoms();

    setState(() {
      _userManagedCows = List<Map<String, dynamic>>.from(cowList);
      _diseaseHistories = List<Map<String, dynamic>>.from(diseaseRes['data'] ?? []);
      _healthChecks = List<Map<String, dynamic>>.from(checkRes['data'] ?? []);
      _symptoms = List<Map<String, dynamic>>.from(symptomRes['data'] ?? []);
      _loading = false;
    });

    // Debug log (opsional, bisa hapus nanti)
    print("✅ Loaded DiseaseHistories: ${_diseaseHistories.length}");
    print("✅ Loaded HealthChecks: ${_healthChecks.length}");
    print("✅ Loaded User Cows: ${_userManagedCows.length}");
  } catch (e, stack) {
    print("❌ Gagal load data: $e");
    print(stack);
    setState(() => _loading = false);
  }
}

 List<Map<String, dynamic>> get _filteredHistories {
  final keyword = _search.toLowerCase();

  final filtered = _diseaseHistories.where((history) {
    final hcRaw = history['health_check'];
    final hcId = hcRaw is Map ? hcRaw['id'] : hcRaw;

    final check = _healthChecks.firstWhere(
      (c) => c['id'].toString() == hcId.toString(),
      orElse: () {
        debugPrint("❌ Pemeriksaan tidak ditemukan untuk health_check ID: $hcId");
        return <String, dynamic>{};
      },
    );
    if (check.isEmpty) return false;

    final cowId = check['cow'] is Map ? check['cow']['id'] : check['cow'];
    final cow = _userManagedCows.firstWhere(
      (c) => c['id'].toString() == cowId.toString(),
      orElse: () {
        debugPrint("❌ Sapi tidak ditemukan untuk cow ID: $cowId");
        return <String, dynamic>{};
      },
    );
    if (cow.isEmpty) return false;

    final cowName = (cow['name'] ?? '').toString().toLowerCase();
    return cowName.contains(keyword);
  }).toList();

  debugPrint("✅ Filtered Histories Count: ${filtered.length}");
  return filtered.cast<Map<String, dynamic>>();
}


  Future<void> _deleteHistory(int id) async {
    final result = await _controller.deleteDiseaseHistory(id);
    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Riwayat berhasil dihapus')),
      );
      _loadData();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal menghapus')),
      );
    }
  }

  @override
Widget build(BuildContext context) {
  final paginatedData = _filteredHistories.skip((_currentPage - 1) * _pageSize).take(_pageSize).toList();
  final totalPages = (_filteredHistories.length / _pageSize).ceil();

  return Scaffold(
    appBar: AppBar(
      title: const Text('Riwayat Penyakit'),
      backgroundColor: Colors.green[700],
      centerTitle: true,
    ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
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
                child: paginatedData.isEmpty
                    ? const Center(child: Text('Tidak ada data riwayat penyakit'))
                    : ListView.builder(
                        itemCount: paginatedData.length,
                        itemBuilder: (context, index) {
                          final item = paginatedData[index];
                          final hcId = item['health_check'] is Map
                              ? item['health_check']['id']
                              : item['health_check'];

                          final check = _healthChecks.firstWhere(
                            (c) => c['id'].toString() == hcId.toString(),
                            orElse: () => <String, dynamic>{},
                          );
                          if (check.isEmpty) return const SizedBox.shrink();

                          final cowId = check['cow'] is Map ? check['cow']['id'] : check['cow'];
                          final cow = _userManagedCows.firstWhere(
                            (c) => c['id'].toString() == cowId.toString(),
                            orElse: () => <String, dynamic>{},
                          );

                          final symptom = _symptoms.firstWhere(
                            (s) => s['health_check'].toString() == hcId.toString(),
                            orElse: () => <String, dynamic>{},
                          );

                          final cowName = cow['name'] ?? 'Sapi';
                          final breed = cow['breed'] ?? '-';
                          final disease = item['disease_name'] ?? '-';
                          final createdAt = DateFormat("dd MMMM yyyy, HH:mm", "id_ID")
                                  .format(DateTime.parse(item['created_at']).toLocal()) +
                              ' WIB';

                          return Card(
                            elevation: 4,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '$cowName ($breed)',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
                                        ),
                                      ),
                                      PopupMenuButton<String>(
                                        onSelected: (value) {
                                          if (value == 'edit') {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => EditDiseaseHistoryView(
                                                  historyId: item['id'],
                                                  onUpdated: _loadData,
                                                ),
                                              ),
                                            );
                                          } else if (value == 'view') {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) => ViewDiseaseHistoryView(
                                                  history: item,
                                                  check: check,
                                                  symptom: symptom,
                                                  cow: cow,
                                                ),
                                              ),
                                            );
                                          } else if (value == 'delete') {
                                            _deleteHistory(item['id']);
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
                                  Text('🦠 Penyakit: $disease', style: const TextStyle(fontSize: 14)),
                                  const SizedBox(height: 4),
                                  Text('🕒 Tanggal: $createdAt', style: const TextStyle(color: Colors.grey)),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
              if (totalPages > 1)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back),
                        onPressed: _currentPage > 1 ? () => setState(() => _currentPage--) : null,
                      ),
                      Text('Halaman $_currentPage dari $totalPages'),
                      IconButton(
                        icon: const Icon(Icons.arrow_forward),
                        onPressed: _currentPage < totalPages ? () => setState(() => _currentPage++) : null,
                      ),
                    ],
                  ),
                ),
            ],
          ),
    floatingActionButton: FloatingActionButton(
      tooltip: 'Tambah Riwayat Penyakit',
      child: const Icon(Icons.add),
      onPressed: () {
        final availableChecks = _healthChecks.where((hc) {
          final status = (hc['status'] ?? '').toLowerCase();
          final cowId = hc['cow'] is Map ? hc['cow']['id'] : hc['cow'];
          final isOwned = _userManagedCows.any((cow) => cow['id'].toString() == cowId.toString());
          return status != 'handled' && status != 'healthy' && isOwned;
        }).toList();

        if (availableChecks.isEmpty) {
          showDialog(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Tidak Ada Pemeriksaan Tersedia'),
              content: const Text('Tidak ditemukan pemeriksaan yang dapat dipilih. Pastikan status bukan "handled" atau "healthy" dan sapi merupakan milik Anda.'),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Tutup')),
              ],
            ),
          );
        } else {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreateDiseaseHistoryView(
                onSaved: _loadData,
              ),
            ),
          );
        }
      },
    ),
  );
}
}