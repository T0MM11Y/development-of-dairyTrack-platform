import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/pakan/nutrition.dart';

class AddNutrition extends StatefulWidget {
  const AddNutrition({super.key});

  @override
  _AddNutritionState createState() => _AddNutritionState();
}

class _AddNutritionState extends State<AddNutrition> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _unitController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _unitController.dispose();
    super.dispose();
  }

  Future<void> _saveNutrition() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final name = _nameController.text.trim();
    final unit = _unitController.text.isNotEmpty ? _unitController.text.trim() : null;

    // Tampilkan dialog konfirmasi
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Konfirmasi'),
          content: Text(
            'Apakah Anda yakin ingin menambah nutrisi "$name"${unit != null ? ' dengan satuan "$unit"' : ''}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false), // Cancel
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true), // Lanjut
              child: const Text('Ya, Tambah'),
            ),
          ],
        );
      },
    );

    // Jika pengguna memilih "Batal", hentikan proses
    if (confirm != true) {
      return;
    }

    // Hanya panggil setState jika widget masih mounted
    if (mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    bool success = false;
    try {
      await addNutrisi(
        name: name,
        unit: unit,
      );
      success = true;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Berhasil menambah nutrisi "$name"${unit != null ? ' dengan satuan "$unit"' : ''}',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menambahkan nutrisi: ${e.toString()}')),
        );
      }
    } finally {
      // Hanya panggil setState jika widget masih mounted
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
      // Pindahkan Navigator.pop ke sini untuk memastikan widget tetap ada
      if (success && mounted) {
        Navigator.pop(context, true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Nutrisi'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: ListView(
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Nama Nutrisi',
                        border: OutlineInputBorder(),
                        hintText: 'contoh: Protein, Kalsium, dll',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Nama nutrisi tidak boleh kosong';
                        }
                        return null;
                      },
                      textCapitalization: TextCapitalization.words,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _unitController,
                      decoration: const InputDecoration(
                        labelText: 'Satuan (Opsional)',
                        border: OutlineInputBorder(),
                        hintText: 'contoh: kg, liter, gram, dll',
                      ),
                      textCapitalization: TextCapitalization.none,
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _saveNutrition,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text(
                        'Simpan Nutrisi',
                        style: TextStyle(fontSize: 16),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}