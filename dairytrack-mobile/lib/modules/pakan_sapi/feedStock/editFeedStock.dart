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

  // Fungsi untuk memformat angka
  String formatNumber(double number) {
    if (number % 1 == 0) {
      return number.toInt().toString(); // Jika bilangan bulat, hapus desimal
    } else {
      return number
          .toStringAsFixed(1)
          .replaceAll(RegExp(r'\.0$'), ''); // Hapus .0 jika tidak perlu
    }
  }

  @override
  void initState() {
    super.initState();
    // Format stok awal untuk kolom input
    _stockController.text = formatNumber(widget.feedStock.stock);
  }

  Future<void> _saveFeedStock() async {
    if (_formKey.currentState!.validate()) {
      if (widget.feedStock.id == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('ID stok pakan tidak valid')),
          );
        }
        return;
      }

      // Ambil stok awal dan stok baru
      final initialStock = widget.feedStock.stock;
      final newStock = double.parse(_stockController.text);

      // Tampilkan dialog konfirmasi
      bool? confirm = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Konfirmasi'),
            content: Text(
              'Apakah Anda yakin ingin mengubah stok pakan ${widget.feedStock.feed?.name ?? 'Unknown'} '
              'dari ${formatNumber(initialStock)} kg menjadi ${formatNumber(newStock)} kg?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false), // Cancel
                child: const Text('Batal'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true), // Lanjut
                child: const Text('Ya, Simpan'),
              ),
            ],
          );
        },
      );

      // Jika pengguna memilih "Batal", hentikan proses
      if (confirm != true) {
        return;
      }

      // Hanya panggil setState jika widget masih mounted
      if (mounted) {
        setState(() {
          _isLoading = true;
        });
      }

      bool success = false;
      try {
        await updateFeedStock(
          id: widget.feedStock.id!,
          stock: newStock,
        );
        success = true;
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Berhasil mengubah stok pakan ${widget.feedStock.feed?.name ?? 'Unknown'} '
                'dari ${formatNumber(initialStock)} kg menjadi ${formatNumber(newStock)} kg',
              ),
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal memperbarui: $e')),
          );
        }
      } finally {
        // Hanya panggil setState jika widget masih mounted
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
        // Pindahkan Navigator.pop ke sini untuk memastikan widget tetap ada selama operasi
        if (success && mounted) {
          Navigator.pop(context, true);
        }
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
