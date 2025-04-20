import 'package:dairy_track/config/api/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/config/api/peternakan/cow.dart';
import 'package:dairy_track/config/api/peternakan/farmer.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/peternakan/farmer.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

class AllDailyFeedSchedules extends StatefulWidget {
  const AllDailyFeedSchedules({super.key});

  @override
  _AllDailyFeedSchedulesState createState() => _AllDailyFeedSchedulesState();
}

class _AllDailyFeedSchedulesState extends State<AllDailyFeedSchedules> {
  String? searchQuery;
  Map<int, String> farmerNames = {};
  Map<int, String> cowNames = {};
  Future<List<DailyFeedSchedule>>? _dailyFeedSchedulesFuture;

  @override
  void initState() {
    super.initState();
    _refreshDailyFeedSchedules();
  }

  Future<List<DailyFeedSchedule>> fetchDailyFeedSchedules() async {
    try {
      final results = await Future.wait([
        getDailyFeedSchedules().catchError((e) {
          throw Exception('Failed to fetch daily feed schedules: $e');
        }),
        getFarmers().catchError((e) {
          throw Exception('Failed to fetch farmers: $e');
        }),
        getCows().catchError((e) {
          throw Exception('Failed to fetch cows: $e');
        }),
      ]);

      final dailyFeeds = results[0] as List<DailyFeedSchedule>;
      List<Peternak> farmers;
      List<Cow> cows;

      // Safely handle farmers
      try {
        farmers = results[1] as List<Peternak>;
      } catch (e) {
        print('Error parsing farmers: $e');
        farmers = [];
      }

      // Safely handle cows
      try {
        cows = results[2] as List<Cow>;
      } catch (e) {
        print('Error parsing cows: $e');
        cows = [];
      }

      farmerNames = {
        for (var farmer in farmers)
          if (farmer.id != 0)
            farmer.id: '${farmer.firstName} ${farmer.lastName}',
      };
      cowNames = {
        for (var cow in cows)
          if (cow.id != 0) cow.id: cow.name,
      };

      return dailyFeeds.where((dailyFeed) {
        final matchesSearchQuery = searchQuery == null ||
            searchQuery!.isEmpty ||
            (farmerNames[dailyFeed.farmerId]?.toLowerCase() ?? '')
                .contains(searchQuery!.toLowerCase()) ||
            (cowNames[dailyFeed.cowId]?.toLowerCase() ?? '')
                .contains(searchQuery!.toLowerCase()) ||
            DateFormat('dd MMM yyyy')
                .format(dailyFeed.date)
                .toLowerCase()
                .contains(searchQuery!.toLowerCase()) ||
            dailyFeed.session
                .toLowerCase()
                .contains(searchQuery!.toLowerCase()) ||
            (dailyFeed.weather?.toLowerCase() ?? '')
                .contains(searchQuery!.toLowerCase()) ||
            dailyFeed.totalProtein
                .toString()
                .contains(searchQuery!.toLowerCase()) ||
            dailyFeed.totalEnergy
                .toString()
                .contains(searchQuery!.toLowerCase()) ||
            dailyFeed.totalFiber
                .toString()
                .contains(searchQuery!.toLowerCase()) ||
            dailyFeed.feedItems.any((item) =>
                item.feed?.name
                    .toLowerCase()
                    .contains(searchQuery!.toLowerCase()) ??
                false);

        return matchesSearchQuery;
      }).toList();
    } catch (e) {
      throw Exception('Failed to fetch data: $e');
    }
  }

