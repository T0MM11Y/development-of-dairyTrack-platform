import 'dart:async';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL1/milkingSessionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';

class EditMilkingModal extends StatefulWidget {
  final Map<String, dynamic>? currentUser;
  final List<dynamic> cowList;
  final List<dynamic> userManagedCows;
  final Map<String, dynamic> session;
  final VoidCallback onSessionUpdated;

  const EditMilkingModal({
    Key? key,
    required this.currentUser,
    required this.cowList,
    required this.userManagedCows,
    required this.session,
    required this.onSessionUpdated,
  }) : super(key: key);

  @override
  _EditMilkingModalState createState() => _EditMilkingModalState();
}

class _EditMilkingModalState extends State<EditMilkingModal> {
  // Controllers
  final MilkingSessionController milkingSessionController =
      MilkingSessionController();
  final CattleDistributionController cattleDistributionController =
      CattleDistributionController();
  String _getCowName(String cowId) {
    try {
      dynamic cow;
      try {
        cow = widget.cowList.firstWhere(
          (cow) => (cow is Map ? cow['id'] : cow.id).toString() == cowId,
        );
      } catch (e) {
        // Cow not found
        return 'Unknown';
      }

      if (cow == null) {
        return 'Unknown';
      }

      final cowName = cow is Map ? cow['name'] : cow.name;
      return cowName?.toString() ?? 'Unknown';
    } catch (e) {
      return 'Unknown';
    }
  }

  // Form controllers
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _volumeController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final TextEditingController _dateController = TextEditingController();
  final TextEditingController _timeController = TextEditingController();

  // State variables
  bool isActionLoading = false;
  bool loadingFarmers = false;
  List<dynamic> availableFarmersForCow = [];

  // Stream controllers for farmers
  final StreamController<List<dynamic>> _farmersStreamController =
      StreamController<List<dynamic>>.broadcast();
  final StreamController<bool> _loadingStreamController =
      StreamController<bool>.broadcast();

  Stream<List<dynamic>> get _farmersStream => _farmersStreamController.stream;
  Stream<bool> get _loadingStream => _loadingStreamController.stream;

  // Edit session form state
  Map<String, dynamic> editSession = {};

  @override
  void initState() {
    super.initState();
    _initializeEditForm();
  }

  @override
  void dispose() {
    _volumeController.dispose();
    _notesController.dispose();
    _dateController.dispose();
    _timeController.dispose();
    _farmersStreamController.close();
    _loadingStreamController.close();
    super.dispose();
  }

  void _initializeEditForm() {
    final session = widget.session;

    // Initialize form data from existing session
    editSession = {
      'id': session['id'],
      'cow_id': session['cow_id']?.toString() ?? '',
      'milker_id': session['milker_id']?.toString() ?? '',
      'volume': session['volume']?.toString() ?? '',
      'milking_time': session['milking_time'] ?? '',
      'notes': session['notes'] ?? '',
    };

    // Parse milking_time for date and time fields
    if (editSession['milking_time'].isNotEmpty) {
      try {
        final DateTime dateTime = DateTime.parse(editSession['milking_time']);
        _dateController.text = DateFormat('yyyy-MM-dd').format(dateTime);
        _timeController.text = DateFormat('HH:mm').format(dateTime);
      } catch (e) {
        // Fallback to current date/time if parsing fails
        final now = DateTime.now();
        _dateController.text = DateFormat('yyyy-MM-dd').format(now);
        _timeController.text = DateFormat('HH:mm').format(now);
        editSession['milking_time'] =
            '${_dateController.text}T${_timeController.text}';
      }
    }

    // Set text field values
    _volumeController.text = editSession['volume'];
    _notesController.text = editSession['notes'];

    // Load farmers for the selected cow if admin
    if (widget.currentUser?['role_id'] == 1 &&
        editSession['cow_id'].isNotEmpty) {
      _fetchFarmersForCow(editSession['cow_id']);
    }
  }

