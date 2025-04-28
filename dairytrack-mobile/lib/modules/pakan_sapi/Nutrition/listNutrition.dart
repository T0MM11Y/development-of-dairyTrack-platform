import 'package:dairy_track/modules/pakan_sapi/Nutrition/createNutrition.dart';
import 'package:dairy_track/modules/pakan_sapi/Nutrition/editNutrition.dart';
import 'package:flutter/material.dart';
import 'package:dairy_track/model/pakan/nutrition.dart';
import 'package:dairy_track/config/api/pakan/nutrition.dart';
import 'package:intl/intl.dart';

class NutritionListPage extends StatefulWidget {
  const NutritionListPage({super.key});

  @override
  _NutritionListPageState createState() => _NutritionListPageState();
}

class _NutritionListPageState extends State<NutritionListPage> {
  bool _isLoading = true;
  List<Nutrisi> _nutritionList = [];
  List<Nutrisi> _filteredList = [];
  String _searchQuery = '';
  String _sortBy = 'name'; // Default sort by name
  bool _ascending = true;

  @override
  void initState() {
    super.initState();
    _fetchNutritionList();
  }

  Future<void> _fetchNutritionList() async {
    if (mounted) {
      setState(() {
        _isLoading = true;
      });
    }

    try {
      final nutritionList = await getAllNutrisi();
      if (mounted) {
        setState(() {
          _nutritionList = nutritionList;
          _filteredList = nutritionList;
          _applySortAndFilter();
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal memuat data nutrisi: ${e.toString()}')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _applySortAndFilter() {
    // First filter based on search query
    if (_searchQuery.isEmpty) {
      _filteredList = List.from(_nutritionList);
    } else {
      _filteredList = _nutritionList
          .where((nutrition) =>
              nutrition.name.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    }

    // Then sort the filtered list
    _filteredList.sort((a, b) {
      int compareResult;
      switch (_sortBy) {
        case 'name':
          compareResult = a.name.toLowerCase().compareTo(b.name.toLowerCase());
          break;
        case 'unit':
          compareResult = (a.unit ?? '').compareTo(b.unit ?? '');
          break;
        case 'date':
          compareResult = a.createdAt.compareTo(b.createdAt);
          break;
        default:
          compareResult = a.name.toLowerCase().compareTo(b.name.toLowerCase());
      }
      return _ascending ? compareResult : -compareResult;
    });
  }

  void _showSortOptions() {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext context) {
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('Urutkan berdasarkan'),
              tileColor: Colors.grey[200],
            ),
            ListTile(
              title: const Text('Nama'),
              leading: Radio<String>(
                value: 'name',
                groupValue: _sortBy,
                onChanged: (String? value) {
                  if (mounted) {
                    setState(() {
                      _sortBy = value!;
                      _applySortAndFilter();
                      Navigator.pop(context);
                    });
                  }
                },
              ),
              trailing: _sortBy == 'name'
                  ? Icon(_ascending ? Icons.arrow_upward : Icons.arrow_downward)
                  : null,
              onTap: () {
                if (mounted) {
                  setState(() {
                    if (_sortBy == 'name') {
                      _ascending = !_ascending;
                    } else {
                      _sortBy = 'name';
                      _ascending = true;
                    }
                    _applySortAndFilter();
                    Navigator.pop(context);
                  });
                }
              },
            ),
            ListTile(
              title: const Text('Satuan'),
              leading: Radio<String>(
                value: 'unit',
                groupValue: _sortBy,
                onChanged: (String? value) {
                  if (mounted) {
                    setState(() {
                      _sortBy = value!;
                      _applySortAndFilter();
                      Navigator.pop(context);
                    });
                  }
                },
              ),
              trailing: _sortBy == 'unit'
                  ? Icon(_ascending ? Icons.arrow_upward : Icons.arrow_downward)
                  : null,
              onTap: () {
                if (mounted) {
                  setState(() {
                    if (_sortBy == 'unit') {
                      _ascending = !_ascending;
                    } else {
                      _sortBy = 'unit';
                      _ascending = true;
                    }
                    _applySortAndFilter();
                    Navigator.pop(context);
                  });
                }
              },
            ),
            ListTile(
              title: const Text('Tanggal Dibuat'),
              leading: Radio<String>(
                value: 'date',
                groupValue: _sortBy,
                onChanged: (String? value) {
                  if (mounted) {
                    setState(() {
                      _sortBy = value!;
                      _applySortAndFilter();
                      Navigator.pop(context);
                    });
                  }
                },
              ),
              trailing: _sortBy == 'date'
                  ? Icon(_ascending ? Icons.arrow_upward : Icons.arrow_downward)
                  : null,
              onTap: () {
                if (mounted) {
                  setState(() {
                    if (_sortBy == 'date') {
                      _ascending = !_ascending;
                    } else {
                      _sortBy = 'date';
                      _ascending = true;
                    }
                    _applySortAndFilter();
                    Navigator.pop(context);
                  });
                }
              },
            ),
          ],
        );
      },
    );
  }

