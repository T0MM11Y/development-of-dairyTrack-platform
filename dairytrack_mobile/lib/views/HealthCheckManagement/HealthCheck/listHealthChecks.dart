import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'createHealthCheck.dart';
import 'editHealthCheck.dart';


class HealthCheckListView extends StatefulWidget {
  const HealthCheckListView({super.key});

  @override
  State<HealthCheckListView> createState() => _HealthCheckListViewState();
}

class _HealthCheckListViewState extends State<HealthCheckListView> {
  final _controller = HealthCheckController();
  List<Map<String, dynamic>> _healthChecks = [];
  List<Map<String, dynamic>> _userManagedCows = [];
  Map<String, dynamic>? _currentUser;

  bool _loading = true;
  int _currentPage = 1;
  final int _pageSize = 5;
  String _search = '';

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
      debugPrint("✅ Current user: $_currentUser");

      final cowsRes = await CattleDistributionController().listCowsByUser(user['id']);
      debugPrint("🐄 Cows response: $cowsRes");

      _userManagedCows = List<Map<String, dynamic>>.from(cowsRes['data']['cows'] ?? []);
      debugPrint('✅ User managed cows: $_userManagedCows');
      _cows = List<Map<String, dynamic>>.from(cowsRes['data']['cows'] ?? []); // ✅ Tambahkan ini


      final checksRes = await _controller.getHealthChecks();
      final checks = List<Map<String, dynamic>>.from(checksRes['data'] ?? []);
      debugPrint('✅ Raw health checks: $checks');

      final allowedCowIds = _userManagedCows.map((c) => c['id']).toList();
      debugPrint('🆔 Allowed Cow IDs: $allowedCowIds');

      final filtered = checks.where((c) {
        final cowData = c['cow'];
        final cowId = cowData is Map ? cowData['id'] : cowData;
        return allowedCowIds.contains(cowId);
      }).toList();

      debugPrint('✅ Filtered health checks: $filtered');

      setState(() {
        _healthChecks = filtered;
        _loading = false;
      });
    } catch (e, st) {
      debugPrint('❌ Error loading data: $e\n$st');
      setState(() => _loading = false);
    }
  }

  List<Map<String, dynamic>> get _filteredChecks {
    final keyword = _search.toLowerCase();
    return _healthChecks.where((check) {
      final cow = check['cow'] as Map<String, dynamic>? ?? {};
      final name = (cow['name'] ?? '').toString().toLowerCase();
      return name.contains(keyword);
    }).toList();
  }

  Future<void> _deleteCheck(int id) async {
    final result = await _controller.deleteHealthCheck(id);
    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data berhasil dihapus')),
      );
      _loadData();
    }
  }
    List<Map<String, dynamic>> _cows = [];

   List<Map<String, dynamic>> get _availableCows {
  return _cows.where((cow) {
    final hasActiveCheck = _healthChecks.any((h) {
      final cowId = h['cow'] is Map ? h['cow']['id'] : h['cow'];
      final status = (h['status'] ?? '').toLowerCase();
      // jika status !== 'handled' dan !== 'healthy' → anggap masih aktif
      return cowId == cow['id'] && status != 'handled' && status != 'healthy';
    });
    return !hasActiveCheck; // hanya tampilkan sapi yg tidak punya check aktif
  }).toList();
}


  @override
Widget build(BuildContext context) {
  final paginated = _filteredChecks.skip((_currentPage - 1) * _pageSize).take(_pageSize).toList();
  final totalPages = (_filteredChecks.length / _pageSize).ceil();

  return Scaffold(
    appBar: AppBar(
      title: const Text('Pemeriksaan Kesehatan'),
      centerTitle: true,
      backgroundColor: Colors.green[700],
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
                    prefixIcon: const Icon(Icons.search, size: 20),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onChanged: (val) => setState(() {
                    _search = val;
                    _currentPage = 1;
                  }),
                ),
              ),
              Expanded(
                child: paginated.isEmpty
                    ? const Center(child: Text('Tidak ada data pemeriksaan'))
                    : ListView.builder(
                        itemCount: paginated.length,
                        itemBuilder: (context, index) {
                          final item = paginated[index];
                          final cow = item['cow'] as Map<String, dynamic>? ?? {'name': 'Unknown', 'breed': '-'};
                          final status = (item['status'] ?? '').toLowerCase();

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
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '${cow['name']} (${cow['breed']})',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 16,
                                          ),
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
                                            if (status == 'healthy' || status == 'handled') {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(content: Text('Data ini tidak dapat diedit')),
                                              );
                                            } else {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                  builder: (context) => EditHealthCheckView(
                                                    healthCheckId: item['id'],
                                                    onUpdated: _loadData,
                                                  ),
                                                ),
                                              );
                                            }
                                          } else if (value == 'delete') {
                                            final confirmed = await showDialog<bool>(
                                              context: context,
                                              builder: (ctx) => AlertDialog(
                                                title: const Text('Konfirmasi'),
                                                content: const Text('Yakin ingin menghapus data ini?'),
                                                actions: [
                                                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
                                                  ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hapus')),
                                                ],
                                              ),
                                            );
                                            if (confirmed == true) _deleteCheck(item['id']);
                                          }
                                        },
                                        itemBuilder: (context) => const [
                                          PopupMenuItem(value: 'edit', child: Text('Edit')),
                                          PopupMenuItem(value: 'delete', child: Text('Hapus')),
                                        ],
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text('Tanggal: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(item['checkup_date']))}'),
                                  Text('Suhu: ${item['rectal_temperature']} °C, Detak Jantung: ${item['heart_rate']} bpm'),
                                  Text('Napas: ${item['respiration_rate']} bpm, Ruminasi: ${item['rumination']} kontraksi'),
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
      tooltip: 'Tambah Pemeriksaan',
      onPressed: () {
        if (_availableCows.isEmpty) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Tidak Bisa Menambah Pemeriksaan'),
              content: const Text(
                'Tidak ada sapi yang tersedia untuk diperiksa. Semua sapi sudah memiliki pemeriksaan aktif.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('Tutup'),
                ),
              ],
            ),
          );
        } else {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CreateHealthCheckView(onSaved: _loadData),
            ),
          );
        }
      },
      child: const Icon(Icons.add),
    ),
  );
}
}
