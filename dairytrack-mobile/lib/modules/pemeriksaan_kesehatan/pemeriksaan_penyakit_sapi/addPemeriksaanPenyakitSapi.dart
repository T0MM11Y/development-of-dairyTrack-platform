import 'package:dairy_track/config/api/kesehatan/health_check.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';

class AddPemeriksaanPenyakitSapi extends StatefulWidget {
  @override
  _AddPemeriksaanPenyakitSapiState createState() => _AddPemeriksaanPenyakitSapiState();
}

class _AddPemeriksaanPenyakitSapiState extends State<AddPemeriksaanPenyakitSapi> {
  final _formKey = GlobalKey<FormState>();

  List<Cow> cows = [];
  String? selectedCowId;
  double? rectalTemperature;
  int? heartRate;
  int? respirationRate;
  double? rumination;

  bool isLoading = true;
  bool isSubmitting = false;
  String? error;

  @override
  void initState() {
    super.initState();
    fetchCows();
  }

 Future<void> fetchCows() async {
  try {
    final cowList = await getCows();
    if (!mounted) return; // ✅ Cek dulu
    setState(() {
      cows = cowList;
      isLoading = false;
    });
  } catch (e) {
    if (!mounted) return; // ✅ Cek dulu
    setState(() {
      error = 'Gagal memuat data sapi.';
      isLoading = false;
    });
  }
}


  Future<void> handleSubmit() async {
  if (!_formKey.currentState!.validate() || selectedCowId == null) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Pastikan semua field diisi dengan benar')),
    );
    return;
  }

  setState(() => isSubmitting = true);

  try {
    await createHealthCheck({
      'cow_id': int.parse(selectedCowId!), // ✅ WAJIB pakai cow_id
      'rectal_temperature': rectalTemperature ?? 0.0,
      'heart_rate': heartRate ?? 0,
      'respiration_rate': respirationRate ?? 0,
      'rumination': rumination ?? 0.0,
    });

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Data pemeriksaan berhasil disimpan')),
    );

    Navigator.of(context).pop(true); // ✅ Kirim true supaya page sebelumnya bisa reload!
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Gagal menyimpan data pemeriksaan')),
    );
  } finally {
    setState(() => isSubmitting = false);
  }
}


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Pemeriksaan Sapi'),
        backgroundColor: Colors.blue,
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                            labelText: 'Pilih Sapi',
                            border: OutlineInputBorder(),
                          ),
                          value: selectedCowId,
                          items: cows.map((cow) {
                            return DropdownMenuItem<String>(
                              value: cow.id.toString(),
                              child: Text('${cow.name} (${cow.breed})'),
                            );
                          }).toList(),
                          onChanged: (value) => setState(() => selectedCowId = value),
                          validator: (value) => value == null ? 'Pilih sapi' : null,
                        ),
                        const SizedBox(height: 16),

                        TextFormField(
                          decoration: const InputDecoration(
                            labelText: 'Suhu Rektal (°C)',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          onChanged: (value) => rectalTemperature = double.tryParse(value),
                          validator: (value) => value == null || value.isEmpty
                              ? 'Isi suhu rektal'
                              : null,
                        ),
                        const SizedBox(height: 16),

                        TextFormField(
                          decoration: const InputDecoration(
                            labelText: 'Detak Jantung (bpm)',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                          onChanged: (value) => heartRate = int.tryParse(value),
                          validator: (value) => value == null || value.isEmpty
                              ? 'Isi detak jantung'
                              : null,
                        ),
                        const SizedBox(height: 16),

                        TextFormField(
                          decoration: const InputDecoration(
                            labelText: 'Laju Pernapasan (bpm)',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.number,
                          onChanged: (value) => respirationRate = int.tryParse(value),
                          validator: (value) => value == null || value.isEmpty
                              ? 'Isi laju pernapasan'
                              : null,
                        ),
                        const SizedBox(height: 16),

                        TextFormField(
                          decoration: const InputDecoration(
                            labelText: 'Ruminasi (kontraksi)',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          onChanged: (value) => rumination = double.tryParse(value),
                          validator: (value) => value == null || value.isEmpty
                              ? 'Isi ruminasi'
                              : null,
                        ),
                        const SizedBox(height: 24),

                        ElevatedButton.icon(
                          onPressed: isSubmitting ? null : handleSubmit,
                          icon: const Icon(Icons.save),
                          label: isSubmitting
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                                )
                              : const Text('Simpan'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            minimumSize: const Size(double.infinity, 50),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
    );
  }
}
