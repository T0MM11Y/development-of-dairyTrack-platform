import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CreateHealthCheckView extends StatefulWidget {
  final VoidCallback? onSaved;

  const CreateHealthCheckView({super.key, this.onSaved});

  @override
  State<CreateHealthCheckView> createState() => _CreateHealthCheckViewState();
}

class _CreateHealthCheckViewState extends State<CreateHealthCheckView> {
  final _formKey = GlobalKey<FormState>();
  final _controller = HealthCheckController();

  List<Map<String, dynamic>> _cows = [];
  List<Map<String, dynamic>> _healthChecks = [];
  Map<String, dynamic>? _currentUser;

  String? _selectedCowId;
  final _tempController = TextEditingController();
  final _heartRateController = TextEditingController();
  final _respirationController = TextEditingController();
  final _ruminationController = TextEditingController();

  bool _loading = true;
  bool _submitting = false;
  String? _error;

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
      final user = await _getUser();
      _currentUser = user;

      final cowRes = await CattleDistributionController().listCowsByUser(user['id']);
      final checkRes = await _controller.getHealthChecks();

      setState(() {
        _cows = List<Map<String, dynamic>>.from(cowRes['data']['cows'] ?? []);
        _healthChecks = List<Map<String, dynamic>>.from(checkRes['data'] ?? []);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = 'Gagal memuat data.';
      });
    }
  }

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


  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    final payload = {
      'cow_id': int.parse(_selectedCowId!),
      'rectal_temperature': double.tryParse(_tempController.text),
      'heart_rate': int.tryParse(_heartRateController.text),
      'respiration_rate': int.tryParse(_respirationController.text),
      'rumination': double.tryParse(_ruminationController.text),
      'checked_by': _currentUser?['id'],
    };

    try {
      final result = await _controller.createHealthCheck(payload);
      if (result['success']) {
        widget.onSaved?.call();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Pemeriksaan berhasil disimpan'), backgroundColor: Colors.green),
          );
          Navigator.pop(context);
        }
      } else {
        setState(() => _error = result['message'] ?? 'Gagal menyimpan');
      }
    } catch (e) {
      setState(() => _error = 'Terjadi kesalahan.');
    } finally {
      setState(() => _submitting = false);
    }
  }

  @override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('Tambah Pemeriksaan'),
      backgroundColor: Colors.green[700],
      centerTitle: true,
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
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(_error!, style: const TextStyle(color: Colors.red)),
                    ),

                  const Text('📋 Informasi Pemeriksaan',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),

                  if (_availableCows.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade50,
                        border: Border.all(color: Colors.orange),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        "⚠️ Tidak ada sapi yang tersedia untuk diperiksa. Pastikan tidak ada pemeriksaan aktif.",
                        style: TextStyle(color: Colors.orange),
                      ),
                    )
                  else
                    DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        labelText: '🐄 Pilih Sapi',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      value: _selectedCowId,
                      onChanged: (val) => setState(() => _selectedCowId = val),
                      items: _availableCows.map((cow) {
                        return DropdownMenuItem<String>(
                          value: cow['id'].toString(),
                          child: Text(cow['name'] ?? 'Tanpa Nama'),
                        );
                      }).toList(),
                      validator: (val) => val == null ? 'Wajib pilih sapi' : null,
                    ),

                  const SizedBox(height: 16),
                  _inputField(
                      label: '🌡️ Suhu Rektal (°C)', controller: _tempController, keyboardType: TextInputType.number),
                  _inputField(
                      label: '❤️ Denyut Jantung', controller: _heartRateController, keyboardType: TextInputType.number),
                  _inputField(
                      label: '🫁 Laju Pernapasan', controller: _respirationController, keyboardType: TextInputType.number),
                  _inputField(
                      label: '🐄 Ruminasi (menit)', controller: _ruminationController, keyboardType: TextInputType.number),

                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: _submitting
                          ? const SizedBox(
                              width: 18,
                              height: 18,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Icon(Icons.save),
                      label: Text(_submitting ? 'Menyimpan...' : 'Simpan'),
                      onPressed: _submitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        textStyle: const TextStyle(fontSize: 16),
                        backgroundColor: Colors.green[700],
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
  );
}
Widget _inputField({
  required String label,
  required TextEditingController controller,
  TextInputType keyboardType = TextInputType.text,
}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
      validator: (val) => val == null || val.isEmpty ? 'Wajib diisi' : null,
    ),
  );
}
}
