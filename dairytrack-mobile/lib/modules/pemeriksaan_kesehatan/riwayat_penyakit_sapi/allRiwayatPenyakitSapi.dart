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

    if (!mounted) return; // ⬅️ Cek apakah widget masih hidup

    setState(() {
      histories = fetchedHistories;
      healthChecks = fetchedHealthChecks;
      symptoms = fetchedSymptoms;
      cows = fetchedCows;
      error = null;
    });
  } catch (e) {
    if (!mounted) return; // ⬅️ Cek lagi sebelum setState di catch
    setState(() {
      error = 'Gagal mengambil data: $e';
    });
  } finally {
    if (!mounted) return; // ⬅️ Cek juga di finally
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
      backgroundColor: const Color(0xFF5D90E7),
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
            : histories.isEmpty
                ? const Center(
                    child: Text(
                      'Tidak ada data riwayat penyakit.',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
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
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        child: Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Header Disease Name + Action Icons
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      item.diseaseName,
                                      style: const TextStyle(
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.black87,
                                      ),
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        tooltip: 'Edit Riwayat',
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
                                        tooltip: 'Hapus Riwayat',
                                        icon: const Icon(Icons.delete, color: Colors.redAccent),
                                        onPressed: () => confirmDelete(item.id),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              
                              // Info Date & Cow
                              Wrap(
                                spacing: 20,
                                runSpacing: 8,
                                children: [
                                  infoChip(Icons.calendar_today, 'Tanggal: ${DateFormat('dd/MM/yyyy').format(item.createdAt)}'),
                                  infoChip(Icons.pets, 'Sapi: ${resolveCowName(check)}'),
                                ],
                              ),

                              const SizedBox(height: 12),
                              
                              // Health Check Details
                              if (check != null) ...[
                                Wrap(
                                  spacing: 20,
                                  runSpacing: 8,
                                  children: [
                                    infoChip(Icons.thermostat, 'Suhu: ${check.rectalTemperature} °C'),
                                    infoChip(Icons.favorite, 'Detak: ${check.heartRate} bpm'),
                                    infoChip(Icons.air, 'Nafas: ${check.respirationRate} bpm'),
                                    infoChip(Icons.restaurant, 'Ruminasi: ${check.rumination} kontraksi'),
                                    infoChip(Icons.verified, 'Status: ${check.status == 'handled' ? 'Sudah Ditangani' : 'Belum Ditangani'}'),
                                  ],
                                ),
                              ],

                              const SizedBox(height: 12),
                              
                              // Symptoms if available
                              if (symptom != null)
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Gejala:',
                                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                                    ),
                                    const SizedBox(height: 8),
                                    ...symptom.toMap().entries
                                        .where((e) => e.value != null && e.value.toString().toLowerCase() != 'normal')
                                        .map((e) => Padding(
                                              padding: const EdgeInsets.only(bottom: 4),
                                              child: Text(
                                                '${e.key.replaceAll('_', ' ')}: ${e.value}',
                                                style: const TextStyle(fontSize: 14, color: Colors.black54),
                                              ),
                                            ))
                                        .toList(),
                                  ],
                                ),

                              const SizedBox(height: 12),

                              // Description
                              Text(
                                'Deskripsi: ${item.description?.isNotEmpty == true ? item.description : '-'}',
                                style: const TextStyle(fontSize: 14, color: Colors.black87),
                              ),
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
          fetchAllData();
        }
      },
      backgroundColor: const Color(0xFF5D90E7),
      tooltip: 'Tambah Riwayat Penyakit',
      child: const Icon(Icons.add),
    ),
  );
}

// Helper Widget untuk Info Chip
Widget infoChip(IconData icon, String text) {
  return Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 16, color: Colors.blueAccent),
      const SizedBox(width: 4),
      Text(
        text,
        style: const TextStyle(fontSize: 14, color: Colors.black54),
      ),
    ],
  );
}

}
