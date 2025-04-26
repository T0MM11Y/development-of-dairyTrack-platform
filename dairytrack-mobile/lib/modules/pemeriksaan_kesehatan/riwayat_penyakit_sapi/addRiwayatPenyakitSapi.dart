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
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Semua field harus diisi')),
      );
    }
    return;
  }

  if (mounted) setState(() => isSubmitting = true);

  try {
    await createDiseaseHistory({
      'health_check': selectedHealthCheckId,
      'disease_name': diseaseNameController.text.trim(),
      'description': descriptionController.text.trim(),
    });

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Data riwayat penyakit berhasil disimpan')),
    );
    Navigator.pop(context, true);
  } catch (e) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal menyimpan data riwayat penyakit')),
      );
    }
  } finally {
    if (mounted) setState(() => isSubmitting = false);
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
      elevation: 2,
    ),
    body: isLoading
        ? const Center(child: CircularProgressIndicator())
        : error != null
            ? Center(
                child: Text(
                  error!,
                  style: const TextStyle(color: Colors.red, fontSize: 16),
                ),
              )
            : Padding(
                padding: const EdgeInsets.all(16),
                child: ListView(
                  children: [
                    // Dropdown Pemeriksaan
                    DropdownButtonFormField<int>(
                      value: selectedHealthCheckId,
                      decoration: const InputDecoration(
                        labelText: 'Pilih Pemeriksaan',
                        border: OutlineInputBorder(),
                      ),
                      isExpanded: true,
                      items: healthChecks
                          .where((h) => h.status != 'handled')
                          .map((h) {
                        Cow? cow;
                        try {
                          cow = cows.firstWhere((c) => c.id == h.cowId);
                        } catch (_) {}
                        return DropdownMenuItem<int>(
                          value: h.id,
                          child: Text(
                            cow != null ? '${cow.name} (${cow.breed})' : 'Sapi Tidak Ditemukan',
                            overflow: TextOverflow.ellipsis,
                          ),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          selectedHealthCheckId = value;
                        });
                      },
                    ),

                    const SizedBox(height: 20),

                    // Info Sapi + Kesehatan
                    if (selectedHealthCheck != null)
                      Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 2,
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Detail Sapi',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: Colors.blue[800],
                                ),
                              ),
                              const SizedBox(height: 8),
          infoRow(Icons.pets, 'Sapi: ${selectedCow?.name ?? "-"} (${selectedCow?.breed ?? "-"})'),
          const SizedBox(height: 6),
          infoRow(Icons.thermostat, 'Suhu Rektal: ${selectedHealthCheck?.rectalTemperature ?? "-"} °C'),
          const SizedBox(height: 6),
          infoRow(Icons.favorite, 'Detak Jantung: ${selectedHealthCheck?.heartRate ?? "-"} bpm'),
          const SizedBox(height: 6),
          infoRow(Icons.air, 'Laju Pernapasan: ${selectedHealthCheck?.respirationRate ?? "-"} bpm'),
          const SizedBox(height: 6),
          infoRow(Icons.refresh, 'Rumenasi: ${selectedHealthCheck?.rumination ?? "-"} kontraksi/menit'),
                            ],
                          ),
                        ),
                      ),

                    // Gejala jika ada
                    if (selectedSymptom != null)
                      Card(
                        margin: const EdgeInsets.only(bottom: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        color: Colors.grey[100],
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Gejala Terdeteksi',
                                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                              ),
                              const SizedBox(height: 8),
                              ...symptomToMap(selectedSymptom!).entries
                                  .where((e) => e.value != null && e.value!.toLowerCase() != 'normal')
                                  .map((e) => Padding(
                                        padding: const EdgeInsets.only(bottom: 4),
                                        child: Text(
                                          '${e.key.replaceAll("_", " ")}: ${e.value}',
                                          style: const TextStyle(fontSize: 14, color: Colors.black87),
                                        ),
                                      ))
                                  .toList(),
                            ],
                          ),
                        ),
                      ),

                    // Form Input Nama Penyakit
                    TextFormField(
                      controller: diseaseNameController,
                      decoration: const InputDecoration(
                        labelText: 'Nama Penyakit',
                        border: OutlineInputBorder(),
                      ),
                      enabled: selectedHealthCheckId != null,
                    ),
                    const SizedBox(height: 16),

                    // Form Input Deskripsi
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

                    const SizedBox(height: 24),

                    // Tombol Simpan
                    ElevatedButton(
                      onPressed: isSubmitting ? null : handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        minimumSize: const Size(double.infinity, 48),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: isSubmitting
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                color: Colors.white,
                                strokeWidth: 2,
                              ),
                            )
                          : const Text(
                              'Simpan',
                              style: TextStyle(fontSize: 16),
                            ),
                    ),
                  ],
                ),
              ),
  );
}

// Helper untuk info baris kecil
Widget infoRow(IconData icon, String text) {
  return Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Icon(icon, size: 18, color: Colors.blueAccent),
      const SizedBox(width: 6),
      Expanded(
        child: Text(
          text,
          style: const TextStyle(fontSize: 14, color: Colors.black87),
        ),
      ),
    ],
  );
}

}
