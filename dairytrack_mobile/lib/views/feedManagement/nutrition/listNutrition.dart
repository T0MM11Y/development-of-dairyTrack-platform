import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/nutritionController.dart';
import '../model/nutrition.dart';
import './addNutrition.dart';
import './editNutrition.dart';

class NutrisiView extends StatefulWidget {
  @override
  _NutrisiViewState createState() => _NutrisiViewState();
}

class _NutrisiViewState extends State<NutrisiView> {
  final NutrisiManagementController _controller = NutrisiManagementController();
  List<Nutrisi> _nutrisiList = [];
  List<Nutrisi> _filteredNutrisiList = [];
  bool _isLoading = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _sortField = 'name';
  bool _sortAscending = true;
  final int _userId = 1; // Replace with actual user ID

  @override
  void initState() {
    super.initState();
    _fetchNutrisi();
  }

  Future<void> _fetchNutrisi() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await _controller.getAllNutrisi();
      if (response['success'] == true) {
        setState(() {
          _nutrisiList = (response['data'] as List? ?? [])
              .map((json) => Nutrisi.fromJson(json))
              .toList();
          _applyFiltersAndSort();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch nutrisi';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  void _applyFiltersAndSort() {
    List<Nutrisi> filtered = List.from(_nutrisiList);

    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where((nutrisi) =>
              nutrisi.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
              nutrisi.unit.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    }

    filtered.sort((a, b) {
      int comparison = 0;
      switch (_sortField) {
        case 'name':
          comparison = a.name.toLowerCase().compareTo(b.name.toLowerCase());
          break;
        case 'unit':
          comparison = a.unit.toLowerCase().compareTo(b.unit.toLowerCase());
          break;
        case 'created_at':
          comparison = a.createdAt.compareTo(b.createdAt);
          break;
      }
      return _sortAscending ? comparison : -comparison;
    });

    setState(() {
      _filteredNutrisiList = filtered;
    });
  }

  Future<bool> _showConfirmationDialog({
    required String title,
    required String message,
    bool isDelete = false,
  }) async {
    return await showDialog<bool>(
          context: context,
          builder: (context) => Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
            ),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                gradient: LinearGradient(
                  colors: [Colors.teal.shade50, Colors.white],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isDelete ? Icons.warning_amber_rounded : Icons.info,
                    color: isDelete ? Colors.red : Colors.teal,
                    size: 50,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.teal,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    message,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16, color: Colors.black87),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(false),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.grey.shade300,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: const Text(
                          "Cancel",
                          style: TextStyle(color: Colors.black87),
                        ),
                      ),
                      ElevatedButton(
                        onPressed: () => Navigator.of(context).pop(true),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: isDelete ? Colors.red : Colors.teal,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        child: Text(
                          isDelete ? "Delete" : "Confirm",
                          style: const TextStyle(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ) ??
        false;
  }

  void _deleteNutrisi(int nutrisiId) async {
    final confirm = await _showConfirmationDialog(
      title: "Delete Confirmation",
      message: "Apakah Anda yakin mau menghapus nutrisi ini?",
      isDelete: true,
    );

    if (confirm) {
      setState(() {
        _isLoading = true;
      });

      try {
        final response = await _controller.deleteNutrisi(nutrisiId);
        if (response['success'] == true) {
          setState(() {
            _nutrisiList.removeWhere((nutrisi) => nutrisi.id == nutrisiId);
            _applyFiltersAndSort();
          });
          _showSnackBar(response['message'] ?? 'Nutrisi deleted');
        } else {
          _showSnackBar(response['message'] ?? 'Failed to delete nutrisi');
        }
      } catch (e) {
        _showSnackBar('Error deleting nutrisi: $e');
      } finally {
        if (mounted) {
          setState(() {
            _isLoading = false;
          });
        }
      }
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.teal.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        elevation: 6,
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Widget _buildStatisticsCard() {
    int totalNutrisi = _nutrisiList.length;

    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      elevation: 6,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.teal.shade50, Colors.white],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.teal.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Nutrisi Statistics',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.teal.shade800,
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Nutrisi: $totalNutrisi',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 8),
                      LinearProgressIndicator(
                        value: totalNutrisi / (totalNutrisi + 1),
                        backgroundColor: Colors.grey.shade200,
                        color: Colors.teal.shade400,
                        borderRadius: BorderRadius.circular(5),
                        minHeight: 6,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search nutrisi...',
          prefixIcon: const Icon(Icons.search, color: Colors.teal),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear, color: Colors.grey),
                  onPressed: () {
                    setState(() {
                      _searchQuery = '';
                      _applyFiltersAndSort();
                    });
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          contentPadding:
              const EdgeInsets.symmetric(vertical: 0, horizontal: 20),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade100),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.teal.shade400),
          ),
        ),
        onChanged: (value) {
          setState(() {
            _searchQuery = value;
            _applyFiltersAndSort();
          });
        },
      ),
    );
  }

  Widget _buildSortingOptions() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      child: Row(
        children: [
          Text(
            'Sort by: ',
            style: TextStyle(fontSize: 16, color: Colors.teal.shade800),
          ),
          const SizedBox(width: 8),
          ...['name', 'unit', 'created_at'].map((field) {
            String label = field == 'created_at'
                ? 'Created Date'
                : field == 'unit'
                    ? 'Unit'
                    : 'Name';
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ChoiceChip(
                label: Text(label),
                selected: _sortField == field,
                selectedColor: Colors.teal.shade100,
                backgroundColor: Colors.grey.shade200,
                labelStyle: TextStyle(
                  color: _sortField == field
                      ? Colors.teal.shade800
                      : Colors.black87,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                onSelected: (selected) {
                  if (selected) {
                    setState(() {
                      if (_sortField == field) {
                        _sortAscending = !_sortAscending;
                      } else {
                        _sortField = field;
                        _sortAscending = true;
                      }
                      _applyFiltersAndSort();
                    });
                  }
                },
              ),
            );
          }).toList(),
        ],
      ),
    );
  }

  Widget _buildNutrisiCard(Nutrisi nutrisi, int index) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.teal.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: ListTile(
          leading: CircleAvatar(
            backgroundColor: Colors.teal.shade100,
            child: Icon(Icons.local_dining,
                color: Colors.teal.shade800),
          ),
          title: Text(
            nutrisi.name,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          subtitle: Text(
            'Unit: ${nutrisi.unit}\nCreated: ${nutrisi.createdAt.isNotEmpty ? DateFormat('dd MMM yyyy').format(DateTime.parse(nutrisi.createdAt)) : 'N/A'}',
            style: const TextStyle(color: Colors.grey),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.edit, color: Colors.teal),
                onPressed: () => _viewEditNutrisi(nutrisi),
              ),
              IconButton(
                icon: const Icon(Icons.delete, color: Colors.red),
                onPressed: () => _deleteNutrisi(nutrisi.id),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _viewEditNutrisi(Nutrisi nutrisi) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (context) => EditNutrisiForm(
        nutrisi: nutrisi,
        controller: _controller,
        userId: _userId,
        onUpdate: (updatedNutrisi) {
          setState(() {
            _nutrisiList = _nutrisiList.map((n) {
              if (n.id == updatedNutrisi.id) {
                return updatedNutrisi;
              }
              return n;
            }).toList();
            _applyFiltersAndSort();
          });
          _showSnackBar('Nutrisi updated');
        },
        onError: (message) {
          _showSnackBar(message);
        },
      ),
    );
  }

  void _addNutrisi() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (context) => AddNutrisiForm(
        controller: _controller,
        userId: _userId,
        onAdd: (newNutrisi) {
          setState(() {
            _nutrisiList.add(newNutrisi);
            _applyFiltersAndSort();
          });
          _showSnackBar('Nutrisi added');
        },
        onError: (message) {
          _showSnackBar(message);
        },
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      backgroundColor: Colors.white,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return Padding(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 16.0,
              right: 16.0,
              top: 16.0,
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Center(
                    child: Text(
                      'Filter Nutrisi',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.teal,
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    decoration: InputDecoration(
                      labelText: 'Search',
                      hintText: 'Enter nutrisi name or unit',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      prefixIcon: const Icon(Icons.search, color: Colors.teal),
                      filled: true,
                      fillColor: Colors.teal.shade50,
                    ),
                    onChanged: (value) {
                      setState(() {
                        _searchQuery = value;
                      });
                    },
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        this.setState(() {
                          _applyFiltersAndSort();
                        });
                      },
                      child: const Text(
                        'Apply Filters',
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal.shade600,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          "Nutrisi",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.teal.shade600,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list, color: Colors.white),
            onPressed: () => _showFilterBottomSheet(context),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.teal))
          : _errorMessage.isNotEmpty
              ? Center(
                  child: Text(_errorMessage,
                      style: const TextStyle(color: Colors.red)))
              : RefreshIndicator(
                  onRefresh: _fetchNutrisi,
                  child: Column(
                    children: [
                      _buildSearchBar(),
                      _buildSortingOptions(),
                      Expanded(
                        child: _filteredNutrisiList.isEmpty
                            ? const Center(child: Text("No nutrisi found"))
                            : ListView(
                                children: [
                                  _buildStatisticsCard(),
                                  ..._filteredNutrisiList
                                      .asMap()
                                      .entries
                                      .map((entry) => _buildNutrisiCard(
                                          entry.value, entry.key))
                                      .toList(),
                                  const SizedBox(height: 80),
                                ],
                              ),
                      ),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addNutrisi,
        child: const Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.teal.shade600,
        elevation: 6,
      ),
    );
  }
}