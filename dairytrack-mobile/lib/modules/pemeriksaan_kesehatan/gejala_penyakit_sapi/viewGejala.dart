import 'package:dairy_track/config/api/kesehatan/symptom.dart';
import 'package:dairy_track/model/kesehatan/symptom.dart';
import 'package:flutter/material.dart';

class viewGejala extends StatefulWidget {
  final int symptomId;
  final VoidCallback onClose;

  const viewGejala({
    Key? key,
    required this.symptomId,
    required this.onClose,
  }) : super(key: key);

  @override
  _ViewGejalaState createState() => _ViewGejalaState();
}

class _ViewGejalaState extends State<viewGejala> {
  Symptom? data;
  bool isLoading = true;
  String? error;

  final List<String> fieldOrder = [
    "eye_condition",
    "mouth_condition",
    "nose_condition",
    "anus_condition",
    "leg_condition",
    "skin_condition",
    "behavior",
    "weight_condition",
    "reproductive_condition",
  ];

  @override
  void initState() {
    super.initState();
    fetchSymptom();
  }

  Future<void> fetchSymptom() async {
    try {
      final result = await getSymptomById(widget.symptomId);
      setState(() {
        data = result;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal memuat data gejala.';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  String renderFieldLabel(String key) {
    return key.replaceAll('_', ' ').split(' ').map((word) {
      return word[0].toUpperCase() + word.substring(1);
    }).join(' ');
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        constraints: const BoxConstraints(maxHeight: 600),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Detail Gejala',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blue),
                ),
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const Divider(),
            if (isLoading)
              const Expanded(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (error != null)
              Expanded(
                child: Center(child: Text(error!, style: TextStyle(color: Colors.red))),
              )
            else if (data != null)
              Expanded(
                child: SingleChildScrollView(
                  child: Table(
                    border: TableBorder.all(color: Colors.grey.shade300),
                    columnWidths: const {
                      0: FlexColumnWidth(2),
                      1: FlexColumnWidth(3),
                    },
                    children: fieldOrder.map((key) {
                      final value = getFieldValue(key);
                      return TableRow(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(
                              renderFieldLabel(key),
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: Text(value),
                          ),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String getFieldValue(String key) {
    switch (key) {
      case "eye_condition":
        return data?.eyeCondition ?? 'Normal';
      case "mouth_condition":
        return data?.mouthCondition ?? 'Normal';
      case "nose_condition":
        return data?.noseCondition ?? 'Normal';
      case "anus_condition":
        return data?.anusCondition ?? 'Normal';
      case "leg_condition":
        return data?.legCondition ?? 'Normal';
      case "skin_condition":
        return data?.skinCondition ?? 'Normal';
      case "behavior":
        return data?.behavior ?? 'Normal';
      case "weight_condition":
        return data?.weightCondition ?? 'Normal';
      case "reproductive_condition":
        return data?.reproductiveCondition ?? 'Normal';
      default:
        return '-';
    }
  }
}
