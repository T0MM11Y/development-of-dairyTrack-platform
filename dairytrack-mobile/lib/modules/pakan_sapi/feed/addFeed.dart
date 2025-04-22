import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedType.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';

class AddFeedPage extends StatefulWidget {
  const AddFeedPage({super.key});

  @override
  _AddFeedPageState createState() => _AddFeedPageState();
}

class _AddFeedPageState extends State<AddFeedPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _proteinController = TextEditingController();
  final _energyController = TextEditingController();
  final _fiberController = TextEditingController();
  final _minStockController = TextEditingController();
  final _priceController = TextEditingController();
  final _feedTypeController = TextEditingController();
  FeedType? _selectedFeedType;
  final _formatCurrency = NumberFormat('#,###', 'id');

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

  void _showFeedTypeDropdown(BuildContext context, List<FeedType> feedTypes) {
    // Get the render box of the current widget
    final RenderBox box = context.findRenderObject() as RenderBox;
    final Offset offset = box.localToGlobal(Offset.zero);
    
    // Calculate positioning relative to the text field
    double left = 65.0; // Same as form padding
    double top = offset.dy + 150.0; // Positioned just below the field
    double width = box.size.width - 32.0; // Same width as form minus padding
    
    showMenu<FeedType>(
      context: context,
      position: RelativeRect.fromLTRB(left, top, left + 16, 0),  // Left aligned with form, right side has 16px margin
      items: feedTypes.asMap().entries.map((entry) {
        final index = entry.key;
        final feedType = entry.value;
        
        // Use alternating background colors
        final bool useGrayBackground = index % 2 == 1;
        
        return PopupMenuItem<FeedType>(
          value: feedType,
          child: Container(
            width: width - 32.0,  // Make items slightly less wide than the dropdown
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
                  fontWeight: _selectedFeedType == feedType 
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

  Future<void> _saveFeed() async {
    if (_formKey.currentState!.validate()) {
      try {
        // Revalidate the selected FeedType by fetching the latest list
        if (_selectedFeedType != null) {
          final feedTypes = await getFeedTypes();
          final isValidFeedType = feedTypes.any((feedType) => feedType.id == _selectedFeedType!.id);
          if (!isValidFeedType) {
            throw Exception('Selected feed type is no longer available. Please select a different type.');
          }
        }

        final newFeed = Feed(
          id: 0,
          typeId: _selectedFeedType?.id,
          name: _nameController.text.trim(),
          protein: double.parse(_proteinController.text),
          energy: double.parse(_energyController.text),
          fiber: double.parse(_fiberController.text),
          minStock: int.parse(_minStockController.text),
          // Parse price value after removing thousand separators
          price: double.parse(_priceController.text.replaceAll('.', '')),
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        print('Submitting Feed: ${newFeed.toJson()}'); // Debugging

        await addFeed(newFeed);

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pakan berhasil ditambahkan')),
        );

        Navigator.pop(context, true); // Return true to trigger refresh
      } catch (e) {
        print('Error in _saveFeed: $e'); // Debugging
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal menambahkan pakan: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: FutureBuilder<List<FeedType>>(
        future: getFeedTypes(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
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
          } else if (snapshot.hasError || snapshot.error != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 48),
                  const SizedBox(height: 16),
                  Text(
                    'Gagal memuat jenis pakan: ${snapshot.error ?? 'Unknown error'}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.red),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      setState(() {}); // Retry fetching
                    },
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
          } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
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
                    onPressed: () {
                      setState(() {}); // Retry fetching
                    },
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

          final feedTypes = snapshot.data!;
          
          // Remove duplicates from feedTypes
          final uniqueFeedTypes = <FeedType>{};
          for (var feedType in feedTypes) {
            uniqueFeedTypes.add(feedType);
          }
          final List<FeedType> finalFeedTypes = uniqueFeedTypes.toList();

          // If _selectedFeedType is not in finalFeedTypes, reset it to null
          if (_selectedFeedType != null &&
              !finalFeedTypes.contains(_selectedFeedType)) {
            _selectedFeedType = null;
            _feedTypeController.text = '';
          }

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
                      _showFeedTypeDropdown(context, finalFeedTypes);
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
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly
                    ],
                    onChanged: (value) {
                      // Format the value with thousand separators
                      final formattedValue = _formatPrice(_digitsOnly(value));
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
                  
                  // Buttons
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.blue[700],
                          side: BorderSide(color: Colors.blue[700]!),
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text('Batal'),
                      ),
                      const SizedBox(width: 16),
                      ElevatedButton(
                        onPressed: _saveFeed,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[700],
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
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
        },
      ),
    );
  }
}