  Future<void> _fetchFarmersForCow(String cowId) async {
    print('DEBUG: _fetchFarmersForCow called with cowId: $cowId');

    if (widget.currentUser?['role_id'] != 1 || cowId.isEmpty) {
      print('DEBUG: Not admin or cowId empty, resetting farmers list');
      _farmersStreamController.add([]);
      _loadingStreamController.add(false);
      return;
    }

    print('DEBUG: Starting to fetch farmers for cow $cowId');
    _loadingStreamController.add(true);

    try {
      final result =
          await cattleDistributionController.getFarmersForCow(int.parse(cowId));

      print('DEBUG: API result: $result');
      print('DEBUG: Farmers data: ${result['farmers']}');

      if (result['success'] == true) {
        final farmers = result['farmers'] as List<dynamic>? ?? [];
        print('DEBUG: Setting ${farmers.length} farmers for cow $cowId');

        _farmersStreamController.add(farmers);
        _loadingStreamController.add(false);

        if (mounted) {
          setState(() {
            availableFarmersForCow = farmers;
            loadingFarmers = false;
          });
        }

        print('DEBUG: Streams updated - farmersCount: ${farmers.length}');
      } else {
        print('DEBUG: API returned error: ${result['message']}');
        _farmersStreamController.add([]);
        _loadingStreamController.add(false);
      }
    } catch (e) {
      print('DEBUG: Exception occurred: $e');
      _farmersStreamController.add([]);
      _loadingStreamController.add(false);
    }

    print('DEBUG: _fetchFarmersForCow completed for cowId: $cowId');
  }

  void _handleCowSelection(String cowId) {
    print('DEBUG: _handleCowSelection called with cowId: $cowId');

    setState(() {
      editSession['cow_id'] = cowId;
      // Reset milker_id when cow changes (for admin)
      if (widget.currentUser?['role_id'] == 1) {
        editSession['milker_id'] = '';
      }
    });

    _farmersStreamController.add([]);
    _loadingStreamController.add(false);

    if (widget.currentUser?['role_id'] == 1 &&
        cowId.isNotEmpty &&
        cowId != '') {
      print('DEBUG: Setting loadingFarmers to true for cowId: $cowId');
      _loadingStreamController.add(true);
      _fetchFarmersForCow(cowId);
    } else {
      print('DEBUG: Not fetching farmers - not admin or empty cowId');
    }
  }

