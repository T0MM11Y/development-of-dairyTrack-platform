import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EditHealthCheckView extends StatefulWidget {
  final int healthCheckId;
  final VoidCallback? onUpdated;

  const EditHealthCheckView({
    super.key,
    required this.healthCheckId,
    this.onUpdated,
  });

  @override
  State<EditHealthCheckView> createState() => _EditHealthCheckViewState();
}

class _EditHealthCheckViewState extends State<EditHealthCheckView> {
  final _formKey = GlobalKey<FormState>();
  final _controller = HealthCheckController();

  Map<String, dynamic>? _form;
  String _cowName = '';
  bool _loading = true;
  bool _submitting = false;
  String? _error;

  final _tempController = TextEditingController();
  final _heartRateController = TextEditingController();
  final _respirationController = TextEditingController();
  final _ruminationController = TextEditingController();

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
    try {
      final user = await _getUser();

      final res = await _controller.getHealthCheckById(widget.healthCheckId);
      final cowListRes = await CattleDistributionController().listCowsByUser(user['id']);
      final cowList = List<Map<String, dynamic>>.from(cowListRes['data']['cows'] ?? []);

      final cowData = res['data']['cow'];
      final cowId = cowData is Map ? cowData['id'] : cowData;

      final cow = cowList.firstWhere(
        (c) => c['id'] == cowId,
        orElse: () => <String, dynamic>{},
      );

      setState(() {
        _form = res['data'];
        _tempController.text = _form!['rectal_temperature'].toString();
        _heartRateController.text = _form!['heart_rate'].toString();
        _respirationController.text = _form!['respiration_rate'].toString();
        _ruminationController.text = _form!['rumination'].toString();
        _cowName = cow.isNotEmpty ? "${cow['name']} (${cow['breed']})" : 'Sapi tidak ditemukan';
      });
    } catch (e) {
      setState(() => _error = 'Gagal memuat data pemeriksaan.');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final user = await _getUser();
      final payload = {
        'rectal_temperature': double.tryParse(_tempController.text),
        'heart_rate': int.tryParse(_heartRateController.text),
        'respiration_rate': int.tryParse(_respirationController.text),
        'rumination': double.tryParse(_ruminationController.text),
        'edited_by': user['id'],
      };

      final response = await _controller.updateHealthCheck(widget.healthCheckId, payload);

      if (response['success']) {
        widget.onUpdated?.call();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Pemeriksaan berhasil diperbarui'), backgroundColor: Colors.green),
          );
          Navigator.pop(context);
        }
      } else {
        setState(() => _error = response['message'] ?? 'Gagal memperbarui');
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
        title: const Text('Edit Pemeriksaan'),
        backgroundColor: Colors.green[700],
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _form == null
              ? Center(child: Text(_error ?? 'Data tidak ditemukan'))
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

                        _readonlyField('🐄 Sapi', _cowName),
                        _readonlyField(
                          '📅 Tanggal Pemeriksaan',
                          _form?['checkup_date'] != null
                              ? DateFormat('dd MMM yyyy, HH:mm', 'id_ID')
                                  .format(DateTime.parse(_form!['checkup_date']).toLocal()) + ' WIB'
                              : '-',
                        ),

                        _inputField('🌡️ Suhu Rektal (°C)', _tempController),
                        _inputField('❤️ Denyut Jantung', _heartRateController),
                        _inputField('🫁 Laju Pernapasan', _respirationController),
                        _inputField('🐄 Ruminasi (menit)', _ruminationController),

                        _readonlyField(
                          '📌 Status',
                          _form!['status'] == 'handled' ? '✅ Sudah ditangani' : '⏳ Belum ditangani',
                        ),

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
                            label: Text(_submitting ? 'Menyimpan...' : 'Simpan Perubahan'),
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

  Widget _inputField(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        controller: controller,
        keyboardType: TextInputType.number,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
      ),
    );
  }

Widget _readonlyField(String label, String value) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: TextFormField(
      initialValue: value,
      readOnly: true,
      enabled: false,
      style: const TextStyle(color: Colors.black87),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.grey.shade200,
        labelStyle: const TextStyle(color: Colors.black54),
        border: OutlineInputBorder(
          borderSide: BorderSide.none,
          borderRadius: BorderRadius.circular(12),
        ),
        disabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.grey.shade400),
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    ),
  );
}

}