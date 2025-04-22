import 'package:dairy_track/config/api/peternakan/farmer.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';
import 'package:dairy_track/modules/peternakan/farmer/editPeternak.dart';
import 'package:flutter/material.dart';
import 'package:intl/date_symbol_data_local.dart';

import 'package:intl/intl.dart';

class AllPeternak extends StatefulWidget {
  @override
  _AllPeternakState createState() => _AllPeternakState();
}

class _AllPeternakState extends State<AllPeternak> {
  String? selectedGender;
  String? selectedStatus;
  DateTime? selectedjoin_date;
  final TextEditingController _searchController = TextEditingController();
  Future<List<Peternak>> fetchFarmers() async {
    final allFarmers = await getFarmers();
    final filteredFarmers = allFarmers.where((farmer) {
      final matchesGender = selectedGender == null ||
          selectedGender == 'All' ||
          farmer.gender == selectedGender;
      final matchesStatus = selectedStatus == null ||
          selectedStatus == 'All' ||
          farmer.status == selectedStatus;
      final matchesjoin_date = selectedjoin_date == null ||
          DateFormat('yyyy-MM-dd').format(farmer.join_date) ==
              DateFormat('yyyy-MM-dd').format(selectedjoin_date!);
      final searchText = _searchController.text.toLowerCase();
      final matchesSearch = searchText.isEmpty ||
          farmer.firstName.toLowerCase().contains(searchText) ||
          farmer.lastName.toLowerCase().contains(searchText) ||
          farmer.email.toLowerCase().contains(searchText);

      return matchesGender &&
          matchesStatus &&
          matchesjoin_date &&
          matchesSearch;
    }).toList();

    // Urutkan berdasarkan created_at dari yang terbaru
    filteredFarmers.sort((a, b) => b.createdAt.compareTo(a.createdAt));

    print('Filtered Farmers: ${filteredFarmers.length}');
    return filteredFarmers;
  }

