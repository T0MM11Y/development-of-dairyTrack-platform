import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/kesehatan/symptom.dart';
import 'package:dairy_track/model/kesehatan/symptom.dart';

class EditGejala extends StatefulWidget {
  final int symptomId;
  final VoidCallback onClose;
  final VoidCallback onSaved;

  const EditGejala({
    Key? key,
    required this.symptomId,
    required this.onClose,
    required this.onSaved,
  }) : super(key: key);

  @override
  _EditGejalaState createState() => _EditGejalaState();
}

class _EditGejalaState extends State<EditGejala> {
  Symptom? form;
  bool isLoading = true;
  bool isSubmitting = false;
  String? error;

  final Map<String, List<String>> selectOptions = {
    "eye_condition": [
      "Normal",
      "Mata merah",
      "Mata tidak cemerlang dan atau tidak bersih",
      "Terdapat kotoran atau lendir pada mata",
    ],
    "mouth_condition": [
      "Normal",
      "Mulut berbusa",
      "Mulut mengeluarkan lendir",
      "Mulut terdapat kotoran (terutama di sudut mulut)",
      "Warna bibir pucat",
      "Mulut berbau tidak enak",
      "Terdapat luka di mulut",
    ],
    "nose_condition": [
      "Normal",
      "Hidung mengeluarkan ingus",
      "Hidung mengeluarkan darah",
      "Di sekitar lubang hidung terdapat kotoran",
    ],
    "anus_condition": [
      "Normal",
      "Kotoran terlihat terlalu keras atau terlalu cair (mencret)",
      "Kotoran terdapat bercak darah",
    ],
    "leg_condition": [
      "Normal",
      "Kaki bengkak",
      "Kaki terdapat luka",
      "Luka pada kuku kaki",
    ],
    "skin_condition": [
      "Normal",
      "Kulit terlihat tidak bersih (cemerlang)",
      "Terdapat benjolan atau bentol-bentol",
      "Terdapat luka pada kulit",
      "Terdapat banyak kutu",
    ],
    "behavior": [
      "Normal",
      "Nafsu makan berkurang, beda dari sapi lain",
      "Memisahkan diri dari kawanannya",
      "Seringkali dalam posisi duduk/tidur",
    ],
    "weight_condition": [
      "Normal",
      "Terjadi penurunan bobot dibandingkan sebelumnya",
      "Terlihat tulang karena ADG semakin menurun",
    ],
    "reproductive_condition": [
      "Normal",
      "Kelamin sulit mengeluarkan urine",
      "Kelamin berlendir",
      "Kelamin berdarah",
    ],
  };

  @override
  void initState() {
    super.initState();
    fetchSymptom();
  }

  Future<void> fetchSymptom() async {
    try {
      final result = await getSymptomById(widget.symptomId);
      setState(() {
        form = result;
      });
    } catch (e) {
      setState(() {
        error = 'Gagal mengambil data gejala.';
      });
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  Future<void> submitForm() async {
    if (form == null) return;

    setState(() {
      isSubmitting = true;
    });

    try {
      await updateSymptom(widget.symptomId, form!.toJson());

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Data gejala berhasil diperbarui')),
      );

      widget.onSaved();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Gagal memperbarui data gejala')),
      );
    } finally {
      setState(() {
        isSubmitting = false;
      });
    }
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
                  'Edit Gejala',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.orange),
                ),
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
            const Divider(),
            if (isLoading)
              const Expanded(child: Center(child: CircularProgressIndicator()))
            else if (error != null)
              Expanded(child: Center(child: Text(error!, style: TextStyle(color: Colors.red))))
            else if (form != null)
              Expanded(
                child: SingleChildScrollView(
                  child: Form(
                    child: Column(
                      children: selectOptions.entries.map((entry) {
                        final key = entry.key;
                        final options = entry.value;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 12),
                          child: DropdownButtonFormField<String>(
                            decoration: InputDecoration(
                              labelText: key.replaceAll('_', ' ').toUpperCase(),
                              border: const OutlineInputBorder(),
                            ),
                            value: getFieldValue(key),
                            items: options.map((value) {
                              return DropdownMenuItem(
                                value: value,
                                child: Text(value),
                              );
                            }).toList(),
                            onChanged: (value) {
                              setState(() {
                                setFieldValue(key, value);
                              });
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: isSubmitting ? null : submitForm,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                minimumSize: const Size(double.infinity, 50),
              ),
              child: isSubmitting
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Perbarui Data', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  String? getFieldValue(String key) {
    switch (key) {
      case "eye_condition":
        return form?.eyeCondition;
      case "mouth_condition":
        return form?.mouthCondition;
      case "nose_condition":
        return form?.noseCondition;
      case "anus_condition":
        return form?.anusCondition;
      case "leg_condition":
        return form?.legCondition;
      case "skin_condition":
        return form?.skinCondition;
      case "behavior":
        return form?.behavior;
      case "weight_condition":
        return form?.weightCondition;
      case "reproductive_condition":
        return form?.reproductiveCondition;
      default:
        return null;
    }
  }

  void setFieldValue(String key, String? value) {
    if (value == null) return;
    setState(() {
      switch (key) {
        case "eye_condition":
          form = form?.copyWith(eyeCondition: value);
          break;
        case "mouth_condition":
          form = form?.copyWith(mouthCondition: value);
          break;
        case "nose_condition":
          form = form?.copyWith(noseCondition: value);
          break;
        case "anus_condition":
          form = form?.copyWith(anusCondition: value);
          break;
        case "leg_condition":
          form = form?.copyWith(legCondition: value);
          break;
        case "skin_condition":
          form = form?.copyWith(skinCondition: value);
          break;
        case "behavior":
          form = form?.copyWith(behavior: value);
          break;
        case "weight_condition":
          form = form?.copyWith(weightCondition: value);
          break;
        case "reproductive_condition":
          form = form?.copyWith(reproductiveCondition: value);
          break;
      }
    });
  }
}
