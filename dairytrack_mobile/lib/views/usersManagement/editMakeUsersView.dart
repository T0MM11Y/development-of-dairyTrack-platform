import 'package:dairytrack_mobile/controller/APIURL1/usersManagementController.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class editMakeUsersView extends StatefulWidget {
  final User? user;

  editMakeUsersView({this.user});

  @override
  _editMakeUsersViewState createState() => _editMakeUsersViewState();
}

class _editMakeUsersViewState extends State<editMakeUsersView> {
  final _formKey = GlobalKey<FormState>();
  final UsersManagementController _userController = UsersManagementController();

  String _name = '';
  String _username = '';
  String _email = '';
  String _contact = '';
  String _religion = '';
  int _roleId = 2; // Default to Farmer role
  DateTime? _birth;
  bool _isLoading = false;
  String _password = '';
  bool _obscurePassword = true;

  // Original values to compare changes
  String _originalName = '';
  String _originalUsername = '';
  String _originalEmail = '';
  String _originalContact = '';
  String _originalReligion = '';
  int _originalRoleId = 2;
  DateTime? _originalBirth;

  // Live validation states
  Map<String, String?> _errors = {};
  Map<String, bool> _isValid = {};

  @override
  void initState() {
    super.initState();
    if (widget.user != null) {
      _name = widget.user!.name;
      _username = widget.user!.username;
      _email = widget.user!.email;
      _contact = widget.user!.contact;
      _religion = widget.user!.religion;
      _roleId = widget.user!.roleId;

      // Store original values
      _originalName = widget.user!.name;
      _originalUsername = widget.user!.username;
      _originalEmail = widget.user!.email;
      _originalContact = widget.user!.contact;
      _originalReligion = widget.user!.religion;
      _originalRoleId = widget.user!.roleId;

      if (widget.user!.birth != null) {
        try {
          _birth = DateFormat('yyyy-MM-dd').parse(widget.user!.birth!);
          _originalBirth = _birth;
        } catch (e) {
          try {
            _birth = DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'")
                .parse(widget.user!.birth!);
            _originalBirth = _birth;
          } catch (e) {
            _birth = null;
            _originalBirth = null;
          }
        }
      }
    }
  }

  // Live validation functions
  Map<String, dynamic> _validateName(String name) {
    if (name.trim().isEmpty) {
      return {'isValid': false, 'message': 'Full name is required'};
    }
    if (name.trim().length < 2) {
      return {
        'isValid': false,
        'message': 'Name must be at least 2 characters'
      };
    }
    if (!RegExp(r'^[a-zA-Z\s]+$').hasMatch(name)) {
      return {
        'isValid': false,
        'message': 'Name can only contain letters and spaces'
      };
    }
    return {'isValid': true, 'message': null};
  }

  Map<String, dynamic> _validateUsername(String username) {
    if (username.isEmpty) {
      return {'isValid': false, 'message': 'Username is required'};
    }
    if (!RegExp(r'^[a-zA-Z0-9._-]{3,20}$').hasMatch(username)) {
      return {
        'isValid': false,
        'message':
            'Username must be 3-20 characters and can only contain letters, numbers, dots, underscores, and hyphens'
      };
    }
    return {'isValid': true, 'message': null};
  }

  Map<String, dynamic> _validateEmail(String email) {
    final cleanEmail = email.toLowerCase().trim();

    if (email.isEmpty) {
      return {'isValid': false, 'message': 'Email is required'};
    }

    if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
        .hasMatch(cleanEmail)) {
      return {
        'isValid': false,
        'message': 'Please enter a valid email address'
      };
    }

    if (cleanEmail.contains('..') ||
        cleanEmail.startsWith('.') ||
        cleanEmail.endsWith('.')) {
      return {
        'isValid': false,
        'message':
            'Email cannot contain consecutive dots or start/end with dots'
      };
    }

    // Tambahan validasi untuk @gmail.co
    if (RegExp(r'@gmail\.co(\W|$)', caseSensitive: false)
        .hasMatch(cleanEmail)) {
      return {
        'isValid': false,
        'message': 'Email domain @gmail.co is not valid. Use @gmail.com'
      };
    }

    if (!RegExp(r'\.(com|org|net|edu|gov|mil|int|co|id|ac|sch)(\.[a-z]{2})?$',
            caseSensitive: false)
        .hasMatch(cleanEmail)) {
      return {
        'isValid': false,
        'message':
            'Please use a valid email domain (e.g., .com, .org, .net, .id, .co.id)'
      };
    }

    if (cleanEmail.split('@')[0].length < 3) {
      return {
        'isValid': false,
        'message': 'Email username part must be at least 3 characters'
      };
    }

