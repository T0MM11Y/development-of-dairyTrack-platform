import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllDailyFeedSchedules extends StatefulWidget {
  const AllDailyFeedSchedules({super.key});

  @override
  _AllDailyFeedSchedulesState createState() => _AllDailyFeedSchedulesState();
}

class _AllDailyFeedSchedulesState extends State<AllDailyFeedSchedules> {
  String? searchQuery;
  Map<int, String> cowNames = {};
  Future<List<Map<String, dynamic>>>? _flattenedFeedsFuture;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _refreshDailyFeedSchedules();
  }

  // Format session and weather text like in the web version
  String _formatText(String? text) {
    if (text == null || text.isEmpty) return 'Tidak ada';
    return text[0].toUpperCase() + text.substring(1);
  }

  // Format date to match web display
  String _formatDate(String dateStr) {
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd MMM yyyy').format(date);
    } catch (e) {
      return dateStr; // Return original if parsing fails
    }
  }

  // Fetch and process data
  Future<List<Map<String, dynamic>>> fetchAndProcessFeeds() async {
    try {
      final results = await Future.wait([
        getAllDailyFeeds().catchError((e) {
          throw Exception('Failed to fetch daily feed schedules: $e');
        }),
        getCows().catchError((e) {
          throw Exception('Failed to fetch cows: $e');
        }),
      ]);

      final dailyFeeds = results[0] as List<DailyFeedSchedule>;
      List<Cow> cows;

      try {
        cows = results[1] as List<Cow>;
      } catch (e) {
        print('Error parsing cows: $e');
        cows = [];
      }

      cowNames = {};
      for (var cow in cows) {
        if (cow.id != null && cow.id != 0) {
          cowNames[cow.id!] = cow.name;
        }
      }

      // Filter by search query
      var filteredFeeds = dailyFeeds.where((feed) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            (cowNames[feed.cowId]?.toLowerCase() ?? '')
                .contains(searchQuery!.toLowerCase()) ||
            feed.date.toLowerCase().contains(searchQuery!.toLowerCase()) ||
            feed.session.toLowerCase().contains(searchQuery!.toLowerCase()) ||
            (feed.weather?.toLowerCase() ?? '')
                .contains(searchQuery!.toLowerCase());

        return matchesSearchQuery;
      }).toList();

      // Group feeds by date and cow
      Map<String, Map<String, dynamic>> groupedFeeds = {};

      for (var feed in filteredFeeds) {
        final key = '${feed.date}_${feed.cowId}';

        if (!groupedFeeds.containsKey(key)) {
          groupedFeeds[key] = {
            'cowId': feed.cowId,
            'date': feed.date,
            'sessions': <Map<String, dynamic>>[],
          };
        }

        groupedFeeds[key]!['sessions']!.add({
          'id': feed.id,
          'session': feed.session,
          'weather': feed.weather ?? 'Tidak ada',
        });
      }

      // Create flattened rows for display
      List<Map<String, dynamic>> groupedRows = [];
      groupedFeeds.forEach((key, group) {
        groupedRows.add({
          'cowId': group['cowId'],
          'date': group['date'],
          'sessions': group['sessions'],
        });
      });

      return groupedRows;
    } catch (e) {
      print('Error fetching data: $e');
      throw Exception('Failed to fetch data: $e');
    }
  }

  void _refreshDailyFeedSchedules() {
    if (mounted) {
      setState(() {
        isLoading = true;
        _flattenedFeedsFuture = fetchAndProcessFeeds().catchError((error) {
          print('Error in future: $error');
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('$error')),
            );
          }
          return <Map<String, dynamic>>[];
        }).whenComplete(() {
          if (mounted) {
            setState(() {
              isLoading = false;
            });
          }
        });
      });
    }
  }

  void _showDeleteConfirmation(int id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Konfirmasi'),
        content: const Text('Apakah kamu yakin ingin menghapus data ini?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              if (mounted) {
                setState(() {
                  isLoading = true;
                });
              }
              try {
                await deleteDailyFeed(id);
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Data berhasil dihapus')),
                  );
                  _refreshDailyFeedSchedules();
                }
              } catch (e) {
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Gagal menghapus data: $e')),
                  );
                }
              } finally {
                if (mounted) {
                  setState(() {
                    isLoading = false;
                  });
                }
              }
            },
            child: const Text('Hapus', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Data Pakan Harian'),
        backgroundColor: const Color(0xFF17A2B8),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              constraints: const BoxConstraints(maxWidth: 250),
              child: TextFormField(
                decoration: const InputDecoration(
                  labelText: 'Cari...',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.search),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12),
                ),
                onChanged: (value) {
                  if (mounted) {
                    setState(() {
                      searchQuery = value.trim();
                      _refreshDailyFeedSchedules();
                    });
                  }
                },
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: FutureBuilder<List<Map<String, dynamic>>>(
                future: _flattenedFeedsFuture,
                builder: (context, snapshot) {
                  if (isLoading) {
                    return const Center(child: CircularProgressIndicator());
                  } else if (snapshot.hasError) {
                    return Center(child: Text('Error: ${snapshot.error}'));
                  } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
                    return Center(
                      child: Text(
                        searchQuery != null && searchQuery!.isNotEmpty
                            ? 'Tidak ada hasil pencarian.'
                            : 'Belum ada data pakan tersedia.',
                      ),
                    );
                  }

                  final feedGroups = snapshot.data!;

                  return ListView.builder(
                    itemCount: feedGroups.length,
                    itemBuilder: (context, index) {
                      final group = feedGroups[index];
                      final sessions =
                          group['sessions'] as List<Map<String, dynamic>>;

                      return Card(
                        elevation: 2,
                        margin: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Header: Cow Name, Date
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    cowNames[group['cowId']] ??
                                        'Sapi #${group['cowId']}',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    _formatDate(group['date']),
                                    style: const TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              // Sessions List
                              Column(
                                children: sessions.map((session) {
                                  return Container(
                                    padding:
                                        const EdgeInsets.symmetric(vertical: 8),
                                    decoration: BoxDecoration(
                                      border: Border(
                                        bottom: BorderSide(
                                          color: Colors.grey.shade200,
                                          width: 1,
                                        ),
                                      ),
                                    ),
                                    child: Row(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceBetween,
                                      children: [
                                        Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'Sesi: ${_formatText(session['session'])}',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            Text(
                                              'Cuaca: ${_formatText(session['weather'])}',
                                              style: const TextStyle(
                                                fontSize: 14,
                                                color: Colors.black54,
                                              ),
                                            ),
                                          ],
                                        ),
                                        Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            IconButton(
                                              icon: const Icon(
                                                Icons.edit,
                                                color: Colors.orange,
                                              ),
                                              onPressed: () {
                                                Navigator.pushNamed(
                                                  context,
                                                  '/edit-jadwal-pakan',
                                                  arguments: session['id'],
                                                ).then((_) {
                                                  if (mounted) {
                                                    _refreshDailyFeedSchedules();
                                                  }
                                                });
                                              },
                                              tooltip: 'Edit',
                                            ),
                                            IconButton(
                                              icon: const Icon(
                                                Icons.delete,
                                                color: Colors.red,
                                              ),
                                              onPressed: () {
                                                _showDeleteConfirmation(
                                                    session['id']);
                                              },
                                              tooltip: 'Hapus',
                                            ),
                                          ],
                                        ),
                                      ],
                                    ),
                                  );
                                }).toList(),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/tambah-jadwal-pakan').then((_) {
            if (mounted) {
              _refreshDailyFeedSchedules();
            }
          }); // Removed the stray comma
        },
        backgroundColor: const Color(0xFF17A2B8),
        child: const Icon(Icons.add),
      ),
    );
  }
}
