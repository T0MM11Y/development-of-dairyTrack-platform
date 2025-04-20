import 'package:dairy_track/model/pakan/dailyFeedItem.dart';

class DailyFeedSchedule {
  final int id;
  final int farmerId;
  final int cowId;
  final DateTime date;
  final String session;
  final String? weather;
  final double totalProtein;
  final double totalEnergy;
  final double totalFiber;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<FeedItem> feedItems;

  DailyFeedSchedule({
    required this.id,
    required this.farmerId,
    required this.cowId,
    required this.date,
    required this.session,
    this.weather,
    required this.totalProtein,
    required this.totalEnergy,
    required this.totalFiber,
    required this.createdAt,
    required this.updatedAt,
    required this.feedItems,
  });

  factory DailyFeedSchedule.fromJson(Map<String, dynamic> json) {
    return DailyFeedSchedule(
      id: int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      farmerId: int.tryParse(json['farmer_id']?.toString() ?? '0') ?? 0,
      cowId: int.tryParse(json['cow_id']?.toString() ?? '0') ?? 0,
      date: json['date'] != null
          ? DateTime.tryParse(json['date'].toString()) ?? DateTime(1970, 1, 1)
          : DateTime(1970, 1, 1),
      session: json['session']?.toString() ?? '',
      weather: json['weather']?.toString(),
      totalProtein: double.tryParse(json['total_protein']?.toString() ?? '0.0') ?? 0.0,
      totalEnergy: double.tryParse(json['total_energy']?.toString() ?? '0.0') ?? 0.0,
      totalFiber: double.tryParse(json['total_fiber']?.toString() ?? '0.0') ?? 0.0,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'].toString()) ?? DateTime(1970, 1, 1)
          : DateTime(1970, 1, 1),
      updatedAt: json['updated_at'] != null
          ? DateTime.tryParse(json['updated_at'].toString()) ?? DateTime(1970, 1, 1)
          : DateTime(1970, 1, 1),
      feedItems: (json['feedItems'] as List<dynamic>?)
              ?.map((item) => FeedItem.fromJson(item as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'farmer_id': farmerId,
      'cow_id': cowId,
      'date': date.toIso8601String(),
      'session': session,
      'weather': weather,
      'total_protein': totalProtein,
      'total_energy': totalEnergy,
      'total_fiber': totalFiber,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'feedItems': feedItems.map((item) => item.toJson()).toList(),
    };
  }
}