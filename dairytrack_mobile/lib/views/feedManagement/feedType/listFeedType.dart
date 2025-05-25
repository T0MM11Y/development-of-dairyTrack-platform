import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedTypeController.dart';

class FeedType {
  final int id;
  final String name;
  final String createdAt;
  final String updatedAt;

  FeedType({
    required this.id,
    required this.name,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FeedType.fromJson(Map<String, dynamic> json) {
    return FeedType(
      id: json['id'],
      name: json['name'],
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
    );
  }
}

class FeedTypeView extends StatefulWidget {
  @override
  _FeedTypeViewState createState() => _FeedTypeViewState();
}

class _FeedTypeViewState extends State<FeedTypeView> {
  final FeedTypeManagementController _controller = FeedTypeManagementController();
  List<FeedType> _feedTypes = [];
  List<FeedType> _filteredFeedTypes = [];
  bool _isLoading = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _sortField = 'name';
  bool _sortAscending = true;
  final int _userId = 1; // Replace with actual user ID from auth service

  @override
  void initState() {
    super.initState();
    _fetchFeedTypes();
  }

  Future<void> _fetchFeedTypes() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    try {
      final response = await _controller.getAllFeedTypes();
      if (response['success']) {
        setState(() {
          _feedTypes = (response['data'] as List)
              .map((json) => FeedType.fromJson(json))
              .toList();
          _applyFiltersAndSort();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch feed types';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  void _applyFiltersAndSort() {
    List<FeedType> filtered = List.from(_feedTypes);

    if (_searchQuery.isNotEmpty) {
      filtered = filtered
          .where((feedType) =>
              feedType.name.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    }

    filtered.sort((a, b) {
      int comparison = 0;
      switch (_sortField) {
        case 'name':
          comparison = a.name.toLowerCase().compareTo(b.name.toLowerCase());
          break;
        case 'created_at':
          comparison = a.createdAt.compareTo(b.createdAt);
          break;
      }
      return _sortAscending ? comparison : -comparison;
    });

    setState(() {
      _filteredFeedTypes = filtered;
    });
  }

  void _deleteFeedType(int feedTypeId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          "Delete Feed Type",
          style: TextStyle(fontWeight: FontWeight.w600),
        ),
        content: Text(
          "Are you sure you want to delete this feed type?",
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              "Cancel",
              style: TextStyle(color: Colors.grey),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(
              "Delete",
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      ),
    );

    if (confirm == true) {
      final response = await _controller.deleteFeedType(feedTypeId);
      if (response['success']) {
        _showSnackBar(response['message']);
        _fetchFeedTypes();
      } else {
        _showSnackBar(response['message']);
      }
    }
  }

  void _viewEditFeedType(FeedType feedType) async {
    String name = feedType.name;
    final _formKey = GlobalKey<FormState>();
    bool _isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 20,
                right: 20,
                top: 20,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
              ),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Edit Feed Type: ${feedType.name}",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.teal,
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, color: Colors.grey),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      _buildTextFormField(
                        labelText: 'Name',
                        hintText: 'Enter feed type name',
                        initialValue: name,
                        validator: (value) => value == null || value.isEmpty
                            ? 'Please enter the feed type name'
                            : null,
                        onChanged: (value) => name = value,
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal,
                          padding: EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () async {
                          if (_formKey.currentState!.validate()) {
                            _formKey.currentState!.save();

                            setState(() {
                              _isLoading = true;
                            });

                            try {
                              final response = await _controller.updateFeedType(
                                feedType.id,
                                name,
                                _userId,
                              );

                              if (response['success']) {
                                _showSnackBar(response['message']);
                                Navigator.of(context).pop();
                                _fetchFeedTypes();
                              } else {
                                _showSnackBar(response['message']);
                              }
                            } catch (e) {
                              _showSnackBar("Error: ${e.toString()}");
                            } finally {
                              setState(() {
                                _isLoading = false;
                              });
                            }
                          }
                        },
                        child: _isLoading
                            ? CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              )
                            : Text(
                                "Save",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                      SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  void _addFeedType() async {
    String name = '';
    final _formKey = GlobalKey<FormState>();
    bool _isLoading = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Container(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
                left: 20,
                right: 20,
                top: 20,
              ),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
              ),
              child: SingleChildScrollView(
                child: Form(
                  key: _formKey,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            "Add New Feed Type",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.teal,
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, color: Colors.grey),
                            onPressed: () => Navigator.of(context).pop(),
                          ),
                        ],
                      ),
                      SizedBox(height: 10),
                      _buildTextFormField(
                        labelText: 'Name',
                        hintText: 'Enter feed type name',
                        validator: (value) => value == null || value.isEmpty
                            ? 'Please enter the feed type name'
                            : null,
                        onChanged: (value) => name = value,
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal,
                          padding: EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () async {
                          if (_formKey.currentState!.validate()) {
                            _formKey.currentState!.save();

                            setState(() {
                              _isLoading = true;
                            });

                            try {
                              final response = await _controller.addFeedType(
                                  name, _userId);

                              if (response['success']) {
                                _showSnackBar(response['message']);
                                Navigator.of(context).pop();
                                _fetchFeedTypes();
                              } else {
                                _showSnackBar(response['message']);
                              }
                            } catch (e) {
                              _showSnackBar("Error: ${e.toString()}");
                            } finally {
                              setState(() {
                                _isLoading = false;
                              });
                            }
                          }
                        },
                        child: _isLoading
                            ? CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              )
                            : Text(
                                "Add",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                ),
                              ),
                      ),
                      SizedBox(height: 20),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildStatisticsCard() {
    int totalFeedTypes = _feedTypes.length;

    return Card(
      margin: EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.teal[50]!, Colors.cyan[50]!],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(15),
        ),
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Feed Type Statistics',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: Colors.teal[800],
              ),
            ),
            SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Total Feed Types: $totalFeedTypes',
                        style: TextStyle(fontSize: 16),
                      ),
                      SizedBox(height: 4),
                      LinearProgressIndicator(
                        value: totalFeedTypes / (totalFeedTypes + 1),
                        backgroundColor: Colors.grey[200],
                        color: Colors.teal[300],
                        borderRadius: BorderRadius.circular(5),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.teal,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[50],
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 150,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                "Feed Types",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Colors.teal, Colors.cyan],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
            leading: IconButton(
              icon: Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildSearchBar(),
                _buildSortingOptions(),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: _isLoading
                ? Padding(
                    padding: const EdgeInsets.all(20.0),
                    child: Center(
                      child: CircularProgressIndicator(
                        color: Colors.teal,
                      ),
                    ),
                  )
                : _errorMessage.isNotEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(20.0),
                        child: Center(
                          child: Text(
                            _errorMessage,
                            style: TextStyle(color: Colors.red),
                          ),
                        ),
                      )
                    : _filteredFeedTypes.isEmpty
                        ? Padding(
                            padding: const EdgeInsets.all(20.0),
                            child: Center(
                              child: Text(
                                "No feed types found",
                              ),
                            ),
                          )
                        : Column(
                            children: [
                              _buildStatisticsCard(),
                              ..._filteredFeedTypes
                                  .asMap()
                                  .entries
                                  .map((entry) {
                                int index = entry.key;
                                FeedType feedType = entry.value;
                                return _buildFeedTypeCard(feedType, index);
                              }).toList(),
                              SizedBox(height: 80),
                            ],
                          ),
          ),
        ],
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton(
            onPressed: () {
              _showFilterBottomSheet(context);
            },
            child: Icon(Icons.filter_list, color: Colors.white),
            backgroundColor: Colors.teal,
            heroTag: 'filter',
          ),
          SizedBox(height: 10),
          FloatingActionButton(
            onPressed: _addFeedType,
            child: Icon(Icons.add, color: Colors.white),
            backgroundColor: Colors.cyan,
            heroTag: 'add',
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search feed types...',
          prefixIcon: Icon(Icons.search, color: Colors.teal),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, color: Colors.grey),
                  onPressed: () {
                    setState(() {
                      _searchQuery = '';
                      _applyFiltersAndSort();
                    });
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide.none,
          ),
          contentPadding: EdgeInsets.symmetric(vertical: 0, horizontal: 20),
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
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      child: Row(
        children: [
          Text(
            'Sort by: ',
            style: TextStyle(fontSize: 16, color: Colors.teal[800]),
          ),
          SizedBox(width: 8),
          ...['name', 'created_at'].map((field) {
            String label = field == 'created_at' ? 'Created Date' : 'Name';
            return Padding(
              padding: const EdgeInsets.only(right: 8.0),
              child: ChoiceChip(
                label: Text(
                  label,
                ),
                selected: _sortField == field,
                selectedColor: Colors.teal[100],
                backgroundColor: Colors.grey[200],
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

  Widget _buildFeedTypeCard(FeedType feedType, int index) {
    return AnimatedOpacity(
      opacity: _isLoading ? 0 : 1,
      duration: Duration(milliseconds: 500),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 16),
        child: GestureDetector(
          onTap: () => _viewEditFeedType(feedType),
          child: Card(
            elevation: 5,
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.teal[50]!, Colors.cyan[50]!],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(15),
              ),
              padding: const EdgeInsets.all(16.0),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.teal[100],
                    child: Icon(
                      Icons.fastfood,
                      color: Colors.teal[800],
                    ),
                  ),
                  SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          feedType.name,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.teal[800],
                          ),
                        ),
                        SizedBox(height: 5),
                        Text(
                          feedType.createdAt.isNotEmpty
                              ? 'Created: ${DateFormat('dd MMM yyyy').format(DateTime.parse(feedType.createdAt))}'
                              : 'Created: N/A',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.delete, color: Colors.red, size: 24),
                    onPressed: () => _deleteFeedType(feedType.id),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showFilterBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) {
          return Container(
            padding: EdgeInsets.only(
              bottom: MediaQuery.of(context).viewInsets.bottom,
              left: 20,
              right: 20,
              top: 20,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Text(
                      'Filter Feed Types',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w600,
                        color: Colors.teal,
                      ),
                    ),
                  ),
                  SizedBox(height: 24),
                  _buildSearchFilter(setState),
                  SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).pop();
                        this.setState(() {
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
                        backgroundColor: Colors.teal,
                        padding: EdgeInsets.symmetric(vertical: 15),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: 16),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildSearchFilter(StateSetter setState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Search',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: Colors.teal,
          ),
        ),
        SizedBox(height: 8),
        TextField(
          decoration: InputDecoration(
            hintText: 'Enter feed type name',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none,
            ),
            filled: true,
            fillColor: Colors.grey[100],
            contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
          onChanged: (value) {
            setState(() {
              _searchQuery = value;
            });
          },
        ),
      ],
    );
  }

  Widget _buildTextFormField({
    required String labelText,
    String? hintText,
    String? initialValue,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText,
          labelStyle: TextStyle(color: Colors.teal),
          hintStyle: TextStyle(),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.teal),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: Colors.cyan, width: 2),
          ),
          prefixIcon: Icon(Icons.text_fields, color: Colors.teal),
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        initialValue: initialValue,
        validator: validator,
        onChanged: onChanged,
      ),
    );
  }

  Widget _buildReadOnlyListTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: Colors.teal),
      title: Text(
        title,
        style: TextStyle(
          color: Colors.teal,
          fontWeight: FontWeight.w500,
        ),
      ),
      subtitle: Text(subtitle),
      contentPadding: EdgeInsets.symmetric(horizontal: 0),
    );
  }
}