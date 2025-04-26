class Finance {
  final int id;
  final DateTime transactionDate;
  final String transactionType;
  final String description;
  final double amount;
  final DateTime createdAt;
  final DateTime updatedAt;

  Finance({
    required this.id,
    required this.transactionDate,
    required this.transactionType,
    required this.description,
    required this.amount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Finance.fromJson(Map<String, dynamic> json) {
    return Finance(
      id: json['id'] ?? 0,
      transactionDate: json['transaction_date'] != null
          ? DateTime.parse(json['transaction_date'])
          : DateTime.now(),
      transactionType: json['transaction_type'] ?? 'unknown',
      description: json['description'] ?? '',
      amount: json['amount'] != null
          ? double.tryParse(json['amount'].toString()) ?? 0.0
          : 0.0,
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
      'transaction_date': transactionDate.toIso8601String(),
      'transaction_type': transactionType,
      'description': description,
      'amount': amount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}
