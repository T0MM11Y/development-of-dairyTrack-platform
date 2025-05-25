import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dairytrack_mobile/controller/APIURL4/dailyScheduleController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart'; // Hypothetical
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart'; // Hypothetical

class DailyFeed {
  final int id;
  final int cowId;
  final String cowName;
  final String date;
  final String session;
  final String weather;
  final Map<String, dynamic> totalNutrients;
  final int userId;
  final String userName;
  final Map<String, dynamic> createdBy;
  final Map<String, dynamic> updatedBy;
  final String createdAt;
  final String updatedAt;
  final List<Map<String, dynamic>> items;

  DailyFeed({
    required this.id,
    required this.cowId,
    required this.cowName,
    required this.date,
    required this.session,
    required this.weather,
    required this.totalNutrients,
    required this.userId,
    required this.userName,
    required this.createdBy,
    required this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
    required this.items,
  });

  factory DailyFeed.fromJson(Map<String, dynamic> json) {
    try {
      return DailyFeed(
        id: json['id'] is int
            ? json['id']
            : int.tryParse(json['id'].toString()) ?? 0,
        cowId: json['cow_id'] is int
            ? json['cow_id']
            : int.tryParse(json['cow_id'].toString()) ?? 0,
        cowName: json['cow_name'] ?? 'Unknown Cow',
        date: json['date'] ?? '',
        session: json['session'] ?? '',
        weather: json['weather'] ?? 'Tidak ada data',
        totalNutrients: json['total_nutrients'] is Map
            ? json['total_nutrients']
            : (json['total_nutrients'] is List
                ? {}
                : json['total_nutrients'] ?? {}),
        userId: json['user_id'] is int
            ? json['user_id']
            : int.tryParse(json['user_id'].toString()) ?? 0,
        userName: json['user_name'] ?? 'Unknown User',
        createdBy: json['created_by'] ?? {'id': 0, 'name': 'Unknown'},
        updatedBy: json['updated_by'] ?? {'id': 0, 'name': 'Unknown'},
        createdAt: json['created_at'] ?? '',
        updatedAt: json['updated_at'] ?? '',
        items:
            (json['items'] as List<dynamic>?)?.cast<Map<String, dynamic>>() ??
                [],
      );
    } catch (e) {
      print('Error parsing DailyFeed: $e, JSON: $json');
      rethrow;
    }
  }
}

class DailyFeedView extends StatefulWidget {
  @override
  _DailyFeedViewState createState() => _DailyFeedViewState();
}

class _DailyFeedViewState extends State<DailyFeedView> {
  final DailyFeedManagementController _feedController =
      DailyFeedManagementController();
  final CowManagementController _cowController = CowManagementController();
  final CattleDistributionController _cowDistributionController =
      CattleDistributionController();
  List<DailyFeed> _feeds = [];
  List<DailyFeed> _filteredFeeds = [];
  List<Cow> _cows = [];
  List<Map<String, dynamic>> _cowsWithMissingSessions = [];
  bool _isLoading = true;
  bool _isLoadingCows = true;
  String _errorMessage = '';
  String _searchQuery = '';
  String _selectedDate = DateFormat('yyyy-MM-dd').format(DateTime.now());
  String? _userRole;
  int _userId = 13; // Default, updated dynamically
  final List<String> _sessions = ['Pagi', 'Siang', 'Sore'];

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userRole = prefs.getString('role')?.toLowerCase();

      // Ambil userId dengan penanganan tipe yang lebih aman
      final userIdRaw =
          prefs.get('userId'); // Menggunakan get() untuk menangani tipe apapun
      String userIdString;

      if (userIdRaw == null) {
        userIdString = '13'; // Default jika null
      } else if (userIdRaw is String) {
        userIdString = userIdRaw;
      } else if (userIdRaw is int) {
        userIdString = userIdRaw.toString(); // Konversi int ke String
      } else {
        userIdString = '13'; // Default jika tipe tidak dikenali
        print(
            'Warning: userId is of unexpected type (${userIdRaw.runtimeType}), defaulting to 13');
      }

