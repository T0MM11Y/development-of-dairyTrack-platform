import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:flutter/material.dart';

class AddFeedType extends StatefulWidget {
  const AddFeedType({super.key});

  @override
  _AddFeedTypeState createState() => _AddFeedTypeState();
}

class _AddFeedTypeState extends State<AddFeedType> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _isLoading = false;

  Future<void> _submitFeedType() async {
    if (_formKey.currentState!.validate()) {
      final feedName = _nameController.text.trim();

      // Tampilkan dialog konfirmasi
      bool? confirm = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Konfirmasi'),
            content: Text(
              'Apakah Anda yakin ingin menambah jenis pakan "$feedName"?',
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
        await addFeedType(
          name: feedName,
        );
        success = true;
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Berhasil menambah jenis pakan "$feedName"')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal menambahkan jenis pakan: $e')),
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
  }

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Jenis Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Card(
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      TextFormField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          labelText: 'Nama Jenis Pakan',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.feed),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Nama jenis pakan tidak boleh kosong';
                          }
                          if (value.trim().length < 3) {
                            return 'Nama harus minimal 3 karakter';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submitFeedType,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue[700],
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: _isLoading
                              ? const CircularProgressIndicator(
                                  color: Colors.white,
                                )
                              : const Text(
                                  'Simpan',
                                  style: TextStyle(fontSize: 16),
                                ),
                        ),
                      ),
                    ],
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