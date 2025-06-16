import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../model/feed.dart';
import '../model/feedType.dart';
import '../model/nutrition.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedController.dart';

class AddFeedForm extends StatefulWidget {
  final List<FeedType> feedTypes;
  final List<Nutrisi> nutrisiList;
  final FeedManagementController controller;
  final int userId;
  final VoidCallback onAdd;
  final Function(String) onError;

  const AddFeedForm({
    super.key,
    required this.feedTypes,
    required this.nutrisiList,
    required this.controller,
    required this.userId,
    required this.onAdd,
    required this.onError,
  });

  @override
  _AddFeedFormState createState() => _AddFeedFormState();
}

class _AddFeedFormState extends State<AddFeedForm> {
  final _formKey = GlobalKey<FormState>();
  int? typeId;
  String name = '';
  String unit = '';
  double minStock = 0.0;
  double price = 0.0;
  List<Map<String, dynamic>> selectedNutrisi = [];
  List<TextEditingController> _amountControllers = [];
  List<int?> _selectedNutrisiIds = [];
  bool _isSubmitting = false;
  bool _showTypeDropdown = false;
  List<bool> _showNutrisiDropdowns = [];
  final TextEditingController _priceController = TextEditingController();

  @override
  void initState() {
    super.initState();
    print('Initial Nutrisi List: ${widget.nutrisiList.map((n) => {'id': n.id, 'name': n.name}).toList()}');
  }

  @override
  void dispose() {
    for (var controller in _amountControllers) {
      controller.dispose();
    }
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
    ) ?? false;
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
        'id': 0,
        'name': 'Pilih Nutrisi',
        'unit': '',
        'amount': 0.0,
      });
      _selectedNutrisiIds.add(null);
      _amountControllers.add(TextEditingController(text: '0'));
      _showNutrisiDropdowns.add(false);
    });
  }

  void _updateNutrientAmount(int index, double amount) {
    setState(() {
      selectedNutrisi[index]['amount'] = amount;
      print('Updated Nutrient Amount at index $index: $amount');
    });
  }

  void _removeNutrient(int index) {
    setState(() {
      selectedNutrisi.removeAt(index);
      _selectedNutrisiIds.removeAt(index);
      _amountControllers[index].dispose();
      _amountControllers.removeAt(index);
      _showNutrisiDropdowns.removeAt(index);
      print('Removed Nutrient at index $index, Selected Nutrisi: $selectedNutrisi');
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
    return Container(
      width: MediaQuery.of(context).size.width,
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
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
                    const Text(
                      "Tambah Pakan Baru",
                      style: TextStyle(
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
                                        : widget.feedTypes.firstWhere((type) => type.id == typeId).name,
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
                  decoration: InputDecoration(
                    labelText: 'Nama Pakan',
                    hintText: 'Masukkan nama pakan',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.text_fields, color: Colors.teal),
                    filled: true,
                    fillColor: Colors.teal.shade50,
                  ),
                  validator: (value) => value == null || value.isEmpty ? 'Masukkan nama pakan' : null,
                  onChanged: (value) => name = value,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Satuan',
                    hintText: 'Masukkan satuan (misal: kg)',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.scale, color: Colors.teal),
                    filled: true,
                    fillColor: Colors.teal.shade50,
                  ),
                  validator: (value) => value == null || value.isEmpty ? 'Masukkan satuan' : null,
                  onChanged: (value) => unit = value,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Stok Minimum',
                    hintText: 'Masukkan stok minimum',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    prefixIcon: const Icon(Icons.storage, color: Colors.teal),
                    filled: true,
                    fillColor: Colors.teal.shade50,
                  ),
                  keyboardType: TextInputType.number,
                  inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}'))],
                  validator: (value) =>
                      value == null || double.tryParse(value) == null ? 'Masukkan angka valid' : null,
                  onChanged: (value) => minStock = double.tryParse(value) ?? 0.0,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _priceController,
                  decoration: InputDecoration(
                    labelText: 'Harga',
                    hintText: 'Masukkan harga',
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
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
                  validator: (value) =>
                      value == null || double.tryParse(value.replaceAll('.', '')) == null
                          ? 'Masukkan angka valid'
                          : null,
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
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: _isSubmitting
                        ? null
                        : () async {
                            if (_formKey.currentState!.validate()) {
                              if (selectedNutrisi.any((n) => n['id'] == 0)) {
                                widget.onError('Pilih nutrisi untuk semua baris');
                                return;
                              }
                              final confirm = await _showSweetAlert(
                                title: "Tambah Pakan",
                                message: "Apakah Anda yakin ingin menambah pakan $name?",
                              );
                              if (!confirm) return;
                              setState(() => _isSubmitting = true);
                              try {
                                final response = await widget.controller.createFeed(
                                  typeId: typeId!,
                                  name: name,
                                  unit: unit,
                                  minStock: minStock,
                                  price: price,
                                  userId: widget.userId,
                                  nutrisiList: selectedNutrisi
                                      .map((n) => {
                                            'nutrisi_id': n['id'],
                                            'amount': n['amount'],
                                          })
                                      .toList(),
                                );
                                if (!mounted) return;
                                if (response['success']) {
                                  widget.onAdd();
                                  Navigator.of(context).pop();
                                } else {
                                  widget.onError(response['message'] ?? 'Gagal menambah pakan');
                                }
                              } catch (e) {
                                if (!mounted) return;
                                widget.onError('Error menambah pakan: $e');
                              } finally {
                                if (mounted) setState(() => _isSubmitting = false);
                              }
                            }
                          },
                    child: _isSubmitting
                        ? const CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          )
                        : const Text(
                            "Tambah",
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
                                _showNutrisiDropdowns[index] = !_showNutrisiDropdowns[index];
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
                                      nutrisi['id'] == 0
                                          ? 'Pilih Nutrisi'
                                          : nutrisi['name'],
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: nutrisi['id'] == 0 ? Colors.grey[600] : Colors.black,
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    _showNutrisiDropdowns[index]
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
                        inputFormatters: ([
                          FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d{0,2}')),
                        ]),
                        decoration: InputDecoration(
                          labelText: 'Jumlah',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                          suffixText: nutrisi['unit'],
                          filled: true,
                          fillColor: Colors.teal.shade50,
                        ),
                        onTap: () {
                          if (_amountControllers[index].text == '0') {
                            _amountControllers[index].clear();
                          }
                        },
                        onChanged: (value) =>
                            _updateNutrientAmount(index, double.tryParse(value.isEmpty ? '0' : value) ?? 0.0),
                        validator: (value) =>
                            value == null || double.tryParse(value) == null ? 'Masukkan jumlah valid' : null,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.remove_circle, color: Colors.red),
                      onPressed: () => _removeNutrient(index),
                    ),
                  ],
                ),
              ),
              if (_showNutrisiDropdowns[index])
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