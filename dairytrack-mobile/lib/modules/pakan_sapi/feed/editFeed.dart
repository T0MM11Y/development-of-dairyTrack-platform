import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feedType.dart';
import 'package:flutter/material.dart';

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
  FeedType? _selectedFeedType;

  @override
  void initState() {
    super.initState();
    // Pre-populate the form fields with the existing Feed data
    _nameController.text = widget.feed.name;
    _proteinController.text = widget.feed.protein?.toString() ?? '';
    _energyController.text = widget.feed.energy?.toString() ?? '';
    _fiberController.text = widget.feed.fiber?.toString() ?? '';
    _minStockController.text = widget.feed.minStock?.toString() ?? '';
    _priceController.text = widget.feed.price?.toString() ?? '';
    _selectedFeedType = widget.feed.feedType;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _proteinController.dispose();
    _energyController.dispose();
    _fiberController.dispose();
    _minStockController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  Future<void> _updateFeed() async {
    if (_formKey.currentState!.validate()) {
      try {
        // Revalidate the selected FeedType by fetching the latest list
        if (_selectedFeedType != null) {
          final feedTypes = await getFeedTypes();
          final isValidFeedType =
              feedTypes.any((feedType) => feedType.id == _selectedFeedType!.id);
          if (!isValidFeedType) {
            throw Exception(
                'Selected feed type is no longer available. Please select a different type.');
          }
        }

        final updatedFeed = Feed(
          id: widget.feed.id, // Use the existing Feed ID
          typeId: _selectedFeedType?.id,
          name: _nameController.text.trim(),
          protein: double.parse(_proteinController.text),
          energy: double.parse(_energyController.text),
          fiber: double.parse(_fiberController.text),
          minStock: int.parse(_minStockController.text),
          price: double.parse(_priceController.text),
          createdAt: widget.feed.createdAt ?? DateTime.now(),
          updatedAt: DateTime.now(),
        );

        print('Submitting Updated Feed: ${updatedFeed.toJson()}'); // Debugging

        // Pass both the ID and the updatedFeed object to updateFeed
        await updateFeed(widget.feed.id, updatedFeed);

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pakan berhasil diperbarui')),
        );

        // Return true to trigger refresh on the calling page
        Navigator.pop(context, true);
      } catch (e) {
        print('Error in _updateFeed: $e'); // Debugging
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memperbarui pakan: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: FutureBuilder<List<FeedType>>(
        future: getFeedTypes(),
        builder: (context, snapshot) {
          print(
              'FutureBuilder state: ${snapshot.connectionState}, error: ${snapshot.error}, hasData: ${snapshot.hasData}'); // Debugging

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
            print('Error in FutureBuilder: ${snapshot.error}'); // Debugging
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
            print('No feed types available'); // Debugging
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
          print('Feed types loaded: ${feedTypes.length}'); // Debugging

          // Check for duplicates in feedTypes
          final uniqueFeedTypes = <FeedType>{};
          for (var feedType in feedTypes) {
            if (!uniqueFeedTypes.add(feedType)) {
              print(
                  'Duplicate FeedType found: ID: ${feedType.id}, Name: ${feedType.name}, CreatedAt: ${feedType.createdAt}, UpdatedAt: ${feedType.updatedAt}'); // Detailed debugging
            }
          }
          final List<FeedType> finalFeedTypes = uniqueFeedTypes.toList();

          // If _selectedFeedType is not in finalFeedTypes, reset it to null
          if (_selectedFeedType != null &&
              !finalFeedTypes.contains(_selectedFeedType)) {
            _selectedFeedType = null;
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: _nameController,
                    decoration: const InputDecoration(
                      labelText: 'Nama Pakan',
                      border: OutlineInputBorder(),
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
                  const SizedBox(height: 12),
                  DropdownButtonFormField<FeedType>(
                    decoration: const InputDecoration(
                      labelText: 'Jenis Pakan',
                      border: OutlineInputBorder(),
                    ),
                    value: _selectedFeedType,
                    items: finalFeedTypes.map((feedType) {
                      return DropdownMenuItem<FeedType>(
                        value: feedType,
                        child: Text(feedType.name),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedFeedType = value;
                        print(
                            'Selected FeedType: ID: ${_selectedFeedType?.id}, Name: ${_selectedFeedType?.name}'); // Debugging
                      });
                    },
                    validator: (value) {
                      if (value == null) {
                        return 'Pilih jenis pakan';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _proteinController,
                    decoration: const InputDecoration(
                      labelText: 'Protein (%)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Protein tidak boleh kosong';
                      }
                      final numValue = double.tryParse(value);
                      if (numValue == null || numValue < 0) {
                        return 'Masukkan nilai protein yang valid';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _energyController,
                    decoration: const InputDecoration(
                      labelText: 'Energi (kcal)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Energi tidak boleh kosong';
                      }
                      final numValue = double.tryParse(value);
                      if (numValue == null || numValue < 0) {
                        return 'Masukkan nilai energi yang valid';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _fiberController,
                    decoration: const InputDecoration(
                      labelText: 'Serat (%)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Serat tidak boleh kosong';
                      }
                      final numValue = double.tryParse(value);
                      if (numValue == null || numValue < 0) {
                        return 'Masukkan nilai serat yang valid';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _minStockController,
                    decoration: const InputDecoration(
                      labelText: 'Stok Minimum',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Stok minimum tidak boleh kosong';
                      }
                      final numValue = int.tryParse(value);
                      if (numValue == null || numValue < 0) {
                        return 'Masukkan stok minimum yang valid';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: _priceController,
                    decoration: const InputDecoration(
                      labelText: 'Harga (Rp)',
                      border: OutlineInputBorder(),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Harga tidak boleh kosong';
                      }
                      final numValue = double.tryParse(value);
                      if (numValue == null || numValue < 0) {
                        return 'Masukkan harga yang valid';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Batal'),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: _updateFeed,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[700],
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Simpan'),
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
