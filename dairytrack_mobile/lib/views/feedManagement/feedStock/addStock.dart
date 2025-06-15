import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedStockController.dart';
import '../model/feed.dart';
import '../model/feedStock.dart';

class FeedStockAdd extends StatefulWidget {
  final List<Feed> feedList;
  final FeedStockModel? stock;
  final int? preselectedFeedId;
  final VoidCallback onSuccess;

  const FeedStockAdd({
    super.key,
    required this.feedList,
    this.stock,
    this.preselectedFeedId,
    required this.onSuccess,
  });

  @override
  _FeedStockAddState createState() => _FeedStockAddState();
}

class _FeedStockAddState extends State<FeedStockAdd> {
  final FeedStockManagementController _stockController = FeedStockManagementController();
  final _formKey = GlobalKey<FormState>();
  int? _feedId;
  double _stock = 0.0;
  bool _isSubmitting = false;
  bool _showFeedDropdown = false;
  final int _userId = 13; // TODO: Replace with dynamic user ID from SharedPreferences

  @override
  void initState() {
    super.initState();
    if (widget.stock != null) {
      _feedId = widget.stock!.feedId;
      _stock = widget.stock!.stock;
    } else if (widget.preselectedFeedId != null &&
        widget.feedList.any((feed) => feed.id == widget.preselectedFeedId)) {
      _feedId = widget.preselectedFeedId;
    } else if (widget.feedList.isNotEmpty) {
      _feedId = widget.feedList.first.id;
    }
  }

