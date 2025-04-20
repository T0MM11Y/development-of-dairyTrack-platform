import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/modules/peternakan/cow/editCow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllCow extends StatefulWidget {
  @override
  _AllCowState createState() => _AllCowState();
}

class _AllCowState extends State<AllCow> {
  String? selectedGender;
  String? selectedBreed;
  DateTime? selectedentryDate;
  final TextEditingController _searchController = TextEditingController();
  Future<List<Cow>> fetchCows() async {
    final allCows = await getCows();

    // Cache formatted birth date for comparison
    final formattedSelectedentryDate = selectedentryDate != null
        ? DateFormat('yyyy-MM-dd').format(selectedentryDate!)
        : null;

    // Cache search text in lowercase
    final searchText = _searchController.text.toLowerCase();

    final filteredCows = allCows.where((cow) {
      // Early return for each filter
      if (selectedGender != null && cow.gender != selectedGender) {
        return false;
      }
      if (selectedBreed != null && cow.breed != selectedBreed) {
        return false;
      }
      if (formattedSelectedentryDate != null &&
          (cow.entryDate == null ||
              DateFormat('yyyy-MM-dd').format(cow.entryDate!) !=
                  formattedSelectedentryDate)) {
        return false;
      }
      if (searchText.isNotEmpty &&
          !cow.name.toLowerCase().contains(searchText) &&
          !cow.breed.toLowerCase().contains(searchText)) {
        return false;
      }

      return true;
    }).toList();

    return filteredCows;
  }

