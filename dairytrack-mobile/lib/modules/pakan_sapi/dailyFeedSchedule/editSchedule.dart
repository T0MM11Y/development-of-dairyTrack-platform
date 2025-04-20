import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/config/api/peternakan/farmer.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';
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
  int? _selectedFarmerId;
  int? _selectedCowId;
  String _selectedSession = 'pagi'; // Default value

  // Data lists
  List<Peternak> _farmers = [];
  List<Cow> _cows = [];
  final List<String> _sessions = ['pagi', 'siang', 'sore', 'malam'];

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

      // Load farmers and cows data
      final farmersData = await getFarmers();
      final cowsData = await getCows();

      setState(() {
        _farmers = farmersData;
        _cows = cowsData;

        // Set values from the daily feed schedule
        _selectedFarmerId = _dailyFeedSchedule.farmerId;
        _selectedCowId = _dailyFeedSchedule.cowId;
        _selectedDate = _dailyFeedSchedule.date;
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
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
    }
  }

  Future<void> _updateDailyFeedSchedule() async {
    if (_formKey.currentState!.validate()) {
      if (_selectedFarmerId == null || _selectedCowId == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Harap pilih petani dan sapi')),
        );
        return;
      }

      setState(() {
        _isLoading = true;
      });

      try {
        // Create updated daily feed schedule object
        final updatedSchedule = DailyFeedSchedule(
          id: _dailyFeedSchedule.id,
          farmerId: _selectedFarmerId!,
          cowId: _selectedCowId!,
          date: _selectedDate,
          session: _selectedSession,
          weather: _dailyFeedSchedule.weather,
          totalProtein: _dailyFeedSchedule.totalProtein,
          totalEnergy: _dailyFeedSchedule.totalEnergy,
          totalFiber: _dailyFeedSchedule.totalFiber,
          createdAt: _dailyFeedSchedule.createdAt,
          updatedAt: DateTime.now(),
          feedItems: _dailyFeedSchedule.feedItems,
        );

        // Call API to update
        await updateDailyFeedSchedule(_dailyFeedSchedule.id, updatedSchedule);

        // Show success message
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Jadwal pakan berhasil diperbarui')),
          );
          // Return to previous screen with success result
          Navigator.pop(context, true);
        }
      } catch (e) {
        // Check if it's a duplicate error
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
            SnackBar(content: Text('Gagal memperbarui jadwal: $e')),
          );
        }
      } finally {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _formatSessionDisplay(String session) {
    return session.isNotEmpty
        ? session[0].toUpperCase() + session.substring(1)
        : session;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Jadwal Pakan'),
        backgroundColor: const Color(0xFF17A2B8),
      ),
      body: _isLoading || _isInitializing
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Farmer selection
                    const Text(
                      'Pilih Peternak',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: _selectedFarmerId,
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      items: _farmers.map((farmer) {
                        return DropdownMenuItem<int>(
                          value: farmer.id,
                          child: Text('${farmer.firstName} ${farmer.lastName}'),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedFarmerId = value;
                        });
                      },
                      validator: (value) {
                        if (value == null) {
                          return 'Harap pilih peternak';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

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
                          child: Text(_formatSessionDisplay(session)),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedSession = value!;
                        });
                      },
                    ),
                    const SizedBox(height: 32),

                    // Submit button
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: _updateDailyFeedSchedule,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF17A2B8),
                          foregroundColor: Colors.white,
                        ),
                        child: const Text(
                          'Perbarui',
                          style: TextStyle(fontSize: 16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
