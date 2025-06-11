import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL3/diseaseHistoryController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CreateDiseaseHistoryView extends StatefulWidget {
  final VoidCallback? onSaved;

  const CreateDiseaseHistoryView({super.key, this.onSaved});

  @override
  State<CreateDiseaseHistoryView> createState() => _CreateDiseaseHistoryViewState();
}

class _CreateDiseaseHistoryViewState extends State<CreateDiseaseHistoryView> {
  final _formKey = GlobalKey<FormState>();
  final _controller = DiseaseHistoryController();

  List<dynamic> _healthChecks = [];
  List<dynamic> _symptoms = [];
  List<dynamic> _userManagedCows = [];

  int? _selectedHealthCheckId;
  Map<String, dynamic>? _selectedCheck;
  Map<String, dynamic>? _selectedSymptom;

  final _diseaseNameController = TextEditingController();
  final _descriptionController = TextEditingController();

  bool _loading = true;
  bool _submitting = false;
  String? _error;
  Map<String, dynamic>? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
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

  Future<void> _loadInitialData() async {
    try {
      final userData = await _getUser();
      final cowsByUser = await CattleDistributionController().listCowsByUser(userData['id']);
      final healthResult = await HealthCheckController().getHealthChecks();
      final symptomResult = await SymptomController().getSymptoms();

      setState(() {
        _currentUser = userData;
        _userManagedCows = cowsByUser['data']?['cows'] ?? [];
        _healthChecks = healthResult['data'] ?? [];
        _symptoms = symptomResult['data'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Gagal memuat data.';
        _loading = false;
      });
    }
  }

  void _onHealthCheckChanged(int? id) {
  setState(() {
    _selectedHealthCheckId = id;

    _selectedCheck = _healthChecks.firstWhere(
      (e) => e['id'] == id,
      orElse: () => <String, dynamic>{},
    );

    _selectedSymptom = _symptoms.firstWhere(
      (e) => e['health_check'] == id,
      orElse: () => null, // Gunakan null agar bisa dicek aman
    );
  });
}


 Future<void> _submit() async {
  if (!_formKey.currentState!.validate() || _selectedHealthCheckId == null) return;

  setState(() {
    _submitting = true;
    _error = null;
  });

  final form = {
    'health_check': _selectedHealthCheckId,
    'disease_name': _diseaseNameController.text,
    'description': _descriptionController.text,
    'created_by': _currentUser?['id'],
  };

  final result = await _controller.createDiseaseHistory(form);

  if (result['success']) {
    if (mounted) {
      widget.onSaved?.call();

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Berhasil'),
          content: Text(result['message'] ?? 'Data berhasil disimpan.'),
        ),
      );

      await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
      if (mounted) {
        Navigator.of(context).pop(); // Tutup dialog
        Navigator.of(context).pop(true); // Tutup form & kirim result
      }
    }
  } else {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Gagal'),
        content: Text(result['message'] ?? 'Gagal menyimpan data.'),
      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) Navigator.of(context).pop(); // Tutup dialog gagal
  }

  if (mounted) {
    setState(() {
      _submitting = false;
    });
  }
}

