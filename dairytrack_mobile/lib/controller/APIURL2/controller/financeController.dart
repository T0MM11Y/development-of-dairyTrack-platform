// financeController.dart
import 'package:dairytrack_mobile/api/apiController.dart';
import 'package:dairytrack_mobile/controller/APIURL2/models/finance.dart';
import 'package:logger/logger.dart';
import 'package:dairytrack_mobile/controller/APIURL2/api_services/apiService.dart';

class FinanceController {
  final String _baseEndpoint = '$API_URL2/finance';
  final _logger = Logger();

  // Fetch all finance transactions
  Future<List<FinanceTransaction>> getFinanceTransactions(
      {String queryString = ''}) async {
    final response = await apiRequest(
      url:
          '$_baseEndpoint/finance/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      headers: {'Accept': 'application/json'},
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'] ?? [];
        _logger.i('Parsing ${data.length} finance transactions');
        return data.map((json) {
          if (json is Map<String, dynamic>) {
            return FinanceTransaction.fromJson(json);
          } else {
            _logger.e('Invalid JSON item: $json');
            throw Exception('Invalid JSON format');
          }
        }).toList();
      } catch (e) {
        _logger.e('Error parsing finance transactions: $e');
        throw Exception('Failed to parse finance transactions: $e');
      }
    } else {
      _logger.e('Failed to fetch finance transactions: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  // Fetch all incomes
  Future<List<Income>> getIncomes({String queryString = ''}) async {
    final response = await apiRequest(
      url:
          '$_baseEndpoint/incomes/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      headers: {'Accept': 'application/json'},
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'] ?? [];
        _logger.i('Parsing ${data.length} incomes');
        return data.map((json) => Income.fromJson(json)).toList();
      } catch (e) {
        _logger.e('Error parsing incomes: $e');
        throw Exception('Failed to parse incomes: $e');
      }
    } else {
      _logger.e('Failed to fetch incomes: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  // Fetch all expenses
  Future<List<Expense>> getExpenses({String queryString = ''}) async {
    final response = await apiRequest(
      url:
          '$_baseEndpoint/expenses/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      headers: {'Accept': 'application/json'},
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'] ?? [];
        _logger.i('Parsing ${data.length} expenses');
        return data.map((json) => Expense.fromJson(json)).toList();
      } catch (e) {
        _logger.e('Error parsing expenses: $e');
        throw Exception('Failed to parse expenses: $e');
      }
    } else {
      _logger.e('Failed to fetch expenses: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  // Fetch all income types
  Future<List<IncomeType>> getIncomeTypes() async {
    final response = await apiRequest(
      url: '$_baseEndpoint/income-types/',
      method: 'GET',
      headers: {'Accept': 'application/json'},
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'] ?? [];
        _logger.i('Parsing ${data.length} income types');
        return data.map((json) => IncomeType.fromJson(json)).toList();
      } catch (e) {
        _logger.e('Error parsing income types: $e');
        throw Exception('Failed to parse income types: $e');
      }
    } else {
      _logger.e('Failed to fetch income types: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  // Fetch all expense types
  Future<List<ExpenseType>> getExpenseTypes() async {
    final response = await apiRequest(
      url: '$_baseEndpoint/expense-types/',
      method: 'GET',
      headers: {'Accept': 'application/json'},
    );

    if (response['success']) {
      try {
        final List<dynamic> data = response['data'] ?? [];
        _logger.i('Parsing ${data.length} expense types');
        return data.map((json) => ExpenseType.fromJson(json)).toList();
      } catch (e) {
        _logger.e('Error parsing expense types: $e');
        throw Exception('Failed to parse expense types: $e');
      }
    } else {
      _logger.e('Failed to fetch expense types: ${response['message']}');
      throw Exception(response['message']);
    }
  }

  // Export finance transactions as PDF
  Future<Map<String, dynamic>> exportFinanceAsPdf(
      {String queryString = ''}) async {
    try {
      final response = await apiRequest(
        url:
            '$_baseEndpoint/export/pdf/${queryString.isNotEmpty ? '?$queryString' : ''}',
        method: 'GET',
        headers: {'Accept': 'application/pdf'},
        returnRawResponse: true,
      );

      if (response['success'] && response['statusCode'] == 200) {
        _logger.i('Successfully exported finance transactions as PDF');
        return {
          'success': true,
          'data': response['bodyBytes'],
          'filename': 'finance_${DateTime.now().toIso8601String()}.pdf',
        };
      } else {
        final error = response['body'] ?? 'Unknown error';
        _logger.e('Failed to export PDF: $error');
        return {
          'success': false,
          'message': error.toString(),
        };
      }
    } catch (e) {
      _logger.e('Error exporting finance transactions as PDF: $e');
      return {
        'success': false,
        'message': 'Failed to export PDF: $e',
      };
    }
  }

  // Export finance transactions as Excel
  Future<Map<String, dynamic>> exportFinanceAsExcel(
      {String queryString = ''}) async {
    try {
      final response = await apiRequest(
        url:
            '$_baseEndpoint/export/excel/${queryString.isNotEmpty ? '?$queryString' : ''}',
        method: 'GET',
        headers: {
          'Accept':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        returnRawResponse: true,
      );

      if (response['success'] && response['statusCode'] == 200) {
        _logger.i('Successfully exported finance transactions as Excel');
        return {
          'success': true,
          'data': response['bodyBytes'],
          'filename': 'finance_${DateTime.now().toIso8601String()}.xlsx',
        };
      } else {
        final error = response['body'] ?? 'Unknown error';
        _logger.e('Failed to export Excel: $error');
        return {
          'success': false,
          'message': error.toString(),
        };
      }
    } catch (e) {
      _logger.e('Error exporting finance transactions as Excel: $e');
      return {
        'success': false,
        'message': 'Failed to export Excel: $e',
      };
    }
  }

  // Create income
  Future<bool> createIncome(Income income) async {
    try {
      final response = await apiRequest(
        url: '$_baseEndpoint/incomes/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: income.toJson(),
      );

      if (response['success']) {
        _logger.i('Successfully created income: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to create income: ${response['message']}');
        throw Exception(response['message']);
      }
    } catch (e) {
      _logger.e('Error creating income: $e');
      throw Exception('Failed to create income: $e');
    }
  }

  // Create expense
  Future<bool> createExpense(Expense expense) async {
    try {
      final response = await apiRequest(
        url: '$_baseEndpoint/expenses/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: expense.toJson(),
      );

      if (response['success']) {
        _logger.i('Successfully created expense: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to create expense: ${response['message']}');
        throw Exception(response['message']);
      }
    } catch (e) {
      _logger.e('Error creating expense: $e');
      throw Exception('Failed to create expense: $e');
    }
  }

  // Create income type
  Future<bool> createIncomeType(IncomeType incomeType) async {
    try {
      final response = await apiRequest(
        url: '$_baseEndpoint/income-types/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: incomeType.toJson(),
      );

      if (response['success']) {
        _logger.i('Successfully created income type: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to create income type: ${response['message']}');
        throw Exception(response['message']);
      }
    } catch (e) {
      _logger.e('Error creating income type: $e');
      throw Exception('Failed to create income type: $e');
    }
  }

  // Create expense type
  Future<bool> createExpenseType(ExpenseType expenseType) async {
    try {
      final response = await apiRequest(
        url: '$_baseEndpoint/expense-types/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: expenseType.toJson(),
      );

      if (response['success']) {
        _logger.i('Successfully created expense type: ${response['data']}');
        return true;
      } else {
        _logger.e('Failed to create expense type: ${response['message']}');
        throw Exception(response['message']);
      }
    } catch (e) {
      _logger.e('Error creating expense type: $e');
      throw Exception('Failed to create expense type: $e');
    }
  }
}
