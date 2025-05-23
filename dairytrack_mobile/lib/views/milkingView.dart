import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL1/milkingSessionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/usersManagementController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'dart:io';
import 'package:open_filex/open_filex.dart';
import 'package:path_provider/path_provider.dart';

class MilkingView extends StatefulWidget {
  @override
  _MilkingViewState createState() => _MilkingViewState();
}

class _MilkingViewState extends State<MilkingView> {
  MilkingSessionController milkingSessionController =
      MilkingSessionController();
  CowManagementController cowManagementController = CowManagementController();
  UsersManagementController usersManagementController =
      UsersManagementController();
  CattleDistributionController cattleDistributionController =
      CattleDistributionController();

  List<dynamic> sessions = [];
  List<dynamic> cows = [];
  List<dynamic> milkers = [];
  bool loading = true;
  String? error;

  // State variables for add/edit session
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _cowIdController = TextEditingController();
  final TextEditingController _milkerIdController = TextEditingController();
  final TextEditingController _volumeController = TextEditingController();
  final TextEditingController _milkingTimeController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  bool _isEditing = false;
  dynamic _selectedSession;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      sessions = await milkingSessionController.getMilkingSessions();
      cows = await cowManagementController.listCows();
      // Assuming you have a method to get all users to filter milkers
      milkers = await usersManagementController.listUsers();
      setState(() {
        loading = false;
      });
    } catch (e) {
      setState(() {
        loading = false;
        error = e.toString();
      });
    }
  }

  Future<void> _addOrEditMilkingSession() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();

      final sessionData = {
        'cow_id': int.parse(_cowIdController.text),
        'milker_id': int.parse(_milkerIdController.text),
        'volume': double.parse(_volumeController.text),
        'milking_time': _milkingTimeController.text,
        'notes': _notesController.text,
      };

      try {
        Map<String, dynamic> response;
        if (_isEditing && _selectedSession != null) {
          // Update existing session
          response = await milkingSessionController.updateMilkingSession(
              _selectedSession['id'], sessionData);
        } else {
          // Add new session
          response =
              await milkingSessionController.addMilkingSession(sessionData);
        }

        if (response['success']) {
          // Show success message
          _showSuccessDialog(response['message']);
          // Refresh data
          await fetchData();
          // Clear form
          _clearForm();
        } else {
          // Show error message
          _showErrorDialog(response['message']);
        }
      } catch (e) {
        // Show error message
        _showErrorDialog('An error occurred: $e');
      } finally {
        // Close modal
        Navigator.of(context).pop();
      }
    }
  }

  Future<void> _deleteMilkingSession(int sessionId) async {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Are you sure?'),
          content: Text("You won't be able to revert this!"),
          actions: [
            TextButton(
              child: Text("Cancel"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
            TextButton(
              child: Text("Yes, delete it!"),
              onPressed: () async {
                Navigator.of(context).pop();
                try {
                  final response = await milkingSessionController
                      .deleteMilkingSession(sessionId);
                  if (response['success']) {
                    _showSuccessDialog('Milking session has been deleted.');
                    fetchData(); // Refresh the list
                  } else {
                    _showErrorDialog(response['message'] ??
                        'Failed to delete milking session');
                  }
                } catch (e) {
                  _showErrorDialog('An error occurred: $e');
                }
              },
            ),
          ],
        );
      },
    );
  }

  void _openAddEditModal({dynamic session}) {
    if (session != null) {
      _isEditing = true;
      _selectedSession = session;
      _cowIdController.text = session['cow_id'].toString();
      _milkerIdController.text = session['milker_id'].toString();
      _volumeController.text = session['volume'].toString();
      _milkingTimeController.text = session['milking_time'].toString();
      _notesController.text = session['notes'] ?? '';
    } else {
      _isEditing = false;
      _clearForm();
    }

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title:
              Text(_isEditing ? 'Edit Milking Session' : 'Add Milking Session'),
          content: SingleChildScrollView(
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  // Cow ID Dropdown
                  DropdownButtonFormField<int>(
                    decoration: InputDecoration(labelText: 'Cow ID'),
                    value: _cowIdController.text.isNotEmpty
                        ? int.parse(_cowIdController.text)
                        : null,
                    items: cows.map((cow) {
                      return DropdownMenuItem<int>(
                        value: cow.id,
                        child: Text('${cow.name} (ID: ${cow.id})'),
                      );
                    }).toList(),
                    validator: (value) {
                      if (value == null) {
                        return 'Please select cow ID';
                      }
                      return null;
                    },
                    onChanged: (value) {
                      setState(() {
                        _cowIdController.text = value.toString();
                      });
                    },
                  ),
                  // Milker ID Dropdown
                  DropdownButtonFormField<int>(
                    decoration: InputDecoration(labelText: 'Milker ID'),
                    value: _milkerIdController.text.isNotEmpty
                        ? int.parse(_milkerIdController.text)
                        : null,
                    items: milkers.map((milker) {
                      return DropdownMenuItem<int>(
                        value: milker.id,
                        child: Text('${milker.name} (ID: ${milker.id})'),
                      );
                    }).toList(),
                    validator: (value) {
                      if (value == null) {
                        return 'Please select milker ID';
                      }
                      return null;
                    },
                    onChanged: (value) {
                      setState(() {
                        _milkerIdController.text = value.toString();
                      });
                    },
                  ),
                  TextFormField(
                    controller: _volumeController,
                    decoration: InputDecoration(labelText: 'Volume (L)'),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter volume';
                      }
                      if (double.tryParse(value) == null ||
                          double.parse(value) <= 0) {
                        return 'Please enter a valid positive number';
                      }
                      return null;
                    },
                  ),
                  TextFormField(
                    controller: _milkingTimeController,
                    decoration: InputDecoration(labelText: 'Milking Time'),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter milking time';
                      }
                      return null;
                    },
                    onTap: () async {
                      DateTime? pickedDate = await showDatePicker(
                          context: context,
                          initialDate: DateTime.now(),
                          firstDate: DateTime(2000),
                          lastDate: DateTime(2101));
                      if (pickedDate != null) {
                        TimeOfDay? pickedTime = await showTimePicker(
                            context: context, initialTime: TimeOfDay.now());
                        if (pickedTime != null) {
                          DateTime selectedDateTime = DateTime(
                            pickedDate.year,
                            pickedDate.month,
                            pickedDate.day,
                            pickedTime.hour,
                            pickedTime.minute,
                          );
                          _milkingTimeController.text =
                              DateFormat('yyyy-MM-dd HH:mm')
                                  .format(selectedDateTime);
                        }
                      }
                    },
                  ),
                  TextFormField(
                    controller: _notesController,
                    decoration: InputDecoration(labelText: 'Notes'),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _clearForm();
              },
              child: Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: _addOrEditMilkingSession,
              child: Text(_isEditing ? 'Update' : 'Add'),
            ),
          ],
        );
      },
    );
  }

  void _clearForm() {
    _cowIdController.clear();
    _milkerIdController.clear();
    _volumeController.clear();
    _milkingTimeController.clear();
    _notesController.clear();
    _isEditing = false;
    _selectedSession = null;
  }

  Future<void> _exportMilkingSessionsToPDF() async {
    try {
      final response =
          await milkingSessionController.exportMilkingSessionsToPDF();

      if (response['success']) {
        final bytes = response['data'];
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/milking_sessions.pdf';
        final file = File(filePath);
        await file.writeAsBytes(bytes);

        OpenFilex.open(filePath);
      } else {
        _showErrorDialog(response['message'] ?? 'Failed to export to PDF');
      }
    } catch (e) {
      _showErrorDialog('An error occurred: $e');
    }
  }

  Future<void> _exportMilkingSessionsToExcel() async {
    try {
      final response =
          await milkingSessionController.exportMilkingSessionsToExcel();

      if (response['success']) {
        final bytes = response['data'];
        final directory = await getApplicationDocumentsDirectory();
        final filePath = '${directory.path}/milking_sessions.xlsx';
        final file = File(filePath);
        await file.writeAsBytes(bytes);

        OpenFilex.open(filePath);
      } else {
        _showErrorDialog(response['message'] ?? 'Failed to export to Excel');
      }
    } catch (e) {
      _showErrorDialog('An error occurred: $e');
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Error!'),
          content: Text(message),
          actions: [
            TextButton(
              child: Text("OK"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text("Success!"),
          content: Text(message),
          actions: [
            TextButton(
              child: Text("OK"),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Center(child: CircularProgressIndicator());
    }

    if (error != null) {
      return Center(child: Text('Error: $error'));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('Milking Sessions'),
        actions: [
          IconButton(
            icon: Icon(Icons.picture_as_pdf),
            onPressed: _exportMilkingSessionsToPDF,
          ),
          IconButton(
            icon: Icon(Icons.table_view),
            onPressed: _exportMilkingSessionsToExcel,
          ),
        ],
      ),
      body: ListView.separated(
        itemCount: sessions.length,
        separatorBuilder: (context, index) => Divider(),
        itemBuilder: (context, index) {
          final session = sessions[index];
          return Card(
            child: ListTile(
              title: Text('Cow ID: ${session['cow_id']}'),
              subtitle: Text(
                  'Volume: ${session['volume']}, Time: ${DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(session['milking_time']))}'),
              trailing: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    icon: Icon(Icons.edit),
                    onPressed: () => _openAddEditModal(session: session),
                  ),
                  IconButton(
                    icon: Icon(Icons.delete),
                    onPressed: () => _deleteMilkingSession(session['id']),
                  ),
                ],
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _openAddEditModal(),
        child: Icon(Icons.add),
      ),
    );
  }
}
