import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/order.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/orderProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/productTypeProvider.dart';
import 'package:logger/logger.dart';

class CreateOrderModal extends StatefulWidget {
  const CreateOrderModal({Key? key}) : super(key: key);

  @override
  _CreateOrderModalState createState() => _CreateOrderModalState();
}

class _CreateOrderModalState extends State<CreateOrderModal> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _customerNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneNumberController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _shippingCostController = TextEditingController();
  String? _status = 'Requested';
  String? _paymentMethod;
  String _countryCode = '+62'; // Default Indonesia
  List<_OrderItemInput> _orderItems = [_OrderItemInput()];
  final Logger _logger = Logger();

  final List<Map<String, String>> _countryCodes = [
    {'code': '+62', 'country': 'Indonesia'},
    {'code': '+60', 'country': 'Malaysia'},
    {'code': '+65', 'country': 'Singapore'},
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<ProductTypeProvider>(context, listen: false)
          .fetchProductTypes();
      Provider.of<OrderProvider>(context, listen: false).fetchOrders();
    });
  }

  void _addOrderItem() {
    setState(() {
      _orderItems.add(_OrderItemInput());
    });
  }

  void _removeOrderItem(int index) {
    setState(() {
      if (_orderItems.length > 1) {
        _orderItems.removeAt(index);
      }
    });
  }

  Future<void> _submitForm(OrderProvider provider) async {
    if (_formKey.currentState!.validate() &&
        _orderItems.every((item) => item.isValid())) {
      try {
        final phoneNumber = '$_countryCode${_phoneNumberController.text}';
        final orderData = {
          'customer_name': _customerNameController.text,
          'email': _emailController.text,
          'phone_number': phoneNumber,
          'location': _locationController.text,
          'status': _status,
          'shipping_cost': _shippingCostController.text.isEmpty
              ? '0.00'
              : _shippingCostController.text,
          'payment_method': _paymentMethod,
          'order_items': _orderItems
              .map((item) => {
                    'product_type': item.productType,
                    'quantity': int.parse(item.quantityController.text),
                  })
              .toList(),
          'notes': _notesController.text.isEmpty ? null : _notesController.text,
        };

        _logger.i('Submitting order: $orderData');

        final success = await provider.createOrder(orderData);
        if (success) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Pesanan berhasil ditambahkan')),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(provider.errorMessage)),
          );
        }
      } catch (e) {
        _logger.e('Error creating order: $e');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal membuat pesanan: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _customerNameController.dispose();
    _emailController.dispose();
    _phoneNumberController.dispose();
    _locationController.dispose();
    _notesController.dispose();
    _shippingCostController.dispose();
    for (var item in _orderItems) {
      item.quantityController.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<OrderProvider, ProductTypeProvider>(
      builder: (context, orderProvider, productTypeProvider, child) {
        return AlertDialog(
          title: const Text('Tambah Pesanan'),
          content: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: _customerNameController,
                    decoration: const InputDecoration(
                      labelText: 'Nama Pelanggan',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Nama pelanggan harus diisi';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Email harus diisi';
                      }
                      if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(value)) {
                        return 'Email tidak valid';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      SizedBox(
                        width: 100,
                        child: DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                            labelText: 'Kode Negara',
                            border: OutlineInputBorder(),
                          ),
                          value: _countryCode,
                          items: _countryCodes
                              .map((country) => DropdownMenuItem<String>(
                                    value: country['code'],
                                    child: Text(country['code']!),
                                  ))
                              .toList(),
                          onChanged: (value) {
                            setState(() {
                              _countryCode = value!;
                            });
                          },
                          validator: (value) {
                            if (value == null) {
                              return 'Pilih kode';
                            }
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextFormField(
                          controller: _phoneNumberController,
                          decoration: const InputDecoration(
                            labelText: 'Nomor Telepon',
                            border: OutlineInputBorder(),
                          ),
                          keyboardType: TextInputType.phone,
                          validator: (value) {
                            if (value == null || value.isEmpty) {
                              return 'Nomor telepon harus diisi';
                            }
                            if (!RegExp(r'^\d+$').hasMatch(value)) {
                              return 'Hanya angka diperbolehkan';
                            }
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _locationController,
                    decoration: const InputDecoration(
                      labelText: 'Lokasi',
                      border: OutlineInputBorder(),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Lokasi harus diisi';
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
                          value: 'Requested', child: Text('Requested')),
                      DropdownMenuItem(
                          value: 'Completed', child: Text('Completed')),
                      DropdownMenuItem(
                          value: 'Cancelled', child: Text('Cancelled')),
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
                    controller: _shippingCostController,
                    decoration: const InputDecoration(
                      labelText: 'Biaya Pengiriman (opsional)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType:
                        TextInputType.numberWithOptions(decimal: true),
                    validator: (value) {
                      if (value != null && value.isNotEmpty) {
                        if (double.tryParse(value) == null ||
                            double.parse(value) < 0) {
                          return 'Biaya harus berupa angka positif';
                        }
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(
                      labelText: 'Metode Pembayaran (opsional)',
                      border: OutlineInputBorder(),
                    ),
                    items: const [
                      DropdownMenuItem(value: null, child: Text('Tidak Ada')),
                      DropdownMenuItem(value: 'Cash', child: Text('Cash')),
                      DropdownMenuItem(
                          value: 'Bank Transfer', child: Text('Bank Transfer')),
                      DropdownMenuItem(
                          value: 'Credit Card', child: Text('Credit Card')),
                    ],
                    value: _paymentMethod,
                    onChanged: (value) {
                      setState(() {
                        _paymentMethod = value;
                      });
                    },
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Item Pesanan',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  ..._orderItems.asMap().entries.map((entry) {
                    final index = entry.key;
                    final item = entry.value;
                    return _buildOrderItemInput(
                        index, item, orderProvider, productTypeProvider);
                  }),
                  TextButton(
                    onPressed: _addOrderItem,
                    child: const Text('Tambah Item'),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _notesController,
                    decoration: const InputDecoration(
                      labelText: 'Catatan (opsional)',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: 3,
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
            Consumer<OrderProvider>(
              builder: (context, provider, child) {
                return ElevatedButton(
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

  Widget _buildOrderItemInput(int index, _OrderItemInput item,
      OrderProvider orderProvider, ProductTypeProvider productTypeProvider) {
    final availableProducts = productTypeProvider.productTypes
        .where((product) =>
            orderProvider.availableProductTypes.contains(product.id))
        .toList();

    return Column(
      children: [
        const SizedBox(height: 12),
        if (orderProvider.isLoading || productTypeProvider.isLoading)
          const Center(child: CircularProgressIndicator())
        else if (orderProvider.errorMessage.isNotEmpty)
          Text(
            orderProvider.errorMessage,
            style: const TextStyle(color: Colors.red),
          )
        else if (productTypeProvider.errorMessage.isNotEmpty)
          Text(
            productTypeProvider.errorMessage,
            style: const TextStyle(color: Colors.red),
          )
        else if (availableProducts.isEmpty)
          const Text(
            'Tidak ada produk tersedia',
            style: TextStyle(color: Colors.red),
          )
        else
          DropdownButtonFormField<int>(
            decoration: const InputDecoration(
              labelText: 'Jenis Produk',
              border: OutlineInputBorder(),
            ),
            items: availableProducts
                .map((product) => DropdownMenuItem<int>(
                      value: product.id,
                      child: Text(product.productName),
                    ))
                .toList(),
            value: item.productType,
            onChanged: (value) {
              setState(() {
                item.productType = value;
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
          controller: item.quantityController,
          decoration: const InputDecoration(
            labelText: 'Jumlah',
            border: OutlineInputBorder(),
          ),
          keyboardType: TextInputType.number,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Jumlah harus diisi';
            }
            if (int.tryParse(value) == null || int.parse(value) <= 0) {
              return 'Jumlah harus berupa angka positif';
            }
            return null;
          },
        ),
        if (_orderItems.length > 1)
          TextButton(
            onPressed: () => _removeOrderItem(index),
            child:
                const Text('Hapus Item', style: TextStyle(color: Colors.red)),
          ),
      ],
    );
  }
}

class _OrderItemInput {
  int? productType;
  final TextEditingController quantityController = TextEditingController();

  bool isValid() {
    return productType != null &&
        quantityController.text.isNotEmpty &&
        int.tryParse(quantityController.text) != null &&
        int.parse(quantityController.text) > 0;
  }
}
