import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class DataProduksiSusu extends StatefulWidget {
  @override
  _DataProduksiSusuState createState() => _DataProduksiSusuState();
}

class _DataProduksiSusuState extends State<DataProduksiSusu> {
  List<Map<String, dynamic>> data = [
    {
      'cow_name': 'Cow A',
      'production_time': '2023-10-01T08:00:00',
      'volume_liters': 10,
      'lactation_phase': 'Early',
      'lactation_status': 'Healthy',
    },
    {
      'cow_name': 'Cow B',
      'production_time': '2023-10-02T09:00:00',
      'volume_liters': 12,
      'lactation_phase': 'Mid',
      'lactation_status': 'Healthy',
    },
  ];

  String? selectedCow;
  String? selectedSession;
  DateTime? selectedDate;

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
                        onChanged: (value) {},
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
                        onChanged: (value) {},
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 12),
                InkWell(
                  onTap: () {},
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
        Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                SizedBox(
                  width: 100,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.picture_as_pdf, size: 20),
                    label: Text('PDF'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueGrey,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 5),
                    ),
                  ),
                ),
                SizedBox(width: 8),
                SizedBox(
                  width: 100,
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.table_chart, size: 20),
                    label: Text('Excel'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 5),
                    ),
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {},
                    icon: Icon(Icons.search, size: 20),
                    label: Text('Search'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blue,
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 5),
                    ),
                  ),
                ),
              ],
            )),
        Expanded(
          child: ListView.builder(
            itemCount: data.length,
            itemBuilder: (context, index) {
              final milk = data[index];
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
