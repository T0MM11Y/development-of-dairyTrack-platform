import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedController.dart';
import 'package:dairytrack_mobile/controller/APIURL4/feedStockController.dart';

// Helper function to format numbers without trailing zeros
String formatNumber(double value) {
  final formatter = NumberFormat('#,##0', 'id_ID'); // Indonesian locale
  return formatter.format(value);
}

class Feed {
  final int id;
  final String name;
  final String unit;

  Feed({required this.id, required this.name, required this.unit});

  factory Feed.fromJson(Map<String, dynamic> json) {
    return Feed(
      id: json['id'],
      name: json['name'],
      unit: json['unit'] ?? 'kg', // Fallback unit
    );
  }
}

class FeedStock {
  final int id;
  final int feedId;
  final String feedName;
  final double stock;
  final String unit;
  final String updatedAt;

  FeedStock({
    required this.id,
    required this.feedId,
    required this.feedName,
    required this.stock,
    required this.unit,
    required this.updatedAt,
  });

  factory FeedStock.fromJson(Map<String, dynamic> json, String feedName, String unit) {
    final stockData = json['stock'];
    if (stockData == null) {
      throw Exception('Stock data is null for feed: $feedName');
    }
    return FeedStock(
      id: stockData['id'],
      feedId: stockData['feed_id'],
      feedName: feedName, // Use parent feed name since feed_name is null
      stock: stockData['stock'] is num
          ? (stockData['stock'] as num).toDouble()
          : double.tryParse(stockData['stock']?.toString() ?? '') ?? 0.0,
      unit: unit, // Use unit from Feed
      updatedAt: stockData['updated_at'] ?? '',
    );
  }
}

class FeedStockView extends StatefulWidget {
  @override
  _FeedStockViewState createState() => _FeedStockViewState();
}

class _FeedStockViewState extends State<FeedStockView> {
  final FeedStockManagementController _stockController = FeedStockManagementController();
  final FeedManagementController _feedController = FeedManagementController();
  List<FeedStock> _feedStockList = [];
  List<FeedStock> _filteredFeedStockList = [];
  List<Feed> _feedList = [];
  bool _isLoading = true;
  bool _isLoadingFeeds = true;
  String _errorMessage = '';
  String _searchQuery = '';
  final int _userId = 13; // Updated to match backend user_id

  @override
  void initState() {
    super.initState();
    _fetchFeeds();
    _fetchFeedStocks();
  }

