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
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';


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
  bool get _isAdmin => _currentUser?['role_id'] == 1;
bool get _isSupervisor => _currentUser?['role_id'] == 2;
bool get _isFarmer => _currentUser?['role_id'] == 3;


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
    final userId = user['id'];

    List<Map<String, dynamic>> cowList = [];

    if (_isAdmin || _isSupervisor) {
      // Admin dan supervisor lihat semua sapi
      final allCows = await CowManagementController().listCows();
cowList = allCows.map((c) => c.toJson()).toList().cast<Map<String, dynamic>>();
    } else {
      // Farmer hanya sapi miliknya
      final cowsByUser = await CattleDistributionController().listCowsByUser(userId);
      cowList = List<Map<String, dynamic>>.from(cowsByUser['data']?['cows'] ?? []);
    }

    final diseaseRes = await _controller.getDiseaseHistories();
    final checkRes = await HealthCheckController().getHealthChecks();
    final symptomRes = await SymptomController().getSymptoms();

    setState(() {
      _userManagedCows = cowList;
      _cows = cowList; // agar bisa dipakai di builder juga jika perlu
      _diseaseHistories = List<Map<String, dynamic>>.from(diseaseRes['data'] ?? []);
      _healthChecks = List<Map<String, dynamic>>.from(checkRes['data'] ?? []);
      _symptoms = List<Map<String, dynamic>>.from(symptomRes['data'] ?? []);
      _loading = false;
    });

    debugPrint("✅ Loaded DiseaseHistories: ${_diseaseHistories.length}");
  } catch (e, stack) {
    debugPrint("❌ Failed to load data: $e\n$stack");
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
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        title: Text('Berhasil'),
        content: Text('Riwayat berhasil dihapus.'),
      ),
    );

    await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
    if (mounted) {
      Navigator.of(context).pop(); // Tutup dialog
      _loadData(); // Refresh data
    }
  } else {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        title: Text('Gagal'),
        content: Text('Gagal menghapus riwayat.'),
      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      Navigator.of(context).pop(); // Tutup dialog gagal
    }
  }
}

 @override
Widget build(BuildContext context) {
  final paginatedData = _filteredHistories.skip((_currentPage - 1) * _pageSize).take(_pageSize).toList();
  final totalPages = (_filteredHistories.length / _pageSize).ceil();

  return Scaffold(
    backgroundColor: const Color(0xFFf5f7fa),
  appBar: AppBar(
    title: const Text(
      'Disease History',
      style: TextStyle(
        fontWeight: FontWeight.bold,
        color: Colors.white,
        fontSize: 20,
        shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
      ),
    ),
    centerTitle: true,
    elevation: 8,
    backgroundColor: _isFarmer
        ? Colors.teal[400]
        : _isSupervisor
            ? Colors.blue[700]
            : Colors.blueGrey[800],
  ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: TextField(
                  decoration: InputDecoration(
                    labelText: 'Search Cow Name...',
                    prefixIcon: const Icon(Icons.search),
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  onChanged: (val) => setState(() {
                    _search = val;
                    _currentPage = 1;
                  }),
                ),
              ),
              Expanded(
                child: paginatedData.isEmpty
                    ? const Center(child: Text('No disease history data available'))
                    : ListView.builder(
                        itemCount: paginatedData.length,
                        itemBuilder: (context, index) {
                          final item = paginatedData[index];
                          final hcId = item['health_check'] is Map ? item['health_check']['id'] : item['health_check'];
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
final createdBy = item['created_by']?['name'] ?? 'Uknown';

                          return Card(
                            color: Colors.white,
                            elevation: 3,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Padding(
                              padding: const EdgeInsets.all(16),
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
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text('🦠 Disease: $disease', style: const TextStyle(fontSize: 14)),
                                  const SizedBox(height: 4),
                                  Text('🕒 Date: $createdAt', style: const TextStyle(color: Colors.grey)),
                                  const SizedBox(height: 4),
Text('👤 Recorded By: $createdBy', style: TextStyle(color: Colors.grey)),
                                  const SizedBox(height: 12),
                                  Wrap(
                                    spacing: 10,
                                    runSpacing: 8,
                                    children: [
                                      ElevatedButton.icon(
                                        icon: const Icon(Icons.visibility, size: 18),
                                        label: const Text('View'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.blueGrey,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                        ),
                                        onPressed: () {
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
                                        },
                                      ),
                                      ElevatedButton.icon(
  icon: const Icon(Icons.edit, size: 18),
  label: const Text('Edit'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.orange,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  ),
  onPressed: () {
    if (_isAdmin || _isSupervisor) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
         title: const Text('Access Denied'),
content: const Text('This role does not have permission to edit data.'),

          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Close'),
            ),
          ],
        ),
      );
      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditDiseaseHistoryView(
          historyId: item['id'],
          onUpdated: _loadData,
        ),
      ),
    );
  },
),
                                          ElevatedButton.icon(
  icon: const Icon(Icons.delete, size: 18),
  label: const Text('Delete'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.redAccent,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
  ),
  onPressed: () {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Data Cannot Be Deleted'),
content: const Text('History data cannot be deleted because it is a medical record.'),

        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  },
),
                                    ],
                                  ),
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
                      Text('Page $_currentPage of $totalPages'),
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
backgroundColor: _isFarmer
      ? Colors.teal[400]
      : _isSupervisor
          ? Colors.blue[700]
          : Colors.blueGrey[800],  tooltip: 'Add Data',
  child: const Icon(Icons.add),
  onPressed: () {
    if (_isAdmin || _isSupervisor) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
         title: const Text('Access Denied'),
content: const Text('This role does not have permission to add disease history.'),

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
              title: const Text('No Available Health Checks'),
content: const Text(
  'No selectable health checks found. Make sure the status is not "handled" or "healthy", and the cow belongs to you.'
),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
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