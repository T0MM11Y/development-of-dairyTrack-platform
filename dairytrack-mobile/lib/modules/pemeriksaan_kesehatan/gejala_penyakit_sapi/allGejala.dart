import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/kesehatan/symptom.dart';
import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/kesehatan/symptom.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/gejala_penyakit_sapi/viewGejala.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/gejala_penyakit_sapi/editGejala.dart';

class AllGejala extends StatefulWidget {
  @override
  _AllGejalaState createState() => _AllGejalaState();
}

class _AllGejalaState extends State<AllGejala> {
  List<Symptom> symptoms = [];
  List<HealthCheck> healthChecks = [];
  List<Cow> cows = [];

  bool isLoading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchAllData();
  }

  Future<void> fetchAllData() async {
    setState(() {
      isLoading = true;
    });

    try {
      final fetchedSymptoms = await getSymptoms();
      final fetchedHealthChecks = await getHealthChecks();
      final fetchedCows = await getCows();

      setState(() {
        symptoms = fetchedSymptoms;
        healthChecks = fetchedHealthChecks;
        cows = fetchedCows;
        error = null;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal mengambil data: $e';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  String getCowName(int healthCheckId) {
    try {
      final hc = healthChecks.firstWhere((h) => h.id == healthCheckId);
      final cow = cows.firstWhere((c) => c.id == hc.cowId);
      return '${cow.name} (${cow.breed})';
    } catch (e) {
      return 'Tidak ditemukan';
    }
  }

  String getStatusText(int healthCheckId) {
    try {
      final hc = healthChecks.firstWhere((h) => h.id == healthCheckId);
      if (hc.needsAttention == false) {
        return 'Sehat';
      } else if (hc.status == 'handled') {
        return 'Sudah Ditangani';
      } else {
        return 'Belum Ditangani';
      }
    } catch (e) {
      return 'Belum Ditangani';
    }
  }

  Color getStatusColor(int healthCheckId) {
    try {
      final hc = healthChecks.firstWhere((h) => h.id == healthCheckId);
      if (hc.needsAttention == false) {
        return Colors.blue;
      } else if (hc.status == 'handled') {
        return Colors.green;
      } else {
        return Colors.orange;
      }
    } catch (e) {
      return Colors.orange;
    }
  }

  Future<void> confirmDelete(int symptomId) async {
    bool isDeleting = false;

    await showDialog(
      context: context,
      barrierDismissible: !isDeleting,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: const Text('Konfirmasi Hapus'),
              content: const Text('Yakin ingin menghapus data gejala ini?'),
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
                            await deleteSymptom(symptomId);
                            Navigator.of(context).pop(true);
                          } catch (e) {
                            Navigator.of(context).pop(false);
                          }
                        },
                  child: isDeleting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
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
          const SnackBar(content: Text('✅ Data gejala berhasil dihapus')),
        );
        fetchAllData();
      } else if (confirmed == false) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('❌ Gagal menghapus data gejala')),
        );
      }
    });
  }

  @override
 Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('Data Gejala Penyakit Sapi'),
      backgroundColor: const Color(0xFF5D90E7), // 🎨 Biru lebih konsisten
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
            : symptoms.isEmpty
                ? const Center(
                    child: Text(
                      'Tidak ada data gejala.',
                      style: TextStyle(fontSize: 16, color: Colors.grey),
                    ),
                  )
                : ListView.builder(
                    itemCount: symptoms.length,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    itemBuilder: (context, index) {
                      final symptom = symptoms[index];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        child: Card(
                          elevation: 3,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            title: Text(
                              getCowName(symptom.healthCheckId),
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Colors.black87,
                              ),
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.only(top: 8.0),
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(
                                  color: getStatusColor(symptom.healthCheckId),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  getStatusText(symptom.healthCheckId),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  tooltip: 'Lihat Detail',
                                  icon: const Icon(Icons.visibility),
                                  color: Colors.blueAccent,
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (_) => viewGejala(
                                        symptomId: symptom.id,
                                        onClose: () => Navigator.of(context).pop(),
                                      ),
                                    );
                                  },
                                ),
                                IconButton(
                                  tooltip: 'Edit Gejala',
                                  icon: const Icon(Icons.edit),
                                  color: Colors.orange,
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (_) => EditGejala(
                                        symptomId: symptom.id,
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
                                  tooltip: 'Hapus Gejala',
                                  icon: const Icon(Icons.delete),
                                  color: Colors.redAccent,
                                  onPressed: () {
                                    confirmDelete(symptom.id);
                                  },
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
    floatingActionButton: FloatingActionButton(
      onPressed: () async {
        final result = await Navigator.pushNamed(context, '/add-gejala');
        if (result == true) {
          fetchAllData();
        }
      },
      backgroundColor: const Color(0xFF5D90E7),
      child: const Icon(Icons.add),
      tooltip: 'Tambah Gejala',
    ),
  );
}
}
