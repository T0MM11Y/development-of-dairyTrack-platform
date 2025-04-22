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
      "Kotoran terlalu keras atau terlalu cair (mencret)",
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
      "Kulit tidak bersih (cemerlang)",
      "Terdapat benjolan atau bentol-bentol",
      "Terdapat luka pada kulit",
      "Terdapat banyak kutu",
    ],
    "behavior": [
      "Normal",
      "Nafsu makan berkurang",
      "Memisahkan diri dari kawanan",
      "Sering duduk/tidur",
    ],
    "weight_condition": [
      "Normal",
      "Penurunan bobot",
      "Tulang terlihat karena ADG menurun",
    ],
    "reproductive_condition": [
      "Normal",
      "Sulit buang air kecil",
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
  if (!mounted) return;
  setState(() => isLoading = true);
  
  try {
    final result = await getSymptomById(widget.symptomId);
    if (!mounted) return;
    setState(() {
      form = result;
      error = null;
    });
  } catch (e) {
    if (!mounted) return;
    setState(() {
      error = 'Gagal mengambil data gejala.';
    });
  } finally {
    if (!mounted) return;
    setState(() => isLoading = false);
  }
}


  Future<void> submitForm() async {
    if (form == null) return;

    setState(() => isSubmitting = true);

    try {
      final result = await updateSymptom(widget.symptomId, form!.toJson());
      if (result) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Data gejala berhasil diperbarui')),
        );
        widget.onSaved(); // ⬅️ Kalau sukses, tutup atau reload
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Gagal memperbarui data gejala')));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Terjadi kesalahan')),
      );
    } finally {
      setState(() => isSubmitting = false);
    }
  }

  String? getFieldValue(String key) {
    switch (key) {
      case "eye_condition":
        return form?.eyeCondition ?? "Normal";
      case "mouth_condition":
        return form?.mouthCondition ?? "Normal";
      case "nose_condition":
        return form?.noseCondition ?? "Normal";
      case "anus_condition":
        return form?.anusCondition ?? "Normal";
      case "leg_condition":
        return form?.legCondition ?? "Normal";
      case "skin_condition":
        return form?.skinCondition ?? "Normal";
      case "behavior":
        return form?.behavior ?? "Normal";
      case "weight_condition":
        return form?.weightCondition ?? "Normal";
      case "reproductive_condition":
        return form?.reproductiveCondition ?? "Normal";
      default:
        return "Normal";
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

  @override
 Widget build(BuildContext context) {
  return Dialog(
    insetPadding: const EdgeInsets.all(16),
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
    child: ConstrainedBox(
      constraints: const BoxConstraints(maxHeight: 600),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Edit Gejala',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
                IconButton(
                  onPressed: widget.onClose,
                  icon: const Icon(Icons.close, color: Colors.grey),
                ),
              ],
            ),
            const Divider(thickness: 1),
            const SizedBox(height: 8),

            // Body
            Expanded(
              child: isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : error != null
                      ? Center(
                          child: Text(
                            error!,
                            style: const TextStyle(color: Colors.red, fontSize: 16),
                          ),
                        )
                      : SingleChildScrollView(
                          child: Form(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: selectOptions.entries.map((entry) {
                                final key = entry.key;
                                final options = entry.value;
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 16),
                                  child: DropdownButtonFormField<String>(
                                    isExpanded: true,
                                    decoration: InputDecoration(
                                      labelText: key.replaceAll('_', ' ').toUpperCase(),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                                    ),
                                    value: options.contains(getFieldValue(key))
                                        ? getFieldValue(key)
                                        : options.first, // Default "Normal" kalau tidak cocok
                                    items: options.map((val) {
                                      return DropdownMenuItem<String>(
                                        value: val,
                                        child: Text(
                                          val,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      );
                                    }).toList(),
                                    onChanged: (value) => setFieldValue(key, value),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ),
            ),

            const SizedBox(height: 16),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isSubmitting ? null : submitForm,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: isSubmitting
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Perbarui Data',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
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
