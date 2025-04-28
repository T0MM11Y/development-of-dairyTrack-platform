import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:dairy_track/model/pakan/dailyFeedSchedule.dart';
import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/peternakan/cow.dart';

class DailyFeedSelector extends StatelessWidget {
  final List<DailyFeedSchedule> dailyFeeds;
  final Map<int, Cow> cowsMap;
  final List<FeedItem> feedItems;
  final String? selectedDailyFeedId;
  final DateFormat dateFormat;
  final Function(String?) onChanged;

  const DailyFeedSelector({
    super.key,
    required this.dailyFeeds,
    required this.cowsMap,
    required this.feedItems,
    required this.selectedDailyFeedId,
    required this.dateFormat,
    required this.onChanged,
  });

  String _formatSession(String session) {
    return session.isNotEmpty ? session[0].toUpperCase() + session.substring(1) : session;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Sesi Pemberian Pakan',
          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16.0),
        ),
        const SizedBox(height: 8.0),
        DropdownButtonFormField<String>(
          decoration: InputDecoration(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8.0),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 16.0),
          ),
          value: selectedDailyFeedId,
          hint: const Text('Pilih sesi pemberian pakan'),
          isExpanded: true,
          validator: (value) => value == null ? 'Harap pilih sesi pakan' : null,
          items: dailyFeeds.isEmpty
              ? [
                  const DropdownMenuItem(
                    value: '',
                    child: Text('Tidak ada sesi tersedia'),
                  ),
                ]
              : dailyFeeds.map((feed) {
                  final itemCount =
                      feedItems.where((item) => item.dailyFeedId == feed.id).length;
                  final cowName = cowsMap[feed.cowId]?.name ?? 'Sapi #${feed.cowId}';
                  return DropdownMenuItem(
                    value: feed.id.toString(),
                    child: Text(
                      '${dateFormat.format(DateTime.parse(feed.date))} - '
                      'Sesi ${_formatSession(feed.session)} - '
                      '$cowName ($itemCount/3 pakan)',
                    ),
                  );
                }).toList(),
          onChanged: dailyFeeds.isEmpty ? null : onChanged,
        ),
        const SizedBox(height: 4.0),
        const Text(
          'Pilih sesi pemberian pakan untuk menambahkan jenis pakan',
          style: TextStyle(fontSize: 12.0, color: Colors.grey),
        ),
      ],
    );
  }
}