  Future<void> _fetchFeeds() async {
    if (!mounted) return;
    setState(() => _isLoadingFeeds = true);
    try {
      final response = await _feedController.getAllFeeds();
      if (!mounted) return;
      if (response['success']) {
        setState(() {
          _feedList = (response['data'] as List)
              .map((json) => Feed.fromJson(json))
              .toList();
          _isLoadingFeeds = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch feeds';
          _isLoadingFeeds = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching feeds: $e';
        _isLoadingFeeds = false;
      });
    }
  }

  Future<void> _fetchFeedStocks() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final response = await _stockController.getAllFeedStocks();
      if (!mounted) return;
      if (response['success']) {
        // Map feed IDs to units from _feedList
        final feedUnits = {
          for (var feed in _feedList) feed.id: feed.unit,
        };
        setState(() {
          _feedStockList = (response['data'] as List)
              .where((json) => json['stock'] != null) // Filter out null stocks
              .map((json) {
                final feedName = json['name'] ?? 'Unknown Feed';
                final feedId = json['id'];
                final unit = feedUnits[feedId] ?? 'kg'; // Fallback to 'kg' if unit not found
                return FeedStock.fromJson(json, feedName, unit);
              })
              .toList();
          _applyFilters();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch feed stocks';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching feed stocks: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    if (!mounted) return;
    setState(() {
      _filteredFeedStockList = _feedStockList
          .where((stock) =>
              stock.feedName.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    });
  }

  Future<void> _addFeedStock() async {
    if (_feedList.isEmpty) {
      _showSnackBar('Feeds not loaded yet.');
      return;
    }

    int feedId = _feedList.first.id;
    double additionalStock = 0.0;
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
                            "Add Feed Stock",
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
                          labelText: 'Feed',
                          labelStyle: TextStyle(color: Colors.black87),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.blue[700]!, width: 2),
                          ),
                          prefixIcon: Icon(Icons.local_dining, color: Colors.blue[700]),
                        ),
                        value: feedId,
                        items: _feedList.map((feed) {
                          return DropdownMenuItem<int>(
                            value: feed.id,
                            child: Text('${feed.name} (${feed.unit})'),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setModalState(() {
                            feedId = value!;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Please select a feed' : null,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        labelText: 'Additional Stock',
                        hintText: 'Enter additional stock (e.g., 100)',
                        keyboardType: TextInputType.number,
                        validator: (value) =>
                            value == null || double.tryParse(value) == null
                                ? 'Please enter a valid number'
                                : null,
                        onChanged: (value) =>
                            additionalStock = double.tryParse(value) ?? 0.0,
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
                                    final response = await _stockController.addFeedStock(
                                      feedId: feedId,
                                      additionalStock: additionalStock,
                                      userId: _userId,
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context);
                                      await _fetchFeedStocks();
                                    } else {
                                      _showSnackBar(response['message']);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar('Error adding feed stock: $e');
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

  Future<void> _updateFeedStock(FeedStock stock) async {
    double newStock = stock.stock;
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
                            "Update Stock: ${stock.feedName}",
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
                      _buildReadOnlyListTile(
                          Icons.local_dining, "Feed", "${stock.feedName} (${stock.unit})"),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        labelText: 'New Stock',
                        hintText: 'Enter new stock (e.g., 100)',
                        initialValue: stock.stock.toString(),
                        keyboardType: TextInputType.number,
                        validator: (value) =>
                            value == null || double.tryParse(value) == null
                                ? 'Please enter a valid number'
                                : null,
                        onChanged: (value) =>
                            newStock = double.tryParse(value) ?? 0.0,
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
                                    final response = await _stockController.updateFeedStock(
                                      id: stock.id,
                                      stock: newStock,
                                      userId: _userId,
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context);
                                      await _fetchFeedStocks();
                                    } else {
                                      _showSnackBar(response['message']);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar('Error updating feed stock: $e');
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
          "Feed Stock Management",
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
            child: _isLoading || _isLoadingFeeds
                ? Center(child: CircularProgressIndicator(color: Colors.blue[700]))
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Text(
                          _errorMessage,
                          style: TextStyle(color: Colors.red, fontSize: 16),
                        ),
                      )
                    : _filteredFeedStockList.isEmpty
                        ? Center(
                            child: Text(
                              "No feed stocks found",
                              style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                            ),
                          )
                        : ListView.builder(
                            padding: EdgeInsets.symmetric(vertical: 10),
                            itemCount: _filteredFeedStockList.length,
                            itemBuilder: (context, index) {
                              final stock = _filteredFeedStockList[index];
                              return _buildFeedStockCard(stock);
                            },
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _addFeedStock,
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
          hintText: 'Search feed stock...',
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

  Widget _buildFeedStockCard(FeedStock stock) {
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
                    child: Icon(Icons.store, color: Colors.blue[700], size: 24),
                    radius: 22,
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          stock.feedName,
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Stock: ${formatNumber(stock.stock)} ${stock.unit}',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w600,
                            color: Colors.blue[800],
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: Icon(Icons.edit, color: Colors.blue[700], size: 24),
                    onPressed: () => _updateFeedStock(stock),
                  ),
                ],
              ),
              SizedBox(height: 8),
              _buildInfoChip(Icons.scale, 'Unit: ${stock.unit}'),
              SizedBox(height: 8),
              Text(
                stock.updatedAt.isNotEmpty
                    ? 'Updated: ${DateFormat('dd MMM yyyy').format(DateTime.parse(stock.updatedAt))}'
                    : 'Updated: N/A',
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
          prefixIcon: Icon(Icons.text_fields, color: Colors.blue[700]),
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
        initialValue: initialValue,
        validator: validator,
        onChanged: onChanged,
        keyboardType: keyboardType,
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
