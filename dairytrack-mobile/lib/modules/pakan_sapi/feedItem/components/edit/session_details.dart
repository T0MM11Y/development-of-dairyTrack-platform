import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/peternakan/cow.dart';

class SessionDetails extends StatelessWidget {
  final DailyFeedSchedule? dailyFeed;
  final Map<int, Cow> cowsMap;
  final DateFormat dateFormat;

  const SessionDetails({
    super.key,
    required this.dailyFeed,
    required this.cowsMap,
    required this.dateFormat,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Detail Sesi',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18.0),
        ),
        const SizedBox(height: 8.0),
        Card(
          elevation: 2,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Tanggal', style: TextStyle(color: Colors.grey)),
                      Text(dailyFeed != null
                          ? dateFormat.format(DateTime.parse(dailyFeed!.date))
                          : '-'),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Sesi', style: TextStyle(color: Colors.grey)),
                      Text(dailyFeed != null
                          ? (dailyFeed!.session.isNotEmpty
                              ? dailyFeed!.session[0].toUpperCase() +
                                  dailyFeed!.session.substring(1)
                              : '-')
                          : '-'),
                    ],
                  ),
                ),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Sapi', style: TextStyle(color: Colors.grey)),
                      Text(dailyFeed != null
                          ? (cowsMap[dailyFeed!.cowId]?.name ??
                              'Sapi #${dailyFeed!.cowId}')
                          : '-'),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}