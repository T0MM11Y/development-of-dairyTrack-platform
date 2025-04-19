import 'package:dairy_track/config/api/kesehatan/reproduction.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';

class AddReproduksi extends StatefulWidget {
  final VoidCallback? onSaved;

  const AddReproduksi({Key? key, this.onSaved}) : super(key: key);

  @override
  _AddReproduksiState createState() => _AddReproduksiState();
}

class _AddReproduksiState extends State<AddReproduksi> {
  List<Cow> cows = [];
  bool isLoading = true;
  bool isSubmitting = false;
  String? selectedCowId;
  String? error;

  final TextEditingController calvingDateController = TextEditingController();
  final TextEditingController prevCalvingDateController = TextEditingController();
  final TextEditingController inseminationDateController = TextEditingController();
  final TextEditingController totalInseminationController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchCows();
  }

  Future<void> fetchCows() async {
    try {
      final cowList = await getCows();
      setState(() {
        cows = cowList;
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal memuat data sapi.';
        isLoading = false;
      });
    }
  }

  Future<void> handleSubmit() async {
    if (selectedCowId == null ||
        calvingDateController.text.isEmpty ||
        prevCalvingDateController.text.isEmpty ||
        inseminationDateController.text.isEmpty ||
        totalInseminationController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Semua field harus diisi')),
      );
      return;
    }

    DateTime calvingDate = DateTime.parse(calvingDateController.text);
    DateTime prevCalvingDate = DateTime.parse(prevCalvingDateController.text);
    DateTime inseminationDate = DateTime.parse(inseminationDateController.text);
    int totalInsemination = int.tryParse(totalInseminationController.text) ?? 0;

    // Validasi logika
    if (prevCalvingDate.isAfter(calvingDate)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tanggal calving sebelumnya harus lebih awal dari sekarang')),
      );
      return;
    }

    if (!inseminationDate.isAfter(calvingDate)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tanggal inseminasi harus setelah tanggal calving')),
      );
      return;
    }

    if (totalInsemination < 1) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Jumlah inseminasi harus lebih dari 0')),
      );
      return;
    }

    setState(() {
      isSubmitting = true;
    });

    try {
      await createReproduction({
        'cow': int.parse(selectedCowId!),
        'calving_date': calvingDateController.text,
        'previous_calving_date': prevCalvingDateController.text,
        'insemination_date': inseminationDateController.text,
        'total_insemination': totalInsemination,
        'successful_pregnancy': 1, // ✅ Default dikirim manual
      });

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data reproduksi berhasil disimpan')),
      );

      if (widget.onSaved != null) {
        widget.onSaved!();
      }

      Navigator.of(context).pop(true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal menyimpan data reproduksi')),
      );
    } finally {
      setState(() {
        isSubmitting = false;
      });
    }
  }

  Future<void> selectDate(BuildContext context, TextEditingController controller) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      controller.text = picked.toIso8601String().split('T').first;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Data Reproduksi'),
        backgroundColor: Colors.blue[700],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : error != null
              ? Center(child: Text(error!))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      DropdownButtonFormField<String>(
                        value: selectedCowId,
                        hint: const Text('Pilih Sapi'),
                        onChanged: (value) {
                          setState(() {
                            selectedCowId = value;
                          });
                        },
                        items: cows.map((cow) {
                          return DropdownMenuItem<String>(
                            value: cow.id.toString(),
                            child: Text('${cow.name} (${cow.breed})'),
                          );
                        }).toList(),
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: calvingDateController,
                        decoration: const InputDecoration(
                          labelText: 'Tanggal Calving Sekarang',
                          border: OutlineInputBorder(),
                        ),
                        readOnly: true,
                        onTap: () => selectDate(context, calvingDateController),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: prevCalvingDateController,
                        decoration: const InputDecoration(
                          labelText: 'Tanggal Calving Sebelumnya',
                          border: OutlineInputBorder(),
                        ),
                        readOnly: true,
                        onTap: () => selectDate(context, prevCalvingDateController),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: inseminationDateController,
                        decoration: const InputDecoration(
                          labelText: 'Tanggal Inseminasi',
                          border: OutlineInputBorder(),
                        ),
                        readOnly: true,
                        onTap: () => selectDate(context, inseminationDateController),
                      ),
                      const SizedBox(height: 16),
                      TextField(
                        controller: totalInseminationController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Jumlah Inseminasi',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: isSubmitting ? null : handleSubmit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[700],
                          minimumSize: const Size.fromHeight(50),
                        ),
                        child: isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : const Text('Simpan Data'),
                      ),
                    ],
                  ),
                ),
    );
  }
}
