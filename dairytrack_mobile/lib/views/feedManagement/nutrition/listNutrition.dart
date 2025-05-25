import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/nutritionController.dart';

class Nutrisi {
  final int id;
  final String name;
  final String unit;
  final String createdAt;
  final String updatedAt;

  Nutrisi({
    required this.id,
    required this.name,
    required this.unit,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Nutrisi.fromJson(Map<String, dynamic> json) {
    return Nutrisi(
      id: json['id'],
      name: json['name'],
      unit: json['unit'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }
}

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
  final int _userId = 1; // Replace with actual user ID from auth
  bool _isOperationInProgress = false;

  @override
  void initState() {
    super.initState();
    _fetchNutrisi();
  }

  Future<void> _fetchNutrisi() async {
    if (!mounted || _isOperationInProgress) return;
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      final response = await _controller.getAllNutrisi();
      if (!mounted) return;
      if (response['success']) {
        final List<Nutrisi> newNutrisiList = (response['data'] as List)
            .map((json) => Nutrisi.fromJson(json))
            .toList();
        setState(() {
          _nutrisiList = newNutrisiList;
          _isLoading = false;
        });
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _applyFiltersAndSort();
          }
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch nutrisi';
          _isLoading = false;
        });
        if (_errorMessage.contains('Sesi Anda telah berakhir')) {
          _navigateToLogin();
        }
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error: $e';
        _isLoading = false;
      });
      if (_errorMessage.contains('No auth token found')) {
        _navigateToLogin();
      }
    }
  }

  void _applyFiltersAndSort() {
    if (!mounted) return;
    List<Nutrisi> filtered = List.from(_nutrisiList);
    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where((nutrisi) =>
              nutrisi.name.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    }
    filtered.sort((a, b) {
      int comparison = 0;
      switch (_sortField) {
        case 'name':
          comparison = a.name.toLowerCase().compareTo(b.name.toLowerCase());
          break;
        case 'created_at':
          comparison = a.createdAt.compareTo(b.createdAt);
          break;
      }
      return _sortAscending ? comparison : -comparison;
    });
    if (mounted) {
      setState(() => _filteredNutrisiList = filtered);
    }
  }

  Future<void> _deleteNutrisi(int nutrisiId) async {
    if (!mounted || _isOperationInProgress) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("Delete Nutrisi", style: TextStyle(fontWeight: FontWeight.w600)),
        content: Text("Are you sure you want to delete this nutrisi?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text("Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      ),
    );
    if (confirm != true || !mounted) return;
    setState(() {
      _isOperationInProgress = true;
      _isLoading = true;
    });
    try {
      final response = await _controller.deleteNutrisi(nutrisiId);
      if (!mounted) return;
      if (response['success']) {
        _showSnackBar(response['message']);
        await Future.delayed(Duration(milliseconds: 300));
        if (mounted) {
          await _fetchNutrisi();
        }
      } else {
        _showSnackBar(response['message']);
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (!mounted) return;
      _showSnackBar('Error deleting nutrisi: $e');
      setState(() => _isLoading = false);
    } finally {
      if (mounted) {
        setState(() => _isOperationInProgress = false);
      }
    }
  }

  Future<void> _viewEditNutrisi(Nutrisi nutrisi) async {
    if (!mounted || _isOperationInProgress) return;
    String name = nutrisi.name;
    String unit = nutrisi.unit;
    final _formKey = GlobalKey<FormState>();
    bool _isModalLoading = false;

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 20,
                right: 20,
                top: 20,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
              ),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Edit Nutrisi: ${nutrisi.name}",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.black,
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, color: Colors.grey),
                            onPressed: () => Navigator.pop(context, false),
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      _buildTextFormField(
                        labelText: 'Name',
                        hintText: 'Enter nutrisi name',
                        initialValue: name,
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Please enter the nutrisi name' : null,
                        onChanged: (value) => name = value!,
                      ),
                      _buildTextFormField(
                        labelText: 'Unit',
                        hintText: 'Enter unit (e.g., kg, %)',
                        initialValue: unit,
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Please enter the unit' : null,
                        onChanged: (value) => unit = value!,
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          padding: EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: _isModalLoading
                            ? null
                            : () async {
                                if (_formKey.currentState!.validate()) {
                                  _formKey.currentState!.save();
                                  setModalState(() => _isModalLoading = true);
                                  try {
                                    final response = await _controller.updateNutrisi(
                                      nutrisi.id,
                                      name,
                                      unit,
                                      _userId,
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context, true); // Return success
                                    } else {
                                      _showSnackBar(response['message']);
                                      setModalState(() => _isModalLoading = false);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar('Error updating nutrisi: $e');
                                    setModalState(() => _isModalLoading = false);
                                  }
                                }
                              },
                        child: _isModalLoading
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  SizedBox(width: 10),
                                  Text("Saving...", style: TextStyle(color: Colors.white)),
                                ],
                              )
                            : Text(
                                "Save",
                                style: TextStyle(color: Colors.white, fontSize: 16),
                              ),
                      ),
                      SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
    if (result == true && mounted) {
      setState(() => _isOperationInProgress = true);
      await Future.delayed(Duration(milliseconds: 300));
      if (mounted) {
        await _fetchNutrisi();
        setState(() => _isOperationInProgress = false);
      }
    }
  }

  Future<void> _addNutrisi() async {
    if (!mounted || _isOperationInProgress) return;
    String name = '';
    String unit = '';
    final _formKey = GlobalKey<FormState>();
    bool _isModalLoading = false;

    final result = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 20,
                right: 20,
                top: 20,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
              ),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Add New Nutrisi",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.black,
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, color: Colors.grey),
                            onPressed: () => Navigator.pop(context, false),
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      _buildTextFormField(
                        labelText: 'Name',
                        hintText: 'Enter nutrisi name',
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Please enter the nutrisi name' : null,
                        onChanged: (value) => name = value!,
                      ),
                      _buildTextFormField(
                        labelText: 'Unit',
                        hintText: 'Enter unit (e.g., kg, %)',
                        validator: (value) =>
                            value == null || value.isEmpty ? 'Please enter the unit' : null,
                        onChanged: (value) => unit = value!,
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue,
                          padding: EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: _isModalLoading
                            ? null
                            : () async {
                                if (_formKey.currentState!.validate()) {
                                  _formKey.currentState!.save();
                                  setModalState(() => _isModalLoading = true);
                                  try {
                                    final response = await _controller.addNutrisi(
                                      name,
                                      unit,
                                      _userId,
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context, true);
                                    } else {
                                      _showSnackBar(response['message']);
                                      setModalState(() => _isModalLoading = false);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar('Error adding nutrisi: $e');
                                    setModalState(() => _isModalLoading = false);
                                  }
                                }
                              },
                        child: _isModalLoading
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  SizedBox(width: 10),
                                  Text("Adding...", style: TextStyle(color: Colors.white)),
                                ],
                              )
                            : Text(
                                "Add",
                                style: TextStyle(color: Colors.white, fontSize: 16),
                              ),
                      ),
                      SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    if (result == true && mounted) {
      setState(() => _isOperationInProgress = true);
      await Future.delayed(Duration(milliseconds: 300));
      if (mounted) {
        await _fetchNutrisi();
        setState(() => _isOperationInProgress = false);
      }
    }
  }

  Widget _buildStatisticsCard() {
    int totalNutrisi = _nutrisiList.length;
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Nutrisi Statistics',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: Colors.black),
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Total Nutrisi: $totalNutrisi', style: TextStyle(fontSize: 16)),
                      SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: totalNutrisi / (totalNutrisi + 1),
                        backgroundColor: Colors.grey[200],
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(5),
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

  void _showSnackBar(String message) {
    if (!mounted) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        ScaffoldMessenger.of(context).clearSnackBars();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(message),
            backgroundColor: Colors.blue,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            duration: Duration(seconds: 2),
          ),
        );
      }
    });
    if (message.contains('Sesi Anda telah berakhir')) {
      _navigateToLogin();
    }
  }

  void _navigateToLogin() {
    if (!mounted) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text(
          "Nutrisi",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: Colors.white),
        ),
        backgroundColor: Colors.blue,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          _buildSortingOptions(),
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: Colors.blue))
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(_errorMessage, style: TextStyle(color: Colors.red)),
                            SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: _fetchNutrisi,
                              child: Text('Retry'),
                            ),
                          ],
                        ),
                      )
                    : _filteredNutrisiList.isEmpty
                        ? Center(child: Text("No nutrisi found"))
                        : RefreshIndicator(
                            onRefresh: _fetchNutrisi,
                            child: ListView(
                              children: [
                                _buildStatisticsCard(),
                                ..._filteredNutrisiList.asMap().entries.map((entry) {
                                  int index = entry.key;
                                  Nutrisi nutrisi = entry.value;
                                  return _buildNutrisiCard(nutrisi, index);
                                }).toList(),
                                SizedBox(height: 80),
                              ],
                            ),
                          ),
          ),
        ],
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () => _showFilterBottomSheet(context),
            child: Icon(Icons.filter_list, color: Colors.white),
            backgroundColor: Colors.blue,
            heroTag: 'filter',
          ),
          SizedBox(height: 10),
          FloatingActionButton(
            onPressed: _isOperationInProgress ? null : _addNutrisi,
            child: Icon(Icons.add, color: Colors.white),
            backgroundColor: _isOperationInProgress ? Colors.grey : Colors.blue,
            heroTag: 'add',
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search nutrisi...',
          prefixIcon: Icon(Icons.search, color: Colors.blue),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, color: Colors.grey),
                  onPressed: () {
                    if (mounted) {
                      setState(() {
                        _searchQuery = '';
                      });
                      WidgetsBinding.instance.addPostFrameCallback((_) {
                        if (mounted) _applyFiltersAndSort();
                      });
                    }
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.grey[100],
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide.none,
          ),
          contentPadding: EdgeInsets.symmetric(vertical: 0, horizontal: 20),
        ),
        onChanged: (value) {
          if (mounted) {
            setState(() {
              _searchQuery = value;
            });
            Future.delayed(Duration(milliseconds: 300), () {
              if (mounted && _searchQuery == value) {
                _applyFiltersAndSort();
              }
            });
          }
        },
      ),
    );
  }

  Widget _buildSortingOptions() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      child: Row(
        children: [
          Text('Sort by: ', style: TextStyle(fontSize: 16, color: Colors.black)),
          SizedBox(width: 8),
          ...['name', 'created_at'].map((field) {
            String label = field == 'created_at' ? 'Created Date' : 'Name';
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ChoiceChip(
                label: Text(label),
                selected: _sortField == field,
                selectedColor: Colors.blue[100],
                backgroundColor: Colors.grey[200],
                onSelected: (selected) {
                  if (selected && mounted) {
                    setState(() {
                      if (_sortField == field) {
                        _sortAscending = !_sortAscending;
                      } else {
                        _sortField = field;
                        _sortAscending = true;
                      }
                    });
                    WidgetsBinding.instance.addPostFrameCallback((_) {
                      if (mounted) _applyFiltersAndSort();
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
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 16),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.blue[100],
                child: Icon(Icons.local_dining, color: Colors.blue),
              ),
              SizedBox(width: 15),
              Expanded(
                child: InkWell(
                  onTap: () => _viewEditNutrisi(nutrisi),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        nutrisi.name,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.black,
                        ),
                      ),
                      SizedBox(height: 5),
                      Text(
                        'Unit: ${nutrisi.unit}',
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      ),
                      SizedBox(height: 5),
                      Text(
                        nutrisi.createdAt.isNotEmpty
                            ? 'Created: ${DateFormat('dd MMM yyyy').format(DateTime.parse(nutrisi.createdAt))}'
                            : 'Created: N/A',
                        style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                      ),
                    ],
                  ),
                ),
              ),
              IconButton(
                icon: Icon(Icons.delete, color: Colors.red, size: 24),
                onPressed: _isOperationInProgress ? null : () => _deleteNutrisi(nutrisi.id),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    if (!mounted) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setStateBS) {
          return Container(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 20,
              right: 20,
              top: 20,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Text(
                      'Filter Nutrisi',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Colors.black,
                      ),
                    ),
                  ),
                  SizedBox(height: 24),
                  _buildSearchFilter(setStateBS),
                  SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                        if (mounted) {
                          WidgetsBinding.instance.addPostFrameCallback((_) {
                            if (mounted) _applyFiltersAndSort();
                          });
                        }
                      },
                      child: Text(
                        'Apply Filters',
                        style: TextStyle(color: Colors.white, fontSize: 16),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        padding: EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 16),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSearchFilter(StateSetter setStateBS) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Search',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.black),
        ),
        SizedBox(height: 8),
        TextField(
          decoration: InputDecoration(
            hintText: 'Enter nutrisi name',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: Colors.grey[100],
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
          onChanged: (value) => setStateBS(() => _searchQuery = value),
        ),
      ],
    );
  }

  Widget _buildTextFormField({
    required String labelText,
    String? hintText,
    String? initialValue,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText,
          labelStyle: TextStyle(color: Colors.black),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.grey),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.blue, width: 2),
          ),
          prefixIcon: Icon(Icons.text_fields, color: Colors.blue),
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        initialValue: initialValue,
        validator: validator,
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildReadOnlyListTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue),
      title: Text(title, style: TextStyle(color: Colors.black, fontWeight: FontWeight.w500)),
      subtitle: Text(subtitle),
      contentPadding: EdgeInsets.symmetric(horizontal: 0),
    );
  }

  @override
  void dispose() {
    super.dispose();
  }
}