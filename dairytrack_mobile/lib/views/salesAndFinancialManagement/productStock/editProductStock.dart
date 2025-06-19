import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';
import 'package:intl/intl.dart';
import 'package:logger/logger.dart';

class EditStockModal extends StatefulWidget {
  final Stock stock;

  const EditStockModal({Key? key, required this.stock}) : super(key: key);

  @override
  _EditStockModalState createState() => _EditStockModalState();
}

class _EditStockModalState extends State<EditStockModal> {
  final _formKey = GlobalKey<FormState>();
  int? _selectedProductType;
  final TextEditingController _initialQuantityController =
      TextEditingController();
  final TextEditingController _totalMilkUsedController =
      TextEditingController();
  final TextEditingController _productionDateController =
      TextEditingController();
  final TextEditingController _expiryDateController = TextEditingController();
  DateTime? _productionDate;
  DateTime? _expiryDate;
  String? _status;
  final _logger = Logger();

  @override
  void initState() {
    super.initState();
    _selectedProductType = widget.stock.productType;
    _initialQuantityController.text = widget.stock.initialQuantity.toString();
    _totalMilkUsedController.text = widget.stock.totalMilkUsed.toString();

    _productionDate = widget.stock.productionAt;
    _productionDateController.text = _productionDate != null
        ? DateFormat('dd MMM yyyy HH:mm').format(_productionDate!)
        : '';
    _expiryDate = widget.stock.expiryAt;
    _expiryDateController.text = _expiryDate != null
        ? DateFormat('dd MMM yyyy HH:mm').format(_expiryDate!)
        : '';

    _status = widget.stock.status;

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final productTypeProvider =
          Provider.of<ProductTypeProvider>(context, listen: false);
      if (!productTypeProvider.isLoading &&
          productTypeProvider.productTypes.isEmpty) {
        productTypeProvider.fetchProductTypes();
      }
    });
  }

  Future<void> _selectDateTime(BuildContext context, bool isProduction) async {
    // Show Date Picker
    final DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: isProduction
          ? _productionDate ?? DateTime.now()
          : _expiryDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );

    if (pickedDate != null) {
      // Show Time Picker
      final TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: isProduction
            ? TimeOfDay.fromDateTime(_productionDate ?? DateTime.now())
            : TimeOfDay.fromDateTime(_expiryDate ?? DateTime.now()),
      );

      if (pickedTime != null) {
        // Combine date and time
        final DateTime combinedDateTime = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );

        setState(() {
          if (isProduction) {
            _productionDate = combinedDateTime;
            _productionDateController.text =
                DateFormat('dd MMM yyyy HH:mm').format(combinedDateTime);
          } else {
            _expiryDate = combinedDateTime;
            _expiryDateController.text =
                DateFormat('dd MMM yyyy HH:mm').format(combinedDateTime);
          }
        });
      }
    }
  }

  Future<void> _submitForm(StockProvider provider) async {
    if (_formKey.currentState!.validate() &&
        _selectedProductType != null &&
        _productionDate != null &&
        _expiryDate != null) {
      try {
        final userId = await AuthUtils.getUserId();
        final createdBy = widget.stock.createdBy.id;
        final updatedStock = {
          'productType': _selectedProductType,
          'initialQuantity': int.parse(_initialQuantityController.text),
          'productionAt': _productionDate!.toIso8601String(),
          'expiryAt': _expiryDate!.toIso8601String(),
          'status': _status,
          'totalMilkUsed': double.parse(_totalMilkUsedController.text),
          'createdBy': createdBy,
          'updatedBy': userId,
        };

        _logger.i('Updating stock: $updatedStock');

        final success =
            await provider.updateStock(widget.stock.id, updatedStock);
        if (success) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Stok produk berhasil diperbarui')),
          );
          provider.fetchStocks();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(provider.errorMessage)),
          );
        }
      } catch (e) {
        _logger.e('Error updating stock: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memperbarui stok: $e')),
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
    return Consumer2<StockProvider, ProductTypeProvider>(
      builder: (context, stockProvider, productTypeProvider, child) {
        return AlertDialog(
          title: const Text('Edit Stok Produk'),
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
                      labelText: 'Tanggal & Waktu Produksi',
                      border: OutlineInputBorder(),
                      hintText: 'Pilih tanggal dan waktu',
                    ),
                    onTap: () => _selectDateTime(context, true),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Tanggal dan waktu produksi harus dipilih';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _expiryDateController,
                    readOnly: true,
                    decoration: const InputDecoration(
                      labelText: 'Tanggal & Waktu Kadaluarsa',
                      border: OutlineInputBorder(),
                      hintText: 'Pilih tanggal dan waktu',
                    ),
                    onTap: () => _selectDateTime(context, false),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Tanggal dan waktu kadaluarsa harus dipilih';
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
            ElevatedButton(
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
                  : const Text('Simpan', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }
}