@override
Widget build(BuildContext context) {
  final eligibleHealthChecks = _healthChecks.where((hc) {
    final status = (hc['status'] ?? '').toLowerCase();
    final cowId = hc['cow'] is Map ? hc['cow']['id'] : hc['cow'];
    final isOwned = _userManagedCows.any((c) => c['id'].toString() == cowId.toString());
    return status != 'handled' && status != 'healthy' && isOwned;
  }).toList();

  final healthCheckItems = eligibleHealthChecks.map<DropdownMenuItem<int>>((hc) {
    final cowId = hc['cow'] is Map ? hc['cow']['id'] : hc['cow'];
    final cow = _userManagedCows.firstWhere(
      (c) => c['id'].toString() == cowId.toString(),
      orElse: () => null,
    );
    final label = cow != null ? '${cow['name']} (${cow['breed']})' : 'ID: $cowId (sapi tidak ditemukan)';
    return DropdownMenuItem(value: hc['id'], child: Text(label));
  }).toList();

  return Scaffold(
    appBar: AppBar(
      title: const Text('Tambah Riwayat Penyakit'),
      centerTitle: true,
      elevation: 0,
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
        : Padding(
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Text(_error!, style: const TextStyle(color: Colors.red)),
                    ),

                  DropdownButtonFormField<int>(
                    decoration: InputDecoration(
                      labelText: 'Pilih Pemeriksaan',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                    ),
                    value: _selectedHealthCheckId,
                    items: healthCheckItems,
                    onChanged: _onHealthCheckChanged,
                    validator: (value) => value == null ? 'Wajib dipilih' : null,
                  ),
                  if (healthCheckItems.isEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 6),
                      child: Text(
                        'Tidak ada pemeriksaan yang tersedia atau tidak ada sapi yang terhubung.',
                        style: TextStyle(color: Colors.red),
                      ),
                    ),

                  const SizedBox(height: 20),

                  if (_selectedCheck != null && _selectedCheck!.isNotEmpty) ...[
                    _sectionTitle('📋 Detail Pemeriksaan'),
                    _infoTile('🌡️ Suhu Rektal', '${_selectedCheck?['rectal_temperature']} °C'),
                    _infoTile('❤️ Denyut Jantung', '${_selectedCheck?['heart_rate']} bpm'),
                    _infoTile('🫁 Laju Pernapasan', '${_selectedCheck?['respiration_rate']} bpm'),
                    _infoTile('🐄 Ruminasi', '${_selectedCheck?['rumination']} menit'),
                    const SizedBox(height: 20),

                    _sectionTitle('🦠 Gejala'),
                    if (_selectedSymptom != null &&
                        _selectedSymptom!.entries.where((e) {
                          final key = e.key;
                          final val = e.value;
                          return !['id', 'health_check', 'created_at'].contains(key) &&
                              val is String &&
                              val.toLowerCase() != 'normal';
                        }).isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: _selectedSymptom!.entries
                            .where((e) {
                              final key = e.key;
                              final val = e.value;
                              return !['id', 'health_check', 'created_at'].contains(key) &&
                                  val is String &&
                                  val.toLowerCase() != 'normal';
                            })
                            .map((e) => Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 2),
                                  child: Text('• ${_capitalize(e.key)}: ${e.value}'),
                                ))
                            .toList(),
                      )
                    else
                      const Text('Tidak ada gejala abnormal ditemukan.',
                          style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 20),
                  ],

                  _sectionTitle('🧬 Nama Penyakit'),
                  TextFormField(
                    controller: _diseaseNameController,
                    decoration: InputDecoration(
                      labelText: 'Nama Penyakit',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
                  ),

                  const SizedBox(height: 16),

                  _sectionTitle('📝 Deskripsi'),
                  TextFormField(
                    controller: _descriptionController,
                    minLines: 3,
                    maxLines: 5,
                    decoration: InputDecoration(
                      labelText: 'Deskripsi',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: Colors.grey.shade100,
                    ),
                    validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
                  ),

                  const SizedBox(height: 30),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: _submitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Icon(Icons.save),
                      label: Text(_submitting ? 'Menyimpan...' : 'Simpan'),
                      onPressed: _submitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        textStyle: const TextStyle(fontSize: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        backgroundColor: Colors.green[700],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
  );
}

Widget _infoTile(String title, String value) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(flex: 5, child: Text(title, style: const TextStyle(color: Colors.black87))),
        Expanded(flex: 5, child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600))),
      ],
    ),
  );
}

Widget _sectionTitle(String title) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(
      title,
      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
    ),
  );
}

String _capitalize(String s) {
  return s
      .replaceAll('_', ' ')
      .split(' ')
      .map((e) => e.isNotEmpty ? e[0].toUpperCase() + e.substring(1) : '')
      .join(' ');
}
}