  void _showSnackBar(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(color: Colors.white)),
        backgroundColor: isError ? Colors.red.shade600 : Colors.teal.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  Future<bool> _showConfirmationDialog({
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
          padding: const EdgeInsets.all(20),
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
                size: 50,
              ),
              const SizedBox(height: 16),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16, color: Colors.black87),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      "Batal",
                      style: TextStyle(color: Colors.black87),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: const Text(
                      "Konfirmasi",
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

  Future<void> _submitForm() async {
    if (_formKey.currentState!.validate()) {
      if (_feedId == null && widget.stock == null) {
        _showSnackBar('Harap pilih pakan', isError: true);
        return;
      }

      final selectedFeed = widget.feedList.firstWhere(
        (feed) => feed.id == _feedId,
        orElse: () {
          if (widget.feedList.isNotEmpty) {
            return widget.feedList.first;
          }
          throw Exception('Tidak ada pakan tersedia');
        },
      );

      final confirm = await _showConfirmationDialog(
        title: widget.stock != null ? "Konfirmasi Perbarui" : "Konfirmasi Tambah",
        message: widget.stock != null
            ? 'Apakah Anda yakin ingin memperbarui stok pakan ${selectedFeed.name} dari ${formatNumber(widget.stock!.stock)}${selectedFeed.unit} menjadi ${formatNumber(_stock)}${selectedFeed.unit}?'
            : 'Apakah Anda yakin ingin menambah ${formatNumber(_stock)}${selectedFeed.unit} ke stok pakan ${selectedFeed.name}?',
      );

      if (confirm) {
        setState(() => _isSubmitting = true);
        try {
          Map<String, dynamic> response;
          if (widget.stock != null) {
            response = await _stockController.updateFeedStock(
              id: widget.stock!.id,
              stock: _stock,
              userId: _userId,
            );
          } else {
            response = await _stockController.addFeedStock(
              feedId: _feedId!,
              additionalStock: _stock,
              userId: _userId,
            );
          }
          if (!mounted) return;
          if (response['success']) {
            _showSnackBar(response['message']);
            widget.onSuccess();
            Navigator.of(context).pop();
          } else {
            _showSnackBar(response['message'], isError: true);
          }
        } catch (e) {
          if (!mounted) return;
          _showSnackBar('Error: $e', isError: true);
        } finally {
          if (mounted) {
            setState(() => _isSubmitting = false);
          }
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUpdate = widget.stock != null;
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: Text(
          isUpdate ? 'Perbarui Stok: ${widget.stock!.feedName}' : 'Tambah Stok Pakan',
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade600,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: widget.feedList.isEmpty
          ? Center(
              child: Text(
                'Tidak ada pakan tersedia',
                style: TextStyle(fontSize: 16, color: Colors.grey.shade600),
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (isUpdate)
                        _buildReadOnlyListTile(
                          Icons.local_dining,
                          'Pakan',
                          '${widget.stock!.feedName} (${widget.stock!.unit})',
                        )
                      else
                        Card(
                          elevation: 4,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              children: [
                                GestureDetector(
                                  onTap: () {
                                    setState(() {
                                      _showFeedDropdown = !_showFeedDropdown;
                                    });
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                                    decoration: BoxDecoration(
                                      border: Border.all(color: Colors.grey[300]!),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            _feedId == null
                                                ? 'Pilih Pakan'
                                                : widget.feedList.firstWhere((feed) => feed.id == _feedId).name + ' (${widget.feedList.firstWhere((feed) => feed.id == _feedId).unit})',
                                            style: TextStyle(
                                              fontSize: 16,
                                              color: _feedId == null ? Colors.grey[600] : Colors.black,
                                            ),
                                          ),
                                        ),
                                        Icon(
                                          _showFeedDropdown ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                          color: Colors.teal,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                                if (_showFeedDropdown)
                                  Card(
                                    elevation: 8,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                    child: Container(
                                      constraints: const BoxConstraints(maxHeight: 200),
                                      margin: const EdgeInsets.only(top: 8),
                                      child: ListView(
                                        shrinkWrap: true,
                                        children: widget.feedList.map((feed) {
                                          return ListTile(
                                            title: Text(
                                              '${feed.name} (${feed.unit})',
                                              style: const TextStyle(fontSize: 14),
                                            ),
                                            onTap: () {
                                              setState(() {
                                                _feedId = feed.id;
                                                _showFeedDropdown = false;
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
                      const SizedBox(height: 16),
                      _buildTextFormField(
                        labelText: isUpdate ? 'Stok Baru' : 'Tambah Stok',
                        hintText: 'Masukkan jumlah stok (contoh: 100)',
                        initialValue: isUpdate ? formatNumber(_stock) : null,
                        keyboardType: TextInputType.number,
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Harap masukkan jumlah stok';
                          }
                          final parsed = double.tryParse(value);
                          if (parsed == null || parsed < 0) {
                            return 'Harap masukkan angka yang valid';
                          }
                          return null;
                        },
                        onChanged: (value) => _stock = double.tryParse(value) ?? 0.0,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal.shade600,
                          padding: const EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 4,
                        ),
                        onPressed: _isSubmitting ? null : _submitForm,
                        child: _isSubmitting
                            ? const CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              )
                            : Text(
                                isUpdate ? 'Simpan' : 'Tambah',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Widget _buildTextFormField({
    required String labelText,
    String? hintText,
    String? initialValue,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText,
          labelStyle: const TextStyle(color: Colors.black87),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade100),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade400, width: 2),
          ),
          prefixIcon: Icon(Icons.text_fields, color: Colors.teal.shade600),
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          filled: true,
          fillColor: Colors.teal.shade50,
        ),
        initialValue: initialValue,
        validator: validator,
        onChanged: onChanged,
        keyboardType: keyboardType,
      ),
    );
  }

  Widget _buildReadOnlyListTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: Colors.teal.shade600),
      title: Text(
        title,
        style: const TextStyle(
          color: Colors.black87,
          fontWeight: FontWeight.w500,
          fontSize: 16,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(color: Colors.grey.shade600),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 0),
    );
  }
}

String formatNumber(double value) {
  final String formatted = value.toStringAsFixed(2).replaceAll(RegExp(r'\.0+$'), '');
  final formatter = NumberFormat('#,##0', 'id_ID');
  return formatter.format(double.parse(formatted));
}