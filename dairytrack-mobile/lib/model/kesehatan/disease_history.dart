class DiseaseHistory {
  final int id;
  final int healthCheckId;
  final String diseaseName;
  final String? description;
  final bool treatmentDone;
  final DateTime createdAt;
  final DateTime updatedAt;

  DiseaseHistory({
    required this.id,
    required this.healthCheckId,
    required this.diseaseName,
    this.description,
    required this.treatmentDone,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DiseaseHistory.fromJson(Map<String, dynamic> json) {
    int parseHealthCheck(dynamic data) {
      if (data is int) return data;
      if (data is Map && data.containsKey('id')) return data['id'] as int;
      throw Exception('Invalid health_check format');
    }

    bool parseTreatmentDone(dynamic data) {
      if (data == null) return false;
      if (data is bool) return data;
      if (data is int) return data == 1;
      if (data is String) return data.toLowerCase() == 'true';
      return false;
    }

    return DiseaseHistory(
      id: json['id'] as int,
      healthCheckId: parseHealthCheck(json['health_check']),
      diseaseName: (json['disease_name'] ?? '').toString(),
      description: json['description']?.toString(),
      treatmentDone: parseTreatmentDone(json['treatment_done']),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'health_check': healthCheckId,
      'disease_name': diseaseName,
      'description': description,
      'treatment_done': treatmentDone,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
