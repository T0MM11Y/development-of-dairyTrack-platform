import 'dart:convert';

import 'package:dairytrack_mobile/views/cowManagement/makeEditCowsView.dart';
import 'package:flutter/material.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:open_file/open_file.dart';
import 'package:shared_preferences/shared_preferences.dart'; // Import open_file

class ListOfCowsView extends StatefulWidget {
  @override
  _ListOfCowsViewState createState() => _ListOfCowsViewState();
}

class _ListOfCowsViewState extends State<ListOfCowsView> {
  final CowManagementController _controller = CowManagementController();
  final CattleDistributionController _cattleController =
      CattleDistributionController();
  List<Cow> _cows = [];
  List<Cow> _filteredCows = [];
  bool _isLoading = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _selectedGender = '';
  String _selectedPhase = '';
  String _sortField = 'name';
  bool _sortAscending = true;
  Map<String, dynamic>? currentUser;
  bool isFarmer = false;
  bool isSupervisor = false;

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
    _loadCurrentUser();
  }

  Future<void> _exportToPDF() async {
    try {
      final response = await _controller.exportCowsToPDF();
      if (response['success']) {
        final filePath = response['filePath'];
        OpenFile.open(filePath);
      } else {
        _showSnackBar(response['message'] ?? 'Failed to export to PDF');
      }
    } catch (e) {
      _showSnackBar('Error exporting to PDF: $e');
    }
  }

  Future<void> _exportToExcel() async {
    try {
      final response = await _controller.exportCowsToExcel();
      if (response['success']) {
        final filePath = response['filePath'];
        OpenFile.open(filePath);
      } else {
        _showSnackBar(response['message'] ?? 'Failed to export to Excel');
      }
    } catch (e) {
      _showSnackBar('Error exporting to Excel: $e');
    }
  }

  Future<void> _loadCurrentUser() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      // Get user data using individual keys like in initialAdminDashboard.dart
      final userId = prefs.getInt('userId');
      final userName = prefs.getString('userName');
      final userUsername = prefs.getString('userUsername');
      final userEmail = prefs.getString('userEmail');
      final userRole = prefs.getString('userRole');
      final userToken = prefs.getString('userToken');
      final roleId =
          prefs.getInt('roleId'); // Add this if you store roleId separately

      print('Debug - User ID: $userId'); // Debug print
      print('Debug - User Name: $userName'); // Debug print
      print('Debug - Role ID: $roleId'); // Debug print
      print('Debug - User Role: $userRole'); // Debug print

      if (userId != null && userName != null) {
        setState(() {
          currentUser = {
            'id': userId,
            'user_id': userId, // Add both id and user_id for compatibility
            'name': userName,
            'username': userUsername ?? '',
            'email': userEmail ?? '',
            'role': userRole ?? 'Administrator',
            'token': userToken ?? '',
            'role_id': roleId ??
                (userRole == 'Farmer' ? 3 : (userRole == 'Supervisor' ? 2 : 1)),
          };

          // Check if user is a farmer (role_id = 3)
          isFarmer = currentUser?['role_id'] == 3;
          isSupervisor = currentUser?['role_id'] == 2;
        });

        print('Debug - Is Farmer: $isFarmer'); // Debug print
        print('Debug - Current User: $currentUser'); // Debug print

        _fetchCows();
      } else {
        print('Debug - User data not found in SharedPreferences');
        // If individual keys don't exist, try the old JSON string method as fallback
        final userString = prefs.getString('user');
        if (userString != null) {
          print('Debug - Found user string, using JSON method');
          setState(() {
            currentUser = jsonDecode(userString);
            isFarmer = currentUser?['role_id'] == 3;
          });
          print('Debug - From JSON - Is Farmer: $isFarmer');
          print('Debug - From JSON - Current User: $currentUser');
        }
        _fetchCows();
      }
    } catch (e) {
      print('Error loading user: $e');
      _fetchCows();
    }
  }

  Future<void> _fetchCows() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      List<Cow> cows;

      if (isFarmer && currentUser != null) {
        // Farmer - get only managed cows
        final userId = currentUser!['id'] ?? currentUser!['user_id'];
        if (userId == null) {
          throw Exception('User ID not found');
        }

        final response = await _cattleController.listCowsByUser(userId);
        if (response['success'] == true) {
          cows = (response['cows'] as List)
              .map((cowData) => Cow.fromJson(cowData))
              .toList();
        } else {
          throw Exception(
              response['message'] ?? 'Failed to fetch managed cows');
        }
      } else {
        // Admin/Supervisor - get all cows
        cows = await _controller.listCows();
      }

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
    final managersResponse = await _cattleController.getCowManagers(cowId);

    // Farmers cannot delete cows
    if (isFarmer) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: Colors.grey[900],
          title: Text("Access Denied", style: TextStyle(color: Colors.white)),
          content: Text(
            "Farmers cannot delete cows. Please contact an administrator.",
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("OK", style: TextStyle(color: Colors.teal[400])),
            ),
          ],
        ),
      );
      return;
    } // Ambil daftar user yang mengelola sapi

    if (managersResponse['success'] == true &&
        managersResponse['managers'].isNotEmpty) {
      final managerList = (managersResponse['managers'] as List)
          .map((manager) => "${manager['username']}")
          .join(", ");

      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: Colors.grey[900], // Dark theme background
          title: Text("Delete Cow",
              style: TextStyle(color: Colors.white)), // White text
          content: Text.rich(
            TextSpan(
              children: [
                TextSpan(
                  text: "This cow is managed by: ",
                  style: TextStyle(color: Colors.white70),
                ),
                TextSpan(
                  text: managerList,
                  style: TextStyle(
                    color: Colors.white70,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                TextSpan(
                  text: ". Are you sure you want to delete this cow?",
                  style: TextStyle(color: Colors.white70),
                ),
              ],
            ),
          ),
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
    } else {
      // Jika tidak ada manager, langsung tampilkan konfirmasi penghapusan
      final confirm = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: Colors.grey[900], // Dark theme background
          title: Text("Delete Cow",
              style: TextStyle(color: Colors.white)), // White text
          content: Text("Are you sure you want to delete this cow?",
              style: TextStyle(color: Colors.white70)), // Lighter text
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
  }

  void _navigateToEditCow(Cow cow) async {
    if (isFarmer) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: Colors.grey[900],
          title: Text("Access Denied", style: TextStyle(color: Colors.white)),
          content: Text(
            "Farmers cannot edit cows. Please contact an administrator.",
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text("OK",
                  style: TextStyle(
                    color: Colors.teal[400],
                  )),
            ),
          ],
        ),
      );
      return;
    }
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => MakeCowsView(
          initialCowData: {
            '_id': cow.id.toString(),
            'name': cow.name,
            // Pastikan cow.birth diubah menjadi DateTime sebelum diformat
            'birth': cow.birth != null
                ? DateFormat('yyyy-MM-dd').format(
                    DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
                        .parse(cow.birth))
                : '',
            'breed': cow.breed,
            'lactation_phase': cow.lactationPhase,
            'weight': cow.weight,
            'gender': cow.gender,
          },
        ),
      ),
    );
    if (result == true) {
      _fetchCows();
    }
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFFe0eafc), Color(0xFFcfdef3)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          leading: IconButton(
            icon: Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Navigator.of(context).pop(),
          ),
          title: Text(
            isFarmer ? "My Managed Cows" : "List of Cows",
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              letterSpacing: 1.2,
              shadows: [Shadow(blurRadius: 8, color: Colors.black26)],
            ),
          ),
          elevation: 8,
          backgroundColor: isFarmer
              ? Colors.teal[400]
              : isSupervisor
                  ? Colors.deepOrange[400]
                  : Colors.blueGrey[800],
          actions: [
            IconButton(
              icon: Icon(Icons.filter_list, color: Colors.white),
              onPressed: () {
                _showFilterSheet(context);
              },
            ),
            if (!isFarmer)
              PopupMenuButton<String>(
                icon: Icon(Icons.download, color: Colors.white),
                onSelected: (value) {
                  if (value == 'pdf') {
                    _exportToPDF();
                  } else if (value == 'excel') {
                    _exportToExcel();
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'pdf',
                    child: Row(
                      children: [
                        Icon(Icons.picture_as_pdf, color: Colors.red),
                        SizedBox(width: 8),
                        Text('Export PDF'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'excel',
                    child: Row(
                      children: [
                        Icon(Icons.table_chart, color: Colors.green),
                        SizedBox(width: 8),
                        Text('Export Excel'),
                      ],
                    ),
                  ),
                ],
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
                              ? Center(
                                  child: Text(isFarmer
                                      ? "No cows assigned to you. Please contact an administrator."
                                      : "No cows found"))
                              : ListView(
                                  children: [
                                    _buildStatisticsCard(),
                                    _buildLactationPhaseInfo(),
                                    ..._filteredCows
                                        .asMap()
                                        .entries
                                        .map((entry) => _buildAnimatedCowCard(
                                            entry.value, entry.key))
                                        .toList(),
                                    SizedBox(height: 80),
                                  ],
                                ),
                        ),
                      ],
                    ),
                  ),
        floatingActionButton: (!isFarmer && !isSupervisor)
            ? FloatingActionButton(
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
                elevation: 8,
              )
            : null,
      ),
    );
  }

  Widget _buildAnimatedCowCard(Cow cow, int index) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 400 + index * 60),
      builder: (context, value, child) {
        return Opacity(
          opacity: value,
          child: Transform.translate(
            offset: Offset(0, 30 * (1 - value)),
            child: child,
          ),
        );
      },
      child: _buildCowCard(cow),
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
          Text(
            'Sort by:',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.blueGrey[800],
              fontSize: 15,
              letterSpacing: 0.5,
            ),
          ),
          SizedBox(width: 8),
          ...['name', 'weight', 'age'].map((field) {
            String label = field[0].toUpperCase() + field.substring(1);
            bool selected = _sortField == field;
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ChoiceChip(
                label: Text(
                  label,
                  style: TextStyle(
                    color: selected ? Colors.white : Colors.blueGrey[800],
                    fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                    letterSpacing: 0.5,
                  ),
                ),
                selected: selected,
                selectedColor: Colors.teal[400],
                backgroundColor: Colors.blueGrey[50],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                  side: BorderSide(
                    color: selected ? Colors.teal : Colors.blueGrey[100]!,
                    width: selected ? 2 : 1,
                  ),
                ),
                elevation: selected ? 4 : 0,
                shadowColor: Colors.teal.withOpacity(0.2),
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
    DateTime birthDate;
    try {
      birthDate = DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
          .parse(cow.birth, true)
          .toLocal();
    } catch (e) {
      return Card(
        elevation: 4,
        margin: EdgeInsets.symmetric(vertical: 8, horizontal: 20),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        child: ListTile(
          title: Text(cow.name),
          subtitle: Text("Invalid birth date format"),
        ),
      );
    }
    final now = DateTime.now();
    final ageYears = now.year - birthDate.year;
    final ageMonths = now.month - birthDate.month + (ageYears * 12);
    final displayYears = ageMonths ~/ 12;
    final displayMonths = ageMonths % 12;
    return Card(
      elevation: 6,
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      shadowColor: Colors.blueGrey.withOpacity(0.2),
      child: ExpansionTile(
        leading: CircleAvatar(
          radius: 28,
          backgroundColor:
              cow.gender == 'Female' ? Colors.green[100] : Colors.blue[100],
          child: Icon(
            cow.gender == 'Female' ? Icons.female : Icons.male,
            color: cow.gender == 'Female' ? Colors.green : Colors.blue,
            size: 32,
          ),
        ),
        title: Text(
          cow.name,
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        subtitle: Text(
          "Age: $displayYears years, $displayMonths months, Weight: ${cow.weight} kg",
          style: TextStyle(fontSize: 13, color: Colors.grey[700]),
        ),
        trailing: Chip(
          label: Text(cow.gender),
          backgroundColor:
              cow.gender == 'Female' ? Colors.green[50] : Colors.blue[50],
          labelStyle: TextStyle(
            color: cow.gender == 'Female' ? Colors.green : Colors.blue,
            fontSize: 13,
            fontWeight: FontWeight.bold,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildCowInfoRow(
                    'Age', "$displayYears years, $displayMonths months"),
                _buildCowInfoRow('Weight', "${cow.weight} kg"),
                _buildCowInfoRow('Phase', cow.lactationPhase),
                Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (!isSupervisor)
                      ElevatedButton.icon(
                        icon: const Icon(
                          Icons.edit,
                          size: 20,
                          color: Colors.white,
                        ),
                        label: const Text(
                          "Edit",
                          style: TextStyle(fontSize: 14, color: Colors.white),
                        ),
                        onPressed: () => _navigateToEditCow(cow),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[400],
                          padding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    SizedBox(width: 8),
                    if (!isSupervisor)
                      ElevatedButton.icon(
                        icon: const Icon(
                          Icons.delete,
                          size: 20,
                          color: Colors.white,
                        ),
                        label: const Text(
                          "Delete",
                          style: TextStyle(fontSize: 14, color: Colors.white),
                        ),
                        onPressed: () => _deleteCow(cow.id),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red[400],
                          padding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCowInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          SizedBox(width: 8),
          Text('$label:', style: TextStyle(fontWeight: FontWeight.w500)),
          SizedBox(width: 8),
          Expanded(
            child: Text(value, style: TextStyle(color: Colors.grey[800])),
          ),
        ],
      ),
    );
  }

  void _showFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => Center(
        child: Container(
          width: 320,
          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 18),
          decoration: BoxDecoration(
            color: Colors.grey[900],
            borderRadius: BorderRadius.circular(18),
            boxShadow: [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 18,
                offset: Offset(0, 8),
              ),
            ],
          ),
          child: StatefulBuilder(
            builder: (context, setState) {
              return Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    margin: EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: Colors.grey[700],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  Text(
                    'Filter',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      letterSpacing: 0.5,
                    ),
                  ),
                  SizedBox(height: 18),
                  // Gender filter
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _simpleFilterChip(setState, 'All', '', _selectedGender),
                      SizedBox(width: 8),
                      _simpleFilterChip(
                          setState, 'Female', 'Female', _selectedGender),
                      SizedBox(width: 8),
                      _simpleFilterChip(
                          setState, 'Male', 'Male', _selectedGender),
                    ],
                  ),
                  SizedBox(height: 14),
                  // Phase filter
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: Colors.grey[850],
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: _selectedPhase,
                        isExpanded: true,
                        icon: Icon(Icons.arrow_drop_down, color: Colors.white),
                        dropdownColor: Colors.grey[900],
                        style: TextStyle(color: Colors.white, fontSize: 13),
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
                          setState(() => _selectedPhase = value!);
                        },
                      ),
                    ),
                  ),
                  SizedBox(height: 18),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      icon: Icon(Icons.check, size: 18),
                      label: Text('Apply', style: TextStyle(fontSize: 15)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal[700],
                        foregroundColor: Colors.white,
                        elevation: 2,
                        padding: EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: () {
                        Navigator.pop(context);
                        this.setState(() => _applyFiltersAndSort());
                      },
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ),
    );
  }

