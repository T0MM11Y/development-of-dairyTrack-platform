import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/produktivitas/rawMilk.dart';

class DailyMilkTotal {
  int? id;
  DateTime date;
  double totalVolume;
  int totalSessions;
  int cowId;
  DateTime createdAt;
  DateTime updatedAt;

  // Relationship with Cow
  Cow? cow;

  // Relationship with RawMilk
  List<RawMilk>? rawMilks;

  DailyMilkTotal({
    this.id,
    required this.date,
    required this.totalVolume,
    required this.totalSessions,
    required this.cowId,
    required this.createdAt,
    required this.updatedAt,
    this.cow,
    this.rawMilks,
  });

  factory DailyMilkTotal.fromJson(Map<String, dynamic> json) {
    return DailyMilkTotal(
      id: json['id'] is String
          ? int.parse(json['id'])
          : json['id'], // Pastikan id adalah int
      date: DateTime.parse(json['date']),
      totalVolume: (json['total_volume'] as num)
          .toDouble(), // Pastikan total_volume adalah double
      totalSessions: json['total_sessions'] is String
          ? int.parse(json['total_sessions'])
          : json['total_sessions'], // Pastikan total_sessions adalah int
      cowId: json['cow_id'] is String
          ? int.parse(json['cow_id'])
          : json['cow_id'], // Pastikan cow_id adalah int
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
      cow: json['cow'] != null ? Cow.fromJson(json['cow']) : null,
      rawMilks: json['raw_milks'] != null
          ? (json['raw_milks'] as List)
              .map((milk) => RawMilk.fromJson(milk))
              .toList()
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'date': date.toIso8601String(),
      'total_volume': totalVolume,
      'total_sessions': totalSessions,
      'cow_id': cowId,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      if (cow != null) 'cow': cow!.toJson(),
      if (rawMilks != null)
        'raw_milks': rawMilks!.map((milk) => milk.toJson()).toList(),
    };
  }
}
