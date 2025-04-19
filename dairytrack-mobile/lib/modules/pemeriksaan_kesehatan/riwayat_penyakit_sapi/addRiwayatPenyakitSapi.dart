import 'package:dairy_track/config/api/kesehatan/disease_history.dart';
import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/kesehatan/symptom.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';
import 'package:dairy_track/model/kesehatan/symptom.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';

class AddRiwayatPenyakitSapi extends StatefulWidget {
  @override
  _AddRiwayatPenyakitSapiState createState() => _AddRiwayatPenyakitSapiState();
}

class _AddRiwayatPenyakitSapiState extends State<AddRiwayatPenyakitSapi> {
  List<HealthCheck> healthChecks = [];
  List<Symptom> symptoms = [];
  List<Cow> cows = [];

  int? selectedHealthCheckId;
  final TextEditingController diseaseNameController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  bool isLoading = true;
  bool isSubmitting = false;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchAllData();
  }

  Future<void> fetchAllData() async {
    setState(() => isLoading = true);
    try {
      final fetchedHealthChecks = await getHealthChecks();
      final fetchedSymptoms = await getSymptoms();
      final fetchedCows = await getCows();

      setState(() {
        healthChecks = fetchedHealthChecks;
        symptoms = fetchedSymptoms;
        cows = fetchedCows;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal mengambil data: $e';
      });
    } finally {
      setState(() => isLoading = false);
    }
  }

  Future<void> handleSubmit() async {
    if (selectedHealthCheckId == null ||
        diseaseNameController.text.trim().isEmpty ||
        descriptionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Semua field harus diisi')),
      );
      return;
    }

    setState(() => isSubmitting = true);

    try {
      await createDiseaseHistory({
        'health_check': selectedHealthCheckId,
        'disease_name': diseaseNameController.text.trim(),
        'description': descriptionController.text.trim(),
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data riwayat penyakit berhasil disimpan')),
      );
      Navigator.pop(context, true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal menyimpan data riwayat penyakit')),
      );
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  HealthCheck? get selectedHealthCheck {
    if (selectedHealthCheckId == null) return null;
    try {
      return healthChecks.firstWhere((h) => h.id == selectedHealthCheckId);
    } catch (e) {
      return null;
    }
  }

  Symptom? get selectedSymptom {
    if (selectedHealthCheckId == null) return null;
    try {
      return symptoms.firstWhere((s) => s.healthCheckId == selectedHealthCheckId);
    } catch (e) {
      return null;
    }
  }

  Cow? get selectedCow {
    final hc = selectedHealthCheck;
    if (hc == null) return null;
    try {
      return cows.firstWhere((c) => c.id == hc.cowId);
    } catch (e) {
      return null;
    }
  }

  Map<String, dynamic> symptomToMap(Symptom symptom) {
    return {
      'eye_condition': symptom.eyeCondition,
      'mouth_condition': symptom.mouthCondition,
      'nose_condition': symptom.noseCondition,
      'anus_condition': symptom.anusCondition,
      'leg_condition': symptom.legCondition,
      'skin_condition': symptom.skinCondition,
      'behavior': symptom.behavior,
      'weight_condition': symptom.weightCondition,
      'reproductive_condition': symptom.reproductiveCondition,
    };
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Riwayat Penyakit'),
        backgroundColor: Colors.blue[700],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : Padding(
                  padding: const EdgeInsets.all(16),
                  child: ListView(
                    children: [
                      DropdownButtonFormField<int>(
                        value: selectedHealthCheckId,
                        decoration: const InputDecoration(
                          labelText: 'Pilih Pemeriksaan',
                          border: OutlineInputBorder(),
                        ),
                        items: healthChecks
                            .where((h) => h.status != 'handled')
                            .map((h) {
                              Cow? cow;
                              try {
                                cow = cows.firstWhere((c) => c.id == h.cowId);
                              } catch (e) {
                                cow = null;
                              }
                              return DropdownMenuItem<int>(
                                value: h.id,
                                child: Text(cow != null ? '${cow.name} (${cow.breed})' : 'Sapi Tidak Ditemukan'),
                              );
                            }).toList(),
                        onChanged: (value) {
                          setState(() {
                            selectedHealthCheckId = value;
                          });
                        },
                      ),
                      const SizedBox(height: 16),
                      if (selectedHealthCheck != null)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Sapi: ${selectedCow?.name ?? "-"} (${selectedCow?.breed ?? "-"})',
                                style: const TextStyle(color: Colors.grey)),
                            const SizedBox(height: 4),
                            Text('Suhu Rektal: ${selectedHealthCheck?.rectalTemperature ?? "-"} °C',
                                style: const TextStyle(color: Colors.grey)),
                            const SizedBox(height: 8),
                          ],
                        ),
                      if (selectedSymptom != null)
                        Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          child: Padding(
                            padding: const EdgeInsets.all(8),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Gejala:', style: TextStyle(fontWeight: FontWeight.bold)),
                                ...symptomToMap(selectedSymptom!).entries
                                    .where((e) => e.value != null && e.value!.toLowerCase() != 'normal')
                                    .map((e) => Text('${e.key.replaceAll("_", " ")}: ${e.value}'))
                                    .toList(),
                              ],
                            ),
                          ),
                        ),
                      TextFormField(
                        controller: diseaseNameController,
                        decoration: const InputDecoration(
                          labelText: 'Nama Penyakit',
                          border: OutlineInputBorder(),
                        ),
                        enabled: selectedHealthCheckId != null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: descriptionController,
                        decoration: const InputDecoration(
                          labelText: 'Deskripsi Penyakit',
                          border: OutlineInputBorder(),
                        ),
                        minLines: 3,
                        maxLines: 5,
                        enabled: selectedHealthCheckId != null,
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton(
                        onPressed: isSubmitting ? null : handleSubmit,
                        child: isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Simpan'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          minimumSize: const Size(double.infinity, 48),
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}
