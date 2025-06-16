// financeModel.dart
import 'package:intl/intl.dart';

class FinanceTransaction {
  final int id;
  final DateTime transactionDate;
  final String transactionType; // 'income' or 'expense'
  final String description;
  final String amount;
  final DateTime createdAt;
  final DateTime updatedAt;

  FinanceTransaction({
    required this.id,
    required this.transactionDate,
    required this.transactionType,
    required this.description,
    required this.amount,
    required this.createdAt,
    required this.updatedAt,
  });

  factory FinanceTransaction.fromJson(Map<String, dynamic> json) {
    return FinanceTransaction(
      id: json['id'] as int? ?? 0,
      transactionDate: DateTime.parse(json['transaction_date'] as String? ??
          DateTime.now().toIso8601String()),
      transactionType: json['transaction_type'] as String? ?? '',
      description: json['description'] as String? ?? '',
      amount: json['amount'] as String? ?? '0.00',
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    final dateFormat = DateFormat('yyyy-MM-dd');
    return {
      'id': id,
      'transaction_date': dateFormat.format(transactionDate),
      'transaction_type': transactionType,
      'description': description,
      'amount': amount,
      'created_at': createdAt.toIso8601String(),
      'updated_at': updatedAt.toIso8601String(),
    };
  }
}

class Income {
  final int id;
  final int? incomeType;
  final IncomeType? incomeTypeDetail;
  final String amount;
  final String description;
  final DateTime transactionDate;
  final Map<String, dynamic>? createdBy;
  final Map<String, dynamic>? updatedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Income({
    required this.id,
    this.incomeType,
    this.incomeTypeDetail,
    required this.amount,
    required this.description,
    required this.transactionDate,
    this.createdBy,
    this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Income.fromJson(Map<String, dynamic> json) {
    return Income(
      id: json['id'] as int? ?? 0,
      incomeType: json['income_type'] as int?,
      incomeTypeDetail: json['income_type_detail'] != null
          ? IncomeType.fromJson(
              json['income_type_detail'] as Map<String, dynamic>)
          : null,
      amount: json['amount'] as String? ?? '0.00',
      description: json['description'] as String? ?? '',
      transactionDate: DateTime.parse(json['transaction_date'] as String? ??
          DateTime.now().toIso8601String()),
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    final dateFormat = DateFormat('yyyy-MM-dd');
    return {
      'income_type': incomeType,
      'amount': amount,
      'description': description,
      'transaction_date': dateFormat.format(transactionDate),
      'created_by': createdBy != null ? createdBy!['id'] : null,
      'updated_by': updatedBy != null ? updatedBy!['id'] : null,
    };
  }
}

class Expense {
  final int id;
  final int? expenseType;
  final ExpenseType? expenseTypeDetail;
  final String amount;
  final String description;
  final DateTime transactionDate;
  final Map<String, dynamic>? createdBy;
  final Map<String, dynamic>? updatedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  Expense({
    required this.id,
    this.expenseType,
    this.expenseTypeDetail,
    required this.amount,
    required this.description,
    required this.transactionDate,
    this.createdBy,
    this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'] as int? ?? 0,
      expenseType: json['expense_type'] as int?,
      expenseTypeDetail: json['expense_type_detail'] != null
          ? ExpenseType.fromJson(
              json['expense_type_detail'] as Map<String, dynamic>)
          : null,
      amount: json['amount'] as String? ?? '0.00',
      description: json['description'] as String? ?? '',
      transactionDate: DateTime.parse(json['transaction_date'] as String? ??
          DateTime.now().toIso8601String()),
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    final dateFormat = DateFormat('yyyy-MM-dd');
    return {
      'expense_type': expenseType,
      'amount': amount,
      'description': description,
      'transaction_date': dateFormat.format(transactionDate),
      'created_by': createdBy != null ? createdBy!['id'] : null,
      'updated_by': updatedBy != null ? updatedBy!['id'] : null,
    };
  }
}

class IncomeType {
  final int id;
  final String name;
  final String description;
  final Map<String, dynamic>? createdBy;
  final Map<String, dynamic>? updatedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  IncomeType({
    required this.id,
    required this.name,
    required this.description,
    this.createdBy,
    this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory IncomeType.fromJson(Map<String, dynamic> json) {
    return IncomeType(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'created_by': createdBy != null ? createdBy!['id'] : null,
    };
  }
}

class ExpenseType {
  final int id;
  final String name;
  final String description;
  final Map<String, dynamic>? createdBy;
  final Map<String, dynamic>? updatedBy;
  final DateTime createdAt;
  final DateTime updatedAt;

  ExpenseType({
    required this.id,
    required this.name,
    required this.description,
    this.createdBy,
    this.updatedBy,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ExpenseType.fromJson(Map<String, dynamic> json) {
    return ExpenseType(
      id: json['id'] as int? ?? 0,
      name: json['name'] as String? ?? '',
      description: json['description'] as String? ?? '',
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(
          json['created_at'] as String? ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(
          json['updated_at'] as String? ?? DateTime.now().toIso8601String()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'created_by': createdBy != null ? createdBy!['id'] : null,
    };
  }
}
