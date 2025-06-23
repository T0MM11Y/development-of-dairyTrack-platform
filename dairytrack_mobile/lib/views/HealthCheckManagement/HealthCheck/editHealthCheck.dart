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
        _cowName = cow.isNotEmpty ? "${cow['name']} (${cow['breed']})" : 'Cow not found';
      });
    } catch (e) {
      setState(() => _error = 'Failed to load data health check.');
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
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const AlertDialog(
            title: Text('Success'),
            content: Text('Success update data health check.'),
          ),
        );

        await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
        if (mounted) {
          Navigator.of(context).pop(); // Tutup dialog
          Navigator.of(context).pop(); // Tutup form
        }
      }
    } else {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Failed'),
          content: Text(response['message'] ?? 'Failed to update data.'),
        ),
      );

      await Future.delayed(const Duration(seconds: 2));
      if (mounted) Navigator.of(context).pop(); // Tutup dialog
    }
  } catch (e) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
        title: Text('Error'),
content: Text('An error occurred while updating the data.'),

      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) Navigator.of(context).pop(); // Tutup dialog
  } finally {
    if (mounted) {
      setState(() => _submitting = false);
    }
  }
}

@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: const Color(0xFFf5f7fa),
   appBar: AppBar(
  title: const Text(
    'Edit Health Check',
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
        : _form == null
            ? Center(child: Text(_error ?? 'Data not found'))
            : Padding(
                padding: const EdgeInsets.all(16),
                child: Form(
                  key: _formKey,
                  child: ListView(
                    children: [
                      if (_error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: Text(_error!,
                              style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                        ),

                      _readonlyField('🐄 Cow', _cowName),
                      _readonlyField(
                        '📅 Health Check Date',
                        _form?['checkup_date'] != null
                            ? DateFormat('dd MMM yyyy, HH:mm', 'id_ID')
                                    .format(DateTime.parse(_form!['checkup_date']).toLocal()) +
                                ' WIB'
                            : '-',
                      ),

                      _inputField('🌡️ Rectal Temperature (°C)', _tempController),
_inputField('❤️ Heart Rate (bpm/minutes)', _heartRateController),
_inputField('🫁 Respiration Rate (bpm/minutes)', _respirationController),
_inputField('🐄 Rumination (contraction/minutes)', _ruminationController),

_readonlyField(
  '📌 Status',
  _form!['status'] == 'handled' ? '✅ Handled' : '⏳ Not Handled',
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
                          label: Text(_submitting ? 'Saving...' : 'Save Changes'),
                          onPressed: _submitting ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 16),
 backgroundColor: Colors.teal[600],
                        foregroundColor: Colors.white,                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
      style: const TextStyle(fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
      ),
      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
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
      style: const TextStyle(color: Colors.black87, fontSize: 15),
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.grey.shade200,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        labelStyle: const TextStyle(color: Colors.black54),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        disabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade400),
        ),
      ),
    ),
  );
}
}