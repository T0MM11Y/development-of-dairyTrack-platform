import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:intl/intl.dart';
import 'package:logger/logger.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/formatRupiah.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/actionButtons.dart';
import 'package:dairytrack_mobile/views/salesAndFinancialManagement/component/customSnackbar.dart';

class CreateProductTypeBottomSheet extends StatefulWidget {
  const CreateProductTypeBottomSheet({Key? key}) : super(key: key);

  @override
  _CreateProductTypeBottomSheetState createState() =>
      _CreateProductTypeBottomSheetState();
}

class _CreateProductTypeBottomSheetState
    extends State<CreateProductTypeBottomSheet> {
  final _formKey = GlobalKey<FormState>();
  final _productNameController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _unitController = TextEditingController();
  String? _selectedUnit;
  File? _imageFile;
  final _logger = Logger();

  final List<String> _unitOptions = [
    'Botol',
    'Galon',
    'Liter',
    'Gelas',
    'Buah',
  ];

  @override
  void initState() {
    super.initState();
    _priceController.addListener(() {
      _logger.i('Price field changed: ${_priceController.text}');
    });
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
    if (_formKey.currentState!.validate() && _selectedUnit != null) {
      List<int>? imageBytes;
      String? imageFileName;
      if (_imageFile != null) {
        imageBytes = await _imageFile!.readAsBytes();
        imageFileName = _imageFile!.path.split('/').last;
        _logger.i('Selected image: $imageFileName');
      }

      final newProduct = {
        'productName': _productNameController.text,
        'productDescription': _descriptionController.text,
        'price':
            RupiahInputFormatter.parseToNumericString(_priceController.text),
        'unit': _selectedUnit,
        'imageBytes': imageBytes,
        'imageFileName': imageFileName,
      };

      final success = await provider.createProductType(newProduct);
      if (success) {
        Navigator.pop(context);
        CustomSnackbar.show(
          context: context,
          message: 'Jenis produk berhasil ditambahkan',
          backgroundColor: Colors.green,
          icon: Icons.check_circle,
          iconColor: Colors.white,
        );
        provider.fetchProductTypes();
      } else {
        CustomSnackbar.show(
          context: context,
          message: provider.errorMessage.isNotEmpty
              ? provider.errorMessage
              : 'Gagal menambahkan jenis produk',
          backgroundColor: Colors.red,
          icon: Icons.error,
          iconColor: Colors.white,
        );
      }
    } else {
      CustomSnackbar.show(
        context: context,
        message: 'Harap isi semua kolom yang diperlukan',
        backgroundColor: Colors.orange,
        icon: Icons.warning,
        iconColor: Colors.white,
      );
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
        return Container(
          padding: EdgeInsets.only(
            bottom: MediaQuery.of(context).viewInsets.bottom + 16,
            left: 16,
            right: 16,
            top: 16,
          ),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Tambah Jenis Produk',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Flexible(
                child: SingleChildScrollView(
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
                            final numericValue =
                                RupiahInputFormatter.parseToNumericString(
                                    value);
                            if (numericValue.isEmpty ||
                                double.tryParse(numericValue) == null) {
                              return 'Harga harus berupa angka yang valid';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                            labelText: 'Satuan',
                            border: OutlineInputBorder(),
                          ),
                          items: _unitOptions
                              .map((unit) => DropdownMenuItem<String>(
                                    value: unit,
                                    child: Text(unit),
                                  ))
                              .toList(),
                          value: _selectedUnit,
                          onChanged: (value) {
                            setState(() {
                              _selectedUnit = value;
                            });
                          },
                          validator: (value) {
                            if (value == null) {
                              return 'Satuan harus dipilih';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 12),
                        _imageFile != null
                            ? Image.file(_imageFile!,
                                height: 100, fit: BoxFit.cover)
                            : const Text('Tidak ada gambar dipilih'),
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
                        const SizedBox(height: 16),
                        ActionButtons(
                          isLoading: provider.isLoading,
                          onSubmit: () => _submitForm(provider),
                          submitText: 'Tambah',
                          submitColor: Colors.blueGrey[800]!,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
