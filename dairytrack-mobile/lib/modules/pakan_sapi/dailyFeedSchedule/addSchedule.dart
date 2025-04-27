import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AddDailyFeedSchedule extends StatefulWidget {
  final VoidCallback? onDailyFeedAdded;
  final VoidCallback? onClose;

  const AddDailyFeedSchedule({
    super.key,
    this.onDailyFeedAdded,
    this.onClose,
  });

  @override
  _AddDailyFeedScheduleState createState() => _AddDailyFeedScheduleState();
}

class _AddDailyFeedScheduleState extends State<AddDailyFeedSchedule> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isSubmitting = false;
  bool _cowError = false;
  DateTime _selectedDate = DateTime.now();

  // Form field controllers
  int? _selectedCowId;
  String _selectedSession = 'Pagi';

  // Data lists
  List<Cow> _cows = [];
  final List<String> _sessions = ['Pagi', 'Siang', 'Sore'];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() {
      _isLoading = true;
      _cowError = false;
    });

    try {
      final cowsData = await getCows().catchError((e) {
        setState(() => _cowError = true);
        throw e;
      });

      setState(() {
        _cows = cowsData;
        if (_cows.isNotEmpty) _selectedCowId = _cows.first.id;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memuat data: $e')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate,
      firstDate: DateTime(2020),
      lastDate: DateTime(2030),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF17A2B8),
              onPrimary: Colors.white,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<bool> _confirmSave() async {
    return await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Konfirmasi'),
            content: const Text('Apakah Anda yakin ingin menyimpan jadwal pakan ini?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Batal'),
              ),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF17A2B8),
                ),
                onPressed: () => Navigator.pop(context, true),
                child: const Text('Ya, Simpan'),
              ),
            ],
          ),
        ) ??
        false;
  }

  Future<void> _saveDailyFeedSchedule() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedCowId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Semua kolom wajib diisi')),
      );
      return;
    }

    final confirmed = await _confirmSave();
    if (!confirmed) return;

    setState(() {
      _isSubmitting = true;
    });

    try {
      await createDailyFeed(
        cowId: _selectedCowId!,
        date: DateFormat('yyyy-MM-dd').format(_selectedDate),
        session: _selectedSession,
        items: [],
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Jadwal pakan berhasil ditambahkan'),
            backgroundColor: Colors.green,
            duration: Duration(seconds: 2),
          ),
        );

        if (widget.onDailyFeedAdded != null) {
          widget.onDailyFeedAdded!();
        }

        if (widget.onClose != null) {
          widget.onClose!();
        } else {
          Navigator.pop(context, true);
        }
      }
    } catch (e) {
      String errorMessage = e.toString().replaceFirst('Exception: ', '');
      if (e.toString().contains('sudah ada')) {
        final cow = _cows.firstWhere(
          (c) => c.id == _selectedCowId,
          orElse: () => Cow(
            id: _selectedCowId!,
            name: 'ID $_selectedCowId',
            breed: 'Unknown',
            birthDate: DateTime(1970, 1, 1),
            reproductiveStatus: 'Unknown',
            gender: 'Unknown',
            entryDate: DateTime(1970, 1, 1),
            createdAt: DateTime(1970, 1, 1),
            updatedAt: DateTime(1970, 1, 1),
          ),
        );
        errorMessage =
            'Data untuk sapi "${cow.name}" pada tanggal ${DateFormat('dd MMM yyyy').format(_selectedDate)} sesi $_selectedSession sudah ada. Silakan gunakan sesi yang berbeda.';
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Jadwal Pakan'),
        backgroundColor: const Color(0xFF17A2B8),
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: _isSubmitting
              ? null
              : widget.onClose ?? () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: Color(0xFF17A2B8)),
                  SizedBox(height: 16),
                  Text('Memuat data...', style: TextStyle(fontSize: 16)),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Cow selection
                    const Text(
                      'Sapi',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: _selectedCowId,
                      decoration: InputDecoration(
                        border: const OutlineInputBorder(),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        errorText: _cowError ? 'Gagal memuat data sapi' : null,
                      ),
                      items: _cows.map((cow) {
                        return DropdownMenuItem<int>(
                          value: cow.id,
                          child: Text(cow.name),
                        );
                      }).toList(),
                      onChanged: _cowError || _cows.isEmpty
                          ? null
                          : (value) => setState(() => _selectedCowId = value),
                      validator: (value) => value == null ? 'Harap pilih sapi' : null,
                    ),
                    const SizedBox(height: 16),

                    // Date selection
                    const Text(
                      'Tanggal',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: () => _selectDate(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 15),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              DateFormat('dd MMM yyyy').format(_selectedDate),
                              style: const TextStyle(fontSize: 16),
                            ),
                            const Icon(Icons.calendar_today),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Session selection
                    const Text(
                      'Sesi',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _selectedSession,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      items: _sessions.map((session) {
                        return DropdownMenuItem<String>(
                          value: session,
                          child: Text(session),
                        );
                      }).toList(),
                      onChanged: (value) => setState(() => _selectedSession = value!),
                      validator: (value) => value == null || value.isEmpty ? 'Harap pilih sesi' : null,
                    ),
                    const SizedBox(height: 32),

                    // Buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _isSubmitting
                                ? null
                                : widget.onClose ?? () => Navigator.pop(context),
                            style: OutlinedButton.styleFrom(
                              side: const BorderSide(color: Colors.grey),
                              padding: const EdgeInsets.symmetric(vertical: 15),
                            ),
                            child: const Text('Batal', style: TextStyle(fontSize: 16)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: (_isSubmitting || _cowError)
                                ? null
                                : _saveDailyFeedSchedule,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF17A2B8),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 15),
                            ),
                            child: _isSubmitting
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Simpan', style: TextStyle(fontSize: 16)),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}