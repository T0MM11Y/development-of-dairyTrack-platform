import 'package:dairy_track/modules/produksi_susu/dataProduksiSusu/addDataProduksiSusu.dart';
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
  String? selectedPhase;
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
        data = List<Map<String, dynamic>>.from(
          response['data'].map((rawMilk) => rawMilk.toJson()),
        );
        filteredData = data;
      });
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(response['message'] ?? 'Failed to fetch data')),
      );
    }
  }

  void _resetFilters() {
    setState(() {
      selectedCow = null;
      selectedPhase = null;
      selectedSession = null;
      selectedDate = null;
      _fetchRawMilkData();
    });
  }

  void _applyFilters() {
    setState(() {
      filteredData = data.where((milk) {
        final matchesCow = selectedCow == null || milk['name'] == selectedCow;
        final matchesSession = selectedSession == null ||
            milk['session']?.toString() == selectedSession;
        final matchesPhase =
            selectedPhase == null || milk['lactation_phase'] == selectedPhase;
        final matchesDate = selectedDate == null ||
            (milk['production_time'] != null &&
                DateFormat('yyyy-MM-dd')
                        .format(DateTime.parse(milk['production_time'])) ==
                    DateFormat('yyyy-MM-dd').format(selectedDate!));
        return matchesCow && matchesPhase && matchesSession && matchesDate;
      }).toList();
    });
  }

  Widget _buildPhaseBadge(String phase) {
    Color badgeColor;
    String phaseText;
    switch (phase) {
      case '1':
        badgeColor = Colors.blue;
        phaseText = 'Awal Laktasi';
        break;
      case '2':
        badgeColor = Colors.green;
        phaseText = 'Puncak Laktasi';
        break;
      case '3':
        badgeColor = Colors.orange;
        phaseText = 'Akhir Laktasi';
        break;
      default:
        badgeColor = Colors.grey;
        phaseText = 'Phase $phase';
    }

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: badgeColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: badgeColor, width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.timeline, size: 14, color: badgeColor),
          SizedBox(width: 6),
          Text(
            phaseText,
            style: TextStyle(
              color: badgeColor,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSessionBadge(String session) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.purple.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.purple, width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.schedule, size: 14, color: Colors.purple),
          SizedBox(width: 6),
          Text(
            'Session $session',
            style: TextStyle(
              color: Colors.purple,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(bool isActive) {
    final status = isActive ? 'Aktif' : 'Non-Aktif';
    final color = isActive ? Colors.green : Colors.red;

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color, width: 1.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isActive ? Icons.check_circle : Icons.cancel,
            color: color,
            size: 14,
          ),
          SizedBox(width: 6),
          Text(
            status,
            style: TextStyle(
              color: color,
              fontWeight: FontWeight.bold,
              fontSize: 12,
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
        title: const Text('Data Produksi Susu',
            style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Color.fromARGB(255, 124, 207, 203),
        elevation: 0,
        centerTitle: true,
        iconTheme: IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: Icon(Icons.refresh),
            onPressed: _resetFilters,
            tooltip: 'Refresh',
          ),
        ],
      ),
      body: Container(
        color: const Color.fromARGB(255, 255, 254, 254),
        child: Column(
          children: [
            _buildFilterSection(),
            Expanded(
              child: _buildDataList(),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => AddDataProduksiSusu(),
            ),
          );
        },
        backgroundColor: Color(0xFFE74C3C),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildFilterSection() {
    final cows = data.map((e) => e['name'] as String).toSet().toList();
    final lactationPhases =
        data.map((e) => e['lactation_phase'] as String).toSet().toList();
    final sessions = data
        .map((e) => e['session']?.toString()) // Konversi nilai ke String
        .where((session) => session != null) // Hapus nilai null
        .cast<String>() // Pastikan tipe menjadi List<String>
        .toSet()
        .toList();

    return Card(
      margin: EdgeInsets.all(16),
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Filter Data Produksi',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2C3E50),
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 16),
            _buildFilterDropdown(
              label: 'Nama Sapi',
              value: selectedCow,
              items: cows,
              onChanged: (value) {
                setState(() {
                  selectedCow = value;
                  _applyFilters();
                });
              },
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildFilterDropdown(
                    label: 'Fase Laktasi',
                    value: selectedPhase,
                    items: lactationPhases,
                    onChanged: (value) {
                      setState(() {
                        selectedPhase = value;
                        _applyFilters();
                      });
                    },
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: _buildFilterDropdown(
                    label: 'Session',
                    value: selectedSession,
                    items: sessions,
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
            _buildDateFilter(),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterDropdown({
    required String label,
    required String? value,
    required List<String> items,
    required Function(String?) onChanged,
  }) {
    return DropdownButtonFormField<String>(
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: Color(0xFF2C3E50)),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: BorderSide(color: Color(0xFF2C3E50)),
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),
      value: value,
      items: [
        DropdownMenuItem(
          value: null,
          child: Text('Semua', style: TextStyle(color: Color(0xFF2C3E50))),
        ),
        ...items.map((item) {
          return DropdownMenuItem(
            value: item, // Pastikan ini adalah nama sapi
            child: Text(item, style: TextStyle(color: Color(0xFF2C3E50))),
          );
        }).toList(),
      ],
      onChanged: onChanged,
    );
  }

  Widget _buildDateFilter() {
    return InkWell(
      onTap: () async {
        final pickedDate = await showDatePicker(
          context: context,
          initialDate: DateTime.now(),
          firstDate: DateTime(2000),
          lastDate: DateTime(2100),
          builder: (context, child) {
            return Theme(
              data: Theme.of(context).copyWith(
                colorScheme: ColorScheme.light(
                  primary: Color(0xFF2C3E50),
                  onPrimary: Colors.white,
                  onSurface: Color(0xFF2C3E50),
                ),
                textButtonTheme: TextButtonThemeData(
                  style: TextButton.styleFrom(
                    foregroundColor: Color(0xFF2C3E50),
                  ),
                ),
              ),
              child: child!,
            );
          },
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
          labelText: 'Tanggal Produksi',
          labelStyle: TextStyle(color: Color(0xFF2C3E50)),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Color(0xFF2C3E50)),
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              selectedDate == null
                  ? 'Pilih Tanggal'
                  : DateFormat('dd MMM yyyy').format(selectedDate!),
              style: TextStyle(color: Color(0xFF2C3E50)),
            ),
            Icon(Icons.calendar_today, size: 20, color: Color(0xFF2C3E50)),
          ],
        ),
      ),
    );
  }

  Widget _buildDataList() {
    if (filteredData.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search_off, size: 64, color: Colors.white54),
            SizedBox(height: 16),
            Text(
              'Data tidak ditemukan',
              style: TextStyle(
                fontSize: 18,
                color: Colors.white,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Coba ubah filter pencarian Anda',
              style: TextStyle(
                fontSize: 14,
                color: Colors.white70,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: EdgeInsets.only(bottom: 80),
      itemCount: filteredData.length,
      itemBuilder: (context, index) {
        final milk = filteredData[index];
        final isActive = milk['lactation_status'] == true;

        return Container(
          margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
            ),
            child: InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () {
                // Add onTap functionality if needed
              },
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            milk['name'] ?? 'Sapi Tidak Dikenal',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Color(0xFF2C3E50),
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        _buildStatusBadge(isActive),
                      ],
                    ),
                    SizedBox(height: 12),
                    _buildInfoRow(
                      icon: Icons.access_time,
                      label: 'Waktu Produksi',
                      value: milk['production_time'] != null
                          ? DateFormat('dd MMM yyyy, HH:mm')
                              .format(DateTime.parse(milk['production_time']))
                          : 'Tidak Tercatat',
                    ),
                    SizedBox(height: 8),
                    _buildInfoRow(
                      icon: Icons.water_drop,
                      label: 'Volume Susu',
                      value: '${milk['volume_liters'] ?? '0'} Liter',
                    ),
                    SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildPhaseBadge(milk['lactation_phase'] ?? ''),
                        if (milk['session'] != null)
                          _buildSessionBadge(milk['session'].toString()),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: Color(0xFF7F8C8D)),
        SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Color(0xFF7F8C8D),
              ),
            ),
            SizedBox(height: 2),
            Text(
              value,
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFF2C3E50),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