    if (RegExp(r'test|fake|dummy|sample|example|temp', caseSensitive: false)
        .hasMatch(cleanEmail)) {
      return {
        'isValid': false,
        'message': 'Please use a real email address, not a test/dummy email'
      };
    }

    return {'isValid': true, 'message': null};
  }

  Map<String, dynamic> _validateContact(String contact) {
    if (contact.isEmpty) {
      return {'isValid': false, 'message': 'Phone number is required'};
    }
    if (!RegExp(r'^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$')
        .hasMatch(contact)) {
      return {'isValid': false, 'message': 'Please enter a valid phone number'};
    }
    return {'isValid': true, 'message': null};
  }

  Map<String, dynamic> _validateReligion(String religion) {
    if (religion.isEmpty) {
      return {'isValid': false, 'message': 'Religion is required'};
    }
    return {'isValid': true, 'message': null};
  }

  Map<String, dynamic> _validatePassword(String password) {
    if (password.isEmpty) {
      return {'isValid': false, 'message': 'Password is required'};
    }
    if (password.length < 8) {
      return {
        'isValid': false,
        'message': 'Password must be at least 8 characters'
      };
    }
    if (!RegExp(r'(?=.*[a-z])').hasMatch(password)) {
      return {
        'isValid': false,
        'message': 'Password must contain at least one lowercase letter'
      };
    }
    if (!RegExp(r'(?=.*[A-Z])').hasMatch(password)) {
      return {
        'isValid': false,
        'message': 'Password must contain at least one uppercase letter'
      };
    }
    if (!RegExp(r'(?=.*\d)').hasMatch(password)) {
      return {
        'isValid': false,
        'message': 'Password must contain at least one number'
      };
    }
    return {'isValid': true, 'message': null};
  }

  Map<String, dynamic> _validateBirthDate(DateTime? birth) {
    if (birth == null) {
      return {'isValid': false, 'message': 'Birth date is required'};
    }

    final today = DateTime.now();
    final sixtyYearsAgo = DateTime(today.year - 60, today.month, today.day);
    final fifteenYearsAgo = DateTime(today.year - 15, today.month, today.day);

    if (birth.isAfter(today)) {
      return {
        'isValid': false,
        'message': 'Birthdate cannot be today or in the future'
      };
    }
    if (birth.isAfter(fifteenYearsAgo)) {
      return {
        'isValid': false,
        'message': 'User must be at least 15 years old'
      };
    }
    if (birth.isBefore(sixtyYearsAgo)) {
      return {
        'isValid': false,
        'message': 'Birthdate cannot be more than 60 years ago'
      };
    }

    return {'isValid': true, 'message': null};
  }

  void _validateField(String fieldName, dynamic value) {
    Map<String, dynamic> validation;

    switch (fieldName) {
      case 'name':
        validation = _validateName(value);
        break;
      case 'username':
        validation = _validateUsername(value);
        break;
      case 'email':
        validation = _validateEmail(value);
        break;
      case 'contact':
        validation = _validateContact(value);
        break;
      case 'religion':
        validation = _validateReligion(value);
        break;
      case 'password':
        validation = _validatePassword(value);
        break;
      case 'birth':
        validation = _validateBirthDate(value);
        break;
      default:
        validation = {'isValid': true, 'message': null};
    }

    setState(() {
      _errors[fieldName] = validation['message'];
      _isValid[fieldName] = validation['isValid'];
    });
  }

  bool _hasChanges() {
    if (widget.user == null) {
      return _name.isNotEmpty ||
          _username.isNotEmpty ||
          _email.isNotEmpty ||
          _contact.isNotEmpty ||
          _religion.isNotEmpty ||
          _password.isNotEmpty ||
          _birth != null;
    }

    return _name != _originalName ||
        _username != _originalUsername ||
        _email != _originalEmail ||
        _contact != _originalContact ||
        _religion != _originalReligion ||
        _roleId != _originalRoleId ||
        _birth != _originalBirth;
  }

  Widget _buildTextFormField({
    required String initialValue,
    required String labelText,
    required IconData prefixIcon,
    required String hintText,
    required Function(String) onChanged,
    required String fieldName,
    TextInputType keyboardType = TextInputType.text,
    bool obscureText = false,
    Widget? suffixIcon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          initialValue: initialValue,
          decoration: InputDecoration(
            labelText: labelText,
            border: OutlineInputBorder(
              borderSide: BorderSide(
                color: _errors[fieldName] != null
                    ? Colors.red
                    : _isValid[fieldName] == true
                        ? Colors.green
                        : Colors.grey,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderSide: BorderSide(
                color: _errors[fieldName] != null
                    ? Colors.red
                    : _isValid[fieldName] == true
                        ? Colors.green
                        : Colors.grey,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(
                color: _errors[fieldName] != null
                    ? Colors.red
                    : _isValid[fieldName] == true
                        ? Colors.green
                        : Colors.blue,
              ),
            ),
            prefixIcon: Icon(
              prefixIcon,
              color: _errors[fieldName] != null
                  ? Colors.red
                  : _isValid[fieldName] == true
                      ? Colors.green
                      : Colors.grey,
            ),
            suffixIcon: suffixIcon,
            hintText: hintText,
          ),
          keyboardType: keyboardType,
          obscureText: obscureText,
          onChanged: (value) {
            onChanged(value);
            _validateField(fieldName, value);
          },
        ),
        if (_errors[fieldName] != null)
          Padding(
            padding: const EdgeInsets.only(top: 5, left: 12),
            child: Text(
              _errors[fieldName]!,
              style: TextStyle(color: Colors.red, fontSize: 12),
            ),
          ),
        if (_isValid[fieldName] == true && _errors[fieldName] == null)
          Padding(
            padding: const EdgeInsets.only(top: 5, left: 12),
            child: Text(
              '$labelText looks good!',
              style: TextStyle(color: Colors.green, fontSize: 12),
            ),
          ),
      ],
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
          widget.user == null ? 'Add New User' : 'Edit User',
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
                  _buildTextFormField(
                    initialValue: _name,
                    labelText: 'Name',
                    prefixIcon: Icons.person,
                    hintText: 'Enter the full name',
                    fieldName: 'name',
                    onChanged: (value) => _name = value,
                  ),
                  SizedBox(height: 20),
                  _buildTextFormField(
                    initialValue: _username,
                    labelText: 'Username',
                    prefixIcon: Icons.account_circle,
                    hintText: 'Choose a unique username',
                    fieldName: 'username',
                    onChanged: (value) => _username = value,
                  ),
                  SizedBox(height: 20),
                  _buildTextFormField(
                    initialValue: _email,
                    labelText: 'Email',
                    prefixIcon: Icons.email,
                    hintText: 'Enter a valid email address',
                    fieldName: 'email',
                    keyboardType: TextInputType.emailAddress,
                    onChanged: (value) => _email = value,
                  ),
                  SizedBox(height: 20),
                  _buildTextFormField(
                    initialValue: _contact,
                    labelText: 'Contact',
                    prefixIcon: Icons.phone,
                    hintText: 'Enter a valid contact number',
                    fieldName: 'contact',
                    keyboardType: TextInputType.phone,
                    onChanged: (value) => _contact = value,
                  ),
                  SizedBox(height: 20),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      DropdownButtonFormField<String>(
                        decoration: InputDecoration(
                          labelText: 'Religion',
                          border: OutlineInputBorder(
                            borderSide: BorderSide(
                              color: _errors['religion'] != null
                                  ? Colors.red
                                  : _isValid['religion'] == true
                                      ? Colors.green
                                      : Colors.grey,
                            ),
                          ),
                          prefixIcon: Icon(
                            Icons.church,
                            color: _errors['religion'] != null
                                ? Colors.red
                                : _isValid['religion'] == true
                                    ? Colors.green
                                    : Colors.grey,
                          ),
                        ),
                        value: _religion.isNotEmpty ? _religion : null,
                        items: [
                          DropdownMenuItem(
                              child: Text('Select Religion'), value: ''),
                          DropdownMenuItem(
                              child: Text('Islam'), value: 'Islam'),
                          DropdownMenuItem(
                              child: Text('Christianity'),
                              value: 'Christianity'),
                          DropdownMenuItem(
                              child: Text('Catholicism'), value: 'Catholicism'),
                          DropdownMenuItem(
                              child: Text('Hinduism'), value: 'Hinduism'),
                          DropdownMenuItem(
                              child: Text('Buddhism'), value: 'Buddhism'),
                        ],
                        onChanged: (value) {
                          _religion = value!;
                          _validateField('religion', value);
                        },
                      ),
                      if (_errors['religion'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 5, left: 12),
                          child: Text(
                            _errors['religion']!,
                            style: TextStyle(color: Colors.red, fontSize: 12),
                          ),
                        ),
                      if (_isValid['religion'] == true &&
                          _errors['religion'] == null)
                        Padding(
                          padding: const EdgeInsets.only(top: 5, left: 12),
                          child: Text(
                            'Religion selected!',
                            style: TextStyle(color: Colors.green, fontSize: 12),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 20),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      GestureDetector(
                        onTap: () async {
                          DateTime? pickedDate = await showDatePicker(
                            context: context,
                            initialDate: _birth ?? DateTime.now(),
                            firstDate: DateTime(DateTime.now().year - 60,
                                DateTime.now().month, DateTime.now().day),
                            lastDate: DateTime(DateTime.now().year - 15,
                                DateTime.now().month, DateTime.now().day),
                          );
                          if (pickedDate != null) {
                            _birth = pickedDate;
                            _validateField('birth', pickedDate);
                          }
                        },
                        child: InputDecorator(
                          decoration: InputDecoration(
                            labelText: 'Birth Date',
                            border: OutlineInputBorder(
                              borderSide: BorderSide(
                                color: _errors['birth'] != null
                                    ? Colors.red
                                    : _isValid['birth'] == true
                                        ? Colors.green
                                        : Colors.grey,
                              ),
                            ),
                            hintText: _birth == null
                                ? 'Select Birth Date'
                                : DateFormat('yyyy-MM-dd').format(_birth!),
                            prefixIcon: Icon(
                              Icons.calendar_today,
                              color: _errors['birth'] != null
                                  ? Colors.red
                                  : _isValid['birth'] == true
                                      ? Colors.green
                                      : Colors.grey,
                            ),
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
                      if (_errors['birth'] != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 5, left: 12),
                          child: Text(
                            _errors['birth']!,
                            style: TextStyle(color: Colors.red, fontSize: 12),
                          ),
                        ),
                      if (_isValid['birth'] == true && _errors['birth'] == null)
                        Padding(
                          padding: const EdgeInsets.only(top: 5, left: 12),
                          child: Text(
                            'Birth date is valid!',
                            style: TextStyle(color: Colors.green, fontSize: 12),
                          ),
                        ),
                    ],
                  ),
                  SizedBox(height: 20),
                  DropdownButtonFormField<int>(
                    decoration: InputDecoration(
                      labelText: 'Role',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.assignment_ind),
                    ),
                    value: _roleId,
                    items: [
                      DropdownMenuItem(child: Text('Admin'), value: 1),
                      DropdownMenuItem(child: Text('Supervisor'), value: 2),
                      DropdownMenuItem(child: Text('Farmer'), value: 3),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _roleId = value!;
                      });
                    },
                  ),
                  SizedBox(height: 20),
                  if (widget.user == null)
                    _buildTextFormField(
                      initialValue: _password,
                      labelText: 'Password',
                      prefixIcon: Icons.lock,
                      hintText: 'Enter a password',
                      fieldName: 'password',
                      obscureText: _obscurePassword,
                      onChanged: (value) => _password = value,
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility
                              : Icons.visibility_off,
                        ),
                        onPressed: () {
                          setState(() {
                            _obscurePassword = !_obscurePassword;
                          });
                        },
                      ),
                    ),
                  if (widget.user == null) SizedBox(height: 20),
                  SizedBox(height: 30),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _hasChanges() && !_isLoading
                          ? Colors.blueGrey[800]
                          : Colors.grey[400],
                      padding: EdgeInsets.symmetric(vertical: 15),
                      textStyle: TextStyle(fontSize: 18),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    onPressed:
                        (_isLoading || !_hasChanges()) ? null : _submitForm,
                    child: _isLoading
                        ? Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                              SizedBox(width: 10),
                              Text('Saving...',
                                  style: TextStyle(color: Colors.white)),
                            ],
                          )
                        : Text(
                            widget.user == null ? 'Save User' : 'Update User',
                            style: TextStyle(
                              color: _hasChanges()
                                  ? Colors.white
                                  : Colors.grey[600],
                            ),
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

  Future<void> _submitForm() async {
    // Final validation
    _validateField('name', _name);
    _validateField('username', _username);
    _validateField('email', _email);
    _validateField('contact', _contact);
    _validateField('religion', _religion);
    _validateField('birth', _birth);

    if (widget.user == null) {
      _validateField('password', _password);
    }

    bool hasErrors = _errors.values.any((error) => error != null);

    if (hasErrors) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please fix all validation errors before submitting'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title:
            const Text("Confirm Save", style: TextStyle(color: Colors.white)),
        content: Text(
          widget.user == null
              ? "Are you sure you want to save this new user?"
              : "Are you sure you want to update this user's information?",
          style: const TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child:
                const Text("Cancel", style: TextStyle(color: Colors.redAccent)),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text("Confirm", style: TextStyle(color: Colors.amber)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final birthDateFormatted =
          _birth != null ? DateFormat('yyyy-MM-dd').format(_birth!) : null;

      final userData = {
        'name': _name,
        'username': _username,
        'email': _email.toLowerCase(),
        'contact': _contact,
        'religion': _religion,
        'role_id': _roleId,
        'birth': birthDateFormatted,
        if (widget.user == null) 'password': _password,
      };

      Map<String, dynamic> response;
      if (widget.user == null) {
        response = await _userController.addUser(userData);
      } else {
        response = await _userController.updateUser(widget.user!.id, userData);
      }

      if (response['success']) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.user == null
                  ? 'User added successfully!'
                  : 'User updated successfully!',
            ),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              response['message'] ??
                  (widget.user == null
                      ? 'Failed to add user.'
                      : 'Failed to update user.'),
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
}
