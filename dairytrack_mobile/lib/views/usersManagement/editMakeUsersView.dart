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
  String _password = ''; // Added password field
  bool _obscurePassword = true; // Track password visibility

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
      if (widget.user!.birth != null) {
        try {
          _birth = DateFormat('yyyy-MM-dd').parse(widget.user!.birth!);
        } catch (e) {
          try {
            _birth = DateFormat(
              "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
            ).parse(widget.user!.birth!);
          } catch (e) {
            _birth = null;
          }
        }
      }
    }
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
                  TextFormField(
                    initialValue: _name,
                    decoration: InputDecoration(
                      labelText: 'Name',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.person),
                      hintText: 'Enter the user\'s full name',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter the user\'s name';
                      }
                      if (value.length < 3) {
                        return 'Name must be at least 3 characters';
                      }
                      return null;
                    },
                    onSaved: (value) => _name = value!,
                  ),
                  SizedBox(height: 20),
                  TextFormField(
                    initialValue: _username,
                    decoration: InputDecoration(
                      labelText: 'Username',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.account_circle),
                      hintText: 'Choose a unique username',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a username';
                      }
                      if (value.length < 5) {
                        return 'Username must be at least 5 characters';
                      }
                      if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(value)) {
                        return 'Username can only contain letters, numbers, and underscores';
                      }
                      return null;
                    },
                    onSaved: (value) => _username = value!,
                  ),
                  SizedBox(height: 20),
                  TextFormField(
                    initialValue: _email,
                    decoration: InputDecoration(
                      labelText: 'Email',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.email),
                      hintText: 'Enter a valid email address',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter an email';
                      }
                      if (!value.contains('@')) {
                        return 'Please enter a valid email';
                      }
                      if (!RegExp(
                        r"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$",
                      ).hasMatch(value)) {
                        return 'Please enter a valid email format';
                      }
                      return null;
                    },
                    onSaved: (value) => _email = value!,
                  ),
                  SizedBox(height: 20),
                  TextFormField(
                    initialValue: _contact,
                    decoration: InputDecoration(
                      labelText: 'Contact',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.phone),
                      hintText: 'Enter a valid contact number',
                    ),
                    keyboardType: TextInputType.phone,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Please enter a contact number';
                      }
                      if (!RegExp(r'^[0-9]+$').hasMatch(value)) {
                        return 'Contact number must contain only digits';
                      }
                      if (value.length < 10 || value.length > 12) {
                        return 'Contact number must be between 10 and 12 digits';
                      }
                      return null;
                    },
                    onSaved: (value) => _contact = value!,
                  ),
                  SizedBox(height: 20),
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(
                      labelText: 'Religion',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.church),
                    ),
                    value: _religion.isNotEmpty ? _religion : null,
                    items: [
                      DropdownMenuItem(
                        child: Text('Select Religion'),
                        value: '',
                      ),
                      DropdownMenuItem(child: Text('Islam'), value: 'Islam'),
                      DropdownMenuItem(
                        child: Text('Christianity'),
                        value: 'Christianity',
                      ),
                      DropdownMenuItem(
                        child: Text('Catholicism'),
                        value: 'Catholicism',
                      ),
                      DropdownMenuItem(
                        child: Text('Hinduism'),
                        value: 'Hinduism',
                      ),
                      DropdownMenuItem(
                        child: Text('Buddhism'),
                        value: 'Buddhism',
                      ),
                    ],
                    onChanged: (value) {
                      setState(() {
                        _religion = value!;
                      });
                    },
                    validator:
                        (value) =>
                            value == null || value.isEmpty
                                ? 'Please select a religion'
                                : null,
                    onSaved: (value) => _religion = value!,
                  ),
                  SizedBox(height: 20),
                  GestureDetector(
                    onTap: () async {
                      DateTime? pickedDate = await showDatePicker(
                        context: context,
                        initialDate: _birth ?? DateTime.now(),
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
                    validator:
                        (value) =>
                            value == null ? 'Please select a role' : null,
                    onSaved: (value) => _roleId = value!,
                  ),
                  SizedBox(height: 20),
                  // Conditionally add Password field
                  if (widget.user == null)
                    TextFormField(
                      decoration: InputDecoration(
                        labelText: 'Password',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.lock),
                        hintText: 'Enter a password',
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
                      obscureText: _obscurePassword, // Hide the password
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter a password';
                        }
                        if (value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                      onSaved: (value) => _password = value!,
                    ),
                  if (widget.user == null) SizedBox(height: 20),
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

                                setState(() {
                                  _isLoading = true;
                                });

                                try {
                                  final birthDateFormatted =
                                      _birth != null
                                          ? DateFormat(
                                            'yyyy-MM-dd',
                                          ).format(_birth!)
                                          : null;

                                  final userData = {
                                    'name': _name,
                                    'username': _username,
                                    'email': _email,
                                    'contact': _contact,
                                    'religion': _religion,
                                    'role_id': _roleId,
                                    'birth': birthDateFormatted,
                                    if (widget.user == null)
                                      'password':
                                          _password, // Include password only for new users
                                  };

                                  Map<String, dynamic> response;
                                  if (widget.user == null) {
                                    response = await _userController.addUser(
                                      userData,
                                    );
                                  } else {
                                    response = await _userController.updateUser(
                                      widget.user!.id,
                                      userData,
                                    );
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
                                    Navigator.pop(
                                      context,
                                      true,
                                    ); // Navigate back to the list
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
                              widget.user == null ? 'Save User' : 'Update User',
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