// Simple filter chip for gender
  Widget _simpleFilterChip(
      StateSetter setState, String label, String value, String selectedValue) {
    final bool isSelected = value == selectedValue;
    return ChoiceChip(
      label: Text(label, style: TextStyle(fontSize: 13)),
      selected: isSelected,
      selectedColor: Colors.teal[400],
      backgroundColor: Colors.grey[800],
      labelStyle: TextStyle(
        color: isSelected ? Colors.white : Colors.white70,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      padding: EdgeInsets.symmetric(horizontal: 10, vertical: 0),
      visualDensity: VisualDensity.compact,
      onSelected: (_) => setState(() => _selectedGender = value),
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
      margin: EdgeInsets.symmetric(vertical: 12, horizontal: 20),
      elevation: 6,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      child: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.bar_chart, color: Colors.blueGrey, size: 28),
                SizedBox(width: 10),
                Text(
                  isFarmer ? 'My Cow Statistics' : 'Cow Statistics',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            SizedBox(height: 18),
            _buildGenderStatistics(
                femaleCount, femalePercent, maleCount, malePercent),
            SizedBox(height: 18),
            _buildLactationPhaseStatistics(phaseCounts),
          ],
        ),
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
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.female, color: Colors.pink[300], size: 20),
                      SizedBox(width: 6),
                      Text(
                          'Female: $femaleCount (${femalePercent.toStringAsFixed(1)}%)',
                          style: TextStyle(
                              fontWeight: FontWeight.w500, fontSize: 12)),
                    ],
                  ),
                  SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: femalePercent / 100,
                      backgroundColor: Colors.pink[50],
                      color: Colors.pink[300],
                      minHeight: 8,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(width: 18),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.male, color: Colors.blue[300], size: 20),
                      SizedBox(width: 6),
                      Text(
                        'Male: $maleCount (${malePercent.toStringAsFixed(1)}%)',
                        style: TextStyle(
                            fontWeight: FontWeight.w500, fontSize: 12),
                      ),
                    ],
                  ),
                  SizedBox(height: 4),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: malePercent / 100,
                      backgroundColor: Colors.blue[50],
                      color: Colors.blue[300],
                      minHeight: 8,
                    ),
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
        return Colors.brown[100]!;
      case 'Early':
        return Colors.green[100]!;
      case 'Mid':
        return Colors.yellow[100]!;
      case 'Late':
        return Colors.orange[100]!;
      default:
        return Colors.grey[100]!;
    }
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
}
