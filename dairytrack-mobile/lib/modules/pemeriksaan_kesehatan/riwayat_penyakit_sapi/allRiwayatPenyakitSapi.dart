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
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Konfirmasi Hapus'),
        content: const Text('Yakin ingin menghapus data riwayat penyakit ini?'),
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
        await deleteDiseaseHistory(historyId);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Data riwayat penyakit berhasil dihapus')),
        );
        fetchAllData();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menghapus data riwayat penyakit')),
        );
      }
    }
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
                  : SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        columns: const [
                          DataColumn(label: Text('#')),
                          DataColumn(label: Text('Tanggal')),
                          DataColumn(label: Text('Penyakit')),
                          DataColumn(label: Text('Sapi')),
                          DataColumn(label: Text('Detail Pemeriksaan')),
                          DataColumn(label: Text('Gejala')),
                          DataColumn(label: Text('Status')),
                          DataColumn(label: Text('Deskripsi')),
                          DataColumn(label: Text('Aksi')),
                        ],
                        rows: List.generate(histories.length, (index) {
                          final item = histories[index];
                          HealthCheck? check;
                          Symptom? symptom;

                          try {
                            check = healthChecks.firstWhere((h) => h.id == item.healthCheckId);
                          } catch (_) {}

                          try {
                            symptom = symptoms.firstWhere((s) => s.healthCheckId == item.healthCheckId);
                          } catch (_) {}

                          return DataRow(cells: [
                            DataCell(Text('${index + 1}')),
                            DataCell(Text(DateFormat('dd/MM/yyyy').format(item.createdAt))),
                            DataCell(Text(item.diseaseName)),
                            DataCell(Text(resolveCowName(check))),
                            DataCell(check != null
                                ? Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text('Suhu: ${check.rectalTemperature} °C'),
                                      Text('Detak: ${check.heartRate} bpm'),
                                      Text('Napas: ${check.respirationRate} bpm'),
                                      Text('Rumenasi: ${check.rumination} kontraksi'),
                                      Text('Tanggal: ${DateFormat('dd/MM/yyyy').format(check.checkupDate)}'),
                                    ],
                                  )
                                : const Text('-')),
                            DataCell(symptom != null
                                ? Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: symptom.toMap().entries
                                        .where((e) => e.value != null && e.value.toString().toLowerCase() != 'normal')
                                        .map((e) => Text('${e.key.replaceAll('_', ' ')}: ${e.value}'))
                                        .toList(),
                                  )
                                : const Text('-')),
                            DataCell(Text(check?.status == "handled" ? "Sudah Ditangani" : "Belum Ditangani")),
                            DataCell(Text(item.description ?? '-')),
                            DataCell(Row(
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
                            )),
                          ]);
                        }),
                      ),
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/add-riwayat-penyakit-sapi');
        },
        backgroundColor: Colors.blue[700],
        child: const Icon(Icons.add),
      ),
    );
  }
}
