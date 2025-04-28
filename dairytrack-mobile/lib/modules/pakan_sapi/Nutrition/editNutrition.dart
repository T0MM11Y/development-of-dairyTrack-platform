import 'package:flutter/material.dart';
import 'package:dairy_track/model/pakan/nutrition.dart';
import 'package:dairy_track/config/api/pakan/nutrition.dart';

class EditNutrition extends StatefulWidget {
  final Nutrisi nutrition;

  const EditNutrition({super.key, required this.nutrition});

  @override
  _EditNutritionState createState() => _EditNutritionState();
}

class _EditNutritionState extends State<EditNutrition> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _unitController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _nameController.text = widget.nutrition.name;
    _unitController.text = widget.nutrition.unit ?? '';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _unitController.dispose();
    super.dispose();
  }

  Future<void> _updateNutrition() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final oldName = widget.nutrition.name;
    final oldUnit = widget.nutrition.unit ?? '';
    final newName = _nameController.text.trim();
    final newUnit = _unitController.text.isNotEmpty ? _unitController.text.trim() : null;

    // Tampilkan dialog konfirmasi
    bool? confirm = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Konfirmasi'),
          content: Text(
            'Apakah Anda yakin ingin mengubah nutrisi dari "$oldName"${oldUnit.isNotEmpty ? ' ($oldUnit)' : ''} '
            'menjadi "$newName"${newUnit != null ? ' ($newUnit)' : ''}?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false), // Cancel
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true), // Lanjut
              child: const Text('Ya, Simpan'),
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
      await updateNutrisi(
        id: widget.nutrition.id!,
        name: newName,
        unit: newUnit,
      );
      success = true;
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Berhasil mengubah nutrisi dari "$oldName"${oldUnit.isNotEmpty ? ' ($oldUnit)' : ''} '
              'menjadi "$newName"${newUnit != null ? ' ($newUnit)' : ''}',
            ),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memperbarui nutrisi: ${e.toString()}')),
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
        title: const Text('Edit Nutrisi'),
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
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Nama nutrisi tidak boleh kosong';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _unitController,
                      decoration: const InputDecoration(
                        labelText: 'Satuan (Opsional)',
                        border: OutlineInputBorder(),
                        hintText: 'contoh: kg, liter, dll',
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _updateNutrition,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: const Text(
                        'Simpan Perubahan',
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