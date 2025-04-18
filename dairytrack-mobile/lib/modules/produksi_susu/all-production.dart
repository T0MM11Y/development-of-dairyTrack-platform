import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/config/api/produktivitas/rawMilk.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/modules/produksi_susu/RawMilkTable.dart';
import 'package:dairy_track/modules/produksi_susu/modal.dart';
import 'package:syncfusion_flutter_xlsio/xlsio.dart' as xlsio;
import 'package:pdf/widgets.dart' as pw;

class DataProduksiSusu extends StatefulWidget {
  @override
  _DataProduksiSusuState createState() => _DataProduksiSusuState();
}

class _DataProduksiSusuState extends State<DataProduksiSusu> {
  List<dynamic> rawMilks = [];
  List<dynamic> cows = [];
  bool isLoading = true;
  String? selectedCow;
  DateTime? selectedDate;
  String searchQuery = '';
  String? modalType;
  dynamic selectedRawMilk;
  Map<String, dynamic> formData = {
    'cow_id': '',
    'production_time': '',
    'volume_liters': '',
    'previous_volume': 0,
    'status': 'fresh',
    'lactation_status': false,
    'lactation_phase': 'Dry',
  };
  bool isProcessing = false;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    setState(() {
      isLoading = true;
    });
    try {
      // Ambil data dari API
      final Map<String, dynamic> milkData = await getRawMilk(); // Satu objek
      final List<dynamic> cowData = await getCows(); // Daftar objek

      setState(() {
        rawMilks = [milkData]; // rawMilks harus bertipe List<dynamic>
        cows = cowData; // cows harus bertipe List<dynamic>
      });
    } catch (error) {
      print('Failed to fetch data: $error');
    } finally {
      setState(() {
        isLoading = false;
      });
    }
  }

  List<dynamic> get filteredRawMilks {
    return rawMilks.where((milk) {
      final searchLower = searchQuery.toLowerCase();
      final cowMatch =
          selectedCow == null || milk['cow']['id'] == int.parse(selectedCow!);
      final dateMatch = selectedDate == null ||
          DateFormat('yyyy-MM-dd')
                  .format(DateTime.parse(milk['production_time'])) ==
              DateFormat('yyyy-MM-dd').format(selectedDate!);
      final searchMatch = milk['cow']['name']
              .toLowerCase()
              .contains(searchLower) ||
          milk['production_time'].toLowerCase().contains(searchLower) ||
          milk['volume_liters'].toString().toLowerCase().contains(searchLower);

      return cowMatch && dateMatch && searchMatch;
    }).toList();
  }

  Future<void> handleExportExcel() async {
    final workbook = xlsio.Workbook();
    final sheet = workbook.worksheets[0];

    sheet.getRangeByName('A1').setText('Cow Name');
    sheet.getRangeByName('B1').setText('Production Time');
    sheet.getRangeByName('C1').setText('Volume (Liters)');
    sheet.getRangeByName('D1').setText('Status');

    for (int i = 0; i < filteredRawMilks.length; i++) {
      final milk = filteredRawMilks[i];
      sheet.getRangeByIndex(i + 2, 1).setText(milk['cow']['name']);
      sheet.getRangeByIndex(i + 2, 2).setText(milk['production_time']);
      sheet.getRangeByIndex(i + 2, 3).setNumber(milk['volume_liters']);
      sheet.getRangeByIndex(i + 2, 4).setText(milk['status']);
    }

    final bytes = workbook.saveAsStream();
    workbook.dispose();
    // Save the file locally
  }

  Future<void> handleExportPDF() async {
    final pdf = pw.Document();

    pdf.addPage(
      pw.Page(
        build: (context) => pw.Column(
          children: [
            pw.Text('Milk Production Data', style: pw.TextStyle(fontSize: 18)),
            pw.Table.fromTextArray(
              headers: [
                '#',
                'Cow Name',
                'Production Time',
                'Volume (Liters)',
                'Status'
              ],
              data: List.generate(
                filteredRawMilks.length,
                (index) {
                  final milk = filteredRawMilks[index];
                  return [
                    index + 1,
                    milk['cow']['name'],
                    milk['production_time'],
                    milk['volume_liters'],
                    milk['status'],
                  ];
                },
              ),
            ),
          ],
        ),
      ),
    );
    // Save the PDF file locally
  }

  void openModal(String type, [dynamic rawMilk]) {
    setState(() {
      modalType = type;
      selectedRawMilk = rawMilk;
      if (type == 'edit' && rawMilk != null) {
        formData = {
          'cow_id': rawMilk['cow']['id'].toString(),
          'production_time': rawMilk['production_time'],
          'volume_liters': rawMilk['volume_liters'],
          'previous_volume': rawMilk['previous_volume'] ?? 0,
          'status': rawMilk['status'] ?? 'fresh',
          'lactation_status': rawMilk['lactation_status'] ?? false,
          'lactation_phase': rawMilk['lactation_phase'] ?? 'Dry',
        };
      } else if (type == 'create') {
        formData = {
          'cow_id': '',
          'production_time': '',
          'volume_liters': '',
          'previous_volume': 0,
          'status': 'fresh',
          'lactation_status': false,
          'lactation_phase': 'Dry',
        };
      }
    });

    showDialog(
      context: context,
      builder: (context) => Modal(
        modalType: modalType,
        formData: formData,
        setFormData: (newData) {
          setState(() {
            formData = newData;
          });
        },
        cows: cows,
        handleSubmit: handleSubmit,
        handleDelete: handleDelete,
        setModalType: (type) {
          setState(() {
            modalType = type;
          });
        },
        selectedRawMilk: selectedRawMilk,
        isProcessing: isProcessing,
        handleCowChange: handleCowChange,
      ),
    );
  }

  Future<void> handleCowChange(String cowId) async {
    setState(() {
      formData['cow_id'] = cowId;
      isProcessing = true;
    });

    try {
      final rawMilks = await getRawMilksByCowId(cowId);
      final lastMilkData = rawMilks.isNotEmpty ? rawMilks[0] : null;
      setState(() {
        formData['previous_volume'] = lastMilkData?['volume_liters'] ?? 0;
      });
    } catch (error) {
      print('Error fetching previous volume: $error');
      setState(() {
        formData['previous_volume'] = 0;
      });
    } finally {
      setState(() {
        isProcessing = false;
      });
    }
  }

  Future<void> handleSubmit() async {
    setState(() {
      isProcessing = true;
    });

    try {
      if (modalType == 'create') {
        await createRawMilk(formData);
      } else if (modalType == 'edit') {
        await updateRawMilk(selectedRawMilk['id'], formData);
      }
      await fetchData();
      Navigator.of(context).pop();
    } catch (error) {
      print('Failed to submit: $error');
    } finally {
      setState(() {
        isProcessing = false;
      });
    }
  }

  Future<void> handleDelete() async {
    if (selectedRawMilk == null) return;
    setState(() {
      isProcessing = true;
    });
    try {
      await deleteRawMilk(selectedRawMilk['id']);
      await fetchData();
      Navigator.of(context).pop();
    } catch (error) {
      print('Failed to delete raw milk: $error');
    } finally {
      setState(() {
        isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Milk Production Logs'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () => openModal('create'),
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: DropdownButton<String>(
                          value: selectedCow,
                          hint: Text('Filter by Cow'),
                          isExpanded: true,
                          items: [
                            DropdownMenuItem(
                              value: null,
                              child: Text('All Cows'),
                            ),
                            ...cows.map<DropdownMenuItem<String>>((cow) {
                              return DropdownMenuItem<String>(
                                value: cow['id'].toString(),
                                child: Text(cow['name']),
                              );
                            }).toList(),
                          ],
                          onChanged: (value) {
                            setState(() {
                              selectedCow = value;
                            });
                          },
                        ),
                      ),
                      SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          decoration: InputDecoration(
                            labelText: 'Search',
                            prefixIcon: Icon(Icons.search),
                          ),
                          onChanged: (value) {
                            setState(() {
                              searchQuery = value;
                            });
                          },
                        ),
                      ),
                      SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: handleExportExcel,
                        child: Text('Excel'),
                      ),
                      SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: handleExportPDF,
                        child: Text('PDF'),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: RawMilkTable(
                    rawMilks: filteredRawMilks,
                    openModal: openModal,
                    isLoading: isLoading,
                  ),
                ),
              ],
            ),
    );
  }
}
