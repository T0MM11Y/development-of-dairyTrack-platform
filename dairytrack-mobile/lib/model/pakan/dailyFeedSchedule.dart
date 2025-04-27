import 'package:dairy_track/model/pakan/dailyFeedItem.dart';
import 'package:dairy_track/model/pakan/nutrition.dart';

class DailyFeedSchedule {
  final int id;
  final int cowId;
  final String date;
  final String session;
  final String weather;
  final List<FeedItem> dailyFeedItems;
  final List<Nutrisi> totalNutrients;
  final DateTime createdAt;
  final DateTime updatedAt;

  DailyFeedSchedule({
    required this.id,
    required this.cowId,
    required this.date,
    required this.session,
    required this.weather,
    required this.dailyFeedItems,
    required this.totalNutrients,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DailyFeedSchedule.fromJson(Map<String, dynamic> json) {
    List<FeedItem> parsedFeedItems = [];
    if (json['DailyFeedItems'] != null) {
      try {
        parsedFeedItems = (json['DailyFeedItems'] as List)
            .map((item) => FeedItem.fromJson(item))
            .toList();
      } catch (e) {
        print('Error parsing feed items: $e');
      }
    }

    List<Nutrisi> parsedNutrients = [];
    if (json['total_nutrients'] != null) {
      try {
        parsedNutrients = (json['total_nutrients'] as List)
            .map((item) => Nutrisi.fromJson(item))
            .toList();
      } catch (e) {
        print('Error parsing nutrients: $e');
      }
    }

    return DailyFeedSchedule(
      id: json['id'],
      cowId: json['cow_id'] ?? 0,
      date: json['date'] ?? '',
      session: json['session'] ?? '',
      weather: json['weather'] ?? '',
      dailyFeedItems: parsedFeedItems,
      totalNutrients: parsedNutrients,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }
}
