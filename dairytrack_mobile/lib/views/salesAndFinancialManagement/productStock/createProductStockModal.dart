import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';
import 'package:intl/intl.dart';
import 'package:logger/logger.dart';

class CreateStockModal extends StatefulWidget {
  const CreateStockModal({Key? key}) : super(key: key);

  @override
  _CreateStockModalState createState() => _CreateStockModalState();
}

class _CreateStockModalState extends State<CreateStockModal> {
  final _formKey = GlobalKey<FormState>();
  int? _selectedProductType;
  final _initialQuantityController = TextEditingController();
  final _totalMilkUsedController = TextEditingController();
  final _productionDateController = TextEditingController();
  final _expiryDateController = TextEditingController();
  DateTime? _productionDate;
  DateTime? _expiryDate;
  String? _status = 'available';
  final _logger = Logger();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final productTypeProvider =
          Provider.of<ProductTypeProvider>(context, listen: false);
      if (!productTypeProvider.isLoading &&
          productTypeProvider.productTypes.isEmpty) {
        productTypeProvider.fetchProductTypes();
      }
    });
  }

  Future<void> _selectDate(BuildContext context, bool isProduction) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isProduction) {
          _productionDate = picked;
          _productionDateController.text =
              DateFormat('dd MMM yyyy').format(picked);
        } else {
          _expiryDate = picked;
          _expiryDateController.text = DateFormat('dd MMM yyyy').format(picked);
        }
      });
    }
  }

  Future<void> _submitForm(StockProvider provider) async {
    if (_formKey.currentState!.validate() &&
        _selectedProductType != null &&
        _productionDate != null &&
        _expiryDate != null) {
      try {
        final userId = await AuthUtils.getUserId(); // Fetch user_id
        final newStock = {
          'productType': _selectedProductType,
          'initialQuantity': int.parse(_initialQuantityController.text),
          'productionAt':
              DateFormat("yyyy-MM-dd'T'HH:mm:ssZ").format(_productionDate!),
          'expiryAt': DateFormat("yyyy-MM-dd'T'HH:mm:ssZ").format(_expiryDate!),
          'status': _status,
          'totalMilkUsed': double.parse(_totalMilkUsedController.text),
          'createdBy': userId, // Use fetched user_id
        };

        _logger.i('Submitting stock: $newStock');

        final success = await provider.createStock(newStock);
        if (success) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Stok produk berhasil ditambahkan')),
          );
          provider.fetchStocks();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(provider.errorMessage)),
          );
        }
      } catch (e) {
        _logger.e('Error submitting stock: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menambahkan stok: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _initialQuantityController.dispose();
    _totalMilkUsedController.dispose();
    _productionDateController.dispose();
    _expiryDateController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProductTypeProvider>(
      builder: (context, productTypeProvider, child) {
        return AlertDialog(
          title: const Text('Tambah Stok Produk'),
          content: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (productTypeProvider.isLoading)
                    const Center(child: CircularProgressIndicator())
                  else if (productTypeProvider.errorMessage.isNotEmpty)
                    Text(
                      productTypeProvider.errorMessage,
                      style: const TextStyle(color: Colors.red),
                    )
                  else
                    DropdownButtonFormField<int>(
                      decoration: const InputDecoration(
                        labelText: 'Jenis Produk',
                        border: OutlineInputBorder(),
                      ),
                      items: productTypeProvider.productTypes
                          .map((product) => DropdownMenuItem<int>(
                                value: product.id,
                                child: Text(product.productName),
                              ))
                          .toList(),
                      value: _selectedProductType,
                      onChanged: (value) {
                        setState(() {
                          _selectedProductType = value;
                        });
                      },
                      validator: (value) {
                        if (value == null) {
                          return 'Jenis produk harus dipilih';
                        }
                        return null;
                      },
                    ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _initialQuantityController,
                    decoration: const InputDecoration(
                      labelText: 'Jumlah Awal',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Jumlah awal tidak boleh kosong';
                      }
                      if (int.tryParse(value) == null) {
                        return 'Jumlah harus berupa angka';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _totalMilkUsedController,
                    decoration: const InputDecoration(
                      labelText: 'Total Susu Digunakan (liter)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Total susu tidak boleh kosong';
                      }
                      if (double.tryParse(value) == null) {
                        return 'Total susu harus berupa angka';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: 'Status',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(
                          value: 'available', child: Text('Tersedia')),
                      DropdownMenuItem(
                          value: 'contamination', child: Text('Kontaminasi')),
                      DropdownMenuItem(
                          value: 'expired', child: Text('Kadaluarsa')),
                    ],
                    value: _status,
                    onChanged: (value) {
                      setState(() {
                        _status = value;
                      });
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Status harus dipilih';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _productionDateController,
                    readOnly: true,
                    decoration: const InputDecoration(
                      labelText: 'Tanggal Produksi',
                      border: OutlineInputBorder(),
                      hintText: 'Pilih tanggal',
                    ),
                    onTap: () => _selectDate(context, true),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Tanggal produksi harus dipilih';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _expiryDateController,
                    readOnly: true,
                    decoration: const InputDecoration(
                      labelText: 'Tanggal Kadaluarsa',
                      border: OutlineInputBorder(),
                      hintText: 'Pilih tanggal',
                    ),
                    onTap: () => _selectDate(context, false),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Tanggal kadaluarsa harus dipilih';
                      }
                      return null;
                    },
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
            Consumer<StockProvider>(
              builder: (context, stockProvider, child) {
                return ElevatedButton(
                  onPressed: stockProvider.isLoading
                      ? null
                      : () => _submitForm(stockProvider),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueGrey[800],
                  ),
                  child: stockProvider.isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Tambah',
                          style: TextStyle(color: Colors.white)),
                );
              },
            ),
          ],
        );
      },
    );
  }
}
