import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class EditDailyFeedSchedule extends StatefulWidget {
  const EditDailyFeedSchedule({super.key});

  @override
  _EditDailyFeedScheduleState createState() => _EditDailyFeedScheduleState();
}

class _EditDailyFeedScheduleState extends State<EditDailyFeedSchedule> {
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  bool _isInitializing = true;

  // Data
  late DailyFeedSchedule _dailyFeedSchedule;
  DateTime _selectedDate = DateTime.now();

  // Form field controllers
  int? _selectedCowId;
  String _selectedSession = 'Pagi'; // Default value

  // Data lists
  List<Cow> _cows = [];
  final List<String> _sessions = ['Pagi', 'Siang', 'Sore'];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInitializing) {
      _loadInitialData();
    }
  }

  Future<void> _loadInitialData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Get the passed daily feed schedule
      _dailyFeedSchedule =
          ModalRoute.of(context)!.settings.arguments as DailyFeedSchedule;

      // Load cows data
      final cowsData = await getCows();

      setState(() {
        _cows = cowsData;

        // Set values from the daily feed schedule
        _selectedCowId = _dailyFeedSchedule.cowId;
        _selectedDate = DateTime.parse(_dailyFeedSchedule.date);
        _selectedSession = _dailyFeedSchedule.session;
        _isInitializing = false;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error loading data: $e')),
      );
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

  Future<void> _updateDailyFeedSchedule() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedCowId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Harap pilih sapi')),
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      try {
        // Call API to update
        await updateDailyFeed(
          id: _dailyFeedSchedule.id,
          cowId: _selectedCowId,
          date: DateFormat('yyyy-MM-dd').format(_selectedDate),
          session: _selectedSession,
        );

        // Show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Jadwal pakan berhasil diperbarui'),
              backgroundColor: Colors.green,
            ),
          );
          // Return to previous screen with success result
          Navigator.pop(context, true);
        }
      } catch (e) {
        // Check if it's a duplicate error
        if (e.toString().contains('sudah ada')) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('${e.toString()}. Silakan gunakan sesi yang berbeda.'),
              backgroundColor: Colors.orange,
            ),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Gagal memperbarui jadwal: $e'),
              backgroundColor: Colors.red,
            ),
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
        title: const Text('Edit Jadwal Pakan'),
        backgroundColor: const Color(0xFF17A2B8),
      ),
      body: _isLoading || _isInitializing
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
                      'Pilih Sapi',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: _selectedCowId,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      items: _cows.map((cow) {
                        return DropdownMenuItem<int>(
                          value: cow.id,
                          child: Text(cow.name),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedCowId = value;
                        });
                      },
                      validator: (value) {
                        if (value == null) {
                          return 'Harap pilih sapi';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Date selection
                    const Text(
                      'Pilih Tanggal',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    InkWell(
                      onTap: () => _selectDate(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 15),
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
                      'Pilih Sesi',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<String>(
                      value: _selectedSession,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      items: _sessions.map((session) {
                        return DropdownMenuItem<String>(
                          value: session,
                          child: Text(session),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedSession = value!;
                        });
                      },
                    ),
                    const SizedBox(height: 32),

                    // Buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: _isLoading
                                ? null
                                : () => Navigator.pop(context),
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
                            onPressed: _isLoading ? null : _updateDailyFeedSchedule,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: const Color(0xFF17A2B8),
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(vertical: 15),
                            ),
                            child: _isLoading
                                ? const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Colors.white,
                                    ),
                                  )
                                : const Text('Perbarui', style: TextStyle(fontSize: 16)),
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