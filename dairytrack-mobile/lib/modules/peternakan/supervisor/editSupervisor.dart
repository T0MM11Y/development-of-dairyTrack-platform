import 'package:dairy_track/config/configApi5000.dart';
import 'package:dairy_track/modules/peternakan/supervisor/allSupervisor.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/config/api/peternakan/supervisor.dart';
import 'package:dairy_track/model/peternakan/supervisor.dart';

class EditSupervisor extends StatefulWidget {
  final Supervisor supervisor;
  final int id;

  EditSupervisor({required this.supervisor, required this.id})
      : super(key: ValueKey(id));

  @override
  _EditSupervisorState createState() => _EditSupervisorState();
}

Future<void> updateSupervisorUI(
    BuildContext context, Supervisor supervisor, int id) async {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => Center(
      child: CircularProgressIndicator(),
    ),
  );

  try {
    // Panggil fungsi updateSupervisor dari API
    final success = await updateSupervisor(supervisor, id);

    Navigator.of(context).pop();

    if (success) {
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
            'Data supervisor berhasil diperbarui.',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
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
            'Terjadi kesalahan saat memperbarui data supervisor. Silakan coba lagi.',
            style: TextStyle(fontSize: 16),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
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
    Navigator.of(context).pop();

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
              Navigator.of(context).pop();
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

class _EditSupervisorState extends State<EditSupervisor> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _emailController;
  late TextEditingController _firstNameController;
  late TextEditingController _lastNameController;
  late TextEditingController _contactController;
  String? selectedGender;

  @override
  void initState() {
    super.initState();

    _emailController = TextEditingController(text: widget.supervisor.email);
    _firstNameController =
        TextEditingController(text: widget.supervisor.firstName);
    _lastNameController =
        TextEditingController(text: widget.supervisor.lastName);
    _contactController = TextEditingController(text: widget.supervisor.contact);
    selectedGender = widget.supervisor.gender;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Edit Data Supervisor',
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
          // Buat objek Supervisor dengan data terbaru
          final supervisor = Supervisor(
            id: widget.supervisor.id,
            firstName: _firstNameController.text,
            lastName: _lastNameController.text,
            contact: _contactController.text,
            email: _emailController.text,
            gender: selectedGender ?? '',
            createdAt: widget.supervisor.createdAt,
            updatedAt: DateTime.now(),
          );

          // Panggil fungsi updateSupervisor dengan parameter yang benar
          final success = await updateSupervisor(supervisor, widget.id);
          if (success) {
            showDialog(
              context: context,
              builder: (BuildContext context) {
                return AlertDialog(
                  title: Text('Berhasil'),
                  content: Text('Supervisor berhasil diperbarui.'),
                  actions: [
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pop(); // Tutup dialog
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => AllSupervisor(),
                          ),
                        ); // Arahkan ke halaman AllSupervisor
                      },
                      child: Text('OK'),
                    ),
                  ],
                );
              },
            );
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Gagal memperbarui supervisor')),
            );
          }
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
