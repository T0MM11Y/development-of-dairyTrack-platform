import 'dart:io';

import 'package:dairytrack_mobile/controller/APIURL1/usersManagementController.dart';
import 'package:dairytrack_mobile/views/usersManagement/editMakeUsersView.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:open_file/open_file.dart';
import 'package:share_plus/share_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ListOfUsersView extends StatefulWidget {
  @override
  _ListOfUsersViewState createState() => _ListOfUsersViewState();
}

class _ListOfUsersViewState extends State<ListOfUsersView> {
  final UsersManagementController _controller = UsersManagementController();
  List<User> _users = [];
  List<User> _filteredUsers = [];
  bool _isLoading = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _selectedRole = '';
  int _currentPage = 1;
  int _usersPerPage = 10;
  String _userRole = '';

  // Add dynamic color getters based on user role
  Color get _primaryColor => _userRole == 'Supervisor'
      ? Colors.deepOrange[400]!
      : Colors.blueGrey[800]!;

  Color get _primaryLightColor =>
      _userRole == 'Supervisor' ? Colors.orange[300]! : Colors.blueGrey[300]!;
  Color get _primaryDarkColor =>
      _userRole == 'Supervisor' ? Colors.orange[800]! : Colors.blueGrey[900]!;

  final Map<int, String> _roleDescriptions = {
    1: 'Admins have full access to the system and can manage all aspects.',
    2: 'Supervisors can oversee daily operations on this system.',
    3: 'Farmers have limited access primarily focused on recording daily activities related to cows.',
  };

  @override
  void initState() {
    super.initState();
    _getUserRole();
    _fetchUsers();
  }

