import 'package:dairytrack_mobile/views/cowManagement/makeCowsView.dart';
import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:intl/intl.dart';
import 'package:open_file/open_file.dart';

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
        'The cow is not producing milk and is in a resting phase before the next lactation cycle.',
    'Early':
        'The cow is in the early stage of lactation, typically producing the highest amount of milk.',
    'Mid':
        'The cow is in the middle stage of lactation, with milk production gradually decreasing.',
    'Late':
        'The cow is in the late stage of lactation, with milk production significantly reduced.',
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

    // Apply search
    if (_searchQuery.isNotEmpty) {
      filtered =
          filtered
              .where(
                (cow) =>
                    cow.name.toLowerCase().contains(_searchQuery.toLowerCase()),
              )
              .toList();
    }

    // Apply gender filter
    if (_selectedGender.isNotEmpty) {
      filtered =
          filtered.where((cow) => cow.gender == _selectedGender).toList();
    }

    // Apply phase filter
    if (_selectedPhase.isNotEmpty) {
      filtered =
          filtered
              .where((cow) => cow.lactationPhase == _selectedPhase)
              .toList();
    }

    // Apply sorting
    filtered.sort((a, b) {
      int comparison;

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
        default:
          comparison = 0;
      }

      return _sortAscending ? comparison : -comparison;
    });

    _filteredCows = filtered;
  }

  void _deleteCow(int cowId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
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
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Cow deleted successfully.")));
        _fetchCows();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? "Failed to delete cow."),
          ),
        );
      }
    }
  }

  void _viewEditCow(Cow cow) async {
    // Create copies of the cow's data for editing
    String name = cow.name;
    DateTime? birth =
        cow.birth != null && cow.birth.isNotEmpty
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
          content: LayoutBuilder(
            builder: (
              BuildContext context,
              BoxConstraints viewportConstraints,
            ) {
              return SingleChildScrollView(
                child: ConstrainedBox(
                  constraints: BoxConstraints(
                    minWidth: viewportConstraints.maxWidth - 50,
                    minHeight: viewportConstraints.maxHeight - 150,
                  ),
                  child: StatefulBuilder(
                    builder: (context, setState) {
                      return Padding(
                        padding: const EdgeInsets.all(10.0), // Reduced padding
                        child: Form(
                          key: _formKey,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              ListTile(
                                leading: Icon(Icons.tag),
                                title: Text("ID"),
                                subtitle: Text("${cow.id}"),
                                contentPadding: EdgeInsets.symmetric(
                                  horizontal: 0,
                                ), // Remove default padding
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 5.0,
                                ),
                                child: TextFormField(
                                  decoration: InputDecoration(
                                    labelText: 'Name',
                                    hintText: 'Enter cow\'s name',
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    prefixIcon: Icon(Icons.person),
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 10,
                                    ), // Reduced padding
                                  ),
                                  initialValue: name,
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Please enter the cow\'s name';
                                    }
                                    return null;
                                  },
                                  onChanged: (value) => name = value,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 5.0,
                                ),
                                child: GestureDetector(
                                  onTap: () async {
                                    DateTime? pickedDate = await showDatePicker(
                                      context: context,
                                      initialDate: birth ?? DateTime.now(),
                                      firstDate: DateTime(1900),
                                      lastDate: DateTime.now(),
                                    );
                                    if (pickedDate != null) {
                                      setState(() {
                                        birth = pickedDate;
                                      });
                                    }
                                  },
                                  child: InputDecorator(
                                    decoration: InputDecoration(
                                      labelText: 'Birth Date',
                                      hintText:
                                          birth == null
                                              ? 'Select Birth Date'
                                              : DateFormat(
                                                'yyyy-MM-dd',
                                              ).format(birth!),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(
                                          10.0,
                                        ),
                                      ),
                                      prefixIcon: Icon(Icons.calendar_today),
                                      contentPadding: EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 10,
                                      ), // Reduced padding
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: <Widget>[
                                        Text(
                                          birth == null
                                              ? 'Select Birth Date'
                                              : DateFormat(
                                                'yyyy-MM-dd',
                                              ).format(birth!),
                                        ),
                                        Icon(
                                          Icons.arrow_drop_down,
                                          color: Colors.grey,
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 5.0,
                                ),
                                child: DropdownButtonFormField<String>(
                                  decoration: InputDecoration(
                                    labelText: 'Gender',
                                    hintText: 'Select gender',
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    prefixIcon: Icon(Icons.wc),
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 5,
                                    ), // Reduced padding
                                  ),
                                  value: gender,
                                  items:
                                      ['Male', 'Female'].map((String value) {
                                        return DropdownMenuItem<String>(
                                          value: value,
                                          child: Text(value),
                                        );
                                      }).toList(),
                                  onChanged: (value) {
                                    setState(() {
                                      gender = value!;
                                      if (gender == 'Male') {
                                        lactationPhase = '-';
                                      } else {
                                        lactationPhase =
                                            lactationPhase == '-'
                                                ? ''
                                                : lactationPhase;
                                      }
                                    });
                                  },
                                  validator:
                                      (value) =>
                                          value == null
                                              ? 'Please select gender'
                                              : null,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 5.0,
                                ),
                                child: TextFormField(
                                  decoration: InputDecoration(
                                    labelText: 'Breed',
                                    hintText:
                                        'Breed is automatically Girolando',
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    prefixIcon: Icon(Icons.grass),
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 10,
                                    ), // Reduced padding
                                  ),
                                  initialValue: cow.breed,
                                  readOnly: true,
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 3.0,
                                ),
                                child: Container(
                                  // Wrap DropdownButtonFormField with Container
                                  width:
                                      MediaQuery.of(context).size.width *
                                      0.7, // Adjust the width as needed
                                  child: DropdownButtonFormField<String>(
                                    decoration: InputDecoration(
                                      labelText: 'Lactation Phase',
                                      hintText: 'Select lactation phase',
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(
                                          10.0,
                                        ),
                                      ),
                                      prefixIcon: Icon(Icons.local_drink),
                                      contentPadding: EdgeInsets.symmetric(
                                        horizontal: 12,
                                        vertical: 3,
                                      ), // Reduced padding
                                    ),
                                    value:
                                        (gender == 'Male' &&
                                                lactationPhase == '-')
                                            ? '-'
                                            : (lactationPhase.isNotEmpty
                                                ? lactationPhase
                                                : null),
                                    items:
                                        (gender == 'Male')
                                            ? [
                                              DropdownMenuItem<String>(
                                                value: '-',
                                                child: Text('-'),
                                              ),
                                            ]
                                            : <String>[
                                              'Dry',
                                              'Early',
                                              'Mid',
                                              'Late',
                                            ].map<DropdownMenuItem<String>>((
                                              String value,
                                            ) {
                                              return DropdownMenuItem<String>(
                                                value: value,
                                                child: SizedBox(
                                                  width:
                                                      100, // Adjust the width as needed
                                                  child: Text(
                                                    value,
                                                    overflow:
                                                        TextOverflow.ellipsis,
                                                  ),
                                                ),
                                              );
                                            }).toList(),
                                    onChanged: (String? newValue) {
                                      setState(() {
                                        lactationPhase = newValue!;
                                      });
                                    },
                                    validator: (value) {
                                      if (gender == 'Female' &&
                                          (value == null || value.isEmpty)) {
                                        return 'Please select lactation phase';
                                      }
                                      return null;
                                    },
                                  ),
                                ),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 5.0,
                                ),
                                child: TextFormField(
                                  decoration: InputDecoration(
                                    labelText: 'Weight (kg)',
                                    hintText: 'Enter cow\'s weight in kg',
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                    prefixIcon: Icon(Icons.fitness_center),
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 10,
                                    ), // Reduced padding
                                  ),
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
                                  onChanged:
                                      (value) =>
                                          weight =
                                              double.tryParse(value) ?? weight,
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
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
                    final birthDateFormatted =
                        birth != null
                            ? DateFormat('yyyy-MM-dd').format(birth!)
                            : cow.birth; // Keep original if null

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
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text("Cow updated successfully.")),
                      );
                      Navigator.of(context).pop();
                      _fetchCows();
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            response['message'] ?? "Failed to update cow.",
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text("Error: ${e.toString()}")),
                    );
                  } finally {
                    setState(() {
                      _isLoading = false;
                    });
                  }
                }
              },
              child:
                  _isLoading
                      ? SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
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

            // Gender statistics
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

            SizedBox(height: 16),

            // Lactation phase info
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
              Color phaseColor;
              switch (entry.key) {
                case 'Dry':
                  phaseColor = Colors.red[100]!;
                  break;
                case 'Early':
                  phaseColor = Colors.green[100]!;
                  break;
                case 'Mid':
                  phaseColor = Colors.blue[100]!;
                  break;
                case 'Late':
                  phaseColor = Colors.yellow[100]!;
                  break;
                default:
                  phaseColor = Colors.grey[100]!;
              }

              return Container(
                margin: EdgeInsets.only(bottom: 8),
                padding: EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: phaseColor,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: phaseColor.withOpacity(0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      entry.key,
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 4),
                    Text(entry.value),
                  ],
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          // Tambahkan ini
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
              showModalBottomSheet(
                context: context,
                isScrollControlled:
                    true, // Allows the bottom sheet to take more height if needed
                builder:
                    (context) => StatefulBuilder(
                      builder: (context, setState) {
                        return Padding(
                          padding: EdgeInsets.only(
                            bottom:
                                MediaQuery.of(
                                  context,
                                ).viewInsets.bottom, // Adjust for keyboard
                            left: 16.0,
                            right: 16.0,
                            top: 16.0,
                          ),
                          child: SingleChildScrollView(
                            // Added SingleChildScrollView for smaller screens
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment:
                                  CrossAxisAlignment
                                      .start, // Align titles to the left
                              children: [
                                Center(
                                  // Center the main title
                                  child: Text(
                                    'Filter Cows',
                                    style: TextStyle(
                                      fontSize: 20, // Increased font size
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                                SizedBox(height: 24), // Increased spacing
                                // Gender filter
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: Text(
                                    'Gender',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight:
                                          FontWeight.w600, // Slightly bolder
                                    ),
                                  ),
                                ),
                                Row(
                                  children: [
                                    Expanded(
                                      child: RadioListTile<String>(
                                        title: Text('All'),
                                        value: '',
                                        groupValue: _selectedGender,
                                        onChanged: (value) {
                                          setState(() {
                                            _selectedGender = value!;
                                          });
                                        },
                                        contentPadding:
                                            EdgeInsets.zero, // Adjust padding
                                      ),
                                    ),
                                    Expanded(
                                      child: RadioListTile<String>(
                                        title: Text('Female'),
                                        value: 'Female',
                                        groupValue: _selectedGender,
                                        onChanged: (value) {
                                          setState(() {
                                            _selectedGender = value!;
                                          });
                                        },
                                        contentPadding:
                                            EdgeInsets.zero, // Adjust padding
                                      ),
                                    ),
                                    Expanded(
                                      child: RadioListTile<String>(
                                        title: Text('Male'),
                                        value: 'Male',
                                        groupValue: _selectedGender,
                                        onChanged: (value) {
                                          setState(() {
                                            _selectedGender = value!;
                                          });
                                        },
                                        contentPadding:
                                            EdgeInsets.zero, // Adjust padding
                                      ),
                                    ),
                                  ],
                                ),

                                SizedBox(height: 16), // Spacing
                                // Phase filter
                                Padding(
                                  padding: const EdgeInsets.only(bottom: 8.0),
                                  child: Text(
                                    'Lactation Phase',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight:
                                          FontWeight.w600, // Slightly bolder
                                    ),
                                  ),
                                ),
                                DropdownButtonFormField<String>(
                                  value: _selectedPhase,
                                  decoration: InputDecoration(
                                    border: OutlineInputBorder(
                                      borderRadius: BorderRadius.circular(
                                        8.0,
                                      ), // Rounded border
                                    ),
                                    contentPadding: EdgeInsets.symmetric(
                                      horizontal: 12,
                                      vertical: 10,
                                    ), // Adjust padding
                                  ),
                                  items: [
                                    DropdownMenuItem(
                                      value: '',
                                      child: Text('All'),
                                    ),
                                    ..._lactationPhaseDescriptions.keys.map((
                                      phase,
                                    ) {
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

                                SizedBox(height: 24), // Increased spacing

                                SizedBox(
                                  // Make button full width
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      Navigator.of(context).pop();
                                      this.setState(() {
                                        // Use the outer setState
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
                                      ), // Adjust padding
                                      shape: RoundedRectangleBorder(
                                        // Rounded corners
                                        borderRadius: BorderRadius.circular(
                                          8.0,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                SizedBox(
                                  height: 16,
                                ), // Add some padding at the bottom
                              ],
                            ),
                          ),
                        );
                      },
                    ),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.file_download, color: Colors.white),
            onPressed: () {
              showDialog(
                context: context,
                builder:
                    (context) => AlertDialog(
                      title: Text("Export Data"),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ListTile(
                            leading: Icon(Icons.picture_as_pdf),
                            title: Text("Export as PDF"),
                            onTap: () {
                              Navigator.pop(context);
                              _controller
                                  .exportCowsToPDF()
                                  .then((response) {
                                    if (response['success']) {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            "PDF export successful",
                                          ),
                                        ),
                                      );
                                    } else {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(response['message']),
                                        ),
                                      );
                                    }
                                  })
                                  .catchError((e) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text("Error: ${e.toString()}"),
                                      ),
                                    );
                                  });
                            },
                          ),
                          ListTile(
                            leading: Icon(Icons.table_chart),
                            title: Text("Export as Excel"),
                            onTap: () {
                              Navigator.pop(context);
                              _controller
                                  .exportCowsToExcel()
                                  .then((response) {
                                    if (response['success']) {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(
                                            "Excel export successful",
                                          ),
                                        ),
                                      );
                                    } else {
                                      ScaffoldMessenger.of(
                                        context,
                                      ).showSnackBar(
                                        SnackBar(
                                          content: Text(response['message']),
                                        ),
                                      );
                                    }
                                  })
                                  .catchError((e) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text("Error: ${e.toString()}"),
                                      ),
                                    );
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
            },
          ),
        ],
      ),
      body:
          _isLoading
              ? Center(child: CircularProgressIndicator())
              : _errorMessage.isNotEmpty
              ? Center(child: Text(_errorMessage))
              : RefreshIndicator(
                onRefresh: _fetchCows,
                child: Column(
                  children: [
                    // Search bar
                    Padding(
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
                          suffixIcon:
                              _searchQuery.isNotEmpty
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
                    ),

                    // Sorting options
                    SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      padding: EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          Text('Sort by: '),
                          SizedBox(width: 8),
                          ...['name', 'weight', 'age'].map((field) {
                            String label =
                                field[0].toUpperCase() + field.substring(1);
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
                    ),

                    Expanded(
                      child:
                          _filteredCows.isEmpty
                              ? Center(child: Text("No cows found"))
                              : ListView(
                                children: [
                                  // Statistics card
                                  _buildStatisticsCard(),

                                  // Lactation phase info
                                  _buildLactationPhaseInfo(),

                                  // Cow list
                                  ...List.generate(_filteredCows.length, (
                                    index,
                                  ) {
                                    final cow = _filteredCows[index];
                                    return Card(
                                      margin: EdgeInsets.symmetric(
                                        vertical: 4,
                                        horizontal: 16,
                                      ),
                                      child: Padding(
                                        padding: const EdgeInsets.all(8.0),
                                        child: ExpansionTile(
                                          leading: CircleAvatar(
                                            backgroundColor:
                                                cow.gender == 'Female'
                                                    ? Colors.green[100]
                                                    : Colors.blue[100],
                                            child: Icon(
                                              cow.gender == 'Female'
                                                  ? Icons.female
                                                  : Icons.male,
                                              color:
                                                  cow.gender == 'Female'
                                                      ? Colors.green
                                                      : Colors.blue,
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
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 16,
                                                    vertical: 8,
                                                  ),
                                              child: Column(
                                                children: [
                                                  Row(
                                                    children: [
                                                      Expanded(
                                                        child: ListTile(
                                                          leading: Icon(
                                                            Icons.cake,
                                                            size: 20,
                                                          ),
                                                          title: Text(
                                                            "Age",
                                                            style: TextStyle(
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                          subtitle: Text(
                                                            "${cow.age} years",
                                                            style: TextStyle(
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                          dense: true,
                                                        ),
                                                      ),
                                                      Expanded(
                                                        child: ListTile(
                                                          leading: Icon(
                                                            Icons
                                                                .fitness_center,
                                                            size: 20,
                                                          ),
                                                          title: Text(
                                                            "Weight",
                                                            style: TextStyle(
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                          subtitle: Text(
                                                            "${cow.weight} kg",
                                                            style: TextStyle(
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                          dense: true,
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  Row(
                                                    children: [
                                                      Expanded(
                                                        child: ListTile(
                                                          leading: Icon(
                                                            Icons.opacity,
                                                            size: 20,
                                                          ),
                                                          title: Text(
                                                            "Phase",
                                                            style: TextStyle(
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                          subtitle: Text(
                                                            cow.lactationPhase,
                                                            style: TextStyle(
                                                              fontSize: 14,
                                                            ),
                                                          ),
                                                          dense: true,
                                                        ),
                                                      ),
                                                      Expanded(
                                                        child: Row(
                                                          mainAxisAlignment:
                                                              MainAxisAlignment
                                                                  .end,
                                                          children: [
                                                            IconButton(
                                                              icon: Icon(
                                                                Icons.edit,
                                                                size: 20,
                                                              ),
                                                              onPressed:
                                                                  () =>
                                                                      _viewEditCow(
                                                                        cow,
                                                                      ),
                                                            ),
                                                            IconButton(
                                                              icon: Icon(
                                                                Icons.delete,
                                                                size: 20,
                                                              ),
                                                              onPressed:
                                                                  () =>
                                                                      _deleteCow(
                                                                        cow.id,
                                                                      ),
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
                                                cow.gender == 'Female'
                                                    ? Colors.green[50]
                                                    : Colors.blue[50],
                                            labelStyle: TextStyle(
                                              color:
                                                  cow.gender == 'Female'
                                                      ? Colors.green
                                                      : Colors.blue,
                                              fontSize: 12,
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  }),
                                  SizedBox(height: 80), // Space for FAB
                                ],
                              ),
                    ),
                  ],
                ),
              ),
      floatingActionButton: FloatingActionButton(
        onPressed: () async {
          // Navigate to add new cow screen
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => MakeCowsView()),
          );
          if (result == true) {
            setState(() {
              _fetchCows(); // Refresh the list after adding a new cow
            });
          }
        },
        child: Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.blueGrey[800],
      ),
    );
  }
}
