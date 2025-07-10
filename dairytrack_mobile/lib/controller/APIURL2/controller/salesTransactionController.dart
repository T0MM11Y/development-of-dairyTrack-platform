// // salesTransactionController.dart
import 'package:dairytrack_mobile/api/apiController.dart';
// import 'package:dairytrack_mobile/controller/APIURL2/models/salesTransaction.dart';
// import 'package:logger/logger.dart';
import 'package:dairytrack_mobile/controller/APIURL2/api_services/apiService.dart';

// class SalesTransactionController {
//   final String _baseEndpoint = '$API_URL2/sales/sales-transactions';
//   final _logger = Logger();

//   Future<List<SalesTransaction>> getSalesTransactions(
//       {String queryString = ''}) async {
//     final response = await apiRequest(
//       url: '$_baseEndpoint/${queryString.isNotEmpty ? '?$queryString' : ''}',
//       method: 'GET',
//       headers: {'Accept': 'application/json'},
//     );

//     if (response['success']) {
//       try {
//         final List<dynamic> data = response['data'] ?? [];
//         _logger.i('Parsing ${data.length} sales transaction items');
//         return data.map((json) {
//           if (json is Map<String, dynamic>) {
//             return SalesTransaction.fromJson(json);
//           } else {
//             _logger.e('Invalid JSON item: $json');
//             throw Exception('Invalid JSON format');
//           }
//         }).toList();
//       } catch (e) {
//         _logger.e('Error parsing sales transactions: $e');
//         throw Exception('Failed to parse sales transactions: $e');
//       }
//     } else {
//       _logger.e('Failed to fetch sales transactions: ${response['message']}');
//       throw Exception(response['message']);
//     }
//   }

//   Future<Map<String, dynamic>> exportSalesTransactionsAsPdf(
//       {String queryString = ''}) async {
//     try {
//       final response = await apiRequest(
//         url:
//             '$_baseEndpoint/export/pdf/${queryString.isNotEmpty ? '?$queryString' : ''}',
//         method: 'GET',
//         headers: {'Accept': 'application/pdf'},
//         returnRawResponse: true,
//       );

//       if (response['success'] && response['statusCode'] == 200) {
//         _logger.i('Successfully exported sales transactions as PDF');
//         return {
//           'success': true,
//           'data': response['bodyBytes'],
//           'filename': 'sales_transactions_${DateTime.now().toIso8601String()}.pdf',
//         };
//       } else {
//         final error = response['body'] ?? 'Unknown error';
//         _logger.e('Failed to export PDF: $error');
//         return {
//           'success': false,
//           'message': error.toString(),
//         };
//       }
//     } catch (e) {
//       _logger.e('Error exporting sales transactions as PDF: $e');
//       return {
//         'success': false,
//         'message': 'Failed to export PDF: $e',
//       };
//     }
//   }

//   Future<Map<String, dynamic>> exportSalesTransactionsAsExcel(
//       {String queryString = ''}) async {
//     try {
//       final response = await apiRequest(
//         url:
//             '$_baseEndpoint/export/excel/${queryString.isNotEmpty ? '?$queryString' : ''}',
//         method: 'GET',
//         headers: {
//           'Accept':
//               'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
//         },
//         returnRawResponse: true,
//       );

//       if (response['success'] && response['statusCode'] == 200) {
//         _logger.i('Successfully exported sales transactions as Excel');
//         return {
//           'success': true,
//           'data': response['bodyBytes'],
//           'filename':
//               'sales_transactions_${DateTime.now().toIso8601String()}.xlsx',
//         };
//       } else {
//         final error = response['body'] ?? 'Unknown error';
//         _logger.e('Failed to export Excel: $error');
//         return {
//           'success': false,
//           'message': error.toString(),
//         };
//       }
//     } catch (e) {
//       _logger.e('Error exporting sales transactions as Excel: $e');
//       return {
//         'success': false,
//         'message': 'Failed to export Excel: $e',
//       };
//     }
//   }
// }

import 'package:dairytrack_mobile/controller/APIURL2/models/salesTransaction.dart';
import 'package:dairytrack_mobile/controller/APIURL2/api_services/apiService.dart';
import 'package:logger/logger.dart';

class SalesTransactionController {
  final String _baseEndpoint = '$API_URL2/sales/sales-transactions';
  final Logger _logger = Logger();

  Future<Map<String, dynamic>> getSalesTransactions(
      {String queryString = ''}) async {
    try {
      final response = await apiRequest(
        url: '$_baseEndpoint${queryString.isNotEmpty ? '?$queryString' : ''}',
        method: 'GET',
        headers: {'Accept': 'application/json'},
      );

      _logger.i('Raw API response: $response');

      if (response['success']) {
        final data = response['data'] ?? [];
        if (data is! List) {
          throw Exception('API response "data" is not a list');
        }
        final transactions =
            data.map((json) => SalesTransaction.fromJson(json)).toList();
        // Synthetic pagination: Assume more data if response length equals page size (10)
        final hasMore = transactions.length == 10;
        _logger
            .i('Parsed ${transactions.length} transactions, hasMore: $hasMore');
        return {
          'data': transactions,
          'hasMore': hasMore,
        };
      } else {
        _logger.e('API error: ${response['message']}');
        throw Exception(response['message'] ?? 'Failed to fetch transactions');
      }
    } catch (e) {
      _logger.e('Error fetching transactions: $e');
      throw Exception('Failed to fetch transactions: $e');
    }
  }

  Future<Map<String, dynamic>> exportSalesTransactionsAsPdf(
      {String queryString = ''}) async {
    try {
      final response = await apiRequest(
        url:
            '$_baseEndpoint/export/pdf${queryString.isNotEmpty ? '?$queryString' : ''}',
        method: 'GET',
        headers: {'Accept': 'application/pdf'},
        returnRawResponse: true,
      );

      if (response['success'] && response['statusCode'] == 200) {
        _logger.i('Successfully exported sales transactions as PDF');
        return {
          'success': true,
          'data': response['bodyBytes'] as List<int>,
          'filename':
              'sales_transactions_${DateTime.now().toIso8601String()}.pdf',
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
      _logger.e('Error exporting sales transactions as PDF: $e');
      return {
        'success': false,
        'message': 'Failed to export PDF: $e',
      };
    }
  }

  Future<Map<String, dynamic>> exportSalesTransactionsAsExcel(
      {String queryString = ''}) async {
    try {
      final response = await apiRequest(
        url:
            '$_baseEndpoint/export/excel${queryString.isNotEmpty ? '?$queryString' : ''}',
        method: 'GET',
        headers: {
          'Accept':
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        returnRawResponse: true,
      );

      if (response['success'] && response['statusCode'] == 200) {
        _logger.i('Successfully exported sales transactions as Excel');
        return {
          'success': true,
          'data': response['bodyBytes'] as List<int>,
          'filename':
              'sales_transactions_${DateTime.now().toIso8601String()}.xlsx',
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
      _logger.e('Error exporting sales transactions as Excel: $e');
      return {
        'success': false,
        'message': 'Failed to export Excel: $e',
      };
    }
  }
}
