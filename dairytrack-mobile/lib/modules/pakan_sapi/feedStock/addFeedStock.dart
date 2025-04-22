import 'package:dairy_track/config/api/pakan/feedStock.dart';
import 'package:dairy_track/config/api/pakan/feed.dart';
import 'package:dairy_track/model/pakan/feed.dart';
import 'package:flutter/material.dart';

class AddFeedStock extends StatefulWidget {
  final Feed? preSelectedFeed;

  const AddFeedStock({super.key, this.preSelectedFeed});

  @override
  _AddFeedStockState createState() => _AddFeedStockState();
}

class _AddFeedStockState extends State<AddFeedStock> {
  final _formKey = GlobalKey<FormState>();
  Feed? _selectedFeed;
  final _stockController = TextEditingController();
  List<Feed> _feeds = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadFeeds();
    if (widget.preSelectedFeed != null) {
      _selectedFeed = widget.preSelectedFeed;
    }
  }

  Future<void> _loadFeeds() async {
    setState(() {
      _isLoading = true;
    });
    try {
      final feeds = await getFeeds();
      setState(() {
        _feeds = feeds;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memuat daftar pakan: $e')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _saveFeedStock() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedFeed == null && widget.preSelectedFeed == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pakan harus dipilih')),
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      try {
        final payload = {
          'feedId': (_selectedFeed ?? widget.preSelectedFeed)!.id,
          'additionalStock': double.parse(_stockController.text),
        };

        await addFeedStock(payload);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Stok pakan berhasil ditambahkan')),
          );
          Navigator.pop(context, true);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal menambahkan: $e')),
          );
        }
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Stok Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    if (widget.preSelectedFeed == null)
                      _feeds.isEmpty
                          ? const Text(
                              'Tidak ada pakan tersedia. Silakan tambah pakan terlebih dahulu.',
                              style: TextStyle(color: Colors.red),
                            )
                          : DropdownButtonFormField<Feed>(
                              decoration: const InputDecoration(
                                labelText: 'Pilih Pakan',
                                border: OutlineInputBorder(),
                              ),
                              value: _selectedFeed,
                              items: _feeds.map((feed) {
                                return DropdownMenuItem<Feed>(
                                  value: feed,
                                  child: Text(feed.name),
                                );
                              }).toList(),
                              onChanged: (value) {
                                setState(() {
                                  _selectedFeed = value;
                                });
                              },
                              validator: (value) =>
                                  value == null ? 'Pakan harus dipilih' : null,
                            )
                    else
                      TextFormField(
                        initialValue: _selectedFeed?.name ?? '',
                        decoration: const InputDecoration(
                          labelText: 'Pakan',
                          border: OutlineInputBorder(),
                        ),
                        readOnly: true,
                      ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _stockController,
                      decoration: const InputDecoration(
                        labelText: 'Jumlah Stok (kg)',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Jumlah stok harus diisi';
                        }
                        if (double.tryParse(value) == null ||
                            double.parse(value) <= 0) {
                          return 'Jumlah stok harus angka positif';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed:
                          _feeds.isEmpty && widget.preSelectedFeed == null
                              ? null // Disable button if no feeds available
                              : _saveFeedStock,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 32, vertical: 12),
                      ),
                      child: const Text('Tambah'),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  @override
  void dispose() {
    _stockController.dispose();
    super.dispose();
  }
}
