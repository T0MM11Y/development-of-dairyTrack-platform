import 'package:dairy_track/config/api/penjualan/product.dart';
import 'package:dairy_track/config/api/penjualan/productType.dart';
import 'package:dairy_track/model/penjualan/product.dart';
import 'package:dairy_track/model/penjualan/productType.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class EditProductStock extends StatefulWidget {
  final ProductStock productStock;

  const EditProductStock({super.key, required this.productStock});

  @override
  _EditProductStockState createState() => _EditProductStockState();
}

class _EditProductStockState extends State<EditProductStock> {
  final _formKey = GlobalKey<FormState>();
  final _initialQuantityController = TextEditingController();
  final _totalMilkUsedController = TextEditingController();
  final _productionAtController = TextEditingController();
  final _expiryAtController = TextEditingController();
  ProdukType? _selectedProductType;
  String _status = 'available';
  bool _isLoading = false;
  List<ProdukType> _productTypes = [];

  @override
  void initState() {
    super.initState();
    _fetchProductTypes();
    _initialQuantityController.text =
        widget.productStock.initialQuantity.toString();
    _totalMilkUsedController.text =
        widget.productStock.totalMilkUsed.toString();
    _productionAtController.text =
        DateFormat('yyyy-MM-dd').format(widget.productStock.productionAt);
    _expiryAtController.text =
        DateFormat('yyyy-MM-dd').format(widget.productStock.expiryAt);
    _status = widget.productStock.status;
    _selectedProductType = widget.productStock.productTypeDetail;
  }

  Future<void> _fetchProductTypes() async {
    try {
      final productTypes = await getProductTypes();
      setState(() {
        _productTypes = productTypes;
        _selectedProductType = productTypes.firstWhere(
          (type) => type.id == widget.productStock.productType,
          orElse: () => widget.productStock.productTypeDetail,
        );
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat jenis produk: $e')),
      );
    }
  }

  Future<void> _selectDate(
      BuildContext context, TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.parse(controller.text),
      firstDate: DateTime(2000),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      setState(() {
        controller.text = DateFormat('yyyy-MM-dd').format(picked);
      });
    }
  }

  Future<void> _submitProductStock() async {
    if (_formKey.currentState!.validate() && _selectedProductType != null) {
      setState(() {
        _isLoading = true;
      });

      try {
        await updateProductStock(
          id: widget.productStock.id,
          productType: _selectedProductType!.id,
          initialQuantity: int.parse(_initialQuantityController.text.trim()),
          productionAt: DateTime.parse(_productionAtController.text.trim()),
          expiryAt: DateTime.parse(_expiryAtController.text.trim()),
          status: _status,
          totalMilkUsed: double.parse(_totalMilkUsedController.text.trim()),
        );

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Stok produk berhasil diperbarui')),
        );

        Navigator.pop(context, true);
      } catch (e) {
        print('Error in _submitProductStock: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memperbarui stok produk: $e')),
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
    _initialQuantityController.dispose();
    _totalMilkUsedController.dispose();
    _productionAtController.dispose();
    _expiryAtController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Stok Produk'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Card(
              elevation: 2,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    DropdownButtonFormField<ProdukType>(
                      value: _selectedProductType,
                      decoration: const InputDecoration(
                        labelText: 'Jenis Produk',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.label),
                      ),
                      items: _productTypes.map((ProdukType type) {
                        return DropdownMenuItem<ProdukType>(
                          value: type,
                          child: Text(type.productName),
                        );
                      }).toList(),
                      onChanged: (ProdukType? newValue) {
                        setState(() {
                          _selectedProductType = newValue;
                        });
                      },
                      validator: (value) =>
                          value == null ? 'Pilih jenis produk' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _initialQuantityController,
                      decoration: const InputDecoration(
                        labelText: 'Jumlah Awal',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.inventory),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Jumlah awal tidak boleh kosong';
                        }
                        final parsed = int.tryParse(value.trim());
                        if (parsed == null || parsed <= 0) {
                          return 'Jumlah harus berupa angka positif';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _totalMilkUsedController,
                      decoration: const InputDecoration(
                        labelText: 'Total Susu Digunakan (Liter)',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.local_drink),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Total susu tidak boleh kosong';
                        }
                        final parsed = double.tryParse(value.trim());
                        if (parsed == null || parsed < 0) {
                          return 'Total susu harus berupa angka non-negatif';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _productionAtController,
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Produksi',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () =>
                          _selectDate(context, _productionAtController),
                      validator: (value) =>
                          value == null || value.trim().isEmpty
                              ? 'Tanggal produksi tidak boleh kosong'
                              : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _expiryAtController,
                      decoration: const InputDecoration(
                        labelText: 'Tanggal Kadaluarsa',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      readOnly: true,
                      onTap: () => _selectDate(context, _expiryAtController),
                      validator: (value) =>
                          value == null || value.trim().isEmpty
                              ? 'Tanggal kadaluarsa tidak boleh kosong'
                              : null,
                    ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String>(
                      value: _status,
                      decoration: const InputDecoration(
                        labelText: 'Status',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.info),
                      ),
                      items: ['available', 'expired', 'contamination']
                          .map((String status) {
                        return DropdownMenuItem<String>(
                          value: status,
                          child: Text(status),
                        );
                      }).toList(),
                      onChanged: (String? newValue) {
                        setState(() {
                          _status = newValue!;
                        });
                      },
                      validator: (value) =>
                          value == null ? 'Pilih status' : null,
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submitProductStock,
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
          ),
        ),
      ),
    );
  }
}
