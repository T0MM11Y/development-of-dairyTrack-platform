import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../model/feed.dart';
import '../model/feedType.dart';
import '../model/nutrition.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedController.dart';

class EditFeedForm extends StatefulWidget {
  final Feed feed;
  final List<FeedType> feedTypes;
  final List<Nutrisi> nutrisiList;
  final FeedManagementController controller;
  final int userId;
  final VoidCallback onUpdate;
  final Function(String) onError;

  const EditFeedForm({
    super.key,
    required this.feed,
    required this.feedTypes,
    required this.nutrisiList,
    required this.controller,
    required this.userId,
    required this.onUpdate,
    required this.onError,
  });

  @override
  _EditFeedFormState createState() => _EditFeedFormState();
}

class _EditFeedFormState extends State<EditFeedForm> {
  final _formKey = GlobalKey<FormState>();
  int? typeId;
  String name = '';
  String unit = '';
  double minStock = 0.0;
  double price = 0.0;
  List<Map<String, dynamic>> selectedNutrisi = [];
  List<TextEditingController> _amountControllers = [];
  List<int?> _selectedNutrisiIds = [];
  List<bool> _showNutrisiDropdowns = [];
  bool _isSubmitting = false;
  bool _showTypeDropdown = false;

  // Controllers for form fields
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _unitController = TextEditingController();
  final TextEditingController _minStockController = TextEditingController();
  final TextEditingController _priceController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Initialize state asynchronously to prevent UI blocking
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      setState(() {
        typeId = widget.feed.typeId;
        name = widget.feed.name;
        unit = widget.feed.unit;
        minStock = widget.feed.minStock;
        price = widget.feed.price;

        // Set controller values
        _nameController.text = name.trim();
        _unitController.text = unit.trim();
        _minStockController.text = minStock.toStringAsFixed(2).replaceAll(RegExp(r'\.00$'), '');
        _priceController.text = _formatPrice(price.toStringAsFixed(0));

        selectedNutrisi = widget.feed.nutrisiList.isNotEmpty
            ? List.from(widget.feed.nutrisiList.map((n) => {
                  'id': n['id'],
                  'name': n['name'],
                  'unit': n['unit'],
                  'amount': n['amount']?.toDouble() ?? 0.0,
                }).toList())
            : [];
        _amountControllers = selectedNutrisi
            .map((n) => TextEditingController(
                text: n['amount'].toStringAsFixed(2).replaceAll(RegExp(r'\.00$'), '')))
            .toList();
        _selectedNutrisiIds = selectedNutrisi.map((n) => n['id'] as int?).toList();
        _showNutrisiDropdowns = List.generate(selectedNutrisi.length, (_) => false);
      });
      print('Initial Selected Nutrisi: $selectedNutrisi');
      print('Initial Nutrisi List: ${widget.nutrisiList.map((n) => {'id': n.id, 'name': n.name}).toList()}');
    });
  }

  @override
  void dispose() {
    for (var controller in _amountControllers) {
      controller.dispose();
    }
    _nameController.dispose();
    _unitController.dispose();
    _minStockController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<bool> _showSweetAlert({
    required String title,
    required String message,
  }) async {
    return await showDialog<bool>(
          context: context,
          builder: (context) => Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  colors: [Colors.teal.shade50, Colors.white],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.info,
                    color: Colors.teal,
                    size: 40,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 14, color: Colors.black87),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey.shade300,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          "Cancel",
                          style: TextStyle(color: Colors.black87),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          "Confirm",
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ) ??
        false;
  }

  void _addNutrientRow() {
    if (widget.nutrisiList.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Tidak ada nutrisi valid tersedia'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }
    setState(() {
      selectedNutrisi.add({
        'id': null,
        'name': 'Pilih Nutrisi',
        'unit': '',
        'amount': 0.0,
      });
      _selectedNutrisiIds.add(null);
      _amountControllers.add(TextEditingController(text: '0'));
      _showNutrisiDropdowns.add(false);
      print('Added new nutrient row: $selectedNutrisi');
    });
  }

  void _updateNutrientAmount(int index, double amount) {
    setState(() {
      if (index < selectedNutrisi.length) {
        selectedNutrisi[index]['amount'] = amount;
        _amountControllers[index].text = amount.toStringAsFixed(2).replaceAll(RegExp(r'\.00$'), '');
        print('Updated Nutrient Amount at index $index: $amount');
      }
    });
  }

  void _removeNutrient(int index) {
    setState(() {
      if (index < selectedNutrisi.length) {
        selectedNutrisi.removeAt(index);
        _selectedNutrisiIds.removeAt(index);
        _amountControllers[index].dispose();
        _amountControllers.removeAt(index);
        _showNutrisiDropdowns.removeAt(index);
        print('Removed Nutrient at index $index, Selected Nutrisi: $selectedNutrisi');
      }
    });
  }

  String _formatPrice(String value) {
    if (value.isEmpty) return value;
    final cleaned = value.replaceAll('.', '');
    final reversed = cleaned.split('').reversed.join();
    final withDots = reversed.replaceAllMapped(RegExp(r'.{3}'), (match) => '${match.group(0)}.');
    return withDots.split('').reversed.join().replaceFirst(RegExp(r'^\.'), '');
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: Container(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          physics: const ClampingScrollPhysics(),
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 16,
              right: 16,
              top: 16,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Edit Pakan: ${widget.feed.name}",
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.grey),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      child: Column(
                        children: [
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _showTypeDropdown = !_showTypeDropdown;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(8),
                                color: Colors.teal.shade50,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      typeId == null
                                          ? 'Pilih Jenis Pakan'
                                          : widget.feedTypes
                                              .firstWhere((type) => type.id == typeId, orElse: () => FeedType(id: 0, name: 'Tidak Diketahui', createdAt:"", updatedAt:""))
                                              .name,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: typeId == null ? Colors.grey[600] : Colors.black,
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    _showTypeDropdown ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                    color: Colors.teal,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (_showTypeDropdown)
                            Card(
                              elevation: 4,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: Container(
                                constraints: const BoxConstraints(maxHeight: 150),
                                width: double.infinity,
                                child: ListView(
                                  shrinkWrap: true,
                                  children: widget.feedTypes.map((type) {
                                    return ListTile(
                                      title: Text(
                                        type.name,
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                      onTap: () {
                                        setState(() {
                                          typeId = type.id;
                                          _showTypeDropdown = false;
                                        });
                                      },
                                    );
                                  }).toList(),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _nameController,
                    decoration: InputDecoration(
                      labelText: 'Nama Pakan',
                      hintText: 'Masukkan nama pakan',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      prefixIcon: const Icon(Icons.text_fields, color: Colors.teal),
                      filled: true,
                      fillColor: Colors.teal.shade50,
                    ),
                    validator: (value) => value == null || value.trim().isEmpty ? 'Masukkan nama pakan' : null,
                    onChanged: (value) => name = value.trim(),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _unitController,
                    decoration: InputDecoration(
                      labelText: 'Satuan',
                      hintText: 'Masukkan satuan (misal: kg)',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      prefixIcon: const Icon(Icons.scale, color: Colors.teal),
                      filled: true,
                      fillColor: Colors.teal.shade50,
                    ),
                    validator: (value) => value == null || value.trim().isEmpty ? 'Masukkan satuan' : null,
                    onChanged: (value) => unit = value.trim(),
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _minStockController,
                    decoration: InputDecoration(
                      labelText: 'Stok Minimum',
                      hintText: 'Masukkan stok minimum',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      prefixIcon: const Icon(Icons.storage, color: Colors.teal),
                      filled: true,
                      fillColor: Colors.teal.shade50,
                    ),
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}'))],
                    validator: (value) => value == null || double.tryParse(value) == null ? 'Masukkan angka valid' : null,
                    onChanged: (value) => minStock = double.tryParse(value) ?? 0.0,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _priceController,
                    decoration: InputDecoration(
                      labelText: 'Harga',
                      hintText: 'Masukkan harga',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      prefixIcon: const Icon(Icons.monetization_on, color: Colors.teal),
                      prefixText: 'Rp ',
                      filled: true,
                      fillColor: Colors.teal.shade50,
                    ),
                    keyboardType: TextInputType.number,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      TextInputFormatter.withFunction((oldValue, newValue) {
                        final text = _formatPrice(newValue.text);
                        return newValue.copyWith(text: text);
                      }),
                    ],
                    validator: (value) => value == null || double.tryParse(value.replaceAll('.', '')) == null ? 'Masukkan angka valid' : null,
                    onChanged: (value) => price = double.tryParse(value.replaceAll('.', '')) ?? 0.0,
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Pilih Nutrisi',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  const SizedBox(height: 8),
                  _buildNutrientSelector(),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _isSubmitting
                          ? null
                          : () async {
                              if (_formKey.currentState!.validate()) {
                                if (typeId == null) {
                                  widget.onError('Pilih jenis pakan');
                                  return;
                                }
                                if (selectedNutrisi.any((n) => n['id'] == null)) {
                                  widget.onError('Pilih nutrisi untuk semua baris');
                                  return;
                                }
                                // Prepare payload with only changed fields
                                final originalFeed = widget.feed;
                                final payload = <String, dynamic>{};
                                if (typeId != originalFeed.typeId) payload['typeId'] = typeId;
                                if (name.trim() != originalFeed.name.trim()) payload['name'] = name.trim();
                                if (unit.trim() != originalFeed.unit.trim()) payload['unit'] = unit.trim();
                                if (minStock != originalFeed.minStock) payload['minStock'] = minStock;
                                if (price != originalFeed.price) payload['price'] = price;
                                payload['nutrisiList'] = selectedNutrisi
                                    .map((n) => {
                                          'nutrisi_id': n['id'],
                                          'amount': n['amount'],
                                        })
                                    .toList();
                                print('Payload to be sent: $payload');

                                final confirm = await _showSweetAlert(
                                  title: "Edit Pakan",
                                  message: "Apakah Anda yakin ingin mengubah pakan $name?",
                                );
                                if (!confirm) return;
                                setState(() => _isSubmitting = true);
                                try {
                                  final response = await widget.controller.updateFeed(
                                    id: widget.feed.id,
                                    typeId: typeId!,
                                    name: name.trim(),
                                    unit: unit.trim(),
                                    minStock: minStock,
                                    price: price,
                                    userId: widget.userId,
                                    nutrisiList: payload['nutrisiList'],
                                  );
                                  print('Response from updateFeed: $response');
                                  if (!mounted) return;
                                  if (response['success']) {
                                    widget.onUpdate();
                                    Navigator.of(context).pop();
                                  } else {
                                    widget.onError(response['message'] ?? 'Gagal mengedit pakan');
                                  }
                                } catch (e) {
                                  print('Error updating feed: $e');
                                  if (!mounted) return;
                                  widget.onError('Error mengedit pakan: $e');
                                } finally {
                                  if (mounted) {
                                    setState(() => _isSubmitting = false);
                                  }
                                }
                              }
                            },
                      child: _isSubmitting
                          ? const CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            )
                          : const Text(
                              "Simpan",
                              style: TextStyle(color: Colors.white, fontSize: 14),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNutrientSelector() {
    print('Available Nutrisi: ${widget.nutrisiList.map((n) => n.name).toList()}');
    print('Current Selected Nutrisi: ${selectedNutrisi.map((n) => n['name']).toList()}');

    return Column(
      children: [
        ...selectedNutrisi.asMap().entries.map((entry) {
          final index = entry.key;
          final nutrisi = entry.value;
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                if (index < _showNutrisiDropdowns.length) {
                                  _showNutrisiDropdowns[index] = !_showNutrisiDropdowns[index];
                                }
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(8),
                                color: Colors.teal.shade50,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      nutrisi['id'] == null ? 'Pilih Nutrisi' : nutrisi['name'],
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: nutrisi['id'] == null ? Colors.grey[600] : Colors.black,
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    index < _showNutrisiDropdowns.length && _showNutrisiDropdowns[index]
                                        ? Icons.keyboard_arrow_up
                                        : Icons.keyboard_arrow_down,
                                    color: Colors.teal,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 1,
                      child: TextFormField(
                        controller: _amountControllers[index],
                        keyboardType: TextInputType.number,
                        inputFormatters: [
                          FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
                        ],
                        decoration: InputDecoration(
                          labelText: 'Jumlah',
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                          suffixText: nutrisi['unit'] ?? '',
                          filled: true,
                          fillColor: Colors.teal.shade50,
                        ),
                        onTap: () {
                          if (_amountControllers[index].text == '0') {
                            _amountControllers[index].clear();
                          }
                        },
                        onChanged: (value) => _updateNutrientAmount(
                            index, double.tryParse(value.isEmpty ? '0' : value) ?? 0.0),
                        validator: (value) => value == null || double.tryParse(value) == null ? 'Masukkan jumlah valid' : null,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _removeNutrient(index),
                    ),
                  ],
                ),
              ),
              if (index < _showNutrisiDropdowns.length && _showNutrisiDropdowns[index])
                Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  child: Container(
                    constraints: const BoxConstraints(maxHeight: 150),
                    width: double.infinity,
                    child: ListView(
                      shrinkWrap: true,
                      children: widget.nutrisiList
                          .asMap()
                          .entries
                          .where((entry) =>
                              !_selectedNutrisiIds.contains(entry.value.id) ||
                              _selectedNutrisiIds[index] == entry.value.id)
                          .map((entry) {
                        final nutrisiItem = entry.value;
                        return ListTile(
                          title: Text(
                            nutrisiItem.name,
                            style: const TextStyle(fontSize: 12),
                          ),
                          onTap: () {
                            setState(() {
                              selectedNutrisi[index] = {
                                'id': nutrisiItem.id,
                                'name': nutrisiItem.name,
                                'unit': nutrisiItem.unit,
                                'amount': double.tryParse(_amountControllers[index].text) ?? 0.0,
                              };
                              _selectedNutrisiIds[index] = nutrisiItem.id;
                              _showNutrisiDropdowns[index] = false;
                              print('Selected Nutrisi at index $index: ${selectedNutrisi[index]}');
                            });
                          },
                        );
                      }).toList(),
                    ),
                  ),
                ),
            ],
          );
        }),
        TextButton.icon(
          onPressed: widget.nutrisiList.isEmpty ? null : _addNutrientRow,
          icon: const Icon(Icons.add, color: Colors.teal),
          label: const Text('Tambah Nutrisi', style: TextStyle(color: Colors.teal)),
        ),
      ],
    );
  }
}