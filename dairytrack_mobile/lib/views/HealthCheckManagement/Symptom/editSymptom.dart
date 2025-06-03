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
      "Mata merah",
      "Mata tidak cemerlang dan atau tidak bersih",
      "Terdapat kotoran atau lendir pada mata",
    ],
    'mouth_condition': [
      "Normal",
      "Mulut berbusa",
      "Mulut mengeluarkan lendir",
      "Mulut terdapat kotoran (terutama di sudut mulut)",
      "Warna bibir pucat",
      "Mulut berbau tidak enak",
      "Terdapat luka di mulut",
    ],
    'nose_condition': [
      "Normal",
      "Hidung mengeluarkan ingus",
      "Hidung mengeluarkan darah",
      "Di sekitar lubang hidung terdapat kotoran",
    ],
    'anus_condition': [
      "Normal",
      "Kotoran terlihat terlalu keras atau terlalu cair (mencret)",
      "Kotoran terdapat bercak darah",
    ],
    'leg_condition': [
      "Normal",
      "Kaki bengkak",
      "Kaki terdapat luka",
      "Luka pada kuku kaki",
    ],
    'skin_condition': [
      "Normal",
      "Kulit terlihat tidak bersih (cemerlang)",
      "Terdapat benjolan atau bentol-bentol",
      "Terdapat luka pada kulit",
      "Terdapat banyak kutu",
    ],
    'behavior': [
      "Normal",
      "Nafsu makan berkurang, beda dari sapi lain",
      "Memisahkan diri dari kawanannya",
      "Seringkali dalam posisi duduk/tidur",
    ],
    'weight_condition': [
      "Normal",
      "Terjadi penurunan bobot dibandingkan sebelumnya",
      "Terlihat tulang karena ADG semakin menurun",
    ],
    'reproductive_condition': [
      "Normal",
      "Kelamin sulit mengeluarkan urine",
      "Kelamin berlendir",
      "Kelamin berdarah",
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
        _error = 'Gagal memuat data gejala';
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
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Berhasil diperbarui')),
          );
          widget.onSaved();
          Navigator.pop(context);
        }
      } else {
        setState(() => _error = res['message'] ?? 'Gagal memperbarui data');
      }
    } catch (e) {
      setState(() => _error = 'Terjadi kesalahan');
    } finally {
      setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Edit Gejala')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Text(_error!, style: const TextStyle(color: Colors.red)),
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
                          child: Text('$rawValue (tidak sesuai daftar)', overflow: TextOverflow.ellipsis),
                        ),
                      ...options.map((opt) => DropdownMenuItem(
                            value: opt,
                            child: Text(
                              opt,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          )),
                    ];

                    return Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: DropdownButtonFormField<String>(
                        isExpanded: true,
                        decoration: InputDecoration(
                          labelText: key.replaceAll('_', ' ').toUpperCase(),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                        ),
                        value: currentValue,
                        items: dropdownItems,
                        onChanged: (val) => setState(() => _form[key] = val),
                      ),
                    );
                  }).toList(),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _submitting ? null : _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green[700],
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _submitting
                          ? const CircularProgressIndicator(color: Colors.white)
                          : const Text('Perbarui Data'),
                    ),
                  )
                ],
              ),
            ),
    );
  }
}
