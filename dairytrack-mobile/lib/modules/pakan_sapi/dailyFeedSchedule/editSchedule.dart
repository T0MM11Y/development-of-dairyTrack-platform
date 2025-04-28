import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
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
  DailyFeedSchedule? _dailyFeedSchedule;
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
    if (mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    try {
      // Get the passed daily feed schedule
      final arguments = ModalRoute.of(context)!.settings.arguments;
      if (arguments == null) {
        throw Exception('No schedule data provided');
      }
      if (arguments is DailyFeedSchedule) {
        _dailyFeedSchedule = arguments;
      } else if (arguments is int) {
        _dailyFeedSchedule = await _fetchScheduleById(arguments);
      } else {
        throw Exception('Invalid argument type: ${arguments.runtimeType}');
      }

      // Load cows data
      final cowsData = await getCows();

      if (mounted) {
        setState(() {
          _cows = cowsData;
          _selectedCowId = _dailyFeedSchedule!.cowId;
          _selectedDate = DateTime.parse(_dailyFeedSchedule!.date);
          _selectedSession = _dailyFeedSchedule!.session;
          _isInitializing = false;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        SchedulerBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Error loading data: $e'),
                backgroundColor: Colors.red,
              ),
            );
          }
        });
        setState(() {
          _isLoading = false;
          _isInitializing = false;
        });
      }
    }
  }

  // Placeholder for fetching schedule by ID (implement as needed)
  Future<DailyFeedSchedule> _fetchScheduleById(int id) async {
    try {
      final schedules = await getAllDailyFeeds();
      return schedules.firstWhere((schedule) => schedule.id == id);
    } catch (e) {
      throw Exception('Failed to fetch schedule with ID $id: $e');
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

    if (picked != null && picked != _selectedDate && mounted) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _updateDailyFeedSchedule() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedCowId == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Harap pilih sapi'),
              backgroundColor: Colors.orange,
            ),
          );
        }
        return;
      }

      if (_dailyFeedSchedule == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Data jadwal tidak tersedia'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }

      // Get old and new values
      final oldCowId = _dailyFeedSchedule!.cowId;
      final oldCowName = _cows
          .firstWhere((cow) => cow.id == oldCowId,
              orElse: () => Cow(id: 0, name: 'Unknown'))
          .name;
      final newCowName = _cows
          .firstWhere((cow) => cow.id == _selectedCowId,
              orElse: () => Cow(id: 0, name: 'Unknown'))
          .name;
      final oldDate = _dailyFeedSchedule!.date;
      final newDate = DateFormat('yyyy-MM-dd').format(_selectedDate);
      final oldSession = _dailyFeedSchedule!.session;
      final newSession = _selectedSession;

      // Detect changes
      final changes = <String>[];
      if (oldCowId != _selectedCowId) {
        changes.add('Sapi: dari $oldCowName menjadi $newCowName');
      }
      if (oldDate != newDate) {
        changes.add('Tanggal: dari ${_formatDate(oldDate)} menjadi ${_formatDate(newDate)}');
      }
      if (oldSession != newSession) {
        changes.add('Sesi: dari $oldSession menjadi $newSession');
      }

      // If no changes, show a message and return
      if (changes.isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tidak ada perubahan pada jadwal pakan'),
              backgroundColor: Colors.grey,
            ),
          );
        }
        return;
      }

      // Show confirmation dialog with only changed fields
      bool? confirm = await showDialog<bool>(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: const Text('Konfirmasi'),
            content: Text(
              'Apakah Anda yakin ingin mengubah:\n${changes.join('\n')}?',
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(context, false), // Cancel
                child: const Text('Batal'),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context, true), // Confirm
                child: const Text('Ya, Perbarui'),
              ),
            ],
          );
        },
      );

      if (confirm != true) {
        return;
      }

      if (mounted) {
        setState(() {
          _isLoading = true;
        });
      }

      bool success = false;
      try {
        await updateDailyFeed(
          id: _dailyFeedSchedule!.id,
          cowId: _selectedCowId,
          date: newDate,
          session: _selectedSession,
        );

        success = true;
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Berhasil mengubah:\n${changes.join('\n')}',
              ),
              backgroundColor: Colors.green,
            ),
          );
        }
      } catch (e) {
        if (mounted) {
          if (e.toString().contains('sudah ada')) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content:
                    Text('${e.toString()}. Silakan gunakan sesi yang berbeda.'),
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
        }
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
        if (success && mounted) {
          Navigator.pop(context, true);
        }
      }
    }
  }

  // Helper to format date for display
  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (e) {
      return dateStr;
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
                            child: const Text('Batal',
                                style: TextStyle(fontSize: 16)),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: _isLoading
                                ? null
                                : _updateDailyFeedSchedule,
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
                                : const Text('Perbarui',
                                    style: TextStyle(fontSize: 16)),
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