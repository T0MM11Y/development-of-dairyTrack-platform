import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/kesehatan/health_check.dart';
import 'package:dairy_track/model/peternakan/cow.dart';

class EditPemeriksaan extends StatefulWidget {
  final int healthCheckId;
  final VoidCallback onClose;
  final VoidCallback onSaved;

  const EditPemeriksaan({
    Key? key,
    required this.healthCheckId,
    required this.onClose,
    required this.onSaved,
  }) : super(key: key);

  @override
  _EditPemeriksaanState createState() => _EditPemeriksaanState();
}

class _EditPemeriksaanState extends State<EditPemeriksaan> {
  HealthCheck? form;
  String cowName = '';
  bool isLoading = true;
  bool isSubmitting = false;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

 Future<void> fetchData() async {
  if (mounted) setState(() => isLoading = true);

  try {
    final healthCheck = await getHealthCheckById(widget.healthCheckId);
    final cows = await getCows();

    Cow? cow;
    try {
      cow = cows.firstWhere((c) => c.id == healthCheck.cowId);
    } catch (e) {
      cow = null;
    }

    if (mounted) {
      setState(() {
        form = healthCheck;
        cowName = cow != null ? '${cow.name} (${cow.breed})' : 'Sapi tidak ditemukan';
      });
    }
  } catch (e) {
    if (mounted) {
      setState(() {
        error = 'Gagal memuat data pemeriksaan.';
      });
    }
  } finally {
    if (mounted) {
      setState(() => isLoading = false);
    }
  }
}



 Future<void> submitForm() async {
  if (form == null) return;

  if (mounted) setState(() => isSubmitting = true);

  bool success = false;
  try {
    success = await updateHealthCheck(widget.healthCheckId, form!.toJson());
  } catch (e) {
    success = false;
  } finally {
    if (mounted) setState(() => isSubmitting = false);
  }

  if (!mounted) return;

  if (success) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('✅ Data pemeriksaan berhasil diperbarui')),
    );
    widget.onSaved(); // ✅ callback tetap dijalankan setelah mounted check
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('❌ Gagal memperbarui data pemeriksaan')),
    );
  }
}



  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxHeight: 650),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Edit Pemeriksaan',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue),
                ),
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const Divider(),
            if (isLoading)
              const Expanded(child: Center(child: CircularProgressIndicator()))
            else if (error != null)
              Expanded(child: Center(child: Text(error!, style: TextStyle(color: Colors.red))))
            else if (form != null)
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      // Nama Sapi
                      buildReadOnlyField('Nama Sapi', cowName),
                      const SizedBox(height: 10),

                      // Tanggal Pemeriksaan
                      buildReadOnlyField('Tanggal Pemeriksaan', formatDate(form!.checkupDate)),
                      const SizedBox(height: 10),

                      // Suhu Tubuh
                      buildNumberField(
                        label: 'Suhu Rektal (°C)',
                        value: form!.rectalTemperature,
                        onChanged: (val) {
                          setState(() {
                            form = form!.copyWith(rectalTemperature: val);
                          });
                        },
                      ),
                      const SizedBox(height: 10),

                      // Detak Jantung
                      buildNumberField(
                        label: 'Detak Jantung',
                        value: form!.heartRate.toDouble(),
                        onChanged: (val) {
                          setState(() {
                            form = form!.copyWith(heartRate: val.toInt());
                          });
                        },
                      ),
                      const SizedBox(height: 10),

                      // Laju Pernapasan
                      buildNumberField(
                        label: 'Laju Pernapasan',
                        value: form!.respirationRate.toDouble(),
                        onChanged: (val) {
                          setState(() {
                            form = form!.copyWith(respirationRate: val.toInt());
                          });
                        },
                      ),
                      const SizedBox(height: 10),

                      // Ruminasi
                      buildNumberField(
                        label: 'Ruminasi',
                        value: form!.rumination,
                        onChanged: (val) {
                          setState(() {
                            form = form!.copyWith(rumination: val);
                          });
                        },
                      ),
                      const SizedBox(height: 10),

                      // Status (readonly)
                      buildReadOnlyField(
                        'Status',
                        form!.status == 'handled' ? 'Sudah Ditangani' : 'Belum Ditangani',
                        color: form!.status == 'handled' ? Colors.green : Colors.orange,
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            ElevatedButton(
              onPressed: isSubmitting ? null : submitForm,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                minimumSize: const Size(double.infinity, 50),
              ),
              child: isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Update', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildReadOnlyField(String label, String value, {Color? color}) {
    return TextFormField(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      style: TextStyle(color: color),
      enabled: false,
    );
  }

  Widget buildNumberField({
    required String label,
    required double value,
    required ValueChanged<double> onChanged,
  }) {
    return TextFormField(
      initialValue: value.toString(),
      decoration: InputDecoration(
        labelText: label,
        border: const OutlineInputBorder(),
      ),
      keyboardType: TextInputType.numberWithOptions(decimal: true),
      onChanged: (val) {
        final parsed = double.tryParse(val) ?? 0.0;
        onChanged(parsed);
      },
    );
  }

  String formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}-${date.month.toString().padLeft(2, '0')}-${date.year} ${date.hour}:${date.minute}';
  }
}
