import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../config/api/produktivitas/rawMilk.dart';

class DataProduksiSusu extends StatefulWidget {
  @override
  _DataProduksiSusuState createState() => _DataProduksiSusuState();
}

class _DataProduksiSusuState extends State<DataProduksiSusu> {
  List<Map<String, dynamic>> data = [];
  List<Map<String, dynamic>> filteredData = [];
  String? selectedCow;
  String? selectedSession;
  DateTime? selectedDate;

  @override
  void initState() {
    super.initState();
    _fetchRawMilkData();
  }

  Future<void> _fetchRawMilkData() async {
    final response = await getRawMilkData();
    if (response['status'] == 'success') {
      setState(() {
        data = List<Map<String, dynamic>>.from(response['data']);
        filteredData = data; // Inisialisasi data yang difilter
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response['message'] ?? 'Failed to fetch data')),
      );
    }
  }

  void _applyFilters() {
    setState(() {
      filteredData = data.where((milk) {
        final matchesCow =
            selectedCow == null || milk['cow_name'] == selectedCow;
        final matchesSession = selectedSession == null ||
            milk['lactation_phase'] == selectedSession;
        final matchesDate = selectedDate == null ||
            (milk['production_time'] != null &&
                DateFormat('yyyy-MM-dd')
                        .format(DateTime.parse(milk['production_time'])) ==
                    DateFormat('yyyy-MM-dd').format(selectedDate!));
        return matchesCow && matchesSession && matchesDate;
      }).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Produksi Susu'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return _buildMobileView();
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: Colors.blue[700],
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildMobileView() {
    final cows = data.map((e) => e['cow_name'] as String).toSet().toList();
    final sessions =
        data.map((e) => e['lactation_phase'] as String).toSet().toList();

    return Column(
      children: [
        Card(
          margin: EdgeInsets.all(8),
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
                      child: DropdownButtonFormField<String>(
                        decoration: InputDecoration(
                          labelText: 'Filter by Cow',
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        value: selectedCow,
                        items: [
                          DropdownMenuItem(
                            value: null,
                            child: Text('All Cows'),
                          ),
                          ...cows.map((cow) {
                            return DropdownMenuItem(
                              value: cow,
                              child: Text(cow),
                            );
                          }).toList(),
                        ],
                        onChanged: (value) {
                          setState(() {
                            selectedCow = value;
                            _applyFilters();
                          });
                        },
                      ),
                    ),
                    SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        decoration: InputDecoration(
                          labelText: 'Filter by Session',
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                        ),
                        value: selectedSession,
                        items: [
                          DropdownMenuItem(
                            value: null,
                            child: Text('All Sessions'),
                          ),
                          ...sessions.map((session) {
                            return DropdownMenuItem(
                              value: session,
                              child: Text(session),
                            );
                          }).toList(),
                        ],
                        onChanged: (value) {
                          setState(() {
                            selectedSession = value;
                            _applyFilters();
                          });
                        },
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12),
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
                        selectedDate = pickedDate;
                        _applyFilters();
                      });
                    }
                  },
                  child: InputDecorator(
                    decoration: InputDecoration(
                      labelText: 'Filter by Date',
                      border: OutlineInputBorder(),
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 12, vertical: 16),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          selectedDate == null
                              ? 'Select Date'
                              : DateFormat('dd MMM yyyy').format(selectedDate!),
                        ),
                        Icon(Icons.calendar_today, size: 20),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: filteredData.length,
            itemBuilder: (context, index) {
              final milk = filteredData[index];
              return Card(
                margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
                elevation: 4,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            milk['cow_name'] ?? 'Unknown Cow',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Colors.blue,
                            ),
                          ),
                          Row(
                            children: [
                              IconButton(
                                icon:
                                    const Icon(Icons.edit, color: Colors.blue),
                                onPressed: () {},
                                tooltip: 'Edit',
                              ),
                              IconButton(
                                icon:
                                    const Icon(Icons.delete, color: Colors.red),
                                onPressed: () {},
                                tooltip: 'Hapus',
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Waktu: ${milk['production_time'] != null ? DateFormat('dd MMM yyyy, HH:mm').format(DateTime.parse(milk['production_time'])) : 'N/A'}',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Volume: ${milk['volume_liters']} Liter',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Fase Laktasi: ${milk['lactation_phase']}',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Status: ${milk['lactation_status']}',
                        style: TextStyle(color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
