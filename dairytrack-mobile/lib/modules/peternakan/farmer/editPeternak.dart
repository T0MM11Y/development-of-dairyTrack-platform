import 'package:dairy_track/config/api/peternakan/farmer.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';

class EditPeternak extends StatefulWidget {
  final Peternak peternak;
  final int id; // Tambahkan ID di sini

  EditPeternak({required this.peternak, required this.id})
      : super(key: ValueKey(id));

  @override
  _EditPeternakState createState() => _EditPeternakState();
}

Future<void> updateFarmer(
    BuildContext context, Peternak peternak, int id) async {
  // Tampilkan indikator loading
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => Center(
      child: CircularProgressIndicator(),
    ),
  );

  try {
    // Panggil API dari updateFarmers
    final response = await updateFarmers(peternak, id);

    // Tutup indikator loading setelah respons diterima
    Navigator.of(context).pop();

    if (response) {
      // Respons sukses
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              Icon(Icons.check_circle, color: Colors.green),
              SizedBox(width: 8),
              Text('Berhasil'),
            ],
          ),
          content: Text(
            'Data peternak telah berhasil diperbarui.',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Tutup dialog
                Navigator.pushReplacementNamed(context, '/all-peternak');
              },
              child: Text(
                'OK',
                style: TextStyle(color: Colors.green),
              ),
            ),
          ],
        ),
      );
    } else {
      // Respons gagal
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Row(
            children: [
              Icon(Icons.error, color: Colors.red),
              SizedBox(width: 8),
              Text('Gagal'),
            ],
          ),
          content: Text(
            'Maaf, terjadi kesalahan saat memperbarui data peternak. Silakan coba lagi.',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Tutup dialog
              },
              child: Text(
                'OK',
                style: TextStyle(color: Colors.red),
              ),
            ),
          ],
        ),
      );
    }
  } catch (e) {
    // Tutup indikator loading jika terjadi error
    Navigator.of(context).pop();

    // Tampilkan dialog error
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.warning, color: Colors.orange),
            SizedBox(width: 8),
            Text('Error'),
          ],
        ),
        content: Text(
          'Terjadi kesalahan yang tidak terduga: $e. Silakan coba lagi nanti.',
          style: TextStyle(fontSize: 16),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Tutup dialog
            },
            child: Text(
              'OK',
              style: TextStyle(color: Colors.orange),
            ),
          ),
        ],
      ),
    );
  }
}

