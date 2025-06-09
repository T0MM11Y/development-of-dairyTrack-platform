import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class ViewDiseaseHistoryView extends StatelessWidget {
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
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Riwayat Penyakit'),
        centerTitle: true,
        elevation: 0,
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFFe0eafc), Color(0xFFcfdef3)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionCard(
              title: '🐄 Informasi Sapi',
              children: [
                _infoTile(
                  'Nama Sapi',
                  cow != null
                      ? '${cow!['name']} (${cow!['breed']})'
                      : 'Sapi tidak ditemukan',
                ),
              ],
            ),
            _sectionCard(
              title: '📋 Detail Pemeriksaan',
              children: check.isEmpty
                  ? [const Text('Data pemeriksaan tidak tersedia.')]
                  : [
                      _infoTile('🌡️ Suhu Rektal', '${check['rectal_temperature']} °C'),
                      _infoTile('❤️ Denyut Jantung', '${check['heart_rate']} bpm'),
                      _infoTile('🫁 Pernapasan', '${check['respiration_rate']} bpm'),
                      _infoTile('🐄 Ruminasi', '${check['rumination']} menit'),
                      _infoTile(
                        '🕒 Tanggal Periksa',
                        DateFormat('dd MMM yyyy, HH:mm', 'id_ID')
                                .format(DateTime.parse(check['checkup_date']).toLocal()) +
                            ' WIB',
                      ),
                    ],
            ),
            _sectionCard(
              title: '🦠 Gejala',
              children: symptom.entries
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
                  symptom.entries.every(
                      (e) => e.value.toString().toLowerCase() == 'normal'),
                  const Text(
                    'Tidak ada gejala dicatat.',
                    style: TextStyle(fontStyle: FontStyle.italic),
                  ),
                ),
            ),
            _sectionCard(
              title: '📝 Deskripsi',
              children: [
                Text(
                  history['description']?.toString().trim().isNotEmpty == true
                      ? history['description']
                      : 'Tidak ada deskripsi.',
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