  void _exportPDF(BuildContext context) async {
    // Tampilkan dialog loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Center(
          child: CircularProgressIndicator(),
        );
      },
    );

    final file = await exportFarmersPDF(context);

    // Tutup dialog loading
    Navigator.of(context).pop();

    if (file != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('PDF berhasil diekspor ke: ${file.path}'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal mengekspor PDF'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _exportExcel(BuildContext context) async {
    // Tampilkan dialog loading
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Center(
          child: CircularProgressIndicator(),
        );
      },
    );

    final file = await exportFarmersExcel(context);

    // Tutup dialog loading
    Navigator.of(context).pop();

    if (file != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Excel berhasil diekspor ke: ${file.path}'),
          backgroundColor: Colors.green,
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal mengekspor Excel'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showFarmerDetails(BuildContext context, Peternak peternak) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.person, color: Colors.cyan[700], size: 18),
                  const SizedBox(width: 6),
                  Text(
                    'Detail Peternak',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                      color: Colors.cyan[700],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
            ],
          ),
          content: SizedBox(
            width: MediaQuery.of(context).size.width * 0.5,
            height: MediaQuery.of(context).size.height * 0.5,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow(
                      Icons.person, 'Nama Depan', peternak.firstName),
                  _buildDetailRow(
                      Icons.person_outline, 'Nama Belakang', peternak.lastName),
                  _buildDetailRow(
                      Icons.email, 'Email', peternak.email ?? 'Tidak tersedia'),
                  _buildDetailRow(Icons.phone, 'Nomor Telepon',
                      peternak.contact ?? 'Tidak tersedia'),
                  _buildDetailRow(Icons.home, 'Alamat',
                      peternak.address ?? 'Tidak tersedia'),
                  _buildDetailRow(Icons.transgender, 'Jenis Kelamin',
                      peternak.gender ?? 'Tidak tersedia'),
                  _buildDetailRow(Icons.book, 'Agama',
                      peternak.religion ?? 'Tidak tersedia'),
                  _buildDetailRow(
                    Icons.cake,
                    'Tanggal Lahir',
                    peternak.birthDate != null
                        ? DateFormat('dd MMM yyyy', 'id_ID')
                            .format(peternak.birthDate!)
                        : 'Tidak tersedia',
                  ),
                  _buildDetailRow(
                    Icons.calendar_today,
                    'Tanggal Bergabung',
                    peternak.join_date != null
                        ? DateFormat('dd MMM yyyy', 'id_ID')
                            .format(peternak.join_date!)
                        : 'Tidak tersedia',
                  ),
                  _buildDetailRow(Icons.verified, 'Status',
                      peternak.status ?? 'Tidak tersedia'),
                  _buildDetailRow(Icons.pets, 'Jumlah Ternak',
                      '${peternak.totalCattle ?? 0}'),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                'Tutup',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.cyan[700],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey[700],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[800],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        // Mengembalikan false untuk menonaktifkan tombol "Back" bawaan perangkat
        return true;
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Farmer Management',
              style: TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: const Color.fromARGB(255, 93, 144, 231),
          centerTitle: true,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              Navigator.of(context)
                  .pop(); // Tombol "Back" di header tetap aktif
            },
          ),
          actions: [
            IconButton(
              icon: Icon(Icons.refresh),
              onPressed: () {
                setState(() {
                  selectedGender = null;
                  selectedStatus = null;
                  selectedjoin_date = null;
                  _searchController.clear();
                });
              },
              tooltip: 'Refresh',
            ),
          ],
        ),
        body: Column(
          children: [
            // Search Field
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search farmers...',
                  prefixIcon: Icon(Icons.search, color: Colors.cyan[700]),
                  filled: true,
                  fillColor: Colors.grey[200],
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(
                          icon: Icon(Icons.clear),
                          onPressed: () {
                            setState(() {
                              _searchController.clear();
                            });
                          },
                        )
                      : null,
                ),
                onChanged: (value) => setState(() {}),
              ),
            ),

            // Filter Card
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              elevation: 4,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    Text('FILTER OPTIONS',
                        style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: Colors.cyan[700])),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: _buildFilterDropdown(
                            label: 'Gender',
                            value: selectedGender,
                            items: const [
                              DropdownMenuItem(
                                  value: 'All', child: Text('All Genders')),
                              DropdownMenuItem(
                                  value: 'Male', child: Text('Male')),
                              DropdownMenuItem(
                                  value: 'Female', child: Text('Female')),
                            ],
                            onChanged: (value) {
                              setState(() {
                                selectedGender = value == 'All' ? null : value;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildFilterDropdown(
                            label: 'Status',
                            value: selectedStatus,
                            items: const [
                              DropdownMenuItem(
                                  value: 'All', child: Text('All Statuses')),
                              DropdownMenuItem(
                                  value: 'Active', child: Text('Active')),
                              DropdownMenuItem(
                                  value: 'Inactive', child: Text('Inactive')),
                            ],
                            onChanged: (value) {
                              setState(() {
                                selectedStatus = value == 'All' ? null : value;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: () async {
                        final pickedDate = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2100),
                        );
                        if (pickedDate != null) {
                          setState(() {
                            selectedjoin_date = pickedDate;
                          });
                        }
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[300]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              selectedjoin_date == null
                                  ? 'Filter by Join Date'
                                  : DateFormat('dd MMM yyyy')
                                      .format(selectedjoin_date!),
                              style: TextStyle(
                                color: selectedjoin_date == null
                                    ? Colors.grey[600]
                                    : Colors.black,
                              ),
                            ),
                            Icon(Icons.calendar_today,
                                size: 20, color: Colors.cyan[700]),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: _buildExportButton(
                            icon: Icons.picture_as_pdf,
                            label: 'Export PDF',
                            color: Colors.grey[700]!,
                            onPressed: () => _exportPDF(context),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: _buildExportButton(
                            icon: Icons.table_chart,
                            label: 'Export Excel',
                            color: Colors.green[700]!,
                            onPressed: () => _exportExcel(context),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),

            // Data Count
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: FutureBuilder<List<Peternak>>(
                future: fetchFarmers(),
                builder: (context, snapshot) {
                  if (snapshot.hasData) {
                    return Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Showing ${snapshot.data!.length} farmers',
                        style: TextStyle(
                            color: Colors.grey[600],
                            fontStyle: FontStyle.italic),
                      ),
                    );
                  }
                  return const SizedBox();
                },
              ),
            ),

            // Farmers List
            Expanded(
              child: FutureBuilder<List<Peternak>>(
                future: fetchFarmers(),
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(
                        child: CircularProgressIndicator(color: Colors.cyan));
                  } else if (snapshot.hasError) {
                    return _buildErrorView('Error loading data');
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return _buildErrorView('No farmers found',
                        subtitle: 'Try adjusting your filters');
                  } else {
                    final farmers = snapshot.data!;
                    return RefreshIndicator(
                      color: Colors.cyan,
                      onRefresh: () async => setState(() {}),
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 8),
                        itemCount: farmers.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (context, index) =>
                            _buildFarmerCard(farmers[index]),
                      ),
                    );
                  }
                },
              ),
            ),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () => Navigator.pushNamed(context, '/add-peternak'),
          backgroundColor: const Color.fromARGB(255, 93, 144, 231),
          child: const Icon(Icons.add),
        ),
      ),
    );
  }

  Widget _buildFilterDropdown({
    required String label,
    required String? value,
    required List<DropdownMenuItem<String>> items,
    required ValueChanged<String?> onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey[600])),
        const SizedBox(height: 4),
        DropdownButtonFormField<String>(
          isExpanded: true,
          value: value ?? 'All',
          items: items,
          onChanged: onChanged,
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
          ),
          icon: Icon(Icons.arrow_drop_down, color: Colors.cyan[700]),
        ),
      ],
    );
  }

  Widget _buildExportButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 20),
      label: Text(label, style: TextStyle(fontSize: 12)),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildFarmerCard(Peternak farmer) {
    final farmerId = farmer.id; // Store the farmer's ID

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: InkWell(
        onTap: () {
          _showFarmerDetails(context, farmer);
        },
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '${farmer.firstName} ${farmer.lastName}',
                      style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.cyan),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12),
                      color: farmer.status == 'Active'
                          ? Colors.green[50]
                          : Colors.orange[50],
                      border: Border.all(
                        color: farmer.status == 'Active'
                            ? Colors.green[200]!
                            : Colors.orange[200]!,
                      ),
                    ),
                    child: Text(
                      farmer.status ?? '',
                      style: TextStyle(
                        color: farmer.status == 'Active'
                            ? Colors.green[800]
                            : Colors.orange[800],
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              _buildInfoRow(Icons.email, farmer.email ?? 'No email'),
              _buildInfoRow(Icons.phone, farmer.contact ?? 'No contact'),
              _buildInfoRow(Icons.calendar_today,
                  'Joined: ${farmer.join_date != null ? DateFormat('dd MMMM yyyy', 'id_ID').format(farmer.join_date!) : 'Unknown'}'),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildDetailChip(
                      icon: Icons.agriculture,
                      label: '${farmer.totalCattle ?? 0} Cattle'),
                  PopupMenuButton<String>(
                    onSelected: (value) {
                      if (value == 'edit') {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => EditPeternak(
                              peternak: farmer, // Pass the farmer object
                              id: farmer.id!, // Pass the required farmerId
                            ),
                          ),
                        ).then((_) {
                          // Refresh data after returning from the edit page
                          setState(() {});
                        });
                      } else if (value == 'delete') {
                        _showDeleteDialog(farmer);
                      }
                    },
                    itemBuilder: (context) => [
                      PopupMenuItem(
                        value: 'edit',
                        child: Row(
                          children: [
                            Icon(Icons.edit, color: Colors.blue[600]),
                            const SizedBox(width: 8),
                            const Text('Edit'),
                          ],
                        ),
                      ),
                      PopupMenuItem(
                        value: 'delete',
                        child: Row(
                          children: [
                            Icon(Icons.delete, color: Colors.red[600]),
                            const SizedBox(width: 8),
                            const Text('Delete'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 16, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Expanded(
              child: Text(text,
                  style: TextStyle(color: Colors.grey[700], fontSize: 14))),
        ],
      ),
    );
  }

  Widget _buildDetailChip({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
          color: Colors.grey[100], borderRadius: BorderRadius.circular(12)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.grey[600]),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: Colors.grey[700], fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildErrorView(String message, {String? subtitle}) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.info_outline, size: 48, color: Colors.grey[400]),
          const SizedBox(height: 12),
          Text(message,
              style: TextStyle(fontSize: 16, color: Colors.grey[700])),
          if (subtitle != null) ...[
            const SizedBox(height: 4),
            Text(subtitle,
                style: TextStyle(fontSize: 13, color: Colors.grey[500])),
          ]
        ],
      ),
    );
  }

  void _showDeleteDialog(Peternak farmer) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Delete Farmer?', style: TextStyle(color: Colors.red[700])),
        content: Text(
            'Are you sure you want to delete ${farmer.firstName} ${farmer.lastName}? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
            onPressed: () async {
              // Tampilkan indikator loading
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (_) => Center(
                  child: CircularProgressIndicator(),
                ),
              );

              try {
                // Proses penghapusan data
                await deleteFarmer(farmer.id!);

                // Tutup dialog loading
                Navigator.pop(context);

                // Tampilkan pesan sukses
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Farmer deleted successfully'),
                    backgroundColor: Colors.green,
                  ),
                );

                // Perbarui UI
                setState(() {});
              } catch (e) {
                // Tutup dialog loading jika terjadi error
                Navigator.pop(context);

                // Tampilkan pesan error
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Failed to delete farmer: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }

              // Tutup dialog konfirmasi
              Navigator.pop(context);
            },
            child: Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
