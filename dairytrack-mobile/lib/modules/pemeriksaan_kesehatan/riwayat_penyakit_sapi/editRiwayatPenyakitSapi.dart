import 'package:dairy_track/config/api/kesehatan/disease_history.dart';
import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/kesehatan/symptom.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/kesehatan/disease_history.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';
import 'package:dairy_track/model/kesehatan/symptom.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class EditRiwayatPenyakitSapi extends StatefulWidget {
  final int diseaseHistoryId;
  final VoidCallback onClose;
  final VoidCallback onSaved;

  const EditRiwayatPenyakitSapi({
    Key? key,
    required this.diseaseHistoryId,
    required this.onClose,
    required this.onSaved,
  }) : super(key: key);

  @override
  _EditRiwayatPenyakitSapiState createState() => _EditRiwayatPenyakitSapiState();
}

class _EditRiwayatPenyakitSapiState extends State<EditRiwayatPenyakitSapi> {
  DiseaseHistory? diseaseHistory;
  HealthCheck? healthCheck;
  Symptom? symptom;
  Cow? cow;

  final TextEditingController diseaseNameController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  bool isLoading = true;
  bool isSubmitting = false;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    setState(() => isLoading = true);
    try {
      final fetchedDiseaseHistory = await getDiseaseHistoryById(widget.diseaseHistoryId);
      final fetchedHealthChecks = await getHealthChecks();
      final fetchedSymptoms = await getSymptoms();
      final fetchedCows = await getCows();

      final hc = fetchedHealthChecks.firstWhere((h) => h.id == fetchedDiseaseHistory.healthCheckId, orElse: () => throw Exception('Pemeriksaan tidak ditemukan'));
Symptom? sym;
try {
  sym = fetchedSymptoms.firstWhere((s) => s.healthCheckId == fetchedDiseaseHistory.healthCheckId);
} catch (e) {
  sym = null;
}

// kemudian kamu pakai cek:
if (sym != null) {
  // render data symptom
} else {
  // data symptom kosong
}
      final relatedCow = fetchedCows.firstWhere((c) => c.id == hc.cowId, orElse: () => throw Exception('Sapi tidak ditemukan'));

      setState(() {
        diseaseHistory = fetchedDiseaseHistory;
        healthCheck = hc;
        symptom = sym;
        cow = relatedCow;

        diseaseNameController.text = fetchedDiseaseHistory.diseaseName;
        descriptionController.text = fetchedDiseaseHistory.description ?? '';
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
  if (diseaseNameController.text.trim().isEmpty || descriptionController.text.trim().isEmpty) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('❗ Semua field harus diisi')),
    );
    return;
  }

  setState(() => isSubmitting = true);

  bool success = false;
  try {
    success = await updateDiseaseHistory(widget.diseaseHistoryId, {
      'disease_name': diseaseNameController.text.trim(),
      'description': descriptionController.text.trim(),
    });
  } catch (e) {
    success = false;
  } finally {
    setState(() => isSubmitting = false);
  }

  if (success) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('✅ Data riwayat penyakit berhasil diperbarui')),
    );
    widget.onSaved(); // ✅ reload setelah sukses
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('❌ Gagal memperbarui data riwayat penyakit')),
    );
  }
}


  @override


Widget build(BuildContext context) {
  return Dialog(
    insetPadding: const EdgeInsets.all(16),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    child: Container(
      padding: const EdgeInsets.all(20),
      constraints: const BoxConstraints(maxHeight: 700),
      child: isLoading
          ? const Center(child: CircularProgressIndicator())
          : diseaseHistory == null
              ? Center(
                  child: Text(
                    error ?? 'Data tidak ditemukan',
                    style: const TextStyle(color: Colors.red, fontSize: 16),
                  ),
                )
              : Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Edit Riwayat Penyakit',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Colors.blueAccent,
                          ),
                        ),
                        IconButton(
                          onPressed: widget.onClose,
                          icon: const Icon(Icons.close, color: Colors.grey),
                        ),
                      ],
                    ),
                    const Divider(thickness: 1),
                    const SizedBox(height: 8),

                    // Content
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (cow != null)
                              infoRow(Icons.pets, 'Sapi: ${cow!.name} (${cow!.breed})'),

                            if (healthCheck != null)
                              cardSection(
                                title: 'Detail Pemeriksaan Kesehatan',
                                children: [
                                  infoRow(Icons.thermostat, 'Suhu Rektal: ${healthCheck!.rectalTemperature} °C'),
                                  infoRow(Icons.favorite, 'Detak Jantung: ${healthCheck!.heartRate} bpm'),
                                  infoRow(Icons.air, 'Laju Pernapasan: ${healthCheck!.respirationRate} bpm'),
                                  infoRow(Icons.restaurant, 'Ruminasi: ${healthCheck!.rumination} kontraksi'),
                                  infoRow(Icons.calendar_today, 'Tanggal: ${DateFormat('dd MMM yyyy').format(healthCheck!.checkupDate)}'),
                                ],
                              ),

                            if (symptom != null)
                              cardSection(
                                title: 'Detail Gejala',
                                children: [
                                  if (symptom!.eyeCondition != null) infoRow(Icons.remove_red_eye, 'Mata: ${symptom!.eyeCondition}'),
                                  if (symptom!.mouthCondition != null) infoRow(Icons.mood_bad, 'Mulut: ${symptom!.mouthCondition}'),
                                  if (symptom!.noseCondition != null) infoRow(Icons.sick, 'Hidung: ${symptom!.noseCondition}'),
                                  if (symptom!.anusCondition != null) infoRow(Icons.warning, 'Anus: ${symptom!.anusCondition}'),
                                  if (symptom!.legCondition != null) infoRow(Icons.directions_walk, 'Kaki: ${symptom!.legCondition}'),
                                  if (symptom!.skinCondition != null) infoRow(Icons.grain, 'Kulit: ${symptom!.skinCondition}'),
                                  if (symptom!.behavior != null) infoRow(Icons.psychology, 'Perilaku: ${symptom!.behavior}'),
                                  if (symptom!.weightCondition != null) infoRow(Icons.monitor_weight, 'Berat Badan: ${symptom!.weightCondition}'),
                                  if (symptom!.reproductiveCondition != null) infoRow(Icons.favorite_border, 'Reproduksi: ${symptom!.reproductiveCondition}'),
                                ],
                              ),

                            const SizedBox(height: 12),

                            // Form input
                            TextFormField(
                              controller: diseaseNameController,
                              decoration: const InputDecoration(
                                labelText: 'Nama Penyakit',
                                border: OutlineInputBorder(),
                              ),
                            ),
                            const SizedBox(height: 12),
                            TextFormField(
                              controller: descriptionController,
                              decoration: const InputDecoration(
                                labelText: 'Deskripsi Penyakit',
                                border: OutlineInputBorder(),
                              ),
                              minLines: 3,
                              maxLines: 5,
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Submit button
                    ElevatedButton(
                      onPressed: isSubmitting ? null : handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isSubmitting
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Perbarui Data', style: TextStyle(fontSize: 16)),
                    ),
                  ],
                ),
    ),
  );
}

// Helper untuk card section
Widget cardSection({required String title, required List<Widget> children}) {
  return Container(
    margin: const EdgeInsets.symmetric(vertical: 8),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.grey[100],
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: Colors.grey.shade300),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.black87),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    ),
  );
}

// Helper untuk info row
Widget infoRow(IconData icon, String text) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(
      children: [
        Icon(icon, size: 18, color: Colors.blueAccent),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(fontSize: 14, color: Colors.black87),
          ),
        ),
      ],
    ),
  );
}

}
