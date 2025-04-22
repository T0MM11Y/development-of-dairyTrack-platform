import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedType.dart';
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
  final _proteinController = TextEditingController();
  final _energyController = TextEditingController();
  final _fiberController = TextEditingController();
  final _minStockController = TextEditingController();
  final _priceController = TextEditingController();
  final _feedTypeController = TextEditingController();
  final _formatCurrency = NumberFormat('#,###', 'id');
  FeedType? _selectedFeedType;

  // New state variables for feed types
  List<FeedType> _feedTypes = [];
  bool _isLoading = true;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    // Pre-populate the form fields with the existing Feed data
    _nameController.text = widget.feed.name;

    // Format numeric values without decimal places for whole numbers
    if (widget.feed.protein != null) {
      final proteinValue = widget.feed.protein!;
      _proteinController.text = proteinValue == proteinValue.truncateToDouble()
          ? proteinValue.toInt().toString()
          : proteinValue.toString();
    }

    if (widget.feed.energy != null) {
      final energyValue = widget.feed.energy!;
      _energyController.text = energyValue == energyValue.truncateToDouble()
          ? energyValue.toInt().toString()
          : energyValue.toString();
    }

    if (widget.feed.fiber != null) {
      final fiberValue = widget.feed.fiber!;
      _fiberController.text = fiberValue == fiberValue.truncateToDouble()
          ? fiberValue.toInt().toString()
          : fiberValue.toString();
    }

    _minStockController.text = widget.feed.minStock?.toString() ?? '';

    // Format price with thousand separators
    if (widget.feed.price != null) {
      _priceController.text =
          _formatPrice(widget.feed.price!.toInt().toString());
    }

    _selectedFeedType = widget.feed.feedType;
    if (_selectedFeedType != null) {
      _feedTypeController.text = _selectedFeedType!.name;
    }

    // Load feed types just once when the page initializes
    _loadFeedTypes();
  }

  // New method to load feed types only once
  Future<void> _loadFeedTypes() async {
    try {
      setState(() {
        _isLoading = true;
        _loadError = null;
      });

      final feedTypes = await getFeedTypes();

      // Remove duplicates if any
      final uniqueFeedTypes = <FeedType>{};
      for (var feedType in feedTypes) {
        uniqueFeedTypes.add(feedType);
      }

      setState(() {
        _feedTypes = uniqueFeedTypes.toList();
        _isLoading = false;

        // If _selectedFeedType is not in _feedTypes, reset it to null
        if (_selectedFeedType != null &&
            !_feedTypes.any((ft) => ft.id == _selectedFeedType!.id)) {
          _selectedFeedType = null;
          _feedTypeController.text = '';
        }
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _loadError = e.toString();
      });
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _proteinController.dispose();
    _energyController.dispose();
    _fiberController.dispose();
    _minStockController.dispose();
    _priceController.dispose();
    _feedTypeController.dispose();
    super.dispose();
  }

  // Format price with thousand separators
  String _formatPrice(String text) {
    if (text.isEmpty) return '';
    final value = int.tryParse(text.replaceAll('.', '')) ?? 0;
    return _formatCurrency.format(value);
  }

  // Only allow digits in price field
  String _digitsOnly(String text) {
    return text.replaceAll(RegExp(r'[^\d]'), '');
  }

  void _showFeedTypeDropdown(BuildContext context) {
    // Get the render box of the current widget
    final RenderBox box = context.findRenderObject() as RenderBox;
    final Offset offset = box.localToGlobal(Offset.zero);

    // Calculate positioning relative to the text field
    // Reduced the top offset to position it closer to the field
    double left = 65.0; // Same as form padding
    double top = offset.dy + 230.0; // Positioned just below the field
    double width = box.size.width - 32.0; // Same width as form minus padding

    showMenu<FeedType>(
      context: context,
      position: RelativeRect.fromLTRB(
          left, top, left + 16, 0), // Left aligned with form
      items: _feedTypes.asMap().entries.map((entry) {
        final index = entry.key;
        final feedType = entry.value;

        // Use alternating background colors
        final bool useGrayBackground = index % 2 == 1;

        return PopupMenuItem<FeedType>(
          value: feedType,
          child: Container(
            width:
                width - 32.0, // Make items slightly less wide than the dropdown
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

  // New method to show confirmation dialog with changes
  Future<void> _showConfirmationDialog() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    // Create updated feed object to compare values
    final updatedFeed = Feed(
      id: widget.feed.id,
      typeId: _selectedFeedType?.id,
      name: _nameController.text.trim(),
      protein: double.parse(_proteinController.text),
      energy: double.parse(_energyController.text),
      fiber: double.parse(_fiberController.text),
      minStock: int.parse(_minStockController.text),
      price: double.parse(_priceController.text.replaceAll('.', '')),
      createdAt: widget.feed.createdAt ?? DateTime.now(),
      updatedAt: DateTime.now(),
    );

    // Build a list of changes
    final List<Map<String, dynamic>> changes = [];

    // Check name
    if (updatedFeed.name != widget.feed.name) {
      changes.add({
        'field': 'Nama Pakan',
        'old': widget.feed.name,
        'new': updatedFeed.name,
      });
    }

    // Check feed type
    if ((updatedFeed.typeId ?? '') != (widget.feed.typeId ?? '')) {
      changes.add({
        'field': 'Jenis Pakan',
        'old': widget.feed.feedType?.name ?? 'Tidak ada',
        'new': _selectedFeedType?.name ?? 'Tidak ada',
      });
    }

    // Check protein
    if (updatedFeed.protein != widget.feed.protein) {
      changes.add({
        'field': 'Protein',
        'old': '${widget.feed.protein}%',
        'new': '${updatedFeed.protein}%',
      });
    }

    // Check energy
    if (updatedFeed.energy != widget.feed.energy) {
      changes.add({
        'field': 'Energi',
        'old': '${widget.feed.energy} kcal',
        'new': '${updatedFeed.energy} kcal',
      });
    }

    // Check fiber
    if (updatedFeed.fiber != widget.feed.fiber) {
      changes.add({
        'field': 'Serat',
        'old': '${widget.feed.fiber}%',
        'new': '${updatedFeed.fiber}%',
      });
    }

    // Check min stock
    if (updatedFeed.minStock != widget.feed.minStock) {
      changes.add({
        'field': 'Stok Minimum',
        'old': '${widget.feed.minStock}',
        'new': '${updatedFeed.minStock}',
      });
    }

    if (updatedFeed.price != widget.feed.price) {
      changes.add({
        'field': 'Harga',
        'old':
            'Rp ${_formatPrice(widget.feed.price?.toInt().toString() ?? "0")},-',
        'new':
            'Rp ${_formatPrice(updatedFeed.price?.toInt().toString() ?? "0")},-',
      });
    }

    // If no changes were made, inform the user
    if (changes.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Tidak ada perubahan yang dilakukan')),
      );
      return;
    }

    // Show confirmation dialog
    final bool? confirm = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
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
                ...changes.map((change) {
                  return Padding(
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
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.arrow_back,
                                size: 16, color: Colors.red),
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
                            const Icon(Icons.arrow_forward,
                                size: 16, color: Colors.green),
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
                  );
                }).toList(),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text(
                'BATAL',
                style: TextStyle(color: Colors.grey),
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue[700],
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text('SIMPAN'),
            ),
          ],
        );
      },
    );

    // If confirmed, proceed with update
    if (confirm == true) {
      await _updateFeed(updatedFeed);
    }
  }

  Future<void> _updateFeed(Feed updatedFeed) async {
    try {
      // Pass both the ID and the updatedFeed object to updateFeed
      await updateFeed(widget.feed.id, updatedFeed);

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Pakan berhasil diperbarui'),
          backgroundColor: Colors.green,
        ),
      );

      // Return true to trigger refresh on the calling page
      Navigator.pop(context, true);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal memperbarui pakan: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Widget to show while loading feed types
  Widget _buildLoadingView() {
    return const Center(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(width: 16),
          Text('Memuat jenis pakan...'),
        ],
      ),
    );
  }

  // Widget to show when there's an error loading feed types
  Widget _buildErrorView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, color: Colors.red, size: 48),
          const SizedBox(height: 16),
          Text(
            'Gagal memuat jenis pakan: ${_loadError ?? 'Unknown error'}',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.red),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadFeedTypes, // Retry loading feed types
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

  // Widget to show when no feed types are available
  Widget _buildEmptyView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.info_outline, color: Colors.grey, size: 48),
          const SizedBox(height: 16),
          const Text(
            'Tidak ada jenis pakan tersedia.',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadFeedTypes, // Retry loading feed types
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

  // Widget to show the edit form
  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Name Field
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Nama Pakan',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
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

            // Feed Type Field - Custom implementation
            TextFormField(
              controller: _feedTypeController,
              readOnly: true,
              decoration: InputDecoration(
                labelText: 'Jenis Pakan',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.category),
                suffixIcon: const Icon(Icons.arrow_drop_down),
                filled: true,
                fillColor: Colors.white,
              ),
              onTap: () {
                _showFeedTypeDropdown(context);
              },
              validator: (value) {
                if (_selectedFeedType == null) {
                  return 'Pilih jenis pakan';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Protein Field
            TextFormField(
              controller: _proteinController,
              decoration: InputDecoration(
                labelText: 'Protein (%)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.science),
                filled: true,
                fillColor: Colors.white,
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Protein tidak boleh kosong';
                }
                final numValue = double.tryParse(value);
                if (numValue == null || numValue < 0) {
                  return 'Masukkan nilai yang valid';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Energy Field
            TextFormField(
              controller: _energyController,
              decoration: InputDecoration(
                labelText: 'Energi (kcal)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.bolt),
                filled: true,
                fillColor: Colors.white,
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Energi tidak boleh kosong';
                }
                final numValue = double.tryParse(value);
                if (numValue == null || numValue < 0) {
                  return 'Masukkan nilai yang valid';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Fiber Field
            TextFormField(
              controller: _fiberController,
              decoration: InputDecoration(
                labelText: 'Serat (%)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.grass),
                filled: true,
                fillColor: Colors.white,
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Serat tidak boleh kosong';
                }
                final numValue = double.tryParse(value);
                if (numValue == null || numValue < 0) {
                  return 'Masukkan nilai yang valid';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Min Stock Field
            TextFormField(
              controller: _minStockController,
              decoration: InputDecoration(
                labelText: 'Stok Minimum',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                prefixIcon: const Icon(Icons.inventory),
                filled: true,
                fillColor: Colors.white,
              ),
              keyboardType: TextInputType.number,
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

            // Price Field with formatting
            TextFormField(
              controller: _priceController,
              decoration: InputDecoration(
                labelText: 'Harga',
                prefixIcon: const Icon(Icons.money),
                prefixText: 'Rp ',
                suffixText: ',-',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.white,
                // Make sure label doesn't disappear when focused
                floatingLabelBehavior: FloatingLabelBehavior.always,
              ),
              keyboardType: TextInputType.number,
              inputFormatters: [FilteringTextInputFormatter.digitsOnly],
              onChanged: (value) {
                // Format the value with thousand separators
                final formattedValue = _formatPrice(_digitsOnly(value));
                _priceController.value = TextEditingValue(
                  text: formattedValue,
                  selection:
                      TextSelection.collapsed(offset: formattedValue.length),
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

            // Buttons
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                OutlinedButton(
                  onPressed: () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.blue[700],
                    side: BorderSide(color: Colors.blue[700]!),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 24, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Batal'),
                ),
                const SizedBox(width: 16),
                ElevatedButton(
                  // Change here to show confirmation first
                  onPressed: _showConfirmationDialog,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue[700],
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                        horizontal: 32, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
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
              : _feedTypes.isEmpty
                  ? _buildEmptyView()
                  : _buildForm(),
    );
  }
}
