class Reproduction {
  final int id;
  final int cowId;
  final int? calvingInterval;
  final int? servicePeriod;
  final double? conceptionRate;
  final int? totalInsemination;
  final int? successfulPregnancy;
  final String? calvingDate;
  final String? previousCalvingDate;
  final String? inseminationDate;
  final DateTime recordedAt;

  Reproduction({
    required this.id,
    required this.cowId,
    this.calvingInterval,
    this.servicePeriod,
    this.conceptionRate,
    this.totalInsemination,
    this.successfulPregnancy,
    this.calvingDate,
    this.previousCalvingDate,
    this.inseminationDate,
    required this.recordedAt,
  });

  factory Reproduction.fromJson(Map<String, dynamic> json) {
    int parseInt(dynamic value) {
      if (value == null) return 0;
      if (value is int) return value;
      if (value is double) return value.toInt();
      if (value is String) return int.tryParse(value) ?? 0;
      throw Exception('Invalid int format: $value');
    }

    double parseDouble(dynamic value) {
      if (value == null) return 0.0;
      if (value is double) return value;
      if (value is int) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? 0.0;
      throw Exception('Invalid double format: $value');
    }

    int parseCowId(dynamic data) {
      if (data is int) return data;
      if (data is Map && data.containsKey('id')) return data['id'] as int;
      throw Exception('Invalid cow format');
    }

    return Reproduction(
      id: json['id'] as int,
      cowId: parseCowId(json['cow']),
      calvingInterval: json['calving_interval'] != null ? parseInt(json['calving_interval']) : null,
      servicePeriod: json['service_period'] != null ? parseInt(json['service_period']) : null,
      conceptionRate: json['conception_rate'] != null ? parseDouble(json['conception_rate']) : null,
      totalInsemination: json['total_insemination'] != null ? parseInt(json['total_insemination']) : null,
      successfulPregnancy: json['successful_pregnancy'] != null ? parseInt(json['successful_pregnancy']) : null,
      calvingDate: json['calving_date']?.toString(),
      previousCalvingDate: json['previous_calving_date']?.toString(),
      inseminationDate: json['insemination_date']?.toString(),
      recordedAt: DateTime.parse(json['recorded_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cow': cowId,
      'calving_interval': calvingInterval,
      'service_period': servicePeriod,
      'conception_rate': conceptionRate,
      'total_insemination': totalInsemination,
      'successful_pregnancy': successfulPregnancy,
      'calving_date': calvingDate,
      'previous_calving_date': previousCalvingDate,
      'insemination_date': inseminationDate,
      'recorded_at': recordedAt.toIso8601String(),
    };
  }
}
