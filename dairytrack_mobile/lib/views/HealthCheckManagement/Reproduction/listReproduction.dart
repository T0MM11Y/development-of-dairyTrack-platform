import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL3/reproductionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:dairytrack_mobile/views/HealthCheckManagement/Reproduction/createReproduction.dart';
import 'package:dairytrack_mobile/views/HealthCheckManagement/Reproduction/editReproduction.dart';

class ReproductionListView extends StatefulWidget {
  const ReproductionListView({super.key});

  @override
  State<ReproductionListView> createState() => _ReproductionListViewState();
}

class _ReproductionListViewState extends State<ReproductionListView> {
  final _controller = ReproductionController();
  final _cowController = CattleDistributionController();

  List<dynamic> _data = [];
  List<dynamic> _userManagedCows = [];
  List<dynamic> _femaleCows = [];

  int _currentPage = 1;
  final int _pageSize = 5;
  String _searchTerm = '';
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadUserAndData();
  }

 Future<void> _loadUserAndData() async {
  setState(() => _loading = true);
  try {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');

    if (userString == null) {
      setState(() {
        _error = 'User tidak ditemukan. Silakan login ulang.';
        _loading = false;
      });
      return;
    }

    final user = jsonDecode(userString);
    final userCowsRes = await _cowController.listCowsByUser(user['id']);
final cowList = userCowsRes['data']['cows'] ?? [];

    setState(() {
      _currentUser = user;
      _userManagedCows = cowList;
      _femaleCows = cowList.where((c) => c['gender']?.toLowerCase() == 'female').toList();
    });

    await _fetchData();
  } catch (e) {
    debugPrint('❌ ERROR: $e');
    setState(() {
      _error = 'Gagal memuat data.';
      _loading = false;
    });
  }
}


  Future<void> _fetchData() async {
    setState(() => _loading = true);
    try {
      final res = await _controller.getReproductions();

final rawData = res['data'];
final reproductions = rawData is List ? rawData : (rawData['reproductions'] ?? []);

final filtered = _currentUser!['role_id'] == 1
    ? reproductions
    : reproductions.where((item) {
        final cowId = item['cow'] is Map ? item['cow']['id'] : item['cow'];
        return _userManagedCows.any((c) => c['id'] == cowId);
      }).toList();


      setState(() {
        _data = filtered;
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal mengambil data.';
        _loading = false;
      });
    }
  }

  List<Map<String, dynamic>> get _paginatedData {
    final filtered = _data.where((item) {
      final cow = item['cow'];
      final cowName = cow is Map ? cow['name'] ?? '' : '';
      return cowName.toLowerCase().contains(_searchTerm.toLowerCase());
    }).toList();
    final start = (_currentPage - 1) * _pageSize;
    return filtered.skip(start).take(_pageSize).cast<Map<String, dynamic>>().toList();
  }

 @override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('Data Reproduksi'),
      centerTitle: true,
      backgroundColor: Colors.green[700],
    ),
    floatingActionButton: _currentUser?['role_id'] == 2
        ? null
        : FloatingActionButton(
            tooltip: 'Tambah Data Reproduksi',
            onPressed: () {
              if (_femaleCows.isEmpty) {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Tidak Ada Sapi Betina'),
                    content: const Text(
                        'Tidak dapat menambahkan data reproduksi karena tidak ada sapi betina yang tersedia.'),
                    actions: [
                      TextButton(
                          onPressed: () => Navigator.pop(ctx),
                          child: const Text('Tutup')),
                    ],
                  ),
                );
                return;
              }

              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ReproductionCreateView(
                    onSaved: _fetchData,
                  ),
                ),
              );
            },
            child: const Icon(Icons.add),
          ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
            ? Center(child: Text(_error!))
            : Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: TextField(
                      decoration: InputDecoration(
                        labelText: 'Cari nama sapi...',
                        prefixIcon: const Icon(Icons.search),
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      onChanged: (val) => setState(() {
                        _searchTerm = val;
                        _currentPage = 1;
                      }),
                    ),
                  ),
                  Expanded(
                    child: _paginatedData.isEmpty
                        ? const Center(child: Text('Tidak ada data reproduksi'))
                        : ListView.builder(
                            itemCount: _paginatedData.length,
                            itemBuilder: (context, index) {
                              final item = _paginatedData[index];
                              final cow = item['cow'] is Map ? item['cow'] : null;
                              final cowName = cow?['name'] ?? 'Sapi';
                              final cowBreed = cow?['breed'] ?? '-';
                              final conceptionRate = item['conception_rate'] ?? '-';
                              final calvingInterval = item['calving_interval'] ?? '-';
                              final servicePeriod = item['service_period'] ?? '-';

                              return Card(
                                elevation: 4,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              '$cowName ($cowBreed)',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          if (_currentUser?['role_id'] != 2)
                                            PopupMenuButton<String>(
                                              onSelected: (value) async {
                                                if (value == 'edit') {
                                                  final result = await Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                      builder: (context) =>
                                                          ReproductionEditView(
                                                        reproductionId: item['id'],
                                                        onSaved: _fetchData,
                                                      ),
                                                    ),
                                                  );
                                                  if (result == true) _fetchData();
                                                } else if (value == 'delete') {
                                                  final confirm = await showDialog(
                                                    context: context,
                                                    builder: (context) =>
                                                        AlertDialog(
                                                      title: const Text('Konfirmasi Hapus'),
                                                      content: const Text(
                                                          'Yakin ingin menghapus data ini?'),
                                                      actions: [
                                                        TextButton(
                                                            onPressed: () =>
                                                                Navigator.pop(
                                                                    context, false),
                                                            child: const Text('Batal')),
                                                        TextButton(
                                                            onPressed: () =>
                                                                Navigator.pop(
                                                                    context, true),
                                                            child: const Text('Hapus')),
                                                      ],
                                                    ),
                                                  );
                                                  if (confirm == true) {
                                                    await _controller
                                                        .deleteReproduction(
                                                            item['id']);
                                                    _fetchData();
                                                  }
                                                }
                                              },
                                              itemBuilder: (context) => const [
                                                PopupMenuItem(
                                                    value: 'edit',
                                                    child: Text('Edit')),
                                                PopupMenuItem(
                                                    value: 'delete',
                                                    child: Text('Hapus')),
                                              ],
                                            ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text('🔁 Conception Rate: $conceptionRate%',
                                          style: const TextStyle(fontSize: 14)),
                                      const SizedBox(height: 4),
                                      Text('👶 Calving Interval: $calvingInterval',
                                          style: const TextStyle(fontSize: 14)),
                                      const SizedBox(height: 4),
                                      Text('💉 Service Period: $servicePeriod',
                                          style: const TextStyle(fontSize: 14)),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                  if (_data.length > _pageSize)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.arrow_back),
                            onPressed: _currentPage > 1
                                ? () => setState(() => _currentPage--)
                                : null,
                          ),
                          Text('Halaman $_currentPage'),
                          IconButton(
                            icon: const Icon(Icons.arrow_forward),
                            onPressed: _currentPage * _pageSize < _data.length
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