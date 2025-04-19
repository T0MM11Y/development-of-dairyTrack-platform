class Peternak {
  final int id;
  final String firstName;
  final String lastName;
  final String address;
  final String contact;
  final String email;
  final String gender;
  final String religion;
  final String role;
  final String status;
  final int totalCattle;
  final DateTime birthDate;
  final DateTime joinDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Peternak({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.address,
    required this.contact,
    required this.email,
    required this.gender,
    required this.religion,
    required this.role,
    required this.status,
    required this.totalCattle,
    required this.birthDate,
    required this.joinDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Peternak.fromJson(Map<String, dynamic> json) {
    return Peternak(
      id: json['id'],
      firstName: json['first_name'],
      lastName: json['last_name'],
      address: json['address'],
      contact: json['contact'],
      email: json['email'],
      gender: json['gender'],
      religion: json['religion'],
      role: json['role'],
      status: json['status'],
      totalCattle: json['total_cattle'],
      birthDate: DateTime.parse(json['birth_date']),
      joinDate: DateTime.parse(json['join_date']),
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'address': address,
      'contact': contact,
      'email': email,
      'gender': gender,
      'religion': religion,
      'role': role,
      'status': status,
      'total_cattle': totalCattle,
      'birth_date': birthDate.toIso8601String(),
      'join_date': joinDate.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
