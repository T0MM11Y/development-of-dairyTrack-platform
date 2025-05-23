import 'package:dairytrack_mobile/views/cowManagement/makeCowsView.dart';
import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:intl/intl.dart';

class ListOfCowsView extends StatefulWidget {
  @override
  _ListOfCowsViewState createState() => _ListOfCowsViewState();
}

class _ListOfCowsViewState extends State<ListOfCowsView> {
  final CowManagementController _controller = CowManagementController();
  List<Cow> _cows = [];
  List<Cow> _filteredCows = [];
  bool _isLoading = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _selectedGender = '';
  String _selectedPhase = '';
  String _sortField = 'name';
  bool _sortAscending = true;

  final Map<String, String> _lactationPhaseDescriptions = {
    'Dry':
        'The cow is not producing milk and is in a resting phase, allowing her body to recover and prepare for the next lactation cycle.',
    'Early':
        'The cow is in the early stage of lactation, characterized by high milk production as she adjusts after calving.',
    'Mid':
        'The cow is in the middle stage of lactation, where milk production is generally stable after the initial peak.',
    'Late':
        'The cow is in the late stage of lactation, with milk production gradually decreasing as the pregnancy progresses.',
  };

  @override
  void initState() {
    super.initState();
    _fetchCows();
  }

  Future<void> _fetchCows() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final cows = await _controller.listCows();
      setState(() {
        _cows = cows;
        _applyFiltersAndSort();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  void _applyFiltersAndSort() {
    List<Cow> filtered = List.from(_cows);

    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where((cow) =>
              cow.name.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    }

    if (_selectedGender.isNotEmpty) {
      filtered =
          filtered.where((cow) => cow.gender == _selectedGender).toList();
    }

    if (_selectedPhase.isNotEmpty) {
      filtered = filtered
          .where((cow) => cow.lactationPhase == _selectedPhase)
          .toList();
    }

    filtered.sort((a, b) {
      int comparison = 0;
      switch (_sortField) {
        case 'name':
          comparison = a.name.toLowerCase().compareTo(b.name.toLowerCase());
          break;
        case 'weight':
          comparison = a.weight.compareTo(b.weight);
          break;
        case 'age':
          comparison = a.age.compareTo(b.age);
          break;
      }
      return _sortAscending ? comparison : -comparison;
    });

    _filteredCows = filtered;
  }

  void _deleteCow(int cowId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("Delete Cow"),
        content: Text("Are you sure you want to delete this cow?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text("Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final response = await _controller.deleteCow(cowId);
      if (response['success'] == true) {
        _showSnackBar("Cow deleted successfully.");
        _fetchCows();
      } else {
        _showSnackBar(response['message'] ?? "Failed to delete cow.");
      }
    }
  }

  void _viewEditCow(Cow cow) async {
    String name = cow.name;
    DateTime? birth = cow.birth != null && cow.birth.isNotEmpty
        ? DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'").parse(cow.birth)
        : null;
    double weight = cow.weight;
    String lactationPhase = cow.lactationPhase;
    String gender = cow.gender;

    final _formKey = GlobalKey<FormState>();
    bool _isLoading = false;

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text("Edit Cow: ${cow.name}"),
          content: StatefulBuilder(
            builder: (context, setState) {
              return SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildReadOnlyListTile(Icons.tag, "ID", "${cow.id}"),
                      _buildTextFormField(
                        labelText: 'Name',
                        hintText: 'Enter cow\'s name',
                        initialValue: name,
                        validator: (value) => value == null || value.isEmpty
                            ? 'Please enter the cow\'s name'
                            : null,
                        onChanged: (value) => name = value,
                      ),
                      _buildDateField(
                        labelText: 'Birth Date',
                        selectedDate: birth,
                        onDateSelected: (pickedDate) {
                          setState(() {
                            birth = pickedDate;
                          });
                        },
                      ),
                      _buildGenderDropdown(
                        selectedGender: gender,
                        lactationPhase: lactationPhase,
                        onGenderChanged: (value) {
                          setState(() {
                            gender = value!;
                            lactationPhase = gender == 'Male'
                                ? '-'
                                : (lactationPhase == '-' ? '' : lactationPhase);
                          });
                        },
                      ),
                      _buildReadOnlyTextFormField(
                        labelText: 'Breed',
                        initialValue: cow.breed,
                      ),
                      _buildLactationPhaseDropdown(
                        gender: gender,
                        lactationPhase: lactationPhase,
                        onPhaseChanged: (newValue) {
                          setState(() {
                            lactationPhase = newValue!;
                          });
                        },
                      ),
                      _buildTextFormField(
                        labelText: 'Weight (kg)',
                        hintText: 'Enter cow\'s weight in kg',
                        keyboardType: TextInputType.number,
                        initialValue: weight.toString(),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please enter the cow\'s weight';
                          }
                          if (double.tryParse(value) == null) {
                            return 'Please enter a valid number';
                          }
                          return null;
                        },
                        onChanged: (value) =>
                            weight = double.tryParse(value) ?? weight,
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
          actions: [
            TextButton(
              style: TextButton.styleFrom(foregroundColor: Colors.grey),
              onPressed: () => Navigator.of(context).pop(),
              child: Text("Cancel"),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blueGrey[800],
                textStyle: TextStyle(fontSize: 16),
                padding: EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
              onPressed: () async {
                if (_formKey.currentState!.validate()) {
                  _formKey.currentState!.save();

                  setState(() {
                    _isLoading = true;
                  });

                  try {
                    final birthDateFormatted = birth != null
                        ? DateFormat('yyyy-MM-dd').format(birth!)
                        : cow.birth;

                    final updatedCowData = {
                      'name': name,
                      'birth': birthDateFormatted,
                      'weight': weight,
                      'lactation_phase': lactationPhase,
                      'gender': gender,
                    };

                    final response = await _controller.updateCow(
                      cow.id,
                      updatedCowData,
                    );

                    if (response['success'] == true) {
                      _showSnackBar("Cow updated successfully.");
                      Navigator.of(context).pop();
                      _fetchCows();
                    } else {
                      _showSnackBar(
                          response['message'] ?? "Failed to update cow.");
                    }
                  } catch (e) {
                    _showSnackBar("Error: ${e.toString()}");
                  } finally {
                    setState(() {
                      _isLoading = false;
                    });
                  }
                }
              },
              child: _isLoading
                  ? CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    )
                  : Text("Save", style: TextStyle(color: Colors.white)),
            ),
          ],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15.0),
          ),
        );
      },
    );
  }

  Widget _buildStatisticsCard() {
    int femaleCount = _cows.where((cow) => cow.gender == 'Female').length;
    int maleCount = _cows.where((cow) => cow.gender == 'Male').length;
    double femalePercent =
        _cows.isEmpty ? 0 : (femaleCount / _cows.length) * 100;
    double malePercent = _cows.isEmpty ? 0 : (maleCount / _cows.length) * 100;

    Map<String, int> phaseCounts = {};
    for (var cow in _cows) {
      phaseCounts[cow.lactationPhase] =
          (phaseCounts[cow.lactationPhase] ?? 0) + 1;
    }

    return Card(
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Cow Statistics',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            _buildGenderStatistics(
                femaleCount, femalePercent, maleCount, malePercent),
            SizedBox(height: 16),
            _buildLactationPhaseStatistics(phaseCounts),
          ],
        ),
      ),
    );
  }

  Widget _buildLactationPhaseInfo() {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Lactation Phase Information',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            ..._lactationPhaseDescriptions.entries.map((entry) {
              Color phaseColor = _getPhaseColor(entry.key);
              return _buildPhaseInfoContainer(
                  entry.key, entry.value, phaseColor);
            }).toList(),
          ],
        ),
      ),
    );
  }

  Color _getPhaseColor(String phase) {
    switch (phase) {
      case 'Dry':
        return Colors.red[100]!;
      case 'Early':
        return Colors.green[100]!;
      case 'Mid':
        return Colors.blue[100]!;
      case 'Late':
        return Colors.yellow[100]!;
      default:
        return Colors.grey[100]!;
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          "List of Cows",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.blueGrey[800],
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list, color: Colors.white),
            onPressed: () {
              _showFilterBottomSheet(context);
            },
          ),
          IconButton(
            icon: Icon(Icons.file_download, color: Colors.white),
            onPressed: () {
              _showExportDialog(context);
            },
          ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _errorMessage.isNotEmpty
              ? Center(child: Text(_errorMessage))
              : RefreshIndicator(
                  onRefresh: _fetchCows,
                  child: Column(
                    children: [
                      _buildSearchBar(),
                      _buildSortingOptions(),
                      Expanded(
                        child: _filteredCows.isEmpty
                            ? Center(child: Text("No cows found"))
                            : ListView(
                                children: [
                                  _buildStatisticsCard(),
                                  _buildLactationPhaseInfo(),
                                  ..._filteredCows
                                      .map((cow) => _buildCowCard(cow))
                                      .toList(),
                                  SizedBox(height: 80),
                                ],
                              ),
                      ),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => MakeCowsView()),
          );
          if (result == true) {
            setState(() {
              _fetchCows();
            });
          }
        },
        child: Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.blueGrey[800],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search cows...',
          prefixIcon: Icon(Icons.search),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          filled: true,
          fillColor: Colors.grey[100],
          contentPadding: EdgeInsets.symmetric(vertical: 0),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear),
                  onPressed: () {
                    setState(() {
                      _searchQuery = '';
                      _applyFiltersAndSort();
                    });
                  },
                )
              : null,
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
      padding: EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          Text('Sort by: '),
          SizedBox(width: 8),
          ...['name', 'weight', 'age'].map((field) {
            String label = field[0].toUpperCase() + field.substring(1);
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ChoiceChip(
                label: Text(label),
                selected: _sortField == field,
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

  Widget _buildCowCard(Cow cow) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: ExpansionTile(
          leading: CircleAvatar(
            backgroundColor:
                cow.gender == 'Female' ? Colors.green[100] : Colors.blue[100],
            child: Icon(
              cow.gender == 'Female' ? Icons.female : Icons.male,
              color: cow.gender == 'Female' ? Colors.green : Colors.blue,
            ),
          ),
          title: Text(
            cow.name,
            style: TextStyle(
              fontWeight: FontWeight.bold,
            ),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Column(
                children: [
                  Row(
                    children: [
                      _buildListTile(Icons.cake, "Age", "${cow.age} years"),
                      _buildListTile(
                          Icons.fitness_center, "Weight", "${cow.weight} kg"),
                    ],
                  ),
                  Row(
                    children: [
                      _buildListTile(
                          Icons.opacity, "Phase", cow.lactationPhase),
                      Expanded(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            IconButton(
                              icon: Icon(Icons.edit, size: 20),
                              onPressed: () => _viewEditCow(cow),
                            ),
                            IconButton(
                              icon: Icon(Icons.delete, size: 20),
                              onPressed: () => _deleteCow(cow.id),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
          trailing: Chip(
            label: Text(cow.gender),
            backgroundColor:
                cow.gender == 'Female' ? Colors.green[50] : Colors.blue[50],
            labelStyle: TextStyle(
              color: cow.gender == 'Female' ? Colors.green : Colors.blue,
              fontSize: 12,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildListTile(IconData icon, String title, String subtitle) {
    return Expanded(
      child: ListTile(
        leading: Icon(icon, size: 20),
        title: Text(
          title,
          style: TextStyle(fontSize: 14),
        ),
        subtitle: Text(
          subtitle,
          style: TextStyle(fontSize: 14),
        ),
        dense: true,
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
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
                  Center(
                    child: Text(
                      'Filter Cows',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  SizedBox(height: 24),
                  _buildGenderFilter(setState),
                  SizedBox(height: 16),
                  _buildPhaseFilter(setState),
                  SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        this.setState(() {
                          _applyFiltersAndSort();
                        });
                      },
                      child: Text(
                        'Apply Filters',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                        ),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueGrey[800],
                        padding: EdgeInsets.symmetric(
                          vertical: 12,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(
                            8.0,
                          ),
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

  Widget _buildGenderFilter(StateSetter setState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Text(
            'Gender',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        Row(
          children: [
            _buildRadioListTile(setState, 'All', '', _selectedGender),
            _buildRadioListTile(setState, 'Female', 'Female', _selectedGender),
            _buildRadioListTile(setState, 'Male', 'Male', _selectedGender),
          ],
        ),
      ],
    );
  }

  Widget _buildPhaseFilter(StateSetter setState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(bottom: 8.0),
          child: Text(
            'Lactation Phase',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        DropdownButtonFormField<String>(
          value: _selectedPhase,
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
            contentPadding: EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 10,
            ),
          ),
          items: [
            DropdownMenuItem(
              value: '',
              child: Text('All'),
            ),
            ..._lactationPhaseDescriptions.keys.map((phase) {
              return DropdownMenuItem(
                value: phase,
                child: Text(phase),
              );
            }).toList(),
          ],
          onChanged: (value) {
            setState(() {
              _selectedPhase = value!;
            });
          },
        ),
      ],
    );
  }

  Widget _buildRadioListTile(
      StateSetter setState, String title, String value, String groupValue) {
    return Expanded(
      child: RadioListTile<String>(
        title: Text(title),
        value: value,
        groupValue: groupValue,
        onChanged: (newValue) {
          setState(() {
            _selectedGender = newValue!;
          });
        },
        contentPadding: EdgeInsets.zero,
      ),
    );
  }

  void _showExportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("Export Data"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: Icon(Icons.picture_as_pdf),
              title: Text("Export as PDF"),
              onTap: () {
                Navigator.pop(context);
                _controller.exportCowsToPDF().then((response) {
                  if (response['success']) {
                    _showSnackBar("PDF export successful");
                  } else {
                    _showSnackBar(response['message']);
                  }
                }).catchError((e) {
                  _showSnackBar("Error: ${e.toString()}");
                });
              },
            ),
            ListTile(
              leading: Icon(Icons.table_chart),
              title: Text("Export as Excel"),
              onTap: () {
                Navigator.pop(context);
                _controller.exportCowsToExcel().then((response) {
                  if (response['success']) {
                    _showSnackBar("Excel export successful");
                  } else {
                    _showSnackBar(response['message']);
                  }
                }).catchError((e) {
                  _showSnackBar("Error: ${e.toString()}");
                });
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              "Cancel",
              style: TextStyle(color: Colors.blueGrey),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGenderStatistics(int femaleCount, double femalePercent,
      int maleCount, double malePercent) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Gender Distribution',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Female: $femaleCount (${femalePercent.toStringAsFixed(1)}%)',
                  ),
                  SizedBox(height: 4),
                  LinearProgressIndicator(
                    value: femalePercent / 100,
                    backgroundColor: Colors.grey[200],
                    color: Colors.green[300],
                  ),
                ],
              ),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Male: $maleCount (${malePercent.toStringAsFixed(1)}%)',
                  ),
                  SizedBox(height: 4),
                  LinearProgressIndicator(
                    value: malePercent / 100,
                    backgroundColor: Colors.grey[200],
                    color: Colors.blue[300],
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildLactationPhaseStatistics(Map<String, int> phaseCounts) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Lactation Phases',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 8),
        ...phaseCounts.entries.map((entry) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 4.0),
            child: Text('${entry.key}: ${entry.value} cows'),
          );
        }).toList(),
      ],
    );
  }

  Widget _buildPhaseInfoContainer(
      String phase, String description, Color color) {
    return Container(
      margin: EdgeInsets.only(bottom: 8),
      padding: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            phase,
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 4),
          Text(description),
        ],
      ),
    );
  }

  Widget _buildReadOnlyListTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: Text(subtitle),
      contentPadding: EdgeInsets.symmetric(horizontal: 0),
    );
  }

  Widget _buildTextFormField({
    required String labelText,
    String? hintText,
    String? initialValue,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    TextInputType? keyboardType,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          prefixIcon: Icon(Icons.text_fields),
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        keyboardType: keyboardType,
        initialValue: initialValue,
        validator: validator,
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildReadOnlyTextFormField({
    required String labelText,
    String? initialValue,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: labelText,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          prefixIcon: Icon(Icons.text_fields),
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        initialValue: initialValue,
        readOnly: true,
      ),
    );
  }

  Widget _buildDateField({
    required String labelText,
    DateTime? selectedDate,
    required Function(DateTime?) onDateSelected,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: GestureDetector(
        onTap: () async {
          DateTime? pickedDate = await showDatePicker(
            context: context,
            initialDate: selectedDate ?? DateTime.now(),
            firstDate: DateTime(1900),
            lastDate: DateTime.now(),
          );
          if (pickedDate != null) {
            onDateSelected(pickedDate);
          }
        },
        child: InputDecorator(
          decoration: InputDecoration(
            labelText: labelText,
            hintText: selectedDate == null
                ? 'Select Date'
                : DateFormat('yyyy-MM-dd').format(selectedDate),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10.0),
            ),
            prefixIcon: Icon(Icons.calendar_today),
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: <Widget>[
              Text(
                selectedDate == null
                    ? 'Select Date'
                    : DateFormat('yyyy-MM-dd').format(selectedDate),
              ),
              Icon(
                Icons.arrow_drop_down,
                color: Colors.grey,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGenderDropdown({
    required String selectedGender,
    required String lactationPhase,
    required Function(String?) onGenderChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5.0),
      child: DropdownButtonFormField<String>(
        decoration: InputDecoration(
          labelText: 'Gender',
          hintText: 'Select gender',
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10.0),
          ),
          prefixIcon: Icon(Icons.wc),
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        ),
        value: selectedGender,
        items: ['Male', 'Female'].map((String value) {
          return DropdownMenuItem<String>(
            value: value,
            child: Text(value),
          );
        }).toList(),
        onChanged: onGenderChanged,
        validator: (value) => value == null ? 'Please select gender' : null,
      ),
    );
  }

  Widget _buildLactationPhaseDropdown({
    required String gender,
    required String lactationPhase,
    required Function(String?) onPhaseChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3.0),
      child: Container(
        width: MediaQuery.of(context).size.width * 0.7,
        child: DropdownButtonFormField<String>(
          decoration: InputDecoration(
            labelText: 'Lactation Phase',
            hintText: 'Select lactation phase',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10.0),
            ),
            prefixIcon: Icon(Icons.local_drink),
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 3),
          ),
          value: (gender == 'Male' && lactationPhase == '-')
              ? '-'
              : (lactationPhase.isNotEmpty ? lactationPhase : null),
          items: (gender == 'Male')
              ? [
                  DropdownMenuItem<String>(
                    value: '-',
                    child: Text('-'),
                  ),
                ]
              : <String>['Dry', 'Early', 'Mid', 'Late']
                  .map<DropdownMenuItem<String>>((String value) {
                  return DropdownMenuItem<String>(
                    value: value,
                    child: SizedBox(
                      width: 100,
                      child: Text(
                        value,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  );
                }).toList(),
          onChanged: onPhaseChanged,
          validator: (value) {
            if (gender == 'Female' && (value == null || value.isEmpty)) {
              return 'Please select lactation phase';
            }
            return null;
          },
        ),
      ),
    );
  }
}
