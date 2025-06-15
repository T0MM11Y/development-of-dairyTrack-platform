import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/financeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/finance.dart';
import 'package:intl/intl.dart';

class AddExpenseModal extends StatefulWidget {
  const AddExpenseModal({Key? key}) : super(key: key);

  @override
  _AddExpenseModalState createState() => _AddExpenseModalState();
}

class _AddExpenseModalState extends State<AddExpenseModal> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _transactionDateController =
      TextEditingController();
  final TextEditingController _expenseTypeController = TextEditingController();
  final DateFormat _dateFormat = DateFormat('yyyy-MM-dd');

  @override
  void dispose() {
    _amountController.dispose();
    _descriptionController.dispose();
    _transactionDateController.dispose();
    _expenseTypeController.dispose();
    super.dispose();
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
    );
    if (picked != null) {
      setState(() {
        _transactionDateController.text = _dateFormat.format(picked);
      });
    }
  }

  void _submitForm(FinanceProvider provider) async {
    if (_formKey.currentState!.validate()) {
      final expense = Expense(
        id: 0, // Will be set by backend
        expenseType: int.tryParse(_expenseTypeController.text) ?? 2,
        amount: _amountController.text, // Keep as string
        description: _descriptionController.text,
        transactionDate: DateTime.parse(_transactionDateController.text),
        createdBy: null, // Adjust based on backend requirements
        updatedBy: null,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final success = await provider.addExpense(expense);
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pengeluaran berhasil ditambahkan')),
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
      title: const Text('Tambah Pengeluaran'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: _expenseTypeController,
                decoration: const InputDecoration(
                  labelText: 'ID Jenis Pengeluaran',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'ID jenis pengeluaran harus diisi';
                  }
                  if (int.tryParse(value) == null) {
                    return 'ID harus berupa angka';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(
                  labelText: 'Jumlah (Rp)',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Jumlah harus diisi';
                  }
                  if (double.tryParse(value) == null ||
                      double.parse(value) <= 0) {
                    return 'Jumlah harus berupa angka positif';
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
              const SizedBox(height: 12),
              TextFormField(
                controller: _transactionDateController,
                decoration: const InputDecoration(
                  labelText: 'Tanggal Transaksi',
                  border: OutlineInputBorder(),
                ),
                readOnly: true,
                onTap: () => _selectDate(context),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Tanggal transaksi harus diisi';
                  }
                  try {
                    DateTime.parse(value);
                    return null;
                  } catch (e) {
                    return 'Format tanggal tidak valid';
                  }
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
