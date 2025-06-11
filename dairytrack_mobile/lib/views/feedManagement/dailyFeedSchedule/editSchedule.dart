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
  String _weather = '';
  bool _isSubmitting = false;
  late Map<String, bool> _sessions;

  @override
  void initState() {
    super.initState();
    _cowId = widget.feed.cowId;
    _date = widget.feed.date;
    _weather = widget.feed.weather;
    _sessions = {
      'Pagi': widget.feed.session == 'Pagi',
      'Siang': widget.feed.session == 'Siang',
      'Sore': widget.feed.session == 'Sore',
    };
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
      final formattedDate = DateFormat('dd MMMM yyyy', 'id').format(DateTime.parse(_date));

      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Konfirmasi Perubahan'),
          content: Text(
            'Apakah Anda yakin ingin menyimpan perubahan untuk jadwal pakan pada $formattedDate sesi $selectedSession?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Ya, Simpan!'),
            ),
          ],
        ),
      );

      if (confirm != true) {
        Navigator.pop(context);
        return;
      }

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
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Edit Jadwal Pakan: ${widget.feed.cowName}',
          style: const TextStyle(
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
                ListTile(
                  leading: const Icon(Icons.tag, color: Colors.teal),
                  title: const Text(
                    'ID',
                    style: TextStyle(
                      color: Colors.black87,
                      fontWeight: FontWeight.w500,
                      fontSize: 16,
                    ),
                  ),
                  subtitle: Text(
                    '${widget.feed.id}',
                    style: const TextStyle(color: Colors.grey),
                  ),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 0),
                ),
                const SizedBox(height: 12),
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
                      borderSide: BorderSide(color: Colors.teal.shade400, width: 2),
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
                  validator: (value) => value == null ? 'Harap pilih sapi' : null,
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
                      borderSide: BorderSide(color: Colors.teal.shade400, width: 2),
                    ),
                    prefixIcon: const Icon(Icons.calendar_today, color: Colors.teal),
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
                  validator: (value) =>
                      value == null || value.isEmpty ? 'Harap pilih tanggal' : null,
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
                    )),
                const SizedBox(height: 12),
                TextFormField(
                  initialValue: _weather,
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
                      borderSide: BorderSide(color: Colors.teal.shade400, width: 2),
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
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          )
                        : const Text(
                            'Simpan Perubahan',
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