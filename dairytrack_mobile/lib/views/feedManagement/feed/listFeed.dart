import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedController.dart';
import 'package:dairytrack_mobile/controller/APIURL4/nutritionController.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedTypeController.dart';

// Helper function to format numbers without trailing zeros
String formatNumber(double value) {
  final formatter = NumberFormat('#,##0', 'id_ID'); // Indonesian locale
  return formatter.format(value);
}

// Helper function to format price with "Rp" and no trailing zeros
String formatPrice(double price) {
  return 'Rp ${formatNumber(price)}';
}

class Feed {
  final int id;
  final int typeId;
  final String typeName;
  final String name;
  final String unit;
  final double minStock;
  final double price;
  final String createdAt;
  final String updatedAt;
  final List<Map<String, dynamic>> nutrisiList;

  Feed({
    required this.id,
    required this.typeId,
    required this.typeName,
    required this.name,
    required this.unit,
    required this.minStock,
    required this.price,
    required this.createdAt,
    required this.updatedAt,
    required this.nutrisiList,
  });

  factory Feed.fromJson(Map<String, dynamic> json) {
    return Feed(
      id: json['id'],
      typeId: json['type_id'],
      typeName: json['type_name'] ?? 'Unknown Type',
      name: json['name'],
      unit: json['unit'],
      minStock: json['min_stock'] is num
          ? (json['min_stock'] as num).toDouble()
          : double.tryParse(json['min_stock']?.toString() ?? '') ?? 0.0,
      price: json['price'] is num
          ? (json['price'] as num).toDouble()
          : double.tryParse(json['price']?.toString() ?? '') ?? 0.0,
      createdAt: json['created_at'] ?? '',
      updatedAt: json['updated_at'] ?? '',
      nutrisiList: (json['nutrisi_records'] as List<dynamic>?)
              ?.map((e) => {
                    'id': e['nutrisi_id'],
                    'name': e['nutrisi_name'],
                    'unit': e['unit'],
                    'amount': double.tryParse(e['amount']?.toString() ?? '') ?? 0.0,
                  })
              .toList() ??
          [],
    );
  }
}

class FeedType {
  final int id;
  final String name;

  FeedType({required this.id, required this.name});

  factory FeedType.fromJson(Map<String, dynamic> json) {
    return FeedType(
      id: json['id'],
      name: json['name'],
    );
  }
}

class Nutrisi {
  final int id;
  final String name;

  Nutrisi({required this.id, required this.name});

  factory Nutrisi.fromJson(Map<String, dynamic> json) {
    return Nutrisi(
      id: json['id'],
      name: json['name'],
    );
  }
}

class FeedView extends StatefulWidget {
  @override
  _FeedViewState createState() => _FeedViewState();
}

class _FeedViewState extends State<FeedView> {
  final FeedManagementController _feedController = FeedManagementController();
  final NutrisiManagementController _nutrisiController = NutrisiManagementController();
  final FeedTypeManagementController _feedTypeController = FeedTypeManagementController();
  List<Feed> _feedList = [];
  List<Feed> _filteredFeedList = [];
  List<FeedType> _feedTypes = [];
  List<Nutrisi> _nutrisiList = [];
  bool _isLoading = true;
  bool _isLoadingFeedTypes = true;
  bool _isLoadingNutrisi = true;
  String _errorMessage = '';
  String _searchQuery = '';
  final int _userId = 1; // Replace with actual user ID

  @override
  void initState() {
    super.initState();
    _fetchFeedTypes();
    _fetchNutrisi();
    _fetchFeeds();
  }