  void _refreshDailyFeedSchedules() {
    setState(() {
      _dailyFeedSchedulesFuture = fetchDailyFeedSchedules().catchError((error) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('$error')),
          );
        }
        return <DailyFeedSchedule>[]; // Return empty list on error
      });
    });
  }

  String _formatSession(String session) {
    return session.isNotEmpty
        ? session[0].toUpperCase() + session.substring(1)
        : session;
  }

  // Group daily feeds by cowId and date
  Map<String, List<DailyFeedSchedule>> _groupByCowAndDate(
      List<DailyFeedSchedule> dailyFeeds) {
    Map<String, List<DailyFeedSchedule>> grouped = {};

    for (var feed in dailyFeeds) {
      String key =
          '${feed.cowId}_${DateFormat('yyyy-MM-dd').format(feed.date)}';
      if (!grouped.containsKey(key)) {
        grouped[key] = [];
      }
      grouped[key]!.add(feed);
    }

    return grouped;
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
                  setState(() {
                    searchQuery = value.trim();
                    _refreshDailyFeedSchedules();
                  });
                },
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: FutureBuilder<List<DailyFeedSchedule>>(
                future: _dailyFeedSchedulesFuture,
                builder: (context, snapshot) {
                  if (_dailyFeedSchedulesFuture == null) {
                    return const Center(child: CircularProgressIndicator());
                  }
                  if (snapshot.connectionState == ConnectionState.waiting) {
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

                  final dailyFeeds = snapshot.data!;
                  // Group by cow and date
                  final groupedFeeds = _groupByCowAndDate(dailyFeeds);

                  return ListView.builder(
                    itemCount: groupedFeeds.length,
                    itemBuilder: (context, index) {
                      final key = groupedFeeds.keys.elementAt(index);
                      final feedsForGroup = groupedFeeds[key]!;
                      final firstFeed = feedsForGroup.first;

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
                              // Header: Cow Name, Date, Farmer
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    cowNames[firstFeed.cowId] ??
                                        'Sapi #${firstFeed.cowId}',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  Text(
                                    DateFormat('dd MMM yyyy')
                                        .format(firstFeed.date),
                                    style: const TextStyle(
                                      fontSize: 16,
                                      color: Colors.grey,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Petani: ${farmerNames[firstFeed.farmerId] ?? 'Petani #${firstFeed.farmerId}'}',
                                style: const TextStyle(
                                  fontSize: 14,
                                  color: Colors.black54,
                                ),
                              ),
                              const SizedBox(height: 12),
                              // Sessions List
                              Column(
                                children: feedsForGroup.map((feed) {
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
                                              'Sesi: ${_formatSession(feed.session)}',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                            Text(
                                              'Cuaca: ${feed.weather != null ? _formatSession(feed.weather!) : 'Tidak ada'}',
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
                                                  arguments: feed,
                                                ).then((result) {
                                                  if (result == true &&
                                                      mounted) {
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
                                              onPressed: () async {
                                                final confirm =
                                                    await showDialog<bool>(
                                                  context: context,
                                                  builder: (context) =>
                                                      AlertDialog(
                                                    title: const Text(
                                                        'Hapus Pemberian Pakan'),
                                                    content: Text(
                                                      'Anda yakin ingin menghapus sesi "${feed.session}" pada ${DateFormat('dd MMM yyyy').format(feed.date)} untuk sapi ${cowNames[feed.cowId] ?? feed.cowId}?',
                                                    ),
                                                    actions: [
                                                      TextButton(
                                                        onPressed: () =>
                                                            Navigator.pop(
                                                                context, false),
                                                        child:
                                                            const Text('Batal'),
                                                      ),
                                                      TextButton(
                                                        onPressed: () =>
                                                            Navigator.pop(
                                                                context, true),
                                                        child: const Text(
                                                          'Hapus',
                                                          style: TextStyle(
                                                              color:
                                                                  Colors.red),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                );

                                                if (confirm == true) {
                                                  try {
                                                    await deleteDailyFeedSchedule(
                                                        feed.id);
                                                    if (mounted) {
                                                      ScaffoldMessenger.of(
                                                              context)
                                                          .showSnackBar(
                                                        const SnackBar(
                                                          content: Text(
                                                              'Pemberian pakan berhasil dihapus'),
                                                        ),
                                                      );
                                                    }
                                                    _refreshDailyFeedSchedules();
                                                  } catch (e) {
                                                    if (mounted) {
                                                      ScaffoldMessenger.of(
                                                              context)
                                                          .showSnackBar(
                                                        SnackBar(
                                                            content: Text(
                                                                'Gagal menghapus: $e')),
                                                      );
                                                    }
                                                  }
                                                }
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
          Navigator.pushNamed(context, '/tambah-jadwal-pakan').then((result) {
            if (result == true && mounted) {
              _refreshDailyFeedSchedules();
            }
          });
        },
        backgroundColor: const Color(0xFF17A2B8),
        child: const Icon(Icons.add),
      ),
    );
  }
}
