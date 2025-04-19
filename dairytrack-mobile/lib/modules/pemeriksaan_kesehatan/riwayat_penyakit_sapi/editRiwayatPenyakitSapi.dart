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
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxHeight: 700),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : diseaseHistory == null
                ? Center(child: Text(error ?? 'Data tidak ditemukan'))
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
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue),
                          ),
                          IconButton(
                            onPressed: widget.onClose,
                            icon: const Icon(Icons.close),
                          ),
                        ],
                      ),
                      const Divider(),

                      Expanded(
                        child: SingleChildScrollView(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              if (cow != null)
                                Padding(
                                  padding: const EdgeInsets.symmetric(vertical: 4),
                                  child: Text('Sapi: ${cow!.name} (${cow!.breed})',
                                      style: const TextStyle(color: Colors.grey)),
                                ),
                              if (healthCheck != null)
                                Card(
                                  margin: const EdgeInsets.symmetric(vertical: 8),
                                  child: Padding(
                                    padding: const EdgeInsets.all(8),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('Suhu Rektal: ${healthCheck!.rectalTemperature} °C'),
                                        Text('Detak Jantung: ${healthCheck!.heartRate} bpm'),
                                        Text('Laju Pernapasan: ${healthCheck!.respirationRate} bpm'),
                                        Text('Ruminasi: ${healthCheck!.rumination} kontraksi'),
                                        Text('Tanggal Pemeriksaan: ${DateFormat('dd MMM yyyy').format(healthCheck!.checkupDate)}'),
                                      ],
                                    ),
                                  ),
                                ),
                              if (symptom != null)
                                Card(
                                  margin: const EdgeInsets.symmetric(vertical: 8),
                                  child: Padding(
                                    padding: const EdgeInsets.all(8),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        if (symptom!.eyeCondition != null) Text('Kondisi Mata: ${symptom!.eyeCondition}'),
                                        if (symptom!.mouthCondition != null) Text('Kondisi Mulut: ${symptom!.mouthCondition}'),
                                        if (symptom!.noseCondition != null) Text('Kondisi Hidung: ${symptom!.noseCondition}'),
                                        if (symptom!.anusCondition != null) Text('Kondisi Anus: ${symptom!.anusCondition}'),
                                        if (symptom!.legCondition != null) Text('Kondisi Kaki: ${symptom!.legCondition}'),
                                        if (symptom!.skinCondition != null) Text('Kondisi Kulit: ${symptom!.skinCondition}'),
                                        if (symptom!.behavior != null) Text('Perilaku: ${symptom!.behavior}'),
                                        if (symptom!.weightCondition != null) Text('Kondisi Berat Badan: ${symptom!.weightCondition}'),
                                        if (symptom!.reproductiveCondition != null) Text('Kondisi Reproduksi: ${symptom!.reproductiveCondition}'),
                                      ],
                                    ),
                                  ),
                                ),
                              const SizedBox(height: 8),

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

                      ElevatedButton(
                        onPressed: isSubmitting ? null : handleSubmit,
                        child: isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Perbarui Data'),
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
