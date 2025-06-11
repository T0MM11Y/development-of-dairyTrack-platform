import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productType.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:logger/logger.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/formatRupiah.dart';

class EditProductTypeModal extends StatefulWidget {
  final ProdukType product;

  const EditProductTypeModal({Key? key, required this.product})
      : super(key: key);

  @override
  _EditProductTypeModalState createState() => _EditProductTypeModalState();
}

class _EditProductTypeModalState extends State<EditProductTypeModal> {
  final _formKey = GlobalKey<FormState>();
  final _productNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _unitController = TextEditingController();
  File? _imageFile;
  final _logger = Logger();

  @override
  void initState() {
    super.initState();
    _productNameController.text = widget.product.productName ?? '';
    _descriptionController.text = widget.product.productDescription ?? '';
    _priceController.text = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    ).format(double.parse(widget.product.price ?? '0'));
    _unitController.text = widget.product.unit ?? '';
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _submitForm(ProductTypeProvider provider) async {
    if (_formKey.currentState!.validate()) {
      List<int>? imageBytes;
      String? imageFileName;
      if (_imageFile != null) {
        imageBytes = await _imageFile!.readAsBytes();
        imageFileName = _imageFile!.path.split('/').last;
        _logger.i('Selected image: $imageFileName');
      }

      final productData = {
        'productName': _productNameController.text,
        'productDescription': _descriptionController.text,
        'price':
            RupiahInputFormatter.parseToNumericString(_priceController.text),
        'unit': _unitController.text,
        'imageBytes': imageBytes,
        'imageFileName': imageFileName,
      };

      final success =
          await provider.updateProductType(widget.product.id, productData);
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Jenis produk berhasil diperbarui')),
        );
        provider.fetchProductTypes();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.errorMessage)),
        );
      }
    }
  }

  @override
  void dispose() {
    _productNameController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _unitController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProductTypeProvider>(
      builder: (context, provider, child) {
        return AlertDialog(
          title: const Text('Edit Jenis Produk'),
          content: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: _productNameController,
                    decoration: const InputDecoration(
                      labelText: 'Nama Produk',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Nama produk tidak boleh kosong';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _descriptionController,
                    decoration: const InputDecoration(
                      labelText: 'Deskripsi',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Deskripsi tidak boleh kosong';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _priceController,
                    decoration: const InputDecoration(
                      labelText: 'Harga (Rp)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    inputFormatters: [RupiahInputFormatter()],
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Harga tidak boleh kosong';
                      }
                      if (RupiahInputFormatter.parseToNumericString(value)
                          .isEmpty) {
                        return 'Harga harus berupa angka';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _unitController,
                    decoration: const InputDecoration(
                      labelText: 'Satuan',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Satuan tidak boleh kosong';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  _imageFile != null
                      ? Image.file(_imageFile!, height: 100, fit: BoxFit.cover)
                      : const Text('Belum ada gambar dipilih'),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: _pickImage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueGrey[800],
                    ),
                    child: const Text(
                      'Pilih Gambar',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Batal'),
            ),
            ElevatedButton(
              onPressed:
                  provider.isLoading ? null : () => _submitForm(provider),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueGrey[800],
              ),
              child: provider.isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Simpan', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
