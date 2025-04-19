import 'package:dairy_track/config/api/peternakan/farmer.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';

class AddPeternak extends StatefulWidget {
  @override
  _AddPeternakState createState() => _AddPeternakState();
}

class _AddPeternakState extends State<AddPeternak> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _contactController = TextEditingController();
  final TextEditingController _totalCattleController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  String? selectedGender;
  String? selectedReligion;
  DateTime? selectedDateOfBirth;
  DateTime? selectedJoinDate;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tambah Peternak'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              _buildCard(
                child: TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    hintText: 'Masukkan email',
                    prefixIcon: Icon(Icons.email),
                  ),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Email wajib diisi';
                    }
                    return null;
                  },
                ),
              ),
              _buildCard(
                child: TextFormField(
                  controller: _firstNameController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Depan',
                    hintText: 'Masukkan nama depan',
                    prefixIcon: Icon(Icons.person),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Nama depan wajib diisi';
                    }
                    return null;
                  },
                ),
              ),
              _buildCard(
                child: TextFormField(
                  controller: _lastNameController,
                  decoration: const InputDecoration(
                    labelText: 'Nama Belakang',
                    hintText: 'Masukkan nama belakang',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                ),
              ),
              _buildCard(
                child: TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Tanggal Lahir',
                    hintText: 'mm/dd/yyyy',
                    prefixIcon: Icon(Icons.calendar_today),
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
                      setState(() {
                        selectedDateOfBirth = date;
                      });
                    }
                  },
                  controller: TextEditingController(
                    text: selectedDateOfBirth == null
                        ? ''
                        : '${selectedDateOfBirth!.month}/${selectedDateOfBirth!.day}/${selectedDateOfBirth!.year}',
                  ),
                ),
              ),
              _buildCard(
                child: TextFormField(
                  controller: _contactController,
                  decoration: const InputDecoration(
                    labelText: 'Kontak',
                    hintText: 'Masukkan nomor kontak',
                    prefixIcon: Icon(Icons.phone),
                  ),
                  keyboardType: TextInputType.phone,
                ),
              ),
              _buildCard(
                child: DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Agama',
                    prefixIcon: Icon(Icons.account_balance),
                  ),
                  items: ['Islam', 'Kristen', 'Hindu', 'Budha', 'Katolik']
                      .map((religion) => DropdownMenuItem(
                            value: religion,
                            child: Text(religion),
                          ))
                      .toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedReligion = value;
                    });
                  },
                ),
              ),
              _buildCard(
                child: TextFormField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    labelText: 'Alamat',
                    hintText: 'Masukkan alamat',
                    prefixIcon: Icon(Icons.home),
                  ),
                ),
              ),
              _buildCard(
                child: DropdownButtonFormField<String>(
                  decoration: const InputDecoration(
                    labelText: 'Jenis Kelamin',
                    prefixIcon: Icon(Icons.wc),
                  ),
                  items: ['Laki-laki', 'Perempuan']
                      .map((gender) => DropdownMenuItem(
                            value: gender,
                            child: Text(gender),
                          ))
                      .toList(),
                  onChanged: (value) {
                    setState(() {
                      selectedGender = value;
                    });
                  },
                ),
              ),
              _buildCard(
                child: TextFormField(
                  controller: _totalCattleController,
                  decoration: const InputDecoration(
                    labelText: 'Jumlah Ternak',
                    hintText: '0',
                    prefixIcon: Icon(Icons.pets),
                  ),
                  keyboardType: TextInputType.number,
                ),
              ),
              _buildCard(
                child: TextFormField(
                  decoration: const InputDecoration(
                    labelText: 'Tanggal Bergabung',
                    hintText: 'mm/dd/yyyy',
                    prefixIcon: Icon(Icons.date_range),
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
                      setState(() {
                        selectedJoinDate = date;
                      });
                    }
                  },
                  controller: TextEditingController(
                    text: selectedJoinDate == null
                        ? ''
                        : '${selectedJoinDate!.month}/${selectedJoinDate!.day}/${selectedJoinDate!.year}',
                  ),
                ),
              ),
              _buildCard(
                child: TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(
                    labelText: 'Password',
                    prefixIcon: Icon(Icons.lock),
                  ),
                  obscureText: true,
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color.fromARGB(255, 93, 144, 231),
                  padding: const EdgeInsets.symmetric(vertical: 16.0),
                ),
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    try {
                      final peternak = Peternak(
                        id: 0, // ID akan di-generate oleh server
                        firstName: _firstNameController.text,
                        lastName: _lastNameController.text,
                        address: _addressController.text,
                        contact: _contactController.text,
                        email: _emailController.text,
                        gender: selectedGender ?? '',
                        religion: selectedReligion ?? '',
                        role: 'Peternak', // Default role
                        status: 'Aktif', // Default status
                        totalCattle:
                            int.tryParse(_totalCattleController.text) ?? 0,
                        birthDate: selectedDateOfBirth ?? DateTime.now(),
                        joinDate: selectedJoinDate ?? DateTime.now(),
                        createdAt: DateTime.now(),
                        updatedAt: DateTime.now(),
                      );

                      final success = await addFarmers(peternak);
                      if (success) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                              content: Text('Data berhasil disimpan')),
                        );
                        Navigator.pop(context);
                      }
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Gagal menyimpan data: $e')),
                      );
                    }
                  }
                },
                child: const Text(
                  'Simpan',
                  style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: child,
      ),
    );
  }
}
