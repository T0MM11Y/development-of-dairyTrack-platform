import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:intl/intl.dart';
import 'package:dairytrack_mobile/controller/APIURL3/reproductionController.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cattleDistributionController.dart';
import 'package:dairytrack_mobile/views/HealthCheckManagement/Reproduction/createReproduction.dart';
import 'package:dairytrack_mobile/views/HealthCheckManagement/Reproduction/editReproduction.dart';
import 'package:dairytrack_mobile/controller/APIURL1/cowManagementController.dart';

class ReproductionListView extends StatefulWidget {
  const ReproductionListView({super.key});

  @override
  State<ReproductionListView> createState() => _ReproductionListViewState();
}

class _ReproductionListViewState extends State<ReproductionListView> {
  final _controller = ReproductionController();
  final _cowController = CattleDistributionController();

  List<dynamic> _data = [];
  List<dynamic> _userManagedCows = [];
  List<dynamic> _femaleCows = [];
bool get _isAdmin => _currentUser?['role_id'] == 1;
bool get _isSupervisor => _currentUser?['role_id'] == 2;
bool get _isFarmer => _currentUser?['role_id'] == 3;

  int _currentPage = 1;
  final int _pageSize = 5;
  String _searchTerm = '';
  bool _loading = true;
  String? _error;
  Map<String, dynamic>? _currentUser;

  @override
  void initState() {
    super.initState();
    _loadUserAndData();
  }

 Future<void> _loadUserAndData() async {
  setState(() => _loading = true);
  try {
    final prefs = await SharedPreferences.getInstance();
    final userString = prefs.getString('user');

    if (userString == null) {
      setState(() {
        _error = 'User not found. Please log in again.';
        _loading = false;
      });
      return;
    }

    final user = jsonDecode(userString);
    _currentUser = user;

    List<Map<String, dynamic>> cowList = [];

    if (_isAdmin || _isSupervisor) {
      final allCows = await CowManagementController().listCows();
      cowList = allCows.map((c) => c.toJson()).toList().cast<Map<String, dynamic>>();
    } else {
      final userCowsRes = await _cowController.listCowsByUser(user['id']);
      cowList = List<Map<String, dynamic>>.from(userCowsRes['data']['cows'] ?? []);
    }

    setState(() {
      _userManagedCows = cowList;
      _femaleCows = cowList.where((c) => c['gender']?.toLowerCase() == 'female').toList();
    });

    await _fetchData();
  } catch (e) {
    debugPrint('❌ ERROR: $e');
    setState(() {
      _error = 'Failed to load data.';
      _loading = false;
    });
  }
}



  Future<void> _fetchData() async {
  setState(() => _loading = true);
  try {
    final res = await _controller.getReproductions();
    final rawData = res['data'];
    final reproductions = rawData is List ? rawData : (rawData['reproductions'] ?? []);

    final filtered = (_isAdmin || _isSupervisor)
        ? reproductions
        : reproductions.where((item) {
            final cowId = item['cow'] is Map ? item['cow']['id'] : item['cow'];
            return _userManagedCows.any((c) => c['id'] == cowId);
          }).toList();

    setState(() {
      _data = filtered;
      _loading = false;
    });
  } catch (e) {
    setState(() {
      _error = 'Failed to load data.';
      _loading = false;
    });
  }
}


