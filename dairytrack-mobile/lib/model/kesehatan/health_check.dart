class HealthCheck {
  final int id;
  final int cowId;
  final String? cowName; // Optional
  final DateTime checkupDate;
  final double rectalTemperature;
  final int heartRate;
  final int respirationRate;
  final double rumination;
  final bool needsAttention;
  final bool isFollowedUp;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;

  HealthCheck({
    required this.id,
    required this.cowId,
    this.cowName,
    required this.checkupDate,
    required this.rectalTemperature,
    required this.heartRate,
    required this.respirationRate,
    required this.rumination,
    required this.needsAttention,
    required this.isFollowedUp,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  HealthCheck copyWith({
    double? rectalTemperature,
    int? heartRate,
    int? respirationRate,
    double? rumination,
  }) {
    return HealthCheck(
      id: id,
      cowId: cowId,
      cowName: cowName,
      checkupDate: checkupDate,
      rectalTemperature: rectalTemperature ?? this.rectalTemperature,
      heartRate: heartRate ?? this.heartRate,
      respirationRate: respirationRate ?? this.respirationRate,
      rumination: rumination ?? this.rumination,
      needsAttention: needsAttention,
      isFollowedUp: isFollowedUp,
      status: status,
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

 factory HealthCheck.fromJson(Map<String, dynamic> json) {
  return HealthCheck(
    id: json['id'] ?? 0,
    cowId: json['cow'] is int ? json['cow'] : (json['cow']['id'] ?? 0),
    cowName: json['cow'] is Map ? (json['cow']['name'] ?? '') : null,
    checkupDate: DateTime.parse(json['checkup_date'] ?? DateTime.now().toIso8601String()),
    rectalTemperature: _toDouble(json['rectal_temperature']),
    heartRate: _toInt(json['heart_rate']),
    respirationRate: _toInt(json['respiration_rate']),
    rumination: _toDouble(json['rumination']),
    needsAttention: _toBool(json['needs_attention']),
    isFollowedUp: _toBool(json['is_followed_up']),
    status: json['status'] ?? '', // 🛡️ ini yang tadinya error null
    createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
    updatedAt: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
  );
}

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cow': cowId,
      'checkup_date': checkupDate.toIso8601String(),
      'rectal_temperature': rectalTemperature,
      'heart_rate': heartRate,
      'respiration_rate': respirationRate,
      'rumination': rumination,
      'needs_attention': needsAttention,
      'is_followed_up': isFollowedUp,
      'status': status,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  // Helper parsing
  static double _toDouble(dynamic value) {
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  static int _toInt(dynamic value) {
    if (value is int) return value;
    if (value is double) return value.toInt();
    if (value is String) return int.tryParse(value) ?? 0;
    return 0;
  }

  static bool _toBool(dynamic value) {
    if (value is bool) return value;
    if (value is int) return value == 1;
    if (value is String) {
      if (value.toLowerCase() == 'true' || value == '1') return true;
      if (value.toLowerCase() == 'false' || value == '0') return false;
    }
    return false;
  }
}
