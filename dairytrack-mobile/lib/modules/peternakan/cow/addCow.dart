import 'package:dairy_track/config/api/peternakan/farmer.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';

class AddCow extends StatefulWidget {
  @override
  _AddCowState createState() => _AddCowState();
}

class _AddCowState extends State<AddCow> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _breedController;
  late TextEditingController _weightController;
  String? selectedGender;
  String? selectedLactationPhase;
  String? selectedReproductiveStatus;
  bool lactationStatus = false;
  DateTime? selectedBirthDate;
  DateTime? selectedEntryDate;

  // Variables for farmer dropdown
  List<Peternak> farmers = [];
  int? selectedFarmerId;
  bool isLoadingFarmers = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _breedController = TextEditingController();
    _weightController = TextEditingController();
    selectedGender = null;
    selectedLactationPhase = 'Dry';
    lactationStatus = false;
    selectedBirthDate = null;
    selectedEntryDate = null;
    selectedFarmerId = null;

    // Load farmers data
    loadFarmers();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _breedController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  void loadFarmers() async {
    setState(() => isLoadingFarmers = true);
    try {
      final List<Peternak> response = await getFarmers();
      setState(() {
        farmers = response;
      });
    } catch (e) {
      _showErrorDialog(context, 'Gagal memuat data peternak: $e');
    } finally {
      setState(() => isLoadingFarmers = false);
    }
  }

  Future<void> addCowDetails(BuildContext context) async {
    if (!_formKey.currentState!.validate()) return;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      final cow = Cow(
        farmerId: selectedFarmerId,
        name: _nameController.text,
        breed: _breedController.text,
        birthDate: selectedBirthDate ?? DateTime.now(),
        lactationStatus: lactationStatus,
        lactationPhase: selectedGender == 'Male' ? '-' : selectedLactationPhase,
        weight_kg: double.tryParse(_weightController.text) ?? 0.0,
        gender: selectedGender ?? 'Unknown',
        reproductiveStatus:
            selectedReproductiveStatus ?? 'Open', // Tambahkan ini

        entryDate: selectedEntryDate ?? DateTime.now(),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      print('Selected Farmer ID: $selectedFarmerId');
      if (selectedFarmerId == null) {
        _showErrorDialog(context, 'Harap pilih peternak.');
        return;
      }
      final response = await addCow(cow);

      Navigator.of(context).pop();

      if (response) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.green),
                SizedBox(width: 8),
                Text('Sukses'),
              ],
            ),
            content: const Text('Data sapi berhasil ditambahkan.'),
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
        _showErrorDialog(context, 'Gagal menambahkan data sapi.');
      }
    } catch (e) {
      Navigator.of(context).pop();
      _showErrorDialog(context, 'Terjadi kesalahan: $e');
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
        title: const Text('Tambah Sapi',
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
                _buildSectionHeader('Informasi Sapi'),
                _buildCard(
                  child: Column(
                    children: [
                      _buildTextFormField(
                        controller: _nameController,
                        label: 'Nama',
                        hint: 'Masukkan nama sapi',
                        icon: Icons.label,
                        isRequired: true,
                      ),
                      const SizedBox(height: 12),
                      _buildBreedInputField(),
                      const SizedBox(height: 12),
                      _buildDropdownField(
                        label: 'Reproductive Status',
                        icon: Icons.local_parking_outlined,
                        items: selectedGender == 'Male'
                            ? ['-']
                            : ['Open', 'Pregnant'],
                        selectedValue: selectedReproductiveStatus,
                        onChanged: (value) {
                          setState(() {
                            selectedReproductiveStatus = value;
                          });
                        },
                        isDisabled: selectedGender == 'Male',
                      ),
                      const SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _weightController,
                        label: 'Berat (kg)',
                        hint: 'Masukkan berat sapi',
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
                      _buildDropdownField(
                        label: 'Jenis Kelamin',
                        icon: Icons.transgender,
                        items: ['Male', 'Female'],
                        selectedValue: selectedGender,
                        onChanged: (value) {
                          setState(() {
                            selectedGender = value;
                            if (value == 'Male') {
                              selectedReproductiveStatus = '-';
                            } else {
                              selectedReproductiveStatus =
                                  null; // Reset jika Female
                            }
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildFarmerDropdown(),
                      const SizedBox(height: 12),
                      _buildDatePickerField(
                        label: 'Tanggal Lahir',
                        selectedDate: selectedBirthDate,
                        onDateSelected: (date) {
                          setState(() {
                            selectedBirthDate = date;
                          });
                        },
                      ),
                      const SizedBox(height: 12),
                      _buildDatePickerField(
                        label: 'Tanggal Masuk',
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
                _buildSectionHeader('Informasi Laktasi'),
                _buildCard(
                  child: Column(
                    children: [
                      SwitchListTile(
                        title: const Text('Status Laktasi'),
                        value: lactationStatus,
                        onChanged: selectedGender == 'Male'
                            ? null
                            : (value) {
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
                          labelText: 'Fase Laktasi',
                          prefixIcon: Icon(Icons.timeline,
                              color: const Color(0xFF5D90E7)),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          filled: true,
                          fillColor: Colors.grey.shade50,
                        ),
                        value: selectedGender == 'Male'
                            ? '-'
                            : selectedLactationPhase,
                        items: selectedGender == 'Male'
                            ? [
                                DropdownMenuItem(
                                  value: '-',
                                  child: Text('-'),
                                )
                              ]
                            : (lactationStatus
                                    ? ['Early', 'Mid', 'Late']
                                    : ['Dry'])
                                .map((phase) {
                                return DropdownMenuItem(
                                  value: phase,
                                  child: Text(phase),
                                );
                              }).toList(),
                        onChanged: selectedGender == 'Male'
                            ? null
                            : (value) {
                                setState(() {
                                  selectedLactationPhase = value;
                                });
                              },
                        validator: (value) {
                          if (selectedGender != 'Male' &&
                              (value == null || value.isEmpty)) {
                            return 'Pilih fase laktasi';
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

  Widget _buildBreedInputField() {
    return TextFormField(
      controller: _breedController..text = 'Girolando',
      decoration: InputDecoration(
        labelText: 'Jenis Sapi',
        hintText: 'Masukkan jenis sapi',
        prefixIcon: Icon(Icons.category, color: const Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      enabled: false,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Field ini wajib diisi';
        }
        return null;
      },
    );
  }

  Widget _buildFarmerDropdown() {
    if (isLoadingFarmers) {
      return const CircularProgressIndicator();
    }

    final dropdownItems = [
      const DropdownMenuItem<int>(
        value: null,
        child: Text(
          'Pilih Peternak',
          style: TextStyle(color: Color.fromARGB(255, 118, 116, 116)),
        ),
      ),
      ...farmers.map((farmer) {
        return DropdownMenuItem<int>(
          value: farmer.id,
          child: Text('${farmer.firstName} ${farmer.lastName}'),
        );
      }).toList(),
    ];

    return DropdownButtonFormField<int>(
      decoration: InputDecoration(
        labelText: 'Peternak',
        prefixIcon: Icon(Icons.person, color: const Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      value: selectedFarmerId,
      items: dropdownItems,
      onChanged: (value) {
        setState(() {
          selectedFarmerId = value;
        });
      },
      validator: (value) {
        if (value == null) {
          return 'Harap pilih peternak';
        }
        return null;
      },
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
                return 'Field ini wajib diisi';
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
    bool isDisabled = false,
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
      onChanged: isDisabled ? null : onChanged,
      validator: (value) {
        if (!isDisabled && (value == null || value.isEmpty)) {
          return 'Pilih $label';
        }
        return null;
      },
      disabledHint: Text(selectedValue ?? '-'),
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
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Pilih tanggal $label';
        }
        return null;
      },
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
          await addCowDetails(context);
        }
      },
      child: const Text(
        'Simpan Data Sapi',
        style: TextStyle(
            fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
      ),
    );
  }
}