class _EditPeternakState extends State<EditPeternak> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _emailController;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _addressController;
  late TextEditingController _contactController;
  late TextEditingController _totalCattleController;
  String? selectedStatus = 'Active'; // Default status

  String? selectedGender;
  String? selectedReligion;
  DateTime? selectedDateOfBirth;
  DateTime? selectedjoin_date;

  @override
  void initState() {
    super.initState();

    // Prefill data dari peternak yang akan diedit
    _emailController = TextEditingController(text: widget.peternak.email);
    _firstNameController =
        TextEditingController(text: widget.peternak.firstName);
    _lastNameController = TextEditingController(text: widget.peternak.lastName);
    _addressController = TextEditingController(text: widget.peternak.address);
    _contactController = TextEditingController(text: widget.peternak.contact);
    _totalCattleController =
        TextEditingController(text: widget.peternak.totalCattle.toString());

    selectedGender = widget.peternak.gender;
    selectedReligion = widget.peternak.religion;
    selectedDateOfBirth = widget.peternak.birthDate;
    selectedjoin_date = widget.peternak.join_date;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Data Peternak',
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
              Color(0xFFE8F5E9),
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
                _buildSectionHeader('Informasi Pribadi'),
                _buildCard(
                  child: Column(
                    children: [
                      _buildTextFormField(
                        controller: _firstNameController,
                        label: 'Nama Depan',
                        hint: 'Masukkan nama depan',
                        icon: Icons.person,
                        isRequired: true,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _lastNameController,
                        label: 'Nama Belakang',
                        hint: 'Masukkan nama belakang',
                        icon: Icons.person_outline,
                      ),
                    ],
                  ),
                ),
                _buildCard(
                  child: Column(
                    children: [
                      _buildDatePickerField(
                        label: 'Tanggal Lahir',
                        selectedDate: selectedDateOfBirth,
                        onDateSelected: (date) {
                          setState(() {
                            selectedDateOfBirth = date;
                          });
                        },
                      ),
                      SizedBox(height: 12),
                      _buildDropdownField(
                        label: 'Jenis Kelamin',
                        icon: Icons.wc,
                        items: ['Male', 'Female'],
                        selectedValue: selectedGender,
                        onChanged: (value) {
                          setState(() {
                            selectedGender = value;
                          });
                        },
                      ),
                      SizedBox(height: 12),
                      _buildDropdownField(
                        label: 'Agama',
                        icon: Icons.account_balance,
                        items: [
                          'Islam',
                          'Kristen',
                          'Hindu',
                          'Buddha',
                          'Katolik'
                        ],
                        selectedValue: selectedReligion,
                        onChanged: (value) {
                          setState(() {
                            selectedReligion = value;
                          });
                        },
                      ),
                    ],
                  ),
                ),
                _buildSectionHeader('Informasi Kontak'),
                _buildCard(
                  child: Column(
                    children: [
                      _buildTextFormField(
                        controller: _emailController,
                        label: 'Email',
                        hint: 'Masukkan email',
                        icon: Icons.email,
                        keyboardType: TextInputType.emailAddress,
                        isRequired: true,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _contactController,
                        label: 'Nomor Telepon',
                        hint: 'Masukkan nomor telepon',
                        icon: Icons.phone,
                        keyboardType: TextInputType.phone,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        controller: _addressController,
                        label: 'Alamat',
                        hint: 'Masukkan alamat lengkap',
                        icon: Icons.home,
                        maxLines: 2,
                      ),
                    ],
                  ),
                ),
                _buildSectionHeader('Informasi Peternakan'),
                _buildCard(
                  child: Column(
                    children: [
                      _buildTextFormField(
                        controller: _totalCattleController,
                        label: 'Jumlah Ternak',
                        hint: '0',
                        icon: Icons.pets,
                        keyboardType: TextInputType.number,
                        isRequired: false,
                        readOnly: true,
                      ),
                      SizedBox(height: 12),
                      _buildDatePickerField(
                        label: 'Tanggal Bergabung',
                        selectedDate: selectedjoin_date,
                        onDateSelected: (date) {
                          setState(() {
                            selectedjoin_date = date;
                          });
                        },
                      ),
                      SizedBox(height: 12),
                      _buildDropdownField(
                        label: 'Status',
                        icon: selectedStatus == 'Active'
                            ? Icons.toggle_on
                            : Icons.toggle_off,
                        iconColor: selectedStatus == 'Active'
                            ? Colors.green
                            : Colors.grey,
                        items: ['Active', 'Inactive'],
                        selectedValue: selectedStatus,
                        onChanged: (value) {
                          setState(() {
                            selectedStatus = value;
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
    Color? iconColor, // Tambahkan parameter iconColor
    TextInputType? keyboardType,
    bool obscureText = false,
    bool readOnly = false,
    int maxLines = 1,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        prefixIcon: Icon(
          icon,
          color: iconColor ??
              Color(
                  0xFF5D90E7), // Gunakan iconColor jika ada, jika tidak gunakan warna default
        ),
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
        fillColor: readOnly ? Colors.grey.shade300 : Colors.grey.shade50,
      ),
      keyboardType: keyboardType ?? TextInputType.text,
      obscureText: obscureText,
      maxLines: maxLines,
      readOnly: readOnly,
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
    Color? iconColor,
    required List<String> items,
    required String? selectedValue,
    required Function(String?) onChanged,
  }) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: iconColor ?? Color(0xFF5D90E7)),
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
      onChanged: onChanged,
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
        hintText: 'Pilih tanggal',
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
          initialDate: selectedDate ?? DateTime.now(),
          firstDate: DateTime(1900),
          lastDate: DateTime.now(),
          builder: (context, child) {
            return Theme(
              data: Theme.of(context).copyWith(
                colorScheme: ColorScheme.light(
                  primary: Color(0xFF5D90E7),
                  onPrimary: Colors.white,
                  onSurface: Colors.black,
                ),
                textButtonTheme: TextButtonThemeData(
                  style: TextButton.styleFrom(
                    foregroundColor: Color(0xFF5D90E7),
                  ),
                ),
              ),
              child: child!,
            );
          },
        );
        if (date != null) {
          onDateSelected(date);
        }
      },
      controller: TextEditingController(
        text: selectedDate == null
            ? ''
            : '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}',
      ),
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
      onPressed: () async {
        if (_formKey.currentState!.validate()) {
          final peternak = Peternak(
            // id: widget.peternak.id, // Pastikan ID tetap sama
            firstName: _firstNameController.text,
            lastName: _lastNameController.text,
            address: _addressController.text,
            contact: _contactController.text,
            email: _emailController.text,
            gender: selectedGender ?? '',
            religion: selectedReligion ?? '',
            role: widget.peternak.role,
            status: selectedStatus ?? widget.peternak.status,
            totalCattle: int.tryParse(_totalCattleController.text) ?? 0,
            birthDate: selectedDateOfBirth ?? DateTime.now(),
            join_date: selectedjoin_date ?? DateTime.now(),
            createdAt: widget.peternak.createdAt,
            updatedAt: DateTime.now(),
          );

          // Panggil fungsi updateFarmer
          await updateFarmer(context, peternak, widget.id);
        }
      },
      child: Text(
        'Simpan Perubahan',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}
