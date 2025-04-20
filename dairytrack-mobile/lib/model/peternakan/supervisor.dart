class Supervisor {
  int? id;
  final String firstName;
  final String lastName;
  final String contact;
  final String email;
  final String gender; // Tambahkan properti gender

  final DateTime createdAt;
  final DateTime updatedAt;
  final String? password; // Password menjadi opsional

  Supervisor({
    this.id,
    required this.firstName,
    required this.lastName,
    required this.contact,
    required this.email,
    required this.createdAt,
    required this.gender, // Tambahkan gender di konstruktor

    required this.updatedAt,
    this.password, // Tidak lagi required
  });

  // Factory method untuk membuat instance dari JSON
  factory Supervisor.fromJson(Map<String, dynamic> json) {
    return Supervisor(
      id: json['id'] != null ? int.tryParse(json['id'].toString()) : null,
      firstName: json['first_name'] ?? '',
      lastName: json['last_name'] ?? '',
      email: json['email'] ?? '', password: json['password'], // Bisa null
      gender: json['gender'], // Parsing gender dari JSON

      contact: json['contact'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  // Metode untuk mengubah instance menjadi JSON
  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'first_name': firstName,
      'last_name': lastName,
      'contact': contact, 'gender': gender, // Tambahkan gender ke JSON

      if (password != null)
        'password': password, // Hanya tambahkan jika tidak null

      'email': email,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
