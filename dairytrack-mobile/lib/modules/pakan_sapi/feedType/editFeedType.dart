import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/feedType.dart';
import 'package:flutter/material.dart';

class EditFeedType extends StatefulWidget {
  final FeedType feedType;

  const EditFeedType({super.key, required this.feedType});

  @override
  _EditFeedTypeState createState() => _EditFeedTypeState();
}

class _EditFeedTypeState extends State<EditFeedType> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    // Pre-fill the form with existing feed type data
    _nameController.text = widget.feedType.name;
  }

  Future<void> _updateFeedType() async {
    if (_formKey.currentState!.validate()) {
      final oldName = widget.feedType.name;
      final newName = _nameController.text.trim();

      // Tampilkan dialog konfirmasi
      bool? confirm = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Konfirmasi'),
            content: Text(
              'Apakah Anda yakin ingin mengubah jenis pakan dari "$oldName" menjadi "$newName"?',
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
        // Make sure the ID is not null before updating
        if (widget.feedType.id == null) {
          throw Exception('ID tidak valid');
        }

        await updateFeedType(
          id: widget.feedType.id!,
          name: newName,
        );
        success = true;
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Berhasil mengubah jenis pakan dari "$oldName" menjadi "$newName"',
              ),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal memperbarui jenis pakan: $e')),
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
        title: const Text('Edit Jenis Pakan'),
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
                          onPressed: _isLoading ? null : _updateFeedType,
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
                                  'Simpan Perubahan',
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