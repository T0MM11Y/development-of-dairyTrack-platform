import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:dairy_track/config/api/pakan/nutrition.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedNutrition.dart';
import 'package:dairy_track/model/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/nutrition.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

class AddFeedPage extends StatefulWidget {
  const AddFeedPage({Key? key}) : super(key: key);

  @override
  _AddFeedPageState createState() => _AddFeedPageState();
}

class _AddFeedPageState extends State<AddFeedPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _minStockController = TextEditingController();
  final _priceController = TextEditingController();

  // Nutrisi variables
  final _amountController = TextEditingController();
  int? _selectedNutrisiId;
  String? _amountError;

  int? _selectedTypeId;
  List<FeedNutrisi> _nutrisiList = [];
  List<Nutrisi> _nutrisiOptions = [];
  bool _isLoading = false;
  bool _isLoadingNutrisi = true;

  @override
  void initState() {
    super.initState();
    _loadNutrisiOptions();
  }

  Future<void> _loadNutrisiOptions() async {
    try {
      setState(() {
        _isLoadingNutrisi = true;
      });

      final nutrisiData = await getAllNutrisi();

      setState(() {
        _nutrisiOptions = nutrisiData;
        _isLoadingNutrisi = false;
      });
    } catch (e) {
      print('Error loading nutrisi options: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat data nutrisi: $e')),
      );
      setState(() {
        _isLoadingNutrisi = false;
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _minStockController.dispose();
    _priceController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  Future<void> _saveFeed() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedTypeId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pilih jenis pakan terlebih dahulu')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      print(
          'Sending feed data: typeId=$_selectedTypeId, name=${_nameController.text}, minStock=${int.parse(_minStockController.text)}, price=${double.parse(_priceController.text.replaceAll('.', ''))}');

      if (_nutrisiList.isNotEmpty) {
        print(
            'With nutrients: ${_nutrisiList.map((n) => '${n.nutrisiId}:${n.amount}').join(', ')}');
      }

      // Prepare nutrisi data for API
      final apiNutrisiList = _nutrisiList
          .map((item) => {
                'nutrisi_id': item.nutrisiId,
                'amount': item.amount,
              })
          .toList();

      final newFeed = await createFeed(
        typeId: _selectedTypeId!,
        name: _nameController.text,
        minStock: int.parse(_minStockController.text),
        price: double.parse(_priceController.text.replaceAll('.', '')),
        nutrisiList: _nutrisiList, // Ensure this is List<FeedNutrisi>
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pakan berhasil ditambahkan')),
      );

      Navigator.pop(context, true);
    } catch (e) {
      print('Error saving feed: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal menambahkan pakan: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _addNutrisi() {
    if (_selectedNutrisiId == null) {
      setState(() {
        _amountError = 'Pilih nutrisi terlebih dahulu';
      });
      return;
    }

    final amountText = _amountController.text.trim();
    final amount = double.tryParse(amountText);

    if (amount == null || amount <= 0) {
      setState(() {
        _amountError = 'Masukkan jumlah yang valid';
      });
      return;
    }

    // Check if nutrisi already exists in the list
    if (_nutrisiList.any((n) => n.nutrisiId == _selectedNutrisiId)) {
      setState(() {
        _amountError = 'Nutrisi ini sudah ditambahkan';
      });
      return;
    }

    final nutrisi = _nutrisiOptions.firstWhere(
      (n) => n.id == _selectedNutrisiId,
      orElse: () => Nutrisi(id: _selectedNutrisiId!, name: 'Unknown'),
    );

    setState(() {
      _nutrisiList.add(FeedNutrisi(
        feedId: 0,
        nutrisiId: _selectedNutrisiId!,
        amount: amount,
        nutrisi: nutrisi,
      ));
      _amountController.clear();
      _selectedNutrisiId = null;
      _amountError = null;
    });
  }

  void _removeNutrisi(int index) {
    setState(() {
      _nutrisiList.removeAt(index);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Pakan Baru'),
        backgroundColor: const Color(0xFF5D90E7),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Card(
                      elevation: 2,
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Informasi Pakan',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 16),
                            FutureBuilder<List<FeedType>>(
                              future: getAllFeedTypes(),
                              builder: (context, snapshot) {
                                if (snapshot.connectionState ==
                                    ConnectionState.waiting) {
                                  return const Center(
                                      child: CircularProgressIndicator());
                                } else if (snapshot.hasError) {
                                  print(
                                      'Error loading feed types: ${snapshot.error}');
                                  return Text(
                                      'Gagal memuat jenis pakan: ${snapshot.error}');
                                } else if (!snapshot.hasData ||
                                    snapshot.data!.isEmpty) {
                                  return const Text(
                                      'Tidak ada jenis pakan tersedia');
                                }

                                final feedTypes = snapshot.data!;
                                if (_selectedTypeId == null &&
                                    feedTypes.isNotEmpty) {
                                  _selectedTypeId = feedTypes.first.id;
                                }

                                return DropdownButtonFormField<int>(
                                  decoration: const InputDecoration(
                                    labelText: 'Jenis Pakan',
                                    border: OutlineInputBorder(),
                                    prefixIcon: Icon(Icons.category),
                                  ),
                                  value: _selectedTypeId,
                                  items: feedTypes.map((type) {
                                    return DropdownMenuItem<int>(
                                      value: type.id,
                                      child: Text(type.name),
                                    );
                                  }).toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      _selectedTypeId = value;
                                    });
                                  },
                                  validator: (value) {
                                    if (value == null) {
                                      return 'Pilih jenis pakan';
                                    }
                                    return null;
                                  },
                                );
                              },
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _nameController,
                              decoration: const InputDecoration(
                                labelText: 'Nama Pakan',
                                border: OutlineInputBorder(),
                                prefixIcon: Icon(Icons.food_bank),
                              ),
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Nama pakan tidak boleh kosong';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _minStockController,
                              decoration: const InputDecoration(
                                labelText: 'Stok Minimum',
                                border: OutlineInputBorder(),
                                prefixIcon: Icon(Icons.inventory),
                                suffixText: 'kg',
                              ),
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly
                              ],
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Stok minimum tidak boleh kosong';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                            TextFormField(
                              controller: _priceController,
                              decoration: const InputDecoration(
                                labelText: 'Harga Per Kg',
                                border: OutlineInputBorder(),
                                prefixIcon: Icon(Icons.attach_money),
                                prefixText: 'Rp ',
                              ),
                              keyboardType: TextInputType.number,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                TextInputFormatter.withFunction(
                                    (oldValue, newValue) {
                                  if (newValue.text.isEmpty) {
                                    return newValue;
                                  }
                                  final number = int.parse(newValue.text);
                                  final formattedText =
                                      NumberFormat("#,###", "id_ID")
                                          .format(number)
                                          .replaceAll(',', '.');
                                  return TextEditingValue(
                                    text: formattedText,
                                    selection: TextSelection.collapsed(
                                      offset: formattedText.length,
                                    ),
                                  );
                                }),
                              ],
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Harga tidak boleh kosong';
                                }
                                return null;
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                    Card(
                      elevation: 2,
                      margin: const EdgeInsets.only(bottom: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text(
                                  'Kandungan Nutrisi',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),

                            // Nutrisi form integrated directly into the page
                            _isLoadingNutrisi
                                ? const Center(
                                    child: CircularProgressIndicator())
                                : Column(
                                    children: [
                                      Row(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          // Kolom Kiri: Dropdown Nutrisi
                                          Expanded(
                                            child: DropdownButtonFormField<int>(
                                              decoration: const InputDecoration(
                                                labelText: 'Nutrisi',
                                                border: OutlineInputBorder(),
                                              ),
                                              value: _selectedNutrisiId,
                                              items: _nutrisiOptions
                                                  .where((n) => n.id != null)
                                                  .map((nutrisi) {
                                                return DropdownMenuItem<int>(
                                                  value: nutrisi.id,
                                                  child: Text(nutrisi.name),
                                                );
                                              }).toList(),
                                              onChanged: (value) {
                                                setState(() {
                                                  _selectedNutrisiId = value;
                                                  _amountError = null;
                                                });
                                              },
                                            ),
                                          ),
                                          const SizedBox(width: 16),
                                          // Kolom Kanan: Input Jumlah
                                          Expanded(
                                            child: TextFormField(
                                              controller: _amountController,
                                              decoration: InputDecoration(
                                                labelText: 'Jumlah',
                                                border:
                                                    const OutlineInputBorder(),
                                                suffixText: 'gram',
                                                errorText: _amountError,
                                              ),
                                              keyboardType:
                                                  TextInputType.number,
                                              inputFormatters: [
                                                FilteringTextInputFormatter
                                                    .allow(
                                                        RegExp(r'^\d*.?\d*$')),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 16),
                                      // Tombol Tambah
                                      Align(
                                        alignment: Alignment.centerRight,
                                        child: ElevatedButton(
                                          onPressed: _addNutrisi,
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: Colors.green,
                                            foregroundColor: Colors.white,
                                          ),
                                          child: const Text('Tambah Nutrisi'),
                                        ),
                                      ),
                                    ],
                                  ),

                            const SizedBox(height: 16),
                            // Daftar Nutrisi
                            if (_nutrisiList.isEmpty)
                              const Center(
                                child: Padding(
                                  padding: EdgeInsets.all(16.0),
                                  child: Text(
                                    'Belum ada nutrisi yang ditambahkan',
                                    style: TextStyle(
                                      color: Colors.grey,
                                      fontStyle: FontStyle.italic,
                                    ),
                                  ),
                                ),
                              )
                            else
                              ListView.builder(
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _nutrisiList.length,
                                itemBuilder: (context, index) {
                                  final nutrisi = _nutrisiList[index];
                                  return Card(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    color: Colors.grey[50],
                                    child: ListTile(
                                      title: Text(
                                        nutrisi.nutrisi?.name ??
                                            'Nutrisi #${index + 1}',
                                        style: const TextStyle(
                                            fontWeight: FontWeight.bold),
                                      ),
                                      subtitle: Text(
                                          'Jumlah: ${nutrisi.amount} gram'),
                                      trailing: IconButton(
                                        icon: const Icon(Icons.delete,
                                            color: Colors.red),
                                        onPressed: () => _removeNutrisi(index),
                                      ),
                                    ),
                                  );
                                },
                              ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _saveFeed,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF1565C0),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'Simpan Pakan',
                          style: TextStyle(fontSize: 16),
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

// Updated createFeed function