  Future<void> _handleUpdateSession() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      isActionLoading = true;
    });

    final userId = widget.currentUser?['id']?.toString() ??
        widget.currentUser?['user_id']?.toString() ??
        '';
    String finalMilkerId = editSession['milker_id'];

    // Validation for milker_id
    if (widget.currentUser?['role_id'] == 1 && finalMilkerId.isEmpty) {
      setState(() {
        isActionLoading = false;
      });
      _showErrorDialog('Please select a milker');
      return;
    }

    if (widget.currentUser?['role_id'] != 1 && finalMilkerId.isEmpty) {
      finalMilkerId = userId;
    }

    if (finalMilkerId.isEmpty) {
      setState(() {
        isActionLoading = false;
      });
      _showErrorDialog('Invalid milker ID');
      return;
    }

    // === Tambahan validasi volume maksimal 30 liter ===
    final volumeValue = double.tryParse(editSession['volume']);
    if (volumeValue == null || volumeValue <= 0) {
      setState(() {
        isActionLoading = false;
      });
      _showErrorDialog('Please enter a valid milk volume');
      return;
    }
    if (volumeValue > 30) {
      setState(() {
        isActionLoading = false;
      });
      _showErrorDialog('Maximum allowed volume is 30 liters per session');
      return;
    }
    // === END Tambahan ===

    // Create updated session data
    final updaterInfo =
        'Updated by: ${widget.currentUser?['name'] ?? widget.currentUser?['username']} (Role: ${widget.currentUser?['role_id'] == 1 ? 'Admin' : widget.currentUser?['role_id'] == 2 ? 'Supervisor' : 'Farmer'}, ID: $userId)';

    // Preserve original notes and add update info
    String originalNotes = widget.session['notes'] ?? '';
    String newNotes = editSession['notes'];
    String finalNotes;

    if (originalNotes.isNotEmpty && !originalNotes.contains('Updated by:')) {
      finalNotes = '$newNotes\n\n$updaterInfo';
    } else if (originalNotes.contains('Updated by:')) {
      // Replace the last "Updated by:" section
      final parts = originalNotes.split('\n\nUpdated by:');
      if (parts.length > 1) {
        finalNotes = '${parts[0]}\n\n$updaterInfo';
      } else {
        finalNotes = '$newNotes\n\n$updaterInfo';
      }
    } else {
      finalNotes =
          newNotes.isNotEmpty ? '$newNotes\n\n$updaterInfo' : updaterInfo;
    }

    final sessionData = {
      'cow_id': int.parse(editSession['cow_id']),
      'milker_id': int.parse(finalMilkerId),
      'volume': volumeValue,
      'milking_time': editSession['milking_time'],
      'notes': finalNotes,
    };

    try {
      final response = await milkingSessionController.updateMilkingSession(
        editSession['id'],
        sessionData,
      );
      if (response['success'] == true) {
        Navigator.pop(context);
        _showSuccessDialog('Milking session successfully updated');
        widget.onSessionUpdated(); // Callback to refresh data
      } else {
        _showErrorDialog(
            response['message'] ?? 'Failed to update milking session');
      }
    } catch (e) {
      _showErrorDialog('There is an error: $e');
    } finally {
      setState(() {
        isActionLoading = false;
      });
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF23272F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.red[900]!.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              padding: EdgeInsets.all(8),
              child:
                  Icon(Icons.error_outline, color: Colors.red[300], size: 28),
            ),
            SizedBox(width: 10),
            Text(
              'Error Occurred',
              style: TextStyle(
                color: Colors.red[200],
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        content: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.info, color: Colors.red[200], size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  height: 1.5,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.close, color: Colors.blue[200]),
            label: Text('Close',
                style: TextStyle(
                    color: Colors.blue[200], fontWeight: FontWeight.bold)),
            style: TextButton.styleFrom(
              foregroundColor: Colors.blue[200],
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  void _showSuccessDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF23272F),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.green[900]!.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              padding: EdgeInsets.all(8),
              child: Icon(Icons.check_circle_outline,
                  color: Colors.greenAccent[200], size: 28),
            ),
            SizedBox(width: 10),
            Text(
              'Success!',
              style: TextStyle(
                color: Colors.greenAccent[200],
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 0.5,
              ),
            ),
          ],
        ),
        content: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(Icons.info_outline, color: Colors.greenAccent[100], size: 20),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 15,
                  height: 1.5,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: Icon(Icons.check, color: Colors.blue[200]),
            label: Text('OK',
                style: TextStyle(
                    color: Colors.blue[200], fontWeight: FontWeight.bold)),
            style: TextButton.styleFrom(
              foregroundColor: Colors.blue[200],
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  String _getVolumeCategory(String volumeStr) {
    final volume = double.tryParse(volumeStr) ?? 0.0;
    if (volume < 3) return '(Low Volume)';
    if (volume <= 10) return '(Normal Volume)';
    if (volume <= 20) return '(High Volume)';
    return '(Very High Volume)';
  }

  Widget _buildQuickTimeButton(
      String time, String label, IconData icon, Color color) {
    return OutlinedButton(
      onPressed: () {
        setState(() {
          _timeController.text = time;
          editSession['milking_time'] = '${_dateController.text}T$time';
        });
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          SizedBox(width: 4),
          Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                time,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
              ),
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: color,
                ),
              ),
            ],
          ),
        ],
      ),
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withOpacity(0.5)),
        padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }

  Widget _buildQuickNoteButton(String note, IconData icon, Color color) {
    return OutlinedButton(
      onPressed: () {
        setState(() {
          String currentNotes =
              _notesController.text.isEmpty ? '' : _notesController.text;
          String newNotes = currentNotes.isEmpty
              ? note
              : currentNotes.contains(note)
                  ? currentNotes
                  : '$currentNotes, $note';

          _notesController.text = newNotes;
          editSession['notes'] = newNotes;
        });
      },
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          SizedBox(width: 4),
          Text(
            note,
            style: TextStyle(
              fontSize: 10,
              color: color,
            ),
          ),
        ],
      ),
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color.withOpacity(0.5)),
        padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isCowSelected = editSession['cow_id'] != null &&
        editSession['cow_id'].toString().isNotEmpty &&
        editSession['cow_id'] != '';

    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          // Modal header
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.orange[700],
              borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: Row(
              children: [
                Icon(Icons.edit, color: Colors.white),
                SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Edit Milking Session',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Session ID: ${widget.session['id']}',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: Icon(Icons.close, color: Colors.white),
                ),
              ],
            ),
          ),

          // Modal body
          Expanded(
            child: Form(
              key: _formKey,
              child: ListView(
                padding: EdgeInsets.all(16),
                children: [
                  // Session info card
                  Container(
                    padding: EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue[50],
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.blue[200]!),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.info_outline,
                                color: Colors.blue[700], size: 16),
                            SizedBox(width: 8),
                            Text(
                              'Current Session Information',
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Colors.blue[800],
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Original Volume: ${widget.session['volume']} L\n'
                          'Original Date: ${DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(widget.session['milking_time']))}\n'
                          'Original Cow: ${_getCowName(widget.session['cow_id'].toString())} (ID: ${widget.session['cow_id']})',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.blue[700],
                          ),
                        ),
                      ],
                    ),
                  ),

                  SizedBox(height: 16),

                  // Cow selection
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Select Cow *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.pets),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    value: editSession['cow_id'].isEmpty ||
                            editSession['cow_id'] == ''
                        ? null
                        : editSession['cow_id'],
                    items: [
                      DropdownMenuItem(
                          value: '',
                          child: Text('-- Select Cow --',
                              style: TextStyle(color: Colors.grey[600]))),
                      ...(widget.currentUser?['role_id'] == 1
                              ? widget.cowList
                              : widget.userManagedCows)
                          .where((cow) {
                            if (cow is Map) {
                              return (cow['gender'] ?? '').toLowerCase() ==
                                  'female';
                            }
                            try {
                              return (cow.gender ?? '').toLowerCase() ==
                                  'female';
                            } catch (e) {
                              return false;
                            }
                          })
                          .map((cow) {
                            final cowName = cow is Map ? cow['name'] : cow.name;
                            final cowId = cow is Map ? cow['id'] : cow.id;

                            if (cowName == null ||
                                cowName.toString().trim().isEmpty) {
                              return null;
                            }

                            return DropdownMenuItem(
                              value: cowId.toString(),
                              child: Text('$cowName (ID: $cowId)'),
                            );
                          })
                          .where((item) => item != null)
                          .cast<DropdownMenuItem<String>>()
                    ],
                    validator: (value) {
                      if (value == null || value.isEmpty || value == '') {
                        return 'Please select the cow first';
                      }
                      return null;
                    },
                    onChanged: (value) => _handleCowSelection(value ?? ''),
                  ),
                  SizedBox(height: 16),

                  // Milker selection (for admin) or display (for non-admin)
                  if (widget.currentUser?['role_id'] == 1)
                    StreamBuilder<bool>(
                      stream: _loadingStream,
                      initialData: false,
                      builder: (context, loadingSnapshot) {
                        final isLoading = loadingSnapshot.data ?? false;

                        return StreamBuilder<List<dynamic>>(
                          stream: _farmersStream,
                          initialData: availableFarmersForCow,
                          builder: (context, farmersSnapshot) {
                            final farmers = farmersSnapshot.data ?? [];

                            return Column(
                              children: [
                                DropdownButtonFormField<String>(
                                  key: ValueKey(
                                      'edit_milker_dropdown_${editSession['cow_id']}_${farmers.length}_$isLoading'),
                                  decoration: InputDecoration(
                                    labelText: 'Select Milker *',
                                    border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(8)),
                                    prefixIcon: Icon(Icons.person),
                                    errorStyle: TextStyle(fontSize: 12),
                                    fillColor: isCowSelected
                                        ? Colors.white
                                        : Colors.grey[100],
                                    filled: true,
                                  ),
                                  value: isCowSelected &&
                                          editSession['milker_id'].isNotEmpty &&
                                          editSession['milker_id'] != '' &&
                                          farmers.any((farmer) =>
                                              (farmer['user_id'] ??
                                                      farmer['id'])
                                                  .toString() ==
                                              editSession['milker_id'])
                                      ? editSession['milker_id']
                                      : null,
                                  items: [
                                    DropdownMenuItem(
                                        value: '',
                                        child: Text(
                                            !isCowSelected
                                                ? '-- Select Cow First --'
                                                : isLoading
                                                    ? '-- Loading Milkers... --'
                                                    : farmers.isEmpty
                                                        ? '-- No Milkers Available --'
                                                        : '-- Select Milker --',
                                            style: TextStyle(
                                                color: Colors.grey[600]))),
                                    if (isCowSelected && !isLoading)
                                      ...farmers
                                          .map((farmer) {
                                            final farmerName =
                                                farmer['username'] ??
                                                    farmer['name'];
                                            final farmerId =
                                                farmer['user_id'] ??
                                                    farmer['id'];
                                            if (farmerName == null ||
                                                farmerName
                                                    .toString()
                                                    .trim()
                                                    .isEmpty) {
                                              return null;
                                            }
                                            return DropdownMenuItem(
                                              value: farmerId.toString(),
                                              child: Text(
                                                  '$farmerName (ID: $farmerId)'),
                                            );
                                          })
                                          .where((item) => item != null)
                                          .cast<DropdownMenuItem<String>>(),
                                  ],
                                  validator: (value) {
                                    if (!isCowSelected) {
                                      return 'Select cow first';
                                    }
                                    if (isLoading) {
                                      return 'Waiting for milker data to load...';
                                    }
                                    if (farmers.isEmpty) {
                                      return 'No milkers available for this cow';
                                    }
                                    if (value == null ||
                                        value.isEmpty ||
                                        value == '') {
                                      return 'Please select milker';
                                    }
                                    return null;
                                  },
                                  onChanged: (isCowSelected &&
                                          !isLoading &&
                                          farmers.isNotEmpty)
                                      ? (value) {
                                          setState(() {
                                            editSession['milker_id'] =
                                                value ?? '';
                                          });
                                        }
                                      : null,
                                ),

                                // Loading indicator
                                if (isCowSelected && isLoading) ...[
                                  SizedBox(height: 8),
                                  Container(
                                    padding: EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.blue[50],
                                      borderRadius: BorderRadius.circular(8),
                                      border:
                                          Border.all(color: Colors.blue[200]!),
                                    ),
                                    child: Row(
                                      children: [
                                        SizedBox(
                                          width: 16,
                                          height: 16,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor:
                                                AlwaysStoppedAnimation<Color>(
                                                    Colors.blue[600]!),
                                          ),
                                        ),
                                        SizedBox(width: 8),
                                        Text(
                                          'Loading milker data for selected cow...',
                                          style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.blue[800],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],

                                // No farmers warning
                                if (isCowSelected &&
                                    !isLoading &&
                                    farmers.isEmpty) ...[
                                  SizedBox(height: 8),
                                  Container(
                                    padding: EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: Colors.red[50],
                                      borderRadius: BorderRadius.circular(8),
                                      border:
                                          Border.all(color: Colors.red[200]!),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(Icons.warning,
                                            color: Colors.red[700], size: 20),
                                        SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            'No milkers available for this cow. Make sure the cow has been assigned to a milker.',
                                            style: TextStyle(
                                              fontSize: 12,
                                              color: Colors.red[800],
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            );
                          },
                        );
                      },
                    )
                  else
                    Container(
                      padding: EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey[300]!),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.person, color: Colors.grey[600]),
                          SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Milker',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                Text(
                                  '${widget.currentUser?['name'] ?? widget.currentUser?['username'] ?? 'Name not available'} (ID: ${widget.currentUser?['id'] ?? widget.currentUser?['user_id'] ?? 'ID not available'})',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.grey[800],
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                  SizedBox(height: 16),

                  // Volume input with quick buttons
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        controller: _volumeController,
                        decoration: InputDecoration(
                          labelText: 'Volume (Liter) *',
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8)),
                          prefixIcon: Icon(Icons.local_drink),
                          errorStyle: TextStyle(fontSize: 12),
                        ),
                        keyboardType:
                            TextInputType.numberWithOptions(decimal: true),
                        validator: (value) {
                          if (value?.isEmpty == true)
                            return 'Enter the volume of milk';
                          final volume = double.tryParse(value!);
                          if (volume == null || volume <= 0)
                            return 'Volume must be a positive number';
                          if (volume > 30)
                            return 'Volume too large (maximum 30L)';
                          return null;
                        },
                        onChanged: (value) => setState(() {
                          editSession['volume'] = value;
                        }),
                      ),
                      SizedBox(height: 8),

                      // Quick volume buttons
                      Text(
                        'Quick Volume:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: ['3.0', '5.0', '7.5', '10.0', '15.0', '20.0']
                            .map(
                              (volume) => OutlinedButton(
                                onPressed: () => setState(() {
                                  _volumeController.text = volume;
                                  editSession['volume'] = volume;
                                }),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.add, size: 12),
                                    SizedBox(width: 4),
                                    Text('$volume L'),
                                  ],
                                ),
                                style: OutlinedButton.styleFrom(
                                  foregroundColor: Colors.green[700],
                                  side: BorderSide(color: Colors.green[300]!),
                                  padding: EdgeInsets.symmetric(
                                      horizontal: 8, vertical: 4),
                                ),
                              ),
                            )
                            .toList(),
                      ),

                      // Volume info display
                      if (editSession['volume'].isNotEmpty)
                        Container(
                          margin: EdgeInsets.only(top: 8),
                          padding: EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.grey[50],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'Selected volume: ${double.tryParse(editSession['volume']) != null ? double.parse(editSession['volume']).toStringAsFixed(1) : '0.0'} Liter ${_getVolumeCategory(editSession['volume'])}',
                            style: TextStyle(
                              fontSize: 12,
                              color: Colors.grey[700],
                            ),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Date input

                  TextFormField(
                    controller: _dateController,
                    decoration: InputDecoration(
                      labelText: 'Milking Date *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.calendar_today),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    readOnly: true,
                    validator: (value) {
                      if (value?.isEmpty == true) return 'Select milking date';
                      // Validasi agar tidak bisa future
                      final selectedDate = DateTime.tryParse(value ?? '');
                      final now = DateTime.now();
                      if (selectedDate != null) {
                        final today = DateTime(now.year, now.month, now.day);
                        if (selectedDate.isAfter(today)) {
                          return 'Milking date cannot be in the future';
                        }
                      }
                      return null;
                    },
                    onTap: () async {
                      final now = DateTime.now();
                      final date = await showDatePicker(
                        context: context,
                        initialDate:
                            DateTime.tryParse(_dateController.text) ?? now,
                        firstDate: DateTime(2020),
                        lastDate: DateTime(now.year, now.month,
                            now.day), // hanya sampai hari ini
                      );
                      if (date != null) {
                        final dateString =
                            DateFormat('yyyy-MM-dd').format(date);
                        setState(() {
                          _dateController.text = dateString;
                          editSession['milking_time'] =
                              '${dateString}T${_timeController.text}';
                        });
                      }
                    },
                  ),

                  SizedBox(height: 16),

                  // Time input
                  TextFormField(
                    controller: _timeController,
                    decoration: InputDecoration(
                      labelText: 'Milking Time *',
                      border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8)),
                      prefixIcon: Icon(Icons.access_time),
                      errorStyle: TextStyle(fontSize: 12),
                    ),
                    readOnly: true,
                    validator: (value) {
                      if (value?.isEmpty == true) return 'Select milking time';
                      return null;
                    },
                    onTap: () async {
                      final currentTime = TimeOfDay.now();
                      final initialTime = _timeController.text.isNotEmpty
                          ? TimeOfDay(
                              hour:
                                  int.parse(_timeController.text.split(':')[0]),
                              minute:
                                  int.parse(_timeController.text.split(':')[1]),
                            )
                          : currentTime;

                      final time = await showTimePicker(
                        context: context,
                        initialTime: initialTime,
                      );
                      if (time != null) {
                        final timeString =
                            '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
                        setState(() {
                          _timeController.text = timeString;
                          editSession['milking_time'] =
                              '${_dateController.text}T$timeString';
                        });
                      }
                    },
                  ),
                  SizedBox(height: 16),

                  // Quick time buttons
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Quick Time:',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _buildQuickTimeButton('05:00', 'Morning',
                              Icons.wb_sunny, Colors.orange),
                          _buildQuickTimeButton('14:00', 'Afternoon',
                              Icons.wb_cloudy, Colors.blue),
                          _buildQuickTimeButton('18:00', 'Evening',
                              Icons.nights_stay, Colors.indigo),
                        ],
                      ),
                    ],
                  ),
                  SizedBox(height: 16),

                  // Notes section with quick notes
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Notes (Optional)',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[800],
                        ),
                      ),
                      SizedBox(height: 8),

                      // Quick notes buttons
                      Text(
                        'Quick Notes:',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: Colors.grey[600],
                        ),
                      ),
                      SizedBox(height: 8),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          _buildQuickNoteButton(
                              'Healthy Condition', Icons.favorite, Colors.red),
                          _buildQuickNoteButton('Normal Production',
                              Icons.check_circle, Colors.green),
                          _buildQuickNoteButton(
                              'Smooth Milking', Icons.schedule, Colors.blue),
                          _buildQuickNoteButton(
                              'Needs Attention', Icons.warning, Colors.orange),
                          _buildQuickNoteButton(
                              'Good Quality', Icons.thumb_up, Colors.purple),
                          _buildQuickNoteButton('Stressed Cow',
                              Icons.sentiment_dissatisfied, Colors.grey),
                          _buildQuickNoteButton('Production Decreased',
                              Icons.trending_down, Colors.red),
                          _buildQuickNoteButton(
                              'Equipment OK', Icons.build, Colors.green),
                        ],
                      ),

                      // Clear all notes button
                      if (editSession['notes'].isNotEmpty)
                        Container(
                          margin: EdgeInsets.only(top: 8),
                          child: OutlinedButton.icon(
                            onPressed: () => setState(() {
                              _notesController.clear();
                              editSession['notes'] = '';
                            }),
                            icon: Icon(Icons.clear, size: 16),
                            label: Text('Clear All Notes'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red[700],
                              side: BorderSide(color: Colors.red[300]!),
                              padding: EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 6),
                            ),
                          ),
                        ),

                      SizedBox(height: 12),

                      // Notes text field
                      TextFormField(
                        controller: _notesController,
                        decoration: InputDecoration(
                          labelText: 'Detailed Notes',
                          hintText:
                              'Update notes about this milking session or use the quick notes options above...',
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(8)),
                          prefixIcon: Icon(Icons.note),
                        ),
                        maxLines: 4,
                        maxLength: 500,
                        onChanged: (value) => setState(() {
                          editSession['notes'] = value;
                        }),
                      ),

                      // Character count
                      if (editSession['notes'].isNotEmpty)
                        Container(
                          margin: EdgeInsets.only(top: 4),
                          child: Text(
                            'Characters: ${editSession['notes'].length}/500',
                            style: TextStyle(
                              fontSize: 12,
                              color: editSession['notes'].length > 450
                                  ? Colors.red[600]
                                  : Colors.grey[600],
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Footer buttons
          Container(
            padding: EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed:
                        isActionLoading ? null : () => Navigator.pop(context),
                    child: isActionLoading
                        ? SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Text('Cancel'),
                    style: OutlinedButton.styleFrom(
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: isActionLoading ? null : _handleUpdateSession,
                    child: isActionLoading
                        ? SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : Text('Update'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange[700],
                      foregroundColor: Colors.white,
                      padding: EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
