import 'package:dairy_track/config/api/pakan/feedType.dart';
import 'package:dairy_track/model/pakan/feedType.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllFeedTypes extends StatefulWidget {
  const AllFeedTypes({super.key});

  @override
  _AllFeedTypesState createState() => _AllFeedTypesState();
}

class _AllFeedTypesState extends State<AllFeedTypes> {
  String? searchQuery;
  DateTime? selectedCreatedDate;

  Future<List<FeedType>> fetchFeedTypes() async {
    try {
      // Changed from getFeedTypes() to getAllFeedTypes() to match the API function name
      final response = await getAllFeedTypes();
      
      return response.where((feedType) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            feedType.name.toLowerCase().contains(searchQuery!.toLowerCase());

        final matchesCreatedDate = selectedCreatedDate == null ||
            DateFormat('yyyy-MM-dd').format(feedType.createdAt) ==
                DateFormat('yyyy-MM-dd').format(selectedCreatedDate!);

        return matchesSearchQuery && matchesCreatedDate;
      }).toList();
    } catch (e) {
      throw Exception('Failed to fetch data: $e');
    }
  }

  Future<void> _exportToPDF() async {
    // Implementasi ekspor ke PDF
    // Contoh: await generatePDF(feedTypes);
  }

  Future<void> _exportToExcel() async {
    // Implementasi ekspor ke Excel
    // Contoh: await generateExcel(feedTypes);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Jenis Pakan'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: Column(
        children: [
          Card(
            margin: const EdgeInsets.all(8),
            elevation: 2,
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
                        child: TextFormField(
                          decoration: const InputDecoration(
                            labelText: 'Cari berdasarkan Nama',
                            border: OutlineInputBorder(),
                            prefixIcon: Icon(Icons.search),
                            contentPadding:
                                EdgeInsets.symmetric(horizontal: 12),
                          ),
                          onChanged: (value) {
                            setState(() {
                              searchQuery = value.trim();
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
                                selectedCreatedDate = pickedDate;
                              });
                            }
                          },
                          child: InputDecorator(
                            decoration: const InputDecoration(
                              labelText: 'Filter berdasarkan Tanggal Dibuat',
                              border: OutlineInputBorder(),
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 16,
                              ),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  selectedCreatedDate == null
                                      ? 'Pilih Tanggal'
                                      : DateFormat('dd MMM yyyy')
                                          .format(selectedCreatedDate!),
                                ),
                                const Icon(Icons.calendar_today, size: 20),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      SizedBox(
                        width: 100,
                        child: ElevatedButton.icon(
                          onPressed: _exportToPDF,
                          icon: const Icon(Icons.picture_as_pdf, size: 20),
                          label: const Text('PDF'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blueGrey,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 5),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        width: 100,
                        child: ElevatedButton.icon(
                          onPressed: _exportToExcel,
                          icon: const Icon(Icons.table_chart, size: 20),
                          label: const Text('Excel'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 5),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () => setState(() {}),
                          icon: const Icon(Icons.search, size: 20),
                          label: const Text('Cari'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 5),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: FutureBuilder<List<FeedType>>(
              future: fetchFeedTypes(),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                } else if (snapshot.hasError) {
                  return Center(child: Text('Error: ${snapshot.error}'));
                } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                  return const Center(
                      child: Text('Tidak ada jenis pakan ditemukan.'));
                }

                final feedTypes = snapshot.data!;
                return ListView.builder(
                  itemCount: feedTypes.length,
                  itemBuilder: (context, index) {
                    final feedType = feedTypes[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(
                          vertical: 8, horizontal: 16),
                      elevation: 4,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  feedType.name,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                    color: Colors.blue,
                                  ),
                                ),
                                Row(
                                  children: [
                                    IconButton(
                                      icon: const Icon(Icons.edit,
                                          color: Colors.blue),
                                      onPressed: () {
                                        Navigator.pushNamed(
                                          context,
                                          '/edit-feed-type',
                                          arguments: feedType,
                                        ).then((_) => setState(() {}));
                                      },
                                      tooltip: 'Edit',
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete,
                                          color: Colors.red),
                                      onPressed: () async {
                                        final confirm = await showDialog<bool>(
                                          context: context,
                                          builder: (context) => AlertDialog(
                                            title:
                                                const Text('Hapus Jenis Pakan'),
                                            content: Text(
                                                'Anda yakin ingin menghapus "${feedType.name}"?'),
                                            actions: [
                                              TextButton(
                                                onPressed: () => Navigator.pop(
                                                    context, false),
                                                child: const Text('Batal'),
                                              ),
                                              TextButton(
                                                onPressed: () => Navigator.pop(
                                                    context, true),
                                                child: const Text('Hapus',
                                                    style: TextStyle(
                                                        color: Colors.red)),
                                              ),
                                            ],
                                          ),
                                        );

                                        if (confirm == true) {
                                          try {
                                            // Make sure to properly handle null or undefined ID
                                            if (feedType.id != null) {
                                              await deleteFeedType(feedType.id!);
                                              ScaffoldMessenger.of(context)
                                                  .showSnackBar(
                                                const SnackBar(
                                                    content: Text(
                                                        'Jenis pakan berhasil dihapus')),
                                              );
                                              setState(() {});
                                            } else {
                                              throw Exception('ID tidak valid');
                                            }
                                          } catch (e) {
                                            ScaffoldMessenger.of(context)
                                                .showSnackBar(
                                              SnackBar(
                                                  content: Text(
                                                      'Gagal menghapus: $e')),
                                            );
                                          }
                                        }
                                      },
                                      tooltip: 'Hapus',
                                    ),
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'ID: ${feedType.id}',
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Dibuat: ${DateFormat('dd MMM yyyy').format(feedType.createdAt)}',
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Terakhir Diperbarui: ${DateFormat('dd MMM yyyy').format(feedType.updatedAt)}',
                              style: TextStyle(color: Colors.grey[600]),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/tambah-jenis-pakan')
              .then((_) => setState(() {}));
        },
        backgroundColor: Colors.blue[700],
        child: const Icon(Icons.add),
      ),
    );
  }
}