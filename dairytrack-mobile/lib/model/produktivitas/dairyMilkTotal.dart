import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/produktivitas/rawMilk.dart';
import 'package:intl/intl.dart';

class DailyMilkTotal {
  final int id;
  final DateTime date;
  final double totalVolume;
  final int totalSessions;
  final int cowId;
  final DateTime createdAt;
  String status;
  final DateTime updatedAt;
  final Cow? cow;
  final List<RawMilk>? rawMilks;

  DailyMilkTotal({
    required this.id,
    required this.date,
    required this.totalVolume,
    required this.totalSessions,
    required this.cowId,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    this.cow,
    this.rawMilks,
  });

  factory DailyMilkTotal.fromJson(Map<String, dynamic> json) {
    // Handle numeric conversion for SQL Decimal/Numeric
    dynamic volume = json['total_volume'];
    double parsedVolume = 0.0;

    if (volume is num) {
      parsedVolume = volume.toDouble();
    } else if (volume is String) {
      parsedVolume = double.tryParse(volume) ?? 0.0;
    }

    // Parse cow data
    Cow? cow;
    if (json['cow'] != null && json['cow'] is Map<String, dynamic>) {
      cow = Cow.fromJson(json['cow']);
    }
    final String status = json['status'] ?? 'Unknown Status';

    // Parse raw milks if exists
    List<RawMilk>? rawMilks;
    if (json['raw_milks'] != null && json['raw_milks'] is List) {
      rawMilks = (json['raw_milks'] as List)
          .map((milk) => RawMilk.fromJson(milk))
          .toList();
    }

    return DailyMilkTotal(
      id: json['id'] is int
          ? json['id']
          : int.tryParse(json['id'].toString()) ?? 0,
      date: _parseDate(json['date']),
      totalVolume: parsedVolume,
      totalSessions: json['total_sessions'] is int
          ? json['total_sessions']
          : int.tryParse(json['total_sessions'].toString()) ?? 0,
      cowId: json['cow_id'] is int
          ? json['cow_id']
          : int.tryParse(json['cow_id'].toString()) ?? 0,
      createdAt: _parseDate(json['created_at']),
      updatedAt: _parseDate(json['updated_at']),
      status: status,
      cow: cow,
      rawMilks: rawMilks,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
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

  static DateTime _parseDate(dynamic date) {
    if (date == null) {
      throw FormatException('Date is null');
    }

    if (date is String) {
      try {
        // Try parsing as ISO 8601
        return DateTime.parse(date);
      } catch (_) {
        try {
          // Handle RFC 1123 format (e.g., Thu, 24 Apr 2025 21:40:56 GMT)
          return DateFormat("EEE, dd MMM yyyy HH:mm:ss 'GMT'", 'en_US')
              .parseUtc(date);
        } catch (_) {
          // Handle custom date formats (e.g., DD-MM-YYYY)
          final parts = date.split('-');
          if (parts.length == 3) {
            final day = int.parse(parts[0]);
            final month = int.parse(parts[1]);
            final year = int.parse(parts[2]);
            return DateTime(year, month, day);
          }
          throw FormatException('Unsupported date format: $date');
        }
      }
    }

    if (date is int) {
      // Handle timestamp (milliseconds since epoch)
      return DateTime.fromMillisecondsSinceEpoch(date);
    }

    throw FormatException('Invalid date format: $date');
  }
}
