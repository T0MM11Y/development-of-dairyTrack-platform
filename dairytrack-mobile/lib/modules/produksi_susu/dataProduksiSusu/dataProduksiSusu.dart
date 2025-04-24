import 'package:dairy_track/model/produktivitas/rawMilk.dart';
import 'package:dairy_track/modules/produksi_susu/dataProduksiSusu/addDataProduksiSusu.dart';
import 'package:dairy_track/modules/produksi_susu/dataProduksiSusu/editDataProduksiSusu.dart';
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
  bool isLoading = false;
  bool isExporting = false;

  @override
  void initState() {
    super.initState();
    _fetchRawMilkData();
  }

  Future<void> _fetchRawMilkData() async {
    setState(() {
      isLoading = true;
    });

    try {
      final response = await getRawMilkData();
      if (response['status'] == 'success') {
        setState(() {
          data = List<Map<String, dynamic>>.from(
            response['data'].map((rawMilk) => rawMilk.toJson()),
          );
          filteredData = List.from(data);
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memuat data: ${response['message']}')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Terjadi kesalahan: ${e.toString()}')),
      );
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  void _resetFilters() {
    setState(() {
      selectedCow = null;
      selectedPhase = null;
      selectedSession = null;
      selectedDate = null;
      filteredData = List.from(data);
    });
  }

  Future<void> _exportPDF(BuildContext context) async {
    if (isExporting) return;

    setState(() {
      isExporting = true;
    });

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return Center(child: CircularProgressIndicator());
        },
      );

      final file = await exportRawMilkPDF(context);

      Navigator.of(context).pop();

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
          content: Text('Gagal mengekspor PDF: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        isExporting = false;
      });
    }
  }

  Future<void> _exportExcel(BuildContext context) async {
    if (isExporting) return;

    setState(() {
      isExporting = true;
    });

    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (BuildContext context) {
          return Center(child: CircularProgressIndicator());
        },
      );

      final file = await exportRawMilkExcel(context);

      Navigator.of(context).pop();

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
          content: Text('Gagal mengekspor Excel: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() {
        isExporting = false;
      });
    }
  }

  bool isDeleting = false; // Tambahkan variabel untuk mengontrol loading

  void _showDeleteDialog(Map<String, dynamic> milk) {
    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Stack(
              children: [
                AlertDialog(
                  title: Text('Konfirmasi Hapus'),
                  content: Text(
                      'Apakah Anda yakin ingin menghapus data produksi susu ini?'),
                  actions: [
                    TextButton(
                      onPressed: () {
                        if (mounted) {
                          Navigator.of(dialogContext).pop();
                        }
                      },
                      child: Text('Batal'),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red[700],
                      ),
                      onPressed: () async {
                        setState(() {
                          isDeleting = true; // Tampilkan loading
                        });

                        try {
                          final result = await deleteRawMilkData(milk['id']);
                          if (result['status'] == 'success') {
                            // Tampilkan notifikasi berhasil
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Data berhasil dihapus'),
                                  backgroundColor: Colors.green,
                                ),
                              );
                            }
                            // Refresh data
                            await _fetchRawMilkData();
                          } else {
                            // Tampilkan notifikasi gagal
                            if (mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                      'Gagal menghapus data: ${result['message']}'),
                                  backgroundColor: Colors.red,
                                ),
                              );
                            }
                          }
                        } catch (e) {
                          // Tampilkan notifikasi error
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content:
                                    Text('Terjadi kesalahan: ${e.toString()}'),
                                backgroundColor: Colors.red,
                              ),
                            );
                          }
                        } finally {
                          if (mounted) {
                            setState(() {
                              isDeleting = false; // Sembunyikan loading
                            });
                            Navigator.of(dialogContext).pop(); // Tutup dialog
                          }
                        }
                      },
                      child:
                          Text('Hapus', style: TextStyle(color: Colors.white)),
                    ),
                  ],
                ),
                if (isDeleting)
                  ModalBarrier(
                    dismissible: false,
                    color: Colors.black.withOpacity(0.5),
                  ),
                if (isDeleting)
                  Center(
                    child: CircularProgressIndicator(),
                  ),
              ],
            );
          },
        );
      },
    );
  }

  void _applyFilters() {
    setState(() {
      filteredData = data.where((milk) {
        final matchesCow = selectedCow == null || milk['name'] == selectedCow;
        final matchesSession = selectedSession == null ||
            milk['session']?.toString() == selectedSession;
        final matchesPhase =
            selectedPhase == null || milk['lactation_phase'] == selectedPhase;

        bool matchesDate = selectedDate == null;
        if (!matchesDate && milk['production_time'] != null) {
          try {
            matchesDate = DateFormat('yyyy-MM-dd')
                    .format(DateTime.parse(milk['production_time'])) ==
                DateFormat('yyyy-MM-dd').format(selectedDate!);
          } catch (e) {
            matchesDate = false;
          }
        }

        return matchesCow && matchesPhase && matchesSession && matchesDate;
      }).toList();
    });
  }

  Widget _buildPhaseBadge(String? phase) {
    if (phase == null || phase.isEmpty) {
      return SizedBox.shrink();
    }

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

  Widget _buildSessionBadge(String? session) {
    if (session == null || session.isEmpty) {
      return SizedBox.shrink();
    }

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

  Widget _buildStatusBadge(bool? isActive) {
    final status = isActive == true ? 'Aktif' : 'Non-Aktif';
    final color = isActive == true ? Colors.green : Colors.red;

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
            isActive == true ? Icons.check_circle : Icons.cancel,
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
            onPressed: isLoading ? null : _fetchRawMilkData,
            tooltip: 'Refresh',
          ),
          IconButton(
            icon: Icon(Icons.picture_as_pdf),
            onPressed: isExporting ? null : () => _exportPDF(context),
            tooltip: 'Export PDF',
          ),
          IconButton(
            icon: Icon(Icons.table_chart),
            onPressed: isExporting ? null : () => _exportExcel(context),
            tooltip: 'Export Excel',
          ),
        ],
      ),
      body: Container(
        color: const Color.fromARGB(255, 255, 254, 254),
        child: Column(
          children: [
            _buildFilterSection(),
            Expanded(
              child: isLoading ? _buildLoadingIndicator() : _buildDataList(),
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
          ).then((_) => _fetchRawMilkData());
        },
        backgroundColor: Color(0xFFE74C3C),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildLoadingIndicator() {
    return Center(
      child: CircularProgressIndicator(),
    );
  }

  Widget _buildFilterSection() {
    final cows = data
        .map((e) => e['name']?.toString() ?? '')
        .where((name) => name.isNotEmpty)
        .toSet()
        .toList();
    final lactationPhases = data
        .map((e) => e['lactation_phase']?.toString() ?? '')
        .where((phase) => phase.isNotEmpty)
        .toSet()
        .toList();
    final sessions = data
        .map((e) => e['session']?.toString())
        .where((session) => session != null && session.isNotEmpty)
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
                    items: sessions.whereType<String>().toList(),
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
            value: item,
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
            Icon(Icons.search_off, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'Data tidak ditemukan',
              style: TextStyle(
                fontSize: 18,
                color: Colors.black87,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Coba ubah filter pencarian Anda',
              style: TextStyle(
                fontSize: 14,
                color: Colors.black54,
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
              onTap: () {},
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
                            milk['name']?.toString() ?? 'Sapi Tidak Dikenal',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                              color: Color(0xFF2C3E50),
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        PopupMenuButton<String>(
                          onSelected: (value) {
                            if (value == 'edit') {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => EditDataProduksiSusu(
                                    rawMilk: RawMilk(
                                      id: milk['id'],
                                      cowId: milk['cow_id'],
                                      cowName: milk['name']?.toString() ??
                                          'Sapi Tidak Dikenal',
                                      productionTime:
                                          milk['production_time'] != null
                                              ? DateTime.parse(
                                                  milk['production_time'])
                                              : DateTime.now(),
                                      volumeLiters: double.tryParse(
                                              milk['volume_liters']
                                                      ?.toString() ??
                                                  '0') ??
                                          0,
                                      lactationPhase:
                                          milk['lactation_phase']?.toString() ??
                                              'Unknown',
                                      lactationStatus:
                                          milk['lactation_status'] == true,
                                      expirationTime:
                                          milk['expiration_time'] != null
                                              ? DateTime.parse(
                                                  milk['expiration_time'])
                                              : DateTime.now(),
                                      availableStocks: double.tryParse(
                                              milk['available_stocks']
                                                      ?.toString() ??
                                                  '0') ??
                                          0,
                                      session: int.tryParse(
                                              milk['session']?.toString() ??
                                                  '') ??
                                          0,
                                      createdAt: milk['created_at'] != null
                                          ? DateTime.parse(milk['created_at'])
                                          : DateTime.now(),
                                      updatedAt: milk['updated_at'] != null
                                          ? DateTime.parse(milk['updated_at'])
                                          : DateTime.now(),
                                      isExpired: milk['is_expired'] == true,
                                    ),
                                  ),
                                ),
                              ).then((_) {
                                _fetchRawMilkData();
                              });
                            } else if (value == 'delete') {
                              _showDeleteDialog(milk);
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
                      value:
                          '${milk['volume_liters']?.toString() ?? '0'} Liter',
                    ),
                    SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildPhaseBadge(milk['lactation_phase']?.toString()),
                        _buildSessionBadge(milk['session']?.toString()),
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
