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
        _error = 'Failed to load data.';
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
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const AlertDialog(
            title: Text('Success'),
content: Text('Health check has been successfully saved.'),

          ),
        );

        // Tunggu 1.5 detik, lalu tutup dialog & form
        await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
        if (mounted) {
          Navigator.of(context).pop(); // tutup dialog
          Navigator.of(context).pop(); // tutup form
        }
      }
    } else {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
         title: const Text('Failed'),
content: Text(result['message'] ?? 'Failed to save data.'),

        ),
      );

      await Future.delayed(const Duration(seconds: 2));
      if (mounted) Navigator.of(context).pop(); // tutup dialog saja
    }
  } catch (e) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const AlertDialog(
       title: Text('Error'),
content: Text('An error occurred while saving the data.'),

      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) Navigator.of(context).pop(); // tutup dialog saja
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
  centerTitle: true,
  elevation: 8,
  backgroundColor: Colors.teal[400],
  title: const Text(
    'Add Data',
    style: TextStyle(
      fontWeight: FontWeight.bold,
      fontSize: 20,
      color: Colors.white,
      shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
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
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(
                        _error!,
                        style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w600),
                      ),
                    ),

                  const Text(
                    '📋 Health Check Information',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 12),

                  if (_availableCows.isEmpty)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.shade50,
                        border: Border.all(color: Colors.orange),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.warning, color: Colors.orange),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
"No cows available for health check. Please ensure there are no active checks.",                              style: TextStyle(color: Colors.orange),
                            ),
                          ),
                        ],
                      ),
                    )
                  else
                    DropdownButtonFormField<String>(
                      decoration: InputDecoration(
                        labelText: '🐄 Select Cow',
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      value: _selectedCowId,
                      onChanged: (val) => setState(() => _selectedCowId = val),
                      items: _availableCows.map((cow) {
                        return DropdownMenuItem<String>(
                          value: cow['id'].toString(),
                          child: Text(cow['name'] ?? 'Unnamed'),
                        );
                      }).toList(),
                      validator: (val) => val == null ? 'Cow selection is required' : null,
                    ),

                  const SizedBox(height: 16),
_inputField(
  label: '🌡️ Rectal Temperature (°C)',
  controller: _tempController,
  keyboardType: TextInputType.number,
),
_inputField(
  label: '❤️ Heart Rate (bpm/minutes)',
  controller: _heartRateController,
  keyboardType: TextInputType.number,
),
_inputField(
  label: '🫁 Respiration Rate (bpm/minutes)',
  controller: _respirationController,
  keyboardType: TextInputType.number,
),
_inputField(
  label: '🐄 Rumination (contraction/minutes)',
  controller: _ruminationController,
  keyboardType: TextInputType.number,
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
                      label: Text(_submitting ? 'Saving...' : 'Save'),
                      onPressed: _submitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        backgroundColor: Colors.teal[600],
                        foregroundColor: Colors.white,
                        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
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
      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
    ),
  );
}
}
