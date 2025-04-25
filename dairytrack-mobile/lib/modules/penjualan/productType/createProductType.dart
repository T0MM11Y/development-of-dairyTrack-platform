import 'dart:io';
import 'package:dairy_track/config/api/penjualan/productType.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

class CreateProductType extends StatefulWidget {
  const CreateProductType({super.key});

  @override
  _CreateProductTypeState createState() => _CreateProductTypeState();
}

class _CreateProductTypeState extends State<CreateProductType> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _unitController = TextEditingController();
  XFile? _selectedImage;
  bool _isLoading = false;

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        _selectedImage = pickedFile;
      });
    }
  }

  Future<void> _submitProductType() async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isLoading = true;
      });

      try {
        List<int>? imageBytes;
        String? imageFileName;

        if (_selectedImage != null) {
          imageBytes = await _selectedImage!.readAsBytes();
          imageFileName = _selectedImage!.name;
        }

        await createProductType(
          productName: _nameController.text.trim(),
          productDescription: _descriptionController.text.trim(),
          price: _priceController.text.trim(),
          unit: _unitController.text.trim(),
          imageBytes: imageBytes,
          imageFileName: imageFileName,
        );

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Jenis produk berhasil ditambahkan')),
        );

        Navigator.pop(context, true); // Return true to trigger refresh
      } catch (e) {
        // Log error untuk debugging
        print('Error in _submitProductType: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menambahkan jenis produk: $e')),
        );
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _unitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Jenis Produk'),
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
                          labelText: 'Nama Produk',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.label),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Nama produk tidak boleh kosong';
                          }
                          if (value.trim().length < 3) {
                            return 'Nama harus minimal 3 karakter';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _descriptionController,
                        decoration: const InputDecoration(
                          labelText: 'Deskripsi Produk',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.description),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        maxLines: 3,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Deskripsi tidak boleh kosong';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _priceController,
                        decoration: const InputDecoration(
                          labelText: 'Harga (Rp)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.attach_money),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Harga tidak boleh kosong';
                          }
                          final parsed = double.tryParse(value.trim());
                          if (parsed == null || parsed <= 0) {
                            return 'Harga harus berupa angka positif';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _unitController,
                        decoration: const InputDecoration(
                          labelText: 'Satuan (e.g., Liter, Kg)',
                          border: OutlineInputBorder(),
                          prefixIcon: Icon(Icons.scale),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().isEmpty) {
                            return 'Satuan tidak boleh kosong';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              _selectedImage == null
                                  ? 'Belum ada gambar dipilih'
                                  : 'Gambar: ${_selectedImage!.name}',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          ElevatedButton(
                            onPressed: _pickImage,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue[700],
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('Pilih Gambar'),
                          ),
                        ],
                      ),
                      if (_selectedImage != null) ...[
                        const SizedBox(height: 16),
                        Image.file(
                          File(_selectedImage!.path),
                          height: 100,
                          width: 100,
                          fit: BoxFit.cover,
                        ),
                      ],
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _submitProductType,
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