  void _navigateToAddNutrition() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AddNutrition()),
    );

    if (result == true && mounted) {
      _fetchNutritionList();
    }
  }

  void _navigateToEditNutrition(Nutrisi nutrition) async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => EditNutrition(nutrition: nutrition),
      ),
    );

    if (result == true && mounted) {
      _fetchNutritionList();
    }
  }

  void _deleteNutrition(Nutrisi nutrition) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Konfirmasi'),
          content: Text(
              'Apakah Anda yakin ingin menghapus nutrisi "${nutrition.name}"?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Batal'),
            ),
            TextButton(
              onPressed: () async {
                Navigator.of(context).pop(); // Close the dialog
                if (mounted) {
                  setState(() {
                    _isLoading = true;
                  });
                }

                bool success = false;
                try {
                  await deleteNutrisi(nutrition.id!);
                  success = true;
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text('Berhasil menghapus nutrisi "${nutrition.name}"')),
                    );
                  }
                  // Fetch the updated list only on success
                  if (mounted) {
                    await _fetchNutritionList();
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content: Text('Gagal menghapus nutrisi: ${e.toString()}')),
                    );
                  }
                } finally {
                  if (mounted) {
                    setState(() {
                      _isLoading = false;
                    });
                  }
                }
              },
              child: const Text('Hapus', style: TextStyle(color: Colors.red)),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Daftar Nutrisi'),
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.sort),
            onPressed: _showSortOptions,
            tooltip: 'Urutkan',
          ),
        ],
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Cari nutrisi...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
              onChanged: (value) {
                if (mounted) {
                  setState(() {
                    _searchQuery = value;
                    _applySortAndFilter();
                  });
                }
              },
            ),
          ),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredList.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.science_outlined,
                                size: 64, color: Colors.grey),
                            const SizedBox(height: 16),
                            Text(
                              _searchQuery.isEmpty
                                  ? 'Belum ada data nutrisi'
                                  : 'Tidak ada nutrisi yang sesuai',
                              style: const TextStyle(
                                fontSize: 16,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _fetchNutritionList,
                        child: ListView.builder(
                          itemCount: _filteredList.length,
                          itemBuilder: (context, index) {
                            final nutrition = _filteredList[index];
                            return Card(
                              margin: const EdgeInsets.symmetric(
                                horizontal: 16.0,
                                vertical: 4.0,
                              ),
                              child: ListTile(
                                title: Text(
                                  nutrition.name,
                                  style: const TextStyle(
                                      fontWeight: FontWeight.bold),
                                ),
                                subtitle: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Satuan: ${nutrition.unit ?? "-"}'),
                                    Text(
                                      'Dibuat: ${DateFormat('dd/MM/yyyy').format(nutrition.createdAt)}',
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                    ),
                                  ],
                                ),
                                trailing: PopupMenuButton<String>(
                                  onSelected: (value) {
                                    if (value == 'edit') {
                                      _navigateToEditNutrition(nutrition);
                                    } else if (value == 'delete') {
                                      _deleteNutrition(nutrition);
                                    }
                                  },
                                  itemBuilder: (context) => [
                                    const PopupMenuItem(
                                      value: 'edit',
                                      child: Row(
                                        children: [
                                          Icon(Icons.edit, color: Colors.blue),
                                          SizedBox(width: 8),
                                          Text('Edit'),
                                        ],
                                      ),
                                    ),
                                    const PopupMenuItem(
                                      value: 'delete',
                                      child: Row(
                                        children: [
                                          Icon(Icons.delete, color: Colors.red),
                                          SizedBox(width: 8),
                                          Text('Hapus'),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToAddNutrition,
        backgroundColor: const Color.fromARGB(255, 93, 144, 231),
        child: const Icon(Icons.add),
        tooltip: 'Tambah Nutrisi',
      ),
    );
  }
}