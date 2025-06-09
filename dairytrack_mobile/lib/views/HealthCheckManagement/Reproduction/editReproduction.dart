import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL3/reproductionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ReproductionEditView extends StatefulWidget {
  final int reproductionId;
  final VoidCallback onSaved;

  const ReproductionEditView({
    super.key,
    required this.reproductionId,
    required this.onSaved,
  });

  @override
  State<ReproductionEditView> createState() => _ReproductionEditViewState();
}

class _ReproductionEditViewState extends State<ReproductionEditView> {
  final _formKey = GlobalKey<FormState>();
  final _controller = ReproductionController();

  final Map<String, dynamic> _form = {
    'cow': null,
    'calving_date': '',
    'previous_calving_date': '',
    'insemination_date': '',
    'total_insemination': '',
    'edited_by': null,
  };

  String _cowName = '-';
  String? _error;
  bool _loading = true;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final prefs = await SharedPreferences.getInstance();
      final userString = prefs.getString('user');
      if (userString == null) throw Exception('User tidak ditemukan');
      final user = jsonDecode(userString) as Map<String, dynamic>;

      final response = await _controller.getReproductionById(widget.reproductionId);
      if (response['success'] != true || response['data'] == null) {
        throw Exception('Data reproduksi tidak ditemukan');
      }

      final reproduction = response['data'];
      final cowId = reproduction['cow'] is Map ? reproduction['cow']['id'] : reproduction['cow'];

      final cowListRes = await CattleDistributionController().listCowsByUser(user['id']);
      final cowList = cowListRes['data']?['cows'] ?? [];

      final cow = cowList.firstWhere(
        (c) => c['id'].toString() == cowId.toString(),
        orElse: () => null,
      );

      setState(() {
        _form['cow'] = cowId;
        _form['calving_date'] = reproduction['calving_date'] ?? '';
        _form['previous_calving_date'] = reproduction['previous_calving_date'] ?? '';
        _form['insemination_date'] = reproduction['insemination_date'] ?? '';
        _form['total_insemination'] = reproduction['total_insemination']?.toString() ?? '';
        _form['edited_by'] = user['id'];
        _cowName = cow != null ? '${cow['name']} (${cow['breed']})' : 'Tidak ditemukan';
        _loading = false;
      });
    } catch (e) {
      debugPrint('❌ ERROR: $e');
      setState(() {
        _error = 'Gagal memuat data reproduksi';
        _loading = false;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final calving = DateTime.tryParse(_form['calving_date']);
    final prev = DateTime.tryParse(_form['previous_calving_date']);
    final insemination = DateTime.tryParse(_form['insemination_date']);
    final total = int.tryParse(_form['total_insemination']);

    if (prev != null && calving != null && prev.isAfter(calving)) {
      _showError('Tanggal calving sebelumnya harus lebih awal.');
      return;
    }
    if (insemination != null && calving != null && !insemination.isAfter(calving)) {
      _showError('Tanggal inseminasi harus setelah calving.');
      return;
    }
    if (total == null || total < 1) {
      _showError('Jumlah inseminasi minimal 1.');
      return;
    }

    setState(() => _submitting = true);

    final res = await _controller.updateReproduction(widget.reproductionId, {
      'cow': _form['cow'],
      'calving_date': _form['calving_date'],
      'previous_calving_date': _form['previous_calving_date'],
      'insemination_date': _form['insemination_date'],
      'total_insemination': total,
      'successful_pregnancy': 1, // Default atau sesuaikan
      'edited_by': _form['edited_by'],
    });

    if (res['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Berhasil diperbarui')),
        );
        widget.onSaved();
        Navigator.pop(context);
      }
    } else {
      _showError(res['message'] ?? 'Gagal memperbarui');
    }

    setState(() => _submitting = false);
  }

  void _showError(String msg) {
    setState(() => _error = msg);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red),
    );
  }

  Widget _dateField(String label, String key) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        readOnly: true,
        controller: TextEditingController(
          text: _form[key] != null && _form[key] != ''
              ? DateFormat('dd MMM yyyy', 'id_ID').format(DateTime.parse(_form[key]))
              : '',
        ),
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          suffixIcon: const Icon(Icons.calendar_today),
        ),
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: DateTime.tryParse(_form[key] ?? '') ?? DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
          );
          if (picked != null) {
            setState(() => _form[key] = picked.toIso8601String().split('T').first);
          }
        },
        validator: (v) => _form[key] == null || _form[key].isEmpty ? 'Wajib diisi' : null,
      ),
    );
  }

  Widget _numberField(String label, String key) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        keyboardType: TextInputType.number,
        initialValue: _form[key],
        onChanged: (v) => _form[key] = v,
        validator: (v) => v == null || v.isEmpty ? 'Wajib diisi' : null,
      ),
    );
  }

  @override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('Edit Data Reproduksi'),
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
                  TextFormField(
                    readOnly: true,
                    decoration: InputDecoration(
                      labelText: 'Sapi',
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    initialValue: _cowName,
                  ),
                  const SizedBox(height: 16),
                  _dateField('📅 Tanggal Calving Sekarang', 'calving_date'),
                  const SizedBox(height: 12),
                  _dateField('📅 Tanggal Calving Sebelumnya', 'previous_calving_date'),
                  const SizedBox(height: 12),
                  _dateField('📅 Tanggal Inseminasi', 'insemination_date'),
                  const SizedBox(height: 12),
                  _numberField('🔢 Jumlah Inseminasi', 'total_insemination'),
                  const SizedBox(height: 24),
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
                      label: Text(_submitting ? 'Menyimpan...' : 'Perbarui'),
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
}