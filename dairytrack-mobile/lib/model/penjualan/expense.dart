class Expense {
  final int id;
  final String expenseType;
  final double amount;
  final String description;
  final DateTime transactionDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  Expense({
    required this.id,
    required this.expenseType,
    required this.amount,
    required this.description,
    required this.transactionDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'] ?? 0,
      expenseType: json['expense_type'] ?? 'unknown',
      amount: json['amount'] != null
          ? double.tryParse(json['amount'].toString()) ?? 0.0
          : 0.0,
      description: json['description'] ?? '',
      transactionDate: json['transaction_date'] != null
          ? DateTime.parse(json['transaction_date'])
          : DateTime(1970, 1, 1),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime(1970, 1, 1),
      updatedAt: json['updated_at'] != null
          ? DateTime.parse(json['updated_at'])
          : DateTime(1970, 1, 1),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'expense_type': expenseType,
      'amount': amount.toString(),
      'description': description,
      'transaction_date': transactionDate.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}