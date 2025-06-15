import 'package:flutter/material.dart';

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
      transactionDate: DateTime.parse(json['transaction_date']?.toString() ?? ''),
      transactionType: json['transaction_type']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      amount: json['amount']?.toString() ?? '0.00',
      createdAt: DateTime.parse(json['created_at']?.toString() ?? ''),
      updatedAt: DateTime.parse(json['updated_at']?.toString() ?? ''),
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
          ? IncomeType.fromJson(json['income_type_detail'])
          : null,
      amount: json['amount']?.toString() ?? '0.00',
      description: json['description']?.toString() ?? '',
      transactionDate: DateTime.parse(json['transaction_date']?.toString() ?? ''),
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at']?.toString() ?? ''),
      updatedAt: DateTime.parse(json['updated_at']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'income_type': incomeType,
      'amount': amount,
      'description': description,
      'transaction_date': transactionDate.toIso8601String(),
      'created_by': createdBy,
      'updated_by': updatedBy,
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
          ? ExpenseType.fromJson(json['expense_type_detail'])
          : null,
      amount: json['amount']?.toString() ?? '0.00',
      description: json['description']?.toString() ?? '',
      transactionDate: DateTime.parse(json['transaction_date']?.toString() ?? ''),
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at']?.toString() ?? ''),
      updatedAt: DateTime.parse(json['updated_at']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'expense_type': expenseType,
      'amount': amount,
      'description': description,
      'transaction_date': transactionDate.toIso8601String(),
      'created_by': createdBy,
      'updated_by': updatedBy,
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
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at']?.toString() ?? ''),
      updatedAt: DateTime.parse(json['updated_at']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'created_by': createdBy,
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
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      createdBy: json['created_by'] as Map<String, dynamic>?,
      updatedBy: json['updated_by'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['created_at']?.toString() ?? ''),
      updatedAt: DateTime.parse(json['updated_at']?.toString() ?? ''),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'description': description,
      'created_by': createdBy,
    };
  }
}