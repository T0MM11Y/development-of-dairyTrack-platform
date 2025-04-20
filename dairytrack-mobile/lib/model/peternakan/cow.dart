class Cow {
  int? id; // Password menjadi opsional
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
    required this.name,
    required this.breed,
    required this.birthDate,
    required this.lactationStatus,
    this.lactationPhase,
    required this.weight_kg,
    required this.reproductiveStatus,
    required this.gender,
    required this.entryDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Cow.fromJson(Map<String, dynamic> json) {
    return Cow(
      id: json['id'], // Bisa null
      farmerId: json['farmer_id'],
      name: json['name'] ?? 'Unknown', // Default to 'Unknown' if null
      breed: json['breed'] ?? 'Unknown', // Default to 'Unknown' if null
      birthDate: json['birth_date'] != null
          ? DateTime.parse(json['birth_date'])
          : DateTime(1970, 1, 1), // Default to epoch if null
      lactationStatus:
          json['lactation_status'] ?? false, // Default to false if null
      lactationPhase: json['lactation_phase'], // Nullable, no default needed
      weight_kg: json['weight_kg'] != null
          ? double.tryParse(json['weight_kg'].toString()) ?? 0.0
          : 0.0, // Default to 0.0 if null or invalid
      reproductiveStatus: json['reproductive_status'] ??
          'Unknown', // Default to 'Unknown' if null
      gender: json['gender'] ?? 'Unknown', // Default to 'Unknown' if null
      entryDate: json['entry_date'] != null
          ? DateTime.parse(json['entry_date'])
          : DateTime(1970, 1, 1), // Default to epoch if null
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime(1970, 1, 1), // Default to epoch if null
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime(1970, 1, 1), // Default to epoch if null
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id, // Hanya tambahkan jika tidak null
      if (farmerId != null)
        'farmer_id': farmerId, // Hanya tambahkan jika tidak null
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
