import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/kesehatan/reproduction.dart';
import 'package:dairy_track/model/kesehatan/reproduction.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/peternakan/cow.dart';

class EditReproduksi extends StatefulWidget {
  final int reproductionId;
  final VoidCallback onClose;
  final VoidCallback onSaved;

  const EditReproduksi({
    Key? key,
    required this.reproductionId,
    required this.onClose,
    required this.onSaved,
  }) : super(key: key);

  @override
  _EditReproduksiState createState() => _EditReproduksiState();
}

class _EditReproduksiState extends State<EditReproduksi> {
  Reproduction? reproduction;
  Cow? cow;
  bool isLoading = true;
  bool isSubmitting = false;
  String? error;

  final _formKey = GlobalKey<FormState>();

  final TextEditingController calvingDateController = TextEditingController();
  final TextEditingController previousCalvingDateController =
      TextEditingController();
  final TextEditingController inseminationDateController =
      TextEditingController();
  final TextEditingController totalInseminationController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchInitialData();
  }

  Future<void> fetchInitialData() async {
    try {
      final fetchedReproduction =
          await getReproductionById(widget.reproductionId);
      final fetchedCows = await getCows();

      final matchedCow = fetchedCows.firstWhere(
          (c) => c.id == fetchedReproduction.cowId,
          orElse: () => throw Exception('Cow not found'));

      setState(() {
        reproduction = fetchedReproduction;
        cow = matchedCow;
        calvingDateController.text = fetchedReproduction.calvingDate ?? '';
        previousCalvingDateController.text =
            fetchedReproduction.previousCalvingDate ?? '';
        inseminationDateController.text =
            fetchedReproduction.inseminationDate ?? '';
        totalInseminationController.text =
            fetchedReproduction.totalInsemination?.toString() ?? '';
        error = null;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal mengambil data reproduksi: $e';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> selectDate(
      BuildContext context, TextEditingController controller) async {
    DateTime initialDate = DateTime.now();
    if (controller.text.isNotEmpty) {
      try {
        initialDate = DateTime.parse(controller.text);
      } catch (_) {}
    }

    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );

    if (picked != null) {
      controller.text = picked.toIso8601String().split('T').first; // yyyy-MM-dd
    }
  }

  Future<void> submitForm() async {
  if (!_formKey.currentState!.validate()) return;

  final calvingDate = DateTime.tryParse(calvingDateController.text);
  final previousCalvingDate =
      DateTime.tryParse(previousCalvingDateController.text);
  final inseminationDate = DateTime.tryParse(inseminationDateController.text);
  final totalInsemination = int.tryParse(totalInseminationController.text);

  if (calvingDate == null ||
      previousCalvingDate == null ||
      inseminationDate == null ||
      totalInsemination == null) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Format data tidak valid.')),
      );
    }
    return;
  }

  if (previousCalvingDate.isAfter(calvingDate)) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Tanggal kelahiran sebelumnya harus lebih awal.')),
      );
    }
    return;
  }

  if (inseminationDate.isBefore(calvingDate)) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Tanggal inseminasi harus setelah kelahiran.')),
      );
    }
    return;
  }

  if (totalInsemination < 1) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jumlah inseminasi minimal 1 kali.')),
      );
    }
    return;
  }

  if (mounted) setState(() => isSubmitting = true);

  bool success = false;
  try {
    success = await updateReproduction(widget.reproductionId, {
      'cow': reproduction!.cowId,
      'calving_date': calvingDateController.text,
      'previous_calving_date': previousCalvingDateController.text,
      'insemination_date': inseminationDateController.text,
      'total_insemination': totalInsemination,
      'successful_pregnancy': 1,
    });
  } catch (_) {
    success = false;
  } finally {
    if (mounted) setState(() => isSubmitting = false);
  }

  if (!mounted) return;

  if (success) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('✅ Data reproduksi berhasil diperbarui.')),
    );
    widget.onSaved(); // Reload & back
  } else {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('❌ Gagal memperbarui data reproduksi.')),
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
        constraints: const BoxConstraints(maxHeight: 650),
        child: isLoading
            ? const Center(child: CircularProgressIndicator())
            : error != null
                ? Center(
                    child: Text(
                      error!,
                      style: const TextStyle(color: Colors.red, fontSize: 16),
                    ),
                  )
                : Form(
                    key: _formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Header
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text(
                              'Edit Data Reproduksi',
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: Colors.blueAccent,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close, color: Colors.grey),
                              onPressed: widget.onClose,
                            ),
                          ],
                        ),
                        const Divider(thickness: 1),
                        const SizedBox(height: 8),

                        // Content Form
                        Expanded(
                          child: SingleChildScrollView(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Nama Sapi
                                TextFormField(
                                  initialValue: '${cow?.name} (${cow?.breed})',
                                  enabled: false,
                                  decoration: const InputDecoration(
                                    labelText: 'Nama Sapi',
                                    border: OutlineInputBorder(),
                                  ),
                                ),
                                const SizedBox(height: 16),

                                // Tanggal Calving Sekarang
                                TextField(
                                  controller: calvingDateController,
                                  decoration: const InputDecoration(
                                    labelText: 'Tanggal Calving (Sekarang)',
                                    border: OutlineInputBorder(),
                                    suffixIcon: Icon(Icons.calendar_today),
                                  ),
                                  readOnly: true,
                                  onTap: () => selectDate(
                                      context, calvingDateController),
                                ),
                                const SizedBox(height: 16),

                                // Tanggal Calving Sebelumnya
                                TextField(
                                  controller: previousCalvingDateController,
                                  decoration: const InputDecoration(
                                    labelText: 'Tanggal Calving Sebelumnya',
                                    border: OutlineInputBorder(),
                                    suffixIcon: Icon(Icons.calendar_today),
                                  ),
                                  readOnly: true,
                                  onTap: () => selectDate(
                                      context, previousCalvingDateController),
                                ),
                                const SizedBox(height: 16),

                                // Tanggal Inseminasi
                                TextField(
                                  controller: inseminationDateController,
                                  decoration: const InputDecoration(
                                    labelText: 'Tanggal Inseminasi',
                                    border: OutlineInputBorder(),
                                    suffixIcon: Icon(Icons.calendar_today),
                                  ),
                                  readOnly: true,
                                  onTap: () => selectDate(
                                      context, inseminationDateController),
                                ),
                                const SizedBox(height: 16),

                                // Total Inseminasi
                                TextFormField(
                                  controller: totalInseminationController,
                                  decoration: const InputDecoration(
                                    labelText: 'Total Inseminasi',
                                    border: OutlineInputBorder(),
                                  ),
                                  keyboardType: TextInputType.number,
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Jumlah tidak boleh kosong';
                                    }
                                    return null;
                                  },
                                ),
                              ],
                            ),
                          ),
                        ),

                        const SizedBox(height: 20),

                        // Submit Button
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: isSubmitting ? null : submitForm,
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
                                : const Text(
                                    'Simpan Perubahan',
                                    style: TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold),
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
      ),
    );
  }
}
