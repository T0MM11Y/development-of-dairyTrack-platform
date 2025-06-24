import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL3/symptomController.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

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
  Map<String, dynamic>? _currentUser;

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

  bool get _isSupervisor => _currentUser?['role_id'] == 2;
  bool get _isFarmer => _currentUser?['role_id'] == 3;

  @override
  void initState() {
    super.initState();
    _loadCurrentUser();
    _loadSymptom();
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
        _error = '❌ Failed to load data.';
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
    final backgroundColor = _isFarmer
        ? Colors.teal[400]
        : _isSupervisor
            ? Colors.blue[700]
            : Colors.blueGrey[800];

    return Scaffold(
      backgroundColor: const Color(0xFFf5f7fa),
      appBar: AppBar(
        centerTitle: true,
        elevation: 0,
        backgroundColor: backgroundColor,
        title: const Text(
          'Symptom Details',
          style: TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 20,
            color: Colors.white,
            shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            tooltip: 'Close',
            onPressed: widget.onClose,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(
                  child: Text(
                    _error!,
                    style: const TextStyle(color: Colors.red, fontWeight: FontWeight.w600),
                  ),
                )
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
                        elevation: 3,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Icon(
                                isNormal ? Icons.check_circle : Icons.warning_amber_rounded,
                                color: isNormal ? Colors.green[600] : Colors.orange[700],
                                size: 28,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      _formatLabel(key),
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      isNormal ? 'Normal' : value!,
                                      style: TextStyle(
                                        color: isNormal ? Colors.black87 : Colors.red[800],
                                        fontSize: 14,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
