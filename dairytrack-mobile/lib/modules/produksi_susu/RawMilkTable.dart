import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/config/api/produktivitas/rawMilk.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';

class RawMilkTable extends StatefulWidget {
  final List<dynamic> rawMilks;
  final Function(String, dynamic) openModal;
  final bool isLoading;

  const RawMilkTable({
    Key? key,
    required this.rawMilks,
    required this.openModal,
    required this.isLoading,
  }) : super(key: key);

  @override
  _RawMilkTableState createState() => _RawMilkTableState();
}

class _RawMilkTableState extends State<RawMilkTable> {
  static const int ITEMS_PER_PAGE = 10;
  int currentPage = 1;

  int get totalPages => (widget.rawMilks.length / ITEMS_PER_PAGE).ceil();

  List<dynamic> get paginatedData {
    final startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    final endIndex = startIndex + ITEMS_PER_PAGE;
    return widget.rawMilks.sublist(
      startIndex.clamp(0, widget.rawMilks.length),
      endIndex.clamp(0, widget.rawMilks.length),
    );
  }

  void handlePageChange(int page) {
    if (page >= 1 && page <= totalPages) {
      setState(() {
        currentPage = page;
      });
    }
  }

  Widget _buildPagination() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        IconButton(
          icon: const Icon(Icons.first_page),
          onPressed: currentPage > 1 ? () => handlePageChange(1) : null,
        ),
        IconButton(
          icon: const Icon(Icons.chevron_left),
          onPressed:
              currentPage > 1 ? () => handlePageChange(currentPage - 1) : null,
        ),
        Text('Page $currentPage of $totalPages'),
        IconButton(
          icon: const Icon(Icons.chevron_right),
          onPressed: currentPage < totalPages
              ? () => handlePageChange(currentPage + 1)
              : null,
        ),
        IconButton(
          icon: const Icon(Icons.last_page),
          onPressed: currentPage < totalPages
              ? () => handlePageChange(totalPages)
              : null,
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isLoading) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (widget.rawMilks.isEmpty) {
      return const Center(
        child: Text('No raw milk data available'),
      );
    }

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              columns: const [
                DataColumn(label: Text('#')),
                DataColumn(label: Text('Cow Name')),
                DataColumn(label: Text('Production Time')),
                DataColumn(label: Text('Volume (L)')),
                DataColumn(label: Text('Lactation Phase')),
                DataColumn(label: Text('Lactation Status')),
                DataColumn(label: Text('Actions')),
              ],
              rows: List<DataRow>.generate(
                paginatedData.length,
                (index) {
                  final rawMilk = paginatedData[index];
                  final cow = rawMilk['cow'] ?? {};
                  final lactationPhase = rawMilk['lactation_phase'] ?? 'N/A';
                  final lactationStatus = rawMilk['lactation_status'] ?? false;

                  return DataRow(
                    cells: [
                      DataCell(Text(
                          '${index + 1 + (currentPage - 1) * ITEMS_PER_PAGE}')),
                      DataCell(Text(cow['name'] ?? 'Unknown')),
                      DataCell(Text(DateFormat('dd MMM yyyy, HH:mm')
                          .format(DateTime.parse(rawMilk['production_time'])))),
                      DataCell(Text(rawMilk['volume_liters'].toString())),
                      DataCell(Text(lactationPhase)),
                      DataCell(Text(lactationStatus ? 'Active' : 'Inactive')),
                      DataCell(Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.edit, size: 20),
                            onPressed: () => widget.openModal('edit', rawMilk),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, size: 20),
                            onPressed: () =>
                                widget.openModal('delete', rawMilk),
                          ),
                        ],
                      )),
                    ],
                  );
                },
              ),
            ),
          ),
        ),
        _buildPagination(),
      ],
    );
  }
}
