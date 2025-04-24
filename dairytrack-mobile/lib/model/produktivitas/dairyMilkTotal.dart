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
      id: json['id'] != null
          ? (json['id'] is String
              ? int.tryParse(json['id']) ?? 0
              : json['id'] as int)
          : 0, // Konversi ke int dengan default 0
      date: DateTime.parse(json['date']),
      totalVolume: json['total_volume'] != null
          ? (json['total_volume'] is String
              ? double.tryParse(json['total_volume']) ?? 0.0
              : (json['total_volume'] as num).toDouble())
          : 0.0, // Konversi ke double dengan default 0.0
      totalSessions: json['total_sessions'] != null
          ? (json['total_sessions'] is String
              ? int.tryParse(json['total_sessions']) ?? 0
              : json['total_sessions'] as int)
          : 0, // Konversi ke int dengan default 0
      cowId: json['cow_id'] != null
          ? (json['cow_id'] is String
              ? int.tryParse(json['cow_id']) ?? 0
              : json['cow_id'] as int)
          : 0, // Konversi ke int dengan default 0
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
