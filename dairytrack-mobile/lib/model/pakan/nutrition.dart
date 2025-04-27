class Nutrisi {
  int? id;
  final String name;
  final String? unit;
  final DateTime createdAt;
  final DateTime updatedAt;

  Nutrisi({
    this.id,
    required this.name,
    this.unit,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  factory Nutrisi.fromJson(Map<String, dynamic> json) {
    return Nutrisi(
      id: json['id'],
      name: json['name'] ?? '',
      unit: json['unit'],
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
      if (id != null) 'id': id,
      'name': name,
      if (unit != null) 'unit': unit,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}