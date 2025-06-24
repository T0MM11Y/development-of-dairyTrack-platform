import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL3/diseaseHistoryController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class EditDiseaseHistoryView extends StatefulWidget {
  final int historyId;
  final VoidCallback? onUpdated;

  const EditDiseaseHistoryView({
    super.key,
    required this.historyId,
    this.onUpdated,
  });

  @override
  State<EditDiseaseHistoryView> createState() => _EditDiseaseHistoryViewState();
}

class _EditDiseaseHistoryViewState extends State<EditDiseaseHistoryView> {
  final _formKey = GlobalKey<FormState>();
  final _controller = DiseaseHistoryController();

  final _diseaseNameController = TextEditingController();
  final _descriptionController = TextEditingController();

  Map<String, dynamic>? _disease;
  bool _loading = true;
  bool _submitting = false;
  String? _error;
  int? _userId;

  @override
  void initState() {
    super.initState();
    _loadUser();
    _loadDiseaseHistory();
  }

  Future<void> _loadUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    if (userString != null) {
      final user = jsonDecode(userString);
      _userId = user['id'];
    }
  }

  Future<void> _loadDiseaseHistory() async {
    try {
      final response = await _controller.getDiseaseHistoryById(widget.historyId);
      if (response['success']) {
        setState(() {
          _disease = response['data'];
          _diseaseNameController.text = response['data']['disease_name'] ?? '';
          _descriptionController.text = response['data']['description'] ?? '';
        });
      } else {
        setState(() => _error = response['message']);
      }
    } catch (e) {
      setState(() => _error = 'Failed to load disease history.');
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
    final payload = {
      'disease_name': _diseaseNameController.text,
      'description': _descriptionController.text,
      'edited_by': _userId,
    };

    final response = await _controller.updateDiseaseHistory(widget.historyId, payload);

    if (response['success']) {
      if (mounted) {
        widget.onUpdated?.call();

        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const AlertDialog(
            title: Text('Success'),
            content: Text('Succes update data.'),
          ),
        );

        await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
        if (mounted) {
          Navigator.of(context).pop(); // Tutup dialog
          Navigator.of(context).pop(true); // Tutup form dan kembali ke list
        }
      }
    } else {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Failed'),
          content: Text(response['message'] ?? 'Failed update data.'),
        ),
      );

      await Future.delayed(const Duration(seconds: 2));
      if (mounted) Navigator.of(context).pop(); // Tutup dialog gagal
    }
  } catch (e) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
title: Text('Error'),
content: Text('An error occurred while updating.'),
      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) Navigator.of(context).pop(); // Tutup dialog error
  } finally {
    if (mounted) {
      setState(() => _submitting = false);
    }
  }
}


  @override
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
  title: const Text(
    'Edit Disease History',
    style: TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 20,
      color: Colors.white,
      shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
    ),
  ),
  centerTitle: true,
  elevation: 8,
  backgroundColor: Colors.teal[400],
),

    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : Padding(
            padding: const EdgeInsets.all(16.0),
            child: _disease == null
                ? Text(_error ?? 'Data not found')
                : Form(
                    key: _formKey,
                    child: ListView(
                      children: [
                        if (_error != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: Text(_error!, style: const TextStyle(color: Colors.red)),
                          ),

                        if (_disease?['health_check']?['cow'] != null)
                          _infoField(
                            '🐄 Sapi',
                            '${_disease!['health_check']['cow']['name']} (${_disease!['health_check']['cow']['breed']})',
                          ),

                        if (_disease?['health_check'] != null)
                          _checkupDetails(_disease!['health_check']),

                        if (_disease?['symptom'] != null)
                          _symptomDetails(_disease!['symptom']),

                        const Divider(height: 32),

                        TextFormField(
                          controller: _diseaseNameController,
                          decoration: InputDecoration(
                            labelText: '🧬 Disease Name',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _descriptionController,
                          decoration: InputDecoration(
                            labelText: '📝 Description',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          minLines: 3,
                          maxLines: 5,
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
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
                            label: Text(_submitting ? 'Saving...' : 'Update Data'),
                            onPressed: _submitting ? null : _submit,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 14),
                              textStyle: const TextStyle(fontSize: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
 backgroundColor: Colors.teal[400],
                        foregroundColor: Colors.white,                                ),
                          ),
                        ),
                      ],
                    ),
                  ),
          ),
  );
}

Widget _infoField(String label, String value) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: TextFormField(
      initialValue: value,
      enabled: false,
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        filled: true,
        fillColor: Colors.grey.shade100,
      ),
    ),
  );
}

Widget _checkupDetails(Map<String, dynamic> check) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('📋 Detail Health Check', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('🌡️ Rectal Temperature: ${check['rectal_temperature']} °C'),
              Text('❤️ Heart Rate: ${check['heart_rate']} bpm'),
              Text('🫁 Respiration Rate: ${check['respiration_rate']} bpm'),
              Text('🐄 Rumination: ${check['rumination']} menit'),
              Text('🕒 Date: ${DateFormat('dd MMM yyyy, HH:mm', 'id_ID').format(DateTime.parse(check['checkup_date']).toLocal())} WIB'),
            ],
          ),
        ),
      ],
    ),
  );
}

Widget _symptomDetails(Map<String, dynamic> symptom) {
  final List<Widget> entries = [];
  symptom.forEach((key, value) {
    if (!['id', 'health_check', 'created_at', 'created_by', 'edited_by'].contains(key) && value != null) {
      final label = key.replaceAll('_', ' ').replaceFirstMapped(RegExp(r'^\w'), (m) => m.group(0)!.toUpperCase());
      entries.add(Text('• $label: $value'));
    }
  });

  return Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('🦠 Symptom', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            border: Border.all(color: Colors.grey.shade300),
            borderRadius: BorderRadius.circular(12),
          ),
          child: entries.isNotEmpty
              ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: entries)
              : const Text('No abnormal symptoms recorded.', style: TextStyle(fontStyle: FontStyle.italic)),
        ),
      ],
    ),
  );
}
}