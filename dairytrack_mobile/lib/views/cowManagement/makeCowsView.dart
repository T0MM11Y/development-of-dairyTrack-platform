import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class MakeCowsView extends StatefulWidget {
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text('Add New Cow', style: TextStyle(color: Colors.white)),
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
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the cow\'s name';
                      }
                      return null;
                    },
                    onSaved: (value) => _name = value!,
                  ),
                  SizedBox(height: 20),
                  GestureDetector(
                    onTap: () async {
                      DateTime? pickedDate = await showDatePicker(
                        context: context,
                        initialDate: DateTime.now(),
                        firstDate: DateTime(1900),
                        lastDate: DateTime.now(),
                      );
                      if (pickedDate != null) {
                        setState(() {
                          _birth = pickedDate;
                        });
                      }
                    },
                    child: InputDecorator(
                      decoration: InputDecoration(
                        labelText: 'Birth Date',
                        border: OutlineInputBorder(),
                        hintText:
                            _birth == null
                                ? 'Select Birth Date'
                                : DateFormat('yyyy-MM-dd').format(_birth!),
                        prefixIcon: Icon(Icons.calendar_today),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: <Widget>[
                          Text(
                            _birth == null
                                ? 'Select Birth Date'
                                : DateFormat('yyyy-MM-dd').format(_birth!),
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
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.grass),
                    ),
                    initialValue: _breed,
                    readOnly: true,
                  ),
                  SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Gender',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.wc),
                    ),
                    value: _gender,
                    items:
                        ['Male', 'Female'].map((String value) {
                          return DropdownMenuItem<String>(
                            value: value,
                            child: Text(value),
                          );
                        }).toList(),
                    onChanged: (value) {
                      setState(() {
                        _gender = value!;
                        if (_gender == 'Male') {
                          _lactationPhase = '-';
                        }
                      });
                    },
                    validator:
                        (value) =>
                            value == null ? 'Please select gender' : null,
                    onSaved: (value) => _gender = value!,
                  ),
                  SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Lactation Phase',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.local_drink),
                    ),
                    value:
                        _gender == 'Male'
                            ? (_lactationPhase == '-' ? '-' : null)
                            : (_lactationPhase.isNotEmpty
                                ? _lactationPhase
                                : null),
                    items:
                        _gender == 'Male'
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
                    onChanged:
                        _gender == 'Male'
                            ? null
                            : (value) {
                              setState(() {
                                _lactationPhase = value!;
                              });
                            },
                    validator: (value) {
                      if (_gender == 'Female' &&
                          (value == null || value.isEmpty)) {
                        return 'Please select lactation phase';
                      }
                      return null;
                    },
                    onSaved: (value) => _lactationPhase = value ?? '',
                  ),
                  SizedBox(height: 20),
                  TextFormField(
                    decoration: InputDecoration(
                      labelText: 'Weight (kg)',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.fitness_center),
                    ),
                    keyboardType: TextInputType.number,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the cow\'s weight';
                      }
                      if (double.tryParse(value) == null) {
                        return 'Please enter a valid number';
                      }
                      return null;
                    },
                    onSaved: (value) => _weight = double.parse(value!),
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
                    ),
                    onPressed:
                        _isLoading
                            ? null
                            : () async {
                              if (_formKey.currentState!.validate()) {
                                _formKey.currentState!.save();

                                // Weight validation
                                if (_gender == "Female" &&
                                    (_weight < 450 || _weight > 650)) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        "For female cows, weight must be between 450 kg and 650 kg.",
                                      ),
                                      backgroundColor: Colors.amber,
                                    ),
                                  );
                                  return;
                                }

                                if (_gender == "Male" &&
                                    (_weight < 700 || _weight > 900)) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        "For male cows, weight must be between 700 kg and 900 kg.",
                                      ),
                                      backgroundColor: Colors.amber,
                                    ),
                                  );
                                  return;
                                }

                                // Birth date validation
                                if (_birth == null) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        "Please select a birth date.",
                                      ),
                                      backgroundColor: Colors.amber,
                                    ),
                                  );
                                  return;
                                }

                                final currentDate = DateTime.now();

                                // Check if birth date is in the future
                                if (_birth!.isAfter(currentDate)) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        "Birth date cannot be in the future.",
                                      ),
                                      backgroundColor: Colors.amber,
                                    ),
                                  );
                                  return;
                                }

                                // Calculate age in years
                                final ageInMilliseconds =
                                    currentDate
                                        .difference(_birth!)
                                        .inMilliseconds;
                                final ageInYears =
                                    ageInMilliseconds /
                                    (1000 * 60 * 60 * 24 * 365.25);

                                // Check if age is reasonable (between 0 and 20 years)
                                if (ageInYears > 20) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        "The cow's age exceeds 20 years, which is unusual for cattle. Please verify the birth date.",
                                      ),
                                      backgroundColor: Colors.amber,
                                    ),
                                  );
                                  return;
                                }

                                // For a female cow in lactation, ensure minimum age of 2 years (typical age for first calving)
                                if (_gender == "Female" &&
                                    _lactationPhase != "Dry" &&
                                    _lactationPhase != "" &&
                                    ageInYears < 2) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        "A female cow in lactation should be at least 2 years old. Please adjust the birth date or lactation phase.",
                                      ),
                                      backgroundColor: Colors.amber,
                                    ),
                                  );
                                  return;
                                }

                                setState(() {
                                  _isLoading = true;
                                });

                                try {
                                  final birthDateFormatted = DateFormat(
                                    'yyyy-MM-dd',
                                  ).format(_birth!);
                                  final cowData = {
                                    'name': _name,
                                    'birth': birthDateFormatted,
                                    'breed': _breed,
                                    'lactation_phase': _lactationPhase,
                                    'weight': _weight,
                                    'gender': _gender,
                                  };
                                  final response = await _cowController.addCow(
                                    cowData,
                                  );

                                  if (response['success']) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text(
                                          'Cow added successfully!',
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
                                              'Failed to add cow.',
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
                                  });
                                }
                              }
                            },
                    child:
                        _isLoading
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
                              'Save Cow',
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
