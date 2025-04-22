import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/produktivitas/rawMilk.dart';
import 'package:dairy_track/model/peternakan/cow.dart'; // Import cow.dart

class AddDataProduksiSusu extends StatefulWidget {
  @override
  _AddDataProduksiSusuState createState() => _AddDataProduksiSusuState();
}

class _AddDataProduksiSusuState extends State<AddDataProduksiSusu> {
  final _formKey = GlobalKey<FormState>();
  Cow? selectedCow;
  DateTime? productionTime;
  final TextEditingController _volumeController = TextEditingController();
  String? selectedLactationPhase;
  bool lactationStatus = false;

  List<Cow> cowList = []; // List to store cows

  @override
  void initState() {
    super.initState();
    _fetchCowList(); // Fetch cow list on initialization
  }

  Future<void> _fetchCowList() async {
    try {
      final cows = await getCows(); // Fetch cows from cow.dart
      setState(() {
        cowList = cows;
      });
    } catch (e) {
      print('Error fetching cows: $e');
    }
  }

  Future<Cow?> _getCowById(int id) async {
    try {
      return await getCowById(id.toString()); // Fetch cow by ID
    } catch (e) {
      print('Error fetching cow by ID: $e');
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Data Produksi Susu',
            style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
        iconTheme: IconThemeData(color: Colors.white),
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFFE8F5E9), // Light green
              Colors.white,
            ],
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: ListView(
              children: [
                _buildSectionHeader('Informasi Produksi Susu'),
                _buildCard(
                  child: Column(
                    children: [
                      _buildDropdownField(
                        label: 'Pilih Sapi',
                        icon: Icons.pets,
                        items: cowList
                            .map((cow) => cow.name)
                            .toList(), // Tampilkan nama sapi
                        selectedValue: selectedCow
                            ?.name, // Tampilkan nama sapi yang dipilih
                        onChanged: (value) {
                          final cow = cowList.firstWhere((cow) =>
                              cow.name ==
                              value); // Cari objek Cow berdasarkan nama
                          setState(() {
                            selectedCow = cow; // Simpan objek Cow yang dipilih
                          });
                        },
                      ),
                      SizedBox(height: 12),
                      _buildDatePickerField(
                        label: 'Waktu Produksi',
                        selectedDate: productionTime,
                        onDateSelected: (date) {
                          setState(() {
                            productionTime = date;
                          });
                        },
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _volumeController,
                        label: 'Volume (Liters)',
                        hint: 'Masukkan volume susu',
                        icon: Icons.local_drink,
                        keyboardType: TextInputType.number,
                        isRequired: true,
                      ),
                      SizedBox(height: 12),
                      _buildDropdownField(
                        label: 'Lactation Phase',
                        icon: Icons.timeline,
                        items: lactationStatus
                            ? ['Early', 'Mid', 'Late']
                            : [
                                'Dry'
                              ], // Tambahkan 'Dry' jika lactationStatus false
                        selectedValue:
                            lactationStatus ? selectedLactationPhase : 'Dry',
                        onChanged: lactationStatus
                            ? (value) {
                                setState(() {
                                  selectedLactationPhase = value;
                                });
                              }
                            : null,
                        isEnabled: lactationStatus,
                      ),
                      SizedBox(height: 12),
                      _buildSwitchField(
                        label: 'Lactation Status',
                        value: lactationStatus,
                        onChanged: (value) {
                          setState(() {
                            lactationStatus = value;
                            if (!value) {
                              selectedLactationPhase = 'Dry';
                            }
                          });
                        },
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 24),
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
        style: TextStyle(
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
        prefixIcon: Icon(icon, color: Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide(color: Color(0xFF5D90E7), width: 2.0),
        ),
        contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
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
    required Function(String?)? onChanged,
    bool isEnabled = true,
  }) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide(color: Color(0xFF5D90E7), width: 2.0),
        ),
        contentPadding: EdgeInsets.symmetric(vertical: 2, horizontal: 16),
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
      onChanged: isEnabled ? onChanged : null,
      borderRadius: BorderRadius.circular(8.0),
      dropdownColor: Colors.white,
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
        hintText: 'Pilih tanggal dan waktu',
        prefixIcon: Icon(Icons.calendar_today, color: Color(0xFF5D90E7)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8.0),
          borderSide: BorderSide(color: Color(0xFF5D90E7), width: 2.0),
        ),
        contentPadding: EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        filled: true,
        fillColor: Colors.grey.shade50,
      ),
      readOnly: true,
      onTap: () async {
        final date = await showDatePicker(
          context: context,
          initialDate: DateTime.now(),
          firstDate: DateTime(1900),
          lastDate: DateTime.now(),
        );
        if (date != null) {
          final time = await showTimePicker(
            context: context,
            initialTime: TimeOfDay.now(),
          );
          if (time != null) {
            onDateSelected(DateTime(
              date.year,
              date.month,
              date.day,
              time.hour,
              time.minute,
            ));
          }
        }
      },
      controller: TextEditingController(
        text: selectedDate == null
            ? ''
            : '${selectedDate.day}/${selectedDate.month}/${selectedDate.year} ${selectedDate.hour}:${selectedDate.minute}',
      ),
    );
  }

  Widget _buildSwitchField({
    required String label,
    required bool value,
    required Function(bool) onChanged,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeColor: Color(0xFF5D90E7),
        ),
      ],
    );
  }

  Widget _buildSubmitButton() {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: Color(0xFF5D90E7),
        padding: EdgeInsets.symmetric(vertical: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8.0),
        ),
        elevation: 4,
        shadowColor: Colors.green.shade200,
      ),
      onPressed: () {
        if (_formKey.currentState!.validate()) {
          // Handle form submission
          print('Form submitted');
          print('Selected Cow ID: ${selectedCow?.id}');
        }
      },
      child: Text(
        'Simpan Data Produksi Susu',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}
