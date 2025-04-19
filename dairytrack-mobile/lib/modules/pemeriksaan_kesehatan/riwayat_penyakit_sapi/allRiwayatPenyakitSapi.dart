import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/config/api/kesehatan/disease_history.dart';
import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/kesehatan/symptom.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/kesehatan/disease_history.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';
import 'package:dairy_track/model/kesehatan/symptom.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/riwayat_penyakit_sapi/editRiwayatPenyakitSapi.dart';

class AllRiwayatPenyakitSapi extends StatefulWidget {
  @override
  _AllRiwayatPenyakitSapiState createState() => _AllRiwayatPenyakitSapiState();
}

class _AllRiwayatPenyakitSapiState extends State<AllRiwayatPenyakitSapi> {
  List<DiseaseHistory> histories = [];
  List<HealthCheck> healthChecks = [];
  List<Symptom> symptoms = [];
  List<Cow> cows = [];
  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchAllData();
  }

  Future<void> fetchAllData() async {
    setState(() => isLoading = true);
    try {
      final fetchedHistories = await getDiseaseHistories();
      final fetchedHealthChecks = await getHealthChecks();
      final fetchedSymptoms = await getSymptoms();
      final fetchedCows = await getCows();

      setState(() {
        histories = fetchedHistories;
        healthChecks = fetchedHealthChecks;
        symptoms = fetchedSymptoms;
        cows = fetchedCows;
        error = null;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal mengambil data: $e';
      });
    } finally {
      setState(() => isLoading = false);
    }
  }

  String resolveCowName(HealthCheck? check) {
    if (check == null) return "-";
    try {
      final cow = cows.firstWhere((c) => c.id == check.cowId);
      return '${cow.name} (${cow.breed})';
    } catch (e) {
      return '-';
    }
  }

  Future<void> confirmDelete(int historyId) async {
  bool isDeleting = false;

  await showDialog(
    context: context,
    barrierDismissible: !isDeleting, // Tidak bisa dismiss kalau lagi loading
    builder: (context) {
      return StatefulBuilder(
        builder: (context, setStateDialog) {
          return AlertDialog(
            title: const Text('Konfirmasi Hapus'),
            content: const Text('Yakin ingin menghapus data riwayat penyakit ini?'),
            actions: [
              TextButton(
                onPressed: isDeleting ? null : () => Navigator.of(context).pop(false),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                onPressed: isDeleting
                    ? null
                    : () async {
                        setStateDialog(() => isDeleting = true);
                        try {
                          await deleteDiseaseHistory(historyId);
                          Navigator.of(context).pop(true); // ✅ Tutup dialog sukses
                        } catch (e) {
                          Navigator.of(context).pop(false); // ✅ Tutup dialog gagal
                        }
                      },
                child: isDeleting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('Hapus'),
              ),
            ],
          );
        },
      );
    },
  ).then((confirmed) {
    if (confirmed == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('✅ Data riwayat penyakit berhasil dihapus')),
      );
      fetchAllData(); // ✅ Refresh list setelah hapus
    } else if (confirmed == false) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('❌ Gagal menghapus data riwayat penyakit')),
      );
    }
  });
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Riwayat Penyakit Sapi'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : histories.isEmpty
                  ? const Center(child: Text('Tidak ada data riwayat penyakit.'))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: histories.length,
                      itemBuilder: (context, index) {
                        final item = histories[index];
                        HealthCheck? check;
                        Symptom? symptom;

                        try {
                          check = healthChecks.firstWhere((h) => h.id == item.healthCheckId);
                        } catch (_) {}

                        try {
                          symptom = symptoms.firstWhere((s) => s.healthCheckId == item.healthCheckId);
                        } catch (_) {}

                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          elevation: 4,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      item.diseaseName,
                                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                    ),
                                    Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.edit, color: Colors.orange),
                                          onPressed: () {
                                            showDialog(
                                              context: context,
                                              builder: (_) => EditRiwayatPenyakitSapi(
                                                diseaseHistoryId: item.id,
                                                onClose: () => Navigator.of(context).pop(),
                                                onSaved: () {
                                                  Navigator.of(context).pop();
                                                  fetchAllData();
                                                },
                                              ),
                                            );
                                          },
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete, color: Colors.red),
                                          onPressed: () => confirmDelete(item.id),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text('Tanggal: ${DateFormat('dd/MM/yyyy').format(item.createdAt)}'),
                                const SizedBox(height: 4),
                                Text('Sapi: ${resolveCowName(check)}'),
                                const SizedBox(height: 4),
                                if (check != null) ...[
                                  Text('Suhu: ${check.rectalTemperature} °C'),
                                  Text('Detak Jantung: ${check.heartRate} bpm'),
                                  Text('Pernapasan: ${check.respirationRate} bpm'),
                                  Text('Ruminasi: ${check.rumination} kontraksi'),
                                  Text('Status: ${check.status == 'handled' ? 'Sudah Ditangani' : 'Belum Ditangani'}'),
                                ],
                                const SizedBox(height: 8),
                                if (symptom != null)
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: symptom.toMap().entries
                                        .where((e) => e.value != null && e.value.toString().toLowerCase() != 'normal')
                                        .map((e) => Text('${e.key.replaceAll('_', ' ')}: ${e.value}'))
                                        .toList(),
                                  ),
                                const SizedBox(height: 8),
                                Text('Deskripsi: ${item.description ?? '-'}'),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
     floatingActionButton: FloatingActionButton(
  onPressed: () async {
    final result = await Navigator.pushNamed(context, '/add-riwayat-penyakit-sapi');
    if (result == true) {
      fetchAllData(); // ✅ Refresh list kalau sukses tambah riwayat penyakit
    }
  },
  backgroundColor: Colors.blue[700],
  child: const Icon(Icons.add),
),

    );
  }
}
