import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class EditSymptomView extends StatefulWidget {
  final int symptomId;
  final VoidCallback onSaved;

  const EditSymptomView({
    super.key,
    required this.symptomId,
    required this.onSaved,
  });

  @override
  State<EditSymptomView> createState() => _EditSymptomViewState();
}

class _EditSymptomViewState extends State<EditSymptomView> {
  final _controller = SymptomController();
  bool _loading = true;
  bool _submitting = false;
  String? _error;
  Map<String, dynamic> _form = {};

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
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final res = await _controller.getSymptomById(widget.symptomId);
      setState(() {
        _form = Map<String, dynamic>.from(res['data']);
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load data';
        _loading = false;
      });
    }
  }

 Future<void> _submit() async {
  setState(() => _submitting = true);

  try {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    final user = jsonDecode(userString!);

    _form['edited_by'] = user['id'];
    final res = await _controller.updateSymptom(widget.symptomId, _form);

    if (res['success'] == true) {
      if (mounted) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const AlertDialog(
            title: Text('Success'),
            content: Text('Success update data.'),
          ),
        );

        await Future.delayed(const Duration(seconds: 1, milliseconds: 500));
        if (mounted) {
          Navigator.of(context).pop(); // Tutup dialog
          Navigator.of(context).pop(); // Tutup form
          widget.onSaved(); // Callback setelah form ditutup
        }
      }
    } else {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Text('Failed'),
content: Text(res['message'] ?? 'Failed to update data.'),

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
content: Text('An error occurred while updating the data.'),

      ),
    );

    await Future.delayed(const Duration(seconds: 2));
    if (mounted) Navigator.of(context).pop(); // Tutup dialog error
  } finally {
    if (mounted) setState(() => _submitting = false);
  }
}


 @override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: const Color(0xFFf5f7fa),
    appBar: AppBar(
  title: const Text(
    'Edit Symptom',
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
        : SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_error != null)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Text(
                      _error!,
                      style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w500),
                    ),
                  ),

                ...selectOptions.entries.map((entry) {
                  final key = entry.key;
                  final options = entry.value;

                  final rawValue = (_form[key] ?? '').toString().trim();
                  final isKnownOption = options.contains(rawValue);
                  final currentValue = isKnownOption ? rawValue : options.first;

                  final dropdownItems = [
                    if (!isKnownOption && rawValue.isNotEmpty)
                      DropdownMenuItem(
                        value: rawValue,
                        child: Text('$rawValue (unlisted value)', overflow: TextOverflow.ellipsis),
                      ),
                    ...options.map((opt) => DropdownMenuItem(
                          value: opt,
                          child: Text(
                            opt,
                            overflow: TextOverflow.ellipsis,
                            maxLines: 1,
                          ),
                        )),
                  ];

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: DropdownButtonFormField<String>(
                      isExpanded: true,
                      decoration: InputDecoration(
                        labelText: '📝 ${key.replaceAll('_', ' ').toUpperCase()}',
                        filled: true,
                        fillColor: Colors.white,
                        contentPadding:
                            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      value: currentValue,
                      items: dropdownItems,
                      onChanged: (val) => setState(() => _form[key] = val),
                    ),
                  );
                }).toList(),

                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    icon: _submitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.save),
                    label: Text(_submitting ? 'Saving...' : 'Update Data'),
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
  );
}
}