      _userId = int.tryParse(userIdString) ?? 13;
      if (int.tryParse(userIdString) == null) {
        print(
            'Warning: userId "$userIdString" is not a valid integer, defaulting to 13');
      }
    });
    await _fetchCows();
    await _fetchDailyFeeds();
  }

  Future<void> _fetchCows() async {
  if (!mounted) return;
  setState(() => _isLoadingCows = true);
  try {
    if (_userRole == 'farmer') {
      final response = await _cowDistributionController.listCowsByUser(_userId);
      if (!mounted) return;
      if (response['success'] && response['data'] is List) {
        setState(() {
          _cows = (response['data'] as List)
              .map((json) => Cow.fromJson(json as Map<String, dynamic>))
              .toList();
          _isLoadingCows = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch cows';
          _isLoadingCows = false;
        });
      }
    } else {
      final response = await _cowController.listCows();
      if (!mounted) return;
      // Karena response adalah List<Cow> dari CowManagementController, langsung gunakan
      // tapi tambahkan pengecekan tipe untuk mencegah error
      if (response is List<Cow>) {
        setState(() {
          _cows = response;
          _isLoadingCows = false;
        });
      } else {
        setState(() {
          _errorMessage = 'Unexpected response type: ${response.runtimeType}';
          _isLoadingCows = false;
        });
      }
    }
  } catch (e) {
    if (!mounted) return;
    setState(() {
      _errorMessage = 'Error fetching cows: $e';
      _isLoadingCows = false;
    });
  }
}

  Future<void> _fetchDailyFeeds() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final response = await _feedController.getAllDailyFeeds(
        date: _selectedDate,
        userId: _userId,
      );
      if (!mounted) return;
      if (response['success']) {
        final List<DailyFeed> feeds = (response['data'] as List)
            .map((json) => DailyFeed.fromJson(json))
            .toList();
        if (_userRole == 'farmer') {
          final cowIds = _cows.map((cow) => cow.id).toSet();
          feeds.retainWhere((feed) => cowIds.contains(feed.cowId));
        }
        setState(() {
          _feeds = feeds;
          _applyFilters();
          _calculateMissingSessions();
          _isLoading = false;
        });
      } else {
        setState(() {
          _errorMessage = response['message'] ?? 'Failed to fetch daily feeds';
          _isLoading = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Error fetching daily feeds: $e';
        _isLoading = false;
      });
    }
  }

  void _applyFilters() {
    if (!mounted) return;
    setState(() {
      _filteredFeeds = _feeds
          .where((feed) =>
              feed.cowName.toLowerCase().contains(_searchQuery.toLowerCase()))
          .toList();
    });
  }

  void _calculateMissingSessions() {
    final groupedFeeds = _feeds.fold<Map<String, Map<String, dynamic>>>(
      {},
      (acc, feed) {
        final key = '${feed.cowId}_${feed.date}';
        if (!acc.containsKey(key)) {
          acc[key] = {
            'cowId': feed.cowId,
            'cowName': feed.cowName,
            'date': feed.date,
            'sessions': <DailyFeed>[],
          };
        }
        acc[key]!['sessions'].add(feed);
        return acc;
      },
    );

    final missing = _cows
        .map((cow) {
          final key = '${cow.id}_$_selectedDate';
          final existingSessions =
              (groupedFeeds[key]?['sessions'] as List<DailyFeed>?)
                      ?.map((feed) => feed.session)
                      .toList() ??
                  [];
          final missingSessions = _sessions
              .where((session) => !existingSessions.contains(session))
              .toList();
          if (missingSessions.isNotEmpty) {
            return {
              'id': cow.id,
              'name': cow.name,
              'missingSessions': missingSessions,
            };
          }
          return null;
        })
        .whereType<Map<String, dynamic>>()
        .toList();

    setState(() {
      _cowsWithMissingSessions = missing;
    });
  }

  Future<void> _createDailyFeed() async {
    if (_cows.isEmpty) {
      _showSnackBar('No cows available.');
      return;
    }

    int cowId = _cows.first.id;
    String session = _sessions.first;
    String weather = '';
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
                            "Add Daily Feed",
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
                          labelText: 'Cow',
                          labelStyle: TextStyle(color: Colors.black87),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                BorderSide(color: Colors.blue[700]!, width: 2),
                          ),
                          prefixIcon: Icon(Icons.pets, color: Colors.blue[700]),
                        ),
                        value: cowId,
                        items: _cows.map((cow) {
                          return DropdownMenuItem<int>(
                            value: cow.id,
                            child: Text(cow.name),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setModalState(() {
                            cowId = value!;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Please select a cow' : null,
                      ),
                      SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        decoration: InputDecoration(
                          labelText: 'Session',
                          labelStyle: TextStyle(color: Colors.black87),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                BorderSide(color: Colors.blue[700]!, width: 2),
                          ),
                          prefixIcon:
                              Icon(Icons.schedule, color: Colors.blue[700]),
                        ),
                        value: session,
                        items: _sessions.map((s) {
                          return DropdownMenuItem<String>(
                            value: s,
                            child: Text(s),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setModalState(() {
                            session = value!;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Please select a session' : null,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        labelText: 'Weather',
                        hintText: 'Enter weather (e.g., Cerah)',
                        validator: (value) => value == null || value.isEmpty
                            ? 'Please enter the weather'
                            : null,
                        onChanged: (value) => weather = value,
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
                                    final response =
                                        await _feedController.createDailyFeed(
                                      cowId: cowId,
                                      date: _selectedDate,
                                      session: session,
                                      userId: _userId,
                                      items: [],
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context);
                                      await _fetchDailyFeeds();
                                    } else {
                                      _showSnackBar(response['message']);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar(
                                        'Error creating daily feed: $e');
                                  } finally {
                                    if (mounted) {
                                      setModalState(
                                          () => _isSubmitting = false);
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

  Future<void> _updateDailyFeed(DailyFeed feed) async {
    int cowId = feed.cowId;
    String session = feed.session;
    String weather = feed.weather;
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
                            "Update Daily Feed: ${feed.cowName}",
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
                      _buildReadOnlyListTile(Icons.tag, "ID", "${feed.id}"),
                      SizedBox(height: 12),
                      DropdownButtonFormField<int>(
                        decoration: InputDecoration(
                          labelText: 'Cow',
                          labelStyle: TextStyle(color: Colors.black87),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                BorderSide(color: Colors.blue[700]!, width: 2),
                          ),
                          prefixIcon: Icon(Icons.pets, color: Colors.blue[700]),
                        ),
                        value: cowId,
                        items: _cows.map((cow) {
                          return DropdownMenuItem<int>(
                            value: cow.id,
                            child: Text(cow.name),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setModalState(() {
                            cowId = value!;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Please select a cow' : null,
                      ),
                      SizedBox(height: 12),
                      DropdownButtonFormField<String>(
                        decoration: InputDecoration(
                          labelText: 'Session',
                          labelStyle: TextStyle(color: Colors.black87),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: BorderSide(color: Colors.grey[300]!),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide:
                                BorderSide(color: Colors.blue[700]!, width: 2),
                          ),
                          prefixIcon:
                              Icon(Icons.schedule, color: Colors.blue[700]),
                        ),
                        value: session,
                        items: _sessions.map((s) {
                          return DropdownMenuItem<String>(
                            value: s,
                            child: Text(s),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setModalState(() {
                            session = value!;
                          });
                        },
                        validator: (value) =>
                            value == null ? 'Please select a session' : null,
                      ),
                      SizedBox(height: 12),
                      _buildTextFormField(
                        labelText: 'Weather',
                        hintText: 'Enter weather (e.g., Cerah)',
                        initialValue: weather,
                        validator: (value) => value == null || value.isEmpty
                            ? 'Please enter the weather'
                            : null,
                        onChanged: (value) => weather = value,
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
                                    final response =
                                        await _feedController.updateDailyFeed(
                                      id: feed.id,
                                      cowId: cowId,
                                      date: feed.date,
                                      session: session,
                                      userId: _userId,
                                      items: feed.items,
                                    );
                                    if (!mounted) return;
                                    if (response['success']) {
                                      _showSnackBar(response['message']);
                                      Navigator.pop(context);
                                      await _fetchDailyFeeds();
                                    } else {
                                      _showSnackBar(response['message']);
                                    }
                                  } catch (e) {
                                    if (!mounted) return;
                                    _showSnackBar(
                                        'Error updating daily feed: $e');
                                  } finally {
                                    if (mounted) {
                                      setModalState(
                                          () => _isSubmitting = false);
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

  Future<void> _deleteDailyFeed(
      int id, String cowName, String date, String session) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          "Delete Daily Feed",
          style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black87),
        ),
        content: Text(
          "Are you sure you want to delete the $session feed schedule for $cowName on $date?",
          style: TextStyle(color: Colors.grey[800]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              "Cancel",
              style: TextStyle(color: Colors.grey[600]),
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
      try {
        final response = await _feedController.deleteDailyFeed(id, _userId);
        if (!mounted) return;
        if (response['success']) {
          _showSnackBar(response['message']);
          await _fetchDailyFeeds();
        } else {
          _showSnackBar(response['message']);
        }
      } catch (e) {
        if (!mounted) return;
        _showSnackBar('Error deleting daily feed: $e');
      }
    }
  }

  Future<void> _autoCreateDailyFeed(
      int cowId, String cowName, String session) async {
    final formattedDate =
        DateFormat('dd MMM yyyy').format(DateTime.parse(_selectedDate));
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          "Create Feed Schedule",
          style: TextStyle(fontWeight: FontWeight.w600, color: Colors.black87),
        ),
        content: Text(
          "Create $session schedule for $cowName on $formattedDate?",
          style: TextStyle(color: Colors.grey[800]),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              "Cancel",
              style: TextStyle(color: Colors.grey[600]),
            ),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(
              "Create",
              style: TextStyle(color: Colors.blue[700]),
            ),
          ),
        ],
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      ),
    );

    if (confirm == true) {
      try {
        final response = await _feedController.createDailyFeed(
          cowId: cowId,
          date: _selectedDate,
          session: session,
          userId: _userId,
          items: [],
        );
        if (!mounted) return;
        if (response['success']) {
          _showSnackBar(response['message']);
          await _fetchDailyFeeds();
        } else {
          _showSnackBar(response['message']);
        }
      } catch (e) {
        if (!mounted) return;
        _showSnackBar('Error creating daily feed: $e');
      }
    }
  }

  void _showCowsWithMissingSessions() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return Container(
          padding: EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(25)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Cows with Missing Schedules',
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
              _cowsWithMissingSessions.isEmpty
                  ? Text(
                      _cows.isEmpty
                          ? 'No cows available.'
                          : 'All cows have complete schedules for this date.',
                      style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                    )
                  : Flexible(
                      child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: _cowsWithMissingSessions.length,
                        itemBuilder: (context, index) {
                          final cow = _cowsWithMissingSessions[index];
                          return Card(
                            elevation: 2,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                            margin: EdgeInsets.symmetric(vertical: 4),
                            child: Padding(
                              padding: EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        cow['name'],
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w600,
                                          color: Colors.black87,
                                        ),
                                      ),
                                      _buildInfoChip(
                                        Icons.warning,
                                        'Missing: ${cow['missingSessions'].join(', ')}',
                                      ),
                                    ],
                                  ),
                                  if (_userRole == 'farmer') ...[
                                    SizedBox(height: 8),
                                    Wrap(
                                      spacing: 8,
                                      children: (cow['missingSessions']
                                              as List<String>)
                                          .map((session) => ElevatedButton(
                                                style: ElevatedButton.styleFrom(
                                                  backgroundColor:
                                                      Colors.blue[700],
                                                  shape: RoundedRectangleBorder(
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                            8),
                                                  ),
                                                  padding: EdgeInsets.symmetric(
                                                      horizontal: 12,
                                                      vertical: 8),
                                                ),
                                                onPressed: () =>
                                                    _autoCreateDailyFeed(
                                                  cow['id'],
                                                  cow['name'],
                                                  session,
                                                ),
                                                child: Text(
                                                  'Create $session',
                                                  style: TextStyle(
                                                    color: Colors.white,
                                                    fontSize: 12,
                                                  ),
                                                ),
                                              ))
                                          .toList(),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
              SizedBox(height: 20),
            ],
          ),
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
          "Daily Feed Schedules",
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
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    readOnly: true,
                    decoration: InputDecoration(
                      labelText: 'Select Date',
                      labelStyle: TextStyle(color: Colors.black87),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide:
                            BorderSide(color: Colors.blue[700]!, width: 2),
                      ),
                      prefixIcon:
                          Icon(Icons.calendar_today, color: Colors.blue[700]),
                      contentPadding:
                          EdgeInsets.symmetric(vertical: 0, horizontal: 12),
                    ),
                    controller: TextEditingController(
                      text: DateFormat('dd MMM yyyy').format(
                        DateTime.parse(_selectedDate),
                      ),
                    ),
                    onTap: () async {
                      final DateTime? picked = await showDatePicker(
                        context: context,
                        initialDate: DateTime.parse(_selectedDate),
                        firstDate: DateTime(2000),
                        lastDate: DateTime.now(),
                      );
                      if (picked != null && mounted) {
                        setState(() {
                          _selectedDate =
                              DateFormat('yyyy-MM-dd').format(picked);
                        });
                        await _fetchDailyFeeds();
                      }
                    },
                  ),
                ),
                SizedBox(width: 8),
                IconButton(
                  icon: Icon(Icons.list_alt, color: Colors.blue[700]),
                  onPressed: _showCowsWithMissingSessions,
                  tooltip: 'Cows with Missing Schedules',
                ),
              ],
            ),
          ),
          _buildSearchBar(),
          Expanded(
            child: _isLoading || _isLoadingCows
                ? Center(
                    child: CircularProgressIndicator(color: Colors.blue[700]))
                : _errorMessage.isNotEmpty
                    ? Center(
                        child: Text(
                          _errorMessage,
                          style: TextStyle(color: Colors.red, fontSize: 16),
                        ),
                      )
                    : _filteredFeeds.isEmpty
                        ? Center(
                            child: Text(
                              "No feed schedules for this date.",
                              style: TextStyle(
                                  fontSize: 16, color: Colors.grey[600]),
                            ),
                          )
                        : ListView.builder(
                            padding: EdgeInsets.symmetric(vertical: 10),
                            itemCount: _groupedFeeds.length,
                            itemBuilder: (context, index) {
                              final group = _groupedFeeds[index];
                              return _buildFeedGroupCard(group);
                            },
                          ),
          ),
        ],
      ),
      floatingActionButton: _userRole == 'farmer'
          ? FloatingActionButton(
              onPressed: _createDailyFeed,
              child: Icon(Icons.add, color: Colors.white),
              backgroundColor: Colors.blue[700],
              elevation: 4,
            )
          : null,
    );
  }

  List<Map<String, dynamic>> get _groupedFeeds {
    final grouped = _filteredFeeds.fold<Map<String, Map<String, dynamic>>>(
      {},
      (acc, feed) {
        final key = '${feed.cowId}_${feed.date}';
        if (!acc.containsKey(key)) {
          acc[key] = {
            'cowId': feed.cowId,
            'cowName': feed.cowName,
            'date': feed.date,
            'sessions': <DailyFeed>[],
          };
        }
        acc[key]!['sessions'].add(feed);
        return acc;
      },
    );
    return grouped.values.toList();
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12),
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search by cow name...',
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

  Widget _buildFeedGroupCard(Map<String, dynamic> group) {
    final sessions = group['sessions'] as List<DailyFeed>;
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
                    child: Icon(Icons.pets, color: Colors.blue[700], size: 24),
                    radius: 22,
                  ),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          group['cowName'],
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: Colors.black87,
                          ),
                        ),
                        SizedBox(height: 4),
                        Text(
                          'Date: ${DateFormat('dd MMM yyyy').format(DateTime.parse(group['date']))}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              SizedBox(height: 12),
              ...sessions.map((feed) => Padding(
                    padding: EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _buildInfoChip(
                                  Icons.schedule, 'Session: ${feed.session}'),
                              SizedBox(height: 4),
                              _buildInfoChip(
                                  Icons.cloud, 'Weather: ${feed.weather}'),
                              SizedBox(height: 4),
                              _buildInfoChip(Icons.fastfood,
                                  'Items: ${feed.items.length}'),
                            ],
                          ),
                        ),
                        if (_userRole == 'farmer') ...[
                          IconButton(
                            icon: Icon(Icons.edit,
                                color: Colors.blue[700], size: 24),
                            onPressed: () => _updateDailyFeed(feed),
                          ),
                          IconButton(
                            icon:
                                Icon(Icons.delete, color: Colors.red, size: 24),
                            onPressed: () => _deleteDailyFeed(
                              feed.id,
                              feed.cowName,
                              DateFormat('dd MMM yyyy')
                                  .format(DateTime.parse(feed.date)),
                              feed.session,
                            ),
                          ),
                        ],
                      ],
                    ),
                  )),
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
