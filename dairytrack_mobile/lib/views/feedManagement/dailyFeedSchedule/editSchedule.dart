import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../controller/APIURL4/dailyScheduleController.dart';
import '../../../controller/APIURL1/cowManagementController.dart';
import '../model/dailyFeed.dart';

class EditDailyFeedForm extends StatefulWidget {
  final DailyFeed feed;
  final List<Cow> cows;
  final DailyFeedManagementController controller;
  final int userId;
  final String? userRole;
  final VoidCallback onUpdate;
  final Function(String) onError;

  const EditDailyFeedForm({
    super.key,
    required this.feed,
    required this.cows,
    required this.controller,
    required this.userId,
    this.userRole,
    required this.onUpdate,
    required this.onError,
  });

  @override
  _EditDailyFeedFormState createState() => _EditDailyFeedFormState();
}

class _EditDailyFeedFormState extends State<EditDailyFeedForm> {
  final _formKey = GlobalKey<FormState>();
  int? _cowId;
  String _date = '';
  bool _isSubmitting = false;
  late Map<String, bool> _sessions;
  bool _showCowDropdown = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      try {
        // Validate and parse feed.date
        DateTime.parse(widget.feed.date);
        setState(() {
          _cowId = widget.feed.cowId;
          _date = widget.feed.date;
          _sessions = {
            'Pagi': widget.feed.session == 'Pagi',
            'Siang': widget.feed.session == 'Siang',
            'Sore': widget.feed.session == 'Sore',
          };
        });
        print('Initialized date: $_date');
      } catch (e) {
        print('Error parsing feed.date: ${widget.feed.date}, error: $e');
        widget.onError('Tanggal pakan tidak valid: ${widget.feed.date}');
        setState(() {
          // Fallback to current date
          _date = DateFormat('yyyy-MM-dd').format(DateTime.now());
          _cowId = widget.feed.cowId;
          _sessions = {
            'Pagi': widget.feed.session == 'Pagi',
            'Siang': widget.feed.session == 'Siang',
            'Sore': widget.feed.session == 'Sore',
          };
        });
      }
    });
  }

  Future<bool> _showSweetAlert({
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
          padding: const EdgeInsets.all(16),
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
                size: 40,
              ),
              const SizedBox(height: 12),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.teal,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                message,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, color: Colors.black87),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(false),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey.shade300,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      "Cancel",
                      style: TextStyle(color: Colors.black87),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => Navigator.of(context).pop(true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      "Confirm",
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

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      final activeSessions = _sessions.entries
          .where((entry) => entry.value)
          .map((entry) => entry.key)
          .toList();

      if (_cowId == null) {
        widget.onError('Harap pilih sapi.');
        return;
      }

      if (activeSessions.isEmpty) {
        widget.onError('Pilih setidaknya satu sesi.');
        return;
      }

      if (activeSessions.length > 1) {
        widget.onError('Hanya satu sesi yang dapat dipilih untuk pengeditan.');
        return;
      }

      final selectedSession = activeSessions.first;
      String formattedDate;
      try {
        final parsedDate = DateTime.parse(_date);
        formattedDate = DateFormat('dd MMMM yyyy', 'id').format(parsedDate);
      } catch (e) {
        print('Error parsing date in submit: $_date, error: $e');
        widget.onError('Tanggal tidak valid: $_date');
        return;
      }

      final confirm = await _showSweetAlert(
        title: "Edit Jadwal Pakan",
        message: "Apakah Anda yakin ingin menyimpan perubahan untuk jadwal pakan pada $formattedDate sesi $selectedSession?",
      );

      if (!confirm) return;

      setState(() => _isSubmitting = true);
      try {
        final response = await widget.controller.updateDailyFeed(
          id: widget.feed.id,
          cowId: _cowId!,
          date: _date,
          session: selectedSession,
          userId: widget.userId,
          items: [],
        );
        if (!mounted) return;
        if (response['success']) {
          widget.onUpdate();
          Navigator.of(context).pop();
        } else {
          widget.onError(response['message'] ?? 'Gagal memperbarui jadwal pakan.');
        }
      } catch (e) {
        if (!mounted) return;
        widget.onError('Error updating daily feed: $e');
      } finally {
        if (mounted) {
          setState(() => _isSubmitting = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      child: Container(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: const BoxDecoration(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          physics: const ClampingScrollPhysics(),
          child: Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 16,
              right: 16,
              top: 16,
            ),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        "Edit Jadwal Pakan: ${widget.feed.cowName}",
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.teal,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.grey),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      child: Column(
                        children: [
                          GestureDetector(
                            onTap: () {
                              setState(() {
                                _showCowDropdown = !_showCowDropdown;
                              });
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey[300]!),
                                borderRadius: BorderRadius.circular(8),
                                color: Colors.teal.shade50,
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      _cowId == null
                                          ? 'Pilih Sapi'
                                          : widget.cows.firstWhere((cow) => cow.id == _cowId).name,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: _cowId == null ? Colors.grey[600] : Colors.black,
                                      ),
                                    ),
                                  ),
                                  Icon(
                                    _showCowDropdown ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                                    color: Colors.teal,
                                  ),
                                ],
                              ),
                            ),
                          ),
                          if (_showCowDropdown)
                            Card(
                              elevation: 4,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                              child: Container(
                                constraints: const BoxConstraints(maxHeight: 150),
                                width: double.infinity,
                                child: ListView(
                                  shrinkWrap: true,
                                  children: widget.cows.map((cow) {
                                    return ListTile(
                                      title: Text(
                                        cow.name,
                                        style: const TextStyle(fontSize: 12),
                                      ),
                                      onTap: () {
                                        setState(() {
                                          _cowId = cow.id;
                                          _showCowDropdown = false;
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
                  const SizedBox(height: 12),
                  TextFormField(
                    readOnly: true,
                    decoration: InputDecoration(
                      labelText: 'Tanggal',
                      hintText: 'Pilih tanggal',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      prefixIcon: const Icon(Icons.calendar_today, color: Colors.teal),
                      filled: true,
                      fillColor: Colors.teal.shade50,
                    ),
                    controller: TextEditingController(
                      text: _date.isEmpty ? '' : DateFormat('dd MMM yyyy', 'id').format(DateTime.parse(_date)),
                    ),
                    onTap: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: _date.isEmpty ? DateTime.now() : DateTime.parse(_date),
                        firstDate: DateTime(2000),
                        lastDate: DateTime.now(),
                        builder: (context, child) {
                          return Theme(
                            data: ThemeData.light().copyWith(
                              primaryColor: Colors.teal,
                              colorScheme: const ColorScheme.light(primary: Colors.teal),
                              buttonTheme: const ButtonThemeData(textTheme: ButtonTextTheme.primary),
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (picked != null && mounted) {
                        setState(() {
                          _date = DateFormat('yyyy-MM-dd').format(picked);
                          print('Selected date: $_date');
                        });
                      }
                    },
                    validator: (value) => value == null || value.isEmpty ? 'Harap pilih tanggal' : null,
                  ),
                  const SizedBox(height: 12),
                  Card(
                    elevation: 2,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Sesi',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.teal,
                            ),
                          ),
                          const SizedBox(height: 8),
                          ..._sessions.entries.map((entry) => CheckboxListTile(
                                contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                                title: Text(entry.key, style: const TextStyle(fontSize: 12)),
                                value: entry.value,
                                onChanged: (value) {
                                  setState(() {
                                    _sessions = {
                                      'Pagi': false,
                                      'Siang': false,
                                      'Sore': false,
                                    };
                                    _sessions[entry.key] = value!;
                                  });
                                },
                                activeColor: Colors.teal,
                                controlAffinity: ListTileControlAffinity.leading,
                                dense: true,
                              )),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      onPressed: _isSubmitting ? null : _submit,
                      child: _isSubmitting
                          ? const CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            )
                          : const Text(
                              "Simpan",
                              style: TextStyle(color: Colors.white, fontSize: 14),
                            ),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
