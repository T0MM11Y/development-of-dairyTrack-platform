import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class MakeCowsView extends StatefulWidget {
  final Map<String, dynamic>? initialCowData;
  MakeCowsView({this.initialCowData});
  @override
  _MakeCowsViewState createState() => _MakeCowsViewState();
}

class _MakeCowsViewState extends State<MakeCowsView> {
  final _formKey = GlobalKey<FormState>();
  final CowManagementController _cowController = CowManagementController();

  String _name = '';
  DateTime? _birth;
  String _breed = 'Girolando';
  String _lactationPhase = '';
  double _weight = 0;
  String _gender = 'Female';
  bool _isLoading = false;
  String? _cowId;

  // State to track changes
  bool _hasChanges = false;

  // Weight validation error message
  String? _weightErrorMessage;

  @override
  void initState() {
    super.initState();
    if (widget.initialCowData != null) {
      _cowId = widget.initialCowData!['_id'];
      _name = widget.initialCowData!['name'];

      // Parsing the date with DateFormat
      if (widget.initialCowData!['birth'] != null &&
          widget.initialCowData!['birth'].isNotEmpty) {
        try {
          // Pastikan format string sesuai dengan yang diharapkan
          _birth = DateTime.parse(widget.initialCowData!['birth']);
        } catch (e) {
          print('Error parsing date: $e');
          _birth = null; // Set to null if parsing fails
        }
      } else {
        _birth = null;
      }

      _breed = widget.initialCowData!['breed'];
      _lactationPhase = widget.initialCowData!['lactation_phase'] ?? '';
      _weight = widget.initialCowData!['weight'].toDouble();
      _gender = widget.initialCowData!['gender'];
    }
  }

