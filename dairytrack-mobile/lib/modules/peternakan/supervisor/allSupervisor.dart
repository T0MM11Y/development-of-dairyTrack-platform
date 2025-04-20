import 'package:dairy_track/modules/peternakan/supervisor/editSupervisor.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/model/peternakan/supervisor.dart';
import 'package:dairy_track/config/api/peternakan/supervisor.dart';

class AllSupervisor extends StatefulWidget {
  @override
  _AllSupervisorState createState() => _AllSupervisorState();
}

class _AllSupervisorState extends State<AllSupervisor> {
  final TextEditingController _searchController = TextEditingController();
  String? selectedStatus;

  Future<List<Supervisor>> fetchSupervisors() async {
    final supervisors = await getSupervisors();

    final filteredSupervisors = supervisors.where((supervisor) {
      final searchText = _searchController.text.toLowerCase();
      final matchesSearch = searchText.isEmpty ||
          supervisor.firstName.toLowerCase().contains(searchText) ||
          supervisor.lastName.toLowerCase().contains(searchText) ||
          supervisor.email.toLowerCase().contains(searchText);

      return matchesSearch;
    }).toList();

    filteredSupervisors.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return filteredSupervisors;
  }

  void _showDeleteDialog(Supervisor supervisor) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Delete Supervisor?',
            style: TextStyle(color: Colors.red[700])),
        content: Text(
            'Are you sure you want to delete ${supervisor.firstName} ${supervisor.lastName}? This action cannot be undone.'),
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
                await deleteSupervisor(context, supervisor.id!);

                // Tutup dialog loading
                Navigator.pop(context);

                // Tampilkan pesan sukses
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Supervisor deleted successfully'),
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
                    content: Text('Failed to delete supervisor: $e'),
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

    try {
      final file = await exportSupervisorsPDF(context);

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
    } catch (e) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Terjadi kesalahan: $e'),
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

    try {
      final file = await exportSupervisorsExcel(context);

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
    } catch (e) {
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Terjadi kesalahan: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showSupervisorDetails(BuildContext context, Supervisor supervisor) {
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
                    'Detail Supervisor',
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
            width: MediaQuery.of(context).size.width * 0.3,
            height: MediaQuery.of(context).size.height * 0.3,
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildDetailRow(
                      Icons.person, 'Nama Depan', supervisor.firstName),
                  _buildDetailRow(Icons.person_outline, 'Nama Belakang',
                      supervisor.lastName),
                  _buildDetailRow(Icons.email, 'Email',
                      supervisor.email ?? 'Tidak tersedia'),
                  _buildDetailRow(Icons.phone, 'Kontak',
                      supervisor.contact ?? 'Tidak tersedia'),
                  _buildDetailRow(Icons.wc, 'Jenis Kelamin', supervisor.gender),
                  _buildDetailRow(
                    Icons.calendar_today,
                    'Tanggal Dibuat',
                    DateFormat('dd MMM yyyy').format(supervisor.createdAt),
                  ),
                  _buildDetailRow(
                    Icons.update,
                    'Tanggal Diperbarui',
                    DateFormat('dd MMM yyyy').format(supervisor.updatedAt),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Supervisor Management',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                selectedStatus = null;
                _searchController.clear();
              });
            },
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search supervisors...',
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
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _exportPDF(context),
                    icon: Icon(Icons.picture_as_pdf),
                    label: Text('Export PDF'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.grey[700],
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => _exportExcel(context),
                    icon: Icon(Icons.table_chart),
                    label: Text('Export Excel'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green[700],
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List<Supervisor>>(
              future: fetchSupervisors(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(
                      child: CircularProgressIndicator(color: Colors.cyan));
                } else if (snapshot.hasError) {
                  return Center(
                      child: Text('Error: ${snapshot.error}',
                          style: TextStyle(color: Colors.red)));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return Center(
                      child: Text('No supervisors found.',
                          style: TextStyle(color: Colors.grey)));
                } else {
                  final supervisors = snapshot.data!;
                  return RefreshIndicator(
                    color: Colors.cyan,
                    onRefresh: () async => setState(() {}),
                    child: ListView.separated(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 8),
                      itemCount: supervisors.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final supervisor = supervisors[index];
                        return Card(
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          elevation: 2,
                          child: InkWell(
                            onTap: () {
                              _showSupervisorDetails(context, supervisor);
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
                                          '${supervisor.firstName} ${supervisor.lastName}',
                                          style: const TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              color: Colors.cyan),
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      PopupMenuButton<String>(
                                        onSelected: (value) {
                                          if (value == 'edit') {
                                            Navigator.push(
                                              context,
                                              MaterialPageRoute(
                                                builder: (context) =>
                                                    EditSupervisor(
                                                  supervisor: supervisor,
                                                  id: supervisor.id!,
                                                ),
                                              ),
                                            ).then((_) {
                                              setState(() {});
                                            });
                                          } else if (value == 'delete') {
                                            _showDeleteDialog(supervisor);
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
                                  _buildInfoRow(Icons.email,
                                      supervisor.email ?? 'No email'),
                                  _buildInfoRow(Icons.phone,
                                      supervisor.contact ?? 'No contact'),
                                  _buildInfoRow(Icons.wc, supervisor.gender),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  );
                }
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, '/add-supervisor'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        child: const Icon(Icons.add),
      ),
    );
  }
}
