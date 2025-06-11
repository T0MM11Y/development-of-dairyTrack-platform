import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/productStock.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productStockProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
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
  late int? _selectedProductType;
  late final TextEditingController _initialQuantityController;
  late final TextEditingController _totalMilkUsedController;
  late DateTime? _productionDate;
  late DateTime? _expiryDate;
  late String? _status;
  final _logger = Logger();

  @override
  void initState() {
    super.initState();
    _selectedProductType = widget.stock.productType;
    _initialQuantityController =
        TextEditingController(text: widget.stock.initialQuantity.toString());
    _totalMilkUsedController =
        TextEditingController(text: widget.stock.totalMilkUsed.toString());
    _productionDate = widget.stock.productionAt;
    _expiryDate = widget.stock.expiryAt;
    _status = widget.stock.status;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ProductTypeProvider>(context, listen: false)
          .fetchProductTypes();
    });
  }

  Future<void> _selectDate(BuildContext context, bool isProduction) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: isProduction ? _productionDate : _expiryDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        if (isProduction) {
          _productionDate = picked;
        } else {
          _expiryDate = picked;
        }
      });
    }
  }

  Future<void> _submitForm(StockProvider provider) async {
    if (_formKey.currentState!.validate() &&
        _selectedProductType != null &&
        _productionDate != null &&
        _expiryDate != null) {
      final updatedStock = {
        'productType': _selectedProductType,
        'initialQuantity': int.parse(_initialQuantityController.text),
        'productionAt':
            DateFormat("yyyy-MM-dd'T'HH:mm:ssZ").format(_productionDate!),
        'expiryAt': DateFormat("yyyy-MM-dd'T'HH:mm:ssZ").format(_expiryDate!),
        'status': _status,
        'totalMilkUsed': double.parse(_totalMilkUsedController.text),
        'updatedBy': 2, // Hardcoded as per example
      };

      final success = await provider.updateStock(widget.stock.id, updatedStock);
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Stok produk berhasil diperbarui')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.errorMessage)),
        );
      }
    }
  }

  @override
  void dispose() {
    _initialQuantityController.dispose();
    _totalMilkUsedController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider.value(
            value: Provider.of<StockProvider>(context)),
        ChangeNotifierProvider(create: (_) => ProductTypeProvider()),
      ],
      child: Consumer2<StockProvider, ProductTypeProvider>(
        builder: (context, stockProvider, productTypeProvider, child) {
          return AlertDialog(
            title: const Text('Edit Stok Produk'),
            content: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
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
                      readOnly: true,
                      decoration: InputDecoration(
                        labelText: 'Tanggal Produksi',
                        border: const OutlineInputBorder(),
                        hintText: _productionDate != null
                            ? DateFormat('dd MMM yyyy').format(_productionDate!)
                            : 'Pilih tanggal',
                      ),
                      onTap: () => _selectDate(context, true),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      readOnly: true,
                      decoration: InputDecoration(
                        labelText: 'Tanggal Kadaluarsa',
                        border: const OutlineInputBorder(),
                        hintText: _expiryDate != null
                            ? DateFormat('dd MMM yyyy').format(_expiryDate!)
                            : 'Pilih tanggal',
                      ),
                      onTap: () => _selectDate(context, false),
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
                    : const Text('Simpan',
                        style: TextStyle(color: Colors.white)),
              ),
            ],
          );
        },
      ),
    );
  }
}
