class Peternak {
  int? id; // Password menjadi opsional

  final String firstName;
  final String lastName;
  final String address;
  final String contact;
  final String email;
  final String gender;
  final String religion;
  final String role;
  final String status;
  int totalCattle = 0; // Total cattle default 0
  final DateTime birthDate;
  final DateTime join_date;
  final String? password; // Password menjadi opsional
  final DateTime createdAt;
  final DateTime updatedAt;

  Peternak({
    this.id, // Tidak lagi required

    required this.firstName,
    required this.lastName,
    required this.address,
    required this.contact,
    required this.email,
    required this.gender,
    required this.religion,
    required this.role,
    required this.status,
    this.totalCattle = 0,
    required this.birthDate,
    this.password, // Tidak lagi required
    required this.join_date,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Peternak.fromJson(Map<String, dynamic> json) {
    return Peternak(
      id: json['id'], // Bisa null

      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      address: json['address'] ?? '',
      contact: json['contact'] ?? '',
      email: json['email'] ?? '',
      gender: json['gender'] ?? '',
      religion: json['religion'] ?? '',
      role: json['role'] ?? '',
      status: json['status'] ?? '',
      totalCattle:
          json['total_cattle'] != null ? json['total_cattle'] as int : 0,
      birthDate: json['birth_date'] != null
          ? DateTime.parse(json['birth_date'])
          : DateTime.now(),
      password: json['password'], // Bisa null
      join_date: json['join_date'] != null
          ? DateTime.parse(json['join_date'])
          : DateTime.now(),
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
      if (id != null) 'id': id, // Hanya tambahkan jika tidak null
      'first_name': firstName,
      'last_name': lastName,
      'address': address,
      'contact': contact,
      'email': email,
      'gender': gender,
      'religion': religion,
      'role': role,
      'status': status,
      'total_cattle': totalCattle > 0 ? totalCattle : null,
      'birth_date': birthDate.toIso8601String(),
      if (password != null)
        'password': password, // Hanya tambahkan jika tidak null
      'join_date': join_date.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
