import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';

class SymptomViewPage extends StatefulWidget {
  final int symptomId;
  final VoidCallback onClose;

  const SymptomViewPage({super.key, required this.symptomId, required this.onClose});

  @override
  State<SymptomViewPage> createState() => _SymptomViewPageState();
}

class _SymptomViewPageState extends State<SymptomViewPage> {
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _data;

  final List<String> fieldOrder = [
    'eye_condition',
    'mouth_condition',
    'nose_condition',
    'anus_condition',
    'leg_condition',
    'skin_condition',
    'behavior',
    'weight_condition',
    'reproductive_condition',
  ];

  @override
  void initState() {
    super.initState();
    _loadSymptom();
  }

  Future<void> _loadSymptom() async {
    setState(() => _loading = true);
    try {
      final res = await SymptomController().getSymptomById(widget.symptomId);
      setState(() {
        _data = res['data'] != null ? Map<String, dynamic>.from(res['data']) : {};
        _loading = false;
      });
    } catch (e) {
      setState(() {
        _error = '❌ Gagal memuat data gejala.';
        _loading = false;
      });
    }
  }

  String _formatLabel(String key) {
    return key
        .replaceAll('_', ' ')
        .split(' ')
        .map((word) => word.isNotEmpty ? '${word[0].toUpperCase()}${word.substring(1)}' : '')
        .join(' ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Detail Gejala'),
        centerTitle: true,
        backgroundColor: Colors.green[700],
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: widget.onClose,
          )
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : Padding(
                  padding: const EdgeInsets.all(16),
                  child: ListView.separated(
                    itemCount: fieldOrder.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final key = fieldOrder[index];
                      final value = _data?[key]?.toString().trim();
                      final isNormal = value == null || value.isEmpty || value.toLowerCase() == 'normal';

                      return Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          leading: Icon(
                            isNormal ? Icons.check_circle : Icons.warning_amber_rounded,
                            color: isNormal ? Colors.green : Colors.orange,
                          ),
                          title: Text(
                            _formatLabel(key),
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            isNormal ? 'Normal' : value!,
                            style: TextStyle(
                              color: isNormal ? Colors.black87 : Colors.red[800],
                              fontSize: 14,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
