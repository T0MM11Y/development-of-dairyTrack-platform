import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';
import 'package:dairytrack_mobile/controller/APIURL3/healthCheckController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';

class CreateSymptomView extends StatefulWidget {
  final VoidCallback onSaved;

  const CreateSymptomView({super.key, required this.onSaved});

  @override
  State<CreateSymptomView> createState() => _CreateSymptomViewState();
}

class _CreateSymptomViewState extends State<CreateSymptomView> {
  final _formKey = GlobalKey<FormState>();
  final _symptomController = SymptomController();
  final _healthCheckController = HealthCheckController();
  final _cowController = CattleDistributionController();

  Map<String, dynamic>? _currentUser;
  List<dynamic> _userCows = [];
  List<dynamic> _healthChecks = [];
  List<dynamic> _symptoms = [];
  bool _loading = true;
  bool _submitting = false;
  String? _error;

  final Map<String, dynamic> _form = {
    'health_check': null,
    'eye_condition': 'Normal',
    'mouth_condition': 'Normal',
    'nose_condition': 'Normal',
    'anus_condition': 'Normal',
    'leg_condition': 'Normal',
    'skin_condition': 'Normal',
    'behavior': 'Normal',
    'weight_condition': 'Normal',
    'reproductive_condition': 'Normal',
    'created_by': null,
  };

  final Map<String, List<String>> selectOptions = {
    'eye_condition': [
      "Normal",
  "Red eyes",
  "Eyes look dull or not clear",
  "Eyes have dirt or mucus"
    ],
    'mouth_condition': [
      "Normal",
  "Foamy mouth",
  "Mouth has mucus",
  "Dirt in the mouth (especially at the corners)",
  "Pale lips",
  "Bad mouth odor",
  "Wounds in the mouth"
    ],
    'nose_condition': [
      "Normal",
  "Runny nose",
  "Nosebleed",
  "Dirt around the nostrils"
    ],
    'anus_condition': [
      "Normal",
  "Stool is too hard or too watery (diarrhea)",
  "Stool has blood spots"
    ],
    'leg_condition': [
      "Normal",
  "Swollen leg",
  "Wound on the leg",
  "Injury on the hoof"
    ],
    'skin_condition': [
      "Normal",
  "Skin looks dirty or dull",
  "Lumps or bumps on the skin",
  "Wound on the skin",
  "Many lice on the skin"
    ],
    'behavior': [
      "Normal",
  "Reduced appetite, different from other cows",
  "Separates from the herd",
  "Often lying down or sitting"
    ],
    'weight_condition': [
      "Normal",
  "Weight loss compared to before",
  "Bones are visible due to decreasing weight gain (ADG)"
    ],
    'reproductive_condition': [
      "Normal",
  "Difficulty urinating",
  "Mucus from the genitals",
  "Bleeding from the genitals"
    ],
  };

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
      final cowsRes = await _cowController.listCowsByUser(user['id']);
      final healthRes = await _healthCheckController.getHealthChecks();
      final symptomsRes = await _symptomController.getSymptoms();

      setState(() {
        _currentUser = user;
        _form['created_by'] = user['id'];
        _userCows = cowsRes['data']['cows'] ?? [];
        _healthChecks = healthRes['data'] ?? [];
        _symptoms = symptomsRes['data'] ?? [];
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
        _error = 'Failed to load data.';
      });
    }
  }

  List<dynamic> get filteredHealthChecks {
    return _healthChecks.where((hc) {
      final alreadyHasSymptom = _symptoms.any((s) => s['health_check'] == hc['id']);
      final isAccessible = _userCows.any((cow) => cow['id'] == (hc['cow'] is Map ? hc['cow']['id'] : hc['cow']));
      return hc['needs_attention'] == true && hc['status'] != 'handled' && !alreadyHasSymptom && isAccessible;
    }).toList();
  }

  Future<void> _submit() async {
  if (!_formKey.currentState!.validate()) return;

  setState(() => _submitting = true);

  final response = await _symptomController.createSymptom(_form);

  if (response['success']) {
    if (mounted) {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          title: Text('Success'),
          content: Text('Succes save data.'),
        ),
      );

      await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
      if (mounted) {
        Navigator.of(context).pop(); // tutup dialog
        Navigator.of(context).pop(); // tutup form
        widget.onSaved(); // panggil callback setelah form ditutup
      }
    }
  } else {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Failed'),
        content: Text(response['message'] ?? 'Failed to save data.'),
      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) Navigator.of(context).pop(); // tutup dialog gagal
  }

  if (mounted) {
    setState(() => _submitting = false);
  }
}


 @override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: const Color(0xFFf5f7fa),
    resizeToAvoidBottomInset: true,
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
        : SafeArea(
            child: LayoutBuilder(
              builder: (context, constraints) => SingleChildScrollView(
                child: ConstrainedBox(
                  constraints: BoxConstraints(minHeight: constraints.maxHeight),
                  child: IntrinsicHeight(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            DropdownButtonFormField(
                              value: _form['health_check'],
                              decoration: InputDecoration(
                                labelText: '🩺 Health Check',
                                filled: true,
                                fillColor: Colors.white,
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                              ),
                              items: filteredHealthChecks.map((hc) {
                                final cow = hc['cow'] is Map ? hc['cow'] : null;
                                return DropdownMenuItem(
                                  value: hc['id'],
                                  child: Text('${cow?['name']} - Suhu: ${hc['rectal_temperature']}'),
                                );
                              }).toList(),
                              onChanged: (val) => setState(() => _form['health_check'] = val),
                              validator: (val) => val == null ? 'Please select an option' : null,
                            ),

                            if (filteredHealthChecks.isEmpty)
                              const Padding(
                                padding: EdgeInsets.only(top: 8),
                                child: Text(
'⚠️ No available health checks. Please ensure the cow has no existing symptoms and requires attention.',
                                  style: TextStyle(color: Colors.red),
                                ),
                              ),

                            const SizedBox(height: 24),

                            ...selectOptions.entries.map((entry) {
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 16),
                                child: DropdownButtonFormField(
                                  isExpanded: true,
                                  decoration: InputDecoration(
                                    labelText: '📝 ${entry.key.replaceAll('_', ' ').toUpperCase()}',
                                    filled: true,
                                    fillColor: Colors.white,
                                    contentPadding:
                                        const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                  ),
                                  value: _form[entry.key],
                                  items: entry.value.map((opt) {
                                    return DropdownMenuItem(
                                      value: opt,
                                      child: Text(
                                        opt,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    );
                                  }).toList(),
                                  onChanged: (val) => setState(() => _form[entry.key] = val),
                                ),
                              );
                            }).toList(),

                            const Spacer(),

                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                icon: _submitting
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Icon(Icons.save),
                                label: Text(_submitting ? 'Saving...' : 'Save'),
                                onPressed: _submitting ? null : _submit,
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  backgroundColor: Colors.teal[400],
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
                  ),
                ),
              ),
            ),
          ),
  );
}
}