  List<Map<String, dynamic>> get _paginatedData {
    final filtered = _data.where((item) {
      final cow = item['cow'];
      final cowName = cow is Map ? cow['name'] ?? '' : '';
      return cowName.toLowerCase().contains(_searchTerm.toLowerCase());
    }).toList();
    final start = (_currentPage - 1) * _pageSize;
    return filtered.skip(start).take(_pageSize).cast<Map<String, dynamic>>().toList();
  }
@override
Widget build(BuildContext context) {
  return Scaffold(
   appBar: AppBar(
  title: const Text(
    'Reproduction Data',
    style: TextStyle(
      fontWeight: FontWeight.bold,
      color: Colors.white,
      fontSize: 20,
      shadows: [Shadow(blurRadius: 4, color: Colors.black26)],
    ),
  ),
  centerTitle: true,
  elevation: 8,
  backgroundColor: _isFarmer
      ? Colors.teal[400]
      : _isSupervisor
          ? Colors.blue[700]
          : Colors.blueGrey[800],
),

   floatingActionButton: FloatingActionButton(
  tooltip: 'Add Data',
backgroundColor: _isFarmer
      ? Colors.teal[400]
      : _isSupervisor
          ? Colors.blue[700]
          : Colors.blueGrey[800],  onPressed: () {
    if (_isAdmin || _isSupervisor) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Access Denied'),
content: const Text('Your role does not have the required permissions to add reproduction data.'),

          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
      return;
    }

    if (_femaleCows.isEmpty) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
         title: const Text('No Female Cows Available'),
content: const Text(
  'Breeding data cannot be added because there are no available female cows.',
),

          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
      return;
    }


              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ReproductionCreateView(
                    onSaved: _fetchData,
                  ),
                ),
              );
            },
            child: const Icon(Icons.add),
          ),
    body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _error != null
            ? Center(child: Text(_error!))
            : Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(12.0),
                    child: TextField(
                      decoration: InputDecoration(
                        labelText: 'Search cow name...',
                        prefixIcon: const Icon(Icons.search),
                        filled: true,
                        fillColor: Colors.grey.shade100,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      onChanged: (val) => setState(() {
                        _searchTerm = val;
                        _currentPage = 1;
                      }),
                    ),
                  ),
                  Expanded(
                    child: _paginatedData.isEmpty
                        ? const Center(child: Text('No reproduction data available'))
                        : ListView.builder(
                            itemCount: _paginatedData.length,
                            itemBuilder: (context, index) {
                              final item = _paginatedData[index];
                              final cow = item['cow'] is Map ? item['cow'] : null;
                              final cowName = cow?['name'] ?? 'Sapi';
                              final cowBreed = cow?['breed'] ?? '-';
                              final conceptionRate = item['conception_rate'] ?? '-';
                              final calvingInterval = item['calving_interval'] ?? '-';
                              final servicePeriod = item['service_period'] ?? '-';

                              return Card(
                                elevation: 3,
                                shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12)),
                                margin: const EdgeInsets.symmetric(
                                    horizontal: 16, vertical: 8),
                                child: Padding(
                                  padding: const EdgeInsets.all(12),
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              '$cowName ($cowBreed)',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          Wrap(
                                            spacing: 6,
                                            children: [
                                             ElevatedButton.icon(
  icon: const Icon(Icons.edit, size: 18),
  label: const Text('Edit'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.orange,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 12),
  ),
  onPressed: () async {
    if (_isAdmin || _isSupervisor) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Access Denied'),
content: const Text('This role does not have permission to edit the data.'),

          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Close'),
            ),
          ],
        ),
      );
      return;
    }

                                                  final result = await Navigator.push(
                                                    context,
                                                    MaterialPageRoute(
                                                      builder: (context) => ReproductionEditView(
                                                        reproductionId: item['id'],
                                                        onSaved: _fetchData,
                                                      ),
                                                    ),
                                                  );
                                                  if (result == true) _fetchData();
                                                },
                                              ),
                                           ElevatedButton.icon(
  icon: const Icon(Icons.delete, size: 18),
  label: const Text('Delete'),
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.redAccent,
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 12),
  ),
  onPressed: () {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
       title: const Text('Deletion Not Allowed'),
content: const Text('This reproduction data cannot be deleted because it is part of the medical archive.'),

        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  },
),

                                            ],
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text('🔁 Conception Rate: $conceptionRate%',
                                          style: const TextStyle(fontSize: 14)),
                                      const SizedBox(height: 4),
                                      Text('👶 Calving Interval: $calvingInterval',
                                          style: const TextStyle(fontSize: 14)),
                                      const SizedBox(height: 4),
                                      Text('💉 Service Period: $servicePeriod',
                                          style: const TextStyle(fontSize: 14)),
                                      const SizedBox(height: 4),
Text(
  '🗓️ Recorded Date: ${item['recorded_at'] != null ? DateFormat("dd MMM yyyy", "id_ID").format(DateTime.parse(item['recorded_at']).toLocal()) : "-"}',
  style: TextStyle(fontSize: 14),
),
const SizedBox(height: 4),
Text(
  '👤 Recorded By: ${item['created_by']?['name'] ?? 'Uknown'}',
  style: TextStyle(fontSize: 14),
),

                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                  if (_data.length > _pageSize)
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            icon: const Icon(Icons.arrow_back),
                            onPressed: _currentPage > 1
                                ? () => setState(() => _currentPage--)
                                : null,
                          ),
                          Text('Page $_currentPage'),
                          IconButton(
                            icon: const Icon(Icons.arrow_forward),
                            onPressed: _currentPage * _pageSize < _data.length
                                ? () => setState(() => _currentPage++)
                                : null,
                          ),
                        ],
                      ),
                    ),
                ],
              ),
  );
} 
}