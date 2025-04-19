import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/kesehatan/symptom.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';

class AddGejala extends StatefulWidget {
  @override
  _AddGejalaState createState() => _AddGejalaState();
}

class _AddGejalaState extends State<AddGejala> {
  final _formKey = GlobalKey<FormState>();

  int? selectedHealthCheckId;
  String? eyeCondition;
  String? mouthCondition;
  String? noseCondition;
  String? anusCondition;
  String? legCondition;
  String? skinCondition;
  String? behavior;
  String? weightCondition;
  String? reproductiveCondition;

  List<HealthCheck> healthChecks = [];
  List<Cow> cows = [];
  bool isLoading = true;
  bool isSubmitting = false;

  final Map<String, List<String>> selectOptions = {
    "eye_condition": [
      "Normal",
      "Mata merah",
      "Mata tidak cemerlang dan atau tidak bersih",
      "Terdapat kotoran atau lendir pada mata",
    ],
    "mouth_condition": [
      "Normal",
      "Mulut berbusa",
      "Mulut mengeluarkan lendir",
      "Mulut terdapat kotoran (terutama di sudut mulut)",
      "Warna bibir pucat",
      "Mulut berbau tidak enak",
      "Terdapat luka di mulut",
    ],
    "nose_condition": [
      "Normal",
      "Hidung mengeluarkan ingus",
      "Hidung mengeluarkan darah",
      "Di sekitar lubang hidung terdapat kotoran",
    ],
    "anus_condition": [
      "Normal",
      "Kotoran terlalu keras atau terlalu cair (mencret)",
      "Kotoran terdapat bercak darah",
    ],
    "leg_condition": [
      "Normal",
      "Kaki bengkak",
      "Kaki terdapat luka",
      "Luka pada kuku kaki",
    ],
    "skin_condition": [
      "Normal",
      "Kulit tidak bersih (cemerlang)",
      "Terdapat benjolan atau bentol-bentol",
      "Terdapat luka pada kulit",
      "Terdapat banyak kutu",
    ],
    "behavior": [
      "Normal",
      "Nafsu makan berkurang",
      "Memisahkan diri dari kawanan",
      "Sering duduk/tidur",
    ],
    "weight_condition": [
      "Normal",
      "Penurunan bobot",
      "Tulang terlihat karena ADG menurun",
    ],
    "reproductive_condition": [
      "Normal",
      "Sulit buang air kecil",
      "Kelamin berlendir",
      "Kelamin berdarah",
    ],
  };

  @override
  void initState() {
    super.initState();
    fetchInitialData();
  }

  Future<void> fetchInitialData() async {
    setState(() => isLoading = true);
    try {
      final fetchedHealthChecks = await getHealthChecks();
      final fetchedCows = await getCows();
      setState(() {
        healthChecks = fetchedHealthChecks;
        cows = fetchedCows;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal mengambil data: $e')),
      );
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (selectedHealthCheckId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih Health Check terlebih dahulu')),
      );
      return;
    }

    setState(() => isSubmitting = true);

    try {
      await createSymptom({
        "health_check": selectedHealthCheckId,
        "eye_condition": eyeCondition,
        "mouth_condition": mouthCondition,
        "nose_condition": noseCondition,
        "anus_condition": anusCondition,
        "leg_condition": legCondition,
        "skin_condition": skinCondition,
        "behavior": behavior,
        "weight_condition": weightCondition,
        "reproductive_condition": reproductiveCondition,
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gejala berhasil ditambahkan')),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal menyimpan: $e')),
      );
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Data Gejala'),
        backgroundColor: Colors.blue,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: ListView(
                  children: [
                   DropdownButtonFormField<int>(
  value: selectedHealthCheckId,
  decoration: const InputDecoration(
    labelText: 'Pilih Pemeriksaan',
    border: OutlineInputBorder(),
  ),
  items: healthChecks
      .where((hc) => hc.needsAttention && hc.status != "handled")
      .map((hc) {
    String cowInfo = "Sapi tidak ditemukan"; // Default kalau gagal
    try {
      final cow = cows.firstWhere((c) => c.id == hc.cowId);
      cowInfo = cow.name;
    } catch (e) {
      // Tetap pakai "Sapi tidak ditemukan"
    }
    return DropdownMenuItem(
      value: hc.id,
      child: Text(
        '$cowInfo - Suhu: ${hc.rectalTemperature}°C, Detak: ${hc.heartRate} bpm, Nafas: ${hc.respirationRate} bpm, Rumenasi: ${hc.rumination} kontraksi',
        style: const TextStyle(fontSize: 12),
      ),
    );
  }).toList(),
  onChanged: (value) => setState(() {
    selectedHealthCheckId = value;
  }),
  validator: (value) => value == null ? 'Harus pilih pemeriksaan' : null,
),

                    const SizedBox(height: 16),

                    ...buildDropdownFields(),

                    const SizedBox(height: 24),
                    ElevatedButton.icon(
                      onPressed: isSubmitting ? null : handleSubmit,
                      icon: const Icon(Icons.save),
                      label: isSubmitting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                            )
                          : const Text('Simpan'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        minimumSize: const Size(double.infinity, 50),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  List<Widget> buildDropdownFields() {
    return [
      buildDropdown('eye_condition', (val) => eyeCondition = val),
      buildDropdown('mouth_condition', (val) => mouthCondition = val),
      buildDropdown('nose_condition', (val) => noseCondition = val),
      buildDropdown('anus_condition', (val) => anusCondition = val),
      buildDropdown('leg_condition', (val) => legCondition = val),
      buildDropdown('skin_condition', (val) => skinCondition = val),
      buildDropdown('behavior', (val) => behavior = val),
      buildDropdown('weight_condition', (val) => weightCondition = val),
      buildDropdown('reproductive_condition', (val) => reproductiveCondition = val),
    ];
  }

  Widget buildDropdown(String key, Function(String?) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: DropdownButtonFormField<String>(
        decoration: InputDecoration(
          labelText: key.replaceAll("_", " ").toUpperCase(),
          border: const OutlineInputBorder(),
        ),
        items: selectOptions[key]!
            .map((option) => DropdownMenuItem(value: option, child: Text(option)))
            .toList(),
        onChanged: onChanged,
      ),
    );
  }
}