  Future<void> _fetchFeedTypes() async {
    if (!mounted) return;
    setState(() => _isLoadingFeedTypes = true);
    try {
      final response = await _feedTypeController.getAllFeedTypes();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _feedTypes = (response['data'] as List)
              .map((json) => FeedType.fromJson(json))
              .toList();
          _isLoadingFeedTypes = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch feed types';
          _isLoadingFeedTypes = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching feed types: $e';
        _isLoadingFeedTypes = false;
      });
    }
  }

  Future<void> _fetchNutrisi() async {
    if (!mounted) return;
    setState(() => _isLoadingNutrisi = true);
    try {
      final response = await _nutrisiController.getAllNutrisi();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _nutrisiList = (response['data'] as List)
              .map((json) => Nutrisi.fromJson(json))
              .toList();
          _isLoadingNutrisi = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch nutrisi';
          _isLoadingNutrisi = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching nutrisi: $e';
        _isLoadingNutrisi = false;
      });
    }
  }

  Future<void> _fetchFeeds() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final response = await _feedController.getAllFeeds();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _feedList = (response['data'] as List)
              .map((json) => Feed.fromJson(json))
              .toList();
          _applyFilters();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch feeds';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching feeds: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    if (!mounted) return;
    setState(() {
      _filteredFeedList = _feedList
          .where((feed) =>
              feed.name.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    });
  }

  Future<void> _deleteFeed(int feedId) async {
    if (!mounted) return;
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text("Delete Feed", style: TextStyle(fontWeight: FontWeight.w600)),
        content: Text("Are you sure you want to delete this feed?"),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text("Cancel", style: TextStyle(color: Colors.grey)),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text("Delete", style: TextStyle(color: Colors.red)),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      ),
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    try {
      final response = await _feedController.deleteFeed(feedId);
      if (!mounted) return;
      if (response['success']) {
        _showSnackBar(response['message']);
        await _fetchFeeds();
      } else {
        _showSnackBar(response['message']);
      }
    } catch (e) {
      if (!mounted) return;
      _showSnackBar('Error deleting feed: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _addFeed() async {
    if (_feedTypes.isEmpty || _nutrisiList.isEmpty) {
      _showSnackBar('Feed types or nutrisi not loaded yet.');
      return;
    }

    int typeId = _feedTypes.first.id;
    String name = '';
    String unit = '';
    double minStock = 0.0;
    double price = 0.0;
    List<Map<String, dynamic>> selectedNutrisi = [];
    final _formKey = GlobalKey<FormState>();
    bool _isSubmitting = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
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
                            "Add New Feed",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.black87,
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, color: Colors.grey[600]),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                      SizedBox(height: 12),
                      DropdownButtonFormField<int>(
                        decoration: InputDecoration(
                          labelText: 'Feed Type',
                          labelStyle: TextStyle(color: Colors.black87),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
                          ),
                          prefixIcon: Icon(Icons.category, color: Colors.blue[700]),
                        ),
                        value: typeId,
                        items: _feedTypes.map((type) {
                          return DropdownMenuItem<int>(
                            value: type.id,
                            child: Text(type.name),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setModalState(() {
                            typeId = value!;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Please select a feed type' : null,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        labelText: 'Name',
                        hintText: 'Enter feed name',
                        validator: (value) =>
                            value == null || value.isEmpty
                                ? 'Please enter the feed name'
                                : null,
                        onChanged: (value) => name = value,
                      ),
                      _buildTextFormField(
                        labelText: 'Unit',
                        hintText: 'Enter unit (e.g., kg)',
                        validator: (value) =>
                            value == null || value.isEmpty
                                ? 'Please enter the unit'
                                : null,
                        onChanged: (value) => unit = value,
                      ),
                      _buildTextFormField(
                        labelText: 'Min Stock',
                        hintText: 'Enter minimum stock',
                        keyboardType: TextInputType.number,
                        validator: (value) =>
                            value == null || double.tryParse(value) == null
                                ? 'Please enter a valid number'
                                : null,
                        onChanged: (value) =>
                            minStock = double.tryParse(value) ?? 0.0,
                      ),
                      _buildTextFormField(
                        labelText: 'Price',
                        hintText: 'Enter price (e.g., 1500)',
                        keyboardType: TextInputType.number,
                        validator: (value) =>
                            value == null || double.tryParse(value) == null
                                ? 'Please enter a valid number'
                                : null,
                        onChanged: (value) =>
                            price = double.tryParse(value) ?? 0.0,
                        prefixText: 'Rp ',
                        onChangedText: (value) {
                          final cleanValue = value.replaceAll(RegExp(r'[^0-9.]'), '');
                          return formatPrice(double.tryParse(cleanValue) ?? 0.0);
                        },
                      ),
                      SizedBox(height: 12),
                      Text(
                        'Select Nutrients',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      _buildNutrientDropdown(
                        nutrisiList: _nutrisiList,
                        selectedNutrisi: selectedNutrisi,
                        onChanged: (newSelection) {
                          setModalState(() {
                            selectedNutrisi.clear();
                            selectedNutrisi.addAll(newSelection);
                          });
                        },
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[700],
                          padding: EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        onPressed: _isSubmitting
                            ? null
                            : () async {
                                if (_formKey.currentState!.validate()) {
                                  setModalState(() => _isSubmitting = true);
                                  try {
                                    final response = await _feedController.createFeed(
                                      typeId: typeId,
                                      name: name,
                                      unit: unit,
                                      minStock: minStock,
                                      price: price,
                                      userId: _userId,
                                      nutrisiList: selectedNutrisi.map((n) => {
                                            'nutrisi_id': n['id'],
                                            'amount': n['amount'],
                                          }).toList(),
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context);
                                      await _fetchFeeds();
                                    } else {
                                      _showSnackBar(response['message']);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar('Error adding feed: $e');
                                  } finally {
                                    if (mounted) {
                                      setModalState(() => _isSubmitting = false);
                                    }
                                  }
                                }
                              },
                        child: _isSubmitting
                            ? CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              )
                            : Text(
                                "Add",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
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

  Future<void> _editFeed(Feed feed) async {
    if (_feedTypes.isEmpty || _nutrisiList.isEmpty) {
      _showSnackBar('Feed types or nutrisi not loaded yet.');
      return;
    }

    int typeId = feed.typeId;
    String name = feed.name;
    String unit = feed.unit;
    double minStock = feed.minStock;
    double price = feed.price;
    List<Map<String, dynamic>> selectedNutrisi = List.from(feed.nutrisiList.map((n) => {
          'id': n['id'],
          'name': n['name'],
          'amount': n['amount'],
          'unit': n['unit'],
        }));
    final _formKey = GlobalKey<FormState>();
    bool _isSubmitting = false;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setModalState) {
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
                            "Edit Feed: ${feed.name}",
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                              color: Colors.black87,
                            ),
                          ),
                          IconButton(
                            icon: Icon(Icons.close, color: Colors.grey[600]),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ],
                      ),
                      SizedBox(height: 12),
                      DropdownButtonFormField<int>(
                        decoration: InputDecoration(
                          labelText: 'Feed Type',
                          labelStyle: TextStyle(color: Colors.black87),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
                          ),
                          prefixIcon: Icon(Icons.category, color: Colors.blue[700]),
                        ),
                        value: typeId,
                        items: _feedTypes.map((type) {
                          return DropdownMenuItem<int>(
                            value: type.id,
                            child: Text(type.name),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setModalState(() {
                            typeId = value!;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Please select a feed type' : null,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        labelText: 'Name',
                        hintText: 'Enter feed name',
                        initialValue: name,
                        validator: (value) =>
                            value == null || value.isEmpty
                                ? 'Please enter the feed name'
                                : null,
                        onChanged: (value) => name = value,
                      ),
                      _buildTextFormField(
                        labelText: 'Unit',
                        hintText: 'Enter unit (e.g., kg)',
                        initialValue: unit,
                        validator: (value) =>
                            value == null || value.isEmpty
                                ? 'Please enter the unit'
                                : null,
                        onChanged: (value) => unit = value,
                      ),
                      _buildTextFormField(
                        labelText: 'Min Stock',
                        hintText: 'Enter minimum stock',
                        initialValue: minStock.toString(),
                        keyboardType: TextInputType.number,
                        validator: (value) =>
                            value == null || double.tryParse(value) == null
                                ? 'Please enter a valid number'
                                : null,
                        onChanged: (value) =>
                            minStock = double.tryParse(value) ?? 0.0,
                      ),
                      _buildTextFormField(
                        labelText: 'Price',
                        hintText: 'Enter price (e.g., 1500)',
                        initialValue: price.toString(),
                        keyboardType: TextInputType.number,
                        validator: (value) =>
                            value == null || double.tryParse(value) == null
                                ? 'Please enter a valid number'
                                : null,
                        onChanged: (value) =>
                            price = double.tryParse(value) ?? 0.0,
                        prefixText: 'Rp ',
                        onChangedText: (value) {
                          final cleanValue = value.replaceAll(RegExp(r'[^0-9.]'), '');
                          return formatPrice(double.tryParse(cleanValue) ?? 0.0);
                        },
                      ),
                      SizedBox(height: 12),
                      Text(
                        'Select Nutrients',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.blue[700],
                        ),
                      ),
                      SizedBox(height: 8),
                      _buildNutrientDropdown(
                        nutrisiList: _nutrisiList,
                        selectedNutrisi: selectedNutrisi,
                        onChanged: (newSelection) {
                          setModalState(() {
                            selectedNutrisi.clear();
                            selectedNutrisi.addAll(newSelection);
                          });
                        },
                      ),
                      SizedBox(height: 20),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blue[700],
                          padding: EdgeInsets.symmetric(vertical: 15),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          elevation: 2,
                        ),
                        onPressed: _isSubmitting
                            ? null
                            : () async {
                                if (_formKey.currentState!.validate()) {
                                  setModalState(() => _isSubmitting = true);
                                  try {
                                    final response = await _feedController.updateFeed(
                                      id: feed.id,
                                      typeId: typeId,
                                      name: name,
                                      unit: unit,
                                      minStock: minStock,
                                      price: price,
                                      userId: _userId,
                                      nutrisiList: selectedNutrisi.map((n) => {
                                            'nutrisi_id': n['id'],
                                            'amount': n['amount'],
                                          }).toList(),
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context);
                                      await _fetchFeeds();
                                    } else {
                                      _showSnackBar(response['message']);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar('Error updating feed: $e');
                                  } finally {
                                    if (mounted) {
                                      setModalState(() => _isSubmitting = false);
                                    }
                                  }
                                }
                              },
                        child: _isSubmitting
                            ? CircularProgressIndicator(
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              )
                            : Text(
                                "Save",
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
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

  Widget _buildNutrientDropdown({
    required List<Nutrisi> nutrisiList,
    required List<Map<String, dynamic>> selectedNutrisi,
    required Function(List<Map<String, dynamic>>) onChanged,
  }) {
    return Column(
      children: [
        Container(
          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[300]!),
            borderRadius: BorderRadius.circular(12),
            color: Colors.white,
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButtonFormField<Nutrisi>(
              decoration: InputDecoration(
                labelText: 'Select Nutrients',
                labelStyle: TextStyle(color: Colors.black87),
                border: InputBorder.none,
                prefixIcon: Icon(Icons.food_bank, color: Colors.blue[700]),
              ),
              isExpanded: true,
              hint: Text('Choose nutrients'),
              items: nutrisiList.map((nutrisi) {
                return DropdownMenuItem<Nutrisi>(
                  value: nutrisi,
                  child: Text(nutrisi.name),
                );
              }).toList(),
              onChanged: (Nutrisi? selected) {
                if (selected != null &&
                    !selectedNutrisi.any((n) => n['id'] == selected.id)) {
                  setState(() {
                    selectedNutrisi.add({
                      'id': selected.id,
                      'name': selected.name,
                      'amount': 0.0,
                      'unit': 'g', // Default unit, adjust as needed
                    });
                    onChanged(selectedNutrisi);
                  });
                }
              },
            ),
          ),
        ),
        SizedBox(height: 8),
        ...selectedNutrisi.map((nutrisi) {
          return Padding(
            padding: EdgeInsets.symmetric(vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    nutrisi['name'],
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
                  ),
                ),
                SizedBox(width: 8),
                Expanded(
                  child: TextFormField(
                    initialValue: nutrisi['amount'].toString(),
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      labelText: 'Amount',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 8, vertical: 10),
                      suffixText: nutrisi['unit'] ?? 'g',
                    ),
                    onChanged: (value) {
                      nutrisi['amount'] = double.tryParse(value) ?? 0.0;
                      onChanged(selectedNutrisi);
                    },
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.remove_circle, color: Colors.red[600]),
                  onPressed: () {
                    selectedNutrisi.removeWhere((n) => n['id'] == nutrisi['id']);
                    onChanged(selectedNutrisi);
                  },
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  void _showSnackBar(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.blue[700],
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: Text(
          "Feed Management",
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w600,
            color: Colors.white,
          ),
        ),
        backgroundColor: Colors.blue[700],
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: Column(
        children: [
          _buildSearchBar(),
          Expanded(
            child: _isLoading || _isLoadingFeedTypes || _isLoadingNutrisi
                ? Center(child: CircularProgressIndicator(color: Colors.blue[700]))
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Text(
                          _errorMessage,
                          style: TextStyle(color: Colors.red, fontSize: 16),
                        ),
                      )
                    : _filteredFeedList.isEmpty
                        ? Center(
                            child: Text(
                              "No feeds found",
                              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                            ),
                          )
                        : ListView.builder(
                            padding: EdgeInsets.symmetric(vertical: 10),
                            itemCount: _filteredFeedList.length,
                            itemBuilder: (context, index) {
                              final feed = _filteredFeedList[index];
                              return _buildFeedCard(feed);
                            },
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addFeed,
        child: Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.blue[700],
        elevation: 4,
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search feed...',
          prefixIcon: Icon(Icons.search, color: Colors.blue[700]),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
                  icon: Icon(Icons.clear, color: Colors.grey[600]),
                  onPressed: () {
                    if (mounted) {
                      setState(() {
                        _searchQuery = '';
                        _applyFilters();
                      });
                    }
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
          contentPadding: EdgeInsets.symmetric(vertical: 0, horizontal: 20),
        ),
        onChanged: (value) {
          if (mounted) {
            setState(() {
              _searchQuery = value;
              _applyFilters();
            });
          }
        },
      ),
    );
  }

  Widget _buildFeedCard(Feed feed) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      child: Card(
        elevation: 3,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.blue[100],
                    child: Icon(Icons.local_dining, color: Colors.blue[700], size: 24),
                    radius: 22,
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          feed.name,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Type: ${feed.typeName}',
                          style: TextStyle(fontSize: 14, color: Colors.grey[600]),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: Icon(Icons.edit, color: Colors.blue[700], size: 24),
                        onPressed: () => _editFeed(feed),
                      ),
                      IconButton(
                        icon: Icon(Icons.delete, color: Colors.red[600], size: 24),
                        onPressed: () => _deleteFeed(feed.id),
                      ),
                    ],
                  ),
                ],
              ),
              SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildInfoChip(Icons.scale, 'Unit: ${feed.unit}'),
                  _buildInfoChip(Icons.storage, 'Min Stock: ${formatNumber(feed.minStock)}'),
                ],
              ),
              SizedBox(height: 8),
              _buildInfoChip(Icons.monetization_on, formatPrice(feed.price)),
              SizedBox(height: 12),
              Text(
                'Nutrients:',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.blue[700],
                ),
              ),
              SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: feed.nutrisiList.isEmpty
                    ? [
                        Text(
                          'No nutrients available',
                          style: TextStyle(color: Colors.grey[600], fontSize: 14),
                        ),
                      ]
                    : feed.nutrisiList.map((nutrisi) {
                        return Container(
                          padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.grey[100],
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.grey[300]!),
                          ),
                          child: Text(
                            '${nutrisi['name']}: ${formatNumber(nutrisi['amount'])} ${nutrisi['unit']}',
                            style: TextStyle(fontSize: 13, color: Colors.black87),
                          ),
                        );
                      }).toList(),
              ),
              SizedBox(height: 8),
              Text(
                feed.createdAt.isNotEmpty
                    ? 'Created: ${DateFormat('dd MMM yyyy').format(DateTime.parse(feed.createdAt))}'
                    : 'Created: N/A',
                style: TextStyle(fontSize: 12, color: Colors.grey[500]),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: Colors.blue[700]),
          SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(fontSize: 13, color: Colors.blue[800]),
          ),
        ],
      ),
    );
  }

  Widget _buildTextFormField({
    required String labelText,
    String? hintText,
    String? initialValue,
    String? Function(String?)? validator,
    void Function(String)? onChanged,
    TextInputType? keyboardType,
    String? prefixText,
    String? Function(String)? onChangedText,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextFormField(
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText,
          labelStyle: TextStyle(color: Colors.black87),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.grey[300]!),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
          ),
          prefixIcon: labelText == 'Price'
              ? Icon(Icons.monetization_on, color: Colors.blue[700])
              : Icon(Icons.text_fields, color: Colors.blue[700]),
          prefixText: prefixText,
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        initialValue: initialValue,
        validator: validator,
        onChanged: onChanged,
        keyboardType: keyboardType,
        inputFormatters: onChangedText != null
            ? [
                TextInputFormatter.withFunction((oldValue, newValue) {
                  final formatted = onChangedText(newValue.text);
                  return newValue.copyWith(text: formatted);
                }),
              ]
            : null,
      ),
    );
  }

  Widget _buildReadOnlyListTile(IconData icon, String title, String subtitle) {
    return ListTile(
      leading: Icon(icon, color: Colors.blue[700]),
      title: Text(
        title,
        style: TextStyle(
          color: Colors.black87,
          fontWeight: FontWeight.w500,
          fontSize: 16,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: TextStyle(color: Colors.grey[600]),
      ),
      contentPadding: EdgeInsets.symmetric(horizontal: 0),
    );
  }
}
