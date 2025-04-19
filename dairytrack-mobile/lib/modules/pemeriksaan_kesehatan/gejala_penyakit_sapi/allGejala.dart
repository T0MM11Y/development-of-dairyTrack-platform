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

  String getHandlingStatus(int healthCheckId) {
    try {
      final hc = healthChecks.firstWhere((h) => h.id == healthCheckId);
      return hc.status == 'handled' ? 'Sudah Ditangani' : 'Belum Ditangani';
    } catch (e) {
      return 'Belum Ditangani';
    }
  }

  Future<void> confirmDelete(int symptomId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Konfirmasi Hapus'),
        content: const Text('Yakin ingin menghapus data gejala ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Hapus'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await deleteSymptom(symptomId);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Data gejala berhasil dihapus')),
        );
        fetchAllData(); // Refresh semua data setelah hapus
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menghapus data gejala')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Gejala Penyakit Sapi'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : symptoms.isEmpty
                  ? const Center(child: Text('Tidak ada data gejala.'))
                  : ListView.builder(
                      itemCount: symptoms.length,
                      itemBuilder: (context, index) {
                        final symptom = symptoms[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          elevation: 4,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: ListTile(
                            title: Text(getCowName(symptom.healthCheckId)),
                            subtitle: Text(getHandlingStatus(symptom.healthCheckId)),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                // Tombol View
                                IconButton(
                                  icon: const Icon(Icons.visibility),
                                  color: Colors.grey,
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (_) => viewGejala(
                                        symptomId: symptom.id,
                                        onClose: () {
                                          Navigator.of(context).pop();
                                        },
                                      ),
                                    );
                                  },
                                ),
                                // Tombol Edit
                                IconButton(
                                  icon: const Icon(Icons.edit),
                                  color: Colors.orange,
                                  onPressed: () {
                                    showDialog(
                                      context: context,
                                      builder: (_) => EditGejala(
                                        symptomId: symptom.id,
                                        onClose: () {
                                          Navigator.of(context).pop();
                                        },
                                        onSaved: () {
                                          Navigator.of(context).pop();
                                          fetchAllData(); // Refresh semua data setelah edit
                                        },
                                      ),
                                    );
                                  },
                                ),
                                // Tombol Hapus
                                IconButton(
                                  icon: const Icon(Icons.delete),
                                  color: Colors.red,
                                  onPressed: () {
                                    confirmDelete(symptom.id);
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/add-gejala');
        },
        backgroundColor: Colors.blue[700],
        child: const Icon(Icons.add),
      ),
    );
  }
}
