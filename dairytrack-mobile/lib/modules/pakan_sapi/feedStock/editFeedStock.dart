import 'package:dairy_track/config/api/pakan/feedStock.dart';
import 'package:dairy_track/model/pakan/feedStock.dart';
import 'package:flutter/material.dart';

class EditFeedStock extends StatefulWidget {
  final FeedStock feedStock;

  const EditFeedStock({super.key, required this.feedStock});

  @override
  _EditFeedStockState createState() => _EditFeedStockState();
}

class _EditFeedStockState extends State<EditFeedStock> {
  final _formKey = GlobalKey<FormState>();
  final _stockController = TextEditingController();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _stockController.text = widget.feedStock.stock.toString();
  }

  Future<void> _saveFeedStock() async {
    if (_formKey.currentState!.validate()) {
      if (widget.feedStock.id == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('ID stok pakan tidak valid')),
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      try {
        await updateFeedStock(
          id: widget.feedStock.id!,
          stock: double.parse(_stockController.text),
        );
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Stok pakan berhasil diperbarui')),
          );
          Navigator.pop(context, true);
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal memperbarui: $e')),
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
        title: const Text('Edit Stok Pakan'),
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
                    TextFormField(
                      initialValue: widget.feedStock.feed?.name ?? 'Unknown',
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
                      onPressed: _saveFeedStock,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 32, vertical: 12),
                      ),
                      child: const Text('Simpan'),
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