  String? _validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Cow name is required';
    } else if (value.trim().length > 30) {
      return 'Cow name cannot exceed 30 characters';
    } else if (!RegExp(r'^[a-zA-Z0-9\s-]+$').hasMatch(value.trim())) {
      return 'Cow name can only contain letters, numbers, spaces and hyphens';
    }
    return null;
  }

  String? _validateBirthDate(DateTime? value) {
    if (value == null) {
      return 'Birth date is required';
    }

    final birthDate = value;
    final currentDate = DateTime.now();

    if (birthDate.isAfter(currentDate)) {
      return 'Birth date cannot be in the future';
    }

    final ageInMilliseconds = currentDate.difference(birthDate).inMilliseconds;
    final ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);

    // Minimal 3 tahun, maksimal 15 tahun
    if (ageInYears < 3) {
      return "Cow must be at least 3 years old";
    }
    if (ageInYears > 15) {
      return "Cow cannot be older than 15 years";
    }

    if (_gender == "Female" &&
        _lactationPhase != "Dry" &&
        _lactationPhase != "" &&
        ageInYears < 3) {
      return "A female cow in lactation should be at least 3 years old";
    }

    return null;
  }

  String? _validateWeight(String? value) {
    if (value == null || value.isEmpty) {
      return 'Weight is required';
    }

    final weight = double.tryParse(value);

    if (weight == null) {
      return 'Please enter a valid number';
    }

    if (weight <= 0) {
      return 'Weight must be greater than 0 kg';
    }

    if (_gender == "Female" && weight > 700) {
      return 'For female cows, weight cannot exceed 700 kg';
    }

    if (_gender == "Male" && weight > 1200) {
      return 'For male cows, weight cannot exceed 1200 kg';
    }

    return null;
  }

  // Update weight error message for real-time feedback
  void _updateWeightErrorMessage(String value) {
    final errorMessage = _validateWeight(value);
    setState(() {
      _weightErrorMessage = errorMessage;
    });
  }

  String? _validateLactationPhase(String? value) {
    if (_gender == 'Female' && (value == null || value.isEmpty)) {
      return 'Lactation phase is required for female cows';
    }
    return null;
  }

  // Calculate if the weight is valid for showing the checkmark
  bool get _isWeightValid {
    if (_weight <= 0) return false;
    if (_gender == "Female" && _weight > 700) return false;
    if (_gender == "Male" && _weight > 1200) return false;
    return true;
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
          widget.initialCowData == null ? 'Add New Cow' : 'Edit Cow',
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.blueGrey[800],
        iconTheme: IconThemeData(color: Colors.white),
      ),
      backgroundColor: Colors.grey[200],
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Card(
          elevation: 5,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15.0),
          ),
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Name',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      prefixIcon: Icon(Icons.person),
                    ),
                    initialValue: _name,
                    validator: _validateName,
                    onSaved: (value) => _name = value!,
                    onChanged: (value) {
                      setState(() {
                        _name = value;
                        _hasChanges = true;
                      });
                    },
                  ),
                  SizedBox(height: 20),
                  GestureDetector(
                    onTap: () async {
                      DateTime? pickedDate = await showDatePicker(
                        context: context,
                        initialDate: _birth ??
                            DateTime.now().subtract(Duration(days: 365 * 3)),
                        firstDate: DateTime(1900),
                        lastDate: DateTime.now(),
                        builder: (context, child) {
                          return Theme(
                            data: Theme.of(context).copyWith(
                              colorScheme: ColorScheme.light(
                                primary: Colors.blueGrey[800]!,
                                onPrimary: Colors.white,
                                onSurface: Colors.blueGrey[900]!,
                              ),
                            ),
                            child: child!,
                          );
                        },
                      );
                      if (pickedDate != null) {
                        setState(() {
                          _birth = pickedDate;
                          _hasChanges = true;
                        });
                      }
                    },
                    child: InputDecorator(
                      decoration: InputDecoration(
                        labelText: 'Birth Date',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(10.0),
                        ),
                        hintText: _birth == null
                            ? 'Select Birth Date'
                            : DateFormat('yyyy-MM-dd').format(_birth!),
                        prefixIcon: Icon(Icons.calendar_today),
                        errorText:
                            _birth == null ? 'Birth date is required' : null,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Text(
                            _birth == null
                                ? 'Select Birth Date'
                                : DateFormat('yyyy-MM-dd').format(_birth!),
                            style: TextStyle(
                              color: _birth == null
                                  ? Colors.grey[600]
                                  : Colors.black87,
                            ),
                          ),
                          Icon(Icons.arrow_drop_down, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                  SizedBox(height: 20),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Breed',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      prefixIcon: Icon(Icons.grass),
                      filled: true,
                      fillColor: Colors.grey[100],
                    ),
                    initialValue: _breed,
                    readOnly: true,
                  ),
                  SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Gender',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      prefixIcon: Icon(Icons.wc),
                    ),
                    value: _gender,
                    items: ['Male', 'Female'].map((String value) {
                      return DropdownMenuItem<String>(
                        value: value,
                        child: Text(value),
                      );
                    }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _gender = value!;
                        _lactationPhase =
                            _gender == 'Male' ? '-' : _lactationPhase;

                        // Reset weight validation when gender changes
                        _updateWeightErrorMessage(_weight.toString());

                        _hasChanges = true;
                      });
                    },
                    validator: (value) =>
                        value == null ? 'Please select gender' : null,
                    onSaved: (value) => _gender = value!,
                  ),
                  SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Lactation Phase',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                      prefixIcon: Icon(Icons.local_drink),
                      helperText: _gender == 'Female'
                          ? 'Required for female cows'
                          : 'Not applicable for male cows',
                      helperStyle: TextStyle(fontSize: 12),
                    ),
                    value: _gender == 'Male'
                        ? (_lactationPhase == '-' ? '-' : null)
                        : (_lactationPhase.isNotEmpty ? _lactationPhase : null),
                    items: _gender == 'Male'
                        ? [
                            DropdownMenuItem<String>(
                              value: '-',
                              child: Text('-'),
                            ),
                          ]
                        : [
                            DropdownMenuItem<String>(
                              value: 'Dry',
                              child: Text('Dry'),
                            ),
                            DropdownMenuItem<String>(
                              value: 'Early',
                              child: Text('Early'),
                            ),
                            DropdownMenuItem<String>(
                              value: 'Mid',
                              child: Text('Mid'),
                            ),
                            DropdownMenuItem<String>(
                              value: 'Late',
                              child: Text('Late'),
                            ),
                          ],
                    onChanged: _gender == 'Male'
                        ? null
                        : (value) {
                            setState(() {
                              _lactationPhase = value!;
                              _hasChanges = true;
                            });
                          },
                    validator: _validateLactationPhase,
                    onSaved: (value) => _lactationPhase = value ?? '',
                  ),
                  SizedBox(height: 20),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextFormField(
                        decoration: InputDecoration(
                          labelText: 'Weight (kg)',
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(10.0),
                          ),
                          prefixIcon: Icon(Icons.fitness_center),
                          suffixIcon: _weight > 0
                              ? Icon(
                                  _isWeightValid
                                      ? Icons.check_circle
                                      : Icons.error,
                                  color: _isWeightValid
                                      ? Colors.green
                                      : Colors.red[300],
                                )
                              : null,
                          helperText: _gender == "Female"
                              ? "Maximum weight for female cows: 700 kg"
                              : "Maximum weight for male cows: 1200 kg",
                          helperStyle: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[600],
                          ),
                          errorStyle: TextStyle(
                            color: Colors.red[700],
                          ),
                        ),
                        keyboardType:
                            TextInputType.numberWithOptions(decimal: true),
                        initialValue: _weight.toString(),
                        validator: _validateWeight,
                        onSaved: (value) =>
                            _weight = double.tryParse(value ?? '0') ?? 0,
                        onChanged: (value) {
                          setState(() {
                            _weight = double.tryParse(value) ?? 0;
                            _updateWeightErrorMessage(value);
                            _hasChanges = true;
                          });
                        },
                      ),
                      if (_weightErrorMessage != null && _weight != 0)
                        Padding(
                          padding: const EdgeInsets.only(top: 8.0, left: 12.0),
                          child: Text(
                            _weightErrorMessage!,
                            style: TextStyle(
                              color: Colors.red[700],
                              fontSize: 12,
                            ),
                          ),
                        ),
                      // Weight slider for easier input
                      if (_weight > 0)
                        Padding(
                          padding: const EdgeInsets.only(
                              top: 10.0, left: 4.0, right: 4.0),
                          child: SliderTheme(
                            data: SliderThemeData(
                              thumbColor: Colors.blueGrey[800],
                              activeTrackColor: Colors.blueGrey[600],
                              inactiveTrackColor: Colors.grey[300],
                              overlayColor:
                                  Colors.blueGrey[800]?.withOpacity(0.2),
                            ),
                            child: Slider(
                              min: 0,
                              max: _gender == 'Female' ? 700 : 1200,
                              value: _weight.clamp(
                                  0, _gender == 'Female' ? 700 : 1200),
                              divisions: _gender == 'Female' ? 70 : 120,
                              label: '${_weight.toStringAsFixed(1)} kg',
                              onChanged: (value) {
                                setState(() {
                                  _weight =
                                      double.parse(value.toStringAsFixed(1));
                                  _updateWeightErrorMessage(_weight.toString());
                                  _hasChanges = true;
                                });
                              },
                            ),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 30),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueGrey[800],
                      padding: EdgeInsets.symmetric(vertical: 15),
                      textStyle: TextStyle(fontSize: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                      disabledBackgroundColor: Colors.grey[400],
                    ),
                    onPressed: (_isLoading ||
                            !_hasChanges ||
                            _weightErrorMessage != null)
                        ? null
                        : () async {
                            // Show confirmation dialog
                            bool? confirm = await showDialog<bool>(
                              context: context,
                              builder: (BuildContext context) {
                                return AlertDialog(
                                  backgroundColor: Colors.grey[900],
                                  title: Text(
                                    'Confirm',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                  content: Text(
                                    widget.initialCowData == null
                                        ? 'Are you sure you want to add this cow?'
                                        : 'Are you sure you want to update this cow?',
                                    style: TextStyle(color: Colors.white70),
                                  ),
                                  actions: <Widget>[
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.of(context).pop(false),
                                      child: Text(
                                        'Cancel',
                                        style: TextStyle(color: Colors.grey),
                                      ),
                                    ),
                                    TextButton(
                                      onPressed: () =>
                                          Navigator.of(context).pop(true),
                                      child: Text(
                                        'Confirm',
                                        style: TextStyle(color: Colors.amber),
                                      ),
                                    ),
                                  ],
                                );
                              },
                            );

                            // If user confirms
                            if (confirm == true) {
                              if (_formKey.currentState!.validate()) {
                                _formKey.currentState!.save();

                                String? nameError = _validateName(_name);
                                String? birthError = _validateBirthDate(_birth);
                                String? weightError =
                                    _validateWeight(_weight.toString());
                                String? lactationPhaseError =
                                    _validateLactationPhase(_lactationPhase);

                                if (nameError != null ||
                                    birthError != null ||
                                    weightError != null ||
                                    lactationPhaseError != null) {
                                  String errorMessage = nameError ??
                                      birthError ??
                                      weightError ??
                                      lactationPhaseError!;

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(errorMessage),
                                      backgroundColor: Colors.amber,
                                    ),
                                  );
                                  return;
                                }

                                setState(() {
                                  _isLoading = true;
                                });

                                try {
                                  final birthDateFormatted =
                                      DateFormat('yyyy-MM-dd').format(_birth!);
                                  final cowData = {
                                    'name': _name,
                                    'birth': birthDateFormatted,
                                    'breed': _breed,
                                    'lactation_phase': _lactationPhase,
                                    'weight': _weight,
                                    'gender': _gender,
                                  };

                                  Map<String, dynamic> response;
                                  if (widget.initialCowData == null) {
                                    // Adding a new cow
                                    response =
                                        await _cowController.addCow(cowData);
                                  } else {
                                    // Editing an existing cow
                                    response = await _cowController.updateCow(
                                        int.parse(_cowId!), cowData);
                                  }

                                  if (response['success']) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          widget.initialCowData == null
                                              ? 'Cow added successfully!'
                                              : 'Cow updated successfully!',
                                        ),
                                        backgroundColor: Colors.green,
                                      ),
                                    );
                                    Navigator.pop(
                                      context,
                                      true,
                                    ); // Navigate back to the list
                                  } else {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          response['message'] ??
                                              'Failed to save cow.',
                                        ),
                                        backgroundColor: Colors.red,
                                      ),
                                    );
                                  }
                                } catch (error) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('Error: $error'),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                } finally {
                                  setState(() {
                                    _isLoading = false;
                                    _hasChanges = false; // Reset after save
                                  });
                                }
                              }
                            }
                          },
                    child: _isLoading
                        ? Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(
                                valueColor: AlwaysStoppedAnimation<Color>(
                                  Colors.white,
                                ),
                              ),
                              SizedBox(width: 10),
                              Text(
                                'Saving...',
                                style: TextStyle(color: Colors.white),
                              ),
                            ],
                          )
                        : Text(
                            widget.initialCowData == null
                                ? 'Save Cow'
                                : 'Update Cow',
                            style: TextStyle(color: Colors.white),
                          ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
