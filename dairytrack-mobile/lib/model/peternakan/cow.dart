class Cow {
  int? id;
  int? farmerId;
  final String name;
  final String breed;
  final DateTime birthDate;
  final bool lactationStatus;
  final String? lactationPhase;
  final double weight_kg;
  final String reproductiveStatus;
  final String gender;
  final DateTime entryDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Cow({
    this.id,
    this.farmerId,
    this.name = 'Unknown', // Default value
    this.breed = 'Unknown', // Default value
    DateTime? birthDate, // Nullable
    this.lactationStatus = false, // Default value
    this.lactationPhase,
    this.weight_kg = 0.0, // Default value
    this.reproductiveStatus = 'Unknown', // Default value
    this.gender = 'Unknown', // Default value
    DateTime? entryDate, // Nullable
    DateTime? createdAt, // Nullable
    DateTime? updatedAt, // Nullable
  })  : birthDate = birthDate ?? DateTime(1970, 1, 1), // Default value
        entryDate = entryDate ?? DateTime(1970, 1, 1), // Default value
        createdAt = createdAt ?? DateTime(1970, 1, 1), // Default value
        updatedAt = updatedAt ?? DateTime(1970, 1, 1); // Default value

  factory Cow.fromJson(Map<String, dynamic> json) {
    return Cow(
      id: json['id'],
      farmerId: json['farmer_id'],
      name: json['name'] ?? 'Unknown',
      breed: json['breed'] ?? 'Unknown',
      birthDate: json['birth_date'] != null
          ? DateTime.parse(json['birth_date'])
          : null,
      lactationStatus: json['lactation_status'] ?? false,
      lactationPhase: json['lactation_phase'],
      weight_kg: json['weight_kg'] != null
          ? double.tryParse(json['weight_kg'].toString()) ?? 0.0
          : 0.0,
      reproductiveStatus: json['reproductive_status'] ?? 'Unknown',
      gender: json['gender'] ?? 'Unknown',
      entryDate: json['entry_date'] != null
          ? DateTime.parse(json['entry_date'])
          : null,
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      if (farmerId != null) 'farmer_id': farmerId,
      'name': name,
      'breed': breed,
      'birth_date': birthDate.toIso8601String(),
      'lactation_status': lactationStatus,
      'lactation_phase': lactationPhase,
      'weight_kg': weight_kg,
      'reproductive_status': reproductiveStatus,
      'gender': gender,
      'entry_date': entryDate.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
