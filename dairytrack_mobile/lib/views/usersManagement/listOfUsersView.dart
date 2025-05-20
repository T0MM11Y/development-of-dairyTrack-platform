import 'package:dairytrack_mobile/controller/APIURL1/usersManagementController.dart';
import 'package:dairytrack_mobile/views/usersManagement/editMakeUsersView.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

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
  int _usersPerPage = 10; // Increased for better UX

  final Map<int, String> _roleDescriptions = {
    1: 'Admins have full access to the system and can manage all aspects.',
    2: 'Supervisors can oversee daily operations on this system.',
    3: 'Farmers have limited access primarily focused on recording daily activities related to cows.',
  };

  @override
  void initState() {
    super.initState();
    _fetchUsers();
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
    // Reset to page 1 if filters change
    if (_searchQuery.isNotEmpty || _selectedRole.isNotEmpty) {
      _currentPage = 1;
    }

    List<User> filtered = List.from(_users);

    // Apply search
    if (_searchQuery.isNotEmpty) {
      filtered =
          filtered
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

    // Apply role filter
    if (_selectedRole.isNotEmpty) {
      filtered =
          filtered
              .where((user) => user.roleId == int.parse(_selectedRole))
              .toList();
    }

    // Apply pagination with proper bounds checking
    if (filtered.isEmpty) {
      _filteredUsers = [];
      return;
    }

    final int startIndex = (_currentPage - 1) * _usersPerPage;

    // Ensure we don't go out of bounds
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

  void _deleteUser(int userId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: Text("Delete User"),
            content: Text("Are you sure you want to delete this user?"),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: Text("Cancel"),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: Text("Delete"),
                style: TextButton.styleFrom(foregroundColor: Colors.red),
              ),
            ],
          ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);

      final response = await _controller.deleteUser(userId);

      setState(() => _isLoading = false);

      if (response['success'] == true) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text("User deleted successfully")));
        _fetchUsers();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response['message'] ?? "Failed to delete user"),
          ),
        );
      }
    }
  }

  Future<void> _resetUserPassword(int userId, int roleId) async {
    if (roleId == 1) {
      // Show a different dialog for admin users
      showDialog(
        context: context,
        builder:
            (context) => AlertDialog(
              title: const Text("Cannot Reset Admin Password"),
              content: const Text(
                "To change the admin password, please log in as admin and use the 'Change Password' feature.",
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text("OK"),
                ),
              ],
            ),
      );
      return; // Exit the function early
    }
    final confirm = await showDialog<bool>(
      context: context,
      builder:
          (context) => AlertDialog(
            title: const Text("Reset Password"),
            content: const Text(
              "Are you sure you want to reset this user's password?",
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text("Cancel"),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text("Reset"),
                style: TextButton.styleFrom(foregroundColor: Colors.amber[700]),
              ),
            ],
          ),
    );

    if (confirm == true) {
      setState(() => _isLoading = true);

      try {
        // Fixed to use correct method name from the controller
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
    // Count users by role
    int adminCount = _users.where((user) => user.roleId == 1).length;
    int supervisorCount = _users.where((user) => user.roleId == 2).length;
    int farmerCount = _users.where((user) => user.roleId == 3).length;

    // Calculate percentages
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
                Icon(Icons.pie_chart, color: Colors.blueGrey[800]),
                SizedBox(width: 8),
                Text(
                  'User Statistics',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Divider(),
            SizedBox(height: 8),

            // Role statistics
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
                Icon(Icons.info_outline, color: Colors.blueGrey[800]),
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

  // Improved user card for better layout
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

                // Action buttons in a more organized layout
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
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
                            builder: (context) => editMakeUsersView(user: user),
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
                    SizedBox(width: 4),
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
                      onPressed: () => _resetUserPassword(user.id, user.roleId),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber[400],
                        padding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 6,
                        ),
                        shape: RoundedRectangleBorder(),
                      ),
                    ),
                    SizedBox(width: 4),
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
                      onPressed: () => _deleteUser(user.id),
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

  // Helper method to create consistent user info rows
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
    // Calculate total pages for pagination
    int totalItems = _users.length;
    int totalPages = (totalItems / _usersPerPage).ceil();

    if (_selectedRole.isNotEmpty || _searchQuery.isNotEmpty) {
      // Count filtered items before pagination
      List<User> filtered = List.from(_users);

      if (_searchQuery.isNotEmpty) {
        filtered =
            filtered
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
        filtered =
            filtered
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
        backgroundColor: Colors.blueGrey[800],
        actions: [
          IconButton(
            icon: Icon(Icons.filter_list, color: Colors.white),
            tooltip: 'Filter Users',
            onPressed: () {
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(20.0),
                  ),
                ),
                builder:
                    (context) => StatefulBuilder(
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
                                    color: Colors.blueGrey[800],
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Filter Users',
                                    style: TextStyle(
                                      fontSize: 22,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.blueGrey[800],
                                    ),
                                  ),
                                ],
                              ),
                              SizedBox(height: 20),
                              Text(
                                'Role',
                                style: TextStyle(
                                  fontWeight: FontWeight.w500,
                                  color: Colors.grey[700],
                                ),
                              ),
                              SizedBox(height: 8),
                              DropdownButtonFormField<String>(
                                decoration: InputDecoration(
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10.0),
                                    borderSide: BorderSide(
                                      color: Colors.grey[300]!,
                                    ),
                                  ),
                                  filled: true,
                                  fillColor: Colors.grey[100],
                                  contentPadding: EdgeInsets.symmetric(
                                    vertical: 12,
                                    horizontal: 16,
                                  ),
                                ),
                                value:
                                    _selectedRole.isNotEmpty
                                        ? _selectedRole
                                        : null,
                                hint: Text('Select Role'),
                                items: [
                                  DropdownMenuItem(
                                    child: Text('All Roles'),
                                    value: '',
                                  ),
                                  DropdownMenuItem(
                                    child: Text('Admin'),
                                    value: '1',
                                  ),
                                  DropdownMenuItem(
                                    child: Text('Supervisor'),
                                    value: '2',
                                  ),
                                  DropdownMenuItem(
                                    child: Text('Farmer'),
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
                                      child: Text('Clear Filters'),
                                      style: OutlinedButton.styleFrom(
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
                                        backgroundColor: Colors.blueGrey[800],
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
                builder:
                    (context) => AlertDialog(
                      title: Row(
                        children: [
                          Icon(Icons.download, color: Colors.blueGrey[800]),
                          SizedBox(width: 8),
                          Text("Export Data"),
                        ],
                      ),
                      content: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          ListTile(
                            leading: Icon(
                              Icons.picture_as_pdf,
                              color: Colors.red,
                            ),
                            title: Text("Export as PDF"),
                            onTap: () {
                              Navigator.pop(context);
                              setState(() => _isLoading = true);

                              _controller
                                  .exportUsersToPDF()
                                  .then((response) {
                                    setState(() => _isLoading = false);
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
                                    setState(() => _isLoading = false);
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text("Error: ${e.toString()}"),
                                      ),
                                    );
                                  });
                            },
                          ),
                          ListTile(
                            leading: Icon(
                              Icons.table_chart,
                              color: Colors.green,
                            ),
                            title: Text("Export as Excel"),
                            onTap: () {
                              Navigator.pop(context);
                              setState(() => _isLoading = true);

                              _controller
                                  .exportUsersToExcel()
                                  .then((response) {
                                    setState(() => _isLoading = false);
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
                                    setState(() => _isLoading = false);
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
                            style: TextStyle(color: Colors.blueGrey[800]),
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
                    // Search bar
                    Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search users...',
                          prefixIcon: Icon(Icons.search),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
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

                    // Filter chips display
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
                              backgroundColor:
                                  _selectedRole == '1'
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
                      child:
                          _users.isEmpty
                              ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
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
                                      style: TextStyle(color: Colors.grey[500]),
                                    ),
                                  ],
                                ),
                              )
                              : _filteredUsers.isEmpty &&
                                  (_searchQuery.isNotEmpty ||
                                      _selectedRole.isNotEmpty)
                              ? Center(
                                child: Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
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
                                      label: Text('Clear Filters'),
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
                                  // Statistics and info cards (only show when not filtered)
                                  if (_searchQuery.isEmpty &&
                                      _selectedRole.isEmpty) ...[
                                    _buildStatisticsCard(),
                                    _buildRoleInfoCard(),
                                  ],

                                  // User list with improved layout
                                  ..._filteredUsers
                                      .map((user) => _buildUserCard(user))
                                      .toList(),

                                  SizedBox(height: 80), // Space for FAB
                                ],
                              ),
                    ),
                    // Improved pagination controls
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
                              icon: Icon(Icons.first_page),
                              onPressed:
                                  _currentPage > 1
                                      ? () {
                                        setState(() {
                                          _currentPage = 1;
                                          _applyFilters();
                                        });
                                      }
                                      : null,
                              tooltip: 'First Page',
                              color: Colors.blueGrey[800],
                            ),
                            IconButton(
                              icon: Icon(Icons.arrow_back),
                              onPressed:
                                  _currentPage > 1
                                      ? () {
                                        setState(() {
                                          _currentPage--;
                                          _applyFilters();
                                        });
                                      }
                                      : null,
                              tooltip: 'Previous Page',
                              color: Colors.blueGrey[800],
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                              ),
                              child: Text(
                                'Page $_currentPage of $totalPages',
                                style: TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                            IconButton(
                              icon: Icon(Icons.arrow_forward),
                              onPressed:
                                  _currentPage < totalPages &&
                                          _filteredUsers.length == _usersPerPage
                                      ? () {
                                        setState(() {
                                          _currentPage++;
                                          _applyFilters();
                                        });
                                      }
                                      : null,
                              tooltip: 'Next Page',
                              color: Colors.blueGrey[800],
                            ),
                            IconButton(
                              icon: Icon(Icons.last_page),
                              onPressed:
                                  _currentPage < totalPages
                                      ? () {
                                        setState(() {
                                          _currentPage = totalPages;
                                          _applyFilters();
                                        });
                                      }
                                      : null,
                              tooltip: 'Last Page',
                              color: Colors.blueGrey[800],
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
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
        backgroundColor: Colors.blueGrey[800],
      ),
    );
  }
}
