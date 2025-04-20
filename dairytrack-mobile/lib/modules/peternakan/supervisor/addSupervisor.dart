import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/peternakan/supervisor.dart';
import 'package:dairy_track/model/peternakan/supervisor.dart';

class AddSupervisor extends StatefulWidget {
  @override
  _AddSupervisorState createState() => _AddSupervisorState();
}

Future<void> addSupervisorHandler(
    BuildContext context, Supervisor supervisor) async {
  // Tampilkan indikator loading
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => Center(
      child: CircularProgressIndicator(),
    ),
  );

  try {
    // Panggil API untuk menambahkan supervisor
    final success = await addSupervisor(supervisor);

    // Tutup indikator loading setelah respons diterima
    Navigator.of(context).pop();

    if (success) {
      // Tampilkan dialog sukses
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
            'Data supervisor berhasil ditambahkan.',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Tutup dialog
                Navigator.pushReplacementNamed(context, '/all-supervisor');
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
      // Tampilkan dialog gagal
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
            'Terjadi kesalahan saat menambahkan data supervisor. Silakan coba lagi.',
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

class _AddSupervisorState extends State<AddSupervisor> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _contactController = TextEditingController();

  final TextEditingController _passwordController = TextEditingController();

  String? selectedGender;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Supervisor Baru',
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
                      SizedBox(height: 12),
                      _buildDropdownField(
                        label: 'Jenis Kelamin',
                        icon: Icons.wc,
                        items: ['Male', 'Female'],
                        selectedValue: selectedGender,
                        onChanged: (value) {
                          setState(() {
                            selectedGender = value; // Perbarui selectedGender
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
                    ],
                  ),
                ),
                _buildSectionHeader('Keamanan'),
                _buildCard(
                  child: _buildTextFormField(
                    controller: _passwordController,
                    label: 'Password',
                    hint: 'Buat password',
                    icon: Icons.lock,
                    obscureText: true,
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
    bool obscureText = false,
    int maxLines = 1,
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
      obscureText: obscureText,
      maxLines: maxLines,
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
      onChanged: onChanged,
      borderRadius: BorderRadius.circular(8.0),
      dropdownColor: Colors.white,
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
          final supervisor = Supervisor(
            firstName: _firstNameController.text,
            lastName: _lastNameController.text,
            contact: _contactController.text,
            email: _emailController.text,
            gender: selectedGender ?? '', // Gunakan selectedGender
            password: _passwordController.text,
            createdAt: DateTime.now(),
            updatedAt: DateTime.now(),
          );

          // Panggil fungsi addSupervisor
          await addSupervisorHandler(
            context,
            supervisor,
          );
        }
      },
      child: Text(
        'Simpan Data Supervisor',
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}
