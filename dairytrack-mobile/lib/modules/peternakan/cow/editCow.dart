import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';

class EditCow extends StatefulWidget {
  final Cow cow;

  EditCow({required this.cow}) : super(key: ValueKey(cow.id));

  @override
  _EditCowState createState() => _EditCowState();
}

class _EditCowState extends State<EditCow> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _breedController;
  late TextEditingController _weightController;
  String? selectedReproductiveStatus;
  String? selectedLactationPhase;
  bool lactationStatus = false;
  DateTime? selectedBirthDate;
  DateTime? selectedEntryDate;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.cow.name);
    _breedController = TextEditingController(text: widget.cow.breed);
    _weightController =
        TextEditingController(text: widget.cow.weight_kg.toString());
    selectedReproductiveStatus = widget.cow.reproductiveStatus;
    selectedLactationPhase = widget.cow.lactationPhase;
    lactationStatus = widget.cow.lactationStatus;
    selectedBirthDate = widget.cow.birthDate;
    selectedEntryDate = widget.cow.entryDate;
  }

  Future<void> updateCowDetails(BuildContext context, Cow cow) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final response = await updateCow(cow.id.toString(), cow);

      Navigator.of(context).pop();

      if (response) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.green),
                SizedBox(width: 8),
                Text('Success'),
              ],
            ),
            content: const Text('Cow details updated successfully.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  Navigator.pushReplacementNamed(context, '/all-cow');
                },
                child: const Text('OK', style: TextStyle(color: Colors.green)),
              ),
            ],
          ),
        );
      } else {
        _showErrorDialog(context, 'Failed to update cow details.');
      }
    } catch (e) {
      Navigator.of(context).pop();
      _showErrorDialog(context, 'An unexpected error occurred: $e');
    }
  }

  void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: const [
            Icon(Icons.error, color: Colors.red),
            SizedBox(width: 8),
            Text('Error'),
          ],
        ),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Cow Details',
            style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Color(0xFFE8F5E9), Colors.white],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                _buildSectionHeader('Cow Information'),
                _buildCard(
                  child: Column(
                    children: [
                      _buildTextFormField(
                        controller: _nameController,
                        label: 'Name',
                        hint: 'Enter cow name',
                        icon: Icons.label,
                        isRequired: true,
                      ),
                      const SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _breedController,
                        label: 'Breed',
                        hint: 'Enter breed',
                        icon: Icons.category,
                        isRequired: true,
                      ),
                      const SizedBox(height: 12),
                      _buildDropdownField(
                        label: 'Reproductive Status',
                        icon: Icons.local_parking_outlined,
                        items: ['Open', 'Pregnant'],
                        selectedValue: selectedReproductiveStatus,
                        onChanged: (value) {
                          setState(() {
                            selectedReproductiveStatus = value;
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _weightController,
                        label: 'Weight (kg)',
                        hint: 'Enter weight',
                        icon: Icons.monitor_weight,
                        keyboardType: TextInputType.number,
                        isRequired: true,
                      ),
                    ],
                  ),
                ),
                _buildCard(
                  child: Column(
                    children: [
                      _buildDatePickerField(
                        label: 'Birth Date',
                        selectedDate: selectedBirthDate,
                        onDateSelected: (date) {
                          setState(() {
                            selectedBirthDate = date;
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildDatePickerField(
                        label: 'Entry Date',
                        selectedDate: selectedEntryDate,
                        onDateSelected: (date) {
                          setState(() {
                            selectedEntryDate = date;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                _buildSectionHeader('Lactation Information'),
                _buildCard(
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Lactation Status'),
                        value: lactationStatus,
                        onChanged: (value) {
                          setState(() {
                            lactationStatus = value;
                            if (!value) {
                              selectedLactationPhase = 'Dry';
                            } else {
                              selectedLactationPhase = null;
                            }
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        decoration: InputDecoration(
                          labelText: 'Lactation Phase',
                          prefixIcon: Icon(Icons.timeline,
                              color: const Color(0xFF5D90E7)),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                        ),
                        value: lactationStatus ? selectedLactationPhase : 'Dry',
                        items: (lactationStatus
                                ? ['Early', 'Mid', 'Late']
                                : ['Dry'])
                            .map((phase) {
                          return DropdownMenuItem(
                            value: phase,
                            child: Text(phase),
                          );
                        }).toList(),
                        onChanged: lactationStatus
                            ? (value) {
                                setState(() {
                                  selectedLactationPhase = value;
                                });
                              }
                            : null,
                        validator: (value) {
                          if (lactationStatus &&
                              (value == null || value.isEmpty)) {
                            return 'Select lactation phase';
                          }
                          return null;
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                _buildSubmitButton(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12.0),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF5D90E7),
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16.0),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: child,
      ),
    );
  }

  Widget _buildTextFormField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool isRequired = false,
    TextInputType? keyboardType,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(icon, color: const Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      keyboardType: keyboardType ?? TextInputType.text,
      validator: isRequired
          ? (value) {
              if (value == null || value.isEmpty) {
                return 'This field is required';
              }
              return null;
            }
          : null,
    );
  }

  Widget _buildDropdownField({
    required String label,
    required IconData icon,
    required List<String> items,
    required String? selectedValue,
    required Function(String?) onChanged,
  }) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      value: selectedValue,
      items: items
          .map((item) => DropdownMenuItem(
                value: item,
                child: Text(item),
              ))
          .toList(),
      onChanged: onChanged,
    );
  }

  Widget _buildDatePickerField({
    required String label,
    required DateTime? selectedDate,
    required Function(DateTime) onDateSelected,
  }) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: const Icon(Icons.calendar_today, color: Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      readOnly: true,
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: selectedDate ?? DateTime.now(),
          firstDate: DateTime(1900),
          lastDate: DateTime.now(),
        );
        if (date != null) {
          onDateSelected(date);
        }
      },
      controller: TextEditingController(
        text: selectedDate == null
            ? ''
            : DateFormat('dd MMM yyyy').format(selectedDate),
      ),
    );
  }

  Widget _buildSubmitButton() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF5D90E7),
        padding: const EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
      ),
      onPressed: () async {
        if (_formKey.currentState!.validate()) {
          final cow = Cow(
            id: widget.cow.id,
            farmerId: widget.cow.farmerId,
            name: _nameController.text,
            breed: _breedController.text,
            birthDate: selectedBirthDate ?? widget.cow.birthDate,
            lactationStatus: lactationStatus,
            lactationPhase: lactationStatus ? selectedLactationPhase : 'Dry',
            weight_kg: double.tryParse(_weightController.text) ?? 0.0,
            reproductiveStatus:
                selectedReproductiveStatus ?? 'Open', // Tambahkan ini

            gender: widget.cow.gender,
            entryDate: selectedEntryDate ?? widget.cow.entryDate,
            createdAt: widget.cow.createdAt,
            updatedAt: DateTime.now(),
          );

          await updateCowDetails(context, cow);
        }
      },
      child: const Text(
        'Save Changes',
        style: TextStyle(
            fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }
}