  void _exportPDF(BuildContext context) async {
    try {
      final file = await exportCowsPDF(context);
      if (file != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('PDF berhasil diekspor ke: ${file.path}'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal mengekspor PDF: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _exportExcel(BuildContext context) async {
    try {
      final file = await exportCowsExcel(context);
      if (file != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Excel berhasil diekspor ke: ${file.path}'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gagal mengekspor Excel: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showCowDetails(BuildContext context, Cow cow) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(Icons.pets, color: Colors.cyan[700], size: 18),
                  const SizedBox(width: 6),
                  Text(
                    'Detail Sapi',
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
            height: MediaQuery.of(context).size.height * 0.4,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow(Icons.label, 'Nama', cow.name),
                  _buildDetailRow(Icons.category, 'Ras', cow.breed),
                  _buildDetailRow(
                      Icons.monitor_weight, 'Berat', '${cow.weight_kg} kg'),
                  _buildDetailRow(
                    Icons.cake,
                    'Tanggal Lahir',
                    cow.birthDate != null
                        ? DateFormat('dd MMM yyyy', 'id_ID')
                            .format(cow.birthDate!)
                        : 'Tidak tersedia',
                  ),
                  _buildDetailRow(Icons.transgender, 'Jenis Kelamin',
                      cow.gender ?? 'Tidak tersedia'),
                  _buildDetailRow(
                    Icons.replay,
                    'Status Reproduksi',
                    cow.reproductiveStatus ?? 'Tidak tersedia',
                  ),
                  _buildDetailRow(
                    Icons.calendar_today,
                    'Tanggal Masuk',
                    cow.entryDate != null
                        ? DateFormat('dd MMM yyyy', 'id_ID')
                            .format(cow.entryDate!)
                        : 'Tidak tersedia',
                  ),
                  _buildDetailRow(
                    Icons.check_circle,
                    'Status Laktasi',
                    cow.lactationStatus ? 'Ya' : 'Tidak',
                  ),
                  _buildDetailRow(
                    Icons.timeline,
                    'Fase Laktasi',
                    cow.lactationPhase ?? 'Tidak tersedia',
                  ),
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

  void _editCow(BuildContext context, Cow cow) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditCow(cow: cow),
      ),
    ); // Navigate to edit cow screen
  }

  void _showDeleteDialog(BuildContext context, Cow cow) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Delete Cow?', style: TextStyle(color: Colors.red[700])),
        content: Text(
            'Are you sure you want to delete ${cow.name}? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red[700]),
            onPressed: () async {
              // Show loading indicator
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (_) => const Center(
                  child: CircularProgressIndicator(),
                ),
              );

              try {
                // Delete cow logic
                await deleteCow(cow.id!);

                // Close loading dialog
                Navigator.pop(context);

                // Show success message
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Cow deleted successfully'),
                    backgroundColor: Colors.green,
                  ),
                );

                // Refresh UI
                setState(() {});
              } catch (e) {
                // Close loading dialog if error occurs
                Navigator.pop(context);

                // Show error message
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Failed to delete cow: $e'),
                    backgroundColor: Colors.red,
                  ),
                );
              }

              // Close confirmation dialog
              Navigator.pop(context);
            },
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
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
            child: Text(
              text,
              style: TextStyle(color: Colors.grey[700], fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cow Management'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                selectedGender = null;
                selectedBreed = null;
                selectedentryDate = null;
                _searchController.clear();
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Field
          Padding(
            padding: const EdgeInsets.only(left: 18.0, right: 18.0, top: 12.0),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search cows...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(
                    vertical: 7, horizontal: 12), // Mengatur tinggi
              ),
              onChanged: (value) => setState(() {}),
            ),
          ),

          // Filter Card
          Card(
            margin: const EdgeInsets.all(8),
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          decoration: const InputDecoration(
                            labelText: 'Filter by Gender',
                            border: OutlineInputBorder(),
                            contentPadding: EdgeInsets.symmetric(
                                vertical: 3, horizontal: 12), // Mengatur tinggi
                          ),
                          value: selectedGender,
                          items: [
                            const DropdownMenuItem(
                              value: null,
                              child: Text('All Genders'),
                            ),
                            const DropdownMenuItem(
                              value: 'Male',
                              child: Text('Male'),
                            ),
                            const DropdownMenuItem(
                              value: 'Female',
                              child: Text('Female'),
                            ),
                          ],
                          onChanged: (value) {
                            setState(() {
                              selectedGender = value;
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: InkWell(
                          onTap: () async {
                            final pickedDate = await showDatePicker(
                              context: context,
                              initialDate: DateTime.now(),
                              firstDate: DateTime(2000),
                              lastDate: DateTime(2100),
                            );
                            if (pickedDate != null) {
                              setState(() {
                                selectedentryDate = pickedDate;
                              });
                            }
                          },
                          child: InputDecorator(
                            decoration: const InputDecoration(
                              labelText: 'Filter by Entry Date',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(
                                  vertical: 8,
                                  horizontal: 12), // Mengatur tinggi
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  selectedentryDate == null
                                      ? 'Select Date'
                                      : DateFormat('dd MMM yyyy')
                                          .format(selectedentryDate!),
                                ),
                                const Icon(Icons.calendar_today),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _exportPDF(context),
                          icon: const Icon(Icons.picture_as_pdf),
                          label: const Text('Export PDF'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueGrey,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(9),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => _exportExcel(context),
                          icon: const Icon(Icons.table_chart),
                          label: const Text('Export Excel'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(9),
                            ),
                          ),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ),

          // Data Count
          Padding(
            padding: const EdgeInsets.only(left: 21.0, right: 21.0),
            child: FutureBuilder<List<Cow>>(
              future: fetchCows(),
              builder: (context, snapshot) {
                if (snapshot.hasData) {
                  return Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Showing ${snapshot.data!.length} cows',
                      style: const TextStyle(fontStyle: FontStyle.italic),
                    ),
                  );
                }
                return const SizedBox();
              },
            ),
          ),

          // Cow List
          Expanded(
            child: FutureBuilder<List<Cow>>(
              future: fetchCows(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(child: Text('No cows found.'));
                } else {
                  final cows = snapshot.data!;
                  return ListView.separated(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    itemCount: cows.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final cow = cows[index];
                      return Card(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 2,
                        child: InkWell(
                          onTap: () {
                            _showCowDetails(context, cow);
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
                                        cow.name,
                                        style: const TextStyle(
                                          fontSize: 18,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.cyan,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    PopupMenuButton<String>(
                                      onSelected: (value) {
                                        if (value == 'edit') {
                                          _editCow(context, cow);
                                        } else if (value == 'delete') {
                                          _showDeleteDialog(context, cow);
                                        }
                                      },
                                      itemBuilder: (context) => [
                                        PopupMenuItem(
                                          value: 'edit',
                                          child: Row(
                                            children: [
                                              Icon(Icons.edit,
                                                  color: Colors.blue[600]),
                                              const SizedBox(width: 8),
                                              const Text('Edit'),
                                            ],
                                          ),
                                        ),
                                        PopupMenuItem(
                                          value: 'delete',
                                          child: Row(
                                            children: [
                                              Icon(Icons.delete,
                                                  color: Colors.red[600]),
                                              const SizedBox(width: 8),
                                              const Text('Delete'),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                _buildInfoRow(
                                    Icons.pets, 'Breed: ${cow.breed}'),
                                _buildInfoRow(Icons.monitor_weight,
                                    'Weight: ${cow.weight_kg} kg'),
                                _buildInfoRow(Icons.calendar_today,
                                    'Birth Date: ${cow.birthDate != null ? DateFormat('dd MMMM yyyy').format(cow.birthDate!) : 'Unknown'}'),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  );
                }
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/add-cow');
        },
        backgroundColor: Colors.blue,
        child: const Icon(Icons.add),
      ),
    );
  }
}
