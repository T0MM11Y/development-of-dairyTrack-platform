import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../controller/APIURL4/dailyScheduleController.dart';
import '../../../controller/APIURL1/cowManagementController.dart';

class AddDailyFeedForm extends StatefulWidget {
  final List<Cow> cows;
  final String defaultDate;
  final DailyFeedManagementController controller;
  final int userId;
  final String? userRole;
  final VoidCallback onAdd;
  final Function(String) onError;

  const AddDailyFeedForm({
    super.key,
    required this.cows,
    required this.defaultDate,
    required this.controller,
    required this.userId,
    this.userRole,
    required this.onAdd,
    required this.onError,
  });

  @override
  _AddDailyFeedFormState createState() => _AddDailyFeedFormState();
}

class _AddDailyFeedFormState extends State<AddDailyFeedForm> {
  final _formKey = GlobalKey<FormState>();
  int? _cowId;
  String _date = '';
  Map<String, bool> _sessions = {'Pagi': false, 'Siang': false, 'Sore': false};
  String _weather = '';
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _date = widget.defaultDate;
    if (widget.cows.isNotEmpty) {
      _cowId = widget.cows.first.id;
    }
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      setState(() => _isSubmitting = true);
      try {
        final selectedSessions = _sessions.entries
            .where((entry) => entry.value)
            .map((entry) => entry.key)
            .toList();

        if (_cowId == null) {
          widget.onError('Harap pilih sapi.');
          setState(() => _isSubmitting = false);
          return;
        }

        if (selectedSessions.isEmpty) {
          widget.onError('Pilih setidaknya satu sesi.');
          setState(() => _isSubmitting = false);
          return;
        }

        for (final session in selectedSessions) {
          final response = await widget.controller.createDailyFeed(
            cowId: _cowId!,
            date: _date,
            session: session,
            userId: widget.userId,// Default to 'Cerah' if empty
            items: [],
          );
          if (!mounted) return;
          if (!response['success']) {
            widget.onError(response['message'] ?? 'Gagal membuat jadwal pakan.');
            setState(() => _isSubmitting = false);
            return;
          }
        }

        widget.onAdd();
      } catch (e) {
        if (!mounted) return;
        widget.onError('Error creating daily feed: $e');
      } finally {
        if (mounted) {
          setState(() => _isSubmitting = false);
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Tambah Jadwal Pakan',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade600,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DropdownButtonFormField<int>(
                  decoration: InputDecoration(
                    labelText: 'Sapi',
                    labelStyle: const TextStyle(color: Colors.black87),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.teal.shade100),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          BorderSide(color: Colors.teal.shade400, width: 2),
                    ),
                    prefixIcon: const Icon(Icons.pets, color: Colors.teal),
                  ),
                  value: _cowId,
                  items: widget.cows.map((cow) {
                    return DropdownMenuItem<int>(
                      value: cow.id,
                      child: Text(cow.name),
                    );
                  }).toList(),
                  onChanged: (value) {
                    setState(() {
                      _cowId = value;
                    });
                  },
                  validator: (value) =>
                      value == null ? 'Harap pilih sapi' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  readOnly: true,
                  decoration: InputDecoration(
                    labelText: 'Tanggal',
                    labelStyle: const TextStyle(color: Colors.black87),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.teal.shade100),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          BorderSide(color: Colors.teal.shade400, width: 2),
                    ),
                    prefixIcon:
                        const Icon(Icons.calendar_today, color: Colors.teal),
                  ),
                  controller: TextEditingController(
                    text: DateFormat('dd MMM yyyy').format(DateTime.parse(_date)),
                  ),
                  onTap: () async {
                    final DateTime? picked = await showDatePicker(
                      context: context,
                      initialDate: DateTime.parse(_date),
                      firstDate: DateTime(2000),
                      lastDate: DateTime.now(),
                    );
                    if (picked != null && mounted) {
                      setState(() {
                        _date = DateFormat('yyyy-MM-dd').format(picked);
                      });
                    }
                  },
                  validator: (value) => value == null || value.isEmpty
                      ? 'Harap pilih tanggal'
                      : null,
                ),
                const SizedBox(height: 12),
                const Text(
                  'Sesi',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87),
                ),
                const SizedBox(height: 8),
                ..._sessions.entries.map((entry) => CheckboxListTile(
                      title: Text(entry.key),
                      value: entry.value,
                      onChanged: (value) {
                        setState(() {
                          _sessions[entry.key] = value!;
                        });
                      },
                      activeColor: Colors.teal,
                      controlAffinity: ListTileControlAffinity.leading,
                    )),
                const SizedBox(height: 12),
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Cuaca',
                    hintText: 'Masukkan cuaca (misalnya, Cerah)',
                    labelStyle: const TextStyle(color: Colors.black87),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: Colors.teal.shade100),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide:
                          BorderSide(color: Colors.teal.shade400, width: 2),
                    ),
                    prefixIcon: const Icon(Icons.cloud, color: Colors.teal),
                  ),
                  onChanged: (value) => _weather = value,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isSubmitting ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.teal.shade600,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: _isSubmitting
                        ? const CircularProgressIndicator(
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          )
                        : const Text(
                            'Simpan',
                            style: TextStyle(color: Colors.white, fontSize: 16),
                          ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ),
    );
  }
}