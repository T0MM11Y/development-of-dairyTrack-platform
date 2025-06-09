import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
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
  List<Map<String, dynamic>> _cows = [];

  Map<String, dynamic>? _currentUser;
  bool _loading = true;
  int _currentPage = 1;
  final int _pageSize = 5;
  String _search = '';

  bool get _isAdmin => _currentUser?['role_id'] == 1;
  bool get _isSupervisor => _currentUser?['role_id'] == 2;

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
    final roleId = user['role_id'];
    final userId = user['id'];

    List<Map<String, dynamic>> cows = [];
    Map<String, dynamic>? cowsRes;

   if (_isAdmin) {
  final cowList = await CowManagementController().listCows(); // ✅ return List<Cow>
  cows = cowList.map((cow) => cow.toJson()).cast<Map<String, dynamic>>().toList();
} else {
  final cowsRes = await CattleDistributionController().listCowsByUser(userId);
  final cowData = cowsRes['data'];
  if (cowData != null && cowData['cows'] != null) {
    cows = List<Map<String, dynamic>>.from(cowData['cows']);
  } else {
    cows = [];
    debugPrint('⚠️ Data sapi kosong atau tidak ditemukan.');
  }
}

    _cows = cows;
    _userManagedCows = cows;

    final checksRes = await _controller.getHealthChecks();
    final allChecks = List<Map<String, dynamic>>.from(checksRes['data'] ?? []);

    List<Map<String, dynamic>> filteredChecks = [];

    if (_isAdmin || _isSupervisor) {
      // Admin & Supervisor lihat semua
      filteredChecks = allChecks;
    } else {
      // Hanya user biasa → filter sesuai sapi miliknya
      final allowedCowIds = _userManagedCows.map((c) => c['id']).toList();
      filteredChecks = allChecks.where((c) {
        final cowData = c['cow'];
        final cowId = cowData is Map ? cowData['id'] : cowData;
        return allowedCowIds.contains(cowId);
      }).toList();
    }

    setState(() {
      _healthChecks = filteredChecks;
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

  List<Map<String, dynamic>> get _availableCows {
    return _cows.where((cow) {
      final hasActiveCheck = _healthChecks.any((h) {
        final cowId = h['cow'] is Map ? h['cow']['id'] : h['cow'];
        final status = (h['status'] ?? '').toLowerCase();
        return cowId == cow['id'] && status != 'handled' && status != 'healthy';
      });
      return !hasActiveCheck;
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
@override
Widget build(BuildContext context) {
  final paginated = _filteredChecks.skip((_currentPage - 1) * _pageSize).take(_pageSize).toList();
  final totalPages = (_filteredChecks.length / _pageSize).ceil();

  return Container(
    decoration: const BoxDecoration(
      gradient: LinearGradient(
        colors: [Color(0xFFe0eafc), Color(0xFFcfdef3)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    ),
    child: Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        elevation: 0,
        centerTitle: true,
        title: const Text(
          'Pemeriksaan Kesehatan',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
          ),
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
                      hintText: 'Cari nama sapi...',
                      prefixIcon: const Icon(Icons.search),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onChanged: (val) => setState(() {
                      _search = val;
                      _currentPage = 1;
                    }),
                  ),
                ),
                Expanded(
                  child: paginated.isEmpty
                      ? const Center(
                          child: Text(
                            'Tidak ada data pemeriksaan',
                            style: TextStyle(fontSize: 16),
                          ),
                        )
                      : ListView.builder(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
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
                                            '${cow['name']} (${cow['breed']})',
                                            style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight: FontWeight.bold,
                                            ),
                                          ),
                                        ),
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
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
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    Text('Tanggal Pemeriksaan: ${DateFormat('dd/MM/yyyy').format(DateTime.parse(item['checkup_date']))}'),
                                    const SizedBox(height: 4),
                                    Text('Suhu: ${item['rectal_temperature']} °C'),
                                    Text('Detak Jantung: ${item['heart_rate']} bpm'),
                                    Text('Napas: ${item['respiration_rate']} bpm'),
                                    Text('Ruminasi: ${item['rumination']} kontraksi'),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        ElevatedButton.icon(
                                          icon: const Icon(Icons.edit, size: 18),
                                          label: const Text('Edit'),
                                          onPressed: () {
                                            if (_isAdmin || _isSupervisor) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(
                                                  content: Text('Role ini tidak memiliki izin untuk mengedit data'),
                                                  duration: Duration(seconds: 2),
                                                ),
                                              );
                                              return;
                                            }

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
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.orange,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 16),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        ElevatedButton.icon(
                                          icon: const Icon(Icons.delete, size: 18),
                                          label: const Text('Hapus'),
                                          onPressed: () async {
                                            if (_isAdmin || _isSupervisor) {
                                              ScaffoldMessenger.of(context).showSnackBar(
                                                const SnackBar(
                                                  content: Text('Role ini tidak memiliki izin untuk menghapus data'),
                                                  duration: Duration(seconds: 2),
                                                ),
                                              );
                                              return;
                                            }

                                            final confirmed = await showDialog<bool>(
                                              context: context,
                                              builder: (ctx) => AlertDialog(
                                                title: const Text('Konfirmasi Hapus'),
                                                content: const Text('Yakin ingin menghapus data ini?'),
                                                actions: [
                                                  TextButton(
                                                    onPressed: () => Navigator.pop(ctx, false),
                                                    child: const Text('Batal'),
                                                  ),
                                                  ElevatedButton(
                                                    onPressed: () => Navigator.pop(ctx, true),
                                                    child: const Text('Hapus'),
                                                  ),
                                                ],
                                              ),
                                            );
                                            if (confirmed == true) _deleteCheck(item['id']);
                                          },
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.redAccent,
                                            foregroundColor: Colors.white,
                                            padding: const EdgeInsets.symmetric(horizontal: 16),
                                          ),
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
                    padding: const EdgeInsets.symmetric(vertical: 12),
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
      floatingActionButton: (_isAdmin || _isSupervisor)
          ? null
          : FloatingActionButton(
              tooltip: 'Tambah Pemeriksaan',
              backgroundColor: Colors.blueGrey[800],
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
    ),
  );
}
}