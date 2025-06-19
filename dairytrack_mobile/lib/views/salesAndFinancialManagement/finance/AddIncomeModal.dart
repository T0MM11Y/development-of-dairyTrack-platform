import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/providers/financeProvider.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/finance.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL2/utils/authutils.dart';

class AddIncomeModal extends StatefulWidget {
  const AddIncomeModal({Key? key}) : super(key: key);

  @override
  _AddIncomeModalState createState() => _AddIncomeModalState();
}

class _AddIncomeModalState extends State<AddIncomeModal> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _descriptionController = TextEditingController();
  final TextEditingController _transactionDateController =
      TextEditingController();
  int? _selectedIncomeTypeId;
  final DateFormat _dateFormat = DateFormat('yyyy-MM-dd');
  int? _userId; // Initialize as null

  @override
  void initState() {
    super.initState();
    _transactionDateController.text = _dateFormat.format(DateTime.now());
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
    _amountController.dispose();
    _descriptionController.dispose();
    _transactionDateController.dispose();
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
      if (_userId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('User ID tidak tersedia')),
        );
        return;
      }
      final income = Income(
        id: 0,
        incomeType: _selectedIncomeTypeId,
        incomeTypeDetail: null,
        amount: _amountController.text,
        description: _descriptionController.text,
        transactionDate: _dateFormat.parse(_transactionDateController.text),
        createdBy: {'id': _userId},
        updatedBy: {'id': _userId},
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final success = await provider.addIncome(income);
      if (success) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pendapatan berhasil ditambahkan')),
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
      title: const Text('Tambah Pendapatan'),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Consumer<FinanceProvider>(
                builder: (context, provider, child) {
                  return DropdownButtonFormField<int>(
                    decoration: const InputDecoration(
                      labelText: 'Jenis Pendapatan',
                      border: OutlineInputBorder(),
                    ),
                    value: _selectedIncomeTypeId,
                    items: provider.incomeTypes
                        .map((type) => DropdownMenuItem(
                              value: type.id,
                              child: Text(type.name),
                            ))
                        .toList(),
                    onChanged: (value) {
                      setState(() {
                        _selectedIncomeTypeId = value;
                      });
                    },
                    validator: (value) =>
                        value == null ? 'Pilih jenis pendapatan' : null,
                  );
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(
                  labelText: 'Jumlah (Rp)',
                  border: OutlineInputBorder(),
                ),
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
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
                    _dateFormat.parse(value);
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
