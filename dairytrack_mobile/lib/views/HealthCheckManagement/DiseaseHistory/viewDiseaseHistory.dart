import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ViewDiseaseHistoryView extends StatefulWidget {
  final Map<String, dynamic> history;
  final Map<String, dynamic> check;
  final Map<String, dynamic> symptom;
  final Map<String, dynamic>? cow;

  const ViewDiseaseHistoryView({
    super.key,
    required this.history,
    required this.check,
    required this.symptom,
    required this.cow,
  });

  @override
  State<ViewDiseaseHistoryView> createState() => _ViewDiseaseHistoryViewState();
}

class _ViewDiseaseHistoryViewState extends State<ViewDiseaseHistoryView> {
  Map<String, dynamic>? _currentUser;

  bool get _isSupervisor => _currentUser?['role_id'] == 2;
  bool get _isFarmer => _currentUser?['role_id'] == 3;

  @override
  void initState() {
    super.initState();
    _loadCurrentUser();
  }

  Future<void> _loadCurrentUser() async {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');
    if (userString != null) {
      setState(() {
        _currentUser = jsonDecode(userString);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Detail Disease History',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
            shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
          ),
        ),
        centerTitle: true,
        elevation: 8,
        backgroundColor: _isFarmer
            ? Colors.teal[400]
            : _isSupervisor
                ? Colors.blue[700]
                : Colors.blueGrey[800],
      ),
      body: _currentUser == null
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionCard(
                    title: '🐄 Cow Information',
                    children: [
                      _infoTile(
                        'Cow Name',
                        widget.cow != null
                            ? '${widget.cow!['name']} (${widget.cow!['breed']})'
                            : 'Cow not found',
                      ),
                    ],
                  ),
                  _sectionCard(
                    title: '📋 Health Check Details',
                    children: widget.check.isEmpty
                        ? [const Text('Health check data not available.')]
                        : [
                            _infoTile('🌡️ Rectal Temperature', '${widget.check['rectal_temperature']} °C'),
                            _infoTile('❤️ Heart Rate', '${widget.check['heart_rate']} bpm'),
                            _infoTile('🫁 Respiration', '${widget.check['respiration_rate']} bpm'),
                            _infoTile('🐄 Rumination', '${widget.check['rumination']} menit'),
                            _infoTile(
                              '🕒 Checkup Date',
                              DateFormat('dd MMM yyyy, HH:mm', 'id_ID')
                                      .format(DateTime.parse(widget.check['checkup_date']).toLocal()) +
                                  ' WIB',
                            ),
                          ],
                  ),
                  _sectionCard(
                    title: '🦠 Symptom',
                    children: widget.symptom.entries
                        .where((entry) =>
                            !['id', 'health_check', 'created_at', 'created_by', 'edited_by']
                                .contains(entry.key) &&
                            entry.value != null &&
                            entry.value.toString().toLowerCase() != 'normal')
                        .map((entry) => _infoTile(
                              _capitalize(entry.key.replaceAll('_', ' ')),
                              entry.value.toString(),
                            ))
                        .toList()
                      ..addIf(
                        widget.symptom.entries.every(
                            (e) => e.value.toString().toLowerCase() == 'normal'),
                        const Text(
                          'No symptoms recorded.',
                          style: TextStyle(fontStyle: FontStyle.italic),
                        ),
                      ),
                  ),
                  _sectionCard(
                    title: '📝 Description',
                    children: [
                      Text(
                        widget.history['description']?.toString().trim().isNotEmpty == true
                            ? widget.history['description']
                            : 'No description available.',
                        style: const TextStyle(fontSize: 14),
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Widget _sectionCard({
    required String title,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ...children,
          ],
        ),
      ),
    );
  }

  Widget _infoTile(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 4,
            child: Text(label, style: const TextStyle(color: Colors.black54)),
          ),
          const SizedBox(width: 8),
          Expanded(
            flex: 6,
            child: Text(value,
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  String _capitalize(String input) {
    return input
        .split(' ')
        .map((word) =>
            word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1)}' : '')
        .join(' ');
  }
}

extension ListWidgetUtils on List<Widget> {
  void addIf(bool condition, Widget widget) {
    if (condition) add(widget);
  }
}