  Future<void> _getUserRole() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userRole = prefs.getString('userRole') ?? '';
    });
  }

  Future<void> _fetchUsers() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final users = await _controller.listUsers();
      setState(() {
        _users = users;
        _applyFilters();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    if (_searchQuery.isNotEmpty || _selectedRole.isNotEmpty) {
      _currentPage = 1;
    }

    List<User> filtered = List.from(_users);

    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where(
            (user) =>
                user.username.toLowerCase().contains(
                      _searchQuery.toLowerCase(),
                    ) ||
                user.email.toLowerCase().contains(
                      _searchQuery.toLowerCase(),
                    ) ||
                user.name.toLowerCase().contains(
                      _searchQuery.toLowerCase(),
                    ) ||
                user.contact.toLowerCase().contains(
                      _searchQuery.toLowerCase(),
                    ),
          )
          .toList();
    }

    if (_selectedRole.isNotEmpty) {
      filtered = filtered
          .where((user) => user.roleId == int.parse(_selectedRole))
          .toList();
    }

    if (filtered.isEmpty) {
      _filteredUsers = [];
      return;
    }

    final int startIndex = (_currentPage - 1) * _usersPerPage;

    if (startIndex >= filtered.length) {
      _currentPage = 1;
      _filteredUsers = filtered.take(_usersPerPage).toList();
    } else {
      final int endIndex = startIndex + _usersPerPage;
      _filteredUsers = filtered.sublist(
        startIndex,
        endIndex > filtered.length ? filtered.length : endIndex,
      );
    }
  }

  void _deleteUser(int userId, String username) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text(
          "Delete User",
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          "Are you absolutely sure? This action is irreversible! All data associated with this user will be permanently deleted.",
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(
              "Cancel",
              style: TextStyle(color: Colors.white70),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(
              "Delete",
              style: TextStyle(color: Colors.redAccent),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      final textConfirm = await showDialog<String>(
        context: context,
        builder: (context) {
          String inputText = '';
          return AlertDialog(
            backgroundColor: Colors.grey[900],
            title: const Text(
              "Confirm Deletion",
              style: TextStyle(color: Colors.white),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Please type "delete $username" to confirm.',
                  style: TextStyle(color: Colors.white70),
                ),
                const SizedBox(height: 10),
                TextField(
                  onChanged: (value) => inputText = value,
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    filled: true,
                    fillColor: Colors.grey[800],
                    hintText: 'Type here...',
                    hintStyle: const TextStyle(color: Colors.white54),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(8),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ],
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(null),
                child: const Text(
                  "Cancel",
                  style: TextStyle(color: Colors.white),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(inputText),
                child: Text(
                  "Verify",
                  style: TextStyle(color: Colors.redAccent),
                ),
              ),
            ],
          );
        },
      );

      if (textConfirm == "delete $username") {
        setState(() => _isLoading = true);

        final response = await _controller.deleteUser(userId);

        setState(() => _isLoading = false);

        if (response['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("User deleted successfully")),
          );
          _fetchUsers();
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? "Failed to delete user"),
            ),
          );
        }
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Deletion canceled: Incorrect input")),
        );
      }
    }
  }

  Future<void> _resetUserPassword(int userId, int roleId) async {
    if (roleId == 1) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: Colors.grey[900],
          title: const Text(
            "Cannot Reset Admin Password",
            style: TextStyle(color: Colors.white),
          ),
          content: const Text(
            "To change the admin password, please log in as admin and use the 'Change Password' feature.",
            style: TextStyle(color: Colors.white70),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(
                "OK",
                style: TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
      );
      return;
    }
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.grey[900],
        title: const Text(
          "Reset Password",
          style: TextStyle(color: Colors.white),
        ),
        content: const Text(
          "Are you sure you want to reset this user's password?",
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text(
              "Cancel",
              style: TextStyle(color: Colors.redAccent),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(
              "Reset",
              style: TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);

      try {
        final response = await _controller.resetPassword(userId);

        setState(() => _isLoading = false);

        if (response['success'] == true) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Password reset successfully.")),
          );
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(response['message'] ?? "Failed to reset password."),
            ),
          );
        }
      } catch (e) {
        setState(() => _isLoading = false);

        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("Error: ${e.toString()}")));
      }
    }
  }

  Widget _buildRoleBadge(int roleId) {
    String label;
    Color bgColor;

    switch (roleId) {
      case 1:
        label = "Admin";
        bgColor = Colors.blue;
        break;
      case 2:
        label = "Supervisor";
        bgColor = Colors.orange;
        break;
      case 3:
        label = "Farmer";
        bgColor = Colors.green;
        break;
      default:
        label = "Unknown";
        bgColor = Colors.grey;
    }

    return Chip(
      label: Text(label, style: TextStyle(color: Colors.white, fontSize: 12)),
      backgroundColor: bgColor,
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 0),
      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
    );
  }

  String _formatDate(String birth) {
    try {
      DateTime dateTime = DateFormat(
        "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
      ).parse(birth);
      return DateFormat('yyyy-MM-dd').format(dateTime);
    } catch (e) {
      try {
        DateTime dateTime = DateTime.parse(birth);
        return DateFormat('yyyy-MM-dd').format(dateTime);
      } catch (e) {
        return 'Invalid Date';
      }
    }
  }

  Widget _buildStatisticsCard() {
    int adminCount = _users.where((user) => user.roleId == 1).length;
    int supervisorCount = _users.where((user) => user.roleId == 2).length;
    int farmerCount = _users.where((user) => user.roleId == 3).length;

    double adminPercent =
        _users.isEmpty ? 0 : (adminCount / _users.length) * 100;
    double supervisorPercent =
        _users.isEmpty ? 0 : (supervisorCount / _users.length) * 100;
    double farmerPercent =
        _users.isEmpty ? 0 : (farmerCount / _users.length) * 100;

    return Card(
      elevation: 2,
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.pie_chart, color: _primaryColor),
                SizedBox(width: 8),
                Text(
                  'User Statistics',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Divider(),
            SizedBox(height: 8),
            Text(
              'Role Distribution',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 12),
            _buildStatisticRow(
              'Admin',
              adminCount,
              adminPercent,
              Colors.blue[300]!,
            ),
            SizedBox(height: 8),
            _buildStatisticRow(
              'Supervisor',
              supervisorCount,
              supervisorPercent,
              Colors.orange[300]!,
            ),
            SizedBox(height: 8),
            _buildStatisticRow(
              'Farmer',
              farmerCount,
              farmerPercent,
              Colors.green[300]!,
            ),
            SizedBox(height: 4),
            Divider(),
            Text(
              'Total Users: ${_users.length}',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRoleInfoCard() {
    return Card(
      elevation: 2,
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info_outline, color: _primaryColor),
                SizedBox(width: 8),
                Text(
                  'Role Information',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Divider(),
            SizedBox(height: 8),
            ..._roleDescriptions.entries.map((entry) {
              Color roleColor;
              String roleTitle;

              switch (entry.key) {
                case 1:
                  roleColor = Colors.blue[100]!;
                  roleTitle = "Admin";
                  break;
                case 2:
                  roleColor = Colors.orange[100]!;
                  roleTitle = "Supervisor";
                  break;
                case 3:
                  roleColor = Colors.green[100]!;
                  roleTitle = "Farmer";
                  break;
                default:
                  roleColor = Colors.grey[100]!;
                  roleTitle = "Unknown";
              }

              return Container(
                margin: EdgeInsets.only(bottom: 8),
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: roleColor,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: roleColor.withOpacity(0.5)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      roleTitle,
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

  Widget _buildStatisticRow(
    String role,
    int count,
    double percent,
    Color color,
  ) {
    return Row(
      children: [
        Expanded(
          flex: 2,
          child: Text('$role: $count (${percent.toStringAsFixed(1)}%)'),
        ),
        Expanded(
          flex: 3,
          child: Stack(
            children: [
              Container(
                height: 10,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              FractionallySizedBox(
                widthFactor: percent / 100,
                child: Container(
                  height: 10,
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildUserCard(User user) {
    return Card(
      elevation: 1,
      margin: EdgeInsets.symmetric(vertical: 4, horizontal: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      child: ExpansionTile(
        leading: CircleAvatar(
          backgroundColor: Colors.blue[100],
          child: Text(
            user.username.isNotEmpty ? user.username[0].toUpperCase() : '?',
            style: TextStyle(
              color: Colors.blue[800],
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          user.username,
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Text(user.email),
        trailing: _buildRoleBadge(user.roleId),
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildUserInfoRow('Name', user.name),
                _buildUserInfoRow('Email', user.email),
                _buildUserInfoRow('Contact', user.contact),
                _buildUserInfoRow(
                  'Birth',
                  user.birth != null ? _formatDate(user.birth!) : 'N/A',
                ),
                _buildUserInfoRow('Religion', user.religion),
                Divider(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (_userRole != 'Supervisor')
                      ElevatedButton.icon(
                        icon: const Icon(
                          Icons.edit,
                          size: 18,
                          color: Colors.white,
                        ),
                        label: const Text(
                          "Edit",
                          style: TextStyle(fontSize: 12, color: Colors.white),
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) =>
                                  editMakeUsersView(user: user),
                            ),
                          ).then((result) {
                            if (result == true) {
                              _fetchUsers();
                            }
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[400],
                          padding: EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 6,
                          ),
                          shape: RoundedRectangleBorder(),
                        ),
                      ),
                    if (_userRole != 'Supervisor') SizedBox(width: 4),
                    if (_userRole != 'Supervisor')
                      ElevatedButton.icon(
                        icon: const Icon(
                          Icons.lock_reset,
                          size: 18,
                          color: Colors.white,
                        ),
                        label: const Text(
                          "Reset",
                          style: TextStyle(fontSize: 12, color: Colors.white),
                        ),
                        onPressed: () =>
                            _resetUserPassword(user.id, user.roleId),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          padding: EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 6,
                          ),
                          shape: RoundedRectangleBorder(),
                        ),
                      ),
                    if (_userRole != 'Supervisor') SizedBox(width: 4),
                    if (_userRole != 'Supervisor')
                      ElevatedButton.icon(
                        icon: const Icon(
                          Icons.delete,
                          size: 18,
                          color: Colors.white,
                        ),
                        label: const Text(
                          "Delete",
                          style: TextStyle(fontSize: 12, color: Colors.white),
                        ),
                        onPressed: () => _deleteUser(user.id, user.username),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red[400],
                          padding: EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 6,
                          ),
                          shape: RoundedRectangleBorder(),
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

  Widget _buildUserInfoRow(String label, String value) {
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

  @override
  Widget build(BuildContext context) {
    int totalItems = _users.length;
    int totalPages = (totalItems / _usersPerPage).ceil();

    if (_selectedRole.isNotEmpty || _searchQuery.isNotEmpty) {
      List<User> filtered = List.from(_users);

      if (_searchQuery.isNotEmpty) {
        filtered = filtered
            .where(
              (user) =>
                  user.username.toLowerCase().contains(
                        _searchQuery.toLowerCase(),
                      ) ||
                  user.email.toLowerCase().contains(
                        _searchQuery.toLowerCase(),
                      ) ||
                  user.name.toLowerCase().contains(
                        _searchQuery.toLowerCase(),
                      ) ||
                  user.contact.toLowerCase().contains(
                        _searchQuery.toLowerCase(),
                      ),
            )
            .toList();
      }

      if (_selectedRole.isNotEmpty) {
        filtered = filtered
            .where((user) => user.roleId == int.parse(_selectedRole))
            .toList();
      }

      totalItems = filtered.length;
      totalPages = (totalItems / _usersPerPage).ceil();
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Text(
          "User Management",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        backgroundColor: _primaryColor,
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list, color: Colors.white),
            tooltip: 'Filter Users',
            onPressed: () async {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: Colors.grey[900],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(20.0),
                  ),
                ),
                builder: (context) => StatefulBuilder(
                  builder: (context, setState) {
                    return Padding(
                      padding: EdgeInsets.only(
                        bottom: MediaQuery.of(context).viewInsets.bottom,
                        left: 20,
                        right: 20,
                        top: 20,
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                Icons.filter_alt,
                                color: _primaryColor,
                              ),
                              SizedBox(width: 8),
                              Text(
                                'Filter Users',
                                style: TextStyle(
                                  fontSize: 22,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 20),
                          Text(
                            'Role',
                            style: TextStyle(
                              fontWeight: FontWeight.w500,
                              color: Colors.white70,
                            ),
                          ),
                          SizedBox(height: 8),
                          DropdownButtonFormField<String>(
                            dropdownColor: Colors.grey[900],
                            decoration: InputDecoration(
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(10.0),
                                borderSide: BorderSide(
                                  color: Colors.grey[700]!,
                                ),
                              ),
                              filled: true,
                              fillColor: Colors.grey[850],
                              contentPadding: EdgeInsets.symmetric(
                                vertical: 12,
                                horizontal: 16,
                              ),
                            ),
                            value:
                                _selectedRole.isNotEmpty ? _selectedRole : null,
                            hint: Text('Select Role',
                                style: TextStyle(
                                    color: const Color.fromARGB(
                                        236, 255, 253, 253))),
                            items: [
                              DropdownMenuItem(
                                child: Text('All Roles',
                                    style: TextStyle(color: Colors.white)),
                                value: '',
                              ),
                              DropdownMenuItem(
                                child: Text('Admin',
                                    style: TextStyle(color: Colors.white)),
                                value: '1',
                              ),
                              DropdownMenuItem(
                                child: Text('Supervisor',
                                    style: TextStyle(color: Colors.white)),
                                value: '2',
                              ),
                              DropdownMenuItem(
                                child: Text('Farmer',
                                    style: TextStyle(color: Colors.white)),
                                value: '3',
                              ),
                            ],
                            onChanged: (value) {
                              setState(() {
                                _selectedRole = value ?? '';
                              });
                            },
                          ),
                          SizedBox(height: 20),
                          Row(
                            children: [
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () {
                                    setState(() {
                                      _selectedRole = '';
                                    });
                                    Navigator.of(context).pop();
                                    this.setState(() {
                                      _searchQuery = '';
                                      _applyFilters();
                                    });
                                  },
                                  child: Text('Clear Filters',
                                      style: TextStyle(color: Colors.white)),
                                  style: OutlinedButton.styleFrom(
                                    side: BorderSide(color: _primaryColor),
                                    padding: EdgeInsets.symmetric(
                                      vertical: 15,
                                    ),
                                  ),
                                ),
                              ),
                              SizedBox(width: 10),
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () {
                                    Navigator.of(context).pop();
                                    this.setState(() {
                                      _applyFilters();
                                    });
                                  },
                                  child: Text(
                                    'Apply Filters',
                                    style: TextStyle(color: Colors.white),
                                  ),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: _primaryColor,
                                    padding: EdgeInsets.symmetric(
                                      vertical: 15,
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(
                                        10,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 20),
                        ],
                      ),
                    );
                  },
                ),
              );
            },
          ),
          IconButton(
            icon: Icon(Icons.file_download, color: Colors.white),
            tooltip: 'Export Users',
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: Colors.grey[900],
                  title: Row(
                    children: [
                      Icon(Icons.download, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        "Export Data",
                        style: TextStyle(color: Colors.white),
                      ),
                    ],
                  ),
                  content: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      ListTile(
                        leading: Icon(
                          Icons.picture_as_pdf,
                          color: Colors.redAccent,
                        ),
                        title: Text(
                          "Export as PDF",
                          style: TextStyle(color: Colors.white),
                        ),
                        tileColor: Colors.transparent,
                        onTap: () async {
                          // Close the dialog
                          Navigator.pop(context);
                          setState(() => _isLoading = true);

                          // Store the BuildContext before async operation
                          final scaffoldMessenger =
                              ScaffoldMessenger.of(context);
                          final navigator = Navigator.of(context);

                          final response = await _controller.exportUsersToPDF();

                          // Check if widget is still mounted
                          if (!mounted) return;

                          setState(() => _isLoading = false);

                          if (response['success']) {
                            final filePath = response['filePath'] ?? '';
                            if (filePath.isNotEmpty) {
                              print("PDF file path: $filePath");

                              // Use navigator.context which is more stable than widget's context
                              if (mounted) {
                                showDialog(
                                  context: navigator.context,
                                  builder: (context) => AlertDialog(
                                    backgroundColor: Colors.grey[900],
                                    title: Row(
                                      children: [
                                        Icon(Icons.picture_as_pdf,
                                            color: Colors.redAccent),
                                        SizedBox(width: 8),
                                        Text("PDF Exported",
                                            style:
                                                TextStyle(color: Colors.white)),
                                      ],
                                    ),
                                    content: Text(
                                      "PDF export successful.\n\nFile saved at:\n$filePath",
                                      style: TextStyle(color: Colors.white70),
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () async {
                                          Navigator.pop(context);
                                          final result =
                                              await OpenFile.open(filePath);
                                          if (!mounted) return;
                                          if (result.type != ResultType.done) {
                                            scaffoldMessenger.showSnackBar(
                                              SnackBar(
                                                  content: Text(
                                                      'Gagal membuka file: ${result.message}')),
                                            );
                                          }
                                        },
                                        child: Text("Open File",
                                            style: TextStyle(
                                                color: Colors.greenAccent)),
                                      ),
                                      TextButton(
                                        onPressed: () => Navigator.pop(context),
                                        child: Text("Close",
                                            style: TextStyle(
                                                color: Colors.grey[300])),
                                      ),
                                    ],
                                  ),
                                );
                              }
                            } else {
                              if (mounted) {
                                scaffoldMessenger.showSnackBar(
                                  SnackBar(
                                      content: Text(
                                          'File path kosong, file tidak ditemukan!')),
                                );
                              }
                            }
                          } else {
                            if (mounted) {
                              scaffoldMessenger.showSnackBar(
                                SnackBar(
                                    content: Text(response['message'] ??
                                        'Export failed')),
                              );
                            }
                          }
                        },
                      ),
                      ListTile(
                        leading: Icon(
                          Icons.table_chart,
                          color: Colors.greenAccent,
                        ),
                        title: Text(
                          "Export as Excel",
                          style: TextStyle(color: Colors.white),
                        ),
                        tileColor: Colors.transparent,
                        onTap: () async {
                          Navigator.pop(context);
                          setState(() => _isLoading = true);

                          // Store the BuildContext before async operation
                          final scaffoldMessenger =
                              ScaffoldMessenger.of(context);
                          final navigator = Navigator.of(context);

                          final response =
                              await _controller.exportUsersToExcel();

                          if (!mounted) return;
                          setState(() => _isLoading = false);

                          if (response['success']) {
                            final filePath = response['filePath'] ?? '';
                            if (filePath.isNotEmpty) {
                              print("Excel file path: $filePath");

                              if (mounted) {
                                showDialog(
                                  context: navigator.context,
                                  builder: (context) => AlertDialog(
                                    backgroundColor: Colors.grey[900],
                                    title: Row(
                                      children: [
                                        Icon(Icons.table_chart,
                                            color: Colors.greenAccent),
                                        SizedBox(width: 8),
                                        Text("Excel Exported",
                                            style:
                                                TextStyle(color: Colors.white)),
                                      ],
                                    ),
                                    content: Text(
                                      "Excel export successful.\n\nFile saved at:\n$filePath",
                                      style: TextStyle(color: Colors.white70),
                                    ),
                                    actions: [
                                      TextButton(
                                        onPressed: () async {
                                          Navigator.pop(context);
                                          final result =
                                              await OpenFile.open(filePath);
                                          if (!mounted) return;
                                          if (result.type != ResultType.done) {
                                            scaffoldMessenger.showSnackBar(
                                              SnackBar(
                                                  content: Text(
                                                      'Gagal membuka file: ${result.message}')),
                                            );
                                          }
                                        },
                                        child: Text("Open File",
                                            style: TextStyle(
                                                color: Colors.greenAccent)),
                                      ),
                                      TextButton(
                                        onPressed: () => Navigator.pop(context),
                                        child: Text("Close",
                                            style:
                                                TextStyle(color: Colors.grey)),
                                      ),
                                    ],
                                  ),
                                );
                              }
                            } else {
                              if (mounted) {
                                scaffoldMessenger.showSnackBar(
                                  SnackBar(
                                      content: Text(
                                          'File path kosong, file tidak ditemukan!')),
                                );
                              }
                            }
                          } else {
                            if (mounted) {
                              scaffoldMessenger.showSnackBar(
                                SnackBar(
                                    content: Text(response['message'] ??
                                        'Export failed')),
                              );
                            }
                          }
                        },
                      ),
                    ],
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        "Cancel",
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          _isLoading
              ? Center(child: CircularProgressIndicator())
              : _errorMessage.isNotEmpty
                  ? Center(child: Text(_errorMessage))
                  : RefreshIndicator(
                      onRefresh: _fetchUsers,
                      child: Column(
                        children: [
                          Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: TextField(
                              decoration: InputDecoration(
                                hintText: 'Search users...',
                                prefixIcon: Icon(Icons.search),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(12),
                                  borderSide:
                                      BorderSide(color: Colors.grey[300]!),
                                ),
                                filled: true,
                                fillColor: Colors.grey[100],
                                contentPadding:
                                    EdgeInsets.symmetric(vertical: 0),
                                suffixIcon: _searchQuery.isNotEmpty
                                    ? IconButton(
                                        icon: Icon(Icons.clear),
                                        onPressed: () {
                                          setState(() {
                                            _searchQuery = '';
                                            _applyFilters();
                                          });
                                        },
                                      )
                                    : null,
                              ),
                              onChanged: (value) {
                                setState(() {
                                  _searchQuery = value;
                                  _applyFilters();
                                });
                              },
                            ),
                          ),
                          if (_selectedRole.isNotEmpty)
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 16),
                              child: Row(
                                children: [
                                  Text(
                                    'Active filters:',
                                    style: TextStyle(color: Colors.grey[700]),
                                  ),
                                  SizedBox(width: 8),
                                  Chip(
                                    label: Text(
                                      _selectedRole == '1'
                                          ? 'Admin'
                                          : _selectedRole == '2'
                                              ? 'Supervisor'
                                              : 'Farmer',
                                      style: TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                      ),
                                    ),
                                    backgroundColor: _selectedRole == '1'
                                        ? Colors.blue
                                        : _selectedRole == '2'
                                            ? Colors.orange
                                            : Colors.green,
                                    deleteIcon: Icon(
                                      Icons.close,
                                      size: 16,
                                      color: Colors.white,
                                    ),
                                    onDeleted: () {
                                      setState(() {
                                        _selectedRole = '';
                                        _applyFilters();
                                      });
                                    },
                                  ),
                                ],
                              ),
                            ),
                          Expanded(
                            child: _users.isEmpty
                                ? Center(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        Icon(
                                          Icons.people_outline,
                                          size: 64,
                                          color: Colors.grey[400],
                                        ),
                                        SizedBox(height: 16),
                                        Text(
                                          'No users found',
                                          style: TextStyle(
                                            fontSize: 18,
                                            color: Colors.grey[600],
                                          ),
                                        ),
                                        SizedBox(height: 8),
                                        Text(
                                          'Click the + button to add a new user',
                                          style: TextStyle(
                                              color: Colors.grey[500]),
                                        ),
                                      ],
                                    ),
                                  )
                                : _filteredUsers.isEmpty &&
                                        (_searchQuery.isNotEmpty ||
                                            _selectedRole.isNotEmpty)
                                    ? Center(
                                        child: Column(
                                          mainAxisAlignment:
                                              MainAxisAlignment.center,
                                          children: [
                                            Icon(
                                              Icons.search_off,
                                              size: 64,
                                              color: Colors.grey[400],
                                            ),
                                            SizedBox(height: 16),
                                            Text(
                                              'No matching users',
                                              style: TextStyle(
                                                fontSize: 18,
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                            SizedBox(height: 8),
                                            ElevatedButton.icon(
                                              icon: Icon(Icons.clear),
                                              label: Text('Clear Filters',
                                                  style: TextStyle(
                                                      color: Colors.white)),
                                              onPressed: () {
                                                setState(() {
                                                  _searchQuery = '';
                                                  _selectedRole = '';
                                                  _applyFilters();
                                                });
                                              },
                                            ),
                                          ],
                                        ),
                                      )
                                    : ListView(
                                        children: [
                                          if (_searchQuery.isEmpty &&
                                              _selectedRole.isEmpty) ...[
                                            _buildStatisticsCard(),
                                            _buildRoleInfoCard(),
                                          ],
                                          ..._filteredUsers
                                              .map((user) =>
                                                  _buildUserCard(user))
                                              .toList(),
                                          SizedBox(height: 80),
                                        ],
                                      ),
                          ),
                          if (totalItems > 0)
                            Container(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border(
                                  top: BorderSide(color: Colors.grey[200]!),
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.grey.withOpacity(0.1),
                                    spreadRadius: 1,
                                    blurRadius: 3,
                                    offset: Offset(0, -1),
                                  ),
                                ],
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  IconButton(
                                    icon: Icon(Icons.arrow_back),
                                    onPressed: _currentPage > 1
                                        ? () {
                                            setState(() {
                                              _currentPage--;
                                              _applyFilters();
                                            });
                                          }
                                        : null,
                                    tooltip: 'Previous Page',
                                    color: _primaryColor,
                                  ),
                                  Padding(
                                    padding: const EdgeInsets.symmetric(
                                      horizontal: 16,
                                    ),
                                    child: Text(
                                      'Page $_currentPage of $totalPages',
                                      style: TextStyle(
                                          fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                  IconButton(
                                    icon: Icon(Icons.arrow_forward),
                                    onPressed: _currentPage < totalPages &&
                                            _filteredUsers.length ==
                                                _usersPerPage
                                        ? () {
                                            setState(() {
                                              _currentPage++;
                                              _applyFilters();
                                            });
                                          }
                                        : null,
                                    tooltip: 'Next Page',
                                    color: _primaryColor,
                                  ),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ),
        ],
      ),
      floatingActionButton: _userRole != 'Supervisor'
          ? FloatingActionButton(
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => editMakeUsersView()),
                );

                if (result == true) {
                  _fetchUsers();
                }
              },
              child: Icon(Icons.add, color: Colors.white),
              backgroundColor: _primaryColor,
            )
          : null,
    );
  }
}
