import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/peternakan/cow.dart';

class SessionDetails extends StatelessWidget {
  final DailyFeedSchedule? selectedDailyFeedDetails;
  final Map<int, Cow> cowsMap;
  final DateFormat dateFormat;

  const SessionDetails({
    super.key,
    required this.selectedDailyFeedDetails,
    required this.cowsMap,
    required this.dateFormat,
  });

  String _formatSession(String session) {
    return session.isNotEmpty ? session[0].toUpperCase() + session.substring(1) : session;
  }

  @override
  Widget build(BuildContext context) {
    if (selectedDailyFeedDetails == null) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Detail Sesi',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
        ),
        const SizedBox(height: 8.0),
        Container(
          padding: const EdgeInsets.all(16.0),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Tanggal', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 4.0),
                    Text(dateFormat.format(DateTime.parse(selectedDailyFeedDetails!.date))),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Sesi', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 4.0),
                    Text(_formatSession(selectedDailyFeedDetails!.session)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Sapi', style: TextStyle(color: Colors.grey)),
                    const SizedBox(height: 4.0),
                    Text(cowsMap[selectedDailyFeedDetails!.cowId]?.name ??
                        'Sapi #${selectedDailyFeedDetails!.cowId}'),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24.0),
      ],
    );
  }
}