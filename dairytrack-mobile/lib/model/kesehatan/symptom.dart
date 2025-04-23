class Symptom {
  final int id;
  final int healthCheckId;
  final String? eyeCondition;
  final String? mouthCondition;
  final String? noseCondition;
  final String? anusCondition;
  final String? legCondition;
  final String? skinCondition;
  final String? behavior;
  final String? weightCondition;
  final String? reproductiveCondition;
  final DateTime createdAt;

  Symptom({
    required this.id,
    required this.healthCheckId,
    this.eyeCondition,
    this.mouthCondition,
    this.noseCondition,
    this.anusCondition,
    this.legCondition,
    this.skinCondition,
    this.behavior,
    this.weightCondition,
    this.reproductiveCondition,
    required this.createdAt,
  });

  Symptom copyWith({
    String? eyeCondition,
    String? mouthCondition,
    String? noseCondition,
    String? anusCondition,
    String? legCondition,
    String? skinCondition,
    String? behavior,
    String? weightCondition,
    String? reproductiveCondition,
  }) {
    return Symptom(
      id: id,
      healthCheckId: healthCheckId,
      eyeCondition: eyeCondition ?? this.eyeCondition,
      mouthCondition: mouthCondition ?? this.mouthCondition,
      noseCondition: noseCondition ?? this.noseCondition,
      anusCondition: anusCondition ?? this.anusCondition,
      legCondition: legCondition ?? this.legCondition,
      skinCondition: skinCondition ?? this.skinCondition,
      behavior: behavior ?? this.behavior,
      weightCondition: weightCondition ?? this.weightCondition,
      reproductiveCondition: reproductiveCondition ?? this.reproductiveCondition,
      createdAt: createdAt,
    );
  }

  factory Symptom.fromJson(Map<String, dynamic> json) {
    int parseHealthCheckId(dynamic data) {
      if (data is int) return data;
      if (data is Map && data.containsKey('id')) return data['id'] as int;
      throw Exception('Invalid health_check format');
    }

    return Symptom(
      id: json['id'] as int,
      healthCheckId: parseHealthCheckId(json['health_check']),
      eyeCondition: json['eye_condition'] as String?,
      mouthCondition: json['mouth_condition'] as String?,
      noseCondition: json['nose_condition'] as String?,
      anusCondition: json['anus_condition'] as String?,
      legCondition: json['leg_condition'] as String?,
      skinCondition: json['skin_condition'] as String?,
      behavior: json['behavior'] as String?,
      weightCondition: json['weight_condition'] as String?,
      reproductiveCondition: json['reproductive_condition'] as String?,
      createdAt: DateTime.parse(json['created_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'health_check': healthCheckId,
      'eye_condition': eyeCondition,
      'mouth_condition': mouthCondition,
      'nose_condition': noseCondition,
      'anus_condition': anusCondition,
      'leg_condition': legCondition,
      'skin_condition': skinCondition,
      'behavior': behavior,
      'weight_condition': weightCondition,
      'reproductive_condition': reproductiveCondition,
      'created_at': createdAt.toIso8601String(),
    };
  }

  /// Ini untuk konversi field penting saja (tanpa id, healthCheck, createdAt)
  Map<String, dynamic> toMap() {
    return {
      'eye_condition': eyeCondition,
      'mouth_condition': mouthCondition,
      'nose_condition': noseCondition,
      'anus_condition': anusCondition,
      'leg_condition': legCondition,
      'skin_condition': skinCondition,
      'behavior': behavior,
      'weight_condition': weightCondition,
      'reproductive_condition': reproductiveCondition,
    };
  }
}
