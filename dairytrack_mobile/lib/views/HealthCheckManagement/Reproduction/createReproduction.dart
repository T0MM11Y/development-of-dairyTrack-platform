import 'dart:convert';
import 'package:dairytrack_mobile/controller/APIURL3/reproductionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';

class ReproductionCreateView extends StatefulWidget {
  final VoidCallback onSaved;

  const ReproductionCreateView({super.key, required this.onSaved});

  @override
  State<ReproductionCreateView> createState() => _ReproductionCreateViewState();
}

class _ReproductionCreateViewState extends State<ReproductionCreateView> {
  final _formKey = GlobalKey<FormState>();
  final _controller = ReproductionController();

  Map<String, dynamic>? _currentUser;
  List<dynamic> _cows = [];
  bool _loading = true;
  bool _submitting = false;
  String? _error;

  final Map<String, dynamic> _form = {
    'cow': null,
    'calving_date': '',
    'previous_calving_date': '',
    'insemination_date': '',
    'total_insemination': '',
    'successful_pregnancy': '1',
    'created_by': null,
  };

  @override
  void initState() {
    super.initState();
    _loadCows();
  }

  Future<Map<String, dynamic>> _getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    if (userString != null) {
      return jsonDecode(userString);
    } else {
      throw Exception('User not found in SharedPreferences');
    }
  }

  Future<void> _loadCows() async {
    setState(() => _loading = true);
    final user = await _getUser();
    final res = await CattleDistributionController().listCowsByUser(user['id']);
    final rawData = res['data'];
    final allCows = rawData is Map && rawData['cows'] is List ? rawData['cows'] : [];

    setState(() {
      _currentUser = user;
      _form['created_by'] = user['id'];
      _cows = allCows.where((c) => (c['gender'] ?? '').toLowerCase() == 'female').toList();
      _loading = false;
    });
  }

  Future<void> _submit() async {
  if (!_formKey.currentState!.validate()) return;

  final calving = DateTime.tryParse(_form['calving_date']);
  final prevCalving = DateTime.tryParse(_form['previous_calving_date']);
  final insemination = DateTime.tryParse(_form['insemination_date']);
  final total = int.tryParse(_form['total_insemination']);
  final success = int.tryParse(_form['successful_pregnancy']);

 if (prevCalving != null && calving != null && prevCalving.isAfter(calving)) {
  _showError("Previous calving date must be earlier than the current calving date.");
  return;
}
if (insemination != null && calving != null && !insemination.isAfter(calving)) {
  _showError("Insemination date must be after the calving date.");
  return;
}
if (total == null || total < 1) {
  _showError("Total inseminations must be at least 1.");
  return;
}
if (success == null || success < 1 || success > total) {
  _showError("Successful pregnancies must be between 1 and the total number of inseminations.");
  return;
}


  setState(() => _submitting = true);

  final res = await _controller.createReproduction({
    'cow': _form['cow'],
    'calving_date': _form['calving_date'],
    'previous_calving_date': _form['previous_calving_date'],
    'insemination_date': _form['insemination_date'],
    'total_insemination': total,
    'created_by': _form['created_by'],
  });

  if (res['success']) {
    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          title: Text('Success'),
          content: Text('Success to save data.'),
        ),
      );
      await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
      if (mounted) {
        Navigator.of(context).pop(); // Tutup dialog
        Navigator.of(context).pop(); // Tutup form
        widget.onSaved();
      }
    }
  } else {
    _showError(res['message'] ?? 'Failed to save data.');
  }

  if (mounted) setState(() => _submitting = false);
}

Future<void> _showError(String msg) async {
  setState(() => _error = msg);

  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => AlertDialog(
      title: const Text('Failed validation'),
      content: Text(msg),
    ),
  );

  await Future.delayed(const Duration(seconds: 2));
  if (mounted) Navigator.of(context).pop(); // Tutup dialog error
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
            initialDate: DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime(2100),
          );
          if (picked != null) {
            setState(() => _form[key] = picked.toIso8601String().split('T').first);
          }
        },
        validator: (v) => _form[key] == null || _form[key].isEmpty ? 'required' : null,
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
        validator: (v) => v == null || v.isEmpty ? 'required' : null,
      ),
    );
  }
@override
Widget build(BuildContext context) {
  return Scaffold(
   appBar: AppBar(
  title: const Text(
    'Add Data',
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
                  DropdownButtonFormField(
                    decoration: InputDecoration(
                      labelText: 'Select Cow',
                      filled: true,
                      fillColor: Colors.grey.shade100,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    value: _form['cow'],
                    items: _cows
                        .map<DropdownMenuItem<int>>(
                          (cow) => DropdownMenuItem(
                            value: cow['id'],
                            child: Text('${cow['name']} (${cow['breed']})'),
                          ),
                        )
                        .toList(),
                    onChanged: (val) => setState(() => _form['cow'] = val),
                    validator: (val) => val == null ? 'Please select a cow' : null,
                  ),
                  const SizedBox(height: 16),
                  _dateField('📅 Date of Current Calving', 'calving_date'),
                  const SizedBox(height: 12),
                  _dateField('📅 Date of Previous Calving', 'previous_calving_date'),
                  const SizedBox(height: 12),
                  _dateField('📅 Date of Insemination', 'insemination_date'),
                  const SizedBox(height: 12),
                  _numberField('🔢 Total Number of Inseminations', 'total_insemination'),
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
                      label: Text(_submitting ? 'Saving...' : 'Save'),
                      onPressed: _submitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        textStyle: const TextStyle(fontSize: 16),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
backgroundColor: Colors.teal[400],
                        foregroundColor: Colors.white,                                                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
  );
}
}