import 'package:dairy_track/model/peternakan/cow.dart';
import 'package:dairy_track/model/produktivitas/dairyMilkTotal.dart';

class RawMilk {
  int? id;
  int cowId;
  DateTime productionTime;
  DateTime expirationTime;
  double volumeLiters;
  String? name;
  String? lactationPhase;
  bool lactationStatus; // Ubah tipe menjadi bool
  double? previousVolume;
  String status;
  int session;
  int? dailyTotalId;
  double availableStocks;
  DateTime createdAt;
  DateTime updatedAt;
  bool isExpired;

  // Relationship with Cow
  Cow? cow;

  // Relationship with DailyMilkTotal
  DailyMilkTotal? dailyTotal;

  RawMilk({
    this.id,
    required this.cowId,
    required this.productionTime,
    required this.expirationTime,
    required this.volumeLiters,
    this.name,
    this.lactationPhase,
    required this.lactationStatus, // Properti diperbarui
    this.previousVolume,
    required this.status,
    required this.session,
    this.dailyTotalId,
    required this.availableStocks,
    required this.createdAt,
    required this.updatedAt,
    required this.isExpired,
    this.cow,
    this.dailyTotal,
  });

  factory RawMilk.fromJson(Map<String, dynamic> json) {
    try {
      return RawMilk(
        id: json['id'] != null ? int.tryParse(json['id'].toString()) : null,
        cowId: json['cow_id'] != null
            ? int.tryParse(json['cow_id'].toString()) ?? 0
            : 0,
        name: json['name'] ?? 'Unknown',
        lactationPhase: json['lactation_phase'],
        productionTime: json['production_time'] != null
            ? DateTime.parse(json['production_time'])
            : DateTime.now(),
        expirationTime: json['expiration_time'] != null
            ? DateTime.parse(json['expiration_time'])
            : DateTime.now(),
        volumeLiters: json['volume_liters'] != null
            ? (json['volume_liters'] is String
                ? double.tryParse(json['volume_liters']) ?? 0.0
                : (json['volume_liters'] as num).toDouble())
            : 0.0,
        previousVolume: json['previous_volume'] != null
            ? (json['previous_volume'] is String
                ? double.tryParse(json['previous_volume'])
                : (json['previous_volume'] as num).toDouble())
            : null,
        lactationStatus: json['lactation_status'] == true, // Konversi ke bool
        status: json['status'] ?? 'Unknown',
        session: json['session'] != null
            ? int.tryParse(json['session'].toString()) ?? 0
            : 0,
        dailyTotalId: json['daily_total_id'] != null
            ? int.tryParse(json['daily_total_id'].toString())
            : null,
        availableStocks: json['available_stocks'] != null
            ? (json['available_stocks'] is String
                ? double.tryParse(json['available_stocks']) ?? 0.0
                : (json['available_stocks'] as num).toDouble())
            : 0.0,
        createdAt: json['created_at'] != null
            ? DateTime.parse(json['created_at'])
            : DateTime.now(),
        updatedAt: json['updated_at'] != null
            ? DateTime.parse(json['updated_at'])
            : DateTime.now(),
        isExpired: json['is_expired'] == true || json['is_expired'] == 'true',
        cow: json['cow'] != null ? Cow.fromJson(json['cow']) : null,
        dailyTotal: json['daily_total'] != null
            ? DailyMilkTotal.fromJson(json['daily_total'])
            : null,
      );
    } catch (e) {
      throw Exception(
          'Error parsing RawMilk JSON: $e. Data: ${json.toString()}');
    }
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'cow_id': cowId,
      'name': name,
      'lactation_phase': lactationPhase,
      'production_time': productionTime.toIso8601String(),
      'expiration_time': expirationTime.toIso8601String(),
      'volume_liters': volumeLiters,
      if (previousVolume != null) 'previous_volume': previousVolume,
      'lactation_status': lactationStatus, // Tetap sebagai bool
      'status': status,
      'session': session,
      if (dailyTotalId != null) 'daily_total_id': dailyTotalId,
      'available_stocks': availableStocks,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
      'is_expired': isExpired,
      if (cow != null) 'cow': cow!.toJson(),
      if (dailyTotal != null) 'daily_total': dailyTotal!.toJson(),
    };
  }
}
