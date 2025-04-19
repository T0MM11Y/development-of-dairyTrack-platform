import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/modules/pemeriksaan_kesehatan/pemeriksaan_penyakit_sapi/editPemeriksaan.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllPemeriksaanPenyakitSapi extends StatefulWidget {
  @override
  _AllPemeriksaanPenyakitSapiState createState() => _AllPemeriksaanPenyakitSapiState();
}

class _AllPemeriksaanPenyakitSapiState extends State<AllPemeriksaanPenyakitSapi> {
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
      final fetchedChecks = await getHealthChecks();
      final fetchedCows = await getCows();

      setState(() {
        healthChecks = fetchedChecks;
        cows = fetchedCows;
        error = null;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal mengambil data. Pastikan server aktif.';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  String getCowName(dynamic cowId) {
    if (cowId == null) return 'Tidak diketahui';
    try {
      final cow = cows.firstWhere((c) => c.id == cowId);
      return cow.name;
    } catch (_) {
      return 'Tidak diketahui';
    }
  }

  Future<void> confirmDelete(int healthCheckId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Konfirmasi Hapus'),
        content: const Text('Yakin ingin menghapus data pemeriksaan ini?'),
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
        await deleteHealthCheck(healthCheckId);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Data pemeriksaan berhasil dihapus')),
        );
        fetchAllData();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Gagal menghapus data pemeriksaan')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Pemeriksaan Penyakit Sapi'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : healthChecks.isEmpty
                  ? const Center(child: Text('Tidak ada data pemeriksaan.'))
                  : ListView.builder(
                      itemCount: healthChecks.length,
                      padding: const EdgeInsets.all(16),
                      itemBuilder: (context, index) {
                        final check = healthChecks[index];
                        return Card(
                          margin: const EdgeInsets.symmetric(vertical: 8),
                          elevation: 4,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      DateFormat('dd MMM yyyy').format(check.checkupDate),
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 16,
                                        color: Colors.blue,
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.edit, color: Colors.orange),
                                          onPressed: () {
                                            showDialog(
                                              context: context,
                                              builder: (_) => EditPemeriksaan(
                                                healthCheckId: check.id,
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
                                          onPressed: () => confirmDelete(check.id),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Text('Sapi: ${getCowName(check.cowId)}',
                                    style: TextStyle(color: Colors.grey[600])),
                                const SizedBox(height: 4),
                                Text('Suhu Rektal: ${check.rectalTemperature} °C',
                                    style: TextStyle(color: Colors.grey[600])),
                                const SizedBox(height: 4),
                                Text('Detak Jantung: ${check.heartRate} bpm',
                                    style: TextStyle(color: Colors.grey[600])),
                                const SizedBox(height: 4),
                                Text('Laju Pernapasan: ${check.respirationRate} bpm',
                                    style: TextStyle(color: Colors.grey[600])),
                                const SizedBox(height: 4),
                                Text('Ruminasi: ${check.rumination} kontraksi',
                                    style: TextStyle(color: Colors.grey[600])),
                                const SizedBox(height: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: check.needsAttention == false
                                        ? Colors.blue
                                        : check.status == 'handled'
                                            ? Colors.green
                                            : Colors.orange,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    check.needsAttention == false
                                        ? 'Sehat'
                                        : check.status == 'handled'
                                            ? 'Sudah Ditangani'
                                            : 'Belum Ditangani',
                                    style: const TextStyle(color: Colors.white),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/add-pemeriksaan-penyakit-sapi');
        },
        backgroundColor: Colors.blue[700],
        child: const Icon(Icons.add),
      ),
    );
  }
}
