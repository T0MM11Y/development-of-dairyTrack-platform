import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:dairy_track/config/api/pakan/nutrition.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/feedNutrition.dart';
import 'package:dairy_track/model/pakan/nutrition.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

class EditFeedPage extends StatefulWidget {
  final Feed feed;

  const EditFeedPage({super.key, required this.feed});

  @override
  _EditFeedPageState createState() => _EditFeedPageState();
}

class _EditFeedPageState extends State<EditFeedPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _minStockController = TextEditingController();
  final _priceController = TextEditingController();
  final _feedTypeController = TextEditingController();
  final _formatCurrency = NumberFormat('#,###', 'id');
  FeedType? _selectedFeedType;
  List<FeedNutrisi> _nutrisiList = [];
  List<Nutrisi> _nutritions = [];
  List<TextEditingController> _amountControllers = [];
  List<TextEditingController> _nutrisiControllers = [];

  List<FeedType> _feedTypes = [];
  bool _isLoading = true;
  String? _loadError;
  bool _isFeedValid = true;

  @override
  void initState() {
    super.initState();
    // Validate feed ID
    if (widget.feed.id == null) {
      _isFeedValid = false;
      _loadError = 'ID pakan tidak valid';
      _isLoading = false;
    } else {
      // Pre-populate form fields
      _nameController.text = widget.feed.name;
      _minStockController.text = widget.feed.minStock?.toString() ?? '0';
      if (widget.feed.price != null) {
        _priceController.text = _formatPrice(widget.feed.price!);
      }
      _selectedFeedType = widget.feed.feedType;
      if (_selectedFeedType != null) {
        _feedTypeController.text = _selectedFeedType!.name;
      }
      // Create a deep copy of feedNutrisiRecords to avoid modifying original
      _nutrisiList = (widget.feed.feedNutrisiRecords ?? [])
          .map((n) => FeedNutrisi(
                feedId: n.feedId,
                nutrisiId: n.nutrisiId,
                amount: n.amount,
              ))
          .toList();
      // Initialize amount and nutrisi controllers
      _amountControllers = _nutrisiList
          .map((n) => TextEditingController(text: _formatNumber(n.amount)))
          .toList();
      _nutrisiControllers = _nutrisiList
          .map((n) => TextEditingController(text: _getNutrisiName(n.nutrisiId)))
          .toList();
      _loadFeedTypes();
      _loadNutritions();
    }
  }

  Future<void> _loadFeedTypes() async {
    try {
      setState(() {
        _isLoading = true;
        _loadError = null;
      });
      final feedTypes = await getAllFeedTypes();
      final uniqueFeedTypes = <FeedType>{...feedTypes}.toList();
      setState(() {
        _feedTypes = uniqueFeedTypes;
        _isLoading = false;
        if (_selectedFeedType != null &&
            !_feedTypes.any((ft) => ft.id == _selectedFeedType!.id)) {
          _selectedFeedType = null;
          _feedTypeController.text = '';
        }
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _loadError = 'Gagal memuat jenis pakan: $e';
      });
    }
  }

  Future<void> _loadNutritions() async {
    try {
      final nutritions = await getAllNutrisi();
      print('Raw nutritions data: $nutritions');
      setState(() {
        // Filter out nutritions with null or invalid IDs or names
        _nutritions = nutritions
            .where((n) => n.id != null && n.id! > 0 && n.name != null && n.name!.isNotEmpty)
            .toList();
        print('Filtered nutritions: ${_nutritions.map((n) => 'ID: ${n.id}, Name: ${n.name}').toList()}');
        // Update controllers with correct names
        for (int i = 0; i < _nutrisiList.length; i++) {
          _nutrisiControllers[i].text = _getNutrisiName(_nutrisiList[i].nutrisiId);
        }
      });
    } catch (e) {
      print('Error loading nutritions: $e');
      setState(() {
        _loadError = 'Gagal memuat nutrisi: $e';
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _minStockController.dispose();
    _priceController.dispose();
    _feedTypeController.dispose();
    for (var controller in _amountControllers) {
      controller.dispose();
    }
    for (var controller in _nutrisiControllers) {
      controller.dispose();
    }
    super.dispose();
  }

  String _formatPrice(double price) {
    String formatted = price.toStringAsFixed(0); // Whole numbers only
    return _formatCurrency.format(int.parse(formatted));
  }

  String _digitsOnly(String text) {
    return text.replaceAll(RegExp(r'[^\d]'), '');
  }

  String _formatNumber(double number) {
    // Remove trailing zeros and decimal point if unnecessary
    String formatted = number.toString();
    if (formatted.contains('.')) {
      formatted = formatted.replaceAll(RegExp(r'0+$'), '');
      formatted = formatted.replaceAll(RegExp(r'\.$'), '');
    }
    return formatted.isEmpty ? '0' : formatted;
  }

  String _getNutrisiName(int nutrisiId) {
    if (nutrisiId == 0) return 'Pilih Nutrisi';
    final nutrisi = _nutritions.firstWhere(
      (n) => n.id == nutrisiId,
      orElse: () => Nutrisi(id: nutrisiId, name: 'Nutrisi Tidak Diketahui ($nutrisiId)'),
    );
    return nutrisi.name ?? 'Nutrisi #${nutrisiId}';
  }

  void _showFeedTypeDropdown(BuildContext context) {
    final RenderBox box = context.findRenderObject() as RenderBox;
    final Offset offset = box.localToGlobal(Offset.zero);
    double left = 16.0;
    double top = offset.dy + box.size.height;
    double width = box.size.width - 32.0;

    showMenu<FeedType>(
      context: context,
      position: RelativeRect.fromLTRB(left, top, left + 16, 0),
      items: _feedTypes.asMap().entries.map((entry) {
        final index = entry.key;
        final feedType = entry.value;
        final bool useGrayBackground = index % 2 == 1;
        return PopupMenuItem<FeedType>(
          value: feedType,
          child: Container(
            width: width,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: useGrayBackground ? Colors.grey[100] : Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                feedType.name,
                style: TextStyle(
                  color: Colors.black87,
                  fontWeight: _selectedFeedType?.id == feedType.id
                      ? FontWeight.bold
                      : FontWeight.normal,
                ),
              ),
            ),
          ),
        );
      }).toList(),
    ).then((selectedValue) {
      if (selectedValue != null) {
        setState(() {
          _selectedFeedType = selectedValue;
          _feedTypeController.text = selectedValue.name;
        });
      }
    });
  }

  void _showNutrisiDropdown(BuildContext context, int index) {
    final RenderBox box = context.findRenderObject() as RenderBox;
    final Offset offset = box.localToGlobal(Offset.zero);
    double left = offset.dx + 16.0;
    double top = offset.dy + box.size.height; // Position below the field
    double width = box.size.width - 32.0;

    // Filter out already selected nutrisiIds (except for the current index)
    final selectedNutrisiIds = _nutrisiList
        .asMap()
        .entries
        .where((entry) => entry.key != index)
        .map((entry) => entry.value.nutrisiId)
        .toSet();
    final availableNutritions =
        _nutritions.where((n) => !selectedNutrisiIds.contains(n.id)).toList();

    print('Showing dropdown for index $index at position (left: $left, top: $top)');

    showMenu<Nutrisi>(
      context: context,
      position: RelativeRect.fromLTRB(left, top, left + 16, 0),
      items: [
        PopupMenuItem<Nutrisi>(
          value: Nutrisi(id: 0, name: 'Pilih Nutrisi'),
          child: Container(
            width: width,
            padding: const EdgeInsets.symmetric(vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Text(
                'Pilih Nutrisi',
                style: TextStyle(
                  color: Colors.grey,
                  fontWeight: _nutrisiList[index].nutrisiId == 0
                      ? FontWeight.bold
                      : FontWeight.normal,
                ),
              ),
            ),
          ),
        ),
        ...availableNutritions.asMap().entries.map((entry) {
          final menuIndex = entry.key + 1; // Offset by 1 for 'Pilih Nutrisi'
          final nutrisi = entry.value;
          final bool useGrayBackground = menuIndex % 2 == 1;
          return PopupMenuItem<Nutrisi>(
            value: nutrisi,
            child: Container(
              width: width,
              padding: const EdgeInsets.symmetric(vertical: 8),
              decoration: BoxDecoration(
                color: useGrayBackground ? Colors.grey[100] : Colors.white,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8.0),
                child: Text(
                  nutrisi.name ?? 'Nutrisi #${nutrisi.id}',
                  style: TextStyle(
                    color: Colors.black87,
                    fontWeight: _nutrisiList[index].nutrisiId == nutrisi.id
                        ? FontWeight.bold
                        : FontWeight.normal,
                  ),
                ),
              ),
            ),
          );
        }),
      ],
    ).then((selectedValue) {
      if (selectedValue != null) {
        setState(() {
          _nutrisiList[index] = FeedNutrisi(
            feedId: widget.feed.id!,
            nutrisiId: selectedValue.id!,
            amount: double.tryParse(_amountControllers[index].text) ?? 0.0,
          );
          _nutrisiControllers[index].text =
              selectedValue.id == 0 ? 'Pilih Nutrisi' : _getNutrisiName(selectedValue.id!);
          print('Selected nutrisi for index $index: ${selectedValue.name} (ID: ${selectedValue.id})');
        });
      }
    });
  }

  void _addNutritionRow() {
    if (_nutritions.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tidak ada nutrisi valid tersedia'),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }
    setState(() {
      _nutrisiList.add(FeedNutrisi(
        feedId: widget.feed.id!,
        nutrisiId: 0, // Placeholder ID for 'Pilih Nutrisi'
        amount: 0.0,
      ));
      _amountControllers.add(TextEditingController(text: '0'));
      _nutrisiControllers.add(TextEditingController(text: 'Pilih Nutrisi'));
    });
  }

  void _removeNutritionRow(int index) {
    setState(() {
      _nutrisiList.removeAt(index);
      _amountControllers[index].dispose();
      _amountControllers.removeAt(index);
      _nutrisiControllers[index].dispose();
      _nutrisiControllers.removeAt(index);
    });
  }

  Future<void> _showConfirmationDialog() async {
    if (!_formKey.currentState!.validate()) return;

    final priceText = _digitsOnly(_priceController.text);
    final price = priceText.isNotEmpty ? double.tryParse(priceText) : null;

    final updatedFeed = {
      'name': _nameController.text.trim(),
      'typeId': _selectedFeedType?.id,
      'minStock': int.tryParse(_minStockController.text) ?? 0,
      'price': price,
      'nutrisiList': _nutrisiList
          .map((n) => {
                'nutrisi_id': n.nutrisiId,
                'amount': n.amount,
              })
          .toList(),
    };

    final changes = <Map<String, dynamic>>[];
    if (updatedFeed['name'] != widget.feed.name) {
      changes.add({
        'field': 'Nama Pakan',
        'old': widget.feed.name,
        'new': updatedFeed['name'],
      });
    }
    if (updatedFeed['typeId'] != widget.feed.typeId) {
      changes.add({
        'field': 'Jenis Pakan',
        'old': widget.feed.feedType?.name ?? 'Tidak ada',
        'new': _selectedFeedType?.name ?? 'Tidak ada',
      });
    }
    if (updatedFeed['minStock'] != widget.feed.minStock) {
      changes.add({
        'field': 'Stok Minimum',
        'old': '${widget.feed.minStock ?? 0}',
        'new': '${updatedFeed['minStock']}',
      });
    }
    if (updatedFeed['price'] != widget.feed.price) {
      changes.add({
        'field': 'Harga',
        'old': widget.feed.price != null
            ? 'Rp ${_formatPrice(widget.feed.price!)},-'
            : 'Tidak ada',
        'new': updatedFeed['price'] != null
            ? 'Rp ${_formatPrice(updatedFeed['price']! as double)},-'
            : 'Tidak ada',
      });
    }

    // Detect specific nutrition changes
    final originalNutrisiList = widget.feed.feedNutrisiRecords ?? [];
    final nutrisiChanges = <String, String>{};

    // Map nutritions by nutrisiId for comparison
    final originalMap = {
      for (var n in originalNutrisiList) n.nutrisiId: n.amount,
    };
    final updatedMap = {
      for (var n in _nutrisiList) n.nutrisiId: n.amount,
    };

    // Find added and modified nutritions
    for (var entry in updatedMap.entries) {
      final nutrisiId = entry.key;
      final newAmount = entry.value;
      final oldAmount = originalMap[nutrisiId];
      final nutrisiName = _getNutrisiName(nutrisiId);
      if (nutrisiId == 0) continue; // Skip placeholder
      if (oldAmount == null) {
        nutrisiChanges['Ditambahkan'] =
            '${nutrisiChanges['Ditambahkan'] ?? ''}$nutrisiName: ${_formatNumber(newAmount)}; ';
      } else if ((newAmount - oldAmount).abs() > 0.0001) {
        nutrisiChanges['Diubah'] =
            '${nutrisiChanges['Diubah'] ?? ''}$nutrisiName: ${_formatNumber(oldAmount)} → ${_formatNumber(newAmount)}; ';
      }
    }

    // Find removed nutritions
    for (var entry in originalMap.entries) {
      final nutrisiId = entry.key;
      final oldAmount = entry.value;
      if (!updatedMap.containsKey(nutrisiId)) {
        final nutrisiName = _getNutrisiName(nutrisiId);
        nutrisiChanges['Dihapus'] =
            '${nutrisiChanges['Dihapus'] ?? ''}$nutrisiName: ${_formatNumber(oldAmount)}; ';
      }
    }

    // Add nutrition changes to dialog
    if (nutrisiChanges.isNotEmpty) {
      String changeDescription = '';
      if (nutrisiChanges.containsKey('Ditambahkan')) {
        changeDescription += 'Ditambahkan: ${nutrisiChanges['Ditambahkan']!.trim().replaceAll(RegExp(r';$'), '')}\n';
      }
      if (nutrisiChanges.containsKey('Diubah')) {
        changeDescription += 'Diubah: ${nutrisiChanges['Diubah']!.trim().replaceAll(RegExp(r';$'), '')}\n';
      }
      if (nutrisiChanges.containsKey('Dihapus')) {
        changeDescription += 'Dihapus: ${nutrisiChanges['Dihapus']!.trim().replaceAll(RegExp(r';$'), '')}\n';
      }
      changes.add({
        'field': 'Nutrisi',
        'old': '',
        'new': changeDescription.trim(),
      });
    }

    if (changes.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Tidak ada perubahan yang dilakukan')),
        );
      }
      return;
    }

    final bool? confirm = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.edit, color: Colors.orange),
            SizedBox(width: 10),
            Text('Konfirmasi Perubahan'),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Apakah Anda yakin ingin menyimpan perubahan berikut?',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              ...changes.map((change) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          change['field'],
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                        if (change['old'].isNotEmpty)
                          Row(
                            children: [
                              const Icon(Icons.arrow_back, size: 16, color: Colors.red),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  '${change['old']}',
                                  style: const TextStyle(
                                    color: Colors.red,
                                    decoration: TextDecoration.lineThrough,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        Row(
                          children: [
                            const Icon(
                                Icons.arrow_forward, size: 16, color: Colors.green),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                '${change['new']}',
                                style: const TextStyle(
                                  color: Colors.green,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  )),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('BATAL', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[700],
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: const Text('SIMPAN'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await _updateFeed();
    }
  }

  Future<void> _updateFeed() async {
    try {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Menyimpan...')),
        );
      }
      final priceText = _digitsOnly(_priceController.text);
      final price = priceText.isNotEmpty ? double.parse(priceText) : null;

      // Validate no placeholder nutrisiIds
      if (_nutrisiList.any((n) => n.nutrisiId == 0)) {
        throw Exception('Pilih nutrisi untuk semua baris');
      }

      final feed = await updateFeed(
        id: widget.feed.id!,
        typeId: _selectedFeedType?.id,
        name: _nameController.text.trim(),
        minStock: int.parse(_minStockController.text),
        price: price,
        nutrisiList: _nutrisiList.isNotEmpty ? _nutrisiList : null,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Pakan berhasil diperbarui'),
            backgroundColor: Colors.green,
          ),
        );
      }
      if (mounted) {
        Navigator.pop(context, feed);
      }
    } catch (e) {
      String errorMessage = 'Gagal memperbarui pakan: $e';
      if (e.toString().contains('not found')) {
        errorMessage = 'Salah satu nutrisi tidak ditemukan';
      } else if (e.toString().contains('sudah ada')) {
        errorMessage = 'Nama pakan sudah digunakan';
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Widget _buildLoadingView() {
    return const Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(width: 16),
          Text('Memuat data...'),
        ],
      ),
    );
  }

  Widget _buildErrorView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 48),
          const SizedBox(height: 16),
          Text(
            _loadError ?? 'Unknown error',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.red),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _isFeedValid ? _loadFeedTypes : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[700],
              foregroundColor: Colors.white,
            ),
            child: const Text('Coba Lagi'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Kembali'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.info_outline, color: Colors.grey, size: 48),
          const SizedBox(height: 16),
          const Text('Tidak ada jenis pakan tersedia.', textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadFeedTypes,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue[700],
              foregroundColor: Colors.white,
            ),
            child: const Text('Coba Lagi'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Kembali'),
          ),
        ],
      ),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Nama Pakan',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                prefixIcon: const Icon(Icons.feed),
                filled: true,
                fillColor: Colors.white,
              ),
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Nama tidak boleh kosong';
                }
                if (value.trim().length < 3) {
                  return 'Nama harus minimal 3 karakter';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _feedTypeController,
              readOnly: true,
              decoration: InputDecoration(
                labelText: 'Jenis Pakan',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                prefixIcon: const Icon(Icons.category),
                suffixIcon: const Icon(Icons.arrow_drop_down),
                filled: true,
                fillColor: Colors.white,
              ),
              onTap: () => _showFeedTypeDropdown(context),
              validator: (value) =>
                  _selectedFeedType == null ? 'Pilih jenis pakan' : null,
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _minStockController,
              decoration: InputDecoration(
                labelText: 'Stok Minimum',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                prefixIcon: const Icon(Icons.inventory),
                filled: true,
                fillColor: Colors.white,
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Stok minimum tidak boleh kosong';
                }
                final numValue = int.tryParse(value);
                if (numValue == null || numValue < 0) {
                  return 'Masukkan nilai yang valid';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _priceController,
              decoration: InputDecoration(
                labelText: 'Harga',
                prefixIcon: const Icon(Icons.money),
                prefixText: 'Rp ',
                suffixText: ',-',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                filled: true,
                fillColor: Colors.white,
                floatingLabelBehavior: FloatingLabelBehavior.always,
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onChanged: (value) {
                final formattedValue =
                    _formatPrice(double.tryParse(_digitsOnly(value)) ?? 0);
                _priceController.value = TextEditingValue(
                  text: formattedValue,
                  selection: TextSelection.collapsed(offset: formattedValue.length),
                );
              },
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Harga tidak boleh kosong';
                }
                final numValue = double.tryParse(_digitsOnly(value));
                if (numValue == null || numValue < 0) {
                  return 'Masukkan harga yang valid';
                }
                return null;
              },
            ),
            const SizedBox(height: 24),
            const Text(
              'Nutrisi',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            if (_nutritions.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Text(
                  'Tidak ada nutrisi tersedia. Silakan tambahkan nutrisi terlebih dahulu.',
                  style: TextStyle(color: Colors.grey),
                ),
              ),
            ..._nutrisiList.asMap().entries.map((entry) {
              final index = entry.key;
              final nutrisi = entry.value;
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 8),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _nutrisiControllers[index],
                          readOnly: true,
                          decoration: InputDecoration(
                            labelText: 'Nutrisi',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            suffixIcon: const Icon(Icons.arrow_drop_down),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          onTap: () => _showNutrisiDropdown(context, index),
                          validator: (value) =>
                              nutrisi.nutrisiId == 0 ? 'Pilih nutrisi' : null,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: TextFormField(
                          controller: _amountControllers[index],
                          decoration: InputDecoration(
                            labelText: 'Jumlah',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            filled: true,
                            fillColor: Colors.white,
                          ),
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.allow(RegExp(r'^\d*\.?\d*$')),
                          ],
                          onTap: () {
                            // Clear default '0' when user starts typing
                            if (_amountControllers[index].text == '0') {
                              _amountControllers[index].clear();
                            }
                          },
                          onChanged: (value) {
                            setState(() {
                              _nutrisiList[index] = FeedNutrisi(
                                feedId: widget.feed.id!,
                                nutrisiId: nutrisi.nutrisiId,
                                amount:
                                    double.tryParse(value.isEmpty ? '0' : value) ??
                                        0.0,
                              );
                            });
                          },
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return 'Jumlah tidak boleh kosong';
                            }
                            final amount = double.tryParse(value);
                            if (amount == null || amount < 0) {
                              return 'Masukkan jumlah yang valid';
                            }
                            return null;
                          },
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _removeNutritionRow(index),
                      ),
                    ],
                  ),
                ),
              );
            }),
            TextButton.icon(
              onPressed: _nutritions.isEmpty ? null : _addNutritionRow,
              icon: const Icon(Icons.add, color: Colors.blue),
              label: const Text('Tambah Nutrisi', style: TextStyle(color: Colors.blue)),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.blue[700],
                    side: BorderSide(color: Colors.blue[700]!),
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Text('Batal'),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  onPressed: _showConfirmationDialog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[700],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.save),
                      SizedBox(width: 8),
                      Text('Simpan'),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: _isLoading
          ? _buildLoadingView()
          : _loadError != null
              ? _buildErrorView()
              : _feedTypes.isEmpty && _isFeedValid
                  ? _buildEmptyView()
                  : _buildForm(),
    );
  }
}