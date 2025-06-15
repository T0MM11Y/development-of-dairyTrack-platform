import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/financeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/finance.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';

class AddExpenseTypeModal extends StatefulWidget {
  const AddExpenseTypeModal({Key? key}) : super(key: key);

  @override
  _AddExpenseTypeModalState createState() => _AddExpenseTypeModalState();
}

class _AddExpenseTypeModalState extends State<AddExpenseTypeModal> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  int? _userId; // Initialize as null

  @override
  void initState() {
    super.initState();
    // Fetch user ID asynchronously
    _fetchUserId();
  }

  Future<void> _fetchUserId() async {
    try {
      _userId = await AuthUtils.getUserId();
      setState(() {}); // Update UI if needed
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat user ID: $e')),
      );
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _descriptionController.dispose();
    super.dispose();
  }

  void _submitForm(FinanceProvider provider) async {
    if (_formKey.currentState!.validate()) {
      if (_userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User ID tidak tersedia')),
        );
        return;
      }
      final expenseType = ExpenseType(
        id: 0,
        name: _nameController.text,
        description: _descriptionController.text,
        createdBy: {'id': _userId},
        updatedBy: {'id': _userId},
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final success = await provider.addExpenseType(expenseType);
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Jenis pengeluaran berhasil ditambahkan')),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(provider.errorMessage)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Tambah Jenis Pengeluaran'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _nameController,
                decoration: const InputDecoration(
                  labelText: 'Nama Jenis Pengeluaran',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Nama harus diisi';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(
                  labelText: 'Deskripsi',
                  border: OutlineInputBorder(),
                ),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Deskripsi harus diisi';
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Batal'),
        ),
        Consumer<FinanceProvider>(
          builder: (context, provider, child) {
            return ElevatedButton(
              onPressed:
                  provider.isLoading ? null : () => _submitForm(provider),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueGrey[800],
              ),
              child: provider.isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Tambah', style: TextStyle(color: Colors.white)),
            );
          },
        ),
      ],
    );
  }
}
