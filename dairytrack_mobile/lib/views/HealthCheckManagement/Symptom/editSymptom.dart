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
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const AlertDialog(
            title: Text('Berhasil'),
            content: Text('Data berhasil diperbarui.'),
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
          title: const Text('Gagal'),
          content: Text(res['message'] ?? 'Gagal memperbarui data.'),
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
        title: Text('Kesalahan'),
        content: Text('Terjadi kesalahan saat memperbarui data.'),
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
      title: const Text('Edit Gejala'),
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
                        child: Text('$rawValue (tidak sesuai daftar)', overflow: TextOverflow.ellipsis),
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
                    label: Text(_submitting ? 'Menyimpan...' : 'Perbarui Data'),
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
  );
}
}