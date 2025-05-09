import 'package:http/http.dart' as http;
import 'package:dairy_track/model/penjualan/finance.dart';
import 'package:dairy_track/config/configApi5001.dart';
import 'package:dairy_track/model/penjualan/income.dart';
import 'package:dairy_track/model/penjualan/expense.dart';

Future<List<Finance>> getFinances({String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'finance/finance/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
    );

    print('Response from getFinances: $response');
    if (response is List) {
      return response.map((json) => Finance.fromJson(json)).toList();
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in getFinances: $e');
    rethrow;
  }
}

Future<List<int>> getFinanceExportPdf({String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'finance/export/pdf/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      isBlob: true,
    );

    print('Response from getFinanceExportPdf: Blob response');
    if (response is List<int>) {
      return response;
    } else {
      throw Exception('Expected blob response, got: $response');
    }
  } catch (e) {
    print('Error in getFinanceExportPdf: $e');
    rethrow;
  }
}

Future<List<int>> getFinanceExportExcel({String queryString = ''}) async {
  try {
    final response = await fetchAPI(
      'finance/export/excel/${queryString.isNotEmpty ? '?$queryString' : ''}',
      method: 'GET',
      isBlob: true,
    );

    print('Response from getFinanceExportExcel: Blob response');
    if (response is List<int>) {
      return response;
    } else {
      throw Exception('Expected blob response, got: $response');
    }
  } catch (e) {
    print('Error in getFinanceExportExcel: $e');
    rethrow;
  }
}


Future<List<Income>> getIncomes({String? queryString}) async {
  try {
    final endpoint = queryString != null ? "finance/incomes/?$queryString" : "finance/incomes/";
    final response = await fetchAPI(endpoint);
    print('Raw incomes response: $response');

    List<dynamic> data;
    if (response is List<dynamic>) {
      print('Incomes response is List: $response');
      data = response;
    } else {
      print('Invalid incomes response format: $response');
      throw Exception('Unexpected incomes response format: $response');
    }

    print('Incomes data: $data');
    return data.map((json) {
      try {
        return Income.fromJson(json as Map<String, dynamic>);
      } catch (e) {
        print('Error parsing Income: $e, JSON: $json');
        throw Exception('Failed to parse income: $e');
      }
    }).toList();
  } catch (e) {
    print('Error in getIncomes: $e');
    throw Exception('Failed to fetch incomes: $e');
  }
}

Future<List<Expense>> getExpenses({String? queryString}) async {
  try {
    final endpoint = queryString != null ? "finance/expenses/?$queryString" : "finance/expenses/";
    final response = await fetchAPI(endpoint);
    print('Raw expenses response: $response');

    List<dynamic> data;
    if (response is List<dynamic>) {
      print('Expenses response is List: $response');
      data = response;
    } else {
      print('Invalid expenses response format: $response');
      throw Exception('Unexpected expenses response format: $response');
    }

    print('Expenses data: $data');
    return data.map((json) {
      try {
        return Expense.fromJson(json as Map<String, dynamic>);
      } catch (e) {
        print('Error parsing Expense: $e, JSON: $json');
        throw Exception('Failed to parse expense: $e');
      }
    }).toList();
  } catch (e) {
    print('Error in getExpenses: $e');
    throw Exception('Failed to fetch expenses: $e');
  }
}

Future<bool> createIncome({
  required String incomeType,
  required String amount,
  required String description,
  required String transactionDate,
}) async {
  try {
    final response = await fetchAPI(
      "finance/incomes/",
      method: "POST",
      multipartData: {
        'income_type': incomeType,
        'amount': amount,
        'description': description,
        'transaction_date': transactionDate,
      },
    );

    print('Response from createIncome: $response');
    if (response is Map<String, dynamic>) {
      return true;
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in createIncome: $e');
    rethrow;
  }
}

Future<bool> createExpense({
  required String expenseType,
  required String amount,
  required String description,
  required String transactionDate,
}) async {
  try {
    final response = await fetchAPI(
      "finance/expenses/",
      method: "POST",
      multipartData: {
        'expense_type': expenseType,
        'amount': amount,
        'description': description,
        'transaction_date': transactionDate,
      },
    );

    print('Response from createExpense: $response');
    if (response is Map<String, dynamic>) {
      return true;
    } else {
      throw Exception('Unexpected response format: $response');
    }
  } catch (e) {
    print('Error in createExpense: $e');
    rethrow;
  }
}
